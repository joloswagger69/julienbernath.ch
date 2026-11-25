// @ts-check
/* ==========================================================================
   Astro-Konfiguration für julienbernath.ch
   - site:  die eigene Domain (wichtig für Sitemap, Canonical-Links, Open Graph)
   - i18n:  Deutsch ohne Präfix (/arbeiten/), Englisch unter /en/ (/en/work/)
   ========================================================================== */
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { createHash } from 'node:crypto';
import { THEME_INIT } from './src/lib/theme-init.mjs';

// Hash des kleinen Hell/Dunkel-Skripts im <head> (wird von Astro nicht selbst gehasht)
const themeInitHash = 'sha256-' + createHash('sha256').update(THEME_INIT).digest('base64');

export default defineConfig({
    site: 'https://julienbernath.ch',

    // Jede Seite wird als Ordner mit index.html gebaut: /arbeiten/ → /arbeiten/index.html
    // Das funktioniert auf GitHub Pages ohne Server-Konfiguration.
    // CSS direkt in die Seite schreiben: keine blockierende Extra-Anfrage vor dem ersten Bild
    build: { format: 'directory', inlineStylesheets: 'always' },
    trailingSlash: 'ignore',

    i18n: {
        defaultLocale: 'de',
        locales: ['de', 'en'],
        routing: {
            prefixDefaultLocale: false,   // Deutsch: julienbernath.ch/…
            redirectToDefaultLocale: false
        }
    },

    /* Sicherheit: Content Security Policy (CSP)
       GitHub Pages erlaubt keine eigenen HTTP-Header. Astro schreibt die Richtlinie
       deshalb als <meta http-equiv="content-security-policy"> in jede Seite und
       ergänzt script-src automatisch mit Hashes aller eigenen Skripte.
       Grenzen der Meta-Variante: frame-ancestors, report-uri und sandbox werden von
       Browsern in <meta> ignoriert (siehe SECURITY_AUDIT_REPORT.md).
       Erlaubte Fremd-Adressen – alle erst nach Klick der Besucherin / des Besuchers:
       - api.web3forms.com: Versand des Kontaktformulars
       - YouTube (nocookie), TikTok, Apple Music: eingebettete Videos / Playlist */
    security: {
        csp: {
            directives: [
                "default-src 'self'",
                "base-uri 'self'",
                "object-src 'none'",
                "form-action 'self'",
                "img-src 'self' data: blob:",
                "font-src 'self'",
                "media-src 'self'",
                "connect-src 'self' https://api.web3forms.com",
                "frame-src https://www.youtube-nocookie.com https://www.tiktok.com https://embed.music.apple.com",
                "manifest-src 'self'",
                "worker-src 'none'",
                "upgrade-insecure-requests"
            ],
            // Inline-Stile (style="…", z.B. Seitenverhältnisse und Effekte im Spielmodus)
            // bleiben erlaubt; Skripte sind streng über Hashes abgesichert.
            styleDirective: { resources: ["'self'", "'unsafe-inline'"] },
            scriptDirective: { hashes: [themeInitHash] }
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
