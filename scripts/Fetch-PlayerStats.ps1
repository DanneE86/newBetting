<#
.SYNOPSIS
  Hamtar spelardata for Europas top 6 hogsta divisioner:
    1. Premier League (EPL)      - Understat + FPL
    2. La Liga                   - Understat
    3. Serie A                   - Understat
    4. Bundesliga                - Understat
    5. Ligue 1                   - Understat
    6. Eredivisie                - ESPN (Understat saknas)

  Behaller aven Championship (eng.2) via ESPN som extra.
#>
param(
    [string]$Season = "2026",
    [int]$EspnLookbackDays = 28,
    [int]$MatchHistoryLimit = 5,
    [switch]$SkipFplHistory,
    [switch]$SkipUnderstatMatches,
    [switch]$SkipEspn,
    [switch]$SkipChampionship
)

$ErrorActionPreference = "Continue"
. (Join-Path $PSScriptRoot "lib\Http.ps1")
$Root = Split-Path -Parent $PSScriptRoot
$OpenDir = Join-Path $Root "data\open"
New-Item -ItemType Directory -Force -Path $OpenDir | Out-Null

$ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
$utf8 = New-Object System.Text.UTF8Encoding $false

$UnderstatLeagues = @(
    @{ code = "EPL";        league = "PL"; name = "Premier League" }
    @{ code = "La_liga";    league = "LL"; name = "La Liga" }
    @{ code = "Serie_A";    league = "SA"; name = "Serie A" }
    @{ code = "Bundesliga"; league = "BL"; name = "Bundesliga" }
    @{ code = "Ligue_1";    league = "L1"; name = "Ligue 1" }
)

$EspnLeagues = @(
    @{ slug = "ned.1"; league = "ED"; name = "Eredivisie" }
)
if (-not $SkipChampionship) {
    $EspnLeagues += @{ slug = "eng.2"; league = "CH"; name = "Championship" }
}

function Normalize-Name([string]$n) {
    if (-not $n) { return "" }
    $x = $n.ToLowerInvariant().Trim()
    $x = $x -replace "[^a-z0-9\s]", ""
    $x = $x -replace "\s+", " "
    return $x
}

function Write-JsonFile($Path, $Obj) {
    [System.IO.File]::WriteAllText($Path, ($Obj | ConvertTo-Json -Depth 12 -Compress), $utf8)
}

function Get-StatInt($stats, $key) {
    if (-not $stats.ContainsKey($key)) { return 0 }
    try { return [int]$stats[$key] } catch { return 0 }
}

$sources = [ordered]@{
    understat = [ordered]@{ ok = $false; leagues = @() }
    fpl = [ordered]@{ ok = $false; note = "PL only" }
    espn = [ordered]@{ ok = $false; leagues = @() }
    blocked = @(
        [ordered]@{ name = "Opta/Stats Perform"; reason = "Licenskrav - ingen oppen spelstat-API" }
        [ordered]@{ name = "FBref"; reason = "HTTP 403" }
        [ordered]@{ name = "WhoScored"; reason = "HTTP 403" }
    )
    limitations = @(
        "totalPasses per spelare saknas oppet - Understat key_passes ar narmaste proxy.",
        "Eredivisie saknas pa Understat - ESPN boxscore (mal/skott/fouls).",
        "FPL finns bara for Premier League."
    )
    scope = @("PL", "LL", "SA", "BL", "L1", "ED")
}

$playersByLeague = [ordered]@{}  # league code -> list
foreach ($ul in $UnderstatLeagues) { $playersByLeague[$ul.league] = @{} }  # nameKey -> player
foreach ($el in $EspnLeagues) { $playersByLeague[$el.league] = @{} }

# ========== Understat: 5 big leagues ==========
Write-Host "`n=== Understat top-5 (season + matches) ==="
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$allUsIds = @()  # @{ id, league, nameKey }

