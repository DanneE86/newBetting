<#
.SYNOPSIS
  Hamtar elvor fran ESPN nar de slapppts (rosters.starter).
  PL: eng.1  Championship: eng.2
  Endpoint: site.web.api.espn.com (site.api.espn.com ger 403).

  Status per match:
    pending   - inga starters an (elvor ej slappta)
    confirmed - minst 11 starters per lag
#>
$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "lib\Http.ps1")
$Root = Split-Path -Parent $PSScriptRoot
$OpenDir = Join-Path $Root "data/open"
New-Item -ItemType Directory -Force -Path $OpenDir | Out-Null
$utf8 = New-Object System.Text.UTF8Encoding $false

$headers = @{
    "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
    "Accept" = "application/json"
    "Referer" = "https://www.espn.com/"
}

$nameMap = @{
    "Arsenal" = "Arsenal"; "Aston Villa" = "Aston Villa"; "AFC Bournemouth" = "Bournemouth"
    "Bournemouth" = "Bournemouth"; "Brentford" = "Brentford"; "Brighton & Hove Albion" = "Brighton"
    "Brighton" = "Brighton"; "Burnley" = "Burnley"; "Chelsea" = "Chelsea"
    "Crystal Palace" = "Crystal Palace"; "Everton" = "Everton"; "Fulham" = "Fulham"
    "Ipswich Town" = "Ipswich"; "Ipswich" = "Ipswich"; "Leeds United" = "Leeds"; "Leeds" = "Leeds"
    "Liverpool" = "Liverpool"; "Manchester City" = "Man City"; "Man City" = "Man City"
    "Manchester United" = "Man United"; "Man United" = "Man United"
    "Newcastle United" = "Newcastle"; "Newcastle" = "Newcastle"
    "Nottingham Forest" = "Nott'm Forest"; "Nott'm Forest" = "Nott'm Forest"
    "Sunderland" = "Sunderland"; "Tottenham Hotspur" = "Tottenham"; "Tottenham" = "Tottenham"
    "West Ham United" = "West Ham"; "West Ham" = "West Ham"
    "Wolverhampton Wanderers" = "Wolves"; "Wolves" = "Wolves"
    "Hull City" = "Hull"; "Hull" = "Hull"; "Coventry City" = "Coventry"; "Coventry" = "Coventry"
    "Birmingham City" = "Birmingham"; "Birmingham" = "Birmingham"
    "Blackburn Rovers" = "Blackburn"; "Blackburn" = "Blackburn"
    "Bristol City" = "Bristol City"; "Charlton Athletic" = "Charlton"; "Charlton" = "Charlton"
    "Derby County" = "Derby"; "Derby" = "Derby"; "Leicester City" = "Leicester"; "Leicester" = "Leicester"
    "Middlesbrough" = "Middlesbrough"; "Millwall" = "Millwall"
    "Norwich City" = "Norwich"; "Norwich" = "Norwich"
    "Oxford United" = "Oxford"; "Oxford" = "Oxford"
    "Portsmouth" = "Portsmouth"; "Preston North End" = "Preston"; "Preston" = "Preston"
    "Queens Park Rangers" = "QPR"; "QPR" = "QPR"
    "Sheffield United" = "Sheffield United"
    "Sheffield Wednesday" = "Sheffield Weds"; "Sheffield Weds" = "Sheffield Weds"
    "Southampton" = "Southampton"; "Stoke City" = "Stoke"; "Stoke" = "Stoke"
    "Swansea City" = "Swansea"; "Swansea" = "Swansea"
    "Watford" = "Watford"; "West Bromwich Albion" = "West Brom"; "West Brom" = "West Brom"
    "Wrexham" = "Wrexham"; "Luton Town" = "Luton"; "Luton" = "Luton"
}

function Map-EspnName([string]$n) {
    if ([string]::IsNullOrWhiteSpace($n)) { return $n }
    if ($nameMap.ContainsKey($n)) { return $nameMap[$n] }
    $short = ($n -replace ' FC$', '' -replace ' AFC$', '')
    if ($nameMap.ContainsKey($short)) { return $nameMap[$short] }
    return $short
}

function Get-DateKeys([int]$daysAhead = 14) {
    $keys = New-Object System.Collections.Generic.List[string]
    $start = (Get-Date).Date.AddDays(-1)
    for ($i = 0; $i -le $daysAhead; $i++) {
        $keys.Add($start.AddDays($i).ToString("yyyyMMdd")) | Out-Null
    }
    return $keys.ToArray()
}

