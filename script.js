/* =========================================================
   script.js — explainer scroll, hero parallax, hover videos
   ========================================================= */
(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Explainer: auto <span> + smooth reveal ---------- */
  const explainerEl = document.getElementById('explainer');
  if (explainerEl) {
    const txt = explainerEl.textContent.trim().replace(/\s+/g, ' ');
    explainerEl.innerHTML = txt.split(' ').map(w => `<span class="word">${w}</span>`).join(' ');

    if (window.gsap && window.ScrollTrigger && !prefersReduced) {
      gsap.registerPlugin(ScrollTrigger);
      gsap.set('.explainer .word', {
        color: '#cfcfcf',
        y: '0.5em',
        opacity: 0.35,
        filter: 'blur(0.6px)',
        scale: 0.96
      });
      gsap.to('.explainer .word', {
        color: '#1d1d1d',
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        scale: 1,
        stagger: {
          each: 0.035,
          from: "start"
        },
        ease: "expo.out",
        duration: 1.2,
        scrollTrigger: {
          trigger: explainerEl,
          start: 'top 80%',
          toggleActions: "play none none reverse", // animate in/out on scroll
          once: false
        }
      });
    } else {
      explainerEl.querySelectorAll('.word').forEach(w => w.style.color = '#1d1d1d');
    }
  }

  /* ---------- Hero blobs: parallax on wrapper (much more noticeable + animated in) ---------- */
  const blobsWrap = document.querySelector('.blobs');
  if (blobsWrap && !prefersReduced) {
    // Animate blobs in on load
    gsap.set('.blob', { scale: 0.7, opacity: 0, y: 60 });
    gsap.to('.blob', {
      scale: 1,
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: "expo.out",
      stagger: 0.08,
      delay: 0.1
    });

    // Stronger, snappier parallax
    let tx = 0,
      ty = 0,
      targetX = 0,
      targetY = 0;
    const damp = 0.18,         // less damping for snappier motion
      strength = 120;      // much stronger for more visible movement

    function loop() {
      tx += (targetX - tx) * damp;
      ty += (targetY - ty) * damp;
      blobsWrap.style.transform = `translate(${tx}px,${ty}px)`;
      requestAnimationFrame(loop);
    }
    window.addEventListener('mousemove', e => {
      const nx = e.clientX / innerWidth - 0.5,
        ny = e.clientY / innerHeight - 0.5;
      targetX = nx * strength;
      targetY = ny * strength;
    }, {
      passive: true
    });
    loop();

    // Subtle floating for each blob (always moving)
    document.querySelectorAll('.blob').forEach((blob, i) => {
      gsap.to(blob, {
        y: `+=${18 + i * 8}`,
        x: `+=${12 - i * 6}`,
        duration: 3.5 + i,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: i * 0.2
      });
    });
  }

  /* ---------- Projects: hover video (desktop) / tap to open (mobile) ---------- */
  (function setupHoverVideos() {
    // 'any-hover' catches hybrid/touch laptops better than 'hover'
    const canHover = window.matchMedia('(any-hover: hover)').matches;

    document.querySelectorAll('.video-preview').forEach(preview => {
      const thumb = document.getElementById(preview.dataset.thumb);
      const video = document.getElementById(preview.dataset.video);
      const link = preview.querySelector('a.thumb');
      if (!thumb || !video) return;

      // autoplay-friendly settings
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'metadata';

      // prewarm when near viewport
      const io = new IntersectionObserver(entries => {
        if (entries.some(en => en.isIntersecting)) {
          try {
            video.preload = 'auto';
          } catch (_) {}
          io.disconnect();
        }
      }, {
        rootMargin: '300px'
      });
      io.observe(preview);

      if (canHover && !prefersReduced) {
        // Only fade, don't pause/reset
        preview.addEventListener('mouseenter', () => {
          preview.classList.add('playing');
          video.play();
        });
        preview.addEventListener('mouseleave', () => {
          preview.classList.remove('playing');
          // Don't pause or reset video.currentTime!
        });
      } else {
        // mobile / no hover
        preview.addEventListener('click', () => {
          if (link && link.href) location.href = link.href;
        });
      }
    });
  })();

  // Page load: fade in hero, navbar, explainer, projects grid
  if (window.gsap && !prefersReduced) {
    gsap.set(".navbar, .hero, .explainer-wrap, .projects__grid", {
      opacity: 0,
      y: 40
    });
    window.addEventListener("DOMContentLoaded", () => {
      gsap.to(".navbar", {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "expo.out"
      });
      gsap.to(".hero", {
        opacity: 1,
        y: 0,
        duration: 0.9,
        delay: 0.1,
        ease: "expo.out"
      });
      gsap.to(".explainer-wrap", {
        opacity: 1,
        y: 0,
        duration: 0.9,
        delay: 0.25,
        ease: "expo.out"
      });
      gsap.to(".projects__grid", {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.45,
        ease: "expo.out"
      });
    });
  }

  if (window.gsap && document.body.classList.contains('case-page')) {
    gsap.set([
      ".navbar",
      ".case-hero",
      ".explainer-wrap",
      ".case-info",
      ".olc",
      ".enjoy-more",
      ".footer"
    ], { opacity: 0, y: 80 });

    window.addEventListener("DOMContentLoaded", () => {
      gsap.to(".navbar", { opacity: 1, y: 0, duration: 0.7, ease: "expo.out" });
      gsap.to(".case-hero", { opacity: 1, y: 0, duration: 0.9, delay: 0.1, ease: "expo.out" });
      gsap.to(".explainer-wrap", { opacity: 1, y: 0, duration: 0.9, delay: 0.2, ease: "expo.out" });
      gsap.to(".case-info", { opacity: 1, y: 0, duration: 0.9, delay: 0.3, ease: "expo.out" });
      gsap.to(".olc", { opacity: 1, y: 0, duration: 0.9, delay: 0.4, ease: "expo.out" });
      gsap.to(".enjoy-more", { opacity: 1, y: 0, duration: 0.9, delay: 0.5, ease: "expo.out" });
      gsap.to(".footer", { opacity: 1, y: 0, duration: 0.9, delay: 0.6, ease: "expo.out" });
    });
  }



  /* ----- Magnetic buttons with shine ----- */
  (() => {
    const btns = document.querySelectorAll('.btn');
    const strength = 18;
    btns.forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left,
          y = e.clientY - r.top;
        const dx = (x - r.width / 2) / (r.width / 2);
        const dy = (y - r.height / 2) / (r.height / 2);
        btn.style.transform = `translate(${dx*strength}px, ${dy*strength}px)`;
        btn.style.setProperty('--mx', `${x}px`);
        btn.style.setProperty('--my', `${y}px`);
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0,0)';
      });
    });
  })();

  /* ----- Subtle breathing on hero background ----- */
  (() => {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    let t = 0;

    function loop() {
      t += 0.003;
      hero.style.setProperty('filter', `saturate(${1.1+Math.sin(t)*.05})`);
      requestAnimationFrame(loop);
    }
    loop();
  })();

  window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 24) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // ----- Glass menu open/close -----
  (function () {
    const burger = document.querySelector('.burger');
    const panel = document.querySelector('.nav-links');
    const scrim = document.querySelector('.nav-overlay');
    const closeBtn = document.querySelector('.close-menu');

    if (!burger || !panel || !scrim) return;

    const open = () => {
      burger.classList.add('open');
      panel.classList.add('open');
      scrim.classList.add('show');
      document.body.classList.add('nav-open');
      burger.setAttribute('aria-expanded', 'true');
    };
    const close = () => {
      burger.classList.remove('open');
      panel.classList.remove('open');
      scrim.classList.remove('show');
      document.body.classList.remove('nav-open');
      burger.setAttribute('aria-expanded', 'false');
    };
    const toggle = () => (panel.classList.contains('open') ? close() : open());

    burger.addEventListener('click', toggle);
    scrim.addEventListener('click', close);
    panel.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    if (closeBtn) closeBtn.addEventListener('click', close);
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') close();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 800) close();
    });
  })();
})();

