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

  // video (native controls on hover; overlay button no longer used)
  const videoEl = document.getElementById('mediaVideo');
  const muteBtn = document.getElementById('muteBtn'); // kept for compatibility; we’ll hide it

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
  let currentIndex   = 0;
  let currentProject = 0;
  let zoomed         = false;
  const isMobile     = /iPhone|iPad|Android|Mobile/i.test(navigator.userAgent);

  // ===== PROJECT DATA =====
  const projectImages = [
    [
      'Assets/wo_tease_frame5_v4.mp4',
      'Assets/cd_player_frame1_v2.png',
      'Assets/cellphone_frame1_v2.jpg',   // mixed media works
      'Assets/model1_frame3_v3.jpg',
      'Assets/cellphone_frame1_v2.jpg'
    ],
    [
      'Assets/glassindex_v1.jpg',
      'Assets/glassindex_v3.jpg',
      'Assets/glassindex_v2.jpg',
      'Assets/glassindex_v4.jpg',
      'Assets/glassindex_v5.jpg',
      'Assets/glassindex_v7.jpg',
      'Assets/glassindex_v6.jpg',
      'Assets/glassindex_v8.jpg',
      'Assets/glassindex_v9.jpg'  
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

  // ===== HELPERS =====
  function isVideoSrc(src) {
    return /\.(mp4|webm|ogg)(\?.*)?$/i.test(src);
  }
  const show = (el) => { if (!el) return; el.hidden = false; el.style.display = 'block'; el.style.opacity = '1'; };
  const hide = (el) => { if (!el) return; el.hidden = true;  el.style.display = 'none';  el.style.opacity = '0'; };

  // Native controls on hover/tap (no overlay buttons)
  let _videoHoverBound = false;
  function bindVideoHoverControls() {
    if (!videoEl || _videoHoverBound) return;
    _videoHoverBound = true;

    let hideTimer = null;
    const showControls = () => {
      videoEl.controls = true;
      if (hideTimer) clearTimeout(hideTimer);
    };
    const hideControls = () => {
      hideTimer = setTimeout(() => { videoEl.controls = false; }, 350);
    };

    // Desktop: pointer hover
    videoEl.addEventListener('pointerenter', showControls);
    videoEl.addEventListener('pointerleave', hideControls);

    // Mobile: brief controls on tap
    videoEl.addEventListener('touchstart', () => {
      showControls();
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => { videoEl.controls = false; }, 2500);
    }, { passive: true });
  }
  bindVideoHoverControls();

  // If an old muteBtn exists in the HTML, hide it permanently
  if (muteBtn) { muteBtn.hidden = true; muteBtn.style.display = 'none'; }

  // ===== MEDIA NAV =====
  if (img && prevBtn && nextBtn) {
    let images = [...projectImages[currentProject]];

    async function updateMedia() {
      const src   = images[currentIndex];
      const title = projectInfo[currentProject].title;
      const onVideo = isVideoSrc(src);

      if (onVideo) {
        // Hide image completely so it can't overlap
        hide(img);
        if (img) img.style.transform = 'scale(1)';

        // Show video
        if (videoEl) {
          show(videoEl);
          videoEl.controls = false;        // hidden until hover/tap
          videoEl.loop = true;
          videoEl.playsInline = true;
          videoEl.setAttribute('playsinline', '');
          videoEl.muted = true;            // needed for autoplay
          if (videoEl.src !== src) videoEl.src = src;
          try { await videoEl.play(); } catch {}
        }
      } else {
        // Hide video completely so it can't overlap and stop audio
        if (videoEl) {
          try { videoEl.pause(); } catch {}
          videoEl.controls = false;
          hide(videoEl);
          videoEl.removeAttribute('src');
          try { videoEl.load(); } catch {}
        }

        // Show image
        if (img) {
          img.src = src;
          img.alt = title;
          show(img);
          img.style.transform = 'scale(1)';
          img.style.cursor = isMobile ? 'default' : 'zoom-in';
          zoomed = false;
        }
      }

      // Arrow visibility
      prevBtn.style.display = currentIndex === 0 ? 'none' : 'block';
      nextBtn.style.display = currentIndex === images.length - 1 ? 'none' : 'block';
    }

    // Prev/Next handlers
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateMedia();
      }
    });

    nextBtn.addEventListener('click', () => {
      if (currentIndex < images.length - 1) {
        currentIndex++;
        updateMedia();
      }
    });

    // Image zoom
    if (!isMobile && img) {
      img.addEventListener('click', () => {
        zoomed = !zoomed;
        img.style.transform = zoomed ? 'scale(2)' : 'scale(1)';
        img.style.cursor = zoomed ? 'zoom-out' : 'zoom-in';
        document.body.style.overflow = zoomed ? 'auto' : 'hidden';
        document.documentElement.style.overflow = zoomed ? 'auto' : 'hidden';
      });
    }

    // Project dots
    const projectBoxes = document.querySelectorAll('.project-box');
    projectBoxes.forEach((box) => {
      box.addEventListener('click', (e) => {
        const pid = parseInt(e.currentTarget.getAttribute('data-project'), 10);
        currentProject = pid;
        currentIndex = 0;
        images = [...projectImages[pid]];
        updateMedia();
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

    // INIT
    updateMedia();
    updateProjectInfo(currentProject);
    const firstDot = document.querySelector('.project-box');
    if (firstDot) firstDot.classList.add('selected');
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
  function playSound(audioObj) { playSfx(audioObj); }

  const INTERACTIVE_SELECTOR = [
    'a','button','.menu-toggle','.nav','.project-box',
    '#infoToggle','#soundToggle','#colorModeToggle','.logo-link'
  ].join(',');
  const asEl = (n) => (n && n.nodeType === 1 ? n : null);

  document.addEventListener('click', (e) => {
    const target = asEl(e.target);
    const el = target ? target.closest(INTERACTIVE_SELECTOR) : null;
    if (el) {
      if (el.id === 'nextBtn') return playSfx(SFX.next);
      if (el.id === 'prevBtn') return playSfx(SFX.prev);
      return playSfx(SFX.click);
    }
    playSfx(SFX.dead);
  }, true);

  // disable hover sfx
  const hoverHandler = () => {};
  document.addEventListener('pointerenter', hoverHandler, true);
  document.addEventListener('mouseenter', hoverHandler, true);
  document.addEventListener('focusin', hoverHandler, true);

  window.initializeSoundSystem = function initializeSoundSystem() {
    setSoundLabel(document.getElementById('soundToggle'), getSavedSoundOn());
  };

  // ===== EMAIL TOGGLE =====
  if (emailToggle && contactContainer) {
    emailToggle.addEventListener('click', () => {
      contactContainer.classList.toggle('show-email');
      playSfx(SFX.click);
    });
  }
})(); 

// === ABOUT PAGE SWAP LOGIC ===
(function () {
  const aboutLink = document.getElementById('aboutMenuLink');
  if (!aboutLink) return;
  const onAboutPage = window.location.pathname.endsWith('about.html');
  if (onAboutPage) {
    aboutLink.textContent = 'Home';
    aboutLink.setAttribute('href', 'index.html');
  } else {
    aboutLink.textContent = 'About';
    aboutLink.setAttribute('href', 'about.html');
  }
})();
