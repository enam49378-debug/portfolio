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
let direction = 1; // 1 = adelante, -1 = atrás

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
  
  // Limpia reset anterior si existe
  if (resetTimeout) clearTimeout(resetTimeout);
  
  let progress = 0;
  const animationSpeed = 0.15; // 15% por frame
  
  function advance() {
    progress += animationSpeed;
    const frameIdx = Math.floor(progress * TOTAL_FRAMES);
    
    if (frameIdx < TOTAL_FRAMES) {
      updateCharFrame(frameIdx);
      requestAnimationFrame(advance);
    } else {
      // Animación llegó al frame 5, ahora espera y vuelve atrás
      isAnimating = false;
      
      resetTimeout = setTimeout(() => {
        reverseAnimation();
      }, 2000); // Espera 2 segundos antes de volver
    }
  }
  
  advance();
}

function reverseAnimation() {
  if (isAnimating) return;
  
  isAnimating = true;
  
  let progress = 1;
  const animationSpeed = 0.15;
  
  function reverse() {
    progress -= animationSpeed;
    const frameIdx = Math.floor(progress * TOTAL_FRAMES);
    
    if (frameIdx >= 0) {
      updateCharFrame(frameIdx);
      requestAnimationFrame(reverse);
    } else {
      // Volvió al frame 1
      updateCharFrame(0);
      isAnimating = false;
      touchHint.classList.remove('hidden');
    }
  }
  
  reverse();
}

// Event listeners para click/touch
char.addEventListener('click', animateFrames);
char.addEventListener('touchstart', (e) => {
  e.preventDefault();
  animateFrames();
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
