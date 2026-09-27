<#
.SYNOPSIS
  Hamtar PL-trupper + availability fran Fantasy Premier League (oppen API).
  Championship stöds inte av FPL.
#>
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$OpenDir = Join-Path $Root "data\open"
New-Item -ItemType Directory -Force -Path $OpenDir | Out-Null

$ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) BettingNy/1.0"
Write-Host "Fetching FPL bootstrap-static..."
. (Join-Path $PSScriptRoot "lib\Http.ps1")
$content = Get-Utf8Text -Uri "https://fantasy.premierleague.com/api/bootstrap-static/" -Headers @{ "User-Agent" = $ua } -TimeoutSec 60
$rawPath = Join-Path $OpenDir "fpl_bootstrap_raw.json"
$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($rawPath, $content, $utf8)

$data = $content | ConvertFrom-Json

# Map FPL team name -> CSV short names
$teamNameMap = @{
    "Arsenal" = "Arsenal"
    "Aston Villa" = "Aston Villa"
    "Bournemouth" = "Bournemouth"
    "Brentford" = "Brentford"
    "Brighton" = "Brighton"
    "Burnley" = "Burnley"
    "Chelsea" = "Chelsea"
    "Crystal Palace" = "Crystal Palace"
    "Everton" = "Everton"
    "Fulham" = "Fulham"
    "Ipswich" = "Ipswich"
    "Ipswich Town" = "Ipswich"
    "Leeds" = "Leeds"
    "Leeds United" = "Leeds"
    "Liverpool" = "Liverpool"
    "Man City" = "Man City"
    "Man Utd" = "Man United"
    "Newcastle" = "Newcastle"
    "Nott'm Forest" = "Nott'm Forest"
    "Sunderland" = "Sunderland"
    "Spurs" = "Tottenham"
    "West Ham" = "West Ham"
    "Wolves" = "Wolves"
    "Leicester" = "Leicester"
    "Southampton" = "Southampton"
    "Hull" = "Hull"
    "Hull City" = "Hull"
    "Coventry" = "Coventry"
}

$teamsById = @{}
foreach ($t in $data.teams) {
    $short = if ($teamNameMap.ContainsKey($t.name)) { $teamNameMap[$t.name] } else { $t.name }
    $teamsById[[int]$t.id] = [ordered]@{
        fplId = [int]$t.id
        fplName = $t.name
        name = $short
        shortName = $t.short_name
    }
}

$pos = @{ 1 = "GK"; 2 = "DEF"; 3 = "MID"; 4 = "FWD" }

$squads = @{}
$availability = @()
foreach ($p in $data.elements) {
    $tid = [int]$p.team
    if (-not $teamsById.ContainsKey($tid)) { continue }
    $team = $teamsById[$tid]
    $player = [ordered]@{
        id = [int]$p.id
        name = $p.web_name
        fullName = ($p.first_name + " " + $p.second_name).Trim()
        position = $pos[[int]$p.element_type]
        team = $team.name
        status = $p.status  # a=available, d=doubtful, i=injured, s=suspended, u=unavailable
        chanceNext = $p.chance_of_playing_next_round
        news = $p.news
        form = $p.form
        points = [int]$p.total_points
        selectedBy = $p.selected_by_percent
    }

    if (-not $squads.ContainsKey($team.name)) {
        $squads[$team.name] = New-Object System.Collections.Generic.List[object]
    }
    $squads[$team.name].Add($player) | Out-Null

    $chance = 100
    if ($null -ne $p.chance_of_playing_next_round) { $chance = [int]$p.chance_of_playing_next_round }
    $missing = ($p.status -in @("i", "s", "u")) -or ($chance -le 25)
    $doubtful = ($p.status -eq "d") -or ($chance -gt 25 -and $chance -lt 75)
    if ($missing -or $doubtful) {
        # key if attacker/mid with points, or GK/DEF with high ownership, or top points on team
        $isKey = $false
        $pts = [int]$p.total_points
        $sel = 0.0
        $selStr = ([string]$p.selected_by_percent).Replace(',', '.')
        [void][double]::TryParse($selStr, [System.Globalization.NumberStyles]::Any, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$sel)
        # Early-season friendly: ownership, position, or any meaningful points
        if ($sel -ge 5) { $isKey = $true }
        if ($player.position -in @("FWD", "MID") -and ($pts -ge 8 -or $sel -ge 3)) { $isKey = $true }
        if ($player.position -eq "GK" -and $sel -ge 3) { $isKey = $true }
        if ($player.position -eq "DEF" -and ($pts -ge 10 -or $sel -ge 5)) { $isKey = $true }
        if ($missing -and $player.position -in @("FWD", "MID", "GK") -and $pts -ge 5) { $isKey = $true }

        $availability += [ordered]@{
            team = $team.name
            player = $player.name
            position = $player.position
            status = $player.status
            chanceNext = $chance
            news = $player.news
            severity = $(if ($missing) { "out" } else { "doubtful" })
            isKey = $isKey
        }
    }
}

$squadOut = New-Object System.Collections.Generic.List[object]
foreach ($name in ($squads.Keys | Sort-Object)) {
    $players = $squads[$name].ToArray()
    $outs = @($availability | Where-Object { $_.team -eq $name -and $_.severity -eq "out" })
    $keyOuts = @($outs | Where-Object { $_.isKey })
    $squadOut.Add([ordered]@{
        league = "PL"
        name = $name
        playerCount = $players.Count
        players = $players
        missingCount = $outs.Count
        keyMissing = @($keyOuts | ForEach-Object { $_.player })
        availabilityFlags = @($availability | Where-Object { $_.team -eq $name })
    }) | Out-Null
}
$squadOutArr = $squadOut.ToArray()

$doc = [ordered]@{
    source = "fantasy.premierleague.com/api/bootstrap-static/"
    league = "PL"
    updatedAt = (Get-Date).ToString("o")
    teamCount = $squadOutArr.Count
    playerCount = @($data.elements).Count
    missingOrDoubtful = $availability.Count
    keyOuts = @($availability | Where-Object { $_.isKey -and $_.severity -eq "out" })
    championshipNote = "FPL tacker endast Premier League. Championship availability saknas i denna kalla."
    teams = $squadOutArr
}

$outPath = Join-Path $OpenDir "fpl_availability.json"
[System.IO.File]::WriteAllText($outPath, ($doc | ConvertTo-Json -Depth 8), $utf8)
Write-Host "OK -> $outPath teams=$($doc.teamCount) flags=$($doc.missingOrDoubtful) keyOuts=$(@($doc.keyOuts).Count)"
