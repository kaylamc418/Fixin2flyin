/* Enhanced player with Media Session API, position updates, keyboard shortcuts, and animation hooks.
   Expects /public/media/audio/peak-bound.mp3 and /assets/album-art.jpg
*/
(function(){
  const AUDIO_SRC = '/public/media/audio/peak-bound.mp3';
  const ALBUM_ART = '/assets/album-art.jpg';
  const STORAGE = { volume:'f2f_player_volume', time:'f2f_player_time', started:'f2f_player_started' };

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
        <div class="f2f-player__subtitle">Peak Bound (Enhanced Industrial Remix)</div>
        <div class="f2f-player__controls">
          <button class="f2f-player__play" aria-pressed="false" aria-label="Play">▶</button>
          <button class="f2f-player__mute" aria-pressed="false" aria-label="Mute">🔈</button>
          <div class="f2f-player__time"><span class="elapsed">0:00</span> / <span class="duration">0:00</span></div>
        </div>
        <div class="f2f-player__progress" role="progressbar" aria-valuemin="0" aria-valuemax="100"><i style="width:0%"></i></div>
        <canvas class="f2f-waveform" width="300" height="36" aria-hidden="true"></canvas>
      </div>
    `;
    return container;
  }

  function fmtTime(t){ if(!isFinite(t) || isNaN(t)) return '0:00'; const s=Math.floor(t%60).toString().padStart(2,'0'); const m=Math.floor(t/60); return `${m}:${s}`; }
  function fadeTo(audio,target,duration=300){ const start=audio.volume,diff=target-start,begin=performance.now(); function step(now){ const p=Math.min(1,(now-begin)/duration); audio.volume=Math.max(0,Math.min(1,start+diff*p)); if(p<1) requestAnimationFrame(step); } requestAnimationFrame(step); }

  function init(){
    if(!document.getElementById('floating-player-root')) return;
    const root = createPlayer(); document.getElementById('floating-player-root').appendChild(root);
    const audio = new Audio(AUDIO_SRC); audio.preload='metadata'; audio.crossOrigin='anonymous';

    const playBtn = root.querySelector('.f2f-player__play');
    const muteBtn = root.querySelector('.f2f-player__mute');
    const elapsedEl = root.querySelector('.elapsed');
    const durationEl = root.querySelector('.duration');
    const progressFill = root.querySelector('.f2f-player__progress > i');
    const canvas = root.querySelector('.f2f-waveform'); const ctx = canvas.getContext('2d');

    let analyser, dataArray, audioCtx, source;
    function setupAnalyser(){ try{ audioCtx = new (window.AudioContext||window.webkitAudioContext)(); analyser = audioCtx.createAnalyser(); analyser.fftSize=2048; source = audioCtx.createMediaElementSource(audio); source.connect(analyser); analyser.connect(audioCtx.destination); dataArray = new Uint8Array(analyser.fftSize); }catch(e){ analyser=null; } }

    function updateMediaSession(){
      if('mediaSession' in navigator){
        try{
          navigator.mediaSession.metadata = new MediaMetadata({
            title: 'Peak Bound (Enhanced Industrial Remix)',
            artist: 'Fixin’ 2 Flyin’',
            album: 'Peak Bound',
            artwork: [{ src: ALBUM_ART, sizes: '1200x1200', type: 'image/jpeg' }]
          });
          navigator.mediaSession.setActionHandler('play', ()=>audio.play().catch(()=>{}));
          navigator.mediaSession.setActionHandler('pause', ()=>audio.pause());
          navigator.mediaSession.setActionHandler('stop', ()=>{ audio.pause(); audio.currentTime = 0; });
          navigator.mediaSession.setActionHandler('seekbackward', (d)=>{ audio.currentTime = Math.max(0, audio.currentTime - (d.seekOffset || 10)); });
          navigator.mediaSession.setActionHandler('seekforward', (d)=>{ audio.currentTime = Math.min(audio.duration, audio.currentTime + (d.seekOffset || 10)); });
          navigator.mediaSession.setActionHandler('seekto', (d)=>{ if(d.fastSeek && 'fastSeek' in audio) audio.fastSeek(d.seekTime); else audio.currentTime = d.seekTime; });
          navigator.mediaSession.playbackState = audio.paused ? 'paused' : 'playing';
        }catch(e){}
      }
    }

    const savedVol = parseFloat(localStorage.getItem(STORAGE.volume)); if(!isNaN(savedVol)) audio.volume = savedVol;
    const wasStarted = localStorage.getItem(STORAGE.started) === '1';
    const savedTime = parseFloat(localStorage.getItem(STORAGE.time));
    if(wasStarted && !isNaN(savedTime)) audio.currentTime = savedTime;

    audio.addEventListener('loadedmetadata', ()=>{ durationEl.textContent = fmtTime(audio.duration); updateMediaSession(); });
    audio.addEventListener('timeupdate', ()=>{
      elapsedEl.textContent = fmtTime(audio.currentTime);
      const pct = (audio.currentTime / (audio.duration || 1)) * 100; progressFill.style.width = pct + '%';
      if(!audio.paused) localStorage.setItem(STORAGE.time, String(audio.currentTime));
      if('setPositionState' in navigator.mediaSession){
        try{
          navigator.mediaSession.setPositionState({ duration: isFinite(audio.duration) ? audio.duration : 0, playbackRate: audio.playbackRate || 1, position: audio.currentTime });
        }catch(e){}
      }
    });

    audio.addEventListener('play', ()=>{ playBtn.textContent = '❚❚'; playBtn.setAttribute('aria-pressed','true'); if('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing'; });
    audio.addEventListener('pause', ()=>{ playBtn.textContent = '▶'; playBtn.setAttribute('aria-pressed','false'); if('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused'; });

    playBtn.addEventListener('click', async ()=>{
      try{ if(window.AudioContext && window.AudioContext.state === 'suspended' && audioCtx && audioCtx.resume) audioCtx.resume(); }catch(e){}
      if(audio.paused){ fadeTo(audio, audio.volume || 0.75, 400); await audio.play().catch(()=>{}); localStorage.setItem(STORAGE.started,'1'); if(!analyser) setupAnalyser(); if(analyser) requestAnimationFrame(renderWave); } else { fadeTo(audio, 0.0, 400); setTimeout(()=>{ audio.pause(); if(!isNaN(audio.currentTime)) localStorage.setItem(STORAGE.time,String(audio.currentTime)); },420); }
    });

    muteBtn.addEventListener('click', ()=>{ const wasMuted = audio.muted; audio.muted = !wasMuted; muteBtn.setAttribute('aria-pressed', String(!wasMuted)); root.classList.add('muted-animate'); setTimeout(()=>root.classList.remove('muted-animate'),420); });

    root.querySelector('.f2f-player__progress').addEventListener('click', (ev)=>{ const rect = ev.currentTarget.getBoundingClientRect(); const pct = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width)); if(audio.duration) audio.currentTime = pct * audio.duration; });

    window.addEventListener('keydown', (ev)=>{ if(ev.target && (/input|textarea/i).test(ev.target.tagName)) return; if(ev.key === 'k' || ev.key === 'K' || ev.code === 'Space'){ ev.preventDefault(); playBtn.click(); } if(ev.key === 'm' || ev.key === 'M'){ muteBtn.click(); } if(ev.key === 'ArrowRight'){ if(audio.duration) audio.currentTime = Math.min(audio.duration, audio.currentTime + 5); } if(ev.key === 'ArrowLeft'){ audio.currentTime = Math.max(0, audio.currentTime - 5); } if(ev.key === 'ArrowUp'){ audio.volume = Math.min(1, audio.volume + 0.05); localStorage.setItem(STORAGE.volume,String(audio.volume)); } if(ev.key === 'ArrowDown'){ audio.volume = Math.max(0, audio.volume - 0.05); localStorage.setItem(STORAGE.volume,String(audio.volume)); } });

    audio.addEventListener('volumechange', ()=>{ localStorage.setItem(STORAGE.volume,String(audio.volume)); });

    function renderWave(){ if(!analyser) return; analyser.getByteTimeDomainData(dataArray); ctx.clearRect(0,0,canvas.width,canvas.height); const gradient = ctx.createLinearGradient(0,0,canvas.width,0); gradient.addColorStop(0,'#2CB7B3'); gradient.addColorStop(1,'#C8A23A'); ctx.strokeStyle = gradient; ctx.lineWidth = 2; ctx.beginPath(); const slice = canvas.width / dataArray.length; let x=0; for(let i=0;i<dataArray.length;i++){ const v=(dataArray[i]-128)/128.0; const y=(v * canvas.height/2)+canvas.height/2; if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); x+=slice; } ctx.stroke(); if(!document.hidden) requestAnimationFrame(renderWave); }

    window.f2fPlayer = { audio, root, playBtn, muteBtn };
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();