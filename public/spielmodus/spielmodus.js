/* ==========================================================================
   JULIEN BERNATH // SPIELMODUS
   Die über 100 Effekte der bisherigen Website (fx.js), übertragen auf die
   neue Astro-Website. Das Original fx.js bleibt unverändert im Repository.

   Unterschiede zum Original:
   - Wird nur geladen, wenn der Spielmodus eingeschaltet ist (PlayModeToggle).
   - Baut seine Elemente (Hintergrund, Cursor, FX-Panel, Toast) selbst auf.
   - Eigener Cursor ist optional; Standard ist der normale System-Cursor.
   - Effekte, die Text verdecken oder verzerren, sind kurz und enden von selbst.
   - «Spielmodus ausschalten» im FX-Panel entfernt alles (Seite lädt neu).
   ========================================================================== */
(() => {
    'use strict';
    if (window.__jbPlay) return;
    window.__jbPlay = true;

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const root = document.documentElement;
    const body = document.body;
    const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const rand = (a, b) => a + Math.random() * (b - a);
    const css = (v) => getComputedStyle(root).getPropertyValue(v).trim();
    const later = (ms, fn) => setTimeout(fn, ms);
    const isEN = root.lang === 'en';
    const store = {
        get(k, d = null) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
        set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* privat */ } }
    };
    const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const playheadFrac = () => Math.min(1, Math.max(0, scrollY / maxScroll()));
    const toTimecode = (frames, fps = 25) => {
        frames = Math.max(0, Math.floor(frames));
        const r = Math.round(fps), f = frames % r, t = Math.floor(frames / r), p = (n) => String(n).padStart(2, '0');
        return `${p(Math.floor(t / 3600))}:${p(Math.floor(t / 60) % 60)}:${p(t % 60)}:${p(f)}`;
    };
    root.classList.add('jb-play');

    /* =====================================================================
       0. GERÜST: Ebenen, Toast, Cursor, FX-Knopf und Panel
       ===================================================================== */
    const make = (tag, attrs = {}, html = '') => { const el = document.createElement(tag); Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v)); el.innerHTML = html; return el; };
    const cv = make('canvas', { id: 'jbp-bg', 'aria-hidden': 'true' });
    const grain = make('div', { class: 'jbp-grain', 'aria-hidden': 'true' });
    const layer = make('div', { id: 'fx-layer', 'aria-hidden': 'true' });
    const cur = make('div', { id: 'jbp-cursor', 'aria-hidden': 'true' }, '<span class="cur-cross"></span><span class="cur-label"></span><span class="cur-coords"></span>');
    const toastEl = make('div', { class: 'jbp-toast', role: 'status', 'aria-live': 'polite' });
    body.prepend(cv);
    body.append(grain, layer, cur, toastEl);
    if (RM) grain.classList.add('is-off');

    let toastT;
    function toast(msg) {
        toastEl.textContent = msg;
        toastEl.classList.add('is-on');
        clearTimeout(toastT);
        toastT = later(2600, () => toastEl.classList.remove('is-on'));
    }

    const actions = $('.topbar .actions');
    const fxBtn = make('button', { type: 'button', class: 'jbp-fx-btn', 'aria-expanded': 'false', 'aria-controls': 'jbp-panel' }, `FX <span class="jbp-fx-count" aria-hidden="true">0</span>`);
    fxBtn.setAttribute('aria-label', isEN ? 'Play mode: effects panel' : 'Spielmodus: Effekte');
    actions?.prepend(fxBtn);

    const panel = make('aside', { class: 'jbp-panel', id: 'jbp-panel', hidden: '', 'aria-label': isEN ? 'Play mode' : 'Spielmodus' }, `
        <div class="fx-row"><button type="button" class="btn jbp-off" id="jbp-off">${isEN ? 'Turn off play mode' : 'Spielmodus ausschalten'}</button></div>
        <div class="fx-row"><h2>${isEN ? 'Background' : 'Hintergrund'}</h2><div class="chips" id="fx-bg"></div></div>
        <div class="fx-row"><h2>Cursor</h2><div class="chips" id="fx-cursor"></div></div>
        <div class="fx-row"><h2>${isEN ? 'Label colour' : 'Label-Farbe'}</h2><div class="chips swatches" id="fx-accent"></div></div>
        <div class="fx-row">
            <h2>${isEN ? 'Discovered' : 'Entdeckt'} <span class="fx-progress" id="fx-progress"></span></h2>
            <div class="fx-meter"><span id="fx-meter"></span></div>
            <div class="fx-hint" id="fx-hint" aria-live="polite"><b>${isEN ? 'What is behind it?' : 'Was steckt dahinter?'}</b>${isEN ? 'Hover or tap an entry.' : 'Fahr über einen Eintrag oder tipp ihn an.'}</div>
            <ul class="fx-list" id="fx-list"></ul>
            <p class="jbp-keys"><kbd>J</kbd> <kbd>K</kbd> <kbd>L</kbd> ${isEN ? 'shuttle' : 'Shuttle'} · <kbd>Space</kbd> Play/Pause · <kbd>M</kbd> Marker · <kbd>B</kbd> ${isEN ? 'background' : 'Hintergrund'} · <kbd>C</kbd> Cursor · <kbd>Z</kbd> ${isEN ? 'random clip' : 'Zufallsclip'} · <kbd>Esc</kbd> ${isEN ? 'close' : 'schliessen'}</p>
        </div>
        `);
    body.append(panel);
    const placePanel = () => { const b = $('.topbar')?.getBoundingClientRect().bottom ?? 60; panel.style.top = `${Math.max(8, b + 8)}px`; root.style.setProperty('--jbp-top', `${b}px`); };
    const setPanel = (open) => { if (open) placePanel(); panel.hidden = !open; fxBtn.setAttribute('aria-expanded', String(open)); if (open) $('#fx-bg .chip[aria-pressed="true"]', panel)?.focus(); };
    fxBtn.addEventListener('click', (e) => { e.stopPropagation(); setPanel(panel.hidden); });
    document.addEventListener('click', (e) => { if (!panel.hidden && !panel.contains(e.target) && !fxBtn.contains(e.target)) setPanel(false); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { setPanel(false); fxBtn.focus(); } });
    $('#jbp-off', panel).addEventListener('click', () => document.dispatchEvent(new Event('jb:play-off')));

    // Timeline-Erweiterungen: Anzeige für Tempo/Meldungen und Marker
    const timeline = $('[data-timeline]');
    const tlTc = $('[data-tl-tc]');
    const tlTrack = $('[data-tl-track]');
    const tlSpeed = make('span', { class: 'tl-speed tc', 'aria-live': 'polite' });
    tlTc?.after(tlSpeed);
    const markersEl = make('div', { class: 'tl-markers' });
    tlTrack?.appendChild(markersEl);
    const speed = (txt) => { tlSpeed.textContent = txt; };
    const speedText = () => tlSpeed.textContent;

    /* =====================================================================
       0b. EFFEKT-REGISTER (wie bisher)
       ===================================================================== */
    // [id, Name, Wie man es auslöst]
    const LIST = [
        ['filter', 'Clip-Shuffle', 'Bei den Arbeiten einen Filter wählen, z.B. «Foto».'],
        ['tilt', '3D-Neigung', 'Mit der Maus über ein Projektbild fahren.'],
        ['loupe', 'Lupe', 'In der Bildansicht ins Bild klicken.'],
        ['arrows', 'Pfeiltasten-Schnitt', 'In der Bildansicht mit ← und → blättern.'],
        ['fullscreen', 'Vollbild', 'In der Bildansicht die Taste F drücken.'],
        ['swipe', 'Wischen', 'Auf dem Handy in der Bildansicht seitlich wischen.'],
        ['random', 'Zufallsclip', 'Die Taste Z drücken.'],
        ['meta', 'Making-of', 'Das Projekt «julienbernath.ch» öffnen.'],
        ['cutline', 'Entschlüsselter Name', 'Die Startseite laden und den Namen beobachten.'],
        ['stretch', 'Gummi-Name', 'Mit der Maus nah an den grossen Namen fahren.'],
        ['jump', 'Buchstaben-Hüpfer', 'Auf einen Buchstaben im Namen klicken.'],
        ['rec', 'REC-Pause', 'Im Monitor auf «REC» klicken.'],
        ['fps', 'Framerate-Wechsel', 'Im Monitor auf den Timecode klicken.'],
        ['words', 'Wackelwörter', 'Mit der Maus über den Text unter dem Namen fahren.'],
        ['scrubtl', 'Timeline-Scrub', 'Unten in der Timeline klicken und ziehen.'],
        ['clipjump', 'Clip-Sprung', 'Unten in die Timeline klicken.'],
        ['jkl', 'J/K/L-Shuttle', 'J, K oder L drücken, wie in Premiere. Mehrmals L = schneller.'],
        ['space', 'Play/Pause', 'Die Leertaste drücken.'],
        ['marker', 'Marker setzen', 'Die Taste M drücken.'],
        ['markerjump', 'Marker anspringen', 'Einen gesetzten blauen Marker in der Timeline anklicken.'],
        ['end', 'Abspann erreicht', 'Ganz nach unten scrollen.'],
        ['rewind', 'Zurückspulen', 'In der Fusszeile auf «Zurückspulen» klicken.'],
        ['fastscroll', 'Schnellvorlauf', 'Sehr schnell scrollen.'],
        ['tlhover', 'Hover-Timecode', 'Mit der Maus über die Timeline fahren.'],
        ['bg-kreuze', 'Kreuz-Raster', 'Im FX-Fenster den Hintergrund «Kreuze» wählen.'],
        ['bg-welle', 'Wellenform', 'Im FX-Fenster den Hintergrund «Wellenform» wählen.'],
        ['bg-punkte', 'Punkt-Wellen', 'Hintergrund «Punkt-Wellen» wählen und irgendwo klicken.'],
        ['bg-sterne', 'Warp-Sterne', 'Hintergrund «Warp-Sterne» wählen und schnell scrollen.'],
        ['bg-tc', 'Timecode-Regen', 'Im FX-Fenster den Hintergrund «Timecode-Regen» wählen.'],
        ['bg-testbild', 'Testbild', 'Im FX-Fenster den Hintergrund «Testbild» wählen.'],
        ['bg-aus', 'Stille', 'Im FX-Fenster den Hintergrund «Aus» wählen.'],
        ['cur-kreuz', 'Fadenkreuz', 'Im FX-Fenster den Cursor «Fadenkreuz» wählen.'],
        ['cur-sucher', 'Kamerasucher', 'Im FX-Fenster den Cursor «Sucher» wählen.'],
        ['cur-playhead', 'Playhead-Cursor', 'Im FX-Fenster den Cursor «Playhead» wählen.'],
        ['cur-punkt', 'Invert-Punkt', 'Im FX-Fenster den Cursor «Punkt» wählen.'],
        ['label', 'Cursor-Labels', 'Eigenen Cursor wählen und über einen Link oder Knopf fahren.'],
        ['shake', 'Wackelkamera', 'Die Maus schnell hin und her schütteln.'],
        ['leave', 'Kein Signal', 'Mit der Maus das Browserfenster verlassen.'],
        ['saver', 'Bildschirmschoner', 'Drei Minuten lang nichts tun.'],
        ['corner', 'Perfekte Ecke', 'Warten, bis das Logo im Bildschirmschoner genau eine Ecke trifft.'],
        ['click', 'Fokus-Marker', 'Irgendwo auf die Seite klicken.'],
        ['dbl', 'Schockwelle', 'Irgendwo doppelklicken.'],
        ['triple', 'Konfetti-Klick', 'Irgendwo dreimal schnell klicken.'],
        ['hold', 'Langzeitbelichtung', 'Die Maustaste eine Sekunde gedrückt halten, ohne zu bewegen.'],
        ['logo', 'Logo-Wirbel', 'Fünfmal schnell auf das JB-Logo klicken.'],
        ['decode', 'Entschlüsseln', 'Zu einer Überschrift scrollen.'],
        ['mailwave', 'E-Mail-Welle', 'Mit der Maus über die grosse E-Mail-Adresse fahren.'],
        ['btnwipe', 'Button-Wischer', 'Von links oder rechts über einen Knopf fahren.'],
        ['select', 'Rote Markierung', 'Text auf der Seite markieren.'],
        ['copy', 'Kopier-Kommentar', 'Markierten Text kopieren.'],
        ['favicon', 'Blinkendes Favicon', 'In einen anderen Tab wechseln und auf das Tab-Symbol achten.'],
        ['greeting', 'Tageszeit-Gruss', 'Die Seite neu öffnen.'],
        ['resize', 'Seitenverhältnis', 'Die Grösse des Browserfensters ändern.'],
        ['print', 'Druckversion', 'Die Seite drucken (Ctrl/Cmd + P).'],
        ['light', 'Licht-Schalter', 'Oben rechts auf den runden Knopf klicken.'],
        ['accent', 'Label-Farbe', 'Im FX-Fenster eine andere Label-Farbe wählen.'],
        ['bgkey', 'Hintergrund per B', 'Die Taste B drücken.'],
        ['curkey', 'Cursor per C', 'Die Taste C drücken.'],
        ['take', 'Neuer Take', 'Bei «Über mich» auf das Foto klicken.'],
        ['slate', 'Klappe!', 'Auf die schwarze Filmklappe klicken.'],
        ['check', 'Abhaken', 'In der Shotlist einen Punkt abhaken.'],
        ['allchecked', 'Liste komplett', 'Eine ganze Shotlist-Kategorie abhaken.'],
        ['playlist', 'Playlist', '«Musik beim Schneiden» aufklappen.'],
        ['fader', 'Fader ziehen', 'Im Mischpult bei den Skills einen Regler nach unten ziehen.'],
        ['solo', 'Solo-Kanal', 'Im Mischpult auf den Namen eines Programms klicken.'],
        ['vu', 'VU-Meter', 'Mit der Maus über einen Kanal im Mischpult fahren.'],
        ['plane', 'Papierflieger', 'Bei «Kontakt» auf «E-Mail kopieren» klicken.'],
        ['export', 'E-Mail-Export', 'Auf die grosse E-Mail-Adresse klicken.'],
        ['w-julien', 'Kreuz-Regen', 'Irgendwo auf der Seite «julien» tippen.'],
        ['w-bernath', 'Namens-Welle', 'Auf der Startseite «bernath» tippen.'],
        ['w-zug', 'Eiszeit', 'Irgendwo auf der Seite «zug» tippen.'],
        ['w-schwerkraft', 'Schwerkraft', 'Irgendwo auf der Seite «schwerkraft» tippen.'],
        ['w-flip', 'Kopfstand', 'Irgendwo auf der Seite «flip» tippen.'],
        ['w-comic', 'Comic Sans', 'Irgendwo auf der Seite «comic» tippen.'],
        ['w-retro', 'VHS', 'Irgendwo auf der Seite «retro» tippen.'],
        ['w-mono', 'Schwarzweiss', 'Irgendwo auf der Seite «mono» tippen (nochmal = aus).'],
        ['w-zoom', 'Vertigo', 'Irgendwo auf der Seite «zoom» tippen.'],
        ['w-hallo', 'Hoi', 'Irgendwo auf der Seite «hallo» tippen.'],
        ['w-cut', 'Rasierklinge', 'Irgendwo auf der Seite «cut» tippen.'],
        ['w-beat', '120 BPM', 'Irgendwo auf der Seite «beat» tippen.'],
        ['w-fokus', 'Unschärfe', 'Irgendwo auf der Seite «fokus» tippen.'],
        ['w-spiegel', 'Spiegel', 'Irgendwo auf der Seite «spiegel» tippen.'],
        ['w-gross', 'Riesencursor', 'Eigenen Cursor wählen und «gross» tippen.'],
        ['w-itson', 'In the Silence of Nature', 'Irgendwo auf der Seite «itson» tippen.'],
        ['w-rec', 'Aufnahme', 'Irgendwo auf der Seite «rec» tippen.'],
        ['c-sandwich', 'Sandwich-Regen', 'In der Shotlist «Täglich ein Tomaten-Mozzarella-Sandwich» abhaken.'],
        ['c-redbull', 'Flügel', 'In der Shotlist «Red Bull Sugarfree» abhaken.'],
        ['c-fx30', 'Sucher-Overlay', 'In der Shotlist «Sony FX30» abhaken.'],
        ['c-berg', 'Barrhorn', 'In der Shotlist «Barrhorn besteigen» abhaken.'],
        ['c-island', 'Geysir', 'In der Shotlist «Island» abhaken.'],
        ['c-schnee', 'Schneegestöber', 'In der Shotlist «Lofoten im Winter» abhaken.'],
        ['c-drohne', 'Drohnenflug', 'In der Shotlist «Mit der Drohne über einen Gletscher» abhaken.'],
        ['c-nacht', 'Nachtschicht', 'In der Shotlist «Nordlichter fotografieren» abhaken.'],
        ['c-premiere', 'Premiere 100 %', 'Bei den Skills auf «Premiere Pro» klicken.'],
        ['c-blender', 'Low-Poly', 'Bei den Skills auf «Blender» klicken.'],
        ['c-baden', 'Thermalbad', 'Auf der Filmklappe auf «Baden, Aargau» klicken.'],
        ['c-disco', 'Disco', 'Auf die kleinen roten Equalizer-Balken bei «Musik beim Schneiden» klicken.'],
        ['c-matrix', 'Matrix', 'Unten links auf den roten Timecode der Timeline klicken.'],
        ['c-kaffee', 'Kaffeepause', 'Beim Kontakt auf die Uhrzeit klicken.'],
        ['c-party', 'Party', 'Auf die Überschrift «Lust auf ein Projekt?» klicken.'],
        ['konami', "Director's Cut", 'Den Konami-Code drücken: ↑ ↑ ↓ ↓ ← → ← → B A.']
    ];

    const foundSet = new Set(store.get('jb2-found', []).filter(id => LIST.some(x => x[0] === id)));
    const fxList = $('#fx-list', panel);
    const fxHint = $('#fx-hint', panel);
    const fxCount = $('.jbp-fx-count', fxBtn);
    function renderFound() {
        $('#fx-progress', panel).textContent = `${foundSet.size} / ${LIST.length}`;
        $('#fx-meter', panel).style.width = `${(foundSet.size / LIST.length) * 100}%`;
        fxCount.textContent = String(foundSet.size);
        fxList.innerHTML = LIST.map(([id, n], i) => {
            const f = foundSet.has(id);
            return `<li class="${f ? 'found' : ''}" data-i="${i}" tabindex="0">${f ? n : n.replace(/\S/g, '·')}</li>`;
        }).join('');
    }
    function showHint(li) {
        if (!li) return;
        const [id, n, how] = LIST[Number(li.dataset.i)];
        $$('li', fxList).forEach(x => x.classList.toggle('is-active', x === li));
        fxHint.innerHTML = `<b>${n}${foundSet.has(id) ? ' ✓' : ''}</b>${how}`;
    }
    fxList.addEventListener('mouseover', (e) => showHint(e.target.closest('li')));
    fxList.addEventListener('click', (e) => showHint(e.target.closest('li')));
    fxList.addEventListener('focusin', (e) => showHint(e.target.closest('li')));
    function found(id) {
        if (foundSet.has(id) || !LIST.some(x => x[0] === id)) return;
        foundSet.add(id);
        store.set('jb2-found', [...foundSet]);
        renderFound();
    }
    document.addEventListener('jb:fx', (e) => found(e.detail));
    renderFound();

    /* =====================================================================
       1. PARTIKEL (Konfetti, Regen, Blasen …)
       ===================================================================== */
    const parts = [];
    let partRaf = null;
    function spawn(o) {
        if (RM) return;
        const el = document.createElement('span');
        el.className = 'fx-particle';
        el.textContent = o.text || '';
        el.style.fontSize = `${o.size || 16}px`;
        el.style.color = o.color || 'var(--red)';
        if (o.box) Object.assign(el.style, { width: `${o.box}px`, height: `${o.box * (o.ratio || 0.45)}px`, background: o.color, borderRadius: o.round ? '50%' : '1px' });
        layer.appendChild(el);
        parts.push({ el, x: o.x, y: o.y, vx: o.vx || 0, vy: o.vy || 0, g: o.g ?? 0.25, r: rand(0, 360), vr: o.vr ?? rand(-8, 8), life: o.life || 160, drag: o.drag ?? 0.99, wob: o.wob || 0, t: 0 });
        if (!partRaf) partRaf = requestAnimationFrame(stepParts);
    }
    function stepParts() {
        for (let i = parts.length - 1; i >= 0; i--) {
            const p = parts[i];
            p.t++;
            p.vy += p.g; p.vx *= p.drag; p.vy *= p.drag;
            p.x += p.vx + (p.wob ? Math.sin(p.t / 10) * p.wob : 0); p.y += p.vy; p.r += p.vr;
            const fade = Math.min(1, (p.life - p.t) / 30);
            p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.r}deg)`;
            p.el.style.opacity = fade;
            if (p.t > p.life || p.y > innerHeight + 60 || p.y < -200) { p.el.remove(); parts.splice(i, 1); }
        }
        partRaf = parts.length ? requestAnimationFrame(stepParts) : null;
    }
    const COLORS = () => [css('--red'), '#9C93E6', '#4FAE9C', '#E3A93F', '#E07F9B', css('--ink')];
    function confetti(x, y, n = 60) {
        if (RM) return;
        const c = COLORS();
        for (let i = 0; i < n; i++) spawn({ x, y, vx: rand(-9, 9), vy: rand(-15, -4), box: rand(6, 11), color: c[i % c.length], life: rand(90, 150) });
    }
    function rain(chars, n = 40, size = 26, color) {
        if (RM) return;
        for (let i = 0; i < n; i++) later(i * 45, () => spawn({ x: rand(0, innerWidth), y: -40, vy: rand(2, 5), g: 0.12, text: chars[i % chars.length], size: rand(size * 0.7, size * 1.3), color, life: 260, vr: rand(-4, 4) }));
    }
    function rise(chars, n, x, y, color) {
        for (let i = 0; i < n; i++) later(i * 60, () => spawn({ x: x + rand(-20, 20), y, vy: rand(-2.5, -1), g: -0.02, text: chars[i % chars.length], size: rand(10, 22), color, life: 120, wob: 1.2, vr: 0 }));
    }
    document.addEventListener('jb:confetti', (e) => confetti(e.detail.x, e.detail.y, 90));

    /* =====================================================================
       2. HINTERGRÜNDE
       ===================================================================== */
    const ctx = cv.getContext('2d');
    let W = 0, H = 0;
    const t0 = performance.now();
    const mouse = { x: -9999, y: -9999 };
    let ink = '0, 0, 0', red = '#E30613', scrollV = 0, lastScrollY = scrollY;
    const ripples = [];
    function readColors() { ink = css('--ink-rgb') || '0, 0, 0'; red = css('--red') || '#E30613'; }
    function resize() { W = cv.width = innerWidth; H = cv.height = innerHeight; modes[mode]?.init?.(); }

    let nodes = [];
    const grid = (sp) => { nodes = []; for (let x = sp / 2; x < W; x += sp) for (let y = sp / 2; y < H; y += sp) nodes.push({ ox: x, oy: y, x, y, s: Math.random() * 6.28 }); };
    let stars = [], drops = [];
    let matrixGreen = false;

    const modes = {
        kreuze: {
            name: isEN ? 'Crosses' : 'Kreuze', init: () => grid(60),
            draw() {
                ctx.lineWidth = 1;
                ctx.strokeStyle = `rgba(${ink}, 0.16)`;
                ctx.beginPath();
                const hot = [];
                for (const n of nodes) {
                    n.s += 0.01;
                    let tx = n.ox + Math.sin(n.s) * 1.5, ty = n.oy + Math.cos(n.s) * 1.5;
                    const dx = mouse.x - n.x, dy = mouse.y - n.y, d = Math.hypot(dx, dy);
                    if (d < 130) { const f = (130 - d) / 130; tx -= dx / d * f * 18; ty -= dy / d * f * 18; }
                    n.x += (tx - n.x) * 0.12; n.y += (ty - n.y) * 0.12;
                    if (d < 150) { hot.push([n, 1 - d / 150]); continue; }
                    ctx.moveTo(n.x - 3, n.y); ctx.lineTo(n.x + 3, n.y); ctx.moveTo(n.x, n.y - 3); ctx.lineTo(n.x, n.y + 3);
                }
                ctx.stroke();
                ctx.strokeStyle = red;
                for (const [n, f] of hot) {
                    ctx.globalAlpha = 0.25 + f * 0.75; ctx.lineWidth = 1 + f;
                    ctx.beginPath(); ctx.moveTo(n.x - 3, n.y); ctx.lineTo(n.x + 3, n.y); ctx.moveTo(n.x, n.y - 3); ctx.lineTo(n.x, n.y + 3); ctx.stroke();
                }
                ctx.globalAlpha = 1;
            }
        },
        welle: {
            name: isEN ? 'Waveform' : 'Wellenform',
            draw(t) {
                ctx.lineWidth = 1;
                for (let y = 40; y < H; y += 34) {
                    const near = Math.max(0, 1 - Math.abs(mouse.y - y) / 160);
                    ctx.strokeStyle = near > 0.05 ? `rgba(${ink}, ${0.1 + near * 0.35})` : `rgba(${ink}, 0.1)`;
                    ctx.beginPath();
                    for (let x = 0; x <= W; x += 6) {
                        const local = Math.max(0, 1 - Math.hypot(mouse.x - x, mouse.y - y) / 220);
                        const a = 2 + local * 26 + Math.min(scrollV * 0.01, 14);
                        const v = Math.sin(x * 0.04 + t * 0.003 + y) * Math.sin(x * 0.011 - t * 0.002) * a;
                        x === 0 ? ctx.moveTo(x, y + v) : ctx.lineTo(x, y + v);
                    }
                    ctx.stroke();
                }
            }
        },
        punkte: {
            name: isEN ? 'Dot waves' : 'Punkt-Wellen', init: () => grid(28),
            draw() {
                ctx.fillStyle = `rgba(${ink}, 0.22)`;
                ctx.beginPath();
                for (const n of nodes) {
                    let off = 0;
                    for (const r of ripples) { const d = Math.hypot(n.ox - r.x, n.oy - r.y); const k = d - r.r; if (Math.abs(k) < 40) off += Math.cos(k / 40 * Math.PI) * 6 * r.a; }
                    const dm = Math.hypot(mouse.x - n.ox, mouse.y - n.oy);
                    const s = 1.1 + Math.max(0, 1 - dm / 120) * 2.2 + off * 0.25;
                    ctx.moveTo(n.ox + s, n.oy + off); ctx.arc(n.ox, n.oy + off, Math.max(0.4, s), 0, 6.283);
                }
                ctx.fill();
                for (let i = ripples.length - 1; i >= 0; i--) { ripples[i].r += 7; ripples[i].a *= 0.975; if (ripples[i].a < 0.05) ripples.splice(i, 1); }
            }
        },
        sterne: {
            name: isEN ? 'Warp stars' : 'Warp-Sterne',
            init: () => { stars = Array.from({ length: 260 }, () => ({ x: rand(-1, 1), y: rand(-1, 1), z: rand(0.1, 1) })); },
            draw() {
                const sp = 0.002 + Math.min(scrollV * 0.00002, 0.03);
                const cx = W / 2 + (mouse.x > 0 ? (mouse.x - W / 2) * 0.05 : 0), cy = H / 2 + (mouse.y > 0 ? (mouse.y - H / 2) * 0.05 : 0);
                ctx.strokeStyle = `rgba(${ink}, 0.5)`;
                for (const s of stars) {
                    const pz = s.z; s.z -= sp;
                    if (s.z <= 0.02) { s.x = rand(-1, 1); s.y = rand(-1, 1); s.z = 1; continue; }
                    const x = cx + s.x / s.z * W * 0.5, y = cy + s.y / s.z * H * 0.5, px = cx + s.x / pz * W * 0.5, py = cy + s.y / pz * H * 0.5;
                    ctx.lineWidth = (1 - s.z) * 2; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
                }
            }
        },
        tc: {
            name: isEN ? 'Timecode rain' : 'Timecode-Regen',
            init: () => { drops = Array.from({ length: Math.ceil(W / 26) }, (_, i) => ({ x: i * 26, y: rand(-H, 0), v: rand(1, 3) })); },
            draw() {
                ctx.font = '12px IBM Plex Mono, monospace';
                for (const d of drops) {
                    d.y += d.v + scrollV * 0.002;
                    if (d.y > H + 200) d.y = rand(-300, 0);
                    for (let k = 0; k < 8; k++) {
                        ctx.fillStyle = matrixGreen ? `rgba(0, 220, 90, ${0.5 - k * 0.06})` : `rgba(${ink}, ${0.22 - k * 0.025})`;
                        ctx.fillText(String(Math.floor(rand(0, 10))), d.x, d.y - k * 15);
                    }
                }
            }
        },
        testbild: {
            name: isEN ? 'Test card' : 'Testbild',
            draw(t) {
                const bars = ['#c0c0c0', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0'];
                ctx.globalAlpha = 0.12;
                bars.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(i * W / 7, 0, W / 7 + 1, H * 0.7); });
                ctx.fillStyle = '#111'; ctx.fillRect(0, H * 0.7, W, H * 0.3);
                ctx.globalAlpha = 0.18; ctx.fillStyle = '#fff';
                ctx.fillRect(0, (t * 0.12) % H, W, 3);
                ctx.globalAlpha = 1;
            }
        },
        aus: { name: isEN ? 'Off' : 'Aus', draw() {} }
    };
    const MODE_KEYS = Object.keys(modes);
    let mode = store.get('jb2-bg', RM ? 'aus' : 'kreuze');
    if (!modes[mode]) mode = 'kreuze';

    function setMode(m, quiet) {
        mode = m;
        store.set('jb2-bg', m);
        ctx.clearRect(0, 0, W, H);
        modes[m].init?.();
        $$('#fx-bg .chip', panel).forEach(c => c.setAttribute('aria-pressed', String(c.dataset.v === m)));
        if (!quiet) found(`bg-${m}`);
    }
    function frame(now) {
        const sy = scrollY; scrollV = scrollV * 0.9 + Math.abs(sy - lastScrollY) * 6; lastScrollY = sy;
        if (!document.hidden && mode !== 'aus' && !RM) {
            ctx.clearRect(0, 0, W, H);
            modes[mode].draw(now - t0);
        }
        requestAnimationFrame(frame);
    }
    readColors(); resize();
    addEventListener('resize', resize);
    document.addEventListener('jb:theme', () => later(50, readColors));
    requestAnimationFrame(frame);
    $('#fx-bg', panel).innerHTML = MODE_KEYS.map(k => `<button type="button" class="chip" data-v="${k}" aria-pressed="${k === mode}">${modes[k].name}</button>`).join('');
    $('#fx-bg', panel).addEventListener('click', (e) => { const b = e.target.closest('.chip'); if (b) setMode(b.dataset.v); });

    // Filmkorn
    (() => {
        const g = document.createElement('canvas'); g.width = g.height = 160;
        const gx = g.getContext('2d'), id = gx.createImageData(160, 160);
        for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
        gx.putImageData(id, 0, 0);
        grain.style.backgroundImage = `url(${g.toDataURL()})`;
    })();

    /* =====================================================================
       3. CURSOR (optional – Standard bleibt der System-Cursor)
       ===================================================================== */
    const curLabel = $('.cur-label', cur);
    const curCoords = $('.cur-coords', cur);
    const CUR_MODES = { system: 'System', kreuz: isEN ? 'Crosshair' : 'Fadenkreuz', sucher: isEN ? 'Viewfinder' : 'Sucher', playhead: 'Playhead', punkt: isEN ? 'Dot' : 'Punkt' };
    let curMode = store.get('jb3-cursor', 'system');
    if (!CUR_MODES[curMode]) curMode = 'system';
    let cx = -100, cy = -100, curRaf = null;

    function setCursor(m, quiet) {
        curMode = m;
        store.set('jb3-cursor', m);
        cur.dataset.mode = m;
        body.classList.toggle('has-cursor', fine && m !== 'system');
        $$('#fx-cursor .chip', panel).forEach(c => c.setAttribute('aria-pressed', String(c.dataset.v === m)));
        if (!quiet && m !== 'system') found(`cur-${m}`);
    }
    $('#fx-cursor', panel).innerHTML = Object.entries(CUR_MODES).map(([k, n]) => `<button type="button" class="chip" data-v="${k}" aria-pressed="${k === curMode}">${n}</button>`).join('');
    $('#fx-cursor', panel).addEventListener('click', (e) => { const b = e.target.closest('.chip'); if (b) setCursor(b.dataset.v); });

    function curStep() {
        cx += (mouse.x - cx) * 0.35; cy += (mouse.y - cy) * 0.35;
        cur.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
        curRaf = Math.abs(mouse.x - cx) + Math.abs(mouse.y - cy) > 0.3 ? requestAnimationFrame(curStep) : null;
    }

    if (fine) {
        setCursor(curMode, true);
        addEventListener('mousemove', (e) => {
            mouse.x = e.clientX; mouse.y = e.clientY;
            curCoords.textContent = `X ${String(e.clientX).padStart(4, '0')}  Y ${String(e.clientY).padStart(4, '0')}`;
            if (!curRaf) curRaf = requestAnimationFrame(curStep);
            shakeCheck(e);
            resetIdle();
        }, { passive: true });

        const HOVER = 'a, button, summary, input, label, [data-tl-track], .ch-knob, .ch-name, .hero-name .ch, [data-take]';
        document.addEventListener('mouseover', (e) => {
            const t = e.target.closest(HOVER);
            cur.classList.toggle('is-hover', !!t);
            let label = '';
            if (t) {
                label = (t.matches('[data-tl-track]') ? 'Scrub' : '')
                    || (t.matches('.ch-knob') ? (isEN ? 'Drag' : 'Ziehen') : '')
                    || (t.matches('[data-take]') ? (isEN ? 'Next take' : 'Nächster Take') : '')
                    || (t.matches('a[data-viewer]') ? (isEN ? 'View' : 'Ansehen') : '')
                    || (t.matches('[href^="mailto"]') ? (isEN ? 'Write' : 'Schreiben') : '')
                    || (t.matches('a[target="_blank"]') ? (isEN ? 'New tab' : 'Neuer Tab') : '')
                    || (t.matches('a[href^="/jb-"]') ? (isEN ? 'Launch' : 'Starten') : '')
                    || (t.matches('.card-link') ? (isEN ? 'Open' : 'Ansehen') : '');
            }
            curLabel.textContent = label;
            curLabel.classList.toggle('is-on', !!label);
            if (label && curMode !== 'system') found('label');
        });
        addEventListener('mousedown', () => cur.classList.add('is-down'));
        addEventListener('mouseup', () => cur.classList.remove('is-down'));
        addEventListener('mouseout', (e) => { if (!e.relatedTarget) { mouse.x = mouse.y = -9999; signal(false); } });
        addEventListener('mouseover', () => signal(true));
    } else {
        addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    }

    // Kein Signal, wenn die Maus das Fenster verlässt
    let signalTimer;
    function signal(on) {
        clearTimeout(signalTimer);
        if (!on) signalTimer = later(400, () => { speed(isEN ? 'NO SIGNAL' : 'KEIN SIGNAL'); found('leave'); });
        else if (/SIGNAL/.test(speedText())) speed('');
    }

    // Wackelkamera: Maus schnell hin und her
    let lastDir = 0, flips = [];
    function shakeCheck(e) {
        const dir = Math.sign(e.movementX);
        if (dir && dir !== lastDir && Math.abs(e.movementX) > 12) {
            const now = performance.now();
            flips = flips.filter(t => now - t < 600); flips.push(now);
            if (flips.length > 6) { flips = []; if (!RM) { body.classList.add('fx-shake'); later(450, () => body.classList.remove('fx-shake')); } toast(isEN ? 'Steady hands, camera operator.' : 'Ruhige Hand, Kameramann.'); found('shake'); }
        }
        if (dir) lastDir = dir;
    }

    // Button-Wischer: Füllung kommt von der Seite, wo die Maus reinkommt
    document.addEventListener('mouseover', (e) => {
        const b = e.target.closest('.btn');
        if (!b || b.contains(e.relatedTarget)) return;
        const r = b.getBoundingClientRect();
        b.style.setProperty('--from', e.clientX < r.left + r.width / 2 ? 'left' : 'right');
        found('btnwipe');
    });

    /* =====================================================================
       4. KLICKS
       ===================================================================== */
    let holdT;
    addEventListener('mousedown', (e) => {
        if (e.button !== 0 || e.target.closest('dialog, .jbp-panel, .timeline, input, textarea, select')) return;
        const m = document.createElement('div');
        m.className = 'fx-click';
        m.style.left = `${e.clientX}px`; m.style.top = `${e.clientY}px`;
        m.innerHTML = `<span>${toTimecode(playheadFrac() * 3000)}</span>`;
        layer.appendChild(m);
        later(700, () => m.remove());
        found('click');
        if (e.detail === 3) { confetti(e.clientX, e.clientY, 50); found('triple'); }
        holdT = later(900, () => {
            if (!RM) { const f = document.createElement('div'); f.className = 'fx-flash'; layer.appendChild(f); later(400, () => f.remove()); }
            toast(isEN ? 'Exposure: 1 second' : 'Belichtung: 1 Sekunde'); found('hold');
        });
    });
    addEventListener('mouseup', () => clearTimeout(holdT));
    addEventListener('mousemove', () => clearTimeout(holdT), { passive: true });
    addEventListener('dblclick', (e) => {
        if (e.target.closest('dialog, .timeline, input, textarea')) return;
        const r = document.createElement('div'); r.className = 'fx-ring';
        r.style.left = `${e.clientX}px`; r.style.top = `${e.clientY}px`;
        layer.appendChild(r); later(800, () => r.remove());
        found('dbl');
    });

    // Logo 5× klicken (auf der Startseite ohne Neuladen)
    const brand = $('.brand');
    let logoClicks = [];
    brand?.addEventListener('click', (e) => {
        const onHome = brand.getAttribute('href') === location.pathname;
        if (onHome) { e.preventDefault(); }
        const now = performance.now();
        logoClicks = logoClicks.filter(t => now - t < 2000); logoClicks.push(now);
        if (logoClicks.length >= 5) {
            logoClicks = [];
            if (!RM) brand.animate([{ transform: 'rotate(0) scale(1)' }, { transform: 'rotate(720deg) scale(1.6)' }, { transform: 'rotate(720deg) scale(1)' }], { duration: 1100, easing: 'cubic-bezier(.2,.7,.1,1)' });
            found('logo');
        } else if (onHome && logoClicks.length === 1) {
            later(450, () => { if (logoClicks.length === 1) scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' }); });
        }
    });

    /* =====================================================================
       5. TEXT
       ===================================================================== */
    // Name: Buchstaben einzeln, Breite folgt dem Cursor (nur Startseite)
    const nameEl = $('.hero-name');
    const nameChars = [];
    let nameReady = true;
    if (nameEl) {
        $$(':scope > span', nameEl).forEach(row => {
            const txt = row.textContent;
            row.textContent = '';
            [...txt].forEach(c => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; row.appendChild(s); nameChars.push(s); });
        });
        // Lade-Moment: Zeichensalat, der sich zu «JULIEN BERNATH» auflöst (Name bleibt per aria-label lesbar)
        nameReady = RM;
        if (!RM) {
            const NAME_GLYPHS = '0123456789:;/#ABCDEFGHJKLMNPRSTUVWXYZ';
            const finals = nameChars.map(s => s.textContent);
            const start = performance.now();
            nameChars.forEach(s => { s.style.width = `${s.getBoundingClientRect().width}px`; s.style.textAlign = 'center'; s.style.opacity = '0.35'; });
            (function step(now) {
                const p = Math.min(1, (now - start) / 1300);
                nameChars.forEach((s, i) => {
                    const at = (i / nameChars.length) * 0.75 + 0.2;
                    if (p >= at) { s.textContent = finals[i]; s.style.opacity = ''; }
                    else s.textContent = NAME_GLYPHS[Math.floor(Math.random() * NAME_GLYPHS.length)];
                });
                if (p < 1) requestAnimationFrame(step);
                else { nameChars.forEach(s => { s.style.width = ''; s.style.textAlign = ''; }); nameReady = true; found('cutline'); }
            })(start);
        }
        let stretchRaf = null;
        const hero = $('.hero');
        hero?.addEventListener('mousemove', () => {
            if (RM || stretchRaf || !nameReady) return;
            stretchRaf = requestAnimationFrame(() => {
                stretchRaf = null;
                let any = false;
                for (const s of nameChars) {
                    const r = s.getBoundingClientRect();
                    const d = Math.abs(mouse.x - (r.left + r.width / 2)) + Math.abs(mouse.y - (r.top + r.height / 2)) * 0.5;
                    const k = Math.max(0, 1 - d / 240);
                    s.style.setProperty('--w', (66 + k * 22).toFixed(1));
                    if (k > 0.5) any = true;
                }
                if (any) found('stretch');
            });
        });
        hero?.addEventListener('mouseleave', () => nameChars.forEach(s => s.style.setProperty('--w', 66)));
        nameChars.forEach(s => s.addEventListener('click', () => { s.classList.remove('is-jump'); void s.offsetWidth; s.classList.add('is-jump'); found('jump'); }));
    }
    function nameWave() { nameChars.forEach((s, i) => later(i * 70, () => { s.classList.remove('is-jump'); void s.offsetWidth; s.classList.add('is-jump'); })); }

    // Wackelwörter
    const lede = $('.hero-lede');
    if (lede) {
        lede.innerHTML = lede.textContent.split(' ').map(w => `<span class="w">${w}</span>`).join(' ');
        lede.addEventListener('mouseover', (e) => { if (e.target.classList.contains('w')) found('words'); });
    }

    // E-Mail-Welle (Kontaktseite und Abspann)
    const mails = $$('#contact-mail, .credits-mail');
    mails.forEach(mail => {
        mail.setAttribute('aria-label', mail.textContent);
        mail.classList.add('jbp-wave');
        mail.innerHTML = [...mail.textContent].map((c, i) => `<span class="ch" aria-hidden="true" style="--i:${i}">${c}</span>`).join('');
        mail.addEventListener('mouseenter', () => found('mailwave'));
    });

    // Entschlüsseln: Abschnittsüberschriften lösen sich beim Erscheinen auf
    const GLYPHS = '0123456789:;<>/#ABCDEFGHJKLMNPRSTUVWXYZ';
    function decode(el) {
        if (RM || el.dataset.decoded) return;
        el.dataset.decoded = '1';
        const final = el.textContent;
        el.setAttribute('aria-label', final);
        const start = performance.now();
        (function step(now) {
            const p = Math.min(1, (now - start) / 700);
            const n = Math.floor(p * final.length);
            el.textContent = final.slice(0, n) + [...final.slice(n)].map(c => (c === ' ' ? ' ' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join('');
            if (p < 1) requestAnimationFrame(step); else { el.textContent = final; el.removeAttribute('aria-label'); }
        })(start);
        found('decode');
    }
    const decIO = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { decode(e.target); decIO.unobserve(e.target); } }), { threshold: 0.6 });
    $$('main h2.h2').filter(h => h.children.length === 0).forEach(el => decIO.observe(el));

    // Markieren & Kopieren
    document.addEventListener('selectionchange', () => { if (String(getSelection()).trim().length > 2) found('select'); });
    document.addEventListener('copy', () => { later(10, () => toast(isEN ? 'Copied. Remember to credit the source.' : 'Kopiert. Quelle angeben nicht vergessen.')); found('copy'); });

    /* =====================================================================
       6. SEITE & TAB
       ===================================================================== */
    const favicon = $('link[rel="icon"]');
    const favHref = favicon?.href;
    const recIcon = (() => { const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'); x.fillStyle = '#E30613'; x.beginPath(); x.arc(16, 16, 11, 0, 6.283); x.fill(); return c.toDataURL(); })();
    let favBlink, awaySince = 0;
    document.addEventListener('visibilitychange', () => {
        if (!favicon) return;
        if (document.hidden) {
            awaySince = Date.now();
            let on = false;
            favBlink = setInterval(() => { on = !on; favicon.href = on ? recIcon : favHref; }, 900);
        } else {
            clearInterval(favBlink); favicon.href = favHref;
            if (Date.now() - awaySince > 1500) found('favicon');
        }
    });

    // Tageszeit-Gruss (einmal pro Besuch)
    try {
        if (!sessionStorage.getItem('jb2-greeted')) {
            sessionStorage.setItem('jb2-greeted', '1');
            const h = new Date().getHours();
            const msg = isEN
                ? (h < 5 ? 'Still up? Good time for editing.' : h < 11 ? 'Good morning!' : h < 14 ? 'Enjoy your lunch!' : h < 18 ? 'Have a nice afternoon!' : h < 23 ? 'Have a nice evening!' : 'Getting late, huh?')
                : (h < 5 ? 'Noch wach? Gute Zeit zum Schneiden.' : h < 11 ? 'Guten Morgen!' : h < 14 ? 'En Guete!' : h < 18 ? 'Schönen Nachmittag!' : h < 23 ? 'Schönen Abend!' : 'Spät geworden, hm?');
            later(1600, () => { toast(msg); found('greeting'); });
        }
    } catch (e) { /* ohne Speicher kein Gruss */ }

    // Seitenverhältnis beim Grössenändern
    let rsT;
    const gcd = (a, b) => (b ? gcd(b, a % b) : a);
    addEventListener('resize', () => {
        clearTimeout(rsT);
        rsT = later(300, () => {
            const g = gcd(innerWidth, innerHeight);
            let ratio = `${innerWidth / g}:${innerHeight / g}`;
            const r = innerWidth / innerHeight;
            const known = [[16 / 9, '16:9'], [16 / 10, '16:10'], [4 / 3, '4:3'], [21 / 9, '21:9'], [9 / 16, '9:16'], [1, '1:1']].find(([v]) => Math.abs(v - r) < 0.04);
            if (known) ratio = known[1];
            else if (ratio.length > 7) ratio = `${r.toFixed(2)}:1`;
            speed(`${ratio}  ${innerWidth}×${innerHeight}`);
            later(1800, () => { if (speedText().includes('×')) speed(''); });
            found('resize');
        });
    });
    addEventListener('beforeprint', () => found('print'));
    console.log('%cJB%c  julienbernath.ch · Spielmodus\nSchnitt läuft. Tipp: versuch mal ein paar Wörter zu tippen.', 'font:900 28px Archivo,sans-serif;color:#E30613', 'font:12px monospace;color:#888');

    /* =====================================================================
       7. TIMELINE-EXTRAS: Marker, Abspann, Schnellvorlauf, Zurückspulen, Shuttle
       ===================================================================== */
    const markers = [];
    tlTrack?.addEventListener('mousemove', () => found('tlhover'));
    function renderMarkers() {
        markersEl.innerHTML = '';
        markers.forEach((f) => {
            const b = document.createElement('button');
            b.type = 'button'; b.className = 'tl-marker'; b.style.left = `${f * 100}%`;
            b.setAttribute('aria-label', isEN ? 'Jump to marker' : 'Zum Marker springen');
            b.addEventListener('pointerdown', (e) => { e.stopPropagation(); scrollTo({ top: f * maxScroll(), behavior: RM ? 'auto' : 'smooth' }); found('markerjump'); });
            markersEl.appendChild(b);
        });
    }

    let endShown = false, lastY = scrollY, lastT = performance.now(), ffT, rewinding = false;
    addEventListener('scroll', () => {
        const atEnd = scrollY >= maxScroll() - 4;
        if (atEnd && !endShown) { endShown = true; speed(isEN ? 'END' : 'ENDE'); found('end'); }
        else if (!atEnd && endShown) { endShown = false; if (/^(ENDE|END)$/.test(speedText())) speed(''); }
        const now = performance.now(), v = (scrollY - lastY) / Math.max(1, now - lastT) * 1000;
        lastY = scrollY; lastT = now;
        if (Math.abs(v) > 5000 && !rewinding && shuttle === 0) {
            clearTimeout(ffT);
            speed(v > 0 ? '▶▶' : '◀◀');
            ffT = later(500, () => { if (/^[▶◀]{2}$/.test(speedText())) speed(''); });
            found('fastscroll');
        }
    }, { passive: true });

    // Zurückspulen (ersetzt im Spielmodus das normale Hochscrollen)
    $('[data-rewind]')?.addEventListener('click', (e) => {
        e.preventDefault(); e.stopImmediatePropagation();
        if (rewinding) return;
        rewinding = true;
        const ov = document.createElement('div'); ov.className = 'fx-rewind'; ov.textContent = '◀◀';
        if (!RM) layer.appendChild(ov);
        const from = scrollY, start = performance.now(), dur = RM ? 1 : 1400;
        (function step(now) {
            const p = Math.min(1, (now - start) / dur);
            scrollTo({ top: from * (1 - (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2)), behavior: 'instant' });
            if (p < 1) requestAnimationFrame(step); else { ov.remove(); rewinding = false; brand?.focus({ preventScroll: true }); }
        })(start);
        found('rewind');
    }, true);

    // J/K/L-Shuttle + Leertaste (wie in Premiere)
    const SPEEDS = [0, 3, 7, 14, 28];
    let shuttle = 0, shuttleRaf = null;
    function setShuttle(v) {
        shuttle = Math.max(-4, Math.min(4, v));
        speed(shuttle === 0 ? '' : `${shuttle > 0 ? '▶' : '◀'} ${2 ** (Math.abs(shuttle) - 1)}×`);
        if (shuttle !== 0 && !shuttleRaf) shuttleRaf = requestAnimationFrame(runShuttle);
    }
    function stopShuttle() { if (shuttle !== 0) setShuttle(0); }
    function runShuttle() {
        if (shuttle === 0) { shuttleRaf = null; return; }
        const dy = Math.sign(shuttle) * SPEEDS[Math.abs(shuttle)];
        scrollTo({ top: scrollY + dy, behavior: 'instant' });
        if ((dy > 0 && scrollY >= maxScroll() - 1) || (dy < 0 && scrollY <= 0)) { setShuttle(0); shuttleRaf = null; return; }
        shuttleRaf = requestAnimationFrame(runShuttle);
    }
    addEventListener('wheel', stopShuttle, { passive: true });
    addEventListener('touchstart', stopShuttle, { passive: true });

    // Monitor: Klick auf den Timecode wechselt die Bildrate
    const monitor = $('[data-monitor]');
    const monTc = $('[data-tc]', monitor || document);
    if (monitor && monTc) {
        const fpsModes = [25, 30, 50, 24];
        let fi = 0;
        monTc.style.cursor = 'pointer';
        monTc.removeAttribute('aria-hidden');
        monTc.setAttribute('role', 'button');
        monTc.tabIndex = 0;
        monTc.setAttribute('aria-label', isEN ? 'Change frame rate' : 'Bildrate wechseln');
        const nextFps = () => { fi = (fi + 1) % fpsModes.length; monitor.dataset.fps = String(fpsModes[fi]); toast(`${fpsModes[fi]}p`); found('fps'); };
        monTc.addEventListener('click', nextFps);
        monTc.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nextFps(); } });
    }

    /* =====================================================================
       8. PROJEKTE: Neigung, Making-of
       ===================================================================== */
    if (fine && !RM) {
        document.addEventListener('mousemove', (e) => {
            const c = e.target.closest?.('.card-link');
            if (!c) return;
            const f = $('.card-frame', c);
            if (!f) return;
            const r = f.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
            if (px < -0.5 || px > 0.5 || py < -0.5 || py > 0.5) return;
            f.style.setProperty('--ry', `${px * 7}deg`); f.style.setProperty('--rx', `${-py * 7}deg`);
            found('tilt');
        }, { passive: true });
        document.addEventListener('mouseout', (e) => {
            const c = e.target.closest?.('.card-link');
            if (c && !c.contains(e.relatedTarget)) { const f = $('.card-frame', c); f?.style.removeProperty('--rx'); f?.style.removeProperty('--ry'); }
        });
    }
    if (/julienbernath-ch\/?$/.test(location.pathname)) found('meta');

    /* =====================================================================
       9. MISCHPULT (Über mich): aus den Skill-Stufen, ohne Prozentzahlen
       ===================================================================== */
    const tiers = $$('.tiers .tier');
    if (tiers.length) {
        const LEVEL = [94, 64, 32, 32];   // Hauptwerkzeug, Sicher, Grundlagen, KI → Faderstellung
        const buses = tiers.slice(0, 4).map((tier, ti) => ({
            name: $('.tier-title', tier)?.textContent || '',
            channels: $$('li strong', tier).map(s => ({ name: s.textContent, level: LEVEL[ti], tier: $('.tier-title', tier)?.textContent || '' }))
        })).filter(b => b.channels.length);
        const wrap = make('div', { class: 'jbp-mixer-wrap' }, `<h3>${isEN ? 'Mixing desk' : 'Mischpult'}</h3><p>${isEN ? 'Play mode: the skills as a mixing desk. Try the faders.' : 'Spielmodus: die Skills als Mischpult. Versuch mal die Regler.'}</p>`);
        const mixer = make('div', { class: 'mixer' });
        mixer.innerHTML = buses.map(bus => `
            <div class="bus" style="--n:${bus.channels.length}">
                <div class="bus-channels">
                    ${bus.channels.map(c => `
                        <div class="channel" data-level="${c.level}" role="img" aria-label="${c.name}: ${c.tier}">
                            <span class="ch-led${c.level >= 90 ? ' is-hot' : ''}"></span>
                            <span class="ch-value">${c.tier}</span>
                            <div class="ch-fader" style="--level:${c.level}%"><span class="ch-meter"></span><span class="ch-slot"><span class="ch-knob"></span></span></div>
                            <span class="ch-name">${c.name}</span>
                        </div>`).join('')}
                </div>
                <span class="bus-name">${bus.name}</span>
            </div>`).join('');
        wrap.appendChild(mixer);
        ($('.tiers-extra') || tiers[tiers.length - 1]).after(wrap);

        const QUIPS = isEN
            ? ['Nice try. That is my level.', 'No. The fader stays where it is.', 'I saw that.', 'Confidence cannot be pulled down.', 'Back to start.']
            : ['Netter Versuch. Das ist mein Level.', 'Nein. Der Fader bleibt, wo er ist.', 'Ich hab das gesehen.', 'Selbstvertrauen lässt sich nicht runterziehen.', 'Zurück auf Start.'];
        $$('.channel', mixer).forEach(ch => {
            const fader = $('.ch-fader', ch), level = Number(ch.dataset.level);
            let drag = false;
            const setFromY = (y) => {
                const r = fader.getBoundingClientRect();
                const v = Math.round(Math.min(100, Math.max(0, (1 - (y - r.top) / r.height) * 100)));
                fader.style.setProperty('--level', `${v}%`);
            };
            fader.addEventListener('pointerdown', (e) => { drag = true; fader.classList.add('is-dragging'); fader.setPointerCapture(e.pointerId); setFromY(e.clientY); });
            fader.addEventListener('pointermove', (e) => { if (drag) setFromY(e.clientY); });
            const release = () => {
                if (!drag) return;
                drag = false; fader.classList.remove('is-dragging');
                fader.style.setProperty('--level', `${level}%`);
                toast(QUIPS[Math.floor(Math.random() * QUIPS.length)]);
                found('fader');
            };
            fader.addEventListener('pointerup', release);
            fader.addEventListener('pointercancel', release);
            $('.ch-name', ch).addEventListener('click', () => {
                const on = !ch.classList.contains('is-solo');
                $$('.channel', mixer).forEach(c => c.classList.remove('is-solo'));
                ch.classList.toggle('is-solo', on);
                mixer.classList.toggle('has-solo', on);
                found('solo');
            });
            let vuT = null;
            ch.addEventListener('mouseenter', () => {
                if (RM) return;
                const meter = $('.ch-meter', ch);
                (function vu() {
                    const l = Number(fader.style.getPropertyValue('--level').replace('%', '') || level);
                    meter.style.setProperty('--live', `${Math.max(0, Math.min(100, l - rand(0, 18)))}%`);
                    vuT = setTimeout(vu, 90);
                })();
                found('vu');
            });
            ch.addEventListener('mouseleave', () => { clearTimeout(vuT); $('.ch-meter', ch).style.removeProperty('--live'); });
        });
    }

    /* =====================================================================
       10. ÜBER MICH & KONTAKT
       ===================================================================== */
    const slate = $('[data-slate]');
    slate?.addEventListener('click', (e) => {
        slate.classList.remove('is-clap'); void slate.offsetWidth; slate.classList.add('is-clap');
        spawn({ x: e.clientX - 30, y: e.clientY - 20, vy: -3, g: 0.08, text: isEN ? 'CLAP!' : 'KLAPP!', size: 26, color: css('--red'), life: 50, vr: 0 });
        found('slate');
    });
    $('[data-playlist]')?.addEventListener('toggle', (e) => { if (e.target.open) found('playlist'); });

    // Papierflieger
    document.addEventListener('jb:plane', (e) => {
        found('plane');
        if (RM) return;
        const p = document.createElement('span');
        p.className = 'fx-particle';
        p.innerHTML = '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg>';
        p.style.color = css('--red');
        layer.appendChild(p);
        p.animate([
            { transform: `translate(${e.detail.x}px, ${e.detail.y}px) rotate(0deg)` },
            { transform: `translate(${e.detail.x + 180}px, ${e.detail.y - 220}px) rotate(-20deg)`, offset: 0.4 },
            { transform: `translate(${innerWidth + 60}px, -80px) rotate(-30deg)` }
        ], { duration: 1400, easing: 'cubic-bezier(.4,0,.6,1)' }).onfinish = () => p.remove();
    });

    // E-Mail «exportieren»
    mails.forEach(mail => mail.addEventListener('click', (e) => {
        if (RM) { found('export'); return; }
        e.preventDefault();
        const href = mail.getAttribute('href');
        const ov = document.createElement('div');
        ov.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:93;background:#232421;color:#EDEDE8;padding:18px 22px;border-radius:4px;width:min(360px,90vw);font-family:var(--mono);font-size:13px;box-shadow:0 20px 60px rgba(0,0,0,.4)';
        ov.innerHTML = `<div>${isEN ? 'Exporting email …' : 'Exportiere E-Mail …'}</div><div style="height:6px;background:#3a3b37;margin-top:10px;border-radius:3px;overflow:hidden"><i style="display:block;height:100%;width:0;background:#E30613;transition:width .9s cubic-bezier(.2,.7,.1,1)"></i></div><div class="pct" style="margin-top:8px;color:#F5C44A">0 %</div>`;
        layer.appendChild(ov);
        requestAnimationFrame(() => { ov.querySelector('i').style.width = '100%'; });
        let p = 0; const iv = setInterval(() => { p = Math.min(100, p + 11); ov.querySelector('.pct').textContent = `${p} %`; }, 90);
        later(1000, () => { clearInterval(iv); ov.remove(); location.href = href; });
        found('export');
    }));

    /* =====================================================================
       11. LABEL-FARBE
       ===================================================================== */
    const ACCENTS = { Rot: '#E30613', Iris: '#7B6FE0', Petrol: '#2F9C88', Mango: '#D9921B', Rosa: '#D9577D' };
    const accEl = $('#fx-accent', panel);
    let accent = store.get('jb2-accent', '#E30613');
    function setAccent(c, quiet) {
        accent = c; store.set('jb2-accent', c);
        root.style.setProperty('--red', c);
        $$('.chip', accEl).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === c)));
        readColors();
        if (!quiet) found('accent');
    }
    accEl.innerHTML = Object.entries(ACCENTS).map(([n, c]) => `<button type="button" class="chip" style="--sw:${c}" data-v="${c}" aria-label="${n}" aria-pressed="false"></button>`).join('');
    accEl.addEventListener('click', (e) => { const b = e.target.closest('.chip'); if (b) setAccent(b.dataset.v); });
    setAccent(accent, true);

    /* =====================================================================
       12. BILDSCHIRMSCHONER (nach 3 Minuten ohne Bewegung)
       ===================================================================== */
    let idleT, saver = null;
    function resetIdle() {
        clearTimeout(idleT);
        if (saver) stopSaver();
        if (!RM) idleT = later(180000, startSaver);
    }
    function startSaver() {
        if ($('dialog[open]')) return resetIdle();
        const bg = document.createElement('div'); bg.className = 'fx-saver-bg';
        const logo = document.createElement('div'); logo.className = 'fx-saver'; logo.innerHTML = '<span style="color:#fff">J</span><span>B</span>';
        layer.append(bg, logo);
        const cols = ['#E30613', '#9C93E6', '#4FAE9C', '#E3A93F', '#E07F9B', '#7FB2E5'];
        let x = rand(0, innerWidth - 160), y = rand(0, innerHeight - 100), vx = 2.2, vy = 1.8, ci = 0;
        saver = { bg, logo, raf: 0 };
        (function step() {
            const w = logo.offsetWidth, h = logo.offsetHeight;
            x += vx; y += vy;
            let hitX = false, hitY = false;
            if (x <= 0 || x + w >= innerWidth) { vx *= -1; hitX = true; }
            if (y <= 0 || y + h >= innerHeight) { vy *= -1; hitY = true; }
            if (hitX || hitY) { ci = (ci + 1) % cols.length; logo.lastChild.style.color = cols[ci]; }
            if (hitX && hitY) { confetti(x + w / 2, y + h / 2, 80); found('corner'); }
            logo.style.transform = `translate(${x}px, ${y}px)`;
            if (saver) saver.raf = requestAnimationFrame(step);
        })();
        found('saver');
        ['mousemove', 'keydown', 'pointerdown', 'wheel', 'touchstart'].forEach(ev => addEventListener(ev, resetIdle, { once: true, passive: true }));
    }
    function stopSaver() { cancelAnimationFrame(saver.raf); saver.bg.remove(); saver.logo.remove(); saver = null; }
    addEventListener('keydown', resetIdle);
    addEventListener('scroll', resetIdle, { passive: true });
    addEventListener('pointerdown', resetIdle, { passive: true });
    resetIdle();

    /* =====================================================================
       13. TASTATUR: B, C, M, Z, J/K/L, Leertaste und Geheimwörter
       ===================================================================== */
    let typed = '', singleT;
    const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
    let konami = [];
    const tmpClass = (c, ms) => { body.classList.add(c); later(ms, () => body.classList.remove(c)); };

    const WORDS = {
        julien: () => rain(['✚'], 60, 26, css('--red')),
        zug: () => { tmpClass('fx-frost', 4000); toast(isEN ? 'Ice cold. Greetings to the EVZ women.' : 'Eiskalt. Grüsse an die EVZ-Damen.'); },
        redbull: () => { toast(isEN ? 'Gives you wings.' : 'Verleiht Flügel.'); const x = mouse.x > 0 ? mouse.x : innerWidth / 2, y = mouse.y > 0 ? mouse.y : innerHeight / 2; for (let i = 0; i < 16; i++) later(i * 50, () => spawn({ x: x + rand(-30, 30), y, vx: rand(-1.5, 1.5), vy: rand(-6, -3), g: -0.05, text: i % 2 ? '🪽' : '〰', size: rand(16, 28), color: css('--red'), life: 120, vr: rand(-3, 3) })); },
        sandwich: () => rain(['🥪', '🍅', '🧀', '🌿'], 50, 30),
        fx30: () => {
            const v = document.createElement('div');
            v.className = 'fx-viewfinder';
            v.innerHTML = '<span style="left:12px;top:10px">● REC  4K 25p</span><span style="right:12px;top:10px">ISO 800  1/50  f/2.8</span><span style="left:12px;bottom:10px">S-Log3</span><span style="right:12px;bottom:10px">▮▮▮▯ 74 %</span><span style="left:50%;top:50%;transform:translate(-50%,-50%);font-size:28px">+</span>';
            layer.appendChild(v); later(6000, () => v.remove());
        },
        schnee: () => { for (let i = 0; i < 90; i++) later(i * 30, () => spawn({ x: rand(0, innerWidth), y: -10, vy: rand(1, 2.5), g: 0.01, text: '❄', size: rand(10, 22), color: '#9fc9ea', life: 420, wob: 1.5, vr: rand(-2, 2) })); },
        disco: () => { if (!RM) tmpClass('fx-disco', 5000); },
        matrix: () => { matrixGreen = true; setMode('tc'); later(8000, () => { matrixGreen = false; }); },
        schwerkraft: () => {
            if (RM) return;
            $$('main .card, main .tool, main .career li, main .tier, main .field-list li').filter(el => !el.closest('[hidden]')).forEach((el, i) => {
                const r = el.getBoundingClientRect();
                el.animate([{ transform: 'none' }, { transform: `translateY(${innerHeight - r.top + 100}px) rotate(${rand(-40, 40)}deg)`, offset: 0.35 }, { transform: `translateY(${innerHeight - r.top + 100}px) rotate(${rand(-40, 40)}deg)`, offset: 0.75 }, { transform: 'none' }], { duration: 3600, delay: i * 30, easing: 'cubic-bezier(.5,0,.5,1)' });
            });
        },
        flip: () => { if (!RM) tmpClass('fx-flip', 3000); },
        comic: () => { tmpClass('fx-comic', 5000); toast(isEN ? 'Oh no. Not Comic Sans.' : 'Oh nein. Bitte nicht Comic Sans.'); },
        kaffee: () => { rise(['☁', '☁', '·'], 14, mouse.x > 0 ? mouse.x : innerWidth / 2, mouse.y > 0 ? mouse.y : innerHeight / 2, css('--muted')); toast(isEN ? 'Coffee break. The export keeps running.' : 'Kaffeepause. Der Export läuft weiter.'); },
        berg: () => {
            if (RM) return;
            const m = document.createElement('div');
            m.className = 'fx-mountain';
            m.innerHTML = `<svg viewBox="0 0 1000 300" preserveAspectRatio="none" style="width:100%;height:100%"><path d="M0 300 L140 170 L210 210 L330 90 L420 150 L520 40 L600 120 L700 70 L820 180 L1000 120 L1000 300Z" fill="${css('--ink')}" opacity=".9"/><path d="M520 40 L560 76 L538 72 L520 92 L500 74 L484 78Z" fill="#fff"/><text x="520" y="28" text-anchor="middle" font-family="IBM Plex Mono" font-size="14" fill="${css('--ink')}">Barrhorn 3610 m</text></svg>`;
            layer.appendChild(m); later(4600, () => m.remove());
        },
        island: () => {
            const x0 = innerWidth / 2, y0 = innerHeight - 70;
            for (let i = 0; i < 70; i++) later(i * 12, () => spawn({ x: x0 + rand(-14, 14), y: y0, vx: rand(-1.6, 1.6), vy: rand(-17, -11), g: 0.32, box: rand(4, 9), ratio: 1, round: true, color: i % 3 ? '#d7ecf7' : '#9fc9ea', life: 110 }));
            toast(isEN ? 'Strokkur says hello.' : 'Strokkur sagt Hallo.');
        },
        retro: () => { if (!RM) tmpClass('fx-vhs', 5000); },
        mono: () => body.classList.toggle('fx-mono'),
        zoom: () => { if (!RM) tmpClass('fx-vertigo', 2000); },
        party: () => { confetti(20, innerHeight - 80, 90); confetti(innerWidth - 20, innerHeight - 80, 90); },
        hallo: () => toast(isEN ? 'Hoi! Nice to have you here.' : 'Hoi! Schön, bist du da.'),
        cut: () => {
            if (RM) return;
            const y = mouse.y > 0 ? mouse.y : innerHeight / 2;
            const line = document.createElement('div');
            line.style.cssText = `position:fixed;left:0;top:${y}px;height:2px;width:100%;background:${css('--red')};z-index:93;transform-origin:left`;
            layer.appendChild(line);
            line.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 250, easing: 'ease-in' }).onfinish = () => {
                $('main').animate([{ transform: 'none' }, { transform: 'translateX(14px) skewX(-2deg)' }, { transform: 'none' }], { duration: 400 });
                later(300, () => line.remove());
            };
        },
        beat: () => { if (!RM) tmpClass('fx-beat', 4100); },
        fokus: () => { if (!RM) tmpClass('fx-blur', 2300); },
        spiegel: () => { if (!RM) tmpClass('fx-mirror', 3000); },
        gross: () => tmpClass('fx-big', 6000),
        bernath: () => nameWave(),
        baden: () => { rise(['○', '◦', '○'], 40, innerWidth / 2, innerHeight - 90, '#7FB2E5'); toast(isEN ? 'Baden. Thermal water since Roman times.' : 'Baden. Thermalwasser seit der Römerzeit.'); },
        premiere: () => { toast(isEN ? 'Premiere Pro: main tool. Nothing beats it.' : 'Premiere Pro: Hauptwerkzeug. Mehr geht nicht.'); timeline?.classList.add('is-gold'); later(3000, () => timeline?.classList.remove('is-gold')); },
        drohne: () => {
            if (RM) return;
            const d = document.createElement('span');
            d.className = 'fx-particle';
            d.innerHTML = `<svg width="64" height="40" viewBox="0 0 64 40"><g fill="${css('--ink')}"><rect x="24" y="16" width="16" height="9" rx="2"/><rect x="8" y="19" width="48" height="3"/><ellipse cx="8" cy="15" rx="9" ry="2"/><ellipse cx="56" cy="15" rx="9" ry="2"/><circle cx="32" cy="28" r="3"/></g><circle cx="32" cy="28" r="1.4" fill="#E30613"/></svg>`;
            layer.appendChild(d);
            const kf = []; for (let i = 0; i <= 20; i++) { const p = i / 20; kf.push({ transform: `translate(${-80 + p * (innerWidth + 160)}px, ${innerHeight * 0.3 + Math.sin(p * 9) * 60}px) rotate(${Math.cos(p * 9) * 8}deg)` }); }
            d.animate(kf, { duration: 4500, easing: 'linear' }).onfinish = () => d.remove();
        },
        blender: () => {
            toast(isEN ? 'Blender: basics. Work in progress.' : 'Blender: Grundlagen. Daran wird gearbeitet.');
            if (RM) return;
            const c = document.createElement('div');
            c.style.cssText = 'position:fixed;left:50%;top:45%;width:120px;height:120px;margin:-60px;z-index:92;transform-style:preserve-3d;pointer-events:none';
            const faces = ['rotateY(0)', 'rotateY(90deg)', 'rotateY(180deg)', 'rotateY(-90deg)', 'rotateX(90deg)', 'rotateX(-90deg)'];
            c.innerHTML = faces.map(f => `<i style="position:absolute;inset:0;border:2px solid #E87D0D;background:rgba(232,125,13,.08);transform:${f} translateZ(60px)"></i>`).join('');
            layer.appendChild(c);
            c.animate([{ transform: 'rotateX(0) rotateY(0)' }, { transform: 'rotateX(360deg) rotateY(720deg)' }], { duration: 3000, easing: 'ease-in-out' }).onfinish = () => c.remove();
        },
        itson: () => {
            const prev = mode; setMode('aus', true); grain.classList.add('is-off');
            const t = document.createElement('div');
            t.textContent = 'In the Silence of Nature';
            t.style.cssText = `position:fixed;inset:0;display:grid;place-items:center;z-index:92;font:300 italic clamp(1.6rem,5vw,4rem)/1 var(--font);color:${css('--ink')};background:color-mix(in srgb, var(--base) 85%, transparent);pointer-events:none`;
            layer.appendChild(t);
            t.animate([{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], { duration: 4000 }).onfinish = () => { t.remove(); setMode(prev, true); if (!RM) grain.classList.remove('is-off'); };
        },
        rec: () => {
            const f = document.createElement('div');
            f.style.cssText = `position:fixed;inset:6px;border:3px solid ${css('--red')};z-index:93;pointer-events:none;border-radius:6px`;
            f.innerHTML = `<span style="position:absolute;top:10px;right:14px;font:500 14px var(--mono);color:${css('--red')}">● REC</span>`;
            layer.appendChild(f);
            f.animate([{ opacity: 1 }, { opacity: 0.3 }], { duration: 600, iterations: RM ? 1 : 8, direction: 'alternate' }).onfinish = () => f.remove();
        },
        nacht: () => { root.dataset.theme = 'dark'; try { localStorage.setItem('jb2-theme', 'dark'); } catch (e) { /* privat */ } readColors(); setMode('sterne'); }
    };
    const TYPED = ['julien', 'bernath', 'zug', 'schwerkraft', 'flip', 'comic', 'retro', 'mono', 'zoom', 'hallo', 'cut', 'beat', 'fokus', 'spiegel', 'gross', 'itson', 'rec'];

    // Versteckte Auslöser
    const fire = (k) => { WORDS[k](); found(`c-${k}`); };
    const SHOTLIST_FX = {
        'Täglich ein Tomaten-Mozzarella-Sandwich': 'sandwich', 'Red Bull Sugarfree': 'redbull', 'Sony FX30': 'fx30',
        'Barrhorn besteigen': 'berg', 'Island': 'island', 'Lofoten im Winter': 'schnee',
        'Mit der Drohne über einen Gletscher': 'drohne', 'Nordlichter fotografieren': 'nacht'
    };
    $$('[data-shotlist] input').forEach(box => box.addEventListener('change', () => {
        if (!box.checked) return;
        const k = SHOTLIST_FX[box.dataset.key];
        if (k) fire(k);
        const group = box.closest('[data-group]');
        if (group && $$('input', group).every(x => x.checked)) {
            const r = box.getBoundingClientRect();
            confetti(r.left + 20, r.top, 90);
            toast(`${group.dataset.group}: ${isEN ? 'all done!' : 'alles erledigt!'}`);
            found('allchecked');
        }
    }));
    $$('.ch-name, .tier li strong').forEach(n => {
        if (n.textContent === 'Premiere Pro') { n.style.cursor = 'pointer'; n.addEventListener('click', () => fire('premiere')); }
        if (n.textContent === 'Blender') { n.style.cursor = 'pointer'; n.addEventListener('click', () => fire('blender')); }
    });
    $$('[data-slate] dd').forEach(dd => { if (dd.textContent.trim() === 'Baden, Aargau') { dd.style.cursor = 'pointer'; dd.addEventListener('click', (e) => { e.stopPropagation(); fire('baden'); }); } });
    const plSummary = $('[data-playlist] summary');
    if (plSummary) {
        const eq = make('span', { class: 'eq', 'aria-hidden': 'true' }, '<i></i><i></i><i></i><i></i>');
        plSummary.prepend(eq);
        eq.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); fire('disco'); });
    }
    if (tlTc) { tlTc.style.cursor = 'pointer'; tlTc.addEventListener('click', () => fire('matrix')); }
    $('[data-clock]')?.addEventListener('click', () => fire('kaffee'));
    const partyH = $('.contact h1');
    if (partyH) { partyH.style.cursor = 'pointer'; partyH.addEventListener('click', (e) => { fire('party'); confetti(e.clientX, e.clientY, 40); }); }

    addEventListener('keydown', (e) => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        if (e.target.closest?.('input, textarea, select, [contenteditable]')) return;
        const k = e.key.toLowerCase();

        konami.push(k); konami = konami.slice(-10);
        if (konami.join() === KONAMI.join()) {
            konami = [];
            body.classList.add('fx-gold'); timeline?.classList.add('is-gold');
            confetti(innerWidth / 2, innerHeight / 3, 140);
            toast(isEN ? "Director's Cut unlocked." : "Director's Cut freigeschaltet.");
            found('konami');
            return;
        }
        if ($('dialog[open]') || !panel.hidden) return;
        if (k === ' ' && !e.target.closest?.('button, a, summary, [role="slider"], [role="button"]')) { e.preventDefault(); setShuttle(shuttle ? 0 : 1); found('space'); return; }
        if (k.length !== 1 || !/[a-zäöü0-9]/.test(k)) return;

        typed = (typed + k).slice(-14);
        clearTimeout(singleT);
        for (const w of TYPED) {
            if (typed.endsWith(w)) { typed = ''; setShuttle(0); WORDS[w](); found(`w-${w}`); return; }
        }
        if (k === 'l') { setShuttle(shuttle <= 0 ? 1 : shuttle + 1); found('jkl'); return; }
        if (k === 'j') { setShuttle(shuttle >= 0 ? -1 : shuttle - 1); found('jkl'); return; }
        if (k === 'k') { setShuttle(0); return; }
        // Einzeltasten: kurz warten, falls gerade ein Wort getippt wird
        if ('bcmz'.includes(k)) singleT = later(450, () => singleKey(k));
    });
    function singleKey(k) {
        if (k === 'b') { setMode(MODE_KEYS[(MODE_KEYS.indexOf(mode) + 1) % MODE_KEYS.length]); found('bgkey'); }
        else if (k === 'c' && fine) { const ks = Object.keys(CUR_MODES); setCursor(ks[(ks.indexOf(curMode) + 1) % ks.length]); found('curkey'); }
        else if (k === 'm') { markers.push(playheadFrac()); renderMarkers(); found('marker'); }
        else if (k === 'z') {
            const clips = $$('.card-link').filter(c => !c.closest('[hidden]'));
            if (clips.length) { found('random'); clips[Math.floor(Math.random() * clips.length)].click(); }
        }
    }

    // Klicks auf Punkt-Wellen
    addEventListener('click', (e) => { if (mode === 'punkte') ripples.push({ x: e.clientX, y: e.clientY, r: 0, a: 1 }); });
    setMode(mode, true);

    window.JBPlay = { found, toast, list: LIST, off: () => document.dispatchEvent(new Event('jb:play-off')) };
})();
