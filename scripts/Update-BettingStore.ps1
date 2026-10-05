<#
.SYNOPSIS
  Hämtar PL/Championship-CSV, bygger data/betting-store.json (alltid lokal källa),
  och genererar tips för 1X2, BTTS och Over/Under 2.5.

.EXAMPLE
  .\scripts\Update-BettingStore.ps1
  .\scripts\Update-BettingStore.ps1 -SkipDownload
#>
param(
    [switch]$SkipDownload
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
if (-not $Root) { $Root = (Get-Location).Path }
# When script is in project/scripts, Root = project
if ((Split-Path -Leaf $PSScriptRoot) -eq "scripts") {
    $Root = Split-Path -Parent $PSScriptRoot
}

$RawDir = Join-Path $Root "data/raw"
$StorePath = Join-Path $Root "data/betting-store.json"
$TipsPath = Join-Path $Root "data/tips-latest.json"
$TipsMdPath = Join-Path $Root "data/tips-latest.md"

New-Item -ItemType Directory -Force -Path $RawDir | Out-Null

# Ligaregister (config/leagues.json): alla ligakoder + vilka som har football-data "new"-format
$Registry = ([System.IO.File]::ReadAllText((Join-Path $Root "config/leagues.json"))) | ConvertFrom-Json
$AllLeagues = @($Registry.leagues.PSObject.Properties | ForEach-Object { $_.Name })
$FdNewLeagues = @($Registry.leagues.PSObject.Properties | Where-Object { $_.Value.history -eq "fd-new" } | ForEach-Object { $_.Name })

$Sources = @(
    # Premier League + Championship
    @{ Key = "PL_2627"; League = "PL"; Season = "2026/27"; Url = "https://www.football-data.co.uk/mmz4281/2627/E0.csv"; File = "PL_2627.csv" },
    @{ Key = "CH_2627"; League = "CH"; Season = "2026/27"; Url = "https://www.football-data.co.uk/mmz4281/2627/E1.csv"; File = "CH_2627.csv" },
    @{ Key = "PL_2526"; League = "PL"; Season = "2025/26"; Url = "https://www.football-data.co.uk/mmz4281/2526/E0.csv"; File = "PL_2526.csv" },
    @{ Key = "CH_2526"; League = "CH"; Season = "2025/26"; Url = "https://www.football-data.co.uk/mmz4281/2526/E1.csv"; File = "CH_2526.csv" },
    @{ Key = "PL_2425"; League = "PL"; Season = "2024/25"; Url = "https://www.football-data.co.uk/mmz4281/2425/E0.csv"; File = "PL_2425.csv" },
    @{ Key = "CH_2425"; League = "CH"; Season = "2024/25"; Url = "https://www.football-data.co.uk/mmz4281/2425/E1.csv"; File = "CH_2425.csv" },
    @{ Key = "PL_2324"; League = "PL"; Season = "2023/24"; Url = "https://www.football-data.co.uk/mmz4281/2324/E0.csv"; File = "PL_2324.csv" },
    @{ Key = "CH_2324"; League = "CH"; Season = "2023/24"; Url = "https://www.football-data.co.uk/mmz4281/2324/E1.csv"; File = "CH_2324.csv" },
    # League One (EL1; L1 = Ligue 1)
    @{ Key = "EL1_2627"; League = "EL1"; Season = "2026/27"; Url = "https://www.football-data.co.uk/mmz4281/2627/E2.csv"; File = "EL1_2627.csv" },
    @{ Key = "EL1_2526"; League = "EL1"; Season = "2025/26"; Url = "https://www.football-data.co.uk/mmz4281/2526/E2.csv"; File = "EL1_2526.csv" },
    @{ Key = "EL1_2425"; League = "EL1"; Season = "2024/25"; Url = "https://www.football-data.co.uk/mmz4281/2425/E2.csv"; File = "EL1_2425.csv" },
    # La Liga
    @{ Key = "LL_2627"; League = "LL"; Season = "2026/27"; Url = "https://www.football-data.co.uk/mmz4281/2627/SP1.csv"; File = "LL_2627.csv" },
    @{ Key = "LL_2526"; League = "LL"; Season = "2025/26"; Url = "https://www.football-data.co.uk/mmz4281/2526/SP1.csv"; File = "LL_2526.csv" },
    @{ Key = "LL_2425"; League = "LL"; Season = "2024/25"; Url = "https://www.football-data.co.uk/mmz4281/2425/SP1.csv"; File = "LL_2425.csv" },
    # Serie A
    @{ Key = "SA_2627"; League = "SA"; Season = "2026/27"; Url = "https://www.football-data.co.uk/mmz4281/2627/I1.csv"; File = "SA_2627.csv" },
    @{ Key = "SA_2526"; League = "SA"; Season = "2025/26"; Url = "https://www.football-data.co.uk/mmz4281/2526/I1.csv"; File = "SA_2526.csv" },
    @{ Key = "SA_2425"; League = "SA"; Season = "2024/25"; Url = "https://www.football-data.co.uk/mmz4281/2425/I1.csv"; File = "SA_2425.csv" },
    # Bundesliga
    @{ Key = "BL_2627"; League = "BL"; Season = "2026/27"; Url = "https://www.football-data.co.uk/mmz4281/2627/D1.csv"; File = "BL_2627.csv" },
    @{ Key = "BL_2526"; League = "BL"; Season = "2025/26"; Url = "https://www.football-data.co.uk/mmz4281/2526/D1.csv"; File = "BL_2526.csv" },
    @{ Key = "BL_2425"; League = "BL"; Season = "2024/25"; Url = "https://www.football-data.co.uk/mmz4281/2425/D1.csv"; File = "BL_2425.csv" },
    # Ligue 1
    @{ Key = "L1_2627"; League = "L1"; Season = "2026/27"; Url = "https://www.football-data.co.uk/mmz4281/2627/F1.csv"; File = "L1_2627.csv" },
    @{ Key = "L1_2526"; League = "L1"; Season = "2025/26"; Url = "https://www.football-data.co.uk/mmz4281/2526/F1.csv"; File = "L1_2526.csv" },
    @{ Key = "L1_2425"; League = "L1"; Season = "2024/25"; Url = "https://www.football-data.co.uk/mmz4281/2425/F1.csv"; File = "L1_2425.csv" },
    # Eredivisie
    @{ Key = "ED_2627"; League = "ED"; Season = "2026/27"; Url = "https://www.football-data.co.uk/mmz4281/2627/N1.csv"; File = "ED_2627.csv" },
    @{ Key = "ED_2526"; League = "ED"; Season = "2025/26"; Url = "https://www.football-data.co.uk/mmz4281/2526/N1.csv"; File = "ED_2526.csv" },
    @{ Key = "ED_2425"; League = "ED"; Season = "2024/25"; Url = "https://www.football-data.co.uk/mmz4281/2425/N1.csv"; File = "ED_2425.csv" },
    # 2. Bundesliga
    @{ Key = "BL2_2627"; League = "BL2"; Season = "2026/27"; Url = "https://www.football-data.co.uk/mmz4281/2627/D2.csv"; File = "BL2_2627.csv" },
    @{ Key = "BL2_2526"; League = "BL2"; Season = "2025/26"; Url = "https://www.football-data.co.uk/mmz4281/2526/D2.csv"; File = "BL2_2526.csv" },
    @{ Key = "BL2_2425"; League = "BL2"; Season = "2024/25"; Url = "https://www.football-data.co.uk/mmz4281/2425/D2.csv"; File = "BL2_2425.csv" },
    # Serie B
    @{ Key = "LL2_2627"; League = "LL2"; Season = "2026/27"; Url = "https://www.football-data.co.uk/mmz4281/2627/SP2.csv"; File = "LL2_2627.csv" },
    @{ Key = "LL2_2526"; League = "LL2"; Season = "2025/26"; Url = "https://www.football-data.co.uk/mmz4281/2526/SP2.csv"; File = "LL2_2526.csv" },
    @{ Key = "LL2_2425"; League = "LL2"; Season = "2024/25"; Url = "https://www.football-data.co.uk/mmz4281/2425/SP2.csv"; File = "LL2_2425.csv" },
    @{ Key = "SB_2627"; League = "SB"; Season = "2026/27"; Url = "https://www.football-data.co.uk/mmz4281/2627/I2.csv"; File = "SB_2627.csv" },
    @{ Key = "SB_2526"; League = "SB"; Season = "2025/26"; Url = "https://www.football-data.co.uk/mmz4281/2526/I2.csv"; File = "SB_2526.csv" },
    @{ Key = "SB_2425"; League = "SB"; Season = "2024/25"; Url = "https://www.football-data.co.uk/mmz4281/2425/I2.csv"; File = "SB_2425.csv" },
    # Portugal
    @{ Key = "PT_2627"; League = "PT"; Season = "2026/27"; Url = "https://www.football-data.co.uk/mmz4281/2627/P1.csv"; File = "PT_2627.csv" },
    @{ Key = "PT_2526"; League = "PT"; Season = "2025/26"; Url = "https://www.football-data.co.uk/mmz4281/2526/P1.csv"; File = "PT_2526.csv" },
    @{ Key = "PT_2425"; League = "PT"; Season = "2024/25"; Url = "https://www.football-data.co.uk/mmz4281/2425/P1.csv"; File = "PT_2425.csv" },
    # Grekland
    @{ Key = "GR_2627"; League = "GR"; Season = "2026/27"; Url = "https://www.football-data.co.uk/mmz4281/2627/G1.csv"; File = "GR_2627.csv" },
    @{ Key = "GR_2526"; League = "GR"; Season = "2025/26"; Url = "https://www.football-data.co.uk/mmz4281/2526/G1.csv"; File = "GR_2526.csv" },
    @{ Key = "GR_2425"; League = "GR"; Season = "2024/25"; Url = "https://www.football-data.co.uk/mmz4281/2425/G1.csv"; File = "GR_2425.csv" }
)

function Get-Num($v) {
    if ($null -eq $v -or $v -eq "") { return $null }
    $n = 0.0
    if ([double]::TryParse([string]$v, [System.Globalization.NumberStyles]::Any, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$n)) {
        return $n
    }
    return $null
}

function Parse-Date($d) {
    # dd/MM/yyyy
    try { return [datetime]::ParseExact($d, "dd/MM/yyyy", [System.Globalization.CultureInfo]::InvariantCulture) }
    catch { return $null }
}

if (-not $SkipDownload) {
    Write-Host "Hämtar CSV från football-data.co.uk..."
    foreach ($s in $Sources) {
        $path = Join-Path $RawDir $s.File
        try {
            Invoke-WebRequest -Uri $s.Url -OutFile $path -UseBasicParsing -TimeoutSec 60
            Write-Host "  OK $($s.File) ($((Get-Item $path).Length) bytes)"
        }
        catch {
            Write-Host "  SKIP $($s.File): $($_.Exception.Message)"
        }
    }
}

$matches = New-Object System.Collections.Generic.List[object]

foreach ($s in $Sources) {
    $path = Join-Path $RawDir $s.File
    if (-not (Test-Path $path)) { continue }
    $rows = Import-Csv $path
    foreach ($r in $rows) {
        $hg = Get-Num $r.FTHG
        $ag = Get-Num $r.FTAG
        if ($null -eq $hg -or $null -eq $ag) { continue }
        $total = [int]$hg + [int]$ag
        $btts = ($hg -gt 0 -and $ag -gt 0)
        $ftr = $r.FTR
        $dt = Parse-Date $r.Date
        $matches.Add([ordered]@{
            id          = "$($s.League)_$($r.Date)_$($r.HomeTeam)_$($r.AwayTeam)"
            league      = $s.League
            season      = $s.Season
            date        = if ($dt) { $dt.ToString("yyyy-MM-dd") } else { $r.Date }
            dateSort    = if ($dt) { $dt } else { [datetime]::MinValue }
            home        = $r.HomeTeam
            away        = $r.AwayTeam
            hg          = [int]$hg
            ag          = [int]$ag
            result      = $ftr   # H/D/A
            totalGoals  = $total
            over25      = $total -gt 2.5
            btts        = [bool]$btts
            odds = @{
                home = Get-Num $r.AvgH
                draw = Get-Num $r.AvgD
                away = Get-Num $r.AvgA
                over25 = Get-Num $r.'Avg>2.5'
                under25 = Get-Num $r.'Avg<2.5'
                b365_home = Get-Num $r.B365H
                b365_draw = Get-Num $r.B365D
                b365_away = Get-Num $r.B365A
                b365_over25 = Get-Num $r.'B365>2.5'
                b365_under25 = Get-Num $r.'B365<2.5'
                pinnacle_home = Get-Num $r.PSH
                pinnacle_draw = Get-Num $r.PSD
                pinnacle_away = Get-Num $r.PSA
                pinnacle_over25 = Get-Num $r.'P>2.5'
                pinnacle_under25 = Get-Num $r.'P<2.5'
                max_home = Get-Num $r.MaxH
                max_draw = Get-Num $r.MaxD
                max_away = Get-Num $r.MaxA
                max_over25 = Get-Num $r.'Max>2.5'
                max_under25 = Get-Num $r.'Max<2.5'
            }
            # Closing odds (sista odds fore avspark) - facit for CLV
            closing = @{
                pinnacle_home = Get-Num $r.PSCH
                pinnacle_draw = Get-Num $r.PSCD
                pinnacle_away = Get-Num $r.PSCA
                pinnacle_over25 = Get-Num $r.'PC>2.5'
                pinnacle_under25 = Get-Num $r.'PC<2.5'
                bfe_home = Get-Num $r.BFECH
                bfe_draw = Get-Num $r.BFECD
                bfe_away = Get-Num $r.BFECA
                avg_home = Get-Num $r.AvgCH
                avg_draw = Get-Num $r.AvgCD
                avg_away = Get-Num $r.AvgCA
                avg_over25 = Get-Num $r.'AvgC>2.5'
                avg_under25 = Get-Num $r.'AvgC<2.5'
            }
            kickoff     = $r.Time
            referee     = $(if ($r.Referee) { [string]$r.Referee } else { $null })
            discipline = @{
                homeYellow = Get-Num $r.HY
                awayYellow = Get-Num $r.AY
                homeRed = Get-Num $r.HR
                awayRed = Get-Num $r.AR
                homeFouls = Get-Num $r.HF
                awayFouls = Get-Num $r.AF
                homeCorners = Get-Num $r.HC
                awayCorners = Get-Num $r.AC
            }
            shots = @{
                home = Get-Num $r.HS
                away = Get-Num $r.AS
                homeSot = Get-Num $r.HST
                awaySot = Get-Num $r.AST
            }
        }) | Out-Null
    }
}

# --- football-data "new"-format (BR, AS, NO, DK): scripts/fetch-extra-leagues.mjs -> data/raw/<LIGA>_all.csv ---
# Sasong "2026" (kalenderar) eller "2026/2027" -> "2026/27", sa att samma innevarande-sasongslogik som i Europa galler.
# Bara 2024 och senare lases in.
function Get-SeasonLabel([string]$s) {
    if ($s -match '^(\d{4})[/-](\d{4})$') { $y = [int]$Matches[1] }
    elseif ($s -match '^(\d{4})$') { $y = [int]$Matches[1] }
    else { return $null }
    if ($y -lt 2024) { return $null }
    return "$y/$((($y + 1) % 100).ToString('00'))"
}
foreach ($newLeague in $FdNewLeagues) {
  $brPath = Join-Path $RawDir "$($newLeague)_all.csv"
  if (-not (Test-Path $brPath)) { continue }
    $brCount = 0
    foreach ($r in (Import-Csv $brPath -Encoding UTF8)) {
        $seasonLabel = Get-SeasonLabel ([string]$r.Season)
        if (-not $seasonLabel) { continue }
        $hg = Get-Num $r.HG
        $ag = Get-Num $r.AG
        if ($null -eq $hg -or $null -eq $ag) { continue }
        $dt = Parse-Date $r.Date
        $total = [int]$hg + [int]$ag
        $matches.Add([ordered]@{
            id          = "$($newLeague)_$($r.Date)_$($r.Home)_$($r.Away)"
            league      = $newLeague
            season      = $seasonLabel
            date        = if ($dt) { $dt.ToString("yyyy-MM-dd") } else { $r.Date }
            dateSort    = if ($dt) { $dt } else { [datetime]::MinValue }
            home        = $r.Home
            away        = $r.Away
            hg          = [int]$hg
            ag          = [int]$ag
            result      = $r.Res
            totalGoals  = $total
            over25      = $total -gt 2.5
            btts        = ($hg -gt 0 -and $ag -gt 0)
            # Bara closing odds finns i detta format (ingen oppning, ingen O/U, inga skott)
            odds = @{}
            closing = @{
                pinnacle_home = Get-Num $r.PSCH; pinnacle_draw = Get-Num $r.PSCD; pinnacle_away = Get-Num $r.PSCA
                bfe_home = Get-Num $r.BFECH; bfe_draw = Get-Num $r.BFECD; bfe_away = Get-Num $r.BFECA
                avg_home = Get-Num $r.AvgCH; avg_draw = Get-Num $r.AvgCD; avg_away = Get-Num $r.AvgCA
                max_home = Get-Num $r.MaxCH; max_draw = Get-Num $r.MaxCD; max_away = Get-Num $r.MaxCA
                b365_home = Get-Num $r.B365CH; b365_draw = Get-Num $r.B365CD; b365_away = Get-Num $r.B365CA
            }
            kickoff     = $r.Time
            referee     = $null
            discipline  = @{}
            shots       = @{ home = $null; away = $null; homeSot = $null; awaySot = $null }
        }) | Out-Null
        $brCount++
    }
    Write-Host "$($newLeague): $brCount matcher (sedan 2024, football-data)"
}

# --- Ligor med resultat fran ESPN (BR2) eller TheSportsDB (HR): data/raw/ESPN_<LIGA>.json fran fetch-extra-leagues.mjs ---
foreach ($espnFile in (Get-ChildItem $RawDir -Filter "ESPN_*.json" -ErrorAction SilentlyContinue)) {
    $doc = ([System.IO.File]::ReadAllText($espnFile.FullName)).TrimStart([char]0xFEFF) | ConvertFrom-Json
    $n = 0
    foreach ($r in @($doc.matches)) {
        $label = Get-SeasonLabel ([string]$r.season)
        if (-not $label) { continue }
        $dt = [datetime]::ParseExact($r.date, "yyyy-MM-dd", [System.Globalization.CultureInfo]::InvariantCulture)
        $total = [int]$r.hg + [int]$r.ag
        $matches.Add([ordered]@{
            id = "$($doc.league)_$($r.date)_$($r.home)_$($r.away)"; league = [string]$doc.league; season = $label
            date = $r.date; dateSort = $dt; home = $r.home; away = $r.away; hg = [int]$r.hg; ag = [int]$r.ag
            result = $(if ($r.hg -gt $r.ag) { "H" } elseif ($r.hg -lt $r.ag) { "A" } else { "D" })
            totalGoals = $total; over25 = $total -gt 2.5; btts = ($r.hg -gt 0 -and $r.ag -gt 0)
            odds = @{}; closing = @{}; kickoff = $null; referee = $null; discipline = @{}
            shots = @{ home = $r.shotsHome; away = $r.shotsAway; homeSot = $r.sotHome; awaySot = $r.sotAway }
        }) | Out-Null
        $n++
    }
    Write-Host "$($doc.league): $n matcher ($(if ($doc.source) { $doc.source } else { 'ESPN' }))"
}

# Samma lag med olika stavning i olika kallor/sasonger -> ett namn (config/team-aliases.json, scripts/lib/team-aliases.mjs)
$TeamAliases = $null
$aliasPath = Join-Path $Root "config/team-aliases.json"
if (Test-Path $aliasPath) { $TeamAliases = ([System.IO.File]::ReadAllText($aliasPath)).TrimStart([char]0xFEFF) | ConvertFrom-Json }
function Get-CanonTeam([string]$league, [string]$name) {
    if (-not $TeamAliases -or -not $name) { return $name }
    $lg = $TeamAliases.leagues.PSObject.Properties[$league]
    if (-not $lg) { return $name }
    # Exakt (skiftlageskanslig) traff pa varianten
    foreach ($p in $lg.Value.PSObject.Properties) { if ($p.Name -ceq $name) { return [string]$p.Value } }
    return $name
}
$renamed = 0
foreach ($m in $matches) {
    $h = Get-CanonTeam $m.league $m.home; $a = Get-CanonTeam $m.league $m.away
    if ($h -cne $m.home -or $a -cne $m.away) {
        $m.home = $h; $m.away = $a
        $m.id = "$($m.league)_$($m.date)_$($h)_$($a)"
        $renamed++
    }
}
if ($renamed) { Write-Host "Lagnamn: $renamed matcher fick enhetligt lagnamn (config/team-aliases.json)" }
$sorted = $matches | Sort-Object { $_.dateSort }

function New-TeamBag {
    return [ordered]@{
        played = 0; wins = 0; draws = 0; losses = 0
        gf = 0; ga = 0
        btts = 0; over25 = 0
        homePlayed = 0; homeWins = 0; homeBtts = 0; homeOver25 = 0; homeGf = 0; homeGa = 0
        awayPlayed = 0; awayWins = 0; awayBtts = 0; awayOver25 = 0; awayGf = 0; awayGa = 0
        # Horn (fran football-data HC/AC nar tillgangligt)
        cornersPlayed = 0; cornersFor = 0; cornersAgainst = 0
        cornersOver85 = 0; cornersOver95 = 0; cornersOver105 = 0
        homeCornersPlayed = 0; homeCornersFor = 0; homeCornersAgainst = 0
        awayCornersPlayed = 0; awayCornersFor = 0; awayCornersAgainst = 0
        recent = New-Object System.Collections.Generic.List[string]
    }
}

# Team stats per league for current season 2026/27 primarily, with fallback blend
$teamStats = @{}  # key = "PL|Arsenal"

function Ensure-Team($league, $name) {
    $k = "$league|$name"
    if (-not $teamStats.ContainsKey($k)) {
        $teamStats[$k] = [ordered]@{
            league = $league
            name = $name
            season2627 = (New-TeamBag)
            last10 = New-Object System.Collections.Generic.List[object]
        }
    }
    return $teamStats[$k]
}

foreach ($m in $sorted) {
    $homeT = Ensure-Team $m.league $m.home
    $awayT = Ensure-Team $m.league $m.away

    $homeEntry = [ordered]@{ date = $m.date; opp = $m.away; gf = $m.hg; ga = $m.ag; result = $m.result; venue = "H"; btts = $m.btts; over25 = $m.over25; cornersFor = $null; cornersAgainst = $null }
    $awayResult = if ($m.result -eq "H") { "A" } elseif ($m.result -eq "A") { "H" } else { "D" }
    $awayEntry = [ordered]@{ date = $m.date; opp = $m.home; gf = $m.ag; ga = $m.hg; result = $awayResult; venue = "A"; btts = $m.btts; over25 = $m.over25; cornersFor = $null; cornersAgainst = $null }
    $hc = $null; $ac = $null
    if ($m.discipline -and $null -ne $m.discipline.homeCorners -and $null -ne $m.discipline.awayCorners) {
        $hc = [int]$m.discipline.homeCorners
        $ac = [int]$m.discipline.awayCorners
        $homeEntry.cornersFor = $hc; $homeEntry.cornersAgainst = $ac
        $awayEntry.cornersFor = $ac; $awayEntry.cornersAgainst = $hc
    }

    $homeT.last10.Add($homeEntry)
    $awayT.last10.Add($awayEntry)
    while ($homeT.last10.Count -gt 10) { $homeT.last10.RemoveAt(0) }
    while ($awayT.last10.Count -gt 10) { $awayT.last10.RemoveAt(0) }

    if ($m.season -ne "2026/27") { continue }

    foreach ($side in @("home", "away")) {
        $t = if ($side -eq "home") { $homeT.season2627 } else { $awayT.season2627 }
        $gf = if ($side -eq "home") { $m.hg } else { $m.ag }
        $ga = if ($side -eq "home") { $m.ag } else { $m.hg }
        $win = ($side -eq "home" -and $m.result -eq "H") -or ($side -eq "away" -and $m.result -eq "A")
        $draw = $m.result -eq "D"
        $t.played++
        $t.gf += $gf
        $t.ga += $ga
        if ($win) { $t.wins++ } elseif ($draw) { $t.draws++ } else { $t.losses++ }
        if ($m.btts) { $t.btts++ }
        if ($m.over25) { $t.over25++ }
        $t.recent.Add($(if ($win) { "W" } elseif ($draw) { "D" } else { "L" }))
        while ($t.recent.Count -gt 10) { $t.recent.RemoveAt(0) }

        if ($side -eq "home") {
            $t.homePlayed++; $t.homeGf += $gf; $t.homeGa += $ga
            if ($win) { $t.homeWins++ }
            if ($m.btts) { $t.homeBtts++ }
            if ($m.over25) { $t.homeOver25++ }
        } else {
            $t.awayPlayed++; $t.awayGf += $gf; $t.awayGa += $ga
            if ($win) { $t.awayWins++ }
            if ($m.btts) { $t.awayBtts++ }
            if ($m.over25) { $t.awayOver25++ }
        }

        if ($null -ne $hc -and $null -ne $ac) {
            $cf = if ($side -eq "home") { $hc } else { $ac }
            $ca = if ($side -eq "home") { $ac } else { $hc }
            $totC = $hc + $ac
            $t.cornersPlayed++
            $t.cornersFor += $cf
            $t.cornersAgainst += $ca
            if ($totC -gt 8.5) { $t.cornersOver85++ }
            if ($totC -gt 9.5) { $t.cornersOver95++ }
            if ($totC -gt 10.5) { $t.cornersOver105++ }
            if ($side -eq "home") {
                $t.homeCornersPlayed++; $t.homeCornersFor += $cf; $t.homeCornersAgainst += $ca
            } else {
                $t.awayCornersPlayed++; $t.awayCornersFor += $cf; $t.awayCornersAgainst += $ca
            }
        }
    }
}

# --- Elo ratings (all seasons chronological) + shot-based xG proxy (2026/27) ---
$elo = @{}  # key league|name -> rating
$shotAgg = @{} # key -> shots for/against, sot
$preMatchElo = @{} # match id -> @(homeElo, awayElo) fore matchen
function Elo-Ensure($league, $name) {
    $k = "$league|$name"
    if (-not $elo.ContainsKey($k)) { $elo[$k] = 1500.0 }
    return $k
}
foreach ($m in $sorted) {
    $hk = Elo-Ensure $m.league $m.home
    $ak = Elo-Ensure $m.league $m.away
    $rH = [double]$elo[$hk]; $rA = [double]$elo[$ak]
    # Elo fore matchen - backtestet far inte se framtiden (tidigare anvandes slutlig Elo/dagens ClubElo)
    $preMatchElo[[string]$m.id] = @($rH, $rA)
    $expH =1.0 / (1.0 + [math]::Pow(10.0, (($rA - ($rH + 65.0)) / 400.0)))
    $expA = 1.0 - $expH
    $scoreH = if ($m.result -eq "H") { 1.0 } elseif ($m.result -eq "D") { 0.5 } else { 0.0 }
    $scoreA = 1.0 - $scoreH
    $kFactor = 20.0
    $elo[$hk] = $rH + $kFactor * ($scoreH - $expH)
    $elo[$ak] = $rA + $kFactor * ($scoreA - $expA)

    # Bara matcher med skottdata - ligor utan skott i CSV (MLS, BR, JP, NO ...) fick annars ett xG-proxy = 0
    $hasShots = $m.shots -and $null -ne $m.shots.home -and $null -ne $m.shots.away
    if ($m.season -eq "2026/27" -and $hasShots) {
        foreach ($side in @("H", "A")) {
            $name = if ($side -eq "H") { $m.home } else { $m.away }
            $sk = "$($m.league)|$name"
            if (-not $shotAgg.ContainsKey($sk)) {
                $shotAgg[$sk] = [ordered]@{ played = 0; shotsFor = 0; shotsAgainst = 0; sotFor = 0; sotAgainst = 0; goalsFor = 0; goalsAgainst = 0 }
            }
            $s = $shotAgg[$sk]
            $s.played++
            if ($side -eq "H") {
                if ($null -ne $m.shots.home) { $s.shotsFor += [double]$m.shots.home }
                if ($null -ne $m.shots.away) { $s.shotsAgainst += [double]$m.shots.away }
                if ($null -ne $m.shots.homeSot) { $s.sotFor += [double]$m.shots.homeSot }
                if ($null -ne $m.shots.awaySot) { $s.sotAgainst += [double]$m.shots.awaySot }
                $s.goalsFor += $m.hg; $s.goalsAgainst += $m.ag
            } else {
                if ($null -ne $m.shots.away) { $s.shotsFor += [double]$m.shots.away }
                if ($null -ne $m.shots.home) { $s.shotsAgainst += [double]$m.shots.home }
                if ($null -ne $m.shots.awaySot) { $s.sotFor += [double]$m.shots.awaySot }
                if ($null -ne $m.shots.homeSot) { $s.sotAgainst += [double]$m.shots.homeSot }
                $s.goalsFor += $m.ag; $s.goalsAgainst += $m.hg
            }
        }
    }
}

function Rate($num, $den) {
    $n = [double](0)
    $d = [double](0)
    try { $n = [double]$num } catch { $n = 0 }
    try { $d = [double]$den } catch { $d = 0 }
    if ($d -le 0) { return [double]0 }
    return [math]::Round($n / $d, 4)
}

function Get-FactN([int]$n) {
    if ($n -le 1) { return 1.0 }
    $r = 1.0
    for ($i = 2; $i -le $n; $i++) { $r *= $i }
    return $r
}
function Get-PoissonP([double]$l, [int]$k) {
    if ($l -lt 0) { $l = 0 }
    return [math]::Exp(-$l) * [math]::Pow($l, $k) / (Get-FactN $k)
}
function Get-PoissonOverHalf([double]$expTotal, [double]$line) {
    # P(X > line) for X~Poisson, line half-integer (8.5/9.5/10.5)
    $maxK = [int][math]::Floor($line)
    $cdf = 0.0
    for ($k = 0; $k -le $maxK; $k++) { $cdf += (Get-PoissonP $expTotal $k) }
    return [math]::Min(0.92, [math]::Max(0.08, 1.0 - $cdf))
}

$teamsOut = New-Object System.Collections.Generic.List[object]
foreach ($k in ($teamStats.Keys | Sort-Object)) {
    $t = $teamStats[$k]
    $s = $t.season2627
    try {
        $entry = [ordered]@{}
        $entry["key"] = [string]$k
        $entry["league"] = [string]$t.league
        $entry["name"] = [string]$t.name
        $entry["form"] = [string]($s.recent -join "")
        $entry["played"] = [int]$s.played
        $entry["ppg"] = (Rate (($s.wins * 3) + $s.draws) $s.played)
        $entry["winRate"] = (Rate $s.wins $s.played)
        $entry["bttsRate"] = (Rate $s.btts $s.played)
        $entry["over25Rate"] = (Rate $s.over25 $s.played)
        $entry["gfPg"] = (Rate $s.gf $s.played)
        $entry["gaPg"] = (Rate $s.ga $s.played)
        $entry["home"] = @{
            played = [int]$s.homePlayed
            winRate = (Rate $s.homeWins $s.homePlayed)
            bttsRate = (Rate $s.homeBtts $s.homePlayed)
            over25Rate = (Rate $s.homeOver25 $s.homePlayed)
            gfPg = (Rate $s.homeGf $s.homePlayed)
            gaPg = (Rate $s.homeGa $s.homePlayed)
            cornersForPg = (Rate $s.homeCornersFor $s.homeCornersPlayed)
            cornersAgainstPg = (Rate $s.homeCornersAgainst $s.homeCornersPlayed)
        }
        $entry["away"] = @{
            played = [int]$s.awayPlayed
            winRate = (Rate $s.awayWins $s.awayPlayed)
            bttsRate = (Rate $s.awayBtts $s.awayPlayed)
            over25Rate = (Rate $s.awayOver25 $s.awayPlayed)
            gfPg = (Rate $s.awayGf $s.awayPlayed)
            gaPg = (Rate $s.awayGa $s.awayPlayed)
            cornersForPg = (Rate $s.awayCornersFor $s.awayCornersPlayed)
            cornersAgainstPg = (Rate $s.awayCornersAgainst $s.awayCornersPlayed)
        }
        $entry["corners"] = @{
            played = [int]$s.cornersPlayed
            forPg = (Rate $s.cornersFor $s.cornersPlayed)
            againstPg = (Rate $s.cornersAgainst $s.cornersPlayed)
            totalPg = (Rate ($s.cornersFor + $s.cornersAgainst) $s.cornersPlayed)
            over85Rate = (Rate $s.cornersOver85 $s.cornersPlayed)
            over95Rate = (Rate $s.cornersOver95 $s.cornersPlayed)
            over105Rate = (Rate $s.cornersOver105 $s.cornersPlayed)
            home = @{
                played = [int]$s.homeCornersPlayed
                forPg = (Rate $s.homeCornersFor $s.homeCornersPlayed)
                againstPg = (Rate $s.homeCornersAgainst $s.homeCornersPlayed)
            }
            away = @{
                played = [int]$s.awayCornersPlayed
                forPg = (Rate $s.awayCornersFor $s.awayCornersPlayed)
                againstPg = (Rate $s.awayCornersAgainst $s.awayCornersPlayed)
            }
        }
        $entry["last10"] = @($t.last10 | ForEach-Object {
            [ordered]@{
                date = $_.date; opp = $_.opp; gf = $_.gf; ga = $_.ga
                result = $_.result; venue = $_.venue; btts = [bool]$_.btts; over25 = [bool]$_.over25
                cornersFor = $_.cornersFor; cornersAgainst = $_.cornersAgainst
            }
        })
        $teamsOut.Add($entry) | Out-Null
    } catch {
        Write-Host "FAIL team $k : $($_.Exception.Message)"
        throw
    }
}
# Behåll som array via ToArray (undvik @() på List[OrderedDictionary])
$teamsOut = $teamsOut.ToArray()

# --- Understat xG merge (EPL only) ---
$xgByName = @{}
$xgMeta = [ordered]@{ loaded = $false; season = $null; teams = 0; source = "understat getLeagueData" }
$xgPath = Join-Path $Root "data/open/understat_EPL_2026_xg.json"
if (-not (Test-Path $xgPath)) { $xgPath = Join-Path $Root "data/open/understat_EPL_2025_xg.json" }
if (Test-Path $xgPath) {
    try {
        $xgDoc = ([System.IO.File]::ReadAllText($xgPath)).TrimStart([char]0xFEFF) | ConvertFrom-Json
        foreach ($xt in @($xgDoc.teams)) {
            $xgByName[[string]$xt.name] = $xt
        }
        $xgMeta.loaded = $true
        $xgMeta.season = $xgDoc.seasonLabel
        $xgMeta.teams = @($xgDoc.teams).Count
        Write-Host "Understat xG loaded: $($xgMeta.teams) teams ($($xgMeta.season))"
    } catch {
        Write-Host "Understat xG load failed: $($_.Exception.Message)"
    }
}

$teamsMerged = New-Object System.Collections.Generic.List[object]
foreach ($t in $teamsOut) {
    $copy = [ordered]@{}
    foreach ($p in $t.Keys) { $copy[$p] = $t[$p] }
    if ($t.league -eq "PL" -and $xgByName.ContainsKey([string]$t.name)) {
        $x = $xgByName[[string]$t.name]
        $copy["xg"] = [ordered]@{
            xGpg = $x.xGpg
            xGApg = $x.xGApg
            homeXGpg = $x.home.xGpg
            homeXGApg = $x.home.xGApg
            awayXGpg = $x.away.xGpg
            awayXGApg = $x.away.xGApg
            source = "understat"
            season = $xgMeta.season
        }
    }
    $teamsMerged.Add($copy) | Out-Null
}
$teamsOut = $teamsMerged.ToArray()

# --- bolldata.se xG (Allsvenskan): tests/bolldata.spec.ts -> data/open/bolldata_allsvenskan.json ---
# Riktig xG/xGA per lag i stallet for skott-proxyn. Namn: "IFK Göteborg" ~ "Goteborg", "Djurgården" ~ "Djurgarden".
function Get-PlainName([string]$s) {
    $d = $s.Normalize([Text.NormalizationForm]::FormD)
    $plain = -join ($d.ToCharArray() | Where-Object { [Globalization.CharUnicodeInfo]::GetUnicodeCategory($_) -ne 'NonSpacingMark' })
    return ($plain.ToLowerInvariant() -replace '[^a-z0-9]', '')
}
$bdPath = Join-Path $Root "data/open/bolldata_allsvenskan.json"
$bolldataMeta = [ordered]@{ loaded = $false; teams = 0; source = "bolldata.se" }
if (Test-Path $bdPath) {
    try {
        $bd = ([System.IO.File]::ReadAllText($bdPath)).TrimStart([char]0xFEFF) | ConvertFrom-Json
        $bdTeams = @()
        foreach ($bt in @($bd.teams)) {
            $st = $bt.stats.PSObject.Properties
            $sm = $st['ALLSVENSKA TABELLEN (xP) | SM'].Value
            $bxg = $st['ALLSVENSKA TABELLEN (xP) | xG'].Value
            $bxga = $st['ALLSVENSKA TABELLEN (xP) | xGA'].Value
            if ($sm -and $null -ne $bxg -and $null -ne $bxga) {
                $bdTeams += @{ key = (Get-PlainName $bt.name); xGpg = [double]$bxg / [double]$sm; xGApg = [double]$bxga / [double]$sm }
            }
        }
        $teamsBd = New-Object System.Collections.Generic.List[object]
        foreach ($t in $teamsOut) {
            $copy = [ordered]@{}
            foreach ($p in $t.Keys) { $copy[$p] = $t[$p] }
            if ($t.league -eq "AS" -and -not $copy["xg"]) {
                $plain = Get-PlainName $t.name
                $hit = $bdTeams | Where-Object { $_.key -eq $plain } | Select-Object -First 1
                if (-not $hit) { $hit = $bdTeams | Where-Object { $_.key.EndsWith($plain) -or $plain.EndsWith($_.key) } | Select-Object -First 1 }
                if ($hit) {
                    # Hemma/borta saknas i bolldatas xG-tabell -> samma hemmafordelsskalning som skott-proxyn
                    $copy["xg"] = [ordered]@{
                        xGpg = [math]::Round($hit.xGpg, 3); xGApg = [math]::Round($hit.xGApg, 3)
                        homeXGpg = [math]::Round($hit.xGpg * 1.08, 3); homeXGApg = [math]::Round($hit.xGApg * 0.95, 3)
                        awayXGpg = [math]::Round($hit.xGpg * 0.92, 3); awayXGApg = [math]::Round($hit.xGApg * 1.05, 3)
                        source = "bolldata"; season = "2026/27"
                    }
                    $bolldataMeta.teams++
                }
            }
            $teamsBd.Add($copy) | Out-Null
        }
        $teamsOut = $teamsBd.ToArray()
        $bolldataMeta.loaded = $true
        Write-Host "bolldata xG (Allsvenskan): $($bolldataMeta.teams) lag"
    } catch {
        Write-Host "bolldata load failed: $($_.Exception.Message)"
    }
}

# --- FPL availability merge (PL only) ---
$fplByTeam = @{}
$fplMeta = [ordered]@{ loaded = $false; keyOuts = 0; teams = 0; source = "FPL bootstrap-static" }
$fplPath = Join-Path $Root "data/open/fpl_availability.json"
if (Test-Path $fplPath) {
    try {
        $fplDoc = ([System.IO.File]::ReadAllText($fplPath)).TrimStart([char]0xFEFF) | ConvertFrom-Json
        foreach ($ft in @($fplDoc.teams)) { $fplByTeam[[string]$ft.name] = $ft }
        $fplMeta.loaded = $true
        $fplMeta.teams = @($fplDoc.teams).Count
        $fplMeta.keyOuts = @($fplDoc.keyOuts).Count
        Write-Host "FPL availability loaded: $($fplMeta.teams) teams, keyOuts=$($fplMeta.keyOuts)"
    } catch {
        Write-Host "FPL load failed: $($_.Exception.Message)"
    }
}

$teamsWithAvail = New-Object System.Collections.Generic.List[object]
foreach ($t in $teamsOut) {
    $copy = [ordered]@{}
    foreach ($p in $t.Keys) { $copy[$p] = $t[$p] }
    if ($t.league -eq "PL" -and $fplByTeam.ContainsKey([string]$t.name)) {
        $fa = $fplByTeam[[string]$t.name]
        $copy["availability"] = [ordered]@{
            playerCount = $fa.playerCount
            missingCount = $fa.missingCount
            keyMissing = @($fa.keyMissing)
            flags = @($fa.availabilityFlags | Select-Object -First 12)
            source = "FPL"
        }
    }
    $teamsWithAvail.Add($copy) | Out-Null
}
$teamsOut = $teamsWithAvail.ToArray()

# --- Player-attack index (fran Understat-spelare per lag) ---
$playerAttackByKey = @{}  # "PL|Arsenal" -> attack row
$playerAttackMeta = [ordered]@{ loaded = $false; teams = 0; source = "team_player_attack.json" }
$paPath = Join-Path $Root "data/open/team_player_attack.json"
# Understat/CSV namnmappning
$paNameMap = @{
    # England
    "Manchester City" = "Man City"; "Manchester United" = "Man United"
    "Newcastle United" = "Newcastle"; "Tottenham" = "Tottenham"
    "Nottingham Forest" = "Nott'm Forest"; "Wolverhampton Wanderers" = "Wolves"
    "West Ham" = "West Ham"; "Brighton" = "Brighton"; "Aston Villa" = "Aston Villa"
    "Crystal Palace" = "Crystal Palace"; "Leicester" = "Leicester"; "Ipswich" = "Ipswich"
    "Leeds" = "Leeds"; "Southampton" = "Southampton"; "Burnley" = "Burnley"
    "Sunderland" = "Sunderland"; "Bournemouth" = "Bournemouth"; "Brentford" = "Brentford"
    "Chelsea" = "Chelsea"; "Arsenal" = "Arsenal"; "Liverpool" = "Liverpool"
    "Everton" = "Everton"; "Fulham" = "Fulham"
    # La Liga (Understat -> football-data)
    "Athletic Club" = "Ath Bilbao"; "Atletico Madrid" = "Ath Madrid"
    "Espanyol" = "Espanol"; "Deportivo La Coruna" = "La Coruna"
    "Celta Vigo" = "Celta"; "Real Betis" = "Betis"; "Real Sociedad" = "Sociedad"
    "Rayo Vallecano" = "Vallecano"; "Racing Santander" = "Santander"
    "Barcelona" = "Barcelona"; "Real Madrid" = "Real Madrid"; "Sevilla" = "Sevilla"
    "Valencia" = "Valencia"; "Villarreal" = "Villarreal"; "Getafe" = "Getafe"
    "Osasuna" = "Osasuna"; "Alaves" = "Alaves"; "Elche" = "Elche"
    "Levante" = "Levante"; "Malaga" = "Malaga"
    # Serie A
    "Inter" = "Inter"; "AC Milan" = "Milan"; "Milan" = "Milan"; "Juventus" = "Juventus"
    "Napoli" = "Napoli"; "Roma" = "Roma"; "Lazio" = "Lazio"; "Atalanta" = "Atalanta"
    "Fiorentina" = "Fiorentina"; "Bologna" = "Bologna"; "Torino" = "Torino"
    "Udinese" = "Udinese"; "Genoa" = "Genoa"; "Cagliari" = "Cagliari"
    "Sassuolo" = "Sassuolo"; "Lecce" = "Lecce"; "Parma" = "Parma"
    "Como" = "Como"; "Monza" = "Monza"; "Venezia" = "Venezia"; "Frosinone" = "Frosinone"
    # Bundesliga
    "Bayern Munich" = "Bayern Munich"; "Borussia Dortmund" = "Dortmund"; "Dortmund" = "Dortmund"
    "Bayer Leverkusen" = "Leverkusen"; "Leverkusen" = "Leverkusen"
    "RB Leipzig" = "RB Leipzig"; "Eintracht Frankfurt" = "Ein Frankfurt"
    "Borussia M.Gladbach" = "M'gladbach"; "Wolfsburg" = "Wolfsburg"
    "Hoffenheim" = "Hoffenheim"; "Freiburg" = "Freiburg"; "Mainz" = "Mainz"
    "Augsburg" = "Augsburg"; "Stuttgart" = "Stuttgart"; "Union Berlin" = "Union Berlin"
    "Werder Bremen" = "Werder Bremen"; "FC Cologne" = "FC Koln"; "Koln" = "FC Koln"
    "Hamburg" = "Hamburg"; "Schalke 04" = "Schalke 04"; "Heidenheim" = "Heidenheim"
    "Bochum" = "Bochum"; "Darmstadt" = "Darmstadt"; "St Pauli" = "St Pauli"
    "Holstein Kiel" = "Holstein Kiel"; "Elversberg" = "Elversberg"; "Paderborn" = "Paderborn"
    # Ligue 1
    "Paris Saint Germain" = "Paris SG"; "PSG" = "Paris SG"; "Paris SG" = "Paris SG"
    "Marseille" = "Marseille"; "Lyon" = "Lyon"; "Monaco" = "Monaco"; "Lille" = "Lille"
    "Nice" = "Nice"; "Rennes" = "Rennes"; "Lens" = "Lens"; "Strasbourg" = "Strasbourg"
    "Nantes" = "Nantes"; "Toulouse" = "Toulouse"; "Brest" = "Brest"; "Reims" = "Reims"
    "Montpellier" = "Montpellier"; "Angers" = "Angers"; "Auxerre" = "Auxerre"
    "Le Havre" = "Le Havre"; "Lorient" = "Lorient"; "Paris FC" = "Paris FC"
    "Troyes" = "Troyes"; "Le Mans" = "Le Mans"
    # Eredivisie
    "Ajax" = "Ajax"; "PSV" = "PSV Eindhoven"; "PSV Eindhoven" = "PSV Eindhoven"
    "Feyenoord" = "Feyenoord"; "AZ" = "AZ Alkmaar"; "AZ Alkmaar" = "AZ Alkmaar"
    "Twente" = "Twente"; "Utrecht" = "Utrecht"; "Heerenveen" = "Heerenveen"
    "Groningen" = "Groningen"; "Sparta Rotterdam" = "Sparta Rotterdam"
    "Go Ahead Eagles" = "Go Ahead Eagles"; "NEC Nijmegen" = "Nijmegen"; "Nijmegen" = "Nijmegen"
    "Fortuna Sittard" = "For Sittard"; "For Sittard" = "For Sittard"
    "Heracles" = "Heracles"; "Zwolle" = "Zwolle"; "Willem II" = "Willem II"
    "Excelsior" = "Excelsior"; "Cambuur" = "Cambuur"; "Den Haag" = "Den Haag"
    "Telstar" = "Telstar"
}
if (Test-Path $paPath) {
    try {
        $paDoc = ([System.IO.File]::ReadAllText($paPath)).TrimStart([char]0xFEFF) | ConvertFrom-Json
        foreach ($row in @($paDoc.teams)) {
            $nm = [string]$row.team
            if ($paNameMap.ContainsKey($nm)) { $nm = $paNameMap[$nm] }
            $playerAttackByKey["$($row.league)|$nm"] = $row
            # aven under originalnamn
            $playerAttackByKey["$($row.league)|$($row.team)"] = $row
        }
        $playerAttackMeta.loaded = $true
        $playerAttackMeta.teams = @($paDoc.teams).Count
        Write-Host "Player-attack loaded: $($playerAttackMeta.teams) teams"
    } catch {
        Write-Host "Player-attack load failed: $($_.Exception.Message)"
    }
}

$teamsWithPa = New-Object System.Collections.Generic.List[object]
foreach ($t in $teamsOut) {
    $copy = [ordered]@{}
    foreach ($p in $t.Keys) { $copy[$p] = $t[$p] }
    $pk = "$($t.league)|$($t.name)"
    if ($playerAttackByKey.ContainsKey($pk)) {
        $pa = $playerAttackByKey[$pk]
        $copy["playerAttack"] = [ordered]@{
            attackIndex = [double]$pa.attackIndex
            createIndex = [double]$pa.createIndex
            attackXg = [double]$pa.attackXg
            attackXa = [double]$pa.attackXa
            keyPasses = [double]$pa.keyPasses
            topCreators = @($pa.topCreators | Select-Object -First 3 | ForEach-Object { $_.name })
            source = "understat-players"
        }
    }
    $teamsWithPa.Add($copy) | Out-Null
}
$teamsOut = $teamsWithPa.ToArray()


# --- ClubElo merge (prefer over internal Elo when available) ---
$clubEloByName = @{}
$clubEloMeta = [ordered]@{ loaded = $false; teams = 0; source = "clubelo.com/ENG" }
$clubEloPath = Join-Path $Root "data/open/clubelo_ratings.json"
if (Test-Path $clubEloPath) {
    try {
        $ceDoc = ([System.IO.File]::ReadAllText($clubEloPath)).TrimStart([char]0xFEFF) | ConvertFrom-Json
        foreach ($ct in @($ceDoc.teams)) { $clubEloByName[[string]$ct.name] = [double]$ct.elo }
        $clubEloMeta.loaded = $true
        $clubEloMeta.teams = @($ceDoc.teams).Count
        Write-Host "ClubElo loaded: $($clubEloMeta.teams) teams"
    } catch {
        Write-Host "ClubElo load failed: $($_.Exception.Message)"
    }
}

# --- ESPN lineups (confirmed XI when released) ---
$lineupByMatch = @{}
$lineupMeta = [ordered]@{ loaded = $false; fixtures = 0; confirmed = 0; source = "espn site.web.api" }
$lineupPath = Join-Path $Root "data/open/espn_lineups.json"
if (Test-Path $lineupPath) {
    try {
        $luDoc = ([System.IO.File]::ReadAllText($lineupPath)).TrimStart([char]0xFEFF) | ConvertFrom-Json
        foreach ($fx in @($luDoc.fixtures)) {
            $lineupByMatch["$($fx.league)|$($fx.home)|$($fx.away)"] = $fx
            # also date-keyed for safer match
            $lineupByMatch["$($fx.league)|$($fx.date)|$($fx.home)|$($fx.away)"] = $fx
        }
        $lineupMeta.loaded = $true
        $lineupMeta.fixtures = [int]$luDoc.fixtureCount
        $lineupMeta.confirmed = [int]$luDoc.confirmedCount
        Write-Host "ESPN lineups loaded: $($lineupMeta.fixtures) fixtures, confirmed=$($lineupMeta.confirmed)"
    } catch {
        Write-Host "Lineups load failed: $($_.Exception.Message)"
    }
}

# Attach Elo + shot-xG proxy (esp. Championship)
$teamsFinal = New-Object System.Collections.Generic.List[object]
foreach ($t in $teamsOut) {
    $copy = [ordered]@{}
    foreach ($p in $t.Keys) { $copy[$p] = $t[$p] }
    $ek = "$($t.league)|$($t.name)"
    $internalElo = if ($elo.ContainsKey($ek)) { [math]::Round([double]$elo[$ek], 1) } else { 1500.0 }
    $copy["eloInternal"] = $internalElo
    if ($clubEloByName.ContainsKey([string]$t.name)) {
        $copy["elo"] = [math]::Round([double]$clubEloByName[[string]$t.name], 1)
        $copy["eloSource"] = "clubelo"
    } else {
        $copy["elo"] = $internalElo
        $copy["eloSource"] = "internal"
    }
    if ($shotAgg.ContainsKey($ek) -and [int]$shotAgg[$ek].played -ge 3 -and [double]$shotAgg[$ek].shotsFor -gt 0) {
        $sa = $shotAgg[$ek]
        $conv = if ($sa.sotFor -gt 0) { [double]$sa.goalsFor / [double]$sa.sotFor } else { 0.3 }
        # rough xG proxy: SoT * conversion + shots*0.08 blend
        $xGpg = (([double]$sa.sotFor * $conv) + ([double]$sa.shotsFor * 0.08)) / [double]$sa.played / 2.0
        $xGApg = (([double]$sa.sotAgainst * $conv) + ([double]$sa.shotsAgainst * 0.08)) / [double]$sa.played / 2.0
        if (-not $copy["xg"]) {
            $copy["xg"] = [ordered]@{
                xGpg = [math]::Round($xGpg, 3)
                xGApg = [math]::Round($xGApg, 3)
                homeXGpg = [math]::Round($xGpg * 1.08, 3)
                homeXGApg = [math]::Round($xGApg * 0.95, 3)
                awayXGpg = [math]::Round($xGpg * 0.92, 3)
                awayXGApg = [math]::Round($xGApg * 1.05, 3)
                source = "shots-proxy"
                season = "2026/27"
            }
        } else {
            $copy["shotXgProxy"] = [ordered]@{ xGpg = [math]::Round($xGpg, 3); xGApg = [math]::Round($xGApg, 3) }
        }
    }
    $teamsFinal.Add($copy) | Out-Null
}
$teamsOut = $teamsFinal.ToArray()

# Tip engine: score fixtures for 1X2 / BTTS / OU25

function Test-NameInXi([string]$playerName, $starters) {
    if ([string]::IsNullOrWhiteSpace($playerName)) { return $false }
    $needle = ($playerName.Trim().ToLowerInvariant())
    foreach ($s in @($starters)) {
        $hay = ([string]$s.name).ToLowerInvariant()
        if ($hay -eq $needle) { return $true }
        # "Saka" in "Bukayo Saka" / last-token match
        $tok = ($needle -split '\s+')[-1]
        if ($tok.Length -ge 3 -and $hay -like "*$tok*") { return $true }
    }
    return $false
}

# Ligasnitt (senaste tva sasongerna) - prior som sma lagsamples krymps mot.
# Utan detta gav 2/2 BTTS-matcher bttsRate 1.0 -> "90 % chans" (backtest: 70%+-bandet traffade bara 54 %).
$leaguePrior = @{}
foreach ($g in ($sorted | Where-Object { $_.season -in @("2025/26", "2026/27") } | Group-Object league)) {
    $n = [double]$g.Count
    if ($n -lt 20) { continue }
    $c = @{ btts = 0; over25 = 0; homeWin = 0; awayWin = 0; goals = 0 }
    foreach ($r in $g.Group) {
        if ($r.btts) { $c.btts++ }
        if ($r.over25) { $c.over25++ }
        if ($r.result -eq "H") { $c.homeWin++ } elseif ($r.result -eq "A") { $c.awayWin++ }
        $c.goals += [double]$r.totalGoals
    }
    $leaguePrior[$g.Name] = @{
        btts = $c.btts / $n; over25 = $c.over25 / $n
        homeWin = $c.homeWin / $n; awayWin = $c.awayWin / $n; goals = $c.goals / $n
    }
}
$defaultPrior = @{ btts = 0.52; over25 = 0.50; homeWin = 0.44; awayWin = 0.30; goals = 2.7 }
$ShrinkK = 8.0

# --- Kryss-kalibrering ---
# Modellens krysschans diskriminerar knappt (backtest: 19 % och 24 % forutsagt gav bada ~26 % kryss) och ligger
# for lagt. Den blandas mot ligans kryssandel, krympt mot 26 % (DrawShrinkN matcher) sa att sma ligor inte styr.
# DrawW = vikt pa modellen; valjs pa forsta halvan av backtesten och behalls bara om den slar okalibrerat pa andra.
$DrawGlobal = 0.26
$DrawShrinkN = 150.0
$script:DrawW = $null
function Get-DrawRate($c) {
    if (-not $c) { return $DrawGlobal }
    return ([double]$c.d + $DrawGlobal * $DrawShrinkN) / ([double]$c.n + $DrawShrinkN)
}
function Apply-DrawCal([double]$pH, [double]$pD, [double]$pA, [double]$dr, [double]$w) {
    $nd = $w * $pD + (1 - $w) * $dr
    $ha = $pH + $pA
    if ($ha -le 0) { return @($pH, $pD, $pA) }
    $k = (1 - $nd) / $ha
    return @(($pH * $k), $nd, ($pA * $k))
}
# Punkt-i-tid: foregaende sasong + innevarande fram till matchen (backtest), hela (live)
$drawCounts = @{}
foreach ($r in ($sorted | Where-Object { $_.season -eq "2025/26" })) {
    if (-not $drawCounts.ContainsKey($r.league)) { $drawCounts[$r.league] = @{ n = 0; d = 0 } }
    $drawCounts[$r.league].n++; if ($r.result -eq "D") { $drawCounts[$r.league].d++ }
}

function Shrink([double]$rate, $played, [double]$prior) {
    $n = 0.0
    try { $n = [math]::Max(0.0, [double]$played) } catch { $n = 0.0 }
    return ($rate * $n + $prior * $ShrinkK) / ($n + $ShrinkK)
}

# P(totalt >= 3 mal) for Poisson(lambda)
function Get-POver25([double]$lambda) {
    if ($lambda -le 0) { return 0.0 }
    $e = [math]::Exp(-$lambda)
    return 1.0 - $e * (1.0 + $lambda + $lambda * $lambda / 2.0)
}

function Score-Fixture($homeStats, $awayStats, $lineup = $null, $drawRate = $null) {
    $pr = $defaultPrior
    $lg = [string]$homeStats.league
    if ($lg -and $leaguePrior.ContainsKey($lg)) { $pr = $leaguePrior[$lg] }
    $hp = $homeStats.home.played; $ap = $awayStats.away.played
    $hWin = Shrink $homeStats.home.winRate $hp $pr.homeWin
    $aWin = Shrink $awayStats.away.winRate $ap $pr.awayWin
    $hWinAll = Shrink $homeStats.winRate $homeStats.played (($pr.homeWin + $pr.awayWin) / 2)
    $aWinAll = Shrink $awayStats.winRate $awayStats.played (($pr.homeWin + $pr.awayWin) / 2)
    $hBtts = Shrink $homeStats.home.bttsRate $hp $pr.btts
    $aBtts = Shrink $awayStats.away.bttsRate $ap $pr.btts
    $hOver = Shrink $homeStats.home.over25Rate $hp $pr.over25
    $aOver = Shrink $awayStats.away.over25Rate $ap $pr.over25
    $halfGoals = $pr.goals / 2.0
    $hGf = Shrink $homeStats.home.gfPg $hp $halfGoals; $hGa = Shrink $homeStats.home.gaPg $hp $halfGoals
    $aGf = Shrink $awayStats.away.gfPg $ap $halfGoals; $aGa = Shrink $awayStats.away.gaPg $ap $halfGoals

    # Elo-based 1X2 core (ClubElo preferred when merged on team)
    $eloH = if ($homeStats.elo) { [double]$homeStats.elo } else { 1500.0 }
    $eloA = if ($awayStats.elo) { [double]$awayStats.elo } else { 1500.0 }
    $eloDiff = ($eloH + 65.0) - $eloA
    $pHomeElo = 1.0 / (1.0 + [math]::Pow(10.0, (-$eloDiff / 400.0)))
    $pAwayElo = 1.0 - $pHomeElo
    # Draw inflation ~25-30%
    $pDrawElo = 0.27
    $pHomeElo = $pHomeElo * (1 - $pDrawElo)
    $pAwayElo = $pAwayElo * (1 - $pDrawElo)

    # Form blend
    $pHomeForm = [math]::Min(0.85, [math]::Max(0.08, (0.55 * $hWin) + (0.25 * $hWinAll) + (0.20 * (1 - $aWin))))
    $pAwayForm = [math]::Min(0.85, [math]::Max(0.08, (0.55 * $aWin) + (0.25 * $aWinAll) + (0.20 * (1 - $hWin))))
    $rawF = $pHomeForm + $pAwayForm
    if ($rawF -gt 0.92) { $pHomeForm *= 0.92 / $rawF; $pAwayForm *= 0.92 / $rawF }
    $pDrawForm = [math]::Max(0.08, 1 - $pHomeForm - $pAwayForm)

    # Weight ClubElo slightly higher when both sides have clubelo source
    $eloW = 0.55
    if ($homeStats.eloSource -eq "clubelo" -and $awayStats.eloSource -eq "clubelo") { $eloW = 0.62 }
    $formW = 1.0 - $eloW
    $pHome = $eloW * $pHomeElo + $formW * $pHomeForm
    $pAway = $eloW * $pAwayElo + $formW * $pAwayForm
    $pDraw = $eloW * $pDrawElo + $formW * $pDrawForm
    $sum = $pHome + $pAway + $pDraw
    if ($sum -gt 0) { $pHome /= $sum; $pAway /= $sum; $pDraw /= $sum }

    $pBtts = [math]::Min(0.9, [math]::Max(0.15, (0.5 * $hBtts) + (0.5 * $aBtts)))
    $usedXg = $false
    $usedPlayerAttack = $false
    $expGoals = ($hGf + $aGf + $hGa + $aGa) / 2
    if ($homeStats.xg -and $awayStats.xg -and [double]$homeStats.xg.homeXGpg -gt 0 -and [double]$awayStats.xg.awayXGpg -gt 0) {
        $expGoals = [double]$homeStats.xg.homeXGpg + [double]$awayStats.xg.awayXGpg
        $expGoals = 0.5 * $expGoals + 0.25 * ([double]$homeStats.xg.homeXGpg + [double]$awayStats.xg.awayXGApg) + 0.25 * ([double]$awayStats.xg.awayXGpg + [double]$homeStats.xg.homeXGApg)
        $usedXg = $true
    }
    $pOver = [math]::Min(0.9, [math]::Max(0.15, (0.35 * $hOver) + (0.35 * $aOver) + (0.3 * (Get-POver25 $expGoals))))
    if ($usedXg) {
        $pBothScore = [math]::Min(0.92, [math]::Max(0.12, (1 - [math]::Exp(-[double]$homeStats.xg.homeXGpg)) * (1 - [math]::Exp(-[double]$awayStats.xg.awayXGpg))))
        $pBtts = [math]::Round(0.5 * $pBtts + 0.5 * $pBothScore, 4)
    }

    # Spelar-attack (Understat key_passes/xG/xA per lag) - finjusterar 1X2 + OU/BTTS
    $paNotes = @()
    $atkH = $null; $atkA = $null
    if ($homeStats.playerAttack) { $atkH = [double]$homeStats.playerAttack.attackIndex }
    if ($awayStats.playerAttack) { $atkA = [double]$awayStats.playerAttack.attackIndex }
    if ($null -ne $atkH -and $null -ne $atkA -and ($atkH + $atkA) -gt 0) {
        $usedPlayerAttack = $true
        $atkDiff = $atkH - $atkA
        # ~3% skift per attackIndex-enhet, cap +/-8%
        $shift = [math]::Max(-0.08, [math]::Min(0.08, $atkDiff * 0.03))
        $pHome = [math]::Max(0.08, $pHome + $shift)
        $pAway = [math]::Max(0.08, $pAway - $shift)
        # Skapande/attack -> fler mal
        $createH = if ($homeStats.playerAttack.createIndex) { [double]$homeStats.playerAttack.createIndex } else { 0 }
        $createA = if ($awayStats.playerAttack.createIndex) { [double]$awayStats.playerAttack.createIndex } else { 0 }
        $createSum = $createH + $createA
        $expGoals = 0.72 * $expGoals + 0.28 * [math]::Min(4.2, 1.4 + 0.55 * $createSum)
        $pOver = [math]::Min(0.9, [math]::Max(0.15, 0.7 * $pOver + 0.3 * (Get-POver25 $expGoals)))
        $pBtts = [math]::Min(0.9, [math]::Max(0.15, 0.75 * $pBtts + 0.25 * [math]::Min(0.85, 0.35 + 0.12 * $createSum)))
        $paNotes += ("AttackIndex H={0:N2} A={1:N2} (shift {2:N3})" -f $atkH, $atkA, $shift)
        if ($homeStats.playerAttack.topCreators) {
            $paNotes += "HOME creators: $((@($homeStats.playerAttack.topCreators) -join ', '))"
        }
        if ($awayStats.playerAttack.topCreators) {
            $paNotes += "AWAY creators: $((@($awayStats.playerAttack.topCreators) -join ', '))"
        }
        $sum = $pHome + $pAway + $pDraw
        if ($sum -gt 0) { $pHome /= $sum; $pAway /= $sum; $pDraw /= $sum }
    }

    # Kryss-kalibrering fore preAvail, sa att aven pro-lagrets blandning far den
    if ($null -ne $script:DrawW -and $null -ne $drawRate) {
        $s0 = $pHome + $pAway + $pDraw
        $cal = Apply-DrawCal ($pHome / $s0) ($pDraw / $s0) ($pAway / $s0) ([double]$drawRate) $script:DrawW
        $pHome = $cal[0]; $pDraw = $cal[1]; $pAway = $cal[2]
    }

    # Sannolikheter fore den platta franvarojusteringen - pro-lagret anvander dessa och viktar
    # franvaro per spelare (xG/xA-andel) i stallet, sa att den inte raknas tva ganger.
    $preSum = $pHome + $pAway + $pDraw
    $preAvail = @{
        home = [math]::Round($pHome / $preSum, 4); draw = [math]::Round($pDraw / $preSum, 4)
        away = [math]::Round($pAway / $preSum, 4); over25 = [math]::Round($pOver, 4); btts = [math]::Round($pBtts, 4)
    }

    $availNotes = @()
    $lineupNotes = @()
    $homeKeyOut = 0; $awayKeyOut = 0
    $lineupStatus = "none"
    $lineupConfirmed = $false

    # FPL availability (baseline) - overridden by confirmed XI when present
    $homeMissing = @()
    $awayMissing = @()
    if ($homeStats.availability -and $homeStats.availability.keyMissing) {
        $homeMissing = @($homeStats.availability.keyMissing)
    }
    if ($awayStats.availability -and $awayStats.availability.keyMissing) {
        $awayMissing = @($awayStats.availability.keyMissing)
    }

    if ($lineup -and $lineup.lineupStatus -eq "confirmed") {
        $lineupConfirmed = $true
        $lineupStatus = "confirmed"
        $homeXi = @($lineup.homeStarters)
        $awayXi = @($lineup.awayStarters)
        $lineupNotes += "XI bekraftad (ESPN) $($lineup.homeFormation) vs $($lineup.awayFormation)"

        # Key FPL-outs that actually START -> ignore FPL out for them
        $homeStillOut = @()
        foreach ($nm in $homeMissing) {
            if (Test-NameInXi $nm $homeXi) {
                $lineupNotes += "HOME $nm startar trots FPL-out flagga"
            } else {
                $homeStillOut += $nm
            }
        }
        $awayStillOut = @()
        foreach ($nm in $awayMissing) {
            if (Test-NameInXi $nm $awayXi) {
                $lineupNotes += "AWAY $nm startar trots FPL-out flagga"
            } else {
                $awayStillOut += $nm
            }
        }
        $homeMissing = $homeStillOut
        $awayMissing = $awayStillOut

        # Stronger adjustment for confirmed XI gaps (FPL-outs som faktiskt inte startar)
        $homeKeyOut = @($homeMissing).Count
        $awayKeyOut = @($awayMissing).Count
        if ($homeKeyOut -gt 0) {
            $availNotes += "HOME key out (XI): $($homeMissing -join ', ')"
            $pHome = [math]::Max(0.08, $pHome * (1 - 0.09 * [math]::Min(3, $homeKeyOut)))
            $pOver = [math]::Max(0.15, $pOver * (1 - 0.05 * [math]::Min(2, $homeKeyOut)))
        }
        if ($awayKeyOut -gt 0) {
            $availNotes += "AWAY key out (XI): $($awayMissing -join ', ')"
            $pAway = [math]::Max(0.08, $pAway * (1 - 0.09 * [math]::Min(3, $awayKeyOut)))
            $pOver = [math]::Max(0.15, $pOver * (1 - 0.05 * [math]::Min(2, $awayKeyOut)))
        }
        if ($homeKeyOut -eq 0 -and $awayKeyOut -eq 0) {
            $lineupNotes += "Inga bekraftade key-outs i startelvorna"
        }
    } else {
        if ($lineup -and $lineup.lineupStatus -eq "pending") {
            $lineupStatus = "pending"
            $lineupNotes += "Elvor ej slappta an (ESPN pending)"
        }
        if ($homeMissing.Count -gt 0) {
            $homeKeyOut = $homeMissing.Count
            $availNotes += "HOME key out: $($homeMissing -join ', ')"
            $pHome = [math]::Max(0.08, $pHome * (1 - 0.06 * [math]::Min(3, $homeKeyOut)))
            $pOver = [math]::Max(0.15, $pOver * (1 - 0.04 * [math]::Min(2, $homeKeyOut)))
        }
        if ($awayMissing.Count -gt 0) {
            $awayKeyOut = $awayMissing.Count
            $availNotes += "AWAY key out: $($awayMissing -join ', ')"
            $pAway = [math]::Max(0.08, $pAway * (1 - 0.06 * [math]::Min(3, $awayKeyOut)))
            $pOver = [math]::Max(0.15, $pOver * (1 - 0.04 * [math]::Min(2, $awayKeyOut)))
        }
    }

    $sum = $pHome + $pAway + $pDraw
    if ($sum -gt 0) { $pHome = $pHome / $sum; $pAway = $pAway / $sum; $pDraw = $pDraw / $sum }

    $pick1x2 = "1"; $conf1x2 = $pHome
    if ($pDraw -ge $pHome -and $pDraw -ge $pAway) { $pick1x2 = "X"; $conf1x2 = $pDraw }
    elseif ($pAway -ge $pHome -and $pAway -ge $pDraw) { $pick1x2 = "2"; $conf1x2 = $pAway }
    $pickBtts = if ($pBtts -ge 0.5) { "JA" } else { "NEJ" }
    $pickOu = if ($pOver -ge 0.5) { "OVER 2.5" } else { "UNDER 2.5" }

    # --- Horn (O/U): projicera totalt, valj linje 8.5 / 9.5 / 10.5 ---
    $cornersMarket = $null
    $cfH = 0.0; $caH = 0.0; $cfA = 0.0; $caA = 0.0
    $cPlayH = 0; $cPlayA = 0
    if ($homeStats.corners) {
        $cPlayH = [int]$homeStats.corners.played
        if ($homeStats.corners.home -and [int]$homeStats.corners.home.played -gt 0) {
            $cfH = [double]$homeStats.corners.home.forPg
            $caH = [double]$homeStats.corners.home.againstPg
        } elseif ($cPlayH -gt 0) {
            $cfH = [double]$homeStats.corners.forPg
            $caH = [double]$homeStats.corners.againstPg
        }
    }
    if ($awayStats.corners) {
        $cPlayA = [int]$awayStats.corners.played
        if ($awayStats.corners.away -and [int]$awayStats.corners.away.played -gt 0) {
            $cfA = [double]$awayStats.corners.away.forPg
            $caA = [double]$awayStats.corners.away.againstPg
        } elseif ($cPlayA -gt 0) {
            $cfA = [double]$awayStats.corners.forPg
            $caA = [double]$awayStats.corners.againstPg
        }
    }
    if ($cPlayH -ge 2 -and $cPlayA -ge 2) {
        $lambdaCH = ($cfH + $caA) / 2.0
        $lambdaCA = ($cfA + $caH) / 2.0
        # Liten regression mot ligasnitt ~9.4
        $expCorners = 0.75 * ($lambdaCH + $lambdaCA) + 0.25 * 9.4
        $line = 9.5
        if ($expCorners -ge 10.3) { $line = 10.5 }
        elseif ($expCorners -le 8.2) { $line = 8.5 }

        # Poisson P(total > line) via CDF upp till floor(line)
        $pOverC = Get-PoissonOverHalf $expCorners $line
        # Blanda med empiriska over-rater om linjen ar 9.5
        if ($line -eq 9.5 -and $null -ne $homeStats.corners.over95Rate -and $null -ne $awayStats.corners.over95Rate) {
            $emp = 0.5 * [double]$homeStats.corners.over95Rate + 0.5 * [double]$awayStats.corners.over95Rate
            $pOverC = 0.55 * $pOverC + 0.45 * $emp
        } elseif ($line -eq 8.5 -and $null -ne $homeStats.corners.over85Rate -and $null -ne $awayStats.corners.over85Rate) {
            $emp = 0.5 * [double]$homeStats.corners.over85Rate + 0.5 * [double]$awayStats.corners.over85Rate
            $pOverC = 0.55 * $pOverC + 0.45 * $emp
        } elseif ($line -eq 10.5 -and $null -ne $homeStats.corners.over105Rate -and $null -ne $awayStats.corners.over105Rate) {
            $emp = 0.5 * [double]$homeStats.corners.over105Rate + 0.5 * [double]$awayStats.corners.over105Rate
            $pOverC = 0.55 * $pOverC + 0.45 * $emp
        }
        $pOverC = [math]::Min(0.9, [math]::Max(0.1, $pOverC))
        $pickC = if ($pOverC -ge 0.5) { "OVER $line" } else { "UNDER $line" }
        $confC = [math]::Max($pOverC, 1.0 - $pOverC)
        $cornersMarket = @{
            pick = $pickC
            line = $line
            confidence = [math]::Round($confC, 3)
            pOver = [math]::Round($pOverC, 3)
            expCorners = [math]::Round($expCorners, 2)
            lambdaHome = [math]::Round($lambdaCH, 2)
            lambdaAway = [math]::Round($lambdaCA, 2)
        }
    }

    $tipScore = ($conf1x2 + [math]::Max($pBtts, 1 - $pBtts) + [math]::Max($pOver, 1 - $pOver)) / 3
    if ($cornersMarket) {
        $tipScore = ($tipScore * 3 + [double]$cornersMarket.confidence) / 4
    }
    # Bekraftad elva okar tillit lite (beslut baserat pa mer info)
    if ($lineupConfirmed) { $tipScore = [math]::Min(0.95, $tipScore + 0.025) }
    if ($usedPlayerAttack) { $tipScore = [math]::Min(0.95, $tipScore + 0.015) }

    $marketsOut = @{
        "1X2" = @{ pick = $pick1x2; confidence = [math]::Round($conf1x2, 3); probs = @{ home = [math]::Round($pHome, 3); draw = [math]::Round($pDraw, 3); away = [math]::Round($pAway, 3) } }
        "BTTS" = @{ pick = $pickBtts; confidence = [math]::Round([math]::Max($pBtts, 1 - $pBtts), 3); pYes = [math]::Round($pBtts, 3) }
        "OU25" = @{ pick = $pickOu; confidence = [math]::Round([math]::Max($pOver, 1 - $pOver), 3); pOver = [math]::Round($pOver, 3); expGoals = [math]::Round($expGoals, 2); usedXg = $usedXg; usedPlayerAttack = $usedPlayerAttack }
    }
    if ($cornersMarket) { $marketsOut["CORNERS"] = $cornersMarket }

    return [ordered]@{
        markets = $marketsOut
        probsBeforeAvailability = $preAvail
        availabilityNotes = $availNotes
        lineupNotes = $lineupNotes
        playerAttackNotes = $paNotes
        lineupStatus = $lineupStatus
        keyOuts = @{ home = $homeKeyOut; away = $awayKeyOut }
        eloDiff = [math]::Round($eloDiff, 1)
        tipScore = [math]::Round($tipScore, 3)
    }
}

# Build looking-glass tips: for each current-season match, score using stats BEFORE that match (approx via last10 excluding that match is hard in one pass)
# Simpler: produce league rankings + tip cards for "form edges" and backtest last 5 matchdays using rolling rebuild

$byLeagueCurrent = $sorted | Where-Object { $_.season -eq "2026/27" }
$rolling = @{}
$backtest = New-Object System.Collections.Generic.List[object]

function Ensure-Rolling($league, $name) {
    $k = "$league|$name"
    if (-not $rolling.ContainsKey($k)) {
        $rolling[$k] = [ordered]@{
            league = $league; name = $name
            home = @{ played = 0; wins = 0; btts = 0; over25 = 0; gf = 0; ga = 0 }
            away = @{ played = 0; wins = 0; btts = 0; over25 = 0; gf = 0; ga = 0 }
            all = @{ played = 0; wins = 0; draws = 0; btts = 0; over25 = 0; gf = 0; ga = 0 }
        }
    }
    return $rolling[$k]
}

function Snapshot-Stats($node) {
    $a = $node.all; $h = $node.home; $w = $node.away
    $eloVal = 1500.0
    $eloSrc = "internal"
    $nm = [string]$node.name
    if ($clubEloByName.ContainsKey($nm)) {
        $eloVal = [double]$clubEloByName[$nm]
        $eloSrc = "clubelo"
    } elseif ($elo.ContainsKey("$($node.league)|$nm")) {
        $eloVal = [double]$elo["$($node.league)|$nm"]
    }
    $pa = $null
    $pk = "$($node.league)|$nm"
    if ($playerAttackByKey.ContainsKey($pk)) {
        $row = $playerAttackByKey[$pk]
        $pa = [ordered]@{
            attackIndex = [double]$row.attackIndex
            createIndex = [double]$row.createIndex
            attackXg = [double]$row.attackXg
            attackXa = [double]$row.attackXa
            keyPasses = [double]$row.keyPasses
            topCreators = @($row.topCreators | Select-Object -First 3 | ForEach-Object { $_.name })
            source = "understat-players"
        }
    }
    return [ordered]@{
        league = $node.league
        elo = $eloVal
        eloSource = $eloSrc
        playerAttack = $pa
        played = $a.played
        winRate = (Rate $a.wins $a.played)
        home = @{
            played = $h.played
            winRate = (Rate $h.wins $h.played)
            bttsRate = (Rate $h.btts $h.played)
            over25Rate = (Rate $h.over25 $h.played)
            gfPg = (Rate $h.gf $h.played)
            gaPg = (Rate $h.ga $h.played)
        }
        away = @{
            played = $w.played
            winRate = (Rate $w.wins $w.played)
            bttsRate = (Rate $w.btts $w.played)
            over25Rate = (Rate $w.over25 $w.played)
            gfPg = (Rate $w.gf $w.played)
            gaPg = (Rate $w.ga $w.played)
        }
    }
}

foreach ($m in $byLeagueCurrent) {
    $hNode = Ensure-Rolling $m.league $m.home
    $aNode = Ensure-Rolling $m.league $m.away
    $ready = ($hNode.all.played -ge 2 -and $aNode.all.played -ge 2)
    if ($ready) {
        $hSnap = Snapshot-Stats $hNode
        $aSnap = Snapshot-Stats $aNode
        if ($preMatchElo.ContainsKey([string]$m.id)) {
            $pe = $preMatchElo[[string]$m.id]
            $hSnap.elo = [double]$pe[0]; $hSnap.eloSource = "internal-prematch"
            $aSnap.elo = [double]$pe[1]; $aSnap.eloSource = "internal-prematch"
        }
        $score = Score-Fixture $hSnap $aSnap
        $actual1 = if ($m.result -eq "H") { "1" } elseif ($m.result -eq "D") { "X" } else { "2" }
        $actualB = if ($m.btts) { "JA" } else { "NEJ" }
        $actualO = if ($m.over25) { "OVER 2.5" } else { "UNDER 2.5" }
        $backtest.Add([ordered]@{
            date = $m.date
            league = $m.league
            match = "$($m.home) vs $($m.away)"
            home = $m.home; away = $m.away
            drawRate = (Get-DrawRate $drawCounts[$m.league])
            tips = $score.markets
            tipScore = $score.tipScore
            actual = @{ "1X2" = $actual1; BTTS = $actualB; OU25 = $actualO }
            hit = @{
                "1X2" = ($score.markets."1X2".pick -eq $actual1)
                BTTS = ($score.markets.BTTS.pick -eq $actualB)
                OU25 = ($score.markets.OU25.pick -eq $actualO)
            }
        }) | Out-Null
    }
    # update rolling after tip
    if (-not $drawCounts.ContainsKey($m.league)) { $drawCounts[$m.league] = @{ n = 0; d = 0 } }
    $drawCounts[$m.league].n++; if ($m.result -eq "D") { $drawCounts[$m.league].d++ }
    $hNode.all.played++; $hNode.all.gf += $m.hg; $hNode.all.ga += $m.ag
    if ($m.result -eq "H") { $hNode.all.wins++ } elseif ($m.result -eq "D") { $hNode.all.draws++ }
    if ($m.btts) { $hNode.all.btts++ }; if ($m.over25) { $hNode.all.over25++ }
    $hNode.home.played++; $hNode.home.gf += $m.hg; $hNode.home.ga += $m.ag
    if ($m.result -eq "H") { $hNode.home.wins++ }
    if ($m.btts) { $hNode.home.btts++ }; if ($m.over25) { $hNode.home.over25++ }

    $aNode.all.played++; $aNode.all.gf += $m.ag; $aNode.all.ga += $m.hg
    if ($m.result -eq "A") { $aNode.all.wins++ } elseif ($m.result -eq "D") { $aNode.all.draws++ }
    if ($m.btts) { $aNode.all.btts++ }; if ($m.over25) { $aNode.all.over25++ }
    $aNode.away.played++; $aNode.away.gf += $m.ag; $aNode.away.ga += $m.hg
    if ($m.result -eq "A") { $aNode.away.wins++ }
    if ($m.btts) { $aNode.away.btts++ }; if ($m.over25) { $aNode.away.over25++ }
}

# --- Kryss-kalibrering: valj vikt pa forsta halvan (datum), prova pa andra halvan ---
function Get-Raw1x2($b) {
    $p = $b.tips."1X2".probs
    $s = [double]$p.home + [double]$p.draw + [double]$p.away
    return @(([double]$p.home / $s), ([double]$p.draw / $s), ([double]$p.away / $s))
}
function Get-LogLoss($pr, [string]$act) {
    $p = if ($act -eq "1") { $pr[0] } elseif ($act -eq "X") { $pr[1] } else { $pr[2] }
    return -[math]::Log([math]::Max(1e-6, [double]$p))
}
$btSorted = @($backtest | Where-Object { $_.tips."1X2".probs } | Sort-Object date)
$drawCalMeta = [ordered]@{ kept = $false; w = $null; reason = "for fa matcher" }
if ($btSorted.Count -ge 400) {
    $half = [int][math]::Floor($btSorted.Count / 2)
    $trainBt = $btSorted[0..($half - 1)]
    $testBt = $btSorted[$half..($btSorted.Count - 1)]
    $bestW = 1.0; $bestLoss = [double]::MaxValue
    foreach ($w in @(0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0)) {
        $sumL = 0.0
        foreach ($b in $trainBt) {
            $raw = Get-Raw1x2 $b
            $sumL += Get-LogLoss (Apply-DrawCal $raw[0] $raw[1] $raw[2] ([double]$b.drawRate) $w) $b.actual["1X2"]
        }
        $l = $sumL / $trainBt.Count
        if ($l -lt $bestLoss) { $bestLoss = $l; $bestW = $w }
    }
    $diffs = New-Object double[] $testBt.Count
    $sumRaw = 0.0; $sumCal = 0.0
    for ($i = 0; $i -lt $testBt.Count; $i++) {
        $b = $testBt[$i]
        $raw = Get-Raw1x2 $b
        $lr = Get-LogLoss $raw $b.actual["1X2"]
        $lc = Get-LogLoss (Apply-DrawCal $raw[0] $raw[1] $raw[2] ([double]$b.drawRate) $bestW) $b.actual["1X2"]
        $sumRaw += $lr; $sumCal += $lc; $diffs[$i] = $lc - $lr
    }
    # Parvis bootstrap: andel omsamplingar dar kalibrerat har lagre log-loss
    $rng = New-Object System.Random 42
    $better = 0; $B = 300; $nT = $diffs.Length
    for ($r = 0; $r -lt $B; $r++) {
        $s = 0.0
        for ($j = 0; $j -lt $nT; $j++) { $s += $diffs[$rng.Next($nT)] }
        if ($s -lt 0) { $better++ }
    }
    $share = $better / $B
    $kept = ($bestW -lt 1.0 -and $sumCal -lt $sumRaw -and $share -ge 0.9)
    $drawCalMeta = [ordered]@{
        kept = $kept; w = $bestW; trainMatches = $trainBt.Count; testMatches = $testBt.Count
        trainLogLoss = [math]::Round($bestLoss, 4)
        testLogLossRaw = [math]::Round($sumRaw / $testBt.Count, 4)
        testLogLossCal = [math]::Round($sumCal / $testBt.Count, 4)
        bootstrapBetterShare = [math]::Round($share, 3)
        shrinkN = $DrawShrinkN; globalDraw = $DrawGlobal
        reason = if ($kept) { "b$([char]0xE4)ttre log-loss p$([char]0xE5) andra halvan" } elseif ($bestW -ge 1.0) { "okalibrerat b$([char]0xE4)st redan p$([char]0xE5) f$([char]0xF6)rsta halvan" } else { "f$([char]0xF6)rb$([char]0xE4)ttringen inte s$([char]0xE4)ker (bootstrap < 90 %)" }
    }
    Write-Host ("Kryss-kalibrering: w={0} test log-loss {1} -> {2} (bootstrap {3}) behallen={4}" -f $bestW, $drawCalMeta.testLogLossRaw, $drawCalMeta.testLogLossCal, $share, $kept)
    # Grundmodellens backtest (fore/efter) -> pro-lagret kontrollerar att aven blandningen med Dixon-Coles blir battre
    $reportDir = Join-Path $Root "data\reports"
    New-Item -ItemType Directory -Force -Path $reportDir | Out-Null
    $baseRows = foreach ($b in $btSorted) {
        $raw = Get-Raw1x2 $b
        $cal = Apply-DrawCal $raw[0] $raw[1] $raw[2] ([double]$b.drawRate) $bestW
        [ordered]@{ league = $b.league; date = $b.date; home = $b.home; away = $b.away
            raw = @([math]::Round($raw[0], 4), [math]::Round($raw[1], 4), [math]::Round($raw[2], 4))
            cal = @([math]::Round($cal[0], 4), [math]::Round($cal[1], 4), [math]::Round($cal[2], 4)) }
    }
    [System.IO.File]::WriteAllText((Join-Path $reportDir "base-backtest.json"), (@{ w = $bestW; rows = @($baseRows) } | ConvertTo-Json -Depth 5 -Compress), (New-Object System.Text.UTF8Encoding $false))
    if ($kept) {
        $script:DrawW = $bestW
        # Samma transform pa backtesten sa att chansband och traff speglar det som visas live
        foreach ($b in $backtest) {
            if (-not $b.tips."1X2".probs) { continue }
            $raw = Get-Raw1x2 $b
            $b.rawDraw = [math]::Round($raw[1], 4)
            $c = Apply-DrawCal $raw[0] $raw[1] $raw[2] ([double]$b.drawRate) $bestW
            $pk = "1"; $cf = $c[0]
            if ($c[1] -ge $c[0] -and $c[1] -ge $c[2]) { $pk = "X"; $cf = $c[1] } elseif ($c[2] -ge $c[0]) { $pk = "2"; $cf = $c[2] }
            $b.tips."1X2" = @{ pick = $pk; confidence = [math]::Round($cf, 3); probs = @{ home = [math]::Round($c[0], 3); draw = [math]::Round($c[1], 3); away = [math]::Round($c[2], 3) } }
            $b.hit["1X2"] = ($pk -eq $b.actual["1X2"])
        }
    }
}

$hits = @{
    "1X2" = @{ n = 0; ok = 0 }
    BTTS = @{ n = 0; ok = 0 }
    OU25 = @{ n = 0; ok = 0 }
}
$hitsByLeague = @{}
foreach ($lg in $AllLeagues) {
    $hitsByLeague[$lg] = @{ "1X2" = @{ n = 0; ok = 0 }; BTTS = @{ n = 0; ok = 0 }; OU25 = @{ n = 0; ok = 0 } }
}
foreach ($b in $backtest) {
    $lg = [string]$b.league
    foreach ($mkt in @("1X2", "BTTS", "OU25")) {
        $hits[$mkt].n++
        if ($b.hit[$mkt]) { $hits[$mkt].ok++ }
        if ($hitsByLeague.ContainsKey($lg)) {
            $hitsByLeague[$lg][$mkt].n++
            if ($b.hit[$mkt]) { $hitsByLeague[$lg][$mkt].ok++ }
        }
    }
}

# 1X2: hur ofta varje val gar in (tippat 1 / X / 2)
function New-PickSet { return @{ "1" = @{ n = 0; ok = 0 }; "X" = @{ n = 0; ok = 0 }; "2" = @{ n = 0; ok = 0 } } }
function Finalize-Picks($raw) {
    $out = [ordered]@{}
    foreach ($p in @("1", "X", "2")) { $out[$p] = [ordered]@{ tested = $raw[$p].n; correct = $raw[$p].ok; rate = (Rate $raw[$p].ok $raw[$p].n) } }
    return $out
}
$pickHits = New-PickSet
$pickHitsByLeague = @{}
foreach ($lg in $AllLeagues) { $pickHitsByLeague[$lg] = New-PickSet }
foreach ($b in $backtest) {
    $p = [string]$b.tips."1X2".pick
    if (-not $pickHits.ContainsKey($p)) { continue }
    $ok = [bool]$b.hit["1X2"]
    $pickHits[$p].n++; if ($ok) { $pickHits[$p].ok++ }
    $lg = [string]$b.league
    if ($pickHitsByLeague.ContainsKey($lg)) { $pickHitsByLeague[$lg][$p].n++; if ($ok) { $pickHitsByLeague[$lg][$p].ok++ } }
}

# Kryss-kalibrering: modellens krysschans mot faktisk andel kryss (per intervall och per liga)
# Intervallen = modellens okalibrerade krysschans; predicted = det som visas (kalibrerat om det behallits)
function New-DrawCal { return @{ n = 0; pSum = 0.0; rawSum = 0.0; draws = 0 } }
$drawBins = [ordered]@{ "<20" = (New-DrawCal); "20-23" = (New-DrawCal); "23-26" = (New-DrawCal); "26-29" = (New-DrawCal); "29+" = (New-DrawCal) }
$drawByLeague = @{}
foreach ($b in $backtest) {
    $pd = 0.0
    try { $pd = [double]$b.tips."1X2".probs.draw } catch { continue }
    if ($pd -le 0) { continue }
    $raw = if ($null -ne $b.rawDraw) { [double]$b.rawDraw } else { $pd }
    $isD = ([string]$b.actual["1X2"] -eq "X")
    $bin = if ($raw -lt 0.20) { "<20" } elseif ($raw -lt 0.23) { "20-23" } elseif ($raw -lt 0.26) { "23-26" } elseif ($raw -lt 0.29) { "26-29" } else { "29+" }
    foreach ($c in @($drawBins[$bin])) { $c.n++; $c.pSum += $pd; $c.rawSum += $raw; if ($isD) { $c.draws++ } }
    $lg = [string]$b.league
    if (-not $drawByLeague.ContainsKey($lg)) { $drawByLeague[$lg] = New-DrawCal }
    $drawByLeague[$lg].n++; $drawByLeague[$lg].pSum += $pd; $drawByLeague[$lg].rawSum += $raw; if ($isD) { $drawByLeague[$lg].draws++ }
}
function Out-DrawCal($c) { return [ordered]@{ tested = $c.n; predictedRaw = (Rate $c.rawSum $c.n); predicted = (Rate $c.pSum $c.n); actual = (Rate $c.draws $c.n) } }
$drawCalibration = [ordered]@{ meta = $drawCalMeta; bins = [ordered]@{}; byLeague = [ordered]@{} }
foreach ($k in $drawBins.Keys) { $drawCalibration.bins[$k] = Out-DrawCal $drawBins[$k] }
foreach ($lg in ($drawByLeague.Keys | Sort-Object)) { $drawCalibration.byLeague[$lg] = Out-DrawCal $drawByLeague[$lg] }

$accuracy = [ordered]@{}
foreach ($mkt in @("1X2", "BTTS", "OU25")) {
    $accuracy[$mkt] = @{
        tested = $hits[$mkt].n
        correct = $hits[$mkt].ok
        rate = (Rate $hits[$mkt].ok $hits[$mkt].n)
    }
}
$accuracy["1X2"].byPick = (Finalize-Picks $pickHits)
$accuracyByLeague = [ordered]@{}
foreach ($lg in $AllLeagues) {
    $accLg = [ordered]@{}
    foreach ($mkt in @("1X2", "BTTS", "OU25")) {
        $h = $hitsByLeague[$lg][$mkt]
        $accLg[$mkt] = @{
            tested = $h.n
            correct = $h.ok
            rate = (Rate $h.ok $h.n)
        }
    }
    $accLg["1X2"].byPick = (Finalize-Picks $pickHitsByLeague[$lg])
    $accuracyByLeague[$lg] = $accLg
}

# Traff per chans-band (modellens confidence for respektive marknad)
function New-ConfBucketSet {
    return [ordered]@{
        ge70    = @{ n = 0; ok = 0 }   # >= 70%
        b60_69  = @{ n = 0; ok = 0 }   # 60-69.9%
        b50_59  = @{ n = 0; ok = 0 }   # 50-59.9%
        under50 = @{ n = 0; ok = 0 }   # < 50%
        under70 = @{ n = 0; ok = 0 }   # allt under 70%
    }
}

function Add-ConfHit($buckets, [double]$conf, [bool]$hit) {
    if ($conf -ge 0.70) {
        $buckets.ge70.n++; if ($hit) { $buckets.ge70.ok++ }
    } elseif ($conf -ge 0.60) {
        $buckets.b60_69.n++; if ($hit) { $buckets.b60_69.ok++ }
    } elseif ($conf -ge 0.50) {
        $buckets.b50_59.n++; if ($hit) { $buckets.b50_59.ok++ }
    } else {
        $buckets.under50.n++; if ($hit) { $buckets.under50.ok++ }
    }
    if ($conf -lt 0.70) {
        $buckets.under70.n++; if ($hit) { $buckets.under70.ok++ }
    }
}

function Finalize-ConfBuckets($raw) {
    $out = [ordered]@{}
    foreach ($key in @("ge70", "b60_69", "b50_59", "under50", "under70")) {
        $b = $raw[$key]
        $out[$key] = [ordered]@{
            label = switch ($key) {
                "ge70"    { "70%+" }
                "b60_69"  { "60-69.9%" }
                "b50_59"  { "50-59.9%" }
                "under50" { "Under 50%" }
                "under70" { "Under 70%" }
            }
            tested = $b.n
            correct = $b.ok
            rate = (Rate $b.ok $b.n)
        }
    }
    return $out
}

$confHits = @{
    "1X2" = (New-ConfBucketSet)
    BTTS  = (New-ConfBucketSet)
    OU25  = (New-ConfBucketSet)
}
$confHitsByLeague = @{}
foreach ($lg in $AllLeagues) {
    $confHitsByLeague[$lg] = @{
        "1X2" = (New-ConfBucketSet)
        BTTS  = (New-ConfBucketSet)
        OU25  = (New-ConfBucketSet)
    }
}

foreach ($b in $backtest) {
    $lg = [string]$b.league
    foreach ($mkt in @("1X2", "BTTS", "OU25")) {
        $conf = 0.0
        try { $conf = [double]$b.tips.$mkt.confidence } catch { $conf = 0.0 }
        $hit = [bool]$b.hit[$mkt]
        Add-ConfHit $confHits[$mkt] $conf $hit
        if ($confHitsByLeague.ContainsKey($lg)) {
            Add-ConfHit $confHitsByLeague[$lg][$mkt] $conf $hit
        }
    }
}

$accuracyByConfidence = [ordered]@{
    "1X2" = (Finalize-ConfBuckets $confHits."1X2")
    BTTS  = (Finalize-ConfBuckets $confHits.BTTS)
    OU25  = (Finalize-ConfBuckets $confHits.OU25)
}
$accuracyByConfidenceByLeague = [ordered]@{}
foreach ($lg in $AllLeagues) {
    $accuracyByConfidenceByLeague[$lg] = [ordered]@{
        "1X2" = (Finalize-ConfBuckets $confHitsByLeague[$lg]."1X2")
        BTTS  = (Finalize-ConfBuckets $confHitsByLeague[$lg].BTTS)
        OU25  = (Finalize-ConfBuckets $confHitsByLeague[$lg].OU25)
    }
}
Write-Host "Accuracy-by-confidence computed (70+ / 60-69 / 50-59 / <50 / <70)"


# Best tips from recent backtest with highest tipScore among hits (learning signal)
# And current "edge boards": teams with extreme BTTS/OU rates
$plTeams = $teamsOut | Where-Object { $_.league -eq "PL" -and $_.played -ge 3 }
$chTeams = $teamsOut | Where-Object { $_.league -eq "CH" -and $_.played -ge 3 }

function Get-TopTeams($teams, $prop, $desc, $take) {
    $sorted = if ($desc) {
        @($teams | Sort-Object { $_[$prop] } -Descending)
    } else {
        @($teams | Sort-Object { $_[$prop] })
    }
    $out = @()
    foreach ($t in ($sorted | Select-Object -First $take)) {
        $out += [ordered]@{
            name = $t.name
            form = $t.form
            bttsRate = $t.bttsRate
            over25Rate = $t.over25Rate
            ppg = $t.ppg
            winRate = $t.winRate
        }
    }
    return $out
}

$edgeBoards = [ordered]@{
    PL = @{
        most_btts = @(Get-TopTeams $plTeams "bttsRate" $true 5)
        least_btts = @(Get-TopTeams $plTeams "bttsRate" $false 5)
        most_over25 = @(Get-TopTeams $plTeams "over25Rate" $true 5)
        least_over25 = @(Get-TopTeams $plTeams "over25Rate" $false 5)
        best_form = @(Get-TopTeams $plTeams "ppg" $true 5)
    }
    CH = @{
        most_btts = @(Get-TopTeams $chTeams "bttsRate" $true 5)
        least_btts = @(Get-TopTeams $chTeams "bttsRate" $false 5)
        most_over25 = @(Get-TopTeams $chTeams "over25Rate" $true 5)
        least_over25 = @(Get-TopTeams $chTeams "over25Rate" $false 5)
        best_form = @(Get-TopTeams $chTeams "ppg" $true 5)
    }
}

# Upcoming odds (optional THE_ODDS_API_KEY)
$oddsPath = Join-Path $Root "data/open/upcoming_odds.json"
$oddsByMatch = @{}
$oddsMeta = [ordered]@{ loaded = $false; eventCount = 0; source = $null }
if (Test-Path $oddsPath) {
    try {
        $oddsDoc = ([System.IO.File]::ReadAllText($oddsPath)).TrimStart([char]0xFEFF) | ConvertFrom-Json
        $oddsMeta.loaded = [bool]$oddsDoc.loaded
        $oddsMeta.eventCount = [int]$oddsDoc.eventCount
        $oddsMeta.source = [string]$oddsDoc.source
        foreach ($ev in @($oddsDoc.events)) {
            $oddsByMatch["$($ev.league)|$($ev.home)|$($ev.away)"] = [ordered]@{
                odds = $ev.odds
                bookmaker = $(if ($ev.bookmaker) { [string]$ev.bookmaker } else { $null })
            }
        }
    } catch {}
}

function Get-Implied([double]$odds) {
    if ($odds -le 1.01) { return 0 }
    return 1.0 / $odds
}

function Test-EdgeFilter($sc, $valueEdge) {
    $maxConf = [math]::Max($sc.markets.'1X2'.confidence, [math]::Max($sc.markets.BTTS.confidence, $sc.markets.OU25.confidence))
    if ($sc.tipScore -lt 0.58) { return $false }
    if ($maxConf -lt 0.52) { return $false }
    # If live odds exist, require at least one market with positive edge OR strong model score
    if ($null -ne $valueEdge) {
        if ($valueEdge -ge 0.03) { return $true }
        return ($sc.tipScore -ge 0.66)
    }
    return $true
}

# Upcoming: load optional file
$upcomingPath = Join-Path $Root "data/upcoming-fixtures.json"
$upcomingTips = @()
$filteredTips = @()
$horizonDays = 21
$today = (Get-Date).Date
$horizon = $today.AddDays($horizonDays)
if (Test-Path $upcomingPath) {
    $upcoming = Get-Content $upcomingPath -Raw -Encoding UTF8 | ConvertFrom-Json
    foreach ($u in @($upcoming)) {
        $u.home = Get-CanonTeam $u.league $u.home; $u.away = Get-CanonTeam $u.league $u.away
        $dt = $null
        try { $dt = [datetime]::Parse($u.date).Date } catch { continue }
        $isPostponed = [bool]$u.postponed         # uppskjuten utan nytt datum (scripts/lib/postponed.mjs): visas kvar
        if ($dt -lt $today -and -not $isPostponed) { continue }          # spelade matcher bort
        if ($dt -gt $horizon) { continue }
        $hk = "$($u.league)|$($u.home)"
        $ak = "$($u.league)|$($u.away)"
        $ht = $teamsOut | Where-Object { $_.key -eq $hk } | Select-Object -First 1
        $at = $teamsOut | Where-Object { $_.key -eq $ak } | Select-Object -First 1
        if (-not $ht -or -not $at) { continue }
        if ($ht.played -lt 2 -or $at.played -lt 2) { continue }
        $lu = $null
        $luKeyDate = "$($u.league)|$($u.date)|$($u.home)|$($u.away)"
        $luKey = "$($u.league)|$($u.home)|$($u.away)"
        if ($lineupByMatch.ContainsKey($luKeyDate)) { $lu = $lineupByMatch[$luKeyDate] }
        elseif ($lineupByMatch.ContainsKey($luKey)) { $lu = $lineupByMatch[$luKey] }

        # ESPN: ta bort avklarade matcher
        $matchStatus = $null
        $kickoffUtc = $null
        if ($lu) {
            $matchStatus = [string]$lu.matchStatus
            $kickoffUtc = [string]$lu.kickoffUtc
            if ($matchStatus -match 'FULL_TIME|FINAL|STATUS_FINAL|STATUS_FULL_TIME') { continue }
        }

        $sc = Score-Fixture $ht $at $lu (Get-DrawRate $drawCounts[[string]$u.league])

        $value = $null
        $bestEdge = $null
        $okey = "$($u.league)|$($u.home)|$($u.away)"
        if ($oddsByMatch.ContainsKey($okey)) {
            $odWrap = $oddsByMatch[$okey]
            $od = $odWrap.odds
            $imp = @{
                home = (Get-Implied ([double]$od.home))
                draw = (Get-Implied ([double]$od.draw))
                away = (Get-Implied ([double]$od.away))
            }
            $edge1 = 0
            if ($sc.markets.'1X2'.pick -eq "1") { $edge1 = $sc.markets.'1X2'.probs.home - $imp.home }
            elseif ($sc.markets.'1X2'.pick -eq "X") { $edge1 = $sc.markets.'1X2'.probs.draw - $imp.draw }
            else { $edge1 = $sc.markets.'1X2'.probs.away - $imp.away }
            $edgeOu = $null
            if ($od.over25 -and $od.under25) {
                if ($sc.markets.OU25.pick -like "OVER*") {
                    $edgeOu = $sc.markets.OU25.pOver - (Get-Implied ([double]$od.over25))
                } else {
                    $edgeOu = (1 - $sc.markets.OU25.pOver) - (Get-Implied ([double]$od.under25))
                }
            }
            $bestEdge = [math]::Round([math]::Max($edge1, $(if ($null -ne $edgeOu) { $edgeOu } else { -1 })), 4)
            $value = [ordered]@{
                bookmaker = $odWrap.bookmaker
                odds = $od
                edge1x2 = [math]::Round($edge1, 4)
                edgeOu = $(if ($null -ne $edgeOu) { [math]::Round($edgeOu, 4) } else { $null })
                bestEdge = $bestEdge
            }
        }

        $pass = (Test-EdgeFilter $sc $bestEdge) -and -not $isPostponed   # uppskjuten: går inte att spela, aldrig bästa tips
        $row = [ordered]@{
            date = $u.date
            kickoffUtc = $kickoffUtc
            matchStatus = $matchStatus
            postponed = $isPostponed
            league = $u.league
            round = $(if ($u.round) { [string]$u.round } else { $null })
            home = $u.home
            away = $u.away
            match = "$($u.home) vs $($u.away)"
            tips = $sc.markets
            tipScore = $sc.tipScore
            eloDiff = $sc.eloDiff
            probsBeforeAvailability = $sc.probsBeforeAvailability
            availabilityNotes = $sc.availabilityNotes
            lineupNotes = $sc.lineupNotes
            playerAttackNotes = $sc.playerAttackNotes
            lineupStatus = $sc.lineupStatus
            keyOuts = $sc.keyOuts
            value = $value
            edge = $bestEdge
            passEdgeFilter = $pass
            note = "ClubElo+form+xG+playerAttack+FPL+ESPN-XI; edge-filter tipScore>=0.58"
        }
        $upcomingTips += $row
        if ($pass) { $filteredTips += $row }
    }
    # Tidigaste match forst
    $sortKick = {
        if ($_.kickoffUtc) {
            try { return [datetime]$_.kickoffUtc } catch { return [datetime]$_.date }
        }
        return [datetime]$_.date
    }
    $upcomingTips = @(
        $upcomingTips |
        Sort-Object @{ Expression = $sortKick }, @{ Expression = 'tipScore'; Descending = $true }
    )
    $filteredTips = @(
        $filteredTips |
        Sort-Object @{ Expression = $sortKick }, @{ Expression = { if ($null -ne $_.edge) { $_.edge } else { $_.tipScore } }; Descending = $true }
    )

    # Nasta omgang = tidigaste datumets round i upcoming-fixtures per liga
    $nextRound = @{}
    $upcomingRaw = @($upcoming | Sort-Object date, league)
    foreach ($fx in $upcomingRaw) {
        $lg = [string]$fx.league
        if ($nextRound.ContainsKey($lg)) { continue }
        try {
            $fxDay = [datetime]::Parse($fx.date).Date
            if ($fxDay -lt $today) { continue }
        } catch { continue }
        if ($fx.round) { $nextRound[$lg] = [string]$fx.round }
        else { $nextRound[$lg] = [string]$fx.date }
    }
    Write-Host ("Next rounds: " + (($nextRound.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ", "))

    $upcomingTips = @($upcomingTips | Where-Object {
        $lg = [string]$_.league
        if (-not $nextRound.ContainsKey($lg)) { return $false }
        $nr = $nextRound[$lg]
        if ($_.round) { return ([string]$_.round -eq $nr) }
        try {
            $first = [datetime]::Parse($nr).Date
            $day = [datetime]::Parse($_.date).Date
            $diff = ($day - $first).TotalDays
            return ($diff -ge 0 -and $diff -le 3)
        } catch { return $false }
    })
    $filteredTips = @($filteredTips | Where-Object {
        $lg = [string]$_.league
        if (-not $nextRound.ContainsKey($lg)) { return $false }
        $nr = $nextRound[$lg]
        if ($_.round) { return ([string]$_.round -eq $nr) }
        try {
            $first = [datetime]::Parse($nr).Date
            $day = [datetime]::Parse($_.date).Date
            $diff = ($day - $first).TotalDays
            return ($diff -ge 0 -and $diff -le 3)
        } catch { return $false }
    })
}

# Top model hits recently (high confidence + correct) as "what worked"
$recentBest = @($backtest | Sort-Object date -Descending | Select-Object -First 40 |
    Where-Object { $_.tipScore -ge 0.55 } |
    Sort-Object tipScore -Descending |
    Select-Object -First 10)

$store = [ordered]@{
    meta = [ordered]@{
        updatedAt = (Get-Date).ToString("o")
        source = "CSV + openfootball + understat + FPL + ClubElo + ESPN lineups + playerAttack + shots-proxy + optional odds-api"
        markets = @("1X2", "BTTS", "OU25", "CORNERS")
        leagues = $AllLeagues
        note = "Edge-filter pa bestTips. Tippar alla toppligor i store. Chans = modellens sannolikhet. Spelar-attack finjusterar."
        matchCount = $sorted.Count
        currentSeasonMatches = @($byLeagueCurrent).Count
        understatXg = $xgMeta
        bolldata = $bolldataMeta
        fplAvailability = $fplMeta
        playerAttack = $playerAttackMeta
        clubElo = $clubEloMeta
        espnLineups = $lineupMeta
        odds = $oddsMeta
        edgeFilter = @{ tipScoreMin = 0.58; confMin = 0.52; valueEdgeMin = 0.03 }
    }
    accuracy = $accuracy
    accuracyByLeague = $accuracyByLeague
    accuracyByConfidence = $accuracyByConfidence
    accuracyByConfidenceByLeague = $accuracyByConfidenceByLeague
    edgeBoards = $edgeBoards
    teams = $teamsOut
    matches = @($sorted | ForEach-Object {
        [ordered]@{
            id = $_.id; league = $_.league; season = $_.season; date = $_.date
            home = $_.home; away = $_.away; hg = $_.hg; ag = $_.ag; result = $_.result
            totalGoals = $_.totalGoals; over25 = $_.over25; btts = $_.btts; odds = $_.odds
            closing = $_.closing; kickoff = $_.kickoff; referee = $_.referee
            discipline = $_.discipline; shots = $_.shots
        }
    })
}
$closingCovered = @($sorted | Where-Object { $null -ne $_.closing.pinnacle_home -or $null -ne $_.closing.avg_home }).Count
$store.meta["closingOddsCoverage"] = [ordered]@{
    matches = $closingCovered
    rate = (Rate $closingCovered $sorted.Count)
    source = "football-data.co.uk PSC*/PC*/BFEC*/AvgC*"
}

$tipsDoc = [ordered]@{
    updatedAt = $store.meta.updatedAt
    markets = $store.meta.markets
    accuracy = $accuracy
    accuracyByLeague = $accuracyByLeague
    accuracyByConfidence = $accuracyByConfidence
    accuracyByConfidenceByLeague = $accuracyByConfidenceByLeague
    drawCalibration = $drawCalibration
    status = if ($filteredTips.Count -gt 0) { "upcoming_filtered" } elseif ($upcomingTips.Count -gt 0) { "upcoming_no_edge" } else { "no_upcoming" }
    message = if ($filteredTips.Count -gt 0) {
        "B$([char]0xE4)sta tips efter edge-filter (tipScore/confidence/value)."
    } elseif ($upcomingTips.Count -gt 0) {
        "Matcher finns men ingen passerade edge-filter - se allCandidates."
    } else {
        "Inga kommande matcher i horizon."
    }
    bestUpcoming = $filteredTips
    allCandidates = $upcomingTips
    edgeBoards = $edgeBoards
    recentModelExamples = $recentBest
    oddsMeta = $oddsMeta
}

$jsonSettings = @{ Depth = 12; Compress = $false }
# PowerShell ConvertTo-Json depth — -Compress (utan indrag ~72 % mindre), UTF8 utan BOM (Playwright/JSON.parse)
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($StorePath, ($store | ConvertTo-Json -Depth 12 -Compress), $utf8NoBom)
[System.IO.File]::WriteAllText($TipsPath, ($tipsDoc | ConvertTo-Json -Depth 12 -Compress), $utf8NoBom)

# Markdown tip sheet
$md = @()
$md += "# Betting-tips (1X2 / BTTS / O-U 2.5)"
$md += ""
$md += "Uppdaterad: $($tipsDoc.updatedAt)"
$md += ""
$md += "## Modelltraffsakerhet (2026/27, rolling backtest)"
$md += "- **1X2:** $([math]::Round(100*$accuracy.'1X2'.rate,1))% ($($accuracy.'1X2'.correct)/$($accuracy.'1X2'.tested))"
$md += "- **BTTS:** $([math]::Round(100*$accuracy.BTTS.rate,1))% ($($accuracy.BTTS.correct)/$($accuracy.BTTS.tested))"
$md += "- **O/U 2.5:** $([math]::Round(100*$accuracy.OU25.rate,1))% ($($accuracy.OU25.correct)/$($accuracy.OU25.tested))"
$md += ""
$md += "## Status"
$md += $tipsDoc.message
$md += ""
if ($tipsDoc.bestUpcoming.Count -gt 0) {
    $md += "## B$([char]0xE4)sta tips nu (edge-filter)"
    $md += ""
    foreach ($t in $tipsDoc.bestUpcoming) {
        $md += "### $($t.match) ($($t.league)) - score $($t.tipScore)"
        $md += "- **1X2:** $($t.tips.'1X2'.pick) (conf $($t.tips.'1X2'.confidence))"
        $md += "- **BTTS:** $($t.tips.BTTS.pick) (p(yes)=$($t.tips.BTTS.pYes))"
        $md += "- **O/U 2.5:** $($t.tips.OU25.pick) (p(over)=$($t.tips.OU25.pOver), xG-proxy $($t.tips.OU25.expGoals))"
        if ($null -ne $t.edge) { $md += "- Value edge: $($t.edge)" }
        if ($t.lineupStatus) { $md += "- Lineup: $($t.lineupStatus)" }
        if ($t.lineupNotes -and @($t.lineupNotes).Count -gt 0) {
            foreach ($n in @($t.lineupNotes)) { $md += "- XI: $n" }
        }
        if ($t.playerAttackNotes -and @($t.playerAttackNotes).Count -gt 0) {
            foreach ($n in @($t.playerAttackNotes)) { $md += "- Players: $n" }
        }
        if ($t.availabilityNotes -and @($t.availabilityNotes).Count -gt 0) {
            foreach ($n in @($t.availabilityNotes)) { $md += "- Availability: $n" }
        }
        $md += ""
    }
}
$md += "## PL - lag att bevaka"
$md += "### Hogst BTTS-frekvens"
foreach ($x in $edgeBoards.PL.most_btts) { $md += "- $($x.name): $([math]::Round(100*$x.bttsRate,0))% (form $($x.form))" }
$md += "### Hogst Over 2.5-frekvens"
foreach ($x in $edgeBoards.PL.most_over25) { $md += "- $($x.name): $([math]::Round(100*$x.over25Rate,0))% (form $($x.form))" }
$md += "### Bast form (ppg)"
foreach ($x in $edgeBoards.PL.best_form) { $md += "- $($x.name): $($x.ppg) ppg (form $($x.form))" }
$md += ""
$md += "## Championship - lag att bevaka"
$md += "### Hogst BTTS-frekvens"
foreach ($x in $edgeBoards.CH.most_btts) { $md += "- $($x.name): $([math]::Round(100*$x.bttsRate,0))% (form $($x.form))" }
$md += "### Hogst Over 2.5-frekvens"
foreach ($x in $edgeBoards.CH.most_over25) { $md += "- $($x.name): $([math]::Round(100*$x.over25Rate,0))% (form $($x.form))" }
$md += "### Bast form (ppg)"
foreach ($x in $edgeBoards.CH.best_form) { $md += "- $($x.name): $($x.ppg) ppg (form $($x.form))" }
$md += ""
$md += "---"
$md += "Masterdata: data/betting-store.json. Uppdatera: .\scripts\Update-BettingStore.ps1"

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($TipsMdPath, ($md -join "`n"), $utf8NoBom)

Write-Host ""
Write-Host "Store: $StorePath ($($store.meta.matchCount) matcher)"
Write-Host "Tips:  $TipsPath (edge-pass=$($tipsDoc.bestUpcoming.Count) / candidates=$($tipsDoc.allCandidates.Count))"
Write-Host "MD:    $TipsMdPath"
Write-Host "Accuracy 1X2=$($accuracy.'1X2'.rate) BTTS=$($accuracy.BTTS.rate) OU25=$($accuracy.OU25.rate)"

# Pro-lager: Dixon-Coles, devig, Kelly, vilodagar, domare, utvardering (berikar tips-latest.*)
try {
    node (Join-Path $PSScriptRoot "pro-layer.mjs") | Write-Host
} catch {
    Write-Host "Pro-layer failed: $($_.Exception.Message)"
}

# Tips ledger (append + settle)
try {
    powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "Update-TipsLedger.ps1") | Write-Host
} catch {
    Write-Host "Ledger update failed: $($_.Exception.Message)"
}
