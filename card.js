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
    c.fillStyle = '#fff'; c.beginPath(); c.arc(W / 2, 238, 128, 0, 7); c.fill();
    c.lineWidth = 8; c.strokeStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.arc(W / 2, 238, 142, 0, 7); c.stroke();
    const logo = await load('/logo.png').catch(() => null); if (logo) c.drawImage(logo, W / 2 - 100, 138, 200, 200);
    c.fillStyle = '#fff'; c.beginPath(); c.arc(W / 2 + 104, 330, 52, 0, 7); c.fill(); c.lineWidth = 6; c.strokeStyle = T.a; c.stroke();
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '56px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; c.fillStyle = '#000'; c.fillText(T.e, W / 2 + 104, 334);
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
