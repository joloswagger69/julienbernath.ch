/* ==========================================================================
   Inhaltssammlungen
   Jedes Projekt ist eine Markdown-Datei in src/content/projects/<sprache>/.
   Das Schema prüft beim Bauen, dass alle Pflichtangaben vorhanden sind und
   jedes referenzierte Bild wirklich existiert – sonst bricht der Build ab.
   ========================================================================== */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
    schema: ({ image }) =>
        z.object({
            /** Schlüssel aus der alten script.js, zur Nachverfolgung */
            legacyId: z.string(),
            /** Projektnummer wie bisher, z.B. JB-PRJ-01 */
            code: z.string(),
            /** Reihenfolge im Archiv (wie bisher im Projekt-Bin) */
            order: z.number().int(),
            /** Position auf der Startseite (1–6) oder null = nur im Archiv */
            featured: z.number().int().min(1).max(6).nullable(),
            /** Filter-Kategorie wie bisher */
            kind: z.enum(['photo', 'video', 'design']),
            /** Ursprüngliche Kategorie-Bezeichnung, z.B. "PHOTOGRAPHY / SPORT" */
            category: z.string(),
            title: z.string(),
            client: z.string(),
            year: z.string(),
            role: z.string(),
            deliverables: z.string(),
            cover: image().optional(),
            /** Bildbeschreibung für das Vorschaubild (Vorschlag – von Julien zu prüfen) */
            coverAlt: z.string().optional(),
            /** Verwendete Programme – nur wo von Julien bestätigt */
            software: z.array(z.string()).optional(),
            /** Teamprojekt: Namen werden erst öffentlich, wenn approved = true */
            team: z.object({ members: z.array(z.string()), approved: z.boolean() }).optional(),
            /** Für Projekte ohne Bild: Name einer gezeichneten Grafik (bisher nur "site") */
            coverGraphic: z.string().optional(),
            /** Layout-Hinweis aus der alten Website (feature-l, feature-r, wide) – Entscheid in Phase 3 */
            legacyLayout: z.string().optional(),
            media: z.array(
                z.discriminatedUnion('type', [
                    z.object({ type: z.literal('image'), src: image(), alt: z.string().optional() }),
                    z.object({ type: z.literal('youtube'), id: z.string(), label: z.string(), portrait: z.boolean().optional() }),
                    z.object({ type: z.literal('tiktok'), id: z.string(), label: z.string() })
                ])
            )
        })
});

export const collections = { projects };
