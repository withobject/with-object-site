// SETTINGS PERSISTENCE
const themes = [
  { name: 'DARK', class: 'theme-dark' },
  { name: 'LIGHT', class: 'theme-light' },
  { name: 'CRT', class: 'theme-crt' },
  { name: 'BLUE', class: 'theme-blue' },
  { name: 'AMBER', class: 'theme-amber' }
];

let currentThemeIndex = 0;
let soundOn = true;

function loadSettings() {
  // Load sound setting (default: true)
  const savedSoundSetting = localStorage.getItem('soundOn');
  soundOn = savedSoundSetting !== null ? JSON.parse(savedSoundSetting) : true;
  
  // Load theme setting (default: 0 for dark theme)
  const savedThemeIndex = localStorage.getItem('themeIndex');
  currentThemeIndex = savedThemeIndex !== null ? parseInt(savedThemeIndex) : 0;
  
  // Apply settings
  applySoundSetting();
  applyThemeSetting();
}

function saveSettings() {
  localStorage.setItem('soundOn', JSON.stringify(soundOn));
  localStorage.setItem('themeIndex', currentThemeIndex.toString());
}

function applySoundSetting() {
  const soundToggle = document.querySelector('.sound-toggle');
  const soundToggleMobile = document.querySelector('.sound-toggle-mobile');
  if (soundToggle) {
    soundToggle.textContent = soundOn ? 'SOUND ON_' : 'SOUND OFF_';
  }
  if (soundToggleMobile) {
    soundToggleMobile.textContent = soundOn ? 'SOUND ON_' : 'SOUND OFF_';
  }
  
  // Update audio volumes if they exist
  if (typeof clickSound !== 'undefined') {
    clickSound.volume = soundOn ? 1.0 : 0.0;
  }
  if (typeof boundarySound !== 'undefined') {
    boundarySound.volume = soundOn ? 0.7 : 0.0; // Slightly quieter than other sounds
  }
  if (typeof nextClickSound !== 'undefined') {
    nextClickSound.volume = soundOn ? 1.0 : 0.0;
  }
  if (typeof prevClickSound !== 'undefined') {
    prevClickSound.volume = soundOn ? 1.0 : 0.0;
  }
}

function applyThemeSetting() {
  // Remove all theme classes
  themes.forEach(theme => {
    document.body.classList.remove(theme.class);
  });
  
  // Apply current theme
  document.body.classList.add(themes[currentThemeIndex].class);
  
  // Update toggle text
  const colorToggle = document.querySelector('.color-toggle');
  if (colorToggle) {
    colorToggle.textContent = `COLOR MODE_`;
  }
}

// PROJECT NAVIGATION LOGIC
let currentProjectIndex = 0;
let currentSectionIndex = 0; // 0: hero, 1: case study, 2: additional media
const totalProjects = 5;
const totalSections = 5;
let isNavigating = false;
let animationFrameId = null;

// MOBILE OPTIMIZATION - Use RAF for smooth performance
function smoothTransition(callback) {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  
  animationFrameId = requestAnimationFrame(() => {
    callback();
    animationFrameId = null;
  });
}

class NumberScrambler {
  constructor(element) {
    this.element = element;
    this.chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    this.isScrambling = false;
  }

  scramble(finalNumber, duration = 300) {
    if (this.isScrambling) return;
    
    this.isScrambling = true;
    const startTime = Date.now();
    const finalText = finalNumber.toString().padStart(3, '0');
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (progress < 1) {
        // Generate scrambled text
        let scrambledText = '';
        for (let i = 0; i < 3; i++) {
          if (Math.random() < progress) {
            // Gradually reveal the final character
            scrambledText += finalText[i];
          } else {
            // Show random character
            scrambledText += this.chars[Math.floor(Math.random() * this.chars.length)];
          }
        }
        this.element.textContent = scrambledText;
        requestAnimationFrame(animate);
      } else {
        // Animation complete - show final number
        this.element.textContent = finalText;
        this.isScrambling = false;
      }
    };
    
    animate();
  }
}

class TextScrambler {
  constructor(element) {
    this.element = element;
    this.chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    this.isScrambling = false;
  }

