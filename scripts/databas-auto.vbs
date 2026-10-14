' Startar scripts/databas-auto.mjs utan att ett konsolfönster blinkar upp. Körs varje timme av Windows schemaläggare
' (uppgiften "Betting databas auto", skapad med scripts/databas-auto-installera.ps1). Logg: databas/auto-logg.txt.
Set fso = CreateObject("Scripting.FileSystemObject")
root = fso.GetParentFolderName(fso.GetParentFolderName(WScript.ScriptFullName))
Set sh = CreateObject("WScript.Shell")
sh.CurrentDirectory = root
sh.Run "cmd /c node scripts\databas-auto.mjs >> databas\auto-konsol.txt 2>&1", 0, False
