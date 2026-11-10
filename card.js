/* Tarjeta de colección con el avatar del sitio arriba y el QR debajo.
   Uso: RoiCard.download({name, link, kind, theme, sub, filename})   ·   RoiCard.THEMES = temas disponibles */
(function () {
  const THEMES = {
    parque:  { n: 'Parque',          e: '🌳', a: '#2e7d32', b: '#b6e38a', re: /parque|jard[ií]n|plaza|r[ií]o|playa|monte|bosque|sendero|zona verde/ },
    pista:   { n: 'Pista deportiva', e: '🎾', a: '#c0702a', b: '#f6d77a', re: /pista|p[aá]del|tenis|gimnasio|piscina|polideportivo|f[uú]tbol|baloncesto|deport|campo/ },
    biblio:  { n: 'Biblioteca',      e: '📚', a: '#35588a', b: '#a9c8f2', re: /biblioteca|lectura|archivo|museo/ },
    comida:  { n: 'Gastronomía',     e: '🍽️', a: '#b5452b', b: '#f6b07a', re: /restaurante|caf[eé]|bar\b|bar |cafeter|pizzer|taberna|bistr|cocina|panader|helader/ },
    campus:  { n: 'Campus',          e: '🎓', a: '#5b3f8a', b: '#d1b8f5', re: /universidad|campus|aula|facultad|escuela|colegio|instituto|laboratorio/ },
    publico: { n: 'Servicio público',e: '🏛️', a: '#2b6a9a', b: '#a6d4f2', re: /ayuntamiento|oficina|juzgado|centro de salud|hospital|cl[ií]nica|correos|atenci[oó]n|registro/ },
    tienda:  { n: 'Tienda',          e: '🛍️', a: '#a8327a', b: '#f4b3d9', re: /tienda|comercio|boutique|supermercado|mercado|centro comercial|outlet/ },
    web:     { n: 'Espacio digital', e: '🌐', a: '#0f7b8a', b: '#8be6ec', re: null },
    proyecto:{ n: 'Iniciativa',      e: '💡', a: '#8a6a1f', b: '#f6dc86', re: null },
    persona: { n: 'Persona',         e: '🙋', a: '#4d5c43', b: '#d9e2c8', re: null },
    lugar:   { n: 'Lugar',           e: '📍', a: '#3f5a3a', b: '#c9e3b3', re: null }
  };
  const detect = (name, kind) => {
    if (kind === 'web') return 'web'; if (kind === 'project') return 'proyecto'; if (kind === 'person') return 'persona';
    const t = String(name || '').toLowerCase(); for (const k in THEMES) if (THEMES[k].re && THEMES[k].re.test(t)) return k;
    return kind === 'org' ? 'publico' : 'lugar';
  };

  // Ilustraciones por tema (se dibujan en el lienzo, sin imágenes externas): el «avatar» de la tarjeta es lo que se valora
  const SC = {
    parque(c, X, Y, W, H) {
      c.fillStyle = '#fff3b0'; c.beginPath(); c.arc(X + W - 90, Y + 90, 46, 0, 7); c.fill();
      c.fillStyle = '#6dbb5a'; c.beginPath(); c.ellipse(X + 160, Y + H - 40, 300, 120, 0, 0, 7); c.fill(); c.fillStyle = '#4e9d48'; c.beginPath(); c.ellipse(X + W - 120, Y + H - 20, 300, 110, 0, 0, 7); c.fill();
      c.fillStyle = '#e9d9a6'; c.beginPath(); c.moveTo(X + 250, Y + H); c.quadraticCurveTo(X + 330, Y + H - 90, X + 300, Y + H - 150); c.lineTo(X + 340, Y + H - 150); c.quadraticCurveTo(X + 420, Y + H - 80, X + 470, Y + H); c.fill();
      const tree = (x, y, r) => { c.fillStyle = '#7a5230'; c.fillRect(x - 9, y, 18, r * 1.1); c.fillStyle = '#2e7d32'; [[0, 0, r], [-r * .7, r * .5, r * .75], [r * .7, r * .5, r * .75]].forEach(q => { c.beginPath(); c.arc(x + q[0], y + q[1], q[2], 0, 7); c.fill() }) };
      tree(X + 110, Y + 170, 62); tree(X + W - 110, Y + 150, 70); tree(X + 220, Y + 230, 40);
      c.fillStyle = '#8a5a2b'; c.fillRect(X + 380, Y + H - 120, 120, 14); c.fillRect(X + 390, Y + H - 106, 10, 30); c.fillRect(X + 480, Y + H - 106, 10, 30); c.fillRect(X + 380, Y + H - 160, 120, 10);
    },
    pista(c, X, Y, W, H) {
      c.fillStyle = '#d8672c'; c.beginPath(); c.moveTo(X + 120, Y + 130); c.lineTo(X + W - 120, Y + 130); c.lineTo(X + W - 20, Y + H - 20); c.lineTo(X + 20, Y + H - 20); c.closePath(); c.fill();
      c.strokeStyle = '#fff'; c.lineWidth = 6; c.stroke(); c.beginPath(); c.moveTo(X + 70, Y + 225); c.lineTo(X + W - 70, Y + 225); c.moveTo(X + W / 2, Y + 130); c.lineTo(X + W / 2, Y + H - 20); c.stroke();
      c.strokeStyle = '#fff'; c.lineWidth = 4; c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(X + 90, Y + 160, W - 180, 56); c.strokeRect(X + 90, Y + 160, W - 180, 56);
      c.fillStyle = '#fff'; c.fillRect(X + 84, Y + 150, 8, 80); c.fillRect(X + W - 92, Y + 150, 8, 80);
      c.fillStyle = '#e6f25a'; c.beginPath(); c.arc(X + W / 2 + 80, Y + 90, 26, 0, 7); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.arc(X + W / 2 + 80, Y + 90, 18, .6, 2.2); c.stroke();
    },
    biblio(c, X, Y, W, H) {
      c.fillStyle = '#7a4e2b'; c.fillRect(X + 70, Y + 50, W - 140, H - 90); c.fillStyle = '#5c3a1f'; [0, 1, 2].forEach(i => c.fillRect(X + 70, Y + 140 + i * 90, W - 140, 10));
      const col = ['#e8605a', '#f0913a', '#f2d05c', '#5fb760', '#4a90d9', '#9b6bd1', '#e46aa6'];
      [0, 1, 2].forEach(r => { let x = X + 86; let k = r * 3; while (x < X + W - 100) { const w = 20 + ((k * 7) % 3) * 8, h = 52 + ((k * 11) % 4) * 8; c.fillStyle = col[k % col.length]; c.fillRect(x, Y + 140 + r * 90 - h, w, h); x += w + 4; k++ } });
    },
    comida(c, X, Y, W, H) {
      c.fillStyle = '#7a4e2b'; c.fillRect(X, Y + H - 100, W, 100);
      c.fillStyle = '#fff'; c.beginPath(); c.ellipse(X + 220, Y + H - 100, 120, 34, 0, 0, 7); c.fill(); c.fillStyle = '#f2c9a0'; c.beginPath(); c.ellipse(X + 220, Y + H - 108, 84, 22, 0, 0, 7); c.fill();
      c.fillStyle = '#7bc96f'; [[190, 118], [230, 114], [250, 120]].forEach(q => { c.beginPath(); c.arc(X + q[0], Y + H - q[1], 12, 0, 7); c.fill() });
      c.fillStyle = '#fff'; rr(c, X + 400, Y + H - 200, 120, 110, 22); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 12; c.beginPath(); c.arc(X + 528, Y + H - 150, 30, -1.2, 1.2); c.stroke(); c.fillStyle = '#6b3d1e'; c.fillRect(X + 410, Y + H - 195, 100, 18);
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 6; c.lineCap = 'round'; [[430, 70], [465, 50]].forEach(q => { c.beginPath(); c.moveTo(X + q[0], Y + H - 205); c.bezierCurveTo(X + q[0] - 20, Y + H - 235, X + q[0] + 20, Y + H - 255, X + q[0], Y + H - 285); c.stroke() });
    },
    campus(c, X, Y, W, H) {
      c.fillStyle = '#e9e1f7'; c.fillRect(X + 110, Y + 150, W - 220, H - 170); c.fillStyle = '#c9b8ec'; c.beginPath(); c.moveTo(X + 90, Y + 150); c.lineTo(X + W / 2, Y + 70); c.lineTo(X + W - 90, Y + 150); c.closePath(); c.fill();
      c.fillStyle = '#fff'; [0, 1, 2, 3, 4].forEach(i => c.fillRect(X + 140 + i * 88, Y + 175, 36, H - 215)); c.fillStyle = '#5b3f8a'; c.fillRect(X + W / 2 - 40, Y + H - 90, 80, 70);
      c.fillStyle = '#26331f'; c.beginPath(); c.moveTo(X + W / 2 - 80, Y + 52); c.lineTo(X + W / 2, Y + 20); c.lineTo(X + W / 2 + 80, Y + 52); c.lineTo(X + W / 2, Y + 84); c.closePath(); c.fill(); c.fillRect(X + W / 2 - 44, Y + 70, 88, 26);
    },
    publico(c, X, Y, W, H) {
      c.fillStyle = '#eef4fa'; c.fillRect(X + 90, Y + 140, W - 180, H - 160); c.fillStyle = '#bcd7ee'; c.beginPath(); c.moveTo(X + 70, Y + 140); c.lineTo(X + W / 2, Y + 60); c.lineTo(X + W - 70, Y + 140); c.closePath(); c.fill();
      c.fillStyle = '#fff'; [0, 1, 2, 3, 4, 5].forEach(i => c.fillRect(X + 115 + i * 78, Y + 165, 30, H - 205)); c.fillStyle = '#2b6a9a'; c.fillRect(X + W / 2 - 36, Y + H - 90, 72, 70);
      c.fillStyle = '#26331f'; c.fillRect(X + W / 2 - 2, Y + 4, 4, 60); c.fillStyle = '#e8605a'; c.fillRect(X + W / 2 + 2, Y + 8, 44, 26);
    },
    tienda(c, X, Y, W, H) {
      c.fillStyle = '#fff'; c.fillRect(X + 100, Y + 150, W - 200, H - 170);
      for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#fff' : '#d2438f'; c.beginPath(); c.moveTo(X + 90 + i * 55, Y + 90); c.lineTo(X + 145 + i * 55, Y + 90); c.lineTo(X + 155 + i * 55, Y + 150); c.lineTo(X + 80 + i * 55, Y + 150); c.closePath(); c.fill() }
      c.fillStyle = '#d6ecf7'; c.fillRect(X + 130, Y + 180, 190, 130); c.fillStyle = '#a8327a'; c.fillRect(X + 360, Y + 180, 90, H - 200);
      c.fillStyle = '#f4b3d9'; rr(c, X + 480, Y + 250, 60, 70, 8); c.fill(); c.strokeStyle = '#a8327a'; c.lineWidth = 6; c.beginPath(); c.arc(X + 510, Y + 250, 16, Math.PI, 0); c.stroke();
    },
    web(c, X, Y, W, H) {
      c.fillStyle = '#fff'; rr(c, X + 80, Y + 50, W - 160, H - 90, 26); c.fill(); c.fillStyle = '#0f7b8a'; c.save(); rr(c, X + 80, Y + 50, W - 160, 54, 26); c.clip(); c.fillRect(X + 80, Y + 50, W - 160, 54); c.restore();
      c.fillStyle = '#fff'; [0, 1, 2].forEach(i => { c.beginPath(); c.arc(X + 116 + i * 28, Y + 78, 8, 0, 7); c.fill() }); c.fillStyle = 'rgba(255,255,255,.7)'; rr(c, X + 250, Y + 64, W - 420, 28, 14); c.fill();
      c.fillStyle = '#cfeff2'; rr(c, X + 110, Y + 130, 200, 120, 14); c.fill(); c.fillStyle = '#e4eef0'; [0, 1, 2].forEach(i => rr(c, X + 340, Y + 134 + i * 40, 190 - i * 30, 22, 10) || c.fill());
      c.fillStyle = '#f2b01e'; [0, 1, 2, 3].forEach(i => { c.beginPath(); const cx = X + 130 + i * 44, cy = Y + 290; for (let k = 0; k < 10; k++) { const r = k % 2 ? 8 : 19, a = -Math.PI / 2 + k * Math.PI / 5; c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) } c.closePath(); c.fill() });
      c.fillStyle = '#26331f'; c.beginPath(); c.moveTo(X + 440, Y + 250); c.lineTo(X + 440, Y + 330); c.lineTo(X + 462, Y + 312); c.lineTo(X + 486, Y + 352); c.lineTo(X + 502, Y + 344); c.lineTo(X + 478, Y + 304); c.lineTo(X + 506, Y + 300); c.closePath(); c.fill();
    },
    proyecto(c, X, Y, W, H) {
      c.fillStyle = '#fff'; c.fillRect(X + 80, Y + H - 40, W - 160, 14);
      c.fillStyle = '#f0b23a'; c.fillRect(X + 160, Y + 150, 150, H - 190); c.fillStyle = '#fff3c4'; [0, 1, 2].forEach(r => [0, 1].forEach(q => c.fillRect(X + 180 + q * 60, Y + 175 + r * 55, 36, 34)));
      c.fillStyle = '#26331f'; c.fillRect(X + 400, Y + 60, 12, H - 100); c.fillRect(X + 250, Y + 60, 250, 10); c.fillRect(X + 262, Y + 70, 3, 80); c.fillStyle = '#e8605a'; c.fillRect(X + 252, Y + 150, 24, 22);
      c.strokeStyle = '#8a6a1f'; c.lineWidth = 3; c.beginPath(); c.moveTo(X + 412, Y + 60); c.lineTo(X + 500, Y + 70); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.7)'; rr(c, X + 340, Y + H - 90, 220, 22, 11); c.fill(); c.fillStyle = '#5fb760'; rr(c, X + 340, Y + H - 90, 130, 22, 11); c.fill();
    },
    persona(c, X, Y, W, H) {
      c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(X + W / 2, Y + H + 20, 210, 150, 0, 0, 7); c.fill();
      c.fillStyle = '#f0c9a2'; c.beginPath(); c.arc(X + W / 2, Y + 160, 92, 0, 7); c.fill(); c.fillStyle = '#4a2f1a'; c.beginPath(); c.arc(X + W / 2, Y + 136, 96, Math.PI, 0); c.fill();
      c.fillStyle = '#3a2a1a'; [-34, 34].forEach(d => { c.beginPath(); c.arc(X + W / 2 + d, Y + 166, 8, 0, 7); c.fill() }); c.strokeStyle = '#3a2a1a'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(X + W / 2 - 34, Y + 200); c.quadraticCurveTo(X + W / 2, Y + 232, X + W / 2 + 34, Y + 200); c.stroke();
    },
    lugar(c, X, Y, W, H) {
      c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 3; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(X + i * 80, Y); c.lineTo(X + i * 80 - 60, Y + H); c.stroke() } for (let i = 1; i < 5; i++) { c.beginPath(); c.moveTo(X, Y + i * 76); c.lineTo(X + W, Y + i * 76 + 20); c.stroke() }
      c.fillStyle = 'rgba(0,0,0,.16)'; c.beginPath(); c.ellipse(X + W / 2, Y + 340, 70, 16, 0, 0, 7); c.fill();
      c.fillStyle = '#e8605a'; c.beginPath(); c.moveTo(X + W / 2, Y + 336); c.bezierCurveTo(X + W / 2 - 130, Y + 200, X + W / 2 - 100, Y + 60, X + W / 2, Y + 60); c.bezierCurveTo(X + W / 2 + 100, Y + 60, X + W / 2 + 130, Y + 200, X + W / 2, Y + 336); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(X + W / 2, Y + 160, 44, 0, 7); c.fill();
    }
  };
  const load = src => new Promise((ok, no) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => ok(i); i.onerror = no; i.src = src; });
  const rr = (c, x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath() };
  function wrap(c, t, x, y, maxW, lh, maxL) { const w = String(t).split(/\s+/); let l = '', n = 0; for (const s of w) { const k = l ? l + ' ' + s : s; if (c.measureText(k).width > maxW && l) { c.fillText(l, x, y); y += lh; l = s; if (++n >= maxL) return y } else l = k } if (l) { c.fillText(l, x, y); y += lh } return y }
  async function build(o) {
    const key = THEMES[o.theme] ? o.theme : detect(o.name, o.kind), T = THEMES[key], W = 720, H = 1120, F = '"Bricolage Grotesque",system-ui,sans-serif';
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
    c.fillStyle = '#fbf7ec'; c.fillRect(0, 0, W, H);
    // marco tipo carta (dorado + color del tema)
    let g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, T.a); g.addColorStop(.5, '#e8c766'); g.addColorStop(1, T.a);
    c.fillStyle = g; rr(c, 10, 10, W - 20, H - 20, 54); c.fill();
    c.fillStyle = '#fbf7ec'; rr(c, 30, 30, W - 60, H - 60, 40); c.fill();
    // ilustración
    c.save(); rr(c, 48, 48, W - 96, 380, 28); c.clip();
    g = c.createLinearGradient(0, 48, W, 428); g.addColorStop(0, T.a); g.addColorStop(1, T.b); c.fillStyle = g; c.fillRect(48, 48, W - 96, 380);
    c.fillStyle = 'rgba(255,255,255,.14)'; [[130, 120, 90], [600, 90, 60], [560, 360, 110], [110, 380, 70]].forEach(p => { c.beginPath(); c.arc(p[0], p[1], p[2], 0, 7); c.fill() });
    c.fillStyle = 'rgba(255,255,255,.55)'; [[170, 90], [560, 150], [90, 250], [640, 290], [500, 70]].forEach(p => { c.beginPath(); c.arc(p[0], p[1], 4, 0, 7); c.fill() });
    c.restore();
    c.save(); rr(c, 48, 48, W - 96, 380, 28); c.clip(); (SC[key] || SC.lugar)(c, 48, 48, W - 96, 380); c.restore();
    const logo = await load('/logo.png').catch(() => null);
    c.fillStyle = '#fff'; c.beginPath(); c.arc(W - 112, 366, 46, 0, 7); c.fill(); c.lineWidth = 6; c.strokeStyle = T.a; c.stroke(); if (logo) c.drawImage(logo, W - 112 - 32, 366 - 32, 64, 64);
    c.textAlign = 'center'; c.textBaseline = 'middle';
    // cinta del tipo
    c.font = '700 24px ' + F; const tw = c.measureText(T.n.toUpperCase()).width + 56; c.fillStyle = T.a; rr(c, W / 2 - tw / 2, 408, tw, 44, 22); c.fill();
    c.fillStyle = '#fff'; c.textBaseline = 'alphabetic'; c.fillText(T.n.toUpperCase(), W / 2, 438);
    // nombre
    c.fillStyle = '#26331f'; c.font = '800 50px ' + F; let y = wrap(c, o.name || 'Valóranos', W / 2, 520, W - 140, 56, 2);
    c.font = '500 27px ' + F; c.fillStyle = '#4d5c43'; y = wrap(c, o.sub || '¿Cómo te sientes aquí? Escanea y cuéntalo en 20 segundos', W / 2, y + 4, W - 170, 34, 2);
    // QR
    const q = new QRCodeStyling({ width: 300, height: 300, type: 'canvas', data: o.link, image: '/logo.png', margin: 4, qrOptions: { errorCorrectionLevel: 'H' }, imageOptions: { crossOrigin: 'anonymous', margin: 4, imageSize: .3 }, dotsOptions: { color: T.a, type: 'dots' }, cornersSquareOptions: { type: 'extra-rounded', color: '#26331f' }, cornersDotOptions: { type: 'dot', color: '#3f8f45' }, backgroundOptions: { color: '#ffffff' } });
    const img = await load(URL.createObjectURL(await q.getRawData('png'))), qy = Math.max(y + 10, 690);
    c.fillStyle = '#fff'; rr(c, W / 2 - 170, qy - 10, 340, 340, 30); c.fill(); c.lineWidth = 3; c.strokeStyle = T.b; c.stroke(); c.drawImage(img, W / 2 - 150, qy + 10, 300, 300);
    c.fillStyle = '#4d5c43'; c.font = '600 24px ' + F; c.fillText('Avatar ROI · citizenvoice.es', W / 2, H - 62);
    return cv;
  }
  window.RoiCard = {
    THEMES, detect, build,
    async download(o) { const cv = await build(o); cv.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = (o.filename || 'tarjeta-roi') + '.png'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove() }, 500) }, 'image/png') }
  };
})();
