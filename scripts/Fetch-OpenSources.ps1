<#
.SYNOPSIS
  Hamtar all oppen fotbollsdata till data/raw och data/open.
#>
param(
    [switch]$SkipCsv,
    [switch]$SkipOpenFootball,
    [switch]$SkipUnderstat,
    [switch]$SkipPlayers
)

$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent $PSScriptRoot
$RawDir = Join-Path $Root "data/raw"
$OpenDir = Join-Path $Root "data/open"
New-Item -ItemType Directory -Force -Path $RawDir, $OpenDir | Out-Null

$report = [ordered]@{
    updatedAt = (Get-Date).ToString("o")
    sources = @()
}

function Save-Url($Url, $Path, $Name) {
    try {
        Invoke-WebRequest -Uri $Url -OutFile $Path -UseBasicParsing -TimeoutSec 60
        $len = (Get-Item $Path).Length
        Write-Host "OK $Name ($len bytes)"
        $script:report.sources += [ordered]@{ name = $Name; url = $Url; path = $Path; ok = $true; bytes = $len }
        return $true
    } catch {
        Write-Host "FAIL $Name : $($_.Exception.Message)"
        $script:report.sources += [ordered]@{ name = $Name; url = $Url; path = $Path; ok = $false; error = $_.Exception.Message }
        return $false
    }
}

# --- football-data.co.uk CSV (results + odds) ---
if (-not $SkipCsv) {
    Write-Host "`n=== football-data.co.uk CSV ==="
    $csv = @(
        @{ f = "PL_2627.csv"; u = "https://www.football-data.co.uk/mmz4281/2627/E0.csv" },
        @{ f = "CH_2627.csv"; u = "https://www.football-data.co.uk/mmz4281/2627/E1.csv" },
        @{ f = "PL_2526.csv"; u = "https://www.football-data.co.uk/mmz4281/2526/E0.csv" },
        @{ f = "CH_2526.csv"; u = "https://www.football-data.co.uk/mmz4281/2526/E1.csv" },
        @{ f = "PL_2425.csv"; u = "https://www.football-data.co.uk/mmz4281/2425/E0.csv" },
        @{ f = "CH_2425.csv"; u = "https://www.football-data.co.uk/mmz4281/2425/E1.csv" },
        @{ f = "PL_2324.csv"; u = "https://www.football-data.co.uk/mmz4281/2324/E0.csv" },
        @{ f = "CH_2324.csv"; u = "https://www.football-data.co.uk/mmz4281/2324/E1.csv" },
        @{ f = "EL1_2627.csv"; u = "https://www.football-data.co.uk/mmz4281/2627/E2.csv" },
        @{ f = "EL1_2526.csv"; u = "https://www.football-data.co.uk/mmz4281/2526/E2.csv" },
        @{ f = "EL1_2425.csv"; u = "https://www.football-data.co.uk/mmz4281/2425/E2.csv" },
        @{ f = "LL_2627.csv"; u = "https://www.football-data.co.uk/mmz4281/2627/SP1.csv" },
        @{ f = "LL_2526.csv"; u = "https://www.football-data.co.uk/mmz4281/2526/SP1.csv" },
        @{ f = "LL_2425.csv"; u = "https://www.football-data.co.uk/mmz4281/2425/SP1.csv" },
        @{ f = "SA_2627.csv"; u = "https://www.football-data.co.uk/mmz4281/2627/I1.csv" },
        @{ f = "SA_2526.csv"; u = "https://www.football-data.co.uk/mmz4281/2526/I1.csv" },
        @{ f = "SA_2425.csv"; u = "https://www.football-data.co.uk/mmz4281/2425/I1.csv" },
        @{ f = "BL_2627.csv"; u = "https://www.football-data.co.uk/mmz4281/2627/D1.csv" },
        @{ f = "BL_2526.csv"; u = "https://www.football-data.co.uk/mmz4281/2526/D1.csv" },
        @{ f = "BL_2425.csv"; u = "https://www.football-data.co.uk/mmz4281/2425/D1.csv" },
        @{ f = "L1_2627.csv"; u = "https://www.football-data.co.uk/mmz4281/2627/F1.csv" },
        @{ f = "L1_2526.csv"; u = "https://www.football-data.co.uk/mmz4281/2526/F1.csv" },
        @{ f = "L1_2425.csv"; u = "https://www.football-data.co.uk/mmz4281/2425/F1.csv" },
        @{ f = "ED_2627.csv"; u = "https://www.football-data.co.uk/mmz4281/2627/N1.csv" },
        @{ f = "ED_2526.csv"; u = "https://www.football-data.co.uk/mmz4281/2526/N1.csv" },
        @{ f = "ED_2425.csv"; u = "https://www.football-data.co.uk/mmz4281/2425/N1.csv" },
    @{ f = "BL2_2627.csv"; u = "https://www.football-data.co.uk/mmz4281/2627/D2.csv" },
    @{ f = "BL2_2526.csv"; u = "https://www.football-data.co.uk/mmz4281/2526/D2.csv" },
    @{ f = "BL2_2425.csv"; u = "https://www.football-data.co.uk/mmz4281/2425/D2.csv" },
    @{ f = "LL2_2627.csv"; u = "https://www.football-data.co.uk/mmz4281/2627/SP2.csv" },
    @{ f = "LL2_2526.csv"; u = "https://www.football-data.co.uk/mmz4281/2526/SP2.csv" },
    @{ f = "LL2_2425.csv"; u = "https://www.football-data.co.uk/mmz4281/2425/SP2.csv" },
    @{ f = "SB_2627.csv"; u = "https://www.football-data.co.uk/mmz4281/2627/I2.csv" },
    @{ f = "SB_2526.csv"; u = "https://www.football-data.co.uk/mmz4281/2526/I2.csv" },
    @{ f = "SB_2425.csv"; u = "https://www.football-data.co.uk/mmz4281/2425/I2.csv" },
    @{ f = "PT_2627.csv"; u = "https://www.football-data.co.uk/mmz4281/2627/P1.csv" },
    @{ f = "PT_2526.csv"; u = "https://www.football-data.co.uk/mmz4281/2526/P1.csv" },
    @{ f = "PT_2425.csv"; u = "https://www.football-data.co.uk/mmz4281/2425/P1.csv" },
    @{ f = "GR_2627.csv"; u = "https://www.football-data.co.uk/mmz4281/2627/G1.csv" },
    @{ f = "GR_2526.csv"; u = "https://www.football-data.co.uk/mmz4281/2526/G1.csv" },
    @{ f = "GR_2425.csv"; u = "https://www.football-data.co.uk/mmz4281/2425/G1.csv" }
    )
    foreach ($c in $csv) {
        Save-Url $c.u (Join-Path $RawDir $c.f) "csv:$($c.f)" | Out-Null
    }
}

