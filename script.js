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
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 18);
}

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const lightbox = document.getElementById("gallery-lightbox");
const lightboxImage = lightbox?.querySelector("img");
const lightboxClose = lightbox?.querySelector(".lightbox-close");

document.querySelectorAll(".gallery-item").forEach((item) => {
  item.addEventListener("click", () => {
    if (!lightbox || !lightboxImage) return;
    const source = item.dataset.full || item.querySelector("img")?.src;
    const alt = item.querySelector("img")?.alt || "Gallery preview";
    lightboxImage.src = source;
    lightboxImage.alt = alt;
    lightbox.showModal();
  });
});

lightboxClose?.addEventListener("click", () => lightbox?.close());
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});

const serviceForm = document.getElementById("service-form");
const formStatus = document.getElementById("form-status");
const CONTACT_EMAIL = "kayamc418@gmail.com";

serviceForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!serviceForm.checkValidity()) {
    serviceForm.reportValidity();
    if (formStatus) {
      formStatus.textContent = "Please complete the required fields.";
      formStatus.className = "form-status is-error";
    }
    return;
  }

  const data = new FormData(serviceForm);
  const subject = encodeURIComponent(`Fixin’ 2 Flyin’ request: ${data.get("service")}`);
  const body = encodeURIComponent(
    [
      `Name: ${data.get("name")}`,
      `Email: ${data.get("email")}`,
      `Phone: ${data.get("phone") || "Not provided"}`,
      `Location: ${data.get("location")}`,
      `Service: ${data.get("service")}`,
      `Bike type: ${data.get("bike") || "Not provided"}`,
      `Preferred date: ${data.get("date") || "Not provided"}`,
      "",
      "Message:",
      data.get("message"),
    ].join("\n")
  );

  if (formStatus) {
    formStatus.textContent = "Your email app is opening with the service request prepared.";
    formStatus.className = "form-status is-success";
  }

  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
});

/* Dom's original Fixin’ 2 Flyin’ theme.
   The track is generated in-browser with Web Audio and is never autoplayed. */
const soundtrackToggle = document.getElementById("soundtrack-toggle");
const soundtrackLabel = soundtrackToggle?.querySelector(".soundtrack-label");
const soundtrackIcon = soundtrackToggle?.querySelector(".music-play-icon");
const musicStatus = document.getElementById("music-status");

let audioContext = null;
let masterGain = null;
let schedulerTimer = null;
let playing = false;
let nextSectionStart = 0;
let sectionIndex = 0;

const BPM = 96;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const SECTION_BARS = 4;
const SECTION = BAR * SECTION_BARS;

function midiToFrequency(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function setMusicUi(isPlaying) {
  playing = isPlaying;
  document.body.classList.toggle("soundtrack-playing", isPlaying);
  soundtrackToggle?.setAttribute("aria-pressed", String(isPlaying));
  soundtrackToggle?.setAttribute(
    "aria-label",
    isPlaying ? "Pause Dom’s original song" : "Play Dom’s original song"
  );

  if (soundtrackLabel) soundtrackLabel.textContent = isPlaying ? "Pause Song" : "Play Song";
  if (soundtrackIcon) soundtrackIcon.textContent = isPlaying ? "Ⅱ" : "▶";
  if (musicStatus) {
    musicStatus.textContent = isPlaying
      ? "Now playing: Original Fixin’ 2 Flyin’ theme"
      : "Original Fixin’ 2 Flyin’ theme";
  }
}

function connectToMaster(node) {
  node.connect(masterGain);
}

function playTone({
  time,
  frequency,
  duration,
  type = "sine",
  gain = 0.15,
  detune = 0,
  filterFrequency = null,
}) {
  const oscillator = audioContext.createOscillator();
  const amp = audioContext.createGain();
  const filter = filterFrequency ? audioContext.createBiquadFilter() : null;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, time);
  oscillator.detune.setValueAtTime(detune, time);

  amp.gain.setValueAtTime(0.0001, time);
  amp.gain.exponentialRampToValueAtTime(gain, time + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, time + duration);

  if (filter) {
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(filterFrequency, time);
    oscillator.connect(filter);
    filter.connect(amp);
  } else {
    oscillator.connect(amp);
  }

  connectToMaster(amp);
  oscillator.start(time);
  oscillator.stop(time + duration + 0.04);
}

function createNoiseBuffer(duration = 0.18) {
  const buffer = audioContext.createBuffer(
    1,
    Math.floor(audioContext.sampleRate * duration),
    audioContext.sampleRate
  );
  const data = buffer.getChannelData(0);

  for (let index = 0; index < data.length; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }

  return buffer;
}

function playKick(time) {
  const oscillator = audioContext.createOscillator();
  const amp = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(140, time);
  oscillator.frequency.exponentialRampToValueAtTime(44, time + 0.16);
  amp.gain.setValueAtTime(0.0001, time);
  amp.gain.exponentialRampToValueAtTime(0.85, time + 0.008);
  amp.gain.exponentialRampToValueAtTime(0.0001, time + 0.24);

  oscillator.connect(amp);
  connectToMaster(amp);
  oscillator.start(time);
  oscillator.stop(time + 0.28);
}

