/* ==========================================================================
   Skills («Mischpult») – wortgleich aus script.js → MIXER übernommen.
   Die Zahlen bleiben vorerst erhalten. Laut Konzept sollen sie später durch
   drei Stufen ersetzt werden (Hauptwerkzeug / sicher / Grundlagen) –
   die Einstufung macht Julien (offene Frage).
   ========================================================================== */

export interface Channel { name: string; level: number; tags: string }
export interface Bus { bus: string; channels: Channel[] }

export const mixer: Bus[] = [
    { bus: 'Software', channels: [
        { name: 'Premiere Pro', level: 100, tags: 'Schnitt, Grading, Storytelling' },
        { name: 'Lightroom', level: 90, tags: 'RAW, Presets' },
        { name: 'Photoshop', level: 85, tags: 'Retusche, Compositing' },
        { name: 'Illustrator', level: 80, tags: 'Vektor, Logos, Icons' },
        { name: 'InDesign', level: 80, tags: 'Editorial, Print' },
        { name: 'After Effects', level: 75, tags: 'VFX, Motion' },
        { name: 'Canva', level: 70, tags: 'Content, Templates' },
        { name: 'Audition', level: 50, tags: 'Audio-Cleanup' },
        { name: 'Blender', level: 5, tags: '3D, im Aufbau' }
    ] },
    { bus: 'Handwerk', channels: [
        { name: 'Filmen & Regie', level: 90, tags: 'Kamera, Drohne, Interviews' },
        { name: 'Fotografieren', level: 80, tags: 'Sport, Natur, Tiere' }
    ] },
    { bus: 'Strategie', channels: [
        { name: 'Social Media', level: 99, tags: 'Instagram, TikTok, YouTube, LinkedIn' }
    ] }
];
