(function () {
  // 1. Bloquear clic derecho
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });

  // 2. Bloquear teclas de desarrollo
  document.addEventListener('keydown', function (e) {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
      (e.ctrlKey && e.key === 'U')
    ) {
      e.preventDefault();
      return false;
    }
  });

  // 3. Proteger imágenes (drag)
  document.addEventListener('dragstart', function (e) {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });

  // 4. Anti-selección de texto
  var style = document.createElement('style');
  style.textContent = 'body { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; } input, textarea { user-select: text; }';
  document.head.appendChild(style);

  // 5. Bloquear copia y corte (Ctrl+C, Ctrl+X)
  document.addEventListener('copy', function (e) { e.preventDefault(); });
  document.addEventListener('cut', function (e) { e.preventDefault(); });

  // 6. Detección de DevTools por tamaño
  var devtoolsOpen = false;
  var WARN = '%c\u26a0\ufe0f Portafolio protegido — No intentes inspeccionar o copiar sin permiso.';
  var WARN_STYLE = 'font-size:13px;color:#f04747;font-weight:bold;padding:4px;';

  function checkDevTools() {
    var t = 160;
    var open = window.outerWidth - window.innerWidth > t || window.outerHeight - window.innerHeight > t;
    if (open && !devtoolsOpen) {
      devtoolsOpen = true;
      console.clear();
      console.log(WARN, WARN_STYLE);
      console.log('%cSi eres un reclutador, cont\u00e1ctame directamente \u2014 no hagas scrap', 'font-size:12px;color:#faa61a;');
      document.title = '(devtools) ' + document.title.replace(/^\(devtools\) /, '');
    } else if (!open) {
      devtoolsOpen = false;
    }
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(checkDevTools, 500);
  });
  checkDevTools();

  // 7. Detección de DevTools por console.log con objeto (solo se activa si la consola está abierta)
  (function detectConsole() {
    var r = /./;
    r.toString = function () {
      console.clear();
      console.log(WARN, WARN_STYLE);
      document.title = '(devtools) ' + document.title.replace(/^\(devtools\) /, '');
    };
    setInterval(function () { console.log(r); }, 2000);
  })();

  // 8. Anti-debugger — si alguien intenta depurar, se dispara un debugger que frena la depuración
  setInterval(function () {
    var start = Date.now();
    (function () {}).constructor('debugger')();
    if (Date.now() - start > 50) {
      console.clear();
      console.log(WARN, WARN_STYLE);
    }
  }, 30000);

  // 9. Sobrescribir console.table y console.dir para evitar volcados bonitos
  var blockConsole = function (fn) {
    return function () {
      console.log('%c[bloqueado]', 'color:#747f8d;font-size:10px;');
    };
  };
  if (console.table) console.table = blockConsole();
  if (console.dir) console.dir = blockConsole();
  if (console.dirxml) console.dirxml = blockConsole();

  // 10. Aviso inicial
  console.log(WARN, WARN_STYLE);
})();
