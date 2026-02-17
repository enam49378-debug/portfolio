// ═══════════════════════════════════════════
// VISUAL EDITOR - Modo de edición MEJORADO
// ═══════════════════════════════════════════

let editorMode = false;
let selectedElement = null;

// Elementos editables
const EDITABLE_ELEMENTS = [
  { id: 'scrollChar', label: 'Personaje' },
  { id: 'touchHint', label: 'Hint (Triángulo)' },
  { id: 'music-player', label: 'Reproductor Música' },
  { id: 'cursor', label: 'Cursor' },
];

// Activar/desactivar editor con tecla E
document.addEventListener('keydown', (e) => {
  if ((e.key === 'e' || e.key === 'E') && !e.ctrlKey && !e.shiftKey) {
    e.preventDefault();
    toggleEditor();
  }
});

function toggleEditor() {
  editorMode = !editorMode;
  
  if (editorMode) {
    createEditorUI();
    document.body.style.cursor = 'crosshair';
    console.log('%c✏️ EDITOR ACTIVADO', 'color: #6fcf4a; font-size: 14px; font-weight: bold;');
    console.log('Presiona E para desactivar | Click: seleccionar | Arrastra: mover | Ctrl+Arrastra: resize | Shift+Arrastra: girar');
  } else {
    const panel = document.getElementById('editorPanel');
    const overlay = document.getElementById('editorOverlay');
    if (panel) panel.remove();
    if (overlay) overlay.remove();
    document.body.style.cursor = 'none';
    selectedElement = null;
  }
}

