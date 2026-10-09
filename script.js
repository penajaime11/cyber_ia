'use strict';
/* ===== Utilidades ===== */
const $ = (s, r = document) => r.querySelector(s);
const NS = 'http://www.w3.org/2000/svg';
const S = (t, a = {}, p, txt) => {
  const e = document.createElementNS(NS, t);
  for (const k in a) e.setAttribute(k, a[k]);
  if (txt != null) e.textContent = txt;
  if (p) p.appendChild(e);
  return e;
};
const H = (t, c, html, p) => {
  const e = document.createElement(t);
  if (c) e.className = c;
  if (html != null) e.innerHTML = html;
  if (p) p.appendChild(e);
  return e;
};
const pct = x => (x * 100).toFixed(2) + '%';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const wrap = (txt, n) => {
  const out = []; let l = '';
  txt.split(' ').forEach(w => {
    if ((l + ' ' + w).trim().length > n) { out.push(l); l = w; } else l = (l + ' ' + w).trim();
  });
  if (l) out.push(l);
  return out;
};
const COL = { amenaza: '#ef4444', evidencia: '#f59e0b', activo: '#3b82f6', respuesta: '#10b981', efecto: '#a855f7' };
const TIPO = { amenaza: 'Amenazas', evidencia: 'Evidencias', activo: 'Activos', respuesta: 'Respuestas', efecto: 'Efectos' };

/* ===== Navegación ===== */
const titulos = ['Contexto', '1 Mapa', '2 Red', '3 Consultas', '4 Reglas', '5 Inferencias', '6 Árbol', '7 No-monótono', '8 Probabilidad', '9 Bayes', 'Conclusiones'];
const ids = ['e0', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'conclusion'];
titulos.forEach((t, i) => H('a', '', t, $('#nav')).href = '#' + ids[i]);

