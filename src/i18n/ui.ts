/* ==========================================================================
   Sprachen und Oberflächentexte
   Deutsch ist die Hauptsprache. Fehlt ein englischer Text, wird Deutsch verwendet.
   ========================================================================== */

export const languages = {
    de: 'Deutsch',
    en: 'English'
} as const;

export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'de';

/** HTML-Sprachcode und Open-Graph-Locale je Sprache */
export const locales: Record<Lang, { html: string; og: string }> = {
    de: { html: 'de-CH', og: 'de_CH' },
    en: { html: 'en', og: 'en_GB' }
};

/**
 * Seitenadressen je Sprache. Der Schlüssel (z.B. "work") verbindet die
 * deutsche und die englische Version derselben Seite – so springt der
 * Sprachumschalter immer auf die passende Seite statt auf die Startseite.
 */
export const routes = {
    home:    { de: '/',             en: '/en/' },
    work:    { de: '/arbeiten/',    en: '/en/work/' },
    about:   { de: '/ueber-mich/',  en: '/en/about/' },
    tools:   { de: '/werkzeuge/',   en: '/en/tools/' },
    contact: { de: '/kontakt/',     en: '/en/contact/' },
    imprint: { de: '/impressum/',   en: '/en/imprint/' },
    privacy: { de: '/datenschutz/', en: '/en/privacy/' }
} as const satisfies Record<string, Record<Lang, string>>;

export type RouteKey = keyof typeof routes;

export const ui = {
    de: {
        'site.name': 'Julien Bernath',
        'site.title': 'Julien Bernath | Video, Foto & Design',
        'site.description': 'Julien Bernath, Mediamatiker EFZ aus Baden. Sportfotografie, Videoschnitt, Social Media und Grafikdesign.',
        'skip': 'Direkt zum Inhalt',
        'nav.label': 'Hauptnavigation',
        'nav.work': 'Arbeiten',
        'nav.about': 'Über mich',
        'nav.tools': 'Werkzeuge',
        'nav.contact': 'Kontakt',
        'lang.label': 'Sprache wählen',
        'theme.toggle': 'Licht umschalten',
        'footer.imprint': 'Impressum',
        'footer.privacy': 'Datenschutz',
        'build.title': 'Neue Version im Aufbau',
        'build.text': 'Hier entsteht die neue Version von julienbernath.ch. Die aktuelle Website bleibt bis zur Fertigstellung unverändert online.',
        'notfound.title': 'Kein Signal',
        'notfound.text': 'Diese Seite wurde nicht gefunden.',
        'notfound.back': 'Zur Startseite'
    },
    en: {
        'site.title': 'Julien Bernath | Video, Photo & Design',
        'site.description': 'Julien Bernath, Swiss-certified Mediamatician from Baden. Sports photography, video editing, social media and graphic design.',
        'skip': 'Skip to content',
        'nav.label': 'Main navigation',
        'nav.work': 'Work',
        'nav.about': 'About',
        'nav.tools': 'Tools',
        'nav.contact': 'Contact',
        'lang.label': 'Choose language',
        'theme.toggle': 'Toggle light',
        'footer.imprint': 'Imprint',
        'footer.privacy': 'Privacy',
        'build.title': 'New version in progress',
        'build.text': 'The new version of julienbernath.ch is being built here. The current website stays online unchanged until it is finished.',
        'notfound.title': 'No signal',
        'notfound.text': 'This page could not be found.',
        'notfound.back': 'Back to home'
    }
} as const;

export type UiKey = keyof (typeof ui)['de'];
