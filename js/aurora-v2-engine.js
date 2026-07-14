/**
 * AURORA MIND v4.0 — Conversion Engine
 * Canvas · Interactions · Scroll · Terminal · Checkout · Social Proof · Urgency
 * Otimizado para: confiança, escassez, autoridade e ação imediata
 */
(function () {
    'use strict';

    /* ═══════════════════════════════════════════════════════════════
       SEÇÃO 0: UTILITÁRIOS & CONFIGURAÇÃO DE CONVERSÃO
       ═══════════════════════════════════════════════════════════════ */
    
    const CONFIG = {
        // Timing para gatilhos de urgência (em ms)
        URGENCY: {
            cartAbandonmentDelay: 45000,      // 45s para popup de saída
            socialProofInterval: 8000,         // Novo "alguém comprou" a cada 8s
            countdownMinutes: 47,             // Minutos restantes da oferta
            visitorPulseInterval: 12000       // Pulsar de "visitantes online"
        },
        
        // Animações mais impactantes
        ANIMATION: {
            revealThreshold: 0.15,
            revealRootMargin: '0px 0px -60px 0px',
            counterDuration: 2500,              // Mais lento = mais prestígio
            glowEase: 0.08                      // Mais suave = mais luxo
        },

        // Dados de prova social dinâmica
        SOCIAL_PROOF: {
            names: ['Ricardo M.', 'Ana Clara O.', 'Felipe C.', 'Juliana P.', 'Thiago A.', 
                   'Beatriz S.', 'Marcos L.', 'Camila R.', 'André G.', 'Patricia M.'],
            locations: ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 
                       'Brasília', 'Salvador', 'Fortaleza', 'Porto Alegre'],
            actions: ['acabou de contratar', 'fechou projeto', 'renovou plano', 
                     'ativou suporte VIP', 'recomendou para parceiro']
        }
    };

    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    /* ═══════════════════════════════════════════════════════════════
       SEÇÃO 1: AMBIENTE VISUAL PREMIUM — Glow & Constellation
       ═══════════════════════════════════════════════════════════════ */

    /* ── Glow Follow (ultra-smoothed, efeito de "respiração") ── */
    const glow = $('#glow');
    if (glow) {
        let targetX = 50, targetY = 50, currentX = 50, currentY = 50;
        let breathingPhase = 0;
        const ease = CONFIG.ANIMATION.glowEase;

        document.addEventListener('mousemove', (e) => {
            targetX = clamp((e.clientX / window.innerWidth) * 100, 6, 94);
            targetY = clamp((e.clientY / window.innerHeight) * 100, 6, 94);
        }, { passive: true });

        (function updateGlow() {
            // Interpolação suave do mouse
            currentX += (targetX - currentX) * ease;
            currentY += (targetY - currentY) * ease;
            
            // Respiração sutil (ciclo de 6 segundos)
            breathingPhase += 0.016;
            const breath = Math.sin(breathingPhase) * 1.5;
            
            glow.style.setProperty('--x', currentX + '%');
            glow.style.setProperty('--y', currentY + '%');
            glow.style.setProperty('--breathe', (1 + breath * 0.02).toFixed(3));
            
            requestAnimationFrame(updateGlow);
        })();
    }

    /* ── Constellation Canvas (com interação de proximidade) ── */
    const canvas = $('#canvas-bg');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let points = [], mouse = { x: -1000, y: -1000 }, animId = null;

        function resize() {
            const dpr = Math.min(window.devicePixelRatio, 2);
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = window.innerWidth + 'px';
            canvas.style.height = window.innerHeight + 'px';
        }

        class Point {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * window.innerWidth;
                this.y = Math.random() * window.innerHeight;
                this.vx = (Math.random() - 0.5) * 0.35;
                this.vy = (Math.random() - 0.5) * 0.35;
                this.size = Math.random() * 1.2 + 0.8;
                this.baseSize = this.size;
                this.pulse = Math.random() * Math.PI * 2;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.pulse += 0.02;
                
                // Reflexão nas bordas com amortecimento
                if (this.x < 0 || this.x > window.innerWidth) this.vx *= -0.95;
                if (this.y < 0 || this.y > window.innerHeight) this.vy *= -0.95;
                
                // Pulso de brilho
                this.size = this.baseSize + Math.sin(this.pulse) * 0.3;
                
                // Atração sutil pelo mouse
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.hypot(dx, dy);
                if (dist < 200 && dist > 0) {
                    const force = (200 - dist) / 200 * 0.02;
                    this.vx += (dx / dist) * force;
                    this.vy += (dy / dist) * force;
                }
            }
        }

        function initPoints(count) {
            points = Array.from({ length: count }, () => new Point());
        }

        function drawConstellation() {
            const w = window.innerWidth, h = window.innerHeight;
            ctx.clearRect(0, 0, w, h);
            
            const maxDist = window.innerWidth < 768 ? 100 : 150;
            const maxDistMouse = 180;

            points.forEach((p, i) => {
                p.update();
                
                // Gradiente de cor baseado na posição (aurora boreal)
                const hue = 180 + (p.y / h) * 40 + Math.sin(p.pulse) * 10;
                const alpha = 0.35 + Math.sin(p.pulse) * 0.15;
                ctx.fillStyle = `hsla(${hue}, 90%, 65%, ${alpha})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                // Conexões entre partículas
                for (let j = i + 1; j < points.length; j++) {
                    const p2 = points[j];
                    const d = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (d < maxDist) {
                        const alpha = 0.12 * (1 - d / maxDist);
                        ctx.strokeStyle = `hsla(185, 80%, 70%, ${alpha})`;
                        ctx.lineWidth = 0.4;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }

                // Conexão com mouse (efeito de "tocar")
                const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
                if (dm < maxDistMouse) {
                    const alpha = 0.25 * (1 - dm / maxDistMouse);
                    ctx.strokeStyle = `hsla(320, 80%, 75%, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            });

            animId = requestAnimationFrame(drawConstellation);
        }

        canvas.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        canvas.addEventListener('mouseleave', () => {
            mouse.x = -1000;
            mouse.y = -1000;
        });

        resize();
        initPoints(window.innerWidth < 768 ? 40 : 95);
        drawConstellation();

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                resize();
                initPoints(window.innerWidth < 768 ? 40 : 95);
            }, 250);
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       SEÇÃO 2: NAVEGAÇÃO & SCROLL — Autoridade e Progresso
       ═══════════════════════════════════════════════════════════════ */

    /* ── Nav com efeito de "glassmorphism" no scroll ── */
    const nav = $('nav');
    const navLinks = $('.nav-links');
    const navToggle = $('.nav-toggle');
    let lastScroll = 0;

    if (nav) {
        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            
            // Glass effect após 60px
            nav.classList.toggle('scrolled', currentScroll > 60);
            
            // Esconde/mostra no scroll para dar espaço ao conteúdo
            nav.classList.toggle('nav-hidden', currentScroll > lastScroll && currentScroll > 300);
            
            lastScroll = currentScroll;
        }, { passive: true });
    }

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            navToggle.classList.toggle('active');
            // Bloqueia scroll quando menu mobile aberto
            document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    /* ── Active Nav com progresso visual ── */
    const sections = $$('section[id]');
    const navAnchors = $$('.nav-links a[href^="#"]');

    if (sections.length && navAnchors.length) {
        // Barra de progresso de leitura
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        nav?.appendChild(progressBar);

        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            progressBar.style.transform = `scaleX(${progress / 100})`;
        }, { passive: true });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navAnchors.forEach(a => {
                        const isActive = a.getAttribute('href') === '#' + id;
                        a.classList.toggle('active', isActive);
                        // Indicador visual de seção com conteúdo "premium"
                        if (isActive && entry.target.dataset.value) {
                            a.setAttribute('data-section-value', entry.target.dataset.value);
                        }
                    });
                }
            });
        }, { rootMargin: '-35% 0px -60% 0px', threshold: 0.1 });

        sections.forEach(s => observer.observe(s));
    }

    /* ═══════════════════════════════════════════════════════════════
       SEÇÃO 3: ANIMAÇÕES DE ENTRADA — Reveal com Stagger & Peso
       ═══════════════════════════════════════════════════════════════ */

    /* ── Scroll Reveal (elegante, com delay escalonado) ── */
    const revealEls = $$('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-up');
    if (revealEls.length) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    // Delay escalonado para elementos em grupo
                    const delay = parseInt(entry.target.dataset.stagger || '0') * 100;
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                        // Trigger para counters internos
                        const internalCounters = entry.target.querySelectorAll('[data-target]');
                        internalCounters.forEach(c => animateCounter(c));
                    }, delay);
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { 
            threshold: CONFIG.ANIMATION.revealThreshold, 
            rootMargin: CONFIG.ANIMATION.revealRootMargin 
        });

        revealEls.forEach(el => revealObserver.observe(el));
    }

    /* ── Counter Animation (com easing exponencial + símbolo de moeda) ── */
    function animateCounter(el) {
        if (el.dataset.animated === 'true') return;
        el.dataset.animated = 'true';

        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const duration = parseInt(el.dataset.duration) || CONFIG.ANIMATION.counterDuration;
        const start = performance.now();

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Easing: cúbico out para impacto visual
            const eased = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(target * eased);
            
            // Formatação de milhares para números grandes
            const formatted = current >= 1000 
                ? current.toLocaleString('pt-BR') 
                : current;
            el.textContent = prefix + formatted + suffix;
            
            if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
    }

    const counters = $$('[data-target]');
    if (counters.length) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) animateCounter(entry.target);
            });
        }, { threshold: 0.4 });

        counters.forEach(c => counterObserver.observe(c));
    }

    /* ── Tech Level Bars (com contador sincronizado) ── */
    const techItems = $$('.tech-level-fill');
    if (techItems.length) {
        const techObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const level = entry.target.dataset.level;
                    const container = entry.target.closest('.tech-item');
                    const counter = container?.querySelector('.tech-level-number');
                    
                    entry.target.style.width = level + '%';
                    
                    // Anima o número se existir
                    if (counter) {
                        counter.dataset.target = level;
                        animateCounter(counter);
                    }
                    
                    techObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        techItems.forEach(t => {
            t.style.width = '0%';
            techObserver.observe(t);
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       SEÇÃO 4: INTERAÇÕES TÁTEIS — Tilt, Hover States Premium
       ═══════════════════════════════════════════════════════════════ */

    /* ── Tilt Cards (com profundidade adaptativa e reflexo dinâmico) ── */
    document.querySelectorAll('.tilt-card').forEach(card => {
        let rafId = null;

        card.addEventListener('mousemove', (e) => {
            if (rafId) cancelAnimationFrame(rafId);
            
            rafId = requestAnimationFrame(() => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                const rotateX = (y - 0.5) * -12;
                const rotateY = (x - 0.5) * 12;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
                card.style.zIndex = '10';
                
                const shine = card.querySelector('.tilt-shine');
                if (shine) {
                    shine.style.setProperty('--tilt-x', (x * 100) + '%');
                    shine.style.setProperty('--tilt-y', (y * 100) + '%');
                    shine.style.opacity = '0.4';
                }

                // Sombra dinâmica seguindo a luz
                const shadowX = (x - 0.5) * -20;
                const shadowY = (y - 0.5) * -20 + 20;
                card.style.boxShadow = `${shadowX}px ${shadowY}px 40px rgba(0,240,255,0.15)`;
            });
        });

        card.addEventListener('mouseleave', () => {
            if (rafId) cancelAnimationFrame(rafId);
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            card.style.zIndex = '';
            card.style.boxShadow = '';
            const shine = card.querySelector('.tilt-shine');
            if (shine) shine.style.opacity = '0';
        });

        // Efeito de "clique" satisfatório
        card.addEventListener('mousedown', () => {
            card.style.transform += ' scale(0.98)';
        });
        card.addEventListener('mouseup', () => {
            card.style.transform = card.style.transform.replace(' scale(0.98)', '');
        });
    });

    /* ═══════════════════════════════════════════════════════════════
       SEÇÃO 5: TERMINAL — Credibilidade Técnica Narrativa
       ═══════════════════════════════════════════════════════════════ */

    /* ── Terminal Simulation (mais realista, com tempo variável) ── */
    const terminalBody = $('#terminal-output');
    if (terminalBody) {
        const scenarios = [
            {
                title: 'Deploy de Produção',
                lines: [
                    { type: 'cmd', text: 'aurora init --project=cliente-enterprise --tier=premium' },
                    { type: 'success', text: '✓ Architecture initialized — microservices: 8 nodes' },
                    { type: 'info', text: '→ Auto-scaling configured: 2-64 instances' },
                    { type: 'cmd', text: 'aurora deploy --env=production --region=sa-east-1 --cdn=global' },
                    { type: 'output', text: 'Building assets ████████░░ 80%' },
                    { type: 'output', text: 'Otimizando bundles... [████████████████] 100%' },
                    { type: 'success', text: '✓ Deploy complete — latency: 4ms | cache: HIT' },
                    { type: 'info', text: '→ SSL A+ | HTTP/3 | DDoS protection: ACTIVE' }
                ]
            },
            {
                title: 'Auditoria de Segurança',
                lines: [
                    { type: 'cmd', text: 'aurora scan --security --depth=full' },
                    { type: 'output', text: 'Scanning dependencies... 1,247 packages checked' },
                    { type: 'success', text: '✓ Zero vulnerabilities — score: 10.0/10.0' },
                    { type: 'output', text: 'Penetration tests: 47 vectors blocked' },
                    { type: 'success', text: '✓ Compliance: LGPD, ISO 27001, SOC2 ready' }
                ]
            },
            {
                title: 'Performance em Tempo Real',
                lines: [
                    { type: 'cmd', text: 'aurora status --realtime --metrics=extended' },
                    { type: 'output', text: 'CORE v4.0 // ONLINE // uptime: 99.997%' },
                    { type: 'output', text: 'Throughput: 14.2k req/s | Memory: 42% | CPU: 23%' },
                    { type: 'warn', text: '⚡ Performance mode: TURBO active' },
                    { type: 'success', text: '✓ Lighthouse: 100 (Performance) | 100 (A11y)' }
                ]
            }
        ];

        let currentScenario = 0;
        let lineIndex = 0;

        function addTerminalLine() {
            const scenario = scenarios[currentScenario];
            
            if (lineIndex === 0) {
                // Cabeçalho de cenário
                const header = document.createElement('div');
                header.className = 'terminal-scenario-header';
                header.innerHTML = `<span class="scenario-dot"></span> ${scenario.title}`;
                terminalBody.appendChild(header);
            }

            if (lineIndex >= scenario.lines.length) {
                // Pausa entre cenários, depois reinicia
                setTimeout(() => {
                    terminalBody.innerHTML = '';
                    currentScenario = (currentScenario + 1) % scenarios.length;
                    lineIndex = 0;
                    addTerminalLine();
                }, 4000);
                return;
            }

            const item = scenario.lines[lineIndex];
            const div = document.createElement('div');
            div.className = 'terminal-line terminal-line-enter';

            // Ícones contextuais para tipo
            const icons = {
                cmd: '<span class="prompt-icon">❯</span>',
                success: '<span class="success-icon">✓</span>',
                warn: '<span class="warn-icon">⚡</span>',
                info: '<span class="info-icon">→</span>',
                output: '<span class="output-icon">·</span>'
            };

            if (item.type === 'cmd') {
                div.innerHTML = `${icons.cmd}<span class="prompt">maximus@aurora:~$</span> <span class="cmd">${item.text}</span>`;
            } else {
                div.innerHTML = `${icons[item.type] || ''}<span class="${item.type}">${item.text}</span>`;
            }

            terminalBody.appendChild(div);
            
            // Auto-scroll suave
            terminalBody.scrollTo({ 
                top: terminalBody.scrollHeight, 
                behavior: 'smooth' 
            });

            lineIndex++;
            
            // Timing realista: comandos digitam mais rápido, outputs aparecem
            const delay = item.type === 'cmd' ? 600 + Math.random() * 400 : 400 + Math.random() * 300;
            setTimeout(addTerminalLine, delay);
        }

        setTimeout(addTerminalLine, 2000);
    }

    /* ═══════════════════════════════════════════════════════════════
       SEÇÃO 6: PROVA SOCIAL DINÂMICA — Construção de Confiança em Loop
       ═══════════════════════════════════════════════════════════════ */

    /* ── Notification Toast de "Alguém Comprou" (FOMO) ── */
    function initSocialProof() {
        const container = document.createElement('div');
        container.className = 'social-proof-container';
        document.body.appendChild(container);

        const { names, locations, actions } = CONFIG.SOCIAL_PROOF;
        
        function showNotification() {
            const name = names[rand(0, names.length - 1)];
            const location = locations[rand(0, locations.length - 1)];
            const action = actions[rand(0, actions.length - 1)];
            const time = rand(2, 45);
            
            const toast = document.createElement('div');
            toast.className = 'social-proof-toast';
            toast.innerHTML = `
                <div class="toast-avatar">${name.charAt(0)}</div>
                <div class="toast-content">
                    <strong>${name}</strong> ${action}
                    <span class="toast-location">📍 ${location} · ${time} min atrás</span>
                </div>
                <div class="toast-close">×</div>
            `;
            
            container.appendChild(toast);
            
            // Animação de entrada
            requestAnimationFrame(() => toast.classList.add('toast-visible'));
            
            // Auto-remove
            setTimeout(() => {
                toast.classList.remove('toast-visible');
                setTimeout(() => toast.remove(), 400);
            }, 5000);
        }

        // Primeiro toast após 10s, depois intervalo configurável
        setTimeout(() => {
            showNotification();
            setInterval(showNotification, CONFIG.URGENCY.socialProofInterval);
        }, 10000);
    }

    /* ── Contador de Visitantes Online (urgência de escassez) ── */
    function initVisitorCounter() {
        const badge = document.createElement('div');
        badge.className = 'visitor-badge';
        badge.innerHTML = `<span class="visitor-pulse"></span> <span class="visitor-count">${rand(12, 28)}</span> consultores online agora`;
        $('.hero-cta')?.insertAdjacentElement('afterend', badge) || document.body.appendChild(badge);

        function updateVisitors() {
            const current = parseInt(badge.querySelector('.visitor-count')?.textContent || '20');
            const change = rand(-3, 4);
            const next = clamp(current + change, 8, 35);
            const countEl = badge.querySelector('.visitor-count');
            if (countEl) countEl.textContent = next;
        }

        setInterval(updateVisitors, CONFIG.URGENCY.visitorPulseInterval);
    }

    /* ── Contador Regressivo de Oferta (escassez temporal) ── */
    function initCountdownTimer() {
        const timerContainer = document.createElement('div');
        timerContainer.className = 'countdown-banner';
        timerContainer.innerHTML = `
            <span class="countdown-label">🔥 Oferta por tempo limitado</span>
            <div class="countdown-units">
                <span class="countdown-unit"><span class="count-number" id="count-m">47</span><small>min</small></span>
                <span class="countdown-sep">:</span>
                <span class="countdown-unit"><span class="count-number" id="count-s">00</span><small>seg</small></span>
            </div>
        `;
        
        // Inserir logo após o hero ou no topo
        const hero = $('.hero-section') || $('header');
        hero?.insertAdjacentElement('afterend', timerContainer);

        let totalSeconds = CONFIG.URGENCY.countdownMinutes * 60;

        function tick() {
            totalSeconds--;
            if (totalSeconds < 0) {
                totalSeconds = CONFIG.URGENCY.countdownMinutes * 60; // Loop para demo
            }
            
            const m = Math.floor(totalSeconds / 60);
            const s = totalSeconds % 60;
            
            $('#count-m') && ($('#count-m').textContent = m.toString().padStart(2, '0'));
            $('#count-s') && ($('#count-s').textContent = s.toString().padStart(2, '0'));
            
            // Urgência visual nos últimos 2 min
            if (totalSeconds < 120) {
                timerContainer.classList.add('countdown-urgent');
            }
        }

        setInterval(tick, 1000);
    }

    /* ═══════════════════════════════════════════════════════════════
       SEÇÃO 7: RENDERIZAÇÃO DE CONTEÚDO — Com Destaque para Conversão
       ═══════════════════════════════════════════════════════════════ */

    /* ── Feedback/Testimonials (com foto gerada e validação visual) ── */
    const feedbackData = [
        { u: "Ricardo Menezes", t: "O sistema de automação superou as expectativas. Código limpo e robusto.", r: 5, verified: true, company: "TechFlow Indústria" },
        { u: "Ana Clara Oliveira", t: "O site profissional mudou meu patamar no Google. Atendimento impecável.", r: 5, verified: true, company: "Estética Premium SP" },
        { u: "Felipe Cavalcante", t: "Maximus é especialista em backend. Resolveram problemas complexos rapidamente.", r: 5, verified: true, company: "FinTech Solutions" },
        { u: "Juliana Praxedes", t: "Meu cardápio digital voa! O carregamento é instantâneo.", r: 5, verified: true, company: "Bistrô Digital" },
        { u: "Thiago Albuquerque", t: "A segurança aplicada me deu total tranquilidade para escalar meu negócio.", r: 5, verified: true, company: "Logística Express" },
        { u: "Beatriz Sant'Ana", t: "Suporte nota 10 no plano VIP. Sempre disponíveis para ajudar.", r: 5, verified: true, company: "Consultoria Estratégica" }
    ];

    const fbContainer = $('#render-feedbacks');
    if (fbContainer) {
        // Shuffle para variabilidade
        const shuffled = [...feedbackData].sort(() => Math.random() - 0.5);
        
        shuffled.forEach((item, i) => {
            const stars = '★'.repeat(item.r) + '☆'.repeat(5 - item.r);
            const initials = item.u.split(' ').map(n => n[0]).join('').slice(0, 2);
            
            fbContainer.innerHTML += `
                <div class="feedback-item reveal anim-delay-${(i % 6) + 1}" data-stagger="${i % 3}">
                    <div class="feedback-header">
                        <div class="feedback-avatar">${initials}</div>
                        <div class="feedback-meta">
                            <span class="feedback-user">${item.u}</span>
                            <span class="feedback-company">${item.company}</span>
                            ${item.verified ? '<span class="feedback-verified">✓ Verificado</span>' : ''}
                        </div>
                    </div>
                    <p class="feedback-text">"${item.t}"</p>
                    <div class="feedback-rating">${stars}</div>
                    <div class="feedback-date">${rand(1, 30)} dias atrás</div>
                </div>`;
        });
    }

    /* ── FAQ Render (com busca e categorização) ── */
    const faqData = [
        { q: "Quais linguagens vocês dominam?", a: "C#, C++, Node.js, Rust e Python para back-end. HTML5, CSS3 e Modern JS para front-end.", cat: "Tecnologia" },
        { q: "O código-fonte é entregue ao cliente?", a: "Sim, todos os direitos de propriedade intelectual são transferidos após a entrega final. Você tem controle total.", cat: "Contrato" },
        { q: "Como funciona a manutenção mensal?", a: "Garante updates de segurança, backups diários e pequenos ajustes sob demanda. SLA de 4h para incidentes críticos.", cat: "Suporte" },
        { q: "Qual o prazo médio de entrega?", a: "Sites Básicos (7-14 dias), Profissionais (21-30 dias) e Sistemas Empresariais (45-90 dias). Cronograma detalhado no kickoff.", cat: "Processo" },
        { q: "Vocês assinam NDA?", a: "Sim, sigilo absoluto é padrão em todos os contratos. Seus dados e ideias estão protegidos.", cat: "Contrato" },
        { q: "Aceitam parcelamento?", a: "Sim, em até 12x no cartão ou Pix com desconto de 7% à vista.", cat: "Pagamento" }
    ];

    const faqContainer = $('#render-faq');
    if (faqContainer) {
        // Agrupa por categoria
        const categories = [...new Set(faqData.map(f => f.cat))];
        
        categories.forEach(cat => {
            const catHeader = document.createElement('div');
            catHeader.className = 'faq-category-header reveal';
            catHeader.innerHTML = `<span class="faq-cat-icon">${cat === 'Tecnologia' ? '⚙' : cat === 'Contrato' ? '📋' : cat === 'Suporte' ? '🛡' : cat === 'Processo' ? '📅' : '💳'}</span> ${cat}`;
            faqContainer.appendChild(catHeader);
            
            faqData.filter(f => f.cat === cat).forEach(item => {
                const div = document.createElement('div');
                div.className = 'faq-item reveal';
                div.innerHTML = `
                    <div class="faq-q">
                        <span class="faq-q-text">${item.q}</span>
                        <span class="faq-toggle"></span>
                    </div>
                    <div class="faq-a">
                        <div class="faq-a-content">${item.a}</div>
                    </div>
                `;
                
                div.addEventListener('click', () => {
                    const wasActive = div.classList.contains('active');
                    
                    // Fecha todos os outros (accordion)
                    $$('.faq-item.active').forEach(f => {
                        if (f !== div) {
                            f.classList.remove('active');
                            f.style.maxHeight = '';
                        }
                    });
                    
                    div.classList.toggle('active');
                    
                    // Anima altura
                    const answer = div.querySelector('.faq-a');
                    if (!wasActive) {
                        answer.style.maxHeight = answer.scrollHeight + 'px';
                    } else {
                        answer.style.maxHeight = '0';
                    }
                });
                
                faqContainer.appendChild(div);
            });
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       SEÇÃO 8: CHECKOUT / GATE — Redução de Fricção e Aumento de Valor
       ═══════════════════════════════════════════════════════════════ */

    let selectedPlan = '';
    let selectedPrice = '';
    let checkoutStep = 1;

    window.openGate = function (plan, price, features = []) {
        selectedPlan = plan;
        selectedPrice = price;
        checkoutStep = 1;
        
        const overlay = $('#checkout-overlay');
        const planName = $('#gate-plan-name');
        const planPrice = $('#gate-plan-price');
        const planFeatures = $('#gate-plan-features');
        const progress = $('.gate-progress');

        if (planName) planName.textContent = plan;
        if (planPrice) planPrice.textContent = price;
        
        // Lista de features do plano
        if (planFeatures && features.length) {
            planFeatures.innerHTML = features.map(f => 
                `<li class="feature-item"><span class="feature-check">✓</span> ${f}</li>`
            ).join('');
        }

        if (overlay) {
            overlay.style.display = 'flex';
            requestAnimationFrame(() => overlay.classList.add('active'));
        }
        
        $('.gate-step')?.forEach(s => s.style.display = 'none');
        $('#gate-step-1') && ($('#gate-step-1').style.display = 'block');
        $('#pix-container') && ($('#pix-container').style.display = 'none');
        
        if (progress) progress.style.width = '33%';
        document.body.style.overflow = 'hidden';
        
        // Gatilho de evento para analytics
        window.dispatchEvent(new CustomEvent('checkout:opened', { detail: { plan, price } }));
    };

    window.closeGate = function () {
        const overlay = $('#checkout-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.style.display = 'none';
                checkoutStep = 1;
            }, 300);
        }
        document.body.style.overflow = '';
    };

    window.nextStep = function (step) {
        $('.gate-step')?.forEach(s => s.style.display = 'none');
        $(`#gate-step-${step}`) && ($(`#gate-step-${step}`).style.display = 'block');
        
        const progress = $('.gate-progress');
        if (progress) progress.style.width = (step * 33) + '%';
        
        checkoutStep = step;
        
        // Foco no primeiro campo
        setTimeout(() => {
            $(`#gate-step-${step} input`)?.focus();
        }, 100);
    };

    window.generateInvoice = function () {
        const token = 'AMX-' + Date.now().toString(36).substr(-6).toUpperCase() + 
                     '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
        
        const tokenEl = $('#gate-token');
        const qrContainer = $('#pix-qr-container');
        
        if (tokenEl) {
            tokenEl.innerHTML = `
                <div class="token-display">
                    <span class="token-label">CHAVE DE ATIVAÇÃO</span>
                    <code class="token-code">${token}</code>
                    <button class="token-copy" onclick="navigator.clipboard.writeText('${token}')">Copiar</button>
                </div>
            `;
        }
        
        if (qrContainer) {
            // Placeholder para QR code real
            qrContainer.innerHTML = `
                <div class="pix-qr-placeholder">
                    <div class="qr-grid"></div>
                    <span>Escaneie com seu app bancário</span>
                </div>
            `;
        }
        
        nextStep(2);
    };

    window.finalizeRequest = function () {
        const project = $('#gate-client-project')?.value || 'Não informado';
        const client = $('#gate-client-name')?.value || 'Anônimo';
        const email = $('#gate-client-email')?.value || '';
        const phone = $('#gate-client-phone')?.value || '';
        
        // Validação básica
        if (!client || client.length < 2) {
            $('#gate-client-name')?.classList.add('input-error');
            return;
        }

        // Constrói mensagem enriquecida para WhatsApp
        const message = [
            `🚀 *ATIVAÇÃO AURORA MIND*`,
            ``,
            `📋 *Plano:* ${selectedPlan}`,
            `💰 *Investimento:* ${selectedPrice}`,
            ``,
            `👤 *Solicitante:* ${client}`,
            `📧 *Email:* ${email || 'Não informado'}`,
            `📱 *Telefone:* ${phone || 'Não informado'}`,
            `📝 *Projeto:* ${project}`,
            ``,
            `⏰ *Solicitado em:* ${new Date().toLocaleString('pt-BR')}`,
            ``,
            `Quero prosseguir com a ativação!`
        ].join('\n');

        window.location.href = '[wa.me](https://wa.me/5532999577201?text=)' + encodeURIComponent(message);
        
        // Evento de conversão
        window.dispatchEvent(new CustomEvent('checkout:completed', { 
            detail: { plan: selectedPlan, value: selectedPrice } 
        }));
    };

    // Overlay click e ESC
    $('#checkout-overlay')?.addEventListener('click', (e) => {
        if (e.target.id === 'checkout-overlay') closeGate();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeGate();
    });

    /* ═══════════════════════════════════════════════════════════════
       SEÇÃO 9: CONTATO E CAPTURA DE LEADS — Múltiplos Touchpoints
       ═══════════════════════════════════════════════════════════════ */

    /* ── Contact Form (com validação e feedback visual) ── */
    const contactForm = $('#contact-form');
    if (contactForm) {
        const inputs = contactForm.querySelectorAll('input, textarea');
        
        // Validação em tempo real
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                input.classList.toggle('input-valid', input.checkValidity());
                input.classList.toggle('input-invalid', !input.checkValidity() && input.value);
            });
        });

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.dataset.originalText = submitBtn.textContent;
                submitBtn.innerHTML = '<span class="btn-spinner"></span> Enviando...';
            }

            const name = $('#contact-name')?.value;
            const email = $('#contact-email')?.value;
            const phone = $('#contact-phone')?.value || '';
            const msg = $('#contact-message')?.value;

            // Simula delay para percepção de processamento
            setTimeout(() => {
                const message = [
                    `📨 *NOVO CONTATO AURORA MIND*`,
                    ``,
                    `👤 *Nome:* ${name}`,
                    `📧 *Email:* ${email}`,
                    `📱 *Telefone:* ${phone || 'Não informado'}`,
                    `📝 *Mensagem:*`,
                    msg,
                    ``,
                    `Enviado em: ${new Date().toLocaleString('pt-BR')}`
                ].join('\n');

                window.location.href = '[wa.me](https://wa.me/5532999577201?text=)' + encodeURIComponent(message);
                
                if (submitBtn) {
                    submitBtn.textContent = '✓ Enviado!';
                    submitBtn.classList.add('btn-success');
                }
            }, 800);
        });
    }

    /* ── Exit Intent Popup (última chance de conversão) ── */
    function initExitIntent() {
        let triggered = false;
        
        document.addEventListener('mouseout', (e) => {
            if (triggered) return;
            if (e.clientY < 10 && !$('#checkout-overlay')?.classList.contains('active')) {
                triggered = true;
                
                const popup = document.createElement('div');
                popup.className = 'exit-popup';
                popup.innerHTML = `
                    <div class="exit-popup-content">
                        <button class="exit-popup-close">×</button>
                        <h3>⏳ Espera! Não perca esta oportunidade</h3>
                        <p>Projetos para <strong>${new Date().getMonth() + 1}/${new Date().getFullYear()}</strong> estão <strong>85% reservados</strong>.</p>
                        <div class="exit-urgency">
                            <span class="exit-spots">Apenas ${rand(2, 6)} vagas restantes</span>
                        </div>
                        <button class="exit-cta" onclick="window.location='#plans'; document.querySelector('.exit-popup')?.remove()">
                            Ver Planos Disponíveis →
                        </button>
                        <button class="exit-secondary" onclick="document.querySelector('.exit-popup')?.remove()">
                            Prefiro arriscar depois
                        </button>
                    </div>
                `;
                
                document.body.appendChild(popup);
                requestAnimationFrame(() => popup.classList.add('exit-visible'));
                
                popup.querySelector('.exit-popup-close')?.addEventListener('click', () => {
                    popup.classList.remove('exit-visible');
                    setTimeout(() => popup.remove(), 300);
                });
            }
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       SEÇÃO 10: RENDERIZAÇÃO DE DADOS — Com Destaque Comercial
       ═══════════════════════════════════════════════════════════════ */

    /* ── Tech Stack Render (com tooltip rico e progresso animado) ── */
    const techData = [
        { icon: "C#", name: "C# / .NET", level: 95, desc: "Arquitetura enterprise, microserviços, APIs robustas" },
        { icon: "C++", name: "C++", level: 88, desc: "Performance crítica, sistemas embarcados, jogos" },
        { icon: "RS", name: "Rust", level: 82, desc: "Segurança de memória, WebAssembly, blockchain" },
        { icon: "JS", name: "Node.js", level: 92, desc: "APIs realtime, streaming, serverless" },
        { icon: "PY", name: "Python", level: 85, desc: "IA/ML, automação, análise de dados" },
        { icon: "TS", name: "TypeScript", level: 90, desc: "Aplicações escaláveis, type-safety" },
        { icon: "RE", name: "React", level: 88, desc: "SPAs performáticas, SSR, Native" },
        { icon: "SQL", name: "SQL/NoSQL", level: 93, desc: "Modelagem, otimização, replicação" },
        { icon: "AWS", name: "Cloud AWS", level: 80, desc: "Infra as code, auto-scaling, custo otimizado" },
        { icon: "DO", name: "Docker", level: 86, desc: "Containerização, orquestração, CI/CD" },
        { icon: "K8", name: "Kubernetes", level: 75, desc: "Clusters, service mesh, observabilidade" },
        { icon: "GI", name: "Git/CI", level: 94, desc: "Fluxos Git avançados, pipelines, deploy contínuo" }
    ];

    const techContainer = $('#render-tech');
    if (techContainer) {
        techData.forEach((t, i) => {
            techContainer.innerHTML += `
                <div class="tech-item reveal anim-delay-${(i % 6) + 1}" 
                     data-tooltip="${t.name}: ${t.level}% — ${t.desc}"
                     data-stagger="${i % 4}">
                    <div class="tech-icon-wrapper">
                        <span class="tech-icon">${t.icon}</span>
                        <span class="tech-level-number" data-target="${t.level}" data-suffix="%">0%</span>
                    </div>
                    <span class="tech-name">${t.name}</span>
                    <div class="tech-level">
                        <div class="tech-level-fill" data-level="${t.level}"></div>
                    </div>
                </div>`;
        });
    }

    /* ── Portfolio Render (com hover expansivo e case study) ── */
    const portfolioData = [
        { title: "Sistema ERP Industrial", tags: ["C#", ".NET", "SQL"], 
          code: "class ProductionLine {\n  async optimize() {\n    return await AI.analyze();\n  }\n}",
          metrics: { perf: "99.9%", users: "500+", roi: "340%" } },
        { title: "E-Commerce Premium", tags: ["Node.js", "React", "Stripe"], 
          code: "const checkout = await stripe\n  .sessions.create({\n    mode: 'payment'\n  });",
          metrics: { perf: "100/100", users: "12k/mês", roi: "280%" } },
        { title: "Dashboard Analytics", tags: ["Rust", "WebSocket", "D3"], 
          code: "stream.metrics()\n  .filter(|m| m.value > 0)\n  .aggregate();",
          metrics: { perf: "<10ms", users: "200+", roi: "450%" } },
        { title: "App Mobile Backend", tags: ["C++", "API", "Redis"], 
          code: "api.post('/sync', async (req) => {\n  return cache.update(req.body);\n});",
          metrics: { perf: "50k req/s", users: "1M+", roi: "190%" } },
        { title: "Landing High-Convert", tags: ["HTML5", "CSS3", "SEO"], 
          code: "const score = await lighthouse\n  .audit(url);\n// Performance: 98",
          metrics: { perf: "98/100", users: "Orgânico", roi: "520%" } },
        { title: "Automação WhatsApp", tags: ["Python", "Node.js", "Bot"], 
          code: "bot.on('message', async (msg) => {\n  await processQueue(msg);\n});",
          metrics: { perf: "24/7", users: "3k/dia", roi: "210%" } }
    ];

    const portfolioContainer = $('#render-portfolio');
    if (portfolioContainer) {
        portfolioData.forEach((p, i) => {
            portfolioContainer.innerHTML += `
                <div class="portfolio-item reveal anim-delay-${(i % 4) + 1} tilt-card" data-stagger="${i % 3}">
                    <div class="tilt-shine"></div>
                    <div class="portfolio-preview">
                        <pre class="portfolio-code">${p.code}</pre>
                        <div class="portfolio-metrics">
                            <span title="Performance">⚡ ${p.metrics.perf}</span>
                            <span title="Usuários">👥 ${p.metrics.users}</span>
                            <span title="ROI">📈 ${p.metrics.roi}</span>
                        </div>
                    </div>
                    <div class="portfolio-overlay">
                        <h4>${p.title}</h4>
                        <span class="portfolio-case">// CASE_${String(i + 1).padStart(3, '0')}</span>
                        <div class="portfolio-tags">${p.tags.map(t => `<span class="portfolio-tag">${t}</span>`).join('')}</div>
                        <button class="portfolio-cta" onclick="window.openGate('${p.title}', 'Consultar')">Quero algo assim →</button>
                    </div>
                </div>`;
        });
    }

    /* ── Blog Render (com "read time" e categorias) ── */
    const blogData = [
        { date: "2026.07.10", title: "Rust em Produção: Resultados Reais", 
          desc: "Como migramos serviços críticos para Rust com 40% menos latência e 60% menos custo de infra.", 
          cat: "Backend", readTime: 8 },
        { date: "2026.06.28", title: "Core v4.0: Arquitetura para Escala", 
          desc: "Nova geração de microserviços com observabilidade completa e deploy em < 30 segundos.", 
          cat: "Arquitetura", readTime: 6 },
        { date: "2026.06.15", title: "Performance Web 2026: O Guia Definitivo", 
          desc: "Como atingimos 100 no Lighthouse em projetos reais com milhões de acessos.", 
          cat: "Frontend", readTime: 12 },
        { date: "2026.06.01", title: "Segurança: Além do Básico", 
          desc: "Estratégias de defesa em profundidade que já bloquearam 2M+ tentativas de invasão.", 
          cat: "Segurança", readTime: 10 }
    ];

    const blogContainer = $('#render-blog');
    if (blogContainer) {
        blogData.forEach((b, i) => {
            blogContainer.innerHTML += `
                <article class="blog-card reveal" data-stagger="${i % 3}">
                    <div class="blog-meta">
                        <span class="blog-cat">${b.cat}</span>
                        <span class="blog-readtime">⏱ ${b.readTime} min</span>
                    </div>
                    <div class="blog-date">${b.date}</div>
                    <h4><a href="#blog/${b.title.toLowerCase().replace(/\s+/g, '-')}">${b.title}</a></h4>
                    <p>${b.desc}</p>
                    <a class="blog-readmore" href="#blog/${b.title.toLowerCase().replace(/\s+/g, '-')}">Ler artigo →</a>
                </article>`;
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       SEÇÃO 11: FINALIZAÇÃO — Inicializações e Polimento
       ═══════════════════════════════════════════════════════════════ */

    /* ── Page Link Transition (com preloader elegante) ── */
    $$('a.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#') && !href.startsWith('http')) {
                e.preventDefault();
                
                const overlay = document.createElement('div');
                overlay.className = 'page-transition-overlay';
                overlay.innerHTML = '<div class="transition-logo">AURORA MIND</div><div class="transition-bar"></div>';
                document.body.appendChild(overlay);
                
                requestAnimationFrame(() => overlay.classList.add('active'));
                
                setTimeout(() => { 
                    window.location.href = href; 
                }, 600);
            }
        });
    });

    /* ── Dynamic Sys Panel (status sempre atualizado) ── */
    const sysPanel = $('.sys-control-panel');
    if (sysPanel) {
        const metrics = [
            { key: 'latency', base: 4, unit: 'ms', format: v => v + 'ms' },
            { key: 'uptime', base: 99.99, unit: '%', format: v => v.toFixed(2) + '%' },
            { key: 'requests', base: 14200, unit: '/s', format: v => (v / 1000).toFixed(1) + 'k/s' }
        ];
        
        setInterval(() => {
            let html = sysPanel.innerHTML;
            metrics.forEach(m => {
                const variation = (Math.random() - 0.5) * m.base * 0.2;
                const value = Math.max(1, m.base + variation);
                const regex = new RegExp(`\\d+\\.?\\d*${m.unit.replace('/', '\\/')}`);
                html = html.replace(regex, m.format(value));
            });
            sysPanel.innerHTML = html;
        }, 3000);
    }

    /* ── Inicializa componentes de conversão ── */
    function initConversionEngine() {
        initSocialProof();
        initVisitorCounter();
        initCountdownTimer();
        initExitIntent();
        
        // Trust badges flutuantes
        const trustBar = document.createElement('div');
        trustBar.className = 'trust-bar';
        trustBar.innerHTML = `
            <span>🔒 Pagamento Seguro</span>
            <span>⚡ Entrega Garantida</span>
            <span>🛡️ Suporte 24/7</span>
            <span>✓ Satisfação ou Reembolso</span>
        `;
        document.body.appendChild(trustBar);
    }

    // Delay para não sobrecarregar o LCP
    if (document.readyState === 'complete') {
        setTimeout(initConversionEngine, 2000);
    } else {
        window.addEventListener('load', () => setTimeout(initConversionEngine, 2000));
    }

    /* ── Re-init reveal para elementos dinâmicos ── */
    setTimeout(() => {
        $$('.reveal:not(.visible)').forEach(el => {
            const obs = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.classList.add('visible');
                        }, parseInt(entry.dataset.stagger || '0') * 100);
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            obs.observe(el);
        });
    }, 150);

    /* ── Lazy loading de imagens (se houver) ── */
    if ('IntersectionObserver' in window) {
        const imgObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('img-loaded');
                    imgObserver.unobserve(img);
                }
            });
        });
        
        $$('img[data-src]').forEach(img => imgObserver.observe(img));
    }

})();
