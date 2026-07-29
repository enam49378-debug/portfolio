// ═══════════════════════════════════════════
// VISUAL EDITOR v4 — Keyframe Editor + Timeline
// Presiona  E  para abrir / cerrar
// ═══════════════════════════════════════════

let editorMode = false;
let selectedEl = null;
const originalStyles = {};

// ── Interpolaciones disponibles ──
const EASINGS = {
  linear:       { css: 'linear',                       label: 'Linear',          desc: 'Velocidad constante, sin aceleración',         example: '→→→→→→→→' },
  ease:         { css: 'ease',                          label: 'Ease',            desc: 'Lento → rápido → lento (estándar)',            example: '→→⟹⟹→→' },
  'ease-in':    { css: 'ease-in',                       label: 'Ease In',         desc: 'Empieza lento, termina rápido',               example: '→→→⟹⟹⟹⟹' },
  'ease-out':   { css: 'ease-out',                      label: 'Ease Out',        desc: 'Empieza rápido, frena al final',              example: '⟹⟹⟹→→→→' },
  'ease-in-out':{ css: 'ease-in-out',                   label: 'Ease In-Out',     desc: 'Lento al inicio y al final',                  example: '→⟹⟹⟹⟹→' },
  bounce:       { css: 'cubic-bezier(0.68,-0.55,0.27,1.55)', label: 'Bounce',     desc: 'Rebota al llegar al destino',                 example: '⟹⟹⟹↩→' },
  elastic:      { css: 'cubic-bezier(0.175,0.885,0.32,1.275)', label: 'Elastic',  desc: 'Overshoot elástico al final',                 example: '⟹⟹⟹↩↩→' },
  steps3:       { css: 'steps(3, end)',                  label: 'Steps (3)',       desc: 'Salta en 3 pasos discretos',                  example: '→  →  →' },
  steps6:       { css: 'steps(6, end)',                  label: 'Steps (6)',       desc: 'Salta en 6 pasos discretos',                  example: '→ → → → → →' },
  spring:       { css: 'cubic-bezier(0.45,0.05,0.55,0.95)', label: 'Spring',      desc: 'Suave y natural como un resorte',             example: '→→⟹→→' },
};

// ── Animaciones del proyecto con keyframes reales ──
const ANIMATIONS = {
  chibiFly: {
    label: '🧸 Chibi Vuelo',
    target: '.chibi-fly-wrap',
    duration: 5000,
    iterationCount: 'infinite',
    easing: 'spring',
    keyframes: [
      { offset: 0,    props: { translateY: 0,   rotate: -1  } },
      { offset: 0.25, props: { translateY: -22, rotate: 1.5 } },
      { offset: 0.5,  props: { translateY: -38, rotate: -0.5} },
      { offset: 0.75, props: { translateY: -18, rotate: 1   } },
      { offset: 1,    props: { translateY: 0,   rotate: -1  } },
    ],
    propDefs: {
      translateY: { label: 'Y (px)',    min: -200, max: 50,  step: 1  },
      rotate:     { label: 'Rot (deg)', min: -15,  max: 15,  step: 0.1 },
    }
  },
  chibiSquish: {
    label: '💥 Chibi Squish',
    target: '#chibiHero',
    duration: 600,
    iterationCount: 1,
    easing: 'ease-in-out',
    keyframes: [
      { offset: 0,    props: { scaleX: 1,    scaleY: 1    } },
      { offset: 0.15, props: { scaleX: 1.35, scaleY: 0.65 } },
      { offset: 0.35, props: { scaleX: 0.78, scaleY: 1.28 } },
      { offset: 0.55, props: { scaleX: 1.15, scaleY: 0.88 } },
      { offset: 0.75, props: { scaleX: 0.93, scaleY: 1.08 } },
      { offset: 0.9,  props: { scaleX: 1.03, scaleY: 0.97 } },
      { offset: 1,    props: { scaleX: 1,    scaleY: 1    } },
    ],
    propDefs: {
      scaleX: { label: 'Scale X', min: 0.3, max: 2,   step: 0.01 },
      scaleY: { label: 'Scale Y', min: 0.3, max: 2,   step: 0.01 },
    }
  },
  hintBounce: {
    label: '🔽 Hint Triángulo',
    target: '.char-touch-hint',
    duration: 1500,
    iterationCount: 'infinite',
    easing: 'ease-in-out',
    keyframes: [
      { offset: 0,   props: { translateY: 0  } },
      { offset: 0.5, props: { translateY: 10 } },
      { offset: 1,   props: { translateY: 0  } },
    ],
    propDefs: {
      translateY: { label: 'Y (px)', min: -30, max: 30, step: 1 },
    }
  },
  chibyShadow: {
    label: '🌑 Sombra Chibi',
    target: '#chibiHeroShadow',
    duration: 5000,
    iterationCount: 'infinite',
    easing: 'spring',
    keyframes: [
      { offset: 0,    props: { scaleX: 1,    opacity: 0.7  } },
      { offset: 0.25, props: { scaleX: 0.82, opacity: 0.45 } },
      { offset: 0.5,  props: { scaleX: 0.65, opacity: 0.25 } },
      { offset: 0.75, props: { scaleX: 0.85, opacity: 0.5  } },
      { offset: 1,    props: { scaleX: 1,    opacity: 0.7  } },
    ],
    propDefs: {
      scaleX:  { label: 'Scale X',  min: 0.1, max: 2,   step: 0.01 },
      opacity: { label: 'Opacidad', min: 0,   max: 1,   step: 0.01 },
    }
  },

  eleinaEntrada: {
    label: '🦙 Eleina — Entrada',
    target: '#llamaScene',
    duration: 1400,
    iterationCount: 1,
    easing: 'ease-out',
    _isEleina: true,
    _phase: 'entry',
    keyframes: [
      { offset: 0,    props: { translateX: 700, opacity: 0   } },
      { offset: 0.15, props: { translateX: 500, opacity: 1   } },
      { offset: 0.75, props: { translateX: 28,  opacity: 1   } },
      { offset: 1,    props: { translateX: 113, opacity: 1   } },
    ],
    propDefs: {
      translateX: { label: 'X (px)',    min: -200, max: 900, step: 1   },
      opacity:    { label: 'Opacidad',  min: 0,    max: 1,   step: 0.01 },
    }
  },

  eleinaSalida: {
    label: '🦙 Eleina — Salida',
    target: '#eleinaImg',
    duration: 1000,
    iterationCount: 1,
    easing: 'ease-in',
    _isEleina: true,
    _phase: 'exit',
    keyframes: [
      { offset: 0,    props: { translateX: 0,   opacity: 1 } },
      { offset: 0.3,  props: { translateX: 80,  opacity: 1 } },
      { offset: 1,    props: { translateX: 600, opacity: 0 } },
    ],
    propDefs: {
      translateX: { label: 'X (px)',   min: -100, max: 800, step: 1   },
      opacity:    { label: 'Opacidad', min: 0,    max: 1,   step: 0.01 },
    }
  },

  chibiRiderBajada: {
    label: '🧸 Chibi Peruano — Bajada',
    target: '#chibiRider',
    duration: 700,
    iterationCount: 1,
    easing: 'ease-in-out',
    _isEleina: true,
    _phase: 'dismount',
    keyframes: [
      { offset: 0,    props: { translateY: 0,  rotate: 0  } },
      { offset: 0.3,  props: { translateY: -15, rotate: -8 } },
      { offset: 0.7,  props: { translateY: 100, rotate: 5  } },
      { offset: 1,    props: { translateY: 156, rotate: 0  } },
    ],
    propDefs: {
      translateY: { label: 'Y (px)',    min: -50,  max: 300, step: 1   },
      rotate:     { label: 'Rot (deg)', min: -30,  max: 30,  step: 0.5 },
    }
  },

  chibiRiderPos: {
    label: '📍 Chibi Peruano — Posición montado',
    target: '#chibiRider',
    duration: 1000,
    iterationCount: 1,
    easing: 'linear',
    _isEleina: true,
    _phase: 'riderPos',
    _isRiderPos: true,
    keyframes: [
      { offset: 0, props: { bottom: 36, left: 43 } },
      { offset: 1, props: { bottom: 36, left: 43 } },
    ],
    propDefs: {
      bottom: { label: 'Abajo (px)',   min: -60, max: 350, step: 1 },
      left:   { label: 'Izquierda (px)', min: -100, max: 400, step: 1 },
    }
  },
};

// ── Estado del editor de keyframes ──
let kfState = {
  animKey: null,
  selectedKfIndex: null,
  playing: false,
  playTimer: null,
  playhead: 0,
};

// ── Elementos de posición editables ──
const EDITABLE = [
  { id: 'chibiHero',       label: '🧸 Chibi Hero',       props: ['width'] },
  { id: 'scrollChar',      label: '🧍 Personaje About',  props: ['left','top','width','height'] },
  { id: 'touchHint',       label: '🔽 Hint triángulo',   props: ['left','top','width','height'] },
  { id: 'music-player',    label: '🎵 Reproductor',      props: ['left','top','width'] },
  { id: 'chibiHeroShadow', label: '🌑 Sombra chibi',     props: ['width'] },
];

// ── Activar/desactivar con E / Esc ──
document.addEventListener('keydown', e => {
  if ((e.key === 'e' || e.key === 'E') && !e.ctrlKey && !e.metaKey && !e.target.matches('input,textarea,select')) {
    e.preventDefault(); toggleEditor();
  }
  if (e.key === 'Escape' && editorMode) closeEditor();
});

function toggleEditor() { editorMode ? closeEditor() : openEditor(); }

function closeEditor() {
  document.getElementById('editorPanel')?.remove();
  document.getElementById('editorHighlight')?.remove();
  document.querySelectorAll('[data-ed-cursor]').forEach(el => el.style.cursor = '');
  document.removeEventListener('click', onPageClick, true);
  document.body.style.cursor = 'none';
  editorMode = false;
  selectedEl = null;
  if (kfState.playTimer) clearInterval(kfState.playTimer);
}

