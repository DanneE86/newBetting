<#
.SYNOPSIS
  Append tips to ledger and settle finished matches against store results.
#>
param(
    [string]$TipsPath = "",
    [string]$StorePath = "",
    [string]$LedgerPath = ""
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
if (-not $TipsPath) { $TipsPath = Join-Path $Root "data/tips-latest.json" }
if (-not $StorePath) { $StorePath = Join-Path $Root "data/betting-store.json" }
if (-not $LedgerPath) { $LedgerPath = Join-Path $Root "data/tips-ledger.json" }

function Read-Json([string]$Path) {
    if (-not (Test-Path $Path)) { return $null }
    return ([System.IO.File]::ReadAllText($Path)).TrimStart([char]0xFEFF) | ConvertFrom-Json
}

$utf8 = New-Object System.Text.UTF8Encoding $false
$tips = Read-Json $TipsPath
$store = Read-Json $StorePath
if (-not $tips -or -not $store) { throw "Saknar tips eller store" }

$ledger = Read-Json $LedgerPath
if (-not $ledger) {
    $ledger = [ordered]@{
        createdAt = (Get-Date).ToString("o")
        entries = @()
        stats = @{ settled = 0; hits = @{ "1X2" = 0; BTTS = 0; OU25 = 0 }; n = @{ "1X2" = 0; BTTS = 0; OU25 = 0 } }
    }
}

$entries = New-Object System.Collections.Generic.List[object]
foreach ($e in @($ledger.entries)) { $entries.Add($e) | Out-Null }

function Entry-Key($t) { return "$($t.date)|$($t.league)|$($t.match)" }

$existing = @{}
foreach ($e in $entries) { $existing[(Entry-Key $e)] = $e }

# Odds vid tipstillfallet: basta pris hos dina bolag (pro-lagret), annars aldre reservkalla
function Get-TipOdds($t) {
    if ($t.pro -and $t.pro.odds -and ($t.pro.odds.home -or $t.pro.odds.over25)) { return $t.pro.odds }
    if ($t.value) { return $t.value.odds }
    return $null
}

$added = 0
$vbAdded = 0
$nowIso = (Get-Date).ToString("o")
# Topp-tips (edge-filter) + alla matcher med vardespel: vardespelen ar de faktiska spelen och CLV mats pa dem
$candidates = @(@($tips.bestUpcoming | Where-Object { $_.passEdgeFilter }) + @($tips.allCandidates | Where-Object { $_.pro -and @($_.pro.valueBets).Count -gt 0 }))
foreach ($t in $candidates) {
    $k = Entry-Key $t
    $vbs = @(if ($t.pro) { @($t.pro.valueBets) | ForEach-Object { $_ | Add-Member -NotePropertyName flaggedAt -NotePropertyValue $nowIso -Force -PassThru } })
    if ($existing.ContainsKey($k)) {
        # Vardespel som uppstatt senare (odds rorde sig): lagg till med priset nar det forst flaggades
        $e = $existing[$k]
        if ($e.settled) { continue }
        $have = @{}
        foreach ($v in @($e.proValueBets)) { if ($v -and $v.market) { $have["$($v.market)|$($v.pick)"] = $true } }
        $new = @($vbs | Where-Object { -not $have.ContainsKey("$($_.market)|$($_.pick)") })
        if ($new.Count) {
            $merged = @(@($e.proValueBets | Where-Object { $_ -and $_.market }) + $new)
            if ($e -is [System.Collections.IDictionary]) { $e["proValueBets"] = $merged }
            else { $e | Add-Member -NotePropertyName proValueBets -NotePropertyValue $merged -Force }
            $vbAdded += $new.Count
        }
        continue
    }
    $entry = [ordered]@{
        id = $k
        date = $t.date
        league = $t.league
        match = $t.match
        home = $t.home
        away = $t.away
        tipScore = $t.tipScore
        tips = $t.tips
        value = $t.value
        edge = $t.edge
        # Odds vid tipstillfallet - jamfors mot closing vid settle (CLV)
        oddsTaken = (Get-TipOdds $t)
        bookmaker = $(if ($t.pro -and $t.pro.oddsBooks) { $t.pro.oddsBooks } elseif ($t.value) { $t.value.bookmaker } else { $null })
        proValueBets = $vbs
        availabilityNotes = $t.availabilityNotes
        createdAt = $nowIso
        settled = $false
        actual = $null
        hit = $null
    }
    $entries.Add($entry) | Out-Null
    $existing[$k] = $entry
    $added++
    $vbAdded += $vbs.Count
}

# Oddshistorik (pro-layer.mjs): senaste pris fore avspark = stangning dar football-data saknar closing
$oddsHistory = Read-Json (Join-Path $Root "data/open/odds-history.json")
function Get-HistoryFair($obj) {
    if (-not $oddsHistory -or -not $oddsHistory.matches) { return $null }
    $h = $obj.home; $a = $obj.away
    if (-not $h -and $obj.match -match '^(.+?) vs (.+)$') { $h = $Matches[1]; $a = $Matches[2] }
    $key = "$($obj.date)|$($obj.league)|$h|$a"
    $row = $oddsHistory.matches.$key
    if (-not $row -or -not $row.last -or -not $row.last.fair) { return $null }
    $f = $row.last.fair
    $out = @{ source = "senaste odds fore avspark ($($row.last.fairSource))"; proxy = $true; at = $row.last.at }
    if ($null -ne $f.home) { $out["1"] = [double]$f.home; $out["X"] = [double]$f.draw; $out["2"] = [double]$f.away }
    if ($null -ne $f.over25) { $out["OVER 2.5"] = [double]$f.over25; $out["UNDER 2.5"] = [double]$f.under25 }
    return $out
}

# Settle against finished matches in store
$resultByKey = @{}
foreach ($m in @($store.matches)) {
    $resultByKey["$($m.date)|$($m.league)|$($m.home) vs $($m.away)"] = $m
}

# Multiplicative devig -> fair sannolikheter (null om odds saknas)
function Get-Fair([object[]]$odds) {
    foreach ($o in $odds) { if ($null -eq $o -or [double]$o -le 1.001) { return $null } }
    $inv = @($odds | ForEach-Object { 1.0 / [double]$_ })
    $sum = ($inv | Measure-Object -Sum).Sum
    return @($inv | ForEach-Object { $_ / $sum })
}

# Fair closing-sannolikhet per utfall: Pinnacle closing, annars marknadssnitt closing
function Get-ClosingFair($m) {
    $c = $m.closing
    if (-not $c) { return $null }
    $src = "pinnacle"
    $f1 = Get-Fair @($c.pinnacle_home, $c.pinnacle_draw, $c.pinnacle_away)
    if (-not $f1) { $f1 = Get-Fair @($c.avg_home, $c.avg_draw, $c.avg_away); $src = "avg" }
    $fOu = Get-Fair @($c.pinnacle_over25, $c.pinnacle_under25)
    if (-not $fOu) { $fOu = Get-Fair @($c.avg_over25, $c.avg_under25) }
    $out = @{ source = $src }
    if ($f1) { $out["1"] = $f1[0]; $out["X"] = $f1[1]; $out["2"] = $f1[2] }
    if ($fOu) { $out["OVER 2.5"] = $fOu[0]; $out["UNDER 2.5"] = $fOu[1] }
    return $out
}

function Get-TakenOdds($oddsTaken, [string]$pick) {
    if (-not $oddsTaken) { return $null }
    switch ($pick) {
        "1" { return $oddsTaken.home }
        "X" { return $oddsTaken.draw }
        "2" { return $oddsTaken.away }
        "OVER 2.5" { return $oddsTaken.over25 }
        "UNDER 2.5" { return $oddsTaken.under25 }
    }
    return $null
}

function Get-Clv($taken, $fairP) {
    if ($null -eq $taken -or $null -eq $fairP -or [double]$taken -le 1) { return $null }
    return [math]::Round(([double]$taken * [double]$fairP) - 1, 4)
}

$settledNow = 0
$stats = @{ settled = 0; hits = @{ "1X2" = 0; BTTS = 0; OU25 = 0 }; n = @{ "1X2" = 0; BTTS = 0; OU25 = 0 } }
$newList = New-Object System.Collections.Generic.List[object]
foreach ($e in $entries) {
    $obj = [ordered]@{}
    foreach ($p in $e.PSObject.Properties) { $obj[$p.Name] = $p.Value }
    # also support ordered already
    if ($e -is [System.Collections.IDictionary]) {
        $obj = [ordered]@{}
        foreach ($k in $e.Keys) { $obj[$k] = $e[$k] }
    }

    if (-not $obj.settled -and $resultByKey.ContainsKey([string]$obj.id)) {
        $m = $resultByKey[[string]$obj.id]
        $actual1 = if ($m.result -eq "H") { "1" } elseif ($m.result -eq "D") { "X" } else { "2" }
        $actualB = if ($m.btts) { "JA" } else { "NEJ" }
        $actualO = if ($m.over25) { "OVER 2.5" } else { "UNDER 2.5" }
        $hit = @{
            "1X2" = ($obj.tips.'1X2'.pick -eq $actual1)
            BTTS = ($obj.tips.BTTS.pick -eq $actualB)
            OU25 = ($obj.tips.OU25.pick -eq $actualO)
        }
        $obj.settled = $true
        $obj.actual = @{ "1X2" = $actual1; BTTS = $actualB; OU25 = $actualO; score = "$($m.hg)-$($m.ag)" }
        $obj.hit = $hit
        $obj.settledAt = (Get-Date).ToString("o")
        $settledNow++
    }

    # CLV: rakna (om) nar closing finns i store, annars mot senaste sparade odds fore avspark.
    # En proxy-CLV raknas om nar riktig closing dyker upp.
    $needClv = $obj.settled -and $resultByKey.ContainsKey([string]$obj.id) -and (-not $obj.clv -or $obj.clv.proxy)
    if ($needClv) {
        $m = $resultByKey[[string]$obj.id]
        $fair = Get-ClosingFair $m
        if (-not $fair) { $fair = Get-HistoryFair $obj }
        if ($fair) {
            $clv = [ordered]@{ closingSource = $fair.source; proxy = [bool]$fair.proxy }
            foreach ($mkt in @("1X2", "OU25")) {
                $pick = [string]$obj.tips.$mkt.pick
                $fp = $fair[$pick]
                $taken = Get-TakenOdds $obj.oddsTaken $pick
                $clv[$mkt] = [ordered]@{
                    pick = $pick
                    oddsTaken = $taken
                    fairCloseProb = $(if ($null -ne $fp) { [math]::Round($fp, 4) } else { $null })
                    fairCloseOdds = $(if ($fp) { [math]::Round(1 / $fp, 3) } else { $null })
                    clv = (Get-Clv $taken $fp)
                }
            }
            $vbOut = @()
            foreach ($vb in @($obj.proValueBets)) {
                if (-not $vb -or -not $vb.market) { continue }
                $won = if ($vb.market -eq "1X2") { $obj.actual."1X2" -eq $vb.pick } else { $obj.actual.OU25 -eq $vb.pick }
                $vbOut += [ordered]@{
                    market = $vb.market; pick = $vb.pick; odds = $vb.odds; stakeSek = $vb.stakeSek
                    bookmaker = $vb.bookmaker; fairSource = $vb.fairSource; flaggedAt = $vb.flaggedAt
                    won = [bool]$won
                    profitUnits = $(if ($won) { [math]::Round([double]$vb.odds - 1, 3) } else { -1 })
                    clv = (Get-Clv $vb.odds $fair[[string]$vb.pick])
                }
            }
            $clv["valueBets"] = $vbOut
            $obj.clv = $clv
        }
    }

    if ($obj.settled) {
        $stats.settled++
        foreach ($mkt in @("1X2", "BTTS", "OU25")) {
            $stats.n[$mkt]++
            if ($obj.hit.$mkt) { $stats.hits[$mkt]++ }
        }
    }
    $newList.Add($obj) | Out-Null
}

$rates = [ordered]@{}
foreach ($mkt in @("1X2", "BTTS", "OU25")) {
    $n = [int]$stats.n[$mkt]
    $h = [int]$stats.hits[$mkt]
    $rates[$mkt] = @{ n = $n; hits = $h; rate = $(if ($n -gt 0) { [math]::Round($h / $n, 4) } else { 0 }) }
}

# CLV-sammanfattning (proffsens huvudmatt): tipsen och - viktigast - vardespelen
function Summarize-Clv([double[]]$vals) {
    if (-not $vals -or $vals.Count -eq 0) { return [ordered]@{ n = 0; meanClv = $null; positiveRate = $null } }
    return [ordered]@{
        n = $vals.Count
        meanClv = [math]::Round((($vals | Measure-Object -Average).Average), 4)
        positiveRate = [math]::Round(@($vals | Where-Object { $_ -gt 0 }).Count / $vals.Count, 3)
    }
}
$clvVals = @(); $vbClv = @(); $vbClvReal = @(); $vbClvProxy = @()
$vbN = 0; $vbProfit = 0.0
$vbByLeague = @{}
foreach ($e in $newList) {
    if (-not $e.clv) { continue }
    foreach ($mkt in @("1X2", "OU25")) {
        if ($null -ne $e.clv.$mkt.clv) { $clvVals += [double]$e.clv.$mkt.clv }
    }
    foreach ($vb in @($e.clv.valueBets)) {
        if (-not $vb -or -not $vb.market) { continue }
        $vbN++; $vbProfit += [double]$vb.profitUnits
        $lg = [string]$e.league
        if (-not $vbByLeague.ContainsKey($lg)) { $vbByLeague[$lg] = @{ n = 0; profit = 0.0; clv = @() } }
        $vbByLeague[$lg].n++; $vbByLeague[$lg].profit += [double]$vb.profitUnits
        if ($null -ne $vb.clv) {
            $vbClv += [double]$vb.clv
            $vbByLeague[$lg].clv += [double]$vb.clv
            if ($e.clv.proxy) { $vbClvProxy += [double]$vb.clv } else { $vbClvReal += [double]$vb.clv }
        }
    }
}
$openVb = 0
foreach ($e in $newList) { if (-not $e.settled) { $openVb += @($e.proValueBets | Where-Object { $_ -and $_.market }).Count } }
$byLeagueOut = [ordered]@{}
foreach ($lg in ($vbByLeague.Keys | Sort-Object)) {
    $b = $vbByLeague[$lg]
    $byLeagueOut[$lg] = [ordered]@{ n = $b.n; roi = [math]::Round($b.profit / $b.n, 4); clv = (Summarize-Clv $b.clv) }
}
$tipClv = Summarize-Clv $clvVals
$liveClv = [ordered]@{
    n = $tipClv.n
    meanClv = $tipClv.meanClv
    positiveRate = $tipClv.positiveRate
    # Fast insats 500 kr per spel -> vinst i kronor = enheter * 500
    valueBets = [ordered]@{
        n = $vbN; open = $openVb
        profitUnits = [math]::Round($vbProfit, 2); profitSek = [math]::Round($vbProfit * 500, 0)
        roi = $(if ($vbN) { [math]::Round($vbProfit / $vbN, 4) } else { $null })
        clv = (Summarize-Clv $vbClv)
        clvRealClosing = (Summarize-Clv $vbClvReal)
        clvProxyClosing = (Summarize-Clv $vbClvProxy)
        byLeague = $byLeagueOut
    }
    note = "CLV = taget odds x marginalfri stangningschans - 1. Stangning: Pinnacle/snitt (football-data), annars senaste sparade odds fore avspark (proxy). Positiv CLV over ~50 spel = du slar marknaden."
}

$out = [ordered]@{
    updatedAt = (Get-Date).ToString("o")
    addedThisRun = $added
    settledThisRun = $settledNow
    entryCount = $newList.Count
    openCount = @($newList | Where-Object { -not $_.settled }).Count
    settledCount = @($newList | Where-Object { $_.settled }).Count
    liveHitRates = $rates
    liveClv = $liveClv
    entries = $newList.ToArray()
}
[System.IO.File]::WriteAllText($LedgerPath, ($out | ConvertTo-Json -Depth 10), $utf8)
Write-Host "Ledger: added=$added (vardespel +$vbAdded) settledNow=$settledNow total=$($newList.Count) open=$($out.openCount)"
Write-Host "Live CLV tips: n=$($liveClv.n) mean=$($liveClv.meanClv) positive=$($liveClv.positiveRate)"
Write-Host "Vardespel: avgjorda=$($liveClv.valueBets.n) oppna=$($liveClv.valueBets.open) CLV n=$($liveClv.valueBets.clv.n) mean=$($liveClv.valueBets.clv.meanClv) ROI=$($liveClv.valueBets.roi)"
Write-Host "Live rates:1X2=$($rates.'1X2'.rate) BTTS=$($rates.BTTS.rate) OU25=$($rates.OU25.rate)"