  scramble(finalText, duration = 300) {
    if (this.isScrambling) return;
    
    this.isScrambling = true;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (progress < 1) {
        // Generate scrambled text
        let scrambledText = '';
        for (let i = 0; i < finalText.length; i++) {
          if (Math.random() < progress) {
            // Gradually reveal the final character
            scrambledText += finalText[i];
          } else {
            // Show random character or space for spaces
            if (finalText[i] === ' ') {
              scrambledText += ' ';
            } else {
              scrambledText += this.chars[Math.floor(Math.random() * this.chars.length)];
            }
          }
        }
        this.element.textContent = scrambledText;
        requestAnimationFrame(animate);
      } else {
        // Animation complete - show final text
        this.element.textContent = finalText;
        this.isScrambling = false;
      }
    };
    
    animate();
  }
}

// Initialize number scrambler
const galleryNumberElement = document.getElementById('galleryNumber');
const numberScrambler = galleryNumberElement ? new NumberScrambler(galleryNumberElement) : null;

// Initialize section title scrambler
const sectionTitleElement = document.getElementById('sectionTitle');
const sectionTitleScrambler = sectionTitleElement ? new TextScrambler(sectionTitleElement) : null;

// Initialize frame title scrambler
const frameTitleElement = document.getElementById('frameTitle');
const frameTitleScrambler = frameTitleElement ? new TextScrambler(frameTitleElement) : null;

// Section titles data
const projectTitles = [
  'WHO IS WITH OBJECT? 01',
  'DAFFI ALBUM ART 02', 
  'LOW RECORDS 03',
  'THE NIGHTBEAR 04',
  'ALTERNATE TIMELINES 05'
];

const sectionNames = [
  'HERO',
  'CASE STUDY', 
  'MEDIA 01',
  'MEDIA 02',
  'MEDIA 03'
];

// Update section title
function updateSectionTitle() {
  const sectionTitleElement = document.getElementById('sectionTitle');
  const frameTitleElement = document.getElementById('frameTitle');
  
  if (sectionTitleElement) {
    const projectTitle = projectTitles[currentProjectIndex];
    const sectionName = sectionNames[currentSectionIndex];
    const newTitle = `${projectTitle} — ${sectionName}`;
    
    // Scramble the section title
    if (sectionTitleScrambler) {
      sectionTitleScrambler.scramble(newTitle);
    } else {
      sectionTitleElement.textContent = newTitle;
    }
  }
  
  // Update frame title
  if (frameTitleElement) {
    const frameNumber = (currentSectionIndex + 1).toString().padStart(2, '0');
    const newFrameTitle = `FRAME ${frameNumber}`;
    
    // Scramble the frame title
    if (frameTitleScrambler) {
      frameTitleScrambler.scramble(newFrameTitle);
    } else {
      frameTitleElement.textContent = newFrameTitle;
    }
  }
}

// Project navigation functions
function switchToProject(index) {
  if (isNavigating) return;
  
  smoothTransition(() => {
    isNavigating = true;
    
    // Hide current project
    const currentProject = document.querySelector('.project.active');
    if (currentProject) {
      currentProject.classList.remove('active');
    }
    
    // Show new project
    const newProject = document.querySelector(`.project[data-project="${index}"]`);
    if (newProject) {
      newProject.classList.add('active');
    }
    
    // Reset to hero section
    currentSectionIndex = 0;
    scrollToSection(index, currentSectionIndex);
    
    // Update gallery number
    if (numberScrambler) {
      numberScrambler.scramble(index + 1);
    }
    
    // Update section title
    updateSectionTitle();
    
    // Reset navigation flag after transition (match CSS transition duration)
    setTimeout(() => {
      isNavigating = false;
    }, 500);
  });
}

function scrollToSection(projectIndex, sectionIndex) {
  smoothTransition(() => {
    const projectSections = document.getElementById(`projectSections${projectIndex}`);
    if (projectSections) {
      const translateX = -sectionIndex * 20; // Each section is 20% wide
      projectSections.style.transform = `translateX(${translateX}%)`;
    }
  });
}

