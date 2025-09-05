// script.js
;(function () {
  'use strict';

  // ===== PERSISTED STATE (theme + sound) =====
  const THEME_KEY = 'wo_theme';
  const SOUND_KEY = 'wo_sound';

  function getSavedTheme() {
    return localStorage.getItem(THEME_KEY);
  }
  function saveTheme(cls) {
    localStorage.setItem(THEME_KEY, cls);
  }
  function applySavedTheme() {
    const saved = getSavedTheme();
    if (saved) document.body.className = saved;
  }
  function nextThemeClass(current) {
    const themes = ['theme-light', 'theme-dark', 'theme-crt', 'theme-blue', 'theme-amber'];
    let i = themes.indexOf(current);
    if (i === -1) i = 0;
    return themes[(i + 1) % themes.length];
  }

  function getSavedSoundOn() {
    return localStorage.getItem(SOUND_KEY) === 'on';
  }
  function saveSound(on) {
    localStorage.setItem(SOUND_KEY, on ? 'on' : 'off');
  }

  // Apply saved theme immediately so UI paints correctly
  applySavedTheme();

  // ===== ELEMENTS (guard for pages that don't have them) =====
  const menuToggle = document.getElementById('menuToggle');
  const mainMenu   = document.getElementById('mainMenu');

  const infoToggle = document.getElementById('infoToggle');
  const infoPopup  = document.getElementById('infoPopup');

  const colorModeToggle = document.getElementById('colorModeToggle');
  const soundToggleEl   = document.getElementById('soundToggle');

  const emailToggle      = document.getElementById('emailToggle');
  const contactContainer = document.querySelector('.contact-container');

  const backToTop  = document.getElementById('backToTop');
  const zoomOverlay = document.getElementById('zoomOverlay');
  const zoomClose   = document.getElementById('zoomClose');
  const gallery     = document.querySelector('.gallery');

  // --- PAGE-SPECIFIC MENU SWAP (About ↔ Home) ---
  const aboutMenuLink =
    document.querySelector('#mainMenu a[href$="about.html"]')
    || document.querySelector('#mainMenu a#menuAbout');

  if (aboutMenuLink) {
    const onAbout = /about(?:\.html)?$/i.test(window.location.pathname);
    if (onAbout) {
      aboutMenuLink.textContent = 'Home';
      aboutMenuLink.setAttribute('href', 'index.html');
    } else {
      aboutMenuLink.textContent = 'About';
      aboutMenuLink.setAttribute('href', 'about.html');
    }
  }

  // ===== MENU TOGGLE (WCAG ARIA) =====
  if (menuToggle && mainMenu) {
    menuToggle.setAttribute('aria-expanded', 'false');
    mainMenu.hidden = true;
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
      mainMenu.hidden = expanded;
    });
  }

  // ===== CLOSE POPUPS WHEN CLICKING OUTSIDE =====
  document.addEventListener('click', (event) => {
    if (infoPopup && infoToggle && !infoPopup.hidden) {
      if (!infoPopup.contains(event.target) && !infoToggle.contains(event.target)) {
        infoPopup.hidden = true;
        infoToggle.setAttribute('aria-expanded', 'false');
      }
    }
    if (mainMenu && menuToggle && !mainMenu.hidden) {
      if (!mainMenu.contains(event.target) && !menuToggle.contains(event.target)) {
        mainMenu.hidden = true;
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // ===== PROJECT INFO REFERENCES (only on index) =====
  const infoTitle      = document.querySelector('.info-popup h2');
  const infoObjectives = document.querySelectorAll('.info-sub');
  const infoBodies     = document.querySelectorAll('.info-body');

  // ===== STATE =====
  let currentProject = 0;

  // ===== PROJECT DATA (EXACTLY YOURS) =====
  const projectImages = [
    [
      'Assets/cd_player_frame1_v2.png',
      'Assets/cellphone_frame1_v2.jpg',
      'Assets/model1_frame3_v3.jpg',
      'Assets/cellphone_frame1_v2.jpg'
    ],
    [
      'Assets/glassindex_v1.jpg',
      'Assets/glassindex_v3.jpg',
      'Assets/glassindex_v2.jpg',
      'Assets/glassindex_v4.jpg',
      'Assets/glassindex_v10.jpg',
      'Assets/glassindex_v5.jpg',
      'Assets/glassindex_v7.jpg',
      'Assets/glassindex_v11.jpg',
      'Assets/glassindex_v8.jpg',
      'Assets/glassindex_v9.jpg'
    ],
    [
      'Assets/weird_thumb_v4.jpg',
      'Assets/weird_forest_v1.jpg',
      'Assets/weird_mock_v1.jpg',
      'Assets/weird_cap_v1.jpg',
      'Assets/weird_loop_v1.mp4',
      'Assets/weird_thumb_v3.jpg'
    ]
  ];

  const projectInfo = [
    {
      title: 'Project One',
      objective: 'Create a tactile, memory-charged alias for raw creative output—rooted in design, sound, and motion, shaped by the past but built to adapt. WITH love',
      final: 'An evolving system and digital space-serving as archive, interface, and launchpad for experimental work across disciplines.'
    },
    {
      title: 'FIELD KIT: GLASS INDEX',
      objective: 'FIELD KIT: GLASS INDEX showcase our INDEX texture series, using AI as a story vehicle to question how technology can preserve memory and extend imagination. Each AI fragment is refined by hand, merging machine possibility with human craft into cinematic, tactile artifacts.',
      final: 'The result is a concept campaign editorial, a pack of 20 high-resolution glass scans. Each fragment bears cracks, static, and grain - not only serving as creative resources but also expanding the lore of WITH OBJECT, where every surface becomes evidence of fractured timelines and preserved human memory.'
    },
    {
      title: 'Project Three',
      objective: 'Fashion vs Techwear contrast',
      final: 'Capsule lookbook for launch'
    }
  ];

  // ===== NEW: OPTIONAL side-by-side config without touching your arrays =====
  // rowMap[projectIndex] = [ [i,j], [k,l,m], ... ]  (indices in projectImages[projectIndex])
  // Anything not listed renders as a full-width block in order.
  const rowMap = {
    0: [[2,3]],  // example: side-by-side for indices 2 and 3 in project 0
    1: [[2,3]],
    2: []
  };

  // ===== INFO PANEL UPDATE =====
  function updateProjectInfo(pid) {
    if (!infoTitle || !infoObjectives.length || !infoBodies.length) return;
    const info = projectInfo[pid];
    infoTitle.textContent = info.title;
    infoObjectives[0].textContent = 'OBJECTIVE';
    infoBodies[0].textContent = info.objective;
    infoObjectives[1].textContent = 'FINAL OBJECT';
    infoBodies[1].textContent = info.final;
  }

  // ===== HELPERS =====
  function isVideoSrc(src) { return /\.(mp4|webm|ogg)(\?.*)?$/i.test(src); }

  // ===== BUILD VERTICAL GALLERY =====
  function buildProjectSection(pid) {
    const section = document.createElement('section');
    section.className = 'project';
    section.dataset.project = String(pid);

    const files = projectImages[pid] || [];
    const rows = rowMap[pid] || [];
    const rowStarts = new Set(rows.map(r => r[0]));
    const inRow = new Set(rows.flat());

    for (let i = 0; i < files.length; i++) {
      // render declared row when at its first index
      if (rowStarts.has(i)) {
        const rowDef = rows.find(r => r[0] === i) || [];
        const row = document.createElement('div');
        row.className = `media ${rowDef.length === 3 ? 'row-3' : 'row'}`;

        rowDef.forEach(idx => {
          const src = files[idx];
          if (isVideoSrc(src)) {
            const v = document.createElement('video');
            v.src = src; v.preload = 'none'; v.setAttribute('playsinline',''); v.setAttribute('muted',''); v.setAttribute('loop',''); v.setAttribute('autoplay','');
            row.appendChild(v);
          } else {
            const img = document.createElement('img');
            img.src = src; img.loading = 'lazy'; img.alt = projectInfo[pid]?.title || '';
            row.appendChild(img);
          }
        });

        section.appendChild(row);
        i = rowDef[rowDef.length - 1]; // skip the rest of this row
        continue;
      }

      // skip indices that belong to a row but aren't the first
      if (inRow.has(i)) continue;

      // full-width block
      const wrap = document.createElement('div');
      wrap.className = 'media full';
      const src = files[i];

      if (isVideoSrc(src)) {
        const v = document.createElement('video');
        v.src = src; v.preload = 'none'; v.setAttribute('playsinline',''); v.setAttribute('muted',''); v.setAttribute('loop',''); v.setAttribute('autoplay','');
        wrap.appendChild(v);
      } else {
        const img = document.createElement('img');
        img.src = src; img.loading = 'lazy'; img.alt = projectInfo[pid]?.title || '';
        wrap.appendChild(img);
      }

      section.appendChild(wrap);
    }

    return section;
  }

  function buildGallery() {
    if (!gallery) return;
    gallery.innerHTML = '';
    for (let pid = 0; pid < projectImages.length; pid++) {
      const section = buildProjectSection(pid);
      gallery.appendChild(section);
    }
    // after DOM is ready, set initial info
    updateProjectInfo(0);
    bindZoomHandlers();
    observeProjects();
  }

  // ===== PROJECT NAV (dots) → smooth scroll to section =====
  const projectBoxes = document.querySelectorAll('.project-box');
  projectBoxes.forEach((box) => {
    box.addEventListener('click', (e) => {
      const pid = parseInt(e.currentTarget.getAttribute('data-project'), 10);
      currentProject = pid;
      const target = document.querySelector(`.project[data-project="${pid}"]`);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      projectBoxes.forEach((b) => b.classList.remove('selected'));
      e.currentTarget.classList.add('selected');
      updateProjectInfo(pid);
    });
  });

  // Keep the correct dot selected while scrolling
  function observeProjects() {
    const dots = Array.from(projectBoxes);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const pid = Number(entry.target.dataset.project);
        dots.forEach(d => d.classList.toggle('selected', Number(d.dataset.project) === pid));
        updateProjectInfo(pid);
      });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0.0 });

    document.querySelectorAll('.project').forEach(sec => io.observe(sec));
  }

  // ===== BACK TO TOP =====
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('show', window.scrollY > 400);
    });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ===== INFO POPUP TOGGLE (WCAG ARIA) =====
  if (infoToggle && infoPopup) {
    infoToggle.setAttribute('aria-expanded', 'false');
    infoPopup.hidden = true;
    infoToggle.addEventListener('click', () => {
      const expanded = infoToggle.getAttribute('aria-expanded') === 'true';
      infoToggle.setAttribute('aria-expanded', String(!expanded));
      infoPopup.hidden = expanded;
    });
  }

  // ===== COLOR MODE TOGGLE =====
  if (colorModeToggle) {
    colorModeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      const current = document.body.className || 'theme-light';
      const next = nextThemeClass(current);
      document.body.className = next;
      saveTheme(next);
    });
  }

  // ===== SOUND MODE (unchanged) =====
  const SFX = {
    click:    new Audio('Assets/new_click_next_sound_v1.mp3'),
    next:     new Audio('Assets/new_click_next_sound_v1.mp3'),
    prev:     new Audio('Assets/new_click_prev_sound_v1.mp3'),
    dead:     new Audio('Assets/new_deadclick_sound_v1.mp3'),
    error:    new Audio('Assets/new_errorclick_sound_v1.mp3')
  };
  Object.values(SFX).forEach(a => { try { a.preload = 'auto'; a.load(); } catch {} });

  if (localStorage.getItem(SOUND_KEY) == null) {
    localStorage.setItem(SOUND_KEY, 'on');
  }

  let soundEnabled = getSavedSoundOn();

  function setSoundLabel(el, on) {
    if (!el) return;
    el.textContent = on ? 'Sound Off' : 'Sound On';
    el.setAttribute('aria-pressed', String(on));
  }
  setSoundLabel(soundToggleEl, soundEnabled);

  if (soundToggleEl) {
    soundToggleEl.addEventListener('click', (e) => {
      e.preventDefault();
      soundEnabled = !soundEnabled;
      setSoundLabel(soundToggleEl, soundEnabled);
      saveSound(soundEnabled);
    });
  }

  // Unlock audio on first real user gesture
  let audioUnlocked = false;
  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    Object.values(SFX).forEach(a => {
      try {
        a.volume = 0.001;
        a.play().then(() => a.pause()).catch(() => {});
        a.currentTime = 0;
        a.volume = 1;
      } catch {}
    });
  }
  ['pointerdown','keydown','touchstart','click'].forEach(evt => {
    window.addEventListener(evt, unlockAudio, { once: true, capture: true });
    document.addEventListener(evt, unlockAudio, { once: true, capture: true });
  });

  function playSfx(a) {
    if (!soundEnabled || !a) return;
    try { a.currentTime = 0; a.play().catch(() => {}); } catch {}
  }

  const INTERACTIVE_SELECTOR = [
    'a','button','.menu-toggle','.project-box',
    '#infoToggle','#soundToggle','#colorModeToggle','.logo-link'
  ].join(',');
  const asEl = (n) => (n && n.nodeType === 1 ? n : null);

  document.addEventListener('click', (e) => {
    const target = asEl(e.target);
    const el = target ? target.closest(INTERACTIVE_SELECTOR) : null;
    if (el) {
      return playSfx(SFX.click);
    }
    playSfx(SFX.dead);
  }, true);

  // ===== NEW: ZOOM OVERLAY =====
  function bindZoomHandlers() {
    document.querySelectorAll('.media img, .media video').forEach(el => {
      el.addEventListener('click', () => openZoom(el));
    });
  }

  function openZoom(el) {
    if (!zoomOverlay) return;
    // Clear previous media
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
    zoomOverlay.addEventListener('click', (e) => { if (e.target === zoomOverlay) closeZoom(); });
    document.addEventListener('keydown', (e) => { if (!zoomOverlay.hidden && e.key === 'Escape') closeZoom(); });
  }

  // ===== INIT =====
  buildGallery();   // builds from your arrays and rowMap
})();
