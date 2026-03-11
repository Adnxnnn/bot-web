document.addEventListener('DOMContentLoaded', () => {

    // ─── 1. Theme Toggle ───────────────────────────────────────────────────────
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    const savedTheme = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            html.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            updateThemeIcon(next);
        });
    }

    function updateThemeIcon(theme) {
        const icon = themeToggle && themeToggle.querySelector('i');
        if (!icon) return;
        icon.className = theme === 'light' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }

    // ─── 2. Navbar Scroll Effect ───────────────────────────────────────────────
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 50);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); // run on load in case already scrolled
    }

    // ─── 3. Hamburger Mobile Menu ──────────────────────────────────────────────
    const hamburger  = document.getElementById('hamburger');
    const navLinks   = document.getElementById('navLinks');
    const navOverlay = document.getElementById('navOverlay');

    function openMenu() {
        hamburger  && hamburger.classList.add('open');
        navLinks   && navLinks.classList.add('open');
        navOverlay && navOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        hamburger  && hamburger.classList.remove('open');
        navLinks   && navLinks.classList.remove('open');
        navOverlay && navOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    hamburger  && hamburger.addEventListener('click',  () => hamburger.classList.contains('open') ? closeMenu() : openMenu());
    navOverlay && navOverlay.addEventListener('click', closeMenu);

    // Close drawer when any nav link is tapped on mobile
    document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', closeMenu));

    // ─── 4. Smooth Scroll — Account for Fixed Navbar ──────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const navHeight = navbar ? navbar.offsetHeight : 80;
            const y = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
            window.scrollTo({ top: y, behavior: 'smooth' });
            closeMenu(); // also close mobile menu if open
        });
    });

    // ─── 5. Docs Sidebar Toggle (mobile) ──────────────────────────────────────
    const sidebarToggle = document.getElementById('sidebarToggle');
    const docsSidebar   = document.getElementById('docsSidebar');

    if (sidebarToggle && docsSidebar) {
        sidebarToggle.addEventListener('click', () => {
            const open = docsSidebar.classList.toggle('open');
            sidebarToggle.classList.toggle('open', open);
            const label = sidebarToggle.querySelector('span');
            if (label) label.textContent = open ? 'Close navigation' : 'Jump to section';
        });

        docsSidebar.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                docsSidebar.classList.remove('open');
                sidebarToggle.classList.remove('open');
                const label = sidebarToggle.querySelector('span');
                if (label) label.textContent = 'Jump to section';
            });
        });
    }

    // ─── 6. Active Docs Sidebar Link (scroll spy) ─────────────────────────────
    const docsSections = document.querySelectorAll('.docs-main section[id]');
    const sidebarLinks = document.querySelectorAll('.docs-sidebar .nav-group a');

    if (docsSections.length && sidebarLinks.length) {
        const spy = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                sidebarLinks.forEach(l => l.classList.remove('active'));
                const activeLink = document.querySelector(`.docs-sidebar a[href="#${entry.target.id}"]`);
                if (activeLink) activeLink.classList.add('active');
            });
        }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

        docsSections.forEach(s => spy.observe(s));
    }

    // ─── 7. Scroll Reveal Animations ──────────────────────────────────────────
    const revealEls = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));

    // Immediately reveal elements already in viewport on load
    setTimeout(() => {
        revealEls.forEach(el => {
            if (el.getBoundingClientRect().top < window.innerHeight) {
                el.classList.add('active');
            }
        });
    }, 80);

    // ─── 8. Animated Stats Counter ────────────────────────────────────────────
    const statNumbers = document.querySelectorAll('.stat-number');
    let statsRan = false;

    const statsObserver = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting || statsRan) return;
        statsRan = true;

        statNumbers.forEach(el => {
            const target   = parseFloat(el.dataset.target);
            const isFloat  = target % 1 !== 0;
            const duration = 1800;
            const step     = target / (duration / 16);
            let current    = 0;

            const tick = () => {
                current += step;
                if (current < target) {
                    el.textContent = isFloat ? current.toFixed(1) : Math.ceil(current).toLocaleString();
                    requestAnimationFrame(tick);
                } else {
                    el.textContent = isFloat ? target.toFixed(1) : target.toLocaleString() + '+';
                }
            };
            tick();
        });
    }, { threshold: 0.4 });

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) statsObserver.observe(statsSection);

    // ─── 9. Copy-to-clipboard on Code Blocks ──────────────────────────────────
    document.querySelectorAll('.code-block').forEach(block => {
        const header = block.querySelector('.code-header');
        if (!header) return;

        const btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.innerHTML = '<i class="fa-regular fa-copy"></i>';
        btn.title = 'Copy to clipboard';
        header.appendChild(btn);

        btn.addEventListener('click', () => {
            const code = block.querySelector('code');
            if (!code) return;
            navigator.clipboard.writeText(code.innerText).then(() => {
                btn.innerHTML = '<i class="fa-solid fa-check"></i>';
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.innerHTML = '<i class="fa-regular fa-copy"></i>';
                    btn.classList.remove('copied');
                }, 1800);
            }).catch(() => {});
        });
    });

});
