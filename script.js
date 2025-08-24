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

  /* ---------- Hero blobs: parallax on wrapper (no accumulation) ---------- */
  const blobsWrap = document.querySelector('.blobs');
  if (blobsWrap && !prefersReduced) {
    let tx = 0,
      ty = 0,
      targetX = 0,
      targetY = 0;
    const damp = 0.08,
      strength = 18;

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

 


  /* ===== Expertise parallax (auto-scale so edges never show) ===== */
  (() => {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    function build() {
      // kill old triggers for hot-reload/resize
      ScrollTrigger.getAll().forEach(t => {
        if (t.trigger && t.trigger.classList && t.trigger.classList.contains('xp')) t.kill();
      });

      gsap.utils.toArray('.xp').forEach(card => {
        const bg = card.querySelector('.xp__bg');
        if (!bg) return;

        // per-card distance in px (override with data-parallax="240")
        const travel = Number(card.dataset.parallax) || 180;

        // how much to scale so the image still covers at the extremes:
        // scaleNeeded = (h + 2*travel) / h
        const h = card.getBoundingClientRect().height || card.offsetHeight;
        const scaleNeeded = (h + 2 * travel) / h;
        const scale = scaleNeeded + 0.04; // +4% safety

        gsap.set(bg, { y: -travel, scale, willChange: 'transform' });

        // efficient setter
        const setY = gsap.quickSetter(bg, 'y', 'px');

        ScrollTrigger.create({
          trigger: card,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          onUpdate(self) {
            // move from -travel to +travel
            setY(-travel + self.progress * (travel * 2));
          }
        });
      });

      ScrollTrigger.refresh();
    }

    const start = () => build();
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start);

    let t;
    window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(build, 120); });
  })();
