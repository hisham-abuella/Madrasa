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
  // writing pad: built when its slide is on screen so the line height matches the stage scale
  var padW=0;
  function pad(){
    var host=document.querySelector('[data-pad]');if(!host||!window.KS)return;
    var deck=document.querySelector('.deck'),s=deck.getBoundingClientRect().width/deck.offsetWidth||1;
    var w=host.getBoundingClientRect().width;if(w<50)return;
    if(host.__pad&&Math.abs(padW-s)<0.01)return;
    host.__pad=null;host.innerHTML='';padW=s;
    KS.writePad(host,{model:['ة','هَذِهِ'],lines:2,lineHeight:150*s});
    var st=host.querySelector('.wp-stage');st.style.height=(300)+'px';
  }
  function init(){foot();stops();audio();
    var sl=document.querySelector('[data-id="write"]');
    if(sl){new MutationObserver(function(){if(sl.classList.contains('is-current'))setTimeout(pad,120);}).observe(sl,{attributes:true,attributeFilter:['class']});
      setTimeout(pad,300);}
    window.addEventListener('resize',function(){setTimeout(pad,250);});}
  if(document.readyState==='complete')setTimeout(init,50);else window.addEventListener('load',function(){setTimeout(init,50);});
})();
