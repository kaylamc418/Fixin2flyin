const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('.primary-nav');

/* Load the newest visual layer from a separate cache-busted stylesheet. */
if (!document.querySelector('link[data-f2f-experience]')) {
  const experienceStyles = document.createElement('link');
  experienceStyles.rel = 'stylesheet';
  experienceStyles.href = 'experience.css?v=20261007c';
  experienceStyles.dataset.f2fExperience = 'true';
  document.head.appendChild(experienceStyles);
}

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

/*
  Upcoming Events data.
  Add future events here without changing the section markup.
  Supported fields: name, date, time, location, type, note, url, linkLabel.
*/
const UPCOMING_EVENTS = [];

function renderEvents() {
  const tribute = document.getElementById('mama-tribute');
  const gallery = document.getElementById('gallery');
  if (!tribute || !gallery || document.getElementById('events')) return;

  const section = document.createElement('section');
  section.className = 'events-section';
  section.id = 'events';
  section.setAttribute('aria-labelledby', 'events-title');

  const head = document.createElement('div');
  head.className = 'events-head';
  head.innerHTML = '<p class="eyebrow gold-soft">UPCOMING EVENTS</p><h2 id="events-title">Catch Dom out in the wild.</h2><p>See where Dom will be riding, wrenching, supporting events, or showing up with Fixin’ 2 Flyin’.</p>';
  section.appendChild(head);

  if (UPCOMING_EVENTS.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'events-empty';
    empty.innerHTML = '<strong>NO UPCOMING EVENTS POSTED YET</strong><p>Check back soon for Dom’s next ride, event, or meetup.</p>';
    section.appendChild(empty);
  } else {
    const grid = document.createElement('div');
    grid.className = 'events-grid';

    UPCOMING_EVENTS.forEach((event) => {
      const card = document.createElement('article');
      card.className = 'event-card';

      const date = document.createElement('span');
      date.className = 'event-date';
      date.textContent = event.date || 'Date TBA';
      card.appendChild(date);

      const type = document.createElement('p');
      type.className = 'event-type';
      type.textContent = event.type || 'Community';
      card.appendChild(type);

      const title = document.createElement('h3');
      title.textContent = event.name || 'Fixin’ 2 Flyin’ Event';
      card.appendChild(title);

      if (event.time || event.location) {
        const meta = document.createElement('p');
        meta.className = 'event-meta';
        meta.textContent = [event.time, event.location].filter(Boolean).join(' • ');
        card.appendChild(meta);
      }

      if (event.note) {
        const note = document.createElement('p');
        note.textContent = event.note;
        card.appendChild(note);
      }

      if (event.url) {
        const link = document.createElement('a');
        link.className = 'event-link';
        link.href = event.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = event.linkLabel || 'Event Details →';
        card.appendChild(link);
      }

      grid.appendChild(card);
    });

    section.appendChild(grid);
  }

  gallery.before(section);

  if (primaryNav && !primaryNav.querySelector('a[href="#events"]')) {
    const eventsLink = document.createElement('a');
    eventsLink.href = '#events';
    eventsLink.textContent = 'Events';
    const galleryLink = primaryNav.querySelector('a[href="#gallery"]');
    if (galleryLink) primaryNav.insertBefore(eventsLink, galleryLink);
    else primaryNav.appendChild(eventsLink);
    eventsLink.addEventListener('click', () => {
      primaryNav.classList.remove('is-open');
      menuToggle?.setAttribute('aria-expanded', 'false');
    });
  }
}

renderEvents();

/*
  Make the brand rail unmistakably move right-to-left.
  Web Animations is independent of the cached CSS keyframe, while the CSS animation remains a fallback.
*/
function startBrandMarquee() {
  const track = document.querySelector('.brand-marquee .strip-track');
  const firstGroup = track?.querySelector('.brand-marquee-group');
  if (!track || !firstGroup || typeof track.animate !== 'function') return;

  requestAnimationFrame(() => {
    const loopWidth = firstGroup.getBoundingClientRect().width;
    if (!loopWidth) return;

    try {
      track.getAnimations().forEach((animation) => animation.cancel());
      const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
      track.animate(
        [
          { transform: 'translate3d(0, 0, 0)' },
          { transform: `translate3d(-${loopWidth}px, 0, 0)` }
        ],
        {
          duration: prefersReducedMotion ? 60000 : 14500,
          iterations: Infinity,
          easing: 'linear'
        }
      );
    } catch {
      /* CSS animation remains the fallback. */
    }
  });
}

startBrandMarquee();
window.addEventListener('load', startBrandMarquee, { once: true });

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
  const subject = encodeURIComponent(`Fixin’ 2 Flyin’ Book Dom request: ${data.get('service')}`);
  const body = encodeURIComponent([
    `Service: ${data.get('service')}`,
    `Preferred date: ${data.get('date')}`,
    `Preferred time: ${data.get('time')}`,
    `Full name: ${data.get('name')}`,
    `Phone: ${data.get('phone')}`,
    `Email: ${data.get('email')}`,
    `Service location: ${data.get('location')}`,
    `Bike type: ${data.get('bike') || 'Not provided'}`,
    '',
    'Details / what the customer needs help with:',
    data.get('message'),
    '',
    'I understand this is a booking request and the appointment is not confirmed until Dom responds.'
  ].join('\n'));

  if (formStatus) formStatus.textContent = 'Opening your email app with the Book Dom request prepared…';
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
});

/* Peak Bound soundtrack. User-initiated only; native controls remain available as a reliable fallback. */
const soundtrackToggle = document.getElementById('soundtrack-toggle');
const playIcon = soundtrackToggle?.querySelector('.play-icon');
const playLabel = soundtrackToggle?.querySelector('.play-label');
const musicStatus = document.getElementById('music-status');
const playerCard = soundtrackToggle?.closest('.player-card');
const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
const soundtrack = document.createElement('audio');
soundtrack.id = 'peak-bound-audio';
soundtrack.className = 'peak-bound-audio';
soundtrack.controls = true;
soundtrack.preload = 'metadata';
soundtrack.src = './Peak%20Bound%20(Enhanced%20Industrial%20Remix).m4a';
soundtrack.setAttribute('aria-label', 'Peak Bound — Enhanced Industrial Remix');
playerCard?.appendChild(soundtrack);
soundtrack.volume = 0.9;

function setPlayer(playing, message) {
  document.body.classList.toggle('soundtrack-playing', playing && !reduceMotion);
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
    setPlayer(false, 'Peak Bound could not start. Use the audio controls below to try again.');
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
