// ═══════════════════════════════════════════
// CURSOR PERSONALIZADO
// ═══════════════════════════════════════════

const cursor = document.getElementById('cursor');
const trail = document.getElementById('cursorTrail');
let tx = 0, ty = 0, cx = 0, cy = 0;

document.addEventListener('mousemove', e => {
  tx = e.clientX;
  ty = e.clientY;
  cursor.style.left = tx + 'px';
  cursor.style.top = ty + 'px';
});

function animTrail() {
  cx += (tx - cx) * 0.18;
  cy += (ty - cy) * 0.18;
  trail.style.left = cx + 'px';
  trail.style.top = cy + 'px';
  requestAnimationFrame(animTrail);
}
animTrail();

// ═══════════════════════════════════════════
// HOVER EFFECTS EN CLICKABLES
// ═══════════════════════════════════════════

document.querySelectorAll('a, button, .work-card, .stat-card, .skill-item, .skin-option').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(2)';
    trail.style.opacity = '0.5';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    trail.style.opacity = '1';
  });
});

// ═══════════════════════════════════════════
// SCROLL REVEAL (FADE-IN)
// ═══════════════════════════════════════════

const observer = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// ═══════════════════════════════════════════
// CHARACTER SPRITE INTERACTIVO (TOQUE)
// ═══════════════════════════════════════════

const char = document.getElementById('scrollChar');
const touchHint = document.getElementById('touchHint');

const SKINS = {
  normal: [
    'Imagenes/Frame/1.png',
    'Imagenes/Frame/2.png',
    'Imagenes/Frame/3.png',
    'Imagenes/Frame/4.png',
    'Imagenes/Frame/5.png'
  ],
  meid: [
    'Imagenes/Frame/Meid/1.png',
    'Imagenes/Frame/Meid/2.png',
    'Imagenes/Frame/Meid/3.png',
    'Imagenes/Frame/Meid/4.png',
    'Imagenes/Frame/Meid/5.png'
  ]
};

let activeSkin = 'normal';
let FRAMES = SKINS[activeSkin];
const TOTAL_FRAMES = 5;
let currentFrame = 0;
let isAnimating = false;
let resetTimeout = null;

// Precarga todas las skins
Object.values(SKINS).flat().forEach(src => {
  const img = new Image();
  img.src = src;
});

function updateCharFrame(frameIdx) {
  if (frameIdx >= 0 && frameIdx < TOTAL_FRAMES) {
    currentFrame = frameIdx;
    char.src = FRAMES[currentFrame];
  }
}

function animateFrames() {
  if (isAnimating) return;
  isAnimating = true;
  touchHint.classList.add('hidden');
  if (resetTimeout) clearTimeout(resetTimeout);
  let currentIdx = currentFrame;
  function advance() {
    currentIdx++;
    if (currentIdx < TOTAL_FRAMES) {
      updateCharFrame(currentIdx);
      setTimeout(advance, (window.ANIM_CONFIG?.scrollCharFrame?.frameMs) || 200);
    } else {
      isAnimating = false;
      resetTimeout = setTimeout(() => { reverseAnimation(); }, 2000);
    }
  }
  advance();
}

function reverseAnimation() {
  if (isAnimating) return;
  isAnimating = true;
  let currentIdx = TOTAL_FRAMES - 1;
  function reverse() {
    currentIdx--;
    if (currentIdx >= 0) {
      updateCharFrame(currentIdx);
      setTimeout(reverse, (window.ANIM_CONFIG?.scrollCharFrame?.frameMs) || 200);
    } else {
      updateCharFrame(0);
      isAnimating = false;
      touchHint.classList.remove('hidden');
      const randomDelay = Math.random() * (120000 - 60000) + 60000;
      resetTimeout = setTimeout(() => {
        if (!isAnimating) animateFrames();
      }, randomDelay);
    }
  }
  reverse();
}

if (char) {
  char.addEventListener('click', (e) => { e.preventDefault(); animateFrames(); });
  char.addEventListener('touchstart', (e) => { e.preventDefault(); animateFrames(); });
}

