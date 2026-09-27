<#
.SYNOPSIS
  Hamtar pre-match odds (1X2 + O/U 2.5) fran ESPN scoreboard (oppen web-API).
  Anvands som fallback nar THE_ODDS_API_KEY saknas (Unibet via Odds API).
  Odds ar DraftKings (amerikanska) konverterade till decimal.
#>
$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "lib\Http.ps1")
$Root = Split-Path -Parent $PSScriptRoot
$OpenDir = Join-Path $Root "data/open"
New-Item -ItemType Directory -Force -Path $OpenDir | Out-Null
$utf8 = New-Object System.Text.UTF8Encoding $false
$outPath = Join-Path $OpenDir "upcoming_odds.json"

$headers = @{
    "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0.0.0 Safari/537.36"
    "Accept" = "application/json"
    "Referer" = "https://www.espn.com/"
}

$nameMap = @{
    "Arsenal" = "Arsenal"; "Aston Villa" = "Aston Villa"; "AFC Bournemouth" = "Bournemouth"
    "Bournemouth" = "Bournemouth"; "Brentford" = "Brentford"; "Brighton & Hove Albion" = "Brighton"
    "Brighton" = "Brighton"; "Burnley" = "Burnley"; "Chelsea" = "Chelsea"
    "Crystal Palace" = "Crystal Palace"; "C Palace" = "Crystal Palace"; "Everton" = "Everton"
    "Fulham" = "Fulham"; "Ipswich Town" = "Ipswich"; "Ipswich" = "Ipswich"
    "Leeds United" = "Leeds"; "Leeds" = "Leeds"; "Liverpool" = "Liverpool"
    "Manchester City" = "Man City"; "Man City" = "Man City"
    "Manchester United" = "Man United"; "Man United" = "Man United"
    "Newcastle United" = "Newcastle"; "Newcastle" = "Newcastle"
    "Nottingham Forest" = "Nott'm Forest"; "Nott'm Forest" = "Nott'm Forest"; "Nottm Forest" = "Nott'm Forest"
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
    "Wrexham" = "Wrexham"; "Cardiff City" = "Cardiff"; "Cardiff" = "Cardiff"
}

function Map-Name([string]$n) {
    if ([string]::IsNullOrWhiteSpace($n)) { return $n }
    if ($nameMap.ContainsKey($n)) { return $nameMap[$n] }
    $short = ($n -replace ' FC$', '' -replace ' AFC$', '')
    if ($nameMap.ContainsKey($short)) { return $nameMap[$short] }
    return $short
}

function ConvertFrom-AmericanOdds($american) {
    if ($null -eq $american -or $american -eq "") { return $null }
    $s = [string]$american
    $n = 0
    if (-not [double]::TryParse($s, [System.Globalization.NumberStyles]::Any, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$n)) {
        return $null
    }
    if ($n -ge 100) { return [math]::Round(1.0 + ($n / 100.0), 2) }
    if ($n -le -100) { return [math]::Round(1.0 + (100.0 / [math]::Abs($n)), 2) }
    return $null
}

function Get-DateKeys([int]$daysAhead = 16) {
    $keys = New-Object System.Collections.Generic.List[string]
    $start = (Get-Date).Date
    for ($i = 0; $i -le $daysAhead; $i++) {
        $keys.Add($start.AddDays($i).ToString("yyyyMMdd")) | Out-Null
    }
    return $keys.ToArray()
}

$leagues = @(
    @{ code = "eng.1"; league = "PL" },
    @{ code = "eng.2"; league = "CH" }
)

$events = New-Object System.Collections.Generic.List[object]
$seen = @{}

foreach ($lg in $leagues) {
    foreach ($dk in (Get-DateKeys 16)) {
        $url = "https://site.web.api.espn.com/apis/site/v2/sports/soccer/$($lg.code)/scoreboard?dates=$dk"
        try {
            $sb = Get-Utf8Json -Uri $url -Headers $headers -TimeoutSec 30
        } catch {
            Write-Host "WARN $($lg.code) $dk : $($_.Exception.Message)"
            continue
        }
        foreach ($ev in @($sb.events)) {
            $id = [string]$ev.id
            if ($seen.ContainsKey($id)) { continue }
            $seen[$id] = $true
            $comp = $ev.competitions[0]
            if (-not $comp.odds -or @($comp.odds).Count -eq 0) { continue }
            $od = $comp.odds[0]

            $homeName = $null; $awayName = $null
            foreach ($c in @($comp.competitors)) {
                $mapped = Map-Name ([string]$c.team.displayName)
                if (-not $mapped) { $mapped = Map-Name ([string]$c.team.shortDisplayName) }
                if ($c.homeAway -eq "home") { $homeName = $mapped } else { $awayName = $mapped }
            }
            if (-not $homeName -or -not $awayName) { continue }

            $homeDec = ConvertFrom-AmericanOdds $od.moneyline.home.close.odds
            $awayDec = ConvertFrom-AmericanOdds $od.moneyline.away.close.odds
            $drawDec = ConvertFrom-AmericanOdds $od.moneyline.draw.close.odds
            if (-not $homeDec -or -not $awayDec -or -not $drawDec) { continue }

            $overDec = $null; $underDec = $null
            if ($od.total -and $od.overUnder -eq 2.5) {
                $overDec = ConvertFrom-AmericanOdds $od.total.over.close.odds
                $underDec = ConvertFrom-AmericanOdds $od.total.under.close.odds
            }

            $events.Add([ordered]@{
                league = $lg.league
                commence = [string]$ev.date
                home = $homeName
                away = $awayName
                bookmaker = $(if ($od.provider.displayName) { [string]$od.provider.displayName } else { "ESPN" })
                odds = @{
                    home = $homeDec
                    draw = $drawDec
                    away = $awayDec
                    over25 = $overDec
                    under25 = $underDec
                }
                sourceEventId = $id
            }) | Out-Null
        }
        Start-Sleep -Milliseconds 80
    }
}

$doc = [ordered]@{
    loaded = ($events.Count -gt 0)
    source = "espn-site-web-api (DraftKings decimal)"
    note = "Unibet kraver THE_ODDS_API_KEY. ESPN anvands som oppen fallback."
    updatedAt = (Get-Date).ToString("o")
    eventCount = $events.Count
    events = $events.ToArray()
}
[System.IO.File]::WriteAllText($outPath, ($doc | ConvertTo-Json -Depth 8), $utf8)
Write-Host "OK ESPN odds -> $outPath ($($events.Count) events)"