function openEditor() {
  editorMode = true;
  if (document.getElementById('editorPanel')) return;
  document.body.style.cursor = 'default';

  const panel = document.createElement('div');
  panel.id = 'editorPanel';
  panel.style.cssText = `
    position:fixed;top:16px;right:16px;width:340px;max-height:94vh;overflow-y:auto;
    background:#0d0f0e;border:2px solid #6fcf4a;border-radius:12px;padding:14px;
    font-family:'Space Mono',monospace;font-size:11px;color:#e8ede8;
    z-index:99999;box-shadow:0 0 40px rgba(111,207,74,.25);user-select:none;
    scrollbar-width:thin;scrollbar-color:#6fcf4a #141714;
  `;
  panel.innerHTML = buildHTML();
  document.body.appendChild(panel);

  const hl = document.createElement('div');
  hl.id = 'editorHighlight';
  hl.style.cssText = `position:fixed;pointer-events:none;z-index:99998;border:2px dashed #6fcf4a;border-radius:4px;display:none;`;
  document.body.appendChild(hl);

  // ── Hacer el panel arrastrable ──
  makePanelDraggable(panel);

  bindAll();
}

// ══════════════════════════════════════
// PANEL ARRASTRABLE
// ══════════════════════════════════════
function makePanelDraggable(panel) {
  // Header como handle
  const handle = panel.querySelector('#editorPanelHandle') || panel;

  // Crear handle visual en el header
  const headerDiv = panel.querySelector('div');
  if (headerDiv) {
    headerDiv.style.cursor = 'grab';
    headerDiv.title = 'Arrastra para mover el panel';

    // Indicador de drag
    const dragIcon = document.createElement('span');
    dragIcon.textContent = '⠿';
    dragIcon.style.cssText = 'color:#3a4a3a;font-size:14px;margin-right:6px;cursor:grab';
    headerDiv.insertBefore(dragIcon, headerDiv.firstChild);

    let isDragging = false;
    let startX, startY, startLeft, startTop;

    headerDiv.addEventListener('mousedown', e => {
      if (e.target.id === 'edClose') return;
      isDragging = true;
      headerDiv.style.cursor = 'grabbing';

      const rect = panel.getBoundingClientRect();
      startX    = e.clientX;
      startY    = e.clientY;
      startLeft = rect.left;
      startTop  = rect.top;

      // Cambiar de right/top a left/top para posicionamiento libre
      panel.style.right  = 'auto';
      panel.style.left   = startLeft + 'px';
      panel.style.top    = startTop  + 'px';

      e.preventDefault();
    });

    window.addEventListener('mousemove', e => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      let newLeft = startLeft + dx;
      let newTop  = startTop  + dy;

      // Mantener dentro de la ventana
      newLeft = Math.max(0, Math.min(window.innerWidth  - panel.offsetWidth,  newLeft));
      newTop  = Math.max(0, Math.min(window.innerHeight - panel.offsetHeight, newTop));

      panel.style.left = newLeft + 'px';
      panel.style.top  = newTop  + 'px';

      updateHighlight();
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) { isDragging = false; headerDiv.style.cursor = 'grab'; }
    });
  }
}

// ══════════════════════════════════════
// HTML del panel
// ══════════════════════════════════════
function buildHTML() {
  return `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid rgba(111,207,74,.25)">
    <span style="color:#6fcf4a;font-weight:bold;font-size:12px">✏️ EDITOR VISUAL v4</span>
    <button id="edClose" style="background:none;border:none;color:#5a6b5a;cursor:pointer;font-size:15px">✕</button>
  </div>

  <div style="display:flex;gap:5px;margin-bottom:14px">
    <button class="ed-tab active" data-tab="kf"   style="${tabStyle(true)}">🎬 Keyframes</button>
    <button class="ed-tab"        data-tab="pos"  style="${tabStyle(false)}">📐 Posición</button>
    <button class="ed-tab"        data-tab="cfg"  style="${tabStyle(false)}">💾 Config</button>
  </div>

  <!-- TAB: Keyframes -->
  <div id="tab-kf">
    ${buildKeyframeTab()}
  </div>

  <!-- TAB: Posición -->
  <div id="tab-pos" style="display:none">
    <div style="margin-bottom:10px">
      <div style="color:#6fcf4a;font-size:9px;letter-spacing:.1em;margin-bottom:5px">ELEMENTO</div>
      <select id="edSelect" style="width:100%;padding:7px;background:#141714;color:#e8ede8;border:1px solid #6fcf4a;border-radius:5px;font-family:'Space Mono',monospace;font-size:10px;cursor:pointer">
        <option value="">— haz click en la página —</option>
        ${EDITABLE.map(e => `<option value="${e.id}">${e.label}</option>`).join('')}
      </select>
    </div>
    <div id="edPosControls"><div style="color:#3a4a3a;font-size:10px;text-align:center;padding:20px 0">Selecciona un elemento</div></div>
    <div id="edCssWrap" style="display:none;margin-top:10px">
      <div style="color:#6fcf4a;font-size:9px;letter-spacing:.1em;margin-bottom:4px">CSS GENERADO</div>
      <textarea id="edCss" readonly style="width:100%;height:70px;background:#141714;color:#6fcf4a;border:1px solid rgba(111,207,74,.2);border-radius:4px;font-family:'Space Mono',monospace;font-size:9px;padding:6px;resize:none;box-sizing:border-box"></textarea>
    </div>
  </div>

  <!-- TAB: Config -->
  <div id="tab-cfg" style="display:none">
    <p style="color:#8a9a8a;font-size:10px;line-height:1.6;margin-bottom:14px">
      Exporta toda la configuración actual en <strong style="color:#6fcf4a">.json</strong>.
    </p>
    <button id="edDownload" style="width:100%;padding:10px;background:#6fcf4a;color:#0d0f0e;border:none;border-radius:5px;font-family:'Space Mono',monospace;font-weight:bold;cursor:pointer;font-size:11px;margin-bottom:8px">📥 Descargar config.json</button>
    <button id="edLoadBtn" style="width:100%;padding:10px;background:#1e2a1e;color:#6fcf4a;border:1px solid rgba(111,207,74,.3);border-radius:5px;font-family:'Space Mono',monospace;cursor:pointer;font-size:11px">📂 Cargar config.json</button>
    <input type="file" id="edFileInput" accept=".json" style="display:none">
    <div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(111,207,74,.15)">
      <button id="edReloadBtn" style="width:100%;padding:8px;background:#2a1e1e;color:#cf6f4a;border:1px solid rgba(207,111,74,.3);border-radius:5px;font-family:'Space Mono',monospace;cursor:pointer;font-size:10px">🔄 Recargar página</button>
    </div>
  </div>

  <div style="margin-top:12px;padding-top:8px;border-top:1px solid rgba(111,207,74,.1);color:#3a4a3a;font-size:9px;text-align:center">
    E / Esc para cerrar
  </div>`;
}