// ===== Projects header line: add .in-view when visible
(() => {
  const line = document.querySelector('.linebody.about-line');
  const projectsLine = document.querySelector('.newsection .linebody'); // generic
  const lines = [line, projectsLine].filter(Boolean);
  if (!('IntersectionObserver' in window) || lines.length === 0) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => en.isIntersecting && en.target.classList.add('in-view'));
  }, { threshold: 0.25 });
  lines.forEach(el => io.observe(el));
})();

gsap.registerPlugin(ScrollTrigger);

/* section divider line */
ScrollTrigger.create({
  trigger: ".js-line",
  start: "top 85%",
  once: true,
  onEnter: () => document.querySelectorAll(".js-line")
              .forEach(el => el.classList.add("is-inview"))
});

/* journey line + cards */
(() => {
  const wrap = document.querySelector(".journey");
  if (!wrap) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: wrap,
      start: "top 75%",
      once: true
    }
  });

  tl.to(".journey__line", { scaleX: 1, duration: 1.1, ease: "power3.out" })
    .from(".journey .node", {
      y: 24, opacity: 0, scale: 0.96, duration: .7, ease: "power3.out",
      stagger: 0.12, clearProps: "all"
    }, "-=0.4");

  // gentle floating for glass cards (iOS vibe)
  document.querySelectorAll(".journey .node").forEach((card, i) => {
    gsap.to(card, {
      y: "+=8",
      duration: 2 + Math.random(),
      repeat: -1, yoyo: true,
      ease: "sine.inOut",
      delay: i * 0.08
    });
  });

  // magnetic icon movement
  const rMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!rMotion) {
    document.querySelectorAll(".journey .node").forEach(card => {
      const icon = card.querySelector(".node__icon");
      card.addEventListener("mousemove", e => {
        const r = card.getBoundingClientRect();
        const mx = e.clientX - r.left, my = e.clientY - r.top;
        gsap.to(icon, {
          x: (mx - r.width/2) / 12,
          y: (my - r.height/2) / 12,
          duration: .25, ease: "power2.out"
        });
      });
      card.addEventListener("mouseleave", () =>
        gsap.to(icon, { x:0, y:0, duration:.35, ease:"power2.out" })
      );
    });
  }
})();



  // Animate "About" section line if using .js-tl-line
  const aboutLine = document.querySelector('.linebody.js-tl-line');
  if (aboutLine){
    gsap.fromTo(aboutLine, { '--w': '0%' }, {
      duration: 0.9,
      ease: 'power2.out',
      '--w': '100%',
      scrollTrigger: { trigger: aboutLine, start: 'top 85%', once: true },
      onUpdate(self){
        aboutLine.style.setProperty('--w', (self.progress*100|0) + '%');
      }
    });
    aboutLine.style.position = 'relative';
    aboutLine.style.overflow = 'hidden';
    const s = document.createElement('style');
    s.textContent = `.linebody.js-tl-line::after{content:"";position:absolute;inset:0 auto 0 0;width:var(--w,0%);background:#1d1d1d;border-radius:12px;}`;
    document.head.appendChild(s);
  };



  // ===== Animate section line when in view =====
  const line = document.querySelector('.js-animate-line');
  if (line) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          line.classList.add('in-view');
          io.unobserve(line);
        }
      });
    }, { threshold: .6 });
    io.observe(line);
  };

  /* ===== Expertise: reveal + stronger bg parallax (Matteo-style) ===== */
  (() => {
    const wrap = document.querySelector('.xp-grid');
    if (!wrap || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    const isiOS = /iP(hone|ad|od)/.test(navigator.userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    const PARALLAX_FRAC = isiOS ? 0.28 : 0.85;   // increase from 0.6 to 0.85
    const PARALLAX_MAX  = isiOS ? 90   : 420;    // increase from 320 to 420

    function build(){
      ScrollTrigger.getAll().forEach(t => t.trigger?.closest('.xp') && t.kill());

      document.querySelectorAll('.xp').forEach(card => {
        const img = card.querySelector('.xp__bg img');
        if (!img) return;

        const h = card.getBoundingClientRect().height || card.offsetHeight;
        const travel = Math.min(PARALLAX_MAX, h * PARALLAX_FRAC);

        gsap.fromTo(img, { y: -travel }, {
          y: travel, ease: "none", force3D: true,
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });
      });

      ScrollTrigger.refresh();
    }

    // reveal once
    gsap.set('.xp', { y: 40, opacity: 0 });
    gsap.to('.xp', {
      y: 0, opacity: 1, duration: 0.9, ease: "expo.out",
      stagger: 0.16,
      scrollTrigger: {
        trigger: '.xp-grid',
        start: "top 78%",
        toggleActions: "play reverse play reverse" // animate in/out
      }
    });

    const start = () => build();
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start);

    if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());

    let t; window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(build, 120); });
    window.addEventListener("orientationchange", () => setTimeout(() => ScrollTrigger.refresh(), 100));
  })();
