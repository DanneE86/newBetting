# Skapar (eller ersätter) Windows-uppgiften "Betting hastar auto" som kör scripts/hastar-auto.mjs var 10:e minut,
# dolt via scripts/hastar-auto.vbs. Körs bara när du är inloggad och datorn är på.
#   powershell -ExecutionPolicy Bypass -File scripts\hastar-auto-installera.ps1            installera
#   powershell -ExecutionPolicy Bypass -File scripts\hastar-auto-installera.ps1 -TaBort   ta bort
param([switch]$TaBort)
$name = "Betting hastar auto"
if ($TaBort) {
  Unregister-ScheduledTask -TaskName $name -Confirm:$false
  Write-Output "Borttagen: $name"
  return
}
$vbs = Join-Path $PSScriptRoot "hastar-auto.vbs"
$action = New-ScheduledTaskAction -Execute "wscript.exe" -Argument "`"$vbs`""
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).Date -RepetitionInterval (New-TimeSpan -Minutes 10)
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 20) -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName $name -Action $action -Trigger $trigger -Settings $settings -Description "Hämtar dagens V-spel kl. 10, 2 h, 45 min och 15 min före start och rättar uppföljningen (Betting ny)" -Force | Out-Null
Write-Output "Installerad: $name (var 10:e minut)"
