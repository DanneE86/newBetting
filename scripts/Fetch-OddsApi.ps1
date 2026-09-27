<#
.SYNOPSIS
  Hamtar pre-match odds (1X2 + totals 2.5) via The Odds API om nyckel finns.
  Env: THE_ODDS_API_KEY (https://the-odds-api.com) eller ODDS_API_KEY
#>
$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "lib\Http.ps1")
$Root = Split-Path -Parent $PSScriptRoot
$OpenDir = Join-Path $Root "data\open"
New-Item -ItemType Directory -Force -Path $OpenDir | Out-Null

# load .env
$envFile = Join-Path $Root ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
        $p = $_.Split('=', 2)
        $k = $p[0].Trim(); $v = $p[1].Trim().Trim('"')
        if (-not [Environment]::GetEnvironmentVariable($k)) {
            [Environment]::SetEnvironmentVariable($k, $v, 'Process')
        }
    }
}

$apiKey = $env:THE_ODDS_API_KEY
if (-not $apiKey) { $apiKey = $env:ODDS_API_KEY }
$utf8 = New-Object System.Text.UTF8Encoding $false
$outPath = Join-Path $OpenDir "upcoming_odds.json"

if (-not $apiKey) {
    Write-Host "SKIP The Odds API (ingen nyckel) - reservkalla football-data fixtures..."
    node (Join-Path $PSScriptRoot "fetch-odds-fallback.mjs")
    exit $LASTEXITCODE
}

# The Odds API v4, region eu (Pinnacle + svenska bolag). Kostnad: 2 credits per liga (h2h + totals).
# Gratisnivan har 500 credits/manad. For att spara kvoten hamtas bara ligor med matcher inom
# $OddsHorizonDays dagar (enligt upcoming-fixtures.json), plus ligor utan eget spelschema (t.ex. Superettan).
$OddsHorizonDays = 14
if ($env:ODDS_ALL -eq "1") { $OddsHorizonDays = 3650 } # ODDS_ALL=1: alla ligor oavsett datum
$registry = ([System.IO.File]::ReadAllText((Join-Path $Root "config\leagues.json"))) | ConvertFrom-Json
$fixturesPath = Join-Path $Root "data\upcoming-fixtures.json"
$soonLeagues = @{}
if (Test-Path $fixturesPath) {
    $limit = (Get-Date).Date.AddDays($OddsHorizonDays)
    foreach ($f in (([System.IO.File]::ReadAllText($fixturesPath)).TrimStart([char]0xFEFF) | ConvertFrom-Json)) {
        try { if ([datetime]::Parse($f.date) -le $limit) { $soonLeagues[[string]$f.league] = $true } } catch {}
    }
}
$sports = @()
foreach ($p in $registry.leagues.PSObject.Properties) {
    $lg = $p.Value
    if (-not $lg.odds) { continue }
    $noSchedule = ($lg.history -eq "none" -and -not $lg.espn)
    if ($soonLeagues.ContainsKey($p.Name) -or $noSchedule) { $sports += @{ key = [string]$lg.odds; league = $p.Name } }
}
Write-Host "Odds-ligor denna hamtning: $(($sports | ForEach-Object { $_.league }) -join ', ')"

# Kvotkoll (gratisanrop): racker inte kvoten -> reservkalla (football-data fixtures, Betfair Exchange som facit)
function Invoke-Fallback([string]$why) {
    Write-Host "Odds API: $why -> reservkalla football-data fixtures..."
    node (Join-Path $PSScriptRoot "fetch-odds-fallback.mjs")
    exit $LASTEXITCODE
}
try {
    $probe = Invoke-WebRequest -Uri "https://api.the-odds-api.com/v4/sports/?apiKey=$apiKey" -UseBasicParsing -TimeoutSec 30
    $left = [int]$probe.Headers['x-requests-remaining']
    $need = 2 * $sports.Count
    Write-Host "Odds API credits kvar: $left (behover $need)"
    if ($left -lt $need) { Invoke-Fallback "kvoten slut ($left kvar)" }
} catch {
    Invoke-Fallback "nyckel/kvot fel ($($_.Exception.Message))"
}

$nameMap = @{
    "Manchester United" = "Man United"; "Manchester City" = "Man City"
    "Tottenham Hotspur" = "Tottenham"; "Nottingham Forest" = "Nott'm Forest"
    "Wolverhampton Wanderers" = "Wolves"; "Newcastle United" = "Newcastle"
    "Brighton and Hove Albion" = "Brighton"; "West Ham United" = "West Ham"
    "Leicester City" = "Leicester"; "Leeds United" = "Leeds"
    "Ipswich Town" = "Ipswich"; "Sheffield United" = "Sheffield United"
    "Sheffield Wednesday" = "Sheffield Weds"; "Queens Park Rangers" = "QPR"
    "West Bromwich Albion" = "West Brom"; "Birmingham City" = "Birmingham"
    "Blackburn Rovers" = "Blackburn"; "Norwich City" = "Norwich"
    "Swansea City" = "Swansea"; "Coventry City" = "Coventry"
    "Hull City" = "Hull"; "Oxford United" = "Oxford"
    "AFC Bournemouth" = "Bournemouth"; "Cardiff City" = "Cardiff"
}

function Map-Name([string]$n) {
    if ($nameMap.ContainsKey($n)) { return $nameMap[$n] }
    return ($n -replace ' FC$', '' -replace ' AFC$', '')
}

