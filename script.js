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

  // ===== ELEMENTS =====
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

  // ===== PROJECT INFO REFERENCES =====
  const infoTitle      = document.querySelector('.info-popup h2');
  const infoObjectives = document.querySelectorAll('.info-sub');
  const infoBodies     = document.querySelectorAll('.info-body');

  // ===== STATE =====
  let currentProject = 0;

  // ===== YOUR DATA (unchanged) =====
  const projectImages = [
    [
      'Assets/cd_player_frame1_v2.png',
      'Assets/object_still_v2.png',
      'Assets/object_still_v1.png',
      'Assets/cellphone_frame1_v20.jpg'
    ],
    [
      'Assets/glassindex_v1.jpg',
      'Assets/glassindex_v3.jpg',
      'Assets/glassindex_v2.jpg',
      'Assets/glassindex_v4.jpg',
      'Assets/glassindex_v10.jpg',
      'Assets/glassindex_v7.jpg',
      'Assets/glassindex_v11.jpg',
      'Assets/glassindex_v8.jpg',
      'Assets/glassindex_v9.jpg'
    ],
    [
      'Assets/weird_thumb_v4.jpg',
      'Assets/weird_blur_v1.jpg',
      'Assets/weird_shirtmock_v2.jpg',
      'Assets/weird_loop_v1.mp4',
      'Assets/weird_thumb_v3.jpg'
    ],
    [
      'Assets/symbols_v1.jpg',
      'Assets/augment_v1.jpg',
      'Assets/air_v1.jpg',
      'Assets/Low_v1.jpg',
      'Assets/cte_v1.jpg',
      'Assets/postcard_v1.jpg',
      'Assets/paint_v1.jpg',
      'Assets/paint_v2.jpg',
      'Assets/nightbear_v1.jpg',
      'Assets/nightbear_frame4_v1.mp4'
        
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
    },
    {
      title: 'Project Three',
      objective: 'Fashion vs Techwear contrast',
      final: 'Capsule lookbook for launch'
    }
  ];

  // ===== OPTIONAL side-by-side rows (unchanged) =====
  const rowMap = {
    0: [[1,2]],
    1: [[2,3]],
    2: [[1,2]],
    3: [[1,2]]
    3: [[6,7]]
  };

  // ===== INFO PANEL =====
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

  // === NEW: viewport-based video auto play/pause ===
  let videoObserver;
  function setupVideoObserver() {
    if (videoObserver) videoObserver.disconnect();
    videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const v = entry.target;
        if (!(v instanceof HTMLVideoElement)) return;
        if (entry.isIntersecting) {
          // try to play when visible
          try { v.play().catch(()=>{}); } catch {}
        } else {
          try { v.pause(); } catch {}
        }
      });
    }, { threshold: 0.35 }); // ~1/3 on screen
    document.querySelectorAll('.gallery video').forEach(v => videoObserver.observe(v));
  }

  function updateAboutLink() {
  const link =
    document.getElementById('aboutMenuLink') ||
    document.querySelector('#mainMenu a[href$="about.html"]');
  if (!link) return;

  const onAbout = /(^|\/)about(?:\.html)?$/i.test(window.location.pathname);
  if (onAbout) {
    link.textContent = 'Home';
    link.setAttribute('href', 'index.html');
  } else {
    link.textContent = 'About';
    link.setAttribute('href', 'about.html');
  }
}
// Call once on load
updateAboutLink();

// Also update every time the + menu opens/closes
if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    // your existing menu open/close logic runs here…
    updateAboutLink();
  });
}


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
            // set properties BEFORE src for iOS/Safari
            v.muted = true;
            v.playsInline = true;
            v.loop = true;
            v.autoplay = true;
            v.preload = 'metadata';
            v.setAttribute('playsinline','');
            v.setAttribute('muted','');
            v.setAttribute('loop','');
            v.setAttribute('autoplay','');
            v.src = src;
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
        // set properties BEFORE src for iOS/Safari
        v.muted = true;
        v.playsInline = true;
        v.loop = true;
        v.autoplay = true;
        v.preload = 'metadata';
        v.setAttribute('playsinline','');
        v.setAttribute('muted','');
        v.setAttribute('loop','');
        v.setAttribute('autoplay','');
        v.src = src;
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
    updateProjectInfo(0);
    bindZoomHandlers();
    observeProjects();
    setupVideoObserver();
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

  // keep dot selected while scrolling
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

// === BACK TO TOP — final (ONLY change we’re making) ===
  (function setupBackToTop () {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    function getScrollTop() {
      if (typeof window.pageYOffset === 'number') return window.pageYOffset;
      const de = document.documentElement;
      const db = document.body;
      return (de && de.scrollTop) || (db && db.scrollTop) || 0;
    }

    function update() {
      const y = getScrollTop();
      if (y > 120) btn.classList.add('show'); else btn.classList.remove('show');
    }

    btn.style.display = ''; // clear any inline display from previous attempts

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('load', update);
    document.addEventListener('DOMContentLoaded', update);

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    update();
  })();

  // ===== INFO POPUP TOGGLE =====
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

  // ===== SOUND MODE =====
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

  // Unlock audio + nudge videos on first gesture (iOS/Safari quirk)
  let audioUnlocked = false;
  function unlockAudioAndNudgeVideos() {
    if (audioUnlocked) return;
    audioUnlocked = true;

    // soft-unlock SFX
    Object.values(SFX).forEach(a => {
      try {
        a.volume = 0.001;
        a.play().then(() => a.pause()).catch(() => {});
        a.currentTime = 0;
        a.volume = 1;
      } catch {}
    });

    // try play any visible paused videos
    document.querySelectorAll('.gallery video').forEach(v => {
      const rect = v.getBoundingClientRect();
      const visible = rect.top < window.innerHeight && rect.bottom > 0;
      if (visible) { try { v.play().catch(()=>{}); } catch {} }
    });
  }
  ['pointerdown','keydown','touchstart','click'].forEach(evt => {
    window.addEventListener(evt, unlockAudioAndNudgeVideos, { once: true, capture: true });
    document.addEventListener(evt, unlockAudioAndNudgeVideos, { once: true, capture: true });
  });

  function playSfx(a) {
    if (!soundEnabled || !a) return;
    try { a.currentTime = 0; a.play().catch(() => {}); } catch {}
  }
  const INTERACTIVE_SELECTOR = [
    'a','button','.menu-toggle','.project-box',
    '#infoToggle','#soundToggle','#colorModeToggle','.logo-link'
  ].join(',');
  document.addEventListener('click', (e) => {
    const el = e.target.closest ? e.target.closest(INTERACTIVE_SELECTOR) : null;
    playSfx(el ? SFX.click : SFX.dead);
  }, true);

  // ===== ZOOM OVERLAY =====
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
    zoomClose && zoomClose.focus();
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
  buildGallery();
})();
