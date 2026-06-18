/* =======================================================
   PEARL DESIGN STUDIO — Main Script
   ======================================================= */

// ────────────────────────────────────────────────────────
// PAGE LOADER
// ────────────────────────────────────────────────────────
(function initLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('done'), 550);
  });
})();

// ────────────────────────────────────────────────────────
// CUSTOM CURSOR  (desktop only)
// ────────────────────────────────────────────────────────
(function initCursor() {
  const dot  = document.querySelector('.cur-dot');
  const ring = document.querySelector('.cur-ring');
  if (!dot || !ring || window.matchMedia('(hover:none)').matches) return;

  let mx = 0, my = 0, rx = 0, ry = 0;
  window.addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  (function raf() {
    rx += (mx - rx) * 0.09;
    ry += (my - ry) * 0.09;
    dot.style.transform  = `translate3d(calc(${mx}px - 50%), calc(${my}px - 50%), 0)`;
    ring.style.transform = `translate3d(calc(${rx}px - 50%), calc(${ry}px - 50%), 0)`;
    requestAnimationFrame(raf);
  })();

  document.querySelectorAll('a, button, [data-mag]').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('big'));
    el.addEventListener('mouseleave', () => ring.classList.remove('big'));
  });
})();

// ────────────────────────────────────────────────────────
// STICKY HEADER
// ────────────────────────────────────────────────────────
(function initHeader() {
  const hdr = document.querySelector('.site-header');
  if (!hdr) return;
  const hasHero = !!document.querySelector('.hero');

  const update = () => {
    if (window.scrollY > 24) {
      hdr.classList.add('solid');
      hdr.classList.remove('over');
    } else {
      hdr.classList.remove('solid');
      if (hasHero) hdr.classList.add('over');
    }
  };

  if (hasHero) hdr.classList.add('over');
  update();
  window.addEventListener('scroll', update, { passive: true });

  // Active link
  const page = document.body.dataset.page;
  if (page) {
    document.querySelectorAll('.hdr-nav a, .mobile-nav a').forEach(a => {
      if (a.dataset.page === page) a.classList.add('active');
    });
  }
})();