function buildKeyframeTab() {
  const animKeys = Object.keys(ANIMATIONS);
  return `
  <!-- Selector de animación -->
  <div style="margin-bottom:12px">
    <div style="color:#6fcf4a;font-size:9px;letter-spacing:.1em;margin-bottom:5px">ANIMACIÓN</div>
    <select id="kfAnimSelect" style="width:100%;padding:7px;background:#141714;color:#e8ede8;border:1px solid #6fcf4a;border-radius:5px;font-family:'Space Mono',monospace;font-size:10px;cursor:pointer">
      <option value="">— selecciona una animación —</option>
      ${animKeys.map(k => `<option value="${k}">${ANIMATIONS[k].label}</option>`).join('')}
    </select>
  </div>

  <!-- Area del editor de keyframes -->
  <div id="kfEditor" style="display:none">

    <!-- Interpolación -->
    <div style="background:#141714;border:1px solid rgba(111,207,74,.2);border-radius:8px;padding:10px;margin-bottom:10px">
      <div style="color:#6fcf4a;font-size:9px;letter-spacing:.1em;margin-bottom:8px">⚡ INTERPOLACIÓN</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:8px" id="easingBtns"></div>
      <!-- Preview de la interpolación -->
      <div style="background:#0d0f0e;border:1px solid rgba(111,207,74,.15);border-radius:6px;padding:10px;margin-top:6px">
        <div style="color:#5a6b5a;font-size:9px;margin-bottom:6px">PREVIEW</div>
        <div style="position:relative;height:50px;overflow:hidden">
          <canvas id="easingCanvas" width="290" height="50" style="width:100%;height:50px"></canvas>
        </div>
        <div id="easingDemo" style="margin-top:8px;position:relative;height:20px;overflow:hidden">
          <div id="easingBall" style="position:absolute;left:0;top:4px;width:12px;height:12px;background:#6fcf4a;border-radius:50%;transition:none"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:4px">
          <span style="color:#3a4a3a;font-size:8px">inicio</span>
          <span id="easingLabel" style="color:#8a9a8a;font-size:8px;font-weight:bold">Linear</span>
          <span style="color:#3a4a3a;font-size:8px">fin</span>
        </div>
        <button id="easingPlayBtn" style="width:100%;margin-top:6px;padding:5px;background:#1e2a1e;color:#6fcf4a;border:1px solid rgba(111,207,74,.3);border-radius:4px;font-family:'Space Mono',monospace;font-size:9px;cursor:pointer">▶ Animar demo</button>
      </div>
    </div>

    <!-- Duración -->
    <div style="background:#141714;border:1px solid rgba(111,207,74,.2);border-radius:8px;padding:10px;margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="color:#6fcf4a;font-size:9px;letter-spacing:.1em">⏱ DURACIÓN</div>
        <div style="display:flex;align-items:center;gap:6px">
          <input type="number" id="kfDurationNum" min="100" max="20000" step="100"
            style="width:65px;padding:3px 5px;background:#0d0f0e;color:#e8ede8;border:1px solid rgba(111,207,74,.3);border-radius:3px;font-family:'Space Mono',monospace;font-size:9px;text-align:right">
          <span style="color:#5a6b5a;font-size:9px">ms</span>
        </div>
      </div>
      <input type="range" id="kfDuration" min="100" max="20000" step="100"
        style="width:100%;accent-color:#6fcf4a;cursor:pointer;height:3px">
      <div style="display:flex;justify-content:space-between;margin-top:6px;align-items:center">
        <span style="color:#5a6b5a;font-size:9px">Repeticiones:</span>
        <select id="kfIterations" style="background:#0d0f0e;color:#e8ede8;border:1px solid rgba(111,207,74,.3);border-radius:3px;font-family:'Space Mono',monospace;font-size:9px;padding:3px 5px;cursor:pointer">
          <option value="infinite">∞ Infinito</option>
          <option value="1">1×</option>
          <option value="2">2×</option>
          <option value="3">3×</option>
          <option value="5">5×</option>
        </select>
      </div>
    </div>

    <!-- Línea de tiempo -->
    <div style="background:#141714;border:1px solid rgba(111,207,74,.2);border-radius:8px;padding:10px;margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div style="color:#6fcf4a;font-size:9px;letter-spacing:.1em">📅 LÍNEA DE TIEMPO</div>
        <div style="display:flex;gap:5px">
          <button id="kfPlayBtn" style="padding:4px 8px;background:#1e2a1e;color:#6fcf4a;border:1px solid rgba(111,207,74,.3);border-radius:4px;font-family:'Space Mono',monospace;font-size:9px;cursor:pointer">▶</button>
          <button id="kfAddKf" style="padding:4px 8px;background:#1e2a1e;color:#6fcf4a;border:1px solid rgba(111,207,74,.3);border-radius:4px;font-family:'Space Mono',monospace;font-size:9px;cursor:pointer">+ KF</button>
        </div>
      </div>
      <!-- Timeline visual -->
      <div style="position:relative;background:#0d0f0e;border:1px solid rgba(111,207,74,.15);border-radius:4px;overflow:hidden">
        <!-- Regla de tiempo -->
        <div id="kfRuler" style="height:18px;position:relative;border-bottom:1px solid rgba(111,207,74,.15)"></div>
        <!-- Pista -->
        <div id="kfTrack" style="height:38px;position:relative;cursor:crosshair"></div>
        <!-- Playhead -->
        <div id="kfPlayhead" style="position:absolute;top:0;left:0;width:2px;height:100%;background:#cf6f4a;pointer-events:none;z-index:10;display:none">
          <div style="position:absolute;top:0;left:-4px;width:10px;height:10px;background:#cf6f4a;clip-path:polygon(50% 100%,0 0,100% 0)"></div>
        </div>
      </div>
      <div style="color:#3a4a3a;font-size:8px;margin-top:4px;text-align:center">Arrastra la línea para scrubbear • Arrastra los keyframes</div>
    </div>

    <!-- Editor de keyframe seleccionado -->
    <div id="kfPropEditor" style="display:none;background:#141714;border:1px solid rgba(111,207,74,.35);border-radius:8px;padding:10px;margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div style="color:#6fcf4a;font-size:9px;letter-spacing:.1em">🔑 KEYFRAME <span id="kfPropTitle">—</span></div>
        <div style="display:flex;gap:5px">
          <button id="kfDuplicateBtn" title="Duplicar" style="padding:3px 7px;background:#1e2a1e;color:#6fcf4a;border:1px solid rgba(111,207,74,.3);border-radius:3px;font-family:'Space Mono',monospace;font-size:9px;cursor:pointer">⧉</button>
          <button id="kfDeleteBtn" style="padding:3px 7px;background:#2a1e1e;color:#cf4a4a;border:1px solid rgba(207,74,74,.3);border-radius:3px;font-family:'Space Mono',monospace;font-size:9px;cursor:pointer">🗑</button>
        </div>
      </div>
      <div style="margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
          <span style="color:#8a9a8a;font-size:9px">Posición en el tiempo</span>
          <span id="kfOffsetVal" style="color:#6fcf4a;font-size:9px">0%</span>
        </div>
        <input type="range" id="kfOffsetSlider" min="0" max="100" step="1"
          style="width:100%;accent-color:#cf6f4a;cursor:pointer;height:3px">
      </div>
      <div id="kfPropSliders"></div>
    </div>

    <!-- Botones de acción -->
    <div style="display:flex;gap:6px;margin-bottom:8px">
      <button id="kfApplyBtn" style="flex:1;padding:8px;background:#6fcf4a;color:#0d0f0e;border:none;border-radius:5px;font-family:'Space Mono',monospace;font-weight:bold;cursor:pointer;font-size:10px">✓ Aplicar</button>
      <button id="kfResetBtn" style="flex:1;padding:8px;background:#1e2a1e;color:#6fcf4a;border:1px solid rgba(111,207,74,.3);border-radius:5px;font-family:'Space Mono',monospace;cursor:pointer;font-size:10px">↩ Reset</button>
    </div>

    <!-- CSS generado -->
    <div style="background:#0d0f0e;border:1px solid rgba(111,207,74,.15);border-radius:6px;padding:8px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
        <div style="color:#5a6b5a;font-size:9px;letter-spacing:.1em">CSS GENERADO</div>
        <button id="kfCopyCSS" style="padding:2px 7px;background:transparent;color:#6fcf4a;border:1px solid rgba(111,207,74,.3);border-radius:3px;font-family:'Space Mono',monospace;font-size:8px;cursor:pointer">Copiar</button>
      </div>
      <textarea id="kfCssOut" readonly style="width:100%;height:90px;background:transparent;color:#6fcf4a;border:none;font-family:'Space Mono',monospace;font-size:8px;resize:none;box-sizing:border-box;line-height:1.5"></textarea>
    </div>
  </div>
  `;
}

function tabStyle(active) {
  return `flex:1;padding:6px 0;border:1px solid ${active?'#6fcf4a':'rgba(111,207,74,.25)'};background:${active?'#6fcf4a':'transparent'};color:${active?'#0d0f0e':'#6fcf4a'};border-radius:5px;font-family:'Space Mono',monospace;font-size:9px;cursor:pointer;font-weight:${active?'bold':'normal'}`;
}

// ══════════════════════════════════════
// BIND EVENTOS
// ══════════════════════════════════════
function bindAll() {
  document.getElementById('edClose').addEventListener('click', closeEditor);

  // Tabs
  document.querySelectorAll('.ed-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ed-tab').forEach(b => { b.style.cssText = tabStyle(false); b.classList.remove('active'); });
      btn.style.cssText = tabStyle(true); btn.classList.add('active');
      ['kf','pos','cfg'].forEach(t => document.getElementById('tab-'+t).style.display = btn.dataset.tab===t?'block':'none');
    });
  });

  // Select de animación
  document.getElementById('kfAnimSelect').addEventListener('change', e => {
    if (e.target.value) loadAnimation(e.target.value);
    else document.getElementById('kfEditor').style.display = 'none';
  });

  // Select de posición
  document.getElementById('edSelect').addEventListener('change', e => { if(e.target.value) selectElement(e.target.value); });
  document.addEventListener('click', onPageClick, true);

  // Config
  document.getElementById('edDownload').addEventListener('click', downloadConfig);
  document.getElementById('edLoadBtn').addEventListener('click', () => document.getElementById('edFileInput').click());
  document.getElementById('edFileInput').addEventListener('change', loadConfig);
  document.getElementById('edReloadBtn').addEventListener('click', () => { if(confirm('¿Descartar todo?')) location.reload(); });
}