foreach ($ul in $UnderstatLeagues) {
    try {
        $pageUrl = "https://understat.com/league/$($ul.code)/$Season"
        Write-Host "Fetching $($ul.name) ($($ul.code))..."
        Invoke-WebRequest -Uri $pageUrl -WebSession $session -Headers @{ "User-Agent" = $ua } -UseBasicParsing -TimeoutSec 45 | Out-Null
        $league = Get-Utf8Json -Uri "https://understat.com/getLeagueData/$($ul.code)/$Season" -WebSession $session -Headers @{
            "User-Agent" = $ua
            "X-Requested-With" = "XMLHttpRequest"
            "Accept" = "application/json, text/javascript, */*; q=0.01"
            "Referer" = $pageUrl
        } -TimeoutSec 60
        $usPlayers = @($league.players)
        Write-Host "  $($ul.name): $($usPlayers.Count) players"

        foreach ($p in $usPlayers) {
            $obj = [ordered]@{
                name = [string]$p.player_name
                team = [string]$p.team_title
                league = $ul.league
                leagueName = $ul.name
                understatId = [string]$p.id
                understatLeague = $ul.code
                position = [string]$p.position
                season = [ordered]@{
                    games = [int]$p.games
                    time = [int]$p.time
                    goals = [int]$p.goals
                    assists = [int]$p.assists
                    shots = [int]$p.shots
                    keyPasses = [int]$p.key_passes
                    xG = [math]::Round([double]$p.xG, 3)
                    xA = [math]::Round([double]$p.xA, 3)
                    npxG = [math]::Round([double]$p.npxG, 3)
                    xGChain = [math]::Round([double]$p.xGChain, 3)
                    xGBuildup = [math]::Round([double]$p.xGBuildup, 3)
                    yellowCards = [int]$p.yellow_cards
                    redCards = [int]$p.red_cards
                }
                lastMatches = @()
                lastMatch = $null
                fpl = $null
            }
            $key = Normalize-Name $obj.name
            if (-not $key) { $key = "id_$($p.id)" }
            # unika nycklar vid krock
            if ($playersByLeague[$ul.league].ContainsKey($key)) { $key = "$key`_$($p.id)" }
            $playersByLeague[$ul.league][$key] = $obj
            if ([int]$p.games -gt 0) {
                $allUsIds += @{ id = [string]$p.id; league = $ul.league; nameKey = $key }
            }
        }
        $sources.understat.leagues += [ordered]@{
            code = $ul.code; league = $ul.league; name = $ul.name; players = $usPlayers.Count; ok = $true
        }
    } catch {
        Write-Host "  FAIL $($ul.name): $($_.Exception.Message)"
        $sources.understat.leagues += [ordered]@{
            code = $ul.code; league = $ul.league; name = $ul.name; ok = $false; error = $_.Exception.Message
        }
    }
}
$sources.understat.ok = (@($sources.understat.leagues | Where-Object ok).Count -ge 1)
$sources.understat.playerCount = $allUsIds.Count

# Match history
if (-not $SkipUnderstatMatches -and $allUsIds.Count -gt 0) {
    Write-Host "`n=== Understat match history ($($allUsIds.Count) players, last $MatchHistoryLimit) ==="
    $i = 0; $okM = 0
    foreach ($row in $allUsIds) {
        $i++
        if ($i % 80 -eq 0) { Write-Host "  matches $i / $($allUsIds.Count)..." }
        try {
            $raw = Get-Utf8Text -Uri "https://understat.com/getPlayerData/$($row.id)" -Headers @{
                "User-Agent" = $ua
                "X-Requested-With" = "XMLHttpRequest"
                "Referer" = "https://understat.com/player/$($row.id)"
                "Accept" = "application/json"
            } -TimeoutSec 30
            $pd = $raw | ConvertFrom-Json
            $hist = @()
            foreach ($m in @($pd.matches | Select-Object -First $MatchHistoryLimit)) {
                $hist += [ordered]@{
                    date = [string]$m.date
                    home = [string]$m.h_team
                    away = [string]$m.a_team
                    minutes = [int]$m.time
                    position = [string]$m.position
                    goals = [int]$m.goals
                    assists = [int]$m.assists
                    shots = [int]$m.shots
                    keyPasses = [int]$m.key_passes
                    xG = [math]::Round([double]$m.xG, 3)
                    xA = [math]::Round([double]$m.xA, 3)
                    xGChain = [math]::Round([double]$m.xGChain, 3)
                    xGBuildup = [math]::Round([double]$m.xGBuildup, 3)
                    source = "understat"
                }
            }
            $pl = $playersByLeague[$row.league][$row.nameKey]
            $pl.lastMatches = $hist
            if ($hist.Count -gt 0) { $pl.lastMatch = $hist[0] }
            $okM++
            Start-Sleep -Milliseconds 35
        } catch { }
    }
    $sources.understat.matchHistoryPlayers = $okM
    Write-Host "Match history OK: $okM"
}