// ────────────────────────────────────────────────────────
// MOBILE NAV
// ────────────────────────────────────────────────────────
(function initMobileNav() {
  const toggle = document.querySelector('.hdr-toggle');
  const nav    = document.querySelector('.mobile-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
})();

// ────────────────────────────────────────────────────────
// HERO CAROUSEL
// ────────────────────────────────────────────────────────
(function initHero() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const slides   = [...hero.querySelectorAll('.hero-slide')];
  const dots     = [...hero.querySelectorAll('.hero-dot')];
  const prevBtn  = hero.querySelector('[data-hero-prev]');
  const nextBtn  = hero.querySelector('[data-hero-next]');
  const progBar  = hero.querySelector('.hero-prog-bar');
  const curEl    = hero.querySelector('.hero-cur');
  const DURATION = 5800; // ms per slide

  let cur = 0, timer = null, progStart = null, progFrame = null;

  const go = (idx) => {
    slides[cur].classList.remove('on');
    dots[cur]?.classList.remove('on');
    cur = ((idx % slides.length) + slides.length) % slides.length;
    slides[cur].classList.add('on');
    dots[cur]?.classList.add('on');
    if (curEl) curEl.textContent = String(cur + 1).padStart(2, '0');
    startProg();
  };

  // Progress bar animation
  const startProg = () => {
    cancelAnimationFrame(progFrame);
    if (!progBar) return;
    progBar.style.transition = 'none';
    progBar.style.width = '0%';
    const t0 = performance.now();
    const tick = (t) => {
      const pct = Math.min(((t - t0) / DURATION) * 100, 100);
      progBar.style.width = pct + '%';
      if (pct < 100) progFrame = requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const play  = () => { clearInterval(timer); timer = setInterval(() => go(cur + 1), DURATION); };
  const pause = () => { clearInterval(timer); cancelAnimationFrame(progFrame); };

  // Init
  go(0);
  play();

  prevBtn?.addEventListener('click', () => { go(cur - 1); play(); });
  nextBtn?.addEventListener('click', () => { go(cur + 1); play(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { go(i); play(); }));

  // Touch swipe
  let ts = 0;
  hero.addEventListener('touchstart', e => { ts = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', e => {
    const diff = ts - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 55) { go(diff > 0 ? cur + 1 : cur - 1); play(); }
  });

  hero.addEventListener('mouseenter', pause);
  hero.addEventListener('mouseleave', play);
})();

// ────────────────────────────────────────────────────────
// ACCORDION
// ────────────────────────────────────────────────────────
(function initAccordion() {
  document.querySelectorAll('.acc-head').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.acc-item');
      const body   = item.querySelector('.acc-body');
      const isOpen = item.classList.contains('open');

      // Close all siblings
      btn.closest('.accordion')?.querySelectorAll('.acc-item').forEach(i => {
        i.classList.remove('open');
        const b = i.querySelector('.acc-body');
        if (b) b.style.maxHeight = '0';
        i.querySelector('.acc-head')?.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        if (body) body.style.maxHeight = body.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Open first item by default
  document.querySelectorAll('.accordion').forEach(acc => {
    const first = acc.querySelector('.acc-item');
    if (!first) return;
    const body = first.querySelector('.acc-body');
    first.classList.add('open');
    if (body) body.style.maxHeight = body.scrollHeight + 'px';
    first.querySelector('.acc-head')?.setAttribute('aria-expanded', 'true');
  });
})();

// ────────────────────────────────────────────────────────
// PROJECT FILTER TABS
// ────────────────────────────────────────────────────────
(function initFilters() {
  const tabs  = document.querySelectorAll('[data-filter]');
  const cards = document.querySelectorAll('[data-cat]');
  if (!tabs.length || !cards.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('on'));
      tab.classList.add('on');

      const f = tab.dataset.filter;
      cards.forEach(card => {
        const cats = card.dataset.cat.split(' ');
        const show = f === 'all' || cats.includes(f);
        card.style.display = show ? '' : 'none';
      });
    });
  });
})();

// ────────────────────────────────────────────────────────
// MEDIA DRAGGABLE CAROUSEL
// ────────────────────────────────────────────────────────
(function initMedia() {
  document.querySelectorAll('[data-media]').forEach(wrap => {
    const track = wrap.querySelector('.media-track');
    const prev  = wrap.querySelector('[data-mprev]');
    const next  = wrap.querySelector('[data-mnext]');
    const bar   = wrap.querySelector('.media-bar');
    if (!track) return;

    let curX = 0, startX = 0, prevX = 0, dragging = false, dragD = 0;
    const getX = e => e.type.startsWith('mouse') ? e.clientX : e.touches[0].clientX;
    const minX = () => Math.min(0, wrap.offsetWidth - track.scrollWidth);
    const clamp = x => Math.max(minX(), Math.min(0, x));

    const setX = (x, anim = false) => {
      curX = clamp(x);
      track.style.transition = anim ? 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none';
      track.style.transform = `translate3d(${curX}px, 0, 0)`;
      if (bar) {
        const min = minX();
        bar.style.width = min === 0 ? '100%' : Math.abs(curX / min * 100) + '%';
      }
    };

    wrap.addEventListener('mousedown',  e => { dragging = true; startX = getX(e); prevX = curX; dragD = 0; });
    window.addEventListener('mousemove', e => { if (!dragging) return; dragD = getX(e) - startX; setX(prevX + dragD); });
    window.addEventListener('mouseup',   () => {
      if (!dragging) return; dragging = false;
      setX(clamp(curX), true);
    });

    wrap.addEventListener('touchstart', e => { startX = getX(e); prevX = curX; dragD = 0; }, { passive: true });
    wrap.addEventListener('touchmove',  e => { dragD = getX(e) - startX; setX(prevX + dragD); }, { passive: true });
    wrap.addEventListener('touchend',   () => setX(clamp(curX), true));

    // Block click after drag
    wrap.addEventListener('click', e => { if (Math.abs(dragD) > 8) { e.preventDefault(); e.stopPropagation(); } }, true);

    const slide = dir => {
      const w = (wrap.querySelector('.media-slide')?.offsetWidth || 300) + 16;
      setX(curX + (w * dir), true);
    };
    prev?.addEventListener('click', () => slide(1));
    next?.addEventListener('click', () => slide(-1));
  });
})();

