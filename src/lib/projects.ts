/* ==========================================================================
   Hilfsfunktionen für Projekte (Laden, Sortieren, Beschriftungen)
   Beschriftungen wie bisher in script.js (KIND, CAT_DE, lengthLabel).
   ========================================================================== */
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';

export type Project = CollectionEntry<'projects'>;

/** Slug aus der Datei-ID: "de/ehc-kloten" → "ehc-kloten" */
export const slugOf = (p: Project) => p.id.split('/').pop()!;

/**
 * Projekte einer Sprache, sortiert wie im bisherigen Projekt-Bin.
 * Englische Einträge gibt es erst ab Phase 5 – bis dahin wird Deutsch verwendet.
 */
export async function getProjects(lang: Lang): Promise<{ project: Project; translated: boolean }[]> {
    const all = await getCollection('projects');
    const de = all.filter((p) => p.id.startsWith('de/'));
    return de
        .map((base) => {
            const local = lang === 'de' ? base : all.find((p) => p.id === `${lang}/${slugOf(base)}`);
            return { project: local ?? base, translated: lang === 'de' || !!local };
        })
        .sort((a, b) => a.project.data.order - b.project.data.order);
}

export const projectPath = (slug: string, lang: Lang) => (lang === 'de' ? `/arbeiten/${slug}/` : `/en/work/${slug}/`);

export const KIND_LABEL = {
    photo: { de: 'Foto', en: 'Photo' },
    video: { de: 'Video', en: 'Video' },
    design: { de: 'Design', en: 'Design' }
} as const;

const CAT: Record<Lang, Record<string, string>> = { de: {
    'PHOTOGRAPHY': 'Fotografie', 'VIDEO': 'Video', 'SOCIAL MEDIA': 'Social Media', 'PRINT DESIGN': 'Printdesign',
    'BRANDING': 'Branding', 'DESIGN': 'Design', 'GRAPHICS': 'Grafik', 'WEB DEVELOPMENT': 'Webentwicklung',
    'UI-UX': 'UI/UX', 'CONCEPT': 'Konzept', 'SPORT': 'Sport', 'ART': 'Freie Arbeit', 'NATURE': 'Natur'
}, en: {
    'PHOTOGRAPHY': 'Photography', 'VIDEO': 'Video', 'SOCIAL MEDIA': 'Social media', 'PRINT DESIGN': 'Print design',
    'BRANDING': 'Branding', 'DESIGN': 'Design', 'GRAPHICS': 'Graphics', 'WEB DEVELOPMENT': 'Web development',
    'UI-UX': 'UI/UX', 'CONCEPT': 'Concept', 'SPORT': 'Sport', 'ART': 'Personal work', 'NATURE': 'Nature'
} };

/** "PHOTOGRAPHY / SPORT" → "Fotografie, Sport" bzw. "Photography, Sport" */
export const categoryLabel = (category: string, lang: Lang = 'de') =>
    category.split('/').map((x) => CAT[lang][x.trim()] ?? x.trim()).join(', ');

export const imagesOf = (p: Project) => p.data.media.filter((m) => m.type === 'image');
export const videosOf = (p: Project) => p.data.media.filter((m) => m.type !== 'image');

/** "1 Video, 11 Bilder" bzw. "1 video, 11 images" – wie bisher auf den Projektkarten */
export function lengthLabel(p: Project, lang: Lang = 'de') {
    const v = videosOf(p).length, i = imagesOf(p).length, out: string[] = [];
    const en = lang === 'en';
    if (v) out.push(`${v} ${v === 1 ? (en ? 'video' : 'Video') : (en ? 'videos' : 'Videos')}`);
    if (i) out.push(`${i} ${en ? 'images' : 'Bilder'}`);
    return out.join(', ') || 'Live';
}

/** Vorschaubild: festgelegtes Cover oder erstes Bild (wie bisher previewOf) */
export const coverOf = (p: Project) => p.data.cover ?? imagesOf(p)[0]?.src;

/** Bildbeschreibung des Vorschaubilds; ohne Vorschlag der Projekttitel */
export const coverAltOf = (p: Project) => p.data.coverAlt ?? p.data.title;

/** Bildbeschreibung eines Galeriebilds: eigener Text, sonst Text des Vorschaubilds, sonst Titel + Nummer */
export function imageAlt(p: Project, m: { src: { src: string }; alt?: string }, fallback: string) {
    if (m.alt) return m.alt;
    const cover = coverOf(p);
    return cover && cover.src === m.src.src && p.data.coverAlt ? p.data.coverAlt : fallback;
}

/**
 * Team-Angabe: Namen nur, wenn Julien sie freigegeben hat – in der (nicht
 * veröffentlichten) Vorschau werden sie zur Kontrolle angezeigt und markiert.
 */
export function teamOf(p: Project, preview: boolean): { names: string[] | null; pending: boolean } | null {
    const team = p.data.team;
    if (!team) return null;
    if (team.approved) return { names: team.members, pending: false };
    return preview ? { names: team.members, pending: true } : { names: null, pending: true };
}

export function videoUrl(m: { type: 'youtube' | 'tiktok'; id: string }) {
    return m.type === 'youtube'
        ? `https://www.youtube.com/watch?v=${m.id}`
        : `https://www.tiktok.com/@ehc_kloten/video/${m.id}`;
}
