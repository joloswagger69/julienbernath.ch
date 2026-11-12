/* ==========================================================================
   Über mich, Steckbrief, Werdegang, Musik
   Wortgleich übernommen aus der bisherigen index.html.
   ========================================================================== */
import me1 from '../assets/about/me-1.jpg';
import me2 from '../assets/about/me-2.jpg';
import me3 from '../assets/about/me-3.webp';
import me4 from '../assets/about/me-4.jpg';
import me5 from '../assets/about/me-5.webp';
import me6 from '../assets/about/me-6.jpeg';

export const about = {
    title: 'Über mich',
    lead: 'Ich bin Julien. Mich interessiert, wie man Ideen sichtbar macht, ob durch ein starkes Bild, ein sauberes Layout oder einen guten Schnitt.',
    paragraphs: [
        'Ich bin gerne draussen, entdecke neue Orte und halte Momente fotografisch fest. Berge, Städte, Reisen, Lichtstimmungen und kleine Details im Alltag inspirieren mich.',
        'Gestaltung soll ehrlich wirken. Nicht überladen, nicht künstlich, sondern klar, durchdacht und mit Gefühl für Atmosphäre. Am liebsten arbeite ich an Projekten, bei denen Bild, Text, Bewegung und Technik zusammenkommen.'
    ]
} as const;

/** Portrait-«Takes» in der bisherigen Reihenfolge (Take 1 = me-1) */
export const portraits = [me1, me2, me3, me4, me5, me6];
export const portraitAlt = 'Portrait von Julien Bernath';

/** Steckbrief auf der Filmklappe. Hinweis: «Alter 22» ist fest eingetragen – Entscheid offen (Phase 5). */
export const slate = [
    { label: 'Produktion', value: 'julienbernath.ch', wide: true },
    { label: 'Name', value: 'Julien Bernath' },
    { label: 'Alter', value: '22' },
    { label: 'Ort', value: 'Baden, Aargau' },
    { label: 'Ausbildung', value: 'Mediamatiker EFZ' },
    { label: 'Fokus', value: 'Videoschnitt, Social Media, Fotografie', wide: true }
] as const;

export const career = [
    {
        years: '2022 – 2026',
        title: 'Lehre als Mediamatiker EFZ',
        place: 'Kanton Aargau & BBBaden',
        text: 'Basislehrjahr beim Kanton Aargau, Berufsschule an der BBBaden. Schwerpunkte in Gestaltung, Fotografie, Video, Web, Kommunikation und digitalen Medien.',
        /** Angabe von Julien (Phase-2-Freigabe) */
        completed: '2026-07-31'
    },
    {
        years: '2021 – 2022',
        title: 'Gestalterischer Vorkurs',
        place: 'SKDZ',
        text: 'Vertiefung der gestalterischen Grundlagen: Bildsprache, Layout, Typografie, Komposition und kreative Arbeitsprozesse.'
    },
    {
        years: '2019',
        title: 'Abschluss Oberstufe',
        place: 'Schweiz',
        text: 'Abschluss der obligatorischen Schulzeit und Grundlage für den weiteren gestalterischen Weg.'
    }
] as const;

export const playlist = {
    title: 'Musik beim Schneiden',
    hint: 'Apple Music',
    name: "Julien's Favorites",
    embed: 'https://embed.music.apple.com/ch/playlist/juliens-favorites/pl.u-kExjC7PezJ40',
    url: 'https://music.apple.com/ch/playlist/juliens-favorites/pl.u-kExjC7PezJ40'
} as const;