// ══════════════════════════════════════
// KEYFRAME EDITOR — Cargar animación
// ══════════════════════════════════════
function loadAnimation(key) {
  kfState.animKey = key;
  kfState.selectedKfIndex = null;
  kfState.playing = false;
  if (kfState.playTimer) clearInterval(kfState.playTimer);

  const anim = ANIMATIONS[key];
  document.getElementById('kfEditor').style.display = 'block';
  document.getElementById('kfPropEditor').style.display = 'none';

  // ── UI especial para chibiRiderPos: sliders directos de bottom/left ──
  const existingRiderUI = document.getElementById('riderPosUI');
  if (existingRiderUI) existingRiderUI.remove();

  if (anim._isRiderPos) {
    document.getElementById('kfEditor').style.display = 'block';
    document.getElementById('kfPropEditor').style.display = 'none';

    // Ocultar secciones del timeline que no aplican
    ['kfRuler','kfTrack','kfPlayhead'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.closest('.timeline-section, div')?.style && (el.style.opacity = '0.3');
    });

    const kf     = anim.keyframes[0];
    const bottom = kf.props.bottom !== undefined ? kf.props.bottom : 156;
    const left   = kf.props.left   !== undefined ? kf.props.left   : 16;

    // Crear UI de sliders directos
    const ui = document.createElement('div');
    ui.id = 'riderPosUI';
    ui.style.cssText = `
      background:#141714;border:1px solid rgba(111,207,74,.35);
      border-radius:8px;padding:12px;margin-bottom:10px;
    `;
    ui.innerHTML = `
      <div style="color:#6fcf4a;font-size:9px;letter-spacing:.1em;margin-bottom:10px">📍 POSICIÓN SOBRE ELEINA</div>

      <div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;margin-bottom:3px">
          <span style="color:#8a9a8a;font-size:9px">Abajo / Bottom (px)</span>
          <input type="number" id="riderBottomNum" value="${bottom}" min="-60" max="350" step="1"
            style="width:60px;padding:2px 5px;background:#0d0f0e;color:#e8ede8;border:1px solid rgba(111,207,74,.3);border-radius:3px;font-family:'Space Mono',monospace;font-size:9px;text-align:right">
        </div>
        <input type="range" id="riderBottomSlider" min="-60" max="350" step="1" value="${bottom}"
          style="width:100%;accent-color:#6fcf4a;cursor:pointer;height:3px">
        <div style="display:flex;justify-content:space-between;margin-top:2px">
          <span style="color:#3a4a3a;font-size:7px">-60 (abajo del piso)</span>
          <span style="color:#3a4a3a;font-size:7px">350 (muy arriba)</span>
        </div>
      </div>

      <div style="margin-bottom:4px">
        <div style="display:flex;justify-content:space-between;margin-bottom:3px">
          <span style="color:#8a9a8a;font-size:9px">Izquierda / Left (px)</span>
          <input type="number" id="riderLeftNum" value="${left}" min="-100" max="400" step="1"
            style="width:60px;padding:2px 5px;background:#0d0f0e;color:#e8ede8;border:1px solid rgba(111,207,74,.3);border-radius:3px;font-family:'Space Mono',monospace;font-size:9px;text-align:right">
        </div>
        <input type="range" id="riderLeftSlider" min="-100" max="400" step="1" value="${left}"
          style="width:100%;accent-color:#6fcf4a;cursor:pointer;height:3px">
        <div style="display:flex;justify-content:space-between;margin-top:2px">
          <span style="color:#3a4a3a;font-size:7px">← izquierda</span>
          <span style="color:#3a4a3a;font-size:7px">derecha →</span>
        </div>
      </div>
    `;

    // Insertar antes del área de botones de acción
    const applyBtn = document.getElementById('kfApplyBtn');
    if (applyBtn) {
      applyBtn.parentElement.parentElement.insertBefore(ui, applyBtn.parentElement);
    } else {
      document.getElementById('kfEditor').appendChild(ui);
    }

    // Función para actualizar ambos keyframes y el preview
    const updateRiderPos = (b, l) => {
      anim.keyframes[0].props.bottom = b;
      anim.keyframes[0].props.left   = l;
      anim.keyframes[1].props.bottom = b;
      anim.keyframes[1].props.left   = l;

      // Preview en vivo
      const rider = document.getElementById('chibiRider');
      if (rider) {
        rider.style.transition = 'none';
        rider.style.bottom = b + 'px';
        rider.style.left   = l + 'px';
      }
      // Guardar en ANIM_CONFIG
      if (!window.ANIM_CONFIG) window.ANIM_CONFIG = {};
      window.ANIM_CONFIG.rider = { bottom: b, left: l };

      updateCSSOutput();
    };

    // Conectar sliders bottom
    const bSlider = document.getElementById('riderBottomSlider');
    const bNum    = document.getElementById('riderBottomNum');
    bSlider.addEventListener('input', () => { bNum.value = bSlider.value; updateRiderPos(+bSlider.value, +document.getElementById('riderLeftSlider').value); });
    bNum.addEventListener('input',   () => { bSlider.value = bNum.value; updateRiderPos(+bNum.value, +document.getElementById('riderLeftSlider').value); });

    // Conectar sliders left
    const lSlider = document.getElementById('riderLeftSlider');
    const lNum    = document.getElementById('riderLeftNum');
    lSlider.addEventListener('input', () => { lNum.value = lSlider.value; updateRiderPos(+document.getElementById('riderBottomSlider').value, +lSlider.value); });
    lNum.addEventListener('input',   () => { lSlider.value = lNum.value; updateRiderPos(+document.getElementById('riderBottomSlider').value, +lNum.value); });

    // Inicializar preview en escena
    ensureEleinaSceneForPreview(() => {
      const rider = document.getElementById('chibiRider');
      if (rider) { rider.style.bottom = bottom + 'px'; rider.style.left = left + 'px'; }
    });
  }

  // Banner especial para animaciones de Eleina
  let eleinaBanner = document.getElementById('eleinaBanner');
  if (anim._isEleina) {
    if (!eleinaBanner) {
      eleinaBanner = document.createElement('div');
      eleinaBanner.id = 'eleinaBanner';
      eleinaBanner.style.cssText = `
        background:rgba(207,111,74,0.12);border:1px solid rgba(207,111,74,.4);
        border-radius:6px;padding:8px 10px;margin-bottom:10px;font-size:9px;
        color:#cf9a6a;line-height:1.5;
      `;
      document.getElementById('kfEditor').insertBefore(eleinaBanner, document.getElementById('kfEditor').firstChild);
    }
    const phaseHints = {
      entry:    '🦙 Edita cómo Eleina entra a pantalla.',
      exit:     '🦙 Edita cómo Eleina se va. Necesitas la escena activa.',
      dismount: '🧸 Edita cómo el chibi se baja de Eleina.',
      riderPos: '📍 Ajusta dónde se sienta el chibi encima de Eleina. Mueve los sliders <strong style="color:#cf6f4a">Bottom</strong> y <strong style="color:#cf6f4a">Left</strong> — presiona <strong style="color:#cf6f4a">✓ Aplicar</strong> para guardar.',
    };
    eleinaBanner.innerHTML = `
      <div style="margin-bottom:7px">${phaseHints[anim._phase] || '🦙 Animación de Eleina'}</div>
      <button id="eleinaPreviewBtn" style="
        width:100%;padding:6px 8px;
        background:rgba(207,111,74,0.2);
        color:#cf9a6a;
        border:1px solid rgba(207,111,74,.5);
        border-radius:5px;
        font-family:'Space Mono',monospace;
        font-size:9px;cursor:pointer;
        font-weight:bold;
      ">👁 Preparar escena para preview</button>
    `;
    document.getElementById('eleinaPreviewBtn').onclick = () => {
      const btn = document.getElementById('eleinaPreviewBtn');
      btn.textContent = '⏳ Cargando escena...';
      btn.disabled = true;
      ensureEleinaSceneForPreview(() => {
        btn.textContent = '✅ Escena lista — mueve el playhead';
        btn.style.background = 'rgba(74,207,111,0.15)';
        btn.style.color = '#6fcf4a';
        btn.style.borderColor = 'rgba(74,207,111,.4)';
        setTimeout(() => {
          btn.textContent = '👁 Preparar escena para preview';
          btn.style.background = 'rgba(207,111,74,0.2)';
          btn.style.color = '#cf9a6a';
          btn.style.borderColor = 'rgba(207,111,74,.5)';
          btn.disabled = false;
        }, 3000);
      });
    };
  } else {
    if (eleinaBanner) eleinaBanner.remove();
  }

  // Duración
  const durSlider = document.getElementById('kfDuration');
  const durNum    = document.getElementById('kfDurationNum');
  durSlider.value = anim.duration;
  durNum.value    = anim.duration;
  durSlider.addEventListener('input', () => { durNum.value = durSlider.value; anim.duration = +durSlider.value; renderTimeline(); updateCSSOutput(); });
  durNum.addEventListener('input',   () => { durSlider.value = durNum.value; anim.duration = +durNum.value; renderTimeline(); updateCSSOutput(); });

  // Iteraciones
  const iterSel = document.getElementById('kfIterations');
  iterSel.value = anim.iterationCount;
  iterSel.addEventListener('change', () => { anim.iterationCount = iterSel.value; updateCSSOutput(); });

  // Easing buttons
  renderEasingButtons(key);

  // Timeline
  renderTimeline();
  updateCSSOutput();

  // Play button
  document.getElementById('kfPlayBtn').onclick = togglePlay;
  document.getElementById('kfAddKf').onclick   = () => addKeyframe(key);
  document.getElementById('kfApplyBtn').onclick = () => applyAnimationToPage(key);
  document.getElementById('kfResetBtn').onclick = () => resetAnimation(key);
  document.getElementById('kfCopyCSS').onclick  = () => {
    navigator.clipboard.writeText(document.getElementById('kfCssOut').value);
    document.getElementById('kfCopyCSS').textContent = '✓';
    setTimeout(()=>document.getElementById('kfCopyCSS').textContent='Copiar',1200);
  };

  // ── Scrubbing de playhead: arrastra como en un editor de video ──
  const track = document.getElementById('kfTrack');
  const ruler  = document.getElementById('kfRuler');

  [track, ruler].forEach(zone => { zone.style.cursor = 'ew-resize'; });

  const scrubMove = (clientX) => {
    const rect  = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    kfState.playhead = ratio;
    renderPlayhead();

    const animKey = kfState.animKey;
    const animObj = ANIMATIONS[animKey];
    if (!animObj) return;

    const applyPreview = () => {
      let el;
      if (animObj._isEleina) {
        el = getEleinaPreviewTarget(animObj._phase);
      } else {
        el = document.querySelector(animObj.target);
      }
      if (!el) return;
      const props = interpolateAt(animKey, kfState.playhead);
      el.style.transition = 'none';
      el.style.animation  = 'none';
      if (animObj._isRiderPos) {
        if (props.bottom !== undefined) el.style.bottom = props.bottom + 'px';
        if (props.left   !== undefined) el.style.left   = props.left   + 'px';
      } else if (animObj._isEleina && animObj._phase === 'entry') {
        const tx = props.translateX !== undefined ? props.translateX : 0;
        el.style.transform = `translateY(-50%) translateX(${tx}px)`;
      } else {
        el.style.transform = buildTransform(props);
      }
      if (props.opacity !== undefined) el.style.opacity = props.opacity;
    };

    if (animObj._isEleina && !document.getElementById('llamaScene')) {
      ensureEleinaSceneForPreview(applyPreview);
    } else {
      applyPreview();
    }
  };

  const onScrubDown = (e) => {
    if (e.button !== 0 || e.target.dataset.kfDot) return;

    // Detener play si estaba corriendo
    if (kfState.playing) {
      kfState.playing = false;
      clearInterval(kfState.playTimer);
      const btn = document.getElementById('kfPlayBtn');
      if (btn) btn.textContent = '▶';
    }

    e.preventDefault();
    scrubMove(e.clientX);
    document.body.style.cursor     = 'ew-resize';
    document.body.style.userSelect = 'none';

    const onMove = (ev) => scrubMove(ev.clientX);
    const onUp   = () => {
      document.body.style.cursor     = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
  };

  track.addEventListener('mousedown', onScrubDown);
  ruler.addEventListener('mousedown', onScrubDown);
}

// ══════════════════════════════════════
// EASINGS — botones y preview
// ══════════════════════════════════════
function renderEasingButtons(key) {
  const anim = ANIMATIONS[key];
  const container = document.getElementById('easingBtns');
  container.innerHTML = Object.entries(EASINGS).map(([eKey, e]) => `
    <button class="easing-btn" data-easing="${eKey}"
      style="padding:5px;background:${anim.easing===eKey?'rgba(111,207,74,.2)':'#0d0f0e'};color:${anim.easing===eKey?'#6fcf4a':'#5a6b5a'};
      border:1px solid ${anim.easing===eKey?'#6fcf4a':'rgba(111,207,74,.15)'};border-radius:4px;font-family:'Space Mono',monospace;font-size:8px;cursor:pointer;text-align:left;line-height:1.4">
      <div style="color:${anim.easing===eKey?'#6fcf4a':'#8a9a8a'};font-size:8px">${e.label}</div>
      <div style="color:#3a4a3a;font-size:7px;margin-top:1px">${e.example}</div>
    </button>`).join('');

  document.querySelectorAll('.easing-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      anim.easing = btn.dataset.easing;
      renderEasingButtons(key);
      drawEasingCurve(btn.dataset.easing);
      document.getElementById('easingLabel').textContent = EASINGS[btn.dataset.easing].label;
      updateCSSOutput();
    });
  });

  drawEasingCurve(anim.easing);
  document.getElementById('easingLabel').textContent = EASINGS[anim.easing]?.label || anim.easing;
  document.getElementById('easingPlayBtn').onclick = () => playEasingDemo(anim.easing);
}