# --- openfootball JSON (fixtures + scores) ---
if (-not $SkipOpenFootball) {
    Write-Host "`n=== openfootball/football.json ==="
    $of = @(
        @{ f = "pl_2026-27.json"; u = "https://raw.githubusercontent.com/openfootball/football.json/master/2026-27/en.1.json"; league = "PL" },
        @{ f = "ch_2026-27.json"; u = "https://raw.githubusercontent.com/openfootball/football.json/master/2026-27/en.2.json"; league = "CH" },
        @{ f = "ll_2026-27.json"; u = "https://raw.githubusercontent.com/openfootball/football.json/master/2026-27/es.1.json"; league = "LL" },
        @{ f = "sa_2026-27.json"; u = "https://raw.githubusercontent.com/openfootball/football.json/master/2026-27/it.1.json"; league = "SA" },
        @{ f = "bl_2026-27.json"; u = "https://raw.githubusercontent.com/openfootball/football.json/master/2026-27/de.1.json"; league = "BL" },
        @{ f = "l1_2026-27.json"; u = "https://raw.githubusercontent.com/openfootball/football.json/master/2026-27/fr.1.json"; league = "L1" },
        @{ f = "ed_2026-27.json"; u = "https://raw.githubusercontent.com/openfootball/football.json/master/2026-27/nl.1.json"; league = "ED" },
        @{ f = "pl_2025-26.json"; u = "https://raw.githubusercontent.com/openfootball/football.json/master/2025-26/en.1.json"; league = "PL" },
        @{ f = "ch_2025-26.json"; u = "https://raw.githubusercontent.com/openfootball/football.json/master/2025-26/en.2.json"; league = "CH" },
        @{ f = "pl_2024-25.json"; u = "https://raw.githubusercontent.com/openfootball/football.json/master/2024-25/en.1.json"; league = "PL" },
        @{ f = "ch_2024-25.json"; u = "https://raw.githubusercontent.com/openfootball/football.json/master/2024-25/en.2.json"; league = "CH" }
    )
    foreach ($o in $of) {
        Save-Url $o.u (Join-Path $OpenDir $o.f) "openfootball:$($o.f)" | Out-Null
    }

    # Explicit openfootball/full name -> football-data CSV short name
    $nameMap = @{
        # England PL/CH
        "Arsenal FC" = "Arsenal"; "Aston Villa FC" = "Aston Villa"; "AFC Bournemouth" = "Bournemouth"
        "Brentford FC" = "Brentford"; "Brighton & Hove Albion FC" = "Brighton"; "Chelsea FC" = "Chelsea"
        "Crystal Palace FC" = "Crystal Palace"; "Everton FC" = "Everton"; "Fulham FC" = "Fulham"
        "Ipswich Town FC" = "Ipswich"; "Leeds United FC" = "Leeds"; "Liverpool FC" = "Liverpool"
        "Manchester City FC" = "Man City"; "Manchester United FC" = "Man United"
        "Newcastle United FC" = "Newcastle"; "Nottingham Forest FC" = "Nott'm Forest"
        "Sunderland AFC" = "Sunderland"; "Tottenham Hotspur FC" = "Tottenham"
        "West Ham United FC" = "West Ham"; "Wolverhampton Wanderers FC" = "Wolves"
        "Burnley FC" = "Burnley"; "Coventry City FC" = "Coventry"; "Hull City AFC" = "Hull"
        "Birmingham City FC" = "Birmingham"; "Blackburn Rovers FC" = "Blackburn"
        "Bristol City FC" = "Bristol City"; "Derby County FC" = "Derby"
        "Leicester City FC" = "Leicester"; "Middlesbrough FC" = "Middlesbrough"
        "Millwall FC" = "Millwall"; "Norwich City FC" = "Norwich"
        "Portsmouth FC" = "Portsmouth"; "Preston North End FC" = "Preston"
        "Queens Park Rangers FC" = "QPR"; "Sheffield United FC" = "Sheffield United"
        "Sheffield Wednesday FC" = "Sheffield Weds"; "Southampton FC" = "Southampton"
        "Stoke City FC" = "Stoke"; "Swansea City AFC" = "Swansea"
        "Watford FC" = "Watford"; "West Bromwich Albion FC" = "West Brom"
        "Wrexham AFC" = "Wrexham"; "Oxford United FC" = "Oxford"
        "Charlton Athletic FC" = "Charlton"; "Luton Town FC" = "Luton"
        # La Liga
        "Deportivo Alavés" = "Alaves"; "Deportivo Alaves" = "Alaves"; "Athletic Club" = "Ath Bilbao"
        "Club Atlético de Madrid" = "Ath Madrid"; "Atletico Madrid" = "Ath Madrid"
        "FC Barcelona" = "Barcelona"; "Real Betis Balompié" = "Betis"; "Real Betis" = "Betis"
        "RC Celta de Vigo" = "Celta"; "Celta Vigo" = "Celta"; "Elche CF" = "Elche"
        "RCD Espanyol de Barcelona" = "Espanol"; "Espanyol" = "Espanol"; "Getafe CF" = "Getafe"
        "RC Deportivo La Coruña" = "La Coruna"; "Deportivo La Coruna" = "La Coruna"
        "Levante UD" = "Levante"; "Málaga CF" = "Malaga"; "Malaga CF" = "Malaga"
        "CA Osasuna" = "Osasuna"; "Real Madrid CF" = "Real Madrid"
        "Real Racing Club de Santander" = "Santander"; "Racing Santander" = "Santander"
        "Sevilla FC" = "Sevilla"; "Real Sociedad de Fútbol" = "Sociedad"; "Real Sociedad" = "Sociedad"
        "Valencia CF" = "Valencia"; "Rayo Vallecano de Madrid" = "Vallecano"; "Rayo Vallecano" = "Vallecano"
        "Villarreal CF" = "Villarreal"
        # Serie A
        "Atalanta BC" = "Atalanta"; "Bologna FC 1909" = "Bologna"; "Cagliari Calcio" = "Cagliari"
        "Como 1907" = "Como"; "ACF Fiorentina" = "Fiorentina"; "Frosinone Calcio" = "Frosinone"
        "Genoa CFC" = "Genoa"; "FC Internazionale Milano" = "Inter"; "Inter" = "Inter"
        "Juventus FC" = "Juventus"; "SS Lazio" = "Lazio"; "US Lecce" = "Lecce"
        "AC Milan" = "Milan"; "AC Monza" = "Monza"; "SSC Napoli" = "Napoli"
        "Parma Calcio 1913" = "Parma"; "AS Roma" = "Roma"; "US Sassuolo Calcio" = "Sassuolo"
        "Torino FC" = "Torino"; "Udinese Calcio" = "Udinese"; "Venezia FC" = "Venezia"
        # Bundesliga
        "FC Augsburg" = "Augsburg"; "FC Bayern München" = "Bayern Munich"; "Bayern Munich" = "Bayern Munich"
        "Borussia Dortmund" = "Dortmund"; "Eintracht Frankfurt" = "Ein Frankfurt"
        "SV Elversberg" = "Elversberg"; "1. FC Köln" = "FC Koln"; "1. FC Koln" = "FC Koln"
        "SC Freiburg" = "Freiburg"; "Hamburger SV" = "Hamburg"; "TSG 1899 Hoffenheim" = "Hoffenheim"
        "Bayer 04 Leverkusen" = "Leverkusen"; "1. FSV Mainz 05" = "Mainz"
        "Borussia Mönchengladbach" = "M'gladbach"; "Borussia M.Gladbach" = "M'gladbach"
        "SC Paderborn 07" = "Paderborn"; "RB Leipzig" = "RB Leipzig"; "FC Schalke 04" = "Schalke 04"
        "VfB Stuttgart" = "Stuttgart"; "1. FC Union Berlin" = "Union Berlin"
        "SV Werder Bremen" = "Werder Bremen"
        # Ligue 1
        "Angers SCO" = "Angers"; "AJ Auxerre" = "Auxerre"; "Stade Brestois 29" = "Brest"
        "Le Havre AC" = "Le Havre"; "Le Mans FC" = "Le Mans"; "RC Lens" = "Lens"
        "LOSC Lille" = "Lille"; "FC Lorient" = "Lorient"; "Olympique Lyonnais" = "Lyon"
        "Olympique de Marseille" = "Marseille"; "AS Monaco FC" = "Monaco"; "OGC Nice" = "Nice"
        "Paris FC" = "Paris FC"; "Paris Saint-Germain FC" = "Paris SG"; "Paris Saint Germain" = "Paris SG"
        "Stade Rennais FC 1901" = "Rennes"; "RC Strasbourg Alsace" = "Strasbourg"
        "Toulouse FC" = "Toulouse"; "ES Troyes AC" = "Troyes"
        # Eredivisie
        "AFC Ajax" = "Ajax"; "AZ Alkmaar" = "AZ Alkmaar"; "SC Cambuur" = "Cambuur"
        "ADO Den Haag" = "Den Haag"; "SBV Excelsior" = "Excelsior"; "Feyenoord Rotterdam" = "Feyenoord"
        "Fortuna Sittard" = "For Sittard"; "Go Ahead Eagles" = "Go Ahead Eagles"
        "FC Groningen" = "Groningen"; "SC Heerenveen" = "Heerenveen"; "NEC Nijmegen" = "Nijmegen"
        "PSV Eindhoven" = "PSV Eindhoven"; "Sparta Rotterdam" = "Sparta Rotterdam"
        "SC Telstar" = "Telstar"; "FC Twente" = "Twente"; "FC Utrecht" = "Utrecht"
        "Willem II Tilburg" = "Willem II"; "PEC Zwolle" = "Zwolle"
    }

    # Known CSV short names per league (for fuzzy fallback)
    $csvTeamsByLeague = @{}
    foreach ($pair in @(
        @{ lg = "PL"; files = @("PL_2627.csv","PL_2526.csv") },
        @{ lg = "CH"; files = @("CH_2627.csv","CH_2526.csv") },
        @{ lg = "LL"; files = @("LL_2627.csv") },
        @{ lg = "SA"; files = @("SA_2627.csv") },
        @{ lg = "BL"; files = @("BL_2627.csv") },
        @{ lg = "L1"; files = @("L1_2627.csv") },
        @{ lg = "ED"; files = @("ED_2627.csv") }
    )) {
        $set = New-Object 'System.Collections.Generic.HashSet[string]'
        foreach ($f in $pair.files) {
            $p = Join-Path $RawDir $f
            if (-not (Test-Path $p)) { continue }
            foreach ($row in (Import-Csv $p)) {
                if ($row.HomeTeam) { [void]$set.Add([string]$row.HomeTeam) }
                if ($row.AwayTeam) { [void]$set.Add([string]$row.AwayTeam) }
            }
        }
        $csvTeamsByLeague[$pair.lg] = @($set)
    }

    function Normalize-TeamToken([string]$n) {
        $x = $n.ToLowerInvariant()
        $x = $x -replace "[áàäâã]", "a" -replace "[éèëê]", "e" -replace "[íìïî]", "i"
        $x = $x -replace "[óòöôõ]", "o" -replace "[úùüû]", "u" -replace "ñ", "n" -replace "ç", "c"
        $x = $x -replace "[^a-z0-9\s]", " "
        $x = $x -replace "\b(fc|cf|cfc|ac|as|ss|ud|cd|rc|sc|afc|bc|calcio|club|de|la|le|the)\b", " "
        $x = $x -replace "\s+", " "
        return $x.Trim()
    }

    function Map-Team([string]$n, [string]$league) {
        if ([string]::IsNullOrWhiteSpace($n)) { return $n }
        if ($nameMap.ContainsKey($n)) { return $nameMap[$n] }
        $known = @()
        if ($csvTeamsByLeague.ContainsKey($league)) { $known = @($csvTeamsByLeague[$league]) }
        $norm = Normalize-TeamToken $n
        foreach ($k in $known) {
            if ((Normalize-TeamToken $k) -eq $norm) { return $k }
        }
        # partial: last meaningful token match
        $toks = $norm.Split(" ") | Where-Object { $_.Length -ge 4 }
        if ($toks.Count -gt 0) {
            $last = $toks[-1]
            $hits = @($known | Where-Object { (Normalize-TeamToken $_) -like "*$last*" })
            if ($hits.Count -eq 1) { return $hits[0] }
        }
        $x = $n -replace ' FC$','' -replace ' CF$','' -replace ' AFC$','' -replace ' & Hove Albion',''
        return $x
    }

    $upcoming = @()
    $today = Get-Date
    foreach ($pair in @(
        @{ file = "pl_2026-27.json"; league = "PL" },
        @{ file = "ch_2026-27.json"; league = "CH" },
        @{ file = "ll_2026-27.json"; league = "LL" },
        @{ file = "sa_2026-27.json"; league = "SA" },
        @{ file = "bl_2026-27.json"; league = "BL" },
        @{ file = "l1_2026-27.json"; league = "L1" },
        @{ file = "ed_2026-27.json"; league = "ED" }
    )) {
        $path = Join-Path $OpenDir $pair.file
        if (-not (Test-Path $path)) { continue }
        $json = Get-Content $path -Raw -Encoding UTF8 | ConvertFrom-Json
        foreach ($m in $json.matches) {
            $hasScore = $false
            if ($m.score -and $m.score.ft -and $m.score.ft.Count -ge 2) { $hasScore = $true }
            if ($hasScore) { continue }
            $dt = $null
            try { $dt = [datetime]::Parse($m.date) } catch { continue }
            if ($dt -lt $today.Date) { continue }
            $upcoming += [ordered]@{
                date = $m.date
                league = $pair.league
                home = (Map-Team $m.team1 $pair.league)
                away = (Map-Team $m.team2 $pair.league)
                source = "openfootball"
                round = $m.round
            }
        }
    }

    $upPath = Join-Path $Root "data/upcoming-fixtures.json"
    ($upcoming | ConvertTo-Json -Depth 5) | ForEach-Object {
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($upPath, $_, $utf8NoBom)
    }
    Write-Host "Upcoming fixtures: $($upcoming.Count) -> $upPath"
    $byLg = $upcoming | Group-Object league | ForEach-Object { "$($_.Name)=$($_.Count)" }
    Write-Host "  per liga: $($byLg -join ', ')"
    $report.upcomingCount = $upcoming.Count
}

