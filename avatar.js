/* Avatar ROI v3 — asistente flotante en formato conversación. Versión web: marcador, código para webs y la propia landing (localStorage). */
(() => {
  if (window.__roi || document.getElementById('avatar-roi-host')) return; window.__roi = 1;
  const cs = document.currentScript;
  const DEFAULT_IMG = 'data:image/jpeg;base64,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';
  const CTX = window.ROI_CONTEXT || (cs && cs.dataset.name ? { name: cs.dataset.name, type: cs.dataset.type || 'web' } : null); // {name, type: place|web|project, url}
  let IMG = (cs && cs.dataset.avatar) || DEFAULT_IMG;
  const isExt = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
  const SRC_ORIGIN = (() => { try { return cs && cs.src ? new URL(cs.src).origin : ''; } catch (e) { return ''; } })();
  const WEB_API = SRC_ORIGIN ? SRC_ORIGIN + '/api/ratings' : '';
  const SOURCE = SRC_ORIGIN && SRC_ORIGIN === location.origin ? 'land' : CTX ? 'embed' : 'bookmarklet';
  const anon = () => { let a = null; try { a = localStorage.getItem('roi_anon'); if (!a) { a = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2); localStorage.setItem('roi_anon', a); } } catch (e) {} return a || 'anon-' + Date.now().toString(36); };
  const payload = r => ({ client_id: r.id, anon_id: anon(), source: SOURCE, type: r.type, subject: r.subject, site: r.site, url: r.url, target_label: r.target ? r.target.label : null, rating: (r.mood | 0) + 1, feeling: r.emotion, comment: r.comment, place_name: r.place ? r.place.name : null, lat: r.place && r.place.lat != null ? r.place.lat : null, lng: r.place && r.place.lng != null ? r.place.lng : null, place_verified: !!(r.place && r.place.verified), lang: 'es', created_at: r.ts });
  const post = async rec => { for (let i = 0; i < 2; i++) { try { const r = await fetch(WEB_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload(rec)) }); if (r.ok || (r.status >= 400 && r.status < 500)) return r.ok; } catch (e) {} await new Promise(s => setTimeout(s, 2500)); } return false; };
  const ask = async msg => {
    if (msg.roi === 'config') return { ok: true, sync: !!WEB_API, shareDefault: false, forceShare: !!CTX };
    if (msg.roi === 'sync' && WEB_API && msg.rec) return { ok: await post(msg.rec) };
    return { ok: false };
  };
  const net = (url, init) => isExt ? ask({ roi: 'fetch', url, init })
    : fetch(url, init).then(async r => ({ ok: r.ok, json: await r.json().catch(() => null) })).catch(() => ({ ok: false }));
  const store = {
    get: async k => isExt ? (await chrome.storage.local.get(k))[k] : JSON.parse(localStorage.getItem(k) || 'null'),
    set: async (k, v) => isExt ? chrome.storage.local.set({ [k]: v }) : localStorage.setItem(k, JSON.stringify(v))
  };
  let CFG = { sync: false, shareDefault: false }; // lo rellena el background (Supabase configurado o no)
  ask({ roi: 'config' }).then(c => { if (c && c.ok) CFG = c; });

  const COL = ['#e8605a', '#f0913a', '#f2d05c', '#8cc35e', '#5fb760'];
  const MOU = ['M33 68Q50 56 67 68', 'M33 66Q50 58 67 66', 'M34 64H66', 'M32 60Q50 76 68 60', 'M30 58Q50 82 70 58'];
  const NAMES = ['Muy insatisfecho', 'Insatisfecho', 'Neutral', 'Satisfecho', 'Muy satisfecho'];
  const FEEL = [
    ['Enfado', 'Frustración', 'Agobio'],
    ['Decepción', 'Desconfianza', 'Estrés'],
    ['Indiferencia', 'Desconexión', 'Calma'],
    ['Confianza', 'Tranquilidad', 'Bienestar'],
    ['Entusiasmo', 'Plenitud', 'Inspiración']
  ];
  const face = i => `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="${COL[i]}"/><circle cx="36" cy="40" r="5" fill="#3a2a1a"/><circle cx="64" cy="40" r="5" fill="#3a2a1a"/>${i === 0 ? '<path d="M26 28L44 34M74 28L56 34" stroke="#3a2a1a" stroke-width="5" stroke-linecap="round"/>' : ''}<path d="${MOU[i]}" stroke="#3a2a1a" stroke-width="6" fill="none" stroke-linecap="round"/></svg>`;

  const css = `
  :host{all:initial}*{box-sizing:border-box}
  .w{position:fixed;right:20px;bottom:20px;font:14px/1.4 system-ui,-apple-system,Segoe UI,sans-serif;color:#26331f;z-index:2147483647}
  button{font:inherit;color:inherit;cursor:pointer;border:0;background:none}
  button:focus-visible,textarea:focus-visible,input:focus-visible{outline:3px solid #3f5a3a;outline-offset:2px}
  .fabw{position:relative;width:78px;margin-left:auto}
  .fab{display:block;width:78px;height:78px;border-radius:50%;background:#e9efdc;border:4px solid #fff;box-shadow:0 10px 28px #3f5a3a66;padding:0;overflow:hidden;touch-action:none;animation:bob 4s ease-in-out infinite;transition:border-color .3s}
  .fab:active{cursor:grabbing}.av{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}
  .badge{display:none;position:absolute;right:-6px;bottom:-4px;width:30px;height:30px;border-radius:50%;background:#fff;padding:2px;box-shadow:0 3px 8px #0003}.badge svg{display:block;width:100%;height:100%}
  @keyframes bob{50%{transform:translateY(-4px)}}
  @keyframes pop{from{opacity:0;transform:translateY(8px) scale(.97)}}
  @keyframes cheer{30%{transform:translateY(-14px) rotate(-6deg)}60%{transform:translateY(0) rotate(5deg)}}
  .cheer .fab{animation:cheer .7s}
  .panel,.hi{display:none;position:absolute;right:0;bottom:94px;background:#fbf7ec;border-radius:20px;box-shadow:0 18px 50px #26331f40}
  .panel{width:320px;max-width:calc(100vw - 32px);animation:pop .22s;overflow:hidden}.open .panel{display:block}
  .hi{width:230px;padding:14px 34px 14px 16px;font-size:15px;animation:pop .3s}.showhi:not(.open) .hi{display:block}
  .x{position:absolute;top:8px;right:10px;font-size:20px;color:#7a866f;line-height:1;padding:4px}
  .hd{display:flex;gap:10px;align-items:center;padding:10px 14px;background:#8DB07A;color:#1b2916;font-weight:800;font-size:22px;letter-spacing:.2px}.hd .av{width:38px;height:38px;border-radius:50%;flex:none;border:2px solid #fff}.hd .x{top:12px;color:#1b2916}
  .chat{max-height:min(340px,55vh);overflow-y:auto;padding:8px 12px 12px;scroll-behavior:smooth}
  .b{max-width:90%;padding:8px 12px;border-radius:16px 16px 16px 4px;margin:6px 0;background:#fff;font-size:13.5px;animation:pop .2s;word-break:break-word}
  .b.me{margin-left:auto;background:#3f5a3a;color:#fff;border-radius:16px 16px 4px 16px}
  .blk{margin:4px 0 10px;animation:pop .2s}.lock{pointer-events:none;opacity:.5}
  .fr{display:flex;justify-content:space-between}.fr button{width:40px;height:40px;padding:0;border-radius:50%;transition:transform .15s}.fr button:hover,.fr .on{transform:scale(1.2)}
  .cap{margin-top:8px;text-align:center;font-size:13px;font-weight:600;color:#3f5a3a;min-height:20px}
  .chips{display:flex;flex-wrap:wrap;gap:6px}.chips button,.opts button{border:1px solid #cfd6c2;border-radius:99px;padding:7px 14px;background:#fff;font-size:13px}.chips button:hover,.opts button:hover{background:#e9efdc;border-color:#3f5a3a}
  .opts{display:flex;flex-direction:column;gap:6px;align-items:flex-start}
  input,textarea{width:100%;padding:9px 10px;border:1px solid #cfd6c2;border-radius:12px;font:inherit;background:#fff;color:#26331f}textarea{height:64px;resize:none}
  input[type=checkbox]{width:18px;height:18px;padding:0;margin:1px 8px 0 0;flex:none;accent-color:#3f5a3a}
  .cons{display:flex;align-items:flex-start;margin-top:8px;font-size:12px;color:#4d5c43;cursor:pointer}
  .send{width:100%;margin-top:8px;padding:10px;border-radius:12px;background:#3f5a3a;color:#fff;font-weight:600}.send:disabled{opacity:.6;cursor:wait}
  .vb{margin-left:auto;margin-right:26px;font-size:16px;padding:4px 8px;border-radius:8px}.vb[aria-pressed=true]{background:#fff;box-shadow:inset 0 0 0 2px #3f5a3a}
  .mic{position:relative}.mic textarea{padding-right:44px}.mb{position:absolute;right:8px;bottom:8px;width:32px;height:32px;border-radius:50%;font-size:17px;background:#e9efdc}.mb[aria-pressed=true]{background:#e8605a;color:#fff}
  .sug{display:flex;flex-direction:column;gap:4px;margin-top:6px}.sug button{text-align:left;padding:7px 10px;background:#fff;border:1px solid #cfd6c2;border-radius:10px;font-size:13px}.sug button:hover{background:#e9efdc}.sug small{display:block;color:#5b6a50}
  @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}`;

  const host = document.createElement('div'); host.id = 'avatar-roi-host';
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = `<style>${css}</style><div class="w" id="w">
    <div class="hi">¡Hola! 👋<br>${CTX ? '¿Cómo ha sido tu experiencia?' : '¿Qué quieres valorar hoy?'}<button class="x" aria-label="Cerrar" id="hx">×</button></div>
    <div class="panel" role="dialog" aria-label="Avatar Roi"><div class="hd"><img class="av" alt="">Roi<button class="vb" id="vb" aria-pressed="true" aria-label="Voz de Roi" title="Voz de Roi">🔊</button><button class="x" id="cl" aria-label="Cerrar">×</button></div><div class="chat" aria-live="polite"></div></div>
    <div class="fabw"><button class="fab" aria-label="Abrir Avatar Roi"><img class="av" alt=""></button><span class="badge"></span></div></div>`;
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const w = $('#w'), fab = $('.fab'), chat = $('.chat'), badge = $('.badge');
  const setImg = u => { IMG = u; $$('.av').forEach(i => i.src = u); };
  setImg(IMG);
  const rb = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--roi-bottom')); if (rb) w.style.bottom = rb + 'px';

  /* Voz: activada por defecto; se lee el saludo al abrir a Roi con un toque */
  let VOICE = true, greeted = false, greeting = '';
  const speak = t => {
    if (!VOICE || !window.speechSynthesis) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t.replace(/[\u{1F300}-\u{1FAFF}☀-➿]/gu, '').replace(/\s+/g, ' ').trim());
    u.lang = 'es-ES'; speechSynthesis.speak(u);
  };
  const toggle = o => {
    const open = w.classList.toggle('open', o); w.classList.remove('showhi');
    if (open && !greeted) { greeted = true; speak(greeting); }
  };

  /* Arrastrar / abrir */
  let drag = null;
  fab.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, r: parseFloat(w.style.right) || 20, b: parseFloat(w.style.bottom) || 20, moved: false }; fab.setPointerCapture(e.pointerId); });
  fab.addEventListener('pointermove', e => {
    if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 5) drag.moved = true;
    if (drag.moved) { w.style.right = Math.max(8, drag.r - dx) + 'px'; w.style.bottom = Math.max(8, drag.b - dy) + 'px'; }
  });
  fab.addEventListener('pointerup', () => { if (drag && !drag.moved) toggle(); drag = null; });
  fab.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  $('#cl').onclick = () => { toggle(false); if (window.speechSynthesis) speechSynthesis.cancel(); }; $('#hx').onclick = () => w.classList.remove('showhi');
  setTimeout(() => { if (!w.classList.contains('open')) w.classList.add('showhi'); }, 2500);
  setTimeout(() => w.classList.remove('showhi'), 9000);

  /* Conversación */
  const S = {};
  const add = (cls, html) => { const d = document.createElement('div'); d.className = cls; if (html != null) d.innerHTML = html; chat.append(d); chat.scrollTop = chat.scrollHeight; return d; };
  const bot = t => { add('b').textContent = t; speak(t); };
  const vb = $('#vb'); if (!window.speechSynthesis) vb.style.display = 'none';
  vb.onclick = () => { VOICE = !VOICE; vb.setAttribute('aria-pressed', VOICE); store.set('roi_voice', VOICE); VOICE ? speak('Voz activada') : speechSynthesis.cancel(); };
  const me = t => { add('b me').textContent = t; };
  const lock = d => d.classList.add('lock');
  const block = (cls, html, on) => { const d = add('blk ' + cls, html); d.onclick = e => { const b = e.target.closest('button'); if (b && !d.classList.contains('lock')) on(b, d); }; return d; };
  const setMood = m => { if (m == null) { badge.style.display = 'none'; fab.style.borderColor = '#fff'; return; } badge.innerHTML = face(m); badge.style.display = 'block'; fab.style.borderColor = COL[m]; };
  const host_ = () => location.hostname || 'esta página';
  const pageName = () => S.type === 'project' ? ((document.title || '').trim().replace(/\s+/g, ' ').slice(0, 60) || host_()) : host_();

  /* Flujo: qué valoras → (señalar algo concreto) → ¿Cómo valoras…? → ¿Cómo te sientes? → comentario */
  function start(again) {
    chat.innerHTML = ''; setMood(null);
    const t = CTX ? (['place', 'project', 'org', 'person'].includes(CTX.type) ? CTX.type : 'web') : null;
    Object.assign(S, { mood: null, emotion: '', type: t, name: CTX ? CTX.name : '', target: null, place: t === 'place' ? { name: CTX.name } : null, comment: '' });
    greeting = CTX ? `¡Hola! 👋 Cuéntame qué te parece ${CTX.name}.` : '¡Hola! Soy Roi 👋 ¿Qué quieres valorar hoy?';
    add('b').textContent = greeting; if (again) { greeted = true; speak(greeting); }
    if (CTX) askRate(); else askWhat();
  }
  function askWhat() {
    block('opts', '<button data-a="web">🌐 Una web o experiencia digital</button><button data-a="project">💡 Una iniciativa o proyecto</button><button data-a="place">📍 Un lugar o establecimiento</button>', (b, d) => {
      lock(d); S.type = b.dataset.a; me(b.textContent);
      if (S.type === 'place') askPlace(); else askTarget();
    });
  }
  function askTarget() {
    bot('Si quieres, puedes señalar algo concreto de la página: un botón, un texto o una imagen. O valora la página entera.');
    block('opts', '<button data-t="pick">🎯 Señalar algo concreto</button><button data-t="all">Valorar toda la página</button>', (b, d) => {
      lock(d); me(b.textContent);
      if (b.dataset.t === 'pick') pick(); else { S.name = pageName(); askRate(); }
    });
  }
  function askRate() {
    bot(`¿Cómo valoras ${S.name}?`);
    const d = block('faces', '<div class="fr">' + NAMES.map((n, i) => `<button data-m="${i}" aria-label="${n}" title="${n}">${face(i)}</button>`).join('') + '</div><div class="cap" aria-hidden="true">Toca la carita que mejor te represente</div>', (b, dd) => {
      S.mood = +b.dataset.m; lock(dd); b.classList.add('on'); dd.classList.remove('lock'); dd.style.pointerEvents = 'none'; dd.style.opacity = 1;
      me(NAMES[S.mood]); setMood(S.mood); setTimeout(askFeel, 250);
    });
    const cap = d.querySelector('.cap'), show = e => { const b = e.target.closest('button'); if (b) cap.textContent = NAMES[+b.dataset.m]; };
    d.addEventListener('mouseover', show); d.addEventListener('focusin', show);
  }
  function askFeel() {
    bot('¿Cómo te sientes?');
    block('chips', FEEL[S.mood].map(t => `<button>${t}</button>`).join(''), (b, d) => { S.emotion = b.textContent; lock(d); me(S.emotion); setTimeout(askComment, 200); });
  }
  const sel = el => { const p = []; for (let n = el, d = 0; n && n.nodeType === 1 && d < 3; n = n.parentElement, d++) p.unshift(n.tagName.toLowerCase() + (n.id ? '#' + n.id : n.classList[0] ? '.' + n.classList[0] : '')); return p.join(' > '); };
  const KIND = { A: 'Enlace', BUTTON: 'Botón', IMG: 'Imagen', H1: 'Título', H2: 'Título', H3: 'Título', P: 'Texto', INPUT: 'Campo', VIDEO: 'Vídeo', NAV: 'Menú', LI: 'Elemento de lista', SPAN: 'Texto', DIV: 'Bloque' };
  const label = el => { const x = (el.innerText || el.alt || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 30); return { text: x, label: (KIND[el.tagName] || 'Elemento') + (x ? ': «' + x + '»' : '') }; };
  function pick() {
    bot('Pulsa sobre lo que quieres valorar (Esc para cancelar).'); toggle(false);
    const box = document.createElement('div');
    Object.assign(box.style, { position: 'fixed', zIndex: 2147483646, pointerEvents: 'none', border: '2px solid #3f5a3a', background: '#3f5a3a22', borderRadius: '4px' });
    document.documentElement.append(box);
    const move = e => { if (e.target === host) return; const r = e.target.getBoundingClientRect(); Object.assign(box.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' }); };
    const end = () => { box.remove(); document.removeEventListener('mousemove', move, true); document.removeEventListener('click', click, true); document.removeEventListener('keydown', key, true); toggle(true); };
    const click = e => { if (e.target === host) return; e.preventDefault(); e.stopPropagation(); const l = label(e.target); S.target = { selector: sel(e.target), label: l.label }; S.name = l.text ? `«${l.text}»` : 'eso que has marcado'; end(); me('✅ Marcado: ' + l.label); askRate(); };
    const key = e => { if (e.key === 'Escape') { end(); bot('Vale, valoramos la página entera.'); S.name = pageName(); askRate(); } };
    document.addEventListener('mousemove', move, true); document.addEventListener('click', click, true); document.addEventListener('keydown', key, true);
  }

  /* Lugares: tu ubicación o escribir el lugar */
  const placeChosen = p => { S.place = p; S.name = p.name; me('📍 ' + p.name + (p.address ? ' · ' + p.address : '')); askRate(); };
  function askPlace() {
    bot('¿Cómo quieres indicar el lugar?');
    block('opts', '<button data-p="gps">📍 Usar mi ubicación</button><button data-p="txt">✍️ Escribir el lugar</button>', (b, d) => { lock(d); me(b.textContent); b.dataset.p === 'gps' ? locate() : typePlace(); });
  }
  const GEO = 'https://photon.komoot.io/api/?limit=5&q=';
  function typePlace(msg) {
    bot(msg || 'Escribe el lugar o la dirección y elige una opción.');
    const d = add('blk', '<input placeholder="Ej. Parque Central, Valencia" aria-label="Lugar" autocomplete="off"><div class="sug"></div><button class="send">Usar este texto</button>');
    const inp = d.querySelector('input'), sug = d.querySelector('.sug'), btn = d.querySelector('.send'); let tm, seq = 0;
    const chosen = p => { lock(d); placeChosen(p); };
    inp.oninput = () => {
      clearTimeout(tm); const v = inp.value.trim(); sug.innerHTML = ''; if (v.length < 3) return;
      tm = setTimeout(async () => {
        const my = ++seq;
        try {
          const r = (await net(GEO + encodeURIComponent(v))).json || {}; if (my !== seq) return; sug.innerHTML = '';
          (r.features || []).forEach(f => {
            const q = f.properties, st = [q.street, q.housenumber].filter(Boolean).join(' '), name = q.name || st;
            const addr = [q.name ? st : '', q.city || q.district, q.country].filter(Boolean).join(', '); if (!name) return;
            const b = document.createElement('button'); b.type = 'button'; b.innerHTML = '<b></b><small></small>'; b.firstChild.textContent = name; b.lastChild.textContent = addr;
            b.onclick = () => chosen({ name, address: addr, lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0], verified: true }); sug.append(b);
          });
        } catch (e) {}
      }, 400);
    };
    btn.onclick = () => { const v = inp.value.trim(); if (v) chosen({ name: v, verified: false }); };
    inp.onkeydown = e => { if (e.key === 'Enter') btn.click(); };
    inp.focus();
  }
  function locate() {
    bot('Buscando dónde estás…');
    if (!navigator.geolocation) return typePlace('No puedo ubicarte desde aquí. Escríbelo tú:');
    navigator.geolocation.getCurrentPosition(async p => {
      const { latitude: lat, longitude: lng } = p.coords; let name = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      const r = (await net(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&accept-language=es&lat=${lat}&lon=${lng}`)).json;
      if (r) name = r.name || (r.display_name || name).split(',').slice(0, 2).join(',');
      placeChosen({ name, lat, lng, verified: true });
    }, () => typePlace('No tengo permiso de ubicación. Escríbelo tú:'), { timeout: 8000 });
  }

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  async function askComment() {
    bot('¿Quieres añadir algo? Escríbelo o díctalo con el micro. Es opcional.');
    const forced = CFG.sync && CFG.forceShare, share = CFG.sync && !forced ? ((await store.get('roi_share')) ?? CFG.shareDefault) : false;
    const d = add('blk', '<div class="mic"><textarea placeholder="Cuéntanos tu experiencia…" aria-label="Comentario" maxlength="1000"></textarea><button class="mb" aria-pressed="false" aria-label="Dictar con la voz">🎤</button></div>'
      + (forced ? '<p class="cons">Al enviar, tu valoración se guarda de forma anónima y el comentario se analiza con IA de Google.</p>' : CFG.sync ? '<label class="cons"><input type="checkbox"' + (share ? ' checked' : '') + '><span>Compartir mi valoración de forma anónima con Avatar ROI. El comentario se analiza con IA de Google.</span></label>' : '')
      + '<button class="send">Enviar valoración</button>');
    const ta = d.querySelector('textarea'), mb = d.querySelector('.mb'), cb = d.querySelector('input[type=checkbox]'); let rec = null;
    if (!SR) mb.remove(); else mb.onclick = () => {
      if (rec) { rec.stop(); return; }
      rec = new SR(); rec.lang = 'es-ES'; rec.interimResults = false;
      rec.onresult = e => { ta.value = (ta.value + ' ' + e.results[0][0].transcript).trim(); };
      rec.onend = () => { rec = null; mb.setAttribute('aria-pressed', 'false'); };
      rec.onerror = () => bot('No he podido usar el micrófono. Puedes escribirlo.');
      mb.setAttribute('aria-pressed', 'true'); rec.start();
    };
    d.querySelector('.send').onclick = () => {
      if (rec) rec.stop(); S.comment = ta.value.trim(); S.share = forced ? true : !!(cb && cb.checked); if (cb) store.set('roi_share', S.share);
      lock(d); if (S.comment) me(S.comment); submit();
    };
  }
  const mapsUrl = p => p && p.lat != null ? `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}` : p && p.name ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name)}` : '';
  async function submit() {
    const pageUrl = (CTX && CTX.url) || (location.origin + location.pathname);
    const subject = S.type === 'place' ? (S.place && S.place.name) : S.target ? S.target.label : S.name;
    const rec = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), ts: new Date().toISOString(), site: (CTX && CTX.url) ? new URL(CTX.url).hostname : location.hostname,
      url: pageUrl, link: S.type === 'place' ? (mapsUrl(S.place) || pageUrl) : pageUrl,
      type: S.type, subject, mood: S.mood, moodName: NAMES[S.mood], emotion: S.emotion, tags: [S.emotion],
      comment: S.comment, target: S.target, place: S.place, share: !!S.share
    };
    const list = (await store.get('roi_ratings')) || []; list.unshift(rec); await store.set('roi_ratings', list.slice(0, 500));
    if (rec.share) ask({ roi: 'sync', rec });
    bot('¡Gracias! Tu valoración ya cuenta 💚'); w.classList.add('cheer'); setTimeout(() => w.classList.remove('cheer'), 800);
    block('opts', '<button>Hacer otra valoración</button>', () => start(true));
    window.dispatchEvent(new CustomEvent('roi:rated', { detail: rec }));
  }

  window.AvatarRoi = { open: () => toggle(true), close: () => toggle(false), img: () => IMG };
  if (isExt) chrome.storage.onChanged.addListener(c => { if (c.roi_hidden) host.style.display = c.roi_hidden.newValue ? 'none' : ''; if (c.roi_avatar) setImg(c.roi_avatar.newValue || DEFAULT_IMG); });
  Promise.resolve(store.get('roi_hidden')).then(h => { if (h) host.style.display = 'none'; });
  Promise.resolve(store.get('roi_avatar')).then(a => { if (a && !(cs && cs.dataset.avatar)) setImg(a); });
  Promise.resolve(store.get('roi_voice')).then(v => { VOICE = v == null ? true : !!v; vb.setAttribute('aria-pressed', VOICE); });
  start();
  document.documentElement.append(host);
  if (cs && cs.dataset.open) toggle(true);
})();
