/**
 * Zenition — main.js
 * Native JavaScript: No frameworks, no dependencies.
 * Covers: sticky nav, scroll reveal, count-up, filter tabs, newsletter, active links.
 */

'use strict';

/* ─────────────────────────────────────────────
   1. STICKY NAVIGATION
───────────────────────────────────────────── */
(function initNav() {
    const nav = document.getElementById('navbar');
    if (!nav) return;

    let lastY = 0;

    function onScroll() {
        const y = window.scrollY;
        if (y > 60) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        lastY = y;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run on load
})();


/* ─────────────────────────────────────────────
   2. SCROLL REVEAL (Intersection Observer)
───────────────────────────────────────────── */
(function initReveal() {
    if (!('IntersectionObserver' in window)) {
        // Fallback: make everything visible immediately
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // fire once
                }
            });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();


/* ─────────────────────────────────────────────
   3. COUNT-UP ANIMATION (About Stats)
───────────────────────────────────────────── */
(function initCountUp() {
    const statEls = document.querySelectorAll('.stat-num[data-count]');
    if (!statEls.length) return;

    function animateCount(el) {
        const target = parseInt(el.dataset.count, 10);
        const duration = 1600; // ms
        const start = performance.now();

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target).toLocaleString('id-ID');
            if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
    }

    if (!('IntersectionObserver' in window)) {
        statEls.forEach(el => animateCount(el));
        return;
    }

    const counterObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );

    statEls.forEach(el => counterObserver.observe(el));
})();


/* ─────────────────────────────────────────────
   4. PRODUCT FILTER TABS
───────────────────────────────────────────── */
(function initFilter() {
    const tabs = document.querySelectorAll('.filter-tab');
    const cards = document.querySelectorAll('.product-card');
    if (!tabs.length || !cards.length) return;

    function setFilter(filter) {
        // Update tab states
        tabs.forEach(tab => {
            const isActive = tab.dataset.filter === filter;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', String(isActive));
        });

        // Show/hide cards
        cards.forEach(card => {
            const category = card.dataset.category;
            const show = filter === 'all' || category === filter;
            card.classList.toggle('hidden', !show);

            // Re-trigger reveal on newly visible cards
            if (show && !card.classList.contains('visible')) {
                requestAnimationFrame(() => card.classList.add('visible'));
            }
        });
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => setFilter(tab.dataset.filter));
        tab.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setFilter(tab.dataset.filter);
            }
        });
    });
})();


/* ─────────────────────────────────────────────
   5. ACTIVE NAV LINK (Scroll Spy)
───────────────────────────────────────────── */
(function initScrollSpy() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = ['home', 'collection', 'about', 'location']
        .map(id => document.getElementById(id))
        .filter(Boolean);

    if (!navLinks.length || !sections.length) return;

    function setActive(id) {
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const isActive = href === `#${id}`;
            link.classList.toggle('active', isActive);
            link.setAttribute('aria-current', isActive ? 'page' : 'false');
        });
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) setActive(entry.target.id);
            });
        },
        { threshold: 0.35, rootMargin: `-${getComputedStyle(document.documentElement).getPropertyValue('--nav-h')} 0px 0px 0px` }
    );

    sections.forEach(s => observer.observe(s));
})();


/* ─────────────────────────────────────────────
   6. NEWSLETTER FORM
───────────────────────────────────────────── */
function handleNewsletter(e) {
    e.preventDefault();
    const form = e.target;
    const input = form.querySelector('input[type="email"]');
    const msg = document.getElementById('newsletter-msg');
    if (!input || !msg) return;

    const email = input.value.trim();

    // Basic client-side validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msg.textContent = 'Masukkan email yang valid.';
        msg.className = 'newsletter-msg error';
        return;
    }

    // Simulate API call (replace with real endpoint)
    msg.textContent = '';
    msg.className = 'newsletter-msg';

    setTimeout(() => {
        msg.textContent = '✓ Berhasil! Cek inbox kamu untuk konfirmasi.';
        msg.className = 'newsletter-msg success';
        input.value = '';
    }, 600);
}


/* ─────────────────────────────────────────────
   7. EXTERNAL LINK TOOLTIP (UX)
   Shows accessible title on external links
───────────────────────────────────────────── */
(function initExternalLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach(link => {
        if (!link.hasAttribute('title')) {
            const text = link.textContent.trim();
            if (text) link.setAttribute('title', `${text} (membuka tab baru)`);
        }
    });
})();


/* ─────────────────────────────────────────────
   8. SMOOTH SCROLL (for older browsers)
───────────────────────────────────────────── */
(function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href').slice(1);
            const target = document.getElementById(targetId);
            if (!target) return;

            e.preventDefault();
            const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 76;
            const top = target.getBoundingClientRect().top + window.scrollY - navH;

            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
})();


/* ─────────────────────────────────────────────
   9. KEYBOARD FOCUS FIX (accessibility)
   Remove :focus outline for mouse, keep for keyboard
───────────────────────────────────────────── */
(function initFocusMode() {
    let isKeyboard = false;

    document.addEventListener('keydown', () => { isKeyboard = true; });
    document.addEventListener('mousedown', () => { isKeyboard = false; });

    document.addEventListener('focusin', e => {
        if (!isKeyboard) e.target.setAttribute('data-mouse-focus', 'true');
    });
    document.addEventListener('focusout', e => {
        e.target.removeAttribute('data-mouse-focus');
    });
})();


/* ─────────────────────────────────────────────
   10. PERFORMANCE: Lazy-init category cards hover
    (defer until first scroll)
───────────────────────────────────────────── */
(function initCategoryHover() {
    const catCards = document.querySelectorAll('.cat-card');
    catCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.setAttribute('tabindex', '0');
        });
    });
})();