/* =========================================================
script.js — awwwards polish (keeps your existing logic)
========================================================= */
(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =====================
     0) Page transition in
     ===================== */
  const curtain = document.querySelector('.page-transition');
  if (curtain && window.gsap && !prefersReduced) {
    gsap.set(curtain, { yPercent: 0 });
    window.addEventListener('load', () => {
      gsap.to(curtain, { yPercent: -100, duration: 0.9, ease: 'power2.inOut', delay: 0.05, onComplete(){
        curtain.style.display = 'none';
      }});
    });
  }

  /* =====================================
     1) Explainer — auto span + reveal (kept)
     ===================================== */
  const explainerEl = document.getElementById('explainer');
  if (explainerEl) {
    const txt = explainerEl.textContent.trim().replace(/\s+/g, ' ');
    explainerEl.innerHTML = txt.split(' ').map(w => `<span class="word">${w}</span>`).join(' ');

    if (window.gsap && window.ScrollTrigger && !prefersReduced) {
      gsap.registerPlugin(ScrollTrigger);
      gsap.set('.explainer .word', {
        color: '#cfcfcf', y: '0.5em', opacity: 0.35, filter: 'blur(0.6px)', scale: 0.96
      });
      gsap.to('.explainer .word', {
        color: '#1d1d1d', y: 0, opacity: 1, filter: 'blur(0px)', scale: 1,
        stagger: { each: 0.035, from: 'start' }, ease: 'expo.out', duration: 1.2,
        scrollTrigger: { trigger: explainerEl, start: 'top 80%', toggleActions: 'play none none reverse', once: false }
      });
    } else {
      explainerEl.querySelectorAll('.word').forEach(w => w.style.color = '#1d1d1d');
    }
  }

  /* ==========================================
     2) Hero — parallax + letter & subtitle intro
     ========================================== */
  const blobsWrap = document.querySelector('.blobs');
  if (blobsWrap && !prefersReduced) {
    let tx = 0, ty = 0, targetX = 0, targetY = 0;
    const damp = 0.085, strength = 26; // stronger than 18 so it’s noticeable
    function loop(){ tx += (targetX - tx) * damp; ty += (targetY - ty) * damp; blobsWrap.style.transform = `translate(${tx}px,${ty}px)`; requestAnimationFrame(loop); }
    window.addEventListener('mousemove', e => {
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      targetX = nx * strength; targetY = ny * strength;
    }, { passive: true });
    loop();
  }



})();

