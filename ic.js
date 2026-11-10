/* Iconos Roi · trazo redondeado + relleno suave. Uso: IC('pin') → <svg>. Color = currentColor. */
(function(){
var P={
pin:'<path d="M12 21s7-5.6 7-11.2A7 7 0 0 0 5 9.8C5 15.4 12 21 12 21z" class="f"/><circle cx="12" cy="9.8" r="2.6"/>',
globe:'<circle cx="12" cy="12" r="9" class="f"/><path d="M3 12h18M12 3c2.6 2.7 3.8 5.7 3.8 9s-1.2 6.3-3.8 9c-2.6-2.7-3.8-5.7-3.8-9S9.4 5.7 12 3z"/>',
spark:'<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" class="f"/><path d="M18.5 16.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
flag:'<path d="M5 21V4" /><path d="M5 5c4-2.2 7 2.2 11 0v8c-4 2.2-7-2.2-11 0z" class="f"/>',
search:'<circle cx="11" cy="11" r="6.5" class="f"/><path d="M16 16l4.5 4.5"/>',
locate:'<circle cx="12" cy="12" r="3.2" class="f"/><circle cx="12" cy="12" r="7.5"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/>',
zone:'<path d="M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9z" class="f"/><circle cx="12" cy="12" r="2.4"/>',
tap:'<path d="M9 11V5.5a1.8 1.8 0 0 1 3.6 0V11" /><path d="M12.6 10.2a1.7 1.7 0 0 1 3.4 0v1.3a1.6 1.6 0 0 1 3 .3v3.5c0 3-2.3 5.2-5.3 5.2h-1.2c-2 0-3.2-.8-4.3-2.3L5.6 14.500c-.6-.9.6-2 1.500-1.200L9 15" class="f"/>',
route:'<circle cx="6" cy="18" r="2.4" class="f"/><circle cx="18" cy="6" r="2.4" class="f"/><path d="M8.4 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.6"/>',
qr:'<rect x="3.5" y="3.5" width="7" height="7" rx="1.6" class="f"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><path d="M14 14h2.5v2.500H14zM19 14v.1M14 19.500v.1M17.500 18.500H20.500V20.500"/>',
ask:'<path d="M12 21c4.900 0 8.500-3.100 8.500-7.500S16.900 6 12 6s-8.500 3.100-8.500 7.500c0 1.800.6 3.300 1.600 4.500L4 21z" class="f"/><path d="M10 11.200a2.100 2.100 0 1 1 3.200 1.800c-.7.4-1.200.9-1.200 1.700M12 17v.1" transform="translate(0 -2.500)"/>',
mega:'<path d="M4 10v4a1 1 0 0 0 1 1h2.500l7 4V5l-7 4H5a1 1 0 0 0-1 1z" class="f"/><path d="M18.500 9.500a4 4 0 0 1 0 5"/>',
chat:'<path d="M20.500 11.500c0 4-3.800 7-8.500 7-1 0-2-.1-2.900-.4L4.500 20l1.300-3.600A6.700 6.700 0 0 1 3.500 11.500c0-4 3.800-7 8.500-7s8.500 3 8.500 7z" class="f"/><path d="M8.500 11.500h.1M12 11.500h.1M15.500 11.500h.1"/>',
clock:'<circle cx="12" cy="13" r="8" class="f"/><path d="M12 8.500V13l3 2M9.500 3h5"/>',
card:'<rect x="3" y="5.500" width="18" height="13" rx="3" class="f"/><path d="M3 10h18M7 15h3"/>',
cal:'<rect x="3.500" y="5" width="17" height="15.500" rx="3" class="f"/><path d="M8 3v4M16 3v4M3.500 10h17"/><path d="M8 14h.1M12 14h.1M16 14h.1M8 17.500h.1M12 17.500h.1"/>',
tool:'<path d="M14.500 6.500a4 4 0 0 0 4.800 4.800L12 18.600a2.400 2.400 0 0 1-3.400-3.400z" class="f"/><path d="M14.500 6.500L17 9"/>',
ticket:'<path d="M4 8.500A2 2 0 0 0 4 12.500V15a1.500 1.500 0 0 0 1.500 1.500h13A1.500 1.500 0 0 0 20 15v-2.500a2 2 0 0 1 0-4V6.500A1.500 1.500 0 0 0 18.500 5h-13A1.500 1.500 0 0 0 4 6.500z" class="f" transform="translate(0 1.500)"/><path d="M14 7v10" stroke-dasharray="2 2.200"/>',
build:'<rect x="5" y="3.500" width="10" height="17" rx="2" class="f"/><path d="M15 9h3.500A1.500 1.500 0 0 1 20 10.500v10M8.500 8h3M8.500 12h3M8.500 16h3M3 20.500h18"/>',
user:'<circle cx="12" cy="8" r="3.800" class="f"/><path d="M4.500 20c.8-3.800 3.800-5.800 7.500-5.800s6.700 2 7.500 5.800"/>',
heart:'<path d="M12 20s-7.500-4.600-7.500-10.200A4.300 4.300 0 0 1 12 7.300a4.300 4.300 0 0 1 7.500 2.500C19.500 15.400 12 20 12 20z" class="f"/>',
users:'<circle cx="9" cy="8.500" r="3.300" class="f"/><path d="M3 19.500c.6-3.200 3-5 6-5s5.400 1.800 6 5"/><path d="M16 5.500a3.200 3.200 0 0 1 0 6M18.500 14.800c1.500.7 2.400 2.300 2.700 4.700"/>',
plug:'<path d="M9 3v4M15 3v4M6.500 7h11v3.500a5.500 5.500 0 0 1-11 0z" class="f"/><path d="M12 16v5"/>',
check:'<circle cx="12" cy="12" r="9" class="f"/><path d="M8 12.300l2.700 2.700L16 9.500"/>',
phone:'<rect x="6.500" y="2.500" width="11" height="19" rx="3" class="f"/><path d="M10.500 18.500h3"/>',
link:'<path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1"/><path d="M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1" class="f"/>',
puzzle:'<path d="M9.500 4.500a2 2 0 0 1 4 0V6H18a1 1 0 0 1 1 1v3.500h-1.500a2 2 0 0 0 0 4H19V18a1 1 0 0 1-1 1h-3.500v-1.500a2 2 0 0 0-4 0V19H7a1 1 0 0 1-1-1v-4.500H4.500a2 2 0 0 1 0-4H6V7a1 1 0 0 1 1-1h2.500z" class="f"/>',
food:'<path d="M7 3v8M4.500 3v4.500A2.500 2.500 0 0 0 7 10a2.500 2.500 0 0 0 2.500-2.500V3M7 10v11M16.500 21V3c-2.200 1.500-3.500 4-3.500 7.500 0 1.700 1.200 3 3.500 3" class="f"/>',
book:'<path d="M4 5.500A2.500 2.500 0 0 1 6.500 3H20v15H6.500A2.500 2.500 0 0 0 4 20.500z" class="f"/><path d="M4 20.500A2.500 2.500 0 0 0 6.500 23H20v-5M9 8h7"/>',
cross:'<rect x="3.500" y="3.500" width="17" height="17" rx="5" class="f"/><path d="M12 8v8M8 12h8"/>',
tree:'<path d="M12 21v-6" /><path d="M12 3.500c3.500 0 6 2.600 6 5.500 0 1.200-.4 2-1 2.800 1 .8 1.500 1.800 1.500 3 0 2.200-2 3.700-4.200 3.700H9.700C7.500 18.500 5.500 17 5.500 14.800c0-1.200.5-2.200 1.500-3C6.400 11 6 10.200 6 9c0-2.900 2.500-5.500 6-5.500z" class="f"/>',
cap:'<path d="M2.500 9.500L12 5l9.500 4.500L12 14z" class="f"/><path d="M6.500 11.700V16c0 1.200 2.500 2.500 5.500 2.500s5.500-1.300 5.500-2.500v-4.300M21.500 9.500V15"/>',
cart:'<path d="M3 4h2.500l2 11h10l2-8H7" class="f"/><circle cx="9.500" cy="19.500" r="1.400"/><circle cx="16.500" cy="19.500" r="1.400"/>',
landmark:'<path d="M3 9.500L12 4l9 5.500z" class="f"/><path d="M5 11v7M9.500 11v7M14.500 11v7M19 11v7M3 20.500h18"/>',
store:'<path d="M4 9.500L5.500 4h13L20 9.500c0 1.400-1.100 2.500-2.500 2.500S15 10.900 15 9.500c0 1.400-1.100 2.500-3 2.500s-3-1.100-3-2.500C9 10.900 7.900 12 6.500 12S4 10.900 4 9.500z" class="f"/><path d="M5.500 12v8.500h13V12M10 20.500v-5h4v5"/>',
ball:'<circle cx="12" cy="12" r="9" class="f"/><path d="M3.500 9.500c5 .5 9 3 11 8M20.500 14.500c-5-.5-9-3-11-8"/>',
star:'<path d="M12 3.500l2.600 5.400 5.900.8-4.300 4.100 1 5.800L12 16.800l-5.200 2.800 1-5.800L3.500 9.700l5.900-.8z" class="f"/>',
sat:'<rect x="3" y="3" width="18" height="18" rx="4" class="f"/><path d="M3 15l5-4 4 3 3-2 6 4"/>',
eye:'<path d="M2.500 12S6 5.500 12 5.500 21.500 12 21.500 12 18 18.500 12 18.500 2.500 12 2.500 12z" class="f"/><circle cx="12" cy="12" r="2.800"/>'};
window.IC=function(n,s){var b=P[n]||P.spark;return '<svg class="ri" viewBox="0 0 24 24" width="'+(s||24)+'" height="'+(s||24)+'" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+b+'</svg>'};
var st=document.createElement('style');st.textContent='.ri{flex:none;vertical-align:-.2em}.ri .f{fill:currentColor;fill-opacity:.16}';document.head.appendChild(st);
})();
/* Barra única de servicios con color propio: lugares = verde, webs = azul, proyectos = naranja */
window.ROI_COL={place:'#1f9d6b',web:'#2a7de1',project:'#ef7d1a'};
window.ROI_NAV=function(a){var T=[['place','pin','Lugares','/mapa'],['web','globe','Webs','/v?t=web'],['project','spark','Proyectos','/mapa?k=project']];
 if(a&&ROI_COL[a])document.documentElement.style.setProperty('--ac',ROI_COL[a]);
 return '<nav class="svc" aria-label="Qué quieres valorar">'+T.map(function(x){return '<a data-s="'+x[0]+'" href="'+x[3]+'"'+(x[0]===a?' class="on" aria-current="page"':'')+'><i class="ib">'+IC(x[1],22)+'</i><span>'+x[2]+'</span></a>'}).join('')+'</nav>'};
window.ROI_HERO=function(a){var H={place:['Lugares','Valora dónde estás ahora'],web:['Webs','Valora lo que navegas'],project:['Proyectos','Opina y sigue cómo avanzan']},c=ROI_COL[a]||'#3f5a3a';
 return '<div class="rh" style="--hc:'+c+'"><img src="/roi.png" alt="" width="56" height="56"><div><b>'+H[a][0]+'</b><span>'+H[a][1]+'</span></div><svg viewBox="0 0 80 40" aria-hidden="true"><circle cx="14" cy="26" r="9" fill="#fff" opacity=".22"/><circle cx="40" cy="14" r="6" fill="#fff" opacity=".3"/><circle cx="64" cy="26" r="11" fill="#fff" opacity=".18"/></svg></div>'};
(function(){var s=document.createElement('style');s.textContent=':root{--ac:#3f5a3a;--c-place:#1f9d6b;--c-web:#2a7de1;--c-project:#ef7d1a}.svc{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:5px;margin:6px 0 10px;background:#fff;border:1px solid var(--line,#e5dfcc);border-radius:22px}.svc a{display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 4px;border-radius:17px;color:var(--ink,#26331f);text-decoration:none;font-weight:700;font-size:14px}.svc .ib{display:grid;place-items:center;width:36px;height:36px;border-radius:12px;color:#fff}.svc a[data-s=place] .ib{background:var(--c-place)}.svc a[data-s=web] .ib{background:var(--c-web)}.svc a[data-s=project] .ib{background:var(--c-project)}.svc a.on{box-shadow:inset 0 0 0 2px var(--ac),0 6px 16px rgba(0,0,0,.08);background:#fff}.svc a:not(.on){opacity:.8}.svc a:not(.on):hover{opacity:1;background:var(--sage,#e8efdc)}.stp{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0 0 12px;padding:0;list-style:none;counter-reset:s}.stp li{counter-increment:s;position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;font-size:13px;line-height:1.2;color:var(--ink,#26331f);padding:12px 6px 10px;background:#fff;border:1px solid var(--line,#e5dfcc);border-radius:18px;font-weight:600}.stp li::before{content:counter(s);position:absolute;top:-8px;left:-4px;width:22px;height:22px;border-radius:50%;background:var(--ac);color:#fff;font-size:12px;display:grid;place-items:center}.stp li .ri{color:var(--ac);width:30px;height:30px}.rh{position:relative;overflow:hidden;display:flex;align-items:center;gap:12px;margin:0 0 12px;padding:12px 16px;border-radius:22px;color:#fff;background:linear-gradient(120deg,var(--hc),color-mix(in srgb,var(--hc) 60%,#fff))}.rh img{flex:none;border-radius:50%;background:#fff;border:3px solid rgba(255,255,255,.7)}.rh b{display:block;font-size:22px;line-height:1.1;letter-spacing:-.02em}.rh span{font-size:14px;opacity:.95}.rh svg{position:absolute;right:0;top:0;width:45%;height:100%;pointer-events:none}.btn.ac{background:var(--ac)}';document.head.appendChild(s)})();

/* Carita de Roi por ánimo (0 mal … 4 genial) */
window.ROI_FACE=function(i,z){i=Math.max(0,Math.min(4,i|0));var C=['#e8605a','#f0913a','#f2d05c','#8cc35e','#5fb760'],M=['M33 68Q50 56 67 68','M33 66Q50 58 67 66','M34 64H66','M32 60Q50 76 68 60','M30 58Q50 82 70 58'];
 return '<svg viewBox="0 0 100 100" width="'+(z||32)+'" height="'+(z||32)+'" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="'+C[i]+'"/><circle cx="36" cy="40" r="5" fill="#3a2a1a"/><circle cx="64" cy="40" r="5" fill="#3a2a1a"/>'+(i==0?'<path d="M26 28L44 34M74 28L56 34" stroke="#3a2a1a" stroke-width="5" stroke-linecap="round"/>':'')+'<path d="'+M[i]+'" stroke="#3a2a1a" stroke-width="6" fill="none" stroke-linecap="round"/></svg>'};