// ═══════════════════════════════════════════
// SELECTOR DE SKINS
// ═══════════════════════════════════════════

// Guardamos el frame de cada skin por separado
const skinFrames = { normal: 0, meid: 0 };

document.querySelectorAll('.skin-option').forEach(btn => {
  btn.addEventListener('click', () => {
    const skin = btn.dataset.skin;
    if (skin === activeSkin) return;

    // Actualizar activo visualmente
    document.querySelectorAll('.skin-option').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Cancelar animación en curso
    if (resetTimeout) clearTimeout(resetTimeout);
    isAnimating = false;

    // Guardar el frame actual de la skin que dejamos
    skinFrames[activeSkin] = currentFrame;

    // Cambiar skin
    activeSkin = skin;
    FRAMES = SKINS[activeSkin];

    // Recuperar el frame donde estaba esta skin (o 0 si nunca se usó)
    const savedFrame = skinFrames[activeSkin];

    // Fade out → cambiar → fade in en el frame guardado
    char.style.transition = 'opacity 0.2s ease';
    char.style.opacity = '0';
    setTimeout(() => {
      currentFrame = savedFrame;
      char.src = FRAMES[currentFrame];
      char.style.opacity = '1';
      // Si no estamos en frame 0, no mostrar el hint
      if (currentFrame === 0) {
        touchHint.classList.remove('hidden');
      } else {
        touchHint.classList.add('hidden');
        // Programar la animación de vuelta igual que cuando termina animateFrames
        resetTimeout = setTimeout(() => { reverseAnimation(); }, (window.ANIM_CONFIG?.scrollCharFrame?.pauseMs) || 2000);
      }
    }, 200);
  });
});

// ═══════════════════════════════════════════
// NAV ACTIVE HIGHLIGHT
// ═══════════════════════════════════════════

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 100) current = s.id;
  });
  navLinks.forEach(a => {
    a.style.color = a.getAttribute('href') === '#' + current
      ? 'var(--green)' : '';
  });
});

// ═══════════════════════════════════════════
// CHIBI HERO — SQUISH AL TOCAR
// ═══════════════════════════════════════════

const chibiHero = document.getElementById('chibiHero');

if (chibiHero) {
  chibiHero.style.cursor = 'pointer';
  chibiHero.style.transformOrigin = 'bottom center';
  let squishAnim = null;

  function doSquish() {
    if (squishAnim) squishAnim.cancel();

    // El vuelo está en el wrapper padre — este elemento solo hace scale puro, sin conflicto
    squishAnim = chibiHero.animate([
      { transform: 'scaleX(1)    scaleY(1)',    easing: 'cubic-bezier(0.2,0,0.4,1)' },
      { transform: 'scaleX(1.45) scaleY(0.6)',  easing: 'cubic-bezier(0.2,0,0.4,1)', offset: 0.15 },
      { transform: 'scaleX(0.75) scaleY(1.35)', easing: 'cubic-bezier(0.2,0,0.4,1)', offset: 0.35 },
      { transform: 'scaleX(1.18) scaleY(0.85)', easing: 'cubic-bezier(0.2,0,0.4,1)', offset: 0.52 },
      { transform: 'scaleX(0.92) scaleY(1.1)',  easing: 'cubic-bezier(0.2,0,0.4,1)', offset: 0.68 },
      { transform: 'scaleX(1.05) scaleY(0.96)', easing: 'cubic-bezier(0.2,0,0.4,1)', offset: 0.82 },
      { transform: 'scaleX(1)    scaleY(1)' }
    ], { duration: 600, fill: 'none' });
  }

  chibiHero.addEventListener('click', doSquish);
  chibiHero.addEventListener('touchstart', (e) => {
    e.preventDefault();
    doSquish();
  });
}

// ═══════════════════════════════════════════
// HAMBURGER MENU (MOBILE)
// ═══════════════════════════════════════════

const navHamburger  = document.getElementById('navHamburger');
const navDrawer     = document.getElementById('navDrawer');
const drawerLinks   = document.querySelectorAll('.nav-drawer-link');
const navWallpapersMobile = document.getElementById('navWallpapersMobile');