# ========== FPL (PL only) ==========
Write-Host "`n=== FPL (Premier League) ==="
try {
    $boot = Get-Utf8Json -Uri "https://fantasy.premierleague.com/api/bootstrap-static/" -Headers @{ "User-Agent" = $ua } -TimeoutSec 60
    $teamsById = @{}
    foreach ($t in $boot.teams) { $teamsById[[int]$t.id] = $t }
    $elements = @($boot.elements)
    $fplHistOk = 0
    Write-Host "FPL elements: $($elements.Count)"

    foreach ($el in $elements) {
        $team = $teamsById[[int]$el.team]
        $teamName = if ($team) { [string]$team.name } else { "" }
        if ($teamName -eq "Man Utd") { $teamName = "Manchester United" }
        if ($teamName -eq "Spurs") { $teamName = "Tottenham" }
        if ($teamName -eq "Nott'm Forest") { $teamName = "Nottingham Forest" }
        $display = "$($el.first_name) $($el.second_name)".Trim()

        $fplBlock = [ordered]@{
            fplId = [int]$el.id
            webName = [string]$el.web_name
            status = [string]$el.status
            form = [string]$el.form
            totalPoints = [int]$el.total_points
            minutes = [int]$el.minutes
            goals = [int]$el.goals_scored
            assists = [int]$el.assists
            expectedGoals = [string]$el.expected_goals
            expectedAssists = [string]$el.expected_assists
            ictIndex = [string]$el.ict_index
            creativity = [string]$el.creativity
            influence = [string]$el.influence
            threat = [string]$el.threat
            lastMatches = @()
        }

        if (-not $SkipFplHistory) {
            try {
                $sum = Get-Utf8Json -Uri "https://fantasy.premierleague.com/api/element-summary/$($el.id)/" -Headers @{ "User-Agent" = $ua } -TimeoutSec 20
                $hist = @($sum.history | Select-Object -Last $MatchHistoryLimit)
                [array]::Reverse($hist)
                foreach ($h in $hist) {
                    $fplBlock.lastMatches += [ordered]@{
                        round = [int]$h.round
                        kickoff = [string]$h.kickoff_time
                        minutes = [int]$h.minutes
                        goals = [int]$h.goals_scored
                        assists = [int]$h.assists
                        tackles = [int]$h.tackles
                        recoveries = [int]$h.recoveries
                        defensiveContribution = [int]$h.defensive_contribution
                        expectedGoals = [string]$h.expected_goals
                        expectedAssists = [string]$h.expected_assists
                        creativity = [string]$h.creativity
                        ictIndex = [string]$h.ict_index
                        totalPoints = [int]$h.total_points
                        source = "fpl"
                    }
                }
                $fplHistOk++
                if ($fplHistOk % 100 -eq 0) { Write-Host "  FPL history $fplHistOk / $($elements.Count)..." }
                Start-Sleep -Milliseconds 20
            } catch { }
        }

        $keys = @((Normalize-Name $display), (Normalize-Name $el.web_name), (Normalize-Name $el.second_name)) |
            Where-Object { $_ } | Select-Object -Unique
        $matched = $false
        foreach ($k in $keys) {
            if ($playersByLeague.PL.ContainsKey($k)) {
                $playersByLeague.PL[$k].fpl = $fplBlock
                $matched = $true
                break
            }
        }
        if (-not $matched) {
            $key = Normalize-Name $display
            if (-not $key) { $key = Normalize-Name $el.web_name }
            if (-not $playersByLeague.PL.ContainsKey($key)) {
                $playersByLeague.PL[$key] = [ordered]@{
                    name = $display; team = $teamName; league = "PL"; leagueName = "Premier League"
                    understatId = $null; position = [string]$el.element_type
                    season = $null; lastMatches = @(); lastMatch = $null; fpl = $fplBlock
                }
            }
        }
    }

    # Reconcile Bruno Borges Fernandes <-> Bruno Fernandes
    $plKeys = @($playersByLeague.PL.Keys)
    $merged = 0
    foreach ($k in $plKeys) {
        $p = $playersByLeague.PL[$k]
        if (-not $p.understatId -or $p.fpl) { continue }
        $tokens = @(Normalize-Name $p.name).Split(" ") | Where-Object { $_ }
        if ($tokens.Count -lt 2) { continue }
        $first = $tokens[0]; $last = $tokens[$tokens.Count - 1]
        foreach ($k2 in $plKeys) {
            if ($k2 -eq $k) { continue }
            if (-not $playersByLeague.PL.ContainsKey($k2)) { continue }
            $other = $playersByLeague.PL[$k2]
            if ($other.understatId -or -not $other.fpl) { continue }
            $ot = @(Normalize-Name $other.name).Split(" ") | Where-Object { $_ }
            if ($ot.Count -lt 2) { continue }
            if ($ot[0] -eq $first -and $ot[$ot.Count - 1] -eq $last) {
                $p.fpl = $other.fpl
                $playersByLeague.PL.Remove($k2) | Out-Null
                $merged++
                break
            }
        }
    }
    Write-Host "FPL OK: $($elements.Count) history=$fplHistOk merged=$merged"
    $sources.fpl.ok = $true
    $sources.fpl.playerCount = $elements.Count
    $sources.fpl.historyPlayers = $fplHistOk
} catch {
    Write-Host "FAIL FPL: $($_.Exception.Message)"
    $sources.fpl.error = $_.Exception.Message
}

