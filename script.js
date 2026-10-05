const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('.primary-nav');

if (menuToggle && primaryNav) {
  const label = menuToggle.querySelector('.sr-only');
  const setOpen = (open) => {
    primaryNav.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? 'Close navigation' : 'Open navigation';
  };

  menuToggle.addEventListener('click', () => setOpen(!primaryNav.classList.contains('is-open')));
  primaryNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && primaryNav.classList.contains('is-open')) {
      setOpen(false);
      menuToggle.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (!header?.contains(event.target) && primaryNav.classList.contains('is-open')) setOpen(false);
  });
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const lightbox = document.getElementById('gallery-lightbox');
const lightboxImage = lightbox?.querySelector('img');
const lightboxClose = lightbox?.querySelector('.lightbox-close');
let lastGalleryTrigger = null;

document.querySelectorAll('.gallery-item').forEach((item) => {
  item.addEventListener('click', () => {
    if (!lightbox || !lightboxImage) return;
    lastGalleryTrigger = item;
    lightboxImage.src = item.dataset.full || item.querySelector('img')?.src || '';
    lightboxImage.alt = item.querySelector('img')?.alt || 'Gallery preview';
    lightbox.showModal();
  });
});

lightboxClose?.addEventListener('click', () => lightbox?.close());
lightbox?.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close(); });
lightbox?.addEventListener('close', () => lastGalleryTrigger?.focus());

const serviceForm = document.getElementById('service-form');
const formStatus = document.getElementById('form-status');
const CONTACT_EMAIL = 'dom@fixin2flyin.com';

serviceForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!serviceForm.checkValidity()) {
    serviceForm.reportValidity();
    if (formStatus) formStatus.textContent = 'Please complete the required fields.';
    return;
  }
  const data = new FormData(serviceForm);
  const subject = encodeURIComponent(`Fixin’ 2 Flyin’ request: ${data.get('service')}`);
  const body = encodeURIComponent([
    `Name: ${data.get('name')}`,
    `Email: ${data.get('email')}`,
    `Phone: ${data.get('phone') || 'Not provided'}`,
    `Location: ${data.get('location')}`,
    `Service: ${data.get('service')}`,
    `Bike type: ${data.get('bike') || 'Not provided'}`,
    '',
    'Message:',
    data.get('message')
  ].join('\n'));
  if (formStatus) formStatus.textContent = 'Opening your email app with the request prepared…';
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
});

const soundtrackToggle = document.getElementById('soundtrack-toggle');
const playIcon = soundtrackToggle?.querySelector('.play-icon');
const playLabel = soundtrackToggle?.querySelector('.play-label');
const musicStatus = document.getElementById('music-status');
const soundtrack = new Audio('Peak Bound (Enhanced Industrial Remix).m4a');
soundtrack.preload = 'metadata';
soundtrack.volume = 0.9;

function setPlayer(playing, message) {
  document.body.classList.toggle('soundtrack-playing', playing);
  soundtrackToggle?.setAttribute('aria-pressed', String(playing));
  soundtrackToggle?.setAttribute('aria-label', playing ? 'Pause Peak Bound' : 'Play Peak Bound');
  if (playIcon) playIcon.textContent = playing ? 'Ⅱ' : '▶';
  if (playLabel) playLabel.textContent = playing ? 'Pause Peak Bound' : 'Play Peak Bound';
  if (musicStatus) musicStatus.textContent = message || (playing ? 'Now playing: Peak Bound' : 'Enhanced Industrial Remix');
}

soundtrackToggle?.addEventListener('click', async () => {
  try {
    if (soundtrack.paused) await soundtrack.play();
    else soundtrack.pause();
  } catch {
    setPlayer(false, 'Peak Bound could not start. Tap play again.');
  }
});
soundtrack.addEventListener('playing', () => setPlayer(true));
soundtrack.addEventListener('pause', () => { if (!soundtrack.ended) setPlayer(false); });
soundtrack.addEventListener('ended', () => { soundtrack.currentTime = 0; setPlayer(false, 'Peak Bound — finished'); });
soundtrack.addEventListener('error', () => setPlayer(false, 'Peak Bound could not load.'));
setPlayer(false);

/* One-time cleanup of legacy PWA workers and stale caches from earlier builds. */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.filter((key) => key.startsWith('fixin2flyin-')).map((key) => caches.delete(key)));
      }
    } catch {
      /* Best effort only; cache cleanup must never block the site. */
    }
  });
}