function createEditorUI() {
  // Remover si existe
  if (document.getElementById('editorPanel')) return;

  // Panel de control
  const panel = document.createElement('div');
  panel.id = 'editorPanel';
  panel.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(13, 15, 14, 0.98);
    border: 2px solid #6fcf4a;
    padding: 20px;
    border-radius: 8px;
    font-family: 'Space Mono', monospace;
    color: #e8ede8;
    z-index: 9001;
    pointer-events: auto;
    max-height: 85vh;
    overflow-y: auto;
    width: 320px;
    box-shadow: 0 0 20px rgba(111, 207, 74, 0.2);
  `;

  panel.innerHTML = `
    <div style="margin-bottom: 20px; border-bottom: 1px solid rgba(111,207,74,0.3); padding-bottom: 15px;">
      <h3 style="color: #6fcf4a; margin: 0 0 5px 0; font-size: 13px;">📍 VISUAL EDITOR</h3>
      <p style="font-size: 10px; color: #5a6b5a; margin: 0;">Presiona <span style="color: #6fcf4a; font-weight: bold;">E</span> para salir</p>
    </div>

    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 8px; font-size: 11px; color: #6fcf4a; font-weight: bold;">SELECCIONAR ELEMENTO:</label>
      <select id="editorElementSelect" style="width: 100%; padding: 8px; background: #141714; color: #e8ede8; border: 1px solid #6fcf4a; border-radius: 4px; font-family: 'Space Mono', monospace; font-size: 11px; cursor: pointer;">
        <option value="">-- O haz click en la página --</option>
      </select>
    </div>

    <div id="editorInfo" style="background: #141714; padding: 12px; border-radius: 4px; margin-bottom: 20px; font-size: 10px; color: #5a6b5a; border: 1px solid rgba(111,207,74,0.2);">
      <div>Elemento: <span style="color: #6fcf4a;" id="infoLabel">Ninguno</span></div>
      <div style="margin-top: 5px;">Arrastra para mover | Ctrl+Arrastra para resize | Shift+Arrastra para girar</div>
    </div>

    <div style="background: #141714; padding: 15px; border-radius: 4px; border: 1px solid rgba(111,207,74,0.2);">
      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 5px; font-size: 10px; color: #6fcf4a;">
          LEFT: <span id="editorX" style="color: #e8ede8; font-weight: bold;">0</span>px
        </label>
        <input type="range" id="editorXSlider" min="-500" max="2000" value="0" style="width: 100%; cursor: pointer;">
      </div>

      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 5px; font-size: 10px; color: #6fcf4a;">
          TOP: <span id="editorY" style="color: #e8ede8; font-weight: bold;">0</span>px
        </label>
        <input type="range" id="editorYSlider" min="-500" max="2000" value="0" style="width: 100%; cursor: pointer;">
      </div>

      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 5px; font-size: 10px; color: #6fcf4a;">
          WIDTH: <span id="editorWidth" style="color: #e8ede8; font-weight: bold;">100</span>px
        </label>
        <input type="range" id="editorWidthSlider" min="20" max="800" value="100" style="width: 100%; cursor: pointer;">
      </div>

      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 5px; font-size: 10px; color: #6fcf4a;">
          HEIGHT: <span id="editorHeight" style="color: #e8ede8; font-weight: bold;">100</span>px
        </label>
        <input type="range" id="editorHeightSlider" min="20" max="800" value="100" style="width: 100%; cursor: pointer;">
      </div>

      <div>
        <label style="display: block; margin-bottom: 5px; font-size: 10px; color: #6fcf4a;">
          ROTATION: <span id="editorRotation" style="color: #e8ede8; font-weight: bold;">0</span>°
        </label>
        <input type="range" id="editorRotationSlider" min="0" max="360" value="0" style="width: 100%; cursor: pointer;">
      </div>
    </div>

    <div style="margin-top: 20px; display: flex; gap: 10px;">
      <button id="editorDownloadBtn" style="flex: 1; padding: 10px; background: #6fcf4a; color: #0d0f0e; border: none; border-radius: 4px; font-family: 'Space Mono', monospace; font-weight: bold; cursor: pointer; font-size: 11px;">
        📥 DESCARGAR
      </button>
      <button id="editorResetBtn" style="flex: 1; padding: 10px; background: #4a9632; color: #e8ede8; border: none; border-radius: 4px; font-family: 'Space Mono', monospace; cursor: pointer; font-size: 11px;">
        🔄 RESET
      </button>
    </div>

    <input type="file" id="editorFileInput" accept=".json" style="display: none;">
  `;

  document.body.appendChild(panel);

  // Llenar el select
  EDITABLE_ELEMENTS.forEach(el => {
    const option = document.createElement('option');
    option.value = el.id;
    option.textContent = el.label;
    document.getElementById('editorElementSelect').appendChild(option);
  });

  // Event listeners del select
  document.getElementById('editorElementSelect').addEventListener('change', (e) => {
    const elementId = e.target.value;
    if (elementId) selectElement(document.getElementById(elementId));
  });

  // Event listeners de sliders
  ['X', 'Y', 'Width', 'Height', 'Rotation'].forEach(prop => {
    const sliderId = `editor${prop}Slider`;
    document.getElementById(sliderId).addEventListener('input', (e) => {
      if (selectedElement) {
        const value = e.target.value;
        switch(prop) {
          case 'X':
            selectedElement.style.left = value + 'px';
            break;
          case 'Y':
            selectedElement.style.top = value + 'px';
            break;
          case 'Width':
            selectedElement.style.width = value + 'px';
            break;
          case 'Height':
            selectedElement.style.height = value + 'px';
            break;
          case 'Rotation':
            selectedElement.style.transform = `rotate(${value}deg)`;
            break;
        }
        updateEditorInfo();
      }
    });
  });

  document.getElementById('editorDownloadBtn').addEventListener('click', downloadConfig);
  document.getElementById('editorResetBtn').addEventListener('click', () => {
    if (confirm('¿Descartar cambios?')) {
      location.reload();
    }
  });
}

function selectElement(el) {
  if (!el) return;

  selectedElement = el;

  // Remover outline anterior
  document.querySelectorAll('[data-editor-selected]').forEach(e => {
    e.removeAttribute('data-editor-selected');
    e.style.outline = 'none';
  });

  // Marcar como seleccionado
  selectedElement.setAttribute('data-editor-selected', 'true');
  selectedElement.style.outline = '2px dashed #6fcf4a';
  selectedElement.style.outlineOffset = '2px';

  // Actualizar info
  updateEditorInfo();
  
  // Actualizar select
  const label = EDITABLE_ELEMENTS.find(e => e.id === selectedElement.id)?.label || '';
  document.getElementById('infoLabel').textContent = label;
}

function updateEditorInfo() {
  if (!selectedElement) return;

  const rect = selectedElement.getBoundingClientRect();
  const x = parseInt(selectedElement.style.left) || 0;
  const y = parseInt(selectedElement.style.top) || 0;
  const w = parseInt(selectedElement.style.width) || rect.width;
  const h = parseInt(selectedElement.style.height) || rect.height;
  const rotMatch = selectedElement.style.transform.match(/rotate\(([^)]+)deg\)/);
  const rot = rotMatch ? parseInt(rotMatch[1]) : 0;

  document.getElementById('editorX').textContent = x;
  document.getElementById('editorY').textContent = y;
  document.getElementById('editorWidth').textContent = w;
  document.getElementById('editorHeight').textContent = h;
  document.getElementById('editorRotation').textContent = rot;

  document.getElementById('editorXSlider').value = x;
  document.getElementById('editorYSlider').value = y;
  document.getElementById('editorWidthSlider').value = w;
  document.getElementById('editorHeightSlider').value = h;
  document.getElementById('editorRotationSlider').value = rot;
}

function downloadConfig() {
  const config = {};

  EDITABLE_ELEMENTS.forEach(el => {
    const element = document.getElementById(el.id);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = parseInt(element.style.left) || 0;
    const y = parseInt(element.style.top) || 0;
    const w = parseInt(element.style.width) || rect.width;
    const h = parseInt(element.style.height) || rect.height;
    const rotMatch = element.style.transform.match(/rotate\(([^)]+)deg\)/);
    const rot = rotMatch ? parseInt(rotMatch[1]) : 0;

    config[el.id] = {
      label: el.label,
      position: { left: x, top: y },
      size: { width: w, height: h },
      rotation: rot
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

  console.log('%c✅ Config descargada', 'color: #6fcf4a; font-size: 12px; font-weight: bold;');
  console.log(config);
}

// Click en elementos para seleccionar
document.addEventListener('click', (e) => {
  if (!editorMode) return;
  if (e.target.closest('#editorPanel')) return;

  const elementId = EDITABLE_ELEMENTS.map(el => el.id).find(id => {
    const el = document.getElementById(id);
    return el && e.target.closest(`#${id}`);
  });

  if (elementId) {
    selectElement(document.getElementById(elementId));
  }
}, true);

console.log('%c💾 Editor Visual Cargado', 'color: #6fcf4a; font-size: 12px;');
console.log('Presiona E para activar');