// Enhanced GSAP page load and section animations
(() => {
  if (!window.gsap || !window.ScrollTrigger) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  gsap.registerPlugin(ScrollTrigger);

  // Hero headline split animation
  const heroTitle = document.querySelector('.herotext h1');
  if (heroTitle) {
    // Split text into spans per letter
    heroTitle.innerHTML = heroTitle.textContent.split('').map(char =>
      `<span class="char">${char === ' ' ? '&nbsp;' : char}</span>`).join('');
    gsap.set(heroTitle.querySelectorAll('.char'), { y: 80, opacity: 0, rotate: 8, scale: 1.2 });
  }

  // Timeline for initial load
  const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

  tl.to(".navbar", { opacity: 1, y: 0, duration: 0.7 })
    .to(".hero", { opacity: 1, y: 0, duration: 0.9 }, "-=0.5")
    .to(".herotext h1 .char", {
      y: 0,
      opacity: 1,
      rotate: 0,
      scale: 1,
      stagger: { each: 0.035, from: "start" },
      duration: 1.1
    }, "-=0.7")
    .from(".herotext .subtitle", {
      opacity: 0,
      y: 40,
      duration: 0.7
    }, "-=0.8")
    .from(".btn--pill", {
      opacity: 0,
      y: 40,
      duration: 0.7
    }, "-=0.6")
    .to(".explainer-wrap", { opacity: 1, y: 0, duration: 0.9 }, "-=0.4")
    .to(".projects__grid", { opacity: 1, y: 0, duration: 1 }, "-=0.7");



  // Enhanced projects grid animation
  gsap.from(".projects__grid .card", {
    opacity: 0,
    y: 80,
    rotate: 6,
    scale: 0.96,
    duration: 1.2,
    stagger: {
      each: 0.13,
      from: "start"
    },
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".projects__grid",
      start: "top 85%",
      toggleActions: "play reverse play reverse"
    }
  });


  // Animate footer CTA and note
  gsap.from(".footer__row, .footer__note, .footer__copy", {
    opacity: 0,
    y: 60,
    duration: 1,
    stagger: 0.18,
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".footer",
      start: "top 90%",
      toggleActions: "play none none reverse"
    }
  });
})();

// Animate about-photo: slide in from left with GSAP
if (window.gsap && window.ScrollTrigger) {
  gsap.set('.about-photo', { x: -80, opacity: 0 });
  gsap.to('.about-photo', {
    x: 0,
    opacity: 1,
    duration: 1.1,
    ease: "expo.out",
    scrollTrigger: {
      trigger: '.explainer-wrap',
      start: "top 85%",
      toggleActions: "play reverse play reverse"
    }
  });
}


