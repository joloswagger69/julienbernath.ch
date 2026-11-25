# Sicherheitsaudit julienbernath.ch

**Datum:** 25.11.2026 · **Branch:** `security/hardening` (abgezweigt von `astro-redesign` @ `78ba1e4`, eigener Worktree `.worktrees/security-hardening`) · **Nichts gepusht, nichts veröffentlicht.**

> Diese Website ist nach dem Audit deutlich besser abgesichert, aber **nicht «vollständig sicher»**. Unten steht genau, was geprüft wurde, wie, und was offen bleibt.

---

## 1. Executive Summary

| | |
|---|---|
| **Geprüfter Umfang** | Astro-Version (künftige Seite, Branch `astro-redesign`) vollständig; Live-Seite (`main`, GitHub Pages) nur lesend und ohne Änderungen – gemäss deiner Vorgabe |
| **Risiko vorher** | **Niedrig bis mittel** – statische Seite ohne Server, ohne Login, ohne Datenbank; keine kritischen oder hohen Lücken |
| **Risiko nachher** | **Niedrig** (Astro-Version). Live-Seite unverändert: niedrig bis mittel |
| **Wichtigste Funde** | Keine Content Security Policy (F-01) · GitHub Actions nicht auf Commits gepinnt, Schreibrechte zu breit (F-02) · keine automatischen Sicherheitsprüfungen (F-06) · Kamera-Seriennummern in 25 Fotos (F-05) |
| **Kritisch / Hoch** | **0 / 0** gefunden |
| **Offene Risiken** | Live-Seite ohne CSP/Clickjacking-Schutz (Hosting erlaubt keine Header) · `frame-ancestors` per `<meta>` nicht möglich · Spam-Schutz des Formulars hängt an Web3Forms · GitHub-Kontoeinstellungen (2FA, Domain-Verifizierung) nicht einsehbar |

### Architektur (verifiziert, nicht angenommen)

- **Live heute:** GitHub Pages «legacy build» direkt aus `main` / Root. Reines HTML/CSS/JS (`index.html`, `script.js`, `fx.js`, `contact.js`, `form-config.js`, `fehler.js`, `404.html`, 16 Werkzeuge `jb-*/`). Kein Build, keine Abhängigkeiten. Google Fonts werden direkt geladen.
- **Künftig:** Astro 7.4 (statisch, `build.format: directory`), 4 direkte npm-Abhängigkeiten, 386 Pakete insgesamt. Deployment-Workflow `deploy.yml` vorbereitet, aber **inaktiv** (nur Handstart, Deploy-Job zusätzlich über Variable gesperrt).
- **Externe Dienste:** Web3Forms (Formularversand), YouTube-nocookie, TikTok, Apple Music (alle erst nach Klick), LinkedIn (Link). In der Astro-Version keine Google Fonts mehr (selbst gehostet).
- **Domain:** `julienbernath.ch` bei Hostpoint (NS ns/ns2/ns3.hostpoint.ch), A-Records auf die 4 GitHub-Pages-IPs, `www` → CNAME `joloswagger69.github.io`, Mail über Hostpoint (MX, SPF, DMARC `p=quarantine`).

---

## 2. Befunde

Schweregrad nach realistischem Schaden für eine statische Portfolio-Seite.

