;(function () {
  'use strict';

  /* =====================
     Persisted theme + sound
     ===================== */
  const THEME_KEY = 'wo_theme';
  const SOUND_KEY = 'wo_sound';

  const themes = ['theme-light', 'theme-dark', 'theme-crt', 'theme-blue', 'theme-amber'];

  function getSavedTheme() { return localStorage.getItem(THEME_KEY); }
  function saveTheme(cls)   { localStorage.setItem(THEME_KEY, cls); }
  function applySavedTheme() {
    const saved = getSavedTheme();
    if (saved) document.body.className = saved;
  }
  applySavedTheme();

  function getSavedSoundOn() { return localStorage.getItem(SOUND_KEY) === 'on'; }
  function saveSound(on)     { localStorage.setItem(SOUND_KEY, on ? 'on' : 'off'); }

  /* =====================
     UI elements
     ===================== */
  const menuToggle  = document.getElementById('menuToggle');
  const mainMenu    = document.getElementById('mainMenu');
  const colorToggle = document.getElementById('colorModeToggle');
  const soundToggle = document.getElementById('soundToggle');
  const backToTop   = document.getElementById('backToTop');
  const infoToggle  = document.getElementById('infoToggle');
  const infoPopup   = document.getElementById('infoPopup');
  const zoomOverlay = document.getElementById('zoomOverlay');
  const zoomClose   = document.getElementById('zoomClose');
  const gallery     = document.querySelector('.gallery');

  /* =====================
     Project data
     - layout: "full" for single, "row" or "row-3" for side by side
     ===================== */
  const projectData = [
    {
      title: 'Project One',
      objective: 'Create a tactile, memory-charged alias rooted in design, sound, and motion.',
      final: 'An evolving system and digital space used as an archive and launchpad.',
      items: [
        { type: 'img',   src: 'Assets/cd_player_frame1_v2.png', layout: 'full' },
        { type: 'img',   src: 'Assets/cellphone_frame1_v2.jpg', layout: 'full' },
        { type: 'row',   items: [
            { type:'img', src:'Assets/model1_frame3_v3.jpg' },
            { type:'img', src:'Assets/cellphone_frame1_v2.jpg' }
          ]
        }
      ]
    },
    {
      title: 'FIELD KIT: GLASS INDEX',
      objective: 'INDEX texture series using AI as a vehicle to explore memory and preservation.',
      final: 'Concept campaign plus a pack of 20 high-resolution glass scans with lore.',
      items: [
        { type:'img', src:'Assets/glassindex_v1.jpg', layout:'full' },
        { type:'img', src:'Assets/glassindex_v2.jpg', layout:'full' },
        { type:'img', src:'Assets/glassindex_v3.jpg', layout:'full' },
        { type:'img', src:'Assets/glassindex_v4.jpg', layout:'full' }
      ]
    },
    {
      title: 'Project Three',
      objective: 'Fashion vs techwear contrast.',
      final: 'Capsule lookbook for launch.',
      items: [
        { type:'img',   src:'Assets/weird_thumb_v4.jpg', layout:'full' },
        { type:'video', src:'Assets/weird_loop_v1.mp4', layout:'full', attrs:{ loop:true, muted:true, playsinline:true, autoplay:true } },
        { type:'img',   src:'Assets/weird_mock_v1.jpg', layout:'full' }
      ]
    }
  ];

  /* =====================
     Build gallery markup
     ===================== */
  function buildGallery() {
    if (!gallery) return;
    gallery.innerHTML = '';
    projectData.forEach((project, idx) => {
      const section = document.createElement('section');
      section.className = 'project';
      section.dataset.project = String(idx);
      section.setAttribute('aria-label', project.title);

      project.items.forEach(item => {
        if (item.layout === 'row' || item.layout === 'row-3' || item.type === 'row') {
          const row = document.createElement('div');
          row.className = 'media ' + (item.layout || 'row');
          const children = item.items || [];
          children.forEach(ch => {
            if (ch.type === 'video') {
              const v = document.createElement('video');
              v.preload = 'none';
              v.setAttribute('playsinline', '');
              v.setAttribute('muted', '');
              v.setAttribute('loop', '');
              v.src = ch.src;
              v.setAttribute('loading', 'lazy');
              row.appendChild(v);
            } else {
              const img = document.createElement('img');
              img.src = ch.src;
              img.loading = 'lazy';
              img.alt = '';
              row.appendChild(img);
            }
          });
          section.appendChild(row);
        } else {
          const wrap = document.createElement('div');
          wrap.className = 'media full';
          if (item.type === 'video') {
            const v = document.createElement('video');
            v.preload = 'none';
            v.src = item.src;
            v.setAttribute('playsinline', '');
            if (item.attrs) {
              if (item.attrs.loop) v.setAttribute('loop','');
              if (item.attrs.muted) v.setAttribute('muted','');
              if (item.attrs.autoplay) v.setAttribute('autoplay','');
            }
            v.setAttribute('loading','lazy');
            wrap.appendChild(v);
          } else {
            const img = document.createElement('img');
            img.src = item.src;
            img.loading = 'lazy';
            img.alt = project.title;
            wrap.appendChild(img);
          }
          section.appendChild(wrap);
        }
      });

      gallery.appendChild(section);
    });

    // update Info panel with first project
    updateInfoPanel(0);

    // bind zoom on all media
    bindZoomHandlers();
  }

  /* =====================
     Info panel content
     ===================== */
  const infoTitle = document.querySelector('.info-title');
  const infoBodies = document.querySelectorAll('.info-body');
  const infoSubs   = document.querySelectorAll('.info-sub');

  function updateInfoPanel(pid) {
    const info = projectData[pid];
    if (!info || !infoTitle || !infoBodies.length) return;
    infoTitle.textContent = info.title;
    infoSubs[0].textContent = 'OBJECTIVE';
    infoBodies[0].textContent = info.objective;
    infoSubs[1].textContent = 'FINAL OBJECT';
    infoBodies[1].textContent = info.final;
  }

  /* =====================
     Menu toggle
     ===================== */
  if (menuToggle && mainMenu) {
    menuToggle.setAttribute('aria-expanded','false');
    mainMenu.hidden = true;
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
      mainMenu.hidden = expanded;
    });

    // click outside to close
    document.addEventListener('click', (e) => {
      if (!mainMenu.hidden && !mainMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        mainMenu.hidden = true;
        menuToggle.setAttribute('aria-expanded','false');
      }
    });
  }

  /* =====================
     About/Home swap
     ===================== */
  const aboutMenuLink =
    document.querySelector('#mainMenu a[href$="about.html"]') ||
    document.querySelector('#mainMenu a#menuAbout');
  if (aboutMenuLink) {
    const onAbout = /about(?:\.html)?$/i.test(window.location.pathname);
    if (onAbout) {
      aboutMenuLink.textContent = 'Home';
      aboutMenuLink.setAttribute('href','index.html');
    } else {
      aboutMenuLink.textContent = 'About';
      aboutMenuLink.setAttribute('href','about.html');
    }
  }

  /* =====================
     Color mode cycling
     ===================== */
  if (colorToggle) {
    colorToggle.addEventListener('click', (e) => {
      e.preventDefault();
      const current = document.body.className || themes[0];
      let i = themes.indexOf(current);
      if (i === -1) i = 0;
      const next = themes[(i + 1) % themes.length];
      document.body.className = next;
      saveTheme(next);
    });
  }

  /* =====================
     Sound system + SFX
     ===================== */
  const SFX = {
    click: new Audio('Assets/new_click_next_sound_v1.mp3'),
    next:  new Audio('Assets/new_click_next_sound_v1.mp3'),
    prev:  new Audio('Assets/new_click_prev_sound_v1.mp3'),
    dead:  new Audio('Assets/new_deadclick_sound_v1.mp3'),
    error: new Audio('Assets/new_errorclick_sound_v1.mp3')
  };
  Object.values(SFX).forEach(a => { try { a.preload = 'auto'; a.load(); } catch {} });

  if (localStorage.getItem(SOUND_KEY) == null) saveSound(true);
  let soundEnabled = getSavedSoundOn();

  function setSoundLabel(el, on) {
    if (!el) return;
    el.textContent = on ? 'Sound Off' : 'Sound On';
    el.setAttribute('aria-pressed', String(on));
  }
  setSoundLabel(soundToggle, soundEnabled);

  if (soundToggle) {
    soundToggle.addEventListener('click', (e) => {
      e.preventDefault();
      soundEnabled = !soundEnabled;
      setSoundLabel(soundToggle, soundEnabled);
      saveSound(soundEnabled);
      playSfx(SFX.click);
    });
  }

  let audioUnlocked = false;
  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    Object.values(SFX).forEach(a => {
      try { a.volume = 0.001; a.play().then(()=>a.pause()).catch(()=>{}); a.currentTime = 0; a.volume = 1; } catch {}
    });
  }
  ['pointerdown','keydown','touchstart','click'].forEach(evt => {
    window.addEventListener(evt, unlockAudio, { once: true, capture: true });
    document.addEventListener(evt, unlockAudio, { once: true, capture: true });
  });

  function playSfx(a) {
    if (!soundEnabled || !a) return;
    try { a.currentTime = 0; a.play().catch(()=>{}); } catch {}
  }

  const INTERACTIVE_SELECTOR = [
    'a','button','.menu-toggle','.project-box','#infoToggle','#soundToggle','#colorModeToggle','.logo-link'
  ].join(',');
  document.addEventListener('click', (e) => {
    const el = e.target.closest ? e.target.closest(INTERACTIVE_SELECTOR) : null;
    if (el) return playSfx(SFX.click);
    playSfx(SFX.dead);
  }, true);

  /* =====================
     Back to top visibility
     ===================== */
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('show', window.scrollY > 400);
    });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* =====================
     Info popup toggle
     ===================== */
  if (infoToggle && infoPopup) {
    infoToggle.setAttribute('aria-expanded','false');
    infoPopup.hidden = true;
    infoToggle.addEventListener('click', () => {
      const expanded = infoToggle.getAttribute('aria-expanded') === 'true';
      infoToggle.setAttribute('aria-expanded', String(!expanded));
      infoPopup.hidden = expanded;
      playSfx(SFX.click);
    });

    document.addEventListener('click', (e) => {
      if (!infoPopup.hidden && !infoPopup.contains(e.target) && !infoToggle.contains(e.target)) {
        infoPopup.hidden = true;
        infoToggle.setAttribute('aria-expanded','false');
      }
    });
  }

  /* =====================
     Project nav -> scroll to section
     Also update selected dot on scroll
     ===================== */
  const projectDots = Array.from(document.querySelectorAll('.project-box'));
  projectDots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      const pid = Number(e.currentTarget.dataset.project);
      const target = document.querySelector(`.project[data-project="${pid}"]`);
      if (target) target.scrollIntoView({ behavior:'smooth', block:'start' });
      projectDots.forEach(d => d.classList.remove('selected'));
      e.currentTarget.classList.add('selected');
      updateInfoPanel(pid);
    });
    dot.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dot.click(); }
    });
  });

  // Highlight current project while scrolling
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const pid = Number(entry.target.dataset.project);
        projectDots.forEach(d => d.classList.toggle('selected', Number(d.dataset.project) === pid));
        updateInfoPanel(pid);
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0.0 });

  function observeProjects() {
    document.querySelectorAll('.project').forEach(sec => sectionObserver.observe(sec));
  }

  /* =====================
     Zoom overlay
     - click any img/video to open
     - overlay respects theme background
     - Esc, X, or backdrop closes
     ===================== */
  function bindZoomHandlers() {
    document.querySelectorAll('.media img, .media video').forEach(el => {
      el.addEventListener('click', () => openZoom(el));
    });
  }

  function openZoom(el) {
    if (!zoomOverlay) return;
    // clear previous
    [...zoomOverlay.querySelectorAll('img,video')].forEach(n => n.remove());

    let node;
    if (el.tagName === 'VIDEO') {
      node = el.cloneNode(true);
      node.controls = true;
      node.removeAttribute('autoplay');
      node.currentTime = 0;
    } else {
      node = document.createElement('img');
      node.src = el.currentSrc || el.src;
      node.alt = '';
      node.loading = 'eager';
    }
    zoomOverlay.appendChild(node);
    zoomOverlay.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    zoomClose.focus();
  }

  function closeZoom() {
    if (!zoomOverlay) return;
    zoomOverlay.hidden = true;
    [...zoomOverlay.querySelectorAll('img,video')].forEach(n => n.remove());
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  if (zoomClose) zoomClose.addEventListener('click', closeZoom);
  if (zoomOverlay) {
    zoomOverlay.addEventListener('click', (e) => {
      if (e.target === zoomOverlay) closeZoom();
    });
    document.addEventListener('keydown', (e) => {
      if (!zoomOverlay.hidden && e.key === 'Escape') closeZoom();
    });
  }

  /* =====================
     Build and init
     ===================== */
  buildGallery();
  observeProjects();

})();
