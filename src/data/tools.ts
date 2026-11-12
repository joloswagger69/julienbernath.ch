/* ==========================================================================
   Die 16 Browser-Tools – Namen, Texte, Farben und Reihenfolge wortgleich aus
   der bisherigen index.html (Abschnitt «Extras»).
   Die Tools selbst liegen unverändert in public/jb-…/ und behalten ihre URLs.
   «art» verweist auf die gezeichnete Vorschau der alten Karte (style.css,
   .art-*) – die Gestaltung der Karten folgt in Phase 3.
   ========================================================================== */

export interface Tool { slug: string; name: string; desc: string; color: string; art: string }

export const toolsIntro = 'Kleine Werkzeuge, die ich für meine Arbeit gebaut habe. Laufen direkt im Browser, nichts wird hochgeladen.';

export const toolGroups: { title: string; tools: Tool[] }[] = [
    { title: 'Werkzeug', tools: [
        { slug: 'jb-engine', name: 'JB Engine', desc: 'Bilder und Videos mit über 60 Shader-Effekten verbiegen, animieren und exportieren.', color: '#9C93E6', art: 'engine' },
        { slug: 'jb-matchday', name: 'JB Matchday', desc: 'Spieltags- und Resultatgrafiken für Instagram, in einer Minute statt einer Stunde.', color: '#E3A93F', art: 'matchday' },
        { slug: 'jb-safezone', name: 'JB Safe Zone', desc: 'Prüft, ob Text und Gesichter auf TikTok, Reels und Shorts unter den Buttons verschwinden.', color: '#4FAE9C', art: 'safezone' },
        { slug: 'jb-timecode', name: 'JB Timecode', desc: 'Timecodes rechnen, Framerates umwandeln und Dauer in Frames, Sekunden und Minuten.', color: '#E07F9B', art: 'timecode' },
        { slug: 'jb-slate', name: 'JB Slate', desc: 'Digitale Filmklappe fürs Handy: Szene, Take, Timecode und ein Blitz zum Synchronisieren.', color: '#7FB2E5', art: 'slate' },
        { slug: 'jb-palette', name: 'JB Palette', desc: 'Zieht die Farbpalette aus einem Foto, als HEX, CSS oder Bild zum Speichern.', color: '#E3A93F', art: 'palette' },
        { slug: 'jb-raster', name: 'JB Raster', desc: 'Drittel, Goldener Schnitt und Spirale übers Foto legen und direkt für Instagram zuschneiden.', color: '#9FD0F0', art: 'raster' },
        { slug: 'jb-kontakt', name: 'JB Kontaktbogen', desc: 'Fotoauswahl als Filmstreifen-Bogen, Favoriten mit rotem Fettstift einkreisen.', color: '#1c1b18', art: 'kontakt' }
    ] },
    { title: 'Spielwiese', tools: [
        { slug: 'jb-fraktal', name: 'JB Fraktal', desc: 'Mandelbrot-Zoom in Echtzeit, tief hinein ins Unendliche, mit Reisezielen und Farbpaletten.', color: '#1b1230', art: 'fraktal' },
        { slug: 'jb-spiro', name: 'JB Spiro', desc: 'Spirograph mit Zahnrädern: Muster zeichnen, mischen und als PNG oder SVG speichern.', color: '#EFEBE1', art: 'spiro' },
        { slug: 'jb-feierabend', name: 'JB Feierabend', desc: 'Countdown bis Feierabend und Wochenende, mit Tagesring und eigenen Terminen.', color: '#BFE3CD', art: 'feierabend' },
        { slug: 'jb-morse', name: 'JB Morse', desc: 'Text in Morsecode übersetzen und zurück, mit Ton, Licht und Vibration zum Mitfunken.', color: '#1c1b18', art: 'morse' },
        { slug: 'jb-reaktion', name: 'JB Reaktion', desc: 'Reaktionstest in Millisekunden: auf Farbe, auf Ton oder mit Go / No-Go.', color: '#1c1b18', art: 'reaktion' },
        { slug: 'jb-weltuhr', name: 'JB Weltuhr', desc: 'Tag und Nacht an 30 Orten: praktische Städte und meine Reiseliste.', color: '#14233f', art: 'weltuhr' },
        { slug: 'jb-rechner', name: 'JB Rechner', desc: 'Rechnung teilen, MWST, Pace, Wanderzeit, Einheiten und Datum. Sieben kleine Helfer.', color: '#D4D5CB', art: 'rechner' },
        { slug: 'jb-pixelsort', name: 'JB Pixelsort', desc: 'Pixel in Streifen sortieren und aus Fotos Glitch-Kunst machen.', color: '#101010', art: 'pixelsort' }
    ] }
];

/** Bisherige Adresse eines Tools (unverändert) */
export const toolHref = (t: Tool) => `/${t.slug}/`;
