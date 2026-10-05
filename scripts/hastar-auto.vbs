' Startar scripts/hastar-auto.mjs utan att ett konsolfönster blinkar upp. Körs var 10:e minut av Windows schemaläggare
' (uppgiften "Betting hastar auto", skapad med scripts/hastar-auto-installera.ps1). Logg: data/hastar/auto-logg.txt.
Set fso = CreateObject("Scripting.FileSystemObject")
root = fso.GetParentFolderName(fso.GetParentFolderName(WScript.ScriptFullName))
Set sh = CreateObject("WScript.Shell")
sh.CurrentDirectory = root
sh.Run "cmd /c node scripts\hastar-auto.mjs >> data\hastar\auto-konsol.txt 2>&1", 0, False
