/* ==========================================================================
   JULIEN BERNATH // V2.1 "SCHNITT" – Kern
   Projekte, Viewer, Timeline, Mischpult, Shotlist, Licht.
   Die ganzen Spielereien wohnen in fx.js.
   ========================================================================== */

(() => {
    'use strict';

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const store = {
        get(k, d = null) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
        set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* privat */ } }
    };
    let FPS = 25;

    const toTimecode = (frames, fps = FPS) => {
        frames = Math.max(0, Math.floor(frames));
        const r = Math.round(fps);
        const f = frames % r;
        const t = Math.floor(frames / r);
        const p = (n) => String(n).padStart(2, '0');
        return `${p(Math.floor(t / 3600))}:${p(Math.floor(t / 60) % 60)}:${p(t % 60)}:${p(f)}`;
    };

    const toastEl = $('#toast');
    let toastT;
    function toast(msg, isFx = false) {
        toastEl.textContent = msg;
        toastEl.classList.toggle('is-fx', isFx);
        toastEl.classList.add('is-on');
        clearTimeout(toastT);
        toastT = setTimeout(() => toastEl.classList.remove('is-on'), 2600);
    }
    // Meldet einen entdeckten Effekt an fx.js
    const found = (id) => document.dispatchEvent(new CustomEvent('jb:fx', { detail: id }));

    /* =====================================================================
       1. PROJEKTDATEN
       ===================================================================== */
    function gallery(basePath, exts, count, labelPrefix) {
        const list = count ? Array(count).fill(exts) : exts.split(/\s+/);
        const fileBase = basePath.split('/').pop();
        return list.map((ext, i) => ({
            type: 'image',
            url: `${basePath}${i + 1}.${ext}`,
            label: `${(labelPrefix || fileBase).toUpperCase()}${i + 1}.${ext.toUpperCase()}`
        }));
    }



    const projectsData = {
        kloten_photo: {
            id: 'JB-PRJ-01',
            category: 'PHOTOGRAPHY / SPORT',
            title: 'Fotoserie EHC Kloten',
            previewImage: 'assets/images/ehc-kloten/ehck-14.webp',
            client: 'EHC Kloten',
            year: '2026',
            role: 'Sportfotograf / Mediamatiker',
            deliverables: 'Action-Fotografie, Spieltags-Reportage, Bildbearbeitung',
            description: 'Dynamische Actionshots eines Heimspiels des EHC Kloten gegen den HC Lugano in der Swiss Arena. Die Aufnahmen fangen die extreme Intensität auf dem Eis, die Emotionen in der Fankurve und die packende Matchday-Atmosphäre ein. Fotografiert und gefilmt wurde mit zwei Kameras und einem Gimbal.',
            media: gallery('assets/images/ehc-kloten/ehck-', 'webp', 16)
        },
        kloten_tiktok: {
            id: 'JB-PRJ-02',
            category: 'VIDEO / SOCIAL MEDIA',
            title: 'TikTok-Video EHC Kloten',
            previewImage: 'assets/images/ehc-kloten/ehck-6.webp',
            client: 'EHC Kloten',
            year: '2025',
            role: 'Video Editor & Content Creator',
            deliverables: 'Kurzvideo-Konzeption, Schnitt, Sound Design, Grading',
            description: 'Energetisches Kurzvideo für den offiziellen TikTok-Kanal des EHC Kloten. Das Video kombiniert rasante Schnitte mit passenden Sound-Effekten, um die Interaktionsrate unter den Eishockey-Fans zu maximieren. Speziell optimiert für mobile Displays und virale Relevanz.',
            media: [
                { type: 'tiktok', id: '7332142480294464801', label: 'TIKTOK_VIDEO.URL' }
            ]
        },
        evzug_photo: {
            id: 'JB-PRJ-03',
            category: 'PHOTOGRAPHY / SPORT',
            title: 'Fotoserie EV Zug Damen',
            previewImage: 'assets/images/ev-zug/evz-13.jpg',
            client: 'EV Zug Damen',
            year: '2026',
            role: 'Sportfotograf',
            deliverables: 'Action-Shooting, Bildredaktion, Postproduction',
            description: 'Actionreiche Aufnahmen über die Damenmannschaft des EV Zug. Im Fokus stehen Athletik, Leidenschaft und die Dynamik des Frauen-Eishockeys. Die kontrastreichen Schwarz-Weiss- und Farbaufnahmen heben die Physis und den emotionalen Siegeswillen des Teams hervor, den sie mit dem Sieg der Meisterschaft auch bewiesen haben.',
            media: gallery('assets/images/ev-zug/evz-', 'jpg', 22)
        },
        limmattal_photo: {
            id: 'JB-PRJ-04',
            category: 'PHOTOGRAPHY / SPORT',
            title: 'Fotoserie UHC Limmattal',
            previewImage: 'assets/images/uhc-limmattal/limmattal-26.webp',
            client: 'UHC Limmattal',
            year: '2026',
            role: 'Sportfotograf',
            deliverables: 'Spielszenen-Fotografie, Social Media Assets',
            description: 'Actionreiche Hallenfotografie für den Schweizer Unihockeyclub Limmattal. Die Serie dokumentiert schnelle Angriffsmanöver, präzise Schüsse und die emotionale Atmosphäre in der Sporthalle. Perfekt farbkorrigierte Aufnahmen für die Vereins-Website und Matchflyer.',
            media: [
                { type: 'youtube', id: '3kHn7e8IcUo', label: 'YOUTUBE_VIDEO.URL' },
                ...gallery('assets/images/uhc-limmattal/limmattal-', 'webp', 28)
            ]
        },
        dorffestflyer: {
            id: 'JB-PRJ-06',
            category: 'PRINT DESIGN',
            title: 'Dorffestflyer Ehrendingen',
            previewImage: 'assets/images/uhc-dorffest/dorffest-7.jpg',
            client: 'OK Dorffest Ehrendingen',
            year: '2025',
            role: 'Grafikdesigner / Mediamatiker',
            deliverables: 'Visual Identity, Flyer-Design, Plakate, Druckdaten',
            description: 'Umfassendes Print-Design für den Stand der UHC Bulldogs Ehrendingen am Ehrendinger Dorffest. Die Gestaltung vereint traditionelle Festlichkeit mit modernen typografischen Rastern. Einzelne Designs wurden als Flyer im A5-Format, A4-Format sowie als Plakat gedruckt, verteilt und aufgehängt.',
            media: gallery('assets/images/uhc-dorffest/dorffest-', 'jpg jpg webp webp jpg webp jpg jpg jpg jpg jpg')
        },
        fcwil_photo: {
            id: 'JB-PRJ-07',
            category: 'PHOTOGRAPHY / SPORT',
            title: 'Fotoserie FC Wil',
            previewImage: 'assets/images/fc-wil/fcw-1.jpg',
            client: 'FC Wil 1900',
            year: '2023',
            role: 'Sportfotograf',
            deliverables: 'Spieltags-Fotografie, Fankultur-Dokumentation, RAW',
            description: 'Sportfotografie eines Pre-Game-Trainings des FC Wil in der Challenge League. Die Bilder beleuchten die ansteigende Intensität auf dem Platz, emotionale Reaktionen der Spieler sowie die Arbeit des Team-Staffs.',
            media: gallery('assets/images/fc-wil/fcw-', 'jpg jpg webp webp webp webp jpg webp webp webp')
        },
        lenzburg_sw: {
            id: 'JB-PRJ-08',
            category: 'PHOTOGRAPHY / ART',
            title: 'Fotoserie Lenzburg S/W',
            client: 'Freies Projekt',
            year: '2024',
            role: 'Fotograf / Editor',
            deliverables: 'Fine Art Prints, Schwarz-Weiss-Farbkorrektur',
            description: 'Künstlerische Schwarz-Weiss-Fotoserie, welche die historische Altstadt und das imposante Schloss Lenzburg in kontrastreichen Geometrien zeigt. Durch das gezielte Spiel von Licht und tiefen Schatten entsteht ein beinahe architektonischer Rhythmus.',
            media: gallery('assets/images/lenzburg/lb-', 'jpg jpg webp jpg jpg jpg jpg jpg webp jpg webp webp webp jpg jpg jpg jpg jpg webp jpg jpg webp jpg webp jpg jpg')
        },
        itson: {
            id: 'JB-PRJ-09',
            category: 'VIDEO / CONCEPT',
            title: 'Vertiefungsarbeit "ITSON"',
            previewImage: 'assets/images/itson/itson-8.webp',
            client: 'Berufsschule (Eigenprojekt)',
            year: '2025',
            role: 'Organisator & Videograf',
            deliverables: 'Multimediales Konzept, Droneshots, Video-Visualisierung',
            description: 'Vertiefungsarbeit (VA) in Form eines Kurzfilms. Das Projekt "ITSON", In The Silence Of Nature, umfasst eine umfassende Vorbereitung und eine noch längere Bearbeitungs-Phase. Gefilmt wurde abseits von Bevölkerung und moderner Infrastruktur.',
            media: [
                { type: 'youtube', id: 'i5LtMUy2Ngk', label: 'YOUTUBE_VIDEO.URL' },
                ...gallery('assets/images/itson/itson-', 'jpg jpeg jpeg jpeg jpeg webp webp webp webp jpeg png')
            ]
        },
        tikamate: {
            id: 'JB-PRJ-10',
            category: 'BRANDING / DESIGN',
            title: '"Tika Mate"-Konzept',
            client: 'Tika Beverages (Eigenprojekt)',
            year: '2025',
            role: 'Brand & Packaging Designer',
            deliverables: 'Logo, Cans Packaging, Social Media Grid, Mockups',
            description: 'Ganzheitliche Entwicklung einer Getränkemarke namens "Tika Mate". Das Konzept basiert auf einem umweltfreundlichen, minimalistischen Design. Es wurden sowohl die Aludosen als auch die digitale Social-Media-Kampagne zur Produkteinführung visuell gestaltet.',
            media: gallery('assets/images/tika-mate/tika-', 'jpg', 15)
        },
        nature_photo: {
            id: 'JB-PRJ-11',
            category: 'PHOTOGRAPHY / NATURE',
            title: 'Tier- & Naturfotos',
            client: 'Freies Projekt',
            year: '2023 - 2026',
            role: 'Naturfotograf',
            deliverables: 'Outdoor-Fotografie, Makro-Aufnahmen, Color-Grading',
            description: 'Fotografische Einblicke in die Tierwelt und verschiedene Naturlandschaften. Im Mittelpunkt stehen natürliche Lichtverhältnisse, ruhige Kompositionen und echte Begegnungen. Die Bilder dokumentieren besondere Momente draussen und zeigen die Vielfalt und Atmosphäre der Natur aus einer persönlichen Perspektive.',
            media: gallery('assets/images/natur-tiere/nt-', 'webp jpg webp jpg jpg webp jpg webp jpg jpg jpg jpg jpg jpg jpg webp jpg webp jpg jpg webp jpg jpg jpg webp webp webp webp webp')
        },
        bulldogs_graphics: {
            id: 'JB-PRJ-12',
            category: 'BRANDING / SOCIAL MEDIA',
            title: 'Matchday-Grafiken UHC Bulldogs',
            previewImage: 'assets/images/uhc-grafiken/uhc-grafiken-9.webp',
            client: 'UHC Bulldogs Ehrendingen',
            year: '2024 - 2026',
            role: 'Social Media Designer',
            deliverables: 'Photoshop Templates, Spieltagsankündigungen, Resultatgrafiken',
            description: 'Konzeption und Gestaltung eines dynamischen Social-Media-Grafiksystems für die Matchday-Ankündigungen und Live-Ergebnis-Posts der UHC Bulldogs Ehrendingen auf Instagram. Entwickelt in Figma für einfache, mobile Pflege durch den Verein.',
            media: [
                { type: 'youtube', id: 'KXqK217Yzi4', label: 'REEL_01.URL' },
                { type: 'youtube', id: 'ByaoJRIcHjs', label: 'REEL_02.URL' },
                { type: 'youtube', id: 'TEzgrs_WVZw', label: 'REEL_03.URL', portrait: true },
                ...gallery('assets/images/uhc-grafiken/uhc-grafiken-', 'webp webp png png png png png png webp webp png webp', 0, 'GRAFIK-')
            ]
        },
        sonstiges: {
            id: 'JB-PRJ-13',
            category: 'BRANDING / GRAPHICS',
            title: 'Sonstige Arbeiten',
            previewImage: 'assets/images/sonstiges/sonst-6.webp',
            client: 'Diverse',
            year: '2023 - 2026',
            role: 'Designer / Editor',
            deliverables: 'Grafikdesign, Foto-Pools, Layout-Experimente',
            description: 'Kreative Vielfalt: Diverse Grafikdesigns, Fotografie-Pools und gestalterische Layout-Experimente aus verschiedenen Projekten und Übungen.',
            media: gallery('assets/images/sonstiges/sonst-', 'webp webp webp jpg webp webp webp webp jpg webp png png webp webp')
        },
        portfolio_website: {
            id: 'JB-PRJ-14',
            category: 'WEB DEVELOPMENT / UI-UX',
            title: 'julienbernath.ch',
            client: 'Eigenprojekt',
            year: '2026',
            role: 'Art Director & Chef-Prompter',
            deliverables: 'Ideen, Geschmack und ungefähr 400-mal „nein, nochmal“',
            description: 'Diese Website. Ehrlich gesagt hat die KI den Code geschrieben, und ich habe danebengesessen und gesagt, was mir nicht gefällt. Ziemlich oft. Die Ideen, die Fotos und der Geschmack sind von mir, die Tipparbeit eher nicht. Beim Film nennt man das Regie.',
            media: []
        }
    };

    const BIN = [
        { id: 'kloten_photo',      kind: 'photo',  layout: 'feature-l' },
        { id: 'kloten_tiktok',     kind: 'video' },
        { id: 'evzug_photo',       kind: 'photo' },
        { id: 'limmattal_photo',   kind: 'photo' },
        { id: 'fcwil_photo',       kind: 'photo' },
        { id: 'lenzburg_sw',       kind: 'photo' },
        { id: 'itson',             kind: 'video',  layout: 'feature-r' },
        { id: 'nature_photo',      kind: 'photo' },
        { id: 'bulldogs_graphics', kind: 'design' },
        { id: 'tikamate',          kind: 'design' },
        { id: 'dorffestflyer',     kind: 'design' },
        { id: 'sonstiges',         kind: 'design' },
        { id: 'portfolio_website', kind: 'design', layout: 'wide', graphic: 'site' }
    ];

    const KIND = {
        photo:  { label: 'Foto',   color: 'var(--clip-teal)' },
        video:  { label: 'Video',  color: 'var(--clip-iris)' },
        design: { label: 'Design', color: 'var(--clip-mango)' }
    };

    const GRAPHICS = {
        site: `<svg viewBox="0 0 400 225" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <rect x="20" y="20" width="360" height="130" rx="3"/>
            <text x="200" y="98" text-anchor="middle" font-family="Archivo, sans-serif" font-weight="800" font-size="38" fill="currentColor" stroke="none">JULIEN BERNATH</text>
            <line x1="20" y1="168" x2="380" y2="168" opacity=".6"/>
            <rect x="20" y="178" width="70" height="26" rx="3" fill="#E07F9B" stroke="none"/>
            <rect x="93" y="178" width="120" height="26" rx="3" fill="#4FAE9C" stroke="none"/>
            <rect x="216" y="178" width="60" height="26" rx="3" fill="#9C93E6" stroke="none"/>
            <rect x="279" y="178" width="101" height="26" rx="3" fill="#E3A93F" stroke="none"/>
            <line x1="150" y1="160" x2="150" y2="212" stroke="#E30613" stroke-width="2.5"/>
            <path d="M144 160h12l-6 7z" fill="#E30613" stroke="none"/>
        </svg>`
    };

    const imagesOf = (d) => (d.media || []).filter(m => m.type === 'image');
    const videosOf = (d) => (d.media || []).filter(m => m.type !== 'image');
    function lengthLabel(d) {
        const v = videosOf(d).length, i = imagesOf(d).length, out = [];
        if (v) out.push(`${v} ${v === 1 ? 'Video' : 'Videos'}`);
        if (i) out.push(`${i} Bilder`);
        return out.join(', ') || 'Live';
    }
    const previewOf = (d) => d.previewImage || (imagesOf(d)[0] || {}).url || null;


    /* =====================================================================
       2. PROJEKT-BIN
       ===================================================================== */
    const bin = $('#bin');
    const binItems = [];
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            const img = e.target.querySelector('img[data-src]');
            if (img) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                if (!reducedMotion) img.classList.add('reveal');
            }
            io.unobserve(e.target);
        });
    }, { rootMargin: '200px' });

    BIN.forEach((entry) => {
        const data = projectsData[entry.id];
        if (!data) return;
        const kind = KIND[entry.kind];
        const li = document.createElement('li');
        li.className = 'bin-item';
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'clip';
        el.setAttribute('aria-haspopup', 'dialog');
        el.dataset.label = 'Ansehen';

        const preview = previewOf(data);
        el.innerHTML = `
            <div class="clip-frame">
                ${preview ? `<img data-src="${preview}" alt="" decoding="async">` : `<div class="clip-graphic">${GRAPHICS[entry.graphic] || ''}</div>`}
                <span class="clip-badge" style="--c:${kind.color}">${kind.label}</span>
                ${videosOf(data).length ? '<span class="clip-play" aria-hidden="true"><svg viewBox="0 0 10 12"><path d="M0 0l10 6-10 6z"/></svg></span>' : ''}
            </div>
            <div class="clip-caption">
                <div>
                    <h3 class="clip-title">${data.title}</h3>
                    <p class="clip-meta">${data.client}, ${data.year}</p>
                </div>
                <span class="clip-len">${lengthLabel(data)}</span>
            </div>`;
        el.addEventListener('click', () => openViewer(entry.id, 0));
        const img = el.querySelector('.clip-frame img');
        if (img) img.addEventListener('error', () => img.replaceWith(Object.assign(document.createElement('div'), { className: 'clip-graphic', innerHTML: GRAPHICS.site })), { once: true });
        li.appendChild(el);
        bin.appendChild(li);
        io.observe(li);
        binItems.push({ li, entry });
    });

    const tabs = $$('.bin-tab');
    function applyLayout(filter) {
        binItems.forEach(({ li, entry }) => {
            li.hidden = !(filter === 'all' || entry.kind === filter);
            li.classList.remove('is-feature-l', 'is-feature-r', 'is-half', 'is-wide');
            if (filter === 'all' && entry.layout) li.classList.add(`is-${entry.layout}`);
        });
    }
    tabs.forEach(tab => {
        const f = tab.dataset.filter;
        tab.querySelector('.count').textContent = f === 'all' ? binItems.length : binItems.filter(b => b.entry.kind === f).length;
        tab.addEventListener('click', () => {
            const before = new Map(binItems.map(b => [b.li, b.li.getBoundingClientRect()]));
            tabs.forEach(t => { t.classList.toggle('is-active', t === tab); t.setAttribute('aria-pressed', String(t === tab)); });
            applyLayout(f);
            // FLIP: Clips gleiten an ihren neuen Platz
            if (!reducedMotion) {
                binItems.forEach(({ li }) => {
                    if (li.hidden) return;
                    const a = before.get(li), b = li.getBoundingClientRect();
                    if (!a || !a.width) { li.animate([{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'none' }], { duration: 350, easing: 'ease-out' }); return; }
                    li.animate([{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px)` }, { transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.2,.7,.1,1)' });
                });
            }
            if (f !== 'all') found('filter');
            requestAnimationFrame(layoutTimeline);
        });
    });
    applyLayout('all');


    /* =====================================================================
       3. VIEWER
       ===================================================================== */
    const viewer = $('#viewer');
    const vMedia = $('#viewer-media');
    const vStrip = $('#viewer-strip');
    const vCount = $('#viewer-count');
    const stagePrev = $('#stage-prev');
    const stageNext = $('#stage-next');
    const viewerOrder = BIN.map(b => b.id);
    let vProject = null, vIndex = 0;

    const CAT_DE = {
        'PHOTOGRAPHY': 'Fotografie', 'VIDEO': 'Video', 'SOCIAL MEDIA': 'Social Media', 'PRINT DESIGN': 'Printdesign',
        'BRANDING': 'Branding', 'DESIGN': 'Design', 'GRAPHICS': 'Grafik', 'WEB DEVELOPMENT': 'Webentwicklung',
        'UI-UX': 'UI/UX', 'CONCEPT': 'Konzept', 'SPORT': 'Sport', 'ART': 'Freie Arbeit', 'NATURE': 'Natur'
    };
    const categoryDE = (c) => c.split('/').map(x => CAT_DE[x.trim()] || x.trim()).join(', ');

    function openViewer(id, index) {
        const data = projectsData[id];
        if (!data) return;
        vProject = id;
        $('#viewer-cat').textContent = categoryDE(data.category);
        $('#viewer-title').textContent = data.title;
        $('#viewer-desc').textContent = data.description;
        $('#viewer-client').textContent = data.client;
        $('#viewer-year').textContent = data.year;
        $('#viewer-role').textContent = data.role;
        $('#viewer-deliv').textContent = data.deliverables;

        const media = data.media || [];
        vStrip.innerHTML = '';
        vStrip.hidden = media.length < 2;
        const frag = document.createDocumentFragment();
        media.forEach((m, i) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'strip-item' + (m.type === 'image' ? '' : ' strip-video');
            b.setAttribute('role', 'tab');
            b.setAttribute('aria-label', `${m.type === 'image' ? 'Bild' : 'Video'} ${i + 1}`);
            b.dataset.index = i;
            b.innerHTML = m.type === 'image' ? `<img src="${m.url}" alt="" loading="lazy" decoding="async">` : '▶';
            frag.appendChild(b);
        });
        vStrip.appendChild(frag);
        if (!viewer.open) viewer.showModal();
        showMedia(index || 0);
        if (id === 'portfolio_website') found('meta');
    }

    function showMedia(i) {
        const data = projectsData[vProject];
        const media = data.media || [];
        vMedia.innerHTML = '';
        stagePrev.hidden = stageNext.hidden = media.length < 2;
        if (!media.length) {
            vMedia.innerHTML = `<div class="clip-graphic">${GRAPHICS.site}</div>`;
            vCount.textContent = '';
            return;
        }
        vIndex = (i + media.length) % media.length;
        const m = media[vIndex];
        let el;
        if (m.type === 'image') {
            el = new Image();
            el.src = m.url;
            el.alt = `${data.title}, Bild ${vIndex + 1} von ${media.length}`;
            el.decoding = 'async';
            el.className = 'loupe';
            // Lupe: Klick zoomt an die Stelle
            el.addEventListener('click', (e) => {
                const r = el.getBoundingClientRect();
                el.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
                el.classList.toggle('is-zoom');
                found('loupe');
            });
            el.addEventListener('mousemove', (e) => {
                if (!el.classList.contains('is-zoom')) return;
                const r = el.getBoundingClientRect();
                el.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
            });
        } else {
            el = document.createElement('iframe');
            el.src = m.type === 'youtube'
                ? `https://www.youtube-nocookie.com/embed/${m.id}?autoplay=1&mute=1&rel=0`
                : `https://www.tiktok.com/embed/v2/${m.id}`;
            if (m.type === 'tiktok' || m.portrait) el.classList.add('is-portrait');
            el.title = `${data.title}, Video`;
            el.setAttribute('allow', 'autoplay; encrypted-media; fullscreen; picture-in-picture');
            el.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        }
        vMedia.appendChild(el);
        vCount.textContent = `${String(vIndex + 1).padStart(2, '0')} / ${String(media.length).padStart(2, '0')}`;
        $$('.strip-item', vStrip).forEach((b, idx) => {
            const sel = idx === vIndex;
            b.setAttribute('aria-selected', String(sel));
            if (sel) b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reducedMotion ? 'auto' : 'smooth' });
        });
        [media[(vIndex + 1) % media.length], media[(vIndex - 1 + media.length) % media.length]]
            .forEach(n => { if (n && n.type === 'image') { const p = new Image(); p.src = n.url; } });
    }

    function stepProject(d) {
        const i = viewerOrder.indexOf(vProject);
        openViewer(viewerOrder[(i + d + viewerOrder.length) % viewerOrder.length], 0);
    }
    vStrip.addEventListener('click', (e) => { const b = e.target.closest('.strip-item'); if (b) showMedia(Number(b.dataset.index)); });
    stagePrev.addEventListener('click', () => showMedia(vIndex - 1));
    stageNext.addEventListener('click', () => showMedia(vIndex + 1));
    $('#viewer-prev-project').addEventListener('click', () => stepProject(-1));
    $('#viewer-next-project').addEventListener('click', () => stepProject(1));
    $('#viewer-close').addEventListener('click', () => viewer.close());
    viewer.addEventListener('close', () => { vMedia.innerHTML = ''; vStrip.innerHTML = ''; vProject = null; });
    viewer.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); showMedia(vIndex + 1); found('arrows'); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); showMedia(vIndex - 1); found('arrows'); }
        else if (e.key === 'PageDown') { e.preventDefault(); stepProject(1); }
        else if (e.key === 'PageUp') { e.preventDefault(); stepProject(-1); }
        else if (e.key.toLowerCase() === 'f' && document.fullscreenEnabled) { $('#viewer-stage').requestFullscreen?.(); found('fullscreen'); }
    });
    let touchX = null;
    vMedia.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    vMedia.addEventListener('touchend', (e) => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 50) { showMedia(vIndex + (dx < 0 ? 1 : -1)); found('swipe'); }
        touchX = null;
    });


    /* =====================================================================
       4. INTRO: Timecode
       ===================================================================== */
    const hudTc = $('#hud-tc');
    const hudRec = $('#hud-rec');
    let recPaused = false, recFrames = 0, lastNow = performance.now();
    const fpsModes = [25, 30, 50, 24];
    let fpsIdx = 0;
    (function tick(now) {
        if (!recPaused) recFrames += ((now - lastNow) / 1000) * FPS;
        lastNow = now;
        hudTc.textContent = toTimecode(recFrames);
        requestAnimationFrame(tick);
    })(lastNow);
    hudRec.addEventListener('click', () => {
        recPaused = !recPaused;
        hudRec.classList.toggle('is-paused', recPaused);
        toast(recPaused ? 'Aufnahme pausiert' : 'Aufnahme läuft');
        found('rec');
    });
    hudTc.addEventListener('click', () => {
        fpsIdx = (fpsIdx + 1) % fpsModes.length;
        recFrames = (recFrames / FPS) * fpsModes[fpsIdx];
        FPS = fpsModes[fpsIdx];
        $('#hud-fps').textContent = `${FPS}p`;
        updatePlayhead();
        found('fps');
    });


    /* =====================================================================
       5. TIMELINE
       ===================================================================== */
    const tlBody = $('#tl-body');
    const tlTrack = $('#tl-track');
    const tlRuler = $('#tl-ruler');
    const tlHead = $('#tl-playhead');
    const tlTc = $('#tl-tc');
    const tlSpeed = $('#tl-speed');
    const tlHover = $('#tl-hover');
    const sections = $$('main > section[data-clip]');
    const navLinks = $$('.nav a[href^="#"]');
    const CLIP_COLORS = ['#E07F9B', '#4FAE9C', '#9C93E6', '#E3A93F', '#7FB2E5', '#E3A93F', '#E07F9B'];
    const TOTAL_SEC = 120;
    let clipRanges = [];
    const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const totalFrames = () => TOTAL_SEC * FPS;

    function layoutTimeline() {
        const max = maxScroll();
        const at = (el) => Math.min(1, Math.max(0, (el.offsetTop - innerHeight * 0.4) / max));
        tlTrack.innerHTML = '';
        clipRanges = sections.map((sec, i) => ({
            sec,
            start: i === 0 ? 0 : at(sec),
            end: sections[i + 1] ? at(sections[i + 1]) : 1
        })).filter(r => r.end - r.start > 0.002);

        clipRanges.forEach((r, i) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'tl-clip';
            b.textContent = r.sec.dataset.clip;
            b.dataset.label = 'Springen';
            b.style.left = `calc(${r.start * 100}% + 1px)`;
            b.style.width = `calc(${(r.end - r.start) * 100}% - 2px)`;
            b.style.setProperty('--c', CLIP_COLORS[i % CLIP_COLORS.length]);
            b.setAttribute('aria-label', `Zu ${r.sec.dataset.clip} springen`);
            b.addEventListener('click', (e) => {
                if (dragMoved) return;
                e.stopPropagation();
                r.sec.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
                found('clipjump');
            });
            r.button = b;
            tlTrack.appendChild(b);
        });
        tlRuler.innerHTML = '';
        for (let s = 0; s < TOTAL_SEC; s += 15) {
            const span = document.createElement('span');
            span.style.left = `${(s / TOTAL_SEC) * 100}%`;
            span.textContent = toTimecode(s * FPS).slice(3, 8);
            tlRuler.appendChild(span);
        }
        currentClip = null;
        updatePlayhead();
        document.dispatchEvent(new Event('jb:layout'));
    }

    let currentClip = null;
    const playheadFrac = () => Math.min(1, Math.max(0, scrollY / maxScroll()));
    function updatePlayhead() {
        const frac = playheadFrac();
        tlHead.style.transform = `translateX(${frac * tlBody.clientWidth}px)`;
        tlTc.textContent = toTimecode(frac * totalFrames());
        const active = clipRanges.find(r => frac >= r.start && frac < r.end) || clipRanges[clipRanges.length - 1];
        if (active && active !== currentClip) {
            currentClip = active;
            clipRanges.forEach(r => r.button.classList.toggle('is-current', r === active));
            navLinks.forEach(a => a.setAttribute('aria-current', String(a.getAttribute('href') === `#${active.sec.id}`)));
        }
    }

    let scrollQueued = false;
    addEventListener('scroll', () => {
        if (scrollQueued) return;
        scrollQueued = true;
        requestAnimationFrame(() => { scrollQueued = false; updatePlayhead(); });
    }, { passive: true });

    let resizeT;
    const relayout = () => { clearTimeout(resizeT); resizeT = setTimeout(layoutTimeline, 150); };
    addEventListener('resize', relayout);
    addEventListener('load', layoutTimeline);
    if ('ResizeObserver' in window) new ResizeObserver(relayout).observe(document.body);
    layoutTimeline();

    // Hover-Timecode
    tlBody.addEventListener('pointermove', (e) => {
        const r = tlBody.getBoundingClientRect();
        const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
        tlHover.style.left = `${f * 100}%`;
        tlHover.textContent = toTimecode(f * totalFrames());
    });

    // Scrubben
    let dragging = false, dragMoved = false, dragStartX = 0;
    function scrubTo(clientX) {
        const r = tlBody.getBoundingClientRect();
        window.scrollTo({ top: Math.min(1, Math.max(0, (clientX - r.left) / r.width)) * maxScroll(), behavior: 'instant' });
    }
    tlBody.addEventListener('pointerdown', (e) => {
        stopShuttle();
        dragging = true; dragMoved = false; dragStartX = e.clientX;
        tlBody.setPointerCapture(e.pointerId);
    });
    tlBody.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        if (Math.abs(e.clientX - dragStartX) > 4) dragMoved = true;
        if (dragMoved) { scrubTo(e.clientX); found('scrubtl'); }
    });
    tlBody.addEventListener('pointerup', (e) => {
        if (dragging && !dragMoved && !e.target.closest('.tl-clip')) scrubTo(e.clientX);
        dragging = false;
        setTimeout(() => { dragMoved = false; }, 0);
    });
    tlBody.addEventListener('pointercancel', () => { dragging = false; });

    // J/K/L-Shuttle + Leertaste
    const SPEEDS = [0, 3, 7, 14, 28];
    let shuttle = 0, shuttleRaf = null;
    function setShuttle(v) {
        shuttle = Math.max(-4, Math.min(4, v));
        tlSpeed.textContent = shuttle === 0 ? '' : `${shuttle > 0 ? '▶' : '◀'} ${2 ** (Math.abs(shuttle) - 1)}×`;
        if (shuttle !== 0 && !shuttleRaf) shuttleRaf = requestAnimationFrame(runShuttle);
    }
    function stopShuttle() { if (shuttle !== 0) setShuttle(0); }
    function runShuttle() {
        if (shuttle === 0) { shuttleRaf = null; return; }
        const dy = Math.sign(shuttle) * SPEEDS[Math.abs(shuttle)];
        window.scrollTo({ top: scrollY + dy, behavior: 'instant' });
        if ((dy > 0 && scrollY >= maxScroll() - 1) || (dy < 0 && scrollY <= 0)) { setShuttle(0); shuttleRaf = null; return; }
        shuttleRaf = requestAnimationFrame(runShuttle);
    }
    addEventListener('keydown', (e) => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        if (e.target.closest('input, textarea, select, [contenteditable]') || $('dialog[open]')) return;
        const k = e.key.toLowerCase();
        if (k === 'l') { setShuttle(shuttle <= 0 ? 1 : shuttle + 1); found('jkl'); }
        else if (k === 'j') { setShuttle(shuttle >= 0 ? -1 : shuttle - 1); found('jkl'); }
        else if (k === 'k') setShuttle(0);
        else if (k === ' ' && !e.target.closest('button, a, summary')) { e.preventDefault(); setShuttle(shuttle ? 0 : 1); found('space'); }
    });
    addEventListener('wheel', stopShuttle, { passive: true });
    addEventListener('touchstart', stopShuttle, { passive: true });


    /* =====================================================================
       6. MISCHPULT
       ===================================================================== */
    const MIXER = [
        { bus: 'Software', channels: [
            ['Premiere Pro', 100, 'Schnitt, Grading, Storytelling'],
            ['Lightroom', 90, 'RAW, Presets'],
            ['Photoshop', 85, 'Retusche, Compositing'],
            ['Illustrator', 80, 'Vektor, Logos, Icons'],
            ['InDesign', 80, 'Editorial, Print'],
            ['After Effects', 75, 'VFX, Motion'],
            ['Canva', 70, 'Content, Templates'],
            ['Audition', 50, 'Audio-Cleanup'],
            ['Blender', 5, '3D, im Aufbau']
        ] },
        { bus: 'Handwerk', channels: [
            ['Filmen & Regie', 90, 'Kamera, Drohne, Interviews'],
            ['Fotografieren', 80, 'Sport, Natur, Tiere']
        ] },
        { bus: 'Strategie', channels: [
            ['Social Media', 99, 'Instagram, TikTok, YouTube, LinkedIn']
        ] }
    ];
    $('#mixer').innerHTML = MIXER.map(bus => `
        <div class="bus" style="--n:${bus.channels.length}">
            <div class="bus-channels">
                ${bus.channels.map(([name, level, tags]) => `
                    <div class="channel" data-level="${level}" role="img" aria-label="${name}: ${level} von 100. ${tags}">
                        <span class="ch-led${level >= 95 ? ' is-hot' : ''}"></span>
                        <span class="ch-value">${level}</span>
                        <div class="ch-fader" style="--level:${level}%">
                            <span class="ch-meter"></span>
                            <span class="ch-slot"><span class="ch-knob"></span></span>
                        </div>
                        <span class="ch-name">${name}</span>
                        <span class="ch-tags">${tags}</span>
                    </div>`).join('')}
            </div>
            <span class="bus-name">${bus.bus}</span>
        </div>`).join('');


    /* =====================================================================
       7. ÜBER MICH: Portrait-Takes & Shotlist
       ===================================================================== */
    const PORTRAITS = ['me-1.jpg', 'me-2.jpg', 'me-3.webp', 'me-4.jpg', 'me-5.webp', 'me-6.jpeg'].map(f => `assets/images/about-me/${f}`);
    let take = 0;
    const portrait = $('#portrait');
    const slate = $('.slate');
    portrait.dataset.label = 'Nächster Take';
    portrait.addEventListener('click', () => {
        take = (take + 1) % PORTRAITS.length;
        portrait.classList.add('is-glitch');
        setTimeout(() => {
            $('#portrait-img').src = PORTRAITS[take];
            $('#portrait-take').textContent = `Take ${take + 1}`;
            portrait.classList.remove('is-glitch');
        }, 140);
        slate.classList.add('is-clapped');
        setTimeout(() => slate.classList.remove('is-clapped'), 220);
        found('take');
    });
    portrait.addEventListener('pointerenter', () => PORTRAITS.forEach(s => { const i = new Image(); i.src = s; }), { once: true });

    // Shotlist: abhaken, wird im Browser gemerkt
    // Gespeichert wird nur, was der Besucher selbst ändert. Ohne Eintrag gilt data-done aus dem HTML.
    const overrides = store.get('jb2-shotlist2', {});
    const doneSet = new Set($$('#shotlist li').filter(li => {
        const k = li.textContent.trim();
        return k in overrides ? overrides[k] : li.hasAttribute('data-done');
    }).map(li => li.textContent.trim()));
    $$('#shotlist li').forEach(li => {
        const key = li.textContent.trim();
        li.tabIndex = 0;
        li.setAttribute('role', 'checkbox');
        const sync = () => { li.classList.toggle('done', doneSet.has(key)); li.setAttribute('aria-checked', String(doneSet.has(key))); };
        sync();
        const toggle = () => {
            doneSet.has(key) ? doneSet.delete(key) : doneSet.add(key);
            overrides[key] = doneSet.has(key);
            store.set('jb2-shotlist2', overrides);
            sync();
            found('check');
            const group = li.closest('[data-group]');
            if (doneSet.has(key) && $$('li', group).every(x => x.classList.contains('done'))) {
                document.dispatchEvent(new CustomEvent('jb:confetti', { detail: { x: innerWidth / 2, y: innerHeight / 2 } }));
                toast(`${group.dataset.group}: alles erledigt!`);
                found('allchecked');
            }
        };
        li.addEventListener('click', toggle);
        li.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } });
    });


    /* =====================================================================
       8. LICHT, KONTAKT, MENÜ, DIALOGE
       ===================================================================== */
    const root = document.documentElement;
    const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    $('#light-btn').addEventListener('click', (e) => {
        const next = isDark() ? 'light' : 'dark';
        const apply = () => { root.dataset.theme = next; try { localStorage.setItem('jb2-theme', next); } catch (err) {} };
        // Kreisförmiger Lichtwechsel, wo der Browser es kann
        if (document.startViewTransition && !reducedMotion) {
            root.style.setProperty('--vt-x', `${e.clientX}px`);
            root.style.setProperty('--vt-y', `${e.clientY}px`);
            document.startViewTransition(apply);
        } else apply();
        found('light');
        document.dispatchEvent(new Event('jb:theme'));
    });

    $('#copy-mail').addEventListener('click', async (e) => {
        try { await navigator.clipboard.writeText('julien.bernath@gmx.ch'); toast('E-Mail-Adresse kopiert'); }
        catch (err) { toast('julien.bernath@gmx.ch'); }
        document.dispatchEvent(new CustomEvent('jb:plane', { detail: { x: e.clientX, y: e.clientY } }));
    });

    const menuBtn = $('.menu-btn');
    const menu = $('#mobile-menu');
    const setMenu = (open) => {
        menu.hidden = !open;
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.textContent = open ? 'Schliessen' : 'Menü';
        document.body.style.overflow = open ? 'hidden' : '';
    };
    menuBtn.addEventListener('click', () => setMenu(menu.hidden));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });

    [viewer, $('#privacy')].forEach(d => d.addEventListener('click', (e) => { if (e.target === d) d.close(); }));
    $('#privacy-open').addEventListener('click', () => $('#privacy').showModal());
    $('#privacy-close').addEventListener('click', () => $('#privacy').close());

    $$('details.drawer').forEach(d => d.addEventListener('toggle', () => {
        const f = d.querySelector('iframe[data-src]');
        if (d.open && f) { f.src = f.dataset.src; f.removeAttribute('data-src'); }
        relayout();
    }));

    // Ortszeit Baden
    const clock = $('#clock');
    const tickClock = () => { clock.textContent = new Date().toLocaleTimeString('de-CH', { timeZone: 'Europe/Zurich', hour12: false }); };
    tickClock(); setInterval(tickClock, 1000);
    $('#year').textContent = new Date().getFullYear();

    // Extras-Vorschau: Timecode läuft beim Hover
    const tcArt = $('.art-timecode');
    if (tcArt) {
        let raf = null, t0 = 0;
        const tool = tcArt.closest('.tool');
        const run = (now) => { tcArt.textContent = toTimecode(90000 + ((now - t0) / 1000) * 25 * 8); raf = requestAnimationFrame(run); };
        tool.addEventListener('mouseenter', () => { if (reducedMotion) return; t0 = performance.now(); raf = requestAnimationFrame(run); });
        tool.addEventListener('mouseleave', () => { cancelAnimationFrame(raf); tcArt.textContent = '01:00:00:00'; });
    }

    // Für fx.js
    window.JB = { toast, found, store, toTimecode, layoutTimeline, setShuttle, maxScroll, clipRanges: () => clipRanges, playheadFrac, reducedMotion, projectsData };
})();