# --- Extra ligor (config/leagues.json): historik + kommande (ESPN/Fotmob/TSDB) ---
Write-Host "`n=== Extra ligor (football-data + ESPN) ==="
try {
    node (Join-Path $PSScriptRoot "fetch-extra-leagues.mjs")
    $report.extraLeagues = ($LASTEXITCODE -eq 0)
} catch {
    Write-Host "Extra ligor failed: $($_.Exception.Message)"
    $report.extraLeagues = $false
}

# --- Domare: historik (football-data E0-E3) + tillsatt domare for kommande engelska matcher (FotMob) ---
Write-Host "`n=== Domare (domarsviter per lag) ==="
try {
    node (Join-Path $PSScriptRoot "fetch-referees.mjs")
    $report.referees = ($LASTEXITCODE -eq 0)
} catch {
    Write-Host "Domare failed: $($_.Exception.Message)"
    $report.referees = $false
}

# --- bolldata.se (Allsvenskan xG/spelardata): Playwright-test, hamtar max 1 gang/dygn, 100 s mellan anrop ---
Write-Host "`n=== bolldata.se (Allsvenskan) ==="
try {
    Push-Location $Root
    npx playwright test --project=bolldata --reporter=line
    $report.bolldata = ($LASTEXITCODE -eq 0)
} catch {
    Write-Host "bolldata failed: $($_.Exception.Message)"
    $report.bolldata = $false
} finally {
    Pop-Location
}

