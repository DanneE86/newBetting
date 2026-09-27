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
if (-not $TipsPath) { $TipsPath = Join-Path $Root "data\tips-latest.json" }
if (-not $StorePath) { $StorePath = Join-Path $Root "data\betting-store.json" }
if (-not $LedgerPath) { $LedgerPath = Join-Path $Root "data\tips-ledger.json" }

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
foreach ($e in $entries) { $existing[(Entry-Key $e)] = $true }

$added = 0
foreach ($t in @($tips.bestUpcoming)) {
    if (-not $t.passEdgeFilter) { continue }
    $k = Entry-Key $t
    if ($existing.ContainsKey($k)) { continue }
    $entries.Add([ordered]@{
        id = $k
        date = $t.date
        league = $t.league
        match = $t.match
        tipScore = $t.tipScore
        tips = $t.tips
        value = $t.value
        edge = $t.edge
        # Odds vid tipstillfallet - jamfors mot closing vid settle (CLV)
        oddsTaken = $(if ($t.value) { $t.value.odds } else { $null })
        bookmaker = $(if ($t.value) { $t.value.bookmaker } else { $null })
        proValueBets = $(if ($t.pro) { @($t.pro.valueBets) } else { @() })
        availabilityNotes = $t.availabilityNotes
        createdAt = (Get-Date).ToString("o")
        settled = $false
        actual = $null
        hit = $null
    }) | Out-Null
    $existing[$k] = $true
    $added++
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

    # CLV: rakna (om) nar closing finns i store - aven for redan settlade poster utan clv
    if ($obj.settled -and -not $obj.clv -and $resultByKey.ContainsKey([string]$obj.id)) {
        $m = $resultByKey[[string]$obj.id]
        $fair = Get-ClosingFair $m
        if ($fair) {
            $clv = [ordered]@{ closingSource = $fair.source }
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
                if (-not $vb) { continue }
                $won = if ($vb.market -eq "1X2") { $obj.actual."1X2" -eq $vb.pick } else { $obj.actual.OU25 -eq $vb.pick }
                $vbOut += [ordered]@{
                    market = $vb.market; pick = $vb.pick; odds = $vb.odds; stakeSek = $vb.stakeSek
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

# CLV-sammanfattning (proffsens huvudmatt)
$clvVals = @()
$vbN = 0; $vbProfit = 0.0
foreach ($e in $newList) {
    if (-not $e.clv) { continue }
    foreach ($mkt in @("1X2", "OU25")) {
        if ($null -ne $e.clv.$mkt.clv) { $clvVals += [double]$e.clv.$mkt.clv }
    }
    foreach ($vb in @($e.clv.valueBets)) {
        if (-not $vb) { continue }
        $vbN++; $vbProfit += [double]$vb.profitUnits
    }
}
$liveClv = [ordered]@{
    n = $clvVals.Count
    meanClv = $(if ($clvVals.Count) { [math]::Round((($clvVals | Measure-Object -Average).Average), 4) } else { $null })
    positiveRate = $(if ($clvVals.Count) { [math]::Round(@($clvVals | Where-Object { $_ -gt 0 }).Count / $clvVals.Count, 3) } else { $null })
    # Fast insats 500 kr per spel -> vinst i kronor = enheter * 500
    valueBets = [ordered]@{ n = $vbN; profitUnits = [math]::Round($vbProfit, 2); profitSek = [math]::Round($vbProfit * 500, 0); roi = $(if ($vbN) { [math]::Round($vbProfit / $vbN, 4) } else { $null }) }
    note = "CLV = oddsTaken * fair closing-p - 1 (Pinnacle closing devig, annars snitt). Signal efter ~50 spel."
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
Write-Host "Ledger: added=$added settledNow=$settledNow total=$($newList.Count) open=$($out.openCount)"
Write-Host "Live CLV: n=$($liveClv.n) mean=$($liveClv.meanClv) positive=$($liveClv.positiveRate) valueBets=$($liveClv.valueBets.n)"
Write-Host "Live rates:1X2=$($rates.'1X2'.rate) BTTS=$($rates.BTTS.rate) OU25=$($rates.OU25.rate)"
