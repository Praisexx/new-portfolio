/* Chukwudi Praise — portfolio behaviour.
   Progressive enhancement only: every section is fully readable without this file.
   Positional work is done with IntersectionObserver; the single scroll listener is
   passive and rAF-throttled. */
(function () {
  'use strict';

  /* Guarded: nothing below should die if a browser lacks matchMedia. */
  var DESKTOP = typeof window.matchMedia === 'function'
    ? window.matchMedia('(min-width: 861px)')
    : null;

  /* ---------------------------------------------------------------
     1. Mobile navigation
     --------------------------------------------------------------- */
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('site-nav');

  function setNav(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.setAttribute('data-open', String(open));
  }

  function navIsOpen() {
    return toggle && toggle.getAttribute('aria-expanded') === 'true';
  }

  if (toggle && nav) {
    setNav(false);

    toggle.addEventListener('click', function () {
      setNav(!navIsOpen());
    });

    /* Close after choosing a destination. */
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });

    /* Escape closes and returns focus to the control. */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navIsOpen()) {
        setNav(false);
        toggle.focus();
      }
    });

    /* Clicking outside the header closes it. */
    document.addEventListener('click', function (e) {
      if (navIsOpen() && !e.target.closest('.site-header')) setNav(false);
    });

    /* Never leave a mobile panel open when we grow into the desktop layout. */
    if (DESKTOP) {
      var onBreakpoint = function (e) { if (e.matches) setNav(false); };
      if (DESKTOP.addEventListener) DESKTOP.addEventListener('change', onBreakpoint);
      else if (DESKTOP.addListener) DESKTOP.addListener(onBreakpoint);
    }
  }

  if (!('IntersectionObserver' in window)) return;

  /* ---------------------------------------------------------------
     2. Header border once the page has scrolled off the top
     --------------------------------------------------------------- */
  var header = document.getElementById('site-header');
  if (header) {
    var sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none';
    document.body.prepend(sentinel);

    new IntersectionObserver(function (entries) {
      header.setAttribute('data-stuck', String(!entries[0].isIntersecting));
    }).observe(sentinel);
  }

  /* ---------------------------------------------------------------
     3. Scroll spy — marks the current section in the nav
     --------------------------------------------------------------- */
  var links = Array.prototype.slice.call(
    document.querySelectorAll('.nav-list a[href^="#"]')
  );
  var sections = links
    .map(function (a) { return document.getElementById(a.hash.slice(1)); })
    .filter(Boolean);

  if (sections.length) {
    var visible = Object.create(null);

    var setCurrent = function (id) {
      links.forEach(function (a) {
        if (a.hash.slice(1) === id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    };

    var sync = function () {
      var root = document.documentElement;
      /* Bottom of a scrollable document: the last section wins even if it is
         too short to reach the active band. Guarded on the page actually being
         scrollable, so a short viewport does not pin the nav to the last link. */
      var scrollable = root.scrollHeight > root.clientHeight + 4;
      var atBottom = window.scrollY + root.clientHeight >= root.scrollHeight - 2;
      if (scrollable && atBottom) {
        setCurrent(sections[sections.length - 1].id);
        return;
      }
      /* Otherwise the last section in document order touching the top band. */
      for (var i = sections.length - 1; i >= 0; i--) {
        if (visible[sections[i].id]) {
          setCurrent(sections[i].id);
          return;
        }
      }
    };

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible[entry.target.id] = entry.isIntersecting;
      });
      sync();
    }, {
      /* Active band sits just below the sticky header. */
      rootMargin: '-72px 0px -65% 0px',
      threshold: 0
    });

    sections.forEach(function (s) { spy.observe(s); });

    /* The bottom-of-page case needs a scroll signal the observer cannot give us. */
    var queued = false;
    window.addEventListener('scroll', function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; sync(); });
    }, { passive: true });
  }

  /* ---------------------------------------------------------------
     4. Reveal on scroll — motion-safe, one-shot
     --------------------------------------------------------------- */
  window.__revealReady = true;   /* tells the head failsafe we are alive */

  var targets = document.querySelectorAll('.reveal');
  if (targets.length) {
    var reveal = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    Array.prototype.forEach.call(targets, function (el) { reveal.observe(el); });
  }
})();
