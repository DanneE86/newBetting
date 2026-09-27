<#
.SYNOPSIS
  Hamtar Understat xG via nya AJAX-endpointen getLeagueData (inte HTML teamsData).
  Championship saknas pa Understat - endast EPL.
#>
param(
    [string[]]$Seasons = @("2026", "2025")
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$OpenDir = Join-Path $Root "data/open"
New-Item -ItemType Directory -Force -Path $OpenDir | Out-Null

$ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"

# Map Understat title -> CSV short names used in betting-store
$nameMap = @{
    "Manchester City" = "Man City"
    "Manchester United" = "Man United"
    "Newcastle United" = "Newcastle"
    "Tottenham" = "Tottenham"
    "Nottingham Forest" = "Nott'm Forest"
    "Wolverhampton Wanderers" = "Wolves"
    "West Ham" = "West Ham"
    "Brighton" = "Brighton"
    "Aston Villa" = "Aston Villa"
    "Crystal Palace" = "Crystal Palace"
    "Leicester" = "Leicester"
    "Ipswich" = "Ipswich"
    "Leeds" = "Leeds"
    "Southampton" = "Southampton"
    "Burnley" = "Burnley"
    "Sunderland" = "Sunderland"
    "Hull" = "Hull"
    "Coventry" = "Coventry"
    "Bournemouth" = "Bournemouth"
    "Brentford" = "Brentford"
    "Chelsea" = "Chelsea"
    "Arsenal" = "Arsenal"
    "Liverpool" = "Liverpool"
    "Everton" = "Everton"
    "Fulham" = "Fulham"
}

function Get-LeagueData([string]$League, [string]$Season) {
    $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $pageUrl = "https://understat.com/league/$League/$Season"
    $dataUrl = "https://understat.com/getLeagueData/$League/$Season"
    Write-Host "Fetching $League/$Season ..."
    Invoke-WebRequest -Uri $pageUrl -WebSession $session -Headers @{ "User-Agent" = $ua } -UseBasicParsing -TimeoutSec 45 | Out-Null
    return Get-Utf8Json -Uri $dataUrl -WebSession $session -Headers @{
        "User-Agent" = $ua
        "X-Requested-With" = "XMLHttpRequest"
        "Accept" = "application/json, text/javascript, */*; q=0.01"
        "Referer" = $pageUrl
    } -TimeoutSec 45
}
. (Join-Path $PSScriptRoot "lib\Http.ps1")

function Aggregate-Team($teamObj, $title) {
    $hist = @($teamObj.history)
    $n = $hist.Count
    if ($n -eq 0) {
        return $null
    }
    $xG = 0.0; $xGA = 0.0; $scored = 0; $missed = 0
    $homeXg = 0.0; $homeXga = 0.0; $homeN = 0
    $awayXg = 0.0; $awayXga = 0.0; $awayN = 0
    foreach ($h in $hist) {
        $xG += [double]$h.xG
        $xGA += [double]$h.xGA
        $scored += [int]$h.scored
        $missed += [int]$h.missed
        if ($h.h_a -eq "h") {
            $homeXg += [double]$h.xG; $homeXga += [double]$h.xGA; $homeN++
        } else {
            $awayXg += [double]$h.xG; $awayXga += [double]$h.xGA; $awayN++
        }
    }
    $csvName = if ($nameMap.ContainsKey($title)) { $nameMap[$title] } else { $title }
    return [ordered]@{
        understatTitle = $title
        name = $csvName
        played = $n
        xG = [math]::Round($xG, 3)
        xGA = [math]::Round($xGA, 3)
        xGpg = [math]::Round($xG / $n, 3)
        xGApg = [math]::Round($xGA / $n, 3)
        goalsFor = $scored
        goalsAgainst = $missed
        home = @{
            played = $homeN
            xGpg = if ($homeN -gt 0) { [math]::Round($homeXg / $homeN, 3) } else { 0 }
            xGApg = if ($homeN -gt 0) { [math]::Round($homeXga / $homeN, 3) } else { 0 }
        }
        away = @{
            played = $awayN
            xGpg = if ($awayN -gt 0) { [math]::Round($awayXg / $awayN, 3) } else { 0 }
            xGApg = if ($awayN -gt 0) { [math]::Round($awayXga / $awayN, 3) } else { 0 }
        }
    }
}

$allSeasons = @()
foreach ($season in $Seasons) {
    try {
        $data = Get-LeagueData -League "EPL" -Season $season
        $rawPath = Join-Path $OpenDir "understat_EPL_$season`_raw.json"
        $utf8 = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($rawPath, ($data | ConvertTo-Json -Depth 20 -Compress), $utf8)

        $teams = @()
        foreach ($prop in $data.teams.PSObject.Properties) {
            $t = Aggregate-Team $prop.Value $prop.Value.title
            if ($t) { $teams += $t }
        }

        $out = [ordered]@{
            source = "understat getLeagueData"
            league = "PL"
            understatLeague = "EPL"
            seasonCode = $season
            seasonLabel = if ($season -eq "2026") { "2026/27" } elseif ($season -eq "2025") { "2025/26" } else { $season }
            updatedAt = (Get-Date).ToString("o")
            teamCount = $teams.Count
            teams = $teams
            note = "Championship finns inte pa Understat."
        }
        $outPath = Join-Path $OpenDir "understat_EPL_$season`_xg.json"
        [System.IO.File]::WriteAllText($outPath, ($out | ConvertTo-Json -Depth 8), $utf8)
        Write-Host "OK $season -> $outPath ($($teams.Count) lag)"
        $allSeasons += $out
    } catch {
        Write-Host "FAIL EPL/$season : $($_.Exception.Message)"
    }
}

$indexPath = Join-Path $OpenDir "understat_xg_index.json"
$index = [ordered]@{
    updatedAt = (Get-Date).ToString("o")
    seasons = @($allSeasons | ForEach-Object { @{ seasonCode = $_.seasonCode; seasonLabel = $_.seasonLabel; teamCount = $_.teamCount } })
    primary = "2026"
    championshipSupported = $false
}
$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($indexPath, ($index | ConvertTo-Json -Depth 5), $utf8)
Write-Host "Index: $indexPath"
