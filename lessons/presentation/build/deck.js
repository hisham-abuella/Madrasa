(function(){
  var FOOT='مَدْرَسَةُ نَوْرَس لِلْفُصْحَى · هَذَا وَهَذِهِ';
  function foot(){document.querySelectorAll('.kp-foot span:first-child').forEach(function(s){s.textContent=FOOT;});}
  // stop clicks and strokes inside live widgets from advancing the deck
  function stops(){document.querySelectorAll('.bx-ui').forEach(function(w){
    if(w.__stop)return;w.__stop=1;
    ['click','pointerdown'].forEach(function(t){w.addEventListener(t,function(e){e.stopPropagation();});});});}
  // listen buttons: play only on tap, stop when the slide is left
  function audio(){document.querySelectorAll('.listen').forEach(function(b){
    var a=b.parentElement.querySelector('audio'),sl=b.closest('.slide');
    b.addEventListener('click',function(){
      if(!a.paused){a.pause();a.currentTime=0;b.classList.remove('on');return;}
      document.querySelectorAll('.deck audio').forEach(function(x){x.pause();});
      document.querySelectorAll('.listen.on').forEach(function(x){x.classList.remove('on');});
      var p=a.play();if(p&&p.catch)p.catch(function(){});b.classList.add('on');});
    a.addEventListener('ended',function(){b.classList.remove('on');});
    new MutationObserver(function(){if(!sl.classList.contains('is-current')){a.pause();a.currentTime=0;b.classList.remove('on');}})
      .observe(sl,{attributes:true,attributeFilter:['class']});});}
  // writing pads: built when their slide is on screen so the line height matches the stage scale.
  // --inv (1/scale, capped) lets kid-facing controls keep a >= 56 CSS px hit area at any stage scale.
  function inv(){var deck=document.querySelector('.deck');if(!deck)return 1;
    var s=deck.getBoundingClientRect().width/deck.offsetWidth||1;deck.style.setProperty('--inv',Math.min(1/s,2.6).toFixed(3));return s;}
  function pad(){
    if(!window.KS)return;var s=inv();
    document.querySelectorAll('[data-pad]').forEach(function(host){
      if(!host.closest('.slide').classList.contains('is-current')&&host.__pad)return;
      var w=host.getBoundingClientRect().width;if(w<50)return;
      if(host.__pad&&Math.abs(host.__s-s)<0.01)return;
      host.__pad=null;host.innerHTML='';host.__s=s;
      var m=host.getAttribute('data-model')||'',n=+host.getAttribute('data-lines')||1,lh=+host.getAttribute('data-lh')||150;
      KS.writePad(host,{model:m?m.split('|'):[],lines:n,lineHeight:lh*s});
      host.querySelector('.wp-stage').style.height=(n*lh)+'px';
    });
  }
  function init(){foot();stops();audio();
    inv();
    document.querySelectorAll('[data-pad]').forEach(function(h){var sl=h.closest('.slide');
      new MutationObserver(function(){if(sl.classList.contains('is-current'))setTimeout(pad,120);}).observe(sl,{attributes:true,attributeFilter:['class']});});
    setTimeout(pad,300);
    window.addEventListener('resize',function(){setTimeout(pad,250);});}
  if(document.readyState==='complete')setTimeout(init,50);else window.addEventListener('load',function(){setTimeout(init,50);});
})();
