(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  const preloader = $('#preloader');
  const finishLoading = () => {
    preloader?.classList.add('is-done');
    document.body.classList.add('is-loaded');
    kickReveals();
  };

  window.addEventListener('load', () => {
    setTimeout(finishLoading, 700);
  });
  setTimeout(finishLoading, 2400);

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const nav = $('#nav');
  const progress = $('#scrollProgress');
  const navLinks = $$('.nav__links a');
  const sections = navLinks
    .map((a) => ({ link: a, target: $(a.getAttribute('href')) }))
    .filter((item) => item.target);

  const onScroll = () => {
    const y = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = `${Math.min(1, y / Math.max(1, docH)) * 100}%`;
    if (nav) nav.classList.toggle('is-scrolled', y > 30);

    const mid = y + window.innerHeight * 0.35;
    let activeIdx = 0;
    sections.forEach(({ target }, i) => {
      if (target.offsetTop <= mid) activeIdx = i;
    });
    sections.forEach(({ link }, i) => {
      link.classList.toggle('is-active', i === activeIdx);
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = $('#burger');
  const navLinksWrap = $('#navLinks');
  if (burger && navLinksWrap) {
    const toggleNav = (force) => {
      const open = force !== undefined ? force : !navLinksWrap.classList.contains('is-open');
      navLinksWrap.classList.toggle('is-open', open);
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    };

    burger.addEventListener('click', () => toggleNav());
    navLinksWrap.addEventListener('click', (e) => {
      if (e.target.closest('a')) toggleNav(false);
    });
  }

  const revealEls = $$('.reveal, .reveal-line');
  let revealObs;
  function kickReveals() {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('is-in'));
      return;
    }
    if (revealObs) return;

    revealObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach((el) => revealObs.observe(el));
  }

  const levels = $$('.skill-card__level');
  if ('IntersectionObserver' in window) {
    const levelObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.style.setProperty('--lvl', `${entry.target.getAttribute('data-level') || '0'}%`);
        levelObs.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    levels.forEach((el) => levelObs.observe(el));
  } else {
    levels.forEach((el) => el.style.setProperty('--lvl', `${el.getAttribute('data-level') || '0'}%`));
  }

  const counters = $$('.about__stat-num');
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count || '0', 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();

    const tick = (now) => {
      const progressNow = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progressNow, 3);
      el.textContent = `${Math.round(target * eased)}${suffix}`;
      if (progressNow < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window) {
    const countObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        countObs.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => countObs.observe(el));
  } else {
    counters.forEach(animateCount);
  }

  if (!isTouch && !prefersReducedMotion) {
    $$('[data-tilt]').forEach((el) => {
      let raf = 0;
      const onMove = (e) => {
        const r = el.getBoundingClientRect();
        const cx = (e.clientX - r.left) / r.width;
        const cy = (e.clientY - r.top) / r.height;
        const rx = (cy - 0.5) * -8;
        const ry = (cx - 0.5) * 8;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
          el.style.setProperty('--mx', `${cx * 100}%`);
          el.style.setProperty('--my', `${cy * 100}%`);
        });
      };
      const onLeave = () => {
        if (raf) cancelAnimationFrame(raf);
        el.style.transform = '';
      };
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
    });
  }

  if (!isTouch && !prefersReducedMotion) {
    $$('.magnetic').forEach((el) => {
      const strength = 0.35;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  if (!prefersReducedMotion) {
    const orbs = $$('.bg-orb');
    window.addEventListener('mousemove', (e) => {
      const mx = e.clientX / window.innerWidth - 0.5;
      const my = e.clientY / window.innerHeight - 0.5;
      orbs.forEach((orb, i) => {
        const movement = (i + 1) * 14;
        orb.style.transform = `translate(${mx * movement}px, ${my * movement}px)`;
      });
    });
  }

  const form = $('#contactForm');
  const note = $('#formNote');
  if (form) {
    $$('.field input, .field textarea', form).forEach((input) => {
      const setFilled = () => {
        input.closest('.field').classList.toggle('is-filled', input.value.trim() !== '');
      };
      input.addEventListener('input', setFilled);
      input.addEventListener('change', setFilled);
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#cf-name').value.trim();
      const email = $('#cf-email').value.trim();
      const message = $('#cf-message').value.trim();

      if (!name || !email || !message) {
        if (note) {
          note.textContent = 'Please fill in name, email, and message.';
          note.style.color = '#f59e0b';
        }
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (note) {
          note.textContent = 'That email does not look quite right.';
          note.style.color = '#f59e0b';
        }
        return;
      }

      if (note) {
        note.textContent = 'Message captured. Wire this form up later and it is ready to go.';
        note.style.color = '';
      }
      form.reset();
      $$('.field', form).forEach((field) => field.classList.remove('is-filled'));
    });
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.length < 2) return;
    const target = $(href);
    if (!target) return;
    e.preventDefault();
    const y = target.getBoundingClientRect().top + window.scrollY - 24;
    window.scrollTo({ top: y, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  setTimeout(kickReveals, 100);

  (async () => {
    const canvas = $('#globeCanvas');
    if (!canvas) return;

    try {
      const mod = await import('https://cdn.jsdelivr.net/npm/cobe@0.6.3/+esm');
      const createGlobe = mod.default || mod;

      let globe;
      let phi = 4.22;
      let phiOffset = 0;
      let thetaOffset = 0;
      let dragPhi = 0;
      let dragTheta = 0;
      let pointer = null;
      let resizeTimer = 0;
      const baseTheta = -0.42;

      const handlePointerMove = (e) => {
        if (!pointer) return;
        dragPhi = (e.clientX - pointer.x) / 320;
        dragTheta = (e.clientY - pointer.y) / 1100;
      };

      const handlePointerUp = () => {
        if (pointer) {
          phiOffset += dragPhi;
          thetaOffset += dragTheta;
          dragPhi = 0;
          dragTheta = 0;
        }
        pointer = null;
        canvas.style.cursor = 'grab';
      };

      const mountGlobe = () => {
        const width = canvas.getBoundingClientRect().width;
        if (!width) return;

        if (globe) globe.destroy();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const size = width * dpr;
        canvas.width = size;
        canvas.height = size;

        globe = createGlobe(canvas, {
          devicePixelRatio: dpr,
          width: size,
          height: size,
          phi,
          theta: baseTheta,
          dark: 1,
          diffuse: 1.45,
          mapSamples: 18000,
          mapBrightness: 8,
          baseColor: [0.8, 0.72, 0.5],
          markerColor: [212 / 255, 175 / 255, 55 / 255],
          glowColor: [0.18, 0.15, 0.1],
          markers: [{ location: [-26.0936, 27.9910], size: 0.13 }],
          onRender: (state) => {
            if (!pointer && !prefersReducedMotion) phi += 0.003;
            state.phi = phi + phiOffset + dragPhi;
            state.theta = Math.max(-0.45, Math.min(0.45, baseTheta + thetaOffset + dragTheta));
          }
        });

        requestAnimationFrame(() => canvas.classList.add('is-ready'));
      };

      canvas.addEventListener('pointerdown', (e) => {
        pointer = { x: e.clientX, y: e.clientY };
        canvas.style.cursor = 'grabbing';
      });
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      window.addEventListener('pointerup', handlePointerUp, { passive: true });

      const ro = new ResizeObserver(() => {
        clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(mountGlobe, 120);
      });
      ro.observe(canvas);

      mountGlobe();
    } catch (error) {
      console.warn('Globe failed to load', error);
      const section = canvas.closest('.location');
      if (section) section.style.display = 'none';
    }
  })();
})();