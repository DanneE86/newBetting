<#
.SYNOPSIS
  Ralph Wiggum iterate: fetch -> store -> playwright until COMPLETE.
  Ref: https://awesomeclaude.ai/ralph-wiggum
#>
param(
    [int]$MaxIterations = 5,
    [switch]$CloseTrello
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Read-JsonFile([string]$Path) {
    $raw = [System.IO.File]::ReadAllText($Path)
    return ($raw.TrimStart([char]0xFEFF) | ConvertFrom-Json)
}

function Invoke-Step($Name, $ScriptBlock) {
    Write-Host "`n==== $Name ====" -ForegroundColor Cyan
    & $ScriptBlock
    if ($LASTEXITCODE -ne 0 -and $null -ne $LASTEXITCODE) {
        throw "Step failed: $Name (exit $LASTEXITCODE)"
    }
}

for ($i = 1; $i -le $MaxIterations; $i++) {
    Write-Host "`n######## RALPH ITERATION $i / $MaxIterations ########" -ForegroundColor Yellow
    try {
        Invoke-Step "fetch" { powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Fetch-OpenSources.ps1 }
        Invoke-Step "store" { powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Update-BettingStore.ps1 -SkipDownload }

        $store = Read-JsonFile .\data\betting-store.json
        $tips = Read-JsonFile .\data\tips-latest.json
        $reportOk = $false
        if (Test-Path .\data\open\fetch-report.json) {
            $rep = Read-JsonFile .\data\open\fetch-report.json
            $reportOk = (@($rep.sources | Where-Object { $_.ok }).Count -ge 4)
        }
        $xgOk = Test-Path .\data\open\understat_EPL_2026_xg.json
        $fplOk = Test-Path .\data\open\fpl_availability.json
        $plXg = @($store.teams | Where-Object { $_.league -eq "PL" -and $_.xg }).Count
        $plAvail = @($store.teams | Where-Object { $_.league -eq "PL" -and $_.availability }).Count

        $checks = [ordered]@{
            matchCount = ($store.meta.matchCount -gt 500)
            tipsAccuracy = ($null -ne $tips.accuracy.'1X2' -and $null -ne $tips.accuracy.BTTS -and $null -ne $tips.accuracy.OU25)
            fetchReport = $reportOk
            understatFile = $xgOk
            fplFile = $fplOk
            plTeamsWithXg = ($plXg -ge 15)
            plTeamsWithAvail = ($plAvail -ge 15)
        }
        Write-Host ($checks | ConvertTo-Json -Compress)

        Push-Location $Root
        npx playwright test --reporter=line
        $pw = $LASTEXITCODE
        Pop-Location

        $all = $true
        foreach ($k in $checks.Keys) { if (-not $checks[$k]) { $all = $false } }
        if ($all -and $pw -eq 0) {
            Write-Host "COMPLETE" -ForegroundColor Green
            if ($CloseTrello) {
                powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Close-TrelloDone.ps1
            }
            exit 0
        }
        Write-Host "Iteration $i incomplete (pw=$pw). Retrying..." -ForegroundColor DarkYellow
    } catch {
        Write-Host "Iteration $i error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "Max iterations reached without COMPLETE" -ForegroundColor Red
exit 1