function toggleDrawer(force) {
  const open = force !== undefined ? force : !navDrawer.classList.contains('open');
  navDrawer.classList.toggle('open', open);
  navHamburger.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
}

if (navHamburger) {
  navHamburger.addEventListener('click', () => toggleDrawer());
}

// Close drawer when a link is clicked
drawerLinks.forEach(link => {
  link.addEventListener('click', () => toggleDrawer(false));
});

// Mobile wallpapers button in drawer
if (navWallpapersMobile) {
  navWallpapersMobile.addEventListener('click', (e) => {
    toggleDrawer(false);
    openWallpapers(e);
  });
}

// ═══════════════════════════════════════════
// CHIBI PERUANO — ELEINA (ALPACA) + ENTRADA FLUIDA
// ═══════════════════════════════════════════

let llamaActive = false;
let llamaTimers = [];

function llamaTimeout(fn, ms) {
  const t = setTimeout(fn, ms);
  llamaTimers.push(t);
}

function clearLlamaTimers() {
  llamaTimers.forEach(t => clearTimeout(t));
  llamaTimers = [];
}

function playLlamaEntrance() {
  if (llamaActive) return;
  llamaActive = true;
  clearLlamaTimers();

  // ── referencias ──
  const flyWrap  = chibiHero.closest('.chibi-fly-wrap');
  const floatWrap = chibiHero.closest('.chibi-float-wrap');
  const shadow   = document.getElementById('chibiHeroShadow');
  const hero     = document.querySelector('.hero');

  // Tamaño del chibi normal: 280px (igual que .chibi-float)
  const CHIBI_W = 280;
  // Eleina: mostrarla proporcional, aprox 300px de alto
  const ELEINA_H = 300;
  const ELEINA_W = 320; // aprox ratio de la imagen

  // ── 1. Ocultar chibi flotante ──
  flyWrap.style.transition = 'opacity 0.25s';
  flyWrap.style.opacity = '0';
  shadow.style.transition = 'opacity 0.25s';
  shadow.style.opacity = '0';

  // ── 2. Crear contenedor de escena ──
  // Lo ponemos absolutamente dentro del hero, en la misma posición que .chibi-float-wrap
  const scene = document.createElement('div');
  scene.id = 'llamaScene';
  // Misma posición que .chibi-float-wrap: right:7vw, top:50%, translateY(-50%)
  scene.style.cssText = `
    position: absolute;
    right: 7vw;
    top: 50%;
    transform: translateY(-50%);
    width: ${ELEINA_W + CHIBI_W * 0.4}px;
    height: ${ELEINA_H + 60}px;
    pointer-events: none;
    z-index: 20;
    overflow: visible;
  `;
  hero.appendChild(scene);

  // ── 3. Eleina (imagen real) ──
  const eleinaWrap = document.createElement('div');
  eleinaWrap.style.cssText = `
    position: absolute;
    bottom: 0;
    left: 0;
    width: ${ELEINA_W}px;
    height: ${ELEINA_H}px;
  `;
  const eleina = document.createElement('img');
  eleina.src = 'Imagenes/Frame/Personajes/Eleina.png';
  eleina.id = 'eleinaImg';
  eleina.style.cssText = `
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: bottom left;
    filter: drop-shadow(0 8px 16px rgba(0,0,0,0.3));
    will-change: transform;
    display: block;
  `;
  eleinaWrap.appendChild(eleina);
  scene.appendChild(eleinaWrap);

  // ── 4. Chibi peruano montado encima de Eleina ──
  // Se sienta sobre el lomo: aprox 55% desde la base de Eleina
  const rider = document.createElement('img');
  rider.src = 'Imagenes/Frame/Jesuluto Chibi/Chibi peruano.png';
  rider.id = 'chibiRider';
  // Mismo tamaño que el chibi normal (280px)
  // Posición del rider: usa ANIM_CONFIG.rider si el editor la personalizó
  const RC = (window.ANIM_CONFIG && window.ANIM_CONFIG.rider) ? window.ANIM_CONFIG.rider : {};
  const riderBottom = RC.bottom !== undefined ? RC.bottom : 36;
  const riderLeft   = RC.left   !== undefined ? RC.left   : 43;

  rider.style.cssText = `
    position: absolute;
    width: ${CHIBI_W}px;
    image-rendering: pixelated;
    bottom: ${riderBottom}px;
    left: ${riderLeft}px;
    filter: drop-shadow(0 0 18px rgba(111,207,74,0.4));
    will-change: transform, bottom, left, opacity;
    z-index: 2;
  `;
  scene.appendChild(rider);

  // ── Helpers para leer keyframes del editor ──
  // Convierte los keyframes del editor a CSS @keyframes real
  function buildEleinaKeyframeCSS(animKey, animName) {
    const A = window.ANIMATIONS && window.ANIMATIONS[animKey];
    if (!A) return null;
    const easings = {
      linear:'linear', ease:'ease', 'ease-in':'ease-in', 'ease-out':'ease-out',
      'ease-in-out':'ease-in-out',
      bounce:'cubic-bezier(0.68,-0.55,0.27,1.55)',
      elastic:'cubic-bezier(0.175,0.885,0.32,1.275)',
      spring:'cubic-bezier(0.45,0.05,0.55,0.95)',
      steps3:'steps(3,end)', steps6:'steps(6,end)',
    };
    let css = `@keyframes ${animName} {
`;
    A.keyframes.forEach(kf => {
      const pct = Math.round(kf.offset * 100);
      let transform = '';
      const p = kf.props;
      if (p.translateX !== undefined) transform += `translateX(${p.translateX}px) `;
      if (p.translateY !== undefined) transform += `translateY(${p.translateY}px) `;
      if (p.rotate     !== undefined) transform += `rotate(${p.rotate}deg) `;
      if (p.scaleX     !== undefined) transform += `scaleX(${p.scaleX}) `;
      if (p.scaleY     !== undefined) transform += `scaleY(${p.scaleY}) `;
      // Para entry: envolver en translateY(-50%) para preservar el centrado vertical
      if (animKey === 'eleinaEntrada') {
        transform = `translateY(-50%) ${transform}`.trim();
      }
      css += `  ${pct}% {`;
      if (transform) css += ` transform: ${transform.trim()};`;
      if (p.opacity !== undefined) css += ` opacity: ${p.opacity};`;
      css += ` }
`;
    });
    css += `}`;
    const easing = easings[A.easing] || A.easing;
    return { css, duration: A.duration, easing, iterationCount: A.iterationCount || 1 };
  }

  function injectEleinaStyle(id, css) {
    let el = document.getElementById('dynStyle_' + id);
    if (!el) { el = document.createElement('style'); el.id = 'dynStyle_' + id; document.head.appendChild(el); }
    el.textContent = css;
  }

  // ── 5. Entrada de escena ──
  // Posición inicial: fuera de pantalla a la derecha
  scene.style.transform = 'translateY(-50%) translateX(700px)';
  scene.getBoundingClientRect(); // forzar reflow

  const entryAnim = buildEleinaKeyframeCSS('eleinaEntrada', 'llamaEntradaDynamic');
  if (entryAnim) {
    injectEleinaStyle('llamaEntrada', entryAnim.css);
    scene.style.transition = 'none';
    scene.style.animation = `llamaEntradaDynamic ${entryAnim.duration}ms ${entryAnim.easing} 1 forwards`;
  } else {
    // fallback si el editor no está cargado
    scene.style.transition = `transform 1400ms cubic-bezier(0.22,1,0.36,1)`;
    scene.style.transform = 'translateY(-50%) translateX(0px)';
  }

  // Leer duraciones del editor o usar defaults
  const A_entry    = window.ANIMATIONS?.eleinaEntrada;
  const A_dismount = window.ANIMATIONS?.chibiRiderBajada;
  const A_exit     = window.ANIMATIONS?.eleinaSalida;
  const entryDur   = A_entry    ? A_entry.duration    : 1400;
  const dismountDur= A_dismount ? A_dismount.duration  : 700;
  const exitDur    = A_exit     ? A_exit.duration      : 1000;

  // Tiempos de la secuencia basados en la duración de entrada real
  const dismountDelay  = entryDur + 300;
  const exitDelay      = dismountDelay + dismountDur + 700;
  const fadeDelay      = exitDelay + exitDur + 200;
  const showChibiDelay = fadeDelay + 500;

  // ── 6. Chibi se baja ──
  llamaTimeout(() => {
    const dismountAnim = buildEleinaKeyframeCSS('chibiRiderBajada', 'llamaBajadaDynamic');
    if (dismountAnim) {
      injectEleinaStyle('llamaBajada', dismountAnim.css);
      rider.style.transition = 'none';
      rider.style.animation = `llamaBajadaDynamic ${dismountAnim.duration}ms ${dismountAnim.easing} 1 forwards`;
    } else {
      rider.style.transition = `bottom 700ms cubic-bezier(0.4,0,0.2,1), left 500ms cubic-bezier(0.4,0,0.2,1)`;
      rider.style.bottom = '0px';
      rider.style.left = `${Math.round(ELEINA_W * 0.15)}px`;
    }
  }, dismountDelay);

  // ── 7. Eleina se va ──
  llamaTimeout(() => {
    const exitAnim = buildEleinaKeyframeCSS('eleinaSalida', 'llamaSalidaDynamic');
    if (exitAnim) {
      injectEleinaStyle('llamaSalida', exitAnim.css);
      eleinaWrap.style.transition = 'none';
      eleinaWrap.style.animation = `llamaSalidaDynamic ${exitAnim.duration}ms ${exitAnim.easing} 1 forwards`;
    } else {
      eleinaWrap.style.transition = `transform 1000ms cubic-bezier(0.55,0,0.75,0.05)`;
      eleinaWrap.style.transform = 'translateX(500px)';
    }
  }, exitDelay);

  // ── 8. Fade out rider ──
  llamaTimeout(() => {
    rider.style.transition = 'opacity 0.4s';
    rider.style.opacity = '0';
    chibiHero.style.transition = 'none';
    chibiHero.style.opacity = '0';
    chibiHero.src = 'Imagenes/Frame/Jesuluto Chibi/Chibi peruano.png';
  }, fadeDelay);

  llamaTimeout(() => {
    flyWrap.style.transition = 'opacity 0.5s';
    flyWrap.style.opacity = '1';
    chibiHero.style.transition = 'opacity 0.5s';
    chibiHero.style.opacity = '1';
    shadow.style.transition = 'opacity 0.5s';
    shadow.style.opacity = '1';
    scene.remove();
  }, showChibiDelay);
}

