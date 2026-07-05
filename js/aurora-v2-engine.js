/**
 * AURORA MIND v3.0 — Engine
 * Canvas · Interactions · Scroll · Terminal · Checkout
 */
(function () {
    'use strict';

    /* ── Glow Follow (smoothed) ── */
    const glow = document.getElementById('glow');
    if (glow) {
        let targetX = 50, targetY = 50, currentX = 50, currentY = 50;
        const ease = 0.1;
        const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

        document.addEventListener('mousemove', (e) => {
            targetX = clamp((e.clientX / window.innerWidth) * 100, 8, 92);
            targetY = clamp((e.clientY / window.innerHeight) * 100, 8, 92);
        }, { passive: true });

        (function updateGlow() {
            currentX += (targetX - currentX) * ease;
            currentY += (targetY - currentY) * ease;
            glow.style.setProperty('--x', currentX + '%');
            glow.style.setProperty('--y', currentY + '%');
            requestAnimationFrame(updateGlow);
        })();
    }

    /* ── Constellation Canvas ── */
    const canvas = document.getElementById('canvas-bg');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let points = [];
        let animId = null;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        class Point {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.size = Math.random() * 1.5 + 0.5;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }
        }

        function initPoints(count) {
            points = [];
            for (let i = 0; i < count; i++) points.push(new Point());
        }

        function drawConstellation() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const maxDist = 140;

            points.forEach((p, i) => {
                p.update();
                ctx.fillStyle = 'rgba(0, 240, 255, 0.45)';
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                for (let j = i + 1; j < points.length; j++) {
                    const p2 = points[j];
                    const d = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (d < maxDist) {
                        const alpha = 0.18 - d / 900;
                        ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });

            animId = requestAnimationFrame(drawConstellation);
        }

        resize();
        initPoints(window.innerWidth < 768 ? 45 : 85);
        drawConstellation();

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                resize();
                initPoints(window.innerWidth < 768 ? 45 : 85);
            }, 200);
        });
    }

    /* ── Nav Scroll & Mobile Toggle ── */
    const nav = document.querySelector('nav');
    const navLinks = document.querySelector('.nav-links');
    const navToggle = document.querySelector('.nav-toggle');

    if (nav) {
        window.addEventListener('scroll', () => {
            nav.classList.toggle('scrolled', window.scrollY > 60);
        }, { passive: true });
    }

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            navToggle.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                navToggle.classList.remove('active');
            });
        });
    }

    /* ── Active Nav Link on Scroll ── */
    const sections = document.querySelectorAll('section[id]');
    const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

    if (sections.length && navAnchors.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navAnchors.forEach(a => {
                        a.classList.toggle('active', a.getAttribute('href') === '#' + id);
                    });
                }
            });
        }, { rootMargin: '-40% 0px -55% 0px' });

        sections.forEach(s => observer.observe(s));
    }

    /* ── Scroll Reveal ── */
    const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (revealEls.length) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(el => revealObserver.observe(el));
    }

    /* ── Counter Animation ── */
    function animateCounter(el) {
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 2000;
        const start = performance.now();

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(target * eased) + suffix;
            if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
    }

    const counters = document.querySelectorAll('[data-target]');
    if (counters.length) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(c => counterObserver.observe(c));
    }

    /* ── Tech Level Bars ── */
    const techItems = document.querySelectorAll('.tech-level-fill');
    if (techItems.length) {
        const techObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.width = entry.target.dataset.level + '%';
                    techObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        techItems.forEach(t => {
            t.style.width = '0%';
            techObserver.observe(t);
        });
    }

    /* ── Tilt Cards ── */
    document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            const rotateX = (y - 0.5) * -8;
            const rotateY = (x - 0.5) * 8;
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            const shine = card.querySelector('.tilt-shine');
            if (shine) {
                shine.style.setProperty('--tilt-x', (x * 100) + '%');
                shine.style.setProperty('--tilt-y', (y * 100) + '%');
            }
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    /* ── Terminal Simulation ── */
    const terminalBody = document.getElementById('terminal-output');
    if (terminalBody) {
        const lines = [
            { type: 'cmd', text: 'aurora init --project=digital-engineering' },
            { type: 'success', text: '✓ Architecture initialized successfully' },
            { type: 'cmd', text: 'aurora deploy --env=production --region=sa-east-1' },
            { type: 'output', text: 'Building assets... [████████████████] 100%' },
            { type: 'success', text: '✓ Deploy complete — https://auroramind.dev' },
            { type: 'cmd', text: 'aurora status --all' },
            { type: 'output', text: 'CORE v3.0 // ONLINE // latency: 8ms' },
            { type: 'output', text: 'Services: 12 active | Uptime: 99.97%' },
            { type: 'warn', text: '⚡ Performance mode: MAXIMUM' },
            { type: 'cmd', text: 'aurora scan --security' },
            { type: 'success', text: '✓ Zero vulnerabilities detected' },
        ];

        let lineIndex = 0;

        function addTerminalLine() {
            if (lineIndex >= lines.length) {
                lineIndex = 0;
                terminalBody.innerHTML = '';
            }

            const item = lines[lineIndex];
            const div = document.createElement('div');
            div.className = 'terminal-line';

            if (item.type === 'cmd') {
                div.innerHTML = '<span class="prompt">maximus@aurora:~$</span> <span class="cmd">' + item.text + '</span>';
            } else {
                div.innerHTML = '<span class="' + item.type + '">' + item.text + '</span>';
            }

            terminalBody.appendChild(div);
            terminalBody.scrollTop = terminalBody.scrollHeight;
            lineIndex++;

            setTimeout(addTerminalLine, 800 + Math.random() * 1200);
        }

        setTimeout(addTerminalLine, 1500);
    }

    /* ── Feedback Render ── */
    const feedbackData = [
        { u: "Ricardo Menezes", t: "O sistema de automação superou as expectativas. Código limpo e robusto.", r: 5 },
        { u: "Ana Clara Oliveira", t: "O site profissional mudou meu patamar no Google. Atendimento impecável.", r: 5 },
        { u: "Felipe Cavalcante", t: "Maximus é especialista em backend. Resolveram problemas complexos rapidamente.", r: 5 },
        { u: "Juliana Praxedes", t: "Meu cardápio digital voa! O carregamento é instantâneo.", r: 5 },
        { u: "Thiago Albuquerque", t: "A segurança aplicada me deu total tranquilidade para escalar meu negócio.", r: 5 },
        { u: "Beatriz Sant'Ana", t: "Suporte nota 10 no plano VIP. Sempre disponíveis para ajudar.", r: 5 }
    ];

    const fbContainer = document.getElementById('render-feedbacks');
    if (fbContainer) {
        feedbackData.forEach((item, i) => {
            const stars = '★'.repeat(item.r) + '☆'.repeat(5 - item.r);
            fbContainer.innerHTML += `
                <div class="feedback-item reveal anim-delay-${(i % 6) + 1}">
                    <span class="feedback-user">${item.u}</span>
                    <p class="feedback-text">"${item.t}"</p>
                    <div class="feedback-rating">${stars}</div>
                </div>`;
        });
    }

    /* ── FAQ Render ── */
    const faqData = [
        { q: "Quais linguagens vocês dominam?", a: "C#, C++, Node.js, Rust e Python para back-end. HTML5, CSS3 e Modern JS para front-end." },
        { q: "O código-fonte é entregue ao cliente?", a: "Sim, todos os direitos de propriedade intelectual são transferidos após a entrega final." },
        { q: "Como funciona a manutenção mensal?", a: "Garante updates de segurança, backups diários e pequenos ajustes sob demanda." },
        { q: "Qual o prazo médio de entrega?", a: "Sites Básicos (7-14 dias), Profissionais (21-30 dias) e Sistemas (45-90 dias)." }
    ];

    const faqContainer = document.getElementById('render-faq');
    if (faqContainer) {
        faqData.forEach(item => {
            const div = document.createElement('div');
            div.className = 'faq-item reveal';
            div.innerHTML = `<div class="faq-q">${item.q} <span>[+]</span></div><div class="faq-a">${item.a}</div>`;
            div.addEventListener('click', () => {
                document.querySelectorAll('.faq-item.active').forEach(f => {
                    if (f !== div) f.classList.remove('active');
                });
                div.classList.toggle('active');
            });
            faqContainer.appendChild(div);
        });
    }

    /* ── Tech Stack Render ── */
    const techData = [
        { icon: "C#", name: "C# / .NET", level: 95 },
        { icon: "C++", name: "C++", level: 88 },
        { icon: "RS", name: "Rust", level: 82 },
        { icon: "JS", name: "Node.js", level: 92 },
        { icon: "PY", name: "Python", level: 85 },
        { icon: "TS", name: "TypeScript", level: 90 },
        { icon: "RE", name: "React", level: 88 },
        { icon: "SQL", name: "SQL/NoSQL", level: 93 },
        { icon: "AWS", name: "Cloud AWS", level: 80 },
        { icon: "DO", name: "Docker", level: 86 },
        { icon: "K8", name: "Kubernetes", level: 75 },
        { icon: "GI", name: "Git/CI", level: 94 }
    ];

    const techContainer = document.getElementById('render-tech');
    if (techContainer) {
        techData.forEach((t, i) => {
            techContainer.innerHTML += `
                <div class="tech-item reveal anim-delay-${(i % 6) + 1}" data-tooltip="${t.name}: ${t.level}%">
                    <span class="tech-icon">${t.icon}</span>
                    <span class="tech-name">${t.name}</span>
                    <div class="tech-level"><div class="tech-level-fill" data-level="${t.level}"></div></div>
                </div>`;
        });

        document.querySelectorAll('#render-tech .tech-level-fill').forEach(t => {
            t.style.width = '0%';
            const obs = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.width = entry.target.dataset.level + '%';
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });
            obs.observe(t);
        });
    }

    /* ── Portfolio Render ── */
    const portfolioData = [
        { title: "Sistema ERP Industrial", tags: ["C#", ".NET", "SQL"], code: "class ProductionLine {\n  async optimize() {\n    return await AI.analyze();\n  }\n}" },
        { title: "E-Commerce Premium", tags: ["Node.js", "React", "Stripe"], code: "const checkout = await stripe\n  .sessions.create({\n    mode: 'payment'\n  });" },
        { title: "Dashboard Analytics", tags: ["Rust", "WebSocket", "D3"], code: "stream.metrics()\n  .filter(|m| m.value > 0)\n  .aggregate();" },
        { title: "App Mobile Backend", tags: ["C++", "API", "Redis"], code: "api.post('/sync', async (req) => {\n  return cache.update(req.body);\n});" },
        { title: "Landing High-Convert", tags: ["HTML5", "CSS3", "SEO"], code: "const score = await lighthouse\n  .audit(url);\n// Performance: 98" },
        { title: "Automação WhatsApp", tags: ["Python", "Node.js", "Bot"], code: "bot.on('message', async (msg) => {\n  await processQueue(msg);\n});" }
    ];

    const portfolioContainer = document.getElementById('render-portfolio');
    if (portfolioContainer) {
        portfolioData.forEach((p, i) => {
            portfolioContainer.innerHTML += `
                <div class="portfolio-item reveal anim-delay-${(i % 4) + 1} tilt-card">
                    <div class="tilt-shine"></div>
                    <div class="portfolio-preview">
                        <pre class="portfolio-code">${p.code}</pre>
                    </div>
                    <div class="portfolio-overlay">
                        <h4>${p.title}</h4>
                        <span>// CASE_${String(i + 1).padStart(3, '0')}</span>
                        <div class="portfolio-tags">${p.tags.map(t => `<span class="portfolio-tag">${t}</span>`).join('')}</div>
                    </div>
                </div>`;
        });
    }

    /* ── Blog Render ── */
    const blogData = [
        { date: "2026.06.15", title: "Rust em Produção", desc: "Como migramos serviços críticos para Rust com 40% menos latência." },
        { date: "2026.06.01", title: "Core v3.0 Release", desc: "Nova arquitetura de microserviços com observabilidade completa." },
        { date: "2026.05.20", title: "Performance Web 2026", desc: "Guia definitivo para atingir 100 no Lighthouse em projetos reais." }
    ];

    const blogContainer = document.getElementById('render-blog');
    if (blogContainer) {
        blogData.forEach(b => {
            blogContainer.innerHTML += `
                <div class="blog-card reveal">
                    <div class="blog-date">${b.date}</div>
                    <h4>${b.title}</h4>
                    <p>${b.desc}</p>
                </div>`;
        });
    }

    /* ── Checkout Gate ── */
    let selectedPlan = '';

    window.openGate = function (plan, price) {
        selectedPlan = plan;
        document.getElementById('gate-plan-name').innerText = plan;
        document.getElementById('checkout-overlay').style.display = 'flex';
        document.getElementById('checkout-overlay').classList.add('active');
        document.getElementById('gate-step-1').style.display = 'block';
        document.getElementById('pix-container').style.display = 'none';
        document.body.style.overflow = 'hidden';
    };

    window.closeGate = function () {
        document.getElementById('checkout-overlay').style.display = 'none';
        document.getElementById('checkout-overlay').classList.remove('active');
        document.body.style.overflow = '';
    };

    window.generateInvoice = function () {
        const token = 'AURORA-' + Math.random().toString(36).substr(2, 12).toUpperCase();
        document.getElementById('gate-token').innerText = 'CHAVE DE ATIVAÇÃO: ' + token;
        document.getElementById('gate-step-1').style.display = 'none';
        document.getElementById('pix-container').style.display = 'block';
    };

    window.finalizeRequest = function () {
        const project = document.getElementById('gate-client-project').value;
        const client = document.getElementById('gate-client-name').value;
        window.location.href = 'https://wa.me/5532999577201?text=' + encodeURIComponent(
            'ATIVAR PLANO: ' + selectedPlan + '\nPROJETO: ' + project + '\nSOLICITANTE: ' + client
        );
    };

    document.getElementById('checkout-overlay')?.addEventListener('click', (e) => {
        if (e.target.id === 'checkout-overlay') closeGate();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeGate();
    });

    /* ── Contact Form ── */
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const msg = document.getElementById('contact-message').value;
            window.location.href = 'https://wa.me/5532999577201?text=' + encodeURIComponent(
                'CONTATO AURORA MIND\nNome: ' + name + '\nEmail: ' + email + '\nMensagem: ' + msg
            );
        });
    }

    /* ── Page Link Transition ── */
    document.querySelectorAll('a.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#') && !href.startsWith('http')) {
                e.preventDefault();
                const overlay = document.createElement('div');
                overlay.className = 'page-transition-overlay active';
                document.body.appendChild(overlay);
                setTimeout(() => { window.location.href = href; }, 500);
            }
        });
    });

    /* ── Dynamic Ping in Sys Panel ── */
    const sysPanel = document.querySelector('.sys-control-panel');
    if (sysPanel) {
        setInterval(() => {
            const ms = Math.floor(Math.random() * 8) + 4;
            const text = sysPanel.innerHTML;
            sysPanel.innerHTML = text.replace(/\d+ms/, ms + 'ms');
        }, 3000);
    }

    /* ── Re-init reveal for dynamically added elements ── */
    setTimeout(() => {
        document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
            const obs = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            obs.observe(el);
        });
    }, 100);

})();
