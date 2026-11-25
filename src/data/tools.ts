/* ==========================================================================
   Die 16 Browser-Tools – Namen, Texte, Farben und Reihenfolge aus der
   bisherigen index.html (Abschnitt «Extras»), dazu englische Texte.
   Die Tools selbst liegen unverändert in public/jb-…/ und behalten ihre URLs;
   ihre Oberfläche ist Deutsch.
   ========================================================================== */
import type { Lang } from '../i18n/ui';

export interface Tool { slug: string; name: string; desc: Record<Lang, string>; color: string; art: string }

export const toolsIntro = {
    de: 'Kleine Werkzeuge, die ich für meine Arbeit gebaut habe. Sie laufen direkt im Browser, nichts wird hochgeladen.',
    en: 'Small tools I built for my own work. They run right in the browser and nothing gets uploaded. The tools themselves are in German.'
} satisfies Record<Lang, string>;

export const toolGroups: { title: Record<Lang, string>; tools: Tool[] }[] = [
    { title: { de: 'Werkzeug', en: 'Toolbox' }, tools: [
        { slug: 'jb-engine', name: 'JB Engine', color: '#9C93E6', art: 'engine', desc: {
            de: 'Bilder und Videos mit über 60 Shader-Effekten verbiegen, animieren und exportieren.',
            en: 'Bend, animate and export images and videos with more than 60 shader effects.' } },
        { slug: 'jb-matchday', name: 'JB Matchday', color: '#E3A93F', art: 'matchday', desc: {
            de: 'Spieltags- und Resultatgrafiken für Instagram – in einer Minute statt einer Stunde.',
            en: 'Matchday and result graphics for Instagram – in one minute instead of an hour.' } },
        { slug: 'jb-safezone', name: 'JB Safe Zone', color: '#4FAE9C', art: 'safezone', desc: {
            de: 'Prüft, ob Text und Gesichter auf TikTok, Reels und Shorts unter den Buttons verschwinden.',
            en: 'Checks whether text and faces disappear behind the buttons on TikTok, Reels and Shorts.' } },
        { slug: 'jb-timecode', name: 'JB Timecode', color: '#E07F9B', art: 'timecode', desc: {
            de: 'Timecodes rechnen, Framerates umwandeln und Dauer in Frames, Sekunden und Minuten.',
            en: 'Calculate timecodes, convert frame rates and express durations in frames, seconds and minutes.' } },
        { slug: 'jb-slate', name: 'JB Slate', color: '#7FB2E5', art: 'slate', desc: {
            de: 'Digitale Filmklappe fürs Handy: Szene, Take, Timecode und ein Blitz zum Synchronisieren.',
            en: 'A digital clapperboard for your phone: scene, take, timecode and a flash for syncing.' } },
        { slug: 'jb-palette', name: 'JB Palette', color: '#E3A93F', art: 'palette', desc: {
            de: 'Zieht die Farbpalette aus einem Foto – als HEX, CSS oder Bild zum Speichern.',
            en: 'Extracts the colour palette from a photo – as HEX, CSS or an image to save.' } },
        { slug: 'jb-raster', name: 'JB Raster', color: '#9FD0F0', art: 'raster', desc: {
            de: 'Drittel, Goldener Schnitt und Spirale übers Foto legen und direkt für Instagram zuschneiden.',
            en: 'Overlay thirds, the golden ratio and the spiral on a photo and crop it straight for Instagram.' } },
        { slug: 'jb-kontakt', name: 'JB Kontaktbogen', color: '#1c1b18', art: 'kontakt', desc: {
            de: 'Fotoauswahl als Filmstreifen-Bogen, Favoriten mit rotem Fettstift einkreisen.',
            en: 'Photo selection as a film-strip contact sheet – circle your favourites with a red grease pencil.' } }
    ] },
    { title: { de: 'Spielwiese', en: 'Playground' }, tools: [
        { slug: 'jb-fraktal', name: 'JB Fraktal', color: '#1b1230', art: 'fraktal', desc: {
            de: 'Mandelbrot-Zoom in Echtzeit, tief hinein ins Unendliche, mit Reisezielen und Farbpaletten.',
            en: 'Real-time Mandelbrot zoom, deep into infinity, with destinations and colour palettes.' } },
        { slug: 'jb-spiro', name: 'JB Spiro', color: '#EFEBE1', art: 'spiro', desc: {
            de: 'Spirograph mit Zahnrädern: Muster zeichnen, mischen und als PNG oder SVG speichern.',
            en: 'A spirograph with gears: draw and mix patterns and save them as PNG or SVG.' } },
        { slug: 'jb-feierabend', name: 'JB Feierabend', color: '#BFE3CD', art: 'feierabend', desc: {
            de: 'Countdown bis Feierabend und Wochenende, mit Tagesring und eigenen Terminen.',
            en: 'Countdown to the end of the workday and the weekend, with a day ring and your own events.' } },
        { slug: 'jb-morse', name: 'JB Morse', color: '#1c1b18', art: 'morse', desc: {
            de: 'Text in Morsecode übersetzen und zurück, mit Ton, Licht und Vibration zum Mitfunken.',
            en: 'Translate text to Morse code and back, with sound, light and vibration to signal along.' } },
        { slug: 'jb-reaktion', name: 'JB Reaktion', color: '#1c1b18', art: 'reaktion', desc: {
            de: 'Reaktionstest in Millisekunden: auf Farbe, auf Ton oder mit Go / No-Go.',
            en: 'Reaction test in milliseconds: to colour, to sound or as go / no-go.' } },
        { slug: 'jb-weltuhr', name: 'JB Weltuhr', color: '#14233f', art: 'weltuhr', desc: {
            de: 'Tag und Nacht an 30 Orten: praktische Städte und meine Reiseliste.',
            en: 'Day and night in 30 places: handy cities and my travel wish list.' } },
        { slug: 'jb-rechner', name: 'JB Rechner', color: '#D4D5CB', art: 'rechner', desc: {
            de: 'Rechnung teilen, MWST, Pace, Wanderzeit, Einheiten und Datum – sieben kleine Helfer.',
            en: 'Split a bill, VAT, pace, hiking time, units and dates – seven little helpers.' } },
        { slug: 'jb-pixelsort', name: 'JB Pixelsort', color: '#101010', art: 'pixelsort', desc: {
            de: 'Pixel in Streifen sortieren und aus Fotos Glitch-Kunst machen.',
            en: 'Sort pixels into streaks and turn photos into glitch art.' } }
    ] }
];

/** Bisherige Adresse eines Tools (unverändert) */
export const toolHref = (t: Tool) => `/${t.slug}/`;
