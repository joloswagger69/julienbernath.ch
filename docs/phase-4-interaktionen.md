# Phase 4 – Interaktionen und Funktionalität (Branch `astro-redesign`)

Ohne zusätzliche JavaScript-Bibliotheken. Normale Seiten laden 5–9 KB eigenes Skript (direkt in der Seite).

## Funktionen der Website

| Funktion | Bedienung | Barrierefreiheit / Datenschutz |
|---|---|---|
| **Bildansicht** | ← → blättern · Klick, Doppeltipp, «Zoom»-Knopf oder `+`/`−` zoomen · im Zoom ziehen bzw. Pfeiltasten = Ausschnitt verschieben · «Vollbild»-Knopf oder `F` · `Esc` / «Schliessen» · seitlich wischen | natives `<dialog>`: Fokus bleibt im Viewer und kehrt zum geöffneten Bild zurück; Seite dahinter scrollt nicht |
| **Projektfilter** | Alle / Foto / Video / Design, per Klick, Tipp oder Tastatur | `aria-pressed`, Ansage «n Arbeiten angezeigt»; Clips gleiten an den neuen Platz (aus bei «Bewegung reduzieren») |
| **Portrait-Takes** | Klick/Tipp auf das Foto = nächster Take, Filmklappe schlägt | nächstes Bild lädt erst bei Bedarf |
| **Shotlist** | 43 Einträge abhaken, Zähler, «Zurücksetzen» | nur lokal (`jb2-shotlist2`), gespeichert wird nur die Abweichung vom Stand von Julien |
| **Playlist** | «Playlist laden» | ohne Klick keine Anfrage an Apple Music |
| **Videos** | «Video abspielen» | ohne Klick keine Anfrage an YouTube/TikTok |
| **Timeline** | Klick = springen, Ziehen = scrubben, Tastatur ← → (5 %), Bild ↑/↓ (Abschnitt), Pos1/Ende | `role="slider"` mit Timecode und Abschnitt als `aria-valuetext` |
| **Monitor** | REC = Bildwechsel anhalten/fortsetzen | startet angehalten bei «Bewegung reduzieren» |
| **Hell/Dunkel, E-Mail kopieren, Ortszeit, Handy-Menü** | wie bisher | Menü mit `Esc`, beginnt genau unter der Kopfzeile |

## Spielmodus

- **Dateien:** `public/spielmodus/spielmodus.js` und `spielmodus.css` – eine angepasste Kopie der Effekte aus `fx.js` (das Original bleibt unverändert).
- **Umfang:** alle **101 Effekte** der bisherigen Website (identische Liste), alle 17 Geheimwörter, Konami-Code, J/K/L-Shuttle, Leertaste, Marker (M), Hintergründe (B), Cursor (C), Zufallsclip (Z), Bildschirmschoner, Mischpult (aus den neuen Skill-Stufen, ohne Prozentzahlen).
- **Einschalten:** «Spielmodus einschalten» in der Fusszeile jeder Seite oder auf der Werkzeuge-Seite. Erst dann werden die 92 KB geladen; der Zustand bleibt gespeichert (`jb3-play`).
- **Ausschalten:** ganz oben im FX-Panel oder in der Fusszeile – die Seite lädt neu, alle Effekte sind weg.
- **Rücksicht auf Lesbarkeit:** System-Cursor bleibt Standard (eigener Cursor nur auf Wunsch, nie auf Touch); verzerrende Effekte (Kopfstand, Spiegel, Unschärfe, VHS …) enden nach 2–6 Sekunden; Name und Überschriften behalten beim «Entschlüsseln» ihren lesbaren Namen für Screenreader; bei «Bewegung reduzieren» sind bewegte Effekte aus.

## Bekannte Grenze

Auf Touch-Geräten unterdrückt Chrome einen Tipp, der innerhalb von ca. 0,3 s nach einer Wischgeste erfolgt (Browser-Gestenerkennung). Danach reagieren alle Knöpfe normal.
