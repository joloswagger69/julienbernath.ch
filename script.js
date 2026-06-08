/* ==========================================================================
   JULIEN BERNATH // PORTFOLIO JAVASCRIPT
   Swiss Design Grid Canvas Engine & Interactive Dashboard Core
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. GLOBALS & STATE --- */
    const state = {
        isDark: false,
        mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
        scrollPercent: 0,
        isCustomCursorActive: true,
        currentMediaIndex: 0
    };

    // Project Data Cache
    const projectsData = {
        kloten_photo: {
            id: 'JB-PRJ-01',
            category: 'PHOTOGRAPHY / SPORT',
            title: 'Fotoserie EHC Kloten',
            client: 'EHC Kloten',
            year: '2025',
            role: 'Fotograf / Mediamatiker',
            deliverables: 'Action-Fotografie, Spieltags-Reportage, Bildbearbeitung',
            description: 'Dynamische Action- und Reportagefotos der Heimspiele des EHC Kloten in der Swiss Arena. Die Aufnahmen fangen die extreme Intensität auf dem Eis, die Emotionen in der Fankurve und die packende Matchday-Atmosphäre ein. Professionelle RAW-Entwicklung und schnelle Bereitstellung für Social Media und Presse.',
            graphic: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="20" width="360" height="160" rx="8" fill="none" stroke="#000" stroke-width="1.5"/>
                <line x1="200" y1="20" x2="200" y2="180" stroke="#000" stroke-width="1.5" stroke-dasharray="2 4"/>
                <circle cx="200" cy="100" r="30" fill="none" stroke="#E30613" stroke-width="2"/>
                <path d="M 180 80 L 180 70 L 190 70" fill="none" stroke="#E30613" stroke-width="2"/>
                <path d="M 220 80 L 220 70 L 210 70" fill="none" stroke="#E30613" stroke-width="2"/>
                <path d="M 180 120 L 180 130 L 190 130" fill="none" stroke="#E30613" stroke-width="2"/>
                <path d="M 220 120 L 220 130 L 210 130" fill="none" stroke="#E30613" stroke-width="2"/>
                <circle cx="200" cy="100" r="3" fill="#E30613"/>
                <text x="35" y="42" font-family="monospace" font-size="10" fill="#000">EHC KLOTEN // ICE_GRID</text>
            </svg>`,
            media: Array.from({ length: 16 }, (_, i) => ({
                type: 'image',
                url: `assets/images/ehc-kloten/ehck-${i + 1}.webp`,
                label: `EHCK-${i + 1}.WEBP`
            }))
        },
        kloten_tiktok: {
            id: 'JB-PRJ-02',
            category: 'VIDEO / SOCIAL MEDIA',
            title: 'TikTok-Video EHC Kloten',
            client: 'EHC Kloten',
            year: '2025',
            role: 'Video Editor & Content Creator',
            deliverables: 'Kurzvideo-Konzeption, Schnitt, Sound Design, Grading',
            description: 'Hochenergetische Kurzvideos für den TikTok-Kanal des EHC Kloten. Die Videos kombinieren rasante Schnitte mit passenden Sound-Effekten, um die Interaktionsrate unter den Eishockey-Fans zu maximieren. Speziell optimiert für mobile Displays und virale Relevanz.',
            graphic: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                <rect x="150" y="15" width="100" height="170" rx="10" fill="none" stroke="#000" stroke-width="1.5"/>
                <polygon points="190,85 220,100 190,115" fill="#E30613"/>
                <line x1="80" y1="100" x2="130" y2="100" stroke="#000" stroke-width="1.5" stroke-dasharray="2"/>
                <line x1="270" y1="100" x2="320" y2="100" stroke="#000" stroke-width="1.5" stroke-dasharray="2"/>
                <path d="M 40 100 Q 60 40, 80 100 T 120 100" fill="none" stroke="#E30613" stroke-width="1.5"/>
                <path d="M 280 100 Q 300 160, 320 100 T 360 100" fill="none" stroke="#E30613" stroke-width="1.5"/>
                <text x="160" y="35" font-family="monospace" font-size="8" fill="#000">SYS.TIKTOK</text>
            </svg>`,
            media: [
                { type: 'tiktok', id: '7332142480294464801', label: 'TIKTOK_VIDEO.URL' }
            ]
        },
        evzug_photo: {
            id: 'JB-PRJ-03',
            category: 'PHOTOGRAPHY / SPORT',
            title: 'Fotoserie EV Zug Damen',
            client: 'EV Zug Damen',
            year: '2025',
            role: 'Sportfotograf',
            deliverables: 'Action-Shooting, Bildredaktion, Postproduction',
            description: 'Fotografische Reportage über die Damenmannschaft des EV Zug. Im Fokus stehen Athletik, Leidenschaft und die Dynamik des Frauen-Eishockeys. Die kontrastreichen Schwarz-Weiss- und Farbaufnahmen heben die Physis und den emotionalen Siegeswillen des Teams hervor.',
            graphic: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                <rect x="30" y="20" width="340" height="160" fill="none" stroke="#000" stroke-width="1"/>
                <line x1="143" y1="20" x2="143" y2="180" stroke="#000" stroke-opacity="0.2" stroke-width="1"/>
                <line x1="256" y1="20" x2="256" y2="180" stroke="#000" stroke-opacity="0.2" stroke-width="1"/>
                <line x1="30" y1="73" x2="370" y2="73" stroke="#000" stroke-opacity="0.2" stroke-width="1"/>
                <line x1="30" y1="126" x2="370" y2="126" stroke="#000" stroke-opacity="0.2" stroke-width="1"/>
                <rect x="180" y="80" width="40" height="40" fill="none" stroke="#E30613" stroke-width="1.5"/>
                <line x1="170" y1="100" x2="230" y2="100" stroke="#E30613" stroke-width="1"/>
                <line x1="200" y1="70" x2="200" y2="130" stroke="#E30613" stroke-width="1"/>
                <text x="40" y="40" font-family="monospace" font-size="10" fill="#000">EVZ_GIRLS // F8.0 // 1/1000s</text>
            </svg>`,
            media: Array.from({ length: 22 }, (_, i) => ({
                type: 'image',
                url: `assets/images/ev-zug/evz-${i + 1}.jpg`,
                label: `EVZ-${i + 1}.JPG`
            }))
        },
        limmattal_photo: {
            id: 'JB-PRJ-04',
            category: 'PHOTOGRAPHY / SPORT',
            title: 'Fotoserie UHC Limmattal',
            client: 'UHC Limmattal',
            year: '2024',
            role: 'Fotograf',
            deliverables: 'Spielszenen-Fotografie, Social Media Assets',
            description: 'Actionreiche Hallenfotografie für den Schweizer Unihockeyclub Limmattal. Die Serie dokumentiert schnelle Angriffsmanöver, präzise Schüsse und die emotionale Atmosphäre in der Sporthalle. Perfekt farbkorrigierte Aufnahmen für die Vereins-Website und Matchflyer.',
            graphic: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                <circle cx="200" cy="100" r="50" fill="none" stroke="#000" stroke-width="2"/>
                <circle cx="175" cy="80" r="6" fill="none" stroke="#000" stroke-width="1.5"/>
                <circle cx="200" cy="75" r="6" fill="none" stroke="#E30613" stroke-width="1.5"/>
                <circle cx="225" cy="80" r="6" fill="none" stroke="#000" stroke-width="1.5"/>
                <circle cx="170" cy="105" r="6" fill="none" stroke="#000" stroke-width="1.5"/>
                <circle cx="200" cy="110" r="6" fill="none" stroke="#000" stroke-width="1.5"/>
                <circle cx="230" cy="105" r="6" fill="none" stroke="#000" stroke-width="1.5"/>
                <circle cx="185" cy="130" r="6" fill="none" stroke="#000" stroke-width="1.5"/>
                <circle cx="215" cy="130" r="6" fill="none" stroke="#000" stroke-width="1.5"/>
                <line x1="120" y1="100" x2="280" y2="100" stroke="#E30613" stroke-width="1" stroke-dasharray="4"/>
                <text x="35" y="32" font-family="monospace" font-size="10" fill="#000">UHC_LIMMATTAL // SYS_SPHERE</text>
            </svg>`,
            media: [
                { type: 'youtube', id: '3kHn7e8IcUo', label: 'YOUTUBE_VIDEO.URL' },
                ...Array.from({ length: 28 }, (_, i) => ({
                    type: 'image',
                    url: `assets/images/uhc-limmattal/limmattal-${i + 1}.webp`,
                    label: `LIMMATTAL-${i + 1}.WEBP`
                }))
            ]
        },
        dorffestflyer: {
            id: 'JB-PRJ-06',
            category: 'PRINT DESIGN',
            title: 'Dorffestflyer Ehrendingen',
            client: 'OK Dorffest Ehrendingen',
            year: '2025',
            role: 'Grafikdesigner / Mediamatiker',
            deliverables: 'Visual Identity, Flyer-Design, Plakate, Druckdaten',
            description: 'Umfassendes Print-Design für das Ehrendinger Dorffest. Die Gestaltung vereint traditionelle Schweizer Festlichkeit mit modernen typografischen Rastern. Das Endergebnis wurde als Flyer im A5-Format sowie als Plakat gedruckt und verteilt.',
            graphic: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                <rect x="80" y="20" width="240" height="160" fill="none" stroke="#000" stroke-width="1.5"/>
                <circle cx="50" cy="100" r="10" fill="none" stroke="#000" stroke-width="1"/>
                <line x1="35" y1="100" x2="65" y2="100" stroke="#000" stroke-width="1"/>
                <line x1="50" y1="85" x2="50" y2="115" stroke="#000" stroke-width="1"/>
                <circle cx="350" cy="100" r="10" fill="none" stroke="#000" stroke-width="1"/>
                <line x1="335" y1="100" x2="365" y2="100" stroke="#000" stroke-width="1"/>
                <line x1="350" y1="85" x2="350" y2="115" stroke="#000" stroke-width="1"/>
                <rect x="100" y="40" width="200" height="40" fill="none" stroke="#E30613" stroke-width="1.5"/>
                <text x="110" y="66" font-family="sans-serif" font-weight="900" font-size="20" fill="#E30613">DORFFEST</text>
                <line x1="100" y1="110" x2="300" y2="110" stroke="#000" stroke-width="2"/>
                <line x1="100" y1="125" x2="260" y2="125" stroke="#000" stroke-width="1.5"/>
                <line x1="100" y1="140" x2="280" y2="140" stroke="#000" stroke-width="1"/>
                <text x="100" y="160" font-family="monospace" font-size="8" fill="#000">EHRENDINGEN // 2025 // PRINT_READY</text>
            </svg>`,
            media: [
                { type: 'image', url: 'assets/images/uhc-dorffest/dorffest-1.jpg', label: 'DORFFEST-1.JPG' },
                { type: 'image', url: 'assets/images/uhc-dorffest/dorffest-2.jpg', label: 'DORFFEST-2.JPG' },
                { type: 'image', url: 'assets/images/uhc-dorffest/dorffest-3.webp', label: 'DORFFEST-3.WEBP' },
                { type: 'image', url: 'assets/images/uhc-dorffest/dorffest-4.webp', label: 'DORFFEST-4.WEBP' },
                { type: 'image', url: 'assets/images/uhc-dorffest/dorffest-5.jpg', label: 'DORFFEST-5.JPG' },
                { type: 'image', url: 'assets/images/uhc-dorffest/dorffest-6.webp', label: 'DORFFEST-6.WEBP' },
                { type: 'image', url: 'assets/images/uhc-dorffest/dorffest-7.jpg', label: 'DORFFEST-7.JPG' },
                { type: 'image', url: 'assets/images/uhc-dorffest/dorffest-8.jpg', label: 'DORFFEST-8.JPG' },
                { type: 'image', url: 'assets/images/uhc-dorffest/dorffest-9.jpg', label: 'DORFFEST-9.JPG' },
                { type: 'image', url: 'assets/images/uhc-dorffest/dorffest-10.jpg', label: 'DORFFEST-10.JPG' },
                { type: 'image', url: 'assets/images/uhc-dorffest/dorffest-11.jpg', label: 'DORFFEST-11.JPG' }
            ]
        },
        fcwil_photo: {
            id: 'JB-PRJ-07',
            category: 'PHOTOGRAPHY / SPORT',
            title: 'Fotoserie FC Wil',
            client: 'FC Wil 1900',
            year: '2025',
            role: 'Sportfotograf',
            deliverables: 'Spieltags-Fotografie, Fankultur-Dokumentation, RAW',
            description: 'Professionelle Sportfotografie der Meisterschaftsspiele des FC Wil 1900 in der Challenge League. Die Reportage beleuchtet packende Zweikämpfe auf dem Platz, emotionale Reaktionen der Spieler sowie die lebendige Fankultur im Stadion.',
            graphic: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                <line x1="150" y1="180" x2="200" y2="60" stroke="#000" stroke-width="2"/>
                <line x1="250" y1="180" x2="200" y2="60" stroke="#000" stroke-width="2"/>
                <line x1="175" y1="120" x2="225" y2="120" stroke="#000" stroke-width="1.5"/>
                <line x1="162" y1="150" x2="238" y2="150" stroke="#000" stroke-width="1"/>
                <rect x="150" y="30" width="100" height="30" fill="none" stroke="#E30613" stroke-width="2"/>
                <circle cx="170" cy="45" r="6" fill="#E30613"/>
                <circle cx="190" cy="45" r="6" fill="#E30613"/>
                <circle cx="210" cy="45" r="6" fill="#E30613"/>
                <circle cx="230" cy="45" r="6" fill="#E30613"/>
                <text x="35" y="25" font-family="monospace" font-size="10" fill="#000">FC_WIL_1900 // SPORT_FLOODLIGHT</text>
            </svg>`,
            media: [
                { type: 'image', url: 'assets/images/fc-wil/fcw-1.jpg', label: 'FCW-1.JPG' },
                { type: 'image', url: 'assets/images/fc-wil/fcw-2.jpg', label: 'FCW-2.JPG' },
                { type: 'image', url: 'assets/images/fc-wil/fcw-3.webp', label: 'FCW-3.WEBP' },
                { type: 'image', url: 'assets/images/fc-wil/fcw-4.webp', label: 'FCW-4.WEBP' },
                { type: 'image', url: 'assets/images/fc-wil/fcw-5.webp', label: 'FCW-5.WEBP' },
                { type: 'image', url: 'assets/images/fc-wil/fcw-6.webp', label: 'FCW-6.WEBP' },
                { type: 'image', url: 'assets/images/fc-wil/fcw-7.jpg', label: 'FCW-7.JPG' },
                { type: 'image', url: 'assets/images/fc-wil/fcw-8.webp', label: 'FCW-8.WEBP' },
                { type: 'image', url: 'assets/images/fc-wil/fcw-9.webp', label: 'FCW-9.WEBP' },
                { type: 'image', url: 'assets/images/fc-wil/fcw-10.webp', label: 'FCW-10.WEBP' }
            ]
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
            graphic: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                <rect x="160" y="40" width="80" height="140" fill="none" stroke="#000" stroke-width="2"/>
                <polygon points="150,40 200,10 250,40" fill="none" stroke="#E30613" stroke-width="2"/>
                <line x1="200" y1="40" x2="200" y2="180" stroke="#000" stroke-width="1" stroke-dasharray="4"/>
                <line x1="160" y1="90" x2="240" y2="90" stroke="#000" stroke-width="1.5"/>
                <line x1="160" y1="130" x2="240" y2="130" stroke="#000" stroke-width="1.5"/>
                <circle cx="200" cy="110" r="15" fill="none" stroke="#E30613" stroke-width="1.5"/>
                <text x="35" y="32" font-family="monospace" font-size="10" fill="#000">CASTLE_LENZBURG // MONO_GRID</text>
            </svg>`,
            media: [
                { type: 'image', url: 'assets/images/lenzburg/lb-1.jpg', label: 'LB-1.JPG' },
                { type: 'image', url: 'assets/images/lenzburg/lb-2.jpg', label: 'LB-2.JPG' },
                { type: 'image', url: 'assets/images/lenzburg/lb-3.webp', label: 'LB-3.WEBP' },
                { type: 'image', url: 'assets/images/lenzburg/lb-4.jpg', label: 'LB-4.JPG' },
                { type: 'image', url: 'assets/images/lenzburg/lb-5.jpg', label: 'LB-5.JPG' },
                { type: 'image', url: 'assets/images/lenzburg/lb-6.jpg', label: 'LB-6.JPG' },
                { type: 'image', url: 'assets/images/lenzburg/lb-7.jpg', label: 'LB-7.JPG' },
                { type: 'image', url: 'assets/images/lenzburg/lb-8.jpg', label: 'LB-8.JPG' },
                { type: 'image', url: 'assets/images/lenzburg/lb-9.webp', label: 'LB-9.WEBP' },
                { type: 'image', url: 'assets/images/lenzburg/lb-10.jpg', label: 'LB-10.JPG' },
                { type: 'image', url: 'assets/images/lenzburg/lb-11.webp', label: 'LB-11.WEBP' },
                { type: 'image', url: 'assets/images/lenzburg/lb-12.webp', label: 'LB-12.WEBP' },
                { type: 'image', url: 'assets/images/lenzburg/lb-13.webp', label: 'LB-13.WEBP' },
                { type: 'image', url: 'assets/images/lenzburg/lb-14.jpg', label: 'LB-14.JPG' },
                { type: 'image', url: 'assets/images/lenzburg/lb-15.jpg', label: 'LB-15.JPG' },
                { type: 'image', url: 'assets/images/lenzburg/lb-16.jpg', label: 'LB-16.JPG' },
                { type: 'image', url: 'assets/images/lenzburg/lb-17.jpg', label: 'LB-17.JPG' },
                { type: 'image', url: 'assets/images/lenzburg/lb-18.jpg', label: 'LB-18.JPG' },
                { type: 'image', url: 'assets/images/lenzburg/lb-19.webp', label: 'LB-19.WEBP' },
                { type: 'image', url: 'assets/images/lenzburg/lb-20.jpg', label: 'LB-20.JPG' },
                { type: 'image', url: 'assets/images/lenzburg/lb-21.jpg', label: 'LB-21.JPG' },
                { type: 'image', url: 'assets/images/lenzburg/lb-22.webp', label: 'LB-22.WEBP' },
                { type: 'image', url: 'assets/images/lenzburg/lb-23.jpg', label: 'LB-23.JPG' },
                { type: 'image', url: 'assets/images/lenzburg/lb-24.webp', label: 'LB-24.WEBP' },
                { type: 'image', url: 'assets/images/lenzburg/lb-25.jpg', label: 'LB-25.JPG' },
                { type: 'image', url: 'assets/images/lenzburg/lb-26.jpg', label: 'LB-26.JPG' }
            ]
        },
        itson: {
            id: 'JB-PRJ-09',
            category: 'VIDEO / CONCEPT',
            title: 'Vertiefungsarbeit "ITSON"',
            client: 'Berufsschule (Eigenprojekt)',
            year: '2024',
            role: 'Lead Designer & Konzept-Entwickler',
            deliverables: 'Multimediales Konzept, UI/UX Design System, Video-Visualisierung',
            description: 'Konzeption und multimediale Präsentation der Abschlussarbeit "ITSON". Das Projekt umfasst eine umfassende Video-Visualisierung des fiktiven IT-Branding-Konzepts, die Definition grafischer Raster-Systeme und die Ausarbeitung eines digitalen User-Experience-Konzepts.',
            graphic: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                <rect x="40" y="20" width="320" height="160" fill="none" stroke="#000" stroke-width="1.5"/>
                <line x1="40" y1="50" x2="360" y2="50" stroke="#000" stroke-width="1.5"/>
                <circle cx="55" cy="35" r="4" fill="#E30613"/>
                <circle cx="70" cy="35" r="4" fill="#000"/>
                <circle cx="85" cy="35" r="4" fill="#000"/>
                <rect x="60" y="70" width="120" height="90" fill="none" stroke="#E30613" stroke-width="1.5"/>
                <line x1="200" y1="80" x2="330" y2="80" stroke="#000" stroke-width="2"/>
                <line x1="200" y1="100" x2="330" y2="100" stroke="#000" stroke-width="1.5"/>
                <line x1="200" y1="120" x2="300" y2="120" stroke="#000" stroke-width="1"/>
                <text x="200" y="150" font-family="monospace" font-size="9" fill="#E30613">ITSON // VER.1.02</text>
            </svg>`,
            media: [
                { type: 'youtube', id: 'i5LtMUy2Ngk', label: 'YOUTUBE_VIDEO.URL' },
                { type: 'image', url: 'assets/images/itson/itson-1.jpg', label: 'ITSON-1.JPG' },
                { type: 'image', url: 'assets/images/itson/itson-2.jpeg', label: 'ITSON-2.JPEG' },
                { type: 'image', url: 'assets/images/itson/itson-3.jpeg', label: 'ITSON-3.JPEG' },
                { type: 'image', url: 'assets/images/itson/itson-4.jpeg', label: 'ITSON-4.JPEG' },
                { type: 'image', url: 'assets/images/itson/itson-5.jpeg', label: 'ITSON-5.JPEG' },
                { type: 'image', url: 'assets/images/itson/itson-6.webp', label: 'ITSON-6.WEBP' },
                { type: 'image', url: 'assets/images/itson/itson-7.webp', label: 'ITSON-7.WEBP' },
                { type: 'image', url: 'assets/images/itson/itson-8.webp', label: 'ITSON-8.WEBP' },
                { type: 'image', url: 'assets/images/itson/itson-9.webp', label: 'ITSON-9.WEBP' },
                { type: 'image', url: 'assets/images/itson/itson-10.jpeg', label: 'ITSON-10.JPEG' },
                { type: 'image', url: 'assets/images/itson/itson-11.png', label: 'ITSON-11.PNG' }
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
            graphic: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                <rect x="160" y="25" width="80" height="150" rx="12" fill="none" stroke="#000" stroke-width="2"/>
                <line x1="160" y1="45" x2="240" y2="45" stroke="#000" stroke-width="1.5"/>
                <line x1="160" y1="155" x2="240" y2="155" stroke="#000" stroke-width="1.5"/>
                <circle cx="200" cy="100" r="22" fill="none" stroke="#E30613" stroke-width="2"/>
                <path d="M 190 110 Q 200 90, 210 90" fill="none" stroke="#E30613" stroke-width="2"/>
                <path d="M 210 90 Q 200 110, 190 110" fill="none" stroke="#E30613" stroke-width="2"/>
                <line x1="185" y1="115" x2="215" y2="85" stroke="#E30613" stroke-width="1"/>
                <text x="35" y="42" font-family="monospace" font-size="10" fill="#000">TIKA_MATE // BRAND_CAN</text>
            </svg>`,
media: [
                { type: 'image', url: 'assets/images/tika-mate/tika-1.jpg', label: 'TIKA-1.JPG' },
                { type: 'image', url: 'assets/images/tika-mate/tika-2.jpg', label: 'TIKA-2.JPG' },
                { type: 'image', url: 'assets/images/tika-mate/tika-3.jpg', label: 'TIKA-3.JPG' },
                { type: 'image', url: 'assets/images/tika-mate/tika-4.jpg', label: 'TIKA-4.JPG' },
                { type: 'image', url: 'assets/images/tika-mate/tika-5.jpg', label: 'TIKA-5.JPG' },
                { type: 'image', url: 'assets/images/tika-mate/tika-6.jpg', label: 'TIKA-6.JPG' },
                { type: 'image', url: 'assets/images/tika-mate/tika-7.jpg', label: 'TIKA-7.JPG' },
                { type: 'image', url: 'assets/images/tika-mate/tika-8.jpg', label: 'TIKA-8.JPG' },
                { type: 'image', url: 'assets/images/tika-mate/tika-9.jpg', label: 'TIKA-9.JPG' },
                { type: 'image', url: 'assets/images/tika-mate/tika-10.jpg', label: 'TIKA-10.JPG' },
                { type: 'image', url: 'assets/images/tika-mate/tika-11.jpg', label: 'TIKA-11.JPG' },
                { type: 'image', url: 'assets/images/tika-mate/tika-12.jpg', label: 'TIKA-12.JPG' },
                { type: 'image', url: 'assets/images/tika-mate/tika-13.jpg', label: 'TIKA-13.JPG' },
                { type: 'image', url: 'assets/images/tika-mate/tika-14.jpg', label: 'TIKA-14.JPG' },
                { type: 'image', url: 'assets/images/tika-mate/tika-15.jpg', label: 'TIKA-15.JPG' }
            ]
        },
        nature_photo: {
            id: 'JB-PRJ-11',
            category: 'PHOTOGRAPHY / NATURE',
            title: 'Tier- & Naturfotos',
            client: 'Freies Projekt',
            year: '2023 - 2026',
            role: 'Naturfotograf',
            deliverables: 'Outdoor-Fotografie, Makro-Aufnahmen, Color-Grading',
            description: 'Eine fortlaufende, persönliche Fotoserie über die Schweizer Tier- und Pflanzenwelt. Die Aufnahmen entstanden mit hoher Brennweite und Makroobjektiven, um kleinste Strukturen und seltene Wildtiere in ihrer natürlichen Umgebung detailreich festzuhalten.',
            graphic: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                <rect x="120" y="20" width="160" height="160" fill="none" stroke="#000" stroke-width="1" stroke-dasharray="2"/>
                <line x1="200" y1="20" x2="200" y2="180" stroke="#000" stroke-width="1" stroke-dasharray="2"/>
                <line x1="120" y1="100" x2="280" y2="100" stroke="#000" stroke-width="1" stroke-dasharray="2"/>
                <path d="M 200 40 Q 250 100, 200 160 Q 150 100, 200 40 Z" fill="none" stroke="#E30613" stroke-width="2"/>
                <line x1="200" y1="40" x2="200" y2="160" stroke="#E30613" stroke-width="1.5"/>
                <path d="M 200 80 Q 220 70, 230 65" fill="none" stroke="#E30613" stroke-width="1.5"/>
                <path d="M 200 100 Q 180 90, 170 85" fill="none" stroke="#E30613" stroke-width="1.5"/>
                <path d="M 200 120 Q 220 110, 230 105" fill="none" stroke="#E30613" stroke-width="1.5"/>
                <text x="35" y="32" font-family="monospace" font-size="10" fill="#000">NATURE_SCAN // LEAF_GEOMETRY</text>
            </svg>`,
            media: [
                { type: 'image', url: 'assets/images/natur-tiere/nt-1.webp', label: 'NT-1.WEBP' },
                { type: 'image', url: 'assets/images/natur-tiere/nt-2.jpg', label: 'NT-2.JPG' },
                { type: 'image', url: 'assets/images/natur-tiere/nt-3.webp', label: 'NT-3.WEBP' },
                { type: 'image', url: 'assets/images/natur-tiere/nt-4.jpg', label: 'NT-4.JPG' },
                { type: 'image', url: 'assets/images/natur-tiere/nt-5.jpg', label: 'NT-5.JPG' },
                { type: 'image', url: 'assets/images/natur-tiere/nt-6.webp', label: 'NT-6.WEBP' },
                { type: 'image', url: 'assets/images/natur-tiere/nt-7.jpg', label: 'NT-7.JPG' },
                { type: 'image', url: 'assets/images/natur-tiere/nt-8.webp', label: 'NT-8.WEBP' },
                { type: 'image', url: 'assets/images/natur-tiere/nt-9.jpg', label: 'NT-9.JPG' },
                { type: 'image', url: 'assets/images/natur-tiere/nt-10.jpg', label: 'NT-10.JPG' },
                { type: 'image', url: 'assets/images/natur-tiere/nt-11.jpg', label: 'NT-11.JPG' },
                { type: 'image', url: 'assets/images/natur-tiere/nt-12.jpg', label: 'NT-12.JPG' },
                { type: 'image', url: 'assets/images/natur-tiere/nt-13.jpg', label: 'NT-13.JPG' },
                { type: 'image', url: 'assets/images/natur-tiere/nt-14.jpg', label: 'NT-14.JPG' },
                { type: 'image', url: 'assets/images/natur-tiere/nt-15.jpg', label: 'NT-15.JPG' },
                { type: 'image', url: 'assets/images/natur-tiere/nt-16.webp', label: 'NT-16.WEBP' },
                { type: 'image', url: 'assets/images/natur-tiere/nt-17.jpg', label: 'NT-17.JPG' },
                { type: 'image', url: 'assets/images/natur-tiere/nt-18.webp', label: 'NT-18.WEBP' },
                { type: 'image', url: 'assets/images/natur-tiere/nt-19.jpg', label: 'NT-19.JPG' },
                { type: 'image', url: 'assets/images/natur-tiere/nt-20.jpg', label: 'NT-20.JPG' },
                { type: 'image', url: 'assets/images/natur-tiere/nt-21.webp', label: 'NT-21.WEBP' },
                { type: 'image', url: 'assets/images/natur-tiere/nt-22.jpg', label: 'NT-22.JPG' },
                { type: 'image', url: 'assets/images/natur-tiere/nt-23.jpg', label: 'NT-23.JPG' },
                { type: 'image', url: 'assets/images/natur-tiere/nt-24.jpg', label: 'NT-24.JPG' }
            ]
        },
        bulldogs_graphics: {
            id: 'JB-PRJ-12',
            category: 'BRANDING / SOCIAL MEDIA',
            title: 'Matchday-Grafiken UHC Bulldogs',
            client: 'UHC Bulldogs Ehrendingen',
            year: '2024 - 2026',
            role: 'Social Media Designer',
            deliverables: 'Figma Templates, Spieltagsankündigungen, Resultatgrafiken',
            description: 'Konzeption und Gestaltung eines dynamischen Social-Media-Grafiksystems für die Matchday-Ankündigungen und Live-Ergebnis-Posts der UHC Bulldogs Ehrendingen auf Instagram. Entwickelt in Figma für einfache, mobile Pflege durch den Verein.',
            graphic: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                <line x1="20" y1="40" x2="380" y2="40" stroke="#000" stroke-width="1.5"/>
                <line x1="20" y1="160" x2="380" y2="160" stroke="#000" stroke-width="1.5"/>
                <rect x="40" y="60" width="320" height="80" fill="none" stroke="#E30613" stroke-width="2"/>
                <text x="60" y="110" font-family="sans-serif" font-weight="900" font-size="28" fill="#E30613">MATCHDAY</text>
                <text x="250" y="105" font-family="monospace" font-size="10" fill="#000">[ VS_OPP ]</text>
                <text x="250" y="120" font-family="monospace" font-size="8" fill="#000">KICKOFF: 19:30</text>
                <text x="35" y="32" font-family="monospace" font-size="8" fill="#000">SOCIAL_MEDIA_GRID // INSTAGRAM_1080x1080</text>
            </svg>`,
            media: [
                { type: 'youtube', id: 'KXqK217Yzi4', label: 'REEL_01.URL' },
                { type: 'youtube', id: 'ByaoJRIcHjs', label: 'REEL_02.URL' },
                { type: 'image', url: 'assets/images/uhc-grafiken/uhc-grafiken-1.webp', label: 'GRAFIK-1.WEBP' },
                { type: 'image', url: 'assets/images/uhc-grafiken/uhc-grafiken-2.webp', label: 'GRAFIK-2.WEBP' },
                { type: 'image', url: 'assets/images/uhc-grafiken/uhc-grafiken-3.png', label: 'GRAFIK-3.PNG' },
                { type: 'image', url: 'assets/images/uhc-grafiken/uhc-grafiken-4.png', label: 'GRAFIK-4.PNG' },
                { type: 'image', url: 'assets/images/uhc-grafiken/uhc-grafiken-5.png', label: 'GRAFIK-5.PNG' },
                { type: 'image', url: 'assets/images/uhc-grafiken/uhc-grafiken-6.png', label: 'GRAFIK-6.PNG' },
                { type: 'image', url: 'assets/images/uhc-grafiken/uhc-grafiken-7.png', label: 'GRAFIK-7.PNG' },
                { type: 'image', url: 'assets/images/uhc-grafiken/uhc-grafiken-8.png', label: 'GRAFIK-8.PNG' },
                { type: 'image', url: 'assets/images/uhc-grafiken/uhc-grafiken-9.webp', label: 'GRAFIK-9.WEBP' },
                { type: 'image', url: 'assets/images/uhc-grafiken/uhc-grafiken-10.webp', label: 'GRAFIK-10.WEBP' },
                { type: 'image', url: 'assets/images/uhc-grafiken/uhc-grafiken-11.png', label: 'GRAFIK-11.PNG' }
            ]
        },
        sonstiges: {
            id: 'JB-PRJ-13',
            category: 'BRANDING / GRAPHICS',
            title: 'Sonstige Arbeiten',
            client: 'Diverse',
            year: '2023 - 2025',
            role: 'Designer / Editor',
            deliverables: 'Grafikdesign, Foto-Pools, Layout-Experimente',
            description: 'Kreative Vielfalt: Diverse Grafikdesigns, Fotografie-Pools und gestalterische Layout-Experimente aus verschiedenen Projekten und Übungen.',
            graphic: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                <rect x="30" y="30" width="100" height="140" fill="none" stroke="#000" stroke-width="1.5"/>
                <rect x="150" y="30" width="100" height="140" fill="none" stroke="#000" stroke-width="1.5"/>
                <rect x="270" y="30" width="100" height="140" fill="none" stroke="#000" stroke-width="1.5"/>
                <line x1="30" y1="60" x2="370" y2="60" stroke="#000" stroke-width="1"/>
                <circle cx="80" cy="100" r="15" fill="none" stroke="#E30613" stroke-width="2"/>
                <polygon points="190,90 210,100 190,110" fill="#E30613"/>
                <rect x="290" y="85" width="60" height="30" fill="none" stroke="#E30613" stroke-width="1.5"/>
                <text x="35" y="45" font-family="monospace" font-size="8" fill="#000">IMG_POOL</text>
                <text x="155" y="45" font-family="monospace" font-size="8" fill="#000">YT_STREAM</text>
                <text x="275" y="45" font-family="monospace" font-size="8" fill="#000">LAYOUT.EXE</text>
            </svg>`,
            media: [
                { type: 'image', url: 'assets/images/sonstiges/sonst-1.webp', label: 'SONST-1.WEBP' },
                { type: 'image', url: 'assets/images/sonstiges/sonst-2.webp', label: 'SONST-2.WEBP' },
                { type: 'image', url: 'assets/images/sonstiges/sonst-3.webp', label: 'SONST-3.WEBP' },
                { type: 'image', url: 'assets/images/sonstiges/sonst-4.jpg', label: 'SONST-4.JPG' },
                { type: 'image', url: 'assets/images/sonstiges/sonst-5.webp', label: 'SONST-5.WEBP' },
                { type: 'image', url: 'assets/images/sonstiges/sonst-6.webp', label: 'SONST-6.WEBP' },
                { type: 'image', url: 'assets/images/sonstiges/sonst-7.webp', label: 'SONST-7.WEBP' },
                { type: 'image', url: 'assets/images/sonstiges/sonst-8.webp', label: 'SONST-8.WEBP' },
                { type: 'image', url: 'assets/images/sonstiges/sonst-9.jpg', label: 'SONST-9.JPG' },
                { type: 'image', url: 'assets/images/sonstiges/sonst-10.webp', label: 'SONST-10.WEBP' },
                { type: 'image', url: 'assets/images/sonstiges/sonst-11.png', label: 'SONST-11.PNG' },
                { type: 'image', url: 'assets/images/sonstiges/sonst-12.png', label: 'SONST-12.PNG' }
            ]
        },
        portfolio_website: {
            id: 'JB-PRJ-14',
            category: 'WEB DEVELOPMENT / UI-UX',
            title: 'julienbernath.ch',
            client: 'Eigenprojekt',
            year: '2026',
            role: 'Frontend Developer & UI Designer',
            deliverables: 'Swiss Grid System, Custom Canvas Engine, Interactive Command Center',
            description: 'Konzeption, Design und Entwicklung der eigenen Portfolio-Plattform julienbernath.ch. Die Website nutzt ein maßgeschneidertes, futuristisches "Red Signal Operating System"-Theme mit einem interaktiven Grid-Hintergrund, der auf Mausbewegungen reagiert, einer voll funktionsfähigen Befehlspalette zur Schnellnavigation und einem reaktiven E-Mail-Terminal.',
            graphic: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="20" width="360" height="160" fill="none" stroke="#000" stroke-width="1.5"/>
                <line x1="20" y1="50" x2="380" y2="50" stroke="#000" stroke-width="1.5"/>
                <circle cx="40" cy="35" r="4" fill="#E30613"/>
                <text x="55" y="40" font-family="sans-serif" font-weight="bold" font-size="12" fill="#000">julienbernath.ch</text>
                <line x1="120" y1="50" x2="120" y2="180" stroke="#000" stroke-dasharray="2 3" stroke-width="0.5"/>
                <line x1="220" y1="50" x2="220" y2="180" stroke="#000" stroke-dasharray="2 3" stroke-width="0.5"/>
                <circle cx="200" cy="115" r="25" fill="none" stroke="#E30613" stroke-width="1"/>
                <line x1="160" y1="115" x2="240" y2="115" stroke="#E30613" stroke-width="0.5"/>
                <line x1="200" y1="75" x2="200" y2="155" stroke="#E30613" stroke-width="0.5"/>
                <text x="260" y="160" font-family="monospace" font-size="8" fill="#000">SYS_OS_V2.6</text>
            </svg>`
        }
    };


    /* --- 2. TELEMETRY & SYSTEM MONITORS --- */
    
    // Live System Clock
    const timeEl = document.getElementById('sys-time');
    function updateClock() {
        if (!timeEl) return;
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');
        timeEl.textContent = `${hrs}:${mins}:${secs}`;
    }
    updateClock();
    setInterval(updateClock, 1000);

    // Live Screen Resolution
    const resEl = document.getElementById('screen-res');
    function updateRes() {
        if (!resEl) return;
        resEl.textContent = `${window.innerWidth}x${window.innerHeight}`;
    }
    updateRes();
    window.addEventListener('resize', updateRes);

    // Scroll Telemetry Tracker
    const telemetryBar = document.getElementById('telemetry-bar-inner');
    const telemetryText = document.getElementById('telemetry-text');
    const contentScroll = document.getElementById('content-scroll');
    
    if (contentScroll) {
        contentScroll.addEventListener('scroll', () => {
            const scrollTop = contentScroll.scrollTop;
            const docHeight = contentScroll.scrollHeight - contentScroll.clientHeight;
            if (docHeight <= 0) return;
            
            state.scrollPercent = Math.min(Math.round((scrollTop / docHeight) * 100), 100);
            
            if (telemetryBar) telemetryBar.style.width = `${state.scrollPercent}%`;
            if (telemetryText) telemetryText.textContent = `SCROLL: ${String(state.scrollPercent).padStart(3, '0')}%`;
        });
    }


    /* --- 3. CUSTOM CURSOR PHYSICS (Crosshair only) --- */
    const cursor = document.getElementById('custom-cursor');
    const rippleContainer = document.getElementById('click-ripple-container');
    
    if (cursor) {
        function evaluateCursorState() {
            if (window.innerWidth <= 768) {
                state.isCustomCursorActive = false;
                cursor.style.opacity = '0';
                document.body.style.cursor = 'default';
            } else {
                state.isCustomCursorActive = true;
                cursor.style.opacity = '1';
                document.body.style.cursor = 'none';
            }
        }
        
        evaluateCursorState();
        window.addEventListener('resize', evaluateCursorState);

        let currentX = 0;
        let currentY = 0;

        const coordsEl = document.getElementById('cursor-coords');

        // Smooth cursor tracking — always runs, even during modal
        window.addEventListener('mousemove', (e) => {
            state.mouse.targetX = e.clientX;
            state.mouse.targetY = e.clientY;
            if (coordsEl && state.isCustomCursorActive) {
                coordsEl.textContent = `X: ${String(Math.round(e.clientX)).padStart(3, '0')} Y: ${String(Math.round(e.clientY)).padStart(3, '0')}`;
            }
        });

        function animateCursor() {
            // Always update position regardless of modal state
            currentX += (state.mouse.targetX - currentX) * 0.25;
            currentY += (state.mouse.targetY - currentY) * 0.25;
            cursor.style.left = `${currentX}px`;
            cursor.style.top  = `${currentY}px`;
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Hover state for interactive elements
        const interactiveElements = document.querySelectorAll('a, button, [tabindex="0"], .project-card, .console-widget, input, textarea');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });

        // --- CLICK TELEMETRY EFFECT ---
        // Spawns a technical focus bracket with coordinates that fades out
        if (rippleContainer) {
            window.addEventListener('mousedown', (e) => {
                const marker = document.createElement('div');
                marker.className = 'click-coords-marker';
                marker.style.left = e.clientX + 'px';
                marker.style.top  = e.clientY + 'px';

                const brackets = document.createElement('div');
                brackets.className = 'marker-brackets';

                const label = document.createElement('div');
                label.className = 'marker-label monospace';
                const posX = String(Math.round(e.clientX)).padStart(3, '0');
                const posY = String(Math.round(e.clientY)).padStart(3, '0');
                label.textContent = `LOC: [X_${posX} : Y_${posY}]`;

                marker.appendChild(brackets);
                marker.appendChild(label);
                rippleContainer.appendChild(marker);

                // Clean up when fade animation ends
                marker.addEventListener('animationend', (evt) => {
                    if (evt.animationName === 'marker-fade-out') {
                        marker.remove();
                    }
                });
            });
        }
    }


    /* --- 4. INTERACTIVE CANVAS GRID MATRIX ENGINE --- */
    const canvas = document.getElementById('grid-canvas');
    let ctx = null;
    let gridNodes = [];
    let radarAngle = 0;

    if (canvas) {
        ctx = canvas.getContext('2d');
        
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initializeGridNodes();
        }

        function initializeGridNodes() {
            gridNodes = [];
            const spacing = 60;
            const offset = 30;
            for (let x = offset; x < canvas.width; x += spacing) {
                for (let y = offset; y < canvas.height; y += spacing) {
                    gridNodes.push({
                        origX: x, origY: y, x: x, y: y,
                        floatSeed: Math.random() * Math.PI * 2
                    });
                }
            }
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        function drawGridMatrix() {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 4.1 DRAW COCKPIT HUD RADAR (Center of the screen)
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            
            radarAngle = (radarAngle + 0.003) % (Math.PI * 2);
            
            const strokeColor = state.isDark ? 'rgba(255, 34, 53, 0.035)' : 'rgba(227, 6, 19, 0.035)';
            const accentStroke = state.isDark ? 'rgba(224, 154, 95, 0.05)' : 'rgba(200, 117, 51, 0.05)';
            const textColor = state.isDark ? 'rgba(239, 239, 239, 0.12)' : 'rgba(0, 0, 0, 0.12)';
            
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1;
            
            // Draw axis crosshairs
            ctx.beginPath();
            ctx.moveTo(cx - 380, cy);
            ctx.lineTo(cx + 380, cy);
            ctx.moveTo(cx, cy - 380);
            ctx.lineTo(cx, cy + 380);
            ctx.stroke();
            
            // Draw ticks on crosshairs
            ctx.beginPath();
            for (let i = -350; i <= 350; i += 50) {
                if (i === 0) continue;
                ctx.moveTo(cx + i, cy - 3);
                ctx.lineTo(cx + i, cy + 3);
                ctx.moveTo(cx - 3, cy + i);
                ctx.lineTo(cx + 3, cy + i);
            }
            ctx.stroke();
            
            // Inner circle
            ctx.beginPath();
            ctx.arc(cx, cy, 100, 0, Math.PI * 2);
            ctx.stroke();
            
            // Middle dashed circle (copper accent)
            ctx.save();
            ctx.strokeStyle = accentStroke;
            ctx.setLineDash([3, 5]);
            ctx.beginPath();
            ctx.arc(cx, cy, 220, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
            
            // Outer measured circle
            ctx.beginPath();
            ctx.arc(cx, cy, 340, 0, Math.PI * 2);
            ctx.stroke();
            
            // Sweep radar beam
            ctx.save();
            ctx.strokeStyle = state.isDark ? 'rgba(255, 34, 53, 0.08)' : 'rgba(227, 6, 19, 0.07)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(radarAngle) * 340, cy + Math.sin(radarAngle) * 340);
            ctx.stroke();
            ctx.restore();
            
            // Degrees & text info
            ctx.fillStyle = textColor;
            ctx.font = '8px Space Mono, monospace';
            ctx.fillText("N // 000°", cx - 22, cy - 352);
            ctx.fillText("S // 180°", cx - 22, cy + 360);
            ctx.fillText("E // 090°", cx + 352, cy + 3);
            ctx.fillText("W // 270°", cx - 402, cy + 3);
            ctx.fillText("SYS_RADAR: SCANNING_BEAM", cx - 60, cy - 115);
            ctx.fillText("SYS_REF: BERNATH.SYS_GRID", cx - 62, cy + 122);

            // 4.2 DRAW MESH CONNECTIONS FOR INTERACTIVE NODES
            const connectionDistance = 75;
            const mouseRange = 110;
            const linkColor = state.isDark ? 'rgba(255, 34, 53, 0.08)' : 'rgba(227, 6, 19, 0.08)';
            
            // Filter nodes near the mouse cursor to optimize performance
            const activeNodes = gridNodes.filter(node => {
                const dx = state.mouse.targetX - node.x;
                const dy = state.mouse.targetY - node.y;
                return Math.hypot(dx, dy) < mouseRange;
            });
            
            ctx.strokeStyle = linkColor;
            ctx.lineWidth = 0.5;
            for (let i = 0; i < activeNodes.length; i++) {
                for (let j = i + 1; j < activeNodes.length; j++) {
                    const dist = Math.hypot(activeNodes[i].x - activeNodes[j].x, activeNodes[i].y - activeNodes[j].y);
                    if (dist < connectionDistance) {
                        ctx.beginPath();
                        ctx.moveTo(activeNodes[i].x, activeNodes[i].y);
                        ctx.lineTo(activeNodes[j].x, activeNodes[j].y);
                        ctx.stroke();
                    }
                }
            }

            // 4.3 DRAW NODES AS SWISS CROSSES
            const crossColor = state.isDark ? 'rgba(239, 239, 239, 0.22)' : 'rgba(0, 0, 0, 0.18)';
            ctx.lineWidth = 0.9;
            
            const mouseInteractionRadius = 120;
            const glowRadius = 140;
            const sigRGB = state.isDark ? '255, 34, 53' : '227, 6, 19';
            
            gridNodes.forEach(node => {
                node.floatSeed += 0.008;
                const floatOffsetVal = Math.sin(node.floatSeed) * 1.5;
                let targetX = node.origX + floatOffsetVal;
                let targetY = node.origY + floatOffsetVal;
                
                const dx = state.mouse.targetX - node.x;
                const dy = state.mouse.targetY - node.y;
                const dist = Math.hypot(dx, dy);
                
                if (dist < mouseInteractionRadius && state.isCustomCursorActive) {
                    const force = (mouseInteractionRadius - dist) / mouseInteractionRadius;
                    const angle = Math.atan2(dy, dx);
                    targetX -= Math.cos(angle) * force * 15;
                    targetY -= Math.sin(angle) * force * 15;
                }
                
                node.x += (targetX - node.x) * 0.12;
                node.y += (targetY - node.y) * 0.12;
                
                // Red glow effect for nodes near the cursor
                if (dist < glowRadius && state.isCustomCursorActive) {
                    const t = 1 - (dist / glowRadius); // 0..1, strongest at center
                    const alpha = 0.25 + t * 0.7;
                    ctx.strokeStyle = `rgba(${sigRGB}, ${alpha})`;
                    ctx.shadowColor  = `rgba(${sigRGB}, ${t * 0.85})`;
                    ctx.shadowBlur   = t * 14;
                } else {
                    ctx.strokeStyle = crossColor;
                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur  = 0;
                }
                
                // Draw a small Swiss cross (+)
                ctx.beginPath();
                ctx.moveTo(node.x - 2.5, node.y);
                ctx.lineTo(node.x + 2.5, node.y);
                ctx.moveTo(node.x, node.y - 2.5);
                ctx.lineTo(node.x, node.y + 2.5);
                ctx.stroke();
            });
            
            // Always reset shadow after node pass to avoid bleeding into other draw calls
            ctx.shadowBlur = 0;
            ctx.shadowColor = 'transparent';

            requestAnimationFrame(drawGridMatrix);
        }
        drawGridMatrix();
    }


    /* --- 5. DARK MODE TOGGLE --- */
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const iconMoon = document.getElementById('icon-moon');
    const iconSun = document.getElementById('icon-sun');
    const toggleLabel = darkModeToggle?.querySelector('.toggle-label');

    function applyDarkMode(isDark) {
        state.isDark = isDark;
        document.body.classList.toggle('mode-dark', isDark);
        document.body.classList.toggle('mode-light', !isDark);
        if (iconMoon) iconMoon.style.display = isDark ? 'none' : 'block';
        if (iconSun) iconSun.style.display = isDark ? 'block' : 'none';
        if (toggleLabel) toggleLabel.textContent = isDark ? 'LIGHT' : 'DARK';
        // Persist preference
        localStorage.setItem('jb-dark-mode', isDark ? '1' : '0');
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => applyDarkMode(!state.isDark));
    }

    // Load saved preference or system preference
    const savedDark = localStorage.getItem('jb-dark-mode');
    if (savedDark !== null) {
        applyDarkMode(savedDark === '1');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyDarkMode(true);
    } else {
        applyDarkMode(false);
    }


    /* --- 6. SEARCH BAR + QUICK NAVIGATION (opens command palette dialog) --- */
    const siteSearch = document.getElementById('site-search');
    const cmdTrigger = null; // legacy reference kept for palette logic
    const cmdDialog = document.getElementById('command-palette-modal');
    const cmdInput = document.getElementById('palette-input');
    const cmdSuggestions = document.getElementById('palette-suggestions');
    const cmdDiagnostic = document.getElementById('palette-diagnostic');

    function openCommandPalette(prefill) {
        if (!cmdDialog) return;
        cmdDiagnostic.style.display = 'none';
        cmdSuggestions.style.display = 'block';
        cmdInput.value = prefill || '';
        cmdDialog.showModal();
        filterPaletteItems(cmdInput.value.toLowerCase());
        setTimeout(() => cmdInput.focus(), 50);
    }

    let isPaletteJustClosed = false;

    function closeCommandPalette() {
        if (!cmdDialog) return;
        isPaletteJustClosed = true;
        cmdDialog.close();
        if (siteSearch) {
            siteSearch.value = '';
            siteSearch.blur();
        }
        setTimeout(() => {
            isPaletteJustClosed = false;
        }, 150);
    }

    // Wire search bar: open dialog on focus or input
    if (siteSearch && cmdDialog) {
        siteSearch.addEventListener('focus', () => {
            if (isPaletteJustClosed) return;
            openCommandPalette(siteSearch.value);
        });
        siteSearch.addEventListener('input', () => {
            if (isPaletteJustClosed) return;
            openCommandPalette(siteSearch.value);
        });
        // Ctrl+K still works
        window.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (cmdDialog.open) {
                    closeCommandPalette();
                } else {
                    openCommandPalette('');
                }
            }
        });
        // Close when clicking outside (on the backdrop)
        cmdDialog.addEventListener('click', (e) => {
            if (e.target === cmdDialog) {
                closeCommandPalette();
            }
        });
    }

    // Suggestions List Interaction
    let selectedSuggestionIndex = 0;

    if (cmdInput && cmdSuggestions) {
        cmdInput.addEventListener('input', (e) => {
            filterPaletteItems(e.target.value.toLowerCase());
        });

        cmdInput.addEventListener('keydown', (e) => {
            const visibleItems = Array.from(cmdSuggestions.querySelectorAll('li')).filter(item => item.style.display !== 'none');
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedSuggestionIndex = (selectedSuggestionIndex + 1) % visibleItems.length;
                updateSelectedSuggestion(visibleItems);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedSuggestionIndex = (selectedSuggestionIndex - 1 + visibleItems.length) % visibleItems.length;
                updateSelectedSuggestion(visibleItems);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (visibleItems[selectedSuggestionIndex]) {
                    triggerPaletteAction(visibleItems[selectedSuggestionIndex].getAttribute('data-action'));
                }
            }
        });
    }

    function filterPaletteItems(query) {
        const items = cmdSuggestions.querySelectorAll('li');
        let visibleCount = 0;
        
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(query)) {
                item.style.display = 'block';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });

        selectedSuggestionIndex = 0;
        const visibleItems = Array.from(items).filter(item => item.style.display !== 'none');
        updateSelectedSuggestion(visibleItems);
    }

    function updateSelectedSuggestion(visibleItems) {
        const items = cmdSuggestions.querySelectorAll('li');
        items.forEach(item => item.classList.remove('selected'));
        
        if (visibleItems.length > 0 && visibleItems[selectedSuggestionIndex]) {
            visibleItems[selectedSuggestionIndex].classList.add('selected');
            visibleItems[selectedSuggestionIndex].scrollIntoView({ block: 'nearest' });
        }
    }

    function triggerPaletteAction(action) {
        if (!action) return;

        if (action.startsWith('go-')) {
            const targetId = action.replace('go-', '');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                closeCommandPalette();
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        } else if (action === 'diagnostic') {
            runDiagnosticsCommand();
        }
    }

    // Attach click listeners to suggestions directly
    cmdSuggestions?.querySelectorAll('li').forEach(item => {
        item.addEventListener('click', () => {
            triggerPaletteAction(item.getAttribute('data-action'));
        });
    });

    function runDiagnosticsCommand() {
        if (!cmdDiagnostic || !cmdSuggestions) return;
        
        cmdSuggestions.style.display = 'none';
        cmdDiagnostic.style.display = 'block';
        cmdDiagnostic.innerHTML = '';
        
        const lines = [
            `> INITIALISIERE SYSTEM-DIAGNOSE (v2.6.0)`,
            `> PRÜFE DESIGN ASSETS & CANVAS ENGINE...`,
            `> SWISS GRID KOORDINATENSYSTEM: OK`,
            `> AKZENTFARBE (GOLD/KUPFER): AKTIV`,
            `> DARK MODE SYSTEM: AKTIV`,
            `> SKILL MODULE PRÜFEN:`,
            `  - PHOTOSHOP: OK (85% OUTPUT)`,
            `  - ILLUSTRATOR: OK (80% OUTPUT)`,
            `  - INDESIGN: OK (80% OUTPUT)`,
            `  - AFTER EFFECTS: OK (75% OUTPUT)`,
            `  - PREMIERE PRO: OK (100% OUTPUT)`,
            `  - LIGHTROOM: OK (90% OUTPUT)`,
            `  - AUDITION: OK (50% OUTPUT)`,
            `  - CANVA: OK (70% OUTPUT)`,
            `  - FILMEN: OK (90% OUTPUT)`,
            `  - FOTOGRAFIEREN: OK (80% OUTPUT)`,
            `  - SOCIAL MEDIA VERSTÄNDNIS: OK (99% OUTPUT)`,
            `> RED SIGNAL LED PULSE... OK`,
            `> SYSTEM-DIAGNOSE: ALLE MODULE ONLINE.`,
            `> Julien Bernath Portfolio bereit für Bewerbungen.`,
            `> Drücke ESC zum Schließen.`
        ];

        let i = 0;
        function printNextLine() {
            if (i < lines.length) {
                cmdDiagnostic.innerHTML += lines[i] + '\n';
                cmdDiagnostic.scrollTop = cmdDiagnostic.scrollHeight;
                i++;
                setTimeout(printNextLine, 120);
            }
        }
        printNextLine();
    }


    /* --- 7. PROJECT FILTERING CORE --- */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update button states
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                if (filterValue === 'all' || cardCategory === filterValue) {
                    card.classList.remove('fade-out');
                    // Delay reset slightly to sync smooth scaling
                    setTimeout(() => {
                        card.style.position = 'relative';
                        card.style.width = 'auto';
                        card.style.height = 'auto';
                    }, 100);
                } else {
                    card.classList.add('fade-out');
                    // Hide completely after transition completes
                    setTimeout(() => {
                        card.style.position = 'absolute';
                        card.style.width = '0';
                        card.style.height = '0';
                    }, 250);
                }
            });
        });
    });


    /* --- 8. PROJECT DETAIL MODAL (DIALOG) --- */
    const detailModal = document.getElementById('project-detail-modal');
    const closeModalBtn = document.getElementById('modal-close-btn');
    const prevModalBtn = document.getElementById('modal-prev-btn');
    const nextModalBtn = document.getElementById('modal-next-btn');

    // Modal elements
    const mId = document.getElementById('modal-project-id');
    const mCat = document.getElementById('modal-project-cat');
    const mTitle = document.getElementById('modal-project-title');
    const mDesc = document.getElementById('modal-project-long-desc');
    const mVisual = document.getElementById('modal-project-visual');
    const mClient = document.getElementById('modal-project-client');
    const mYear = document.getElementById('modal-project-year');
    const mRole = document.getElementById('modal-project-role');
    const mDeliverables = document.getElementById('modal-project-deliverables');

    const projectKeys = ['kloten_photo', 'kloten_tiktok', 'evzug_photo', 'limmattal_photo', 'dorffestflyer', 'fcwil_photo', 'lenzburg_sw', 'itson', 'tikamate', 'nature_photo', 'bulldogs_graphics', 'sonstiges', 'portfolio_website'];
    let currentProjectId = null;

    function openProjectModal(projectId) {
        if (!detailModal || !projectsData[projectId]) return;

        const data = projectsData[projectId];
        currentProjectId = projectId;

        // Populate details
        mId.textContent = `ID: ${data.id}`;
        mCat.textContent = data.category;
        mTitle.textContent = data.title;
        mDesc.textContent = data.description;
        mClient.textContent = data.client;
        mYear.textContent = data.year;
        mRole.textContent = data.role;
        mDeliverables.textContent = data.deliverables;

        // Make title interactive if it is the portfolio website project
        if (projectId === 'portfolio_website') {
            mTitle.classList.add('clickable-title');
            mTitle.setAttribute('title', 'Zur Startseite springen');
        } else {
            mTitle.classList.remove('clickable-title');
            mTitle.removeAttribute('title');
        }

        // Render Media Deck
        renderProjectMedia(projectId);

        // Open Dialog
        detailModal.showModal();
    }

    function closeProjectModal() {
        // Clear media viewport to stop video playback and release iframe resources
        const mViewport = document.getElementById('modal-media-viewport');
        const mTabs = document.getElementById('modal-media-tabs');
        if (mViewport) mViewport.innerHTML = '';
        if (mTabs) mTabs.innerHTML = '';

        detailModal.close();
        currentProjectId = null;
    }

    function renderProjectMedia(projectId) {
        const data = projectsData[projectId];
        const mViewport = document.getElementById('modal-media-viewport');
        const mTabs = document.getElementById('modal-media-tabs');
        const mediaPrevBtn = document.getElementById('modal-media-prev-btn');
        const mediaNextBtn = document.getElementById('modal-media-next-btn');
        if (!mViewport || !mTabs) return;

        mViewport.innerHTML = '';
        mTabs.innerHTML = '';

        // Fallback: If no media items exist, render default SVG blueprint graphic
        if (!data.media || data.media.length === 0) {
            mViewport.innerHTML = data.graphic;
            mTabs.style.display = 'none';
            if (mediaPrevBtn) mediaPrevBtn.style.display = 'none';
            if (mediaNextBtn) mediaNextBtn.style.display = 'none';
            return;
        }

        // Hide/Show media nav buttons depending on number of files
        if (data.media.length <= 1) {
            if (mediaPrevBtn) mediaPrevBtn.style.display = 'none';
            if (mediaNextBtn) mediaNextBtn.style.display = 'none';
        } else {
            if (mediaPrevBtn) mediaPrevBtn.style.display = 'flex';
            if (mediaNextBtn) mediaNextBtn.style.display = 'flex';
        }

        // Render tabs
        mTabs.style.display = 'flex';
        data.media.forEach((item, idx) => {
            const btn = document.createElement('button');
            btn.className = 'media-tab';
            if (idx === 0) btn.classList.add('active');
            btn.textContent = `> ${item.label}`;
            btn.setAttribute('data-index', idx);
            btn.addEventListener('click', () => {
                loadActiveMedia(projectId, idx);
            });
            mTabs.appendChild(btn);
        });

        // Load first media item by default
        loadActiveMedia(projectId, 0);
    }

    function loadActiveMedia(projectId, index) {
        const data = projectsData[projectId];
        const mViewport = document.getElementById('modal-media-viewport');
        if (!mViewport || !data.media || !data.media[index]) return;

        state.currentMediaIndex = index;

        // Update active tab class and scroll it into viewport
        const mTabs = document.getElementById('modal-media-tabs');
        if (mTabs) {
            mTabs.querySelectorAll('.media-tab').forEach((t, idx) => {
                if (idx === index) {
                    t.classList.add('active');
                    t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                } else {
                    t.classList.remove('active');
                }
            });
        }

        const mediaItem = data.media[index];
        mViewport.innerHTML = '';

        if (mediaItem.type === 'image') {
            const img = document.createElement('img');
            img.src = mediaItem.url;
            img.alt = data.title;
            img.loading = 'lazy';
            mViewport.appendChild(img);
        } else if (mediaItem.type === 'video') {
            const video = document.createElement('video');
            video.src = mediaItem.url;
            video.autoplay = true;
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            mViewport.appendChild(video);
        } else if (mediaItem.type === 'youtube') {
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube-nocookie.com/embed/${mediaItem.id}?autoplay=1&mute=1&loop=1&playlist=${mediaItem.id}`;
            iframe.setAttribute('allow', 'autoplay; encrypted-media');
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
            mViewport.appendChild(iframe);
        } else if (mediaItem.type === 'tiktok') {
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.tiktok.com/embed/v2/${mediaItem.id}`;
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
            mViewport.appendChild(iframe);
        }
    }

    function navigateProject(direction) {
        if (!currentProjectId) return;
        const currentIndex = projectKeys.indexOf(currentProjectId);
        if (currentIndex === -1) return;

        let newIndex = currentIndex + direction;
        if (newIndex < 0) {
            newIndex = projectKeys.length - 1;
        } else if (newIndex >= projectKeys.length) {
            newIndex = 0;
        }

        openProjectModal(projectKeys[newIndex]);
    }

    function navigateProjectMedia(direction) {
        if (!currentProjectId) return;
        const data = projectsData[currentProjectId];
        if (!data || !data.media || data.media.length <= 1) return;

        let newIndex = state.currentMediaIndex + direction;
        if (newIndex < 0) {
            newIndex = data.media.length - 1;
        } else if (newIndex >= data.media.length) {
            newIndex = 0;
        }

        loadActiveMedia(currentProjectId, newIndex);
    }

    // Attach click events on project cards
    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const prjId = card.getAttribute('data-id');
            openProjectModal(prjId);
        });

        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const prjId = card.getAttribute('data-id');
                openProjectModal(prjId);
            }
        });
    });

    if (closeModalBtn && detailModal) {
        closeModalBtn.addEventListener('click', closeProjectModal);
        
        // Backdrop Click closure (closes dialog only when clicking the backdrop itself)
        detailModal.addEventListener('click', (e) => {
            if (e.target === detailModal) {
                closeProjectModal();
            }
        });
    }

    const prevFloatingBtn = document.getElementById('modal-prev-floating-btn');
    const nextFloatingBtn = document.getElementById('modal-next-floating-btn');
    const mediaPrevBtn = document.getElementById('modal-media-prev-btn');
    const mediaNextBtn = document.getElementById('modal-media-next-btn');

    if (prevModalBtn) prevModalBtn.addEventListener('click', () => navigateProject(-1));
    if (nextModalBtn) nextModalBtn.addEventListener('click', () => navigateProject(1));
    if (prevFloatingBtn) prevFloatingBtn.addEventListener('click', () => navigateProject(-1));
    if (nextFloatingBtn) nextFloatingBtn.addEventListener('click', () => navigateProject(1));
    if (mediaPrevBtn) mediaPrevBtn.addEventListener('click', () => navigateProjectMedia(-1));
    if (mediaNextBtn) mediaNextBtn.addEventListener('click', () => navigateProjectMedia(1));

    // Click on title to go back to top for portfolio_website
    if (mTitle) {
        mTitle.addEventListener('click', () => {
            if (currentProjectId === 'portfolio_website') {
                closeProjectModal();
                const cs = document.getElementById('content-scroll');
                if (cs) cs.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    // Keyboard navigation (Left / Right Arrow)
    document.addEventListener('keydown', (e) => {
        if (detailModal && detailModal.open) {
            if (e.key === 'ArrowLeft') {
                navigateProject(-1);
            } else if (e.key === 'ArrowRight') {
                navigateProject(1);
            }
        }
    });


    /* --- 9. TERMINAL CONTACT FORM HANDLING --- */
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('#submit-btn');
            const originalBtnText = submitBtn.textContent;
            
            submitBtn.disabled = true;
            submitBtn.textContent = '> ÜBERMITTLE SIGNAL...';
            formStatus.textContent = '> VERBINDE MIT UPLINK_CH KNOTEN...';

            setTimeout(() => {
                formStatus.textContent = '> NACHRICHT IN SMTP-ÜBERTRAGUNG EINGEGEBEN.';
                
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                    formStatus.innerHTML = '> STATUS: ERFOLG.<br>> SIGNAL ERFOLGREICH GESENDET.<br>> DANKE. SYS_TRENNEND.';
                    contactForm.reset();
                }, 1000);

            }, 1200);
        });
    }

    /* --- 9. TERMINAL EMAIL UPLINK HANDLING --- */
    const emailBtn = document.getElementById('email-trigger-btn');
    const terminalStatus = document.getElementById('terminal-uplink-status');

    if (emailBtn && terminalStatus) {
        emailBtn.addEventListener('click', () => {
            emailBtn.disabled = true;
            terminalStatus.classList.remove('text-accent');
            terminalStatus.classList.add('text-signal');
            
            terminalStatus.textContent = '> PROTOKOLL: INITIERE HANDSHAKE...';
            
            setTimeout(() => {
                terminalStatus.textContent = '> PROTOKOLL: TLS 1.3 GESICHERT. VERBINDE KNOTEN...';
                
                setTimeout(() => {
                    terminalStatus.textContent = '> STATUS: ERFOLG. ÖFFNE STANDARD-E-MAIL-CLIENT...';
                    window.location.href = 'mailto:hello@julienbernath.ch';
                    
                    setTimeout(() => {
                        emailBtn.disabled = false;
                        terminalStatus.classList.remove('text-signal');
                        terminalStatus.classList.add('text-accent');
                        terminalStatus.textContent = '> STANDBY. BEREIT FÜR SEND_COMMAND.';
                    }, 1200);
                    
                }, 800);
                
            }, 600);
        });
    }


    /* --- 10. TYPEWRITER EFFECT FOR HERO TITLE --- */
    const twLine1 = document.getElementById('typewriter-line1');
    const twLine2 = document.getElementById('typewriter-line2');

    function typewriterEffect(el, text, speed, onDone) {
        if (!el) return;
        el.textContent = '';
        el.classList.add('typewriter-cursor');
        let i = 0;
        const interval = setInterval(() => {
            el.textContent += text[i];
            i++;
            if (i >= text.length) {
                clearInterval(interval);
                if (onDone) {
                    el.classList.remove('typewriter-cursor');
                    onDone();
                }
                // If no onDone, we leave the typewriter-cursor class so it blinks forever
            }
        }, speed);
    }

    // Chain: first line → second line
    const twDelay = 600; // ms before starting
    setTimeout(() => {
        typewriterEffect(twLine1, 'JULIEN', 90, () => {
            // Brief pause between lines
            setTimeout(() => {
                typewriterEffect(twLine2, 'BERNATH', 90, null);
            }, 200);
        });
    }, twDelay);


    /* --- 11. LOGO SCROLL TO TOP --- */
    const logoHomeBtn = document.getElementById('logo-home-btn');
    if (logoHomeBtn) {
        logoHomeBtn.addEventListener('click', () => {
            const cs = document.getElementById('content-scroll');
            if (cs) cs.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    /* --- 11b. ANCHOR LINK INTERCEPTION --- */
    // Since #content-scroll is a position:fixed scroll container,
    // native hash navigation won't scroll it. We intercept anchor clicks instead.
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const hash = link.getAttribute('href');
            if (hash === '#' || hash === '') return;
            const target = document.querySelector(hash);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });


    /* --- 12. MOBILE NAVIGATION OVERLAY --- */
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
    const mobileNavClose = document.getElementById('mobile-nav-close');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    function openMobileNav() {
        if (!mobileNavOverlay) return;
        mobileNavOverlay.classList.add('is-open');
        mobileNavOverlay.setAttribute('aria-hidden', 'false');
        if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'true');
        // Don't lock body scroll — content-scroll is the scroll container
    }

    function closeMobileNav() {
        if (!mobileNavOverlay) return;
        mobileNavOverlay.classList.remove('is-open');
        mobileNavOverlay.setAttribute('aria-hidden', 'true');
        if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', openMobileNav);
    }

    if (mobileNavClose) {
        mobileNavClose.addEventListener('click', closeMobileNav);
    }

    // Close overlay when any nav link is tapped
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', closeMobileNav);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (cmdDialog && cmdDialog.open) {
                closeCommandPalette();
            }
            if (mobileNavOverlay && mobileNavOverlay.classList.contains('is-open')) {
                closeMobileNav();
            }
        }
    });

    /* --- 13. WIDGET SIGNAL LINES WIDTH MATCHING --- */
    document.querySelectorAll('.console-widget').forEach(widget => {
        const fill = widget.querySelector('.bar-fill-indicator');
        const signalLines = widget.querySelector('.widget-signal-lines');
        if (fill && signalLines) {
            const percent = fill.style.getPropertyValue('--percent');
            if (percent) {
                signalLines.style.width = percent;
            }
        }
    });

    /* --- 14. WEBCAM INTERACTIVE SWITCHER --- */
    const webcamViewport = document.querySelector('.webcam-viewport');
    const webcamImage = document.getElementById('webcam-image');
    const camLabel = document.querySelector('.cam-label');
    
    if (webcamViewport && webcamImage) {
        const webcamImages = [
            'assets/images/about-me/me-1.jpg',
            'assets/images/about-me/me-2.jpg',
            'assets/images/about-me/me-3.webp',
            'assets/images/about-me/me-4.jpg',
            'assets/images/about-me/me-5.webp',
            'assets/images/about-me/me-6.jpeg'
        ];
        let webcamIndex = 0;

        webcamViewport.style.cursor = 'pointer';
        webcamViewport.addEventListener('click', () => {
            // Initiate glitch transition
            webcamViewport.classList.add('glitch-active');
            
            setTimeout(() => {
                // Cycle index
                webcamIndex = (webcamIndex + 1) % webcamImages.length;
                // Swap image src
                webcamImage.src = webcamImages[webcamIndex];
                // Update camera label metadata
                if (camLabel) {
                    camLabel.textContent = `CAM_0${webcamIndex + 1}`;
                }
            }, 180);

            setTimeout(() => {
                // End glitch transition
                webcamViewport.classList.remove('glitch-active');
            }, 400);
        });
    }

});

