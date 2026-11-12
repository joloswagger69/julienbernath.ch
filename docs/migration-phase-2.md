# Phase 2 – Inhaltsmigration (Branch `astro-redesign`)

Grundsatz: **Alles wird kopiert, nichts verschoben, nichts gelöscht.** Die bisherige Website
(`index.html`, `script.js`, `style.css`, `fx.js`, `assets/`, `jb-*/` …) bleibt unverändert im
Repository und ist weiterhin live. Die neue Astro-Struktur liest nur `src/` und `public/`.

## Woher kommt was?

| Inhalt | Quelle (alt, bleibt unverändert) | Ziel (neu, Kopie) |
|---|---|---|
| 13 Projekte (Texte, Metadaten, Reihenfolge) | `script.js` → `projectsData`, `BIN` | `src/content/projects/de/*.md` (1:1 automatisch übertragen) |
| 194 Projektbilder | `assets/images/<ordner>/` | `src/assets/projects/<ordner>/` |
| 6 Portraits | `assets/images/about-me/` | `src/assets/about/` |
| 5 YouTube- und 1 TikTok-Video | `script.js` (IDs) | im Projekt-Frontmatter unter `media` |
| 16 Browser-Tools (8 Werkzeug, 8 Spielwiese) | `jb-*/` | `public/jb-*/` (gleiche URLs, Dateien unverändert) |
| Gemeinsame Tool-Dateien | `extras.css`, `fehler.js`, `404.html` | `public/` (unverändert) |
| Vorschaubilder der Tool-Karten | `extras-art/` | `public/extras-art/` |
| Kontaktformular | `contact.js`, `form-config.js`, Formular-HTML in `index.html` | `public/scripts/`, `src/components/ContactForm.astro` |
| Intro-, Über-mich-, Kontakttexte, Steckbrief | `index.html` | `src/data/site.ts`, `src/data/about.ts` |
| Werdegang | `index.html` | `src/data/about.ts` |
| Skills (Mischpult) | `script.js` → `MIXER` | `src/data/skills.ts` |
| Shotlist (inkl. erledigter Punkte) | `index.html` | `src/data/shotlist.ts` |
| Apple-Music-Playlist | `index.html` | `src/data/about.ts` |
| Tool-Liste (Name, Text, Farbe, Gruppe) | `index.html` → Extras | `src/data/tools.ts` |
| Datenschutzerklärung | `index.html` → Dialog | `src/components/PrivacyText.astro` |
| Effekte (fx.js, 100+) | `fx.js` | **noch nicht** – folgt mit dem Spielmodus (Phase 4) |
| Viewer, Filter, Timeline, Theme-Schalter | `script.js` | **noch nicht** – folgt in Phase 3/4 |

## Projekte und Zielseiten

| # | Projekt | Slug (Adresse) | Bilder | Videos | Startseite |
|---|---|---|---|---|---|
| 01 | Fotoserie EHC Kloten | `ehc-kloten` | 16 | – | Ausgewählt 1 |
| 02 | TikTok-Video EHC Kloten | `ehc-kloten-tiktok` | – | 1 TikTok | Archiv |
| 03 | Fotoserie EV Zug Damen | `ev-zug-damen` | 22 | – | Ausgewählt 4 |
| 04 | Fotoserie UHC Limmattal | `uhc-limmattal` | 28 | 1 YouTube | Ausgewählt 6 |
| 06 | Dorffestflyer Ehrendingen | `dorffest-ehrendingen` | 11 | – | Ausgewählt 5 |
| 07 | Fotoserie FC Wil | `fc-wil` | 10 | – | Archiv |
| 08 | Fotoserie Lenzburg S/W | `lenzburg-sw` | 26 | – | Archiv |
| 09 | Vertiefungsarbeit «ITSON» | `itson` | 11 | 1 YouTube | Ausgewählt 2 |
| 10 | «Tika Mate»-Konzept | `tika-mate` | 15 | – | Archiv |
| 11 | Tier- & Naturfotos | `natur-tiere` | 29 | – | Archiv |
| 12 | Matchday-Grafiken UHC Bulldogs | `uhc-bulldogs-matchday` | 12 | 3 YouTube | Ausgewählt 3 |
| 13 | Sonstige Arbeiten | `sonstige-arbeiten` | 14 | – | Archiv |
| 14 | julienbernath.ch | `julienbernath-ch` | – | – | Archiv |

(Die Nummer JB-PRJ-05 existiert in der alten Website nicht.)

## Bewusste Abweichungen vom alten Text

- **Bulldogs:** Der Satz «Entwickelt in Figma für einfache, mobile Pflege durch den Verein.» wurde
  entfernt, weil Julien nie mit Figma gearbeitet hat. Ersatztext folgt nach Rückmeldung.
- **Werdegang Lehre:** ergänzt um den von Julien genannten Abschluss am 31. Juli 2026.

Alle übrigen Texte sind wortgleich übernommen. Überarbeitung erst in Phase 5 und nur nach Freigabe.

## Englisch

Die englische Sprachstruktur (`/en/…`) ist vollständig angelegt. Bis zur Übersetzung (Phase 5)
zeigen die englischen Seiten den deutschen Inhalt mit einem Hinweis. Alle Seiten sind
bis zum Go-live `noindex`.

## Nicht übernommen (bleibt im Repo)

- `assets/images/ehc-kloten-tiktok/EHC-Kloten_TikTok.mp4` (9 MB) – auf der alten Website nicht eingebunden.
  Entscheid Julien: Die TikTok-Einbettung bleibt, das MP4 wird nicht verwendet.
- `*.txt`-Notizen mit Video-Links – Inhalte sind bereits in den Projektdaten

## Bilanz der Mediendateien

`src/assets/` enthält 200 Dateien = **194 Projektbilder** (`projects/`) + **6 Portraits** (`about/`).
Jede Datei wird genau einmal in einer Galerie bzw. als Portrait verwendet. Die 9 festgelegten
Vorschaubilder (Cover) sind Bilder aus der jeweiligen Galerie und keine zusätzlichen Dateien.

## Entscheidungen von Julien für die nächsten Phasen (noch nicht umgesetzt)

| Thema | Entscheid |
|---|---|
| Bulldogs-Grafiken | erstellt mit **Photoshop und Illustrator** (kein Figma) – Text in Phase 5 ergänzen |
| Tika Mate | **Teamarbeit** – als solche kennzeichnen (Phase 5) |
| Kloten-Video | **TikTok-Einbettung** verwenden (Viewer, Phase 3) |
| Alter im Steckbrief | **automatisch berechnen** (Phase 3). Datenschutz-Hinweis: Das Repository ist öffentlich – vor der Umsetzung klären, wie das ohne veröffentlichtes Geburtsdatum geht |
| Skills-Stufen | Hauptwerkzeug: Premiere Pro, Lightroom, Photoshop, Illustrator, InDesign · sicher: After Effects, Audition, Canva · Grundlagen: Blender, **neu: KI** (arbeitet mit KI, viel getestet) |
| Impressum | Name, Ort, E-Mail – **keine Adresse** |
| Alt-Texte | Claude schlägt Bildbeschreibungen vor, Julien gibt frei |