function playLlamaDeparture() {
  if (!llamaActive) return;
  llamaActive = false;
  clearLlamaTimers();

  // Limpiar escena si sigue activa
  const s = document.getElementById('llamaScene');
  if (s) s.remove();

  // Asegurar que flyWrap es visible
  const flyWrap = chibiHero.closest('.chibi-fly-wrap');
  flyWrap.style.opacity = '1';
  document.getElementById('chibiHeroShadow').style.opacity = '1';

  // Fade al chibi normal
  chibiHero.style.transition = 'opacity 0.4s ease';
  chibiHero.style.opacity = '0';
  llamaTimeout(() => {
    chibiHero.src = 'Imagenes/Frame/Jesuluto Chibi/Chibi.png';
    chibiHero.style.opacity = '1';
  }, 400);
}

document.addEventListener('trackchange', (e) => {
  if (!chibiHero) return;
  const isSolifican = e.detail.title === 'Solifican12';
  if (isSolifican) {
    playLlamaEntrance();
  } else {
    playLlamaDeparture();
  }
});

const pageMain      = document.getElementById('pageMain');
const pageWallpapers = document.getElementById('pageWallpapers');
const navWallpapers  = document.getElementById('navWallpapers');
const wpBack         = document.getElementById('wpBack');

function openWallpapers(e) {
  if (e) e.preventDefault();
  pageMain.classList.add('slide-out');
  pageWallpapers.classList.add('slide-in');
  pageWallpapers.scrollTop = 0;
  document.body.style.overflow = 'hidden';
}