/* ===== Datos: red semántica ===== */
const NODOS = [
  ['ArchivosSospechosos', 'Archivos sospechosos', 'evidencia'], ['CifradoInesperado', 'Cifrado inesperado', 'evidencia'],
  ['CorreosFraudulentos', 'Correos fraudulentos', 'evidencia'], ['TraficoAnomalo', 'Tráfico anómalo', 'evidencia'],
  ['IntentosFallidos', 'Intentos fallidos', 'evidencia'], ['AccesosNoAutorizados', 'Accesos no autorizados', 'evidencia'],
  ['Malware', 'Malware', 'amenaza'], ['Ransomware', 'Ransomware', 'amenaza'], ['Phishing', 'Phishing', 'amenaza'],
  ['DDoS', 'Ataque DDoS', 'amenaza'], ['FuerzaBruta', 'Fuerza bruta', 'amenaza'], ['RoboCredenciales', 'Robo de credenciales', 'amenaza'],
  ['Computadoras', 'Computadoras', 'activo'], ['Archivos', 'Archivos', 'activo'], ['Servidores', 'Servidores', 'activo'], ['BasesDeDatos', 'Bases de datos', 'activo'],
  ['RedEmpresarial', 'Red empresarial', 'activo'], ['Usuario', 'Usuario', 'activo'], ['CuentaCorporativa', 'Cuenta corporativa', 'activo'],
  ['PerdidaDeDatos', 'Pérdida de datos', 'efecto'], ['Indisponibilidad', 'Indisponibilidad', 'efecto'],
  ['Aislamiento', 'Aislamiento', 'respuesta'], ['Bloqueo', 'Bloqueo', 'respuesta'], ['AlertaUsuario', 'Alerta al usuario', 'respuesta'],
  ['Respaldo', 'Respaldo', 'respuesta'], ['Recuperacion', 'Recuperación', 'respuesta']
];
const ND = {}; NODOS.forEach(n => ND[n[0]] = { id: n[0], label: n[1], tipo: n[2] });
const REL = [
  ['ArchivosSospechosos', 'indica', 'Malware', 'Un archivo extraño sugiere malware'],
  ['ArchivosSospechosos', 'indica', 'Ransomware', 'Archivos modificados pueden anticipar ransomware'],
  ['CifradoInesperado', 'indica', 'Ransomware', 'Cifrado no solicitado es la señal clásica'],
  ['CorreosFraudulentos', 'indica', 'Phishing', 'Correo engañoso apunta a phishing'],
  ['TraficoAnomalo', 'indica', 'DDoS', 'Volumen inusual apunta a denegación de servicio'],
  ['IntentosFallidos', 'indica', 'FuerzaBruta', 'Muchos fallos seguidos sugieren adivinar claves'],
  ['AccesosNoAutorizados', 'indica', 'RoboCredenciales', 'Alguien usa credenciales ajenas'],
  ['Phishing', 'provoca', 'RoboCredenciales', 'El engaño captura contraseñas'],
  ['FuerzaBruta', 'provoca', 'RoboCredenciales', 'Adivinar claves permite obtener acceso'],
  ['Malware', 'provoca', 'RoboCredenciales', 'Keyloggers y troyanos capturan credenciales'],
  ['RoboCredenciales', 'afecta', 'Usuario', 'El usuario pierde control de su identidad'],
  ['RoboCredenciales', 'compromete', 'CuentaCorporativa', 'La cuenta queda expuesta'],
  ['Usuario', 'posee', 'CuentaCorporativa', 'Relación de propiedad'],
  ['Malware', 'afecta', 'Computadoras', 'Infecta equipos de usuario'],
  ['Malware', 'afecta', 'Servidores', 'Puede propagarse a servidores'],
  ['Malware', 'afecta', 'BasesDeDatos', 'Puede leer o alterar datos'],
  ['Ransomware', 'cifra', 'Archivos', 'Los vuelve ilegibles sin la clave'],
  ['Archivos', 'requiere', 'Respaldo', 'Necesitan una copia para poder recuperarse'],
  ['Usuario', 'compromete', 'CuentaCorporativa', 'Un usuario engañado compromete su cuenta'],
  ['Ransomware', 'cifra', 'Servidores', 'Bloquea información crítica'],
  ['Ransomware', 'cifra', 'BasesDeDatos', 'Deja los datos inaccesibles'],
  ['Ransomware', 'afecta', 'Computadoras', 'Cifra archivos locales'],
  ['Ransomware', 'provoca', 'PerdidaDeDatos', 'Sin respaldo la información se pierde'],
  ['DDoS', 'afecta', 'Servidores', 'Los satura de solicitudes'],
  ['DDoS', 'afecta', 'RedEmpresarial', 'Consume el ancho de banda'],
  ['DDoS', 'provoca', 'Indisponibilidad', 'Los servicios dejan de responder'],
  ['FuerzaBruta', 'afecta', 'CuentaCorporativa', 'Ataca el inicio de sesión'],
  ['Aislamiento', 'mitiga', 'Malware', 'Evita que se propague'],
  ['Aislamiento', 'mitiga', 'Ransomware', 'Detiene el cifrado en otros equipos'],
  ['Bloqueo', 'mitiga', 'Phishing', 'Bloquea remitente y enlace'],
  ['Bloqueo', 'mitiga', 'DDoS', 'Bloquea IP de origen y filtra tráfico'],
  ['Bloqueo', 'mitiga', 'FuerzaBruta', 'Bloquea IP o cuenta tras varios fallos'],
  ['AlertaUsuario', 'mitiga', 'Phishing', 'El usuario deja de interactuar con el correo'],
  ['Respaldo', 'mitiga', 'PerdidaDeDatos', 'Permite recuperar la información'],
  ['Recuperacion', 'requiere', 'Respaldo', 'Sin copia no hay restauración'],
  ['Recuperacion', 'restaura', 'Servidores', 'Devuelve el servicio'],
  ['Recuperacion', 'restaura', 'BasesDeDatos', 'Recupera la información'],
  ['Bloqueo', 'protege', 'RedEmpresarial', 'Reduce la superficie de ataque'],
  ['Indisponibilidad', 'afecta', 'Usuario', 'No puede trabajar con normalidad']
];
$('#cnt-nodos').textContent = NODOS.length;
$('#cnt-rel').textContent = REL.length;

