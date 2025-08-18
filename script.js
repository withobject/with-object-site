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
  const img       = document.getElementById('zoomImage');
  const prevBtn   = document.getElementById('prevBtn');
  const nextBtn   = document.getElementById('nextBtn');

  const menuToggle = document.getElementById('menuToggle');
  const mainMenu   = document.getElementById('mainMenu');

  const infoToggle = document.getElementById('infoToggle');
  const infoPopup  = document.getElementById('infoPopup');

  const colorModeToggle = document.getElementById('colorModeToggle');
  const soundToggleEl   = document.getElementById('soundToggle');

  const emailToggle      = document.getElementById('emailToggle');
  const contactContainer = document.querySelector('.contact-container');

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

  // ===== CLOSE POPUPS WHEN CLICKING OUTSIDE =====
  document.addEventListener('click', (event) => {
    // Info popup
    if (infoPopup && infoToggle && !infoPopup.hidden) {
      if (!infoPopup.contains(event.target) && !infoToggle.contains(event.target)) {
        infoPopup.hidden = true;
        infoToggle.setAttribute('aria-expanded', 'false');
      }
    }
    // Main menu
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
  let currentIndex   = 0;
  let currentProject = 0;
  let zoomed         = false;
  const isMobile     = /iPhone|iPad|Android|Mobile/i.test(navigator.userAgent);

  // ===== PROJECT DATA (index only uses these) =====
  const projectImages = [
    [
      'Assets/cd_player_frame1_v2.png',
      'https://i.pinimg.com/1200x/db/6e/55/db6e553509254016b399fb3ed17f1d13.jpg',
      'https://i.pinimg.com/736x/ec/32/df/ec32dfd758ebf7cdad50d633638d9410.jpg',
      'https://i.pinimg.com/1200x/f9/48/bb/f948bb6a474d73b73b7b24ef0fa10234.jpg',
      'https://i.pinimg.com/1200x/8a/1d/8f/8a1d8f22816b78b3436566aeba72d438.jpg',
      'https://i.pinimg.com/736x/93/ff/da/93ffda5ebed346ae89a3966d3b1811cd.jpg',
      'https://i.pinimg.com/1200x/73/89/5e/73895e8340a893f382c6465f7d366f9b.jpg',
      'https://i.pinimg.com/736x/06/25/02/062502e1df4deca275377dd63e406a88.jpg',
      'https://i.pinimg.com/736x/77/b1/2d/77b12d5b643ab9130113e3ea6cbd4dce.jpg'
    ],
    [
      'https://i.pinimg.com/736x/ec/32/df/ec32dfd758ebf7cdad50d633638d9410.jpg',
      'https://i.pinimg.com/1200x/f9/48/bb/f948bb6a474d73b73b7b24ef0fa10234.jpg'
    ],
    [
      'https://i.pinimg.com/1200x/8a/1d/8f/8a1d8f22816b78b3436566aeba72d438.jpg',
      'https://i.pinimg.com/736x/93/ff/da/93ffda5ebed346ae89a3966d3b1811cd.jpg'
    ]
  ];

  const projectInfo = [
    {
      title: 'Project One',
      objective: 'Create a tactile, memory-charged alias for raw creative output—rooted in design, sound, and motion, shaped by the past but built to adapt. WITH love',
      final: 'An evolving system and digital space-serving as archive, interface, and launchpad for experimental work across disciplines.'
    },
    {
      title: 'Project Two',
      objective: 'Portrait study on color and noise',
      final: 'Minimal series for concept gallery'
    },
    {
      title: 'Project Three',
      objective: 'Fashion vs Techwear contrast',
      final: 'Capsule lookbook for launch'
    }
  ];

  // ===== IMAGE NAV (index only) =====
  if (img && prevBtn && nextBtn) {
    let images = [...projectImages[currentProject]];

    function updateImage() {
      img.src = images[currentIndex];
      img.alt = projectInfo[currentProject].title;
      img.style.transform = 'scale(1)';
      img.style.cursor = isMobile ? 'default' : 'zoom-in';
      zoomed = false;
      prevBtn.style.display = currentIndex === 0 ? 'none' : 'block';
      nextBtn.style.display = currentIndex === images.length - 1 ? 'none' : 'block';
    }

    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateImage();
      }
    });

    nextBtn.addEventListener('click', () => {
      if (currentIndex < images.length - 1) {
        currentIndex++;
        updateImage();
      }
    });

    if (!isMobile) {
      img.addEventListener('click', () => {
        zoomed = !zoomed;
        img.style.transform = zoomed ? 'scale(2)' : 'scale(1)';
        img.style.cursor = zoomed ? 'zoom-out' : 'zoom-in';
        document.body.style.overflow = zoomed ? 'auto' : 'hidden';
        document.documentElement.style.overflow = zoomed ? 'auto' : 'hidden';
      });
    }

    const projectBoxes = document.querySelectorAll('.project-box');
    projectBoxes.forEach((box) => {
      box.addEventListener('click', (e) => {
        const pid = parseInt(e.currentTarget.getAttribute('data-project'), 10);
        currentProject = pid;
        currentIndex = 0;
        images = [...projectImages[pid]];
        updateImage();
        updateProjectInfo(pid);
        projectBoxes.forEach((b) => b.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
      });
    });

    function updateProjectInfo(pid) {
      if (!infoTitle || !infoObjectives.length || !infoBodies.length) return;
      const info = projectInfo[pid];
      infoTitle.textContent = info.title;
      infoObjectives[0].textContent = 'OBJECTIVE';
      infoBodies[0].textContent = info.objective;
      infoObjectives[1].textContent = 'FINAL OBJECT';
      infoBodies[1].textContent = info.final;
    }

    // INIT (index only)
    updateImage();
    updateProjectInfo(currentProject);
    const firstDot = document.querySelector('.project-box');
    if (firstDot) firstDot.classList.add('selected');
  }

  // ===== COLOR MODE TOGGLE (shared) =====
  if (colorModeToggle) {
    colorModeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      const current = document.body.className || 'theme-light';
      const next = nextThemeClass(current);
      document.body.className = next;
      saveTheme(next);
    });
  }

  // ===== SOUND MODE (shared, robust) =====
  // Your asset filenames (exact, under Assets/)
  const SFX = {
    click:    new Audio('Assets/new_click_next_sound_v1.mp3'),   // used for generic clicks
    hover:    new Audio('Assets/new_hover_sound_v1.mp3'),
    next:     new Audio('Assets/new_click_next_sound_v1.mp3'),
    prev:     new Audio('Assets/new_click_prev_sound_v1.mp3'),
    dead:     new Audio('Assets/new_deadclick_sound_v1.mp3'),
    error:    new Audio('Assets/new_errorclick_sound_v1.mp3')    // exposed for future use
  };

  // Preload so first play isn't silent
  Object.values(SFX).forEach(a => {
    try { a.preload = 'auto'; a.load(); } catch {}
  });

  // First-time visitors default to sound ON
  if (localStorage.getItem(SOUND_KEY) == null) {
    localStorage.setItem(SOUND_KEY, 'on');
  }

  let soundEnabled = getSavedSoundOn();

  function setSoundLabel(el, on) {
    if (!el) return;
    el.textContent = on ? 'Sound On' : 'Sound Off';
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

  // Unlock audio on first real user gesture (mobile Safari/Chrome)
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

  // Safe play helpers
  function playSfx(a) {
    if (!soundEnabled || !a) return;
    try {
      a.currentTime = 0;
      a.play().catch(() => {});
    } catch {}
  }
  // Backward-compatible wrapper for any legacy calls
  function playSound(audioObj) { playSfx(audioObj); }

  // What counts as interactive on your site
  const INTERACTIVE_SELECTOR = [
    'a',
    'button',
    '.menu-toggle',
    '.nav',            // arrow buttons
    '.project-box',    // project dots
    '#infoToggle',
    '#soundToggle',
    '#colorModeToggle',
    '.logo-link'
  ].join(',');

  // Utilities to guard against non-Element event targets
  const asEl = (n) => (n && n.nodeType === 1 ? /** @type {Element} */ (n) : null);

  // Click sounds: delegate so it works for dynamic menu items too
  document.addEventListener('click', (e) => {
    const target = asEl(e.target);
    const el = target ? target.closest(INTERACTIVE_SELECTOR) : null;
    if (el) {
      // Specific routing for the gallery arrows
      if (el.id === 'nextBtn') return playSfx(SFX.next);
      if (el.id === 'prevBtn') return playSfx(SFX.prev);
      return playSfx(SFX.click);
    }
    // Background (non-interactive) click = dead click
    playSfx(SFX.dead);
  }, true);

  // Hover/focus sounds (pointerenter covers mouse/pen; focusin for keyboard; mouseenter as fallback)
  const hoverHandler = (e) => {
    const target = asEl(e.target);
    const el = target ? target.closest(INTERACTIVE_SELECTOR) : null;
    if (el) playSfx(SFX.hover);
  };
  document.addEventListener('pointerenter', hoverHandler, true);
  document.addEventListener('mouseenter', hoverHandler, true);
  document.addEventListener('focusin', hoverHandler, true);

  // Make available for pages that want to re-sync labels after load
  window.initializeSoundSystem = function initializeSoundSystem() {
    setSoundLabel(document.getElementById('soundToggle'), getSavedSoundOn());
  };

  // ===== EMAIL TOGGLE (if present) =====
  if (emailToggle && contactContainer) {
    emailToggle.addEventListener('click', () => {
      contactContainer.classList.toggle('show-email');
      playSfx(SFX.click);
    });
    emailToggle.addEventListener('mouseenter', () => playSfx(SFX.hover));
  }
})(); 

// === ABOUT PAGE SWAP LOGIC ===
(function () {
  const aboutLink = document.getElementById('aboutMenuLink');
  if (!aboutLink) return;

  // Detect if we are currently on the About page
  const onAboutPage = window.location.pathname.endsWith('about.html');

  if (onAboutPage) {
    aboutLink.textContent = 'Home';
    aboutLink.setAttribute('href', 'index.html');
  } else {
    aboutLink.textContent = 'About';
    aboutLink.setAttribute('href', 'about.html');
  }
})();
