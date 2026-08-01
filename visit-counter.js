// ═══════════════════════════════════════════
// CONTADOR DE VISITAS
// Usa CountAPI (countapi.mileshilliard.com) — servicio externo
// gratuito, sin necesidad de registro ni API key.
// El contador es público: cualquiera con la misma "key" suma
// al mismo total, por eso usamos un nombre bien específico.
//
// ¿Cómo reiniciarlo a 0? Visita una sola vez en el navegador:
//   https://countapi.mileshilliard.com/api/v1/set/jesulutoxd-portfolio-visitas-v1?value=0
//
// ¿El servicio deja de funcionar? Cambia API_BASE por otra
// alternativa compatible (misma forma de endpoints /hit y /get).
// ═══════════════════════════════════════════

(function () {
  const API_BASE = 'https://countapi.mileshilliard.com/api/v1';
  const COUNTER_KEY = 'jesulutoxd-portfolio-visitas-v1';
  const STORAGE_FLAG = 'jxd_visit_counted';
  const COOKIE_FLAG = 'jxd_visit_counted';
  const COOKIE_YEARS = 10;

  const numEl = document.getElementById('visitCountNum');
  if (!numEl) return;

  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  function setCookie(name, value, years) {
    const d = new Date();
    d.setTime(d.getTime() + years * 365 * 24 * 60 * 60 * 1000);
    document.cookie = name + '=' + value + ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
  }

  // Verifica en localStorage y cookie. Si cualquiera existe,
  // no se incrementa el contador (visitante ya registrado).
  const yaContadoLocal = localStorage.getItem(STORAGE_FLAG);
  const yaContadoCookie = getCookie(COOKIE_FLAG);
  const yaContado = yaContadoLocal || yaContadoCookie;

  const endpoint = yaContado
    ? `${API_BASE}/get/${COUNTER_KEY}`
    : `${API_BASE}/hit/${COUNTER_KEY}`;

  fetch(endpoint)
    .then((res) => res.json())
    .then((data) => {
      const valor = parseInt(data && data.value, 10);
      if (!yaContado) {
        localStorage.setItem(STORAGE_FLAG, '1');
        setCookie(COOKIE_FLAG, '1', COOKIE_YEARS);
      } else {
        // Si la cookie existe pero el localStorage se borró, lo restauramos
        if (!yaContadoLocal && yaContadoCookie) {
          localStorage.setItem(STORAGE_FLAG, '1');
        }
      }
      numEl.textContent = Number.isFinite(valor)
        ? String(valor).padStart(6, '0')
        : '??????';
    })
    .catch(() => {
      numEl.textContent = '??????';
    });
})();
