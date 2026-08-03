/* Player JS: creates a floating, accessible audio player with waveform visualization,
   localStorage persistence, fade in/out, and keyboard controls.
   - Expects a web-optimized audio file at /public/media/audio/peak-bound.mp3
   - Album art at /assets/album-art.jpg (optional)

   This implementation avoids autoplay and only restores playback position
   if the user previously started playback (safety & privacy).
*/
(function(){
  const AUDIO_SRC = '/public/media/audio/peak-bound.mp3';
  const ALBUM_ART = '/assets/album-art.jpg';
  const STORAGE_KEYS = {
    volume:'f2f_player_volume',
    time:'f2f_player_time',
    started:'f2f_player_started',
    expanded:'f2f_player_expanded'
  };

  // Create player DOM
  function createPlayer(){
    const container = document.createElement('div');
    container.className = 'f2f-player';
    container.setAttribute('role','region');
    container.setAttribute('aria-label','Soundtrack player');
    container.tabIndex = -1;

    container.innerHTML = `
      <div class="f2f-player__art" aria-hidden="true">
        <img src="${ALBUM_ART}" alt="Album artwork">
      </div>
      <div class="f2f-player__meta">
        <div class="f2f-player__title">Soundtrack</div>
        <div class="f2f-player__subtitle">Peak Bound (Enhanced Industrial Remix) — The soundtrack behind every climb, every repair, and every ride.</div>
        <div class="f2f-player__controls">
          <button class="f2f-player__play" aria-label="Play" title="Play">▶</button>
          <div class="f2f-player__time"><span class="elapsed">0:00</span> / <span class="duration">0:00</span></div>
        </div>
        <div class="f2f-player__progress" aria-hidden="false"><i style="width:0%"></i></div>
        <canvas class="f2f-waveform" width="300" height="36" aria-hidden="true"></canvas>
      </div>
    `;

    document.getElementById('floating-player-root')?.appendChild(container);
    return container;
  }

  // Simple time format
  function fmtTime(t){
    if(!isFinite(t) || isNaN(t)) return '0:00';
    const s = Math.floor(t%60).toString().padStart(2,'0');
    const m = Math.floor(t/60);
    return `${m}:${s}`;
  }

  // Fade audio to target volume over duration (ms)
  function fadeTo(audio, target, duration=300){
    const start = audio.volume; const diff = target - start;
    const startTime = performance.now();
    function step(now){
      const p = Math.min(1,(now-startTime)/duration);
      audio.volume = Math.max(0, Math.min(1, start + diff*p));
      if(p<1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Init
  function init(){
    if(!document.getElementById('floating-player-root')) return;
    const root = createPlayer();
    const audio = new Audio();
    audio.src = AUDIO_SRC;
    audio.preload = 'metadata';
    audio.crossOrigin = 'anonymous';

    const playBtn = root.querySelector('.f2f-player__play');
    const elapsedEl = root.querySelector('.elapsed');
    const durationEl = root.querySelector('.duration');
    const progressFill = root.querySelector('.f2f-player__progress > i');
    const canvas = root.querySelector('.f2f-waveform');
    const ctx = canvas.getContext('2d');

    // WebAudio for waveform
    let analyser, dataArray, source, audioCtx;
    function setupAnalyser(){
      try{
        audioCtx = new (window.AudioContext||window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        source = audioCtx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        dataArray = new Uint8Array(analyser.fftSize);
      }catch(e){
        analyser = null;
      }
    }

    function renderWave(){
      if(!analyser) return;
      analyser.getByteTimeDomainData(dataArray);
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.lineWidth = 2;
      const gradient = ctx.createLinearGradient(0,0,canvas.width,0);
      gradient.addColorStop(0,'#2CB7B3');
      gradient.addColorStop(1,'#C8A23A');
      ctx.strokeStyle = gradient;
      ctx.beginPath();
      const sliceWidth = canvas.width / dataArray.length;
      let x=0;
      for(let i=0;i<dataArray.length;i++){
        const v = (dataArray[i]-128)/128.0;
        const y = (v * canvas.height/2) + canvas.height/2;
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        x += sliceWidth;
      }
      ctx.stroke();
      if(!document.hidden){ requestAnimationFrame(renderWave); }
    }

    // Restore settings
    const savedVol = parseFloat(localStorage.getItem(STORAGE_KEYS.volume));
    if(!isNaN(savedVol)) audio.volume = savedVol;
    const wasStarted = localStorage.getItem(STORAGE_KEYS.started) === '1';
    const savedTime = parseFloat(localStorage.getItem(STORAGE_KEYS.time));
    if(wasStarted && !isNaN(savedTime)){
      audio.currentTime = Math.max(0,Math.min(savedTime,audio.duration||savedTime));
    }

    // Events
    audio.addEventListener('loadedmetadata',()=>{
      durationEl.textContent = fmtTime(audio.duration);
      if(wasStarted && !isNaN(savedTime)){
        // leave position set
      }
    });

    audio.addEventListener('timeupdate',()=>{
      elapsedEl.textContent = fmtTime(audio.currentTime);
      const pct = (audio.currentTime / (audio.duration || 1)) * 100;
      progressFill.style.width = pct + '%';
      // persist time occasionally
      if(!audio.paused){ localStorage.setItem(STORAGE_KEYS.time, String(audio.currentTime)); }
    });

    audio.addEventListener('play',()=>{
      playBtn.textContent = '❚❚';
      playBtn.setAttribute('aria-label','Pause');
    });
    audio.addEventListener('pause',()=>{
      playBtn.textContent = '▶';
      playBtn.setAttribute('aria-label','Play');
    });

    // Play/pause with fade
    let seeking=false;
    playBtn.addEventListener('click',async ()=>{
      // Resume audio context on user gesture for browsers that block it
      try{ if(window.AudioContext && window.AudioContext.state === 'suspended' && audioCtx && audioCtx.resume) audioCtx.resume(); }catch(e){}
      if(audio.paused){
        // fade-up
        fadeTo(audio, audio.volume || 0.75, 400);
        await audio.play().catch(()=>{});
        localStorage.setItem(STORAGE_KEYS.started,'1');
        if(!analyser) setupAnalyser();
        if(analyser) renderWave();
      } else {
        fadeTo(audio, 0.0, 400);
        // pause after fade
        setTimeout(()=>{ audio.pause(); if(!isNaN(audio.currentTime)) localStorage.setItem(STORAGE_KEYS.time,String(audio.currentTime)); },420);
      }
    });

    // Clicking progress seeks
    root.querySelector('.f2f-player__progress').addEventListener('click',(ev)=>{
      const rect = ev.currentTarget.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
      if(audio.duration) audio.currentTime = pct * audio.duration;
    });

    // Keyboard controls when player focused
    root.addEventListener('keydown',(ev)=>{
      if(ev.code === 'Space' || ev.key === ' '){ ev.preventDefault(); playBtn.click(); }
      if(ev.key === 'ArrowRight'){ if(audio.duration) audio.currentTime = Math.min(audio.duration, audio.currentTime + 5); }
      if(ev.key === 'ArrowLeft'){ audio.currentTime = Math.max(0, audio.currentTime - 5); }
      if(ev.key === 'ArrowUp'){ audio.volume = Math.min(1, audio.volume + 0.05); localStorage.setItem(STORAGE_KEYS.volume,String(audio.volume)); }
      if(ev.key === 'ArrowDown'){ audio.volume = Math.max(0, audio.volume - 0.05); localStorage.setItem(STORAGE_KEYS.volume,String(audio.volume)); }
    });

    // store volume on change (if user adjusts via browser controls)
    audio.addEventListener('volumechange',()=>{ localStorage.setItem(STORAGE_KEYS.volume,String(audio.volume)); });

    // prevent autoplay by not calling play on load
    // ensure persistent playback across anchor navigation: the audio element stays mounted

    // Expose for debugging
    window.f2fPlayer = {audio,root};
  }

  // initialize on DOM ready
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
