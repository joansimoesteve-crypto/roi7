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
sat:'<rect x="3" y="3" width="18" height="18" rx="4" class="f"/><path d="M3 15l5-4 4 3 3-2 6 4"/>',
eye:'<path d="M2.500 12S6 5.500 12 5.500 21.500 12 21.500 12 18 18.500 12 18.500 2.500 12 2.500 12z" class="f"/><circle cx="12" cy="12" r="2.800"/>'};
window.IC=function(n,s){var b=P[n]||P.spark;return '<svg class="ri" viewBox="0 0 24 24" width="'+(s||24)+'" height="'+(s||24)+'" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+b+'</svg>'};
var st=document.createElement('style');st.textContent='.ri{flex:none;vertical-align:-.2em}.ri .f{fill:currentColor;fill-opacity:.16}';document.head.appendChild(st);
})();
/* Barra única de servicios: ROI_NAV('place'|'web'|'project') */
window.ROI_NAV=function(a){var T=[['place','pin','Lugares','/mapa'],['web','globe','Webs','/v?t=web'],['project','spark','Proyectos','/mapa?k=project']];
 return '<nav class="svc" aria-label="Qué quieres valorar">'+T.map(function(x){return '<a href="'+x[3]+'"'+(x[0]===a?' class="on" aria-current="page"':'')+'>'+IC(x[1],22)+'<span>'+x[2]+'</span></a>'}).join('')+'</nav>'};
(function(){var s=document.createElement('style');s.textContent='.svc{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:5px;margin:6px 0 10px;background:#fff;border:1px solid var(--line,#e5dfcc);border-radius:22px}.svc a{display:flex;flex-direction:column;align-items:center;gap:2px;padding:9px 4px;border-radius:17px;color:var(--moss,#3f5a3a);text-decoration:none;font-weight:700;font-size:14px}.svc a.on{background:var(--moss,#3f5a3a);color:#fff;box-shadow:0 6px 16px rgba(63,90,58,.28)}.svc a:not(.on):hover{background:var(--sage,#e8efdc)}.stp{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0 0 12px;padding:0;list-style:none;counter-reset:s}.stp li{counter-increment:s;position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;font-size:13px;line-height:1.2;color:var(--ink,#26331f);padding:12px 6px 10px;background:#fff;border:1px solid var(--line,#e5dfcc);border-radius:18px;font-weight:600}.stp li::before{content:counter(s);position:absolute;top:-8px;left:-4px;width:22px;height:22px;border-radius:50%;background:var(--moss,#3f5a3a);color:#fff;font-size:12px;display:grid;place-items:center}.stp li .ri{color:var(--moss,#3f5a3a);width:30px;height:30px}';document.head.appendChild(s)})();
