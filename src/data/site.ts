/* ==========================================================================
   Grunddaten und Texte der Website
   Wortgleich übernommen aus der bisherigen index.html (Intro, Kontakt, Schema.org).
   ========================================================================== */

export const person = {
    name: 'Julien Bernath',
    jobTitle: 'Mediamatiker EFZ',
    email: 'julien.bernath@gmx.ch',
    linkedin: 'https://www.linkedin.com/in/julienbernath/',
    locality: 'Baden',
    region: 'AG',
    country: 'CH'
} as const;

/** Beruflicher Status – Angaben von Julien (Phase-2-Freigabe). Formulierung für die Website folgt in Phase 5. */
export const status = {
    qualification: 'Mediamatiker EFZ',
    completed: '2026-07-31',
    availability: 'Offen für Neues'
} as const;

export const hero = {
    /** Text unter dem Namen (bisher: #hero-lede) */
    lede: 'Ich fotografiere Sport, schneide Videos und gestalte Grafiken, die man sich gerne zweimal anschaut. Mediamatiker aus Baden.',
    ctaWork: 'Arbeiten ansehen',
    ctaContact: 'Kontakt aufnehmen'
} as const;

export const contact = {
    title: 'Lust auf ein Projekt?',
    lede: 'Ob Matchday-Fotos, ein Clip für Social Media oder ein Flyer: Schreib mir, ich melde mich schnell.',
    copyMail: 'E-Mail kopieren',
    location: 'Baden und Zürich, Schweiz'
} as const;

/** Bisherige Meta-Angaben der Startseite */
export const meta = {
    title: 'Julien Bernath | Video, Foto & Design',
    description: 'Julien Bernath, Mediamatiker aus Baden. Sportfotografie, Videoschnitt, Social Media und Grafikdesign.',
    ogDescription: 'Mediamatiker aus Baden. Sportfotografie, Videoschnitt, Social Media und Grafikdesign.'
} as const;

/** Strukturierte Daten (Schema.org Person) – wie bisher */
export const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    url: 'https://julienbernath.ch/',
    jobTitle: person.jobTitle,
    address: { '@type': 'PostalAddress', addressLocality: person.locality, addressRegion: person.region, addressCountry: person.country },
    email: `mailto:${person.email}`,
    sameAs: [person.linkedin]
};
