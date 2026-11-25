# Remediation-Log – security/hardening

Alle Änderungen gegenüber `astro-redesign` @ `78ba1e4`. **Rollback:** Branch `security/hardening` nicht mergen, bzw. `git worktree remove .worktrees/security-hardening` + `git branch -D security/hardening`. `main`, `astro-redesign`, der Backup-Tag und die Phase-5-Arbeit bleiben davon unberührt.

| # | Datei | Änderung | Grund (Fund) |
|---|---|---|---|
| 1 | `astro.config.mjs` | `security.csp` mit Richtlinien (default/base/object/form-action/img/font/media/connect/frame/manifest/worker, upgrade-insecure-requests); `style-src 'self' 'unsafe-inline'`; Hash des Theme-Skripts in `scriptDirective.hashes` | F-01 |
| 2 | `src/lib/theme-init.mjs` (neu) | Text des Hell/Dunkel-Skripts als Konstante, damit Config und Layout denselben Text verwenden/hashen | F-01 |
| 3 | `src/layouts/Base.astro` | Theme-Skript rendert `THEME_INIT` (gleicher Code wie vorher); `<meta name="referrer" content="strict-origin-when-cross-origin">` | F-01, F-09 |
| 4 | `src/components/pages/HomePage.astro` | JSON-LD: `<` → `<` | F-07 |
| 5 | `public/scripts/contact.js` | Neue Funktion `line()`; Name, E-Mail, Reply-To, Thema und Betreff ohne Zeilenumbrüche | F-04 |
| 6 | `public/spielmodus/spielmodus.js` | Funktion `esc()`; Wackelwörter und E-Mail-Welle maskieren Text vor `innerHTML` | F-08 |
| 7 | `src/assets/projects/ev-zug/evz-1…22.jpg`, `fc-wil/fcw-1,2,7.jpg` (25 Dateien) | Nur EXIF-Felder BodySerial/LensSerial mit Nullbytes überschrieben; Pixel und Dateigrösse identisch | F-05 |
| 8 | `.github/workflows/deploy.yml` | SHA-Pinning, `contents: read` global, Pages-/OIDC-Rechte nur im Deploy-Job, `persist-credentials: false`, Timeouts, `npm audit` vor Build. **Bleibt inaktiv** | F-02 |
| 9 | `.github/workflows/security.yml` (neu) | npm audit + Signaturen + Build, Gitleaks (ganze Historie), CodeQL | F-06 |
| 10 | `.github/dependabot.yml` (neu) | Wöchentliche Update-PRs für npm und Actions, ohne Major-Sprünge | F-06 |
| 11 | `.gitleaks.toml` (neu) | Standardregeln + Ausnahme nur für den öffentlichen Web3Forms-Key in `form-config.js` | F-03, F-06 |
| 12 | `package.json`, `package-lock.json` | `astro` ^7.4.13, `@astrojs/sitemap` ^3.7.6 (Patches) | F-10 |
| 13 | `SECURITY_AUDIT_REPORT.md`, `SECURITY_REMEDIATION_LOG.md` (neu) | Dokumentation | – |

**Bewusst nicht geändert:** 238 Originaldateien im Root (Live-Seite), die 16 Werkzeuge `public/jb-*`, `public/404.html`, `public/fehler.js`, `form-config.js` (Key bleibt), Design, Texte, URLs.

## Beim Zusammenführen mit Phase 5 beachten

Die Phase-5-Änderungen liegen unkommittet auf `astro-redesign`. Nach dem Merge:

1. **`public/scripts/contact-en.js`** (Phase 5, neu) braucht dieselbe Härtung wie `contact.js`:
   - nach der `clean`-Zeile einfügen: `const line = (s) => clean(s).replace(/[^\S \t]+/g, ' ');`
   - in `subject`, `name`, `email`, `replyto`, `thema` und im `mailto`-Betreff `clean(…)`/`topic()` durch `line(…)` ersetzen.
2. Konflikt möglich in `src/layouts/Base.astro`, `src/components/pages/HomePage.astro`, `src/content.config.ts`-nahen Dateien → jeweils beide Änderungen übernehmen.
3. Danach `npx astro build` und kurz im Browser prüfen: Konsole ohne CSP-Meldungen.
4. Werden später weitere Fremddienste eingebunden (z. B. neue Embeds), muss die CSP in `astro.config.mjs` ergänzt werden – sonst blockiert der Browser sie.