function closeWallpapers() {
  pageMain.classList.remove('slide-out');
  pageWallpapers.classList.remove('slide-in');
  document.body.style.overflow = '';
}

if (navWallpapers) navWallpapers.addEventListener('click', openWallpapers);
if (wpBack) wpBack.addEventListener('click', closeWallpapers);

// Cerrar con tecla Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && pageWallpapers.classList.contains('slide-in')) {
    closeWallpapers();
  }
});

// ═══════════════════════════════════════════
// UNDERTALE BATTLE TRANSITION (corazón sobre página)
// ═══════════════════════════════════════════

const playBtn = document.querySelector('.game-play-btn');
const battleOverlay = document.getElementById('battleOverlay');
const battleZoomer = document.getElementById('battleZoomer');
const battleViewport = document.getElementById('battleViewport');
const battleHeart = document.getElementById('battleHeartEl');
const battleText = document.querySelector('.battle-encounter-text');
const battleFlash = document.getElementById('battleFlash');
const battleBarTop = document.getElementById('battleBarTop');
const battleBarBottom = document.getElementById('battleBarBottom');
const gameContainer = document.getElementById('gameContainer');
const gameIframe = document.getElementById('gameIframe');
const gameCloseBtn = document.getElementById('gameCloseBtn');

var btAudioCtx = null;