### F-01 · Keine Content Security Policy · **Mittel**
- **Betroffen:** alle 38 Astro-Seiten (und die Live-Seite)
- **Erklärung:** Ohne CSP würde jede künftige XSS-Lücke (z. B. durch einen Fehler in einem Skript oder eine kompromittierte Abhängigkeit) sofort beliebigen Code ausführen.
- **Fix:** Astro-CSP aktiviert (`security.csp`): `script-src 'self'` + SHA-256-Hashes aller eigenen Skripte, `default-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `connect-src` nur Web3Forms, `frame-src` nur YouTube-nocookie/TikTok/Apple Music, `upgrade-insecure-requests`. Das Hell/Dunkel-Skript im `<head>` (wird von Astro nicht automatisch gehasht) erhält seinen Hash aus `src/lib/theme-init.mjs`.
- **Verifikation:** Im Browser eingeschleuste `<script>`-Elemente und `onerror`-Handler werden **blockiert** (Violation `script-src-elem` / `script-src-attr`). Alle eigenen Funktionen laufen ohne einen einzigen CSP-Verstoss (siehe §3).
- **Kompromiss:** `style-src` erlaubt `'unsafe-inline'` (Inline-Stile für Seitenverhältnisse und Spielmodus-Effekte). Risiko gering, da Skripte streng bleiben. Die 16 Werkzeuge und `404.html` sind unveränderte Originale und haben keine CSP.

### F-02 · GitHub Actions: veränderliche Tags, zu breite Rechte · **Mittel**
- **Betroffen:** `.github/workflows/deploy.yml`
- **Erklärung:** `actions/checkout@v6` usw. zeigen auf Tags, die der Herausgeber jederzeit umhängen kann (Supply-Chain-Risiko). `pages: write` und `id-token: write` galten für **alle** Jobs, auch für den Build, der Fremdcode (npm-Pakete) ausführt.
- **Fix:** Alle Actions auf volle Commit-SHAs gepinnt (Version als Kommentar). Standardrechte nur `contents: read`; Schreibrechte nur im Deploy-Job. `persist-credentials: false`. Timeouts. Zusätzlich `npm audit --audit-level=high` vor dem Build.
- **Verifikation:** YAML geparst; alle `uses:` auf 40-stellige SHA geprüft; Rechte je Job kontrolliert.

### F-03 · Web3Forms-Access-Key im Browser sichtbar · **Info (by design)**
- **Betroffen:** `form-config.js` / `public/scripts/form-config.js` (auch Git-Historie)
- **Erklärung:** Der Key ist laut Web3Forms für den Einsatz im Frontend vorgesehen und ist **kein Geheimnis** im Sinne eines Server-Schlüssels. Er erlaubt nur, Nachrichten an deine hinterlegte Adresse zu senden. Missbrauch = Spam, kein Datenzugriff.
- **Massnahme:** Kein Rotieren nötig, keine History-Bereinigung nötig. In `.gitleaks.toml` gezielt für genau diese zwei Dateien erlaubt, damit der Secret-Scan sonst scharf bleibt. **Empfehlung:** Im Web3Forms-Dashboard prüfen, ob sich Absender-Domains auf `julienbernath.ch` beschränken lassen (je nach Tarif).

### F-04 · Formular: Zeilenumbrüche in einzeiligen Feldern · **Niedrig**
- **Betroffen:** `public/scripts/contact.js`
- **Erklärung:** Name/E-Mail/Thema flossen mit möglichen CR/LF-Zeichen in `subject`, `replyto` und den `mailto:`-Link. Web3Forms verarbeitet JSON serverseitig, ein echter Header-Injection-Angriff ist dort unwahrscheinlich – aber Verteidigung in der Tiefe fehlte.
- **Fix:** Neue Funktion `line()` entfernt alle Zeilenumbrüche (inkl. U+2028/2029) aus einzeiligen Feldern. Nachrichtentext bleibt mehrzeilig.
- **Verifikation:** `"Max\r\nBcc: evil@x.ch"` → `"Max Bcc: evil@x.ch"`; `mailto:`-Betreff enthält kein `%0A/%0D` mehr. Validierung, Honeypot und Zeitfalle unverändert funktionsfähig.
- **Hinweis:** `contact-en.js` (Phase 5, noch unkommittet auf `astro-redesign`) braucht beim Zusammenführen dieselbe Änderung – siehe Remediation-Log.

### F-05 · Kamera-Seriennummern in Bild-Metadaten · **Niedrig (Privatsphäre)**
- **Betroffen:** 25 Fotos (EV Zug Damen, FC Wil). Astro kopiert die Originaldateien unverändert nach `dist/_astro/`, also wären sie öffentlich abrufbar.
- **Geprüft:** 75 Fotos mit EXIF – **keine GPS-Koordinaten**, kein Name/Copyright. Nur Gehäuse-/Objektiv-Seriennummer in 25 Dateien.
- **Fix:** Nur die Seriennummer-Felder in den Kopien unter `src/assets/` mit Nullbytes überschrieben. Dateigrösse und Bilddaten unverändert.
- **Verifikation:** Pixel-Hash aller 190 Bilder vor/nach identisch, 0 Grössenänderungen, erneuter EXIF-Scan: 0 Seriennummern.
- **Offen:** Die Live-Seite (`main/assets/images/`) enthält dieselben 25 Seriennummern – nicht geändert (Originale-Regel).

### F-06 · Keine automatischen Sicherheitsprüfungen · **Niedrig**
- **Fix:** Neuer Workflow `.github/workflows/security.yml` (Push/PR auf `main`/`astro-redesign`, wöchentlich, manuell): `npm ci` + `npm audit --audit-level=high` (schlägt bei high/critical fehl) + `npm audit signatures` + Build, **Gitleaks** über die ganze Historie, **CodeQL** (JavaScript/TypeScript + Actions). Alles gepinnt, minimale Rechte. Neu `.github/dependabot.yml` (wöchentlich, gruppiert, ohne Major-Sprünge, Ziel `astro-redesign`).
- **Verifikation:** YAML gültig, Pinning und Rechte geprüft. **Nicht** auf GitHub ausgeführt (nichts gepusht).

### F-07 · JSON-LD ohne Maskierung von `<` · **Info**
- **Betroffen:** `src/components/pages/HomePage.astro`
- **Erklärung:** `JSON.stringify` maskiert `</script>` nicht. Die Daten sind fest im Code (kein Nutzer-Input), daher aktuell nicht ausnutzbar.
- **Fix:** `<` wird als `<` ausgegeben. Ergebnis inhaltlich identisch.

### F-08 · Spielmodus setzt Seitentext als HTML neu ein · **Info**
- **Betroffen:** `public/spielmodus/spielmodus.js` («Wackelwörter», «E-Mail-Welle»)
- **Erklärung:** `textContent` wurde ohne Maskierung wieder als `innerHTML` geschrieben. Inhalt stammt aus deinem eigenen HTML – nicht ausnutzbar, aber ein unnötiges Muster.
- **Fix:** Kleine `esc()`-Funktion; Text wird vor dem Einsetzen maskiert. Darstellung unverändert (17 Wörter, 21 Zeichen-Spans wie vorher).
- Alle anderen 17 `innerHTML`-Stellen im Spielmodus verwenden nur feste Texte aus dem Code → kein Handlungsbedarf.

### F-09 · Fehlende Referrer-Policy · **Info**
- **Fix:** `<meta name="referrer" content="strict-origin-when-cross-origin">` – Fremdseiten (YouTube, LinkedIn …) sehen nur die Domain.

### F-10 · Patch-Updates der Abhängigkeiten · **Info**
- `npm audit`: **0 Schwachstellen** vor und nach. `astro` 7.4.11 → 7.4.13, `@astrojs/sitemap` 3.7.4 → 3.7.6 (nur Patches). Lockfile: alle 386 Pakete aus registry.npmjs.org, alle mit Integrity-Hash, keine Install-Skripte.

### Live-Seite (`main`) – nur dokumentiert, nicht geändert

| Punkt | Befund | Schwere |
|---|---|---|
| HTTPS / HSTS | TLS 1.3, TLS 1.0/1.1 abgelehnt, Let's-Encrypt-Zertifikat für Apex + www (gültig bis 05.01.2027), HTTP→HTTPS 301, `www`→Apex 301, HSTS `max-age=31556952` (von GitHub gesetzt) | OK |
| Sicherheits-Header | GitHub Pages sendet **keine** CSP, kein `X-Frame-Options`, kein `X-Content-Type-Options`, keine `Referrer-Policy` – nicht konfigurierbar | Niedrig |
| Clickjacking | Seite ist einrahmbar; per `<meta>` nicht behebbar. Geringe Auswirkung (keine Aktionen hinter Login) | Niedrig |
| Google Fonts | Live-Seite lädt Fonts von Google (IP-Übertragung) – in der Astro-Version behoben | Niedrig (Datenschutz) |
| DOM-XSS | `fehler.js`/`404.html`: URL-Parameter nur via `textContent`; Rückleitung `from` per Regex auf eigene Pfade begrenzt (kein Open Redirect) | OK |
| Offene Dateien | `/.git/HEAD`, `/.env`, `/package.json`, `/.github/…`, Backups → alle 404 | OK |
| EXIF | 25 Fotos mit Kamera-Seriennummer, keine GPS-Daten | Niedrig |

---

## 3. Testbericht

### Werkzeuge
| Werkzeug | Status |
|---|---|
| `npm audit` (+ Lockfile-Herkunft/Integrity per Skript) | ✅ ausgeführt |
| Secret-Scan über **alle 55 Commits** aller Branches (Regex-Satz analog Gitleaks: AWS, GitHub-Tokens, Slack, OpenAI, Google, Private Keys, password/secret/token/api_key) + Dateinamen-Scan (`.env`, `.pem`, `id_rsa` …) | ✅ lokal ausgeführt |
| Manuelle SAST: Suche nach `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`, `set:html`, `location=`, `postMessage`, `window.open`, `srcdoc`, Inline-Handlern, `javascript:` | ✅ |
| Eigener EXIF-Parser (GPS, Seriennr., Artist, Copyright) | ✅ |
| Eigene CSP-Prüfung (Hash jedes Inline-Skripts gegen die Seiten-CSP) | ✅ 38/38 Seiten |
| Browser-Tests (Chromium im Claude-Browser, `astro preview`) | ✅ |
| `curl`, Node `tls`/`dns` gegen die eigene Domain (≈ 20 einzelne Anfragen) | ✅ |
| GitHub-API (nur lesend): Repo-, Pages-, Actions-, Environment-Einstellungen | ✅ |
| **Gitleaks, Semgrep, Trivy, OWASP ZAP, CodeQL lokal** | ❌ nicht installiert; Download hätte deine Zustimmung gebraucht. Gitleaks + CodeQL laufen künftig in `security.yml` |

### Durchgeführte Tests
| Test | Ergebnis |
|---|---|
| Build 38 Seiten | ✅ ohne Fehler (1 Astro-Hinweis zu Shiki – wird nicht verwendet, False Positive) |
| Alle 38 Seiten haben CSP-Meta, alle Inline-Skripte gehasht | ✅ |
| XSS-Injektion (Inline-Script, `onerror`) bei aktiver CSP | ✅ blockiert |
| 12 Seiten DE/EN geladen, Konsole auf Fehler/CSP-Verstösse | ✅ 0 Fehler |
| Hell/Dunkel-Modus (Inline-Skript mit Hash) | ✅ funktioniert |
| Spielmodus: aktivieren, 17 Chips, 40 Effekte, Tastenkürzel | ✅ 0 CSP-Verstösse |
| YouTube-, TikTok-, Apple-Music-Einbettung nach Klick | ✅ laden, 0 Verstösse |
| Bildansicht (Viewer) | ✅ |
| Formular: Pflichtfeld-Validierung, XSS-Payload in Name/Nachricht, Honeypot | ✅ Validierung greift, Payload nur als Text, Honeypot → stiller Scheinerfolg; **keine echte Nachricht gesendet** (0 Anfragen an Web3Forms) |
| Vorher/Nachher-Vergleich: 55 HTML-Dateien | ✅ identisch bis auf neue Meta-Tags (CSP, Referrer) und Leerzeichen |
| CSS vorher/nachher | ✅ identisch |
| Bilder vorher/nachher | ✅ 1062 → 1062, Pixel unverändert |
| 238 Originaldateien vs. `main`-Backup-Stand `3dbd07f` | ✅ unverändert |
| 16 Werkzeuge (`public/jb-*`) vs. Original | ✅ identisch |
| Live: TLS, Redirects, sensible Pfade, DNS | ✅ siehe oben |

### Nicht durchgeführt / unsicher
- Kein echter Formularversand an Web3Forms (würde dir eine E-Mail schicken; Server-Rate-Limit nicht getestet).
- Kein ZAP-Aktivscan der Live-Domain (Massenanfragen vermieden).
- Responsives Verhalten nicht neu durchgeklickt: HTML/CSS sind nachweislich identisch, daher kein Einfluss erwartet.
- Lighthouse nicht erneut gemessen (keine Änderung an Ladeverhalten oder Ressourcen).
- DKIM nicht prüfbar (Selector von Hostpoint unbekannt).
- Ob die Domain in deinem GitHub-Konto **verifiziert** ist und ob 2FA aktiv ist, lässt sich über das Repo nicht auslesen.
- `security.yml` und Dependabot wurden nicht auf GitHub ausgeführt.

---

## 4. Infrastruktur-Checkliste (manuell, braucht deinen Zugang)

### GitHub
- [ ] **2FA** im GitHub-Konto aktivieren / bestätigen (Passkey oder App).
- [ ] **Custom Domain verifizieren:** Settings → Pages → «Verified domains» → `julienbernath.ch` hinzufügen (TXT-Record bei Hostpoint). Schützt vor Domain-Übernahme durch fremde Repos.
- [ ] **Dependabot alerts** und **Dependabot security updates** einschalten (Settings → Code security). Aktuell aus.
- [ ] **Secret scanning: non-provider patterns** einschalten (aktuell aus; Push Protection ist bereits an ✅).
- [ ] **Branch-Schutz / Ruleset für `main`:** kein Force-Push, kein Löschen. Hinweis: Du lädst Dateien direkt im Web hoch – deshalb **keine** PR-Pflicht vorgeschlagen.
- [ ] Optional: Settings → Actions → «Require actions to be pinned to a full-length commit SHA» aktivieren (nach dem Merge von `security/hardening`).
- [x] Standard-Workflow-Rechte bereits «read» ✅ · keine Deploy-Keys, Webhooks oder Repo-Secrets ✅ · Environment `github-pages` nur für `main` ✅

### Domain / DNS (Hostpoint)
- [ ] Optional: **CAA-Record** `0 issue "letsencrypt.org"` – nur Let's Encrypt darf Zertifikate ausstellen.
- [ ] Optional: DMARC um Berichtsadresse ergänzen (`rua=mailto:…`).
- [x] Keine verwaisten Records gefunden; Apex + www zeigen korrekt auf GitHub Pages ✅ · SPF + DMARC vorhanden ✅

### Hosting (GitHub Pages)
- [x] HTTPS erzwungen, Zertifikat gültig ✅
- [ ] Eigene HTTP-Header (CSP, `frame-ancestors`, `X-Content-Type-Options`) sind auf GitHub Pages **nicht möglich**. Falls gewünscht: später ein vorgeschaltetes CDN (z. B. Cloudflare) – **neue Infrastruktur, nur mit deiner Freigabe**.

### Externe Dienste
- [ ] **Web3Forms:** Domain-Beschränkung / Spam-Filter im Dashboard prüfen; Empfangsadresse kontrollieren.

---

## 5. Abschlussprüfung

| Frage | Antwort |
|---|---|
| Produktions-Build erfolgreich? | **Ja** – 38 Seiten |
| Funktionen erhalten? | **Ja** – getestet: Navigation, Theme, Spielmodus, Videos, Playlist, Bildansicht, Formular-Logik |
| Aussehen unverändert? | **Ja** – HTML/CSS/Bilder nachweislich identisch (ausser unsichtbaren Meta-Tags) |
| Sicherheitsverbesserungen verifiziert? | **Ja**, lokal (CSP blockiert Injektionen; Pinning/Rechte geprüft; EXIF bereinigt) |
| Automatische Prüfungen eingerichtet? | **Ja, als Dateien** – laufen erst nach Push/Merge auf GitHub |
| Live-Seite geändert? | **Nein** (Vorgabe). Funde oben dokumentiert |

Details zu jeder Änderung: [SECURITY_REMEDIATION_LOG.md](SECURITY_REMEDIATION_LOG.md).
