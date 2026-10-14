# Skapar (eller ersätter) Windows-uppgiften "Betting databas auto" som kör scripts/databas-auto.mjs varje timme,
# dolt via scripts/databas-auto.vbs. Den bygger bara om databaser som är äldre än 3 dygn, annars gör den inget.
#   powershell -ExecutionPolicy Bypass -File scripts\databas-auto-installera.ps1            installera
#   powershell -ExecutionPolicy Bypass -File scripts\databas-auto-installera.ps1 -TaBort   ta bort
param([switch]$TaBort)
$name = "Betting databas auto"
if ($TaBort) {
  Unregister-ScheduledTask -TaskName $name -Confirm:$false
  Write-Output "Borttagen: $name"
  return
}
$vbs = Join-Path $PSScriptRoot "databas-auto.vbs"
$action = New-ScheduledTaskAction -Execute "wscript.exe" -Argument "`"$vbs`""
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).Date -RepetitionInterval (New-TimeSpan -Hours 1)
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 30) -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName $name -Action $action -Trigger $trigger -Settings $settings -Description "Bygger om databas/*.sqlite ur data/ när de är äldre än 3 dygn (Betting ny)" -Force | Out-Null
Write-Output "Installerad: $name (kollar varje timme, bygger om efter 3 dygn)"
