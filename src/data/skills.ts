/* ==========================================================================
   Skills – drei Stufen statt Prozentzahlen (Entscheid Julien, Phase 3).
   Software-Einstufung von Julien. Beschreibungen (tags) aus dem bisherigen
   Mischpult übernommen. Handwerk und Schwerpunkte ohne Stufe, weil keine
   Einstufung vorliegt.
   ========================================================================== */

export interface Skill { name: string; tags: string }

export const software = {
    main: [
        { name: 'Premiere Pro', tags: 'Schnitt, Grading, Storytelling' },
        { name: 'Lightroom', tags: 'RAW, Presets' },
        { name: 'Photoshop', tags: 'Retusche, Compositing' },
        { name: 'Illustrator', tags: 'Vektor, Logos, Icons' },
        { name: 'InDesign', tags: 'Editorial, Print' }
    ],
    solid: [
        { name: 'After Effects', tags: 'VFX, Motion' },
        { name: 'Audition', tags: 'Audio-Cleanup' },
        { name: 'Canva', tags: 'Content, Templates' }
    ],
    basic: [
        { name: 'Blender', tags: '3D, im Aufbau' }
    ]
} satisfies Record<'main' | 'solid' | 'basic', Skill[]>;

/** KI separat aufgeführt – Formulierung nach Juliens Angabe, Stufe: Grundlagen */
export const ai: Skill = {
    name: 'KI-Tools',
    tags: 'Arbeiten mit künstlicher Intelligenz, schon viel getestet'
};

/** Handwerk und Schwerpunkte aus dem bisherigen Mischpult (ohne Stufe) */
export const craft: Skill[] = [
    { name: 'Filmen & Regie', tags: 'Kamera, Drohne, Interviews' },
    { name: 'Fotografieren', tags: 'Sport, Natur, Tiere' },
    { name: 'Social Media', tags: 'Instagram, TikTok, YouTube, LinkedIn' }
];
