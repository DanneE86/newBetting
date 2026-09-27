<#
.SYNOPSIS
  Skapa Trello-kort från en JSON-backlog.

.EXAMPLE
  .\create_trello_cards.ps1 -JsonPath ..\..\..\..\docs\tickets\2026-03-25-backlog.json -DryRun
#>
param(
    [Parameter(Mandatory = $true)]
    [string]$JsonPath,
    [switch]$DryRun,
    [string]$EnvFile = ""
)

$ErrorActionPreference = "Stop"
$Api = "https://api.trello.com/1"

# scripts -> skill -> skills -> .cursor -> project root
$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..\..")).Path
if (-not $EnvFile) {
    $EnvFile = Join-Path $ProjectRoot ".env"
}

function Import-DotEnv {
    param([string]$Path)
    if (-not (Test-Path $Path)) { return }
    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith("#") -or -not $line.Contains("=")) { return }
        $parts = $line.Split("=", 2)
        $key = $parts[0].Trim()
        $value = $parts[1].Trim().Trim('"').Trim("'")
        if (-not [Environment]::GetEnvironmentVariable($key)) {
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

Import-DotEnv -Path $EnvFile

if (-not (Test-Path $JsonPath)) {
    throw "Hittar inte fil: $JsonPath"
}

$cards = Get-Content $JsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
if ($cards -isnot [System.Array]) {
    # Single object edge case
    $cards = @($cards)
}

$key = $env:TRELLO_API_KEY
$token = $env:TRELLO_TOKEN
$boardId = $env:TRELLO_BOARD_ID
$listId = $env:TRELLO_LIST_ID

if (-not $DryRun) {
    $missing = @()
    if (-not $key) { $missing += "TRELLO_API_KEY" }
    if (-not $token) { $missing += "TRELLO_TOKEN" }
    if (-not $boardId) { $missing += "TRELLO_BOARD_ID" }
    if ($missing.Count -gt 0) {
        throw "Saknar miljövariabler: $($missing -join ', '). Kopiera .env.example till .env och fyll i key+token."
    }

    # Shortlink (buDnElh0) -> full board id
    $board = Invoke-RestMethod -Uri "$Api/boards/$boardId`?key=$key&token=$token&fields=id,name" -Method Get
    $boardId = $board.id
    Write-Host "Board: $($board.name) ($boardId)"

    if (-not $listId) {
        $lists = Invoke-RestMethod -Uri "$Api/boards/$boardId/lists?key=$key&token=$token&fields=name,id" -Method Get
        Write-Host "Listor pa boarden:"
        foreach ($l in $lists) { Write-Host "  $($l.id)  $($l.name)" }

        $preferred = $lists | Where-Object {
            $_.name -match '(?i)^(backlog|att g[oö]ra|to ?do|inbox|id[eé]er|ideas|idag|denna vecka|senare)$'
        } | Select-Object -First 1

        if (-not $preferred) {
            # Skapa Backlog om bara Startguide finns
            $preferred = Invoke-RestMethod -Uri "$Api/lists" -Method Post -Body @{
                key = $key; token = $token; idBoard = $boardId; name = "Backlog"; pos = "top"
            }
            Write-Host "Skapade lista: Backlog ($($preferred.id))"
        }

        $listId = $preferred.id
        Write-Host "Anvander lista: $($preferred.name) ($listId)"
    }
}

function Get-OrCreateLabelIds {
    param([string[]]$Names)
    if (-not $Names -or $Names.Count -eq 0) { return @() }
    try {
        $existing = Invoke-RestMethod -Uri "$Api/boards/$boardId/labels?key=$key&token=$token&limit=1000" -Method Get
    } catch {
        Write-Host "Varning: kunde inte lasa labels ($($_.Exception.Message)) - skapar kort utan labels"
        return @()
    }
    $byName = @{}
    foreach ($l in $existing) {
        if ($l.name) { $byName[$l.name.ToLower()] = $l.id }
    }
    $ids = @()
    $colors = @("blue", "green", "orange", "purple", "red", "yellow", "sky", "lime", "pink", "black")
    $ci = 0
    foreach ($name in $Names) {
        $k = $name.ToLower()
        if ($byName.ContainsKey($k)) {
            $ids += $byName[$k]
            continue
        }
        try {
            $color = $colors[$ci % $colors.Count]
            $ci++
            $createdLabel = Invoke-RestMethod -Uri "$Api/labels" -Method Post -Body @{
                key = $key
                token = $token
                idBoard = $boardId
                name = $name
                color = $color
            }
            $byName[$k] = $createdLabel.id
            $ids += $createdLabel.id
        } catch {
            Write-Host "Varning: kunde inte skapa label '$name' - hoppar over"
        }
    }
    return $ids
}

$created = @()
foreach ($card in $cards) {
    $name = $card.name
    $desc = if ($card.desc) { $card.desc } else { "" }
    $labels = @()
    if ($card.labels) { $labels = @($card.labels) }
    $targetList = if ($card.idList) { $card.idList } else { $listId }

    if ($DryRun) {
        Write-Host "OK: $name -> (dry-run)"
        $created += [pscustomobject]@{ name = $name; url = "(dry-run)"; labels = $labels }
        continue
    }

    $labelIds = Get-OrCreateLabelIds -Names $labels
    $body = @{
        key    = $key
        token  = $token
        idList = $targetList
        name   = $name
        desc   = $desc
        pos    = "bottom"
    }
    if ($labelIds.Count -gt 0) {
        $body.idLabels = ($labelIds -join ",")
    }

    $result = Invoke-RestMethod -Uri "$Api/cards" -Method Post -Body $body
    $url = if ($result.shortUrl) { $result.shortUrl } else { $result.url }
    Write-Host "OK: $name -> $url"
    $created += [pscustomobject]@{ name = $name; url = $url; id = $result.id }
}

$outPath = [System.IO.Path]::ChangeExtension((Resolve-Path $JsonPath).Path, ".created.json")
$created | ConvertTo-Json -Depth 6 | Set-Content -Path $outPath -Encoding UTF8
Write-Host "`n$($created.Count) kort. Resultat sparat: $outPath"
