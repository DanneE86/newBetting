# Sasonger raknade fran datum och config/leagues.json i stallet for hardkodade ar (som scripts/lib/seasons.mjs).
# Host-var-ligor byter sasong 1 juli. Laddas med: . (Join-Path $PSScriptRoot "lib\Seasons.ps1")

# Startaret for host-var-sasongen som pagar (2026-10-13 -> 2026, 2027-03-01 -> 2026)
function Get-SeasonStartYear([datetime]$Date = (Get-Date)) {
    if ($Date.Month -ge 7) { return $Date.Year } else { return $Date.Year - 1 }
}

# 2026 -> "2026/27"
function Get-SplitSeasonLabel([int]$y) { return "$y/$((($y + 1) % 100).ToString('00'))" }

# football-data mmz4281: de senaste sasongerna for varje fd-main-liga (leagues.json "fd" = divisionsfil),
# nyast forst. PL och CH en sasong langre bak. Fil = data/raw/<LIGA>_<2627>.csv
function Get-FootballDataSources($Registry, [int]$StartYear = (Get-SeasonStartYear)) {
    foreach ($p in ($Registry.leagues.PSObject.Properties | Where-Object { $_.Value.history -eq "fd-main" -and $_.Value.fd })) {
        $back = if ($p.Name -in @("PL", "CH")) { 4 } else { 3 }
        for ($y = $StartYear; $y -gt $StartYear - $back; $y--) {
            $code = "$(($y % 100).ToString('00'))$((($y + 1) % 100).ToString('00'))"
            @{
                Key = "$($p.Name)_$code"; League = $p.Name; Season = (Get-SplitSeasonLabel $y)
                Url = "https://www.football-data.co.uk/mmz4281/$code/$($p.Value.fd).csv"; File = "$($p.Name)_$code.csv"
            }
        }
    }
}
