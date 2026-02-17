// ═══════════════════════════════════════════
// REPRODUCTOR DE MÚSICA
// ═══════════════════════════════════════════

const PLAYLIST_RAW = [
  {
    title:    'MmmM',
    artist:   'Milo J & Paula Prieto',
    ytId:     '8Z_Vz9lLDK0',
    audioSrc: 'Musica/Milo_J__Paula_Prieto_-_MmmM__Instrumental_.mp3',
    spotifyId: '6gRT9V6RZGky3jrqPIggr5'
  },
  {
    title:    'Solifican12',
    artist:   'Milo J',
    ytId:     'l5u9AMn30yY',
    audioSrc: 'Musica/Solifican12.mp3',
    spotifyId: '4fDmgQfKMY7GcAwp2nNoQ0'
  }
  // ← más canciones aquí
];

// Fisher-Yates shuffle
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Mezcla aleatoria al cargar
const playlist = shuffle(PLAYLIST_RAW);
let trackIndex = 0;
let isLooping  = false;
let isShuffle  = true;
let panelOpen  = false;

const mpPlayer     = document.getElementById('music-player');
const mpPanel      = document.getElementById('mpPanel');
const mpPill       = document.getElementById('mpPill');
const mpPillLbl    = document.getElementById('mpPillLabel');
const mpAudio      = document.getElementById('mpAudio');
const mpPlayBtn    = document.getElementById('mpPlayBtn');
const mpPlayIcon   = document.getElementById('mpPlayIcon');
const mpPrev       = document.getElementById('mpPrev');
const mpNext       = document.getElementById('mpNext');
const mpLoop       = document.getElementById('mpLoop');
const mpShuffleBtn = document.getElementById('mpShuffle');
const mpVolume     = document.getElementById('mpVolume');
const mpFill       = document.getElementById('mpProgressFill');
const mpBar        = document.getElementById('mpProgressBar');
const mpCurrent    = document.getElementById('mpCurrent');
const mpDuration   = document.getElementById('mpDuration');
const mpTrackName  = document.getElementById('mpTrackName');
const mpTrackArtist= document.getElementById('mpTrackArtist');
const mpCover      = document.getElementById('mpCover');
const mpYtLink     = document.getElementById('mpYtLink');
const mpPlaylistEl = document.getElementById('mpPlaylist');

function fmtTime(s) {
  if (isNaN(s)||!isFinite(s)) return '0:00';
  return Math.floor(s/60) + ':' + String(Math.floor(s%60)).padStart(2,'0');
}

function renderPlaylist() {
  mpPlaylistEl.innerHTML = '';
  playlist.forEach((t, i) => {
    const row = document.createElement('div');
    const active = i === trackIndex;
    row.style.cssText = [
      'display:flex;align-items:center;gap:8px;padding:6px 8px;cursor:pointer;',
      "font-family:'Space Mono',monospace;font-size:0.58rem;letter-spacing:0.06em;",
      'color:' + (active ? 'var(--green)' : 'var(--muted)') + ';',
      'border-left:2px solid ' + (active ? 'var(--green)' : 'transparent') + ';',
      'transition:all 0.15s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'
    ].join('');
    row.textContent = (active ? '▶ ' : '') + t.title + ' — ' + t.artist;
    row.addEventListener('click', () => { trackIndex = i; loadTrack(); });
    row.addEventListener('mouseenter', () => { if (i!==trackIndex) row.style.color='var(--white)'; });
    row.addEventListener('mouseleave', () => { if (i!==trackIndex) row.style.color='var(--muted)'; });
    mpPlaylistEl.appendChild(row);
  });
}

function loadTrack(autoplay = true) {
  const t = playlist[trackIndex];

  // Audio
  mpAudio.src = t.audioSrc;
  mpAudio.load();
  if (autoplay) mpAudio.play().catch(() => {});

  // Info visual
  mpTrackName.textContent    = t.title;
  mpTrackArtist.textContent  = t.artist;
  mpPillLbl.textContent      = t.title;

  // Portada personalizada (no sobreescribir con YouTube)
  // if (mpCover) {
  //   mpCover.src = 'https://i.ytimg.com/vi/' + t.ytId + '/mqdefault.jpg';
  // }
  if (mpYtLink) {
    mpYtLink.href = 'https://music.youtube.com/watch?v=' + t.ytId;
  }
  
  // Actualizar link de Spotify
  const mpSpotifyLink = document.getElementById('mpSpotifyLink');
  if (mpSpotifyLink && t.spotifyId) {
    mpSpotifyLink.href = 'https://open.spotify.com/intl-es/track/' + t.spotifyId;
  }

  renderPlaylist();
}

// Toggle panel
mpPill.addEventListener('click', () => {
  panelOpen = !panelOpen;
  mpPanel.classList.toggle('open', panelOpen);
  mpPlayer.classList.toggle('open', panelOpen);
});

// Play / Pause
mpPlayBtn.addEventListener('click', () => {
  if (mpAudio.paused) mpAudio.play().catch(()=>{});
  else mpAudio.pause();
});

mpAudio.addEventListener('play', () => {
  mpPlayer.classList.add('playing');
  mpPlayIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
});
mpAudio.addEventListener('pause', () => {
  mpPlayer.classList.remove('playing');
  mpPlayIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
});

// Progress
mpAudio.addEventListener('timeupdate', () => {
  if (!mpAudio.duration) return;
  mpFill.style.width = (mpAudio.currentTime / mpAudio.duration * 100) + '%';
  mpCurrent.textContent  = fmtTime(mpAudio.currentTime);
  mpDuration.textContent = fmtTime(mpAudio.duration);
});
mpBar.addEventListener('click', e => {
  if (!mpAudio.duration) return;
  const r = mpBar.getBoundingClientRect();
  mpAudio.currentTime = ((e.clientX - r.left) / r.width) * mpAudio.duration;
});

// Volume
mpAudio.volume = 0.8;
mpVolume.addEventListener('input', () => { mpAudio.volume = mpVolume.value; });

// Loop
mpLoop.addEventListener('click', () => {
  isLooping = !isLooping;
  mpAudio.loop      = isLooping;
  mpLoop.style.opacity = isLooping ? '1' : '0.4';
  mpLoop.style.color   = isLooping ? 'var(--green)' : '';
});

// Shuffle (re-mezcla)
mpShuffleBtn.addEventListener('click', () => {
  isShuffle = !isShuffle;
  mpShuffleBtn.style.opacity = isShuffle ? '1' : '0.4';
  mpShuffleBtn.style.color   = isShuffle ? 'var(--green)' : '';
  if (isShuffle) {
    const current = playlist[trackIndex];
    const mixed = shuffle(playlist);
    playlist.splice(0, playlist.length, ...mixed);
    trackIndex = playlist.findIndex(t => t === current);
    renderPlaylist();
  }
});

// Prev / Next
mpPrev.addEventListener('click', () => {
  trackIndex = (trackIndex - 1 + playlist.length) % playlist.length;
  loadTrack();
});
function nextTrack() {
  trackIndex = (trackIndex + 1) % playlist.length;
  loadTrack();
}
mpNext.addEventListener('click', nextTrack);
mpAudio.addEventListener('ended', () => { if (!isLooping) nextTrack(); });

// Iniciar sin autoplay (el navegador lo bloquea sin interacción)
loadTrack(false);