# --- Understat xG via AJAX getLeagueData ---
if (-not $SkipUnderstat) {
    Write-Host "`n=== Understat xG (getLeagueData) ==="
    try {
        powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "Fetch-UnderstatXg.ps1")
        $report.understatNeedsPlaywright = $false
        $report.understatAjax = $true
    } catch {
        Write-Host "Understat AJAX failed: $($_.Exception.Message) - mark for Playwright"
        $report.understatNeedsPlaywright = $true
    }
}

# --- FPL availability (PL squads + injuries) ---
Write-Host "`n=== FPL availability ==="
try {
    powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "Fetch-FplAvailability.ps1")
    $report.fpl = $true
} catch {
    Write-Host "FPL failed: $($_.Exception.Message)"
    $report.fpl = $false
}

# --- ClubElo ratings (PL + Championship) ---
Write-Host "`n=== ClubElo ==="
try {
    powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "Fetch-ClubElo.ps1")
    $report.clubElo = $true
} catch {
    Write-Host "ClubElo failed: $($_.Exception.Message)"
    $report.clubElo = $false
}

# --- ESPN lineups (confirmed XI when released) ---
Write-Host "`n=== ESPN lineups ==="
try {
    powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "Fetch-Lineups.ps1")
    $report.espnLineups = $true
} catch {
    Write-Host "ESPN lineups failed: $($_.Exception.Message)"
    $report.espnLineups = $false
}

