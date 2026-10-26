/* Team slide (appendix): searchable, filterable, sortable suggestions table. */
(function(){
  var sl=document.querySelector('[data-id="team"]'); if(!sl) return;
  var root=sl.querySelector('.team'), body=sl.querySelector('tbody'), inp=sl.querySelector('#tq');
  var items=[], rowsAll=[], shown=6, open={}, S={q:'',role:'',supp:false,pri:'',own:false,key:'priority',dir:1};
  var PR={now:0,next:1,later:2}, SV={major:0,minor:1,idea:2}, EF={S:0,M:1,L:2};
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function norm(s){return String(s||'').toLowerCase().replace(/[ً-ٰٟۖ-ۭـ]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي');}
  function parse(txt){var out=[]; String(txt).split(/\r?\n/).forEach(function(l){ l=l.trim(); if(!l) return; try{ var o=JSON.parse(l); if(o&&o.id&&o.title){ o.roles=o.roles||[]; o._s=norm([o.title,o.title_ar,o.detail,o.area,o.ceo_note,o.id].join(' ')); out.push(o);} }catch(e){} }); return out;}
  function inRole(o,r){return o.suggested_by===r || (S.supp && o.roles.indexOf(r)>-1);}
  function base(o){ // everything except the role filter
    if(S.pri && o.priority!==S.pri) return false; if(S.own && !o.needs_owner) return false;
    var t=norm(S.q).split(/\s+/).filter(Boolean); for(var i=0;i<t.length;i++) if(o._s.indexOf(t[i])<0) return false; return true; }
  function val(o,k){ switch(k){case 'priority':return PR[o.priority]; case 'severity':return SV[o.severity]; case 'effort':return EF[o.effort];
    case 'suggestion':return norm(o.title); case 'by':return o.suggested_by; case 'area':return o.area||''; case 'note':return o.ceo_note||''; } return 0;}
  function cmp(a,b){ var x=val(a,S.key), y=val(b,S.key), r=x<y?-1:x>y?1:0;
    if(!r && S.key==='priority') r=SV[a.severity]-SV[b.severity]; if(!r) r=a.id<b.id?-1:1; return r*S.dir; }
  function chips(){
    var roles={}; items.forEach(function(o){ roles[o.suggested_by]=1; if(S.supp) o.roles.forEach(function(r){roles[r]=1;}); });
    var list=Object.keys(roles).map(function(r){return [r, items.filter(function(o){return base(o)&&inRole(o,r);}).length];}).sort(function(a,b){return b[1]-a[1]||(a[0]<b[0]?-1:1);});
    var tot=items.filter(base).length;
    var h='<button type="button" class="tchip chip" data-role="" aria-pressed="'+(S.role===''?'true':'false')+'">All<b>'+tot+'</b></button>';
    list.forEach(function(p){ h+='<button type="button" class="tchip chip" data-role="'+esc(p[0])+'" aria-pressed="'+(S.role===p[0]?'true':'false')+'">'+esc(p[0])+'<b>'+p[1]+'</b></button>'; });
    sl.querySelector('#trole').innerHTML=h; }
  function paint(){
    var rows=rowsAll.slice(0,shown), h='';
    rows.forEach(function(o){
      var sup=o.roles.filter(function(r){return r!==o.suggested_by;});
      h+='<tr class="item" data-id="'+esc(o.id)+'"><td class="c-p"><span class="tpill chip '+esc(o.priority)+'">'+esc(o.priority)+'</span>'+(o.needs_owner?'<span class="tpill chip own">needs owner</span>':'')+'</td>'
       +'<td class="sg"><button type="button" class="tt" aria-expanded="'+(open[o.id]?'true':'false')+'">'+esc(o.title)+'</button>'+(o.title_ar?'<span class="ta"><span class="ar" lang="ar">'+esc(o.title_ar)+'</span></span>':'')+'</td>'
       +'<td class="c-by">'+esc(o.suggested_by)+(sup.length?'<span class="tsup chip" title="'+esc('Also: '+sup.join(', '))+'">+'+sup.length+'</span>':'')+'</td>'
       +'<td class="c-a">'+esc(o.area)+'</td><td class="c-e">'+esc(o.effort)+'</td><td class="c-v">'+esc(o.severity)+'</td><td class="n"><span class="nc">'+esc(o.ceo_note)+'</span></td></tr>';
      if(open[o.id]) h+='<tr class="det"><td></td><td colspan="6">'+esc(o.detail)+'<span class="ids chip">'+esc(o.id)+(o.status?' · '+esc(o.status):'')+(o.source_ids&&o.source_ids.length?' · from '+esc(o.source_ids.join(', ')):'')+'</span>'+(o.ceo_note?'<span class="ids chip">CEO: '+esc(o.ceo_note)+'</span>':'')+'</td></tr>';
    });
    if(shown<rowsAll.length) h+='<tr class="more" aria-hidden="true"><td colspan="7"></td></tr>';
    body.innerHTML=h||'<tr><td colspan="7" class="tnone">No suggestions match. Reset the filters.</td></tr>';
  }
  // Rows are added only as far as they fit the visible box; more load as you scroll (keeps every drawn row on the slide).
  function fill(){
    var sc=sl.querySelector('.tscroll'); if(!sc.clientHeight) { shown=Math.max(shown,1); return; }
    shown=1; paint();
    while(shown<rowsAll.length){ shown++; paint(); if(sc.scrollHeight>sc.clientHeight+1){ shown--; paint(); break; } }
    sc.scrollTop=0;
  }
  function more(){
    var sc=sl.querySelector('.tscroll');
    if(shown<rowsAll.length && sc.scrollTop+sc.clientHeight>=sc.scrollHeight-90){ var t=sc.scrollTop; shown=Math.min(rowsAll.length,shown+12); paint(); sc.scrollTop=t; }
  }
  function render(){
    chips();
    rowsAll=items.filter(function(o){return base(o)&&(!S.role||inRole(o,S.role));}).sort(cmp);
    paint(); fill();
    sl.querySelector('#tcount').textContent=rowsAll.length+' of '+items.length;
    sl.querySelectorAll('th').forEach(function(th){ th.setAttribute('aria-sort', th.dataset.key===S.key?(S.dir>0?'ascending':'descending'):'none'); });
    sl.querySelectorAll('[data-pri]').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.pri===S.pri);});
    sl.querySelector('#town').setAttribute('aria-pressed',S.own); sl.querySelector('#tsup').setAttribute('aria-pressed',S.supp);
    var ls=sl.querySelectorAll('.lede [data-n]'); if(ls.length){ ls[0].textContent=Object.keys(items.reduce(function(m,o){m[o.suggested_by]=1;return m;},{})).length; ls[1].textContent=items.length; }
  }
  function set(txt){ var p=parse(txt); if(p.length){ items=p; render(); return true;} return false; }
  var inline=document.getElementById('team-data'); set(inline?inline.textContent:'');
  if(/^https?:$/.test(location.protocol) && window.fetch){
    fetch('../claudeteam/suggestions.jsonl',{cache:'no-store'}).then(function(r){return r.ok?r.text():Promise.reject();}).then(set).catch(function(){});
  }
  // keys typed in the search box never reach the deck's shortcuts
  inp.addEventListener('keydown',function(e){ e.stopPropagation(); if(e.key==='Escape'){ if(inp.value){inp.value='';S.q='';render();} else inp.blur(); } });
  inp.addEventListener('keyup',function(e){e.stopPropagation();}); inp.addEventListener('keypress',function(e){e.stopPropagation();});
  inp.addEventListener('input',function(){ S.q=inp.value; render(); });
  root.addEventListener('click',function(e){
    e.stopPropagation(); var t=e.target;
    var c=t.closest('.tchip[data-role]'); if(c){ S.role=c.dataset.role; render(); return; }
    var p=t.closest('[data-pri]'); if(p){ S.pri=p.dataset.pri; render(); return; }
    if(t.closest('#town')){ S.own=!S.own; render(); return; }
    if(t.closest('#tsup')){ S.supp=!S.supp; render(); return; }
    if(t.closest('#treset')){ S={q:'',role:'',supp:false,pri:'',own:false,key:'priority',dir:1}; inp.value=''; open={}; render(); return; }
    var h=t.closest('th button'); if(h){ var k=h.parentNode.dataset.key; if(S.key===k) S.dir=-S.dir; else {S.key=k;S.dir=1;} render(); return; }
    var r=t.closest('tr.item'); if(r){ var id=r.dataset.id; open[id]=!open[id]; var sc0=sl.querySelector('.tscroll').scrollTop; paint(); sl.querySelector('.tscroll').scrollTop=sc0; var b=body.querySelector('tr.item[data-id="'+id+'"] .tt'); if(b&&t.closest('.tt')) b.focus(); }
  });
  sl.querySelector('.tscroll').addEventListener('scroll',more);
  new MutationObserver(function(){ if(sl.classList.contains('is-current')) fill(); }).observe(sl,{attributes:true,attributeFilter:['class']});
  addEventListener('resize',function(){ fill(); });
  root.addEventListener('wheel',function(e){e.stopPropagation();},{passive:true});
})();