function nextProject() {
  if (isNavigating) return;
  currentProjectIndex = (currentProjectIndex + 1) % totalProjects;
  switchToProject(currentProjectIndex);
  if (typeof clickSound !== 'undefined' && soundOn) {
    clickSound.play().catch(() => {});
  }
}

function prevProject() {
  if (isNavigating) return;
  currentProjectIndex = (currentProjectIndex - 1 + totalProjects) % totalProjects;
  switchToProject(currentProjectIndex);
  if (typeof prevClickSound !== 'undefined' && soundOn) {
    prevClickSound.play().catch(() => {});
  }
}

function nextSection() {
  if (isNavigating) return;
  // Check if we're at the last section for the current project
  const maxSections = currentProjectIndex === 3 ? 3 : 4; // Project 4 (THE NIGHTBEAR) has only 4 sections (0-3)
  
  if (currentSectionIndex < maxSections) {
    smoothTransition(() => {
      isNavigating = true;
      currentSectionIndex++;
      scrollToSection(currentProjectIndex, currentSectionIndex);
      updateSectionTitle();
      if (typeof nextClickSound !== 'undefined' && soundOn) {
        nextClickSound.play().catch(() => {});
      }
      setTimeout(() => {
        isNavigating = false;
      }, 500);
    });
  } else {
    // User is at last section - go to next project
    nextProject();
  }
}

function prevSection() {
  if (isNavigating) return;
  if (currentSectionIndex > 0) {
    smoothTransition(() => {
      isNavigating = true;
      currentSectionIndex--;
      scrollToSection(currentProjectIndex, currentSectionIndex);
      updateSectionTitle();
      if (typeof prevClickSound !== 'undefined' && soundOn) {
        prevClickSound.play().catch(() => {});
      }
      setTimeout(() => {
        isNavigating = false;
      }, 500);
    });
  } else {
    // User is at first section - go to previous project
    prevProject();
  }
}

// CURSOR OVERLAY AND CLICK ZONES
const overlay = document.getElementById('galleryOverlay');
const scrollContainer = document.querySelector('.scroll-container');

if (scrollContainer && overlay) {
  scrollContainer.addEventListener('mousemove', (e) => {
    const rect = scrollContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const isLeftSide = x < width / 2;
    
    // Update overlay text based on mouse position
    let overlayText = '';
    
    if (isLeftSide) {
      // Left side shows PREV (frame or project)
      overlayText = '[ PREV FRAME ]';
    } else {
      // Right side shows NEXT (frame or project)
      overlayText = '[ NEXT FRAME ]';
    }
    
    overlay.textContent = overlayText;
    overlay.style.left = e.clientX + 'px';
    overlay.style.top = (e.clientY - 25) + 'px';
    
    // Always show overlay since there's always navigation available
    overlay.style.display = 'block';
  });

  scrollContainer.addEventListener('mouseenter', () => {
    // Don't automatically show overlay - let mousemove handle it
  });

  scrollContainer.addEventListener('mouseleave', () => {
    overlay.style.display = 'none';
  });

  // Click navigation for sections
  scrollContainer.addEventListener('click', (e) => {
    const rect = scrollContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const isLeftSide = x < width / 2;
    
    if (isLeftSide) {
      // Left side always goes to previous (section or project)
      prevSection();
    } else {
      // Right side always goes to next (section or project)
      nextSection();
    }
  });
}

// SCROLL EVENT HANDLING
let scrollTimeout;
let touchTimeout;

if (scrollContainer) {
  // Touch handling
  let touchStartX = 0;
  let touchStartY = 0;
  
  scrollContainer.addEventListener('touchstart', (e) => {
    // Clear any existing touch timeout
    if (touchTimeout) {
      clearTimeout(touchTimeout);
    }
    
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  
  scrollContainer.addEventListener('touchend', (e) => {
    // Use timeout to prevent scroll lock stutter
    touchTimeout = setTimeout(() => {
      smoothTransition(() => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        // Only respond to horizontal swipes
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
          // Horizontal swipe only - navigate sections
          if (deltaX > 0) {
            prevSection();
          } else {
            nextSection();
          }
        }
      });
    }, 16); // ~60fps timing
  }, { passive: true });
}