function drawEasingCurve(easingKey) {
  const canvas = document.getElementById('easingCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0,0,W,H);

  // Grid
  ctx.strokeStyle = 'rgba(111,207,74,0.08)';
  ctx.lineWidth = 1;
  for (let i=0;i<=4;i++) {
    ctx.beginPath(); ctx.moveTo(i*W/4,0); ctx.lineTo(i*W/4,H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,i*H/4); ctx.lineTo(W,i*H/4); ctx.stroke();
  }

  // Curva simulada
  ctx.strokeStyle = '#6fcf4a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  const steps = 60;
  for (let i=0;i<=steps;i++) {
    const t = i/steps;
    const y = simulateEasing(easingKey, t);
    const px = t*W;
    const py = H - y*H;
    i===0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py);
  }
  ctx.stroke();

  // Puntos en keyframes
  if (kfState.animKey) {
    const kfs = ANIMATIONS[kfState.animKey].keyframes;
    kfs.forEach((kf,i) => {
      const y = simulateEasing(easingKey, kf.offset);
      ctx.fillStyle = i===kfState.selectedKfIndex ? '#cf6f4a' : '#6fcf4a';
      ctx.beginPath();
      ctx.arc(kf.offset*W, H-y*H, 3, 0, Math.PI*2);
      ctx.fill();
    });
  }
}

function simulateEasing(key, t) {
  switch(key) {
    case 'linear':       return t;
    case 'ease':         return cubicBezier(0.25,0.1,0.25,1,t);
    case 'ease-in':      return cubicBezier(0.42,0,1,1,t);
    case 'ease-out':     return cubicBezier(0,0,0.58,1,t);
    case 'ease-in-out':  return cubicBezier(0.42,0,0.58,1,t);
    case 'bounce':       return cubicBezier(0.68,-0.55,0.27,1.55,t);
    case 'elastic':      return cubicBezier(0.175,0.885,0.32,1.275,t);
    case 'spring':       return cubicBezier(0.45,0.05,0.55,0.95,t);
    case 'steps3':       return Math.floor(t*3)/3;
    case 'steps6':       return Math.floor(t*6)/6;
    default:             return t;
  }
}

function cubicBezier(p1x,p1y,p2x,p2y,t) {
  // Aproximación simplificada para visualización
  const mt = 1-t;
  return (3*mt*mt*t*p1y) + (3*mt*t*t*p2y) + (t*t*t);
}

function playEasingDemo(easingKey) {
  const ball = document.getElementById('easingBall');
  if (!ball) return;
  const demo = document.getElementById('easingDemo');
  const maxX = demo.offsetWidth - 12;
  ball.style.transition = 'none';
  ball.style.left = '0px';
  ball.style.background = '#6fcf4a';
  setTimeout(() => {
    ball.style.transition = `left 1s ${EASINGS[easingKey]?.css || 'linear'}`;
    ball.style.left = maxX + 'px';
    setTimeout(() => {
      ball.style.transition = `left 0.3s linear`;
      ball.style.left = '0px';
    }, 1200);
  }, 30);
}

// ══════════════════════════════════════
// TIMELINE
// ══════════════════════════════════════
function renderTimeline() {
  const key  = kfState.animKey;
  if (!key) return;
  const anim = ANIMATIONS[key];
  const ruler = document.getElementById('kfRuler');
  const track = document.getElementById('kfTrack');
  if (!ruler || !track) return;

  // Regla
  ruler.innerHTML = '';
  const marks = 5;
  for (let i=0;i<=marks;i++) {
    const pct = (i/marks)*100;
    const ms  = Math.round((i/marks)*anim.duration);
    const div = document.createElement('div');
    div.style.cssText = `position:absolute;left:${pct}%;transform:translateX(-50%);top:2px;color:#3a4a3a;font-size:7px;`;
    div.textContent = ms < 1000 ? ms+'ms' : (ms/1000).toFixed(1)+'s';
    ruler.appendChild(div);
    if (i>0 && i<marks) {
      const tick = document.createElement('div');
      tick.style.cssText = `position:absolute;left:${pct}%;top:0;width:1px;height:8px;background:rgba(111,207,74,.15)`;
      ruler.appendChild(tick);
    }
  }

  // Track con keyframes
  track.innerHTML = '';
  // Línea base
  const line = document.createElement('div');
  line.style.cssText = 'position:absolute;top:50%;left:4px;right:4px;height:2px;background:rgba(111,207,74,.15);transform:translateY(-50%)';
  track.appendChild(line);

  anim.keyframes.forEach((kf, i) => {
    const dot = document.createElement('div');
    const isSelected = i === kfState.selectedKfIndex;
    dot.style.cssText = `
      position:absolute;
      left:calc(${kf.offset*100}% - 7px);
      top:50%;transform:translateY(-50%);
      width:14px;height:14px;
      background:${isSelected?'#cf6f4a':'#6fcf4a'};
      border:2px solid ${isSelected?'#ff9060':'#141714'};
      border-radius:3px;
      cursor:grab;
      z-index:5;
      box-shadow:${isSelected?'0 0 8px rgba(207,111,74,.5)':'0 0 4px rgba(111,207,74,.3)'};
    `;
    dot.title = `KF ${i+1}: ${Math.round(kf.offset*100)}%`;
    dot.dataset.kfDot = '1'; // Prevents scrub from firing on dot mousedown

    // Click para seleccionar
    dot.addEventListener('click', e => {
      e.stopPropagation();
      kfState.selectedKfIndex = i;
      renderTimeline();
      showKfPropEditor(key, i);
      drawEasingCurve(anim.easing);
    });

    // Arrastre del keyframe
    dot.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      e.stopPropagation(); e.preventDefault();
      const rect = track.getBoundingClientRect();
      function onMove(ev) {
        let ratio = (ev.clientX - rect.left) / rect.width;
        ratio = Math.max(0, Math.min(1, ratio));
        // No dejar que el primer o último se muevan del extremo
        if (i === 0) ratio = 0;
        if (i === anim.keyframes.length-1) ratio = 1;
        anim.keyframes[i].offset = ratio;
        // Reordenar por offset
        anim.keyframes.sort((a,b) => a.offset-b.offset);
        kfState.selectedKfIndex = anim.keyframes.findIndex(k=>k===anim.keyframes[i]);
        renderTimeline();
        updateCSSOutput();
        if (kfState.selectedKfIndex !== null) showKfPropEditor(key, kfState.selectedKfIndex);
      }
      function onUp() {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      }
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    });

    track.appendChild(dot);

    // Etiqueta de porcentaje
    const lbl = document.createElement('div');
    lbl.style.cssText = `position:absolute;left:calc(${kf.offset*100}%);top:2px;color:${isSelected?'#cf6f4a':'#3a4a3a'};font-size:7px;transform:translateX(-50%);white-space:nowrap`;
    lbl.textContent = Math.round(kf.offset*100)+'%';
    track.appendChild(lbl);
  });

  renderPlayhead();
}

function renderPlayhead() {
  const ph = document.getElementById('kfPlayhead');
  if (!ph) return;
  ph.style.display = 'block';
  ph.style.left = (kfState.playhead*100)+'%';
}

// ══════════════════════════════════════
// KF PROP EDITOR — editar valores
// ══════════════════════════════════════
function showKfPropEditor(key, index) {
  const anim = ANIMATIONS[key];
  const kf   = anim.keyframes[index];
  const propDefs = anim.propDefs;

  document.getElementById('kfPropEditor').style.display = 'block';
  document.getElementById('kfPropTitle').textContent = `#${index+1} @ ${Math.round(kf.offset*100)}%`;

  // Offset slider
  const offSlider = document.getElementById('kfOffsetSlider');
  const offVal    = document.getElementById('kfOffsetVal');
  offSlider.value = Math.round(kf.offset*100);
  offVal.textContent = Math.round(kf.offset*100)+'%';
  offSlider.oninput = () => {
    if (index===0 || index===anim.keyframes.length-1) return;
    kf.offset = offSlider.value/100;
    offVal.textContent = offSlider.value+'%';
    anim.keyframes.sort((a,b) => a.offset-b.offset);
    kfState.selectedKfIndex = anim.keyframes.indexOf(kf);
    renderTimeline();
    updateCSSOutput();
    drawEasingCurve(anim.easing);
  };

  // Sliders de propiedades
  const container = document.getElementById('kfPropSliders');
  container.innerHTML = '';
  Object.entries(propDefs).forEach(([prop, def]) => {
    const val = kf.props[prop] ?? 0;
    const row = document.createElement('div');
    row.style.marginBottom = '9px';
    row.innerHTML = `
      <div style="display:flex;justify-content:space-between;margin-bottom:3px">
        <span style="color:#8a9a8a;font-size:9px">${def.label}</span>
        <input type="number" id="kfNum_${prop}" value="${val}" min="${def.min}" max="${def.max}" step="${def.step}"
          style="width:60px;padding:2px 5px;background:#0d0f0e;color:#e8ede8;border:1px solid rgba(111,207,74,.3);border-radius:3px;font-family:'Space Mono',monospace;font-size:9px;text-align:right">
      </div>
      <input type="range" id="kfSlider_${prop}" min="${def.min}" max="${def.max}" step="${def.step}" value="${val}"
        style="width:100%;accent-color:#6fcf4a;cursor:pointer;height:3px">
    `;
    container.appendChild(row);

    const slider = row.querySelector(`#kfSlider_${prop}`);
    const numIn  = row.querySelector(`#kfNum_${prop}`);
    slider.oninput = () => {
      kf.props[prop] = parseFloat(slider.value);
      numIn.value = slider.value;
      updateCSSOutput();
      previewKeyframe(key, index);
    };
    numIn.oninput = () => {
      const v = parseFloat(numIn.value)||0;
      kf.props[prop] = v; slider.value = v;
      updateCSSOutput();
      previewKeyframe(key, index);
    };
  });

  // Delete / Duplicate
  document.getElementById('kfDeleteBtn').onclick = () => {
    if (anim.keyframes.length <= 2) return alert('Necesitas al menos 2 keyframes');
    if (index===0 || index===anim.keyframes.length-1) return alert('No puedes eliminar el primer o último keyframe');
    anim.keyframes.splice(index, 1);
    kfState.selectedKfIndex = null;
    document.getElementById('kfPropEditor').style.display = 'none';
    renderTimeline(); updateCSSOutput();
  };
  document.getElementById('kfDuplicateBtn').onclick = () => {
    const newKf = { offset: Math.min(1, kf.offset + 0.05), props: {...kf.props} };
    anim.keyframes.push(newKf);
    anim.keyframes.sort((a,b) => a.offset-b.offset);
    kfState.selectedKfIndex = anim.keyframes.indexOf(newKf);
    renderTimeline();
    showKfPropEditor(key, kfState.selectedKfIndex);
    updateCSSOutput();
  };
}

