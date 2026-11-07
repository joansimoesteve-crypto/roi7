/* Tarjeta imprimible con el avatar arriba y el QR debajo. Uso: RoiCard.download({name, link, sub, filename}) */
(function () {
  const load = src => new Promise((ok, no) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => ok(i); i.onerror = no; i.src = src; });
  const rr = (c, x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath() };
  function wrap(c, t, x, y, maxW, lh, maxL) { const w = String(t).split(/\s+/); let l = '', n = 0; for (const s of w) { const k = l ? l + ' ' + s : s; if (c.measureText(k).width > maxW && l) { c.fillText(l, x, y); y += lh; l = s; if (++n >= maxL) return y } else l = k } if (l) { c.fillText(l, x, y); y += lh } return y }
  async function build(o) {
    const W = 720, H = 1000, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
    c.fillStyle = '#fbf7ec'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#e9efdc'; rr(c, 30, 30, W - 60, H - 60, 56); c.fill();
    const logo = await load('/logo.png').catch(() => null);
    if (logo) c.drawImage(logo, W / 2 - 90, 70, 180, 180);
    c.textAlign = 'center'; c.fillStyle = '#26331f'; c.font = '800 46px "Bricolage Grotesque",system-ui,sans-serif';
    let y = wrap(c, o.name || 'Valóranos', W / 2, 310, W - 140, 54, 2);
    c.font = '500 28px "Bricolage Grotesque",system-ui,sans-serif'; c.fillStyle = '#4d5c43';
    y = wrap(c, o.sub || '¿Cómo te sientes aquí? Escanea y cuéntalo en 20 segundos', W / 2, y + 6, W - 160, 36, 2);
    const q = new QRCodeStyling({ width: 380, height: 380, type: 'canvas', data: o.link, image: '/logo.png', margin: 4, qrOptions: { errorCorrectionLevel: 'H' }, imageOptions: { crossOrigin: 'anonymous', margin: 4, imageSize: .3 }, dotsOptions: { color: '#3f5a3a', type: 'dots' }, cornersSquareOptions: { type: 'extra-rounded', color: '#26331f' }, cornersDotOptions: { type: 'dot', color: '#3f8f45' }, backgroundOptions: { color: '#ffffff' } });
    const blob = await q.getRawData('png'), img = await load(URL.createObjectURL(blob));
    const qy = Math.max(y + 20, 520); c.fillStyle = '#fff'; rr(c, W / 2 - 215, qy - 15, 430, 430, 36); c.fill(); c.drawImage(img, W / 2 - 190, qy + 10, 380, 380);
    c.fillStyle = '#4d5c43'; c.font = '600 26px "Bricolage Grotesque",system-ui,sans-serif'; c.fillText('Avatar ROI · citizenvoice.es', W / 2, H - 70);
    return cv;
  }
  window.RoiCard = {
    build,
    async download(o) { const cv = await build(o); cv.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = (o.filename || 'tarjeta-roi') + '.png'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove() }, 500) }, 'image/png') }
  };
})();
