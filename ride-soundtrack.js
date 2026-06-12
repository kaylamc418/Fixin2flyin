// Minimal accessible Play / Pause handler.
(function(){
  const btn = document.getElementById('ride-play');
  const audio = document.getElementById('ride-audio');
  if (!btn || !audio) return;

  function updateButton(){
    const isPlaying = !audio.paused && !audio.ended && audio.currentTime > 0;
    btn.textContent = isPlaying ? 'Pause' : 'Play';
    btn.setAttribute('aria-pressed', String(isPlaying));
  }

  btn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(()=>{/* handle autoplay block gracefully */});
    } else {
      audio.pause();
    }
    updateButton();
  });

  // Ensure button reflects state if audio ends or is paused programmatically
  audio.addEventListener('pause', updateButton);
  audio.addEventListener('play', updateButton);
  audio.addEventListener('ended', updateButton);
})();
