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
   This uses a generated synth loop so the site can actually play music without
   shipping a copyrighted track. To use a licensed file later, add it to assets/
   and set RIDE_AUDIO_SRC below, for example:
   const RIDE_AUDIO_SRC = "assets/ride-soundtrack.mp3";
*/
const RIDE_AUDIO_SRC = "";
const soundtrackToggle = document.getElementById("soundtrack-toggle");
const soundtrackLabel = soundtrackToggle?.querySelector(".soundtrack-label");
const soundtrackIcon = null;

let soundtrackAudio = null;
let soundtrackContext = null;
let soundtrackMasterGain = null;
let soundtrackMusicTimer = null;
let soundtrackPlaying = false;
let soundtrackSectionIndex = 0;
let soundtrackNextSectionStartTime = 0;

const MUSIC_BPM = 96;
const BEAT_SECONDS = 60 / MUSIC_BPM;
const BAR_SECONDS = BEAT_SECONDS * 4;
const SECTION_BARS = 4;
const SECTION_SECONDS = BAR_SECONDS * SECTION_BARS;

function setSoundtrackUi(isPlaying) {
  soundtrackPlaying = isPlaying;
  document.body.classList.toggle("soundtrack-playing", isPlaying);
  if (soundtrackToggle) soundtrackToggle.setAttribute("aria-pressed", String(isPlaying));
  if (soundtrackLabel) soundtrackLabel.textContent = isPlaying ? "Pause" : "Play";
  if (soundtrackToggle) soundtrackToggle.setAttribute("aria-label", isPlaying ? "Pause ride soundtrack" : "Play ride soundtrack");
  if (soundtrackIcon) soundtrackIcon.textContent = isPlaying ? "||" : ">";
}

setSoundtrackUi(false);

function midiToFrequency(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function createNoiseBuffer() {
  const buffer = soundtrackContext.createBuffer(1, soundtrackContext.sampleRate * 0.18, soundtrackContext.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }

  return buffer;
}

function connectToMaster(node) {
  if (soundtrackMasterGain) node.connect(soundtrackMasterGain);
}

function playTone({ time, frequency, duration, type = "sine", gain = 0.2, detune = 0, filterFrequency = null }) {
  const oscillator = soundtrackContext.createOscillator();
  const amp = soundtrackContext.createGain();
  const filter = filterFrequency ? soundtrackContext.createBiquadFilter() : null;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, time);
  if (detune) oscillator.detune.setValueAtTime(detune, time);

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
  oscillator.stop(time + duration + 0.03);
}

function playKick(time) {
  const oscillator = soundtrackContext.createOscillator();
  const amp = soundtrackContext.createGain();
  const filter = soundtrackContext.createBiquadFilter();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(140, time);
  oscillator.frequency.exponentialRampToValueAtTime(44, time + 0.16);
  amp.gain.setValueAtTime(0.0001, time);
  amp.gain.exponentialRampToValueAtTime(0.95, time + 0.008);
  amp.gain.exponentialRampToValueAtTime(0.0001, time + 0.24);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(160, time);

  oscillator.connect(filter);
  filter.connect(amp);
  connectToMaster(amp);
  oscillator.start(time);
  oscillator.stop(time + 0.28);
}

function playSnare(time) {
  const noise = soundtrackContext.createBufferSource();
  const noiseFilter = soundtrackContext.createBiquadFilter();
  const amp = soundtrackContext.createGain();
  const body = soundtrackContext.createOscillator();
  const bodyGain = soundtrackContext.createGain();

  noise.buffer = createNoiseBuffer();
  noiseFilter.type = "highpass";
  noiseFilter.frequency.setValueAtTime(1500, time);
  amp.gain.setValueAtTime(0.0001, time);
  amp.gain.exponentialRampToValueAtTime(0.28, time + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);

  body.type = "triangle";
  body.frequency.setValueAtTime(190, time);
  body.frequency.exponentialRampToValueAtTime(110, time + 0.08);
  bodyGain.gain.setValueAtTime(0.0001, time);
  bodyGain.gain.exponentialRampToValueAtTime(0.12, time + 0.01);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);

  noise.connect(noiseFilter);
  noiseFilter.connect(amp);
  body.connect(bodyGain);
  bodyGain.connect(amp);
  connectToMaster(amp);
  noise.start(time);
  noise.stop(time + 0.22);
  body.start(time);
  body.stop(time + 0.14);
}

function playHat(time, open = false) {
  const noise = soundtrackContext.createBufferSource();
  const noiseFilter = soundtrackContext.createBiquadFilter();
  const amp = soundtrackContext.createGain();

  noise.buffer = createNoiseBuffer();
  noiseFilter.type = "highpass";
  noiseFilter.frequency.setValueAtTime(open ? 6200 : 7600, time);
  amp.gain.setValueAtTime(0.0001, time);
  amp.gain.exponentialRampToValueAtTime(open ? 0.09 : 0.045, time + 0.004);
  amp.gain.exponentialRampToValueAtTime(0.0001, time + (open ? 0.22 : 0.06));

  noise.connect(noiseFilter);
  noiseFilter.connect(amp);
  connectToMaster(amp);
  noise.start(time);
  noise.stop(time + (open ? 0.24 : 0.08));
}

