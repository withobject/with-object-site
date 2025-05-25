const hoverSound = new Audio('Assets-2/site-sound_hover_v1.mp3');
const clickSound = new Audio('Assets-2/site-sound_click_v1.mp3');
hoverSound.volume = 1.0;
clickSound.volume = 1.0;

let soundEnabled = localStorage.getItem("soundEnabled") !== "false";
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

const darkToggle = document.getElementById("darkToggle");
if (darkToggle) {
  darkToggle.textContent = document.body.classList.contains("dark") ? "DARK MODE: OFF" : "DARK MODE: ON";
  darkToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const nowDark = document.body.classList.contains("dark");
    localStorage.setItem("darkMode", nowDark);
    darkToggle.textContent = nowDark ? "DARK MODE: OFF" : "DARK MODE: ON";
  });
}

const soundToggle = document.getElementById("soundToggle");
if (soundToggle) {
  soundToggle.textContent = soundEnabled ? "SOUND: OFF" : "SOUND: ON";
  soundToggle.classList.toggle("off", !soundEnabled);
  soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundToggle.textContent = soundEnabled ? "SOUND: OFF" : "SOUND: ON";
    soundToggle.classList.toggle("off", !soundEnabled);
    localStorage.setItem("soundEnabled", soundEnabled);
  });
}

document.querySelectorAll(".nav-btn, .sound-toggle, .dark-toggle, .email-link, button, a[href^='mailto']").forEach(el => {
  el.addEventListener("mouseenter", () => {
    if (soundEnabled) {
      hoverSound.currentTime = 0;
      hoverSound.play();
    }
  });
  el.addEventListener("click", () => {
    if (soundEnabled) {
      clickSound.currentTime = 0;
      clickSound.play();
    }
  });
});

// GAME LOGIC — only applies if game elements are present
if (document.getElementById("gameField")) {
  const object = document.getElementById("hiddenObject");
  const message = document.getElementById("foundMessage");
  const gameField = document.getElementById("gameField");
  const closeBtn = document.getElementById("closeBtn");
if (closeBtn) {
  closeBtn.addEventListener("mouseenter", () => {
    if (soundEnabled) {
      hoverSound.currentTime = 0;
      hoverSound.play();
    }
  });
  closeBtn.addEventListener("click", () => {
    if (soundEnabled) {
      clickSound.currentTime = 0;
      clickSound.play();
    }
  });
}


  let objectFound = false;

 function resetGame() {
  objectFound = false;
  message.style.display = "none";
  object.style.opacity = 0;
  object.style.pointerEvents = "none";

  // Randomize position AFTER hiding, THEN delay hover reactivation until user moves mouse again
  setTimeout(() => {
    randomPosition();
    waitForMouseMove();
  }, 50);
}

function randomPosition() {
  const containerRect = gameField.getBoundingClientRect();
  const objWidth = object.offsetWidth || 60;
  const objHeight = object.offsetHeight || 60;
  const maxX = containerRect.width - objWidth;
  const maxY = containerRect.height - objHeight;
  const x = Math.random() * maxX;
  const y = Math.random() * maxY;
  object.style.left = `${x}px`;
  object.style.top = `${y}px`;
}

// Hover reactivates only after real movement
function waitForMouseMove() {
  const enableHover = () => {
    object.style.pointerEvents = "auto";
    window.removeEventListener("mousemove", enableHover);
  };
  window.addEventListener("mousemove", enableHover);
}

object.addEventListener("mouseenter", () => {
  if (!objectFound) {
    object.style.opacity = 1;
  }
});
object.addEventListener("mouseleave", () => {
  if (!objectFound) {
    object.style.opacity = 0;
  }
});
object.addEventListener("click", (e) => {
  if (!objectFound) {
    e.stopPropagation();
    objectFound = true;
    object.style.opacity = 0; // Immediately hide after found
    object.style.pointerEvents = "none";
    message.style.display = "block";
    if (soundEnabled) {
      const foundSound = new Audio("Assets-2/site-sound_found_v1.mp3");
      foundSound.play();
    }
  }
});


  gameField.addEventListener("click", () => {
    if (objectFound) resetGame();
  });



  if (closeBtn) {
    closeBtn.addEventListener("mouseenter", () => {
      if (soundEnabled) {
        hoverSound.currentTime = 0;
        hoverSound.play();
      }
    });
    closeBtn.addEventListener("click", () => {
      if (soundEnabled) {
        clickSound.currentTime = 0;
        clickSound.play();
      }
    });
  }

  if (!window.matchMedia("(pointer: coarse)").matches) {
    const trail = document.createElement("div");
    trail.className = "cursor-trail";
    document.body.appendChild(trail);
    let mouseX = 0, mouseY = 0, trailX = 0, trailY = 0;

    document.addEventListener("mousemove", e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateTrail() {
      trailX += (mouseX - trailX) * 0.15;
      trailY += (mouseY - trailY) * 0.15;
      trail.style.transform = `translate3d(${trailX - 5}px, ${trailY - 5}px, 0)`;
      requestAnimationFrame(animateTrail);
    }

    animateTrail();
  }

  window.onload = () => {
    setTimeout(() => {
      randomPosition();
    }, 100);
  };
}
// Gallery Logic
const heroGallery = document.getElementById("heroGallery");
const mediaItems = document.querySelectorAll(".gallery-item");
const viewBtn = document.getElementById("viewBtn");
const fullscreenOverlay = document.getElementById("fullscreenOverlay");
const fullscreenContent = document.getElementById("fullscreenContent");
const closeFullscreen = document.getElementById("closeFullscreen");

let currentIndex = 0;

function showMedia(index) {
  mediaItems.forEach((item, i) => {
    item.classList.toggle("active", i === index);
  });
}

function cloneCurrentMediaForFullscreen() {
  const activeItem = mediaItems[currentIndex];
  const clone = activeItem.cloneNode(true);
  if (clone.tagName === "VIDEO") {
    clone.controls = true;
    clone.autoplay = true;
    clone.loop = true;
    clone.muted = false;
  }
  fullscreenContent.innerHTML = "";
  fullscreenContent.appendChild(clone);
}

// Cycle on click
heroGallery.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % mediaItems.length;
  showMedia(currentIndex);
  if (soundEnabled) {
    clickSound.currentTime = 0;
    clickSound.play();
  }
});