function playSnare(time) {
  const noise = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const amp = audioContext.createGain();

  noise.buffer = createNoiseBuffer();
  filter.type = "highpass";
  filter.frequency.setValueAtTime(1450, time);
  amp.gain.setValueAtTime(0.0001, time);
  amp.gain.exponentialRampToValueAtTime(0.24, time + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);

  noise.connect(filter);
  filter.connect(amp);
  connectToMaster(amp);
  noise.start(time);
  noise.stop(time + 0.22);
}

function playHat(time, open = false) {
  const noise = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const amp = audioContext.createGain();

  noise.buffer = createNoiseBuffer(open ? 0.24 : 0.08);
  filter.type = "highpass";
  filter.frequency.setValueAtTime(open ? 6200 : 7600, time);
  amp.gain.setValueAtTime(0.0001, time);
  amp.gain.exponentialRampToValueAtTime(open ? 0.08 : 0.04, time + 0.004);
  amp.gain.exponentialRampToValueAtTime(0.0001, time + (open ? 0.22 : 0.06));

  noise.connect(filter);
  filter.connect(amp);
  connectToMaster(amp);
  noise.start(time);
  noise.stop(time + (open ? 0.24 : 0.08));
}

function playBass(time, frequency, duration, gain = 0.14) {
  playTone({ time, frequency, duration, type: "sawtooth", gain, detune: -9, filterFrequency: 280 });
  playTone({ time, frequency, duration, type: "triangle", gain: gain * 0.55, detune: 7, filterFrequency: 180 });
}

function playChord(time, frequencies, duration) {
  frequencies.forEach((frequency, index) => {
    playTone({
      time,
      frequency,
      duration,
      type: "sawtooth",
      gain: index === 0 ? 0.07 : 0.052,
      detune: index === 1 ? 6 : -4,
      filterFrequency: 1400,
    });
  });
}

function playLead(time, frequency, duration) {
  playTone({ time, frequency, duration, type: "square", gain: 0.04, detune: 2, filterFrequency: 2600 });
}

const musicalBars = [
  { chord: [50, 53, 57], bass: 38, lead: [69, 72, 74, 72] },
  { chord: [46, 50, 53], bass: 34, lead: [69, 74, 77, 74] },
  { chord: [43, 48, 52], bass: 31, lead: [67, 69, 72, 69] },
  { chord: [48, 52, 55], bass: 36, lead: [65, 67, 69, 67] },
];

function scheduleSection(startTime) {
  for (let bar = 0; bar < SECTION_BARS; bar += 1) {
    const barStart = startTime + bar * BAR;
    const phrase = musicalBars[(sectionIndex + bar) % musicalBars.length];

    playChord(barStart + 0.02, phrase.chord.map(midiToFrequency), BAR * 0.96);
    playBass(barStart + 0.02, midiToFrequency(phrase.bass), BAR * 0.48);
    playBass(barStart + BEAT * 2, midiToFrequency(phrase.bass) * 1.5, BAR * 0.24, 0.1);

    playKick(barStart);
    playKick(barStart + BEAT * 2);
    playSnare(barStart + BEAT);
    playSnare(barStart + BEAT * 3);

    for (let halfBeat = 0; halfBeat < 8; halfBeat += 1) {
      playHat(barStart + halfBeat * BEAT * 0.5, halfBeat === 7);
    }

    phrase.lead.forEach((note, index) => {
      playLead(barStart + (index * BEAT) / 2 + BEAT * 0.25, midiToFrequency(note), 0.18);
    });
  }

  sectionIndex = (sectionIndex + SECTION_BARS) % musicalBars.length;
}

function scheduleLoop() {
  scheduleSection(nextSectionStart);
  nextSectionStart += SECTION;
}

async function startSoundtrack() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    if (musicStatus) musicStatus.textContent = "This browser cannot play the original theme.";
    return;
  }

  if (!audioContext) {
    audioContext = new AudioContextClass();
    masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(0.5, audioContext.currentTime);
    masterGain.connect(audioContext.destination);
  }

  await audioContext.resume();
  clearInterval(schedulerTimer);
  sectionIndex = 0;
  nextSectionStart = audioContext.currentTime + 0.12;
  scheduleLoop();
  schedulerTimer = window.setInterval(scheduleLoop, Math.max(1000, SECTION * 1000 - 150));
  setMusicUi(true);
}

async function pauseSoundtrack() {
  clearInterval(schedulerTimer);
  schedulerTimer = null;
  if (audioContext?.state === "running") await audioContext.suspend();
  setMusicUi(false);
}

soundtrackToggle?.addEventListener("click", async () => {
  try {
    if (playing) {
      await pauseSoundtrack();
    } else {
      await startSoundtrack();
    }
  } catch {
    setMusicUi(false);
    if (musicStatus) musicStatus.textContent = "The original theme could not start. Try again.";
  }
});

setMusicUi(false);
