/* =========================================================================
   ZENITH Corporate Site v2 — main.js
   Shared interactions: navbar, drawer, reveal, accordion, ripple,
   back-to-top, hero slider, smooth scroll, reduced-motion respect.
   ========================================================================= */
(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -----------------------------------------------------------------------
     Utility: qs helpers
     ----------------------------------------------------------------------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* -----------------------------------------------------------------------
     1. Navbar shrink on scroll + back-to-top
     ----------------------------------------------------------------------- */
  const navbar = $('.navbar');
  const backToTop = $('.back-to-top');

  const onScroll = () => {
    const y = window.scrollY || window.pageYOffset;
    if (navbar) navbar.classList.toggle('navbar--scrolled', y > 80);
    if (backToTop) backToTop.classList.toggle('is-visible', y > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  }

  /* -----------------------------------------------------------------------
     2. Hamburger / drawer
     ----------------------------------------------------------------------- */
  const hamburger = $('.hamburger');
  const drawer = $('.drawer');
  const drawerBackdrop = $('.drawer-backdrop');
  const drawerClose = $('.drawer__close');
  const drawerLinks = $$('.drawer__link');

  const openDrawer = () => {
    if (!drawer) return;
    drawer.classList.add('is-open');
    drawerBackdrop?.classList.add('is-open');
    hamburger?.classList.add('is-open');
    hamburger?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };
  const closeDrawer = () => {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawerBackdrop?.classList.remove('is-open');
    hamburger?.classList.remove('is-open');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  hamburger?.addEventListener('click', () => {
    if (drawer?.classList.contains('is-open')) closeDrawer();
    else openDrawer();
  });
  drawerBackdrop?.addEventListener('click', closeDrawer);
  drawerClose?.addEventListener('click', closeDrawer);
  drawerLinks.forEach(l => l.addEventListener('click', closeDrawer));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer?.classList.contains('is-open')) closeDrawer();
  });

  /* -----------------------------------------------------------------------
     3. Smooth scroll for in-page anchors
     ----------------------------------------------------------------------- */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;
      const tgt = document.querySelector(href);
      if (!tgt) return;
      e.preventDefault();
      tgt.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    });
  });

  /* -----------------------------------------------------------------------
     4. IntersectionObserver reveal
     ----------------------------------------------------------------------- */
  const reveals = $$('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(r => io.observe(r));
  } else {
    reveals.forEach(r => r.classList.add('is-visible'));
  }

  /* -----------------------------------------------------------------------
     5. Accordion (FAQ)
     ----------------------------------------------------------------------- */
  $$('.accordion__item').forEach(item => {
    const head = $('.accordion__head', item);
    const body = $('.accordion__body', item);
    if (!head || !body) return;
    head.addEventListener('click', () => {
      const open = item.classList.toggle('is-open');
      if (open) {
        body.style.maxHeight = body.scrollHeight + 'px';
        head.setAttribute('aria-expanded', 'true');
      } else {
        body.style.maxHeight = '0px';
        head.setAttribute('aria-expanded', 'false');
      }
    });
    // recompute on resize (handles text reflow)
    window.addEventListener('resize', () => {
      if (item.classList.contains('is-open')) body.style.maxHeight = body.scrollHeight + 'px';
    });
  });

  /* -----------------------------------------------------------------------
     6. Button ripple (subtle)
     ----------------------------------------------------------------------- */
  $$('.btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (prefersReduced) return;
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  /* -----------------------------------------------------------------------
     7. Hero slider (fade-style, auto-rotate, if >1 slide)
     ----------------------------------------------------------------------- */
  const slider = $('.hero__slider');
  if (slider) {
    const slides = $$('.hero__slide', slider);
    if (slides.length > 1) {
      let idx = 0;
      slides.forEach((s, i) => s.classList.toggle('is-active', i === 0));
      const rotate = () => {
        slides[idx].classList.remove('is-active');
        idx = (idx + 1) % slides.length;
        slides[idx].classList.add('is-active');
      };
      if (!prefersReduced) {
        setInterval(rotate, 6000);
      }
    }
  }

  /* -----------------------------------------------------------------------
     8. Active nav link highlight based on current path
     ----------------------------------------------------------------------- */
  const path = location.pathname.split('/').pop() || 'index.html';
  $$('.navbar__link, .drawer__link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const last = href.split('/').pop();
    if (last && last === path) link.classList.add('is-active');
  });

  /* -----------------------------------------------------------------------
     9. Year placeholder
     ----------------------------------------------------------------------- */
  const y = $('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
