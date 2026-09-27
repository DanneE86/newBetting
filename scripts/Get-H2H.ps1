# Get head-to-head from local store
param(
    [Parameter(Mandatory=$true)][string]$HomeTeam,
    [Parameter(Mandatory=$true)][string]$AwayTeam,
    [string]$League = "",
    [int]$Limit = 10
)

$Root = Split-Path -Parent $PSScriptRoot
$raw = [System.IO.File]::ReadAllText((Join-Path $Root "data/betting-store.json"))
$store = $raw.TrimStart([char]0xFEFF) | ConvertFrom-Json
$matches = @($store.matches | Where-Object {
    (($_.home -eq $HomeTeam -and $_.away -eq $AwayTeam) -or ($_.home -eq $AwayTeam -and $_.away -eq $HomeTeam)) -and
    (-not $League -or $_.league -eq $League)
} | Sort-Object date -Descending | Select-Object -First $Limit)

$matches | ForEach-Object {
    [pscustomobject]@{
        date = $_.date
        league = $_.league
        match = "$($_.home) $($_.hg)-$($_.ag) $($_.away)"
        result = $_.result
        btts = $_.btts
        over25 = $_.over25
    }
} | Format-Table -AutoSize

Write-Host "H2H count: $($matches.Count)"