function Get-Starters($rosterSide) {
    $list = New-Object System.Collections.Generic.List[object]
    foreach ($p in @($rosterSide.roster)) {
        if (-not $p.starter) { continue }
        $list.Add([ordered]@{
            name = [string]$p.athlete.displayName
            jersey = [string]$p.jersey
            position = [string]$p.position.abbreviation
        }) | Out-Null
    }
    return $list.ToArray()
}

$leagues = @(
    @{ code = "eng.1"; league = "PL" },
    @{ code = "eng.2"; league = "CH" },
    @{ code = "bra.1"; league = "BR" }
)

$eventIds = @{}
foreach ($lg in $leagues) {
    foreach ($dk in (Get-DateKeys 16)) {
        $url = "https://site.web.api.espn.com/apis/site/v2/sports/soccer/$($lg.code)/scoreboard?dates=$dk"
        try {
            $sb = Get-Utf8Json -Uri $url -Headers $headers -TimeoutSec 30
            foreach ($ev in @($sb.events)) {
                $eventIds[[string]$ev.id] = [ordered]@{
                    id = [string]$ev.id
                    league = $lg.league
                    espnLeague = $lg.code
                    date = [string]$ev.date
                    status = [string]$ev.status.type.name
                    name = [string]$ev.name
                }
            }
        } catch {
            Write-Host "WARN scoreboard $($lg.code) $dk : $($_.Exception.Message)"
        }
    }
}

Write-Host "ESPN events found: $($eventIds.Count)"

$fixtures = New-Object System.Collections.Generic.List[object]
$confirmed = 0
$pending = 0

foreach ($meta in @($eventIds.Values)) {
    $sumUrl = "https://site.web.api.espn.com/apis/site/v2/sports/soccer/$($meta.espnLeague)/summary?event=$($meta.id)"
    try {
        $sum = Get-Utf8Json -Uri $sumUrl -Headers $headers -TimeoutSec 40
    } catch {
        Write-Host "WARN summary $($meta.id): $($_.Exception.Message)"
        continue
    }

    $homeName = $null; $awayName = $null
    $homeXi = @(); $awayXi = @()
    $homeForm = $null; $awayForm = $null

    foreach ($r in @($sum.rosters)) {
        $mapped = Map-EspnName ([string]$r.team.displayName)
        $starters = @(Get-Starters $r)
        if ($r.homeAway -eq "home") {
            $homeName = $mapped
            $homeXi = $starters
            $homeForm = [string]$r.formation
        } else {
            $awayName = $mapped
            $awayXi = $starters
            $awayForm = [string]$r.formation
        }
    }

    # Fallback names from header if rosters thin
    if (-not $homeName -or -not $awayName) {
        foreach ($c in @($sum.header.competitions[0].competitors)) {
            $mapped = Map-EspnName ([string]$c.team.displayName)
            if ($c.homeAway -eq "home") { $homeName = $mapped } else { $awayName = $mapped }
        }
    }

    $homeCount = @($homeXi).Count
    $awayCount = @($awayXi).Count
    $status = if ($homeCount -ge 11 -and $awayCount -ge 11) { "confirmed" } else { "pending" }
    if ($status -eq "confirmed") { $confirmed++ } else { $pending++ }

    # Key outs vs FPL: handled in tip engine; here only note missing starters count
    $kickoffLocal = $null
    try { $kickoffLocal = ([datetime]$meta.date).ToString("yyyy-MM-dd") } catch { $kickoffLocal = $meta.date }

    $fixtures.Add([ordered]@{
        espnEventId = $meta.id
        date = $kickoffLocal
        kickoffUtc = $meta.date
        league = $meta.league
        home = $homeName
        away = $awayName
        matchStatus = $meta.status
        lineupStatus = $status
        homeFormation = $homeForm
        awayFormation = $awayForm
        homeStarters = @($homeXi)
        awayStarters = @($awayXi)
        homeStarterCount = $homeCount
        awayStarterCount = $awayCount
        source = "espn-site-web-api"
    }) | Out-Null

    Start-Sleep -Milliseconds 120
}

$doc = [ordered]@{
    updatedAt = (Get-Date).ToString("o")
    source = "https://site.web.api.espn.com (eng.1 + eng.2)"
    note = "Elvor bekraftas nar ESPN publicerar starters (~1h fore kickoff). pending = ej slappta an."
    fixtureCount = $fixtures.Count
    confirmedCount = $confirmed
    pendingCount = $pending
    fixtures = @($fixtures | Sort-Object date, league, home)
}

$outPath = Join-Path $OpenDir "espn_lineups.json"
[System.IO.File]::WriteAllText($outPath, ($doc | ConvertTo-Json -Depth 8), $utf8)
Write-Host "Lineups: $($fixtures.Count) fixtures (confirmed=$confirmed pending=$pending) -> $outPath"