// ══════════════════════════════════════
// AGREGAR KEYFRAME
// ══════════════════════════════════════
function addKeyframe(key) {
  const anim = ANIMATIONS[key];
  // Insertar en el punto del playhead
  const offset = kfState.playhead;
  // Interpolar props desde keyframes vecinos
  const sortedKfs = [...anim.keyframes].sort((a,b) => a.offset-b.offset);
  let prev = sortedKfs[0], next = sortedKfs[sortedKfs.length-1];
  for (const kf of sortedKfs) {
    if (kf.offset <= offset) prev = kf;
    if (kf.offset >= offset && next === sortedKfs[sortedKfs.length-1]) next = kf;
  }
  const t = prev.offset===next.offset ? 0 : (offset-prev.offset)/(next.offset-prev.offset);
  const props = {};
  Object.keys(prev.props).forEach(p => {
    props[p] = prev.props[p] + (((next.props[p]??prev.props[p]) - prev.props[p]) * t);
    props[p] = Math.round(props[p]*1000)/1000;
  });
  const newKf = { offset, props };
  anim.keyframes.push(newKf);
  anim.keyframes.sort((a,b) => a.offset-b.offset);
  kfState.selectedKfIndex = anim.keyframes.indexOf(newKf);
  renderTimeline();
  showKfPropEditor(key, kfState.selectedKfIndex);
  updateCSSOutput();
}

// ══════════════════════════════════════
// ELEINA — Preparar escena para preview
// ══════════════════════════════════════

// Lanza la escena de Eleina en modo "congelado" (sin timers automáticos),
// dejando la escena visible para que el editor pueda moverla con el playhead.
function ensureEleinaSceneForPreview(callback) {
  // Si la escena ya existe, simplemente llama al callback
  if (document.getElementById('llamaScene')) {
    if (callback) callback();
    return;
  }

  if (typeof playLlamaEntrance !== 'function') {
    alert('La escena de Eleina no está disponible en esta página');
    return;
  }

  // Pausar la secuencia automática temporalmente usando ANIM_CONFIG:
  // Ponemos duraciones enormes para que los timers de salida nunca se disparen
  const origConfig = window.ANIM_CONFIG && window.ANIM_CONFIG.eleina
    ? { ...window.ANIM_CONFIG.eleina }
    : null;

  if (window.ANIM_CONFIG && window.ANIM_CONFIG.eleina) {
    // Entrada rápida (400ms), todo lo demás muy tarde (no se dispara)
    window.ANIM_CONFIG.eleina.entryDuration  = 400;
    window.ANIM_CONFIG.eleina.dismountDelay  = 9999999;
    window.ANIM_CONFIG.eleina.exitDelay      = 9999999;
    window.ANIM_CONFIG.eleina.fadeDelay      = 9999999;
    window.ANIM_CONFIG.eleina.showChibiDelay = 9999999;
  }

  // Si había una escena previa, limpiarla
  if (typeof playLlamaDeparture === 'function') {
    playLlamaDeparture();
  }

  setTimeout(() => {
    playLlamaEntrance();

    // Esperar a que la entrada termine para hacer el callback
    const entryTime = 450;
    setTimeout(() => {
      // Quitar animación CSS de la escena para que el editor la controle con transforms manuales
      const scene = document.getElementById('llamaScene');
      if (scene) {
        scene.style.transition = 'none';
      }

      // Restaurar ANIM_CONFIG original (para que "✓ Aplicar" siga funcionando bien)
      if (origConfig && window.ANIM_CONFIG && window.ANIM_CONFIG.eleina) {
        window.ANIM_CONFIG.eleina = { ...origConfig };
      }

      if (callback) callback();

      // Marcar que estamos en modo preview del editor (para que playLlamaEntrance no limpie la escena)
      if (scene) scene.dataset.editorPreview = '1';

    }, entryTime);
  }, 100);
}

// Devuelve el elemento DOM correcto para cada fase de Eleina
function getEleinaPreviewTarget(phase) {
  switch (phase) {
    case 'entry':    return document.getElementById('llamaScene');
    case 'exit': {
      const eleinaImg = document.getElementById('eleinaImg');
      return eleinaImg ? eleinaImg.parentElement : null;
    }
    case 'dismount': return document.getElementById('chibiRider');
    case 'riderPos': return document.getElementById('chibiRider');
    default:         return null;
  }
}

// ══════════════════════════════════════
// PREVIEW en página
// ══════════════════════════════════════
function previewKeyframe(key, index) {
  const anim = ANIMATIONS[key];
  const kf   = anim.keyframes[index];

  // Animaciones de Eleina: asegurar que la escena esté viva antes de previsualizar
  if (anim._isEleina) {
    ensureEleinaSceneForPreview(() => {
      const el = getEleinaPreviewTarget(anim._phase);
      if (!el) return;
      el.style.transition = 'none';
      el.style.animation  = 'none';
      if (anim._isRiderPos) {
        // Posición montado: mueve bottom/left directamente
        if (kf.props.bottom !== undefined) el.style.bottom = kf.props.bottom + 'px';
        if (kf.props.left   !== undefined) el.style.left   = kf.props.left   + 'px';
      } else if (anim._phase === 'entry') {
        const tx = kf.props.translateX !== undefined ? kf.props.translateX : 0;
        el.style.transform = `translateY(-50%) translateX(${tx}px)`;
      } else {
        el.style.transform = buildTransform(kf.props);
      }
      if (kf.props.opacity !== undefined) el.style.opacity = kf.props.opacity;
    });
    return;
  }

  const el = document.querySelector(anim.target);
  if (!el) return;
  el.style.transform = buildTransform(kf.props);
  if (kf.props.opacity !== undefined) el.style.opacity = kf.props.opacity;
}

function buildTransform(props) {
  let t = '';
  if (props.translateX !== undefined) t += `translateX(${props.translateX}px) `;
  if (props.translateY !== undefined) t += `translateY(${props.translateY}px) `;
  if (props.rotate     !== undefined) t += `rotate(${props.rotate}deg) `;
  if (props.scaleX     !== undefined) t += `scaleX(${props.scaleX}) `;
  if (props.scaleY     !== undefined) t += `scaleY(${props.scaleY}) `;
  if (props.scale      !== undefined) t += `scale(${props.scale}) `;
  return t.trim();
}

// ══════════════════════════════════════
// APLICAR animación real a la página
// ══════════════════════════════════════
function applyAnimationToPage(key) {
  const anim = ANIMATIONS[key];

  // Posición montado del rider — guarda en ANIM_CONFIG y mueve el rider en vivo
  if (anim._isRiderPos) {
    // Tomar los valores del keyframe 0 (son iguales en ambos; es una posición, no una animación)
    const kf = anim.keyframes[0];
    const bottom = kf.props.bottom !== undefined ? kf.props.bottom : 156;
    const left   = kf.props.left   !== undefined ? kf.props.left   : 16;

    // Guardar en ANIM_CONFIG para que la próxima escena use estos valores
    if (!window.ANIM_CONFIG) window.ANIM_CONFIG = {};
    window.ANIM_CONFIG.rider = { bottom, left };

    // Si el rider ya está en pantalla, moverlo ahora mismo
    const rider = document.getElementById('chibiRider');
    if (rider) {
      rider.style.transition = 'bottom 0.4s ease, left 0.4s ease';
      rider.style.bottom = bottom + 'px';
      rider.style.left   = left   + 'px';
    }

    const btn = document.getElementById('kfApplyBtn');
    btn.textContent = '✓ Guardado!';
    btn.style.background = '#4aaf6f';
    setTimeout(() => { btn.textContent = '✓ Aplicar'; btn.style.background = '#6fcf4a'; }, 1200);
    return;
  }

  // Animaciones de Eleina — requieren lanzar la escena primero
  if (anim._isEleina) {
    applyEleinaAnimation(key);
    return;
  }

  const el = document.querySelector(anim.target);
  if (!el) { alert('Elemento no encontrado: ' + anim.target); return; }

  const animName = 'editorAnim_' + key;
  const easing   = EASINGS[anim.easing]?.css || anim.easing;
  const css      = generateKeyframeCSS(key, animName);

  injectKeyframe(animName, css);
  el.style.animation = `${animName} ${anim.duration}ms ${easing} ${anim.iterationCount}`;

  const btn = document.getElementById('kfApplyBtn');
  btn.textContent = '✓ Aplicado!';
  btn.style.background = '#4aaf6f';
  setTimeout(()=>{ btn.textContent='✓ Aplicar'; btn.style.background='#6fcf4a'; }, 1200);
}

