/* ==========================================================================
   Grunddaten und Texte der Website – Deutsch (Hauptsprache) und Englisch.
   Deutsche Texte aus der bisherigen index.html, in Phase 5 sprachlich
   überarbeitet (Änderungen: docs/phase-5-texte.md).
   ========================================================================== */
import type { Lang } from '../i18n/ui';

export const person = {
    name: 'Julien Bernath',
    email: 'julien.bernath@gmx.ch',
    linkedin: 'https://www.linkedin.com/in/julienbernath/',
    locality: 'Baden',
    region: 'AG',
    country: 'CH'
} as const;

/** Beruflicher Status – Angaben von Julien (Abschluss 31. Juli 2026, offen für Neues) */
export const status = {
    de: { qualification: 'Mediamatiker EFZ', line: 'Mediamatiker EFZ seit Juli 2026 – offen für neue Aufgaben.' },
    en: { qualification: 'Mediamatician (Swiss Federal VET Diploma)', line: 'Mediamatician (Swiss Federal VET Diploma) since July 2026 – open to new opportunities.' }
} satisfies Record<Lang, { qualification: string; line: string }>;

export const hero = {
    de: {
        lede: 'Ich fotografiere Sport, schneide Videos und gestalte Grafiken, die man sich gerne zweimal anschaut. Mediamatiker aus Baden.',
        ctaWork: 'Arbeiten ansehen',
        ctaContact: 'Kontakt aufnehmen'
    },
    en: {
        lede: 'I photograph sport, edit video and design graphics worth a second look. Mediamatician based in Baden, Switzerland.',
        ctaWork: 'View work',
        ctaContact: 'Get in touch'
    }
} satisfies Record<Lang, { lede: string; ctaWork: string; ctaContact: string }>;

export const contact = {
    de: {
        title: 'Lust auf ein Projekt?',
        lede: 'Ob Matchday-Fotos, ein Clip für Social Media oder ein Flyer: Schreib mir – ich melde mich rasch.',
        location: 'Baden und Zürich, Schweiz'
    },
    en: {
        title: 'Got a project in mind?',
        lede: 'Matchday photos, a clip for social media or a flyer: drop me a line and I will get back to you soon.',
        location: 'Baden and Zurich, Switzerland'
    }
} satisfies Record<Lang, { title: string; lede: string; location: string }>;

/** Seitentitel und Beschreibungen für Suchmaschinen und Social-Media-Vorschauen */
export const meta = {
    de: {
        home: { title: 'Julien Bernath – Mediamatiker EFZ | Foto, Video & Design', description: 'Portfolio von Julien Bernath, Mediamatiker EFZ aus Baden: Sportfotografie, Videoschnitt, Social-Media-Content und Grafikdesign.' },
        work: { title: 'Arbeiten – Foto, Video & Design | Julien Bernath', description: 'Alle 13 Projekte: Sportfotografie für EHC Kloten, EV Zug und UHC Limmattal, der Kurzfilm «ITSON», Matchday-Grafiken, Printdesign und mehr.' },
        about: { title: 'Über mich | Julien Bernath', description: 'Julien Bernath, Mediamatiker EFZ aus Baden: Werdegang, Werkzeuge und was mich an Bild, Schnitt und Gestaltung interessiert.' },
        tools: { title: 'Werkzeuge – 16 Browser-Tools | Julien Bernath', description: 'Kleine Werkzeuge für Foto, Video und Social Media, direkt im Browser: Timecode-Rechner, Safe-Zone-Check, Farbpaletten, Matchday-Grafiken und mehr.' },
        contact: { title: 'Kontakt | Julien Bernath', description: 'Kontakt zu Julien Bernath, Mediamatiker EFZ aus Baden – per Formular, E-Mail oder LinkedIn.' },
        privacy: { title: 'Datenschutz | Julien Bernath', description: 'Welche Daten auf julienbernath.ch verarbeitet werden und wofür.' }
    },
    en: {
        home: { title: 'Julien Bernath – Mediamatician | Photo, Video & Design', description: 'Portfolio of Julien Bernath, Mediamatician from Baden, Switzerland: sports photography, video editing, social media content and graphic design.' },
        work: { title: 'Work – Photo, Video & Design | Julien Bernath', description: 'All 13 projects: sports photography for EHC Kloten, EV Zug and UHC Limmattal, the short film “ITSON”, matchday graphics, print design and more.' },
        about: { title: 'About | Julien Bernath', description: 'Julien Bernath, Mediamatician from Baden, Switzerland: background, tools and what drives his work in images, editing and design.' },
        tools: { title: 'Tools – 16 browser tools | Julien Bernath', description: 'Small tools for photo, video and social media that run in the browser: timecode calculator, safe-zone check, colour palettes, matchday graphics and more.' },
        contact: { title: 'Contact | Julien Bernath', description: 'Get in touch with Julien Bernath, Mediamatician from Baden, Switzerland – via form, email or LinkedIn.' },
        privacy: { title: 'Privacy | Julien Bernath', description: 'Which data is processed on julienbernath.ch and why.' }
    }
} satisfies Record<Lang, Record<'home' | 'work' | 'about' | 'tools' | 'contact' | 'privacy', { title: string; description: string }>>;

/** Strukturierte Daten (Schema.org Person) */
export const personJsonLd = (lang: Lang) => ({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    url: lang === 'de' ? 'https://julienbernath.ch/' : 'https://julienbernath.ch/en/',
    jobTitle: status[lang].qualification,
    address: { '@type': 'PostalAddress', addressLocality: person.locality, addressRegion: person.region, addressCountry: person.country },
    email: `mailto:${person.email}`,
    sameAs: [person.linkedin]
});
