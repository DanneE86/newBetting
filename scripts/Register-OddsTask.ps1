<#
.SYNOPSIS
  Schemalagger lokal oddshamtning (scripts/Local-OddsRefresh.ps1) i Windows Aktivitetsschemaraaren.
  Kors dagligen efter CI:s morgonkorning (06:00). Missad tid (datorn avstangd) -> kors nar datorn startar.

  Registrera:  npm run odds:schedule            (standard 11:30)
               powershell -File scripts/Register-OddsTask.ps1 -At 10:00
  Ta bort:     powershell -File scripts/Register-OddsTask.ps1 -Remove
#>
param(
    [string]$At = "11:30",
    [switch]$Remove
)
$ErrorActionPreference = "Stop"
$TaskName = "Betting - lokal oddshamtning"
$Root = Split-Path -Parent $PSScriptRoot

if ($Remove) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host "Borttagen: $TaskName"
    exit 0
}

$script = Join-Path $PSScriptRoot "Local-OddsRefresh.ps1"
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$script`"" `
    -WorkingDirectory $Root
$trigger = New-ScheduledTaskTrigger -Daily -At $At
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 20) -RunOnlyIfNetworkAvailable
Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings `
    -Description "Hamtar odds (The Odds API) for ligor med match inom 2 dagar och pushar till GitHub." -Force | Out-Null
$t = Get-ScheduledTask -TaskName $TaskName
Write-Host "Schemalagd: '$TaskName' dagligen $At (nasta: $((Get-ScheduledTaskInfo -TaskName $TaskName).NextRunTime))"