function applyEleinaAnimation(key) {
  const anim = ANIMATIONS[key];

  // Si ya hay escena activa, animar directamente sobre ella
  const existingScene = document.getElementById('llamaScene');

  if (anim._phase === 'entry') {
    // Lanzar la escena de Eleina y aplicar nuestros keyframes a la entrada
    if (typeof playLlamaEntrance === 'function') {
      // Reset primero
      if (typeof playLlamaDeparture === 'function') playLlamaDeparture();
      setTimeout(() => {
        playLlamaEntrance();
        // Sobrescribir la animación de entrada con nuestros keyframes
        setTimeout(() => {
          const scene = document.getElementById('llamaScene');
          if (!scene) return;
          const animName = 'editorAnim_eleinaEntrada';
          const easing   = EASINGS[anim.easing]?.css || anim.easing;
          injectKeyframe(animName, generateKeyframeCSS(key, animName));
          scene.style.transition = 'none';
          scene.style.transform  = 'translateY(-50%)';
          scene.style.animation  = `${animName} ${anim.duration}ms ${easing} 1 forwards`;
        }, 50);
      }, 600);
    } else {
      alert('La escena de Eleina no está disponible en esta página');
      return;
    }
  } else if (anim._phase === 'exit') {
    if (!existingScene) { alert('Primero reproduce la entrada de Eleina (▶ Aplicar en "Eleina — Entrada")'); return; }
    const eleinaWrap = existingScene.querySelector('#eleinaImg')?.parentElement || existingScene.firstChild;
    if (!eleinaWrap) return;
    const animName = 'editorAnim_eleinaSalida';
    const easing   = EASINGS[anim.easing]?.css || anim.easing;
    injectKeyframe(animName, generateKeyframeCSS(key, animName));
    eleinaWrap.style.transition = 'none';
    eleinaWrap.style.animation  = `${animName} ${anim.duration}ms ${easing} 1 forwards`;
  } else if (anim._phase === 'dismount') {
    if (!existingScene) { alert('Primero reproduce la entrada de Eleina'); return; }
    const rider = document.getElementById('chibiRider');
    if (!rider) { alert('El chibi rider no está en pantalla todavía'); return; }
    const animName = 'editorAnim_chibiRider';
    const easing   = EASINGS[anim.easing]?.css || anim.easing;
    injectKeyframe(animName, generateKeyframeCSS(key, animName));
    rider.style.transition = 'none';
    rider.style.animation  = `${animName} ${anim.duration}ms ${easing} 1 forwards`;
  }

  const btn = document.getElementById('kfApplyBtn');
  btn.textContent = '▶ Reproduciendo...';
  btn.style.background = '#4a8faf';
  setTimeout(()=>{ btn.textContent='✓ Aplicar'; btn.style.background='#6fcf4a'; }, anim.duration + 200);
}

function resetAnimation(key) {
  const defaultAnims = {
    chibiFly: { keyframes: [
      { offset:0,   props:{translateY:0,  rotate:-1  }},
      { offset:.25, props:{translateY:-22,rotate:1.5 }},
      { offset:.5,  props:{translateY:-38,rotate:-.5 }},
      { offset:.75, props:{translateY:-18,rotate:1   }},
      { offset:1,   props:{translateY:0,  rotate:-1  }},
    ], duration:5000, easing:'spring', iterationCount:'infinite'},
    chibiSquish: { keyframes: [
      { offset:0,    props:{scaleX:1,   scaleY:1   }},
      { offset:.15,  props:{scaleX:1.35,scaleY:.65 }},
      { offset:.35,  props:{scaleX:.78, scaleY:1.28}},
      { offset:.55,  props:{scaleX:1.15,scaleY:.88 }},
      { offset:.75,  props:{scaleX:.93, scaleY:1.08}},
      { offset:.9,   props:{scaleX:1.03,scaleY:.97 }},
      { offset:1,    props:{scaleX:1,   scaleY:1   }},
    ], duration:600, easing:'ease-in-out', iterationCount:1},
    hintBounce: { keyframes: [
      { offset:0,  props:{translateY:0 }},
      { offset:.5, props:{translateY:10}},
      { offset:1,  props:{translateY:0 }},
    ], duration:1500, easing:'ease-in-out', iterationCount:'infinite'},
    chibyShadow: { keyframes: [
      { offset:0,   props:{scaleX:1,   opacity:.7 }},
      { offset:.25, props:{scaleX:.82, opacity:.45}},
      { offset:.5,  props:{scaleX:.65, opacity:.25}},
      { offset:.75, props:{scaleX:.85, opacity:.5 }},
      { offset:1,   props:{scaleX:1,   opacity:.7 }},
    ], duration:5000, easing:'spring', iterationCount:'infinite'},
    eleinaEntrada: { keyframes: [
      { offset:0,    props:{translateX:700, opacity:0 }},
      { offset:.15,  props:{translateX:500, opacity:1 }},
      { offset:.75,  props:{translateX:28,  opacity:1 }},
      { offset:1,    props:{translateX:113, opacity:1 }},
    ], duration:1400, easing:'ease-out', iterationCount:1},
    eleinaSalida: { keyframes: [
      { offset:0,   props:{translateX:0,   opacity:1 }},
      { offset:.3,  props:{translateX:80,  opacity:1 }},
      { offset:1,   props:{translateX:600, opacity:0 }},
    ], duration:1000, easing:'ease-in', iterationCount:1},
    chibiRiderBajada: { keyframes: [
      { offset:0,   props:{translateY:0,   rotate:0  }},
      { offset:.3,  props:{translateY:-15, rotate:-8 }},
      { offset:.7,  props:{translateY:100, rotate:5  }},
      { offset:1,   props:{translateY:156, rotate:0  }},
    ], duration:700, easing:'ease-in-out', iterationCount:1},
    chibiRiderPos: { keyframes: [
      { offset:0, props:{bottom:36, left:43} },
      { offset:1, props:{bottom:36, left:43} },
    ], duration:1000, easing:'linear', iterationCount:1},
  };
  const def = defaultAnims[key];
  if (!def) return;
  ANIMATIONS[key].keyframes = def.keyframes.map(k => ({...k, props:{...k.props}}));
  ANIMATIONS[key].duration  = def.duration;
  ANIMATIONS[key].easing    = def.easing;
  ANIMATIONS[key].iterationCount = def.iterationCount;
  loadAnimation(key);
  document.getElementById('kfAnimSelect').value = key;
}

// ══════════════════════════════════════
// PLAY en el editor
// ══════════════════════════════════════
function togglePlay() {
  kfState.playing = !kfState.playing;
  const btn = document.getElementById('kfPlayBtn');
  const key  = kfState.animKey;
  const anim = ANIMATIONS[key];

  if (kfState.playing) {
    btn.textContent = '⏸';

    // Para Eleina, asegurar que la escena exista antes de reproducir
    const startLoop = () => {
      const startTime = performance.now() - kfState.playhead * anim.duration;
      kfState.playTimer = setInterval(() => {
        const elapsed = (performance.now() - startTime) % anim.duration;
        kfState.playhead = elapsed / anim.duration;
        renderPlayhead();

        // Obtener el elemento correcto (normal o Eleina)
        let el;
        if (anim._isEleina) {
          el = getEleinaPreviewTarget(anim._phase);
        } else {
          el = document.querySelector(anim.target);
        }

        if (el) {
          const props = interpolateAt(key, kfState.playhead);
          el.style.transition = 'none';
          el.style.animation  = 'none';
          if (anim._isRiderPos) {
            if (props.bottom !== undefined) el.style.bottom = props.bottom + 'px';
            if (props.left   !== undefined) el.style.left   = props.left   + 'px';
          } else if (anim._isEleina && anim._phase === 'entry') {
            const tx = props.translateX !== undefined ? props.translateX : 0;
            el.style.transform = `translateY(-50%) translateX(${tx}px)`;
          } else {
            el.style.transform = buildTransform(props);
          }
          if (props.opacity !== undefined) el.style.opacity = props.opacity;
        }
      }, 16);
    };

    if (anim._isEleina) {
      ensureEleinaSceneForPreview(startLoop);
    } else {
      startLoop();
    }
  } else {
    btn.textContent = '▶';
    clearInterval(kfState.playTimer);
  }
}

function interpolateAt(key, t) {
  const kfs = ANIMATIONS[key].keyframes;
  let prev = kfs[0], next = kfs[kfs.length-1];
  for (let i=0; i<kfs.length-1; i++) {
    if (kfs[i].offset <= t && kfs[i+1].offset >= t) { prev=kfs[i]; next=kfs[i+1]; break; }
  }
  const range = next.offset - prev.offset;
  const localT = range===0 ? 0 : (t-prev.offset)/range;
  const eased  = simulateEasing(ANIMATIONS[key].easing, localT);
  const result = {};
  Object.keys(prev.props).forEach(p => {
    const pv = prev.props[p]??0, nv = next.props[p]??pv;
    result[p] = pv + (nv-pv)*eased;
  });
  return result;
}

// ══════════════════════════════════════
// CSS OUTPUT
// ══════════════════════════════════════
function generateKeyframeCSS(key, animName) {
  const anim = ANIMATIONS[key];
  const name = animName || key + 'Dynamic';
  let css = `@keyframes ${name} {\n`;
  anim.keyframes.forEach(kf => {
    const p = kf.props;
    const transform = buildTransform(p);
    const parts = [];
    // transform (translateX/Y, rotate, scale, etc.)
    if (transform) parts.push(`transform: ${transform}`);
    // propiedades CSS directas (bottom, left, top, right, width, height)
    if (p.bottom  !== undefined) parts.push(`bottom: ${p.bottom}px`);
    if (p.left    !== undefined) parts.push(`left: ${p.left}px`);
    if (p.top     !== undefined) parts.push(`top: ${p.top}px`);
    if (p.right   !== undefined) parts.push(`right: ${p.right}px`);
    if (p.width   !== undefined) parts.push(`width: ${p.width}px`);
    if (p.height  !== undefined) parts.push(`height: ${p.height}px`);
    if (p.opacity !== undefined) parts.push(`opacity: ${p.opacity}`);
    css += `  ${Math.round(kf.offset*100)}% { ${parts.join('; ')}; }\n`;
  });
  css += `}`;
  return css;
}