function btGetCtx() {
  try {
    if (!btAudioCtx) btAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (btAudioCtx.state === 'suspended') btAudioCtx.resume();
    return btAudioCtx;
  } catch (e) { return null; }
}

function btBeep(freq, delay, dur) {
  var ctx = btGetCtx();
  if (!ctx) return;
  try {
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = 'square';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.05, ctx.currentTime + delay);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(ctx.currentTime + delay);
    o.stop(ctx.currentTime + delay + dur);
  } catch (e) {}
}

function btPulseHeart() {
  battleHeart.classList.remove('bt-pulse');
  void battleHeart.offsetWidth;
  battleHeart.classList.add('bt-pulse');
}

function btFlashBrief() {
  battleFlash.style.transition = 'opacity .08s ease-out';
  battleFlash.style.opacity = '0.5';
  setTimeout(function () {
    battleFlash.style.opacity = '0';
  }, 120);
}

function btBlink() {
  battleOverlay.style.transition = 'opacity .05s linear';
  battleOverlay.style.opacity = '0';
  setTimeout(function () {
    battleOverlay.style.opacity = '1';
    battleOverlay.style.transition = '';
  }, 90);
}

function btReset() {
  battleHeart.classList.remove('visible', 'bt-pulse');
  battleHeart.style.top = '';
  battleHeart.style.left = '';
  battleHeart.style.transform = '';
  battleHeart.style.transition = '';
  battleZoomer.classList.remove('zoomed');
  battleViewport.classList.remove('bt-shake');
  battleZoomer.style.transition = '';
  battleZoomer.style.transform = '';
  battleFlash.style.opacity = '0';
  battleFlash.style.transition = '';
  battleBarTop.classList.remove('closed');
  battleBarBottom.classList.remove('closed');
  battleText.classList.remove('visible');
}

