/* Infinite marquee JS
   - Smooth GPU-accelerated marquee using CSS transforms
   - Pauses on hover/focus
   - Touch support (pause on touchstart)
   - Occasional gold phrase highlight (randomly applies a class to one phrase every few seconds)
   - Respects prefers-reduced-motion
*/
(function(){
  const marqueeWrap = document.querySelector('#marquee .marquee-track');
  if(!marqueeWrap) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(prefersReduced){ marqueeWrap.style.animation = 'none'; return; }

  // Pause on hover/focus
  const parent = marqueeWrap.parentElement;
  parent.addEventListener('mouseenter', ()=>{ marqueeWrap.style.animationPlayState = 'paused'; });
  parent.addEventListener('mouseleave', ()=>{ marqueeWrap.style.animationPlayState = 'running'; });
  parent.addEventListener('focusin', ()=>{ marqueeWrap.style.animationPlayState = 'paused'; });
  parent.addEventListener('focusout', ()=>{ marqueeWrap.style.animationPlayState = 'running'; });

  // Touch
  parent.addEventListener('touchstart', ()=>{ marqueeWrap.style.animationPlayState = 'paused'; }, {passive:true});
  parent.addEventListener('touchend', ()=>{ marqueeWrap.style.animationPlayState = 'running'; });

  // Random gold glow on phrase
  const phrases = Array.from(marqueeWrap.querySelectorAll('span, b, strong'));
  function highlightRandom(){
    if(!phrases.length) return;
    const idx = Math.floor(Math.random()*phrases.length);
    phrases.forEach(p=>p.classList && p.classList.remove('marquee-highlight'));
    const el = phrases[idx];
    if(el && el.classList) el.classList.add('marquee-highlight');
    setTimeout(()=>{ el && el.classList && el.classList.remove('marquee-highlight'); }, 1800);
  }
  setInterval(()=>{ if(Math.random() > 0.6) highlightRandom(); }, 2200);

  // Ensure seamless scroll width setup (duplicate content assumed in DOM)
  function ensureLoop(){
    // measure and set CSS variable for animation length if needed
    const track = marqueeWrap;
    const width = track.getBoundingClientRect().width/2; // one loop length
    // set --marquee-width on root for CSS timing if needed
    document.documentElement.style.setProperty('--marquee-loop-width', width + 'px');
  }
  window.addEventListener('resize', ensureLoop);
  ensureLoop();
})();
