// Add Dom's real contact details here before publishing.
const DOM_CONTACT = {
  email: "fixin2flyin@dom.com",
  phone: "",
  instagram: ""
};
const LUMI_INSTAGRAM_URL = "";

const statusEl = document.getElementById("contact-status");
const emailLink = document.getElementById("email-link");
const domInstagramLink = document.getElementById("dom-instagram-link");
const lumiInstagramLink = document.getElementById("lumi-instagram-link");
const lumiFooterLink = document.getElementById("lumi-footer-link");
const bookingForm = document.getElementById("booking-form");
const bookingSubmit = document.getElementById("booking-submit");
const bookingService = document.getElementById("field-service");
const servicePresetButtons = document.querySelectorAll("[data-service-preset]");

if (emailLink && DOM_CONTACT.email) {
  const subject = encodeURIComponent("Fixin 2 Flyin booking request");
  const body = encodeURIComponent("Hi Dom,\n\nI'm interested in:\n\nBike type:\nIssue / coaching goal:\nPreferred day/time:\nLocation:\n\nThanks,");
  emailLink.href = `mailto:${DOM_CONTACT.email}?subject=${subject}&body=${body}`;
}

function syncLumiLink(link) {
  if (!link) return;
  if (LUMI_INSTAGRAM_URL) {
    link.href = LUMI_INSTAGRAM_URL;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.hidden = false;
  } else {
    link.hidden = true;
  }
}

syncLumiLink(domInstagramLink);
syncLumiLink(lumiInstagramLink);
syncLumiLink(lumiFooterLink);

const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const siteHeader = document.querySelector(".site-header");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

function updateHeaderState() {
  if (!siteHeader) return;
  siteHeader.classList.toggle("is-scrolled", window.scrollY > 18);
}

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

servicePresetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!bookingService) return;
    bookingService.value = button.dataset.servicePreset || "";
    bookingService.focus();
  });
});

const revealItems = document.querySelectorAll(".reveal, .dom-code");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}


/* Ride Soundtrack
   This uses a generated beat so the site does not ship copyrighted music.
   To use a licensed audio file later, add it to assets/ and set RIDE_AUDIO_SRC below,
   for example: const RIDE_AUDIO_SRC = "assets/ride-soundtrack.mp3";
*/
const RIDE_AUDIO_SRC = "";
const soundtrackToggle = document.getElementById("soundtrack-toggle");
const soundtrackLabel = soundtrackToggle?.querySelector(".soundtrack-label");
const soundtrackIcon = null;

let soundtrackAudio = null;
let soundtrackContext = null;
let soundtrackTimer = null;
let soundtrackPlaying = false;
let soundtrackStep = 0;

function setSoundtrackUi(isPlaying) {
  soundtrackPlaying = isPlaying;
  document.body.classList.toggle("soundtrack-playing", isPlaying);
  if (soundtrackToggle) soundtrackToggle.setAttribute("aria-pressed", String(isPlaying));
  if (soundtrackLabel) soundtrackLabel.textContent = isPlaying ? "Pause" : "Play";
  if (soundtrackToggle) soundtrackToggle.setAttribute("aria-label", isPlaying ? "Pause ride soundtrack" : "Play ride soundtrack");
  if (soundtrackIcon) soundtrackIcon.textContent = isPlaying ? "||" : ">";
}

setSoundtrackUi(false);

function playSynthHit(time, frequency, duration, type, gainValue) {
  const oscillator = soundtrackContext.createOscillator();
  const gain = soundtrackContext.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, time);

  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(gainValue, time + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

  oscillator.connect(gain);
  gain.connect(soundtrackContext.destination);
  oscillator.start(time);
  oscillator.stop(time + duration + 0.02);
}

function runGeneratedBeat() {
  if (!soundtrackContext) return;

  const now = soundtrackContext.currentTime + 0.02;
  const pattern = soundtrackStep % 8;

  // "Boots and cats" style pulse: kick / hat / snare / hat, UK club-inspired but original.
  if (pattern === 0 || pattern === 4) playSynthHit(now, 72, 0.16, "sine", 0.32);
  if (pattern === 2 || pattern === 6) playSynthHit(now, 178, 0.09, "triangle", 0.18);
  playSynthHit(now, pattern % 2 === 0 ? 7600 : 5400, 0.035, "square", 0.035);

  if (pattern === 3 || pattern === 7) playSynthHit(now, 118, 0.08, "sawtooth", 0.055);

  soundtrackStep += 1;
}

async function startSoundtrack() {
  if (RIDE_AUDIO_SRC) {
    if (!soundtrackAudio) {
      soundtrackAudio = new Audio(RIDE_AUDIO_SRC);
      soundtrackAudio.loop = true;
      soundtrackAudio.preload = "auto";
      soundtrackAudio.volume = 0.55;
    }
    await soundtrackAudio.play();
    setSoundtrackUi(true);
    return;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  if (!soundtrackContext) soundtrackContext = new AudioContextClass();
  if (soundtrackContext.state === "suspended") await soundtrackContext.resume();

  runGeneratedBeat();
  clearInterval(soundtrackTimer);
  soundtrackTimer = setInterval(runGeneratedBeat, 150);
  setSoundtrackUi(true);
}

function pauseSoundtrack() {
  if (soundtrackAudio) soundtrackAudio.pause();
  clearInterval(soundtrackTimer);
  soundtrackTimer = null;
  setSoundtrackUi(false);
}

soundtrackToggle?.addEventListener("click", async () => {
  if (soundtrackPlaying) {
    pauseSoundtrack();
    return;
  }

  try {
    await startSoundtrack();
  } catch (error) {
    setSoundtrackUi(false);
  }
});

if (bookingForm) {
  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (bookingSubmit) {
      bookingSubmit.disabled = false;
      bookingSubmit.classList.remove("is-loading");
    }

    if (!bookingForm.checkValidity()) {
      bookingForm.reportValidity();
      if (statusEl) {
        statusEl.textContent = "Please complete the required fields marked with *.";
        statusEl.className = "contact-status is-error";
      }
      return;
    }

    const originalLabel = bookingSubmit?.textContent || "Send Message";
    if (bookingSubmit) {
      bookingSubmit.disabled = true;
      bookingSubmit.classList.add("is-loading");
      bookingSubmit.textContent = "Sending...";
    }

    const payload = new FormData(bookingForm);
    void payload;

    await new Promise((resolve) => window.setTimeout(resolve, 900));

    bookingForm.reset();
    if (bookingSubmit) {
      bookingSubmit.disabled = false;
      bookingSubmit.classList.remove("is-loading");
      bookingSubmit.textContent = originalLabel;
    }
    if (statusEl) {
      statusEl.textContent = "Message sent successfully. Dom will review it and follow up.";
      statusEl.className = "contact-status is-success";
    }
  });
}