if (playBtn && battleOverlay && gameContainer && gameIframe) {
  var gameLoaded = false;

  playBtn.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (battleOverlay.classList.contains('active')) return;

    btReset();

    // Posición del botón en la pantalla
    var btnRect = playBtn.getBoundingClientRect();
    var btnCX = btnRect.left + btnRect.width / 2;
    var btnCY = btnRect.top + btnRect.height / 2;
    var vpCX = window.innerWidth / 2;
    var vpCY = window.innerHeight / 2;

    // Subir al inicio de la página (el corazón aparece donde está el botón)
    window.scrollTo({ top: 0 });

    // Bloquear scroll: forzar html y body a viewport fijo
    document.documentElement.style.setProperty('overflow', 'hidden', 'important');
    document.documentElement.style.setProperty('height', '100%', 'important');
    document.body.style.setProperty('overflow', 'hidden', 'important');
    document.body.style.setProperty('height', '100%', 'important');

    battleOverlay.style.display = 'flex';
    void battleOverlay.offsetWidth;
    battleOverlay.classList.add('active');

    // Colocar corazón en la posición del botón
    battleHeart.style.transition = 'none';
    battleHeart.style.top = btnCY + 'px';
    battleHeart.style.left = btnCX + 'px';
    battleHeart.style.transform = 'translate(-50%,-50%) scale(0.15)';
    battleHeart.classList.add('visible');
    void battleHeart.offsetWidth;

    // Animar corazón al centro de la pantalla + camera zoom
    battleHeart.style.transition = 'top 1s cubic-bezier(0.22,1,0.36,1), left 1s cubic-bezier(0.22,1,0.36,1), transform 1s cubic-bezier(0.22,1,0.36,1)';
    battleHeart.style.top = vpCY + 'px';
    battleHeart.style.left = vpCX + 'px';
    battleHeart.style.transform = 'translate(-50%,-50%) scale(1)';
    battleZoomer.classList.add('zoomed');

    // Texto "un monstruo aparece" (tras la animación de movimiento)
    setTimeout(function () { battleText.classList.add('visible'); }, 1100);

    // Latidos con sonidos (shifted +1200ms respecto al original)
    var beats = [[2200, 600], [3100, 650], [3900, 700], [4600, 780], [5200, 900]];
    beats.forEach(function (b) {
      btBeep(b[1], b[0] / 1000, 0.08);
      setTimeout(function () { btPulseHeart(); btFlashBrief(); }, b[0]);
    });

    // Escala ascendente "tac tac tururun"
    btBeep(260, 5.60, 0.05);
    btBeep(260, 5.80, 0.05);
    btBeep(520, 6.05, 0.09);
    btBeep(700, 6.15, 0.09);
    btBeep(950, 6.25, 0.12);

    // Flickers
    setTimeout(btBlink, 5600);
    setTimeout(btBlink, 5800);

    // Shake
    setTimeout(function () { battleViewport.classList.add('bt-shake'); }, 6050);

    // Flash final blanco
    setTimeout(function () {
      battleFlash.style.transition = 'opacity .08s';
      battleFlash.style.opacity = '1';
    }, 6200);

    // Apagar flash + quitar zoom
    setTimeout(function () {
      battleFlash.style.opacity = '0';
      battleZoomer.classList.remove('zoomed');
      battleZoomer.style.transform = 'scale(1)';
    }, 6310);

    // Cortinas negras cierran
    setTimeout(function () {
      battleBarTop.classList.add('closed');
      battleBarBottom.classList.add('closed');
    }, 6470);

    // Quitar shake
    setTimeout(function () { battleViewport.classList.remove('bt-shake'); }, 6550);

    // Ocultar overlay + cargar juego (cortinas cerradas → overlay oculto → aparece el juego)
    setTimeout(function () {
      battleOverlay.style.display = 'none';
      battleOverlay.classList.remove('active');
      btReset();
      if (!gameLoaded) {
        gameIframe.src = 'undertale-battle.html';
        gameLoaded = true;
      }
      gameContainer.style.display = 'flex';
      gameContainer.style.top = '0px';
      gameContainer.style.left = '0px';
      document.documentElement.classList.add('game-active');
      // NO restaurar scroll aquí — el juego sigue abierto
    }, 6700);
  });

  // Cerrar juego
  if (gameCloseBtn) {
    gameCloseBtn.addEventListener('click', function () {
      gameContainer.style.display = 'none';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.scrollBehavior = '';
      document.documentElement.classList.remove('game-active');
    });
  }

  // Escape para cerrar
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && gameContainer.style.display === 'flex') {
      gameContainer.style.display = 'none';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.scrollBehavior = '';
      document.documentElement.classList.remove('game-active');
    }
  });
}