# ========== ESPN: Eredivisie (+ Championship) ==========
if (-not $SkipEspn) {
    Write-Host "`n=== ESPN Eredivisie (+ optional CH) ==="
    $espnH = @{ "User-Agent" = $ua; "Accept" = "application/json"; "Referer" = "https://www.espn.com/" }
    foreach ($el in $EspnLeagues) {
        Write-Host "ESPN $($el.name) ($($el.slug))..."
        $byId = @{}
        $events = 0
        for ($d = 0; $d -lt $EspnLookbackDays; $d++) {
            $dateStr = (Get-Date).AddDays(-$d).ToString("yyyyMMdd")
            try {
                $sb = Get-Utf8Json -Uri "https://site.web.api.espn.com/apis/site/v2/sports/soccer/$($el.slug)/scoreboard?dates=$dateStr" -Headers $espnH -TimeoutSec 20
            } catch { continue }
            foreach ($ev in @($sb.events)) {
                if (-not $ev.status.type.completed) { continue }
                try {
                    $sum = Get-Utf8Json -Uri "https://site.web.api.espn.com/apis/site/v2/sports/soccer/$($el.slug)/summary?event=$($ev.id)" -Headers $espnH -TimeoutSec 25
                } catch { continue }
                $events++
                foreach ($roster in @($sum.rosters)) {
                    $teamName = [string]$roster.team.displayName
                    foreach ($p in @($roster.roster)) {
                        if (-not $p.athlete -or -not $p.athlete.id) { continue }
                        $id = [string]$p.athlete.id
                        if (-not $byId.ContainsKey($id)) {
                            $byId[$id] = [ordered]@{
                                espnId = $id
                                name = [string]$p.athlete.displayName
                                team = $teamName
                                league = $el.league
                                leagueName = $el.name
                                position = if ($p.position) { [string]$p.position.abbreviation } else { $null }
                                appearances = 0
                                goals = 0; assists = 0; shots = 0; shotsOnTarget = 0
                                foulsCommitted = 0; yellowCards = 0; redCards = 0
                                lastMatches = @(); lastMatch = $null
                                season = $null; understatId = $null; fpl = $null
                            }
                        }
                        $row = $byId[$id]
                        $row.team = $teamName
                        $row.appearances++
                        $stats = @{}
                        foreach ($s in @($p.stats)) {
                            $val = $s.value
                            if ($val -is [string] -and $val.Contains(",")) { $val = ($val -split ",")[0] }
                            $stats[[string]$s.name] = $val
                        }
                        $g = Get-StatInt $stats "totalGoals"
                        $a = Get-StatInt $stats "goalAssists"
                        $sh = Get-StatInt $stats "totalShots"
                        $sot = Get-StatInt $stats "shotsOnTarget"
                        $fc = Get-StatInt $stats "foulsCommitted"
                        $row.goals += $g; $row.assists += $a; $row.shots += $sh
                        $row.shotsOnTarget += $sot; $row.foulsCommitted += $fc
                        $row.yellowCards += (Get-StatInt $stats "yellowCards")
                        $row.redCards += (Get-StatInt $stats "redCards")
                        $lm = [ordered]@{
                            date = $dateStr; eventId = [string]$ev.id; match = [string]$ev.name
                            starter = [bool]$p.starter
                            goals = $g; assists = $a; shots = $sh; shotsOnTarget = $sot
                            foulsCommitted = $fc; keyPasses = $null; totalPasses = $null
                            source = "espn"
                        }
                        $row.lastMatches = @($lm) + @($row.lastMatches)
                        if ($row.lastMatches.Count -gt $MatchHistoryLimit) {
                            $row.lastMatches = @($row.lastMatches | Select-Object -First $MatchHistoryLimit)
                        }
                        $row.lastMatch = $row.lastMatches[0]
                    }
                }
                Start-Sleep -Milliseconds 25
            }
        }
        foreach ($id in $byId.Keys) {
            $playersByLeague[$el.league][$id] = $byId[$id]
        }
        Write-Host "  $($el.name): $events events, $($byId.Count) players"
        $sources.espn.leagues += [ordered]@{
            slug = $el.slug; league = $el.league; name = $el.name; events = $events; players = $byId.Count; ok = ($byId.Count -gt 0)
        }
    }
    $sources.espn.ok = (@($sources.espn.leagues | Where-Object ok).Count -ge 1)
}

