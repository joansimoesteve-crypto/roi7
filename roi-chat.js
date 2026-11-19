/* Roi · una sola conversación para valorar, charlar y pedir opinión. Se abre con cualquier elemento [data-roi-open]. */
(function () {
  'use strict';
  var FE = ['Enfado', 'Decepción', 'Indiferencia', 'Bienestar', 'Entusiasmo'];
  var SEG = {
    ciudades: { hi: 'Soy Roi. Tu ciudad te escucha: dime qué quieres contar o elige una opción.', ask: 'Pide opinión a tus vecinos' },
    empresas: { hi: 'Soy Roi. Dime cómo se sienten tus clientes… o cuéntame tú qué te ha parecido algo.', ask: 'Pide opinión a tus clientes' },
    universidades: { hi: 'Soy Roi. Aulas, biblioteca, cafetería: cuéntame cómo te sientes en el campus.', ask: 'Pide opinión a tu comunidad' }
  };
  var S = { pos: null, spot: null, mood: null, wait: '', after: '', seg: 'ciudades', open: false, cands: [] };
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var km = function (a, b, c, d) { var R = 6371e3, r = function (x) { return x * Math.PI / 180; }, h = Math.pow(Math.sin(r(c - a) / 2), 2) + Math.cos(r(a)) * Math.cos(r(c)) * Math.pow(Math.sin(r(d - b) / 2), 2); return 2 * R * Math.asin(Math.sqrt(h)); };
  var inPoly = function (pt, sh) { var c = false; for (var i = 0, j = sh.length - 1; i < sh.length; j = i++) { var yi = sh[i][0], xi = sh[i][1], yj = sh[j][0], xj = sh[j][1]; if ((xi > pt[1]) !== (xj > pt[1]) && pt[0] < (yj - yi) * (pt[1] - xi) / (xj - xi) + yi) c = !c; } return c; };
  var hasG = function (p) { return p.lat != null && p.lng != null; };
  var inside = function (p, q) { return hasG(p) && (Array.isArray(p.shape) && p.shape.length >= 3 ? inPoly(q, p.shape) : km(q[0], q[1], p.lat, p.lng) <= (p.radius_m || 120)); };
  /* Nombres válidos: nada de "16", "3B" o solo signos. Una dirección con calle ("Calle Mayor 16") sí vale. */
  var okName = function (n) { n = String(n || '').trim(); return n.length >= 3 && n.length <= 80 && (n.match(/[A-Za-zÀ-ÿ]/g) || []).length >= 3 && !/^[\d\s.,ºª\-\/]+[A-Za-z]?$/.test(n); };
  function anon() { try { var a = localStorage.getItem('roi_anon'); if (!a) { a = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random()); localStorage.setItem('roi_anon', a); } return a; } catch (e) { return 'n-' + Date.now(); } }
  function seg() { var h = (location.hash || '').slice(1); if (SEG[h]) return h; try { var s = sessionStorage.getItem('roi_seg'); if (SEG[s]) return s; } catch (e) { } return 'ciudades'; }

  var css = '#rc{position:fixed;inset:0;z-index:9999;display:none;align-items:flex-end;justify-content:center;background:rgba(38,51,31,.55);font:16px/1.45 "Bricolage Grotesque",system-ui,sans-serif;color:#26331f}#rc.on{display:flex}' +
    '#rc .pn{background:#fbf7ec;width:100%;max-width:560px;height:min(92dvh,760px);border-radius:22px 22px 0 0;display:flex;flex-direction:column;box-shadow:0 -10px 50px rgba(0,0,0,.3);overflow:hidden}' +
    '@media(min-width:640px){#rc{align-items:center}#rc .pn{border-radius:22px;height:min(86vh,720px)}}' +
    '#rc .hd{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid #cfd6c2;background:#fff}#rc .hd img{width:40px;height:40px;border-radius:50%;background:#e9efdc}#rc .hd b{font-size:18px}#rc .hd small{display:block;color:#4d5c43;font-size:13px}#rc .hd button{margin-left:auto;border:0;background:#e9efdc;border-radius:50%;width:38px;height:38px;font-size:20px;cursor:pointer;color:#26331f}' +
    '#rc .ms{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}' +
    '#rc .b{max-width:88%;padding:10px 14px;border-radius:6px 18px 18px 18px;background:#e9efdc;color:#26331f;font-size:16px;animation:rcin .25s ease both}#rc .b b{color:#3f5a3a}#rc .u{align-self:flex-end;background:#3f5a3a;color:#fff;border-radius:18px 6px 18px 18px}' +
    '@keyframes rcin{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}@media(prefers-reduced-motion:reduce){#rc .b{animation:none}}' +
    '#rc .fa{display:flex;gap:8px;flex-wrap:wrap}#rc .fa button{border:2px solid #cfd6c2;background:#fff;border-radius:16px;padding:6px;cursor:pointer;line-height:0}#rc .fa button:hover,#rc .fa button:focus-visible{border-color:#3f5a3a;transform:translateY(-2px)}' +
    '#rc .ch{display:flex;gap:8px;flex-wrap:wrap}#rc .ch button,#rc .ch a{border:2px solid #3f5a3a;background:#fff;color:#26331f;border-radius:999px;padding:8px 14px;font:inherit;font-weight:600;font-size:15px;cursor:pointer;text-decoration:none}#rc .ch .p{background:#3f5a3a;color:#fff}#rc .ch button:hover,#rc .ch a:hover{background:#e9efdc}#rc .ch .p:hover{background:#2f4a2b}' +
    '#rc .mp{height:230px;border-radius:14px;overflow:hidden;border:1px solid #cfd6c2;width:100%}' +
    '#rc textarea.c{width:100%;min-height:70px;border:2px solid #cfd6c2;border-radius:12px;padding:8px;font:inherit}' +
    '#rc form{display:flex;gap:8px;padding:10px 12px;border-top:1px solid #cfd6c2;background:#fff}#rc form input{flex:1;min-width:0;border:2px solid #cfd6c2;border-radius:999px;padding:10px 16px;font:inherit;font-size:16px}#rc form input:focus{outline:none;border-color:#3f5a3a}#rc form button{border:0;background:#3f5a3a;color:#fff;border-radius:999px;padding:0 18px;font:inherit;font-weight:700;cursor:pointer}' +
    '#rc .h{font-size:13px;color:#4d5c43}.rcb{display:block;margin:14px 0 0}.rcb a,.rcb button{cursor:pointer}' +
    '.rcbig{display:inline-flex;align-items:center;gap:10px;font:inherit;font-size:20px;font-weight:800;color:#fff;background:linear-gradient(#4f7448,#3a5a35);border:0;border-bottom:5px solid #26331f;border-radius:18px;padding:16px 28px;cursor:pointer;box-shadow:0 8px 22px rgba(63,90,58,.35);animation:rcp 2.4s ease-in-out infinite}.rcbig:active{transform:translateY(3px);border-bottom-width:2px}@keyframes rcp{50%{box-shadow:0 8px 34px rgba(63,90,58,.6)}}@media(prefers-reduced-motion:reduce){.rcbig{animation:none}}' +
    '.rcseg{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:0 0 14px}.rcseg button{font:inherit;font-weight:700;font-size:14px;border:2px solid #cfd6c2;background:#fff;color:#26331f;border-radius:999px;padding:6px 14px;cursor:pointer}.rcseg button[aria-pressed=true]{background:#3f5a3a;border-color:#3f5a3a;color:#fff}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var root = document.createElement('div'); root.id = 'rc'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Conversación con Roi');
  root.innerHTML = '<div class="pn"><div class="hd"><img src="/roi.png" alt=""><div><b>Roi</b><small>Tu asistente · sin cuentas</small></div><button type="button" id="rcx" aria-label="Cerrar">×</button></div><div class="ms" id="rcm" aria-live="polite"></div><form id="rcf" autocomplete="off"><input id="rci" maxlength="240" placeholder="Escribe el sitio…" aria-label="Escribe a Roi"><button type="submit">Enviar</button></form></div>';
  document.body.appendChild(root);
  var M = $('rcm');
  function put(el) { M.appendChild(el); M.scrollTop = M.scrollHeight; return el; }
  function bot(html) { var d = document.createElement('div'); d.className = 'b'; d.innerHTML = html; return put(d); }
  function me(t) { var d = document.createElement('div'); d.className = 'b u'; d.textContent = t; put(d); }
  function chips(list) { var d = document.createElement('div'); d.className = 'ch'; list.forEach(function (c) { var e = document.createElement(c.href ? 'a' : 'button'); if (c.href) e.href = c.href; else e.type = 'button'; e.textContent = c.t; if (c.p) e.className = 'p'; if (c.f) e.onclick = function () { me(c.t.replace(/^[^\wÁ-ú]+/, '')); lock(d); c.f(); }; d.appendChild(e); }); return put(d); }
  function lock(d) { d.querySelectorAll('button,a').forEach(function (b) { b.disabled = true; b.style.opacity = '.45'; }); }
  function faces() { var d = document.createElement('div'); d.className = 'fa'; for (var i = 0; i < 5; i++) { (function (i) { var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', FE[i]); b.innerHTML = window.ROI_FACE ? window.ROI_FACE(i, 44) : FE[i]; b.onclick = function () { S.mood = i; d.querySelectorAll('button').forEach(function (x) { x.disabled = true; x.style.opacity = x === b ? '1' : '.35'; }); comment(); }; d.appendChild(b); })(i); } return put(d); }

  /* ---- menú principal ---- */
  function menu(first) {
    S.wait = 'place'; S.after = 'rate';
    if (first) { bot('Hola 👋 Soy Roi. Te hago <b>una pregunta rápida</b> ' + (window.ROI_SEG === 'enterprise' ? 'sobre tu día a día en el trabajo.' : 'sobre tu ciudad.')); }
    bot(window.ROI_SEG === 'enterprise' ? (first ? '¿Dónde estás? (oficina, tienda, sala…)' : '¿Dónde estás ahora?') : (first ? '¿Dónde estás ahora mismo?' : '¿Dónde estás ahora?'));
    chips([{ t: '📍 Aquí, donde estoy', p: 1, f: function () { S.wait = ''; here(); } }]);
    if (first) bot('<span class="h">O escríbeme el sitio: un parque, la biblioteca, una calle…</span>');
    setIn('Escribe el sitio…');
  }
  function setIn(ph) { try { $('rci').placeholder = ph; } catch (e) { } }
  function webProj() { bot('¿Qué quieres valorar?'); chips([{ t: '🌐 Una web', f: function () { S.wait = 'web'; bot('Escribe la dirección (por ejemplo <b>miweb.com</b>).'); focusIn(); } }, { t: '💡 Un proyecto', f: function () { go('/mapa?k=project'); } }]); }
  function askOpinion() { var sg = SEG[S.seg]; bot('Perfecto. Crea un <b>enlace y un QR</b> para que la gente te valore desde el móvil, sin instalar nada.'); chips([{ t: '🔗 Crear mi enlace y QR', p: 1, f: function () { close(); jump('#pide'); } }, { t: '📊 Ver el panel de ejemplo', f: function () { go('/panel?demo=' + (S.seg === 'empresas' ? 'empresa' : S.seg === 'universidades' ? 'universidad' : 'ayuntamiento')); } }]); }
  function go(u) { bot('Te llevo ahí…'); setTimeout(function () { location.href = u; }, 350); }
  function jump(h) { setTimeout(function () { var e = document.querySelector(h); if (e) e.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150); }
  function focusIn() { try { $('rci').focus(); } catch (e) { } }

  /* ---- ubicación ---- */
  function getPos() {
    return new Promise(function (ok, no) {
      if (!navigator.geolocation) return no('nogeo');
      var web = /FBAN|FBAV|Instagram|WhatsApp|Snapchat|TikTok|LinkedInApp/i.test(navigator.userAgent), low = false;
      var fail = function (e) { if (e && e.code === 1) return no(web ? 'inapp' : 'blocked'); if (!low) { low = true; navigator.geolocation.getCurrentPosition(good, fail, { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 }); } else no('fail'); };
      var good = function (p) { ok([p.coords.latitude, p.coords.longitude]); };
      navigator.geolocation.getCurrentPosition(good, fail, { enableHighAccuracy: true, timeout: 9000, maximumAge: 30000 });
    });
  }
  function here() {
    var w = bot('Buscando dónde estás… 📍');
    var done = function () { w.remove(); };
    if (S.pos) { done(); return choose(S.pos); }
    getPos().then(function (p) { S.pos = p; done(); choose(p); }, function (why) {
      done();
      var m = why === 'inapp' ? 'Este navegador integrado no deja usar la ubicación (ábrelo en Safari o Chrome).' : why === 'blocked' ? 'Tienes la ubicación bloqueada para esta página.' : 'No he podido ver tu ubicación.';
      bot(m + ' Sin problema: <b>márcalo en el mapa</b> o búscalo por nombre.'); chips([{ t: '🗺️ Elegir en el mapa', p: 1, f: pickMap }, { t: '🔎 Buscar por nombre', f: function () { S.wait = 'place'; bot('Escribe el nombre del sitio.'); focusIn(); } }]);
    });
  }
  var PLC = null;
  function registered() { if (PLC) return Promise.resolve(PLC); return fetch('/api/public?places=1').then(function (r) { return r.json(); }).then(function (j) { PLC = ((j && j.places) || []).filter(function (p) { return p.kind === 'place' && okName(p.name); }); return PLC; }).catch(function () { PLC = []; return PLC; }); }
  function osm(c, r) { return fetch('/api/search?near=1&lat=' + c[0].toFixed(4) + '&lng=' + c[1].toFixed(4) + '&r=' + r + '&lim=40').then(function (s) { return s.ok ? s.json() : { elements: [] }; }).then(function (j) { return (j.elements || []).map(function (e) { var t = e.tags || {}, la = e.lat != null ? e.lat : e.center && e.center.lat, lo = e.lon != null ? e.lon : e.center && e.center.lon; return { name: t.name, lat: la, lng: lo, verified: false }; }); }).catch(function () { return []; }); }
  function candidates(c) {
    return Promise.all([registered(), osm(c, 350)]).then(function (a) {
      var reg = a[0], out = [], seen = {}, add = function (p, v, d) { var k = String(p.name).toLowerCase(); if (!okName(p.name) || seen[k] || p.lat == null) return; seen[k] = 1; out.push({ name: p.name, lat: p.lat, lng: p.lng, verified: v, d: d != null ? d : km(c[0], c[1], p.lat, p.lng) }); };
      reg.filter(function (p) { return inside(p, c); }).forEach(function (p) { add(p, true, 0); });
      reg.filter(hasG).map(function (p) { return { p: p, d: km(c[0], c[1], p.lat, p.lng) }; }).filter(function (x) { return x.d < 400; }).sort(function (x, y) { return x.d - y.d; }).forEach(function (x) { add(x.p, false, x.d); });
      a[1].sort(function (x, y) { return km(c[0], c[1], x.lat, x.lng) - km(c[0], c[1], y.lat, y.lng); }).forEach(function (p) { add(p, false); });
      out.sort(function (x, y) { return (x.verified ? 0 : 1) - (y.verified ? 0 : 1) || x.d - y.d; });
      return out.slice(0, 5);
    });
  }
  function choose(c) {
    var w = bot('Mirando qué hay cerca…');
    candidates(c).then(function (list) {
      w.remove(); S.cands = list;
      if (!list.length) return fallbackName(c);
      var f = list[0];
      bot('Estás cerca de <b>' + esc(f.name) + '</b>. ¿Es aquí?');
      chips([{ t: 'Sí, aquí', p: 1, f: function () { pick(f, c); } }, { t: 'No, otro sitio', f: function () { others(list.slice(1), c); } }]);
    });
  }
  function others(list, c) {
    bot(list.length ? '¿Cuál es entonces? Toca uno, escríbelo o márcalo en el mapa.' : 'Vale. Escríbeme el sitio o márcalo en el mapa.');
    var cs = list.slice(0, 4).map(function (p) { return { t: p.name, f: function () { pick(p, c); } }; });
    cs.push({ t: '🗺️ Mapa', f: function () { pickMap(c); } }); chips(cs); S.wait = 'place'; setIn('Escribe el sitio…');
  }
  function fallbackName(c) {
    fetch('/api/search?rev=' + c[0] + ',' + c[1]).then(function (r) { return r.json(); }).then(function (j) {
      var n = j.place && j.place.name, s = j.place && j.place.sub;
      if (n && !okName(n) && s) n = String(s).split(',')[0] + ' ' + n; /* "16" → "Calle X 16" */
      if (okName(n)) { bot('Estás en <b>' + esc(n) + '</b>. ¿Valoramos este punto?'); chips([{ t: '✔ Sí, aquí', p: 1, f: function () { pick({ name: n, lat: c[0], lng: c[1], verified: false }, c); } }, { t: '🗺️ Elegir otro en el mapa', f: function () { pickMap(c); } }, { t: '🔎 Buscar por nombre', f: function () { S.wait = 'place'; bot('Escribe el nombre del sitio.'); focusIn(); } }]); }
      else { bot('No encuentro un nombre claro aquí. <b>Márcalo en el mapa</b> o escríbeme cómo se llama.'); chips([{ t: '🗺️ Elegir en el mapa', p: 1, f: function () { pickMap(c); } }, { t: '🔎 Buscar por nombre', f: function () { S.wait = 'place'; bot('Escribe el nombre del sitio.'); focusIn(); } }]); }
    }).catch(function () { bot('No he podido ver el sitio. Márcalo en el mapa.'); chips([{ t: '🗺️ Elegir en el mapa', p: 1, f: function () { pickMap(c); } }]); });
  }
  function pick(p, c) {
    S.wait = '';
    S.spot = { name: p.name, verified: !!p.verified }; S.pos = [p.lat != null ? p.lat : c[0], p.lng != null ? p.lng : c[1]];
    if (S.after === 'talk') { bot('Genial. Te abro la sala de <b>' + esc(p.name) + '</b> para hablar con quien esté valorándolo.'); return chips([{ t: '💬 Entrar a la sala', p: 1, href: '/sala?t=place&n=' + encodeURIComponent(p.name) }, { t: '✍️ Valorar antes', f: function () { S.after = 'rate'; ask(); } }]); }
    ask();
  }
  function ask() { S.wait = ''; bot('¿Cómo te sientes en <b>' + esc(S.spot.name) + '</b>?'); faces(); setIn('Escribe a Roi…'); }
  function comment() {
    var low = S.mood <= 1, hi = S.mood >= 3;
    bot((low ? 'Gracias por decirlo. ' : hi ? 'Me alegra 😊 ' : 'Gracias. ') + (low ? '¿Qué <b>cambiarías</b> aquí?' : hi ? '¿Qué es lo <b>mejor</b> de este sitio?' : '¿Qué <b>mejorarías</b>?') + ' <span class="h">Escríbelo abajo · no es público</span>');
    S.wait = 'comment'; setIn('Tu comentario (opcional)…'); focusIn();
    chips([{ t: 'Prefiero no decir nada', f: function () { S.wait = ''; send(''); } }]);
  }
  function send(c) {
    var s = S.spot, body = { client_id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), anon_id: anon(), source: 'map', type: 'place', subject: s.name, site: null, url: null, rating: S.mood + 1, feeling: FE[S.mood], comment: c || null, place_name: s.name, location: null, lat: S.pos[0], lng: S.pos[1], place_verified: s.verified, lang: 'es', created_at: new Date().toISOString(), website: '' };
    try { localStorage.setItem('roi_mood', String(S.mood)); } catch (e) { }
    var tries = 0, run = function () { fetch('/api/ratings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(function (r) { if (!r.ok) throw 0; fin(); }).catch(function () { if (++tries < 2) setTimeout(run, 1200); else { bot('No he podido guardar tu opinión. Revisa la conexión.'); chips([{ t: 'Reintentar', p: 1, f: function () { tries = 0; run(); } }]); } }); };
    run();
  }
  function fin() { S.wait = ''; setIn('Escribe a Roi…'); bot('<b>Hecho.</b> Tu ayuntamiento lo verá en su resumen semanal 💚'); chips([{ t: '✍️ Valorar otro sitio', p: 1, f: function () { menu(false); } }, { t: '💬 Hablar con quien esté aquí', href: '/sala?t=place&n=' + encodeURIComponent(S.spot.name) }]); }

  /* ---- mapa para marcar el punto ---- */
  function pickMap(c) {
    if (!window.L) { bot('Te llevo al mapa completo.'); return chips([{ t: 'Abrir el mapa', p: 1, href: '/mapa' }]); }
    bot('Toca en el mapa <b>dónde estás</b> (o el sitio que quieres valorar).');
    var d = document.createElement('div'); d.className = 'mp'; put(d);
    var start = c || S.pos || [39.4699, -0.3774], m = L.map(d, { zoomControl: true }).setView(start, c || S.pos ? 17 : 13), mk = null;
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(m);
    setTimeout(function () { m.invalidateSize(); }, 250);
    var box = null;
    m.on('click', function (e) {
      var p = [e.latlng.lat, e.latlng.lng]; if (mk) mk.setLatLng(e.latlng); else mk = L.marker(e.latlng).addTo(m);
      if (box) box.remove(); box = bot('Mirando ese punto…');
      candidates(p).then(function (list) {
        box.remove(); var cs = list.slice(0, 4).map(function (x, i) { return { t: x.name, p: !i, f: function () { pick(x, p); } }; });
        if (!list.length) { fetch('/api/search?rev=' + p[0] + ',' + p[1]).then(function (r) { return r.json(); }).then(function (j) { var n = j.place && j.place.name, s = j.place && j.place.sub; if (n && !okName(n) && s) n = String(s).split(',')[0] + ' ' + n; if (okName(n)) { box = bot('Ese punto es <b>' + esc(n) + '</b>.'); chips([{ t: '✔ Valorar aquí', p: 1, f: function () { pick({ name: n, lat: p[0], lng: p[1], verified: false }, p); } }]); } else box = bot('Ahí no veo ningún sitio con nombre. Prueba a tocar más cerca de un local o parque.'); }).catch(function () { box = bot('No he podido ver ese punto.'); }); return; }
        box = bot('Ahí hay… elige:'); chips(cs);
      });
    });
  }

  /* ---- texto libre ---- */
  function searchName(q) {
    var w = bot('Buscando “' + esc(q) + '”…'), u = '/api/search?t=place&q=' + encodeURIComponent(q) + (S.pos ? '&lat=' + S.pos[0] + '&lng=' + S.pos[1] : '');
    fetch(u).then(function (r) { return r.json(); }).then(function (j) {
      w.remove(); var rs = (j.results || []).filter(function (r) { return okName(r.name) && r.lat != null; }).slice(0, 5);
      if (!rs.length) { bot('No lo encuentro. Prueba con otro nombre o <b>márcalo en el mapa</b>.'); return chips([{ t: '🗺️ Elegir en el mapa', p: 1, f: function () { pickMap(); } }]); }
      bot('¿Cuál es?'); chips(rs.map(function (r, i) { return { t: r.name + (r.sub ? ' · ' + String(r.sub).split(',')[0] : ''), p: !i, f: function () { pick({ name: r.name, lat: r.lat, lng: r.lng, verified: false }, [r.lat, r.lng]); } }; }));
    }).catch(function () { w.remove(); bot('No he podido buscar ahora. Inténtalo otra vez o usa el mapa.'); });
  }
  function toWeb(q) { var d = String(q || '').trim(); if (!d) return; if (!/^https?:\/\//i.test(d)) d = 'https://' + d.replace(/^\/+/, ''); go('/v?t=web&u=' + encodeURIComponent(d)); }
  function understand(text) {
    var w = bot('…');
    fetch('/api/near', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ anon_id: anon(), roi: { text: text, ctx: S.seg + (S.spot ? ' · ' + S.spot.name : '') } }) }).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) {
      w.remove(); if (j.reply && j.intent !== 'other') bot(esc(j.reply));
      var i = j.intent;
      if (i === 'rate_here') { S.after = 'rate'; here(); }
      else if (i === 'rate_place') { S.after = 'rate'; j.query && okName(j.query) ? searchName(j.query) : (S.wait = 'place', bot('¿Cómo se llama el sitio?')); }
      else if (i === 'rate_web') { j.query ? toWeb(j.query) : (S.wait = 'web', bot('Escribe la dirección de la web.')); }
      else if (i === 'rate_project') go('/mapa?k=project');
      else if (i === 'talk') { S.after = 'talk'; here(); }
      else if (i === 'ask_opinion') askOpinion();
      else if (i === 'see_opinions') { bot('Aquí tienes lo que opina la gente.'); chips([{ t: '📊 Ver rankings', p: 1, f: function () { close(); jump('#rankings'); } }, { t: '🗺️ Ver el mapa', href: '/mapa' }]); }
      else if (i === 'map') { S.after = 'rate'; pickMap(); }
      else if (text.length <= 60 && !/[?¿]/.test(text)) { S.after = 'rate'; searchName(text); }
      else { if (!j.reply) bot('Te he entendido a medias 🙂'); menu(false); }
    }).catch(function () { w.remove(); bot('Ahora mismo no te he entendido bien.'); menu(false); });
  }
  $('rcf').onsubmit = function (e) {
    e.preventDefault(); var i = $('rci'), t = i.value.trim(); if (!t) return; i.value = ''; me(t);
    if (S.wait === 'comment') { S.wait = ''; return send(t.slice(0, 300)); }
    if (S.wait === 'web') { S.wait = ''; return toWeb(t); }
    if (S.wait === 'place') { S.after = S.after || 'rate'; return searchName(t); }
    understand(t);
  };

  /* ---- abrir / cerrar ---- */
  var started = false;
  function open(o) { S.seg = seg(); root.classList.add('on'); S.open = true; document.body.style.overflow = 'hidden'; var h = document.getElementById('avatar-roi-host'); if (h) h.style.display = 'none'; if (!started) { started = true; menu(true); }
    if (o && o.go === 'here') { me('Aquí, donde estoy'); S.wait = ''; here(); } else if (o && o.text) { me(o.text); understand(o.text); } else setTimeout(focusIn, 300); }
  function close() { root.classList.remove('on'); S.open = false; document.body.style.overflow = ''; var h = document.getElementById('avatar-roi-host'); if (h) h.style.display = ''; }
  $('rcx').onclick = close; root.addEventListener('click', function (e) { if (e.target === root) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && S.open) close(); });
  document.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('[data-roi-open]'); if (t) { e.preventDefault(); open(t.dataset.roiOpen === 'here' ? { go: 'here' } : null); } });
  /* selector Ciudades / Empresas / Universidades */
  window.RoiChat = { open: open, close: close };
  document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('.rcseg button'); if (!b) return; S.seg = b.dataset.s; try { sessionStorage.setItem('roi_seg', S.seg); } catch (x) { } document.querySelectorAll('.rcseg button').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.s === S.seg); }); if (window.RoiSeg) window.RoiSeg(S.seg); });
  if (location.hash === '#roi') setTimeout(open, 400);
})();
