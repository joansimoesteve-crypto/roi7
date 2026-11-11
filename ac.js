/* Autocompletar Roi · RoiAC(input,{t:'place'|'web'|'org'|'person', bias:()=>[lat,lng]|null, pick:(item)=>{}}) */
(function(){
window.RoiAC=function(inp,o){
  var wrap=inp.parentNode;if(getComputedStyle(wrap).position==='static')wrap.style.position='relative';wrap.style.zIndex='3000';
  var ul=document.createElement('ul');ul.className='acl';ul.setAttribute('role','listbox');ul.hidden=true;wrap.appendChild(ul);
  inp.setAttribute('autocomplete','off');inp.setAttribute('role','combobox');inp.setAttribute('aria-expanded','false');
  var tm=0,ctl=null,items=[],cur=-1;
  function close(){ul.hidden=true;inp.setAttribute('aria-expanded','false');cur=-1}
  function mark(){[].forEach.call(ul.children,function(li,i){li.classList.toggle('on',i===cur)})}
  function choose(i){var it=items[i];if(!it)return;close();o.pick(it)}
  function show(list){items=list;ul.textContent='';
    if(!list.length){close();return}
    list.forEach(function(it,i){var li=document.createElement('li');li.setAttribute('role','option');
      li.innerHTML=IC(it.src==='direct'||it.kind==='web'?'globe':it.src==='wikidata'?'build':'pin',20)+'<span><b></b><small></small></span>';
      li.querySelector('b').textContent=it.name;li.querySelector('small').textContent=it.host&&it.src!=='direct'?(it.sub?it.sub+' · ':'')+it.host:(it.sub||'');
      li.onmousedown=function(e){e.preventDefault();choose(i)};li.ontouchstart=function(){};ul.appendChild(li)});
    ul.hidden=false;inp.setAttribute('aria-expanded','true');cur=-1}
  inp.addEventListener('input',function(){clearTimeout(tm);var q=inp.value.trim();if(q.length<2){close();return}
    tm=setTimeout(function(){if(ctl)ctl.abort();ctl=window.AbortController?new AbortController():null;
      var b=o.bias&&o.bias(),u='/api/search?t='+(o.t||'place')+'&q='+encodeURIComponent(q)+(b?'&lat='+b[0]+'&lng='+b[1]:'');
      fetch(u,ctl?{signal:ctl.signal}:{}).then(function(r){return r.json()}).then(function(j){if(inp.value.trim()===q)show((j&&j.results)||[])}).catch(function(){})},230)});
  inp.addEventListener('keydown',function(e){if(ul.hidden)return;
    if(e.key==='ArrowDown'){e.preventDefault();cur=Math.min(items.length-1,cur+1);mark()}
    else if(e.key==='ArrowUp'){e.preventDefault();cur=Math.max(0,cur-1);mark()}
    else if(e.key==='Enter'&&cur>=0){e.preventDefault();choose(cur)}
    else if(e.key==='Escape')close()});
  inp.addEventListener('blur',function(){setTimeout(close,150)});
  return{close:close}};
var st=document.createElement('style');st.textContent='.acl{position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:3000;margin:0;padding:6px;list-style:none;background:#fff;border:1px solid var(--line,#e5dfcc);border-radius:18px;box-shadow:0 14px 34px rgba(38,51,31,.16);max-height:300px;overflow:auto}.acl li{display:flex;gap:10px;align-items:center;padding:9px 10px;font-size:14px;border-radius:12px;cursor:pointer;color:var(--moss,#3f5a3a)}.acl li span{display:flex;flex-direction:column;min-width:0}.acl li b{font-weight:600;color:var(--ink,#26331f);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.acl li small{font-size:12px;color:var(--mut,#6b7560);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.acl li.on,.acl li:hover{background:var(--sage,#e8efdc)}';document.head.appendChild(st);
})();
