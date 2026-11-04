# Skapar (eller ersätter) Windows-uppgiften "Betting hemmaregeln auto": hämtar öppna odds nära avspark och loggar hemmaregeln
# var 15:e minut, dolt via scripts/hemmaregeln-auto.vbs. Inga krediter. Körs bara när du är inloggad och datorn är på.
#   powershell -ExecutionPolicy Bypass -File scripts\hemmaregeln-auto-installera.ps1            installera
#   powershell -ExecutionPolicy Bypass -File scripts\hemmaregeln-auto-installera.ps1 -TaBort   ta bort
param([switch]$TaBort)
$name = "Betting hemmaregeln auto"
if ($TaBort) {
  Unregister-ScheduledTask -TaskName $name -Confirm:$false
  Write-Output "Borttagen: $name"
  return
}
$vbs = Join-Path $PSScriptRoot "hemmaregeln-auto.vbs"
$action = New-ScheduledTaskAction -Execute "wscript.exe" -Argument "`"$vbs`""
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).Date -RepetitionInterval (New-TimeSpan -Minutes 15)
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 10) -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName $name -Action $action -Trigger $trigger -Settings $settings -Description "Loggar hemmaregeln med öppna odds nära avspark, inga krediter (Betting ny)" -Force | Out-Null
Write-Output "Installerad: $name (var 15:e minut)"
