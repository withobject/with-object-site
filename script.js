// script.js

// ——————————————————————————————————————————————————————
// Sound Setup
const hoverSound = new Audio('Assets-2/site-sound_hover_v1.mp3');
const clickSound = new Audio('Assets-2/site-sound_click_v1.mp3');
hoverSound.volume = 1.0;
clickSound.volume = 1.0;

// ——————————————————————————————————————————————————————
// Dark Mode & Sound Toggles
let soundEnabled = localStorage.getItem("soundEnabled") !== "false";
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

const darkToggle = document.getElementById("darkToggle");
if (darkToggle) {
  darkToggle.textContent = document.body.classList.contains("dark")
    ? "DARK MODE: OFF"
    : "DARK MODE: ON";
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
  el.addEventListener("mouseenter", () => { if (soundEnabled) hoverSound.play(); });
  el.addEventListener("click", () =>    { if (soundEnabled) clickSound.play(); });
});

// ——————————————————————————————————————————————————————
// Captions Data & Formatter
const captions = [
  "Our field correspondent, Patch, scans the dark for a signal.",
  "Torn frame scanned from a disrupted contact sheet - nature as fractured pattern. - Untitled",
  "Low-cost iconography sampled from street ephemera. Handcrafted printout. - Sample",
  "Visual for brand imprints - recorded from previous timeline. - Logos/Marks",
  "Captioned terrain reshaped with cutout lettering. - Low Recordings",
  "Typographic experiment composed under noise pressure and visual loopback. - Kaf Oaks",
  "Studio transmission rerouted through analog delay — trusted and tactile. - Florian Gouello",
  "Reconstructed test strip from corrupted broadcast scan. - Infinite Cycle"
];
function formatCaption(text) {
  const i = text.lastIndexOf(" - ");
  if (i !== -1) {
    const desc  = text.slice(0, i).trim();
    const title = text.slice(i + 3).trim();
    return `${desc} — <strong>${title}</strong>`;
  }
  return text;
}

// ——————————————————————————————————————————————————————
// Find-the-Object Game Logic (unchanged)
// … (your existing game code here) …

// ——————————————————————————————————————————————————————
// Gallery & Fullscreen
const heroGallery       = document.getElementById("heroGallery");
const mediaItems        = document.querySelectorAll(".gallery-item");
const viewBtn           = document.getElementById("viewBtn");
const fullscreenOverlay = document.getElementById("fullscreenOverlay");
const fullscreenContent = document.getElementById("fullscreenContent");
const fullscreenCaption = document.getElementById("fullscreenCaption");
const closeFS           = document.getElementById("closeFullscreen");

let currentIndex = 0;
function showMedia(idx) {
  mediaItems.forEach((it,i)=> it.classList.toggle("active", i===idx));
}
function openFullscreen() {
  fullscreenOverlay.classList.add("active");
  const clone = mediaItems[currentIndex].cloneNode(true);
  if (clone.tagName==="VIDEO") {
    clone.autoplay=true; clone.loop=true;
    clone.muted=true;   clone.playsInline=true;
  }
  fullscreenContent.innerHTML="";
  fullscreenContent.appendChild(clone);
  fullscreenCaption.innerHTML = formatCaption(captions[currentIndex]||"");
}

if (heroGallery) {
  heroGallery.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % mediaItems.length;
    showMedia(currentIndex);
    if (soundEnabled) clickSound.play();
  });
}
if (viewBtn) {
  viewBtn.addEventListener("click", e => {
    e.stopPropagation();
    openFullscreen();
    if (soundEnabled) clickSound.play();
  });
}
if (closeFS) {
  closeFS.addEventListener("mouseenter", ()=>{ if (soundEnabled) hoverSound.play(); });
  closeFS.addEventListener("click", ()=> {
    fullscreenOverlay.classList.remove("active");
    fullscreenContent.innerHTML="";
    if (soundEnabled) clickSound.play();
  });
}
fullscreenContent.addEventListener("click", ()=>{
  const el = fullscreenContent.firstChild;
  if (!el) return;
  if (el.style.transform==="scale(1.5)") {
    el.style.transform="scale(1)"; el.style.cursor="zoom-in";
  } else {
    el.style.transform="scale(1.5)"; el.style.cursor="zoom-out";
  }
});

// Navigation zones for fullscreen
["left","right"].forEach(dir=>{
  const z = document.createElement("div");
  z.className = `click-zone fs-${dir}-zone`;
  fullscreenOverlay.appendChild(z);
  z.addEventListener("click", e=>{
    e.stopPropagation();
    currentIndex = dir==="left"
      ? (currentIndex-1+mediaItems.length)%mediaItems.length
      : (currentIndex+1)%mediaItems.length;
    openFullscreen();
  });
});

// Swipe support
let startX=0;
fullscreenOverlay.addEventListener("touchstart", e=>startX=e.touches[0].clientX);
fullscreenOverlay.addEventListener("touchend", e=>{
  const dx = e.changedTouches[0].clientX - startX;
  if (dx>50)  currentIndex=(currentIndex-1+mediaItems.length)%mediaItems.length;
  if (dx<-50) currentIndex=(currentIndex+1)%mediaItems.length;
  openFullscreen();
});

// ——————————————————————————————————————————————————————
// NEW: “CLICK HERE” Cursor Text
document.addEventListener("DOMContentLoaded", ()=>{
  if (!heroGallery) return;
  const lbl = document.createElement("div");
  lbl.className = "cursor-text";
  lbl.innerText  = "CLICK HERE";
  document.body.appendChild(lbl);

  heroGallery.addEventListener("mouseenter", ()=> lbl.style.display="block");
  heroGallery.addEventListener("mousemove", e=>{
    lbl.style.left = e.clientX + "px";
    lbl.style.top  = e.clientY + "px";
  });
  heroGallery.addEventListener("mouseleave", ()=> lbl.style.display="none");
});