// Fullscreen open
viewBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  fullscreenOverlay.classList.add("active");
  cloneCurrentMediaForFullscreen();
  if (soundEnabled) {
    clickSound.currentTime = 0;
    clickSound.play();
  }
});

// Fullscreen close
closeFullscreen.addEventListener("click", () => {
  fullscreenOverlay.classList.remove("active");
  fullscreenContent.innerHTML = "";
  if (soundEnabled) {
    clickSound.currentTime = 0;
    clickSound.play();
  }
});
fullscreenContent.addEventListener("click", (e) => {
  const el = fullscreenContent.firstChild;
  if (!el) return;

  if (el.style.transform === "scale(1.5)") {
    el.style.transform = "scale(1)";
    el.style.cursor = "zoom-in";
  } else {
    el.style.transform = "scale(1.5)";
    el.style.cursor = "zoom-out";
  }
});
// Cursor Text Prompt Setup (only show before first interaction)
const cursorPrompt = document.createElement("div");
cursorPrompt.className = "cursor-clickhere";
cursorPrompt.innerText = "CLICK HERE";
document.body.appendChild(cursorPrompt);

let hasClickedGallery = localStorage.getItem("clickedHeroGallery") === "true" ? true : false;

function moveCursorPrompt(e) {
  if (!hasClickedGallery) {
    cursorPrompt.style.left = `${e.clientX + 15}px`;
    cursorPrompt.style.top = `${e.clientY + 15}px`;
  }
}

// Activate special cursor only in hero/gallery
const gallery = document.getElementById("heroGallery");
if (gallery && !hasClickedGallery) {
  gallery.addEventListener("mouseenter", () => {
    document.body.classList.add("gallery-cursor");
    cursorPrompt.style.display = "block";
    window.addEventListener("mousemove", moveCursorPrompt);
  });

  gallery.addEventListener("mouseleave", () => {
    document.body.classList.remove("gallery-cursor");
    cursorPrompt.style.display = "none";
    window.removeEventListener("mousemove", moveCursorPrompt);
  });

  gallery.addEventListener("click", () => {
    if (!hasClickedGallery) {
      hasClickedGallery = true;
      localStorage.setItem("clickedHeroGallery", "true");
      cursorPrompt.style.display = "none";
      cursorPrompt.remove();
      window.removeEventListener("mousemove", moveCursorPrompt);
    }
  });
}
// Add click zones for media navigation
const leftZone = document.createElement("div");
const rightZone = document.createElement("div");
leftZone.className = "click-zone left-zone";
rightZone.className = "click-zone right-zone";
heroGallery.appendChild(leftZone);
heroGallery.appendChild(rightZone);

leftZone.addEventListener("click", (e) => {
  e.stopPropagation();
  currentIndex = (currentIndex - 1 + mediaItems.length) % mediaItems.length;
  showMedia(currentIndex);
  if (soundEnabled) {
    clickSound.currentTime = 0;
    clickSound.play();
  }
});

rightZone.addEventListener("click", (e) => {
  e.stopPropagation();
  currentIndex = (currentIndex + 1) % mediaItems.length;
  showMedia(currentIndex);
  if (soundEnabled) {
    clickSound.currentTime = 0;
    clickSound.play();
  }
});

// Add fullscreen forward/back buttons
const fsPrev = document.createElement("div");
const fsNext = document.createElement("div");
fsPrev.className = "fs-nav fs-prev";
fsNext.className = "fs-nav fs-next";
fsPrev.innerHTML = "&larr;";
fsNext.innerHTML = "&rarr;";
fullscreenOverlay.appendChild(fsPrev);
fullscreenOverlay.appendChild(fsNext);

fsPrev.addEventListener("click", (e) => {
  e.stopPropagation();
  currentIndex = (currentIndex - 1 + mediaItems.length) % mediaItems.length;
  cloneCurrentMediaForFullscreen();
});

fsNext.addEventListener("click", (e) => {
  e.stopPropagation();
  currentIndex = (currentIndex + 1) % mediaItems.length;
  cloneCurrentMediaForFullscreen();
});

// Modify fullscreen video to remove controls
function cloneCurrentMediaForFullscreen() {
  const activeItem = mediaItems[currentIndex];
  const clone = activeItem.cloneNode(true);
  if (clone.tagName === "VIDEO") {
    clone.removeAttribute("controls");
    clone.setAttribute("autoplay", true);
    clone.setAttribute("loop", true);
    clone.setAttribute("muted", true);
    clone.setAttribute("playsinline", true);
  }
  fullscreenContent.innerHTML = "";
  fullscreenContent.appendChild(clone);
}


