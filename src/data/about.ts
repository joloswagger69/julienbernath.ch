/* ==========================================================================
   Über mich, Steckbrief, Werdegang, Musik – Deutsch und Englisch.
   Deutsche Texte aus der bisherigen index.html (Phase 5 sprachlich geprüft).
   ========================================================================== */
import type { Lang } from '../i18n/ui';
import me1 from '../assets/about/me-1.jpg';
import me2 from '../assets/about/me-2.jpg';
import me3 from '../assets/about/me-3.webp';
import me4 from '../assets/about/me-4.jpg';
import me5 from '../assets/about/me-5.webp';
import me6 from '../assets/about/me-6.jpeg';

export const about = {
    de: {
        title: 'Über mich',
        lead: 'Ich bin Julien. Mich interessiert, wie man Ideen sichtbar macht – durch ein starkes Bild, ein sauberes Layout oder einen guten Schnitt.',
        paragraphs: [
            'Ich bin gerne draussen, entdecke neue Orte und halte Momente fotografisch fest. Berge, Städte, Reisen, Lichtstimmungen und kleine Details im Alltag inspirieren mich.',
            'Gestaltung soll ehrlich wirken: nicht überladen, nicht künstlich, sondern klar, durchdacht und mit Gefühl für Atmosphäre. Am liebsten arbeite ich an Projekten, in denen Bild, Text, Bewegung und Technik zusammenkommen.'
        ]
    },
    en: {
        title: 'About',
        lead: 'I’m Julien. I’m interested in how ideas become visible – through a strong image, a clean layout or a good edit.',
        paragraphs: [
            'I like being outdoors, discovering new places and capturing moments on camera. Mountains, cities, travel, the mood of light and small everyday details inspire me.',
            'Design should feel honest: not overloaded, not artificial, but clear, considered and with a feel for atmosphere. I enjoy projects most where image, text, motion and technology come together.'
        ]
    }
} satisfies Record<Lang, { title: string; lead: string; paragraphs: string[] }>;

/** Portrait-«Takes» in der bisherigen Reihenfolge (Take 1 = me-1) */
export const portraits = [me1, me2, me3, me4, me5, me6];
/** Bildbeschreibungen je Take (Vorschläge von Claude, von Julien zu prüfen) */
export const portraitAlts = {
    de: [
        'Julien Bernath mit Skibrille und Mütze im Schnee, dahinter Berge.',
        'Portrait von Julien Bernath, Take 2',
        'Portrait von Julien Bernath, Take 3',
        'Portrait von Julien Bernath, Take 4',
        'Portrait von Julien Bernath, Take 5',
        'Portrait von Julien Bernath, Take 6'
    ],
    en: [
        'Julien Bernath wearing ski goggles and a beanie in the snow, mountains behind him.',
        'Portrait of Julien Bernath, take 2',
        'Portrait of Julien Bernath, take 3',
        'Portrait of Julien Bernath, take 4',
        'Portrait of Julien Bernath, take 5',
        'Portrait of Julien Bernath, take 6'
    ]
} satisfies Record<Lang, string[]>;

/** Steckbrief auf der Filmklappe (ohne Alter – Entscheid Julien) */
export const slate = {
    de: [
        { label: 'Produktion', value: 'julienbernath.ch', wide: true },
        { label: 'Name', value: 'Julien Bernath' },
        { label: 'Ort', value: 'Baden, Aargau' },
        { label: 'Ausbildung', value: 'Mediamatiker EFZ' },
        { label: 'Fokus', value: 'Videoschnitt, Social Media, Fotografie', wide: true }
    ],
    en: [
        { label: 'Production', value: 'julienbernath.ch', wide: true },
        { label: 'Name', value: 'Julien Bernath' },
        { label: 'Location', value: 'Baden, Aargau' },
        { label: 'Training', value: 'Mediamatician (EFZ)' },
        { label: 'Focus', value: 'Video editing, social media, photography', wide: true }
    ]
} satisfies Record<Lang, { label: string; value: string; wide?: boolean }[]>;

interface Step { years: string; title: string; place: string; text: string; completed?: true }
export const career = {
    de: [
        { years: '2022 – 2026', title: 'Lehre als Mediamatiker EFZ', place: 'Kanton Aargau & BBBaden', text: 'Basislehrjahr beim Kanton Aargau, Berufsschule an der BBBaden. Schwerpunkte: Gestaltung, Fotografie, Video, Web, Kommunikation und digitale Medien.', completed: true },
        { years: '2021 – 2022', title: 'Gestalterischer Vorkurs', place: 'SKDZ', text: 'Vertiefung der gestalterischen Grundlagen: Bildsprache, Layout, Typografie, Komposition und kreative Arbeitsprozesse.' },
        { years: '2019', title: 'Abschluss Oberstufe', place: 'Schweiz', text: 'Abschluss der obligatorischen Schulzeit – die Grundlage für meinen gestalterischen Weg.' }
    ],
    en: [
        { years: '2022 – 2026', title: 'Apprenticeship as a Mediamatician (EFZ)', place: 'Canton of Aargau & BBBaden', text: 'Foundation year with the Canton of Aargau, vocational school at BBBaden. Focus areas: design, photography, video, web, communication and digital media.', completed: true },
        { years: '2021 – 2022', title: 'Preliminary art and design course', place: 'SKDZ', text: 'Building on the fundamentals of design: visual language, layout, typography, composition and creative processes.' },
        { years: '2019', title: 'Completion of lower secondary school', place: 'Switzerland', text: 'End of compulsory schooling – the starting point for my path into design.' }
    ]
} satisfies Record<Lang, Step[]>;

export const playlist = {
    de: { title: 'Musik beim Schneiden', hint: 'Apple Music' },
    en: { title: 'Music for editing', hint: 'Apple Music' },
    name: "Julien's Favorites",
    embed: 'https://embed.music.apple.com/ch/playlist/juliens-favorites/pl.u-kExjC7PezJ40',
    url: 'https://music.apple.com/ch/playlist/juliens-favorites/pl.u-kExjC7PezJ40'
} as const;