function updateCSSOutput() {
  const key = kfState.animKey;
  if (!key) return;
  const anim   = ANIMATIONS[key];
  const easing = EASINGS[anim.easing]?.css || anim.easing;
  const name   = key + 'Dynamic';

  // Para chibiRiderPos: mostrar bottom/left como CSS normal, no como animación de keyframes
  if (anim._isRiderPos) {
    const kf     = anim.keyframes[0];
    const bottom = kf.props.bottom !== undefined ? kf.props.bottom : '—';
    const left   = kf.props.left   !== undefined ? kf.props.left   : '—';
    const out = document.getElementById('kfCssOut');
    if (out) out.value =
      `/* Posición del rider montado */\n` +
      `#chibiRider {\n` +
      `  bottom: ${bottom}px;\n` +
      `  left:   ${left}px;\n` +
      `}\n\n` +
      `/* Guardado en ANIM_CONFIG.rider — se aplica\n` +
      `   automáticamente al lanzar la escena */`;
    return;
  }

  let css = generateKeyframeCSS(key, name) + '\n\n';
  css += `${anim.target} {\n  animation: ${name} ${anim.duration}ms ${easing} ${anim.iterationCount};\n}`;
  const out = document.getElementById('kfCssOut');
  if (out) out.value = css;
}

function injectKeyframe(id, css) {
  let el = document.getElementById('dynStyle_' + id);
  if (!el) { el = document.createElement('style'); el.id = 'dynStyle_' + id; document.head.appendChild(el); }
  el.textContent = css;
}

// ══════════════════════════════════════
// POSICIÓN
// ══════════════════════════════════════
function selectElement(id) {
  const meta = EDITABLE.find(e => e.id === id);
  const el   = document.getElementById(id);
  if (!meta || !el) return;
  selectedEl = el;
  if (!originalStyles[id]) originalStyles[id] = el.getAttribute('style') || '';

  const props   = meta.props;
  const leftV   = parseInt(el.style.left)   || 0;
  const topV    = parseInt(el.style.top)    || 0;
  const widthV  = parseInt(el.style.width)  || el.offsetWidth;
  const heightV = parseInt(el.style.height) || el.offsetHeight;
  const map = { left:leftV, top:topV, width:widthV, height:heightV };
  const ranges = { left:[-600,2000], top:[-600,2000], width:[20,1000], height:[20,1000] };

  let html = '';
  props.forEach(p => {
    html += `
      <div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;margin-bottom:3px">
          <span style="color:#8a9a8a;font-size:9px;text-transform:uppercase">${p}</span>
          <input type="number" id="posNum_${p}" value="${map[p]}" style="width:60px;padding:2px 5px;background:#0d0f0e;color:#e8ede8;border:1px solid rgba(111,207,74,.3);border-radius:3px;font-family:'Space Mono',monospace;font-size:9px;text-align:right">
        </div>
        <input type="range" id="posSlider_${p}" min="${ranges[p][0]}" max="${ranges[p][1]}" value="${map[p]}" style="width:100%;accent-color:#6fcf4a;cursor:pointer;height:3px">
      </div>`;
  });
  html += `<button id="posResetEl" style="width:100%;padding:7px;background:#1e2a1e;color:#6fcf4a;border:1px solid rgba(111,207,74,.3);border-radius:5px;font-family:'Space Mono',monospace;cursor:pointer;font-size:10px;margin-top:4px">↩ Reset</button>`;

  document.getElementById('edPosControls').innerHTML = html;
  document.getElementById('edCssWrap').style.display = 'block';

  props.forEach(p => {
    const slider = document.getElementById('posSlider_' + p);
    const numIn  = document.getElementById('posNum_' + p);
    slider.addEventListener('input', () => { el.style[p]=slider.value+'px'; numIn.value=slider.value; updateHighlight(); updatePosCss(); });
    numIn.addEventListener('input',  () => { const v=parseInt(numIn.value)||0; el.style[p]=v+'px'; slider.value=v; updateHighlight(); updatePosCss(); });
  });
  document.getElementById('posResetEl').addEventListener('click', () => { el.setAttribute('style', originalStyles[id]||''); selectElement(id); });
  updateHighlight(); updatePosCss(); setupDrag(el, props);
}

function updateHighlight() {
  const hl = document.getElementById('editorHighlight');
  if (!hl || !selectedEl) return;
  const r = selectedEl.getBoundingClientRect();
  Object.assign(hl.style, { display:'block', left:(r.left-3)+'px', top:(r.top-3)+'px', width:(r.width+6)+'px', height:(r.height+6)+'px' });
}

function updatePosCss() {
  const out = document.getElementById('edCss');
  if (!out || !selectedEl) return;
  const s = selectedEl.style;
  out.value = ['left','top','width','height'].filter(p=>s[p]).map(p=>`${p}: ${s[p]};`).join('\n') || '/* sin cambios */';
}

function setupDrag(el, props) {
  el.setAttribute('data-ed-cursor','1');
  el.style.cursor = 'grab';
  el.onmousedown = function(e) {
    if (!editorMode || e.target.closest('#editorPanel')) return;
    e.preventDefault(); el.style.cursor='grabbing';
    const sx=e.clientX, sy=e.clientY, sl=parseInt(el.style.left)||0, st=parseInt(el.style.top)||0;
    function move(e) {
      if (props.includes('left')) el.style.left=(sl+e.clientX-sx)+'px';
      if (props.includes('top'))  el.style.top=(st+e.clientY-sy)+'px';
      ['left','top'].forEach(p => {
        document.getElementById('posSlider_'+p)&&(document.getElementById('posSlider_'+p).value=parseInt(el.style[p]));
        document.getElementById('posNum_'+p)&&(document.getElementById('posNum_'+p).value=parseInt(el.style[p]));
      });
      updateHighlight(); updatePosCss();
    }
    function up() { el.style.cursor='grab'; window.removeEventListener('mousemove',move); window.removeEventListener('mouseup',up); }
    window.addEventListener('mousemove',move); window.addEventListener('mouseup',up);
  };
}

function onPageClick(e) {
  if (!editorMode || e.target.closest('#editorPanel')) return;
  const found = EDITABLE.find(m => { const el=document.getElementById(m.id); return el&&(e.target===el||el.contains(e.target)); });
  if (found) { e.stopPropagation(); selectElement(found.id); }
}

// ══════════════════════════════════════
// GUARDAR / CARGAR
// ══════════════════════════════════════
function downloadConfig() {
  const config = {
    _info: 'Config JesulutoXD v5 — incluye keyframes completos',
    _version: 5,
    positions: {},
    animations: {},
    rider: window.ANIM_CONFIG?.rider || { bottom: 156, left: 16 },
  };

  EDITABLE.forEach(m => {
    const el = document.getElementById(m.id);
    if (!el) return;
    config.positions[m.id] = {
      left:   el.style.left   || null,
      top:    el.style.top    || null,
      width:  el.style.width  || null,
      height: el.style.height || null,
    };
  });

  // Guardar TODAS las animaciones con keyframes completos + easing + duración
  Object.entries(ANIMATIONS).forEach(([k, a]) => {
    config.animations[k] = {
      duration:       a.duration,
      easing:         a.easing,
      iterationCount: a.iterationCount,
      keyframes:      JSON.parse(JSON.stringify(a.keyframes)),
    };
  });

  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), {
    href: url,
    download: `jesulutoxd-config-v5-${Date.now()}.json`,
  });
  link.click();
  URL.revokeObjectURL(url);
}

function loadConfig(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const cfg = JSON.parse(ev.target.result);

      // ── Posiciones de elementos ──
      if (cfg.positions) {
        Object.entries(cfg.positions).forEach(([id, data]) => {
          const el = document.getElementById(id);
          if (!el || !data) return;
          if (data.left)   el.style.left   = data.left;
          if (data.top)    el.style.top    = data.top;
          if (data.width)  el.style.width  = data.width;
          if (data.height) el.style.height = data.height;
        });
      }

      // ── Animaciones: keyframes completos, easing, duración ──
      if (cfg.animations) {
        Object.entries(cfg.animations).forEach(([k, a]) => {
          if (!ANIMATIONS[k]) return;
          if (a.duration       !== undefined) ANIMATIONS[k].duration       = a.duration;
          if (a.easing         !== undefined) ANIMATIONS[k].easing         = a.easing;
          if (a.iterationCount !== undefined) ANIMATIONS[k].iterationCount = a.iterationCount;
          if (a.keyframes      !== undefined) ANIMATIONS[k].keyframes      = JSON.parse(JSON.stringify(a.keyframes));
        });
      }

      // ── Posición del rider ──
      if (cfg.rider) {
        if (!window.ANIM_CONFIG) window.ANIM_CONFIG = {};
        window.ANIM_CONFIG.rider = cfg.rider;
        // Si chibiRiderPos existe, actualizar sus keyframes también
        if (ANIMATIONS.chibiRiderPos) {
          ANIMATIONS.chibiRiderPos.keyframes[0].props.bottom = cfg.rider.bottom;
          ANIMATIONS.chibiRiderPos.keyframes[0].props.left   = cfg.rider.left;
          ANIMATIONS.chibiRiderPos.keyframes[1].props.bottom = cfg.rider.bottom;
          ANIMATIONS.chibiRiderPos.keyframes[1].props.left   = cfg.rider.left;
        }
      }

      // Refrescar el panel si hay una animación abierta
      if (kfState.animKey) loadAnimation(kfState.animKey);

      alert('✅ Config v' + (cfg._version || '?') + ' cargada — todos los keyframes aplicados');
    } catch (err) {
      alert('❌ Error al leer el JSON: ' + err.message);
      console.error(err);
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

window.ANIM_CONFIG = { chibiFly:{speed:5,bounceH:38}, chibiSquish:{duration:600}, hintBounce:{speed:1.5}, scrollCharFrame:{frameMs:200,pauseMs:2000}, eleina:{entryDuration:1400,dismountDelay:1700,dismountSpeed:700,exitDelay:2700,exitDuration:1000,fadeDelay:3500,showChibiDelay:4000}, rider:{bottom:36,left:43} };

console.log('%c✏️ Editor Visual v4 — presiona E para abrir', 'color:#6fcf4a;font-size:13px;font-weight:bold');