# ========== Assemble ==========
function To-PlayerList($hash) {
    return @($hash.Values | Sort-Object { $_.name })
}

$outLeagues = [ordered]@{}
$counts = [ordered]@{}
$total = 0
$indexPlayers = @()

foreach ($code in @("PL", "LL", "SA", "BL", "L1", "ED", "CH")) {
    if (-not $playersByLeague.Contains($code)) { continue }
    $list = To-PlayerList $playersByLeague[$code]
    if ($list.Count -eq 0 -and $code -eq "CH" -and $SkipChampionship) { continue }
    $outLeagues[$code] = $list
    $counts[$code] = $list.Count
    $total += $list.Count
    foreach ($p in $list) {
        $idx = [ordered]@{
            name = $p.name; team = $p.team; league = $code
            understatId = $p.understatId
            fplId = if ($p.fpl) { $p.fpl.fplId } else { $null }
            espnId = $p.espnId
            seasonKeyPasses = if ($p.season) { $p.season.keyPasses } else { $null }
            seasonXg = if ($p.season) { $p.season.xG } else { $null }
            lastKeyPasses = if ($p.lastMatch -and $null -ne $p.lastMatch.keyPasses) { $p.lastMatch.keyPasses } else { $null }
            lastMinutes = if ($p.lastMatch -and $null -ne $p.lastMatch.minutes) { $p.lastMatch.minutes } else { $null }
        }
        $indexPlayers += $idx
    }
}

