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
        isCustomCursorActive: true
    };

    // Project Data Cache
    const projectsData = {
        sirius: {
            id: 'JB-PRJ-01',
            category: 'BRANDING',
            title: 'PROJECT: SIRIUS',
            client: 'Sirius Creative AG',
            year: '2024',
            role: 'Mediamatiker / Visual Lead',
            deliverables: 'Brand Manual, Logodesign, Web Design Concept',
            description: 'Sirius ist ein umfassendes Rebranding-System für eine Schweizer Design-Agentur im Wallis. Das Gestaltungsprinzip stützt sich auf radikale Geometrie, präzisen Leerraum und ein kompromissloses Farbschema. Neben dem Vector-Grid-Design wurde ein 60-seitiges gedrucktes Brand Book geliefert.',
            graphic: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                <line x1="10" y1="100" x2="390" y2="100" stroke="#000" stroke-width="1" stroke-dasharray="4" />
                <circle cx="200" cy="100" r="60" fill="none" stroke="#E30613" stroke-width="2" />
                <circle cx="200" cy="100" r="10" fill="#E30613" />
                <path d="M 50 100 Q 125 20, 200 100 T 350 100" fill="none" stroke="#000" stroke-width="2" />
            </svg>`
        },
        swisshorizon: {
            id: 'JB-PRJ-02',
            category: 'VIDEO / EDITING',
            title: 'SWISS HORIZON',
            client: 'Wallis Outdoor Tourism',
            year: '2023',
            role: 'Mediamatiker / Video Producer',
            deliverables: 'Konzept, Dreh, Schnitt, Sound Design',
            description: 'Ein energetischer Imagefilm über Extremsport in den Schweizer Alpen. Das visuelle Storytelling kombiniert rasante Schnitte mit ruhiger, geometrischer Architektur-Videografie. Der Ton wurde komplett neu synthetisiert, um dem Werk eine futuristische, kühle Note zu verleihen.',
            graphic: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                <rect x="50" y="30" width="300" height="140" fill="none" stroke="#000" stroke-width="1.5" />
                <polygon points="170,70 250,100 170,130" fill="#E30613" stroke="#E30613" stroke-width="2" />
                <line x1="200" y1="10" x2="200" y2="190" stroke="#000" stroke-dasharray="4" />
            </svg>`
        },
        aether: {
            id: 'JB-PRJ-03',
            category: 'WEB DEVELOPMENT',
            title: 'AETHER LABS',
            client: 'Hochschule für Design (Self-Initiated)',
            year: '2024',
            role: 'Developer & Interaction Designer',
            deliverables: 'Creative Coding, Interactive Canvas Platform',
            description: 'Ein Experiment im Browser, das Audiofrequenzen in geometrische Muster übersetzt. Basierend auf reinem HTML5 Canvas, Web Audio API und performantem JavaScript. Perfekt optimiert für Desktop- und Mobile-Bildschirme, ohne externe Frameworks.',
            graphic: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                <path d="M20,180 L80,120 L150,150 L250,60 L320,100 L380,30" fill="none" stroke="#000" stroke-width="2.5" />
                <circle cx="380" cy="30" r="8" fill="#E30613" />
                <circle cx="250" cy="60" r="5" fill="#000" />
                <line x1="250" y1="60" x2="250" y2="200" stroke="#E30613" stroke-width="1.5" stroke-dasharray="2" />
                <text x="260" y="80" font-family="monospace" font-size="10" fill="#000">X: 250 Y: 60</text>
            </svg>`
        },
        pulse2026: {
            id: 'JB-PRJ-04',
            category: 'SOCIAL MEDIA / CAMPAIGN',
            title: 'PULSE 2026 FESTIVAL',
            client: 'Pulse Music Association',
            year: '2024',
            role: 'Social Media Creator',
            deliverables: 'Reels, After Effects Motion Design, Ads',
            description: 'Ganzheitliche Social-Media-Kampagne für ein Schweizer Elektronik-Festival. Mit 3D-Motion-Graphics und dynamic Storytelling wurde die organische Reichweite auf Instagram und TikTok innerhalb von 6 Wochen verdreifacht.',
            graphic: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                <path d="M 20 100 Q 65 20, 110 100 T 200 100 T 290 100 T 380 100" fill="none" stroke="#E30613" stroke-width="4" />
                <path d="M 20 100 Q 65 180, 110 100 T 200 100 T 290 100 T 380 100" fill="none" stroke="#000" stroke-width="2" />
            </svg>`
        },
        helvetica: {
            id: 'JB-PRJ-05',
            category: 'PRINT DESIGN',
            title: 'HELVETICA REDUX',
            client: 'School of Typography ZH',
            year: '2023',
            role: 'Editorial Designer',
            deliverables: 'Print Layout, Typografie Raster-System',
            description: 'Ein brutalistisches Printmagazin, das klassische Schweizer Typografie-Regeln (Max Bill, Josef Müller-Brockmann) dekonstruiert. Gedruckt auf 140g ungestrichenem Papier, mit extremen Rändern, massiver Typografie und Signal-Kontrasten.',
            graphic: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                <rect x="40" y="20" width="140" height="160" fill="none" stroke="#000" stroke-width="2" />
                <rect x="220" y="20" width="140" height="160" fill="none" stroke="#000" stroke-width="2" />
                <line x1="200" y1="20" x2="200" y2="180" stroke="#E30613" stroke-width="3" />
                <text x="50" y="55" font-family="sans-serif" font-weight="bold" font-size="32" fill="#000">H.</text>
                <text x="230" y="55" font-family="sans-serif" font-weight="bold" font-size="32" fill="#E30613">R.</text>
            </svg>`
        },
        alpine: {
            id: 'JB-PRJ-06',
            category: 'PHOTOGRAPHY / RETOUCH',
            title: 'ALPINE ECHOES',
            client: 'Archiv Zürich (Exhibition)',
            year: '2024',
            role: 'Fotograf & Retuscheur',
            deliverables: 'Fine Art Prints, Digital Postproduction',
            description: 'Eine Fotoserie, welche die raue Berglandschaft der Innerschweiz in extremen Kontrasten einfängt. Die Nachbearbeitung in Photoshop überlagert Höhenlinien und technische Systemdaten über die analogen Aufnahmen, um Mensch-Maschine-Naturkontraste zu erzeugen.',
            graphic: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                <circle cx="200" cy="100" r="70" fill="none" stroke="#000" stroke-width="1.5" />
                <polygon points="120,150 200,60 280,150" fill="none" stroke="#000" stroke-width="2" />
                <polygon points="170,150 220,100 270,150" fill="none" stroke="#E30613" stroke-width="1.5" />
                <circle cx="300" cy="60" r="8" fill="#E30613" />
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

    const projectKeys = ['sirius', 'swisshorizon', 'aether', 'pulse2026', 'helvetica', 'alpine'];
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
        mVisual.innerHTML = data.graphic;

        // Open Dialog
        detailModal.showModal();
    }

    function closeProjectModal() {
        detailModal.close();
        currentProjectId = null;
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

    if (prevModalBtn) prevModalBtn.addEventListener('click', () => navigateProject(-1));
    if (nextModalBtn) nextModalBtn.addEventListener('click', () => navigateProject(1));
    if (prevFloatingBtn) prevFloatingBtn.addEventListener('click', () => navigateProject(-1));
    if (nextFloatingBtn) nextFloatingBtn.addEventListener('click', () => navigateProject(1));

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

});

