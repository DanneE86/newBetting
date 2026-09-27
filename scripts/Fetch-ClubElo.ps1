<#
.SYNOPSIS
  Hamtar ClubElo-rankingar for engelska klubbar (PL + Championship).
  Kallor: http://clubelo.com/ENG (inbaddad JSON + HTML-tabell).
  API api.clubelo.com ar ofta nere (502) - HTML ar fallback.
#>
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$OpenDir = Join-Path $Root "data/open"
New-Item -ItemType Directory -Force -Path $OpenDir | Out-Null
$utf8 = New-Object System.Text.UTF8Encoding $false
$ua = @{ "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) BettingNy/1.0" }

# CSV-namn vi anvander i betting-store
$targetNames = @(
    "Arsenal", "Aston Villa", "Bournemouth", "Brentford", "Brighton", "Burnley",
    "Chelsea", "Crystal Palace", "Everton", "Fulham", "Ipswich", "Leeds",
    "Liverpool", "Man City", "Man United", "Newcastle", "Nott'm Forest", "Sunderland",
    "Tottenham", "West Ham", "Wolves", "Hull", "Coventry",
    "Birmingham", "Blackburn", "Bristol City", "Charlton", "Derby", "Leicester",
    "Middlesbrough", "Millwall", "Norwich", "Oxford", "Portsmouth", "Preston",
    "QPR", "Sheffield United", "Sheffield Weds", "Southampton", "Stoke",
    "Swansea", "Watford", "West Brom", "Wrexham", "Luton"
)

# ClubElo display name -> vart CSV-namn
$nameMap = @{
    "Man City" = "Man City"; "Man United" = "Man United"; "Manchester City" = "Man City"
    "Manchester United" = "Man United"; "Forest" = "Nott'm Forest"
    "Nott'm Forest" = "Nott'm Forest"; "Nottingham Forest" = "Nott'm Forest"
    "Sheffield Weds" = "Sheffield Weds"; "Sheffield Wednesday" = "Sheffield Weds"
    "West Brom" = "West Brom"; "West Bromwich Albion" = "West Brom"
    "Wolves" = "Wolves"; "Wolverhampton" = "Wolves"
    "Spurs" = "Tottenham"; "Tottenham" = "Tottenham"
    "QPR" = "QPR"; "Queens Park Rangers" = "QPR"
    "Bournemouth" = "Bournemouth"; "AFC Bournemouth" = "Bournemouth"
    "Brighton" = "Brighton"; "Crystal Palace" = "Crystal Palace"
    "Ipswich" = "Ipswich"; "Leeds" = "Leeds"; "Hull" = "Hull"
    "Coventry" = "Coventry"; "Peterboro" = "Peterboro"
}

function Map-ClubEloName([string]$n) {
    if ($nameMap.ContainsKey($n)) { return $nameMap[$n] }
    if ($targetNames -contains $n) { return $n }
    return $n
}

Write-Host "Fetching ClubElo ENG page..."
$html = (Invoke-WebRequest -Uri "http://clubelo.com/ENG" -Headers $ua -UseBasicParsing -TimeoutSec 60).Content

$byName = @{}

# 1) Inbaddade JSON-objekt med Federation England
$objs = [regex]::Matches($html, '\{[^{}]*"Federation":\s*"England"[^{}]*\}')
foreach ($o in $objs) {
    $name = $null; $elo = $null; $level = $null
    if ($o.Value -match '"Name":\s*"([^"]+)"') { $name = $Matches[1] }
    if ($o.Value -match '"Elo":\s*([\d.]+)') { $elo = [double]$Matches[1] }
    if ($o.Value -match '"Level":\s*(\d+)') { $level = [int]$Matches[1] }
    if (-not $name -or $null -eq $elo) { continue }
    $mapped = Map-ClubEloName $name
    $byName[$mapped] = [ordered]@{
        name = $mapped
        clubEloName = $name
        elo = [math]::Round($elo, 1)
        level = $level
        source = "clubelo-json"
    }
}

# 2) HTML-tabell / accordion for resterande (Championship m.fl.)
foreach ($want in $targetNames) {
    if ($byName.ContainsKey($want)) { continue }
    $aliases = @($want)
    foreach ($k in $nameMap.Keys) {
        if ($nameMap[$k] -eq $want) { $aliases += $k }
    }
    if ($want -eq "Nott'm Forest") { $aliases += @("Forest", "Nottingham Forest") }
    $found = $false
    foreach ($alias in ($aliases | Select-Object -Unique)) {
        $esc = [regex]::Escape($alias)
        $m = [regex]::Match($html, $esc + '.{0,160}?<td class="r">(\d{3,4})</td>')
        if (-not $m.Success) {
            $m = [regex]::Match($html, $esc + ".{0,120}?', '(\d{3,4})'")
        }
        if (-not $m.Success) {
            $m = [regex]::Match($html, '<span class="Ast">' + $esc + '</span></td><td class="r">(\d{3,4})<')
        }
        if ($m.Success) {
            $byName[$want] = [ordered]@{
                name = $want
                clubEloName = $alias
                elo = [double]$m.Groups[1].Value
                level = $null
                source = "clubelo-html"
            }
            $found = $true
            break
        }
    }
    if (-not $found) {
        Write-Host "WARN missing ClubElo for $want"
    }
}

$teams = @($byName.Values | Sort-Object { $_.elo } -Descending)
$doc = [ordered]@{
    updatedAt = (Get-Date).ToString("o")
    source = "http://clubelo.com/ENG"
    teamCount = $teams.Count
    teams = $teams
}

$outPath = Join-Path $OpenDir "clubelo_ratings.json"
[System.IO.File]::WriteAllText($outPath, ($doc | ConvertTo-Json -Depth 6), $utf8)
Write-Host "ClubElo: $($teams.Count) teams -> $outPath"
$teams | Select-Object -First 8 | ForEach-Object { Write-Host ("  {0} = {1}" -f $_.name, $_.elo) }