// ────────────────────────────────────────────────────────
// VIDEO HOVER AUTOPLAY
// ────────────────────────────────────────────────────────
(function initVideoHover() {
  document.querySelectorAll('.media-card video').forEach(vid => {
    vid.muted = true; vid.loop = true; vid.playsInline = true;
    const card = vid.closest('.media-card');
    card?.addEventListener('mouseenter', () => vid.play().catch(() => {}));
    card?.addEventListener('mouseleave', () => vid.pause());
  });
})();

// ────────────────────────────────────────────────────────
// VIDEO LIGHTBOX
// ────────────────────────────────────────────────────────
(function initLightbox() {
  const lb    = document.getElementById('lightbox');
  if (!lb) return;
  const vid   = lb.querySelector('video');
  const close = lb.querySelector('.lb-close');
  const title = lb.querySelector('.lb-title');
  const cta   = lb.querySelector('[data-lb-cta]');

  const open = (src, t, desc) => {
    if (vid) { vid.src = src; vid.play().catch(() => {}); }
    if (title) title.textContent = t;
    if (cta)   cta.href = `https://wa.me/923348148016?text=${encodeURIComponent('Hello Pearl Design Studio, I want to discuss the project: ' + t)}`;
    lb.classList.add('on');
    document.body.style.overflow = 'hidden';
  };
  const closeLb = () => {
    lb.classList.remove('on');
    document.body.style.overflow = '';
    if (vid) { vid.pause(); vid.src = ''; }
  };

  document.querySelectorAll('[data-vsrc]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      open(el.dataset.vsrc, el.dataset.vtitle || '', el.dataset.vdesc || '');
    });
  });

  close?.addEventListener('click', closeLb);
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  window.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
})();

// ────────────────────────────────────────────────────────
// COUNTER ANIMATION
// ────────────────────────────────────────────────────────
(function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const end = parseInt(el.dataset.count, 10);
      const dur = 1500;
      const t0  = performance.now();
      const tick = (t) => {
        const progress = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(end * eased);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = end;
      };
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('[data-count]').forEach(el => obs.observe(el));
})();

// ────────────────────────────────────────────────────────
// SCROLL REVEAL
// ────────────────────────────────────────────────────────
(function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.style.transitionDelay = el.dataset.delay || '0ms';
      el.classList.add('visible');
      obs.unobserve(el);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach((el, i) => {
    if (!el.dataset.delay) el.dataset.delay = `${(i % 4) * 90}ms`;
    obs.observe(el);
  });
})();

// ────────────────────────────────────────────────────────
// MAGNETIC HOVER EFFECT
// ────────────────────────────────────────────────────────
(function initMagnetic() {
  document.querySelectorAll('[data-mag]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) - r.width  / 2) * 0.28;
      const y = ((e.clientY - r.top)  - r.height / 2) * 0.28;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
})();

// ────────────────────────────────────────────────────────
// CONTACT FORM → WHATSAPP
// ────────────────────────────────────────────────────────
(function initContact() {
  document.querySelectorAll('[data-wa-form]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const d = new FormData(form);
      const lines = [
        'Hello Pearl Design Studio, I want to discuss a project.',
        `Name: ${d.get('name') || ''}`,
        `Phone: ${d.get('phone') || ''}`,
        `Service: ${d.get('service') || ''}`,
        `Message: ${d.get('message') || 'Will share details on WhatsApp.'}`,
      ];
      window.open(
        `https://wa.me/923348148016?text=${encodeURIComponent(lines.join('\n'))}`,
        '_blank', 'noopener'
      );
    });
  });
})();
