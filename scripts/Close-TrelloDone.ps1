<#
.SYNOPSIS
  Kommentera och flytta klara Trello-kort till listan "Senare" (eller skapa "Done").
#>
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $Root ".env"
Get-Content $envPath | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
    $p = $_.Split('=', 2); [Environment]::SetEnvironmentVariable($p[0].Trim(), $p[1].Trim(), 'Process')
}
$Api = "https://api.trello.com/1"
$key = $env:TRELLO_API_KEY
$token = $env:TRELLO_TOKEN
$boardId = $env:TRELLO_BOARD_ID
if (-not $key -or -not $token -or -not $boardId) { throw "Saknar Trello credentials i .env" }

$board = Invoke-RestMethod -Uri "$Api/boards/$boardId`?key=$key&token=$token&fields=id,name"
$boardId = $board.id
$lists = Invoke-RestMethod -Uri "$Api/boards/$boardId/lists?key=$key&token=$token&fields=id,name"
$done = $lists | Where-Object { $_.name -match '(?i)^(done|klart|senare|this week)$' } | Select-Object -First 1
if (-not $done) {
    $done = $lists | Where-Object { $_.name -match '(?i)senare' } | Select-Object -First 1
}
if (-not $done) {
    $done = Invoke-RestMethod -Uri "$Api/lists" -Method Post -Body @{ key=$key; token=$token; idBoard=$boardId; name="Done"; pos="bottom" }
}
Write-Host "Done-lista: $($done.name) ($($done.id))"

$createdFiles = @(
    (Join-Path $Root "docs\tickets\2026-09-25-local-store-tips.created.json"),
    (Join-Path $Root "docs\tickets\2026-09-25-full-build.created.json")
)
$ids = @()
foreach ($f in $createdFiles) {
    if (-not (Test-Path $f)) { continue }
    $arr = ([System.IO.File]::ReadAllText($f)).TrimStart([char]0xFEFF) | ConvertFrom-Json
    foreach ($c in @($arr)) { if ($c.id) { $ids += $c.id } }
}
$ids = $ids | Select-Object -Unique
$comment = @"
DONE via Ralph-loop $(Get-Date -Format o)

Verifierat lokalt:
- data/betting-store.json
- tips + open sources + Understat xG
- FPL availability (PL)
- Playwright tests
- H2H script

Championship injuries: ingen oppen kalla (dokumenterat).
"@

$n = 0
foreach ($id in $ids) {
    try {
        Invoke-RestMethod -Uri "$Api/cards/$id/actions/comments?key=$key&token=$token" -Method Post -Body @{ text = $comment } | Out-Null
        Invoke-RestMethod -Uri "$Api/cards/$id`?key=$key&token=$token" -Method Put -Body @{ idList = $done.id } | Out-Null
        Write-Host "OK moved $id"
        $n++
    } catch {
        Write-Host "FAIL $id : $($_.Exception.Message)"
    }
}
Write-Host "Moved/commented $n cards -> $($done.name)"