function Get-MarketPrices($bookmaker, $ev) {
    $h2h = $null; $totals = $null
    foreach ($m in @($bookmaker.markets)) {
        if ($m.key -eq "h2h" -and -not $h2h) {
            $prices = @{}
            foreach ($o in @($m.outcomes)) {
                if ($o.name -eq $ev.home_team) { $prices.home = [double]$o.price }
                elseif ($o.name -eq $ev.away_team) { $prices.away = [double]$o.price }
                elseif ($o.name -eq "Draw") { $prices.draw = [double]$o.price }
            }
            if ($prices.home -and $prices.draw -and $prices.away) { $h2h = $prices }
        }
        if ($m.key -eq "totals" -and -not $totals) {
            foreach ($o in @($m.outcomes)) {
                if ([string]$o.point -eq "2.5" -or [double]$o.point -eq 2.5) {
                    if (-not $totals) { $totals = @{} }
                    if ($o.name -eq "Over") { $totals.over25 = [double]$o.price }
                    if ($o.name -eq "Under") { $totals.under25 = [double]$o.price }
                }
            }
        }
    }
    return @{ h2h = $h2h; totals = $totals; bookmaker = [string]$bookmaker.title }
}

$events = New-Object System.Collections.Generic.List[object]
$usedUnibet = 0
$remaining = $null
foreach ($s in $sports) {
    # Alla bolag i eu (inkl. Pinnacle) i ett anrop; Unibet valjs fortfarande som "odds" nedan
    $url = "https://api.the-odds-api.com/v4/sports/$($s.key)/odds/?apiKey=$apiKey&regions=eu&markets=h2h,totals&oddsFormat=decimal&dateFormat=iso"
    try {
        Write-Host "Fetching odds (alla bolag) $($s.key)..."
        $raw = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 60
        $remaining = $raw.Headers['x-requests-remaining']
        $ms = New-Object System.IO.MemoryStream
        $raw.RawContentStream.Position = 0
        $raw.RawContentStream.CopyTo($ms)
        $resp = [System.Text.Encoding]::UTF8.GetString($ms.ToArray()) | ConvertFrom-Json
        foreach ($ev in @($resp)) {
            $homeName = Map-Name $ev.home_team
            $awayName = Map-Name $ev.away_team
            $picked = $null
            # Preferera Unibet
            foreach ($bk in @($ev.bookmakers)) {
                if ($bk.key -match 'unibet' -or $bk.title -match 'Unibet') {
                    $picked = Get-MarketPrices $bk $ev
                    if ($picked.h2h) { $usedUnibet++; break }
                }
            }
            if (-not $picked -or -not $picked.h2h) {
                foreach ($bk in @($ev.bookmakers)) {
                    $picked = Get-MarketPrices $bk $ev
                    if ($picked.h2h) { break }
                }
            }
            if (-not $picked -or -not $picked.h2h) { continue }
            # Alla bolag - pro-lagret anvander Pinnacle som fair price och basta pris (line shopping)
            $books = @()
            foreach ($bk in @($ev.bookmakers)) {
                $bp = Get-MarketPrices $bk $ev
                if (-not $bp.h2h) { continue }
                $books += [ordered]@{
                    key = [string]$bk.key
                    bookmaker = $bp.bookmaker
                    home = $bp.h2h.home; draw = $bp.h2h.draw; away = $bp.h2h.away
                    over25 = $(if ($bp.totals) { $bp.totals.over25 } else { $null })
                    under25 = $(if ($bp.totals) { $bp.totals.under25 } else { $null })
                }
            }
            $h2h = $picked.h2h
            $totals = $picked.totals
            $events.Add([ordered]@{
                league = $s.league
                commence = $ev.commence_time
                home = $homeName
                away = $awayName
                homeRaw = [string]$ev.home_team
                awayRaw = [string]$ev.away_team
                bookmaker = $picked.bookmaker
                odds = @{
                    home = $h2h.home; draw = $h2h.draw; away = $h2h.away
                    over25 = $(if ($totals) { $totals.over25 } else { $null })
                    under25 = $(if ($totals) { $totals.under25 } else { $null })
                }
                books = $books
                sourceEventId = $ev.id
            }) | Out-Null
        }
        Write-Host "  got events for $($s.league)"
    } catch {
        Write-Host "FAIL $($s.key): $($_.Exception.Message)"
    }
}

if ($events.Count -eq 0) { Invoke-Fallback "0 events" }

# Behall tidigare hamtade odds for ligor som inte hamtades nu (om matchen inte har spelats)
$fetchedLeagues = @{}
foreach ($s in $sports) { $fetchedLeagues[$s.league] = $true }
if (Test-Path $outPath) {
    try {
        $old = ([System.IO.File]::ReadAllText($outPath)).TrimStart([char]0xFEFF) | ConvertFrom-Json
        $kept = 0
        foreach ($ev in @($old.events)) {
            if ($fetchedLeagues.ContainsKey([string]$ev.league)) { continue }
            try { if ([datetime]$ev.commence -lt (Get-Date).ToUniversalTime()) { continue } } catch { continue }
            $events.Add($ev) | Out-Null
            $kept++
        }
        if ($kept) { Write-Host "Behaller $kept tidigare odds for ligor som inte hamtades nu" }
    } catch {}
}

$doc = [ordered]@{
    loaded = $true
    source = "the-odds-api.com v4"
    preferredBookmaker = "Unibet"
    unibetEventCount = $usedUnibet
    creditsRemaining = $remaining
    updatedAt = (Get-Date).ToString("o")
    eventCount = $events.Count
    events = $events.ToArray()
}
[System.IO.File]::WriteAllText($outPath, ($doc | ConvertTo-Json -Depth 8), $utf8)
Write-Host "OK -> $outPath ($($events.Count) events, Unibet=$usedUnibet, credits kvar denna manad=$remaining)"
