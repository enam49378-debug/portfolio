// ═══════════════════════════════════════════
// VISUAL EDITOR - Modo de edición
// ═══════════════════════════════════════════

let editorMode = false;
let selectedElement = null;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let startX = 0;
let startY = 0;
let startWidth = 0;
let startHeight = 0;
let startRotation = 0;
let resizeMode = false;
let rotateMode = false;

// Elementos editables
const EDITABLE_ELEMENTS = [
  { id: 'scrollChar', label: 'Personaje' },
  { id: 'touchHint', label: 'Hint (Triángulo)' },
  { id: 'music-player', label: 'Reproductor Música' },
  { id: 'cursor', label: 'Cursor' },
];

// Activar/desactivar editor con tecla E
document.addEventListener('keydown', (e) => {
  if (e.key === 'e' || e.key === 'E') {
    toggleEditor();
  }
});

function toggleEditor() {
  editorMode = !editorMode;
  const overlay = document.getElementById('editorOverlay') || createEditorUI();
  
  if (editorMode) {
    overlay.style.display = 'flex';
    document.body.style.cursor = 'crosshair';
    console.log('✏️ EDITOR ACTIVADO - Presiona E para desactivar');
    console.log('Click: seleccionar | Drag: mover | Ctrl+Drag: resize | Shift+Drag: girar');
  } else {
    overlay.style.display = 'none';
    document.body.style.cursor = 'none';
    selectedElement = null;
  }
}

function createEditorUI() {
  // Overlay del editor
  const overlay = document.createElement('div');
  overlay.id = 'editorOverlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    z-index: 8000;
    display: none;
    flex-direction: column;
    justify-content: flex-start;
    pointer-events: none;
  `;
  document.body.appendChild(overlay);

  // Panel de control
  const panel = document.createElement('div');
  panel.id = 'editorPanel';
  panel.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(13, 15, 14, 0.95);
    border: 2px solid #6fcf4a;
    padding: 20px;
    border-radius: 8px;
    font-family: 'Space Mono', monospace;
    color: #e8ede8;
    z-index: 9001;
    pointer-events: auto;
    max-height: 80vh;
    overflow-y: auto;
    width: 300px;
  `;

  panel.innerHTML = `
    <div style="margin-bottom: 20px;">
      <h3 style="color: #6fcf4a; margin: 0 0 10px 0; font-size: 14px;">📍 EDITOR VISUAL</h3>
      <p style="font-size: 11px; color: #5a6b5a; margin: 5px 0;">Presiona E para salir</p>
    </div>

    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 8px; font-size: 12px; color: #6fcf4a;">Elemento:</label>
      <select id="editorElementSelect" style="width: 100%; padding: 6px; background: #141714; color: #e8ede8; border: 1px solid #6fcf4a; border-radius: 4px; font-family: 'Space Mono', monospace; font-size: 11px;">
        <option value="">-- Selecciona un elemento --</option>
      </select>
    </div>

    <div id="editorInfo" style="background: #141714; padding: 10px; border-radius: 4px; margin-bottom: 15px; font-size: 11px; color: #5a6b5a;">
      Haz click en un elemento para seleccionar
    </div>

    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px; font-size: 11px; color: #6fcf4a;">
        X: <span id="editorX">0</span>px
      </label>
      <input type="range" id="editorXSlider" min="-500" max="2000" value="0" style="width: 100%; cursor: pointer;">
    </div>

    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px; font-size: 11px; color: #6fcf4a;">
        Y: <span id="editorY">0</span>px
      </label>
      <input type="range" id="editorYSlider" min="-500" max="2000" value="0" style="width: 100%; cursor: pointer;">
    </div>

    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px; font-size: 11px; color: #6fcf4a;">
        Ancho: <span id="editorWidth">100</span>px
      </label>
      <input type="range" id="editorWidthSlider" min="20" max="800" value="100" style="width: 100%; cursor: pointer;">
    </div>

    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px; font-size: 11px; color: #6fcf4a;">
        Alto: <span id="editorHeight">100</span>px
      </label>
      <input type="range" id="editorHeightSlider" min="20" max="800" value="100" style="width: 100%; cursor: pointer;">
    </div>

    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px; font-size: 11px; color: #6fcf4a;">
        Rotación: <span id="editorRotation">0</span>°
      </label>
      <input type="range" id="editorRotationSlider" min="0" max="360" value="0" style="width: 100%; cursor: pointer;">
    </div>

    <button id="editorDownloadBtn" style="width: 100%; padding: 10px; background: #6fcf4a; color: #0d0f0e; border: none; border-radius: 4px; font-family: 'Space Mono', monospace; font-weight: bold; cursor: pointer; margin-bottom: 10px; font-size: 12px;">
      📥 Descargar Config
    </button>

    <button id="editorLoadBtn" style="width: 100%; padding: 10px; background: #4a9632; color: #e8ede8; border: none; border-radius: 4px; font-family: 'Space Mono', monospace; cursor: pointer; font-size: 12px;">
      📤 Cargar Config
    </button>

    <input type="file" id="editorFileInput" accept=".json" style="display: none;">
  `;

  document.body.appendChild(panel);

  // Listeners del panel
  document.getElementById('editorElementSelect').addEventListener('change', (e) => {
    const elementId = e.target.value;
    if (elementId) selectElement(document.getElementById(elementId));
  });

  document.getElementById('editorXSlider').addEventListener('input', (e) => {
    if (selectedElement) {
      selectedElement.style.left = e.target.value + 'px';
      updateEditorInfo();
    }
  });

  document.getElementById('editorYSlider').addEventListener('input', (e) => {
    if (selectedElement) {
      selectedElement.style.top = e.target.value + 'px';
      updateEditorInfo();
    }
  });

  document.getElementById('editorWidthSlider').addEventListener('input', (e) => {
    if (selectedElement) {
      selectedElement.style.width = e.target.value + 'px';
      updateEditorInfo();
    }
  });

  document.getElementById('editorHeightSlider').addEventListener('input', (e) => {
    if (selectedElement) {
      selectedElement.style.height = e.target.value + 'px';
      updateEditorInfo();
    }
  });

  document.getElementById('editorRotationSlider').addEventListener('input', (e) => {
    if (selectedElement) {
      selectedElement.style.transform = `rotate(${e.target.value}deg)`;
      updateEditorInfo();
    }
  });

  document.getElementById('editorDownloadBtn').addEventListener('click', downloadConfig);
  document.getElementById('editorLoadBtn').addEventListener('click', () => {
    document.getElementById('editorFileInput').click();
  });

  document.getElementById('editorFileInput').addEventListener('change', loadConfigFile);

  // Llenar el select
  EDITABLE_ELEMENTS.forEach(el => {
    const option = document.createElement('option');
    option.value = el.id;
    option.textContent = el.label;
    document.getElementById('editorElementSelect').appendChild(option);
  });

  return overlay;
}

