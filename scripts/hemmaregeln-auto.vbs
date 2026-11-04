' Startar hemmaregelns bevakning utan att ett konsolfönster blinkar upp. Körs var 15:e minut av Windows schemaläggare
' (uppgiften "Betting hemmaregeln auto", skapad med scripts/hemmaregeln-auto-installera.ps1). Logg: data/hemmaregeln/auto-logg.txt.
Set fso = CreateObject("Scripting.FileSystemObject")
root = fso.GetParentFolderName(fso.GetParentFolderName(WScript.ScriptFullName))
Set sh = CreateObject("WScript.Shell")
sh.CurrentDirectory = root
sh.Run "cmd /c node scripts\slabolagen\hemmaregeln.mjs --auto >> data\hemmaregeln\auto-konsol.txt 2>&1", 0, False
