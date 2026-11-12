import { defaultLang, languages, routes, ui, type Lang, type RouteKey, type UiKey } from './ui';

/** Liest die Sprache aus der Adresse: /en/… → "en", alles andere → "de" */
export function getLangFromUrl(url: URL): Lang {
    const [, first] = url.pathname.split('/');
    return first in languages ? (first as Lang) : defaultLang;
}

/** Gibt eine Funktion zurück, die Oberflächentexte in der gewünschten Sprache liefert */
export function useTranslations(lang: Lang) {
    return function t(key: UiKey): string {
        const local = ui[lang] as Partial<Record<UiKey, string>>;
        return local[key] ?? ui[defaultLang][key];
    };
}

/** Adresse einer Seite in einer bestimmten Sprache, z.B. path('work', 'en') → "/en/work/" */
export function path(key: RouteKey, lang: Lang): string {
    return routes[key][lang];
}

/** Alle Sprachversionen einer Seite (für den Sprachumschalter und hreflang) */
export function alternates(key: RouteKey): Record<Lang, string> {
    return routes[key];
}