// KEYBOARD NAVIGATION
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prevSection();
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    nextSection();
  }
});

// GLOBAL CLICK HANDLER FOR NON-CLICKABLE AREAS
document.addEventListener('click', (e) => {
  // Check if the clicked element or its parents are clickable
  const clickableSelectors = [
    'a', 'button', 
    '.nav-item', '.mobile-nav-item', 
    '.view-project-toggle', '.square-button',
    '.sound-toggle', '.sound-toggle-mobile',
    '.color-toggle', '.color-toggle-mobile',
    '.close-button', '.email-link',
    '.logo', '.burger-menu',
    '#prevSetBtn', '#nextSetBtn', '#returnToBeginningBtn',
    '.scroll-container', '.project-container',
    '.info-button', '[role="button"]', '[tabindex="0"]'
  ];
  
  // Check if click target or any parent matches clickable selectors
  let isClickable = false;
  let element = e.target;
  
  while (element && element !== document.body) {
    for (const selector of clickableSelectors) {
      if (element.matches && element.matches(selector)) {
        isClickable = true;
        break;
      }
    }
    if (isClickable) break;
    element = element.parentElement;
  }
  
  // If not clickable and sound is on, play boundary sound
  if (!isClickable && typeof boundarySound !== 'undefined' && soundOn) {
    boundarySound.play().catch(() => {});
  }
});
// NAVIGATION BUTTONS
const prevSetBtn = document.getElementById('prevSetBtn');
const nextSetBtn = document.getElementById('nextSetBtn');

if (prevSetBtn) {
  prevSetBtn.addEventListener('click', () => {
    prevProject();
  });
}

if (nextSetBtn) {
  nextSetBtn.addEventListener('click', () => {
    nextProject();
  });
}

// RETURN TO BEGINNING BUTTON
const returnToBeginningBtn = document.getElementById('returnToBeginningBtn');

if (returnToBeginningBtn) {
  returnToBeginningBtn.addEventListener('click', () => {
    if (isNavigating) return;
    
    // Return to hero section (section 0) of current project
    if (currentSectionIndex !== 0) {
      smoothTransition(() => {
        isNavigating = true;
        currentSectionIndex = 0;
        scrollToSection(currentProjectIndex, currentSectionIndex);
        updateSectionTitle();
        
        if (typeof clickSound !== 'undefined' && soundOn) {
          clickSound.play().catch(() => {});
        }
        
        setTimeout(() => {
          isNavigating = false;
        }, 500);
      });
    }
  });
}

// TOGGLES
const soundToggle = document.querySelector('.sound-toggle');
const colorToggle = document.querySelector('.color-toggle');
const soundToggleMobile = document.querySelector('.sound-toggle-mobile');
const colorToggleMobile = document.querySelector('.color-toggle-mobile');

if (soundToggle) {
  soundToggle.addEventListener('click', () => {
    soundOn = !soundOn;
    applySoundSetting();
    saveSettings();
  });
}

if (soundToggleMobile) {
  soundToggleMobile.addEventListener('click', () => {
    soundOn = !soundOn;
    applySoundSetting();
    saveSettings();
  });
}

if (colorToggle) {
  colorToggle.addEventListener('click', () => {
    // Cycle to next theme
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    applyThemeSetting();
    saveSettings();
  });
}

if (colorToggleMobile) {
  colorToggleMobile.addEventListener('click', () => {
    // Cycle to next theme
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    applyThemeSetting();
    saveSettings();
  });
}

// AUDIO
const clickSound = new Audio('Assets/new_click_next_sound_v1.mp3');
const boundarySound = new Audio('Assets/new_errorclick_sound_v1.mp3');
const nextClickSound = new Audio('Assets/new_click_next_sound_v1.mp3');
const prevClickSound = new Audio('Assets/new_click_prev_sound_v1.mp3');