/* ===== 1. Mapa conceptual ===== */
(function () {
  const svg = $('#svg-mapa');
  const defs = S('defs', {}, svg);
  const mk = S('marker', { id: 'fl', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' }, defs);
  S('path', { d: 'M0 0L10 5L0 10z', fill: '#8fb3d1' }, mk);
  const caja = (x, y, w, h, t, c, sub) => {
    S('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: 8, fill: '#0f1c33', stroke: c, 'stroke-width': 2 }, svg);
    S('text', { x, y: sub ? y - 2 : y + 5, 'text-anchor': 'middle', fill: '#fff', 'font-size': 13, 'font-weight': 700 }, svg, t);
    if (sub) S('text', { x, y: y + 14, 'text-anchor': 'middle', fill: '#8fb3d1', 'font-size': 10 }, svg, sub);
  };
  const linea = (x1, y1, x2, y2, lbl, flecha, dash) => {
    S('line', { x1, y1, x2, y2, stroke: '#8fb3d1', 'stroke-width': 1.4, 'marker-end': flecha ? 'url(#fl)' : '', 'stroke-dasharray': dash ? '5 4' : '' }, svg);
    if (lbl) {
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, w = lbl.length * 6.2 + 12;
      S('rect', { x: mx - w / 2, y: my - 9, width: w, height: 17, rx: 4, fill: '#13213a', stroke: '#36527a' }, svg);
      S('text', { x: mx, y: my + 4, 'text-anchor': 'middle', fill: '#cfe3f5', 'font-size': 11, 'font-style': 'italic' }, svg, lbl);
    }
  };
  const ramas = [
    ['Evidencias', 'evidencia', 'se detectan como', ['Archivos sospechosos', 'Correos fraudulentos', 'Tráfico anómalo', 'Accesos no autorizados', 'Cifrado inesperado'], 'detecta'],
    ['Amenazas', 'amenaza', 'enfrenta', ['Malware', 'Ransomware', 'Phishing', 'Ataque DDoS', 'Robo de credenciales'], 'enfrenta'],
    ['Activos', 'activo', 'protege', ['Servidores', 'Computadoras', 'Bases de datos', 'Red empresarial'], 'protege'],
    ['Respuestas', 'respuesta', 'aplica', ['Bloqueo', 'Aislamiento', 'Respaldo', 'Recuperación'], 'aplica']
  ];
  const xs = [130, 375, 625, 870];
  caja(500, 40, 230, 44, 'CIBERSEGURIDAD', '#6366f1');
  ramas.forEach((r, i) => {
    const x = xs[i];
    linea(500, 62, x, 130, r[4], true);
  });
  ramas.forEach((r, i) => {
    const x = xs[i];
    caja(x, 150, 150, 40, r[0], COL[r[1]]);
    r[3].forEach((c, j) => {
      const y = 260 + j * 62;
      linea(x, j ? y - 62 + 17 : 170, x, y - 17, j ? '' : 'incluye', true);
      caja(x, y, 170, 34, c, COL[r[1]]);
    });
  });
  linea(205, 150, 300, 150, 'indican', true);
  linea(450, 150, 550, 150, 'afectan', true);
  linea(795, 150, 700, 150, 'protegen', true);
  S('rect', { x: 140, y: 560, width: 720, height: 32, rx: 8, fill: '#13213a', stroke: '#36527a' }, svg);
  S('text', { x: 500, y: 581, 'text-anchor': 'middle', fill: '#cfe3f5', 'font-size': 12 }, svg,
    'Proposición: Evidencia —indica→ Amenaza —afecta→ Activo —se mitiga con→ Respuesta');
})();

/* ===== 2. Red semántica ===== */
(function () {
  const svg = $('#svg-grafo');
  const defs = S('defs', {}, svg);
  const cols = { evidencia: 100, amenaza: 340, activo: 620, efecto: 620, respuesta: 900 };
  const orden = {
    evidencia: ['ArchivosSospechosos', 'CifradoInesperado', 'CorreosFraudulentos', 'TraficoAnomalo', 'IntentosFallidos', 'AccesosNoAutorizados'],
    amenaza: ['Malware', 'Ransomware', 'Phishing', 'DDoS', 'FuerzaBruta', 'RoboCredenciales'],
    activo: ['Computadoras', 'Archivos', 'Servidores', 'BasesDeDatos', 'RedEmpresarial', 'Usuario', 'CuentaCorporativa', 'PerdidaDeDatos', 'Indisponibilidad'],
    respuesta: ['Aislamiento', 'Bloqueo', 'AlertaUsuario', 'Respaldo', 'Recuperacion']
  };
  Object.entries(orden).forEach(([g, lst]) => lst.forEach((id, i) => {
    ND[id].x = cols[g]; ND[id].y = 50 + i * (540 / (lst.length - 1));
  }));
  Object.entries(COL).forEach(([k, c]) => {
    const m = S('marker', { id: 'a-' + k, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, defs);
    S('path', { d: 'M0 0L10 5L0 10z', fill: c }, m);
  });
  const W = 130, Hh = 28;
  REL.forEach(r => {
    const a = ND[r[0]], b = ND[r[2]], c = COL[a.tipo];
    const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
    const x1 = a.x + (dx > 0 ? W / 2 : dx < 0 ? -W / 2 : 0), x2 = b.x - (dx > 0 ? W / 2 : dx < 0 ? -W / 2 : 0);
    const y1 = a.y + (dx === 0 ? (dy > 0 ? Hh / 2 : -Hh / 2) : 0), y2 = b.y - (dx === 0 ? (dy > 0 ? Hh / 2 : -Hh / 2) : 0);
    S('line', { x1, y1, x2, y2, stroke: c, 'stroke-opacity': .55, 'stroke-width': 1.2, 'marker-end': `url(#a-${a.tipo})` }, svg);
  });
  REL.forEach((r, i) => {
    const a = ND[r[0]], b = ND[r[2]], t = .3 + (i % 3) * .15;
    const mx = a.x + (b.x - a.x) * t, my = a.y + (b.y - a.y) * t, w = r[1].length * 5.2 + 8;
    S('rect', { x: mx - w / 2, y: my - 7, width: w, height: 13, rx: 3, fill: '#050c19', 'fill-opacity': .88 }, svg);
    S('text', { x: mx, y: my + 3, 'text-anchor': 'middle', fill: '#cfe3f5', 'font-size': 8.5 }, svg, r[1]);
  });
  NODOS.forEach(n => {
    const o = ND[n[0]];
    S('rect', { x: o.x - W / 2, y: o.y - Hh / 2, width: W, height: Hh, rx: 14, fill: '#0f1c33', stroke: COL[o.tipo], 'stroke-width': 2 }, svg);
    S('text', { x: o.x, y: o.y + 4, 'text-anchor': 'middle', fill: '#fff', 'font-size': 11, 'font-weight': 600 }, svg, o.label);
  });
  const ley = $('#ley-grafo');
  Object.keys(TIPO).forEach(k => H('span', '', TIPO[k], ley).style.setProperty('--c', COL[k]));
  const tb = $('#tabla-rel tbody');
  REL.forEach((r, i) => H('tr', '', `<td>${i + 1}</td><td class="m">${r[0]}</td><td class="rel">${r[1]}</td><td class="m">${r[2]}</td><td>${r[3]}</td>`, tb));
})();

/* ===== 3. Consultas sobre la red ===== */
const QUERIES = [
  { q: '¿Qué amenazas pueden originar robo de credenciales?', est: "Recorrido inverso de 1 salto: aristas 'provoca' que llegan a RoboCredenciales", nodo: 'RoboCredenciales', dir: 'in', rels: ['provoca'], tipo: 'amenaza' },
  { q: '¿Qué evidencias indican un ataque ransomware?', est: "Recorrido inverso de 1 salto: aristas 'indica' que llegan a Ransomware", nodo: 'Ransomware', dir: 'in', rels: ['indica'], tipo: 'evidencia' },
  { q: '¿Qué activos son afectados por un malware?', est: "Recorrido directo de 1 salto: aristas 'afecta' que salen de Malware", nodo: 'Malware', dir: 'out', rels: ['afecta'], tipo: 'activo' },
  { q: '¿Qué respuesta corresponde a un ataque DDoS?', est: "Recorrido inverso de 1 salto: aristas 'mitiga' que llegan a DDoS", nodo: 'DDoS', dir: 'in', rels: ['mitiga'], tipo: 'respuesta' },
  { q: '¿Qué activos cifra el ransomware?', est: "Recorrido directo de 1 salto: aristas 'cifra' que salen de Ransomware", nodo: 'Ransomware', dir: 'out', rels: ['cifra'], tipo: 'activo' },
  { q: 'Si aparecen correos fraudulentos, ¿qué respuesta aplicar? (2 saltos)', est: "Inferencia transitiva: CorreosFraudulentos —indica→ X, luego Y —mitiga→ X", nodo: 'CorreosFraudulentos', dir: 'out', rels: ['indica'], tipo: 'amenaza',
    hop2: { dir: 'in', rels: ['mitiga'], tipo: 'respuesta' } }
];
function recorrer(nodo, dir, rels, tipo) {
  const hall = REL.filter(r => rels.includes(r[1]) && (dir === 'out' ? r[0] === nodo : r[2] === nodo));
  return hall.map(r => ({ r, otro: dir === 'out' ? r[2] : r[0] }));
}
function ejecutar(q) {
  const L = [`<span class="t">Consulta:</span> ${q.q}`, `<span class="d">Estrategia:</span> ${q.est}`, '', `1. Nodo origen: [${q.nodo}]`, '2. Inspeccionando aristas...'];
  let cur = recorrer(q.nodo, q.dir, q.rels);
  cur.forEach(c => L.push(`   → ${c.r[0]} --(${c.r[1]})--> ${c.r[2]}`));
  let fin = cur.map(c => c.otro).filter(o => ND[o].tipo === q.tipo);
  L.push(`3. Filtrando por tipo '${q.tipo}'... ${fin.length} resultado(s)`);
  if (q.hop2) {
    const next = [];
    fin.forEach(f => recorrer(f, q.hop2.dir, q.hop2.rels).forEach(c => { L.push(`   → ${c.r[0]} --(${c.r[1]})--> ${c.r[2]}`); next.push(c.otro); }));
    fin = [...new Set(next.filter(o => ND[o].tipo === q.hop2.tipo))];
    L.push('4. Segundo salto filtrado por tipo ' + `'${q.hop2.tipo}'`);
  }
  L.push('', `<span class="g">Resultado: ${fin.length ? fin.map(f => ND[f].label).join(', ') : 'sin coincidencias'}</span>`);
  return { html: L.join('\n'), fin };
}
(function () {
  const sel = $('#q-sel');
  QUERIES.forEach((q, i) => sel.add(new Option(q.q, i)));
  $('#q-run').onclick = () => { $('#q-out').innerHTML = ejecutar(QUERIES[sel.value]).html; };
  QUERIES.forEach((q, i) => {
    const r = ejecutar(q);
    H('div', 'mini', `<h4>Consulta ${i + 1}</h4><p>${q.q}</p><p class="ok">${r.fin.map(f => ND[f].label).join(', ')}</p>`, $('#q-all'));
  });
})();

/* ===== 4. Reglas y motor de inferencia ===== */
const RULES = [
  ['R1', 'Phishing', ['correo_sospechoso', 'enlace_fraudulento'], 'phishing'],
  ['R2', 'Ransomware', ['archivos_cifrados'], 'ransomware'],
  ['R3', 'Ataque DDoS', ['trafico_excesivo', 'solicitudes_simultaneas'], 'ddos'],
  ['R4', 'Fuerza bruta', ['intentos_fallidos_multiples'], 'fuerza_bruta'],
  ['R5', 'Cuenta comprometida', ['login_ubicacion_desconocida'], 'cuenta_comprometida'],
  ['R6', 'Robo de credenciales', ['phishing', 'solicita_credenciales'], 'robo_credenciales'],
  ['R7', 'Malware', ['archivos_sospechosos', 'proceso_desconocido'], 'malware'],
  ['R8', 'Respuesta a ransomware', ['ransomware'], 'ACCION: aislar_equipo_y_restaurar_respaldo'],
  ['R9', 'Respuesta a DDoS', ['ddos'], 'ACCION: bloquear_ips_y_activar_mitigacion'],
  ['R10', 'Respuesta a phishing', ['phishing'], 'ACCION: bloquear_correo_y_alertar_usuario'],
  ['R11', 'Respuesta a fuerza bruta', ['fuerza_bruta'], 'ACCION: bloquear_ip_y_activar_mfa'],
  ['R12', 'Respuesta a cuenta comprometida', ['cuenta_comprometida'], 'ACCION: cerrar_sesiones_y_restablecer_contrasena'],
  ['R13', 'Respuesta a malware', ['malware'], 'ACCION: aislar_equipo_y_ejecutar_antimalware'],
  ['R14', 'Respuesta a robo de credenciales', ['robo_credenciales'], 'ACCION: restablecer_credenciales_y_revisar_accesos']
];
function inferir(hechos) {
  const F = new Set(hechos), log = [];
  let cambio = true;
  while (cambio) {
    cambio = false;
    RULES.forEach(r => {
      if (!F.has(r[3]) && r[2].every(c => F.has(c))) { F.add(r[3]); log.push({ r, nuevo: r[3] }); cambio = true; }
    });
  }
  return { F, log };
}
const nombre = s => s.replace(/_/g, ' ');
$('#cnt-reglas').textContent = RULES.length;
(function () {
  const g = $('#reglas');
  RULES.forEach(r => H('div', 'mini', `<h4>${r[0]}: ${r[1]}</h4><p class="f">SI ${r[2].join('\nY  ')}\nENTONCES ${r[3]}</p>`, g));
  const casos = [
    ['correo_sospechoso', 'enlace_fraudulento'], ['archivos_cifrados'],
    ['trafico_excesivo', 'solicitudes_simultaneas'], ['intentos_fallidos_multiples'], ['login_ubicacion_desconocida']
  ];
  const tb = $('#tabla-casos tbody');
  casos.forEach((c, i) => {
    const { log } = inferir(c);
    const ded = log.filter(l => !l.nuevo.startsWith('ACCION')).map(l => l.nuevo).join(', ');
    const acc = log.filter(l => l.nuevo.startsWith('ACCION')).map(l => l.nuevo.slice(8)).join(', ');
    H('tr', '', `<td><b>Caso ${i + 1}</b></td><td class="m">${c.join(', ')}</td><td class="m">${log.map(l => l.r[0]).join(' → ')}</td><td class="m">${ded}</td><td class="m ok">${acc}</td>`, tb);
  });
  const hs = ['correo_sospechoso', 'enlace_fraudulento', 'solicita_credenciales', 'archivos_cifrados', 'archivos_sospechosos', 'proceso_desconocido', 'trafico_excesivo', 'solicitudes_simultaneas', 'intentos_fallidos_multiples', 'login_ubicacion_desconocida'];
  hs.forEach(h => H('label', '', `<input type="checkbox" value="${h}"> ${h}`, $('#sim-hechos')));
  $('#sim-run').onclick = () => {
    const sel = [...document.querySelectorAll('#sim-hechos input:checked')].map(i => i.value);
    if (!sel.length) { $('#sim-out').textContent = 'Marca al menos un hecho.'; return; }
    const { log } = inferir(sel);
    let t = `<span class="t">Hechos iniciales:</span> ${sel.join(', ')}\n\n`;
    t += log.length ? log.map(l => `<span class="y">${l.r[0]}</span> dispara → ${l.nuevo.startsWith('ACCION') ? '<span class="g">' + l.nuevo + '</span>' : l.nuevo}`).join('\n') : 'Ninguna regla se activó con estos hechos.';
    $('#sim-out').innerHTML = t;
  };
})();

/* ===== 5. Cadenas de inferencia ===== */
(function () {
  const ch = [
    ['Cadena 1: Correo con robo de contraseña', ['correo_sospechoso', 'solicita_credenciales', 'enlace_fraudulento']],
    ['Cadena 2: Infección por malware', ['archivos_sospechosos', 'proceso_desconocido']],
    ['Cadena 3: Cifrado de archivos', ['archivos_cifrados']],
    ['Cadena 4: Saturación de servidores', ['trafico_excesivo', 'solicitudes_simultaneas']],
    ['Cadena 5: Fuerza bruta y acceso desconocido', ['intentos_fallidos_multiples', 'login_ubicacion_desconocida']]
  ];
  ch.forEach(([t, hs]) => {
    const { log } = inferir(hs);
    const c = H('div', 'cadena', `<h4>${t}</h4>`, $('#cadenas'));
    const f = H('div', 'flujo', '', c);
    hs.forEach(h => H('span', 'b h', nombre(h), f));
    log.forEach(l => {
      H('span', 'ar', '↓', f);
      H('span', 'b r', l.r[0], f);
      H('span', 'ar', '→', f);
      H('span', 'b ' + (l.nuevo.startsWith('ACCION') ? 'a' : 'd'), nombre(l.nuevo.replace('ACCION: ', '')), f);
    });
  });
})();

/* ===== 6. Árbol de decisión ===== */
const TREE = {
  N1: ['¿Existen archivos cifrados?', 'N2', 'N5'],
  N2: ['¿Se solicita un pago?', '#Ransomware', 'N3'],
  N3: ['¿Hay procesos o archivos sospechosos?', '#Malware', 'N4'],
  N4: ['¿El cifrado es una política de TI?', '#Cifrado legítimo', '#Revisar integridad de discos y respaldos'],
  N5: ['¿Se detectó tráfico anómalo?', 'N6', 'N8'],
  N6: ['¿Hay miles de solicitudes?', '#Ataque DDoS', 'N7'],
  N7: ['¿Hay un evento legítimo en curso?', '#Tráfico legítimo', '#Analizar red'],
  N8: ['¿Existe correo sospechoso?', 'N9', 'N11'],
  N9: ['¿Solicita credenciales o trae enlace?', 'N10', '#Spam: filtrar y reportar'],
  N10: ['¿El usuario ingresó sus datos?', '#Robo de credenciales', '#Phishing detectado'],
  N11: ['¿Hay múltiples intentos fallidos?', 'N12', 'N13'],
  N12: ['¿Provienen de la misma IP?', '#Fuerza bruta', '#Password spraying'],
  N13: ['¿Inicio de sesión desde ubicación desconocida?', 'N14', 'N16'],
  N14: ['¿El usuario reconoce el acceso?', '#Acceso legítimo', 'N15'],
  N15: ['¿Hay actividad anómala posterior?', '#Cuenta comprometida', '#Forzar cambio de contraseña y MFA'],
  N16: ['¿Hay archivos sospechosos?', '#Malware', '#Revisar otras amenazas']
};
(function () {
  const svg = $('#svg-arbol'), DX = 135, DY = 105, pos = {}; let leaf = 0, maxD = 0;
  const lay = (id, d) => {
    maxD = Math.max(maxD, d);
    if (id[0] === '#') { const x = leaf++ * DX + 70; return { x, y: d * DY + 40, hoja: true, t: id.slice(1) }; }
    const [q, s, n] = TREE[id], a = lay(s, d + 1), b = lay(n, d + 1);
    return { id, q, x: (a.x + b.x) / 2, y: d * DY + 40, a, b };
  };
  const root = lay('N1', 0);
  const w = leaf * DX + 20, h = (maxD + 1) * DY + 30;
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`); svg.style.width = w + 'px'; svg.style.minWidth = '100%'; svg.style.maxHeight = 'none';
  const draw = n => {
    if (n.hoja) return;
    [[n.a, '#10b981', 'Sí'], [n.b, '#ef4444', 'No']].forEach(([c, col, l]) => {
      S('line', { x1: n.x, y1: n.y + 24, x2: c.x, y2: c.y - (c.hoja ? 16 : 24), stroke: col, 'stroke-width': 1.6 }, svg);
      S('text', { x: (n.x + c.x) / 2 + (l === 'Sí' ? -10 : 10), y: (n.y + c.y) / 2, fill: col, 'font-size': 11, 'font-weight': 700, 'text-anchor': 'middle' }, svg, l);
      draw(c);
    });
    S('rect', { x: n.x - 62, y: n.y - 24, width: 124, height: 48, rx: 8, fill: '#0f1c33', stroke: '#22d3ee', 'stroke-width': 1.6 }, svg);
    wrap(n.q, 20).forEach((ln, i, arr) => S('text', { x: n.x, y: n.y - 4 + i * 11 - (arr.length - 1) * 5, fill: '#fff', 'font-size': 9, 'text-anchor': 'middle' }, svg, ln));
    S('text', { x: n.x - 58, y: n.y - 27, fill: '#22d3ee', 'font-size': 9, 'font-weight': 700 }, svg, '[' + n.id + ']');
  };
  const hojas = n => {
    if (n.hoja) {
      S('rect', { x: n.x - 58, y: n.y - 16, width: 116, height: 32, rx: 6, fill: '#3b0f5c', stroke: '#a855f7' }, svg);
      wrap(n.t, 20).forEach((ln, i, arr) => S('text', { x: n.x, y: n.y + 3 + i * 10 - (arr.length - 1) * 5, fill: '#fff', 'font-size': 9, 'text-anchor': 'middle' }, svg, ln));
    } else { hojas(n.a); hojas(n.b); }
  };
  draw(root); hojas(root);
  Object.keys(TREE).forEach(k => H('span', '', `<b>[${k}]</b>${TREE[k][0]}`, $('#inv-nodos')));
})();

/* ===== 7. Conocimiento no-monótono ===== */
(function () {
  const ex = [
    ['Tráfico elevado vs evento en vivo', 'Si existe tráfico elevado → hay ataque DDoS.', 'La empresa transmite un evento internacional en vivo.', 'Miles de espectadores legítimos generan picos de tráfico normales.', 'Ataque DDoS', 'El tráfico elevado puede ser legítimo; monitorear origen y patrón.'],
    ['Intentos fallidos vs empleado olvidadizo', 'Si hay múltiples intentos fallidos → ataque de fuerza bruta.', 'Todos los intentos vienen de una misma IP interna y de un usuario que acaba de cambiar su contraseña.', 'Es un error humano, no un ataque automatizado.', 'Fuerza bruta', 'Error de usuario; ofrecer restablecimiento de contraseña.'],
    ['Ubicación desconocida vs viaje autorizado', 'Si el login viene de ubicación desconocida → cuenta comprometida.', 'El empleado avisó de un viaje y entró por la VPN corporativa con MFA.', 'El acceso está autorizado y verificado con segundo factor.', 'Cuenta comprometida', 'Acceso legítimo; registrar y no bloquear.'],
    ['Cifrado vs política de TI', 'Si hay archivos cifrados → ransomware.', 'TI activó el cifrado de disco corporativo y no hay nota de rescate.', 'El cifrado fue una medida de protección planificada.', 'Ransomware', 'Cifrado autorizado; validar con el área de TI.'],
    ['Correo sospechoso vs simulacro', 'Si hay correo con enlace sospechoso → phishing.', 'El correo viene del simulacro interno de concientización del equipo de seguridad.', 'El enlace pertenece a una plataforma de capacitación aprobada.', 'Phishing real', 'Simulacro de phishing; registrar quién interactuó.']
  ];
  ex.forEach((e, i) => H('div', 'mini', `<h4>Excepción ${i + 1}: ${e[0]} <span class="tag">Retractación</span></h4>
    <p><b>Regla general:</b> ${e[1]}</p><p><b>Nueva información:</b> ${e[2]}</p><p><b>Justificación:</b> ${e[3]}</p>
    <p class="mal">✕ Retractada: ${e[4]}</p><p class="ok">✓ Nueva conclusión: ${e[5]}</p>`, $('#excepciones')));
})();

/* ===== 8. Razonamiento probabilístico ===== */
(function () {
  const P = { correo: ['Correo sospechoso', .85], cifrados: ['Archivos cifrados', .95], acceso: ['Acceso no autorizado', .80], trafico: ['Tráfico anómalo', .75], intentos: ['Múltiples intentos fallidos', .70] };
  Object.values(P).forEach(p => H('tr', '', `<td>${p[0]}</td><td class="m">${p[1].toFixed(2)}</td>`, $('#tabla-prob tbody')));
  const SUP = { 'Phishing': ['correo'], 'Ransomware': ['cifrados', 'acceso'], 'Ataque DDoS': ['trafico'], 'Fuerza bruta': ['intentos', 'acceso'], 'Robo de credenciales': ['acceso', 'correo', 'intentos'] };
  const comb = ev => { let a = P[ev[0]][1]; const pasos = [a.toFixed(4)]; ev.slice(1).forEach(k => { a = a + P[k][1] * (1 - a); pasos.push(a.toFixed(4)); }); return { cf: a, pasos }; };
  const caja = $('#prob-casos');
  caja.parentNode.insertBefore(H('p', 'nota', '<b>Cómo decide el sistema:</b> para cada caso toma las evidencias observadas, combina las que apoyan a cada amenaza y elige la de mayor certeza. Apoyos: ' + Object.entries(SUP).map(([n, e]) => `${n} (${e.map(k => P[k][0].toLowerCase()).join(', ')})`).join('; ') + '.'), caja);
  const casos = [
    ['Caso 1: Correo sospechoso y acceso indebido', ['correo', 'acceso']],
    ['Caso 2: Archivos cifrados y acceso indebido', ['cifrados', 'acceso']],
    ['Caso 3: Tráfico anómalo e intentos fallidos', ['trafico', 'intentos']],
    ['Caso 4: Cifrado, tráfico e intentos fallidos', ['cifrados', 'trafico', 'intentos']],
    ['Caso 5: Correo, acceso indebido e intentos fallidos', ['correo', 'acceso', 'intentos']]
  ];
  casos.forEach(([t, obs]) => {
    const r = Object.entries(SUP).map(([n, ev]) => { const e = ev.filter(k => obs.includes(k)); return e.length ? { n, e, ...comb(e) } : null; })
      .filter(Boolean).sort((a, b) => b.cf - a.cf);
    const lines = r.map(x => `<p class="f">${x.n}: ${x.e.map(k => P[k][0] + ' (' + P[k][1].toFixed(2) + ')').join(' + ')}\nCF = ${x.pasos.join(' → ')} = ${pct(x.cf)}</p>`).join('');
    H('div', 'mini', `<h4>${t}</h4><p>Evidencias: ${obs.map(k => P[k][0]).join(', ')}.</p>${lines}<p class="ok">Amenaza más probable: ${r[0].n} (${pct(r[0].cf)}).</p>`, caja);
  });
})();

/* ===== 9. Teorema de Bayes ===== */
(function () {
  const C = [
    ['Caso 1. Phishing', 'Phishing', 'CorreoSospechoso', .20, .90, .35],
    ['Caso 2. Ransomware', 'Ransomware', 'ArchivosCifrados', .10, .95, .20],
    ['Caso 3. Ataque DDoS', 'DDoS', 'TraficoAnomalo', .15, .90, .30],
    ['Caso 4. Fuerza bruta', 'FuerzaBruta', 'IntentosFallidos', .12, .85, .25],
    ['Caso 5. Cuenta comprometida', 'CuentaComprometida', 'AccesoNoAutorizado', .08, .95, .18]
  ];
  C.forEach(([t, h, e, ph, peh, pe]) => {
    const num = peh * ph, post = num / pe;
    H('div', 'mini', `<h4>${t}</h4><p class="f">P(${h}) = ${ph}\nP(${e}|${h}) = ${peh}\nP(${e}) = ${pe}</p>
      <p class="f">P(${h}|${e}) = (${peh} · ${ph}) / ${pe}\n= ${num.toFixed(4)} / ${pe} = ${post.toFixed(4)}</p>
      <p class="ok">Resultado: ${pct(post)}</p><p>La evidencia multiplica la probabilidad inicial de ${pct(ph)} por ${(post / ph).toFixed(2)}.</p>`, $('#bayes-casos'));
  });
  const calc = () => {
    const h = +$('#b-h').value, eh = +$('#b-eh').value, e = +$('#b-e').value;
    if (!(e > 0) || h < 0 || eh < 0) { $('#b-out').textContent = 'P(E) debe ser mayor que 0.'; return; }
    const r = eh * h / e;
    $('#b-out').innerHTML = `P(H|E) = (${eh} · ${h}) / ${e} = <span class="g">${r.toFixed(4)} (${pct(r)})</span>` + (r > 1 ? '\n<span class="y">Aviso: resultado mayor a 1; revisa que P(E) sea coherente con P(E|H)·P(H).</span>' : '');
  };
  ['#b-h', '#b-eh', '#b-e'].forEach(s => $(s).addEventListener('input', calc));
  calc();
})();
