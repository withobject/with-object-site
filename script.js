const hoverSound = new Audio('https://cdn.glitch.global/c608904e-0a89-447c-bfca-1f26ed478d82/WO_Hover%20sound.mp3?v=1746571734661');
const clickSound = new Audio('https://cdn.glitch.global/c608904e-0a89-447c-bfca-1f26ed478d82/WO_Click%20sound.mp3?v=1746571718260');
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
    if (!objectFound) object.style.opacity = 1;
  });
  object.addEventListener("mouseleave", () => {
    if (!objectFound) object.style.opacity = 0;
  });
  object.addEventListener("click", (e) => {
    e.stopPropagation();
    objectFound = true;
    object.style.opacity = 1;
    object.style.pointerEvents = "none";
    message.style.display = "block";
   if (soundEnabled) {
  const foundSound = new Audio("https://cdn.glitch.global/c608904e-0a89-447c-bfca-1f26ed478d82/O%3A%20Found.mp3?v=1746823711009");
  foundSound.play();
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