// @ts-check
/* ==========================================================================
   Astro-Konfiguration für julienbernath.ch
   - site:  die eigene Domain (wichtig für Sitemap, Canonical-Links, Open Graph)
   - i18n:  Deutsch ohne Präfix (/arbeiten/), Englisch unter /en/ (/en/work/)
   ========================================================================== */
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
    site: 'https://julienbernath.ch',

    // Jede Seite wird als Ordner mit index.html gebaut: /arbeiten/ → /arbeiten/index.html
    // Das funktioniert auf GitHub Pages ohne Server-Konfiguration.
    build: { format: 'directory' },
    trailingSlash: 'ignore',

    i18n: {
        defaultLocale: 'de',
        locales: ['de', 'en'],
        routing: {
            prefixDefaultLocale: false,   // Deutsch: julienbernath.ch/…
            redirectToDefaultLocale: false
        }
    },

    integrations: [
        sitemap({
            i18n: {
                defaultLocale: 'de',
                locales: { de: 'de-CH', en: 'en' }
            }
        })
    ]
});
