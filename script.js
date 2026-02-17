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
// CHARACTER SPRITE SCROLL ANIMATION
// ═══════════════════════════════════════════

const char = document.getElementById('scrollChar');
const aboutSection = document.getElementById('about');

const FRAMES = [
  'Imagenes/Frame/1.png',
  'Imagenes/Frame/2.png',
  'Imagenes/Frame/3.png',
  'Imagenes/Frame/4.png',
  'Imagenes/Frame/5.png'
];

const TOTAL_FRAMES = FRAMES.length;
let currentFrame = 0;

FRAMES.forEach((src, i) => {
  const img = new Image();
  img.src = src;
});

function updateCharFrame() {
  if (!char || !aboutSection) return;
  const rect = aboutSection.getBoundingClientRect();
  const winH = window.innerHeight;

  const sectionStart = rect.top;
  const sectionEnd = rect.bottom;
  const activeRange = winH * 0.8; // Más rápido: de 1.5 a 0.8

  const progress = Math.max(0, Math.min(1,
    (winH - sectionStart) / (activeRange)
  ));

  const frameIdx = Math.floor(progress * TOTAL_FRAMES) % TOTAL_FRAMES;

  if (frameIdx !== currentFrame) {
    currentFrame = frameIdx;
    char.src = FRAMES[currentFrame];
  }

  const isVisible = sectionStart < winH * 0.8 && sectionEnd > winH * 0.1;
  if (isVisible) {
    char.classList.add('looking-at-you');
  } else {
    char.classList.remove('looking-at-you');
  }
}

window.addEventListener('scroll', updateCharFrame, { passive: true });
updateCharFrame();

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