function selectElement(el) {
  if (!el) return;

  selectedElement = el;

  // Highlight visual
  if (document.querySelector('[data-editor-selected]')) {
    document.querySelector('[data-editor-selected]').removeAttribute('data-editor-selected');
  }
  selectedElement.setAttribute('data-editor-selected', 'true');
  selectedElement.style.outline = '3px dashed #6fcf4a';

  updateEditorInfo();
}

function updateEditorInfo() {
  if (!selectedElement) return;

  const rect = selectedElement.getBoundingClientRect();
  const x = parseInt(selectedElement.style.left) || rect.left;
  const y = parseInt(selectedElement.style.top) || rect.top;
  const w = parseInt(selectedElement.style.width) || rect.width;
  const h = parseInt(selectedElement.style.height) || rect.height;
  const rot = parseInt(selectedElement.style.transform.match(/\d+/) || [0])[0];

  document.getElementById('editorX').textContent = x;
  document.getElementById('editorY').textContent = y;
  document.getElementById('editorWidth').textContent = w;
  document.getElementById('editorHeight').textContent = h;
  document.getElementById('editorRotation').textContent = rot || 0;

  document.getElementById('editorXSlider').value = x;
  document.getElementById('editorYSlider').value = y;
  document.getElementById('editorWidthSlider').value = w;
  document.getElementById('editorHeightSlider').value = h;
  document.getElementById('editorRotationSlider').value = rot || 0;
}

function downloadConfig() {
  const config = {};

  EDITABLE_ELEMENTS.forEach(el => {
    const element = document.getElementById(el.id);
    if (!element) return;

    config[el.id] = {
      label: el.label,
      position: {
        left: parseInt(element.style.left) || 0,
        top: parseInt(element.style.top) || 0
      },
      size: {
        width: parseInt(element.style.width) || element.offsetWidth,
        height: parseInt(element.style.height) || element.offsetHeight
      },
      rotation: parseInt(element.style.transform.match(/\d+/) || [0])[0] || 0
    };
  });

  const json = JSON.stringify(config, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `config-${new Date().getTime()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log('✅ Config descargada:', config);
}

function loadConfigFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const config = JSON.parse(e.target.result);
      applyConfig(config);
      console.log('✅ Config cargada:', config);
    } catch (err) {
      console.error('❌ Error al cargar config:', err);
      alert('Error al cargar el archivo de configuración');
    }
  };
  reader.readAsText(file);
}

function applyConfig(config) {
  Object.keys(config).forEach(elementId => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const cfg = config[elementId];

    // Posición
    if (cfg.position) {
      element.style.left = cfg.position.left + 'px';
      element.style.top = cfg.position.top + 'px';
    }

    // Tamaño
    if (cfg.size) {
      element.style.width = cfg.size.width + 'px';
      element.style.height = cfg.size.height + 'px';
    }

    // Rotación
    if (cfg.rotation) {
      element.style.transform = `rotate(${cfg.rotation}deg)`;
    }
  });
}

// Click para seleccionar elementos en modo editor
document.addEventListener('click', (e) => {
  if (!editorMode) return;

  const element = e.target;
  const editableId = EDITABLE_ELEMENTS.map(el => el.id).find(id => element.closest(`#${id}`));

  if (editableId) {
    selectElement(document.getElementById(editableId));
  }
});

// CSS para elemento seleccionado
const style = document.createElement('style');
style.textContent = `
  [data-editor-selected] {
    outline: 3px dashed #6fcf4a !important;
  }
`;
document.head.appendChild(style);

console.log('💾 Editor cargado - Presiona E para activar');