# --- Live odds (optional API key) ---
Write-Host "`n=== Odds API (optional) ==="
try {
    powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "Fetch-OddsApi.ps1")
    $report.odds = $true
} catch {
    Write-Host "Odds fetch failed: $($_.Exception.Message)"
    $report.odds = $false
}

# --- Player match stats (PL: Understat+FPL, CH: ESPN) ---
if (-not $SkipPlayers) {
    Write-Host "`n=== Player stats (PL + Championship) ==="
    try {
        powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "Fetch-PlayerStats.ps1")
        $report.playerStats = $true
        $psPath = Join-Path $OpenDir "player_stats.json"
        if (Test-Path $psPath) {
            $ps = Get-Content $psPath -Raw -Encoding UTF8 | ConvertFrom-Json
            $report.playerStatsCounts = $ps.counts
        }
    } catch {
        Write-Host "Player stats failed: $($_.Exception.Message)"
        $report.playerStats = $false
    }
} else {
    Write-Host "`n=== Player stats SKIP ==="
}

# Vader (arenor + Open-Meteo) hamtas inte langre: det paverkar inte utfallet (pro-evaluation.json, weatherEffect).
# Manuellt vid behov: npm run venues / npm run weather
if (-not $SkipPlayers) {
    Write-Host "`n=== Spelarfranvaro (Understat, cachad) ==="
    try {
        node (Join-Path $PSScriptRoot "fetch-player-impact.mjs")
        $report.playerImpact = ($LASTEXITCODE -eq 0)
    } catch {
        Write-Host "Spelarfranvaro failed: $($_.Exception.Message)"
        $report.playerImpact = $false
    }
}

$reportPath = Join-Path $OpenDir "fetch-report.json"
($report | ConvertTo-Json -Depth 6) | ForEach-Object {
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($reportPath, $_, $utf8NoBom)
}
Write-Host "`nReport: $reportPath"
Write-Host "Done. Sources ok: $((@($report.sources | Where-Object ok)).Count)/$(@($report.sources).Count)"