// COMPREHENSIVE SOUND SYSTEM - Works on all pages and elements
function initializeSoundSystem() {
  // Wait for sounds to be created
  if (!clickSound) {
    setTimeout(initializeSoundSystem, 100);
    return;
  }

  // Define clickable selectors that should use clickSound
  const clickableSelectors = [
    '.nav-item', '.mobile-nav-item',
    '.sound-toggle', '.sound-toggle-mobile',
    '.color-toggle', '.color-toggle-mobile',
    '.close-button', '.email-link',
    '.logo', '.burger-menu',
    '.square-button'
  ];


  // Add click sounds to specific UI elements only
  clickableSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      // Remove existing listeners to prevent duplicates
      element.removeEventListener('click', playClickSound);
      element.addEventListener('click', playClickSound);
    });
  });

}

// Sound playing functions
function playClickSound(e) {
  if (clickSound && soundOn) {
    clickSound.play().catch(() => {});
  }
}

// Initialize sound system when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSoundSystem);
} else {
  initializeSoundSystem();
}

// Reinitialize when page becomes visible (for navigation between pages)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    setTimeout(initializeSoundSystem, 100);
  }
});

// INITIALIZE
// Show first project
const firstProject = document.querySelector('.project[data-project="0"]');
if (firstProject) {
  firstProject.classList.add('active');
}

if (numberScrambler) {
  numberScrambler.scramble(currentProjectIndex + 1);
}

// Initialize section title
updateSectionTitle();

// Load settings on page load
loadSettings();

// MOBILE MENU FUNCTIONALITY
// MEDIA LOADING SYSTEM
class MediaLoader {
  constructor() {
    this.initializeMediaLoading();
  }
  
  initializeMediaLoading() {
    // Get all gallery media items
    const mediaItems = document.querySelectorAll('.gallery-media');
    
    mediaItems.forEach(media => {
      if (media.tagName === 'IMG') {
        this.handleImageLoading(media);
      } else if (media.tagName === 'VIDEO') {
        this.handleVideoLoading(media);
      }
    });
  }
  
  handleImageLoading(img) {
    // If image is already loaded (cached)
    if (img.complete && img.naturalHeight !== 0) {
      this.onMediaLoaded(img);
      return;
    }
    
    // Set up load event listener
    img.addEventListener('load', () => {
      this.onMediaLoaded(img);
    });
    
    // Handle error case
    img.addEventListener('error', () => {
      this.onMediaError(img);
    });
  }
  
  handleVideoLoading(video) {
    // For videos, wait for metadata to be loaded
    video.addEventListener('loadedmetadata', () => {
      this.onMediaLoaded(video);
    });
    
    // Also try canplay event as backup
    video.addEventListener('canplay', () => {
      this.onMediaLoaded(video);
    });
    
    // Handle error case
    video.addEventListener('error', () => {
      this.onMediaError(video);
    });
    
    // Force load the video
    video.load();
  }
  
  onMediaLoaded(media) {
    // Add loaded class to trigger fade-in
    media.classList.add('loaded');
    
    // Optional: Remove placeholder after transition completes
    setTimeout(() => {
      const wrapper = media.closest('.media-wrapper');
      const placeholder = wrapper?.querySelector('.media-placeholder');
      if (placeholder) {
        placeholder.style.display = 'none';
      }
    }, 600); // Match CSS transition duration
  }
  
  onMediaError(media) {
    // Still show the media even if there's an error
    // This prevents infinite loading states
    console.warn('Media failed to load:', media.src);
    this.onMediaLoaded(media);
  }
  
  // Method to reinitialize when new content is added
  reinitialize() {
    this.initializeMediaLoading();
  }
}

// Initialize media loader
const mediaLoader = new MediaLoader();

const burgerMenu = document.getElementById('burgerMenu');
const mobileMenu = document.getElementById('mobileMenu');

function openMobileMenu() {
  burgerMenu.classList.add('active');
  mobileMenu.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeMobileMenu() {
  burgerMenu.classList.remove('active');
  mobileMenu.classList.remove('active');
  document.body.style.overflow = ''; // Restore scrolling
}

if (burgerMenu) {
  burgerMenu.addEventListener('click', () => {
    if (mobileMenu.classList.contains('active')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });
}

// Close mobile menu when clicking outside
if (mobileMenu) {
  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) {
      closeMobileMenu();
    }
  });
}