// ---- Work page micro-parallax (reuses GSAP + ScrollTrigger) ----
(() => {
  if (!window.gsap || !window.ScrollTrigger) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  gsap.utils.toArray('.case [data-parallax]').forEach(el => {
    const travel = parseFloat(el.getAttribute('data-parallax')) || 20;
    gsap.fromTo(el, { y: -travel }, {
      y: travel,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  });
})();

/* ===== Cards Parallax (vanilla, Olivier logic) ===== */
(function cardsParallax(){
  const section = document.querySelector('[data-olc-cards]');
  if (!section) return;

  const main   = section.querySelector('.olc__main');
  const cards  = Array.from(section.querySelectorAll('.olc__card'));
  const N      = cards.length;
  if (!N) return;

  // Stack offsets and z-index (later cards sit above earlier ones)
  cards.forEach((card, i) => {
    card.style.setProperty('--offset', `${i * 25}px`);
    card.style.zIndex = String(100 + i);
  });

  // Track progress for the WHOLE section (0..1)
  let start = 0, end = 1;
  function measure(){
    const r = main.getBoundingClientRect();
    const y = window.scrollY || window.pageYOffset;
    start = r.top + y;
    end   = start + main.offsetHeight - window.innerHeight;
  }
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const map = (v, inA, inB, outA, outB) => {
    const t = clamp01((v - inA) / Math.max(1e-6, (inB - inA)));
    return outA + (outB - outA) * t;
  };

  function render(){
    const y = window.scrollY || window.pageYOffset;
    const progress = clamp01((y - start) / Math.max(1, (end - start)));  // 0..1

    cards.forEach((card, i) => {
      // last card scales the least; first card ends up the smallest
      const targetScale = 1 - ((N - i) * 0.05);
      const rangeStart  = i / N;
      const s = (progress <= rangeStart)
        ? 1
        : map(progress, rangeStart, 1, 1, targetScale);

      card.style.transform = `scale(${s.toFixed(4)})`;
    });
  }

  // init
  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => { render(); ticking = false; });
      ticking = true;
    }
  };

  // setup & listeners
  const setup = () => { measure(); render(); };
  setup();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { measure(); render(); });

})();

/* ===== Smooth Olivier-style Cards Parallax ===== */
(function cardsParallaxSmooth(){
  const section = document.querySelector('[data-olc-cards]');
  if (!section) return;

  const main   = section.querySelector('.olc__main');
  const cards  = Array.from(section.querySelectorAll('.olc__card'));
  const N      = cards.length;
  if (!N) return;

  // Stack offsets and z-index (later cards sit above earlier ones)
  cards.forEach((card, i) => {
    card.style.setProperty('--offset', `${i * 25}px`);
    card.style.zIndex = String(100 + i);
  });

  // Track progress for the WHOLE section (0..1)
  let start = 0, end = 1;
  function measure(){
    const r = main.getBoundingClientRect();
    const y = window.scrollY || window.pageYOffset;
    start = r.top + y;
    end   = start + main.offsetHeight - window.innerHeight;
  }
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const map = (v, inA, inB, outA, outB) => {
    const t = clamp01((v - inA) / Math.max(1e-6, (inB - inA)));
    return outA + (outB - outA) * t;
  };

  // Smooth progress lerping
  let targetProgress = 0, smoothProgress = 0;
  function render(){
    const y = window.scrollY || window.pageYOffset;
    targetProgress = clamp01((y - start) / Math.max(1, (end - start)));  // 0..1

    // Lerp for smoothness
    smoothProgress += (targetProgress - smoothProgress) * 0.13;

    cards.forEach((card, i) => {
      const targetScale = 1 - ((N - i) * 0.05);
      const rangeStart  = i / N;
      const s = (smoothProgress <= rangeStart)
        ? 1
        : map(smoothProgress, rangeStart, 1, 1, targetScale);

      // Optional: fade out cards as they shrink
      const fade = (s < 0.92) ? map(s, targetScale, 0.92, 0, 1) : 1;

      card.style.transform = `scale(${s.toFixed(4)})`;
      card.style.opacity = fade;
    });

    requestAnimationFrame(render);
  }

  // setup & listeners
  const setup = () => { measure(); };
  setup();
  window.addEventListener('resize', setup);

  render();
})();