$out = [ordered]@{
    updatedAt = (Get-Date).ToString("o")
    scope = $sources.scope
    sources = $sources
    counts = $counts
    total = $total
    leagues = $outLeagues
    # bakatkompatibilitet
    premierLeague = $(if ($outLeagues.PL) { $outLeagues.PL } else { @() })
    championship = $(if ($outLeagues.CH) { $outLeagues.CH } else { @() })
}

$outPath = Join-Path $OpenDir "player_stats.json"
Write-JsonFile $outPath $out
Write-Host "`nWrote $outPath (total=$total)"
foreach ($k in $counts.Keys) { Write-Host "  $k = $($counts[$k])" }

$idx = [ordered]@{
    updatedAt = $out.updatedAt
    counts = $counts
    total = $total
    players = $indexPlayers
}
Write-JsonFile (Join-Path $OpenDir "player_stats_index.json") $idx
Write-Host "Index: $($indexPlayers.Count) entries"

# Team attack aggregates for tip model
$teamAgg = [ordered]@{ updatedAt = $out.updatedAt; teams = @() }
foreach ($code in $outLeagues.Keys) {
    $byTeam = @{}
    foreach ($p in $outLeagues[$code]) {
        $tn = [string]$p.team
        if (-not $tn -or $tn -match ",") { continue }
        if (-not $byTeam.ContainsKey($tn)) {
            $byTeam[$tn] = [ordered]@{
                league = $code; team = $tn
                playerCount = 0; xG = 0.0; xA = 0.0; keyPasses = 0.0
                shots = 0.0; xGChain = 0.0; minutes = 0.0
                topCreators = @()
            }
        }
        $t = $byTeam[$tn]
        $t.playerCount++
        if ($p.season) {
            $t.xG += [double]$p.season.xG
            $t.xA += [double]$p.season.xA
            $t.keyPasses += [double]$p.season.keyPasses
            $t.shots += [double]$p.season.shots
            $t.xGChain += [double]$p.season.xGChain
            $t.minutes += [double]$p.season.time
            $t.topCreators += [ordered]@{
                name = $p.name
                keyPasses = [int]$p.season.keyPasses
                xG = [double]$p.season.xG
                xA = [double]$p.season.xA
            }
        }
    }
    foreach ($tn in $byTeam.Keys) {
        $t = $byTeam[$tn]
        $gamesEst = if ($t.minutes -gt 0) { [math]::Max(1.0, $t.minutes / 11.0 / 90.0) } else { 1.0 }
        # top 5 creators by keyPasses+xA
        $top = @($t.topCreators | Sort-Object { -1 * ($_.keyPasses + 10 * $_.xA) } | Select-Object -First 5)
        $teamAgg.teams += [ordered]@{
            league = $t.league
            team = $t.team
            playerCount = $t.playerCount
            attackXg = [math]::Round($t.xG, 2)
            attackXa = [math]::Round($t.xA, 2)
            keyPasses = [math]::Round($t.keyPasses, 1)
            shots = [math]::Round($t.shots, 1)
            xGChain = [math]::Round($t.xGChain, 2)
            attackIndex = [math]::Round( ($t.xG + 0.7 * $t.xA + 0.05 * $t.keyPasses) / $gamesEst , 3)
            createIndex = [math]::Round( ($t.keyPasses + 8 * $t.xA) / $gamesEst / 10.0 , 3)
            topCreators = $top
        }
    }
}
Write-JsonFile (Join-Path $OpenDir "team_player_attack.json") $teamAgg
Write-Host "Team attack aggregates: $($teamAgg.teams.Count) teams"
