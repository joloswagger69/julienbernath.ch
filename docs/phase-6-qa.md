# Phase 6 – Abschluss-QA vor dem Go-live

**Stand:** 25.11.2026 · Branch `astro-redesign` · **noch nicht committet, nichts gepusht** · `main` (Live-Seite) unverändert

## 1. Was in Phase 6 passiert ist

| Schritt | Ergebnis |
|---|---|
| Sicherheits-Branch zusammengeführt | `security/hardening` (`2fb0407`) in `astro-redesign` gemergt. 1 Konflikt in `HomePage.astro` gelöst: Phase-5-Texte bleiben, JSON-LD-Maskierung zusätzlich |
| `contact-en.js` gehärtet | gleiche Zeilenumbruch-Bereinigung wie `contact.js`; Logik beider Dateien identisch (nur Meldungstexte unterschiedlich) |
| Inhalte von der Live-Seite übernommen | 14 neue Bilder `sonst-15` bis `sonst-28` (Kopien aus `main`, keine Metadaten-Probleme) mit Alt-Text-**Vorschlägen** DE/EN; Vorschaubilder wie live: FC Wil → `fcw-2`, Tier- & Naturfotos → `nt-27`, Sonstige Arbeiten → `sonst-26`. Die bisherigen Vorschaubilder behalten ihren Alt-Text in der Galerie |
| Shiki ausgeschaltet | Keine Code-Blöcke in den Inhalten; entfernt die CSP-Warnung beim Build |
| Vorschau-Hinweis | «Inhalte migriert, Gestaltung folgt» → «Vorschau · noch nicht veröffentlicht» (DE/EN). Verschwindet beim Go-live |

Alle 13 Galerien sind jetzt **bildgleich mit der Live-Seite** (gleiche Bilder, gleiche Reihenfolge, gleiche Vorschaubilder).

## 2. Testergebnisse

| Test | Ergebnis |
|---|---|
| Build | ✅ 38 Seiten, keine Warnungen |
| Konsole, alle 38 Seiten (Desktop) | ✅ 0 Fehler, 0 CSP-Verstösse |
| Horizontales Scrollen bei 375 px und 768 px, alle 38 Seiten | ✅ keines (76 Prüfungen) |
| Struktur je Seite: genau ein `h1`, `main`, Skip-Link, `lang`, alle Links/Buttons benannt | ✅ |
| Interne Links und Ressourcen (977) | ✅ keiner kaputt |
| 16 Werkzeuge erreichbar und unverändert | ✅ |
| Externe Links (YouTube ×5, TikTok, Apple Music) | ✅ 200 · LinkedIn antwortet Bots mit 999 (normal, im Browser erreichbar) |
| SEO-Grundlagen: Titel, Beschreibung, Canonical, hreflang (de-CH/en/x-default), og:image vorhanden, Sitemap 38 Einträge, robots.txt | ✅ · einziger «doppelter» Titel: `julienbernath.ch | Julien Bernath` in DE und EN (Eigenname, korrekt per hreflang verknüpft) |
| `noindex` auf allen Seiten (Vorschau) | ✅ bewusst aktiv |
| Alt-Texte | ✅ alle Inhaltsbilder beschrieben; leere Alt-Texte nur bei dekorativen Kartenbildern neben ihrem Titel |
| Sicherheit (CSP-Hashes je Seite) | ✅ 38/38 |
| 238 Originaldateien | ✅ unverändert |

### Lighthouse (Mobil, lokal)

| Seite | Performance | Barrierefreiheit | Best Practices | SEO* | LCP |
|---|---|---|---|---|---|
| Start | 96 | 100 | 100 | 69 | 2,7 s |
| Arbeiten | 95 | 100 | 100 | 69 | 2,9 s |
| Sonstige Arbeiten (28 Bilder) | 94 | 100 | 100 | 69 | 3,1 s |
| UHC Limmattal (Videos + 28 Bilder) | 93 | 100 | 100 | 69 | 3,2 s |
| Über mich | 98 | 100 | 100 | 69 | 2,4 s |
| Kontakt | 100 | 100 | 100 | 66 | 1,8 s |
| EN Start | 95 | 100 | 100 | 69 | 2,9 s |

\* SEO-Abzug ausschliesslich durch das gewollte `noindex` («is-crawlable»). Nach dem Go-live erwartet: 100.
CLS überall 0–0,001, TBT 0 ms. Die CSP hat Best Practices nicht verschlechtert.

### Nicht getestet
- Echter Formularversand (würde dir eine E-Mail schicken) – beim Go-live einmal selbst testen.
- Safari/iOS und Firefox (getestet: Chromium). Kein Einsatz browserspezifischer Technik bekannt; View Transitions fallen in Firefox einfach weg.
- Bildschirmleser manuell (Struktur und Lighthouse-A11y 100 geprüft).

## 3. Go-live-Checkliste (Phase 7)

### Vorher – braucht deine Entscheidung
- [ ] Offene Fragen aus Phase 5 klären (Impressum/UWG, Web3Forms-Sitz, Bildrechte, Kontakt-Aufruf, Tika-Mate-Freigabe für Silvan Vieille).
- [ ] Alt-Text-Vorschläge stichprobenartig prüfen (inkl. der 14 neuen).
- [ ] Texte in `docs/phase-5-texte.md` freigeben.

### Technisch (machen wir gemeinsam)
1. `src/config.ts`: `PREVIEW = false` → entfernt `noindex` und den Vorschau-Hinweis; Tika-Mate-Teamname erscheint nur, wenn freigegeben.
2. Letzter Build und Kurztest lokal.
3. `astro-redesign` nach `main` mergen (vorher Backup-Tag `pre-astro-migration-2026-11-12` bleibt bestehen = Rückweg).
4. GitHub → Settings → Pages → Source: **GitHub Actions** (statt «Deploy from branch»). Custom Domain `julienbernath.ch` und «Enforce HTTPS» bleiben.
5. Repository-Variable `ASTRO_DEPLOY_ENABLED = true`; in `deploy.yml` den `push`-Block einkommentieren (oder einmal von Hand starten). Das Environment `github-pages` erlaubt nur `main` – passt.
6. Nach dem Deploy prüfen: Startseite, ein Projekt, Kontaktformular (echte Testnachricht), 16 Werkzeuge, 404-Seite, `https://www.` → Apex.
7. **Rückweg**, falls etwas schiefgeht: Pages-Source wieder auf «Deploy from branch: main /» stellen – die alten Dateien liegen weiterhin im Repo-Root und sind sofort wieder live.

### Sicherheit (aus dem Audit, braucht deinen GitHub-/Hostpoint-Zugang)
- [ ] 2FA im GitHub-Konto bestätigen
- [ ] Domain in GitHub verifizieren (Schutz vor Domain-Übernahme)
- [ ] Dependabot alerts + security updates einschalten
- [ ] Ruleset für `main`: kein Force-Push, kein Löschen
- [ ] Optional: CAA-Record bei Hostpoint (`0 issue "letsencrypt.org"`)
- [ ] Web3Forms: Domain-Beschränkung prüfen

### Nach dem Go-live
- [ ] Google Search Console: Sitemap `https://julienbernath.ch/sitemap-index.xml` einreichen (die Verifizierung per TXT-Record besteht bereits)
- [ ] Lighthouse auf der echten Domain wiederholen
- [ ] Alte Bildadressen `/assets/images/…` der bisherigen Seite gibt es danach nicht mehr – nur relevant, falls du sie irgendwo direkt verlinkt hast
