# ECG Viewer — Format Support

Dieses Projekt zeigt ECG-Signale im Browser an.

Unterstützte Eingabeformate:
- Polar JSON (`.json`, `.jsonl`) — bestehendes Format
- ECG-Analyzer File Format V2 (`ECG0`, `.ecg`, `.bin`) — neues Binary-TLV-Format

Verwendung:
1. Öffne die `index.html` im Browser.
2. Lade eine Datei hoch: `.json`, `.jsonl` oder `.ecg` / `.bin`.
3. Die Anwendung erkennt `ECG0`-Dateien automatisch und liest nur die ECG-Proben (`E0`).

Entwicklerhinweis:
- Der Parser wurde in `index.html` als `parseECG0()` implementiert und parst den TLV-Stream gemäß der Spezifikation `ECG_FILE_FORMAT_V2.md`.
- Falls du die vollständige Spezifikation brauchst, siehe deine lokale Kopie `ECG_FILE_FORMAT_V2.md`.

Commit-Vorschlag:
```
git add README.md
git commit -m "Add README: ECG0 (ECG-Analyzer V2) format support"
```

Wenn du möchtest, mache ich den Commit für dich (brauche dein OK für Ausführung von Git-Befehlen hier).
