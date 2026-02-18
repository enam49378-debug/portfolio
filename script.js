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

document.querySelectorAll('a, button, .work-card, .stat-card, .skill-item').forEach(el => {
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

const FRAMES = [
  'Imagenes/Frame/1.png',
  'Imagenes/Frame/2.png',
  'Imagenes/Frame/3.png',
  'Imagenes/Frame/4.png',
  'Imagenes/Frame/5.png'
];

const TOTAL_FRAMES = FRAMES.length;
let currentFrame = 0;
let isAnimating = false;
let resetTimeout = null;

// Precarga frames
FRAMES.forEach((src, i) => {
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
  
  // Limpia reset anterior
  if (resetTimeout) clearTimeout(resetTimeout);
  
  let currentIdx = currentFrame;
  
  function advance() {
    currentIdx++;
    
    if (currentIdx < TOTAL_FRAMES) {
      updateCharFrame(currentIdx);
      setTimeout(advance, 200); // 200ms entre frames
    } else {
      // Llegó al frame 5, espera 2 segundos y vuelve
      isAnimating = false;
      resetTimeout = setTimeout(() => {
        reverseAnimation();
      }, 2000);
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
      setTimeout(reverse, 200);
    } else {
      // Volvió al frame 0
      updateCharFrame(0);
      isAnimating = false;
      touchHint.classList.remove('hidden');
      
      // Schedule auto-reset aleatorio entre 60-120 segundos (1-2 minutos)
      const randomDelay = Math.random() * (120000 - 60000) + 60000;
      resetTimeout = setTimeout(() => {
        if (!isAnimating) {
          animateFrames();
        }
      }, randomDelay);
    }
  }
  
  reverse();
}

// Event listeners - touch y click
if (char) {
  char.addEventListener('click', (e) => {
    e.preventDefault();
    animateFrames();
  });
  
  char.addEventListener('touchstart', (e) => {
    e.preventDefault();
    animateFrames();
  });
}

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
