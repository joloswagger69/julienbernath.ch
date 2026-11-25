/* ==========================================================================
   Skills – drei Stufen statt Prozentzahlen (Entscheid Julien, Phase 3).
   Software-Einstufung von Julien; Beschreibungen aus dem bisherigen Mischpult.
   Handwerk und Schwerpunkte ohne Stufe, weil keine Einstufung vorliegt.
   ========================================================================== */
import type { Lang } from '../i18n/ui';

export interface Skill { name: string; tags: string }
type L<T> = Record<Lang, T>;

export const software: L<Record<'main' | 'solid' | 'basic', Skill[]>> = {
    de: {
        main: [
            { name: 'Premiere Pro', tags: 'Schnitt, Grading, Storytelling' },
            { name: 'Lightroom', tags: 'RAW-Entwicklung, Presets' },
            { name: 'Photoshop', tags: 'Retusche, Compositing' },
            { name: 'Illustrator', tags: 'Vektorgrafik, Logos, Icons' },
            { name: 'InDesign', tags: 'Editorial, Print' }
        ],
        solid: [
            { name: 'After Effects', tags: 'VFX, Motion Design' },
            { name: 'Audition', tags: 'Audio-Bearbeitung' },
            { name: 'Canva', tags: 'Content, Vorlagen' }
        ],
        basic: [{ name: 'Blender', tags: '3D, im Aufbau' }]
    },
    en: {
        main: [
            { name: 'Premiere Pro', tags: 'Editing, grading, storytelling' },
            { name: 'Lightroom', tags: 'RAW processing, presets' },
            { name: 'Photoshop', tags: 'Retouching, compositing' },
            { name: 'Illustrator', tags: 'Vector graphics, logos, icons' },
            { name: 'InDesign', tags: 'Editorial, print' }
        ],
        solid: [
            { name: 'After Effects', tags: 'VFX, motion design' },
            { name: 'Audition', tags: 'Audio editing' },
            { name: 'Canva', tags: 'Content, templates' }
        ],
        basic: [{ name: 'Blender', tags: '3D, still learning' }]
    }
};

/** KI separat aufgeführt – nach Juliens Angabe, Stufe: Grundlagen */
export const ai: L<Skill> = {
    de: { name: 'KI-Tools', tags: 'Arbeiten mit künstlicher Intelligenz, schon viel getestet' },
    en: { name: 'AI tools', tags: 'Working with artificial intelligence, extensively tested' }
};

/** Handwerk und Schwerpunkte aus dem bisherigen Mischpult (ohne Stufe) */
export const craft: L<Skill[]> = {
    de: [
        { name: 'Filmen & Regie', tags: 'Kamera, Drohne, Interviews' },
        { name: 'Fotografieren', tags: 'Sport, Natur, Tiere' },
        { name: 'Social Media', tags: 'Instagram, TikTok, YouTube, LinkedIn' }
    ],
    en: [
        { name: 'Filming & directing', tags: 'Camera, drone, interviews' },
        { name: 'Photography', tags: 'Sport, nature, wildlife' },
        { name: 'Social media', tags: 'Instagram, TikTok, YouTube, LinkedIn' }
    ]
};
