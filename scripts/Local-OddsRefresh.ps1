<#
.SYNOPSIS
  Lokal oddshamtning nara matchdag (The Odds API-nyckeln finns bara i .env, inte i GitHub).
  1. git pull (senaste data fran dagliga CI-korningen)
  2. Odds for ligor med match inom 2 dagar, inom manadsbudget (ODDS_BUDGET=auto)
  3. Pro-lagret kopplar oddsen till tipsen + datagranskning
  4. Commit + push -> CI:s reservkalla behaller API-oddsen, webbversionen far dem vid nasta bygge

  Kor manuellt: npm run odds:local (inget schema - data hamtas bara nar du ber om det)
  Logg: logs/odds-refresh.log
#>
param(
    [int]$HorizonDays = 2,
    [switch]$NoPush
)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
$logDir = Join-Path $Root "logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$log = Join-Path $logDir "odds-refresh.log"

function Log([string]$msg) {
    $line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') $msg"
    Write-Host $line
    Add-Content -Path $log -Value $line -Encoding UTF8
}

Log "=== Lokal oddshamtning (horisont $HorizonDays d) ==="

if (-not $NoPush) {
    git pull --rebase --autostash -q 2>&1 | ForEach-Object { Log "git: $_" }
    if ($LASTEXITCODE -ne 0) {
        git rebase --abort 2>$null
        Log "FEL: git pull misslyckades - kor utan push"
        $NoPush = $true
    }
}

$env:ODDS_HORIZON_DAYS = "$HorizonDays"
$env:ODDS_BUDGET = "auto"
powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "Fetch-OddsApi.ps1") 2>&1 |
    Where-Object { $_ -notmatch '^Fetching odds' } | ForEach-Object { Log "odds: $_" }

node (Join-Path $PSScriptRoot "pro-layer.mjs") 2>&1 | Select-String 'Pro-lager' | ForEach-Object { Log "pro: $_" }
node (Join-Path $PSScriptRoot "audit-leagues.mjs") --quiet 2>&1 | ForEach-Object { Log "audit: $_" }

if ($NoPush) { Log "Klar (ingen push)"; exit 0 }

git add data/open/upcoming_odds.json data/tips-latest.json data/tips-latest.md data/open/league-audit.json docs/analys/liga-datagranskning.md
git diff --cached --quiet
if ($LASTEXITCODE -eq 0) { Log "Inga nya odds att committa"; exit 0 }
git commit -q -m "Data: lokal oddshamtning $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
for ($i = 1; $i -le 3; $i++) {
    git push -q 2>&1 | ForEach-Object { Log "git: $_" }
    if ($LASTEXITCODE -eq 0) { Log "Pushat"; exit 0 }
    git pull --rebase -q 2>&1 | ForEach-Object { Log "git: $_" }
    if ($LASTEXITCODE -ne 0) {
        # Samma datafiler andrade av CI: ta var egna odds, CI:s ovriga data
        git checkout --theirs data/open/upcoming_odds.json 2>$null
        git checkout --ours data/tips-latest.json data/tips-latest.md data/open/league-audit.json docs/analys/liga-datagranskning.md 2>$null
        git add -A data docs/analys
        $env:GIT_EDITOR = "true"
        git rebase --continue 2>&1 | ForEach-Object { Log "git: $_" }
    }
}
Log "FEL: push misslyckades efter 3 forsok - committen ligger kvar lokalt"
exit 1