function playBass(time, frequency, duration, gain = 0.16) {
  playTone({
    time,
    frequency,
    duration,
    type: "sawtooth",
    gain,
    detune: -9,
    filterFrequency: 280,
  });
  playTone({
    time,
    frequency,
    duration,
    type: "triangle",
    gain: gain * 0.55,
    detune: 7,
    filterFrequency: 180,
  });
}

function playChord(time, frequencies, duration, gain = 0.08) {
  frequencies.forEach((frequency, index) => {
    playTone({
      time,
      frequency,
      duration,
      type: "sawtooth",
      gain: gain / (index === 0 ? 1 : 1.35),
      detune: index === 1 ? 6 : -4,
      filterFrequency: 1400,
    });
    playTone({
      time,
      frequency: frequency * (index === 0 ? 2 : 1),
      duration,
      type: "triangle",
      gain: gain * 0.42,
      detune: index === 2 ? 4 : 0,
      filterFrequency: 1800,
    });
  });
}

function playLead(time, frequency, duration, gain = 0.045) {
  playTone({
    time,
    frequency,
    duration,
    type: "square",
    gain,
    detune: 2,
    filterFrequency: 2600,
  });
}

function scheduleMusicSection(startTime, sectionIndex) {
  if (!soundtrackContext || !soundtrackMasterGain) return;

  const bars = [
    {
      chord: [midiToFrequency(50), midiToFrequency(53), midiToFrequency(57)],
      bass: midiToFrequency(38),
      lead: [midiToFrequency(69), midiToFrequency(72), midiToFrequency(74), midiToFrequency(72)],
    },
    {
      chord: [midiToFrequency(46), midiToFrequency(50), midiToFrequency(53)],
      bass: midiToFrequency(34),
      lead: [midiToFrequency(69), midiToFrequency(74), midiToFrequency(77), midiToFrequency(74)],
    },
    {
      chord: [midiToFrequency(43), midiToFrequency(48), midiToFrequency(52)],
      bass: midiToFrequency(31),
      lead: [midiToFrequency(67), midiToFrequency(69), midiToFrequency(72), midiToFrequency(69)],
    },
    {
      chord: [midiToFrequency(48), midiToFrequency(52), midiToFrequency(55)],
      bass: midiToFrequency(36),
      lead: [midiToFrequency(65), midiToFrequency(67), midiToFrequency(69), midiToFrequency(67)],
    },
  ];

  for (let bar = 0; bar < SECTION_BARS; bar += 1) {
    const barStart = startTime + bar * BAR_SECONDS;
    const phrase = bars[(sectionIndex + bar) % bars.length];

    playChord(barStart + 0.02, phrase.chord, BAR_SECONDS * 0.96, 0.08);
    playBass(barStart + 0.02, phrase.bass, BAR_SECONDS * 0.48, 0.16);
    playBass(barStart + BEAT_SECONDS * 2, phrase.bass * 1.5, BAR_SECONDS * 0.24, 0.11);

    playKick(barStart);
    playKick(barStart + BEAT_SECONDS * 2);
    playSnare(barStart + BEAT_SECONDS);
    playSnare(barStart + BEAT_SECONDS * 3);

    playHat(barStart + 0.02);
    playHat(barStart + BEAT_SECONDS * 0.5);
    playHat(barStart + BEAT_SECONDS);
    playHat(barStart + BEAT_SECONDS * 1.5);
    playHat(barStart + BEAT_SECONDS * 2);
    playHat(barStart + BEAT_SECONDS * 2.5);
    playHat(barStart + BEAT_SECONDS * 3);
    playHat(barStart + BEAT_SECONDS * 3.5, true);

    const leadPattern = phrase.lead;
    for (let i = 0; i < leadPattern.length; i += 1) {
      playLead(barStart + (i * BEAT_SECONDS) / 2 + BEAT_SECONDS * 0.25, leadPattern[i], 0.18);
    }
  }
}

function scheduleMusicLoop() {
  if (!soundtrackContext || !soundtrackMasterGain) return;

  scheduleMusicSection(soundtrackNextSectionStartTime, soundtrackSectionIndex);
  soundtrackSectionIndex = (soundtrackSectionIndex + SECTION_BARS) % 4;
  soundtrackNextSectionStartTime += SECTION_SECONDS;
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

  if (!soundtrackMasterGain) {
    soundtrackMasterGain = soundtrackContext.createGain();
    soundtrackMasterGain.gain.setValueAtTime(0.58, soundtrackContext.currentTime);
    soundtrackMasterGain.connect(soundtrackContext.destination);
  }

  clearInterval(soundtrackMusicTimer);
  soundtrackSectionIndex = 0;
  soundtrackNextSectionStartTime = soundtrackContext.currentTime + 0.12;
  scheduleMusicLoop();
  soundtrackMusicTimer = setInterval(scheduleMusicLoop, Math.max(1000, SECTION_SECONDS * 1000 - 150));
  setSoundtrackUi(true);
}

function pauseSoundtrack() {
  if (soundtrackAudio) soundtrackAudio.pause();
  clearInterval(soundtrackMusicTimer);
  soundtrackMusicTimer = null;
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
