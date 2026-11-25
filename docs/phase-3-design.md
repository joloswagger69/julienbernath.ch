# Phase 3 – Visuelles Design und Benutzeroberfläche (Branch `astro-redesign`)

Leitidee: **«Schnittplatz, aber erwachsen».** Die Schnitt-Elemente bleiben, sind aber Ordnungssystem
statt Spielzeug. Ein prägendes Element (der Programm-Monitor im Intro), alles andere ruhig.

## Designsystem

| Bereich | Entscheid |
|---|---|
| Farben | Graukarte `#DCDDD8` (hell), Schnittraum `#161615` (dunkel), Schwarz/Weiss, Signalrot `#E30613` nur für Name, Playhead, REC, Fokus, aktive Zustände |
| Grautexte | dunkler als bisher (`#4F504A` hell, `#A3A49C` dunkel) → WCAG AA für kleine Schrift |
| Kategorien | Clip-Label-Farben wie im Premiere-Bin: Foto Teal, Video Iris, Design Mango (kleine Farbquadrate, keine Flächen) |
| Schrift | Archivo (variable Breite): Display 66 % Breite / 860 Gewicht, Fliesstext normal. IBM Plex Mono nur für Timecode, Zähler, Jahreszahlen. Beide selbst gehostet |
| Formen | keine Karten-Boxen; Bilder randlos, Linien statt Rahmen, Radius höchstens 2–3 px |
| Bewegung | harte Schnitte statt Einblenden (Seitenwechsel per CSS View Transitions, Filter-Wechsel), Monitor-Schnitte; alles aus bei «Bewegung reduzieren» |

## Signatur-Elemente

1. **Programm-Monitor** (Startseite): ausgewählte Arbeiten in harten Schnitten (1,6 s), REC, laufender
   Timecode, Title-Safe-Ecken, Bildzähler. REC anklicken = Pause (WCAG 2.2.2). Querformate füllen den
   Monitor, Hochformate werden eingepasst (Letterbox). Bilder laden erst kurz vor dem Schnitt.
2. **Timeline unten** (34 px statt 76 px): Playhead = Scroll-Position, Timecode, Abschnitte als Clips,
   anklickbar/ziehbar, per Tastatur bedienbar. Auf dem Handy ohne Beschriftung.
3. **Filmklappe** (Über mich): Steckbrief als Klappe, «Take» wechselt per Klick, Klappe schlägt.
4. **Abspann** (Fusszeile): Status, grosse E-Mail-Adresse, «Zurückspulen».

## Seiten

- **Start:** Intro mit Name, Einzeiler, Status, Monitor · 6 ausgewählte Arbeiten (Zeile 1 gross,
  Zeile 2 asymmetrisch 7/5, Zeile 3 drei Hochformate) · «Was ich mache» (aus Projektdaten abgeleitet) · Über mich kurz
- **Arbeiten:** 13 Projekte, Filter Alle/Foto/Video/Design mit Zählern (ohne JavaScript alle sichtbar)
- **Projektseite:** Titel, grosses Vorschaubild, Beschreibung + Eckdaten (inkl. Programme/Team),
  Videos mit Klick-zum-Laden, Galerie im Rhythmus (Querformat ganz, Hochformate paarweise),
  Bildansicht (Pfeile, Wischen, Lupe, F = Vollbild, Esc), «Nächster Clip»
- **Über mich:** Text, Takes + Klappe, Werdegang, Skills in drei Stufen + KI + Handwerk, Shotlist
  (echte Checkboxen, lokal gespeichert), Playlist (Klick zum Laden)
- **Werkzeuge:** 16 Tools als Liste mit Erkennungsfarbe, gleiche URLs
- **Kontakt:** Text, E-Mail kopieren, LinkedIn, Ortszeit, gestaltetes Web3Forms-Formular (Logik unverändert)
- **Datenschutz:** gut lesbar gesetzt, Text wortgleich

## Inhaltliche Änderungen in Phase 3 (Entscheide Julien)

- Bulldogs: Programme «Photoshop, Illustrator»
- Tika Mate: Teamprojekt mit Silvan Vieille – Name nur in der Vorschau sichtbar (`approved: false`),
  ohne Freigabe erscheint öffentlich nur «Teamprojekt»
- Steckbrief: «Alter» entfernt, kein Geburtsdatum im Code
- Skills: Prozente ersetzt durch Hauptwerkzeug / Sicher / Grundlagen, KI separat
- Überschriften im Formular und in der Datenschutzerklärung h3 → h2 (nur Struktur, gleicher Text)

## Zur Prüfung durch Julien

- **Alt-Texte (Vorschläge, ungeprüft):** `coverAlt` in den 12 Projektdateien und Take 1 in `src/data/about.ts`.
  Übrige Galeriebilder: «Titel, Bild n von m».
- **Silvan Vieille:** Einverständnis zur Namensnennung, dann `approved: true` in `tika-mate.md`.

## Noch nicht umgesetzt (Phase 4/5)

Spielmodus mit den über 100 Effekten (fx.js) · englische Texte · Impressum · Datenschutz-Abschnitt 5
(Google Fonts) anpassen, wenn die neue Seite live ist · 404-Seite im neuen Design (die alte bleibt vorerst).
