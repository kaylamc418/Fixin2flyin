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
const CONTACT_EMAIL = "dom@fixin2flyin.com";

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

/* Peak Bound soundtrack. User-initiated only; no autoplay. */
const soundtrackToggle = document.getElementById("soundtrack-toggle");
const soundtrackLabel = soundtrackToggle?.querySelector(".soundtrack-label");
const soundtrackIcon = soundtrackToggle?.querySelector(".music-play-icon");
const musicStatus = document.getElementById("music-status");
const SOUNDTRACK_TITLE = "Peak Bound (Enhanced Industrial Remix)";
const SOUNDTRACK_SRC = "Peak Bound (Enhanced Industrial Remix).m4a";

const soundtrack = new Audio();
soundtrack.src = SOUNDTRACK_SRC;
soundtrack.preload = "metadata";
soundtrack.loop = false;
soundtrack.volume = 0.9;
soundtrack.playsInline = true;

let playing = false;
let loading = false;

function setMusicUi(isPlaying, statusText = null) {
  playing = isPlaying;
  document.body.classList.toggle("soundtrack-playing", isPlaying);
  soundtrackToggle?.setAttribute("aria-pressed", String(isPlaying));
  soundtrackToggle?.setAttribute(
    "aria-label",
    isPlaying ? "Pause Peak Bound" : "Play Peak Bound"
  );

  if (soundtrackLabel) soundtrackLabel.textContent = isPlaying ? "Pause Song" : "Play Song";
  if (soundtrackIcon) soundtrackIcon.textContent = isPlaying ? "Ⅱ" : "▶";
  if (musicStatus) {
    musicStatus.textContent = statusText || (isPlaying ? `Now playing: ${SOUNDTRACK_TITLE}` : SOUNDTRACK_TITLE);
  }
}

function setLoadingUi(isLoading) {
  loading = isLoading;
  soundtrackToggle?.toggleAttribute("disabled", isLoading);
  if (soundtrackLabel && isLoading) soundtrackLabel.textContent = "Loading…";
  if (soundtrackIcon && isLoading) soundtrackIcon.textContent = "…";
  if (musicStatus && isLoading) musicStatus.textContent = `Loading ${SOUNDTRACK_TITLE}…`;
}

soundtrack.addEventListener("loadstart", () => setLoadingUi(true));
soundtrack.addEventListener("loadedmetadata", () => {
  setLoadingUi(false);
  setMusicUi(false, SOUNDTRACK_TITLE);
});
soundtrack.addEventListener("canplay", () => {
  if (loading) setLoadingUi(false);
});
soundtrack.addEventListener("waiting", () => {
  if (!soundtrack.paused) {
    if (musicStatus) musicStatus.textContent = `Buffering ${SOUNDTRACK_TITLE}…`;
  }
});
soundtrack.addEventListener("playing", () => setMusicUi(true));
soundtrack.addEventListener("pause", () => {
  if (!soundtrack.ended) setMusicUi(false);
});
soundtrack.addEventListener("ended", () => {
  soundtrack.currentTime = 0;
  setMusicUi(false, `${SOUNDTRACK_TITLE} — finished`);
});
soundtrack.addEventListener("error", () => {
  setLoadingUi(false);
  setMusicUi(false, "Peak Bound could not load. Refresh and try again.");
});

soundtrackToggle?.addEventListener("click", async () => {
  if (loading) return;

  try {
    if (soundtrack.paused) {
      if (soundtrack.readyState < 2) {
        setLoadingUi(true);
        soundtrack.load();
      }
      await soundtrack.play();
    } else {
      soundtrack.pause();
    }
  } catch {
    setLoadingUi(false);
    setMusicUi(false, "Peak Bound could not start. Tap Play again.");
  }
});

setMusicUi(false, SOUNDTRACK_TITLE);
