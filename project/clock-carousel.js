(function(){
  var days = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัส','ศุกร์','เสาร์'];
  var months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  function pad(n){ return n < 10 ? '0'+n : ''+n; }
  function tick(){
    var now = new Date();
    var dateEl = document.getElementById('profile-date-display');
    var timeEl = document.getElementById('profile-time-display');
    if(dateEl) dateEl.textContent = days[now.getDay()] + ' ' + now.getDate() + ' ' + months[now.getMonth()] + ' ' + (now.getFullYear()+543);
    if(timeEl) timeEl.textContent = pad(now.getHours()) + ':' + pad(now.getMinutes());
  }
  tick();
  setInterval(tick, 1000);
})();

/* ══ PROFILE QUOTE ══ */
(function(){
  var quotes = [
    'เล่นให้สุด พักให้เป็น ชีวิตจะดีเอง 🎮',
    'ทุกความผิดพลาดคือ checkpoint ก่อน boss fight ⚔️',
    'อย่ารอให้พร้อมก่อน จงเริ่มเลยแล้วค่อยพัฒนา 🚀',
    'เก่งขึ้นทุกวันสักนิด ดีกว่าเก่งขึ้นวันเดียวมาก ✨',
    'ทีมที่ดีไม่ใช่ทีมที่ไม่มีปัญหา แต่คือทีมที่แก้ปัญหาด้วยกัน 💜',
    'มาวันนี้ คือก้าวที่กล้าที่สุดแล้ว 🌸',
    'ความสนุกอยู่ที่กระบวนการ ไม่ใช่แค่ผล 🎯',
    'GG = Good Game — จบทุก session ด้วยใจที่ดี 🕹️',
  ];
  var el = document.getElementById('profile-quote');
  if(el){
    var idx = new Date().getDate() % quotes.length;
    el.textContent = quotes[idx];
  }
})();

/* ══ TIER TRACK CAROUSEL — drag / wheel / touch / buttons ══ */
(function(){
  var PER_PAGE  = 3;
  var page      = 0;
  var offset    = 0;

  var drag = { active:false, startX:0, startOff:0, velX:0, lastX:0, lastT:0, moved:false };

  function tracks(){
    return ['bp-free-track','bp-num-track','bp-tier-track']
      .map(function(id){ return document.getElementById(id); }).filter(Boolean);
  }
  function mainTrack(){ return document.getElementById('bp-tier-track'); }
  function totalCols(){ var t=mainTrack(); return t ? t.children.length : 0; }

  /* colWidth: ความกว้างจริงของ 1 column */
  function colWidth(){
    var t = mainTrack();
    if(!t || !t.children.length) return 96;
    return t.children[0].getBoundingClientRect().width || t.children[0].offsetWidth || 96;
  }

  /* vpWidth: ความกว้างที่มองเห็นได้จริงใน viewport */
  function vpWidth(){
    var vp = document.getElementById('bp-tier-viewport');
    if(!vp) return 300;
    var style = window.getComputedStyle(vp);
    var px = parseFloat(style.paddingLeft||0) + parseFloat(style.paddingRight||0);
    return vp.clientWidth - px;
  }

  /* maxOffset: คำนวณจาก children จริง ไม่ใช่ scrollWidth */
  function maxOffset(){
    var t = mainTrack();
    if(!t || !t.children.length) return 0;
    var n   = t.children.length;
    var cw  = colWidth();
    var total = n * cw;
    return Math.max(0, total - vpWidth());
  }

  function clamp(v){ return Math.max(0, Math.min(v, maxOffset())); }

  function applyOffset(px){
    offset = clamp(px);
    tracks().forEach(function(tr){
      tr.style.transition = 'none';
      tr.style.transform  = 'translateX(-' + offset + 'px)';
    });
  }

  function snapToOffset(px, dur){
    offset = clamp(px);
    var ms = dur || 320;
    tracks().forEach(function(tr){
      tr.style.transition = 'transform ' + ms + 'ms cubic-bezier(.4,0,.2,1)';
      tr.style.transform  = 'translateX(-' + offset + 'px)';
    });
    var cw = colWidth()||96;
    page = Math.max(0, Math.min(Math.round(offset / (cw * PER_PAGE)), Math.ceil(totalCols()/PER_PAGE)-1));
    updateUI();
  }

  function offsetForPage(p){
    var t = mainTrack();
    if(!t || !t.children.length) return 0;
    var pages = Math.ceil(totalCols()/PER_PAGE);
    p = Math.max(0, Math.min(p, pages-1));
    var cw  = colWidth()||96;
    var raw = p * PER_PAGE * cw;
    /* ให้โผล่ขอบขวานิดหน่อย เพื่อให้รู้ว่ายังมีต่อ */
    if(p < pages-1) raw -= 12;
    return clamp(raw);
  }

  function snapToPage(p){
    var pages = Math.ceil(totalCols()/PER_PAGE);
    page = Math.max(0, Math.min(p, pages-1));
    snapToOffset(offsetForPage(page));
  }

  function updateUI(){
    var total = totalCols();
    var pages = Math.ceil(total/PER_PAGE) || 1;
    page = Math.max(0, Math.min(page, pages-1));

    var pos  = document.getElementById('bp-track-pos');
    var dots = document.getElementById('bp-track-dots');
    var prev = document.getElementById('bp-prev');
    var next = document.getElementById('bp-next');

    if(pos) pos.textContent = (page+1)+'/'+pages;

    if(dots){
      dots.innerHTML = '';
      for(var i=0;i<pages;i++){
        var d = document.createElement('div');
        var active = i===page;
        d.style.cssText = 'width:'+(active?'22':'7')+'px;height:7px;border-radius:4px;'
          +'background:'+(active?'#C4688A':'rgba(210,150,175,0.2)')+';'
          +'transition:all .3s;cursor:pointer;flex-shrink:0;'
          +'box-shadow:'+(active?'0 0 10px rgba(196,104,138,0.6)':'none')+';';
        (function(idx){ d.addEventListener('click', function(){ snapToPage(idx); }); })(i);
        dots.appendChild(d);
      }
    }
    if(prev){ var s=page<=0; prev.style.opacity=s?'0.2':'1'; prev.style.pointerEvents=s?'none':'auto'; }
    if(next){ var e=page>=pages-1; next.style.opacity=e?'0.2':'1'; next.style.pointerEvents=e?'none':'auto'; }
  }

  /* ── เก็บ ref ของ listeners เพื่อ removeEventListener ── */
  var _mmove=null, _mup=null;

  function setup(){
    var prev  = document.getElementById('bp-prev');
    var next  = document.getElementById('bp-next');
    var vp    = document.getElementById('bp-tier-viewport');
    var shell = document.getElementById('bp-track-container');
    if(!prev||!next||!vp||prev._bpReady) return false;
    prev._bpReady = true;

    prev.addEventListener('click', function(e){ e.stopPropagation(); window._bpCarouselUserScrolled=true; snapToPage(page-1); });
    next.addEventListener('click', function(e){ e.stopPropagation(); window._bpCarouselUserScrolled=true; snapToPage(page+1); });

    var dragEl = shell || vp;
    dragEl.style.cursor = 'grab';

    /* ── Mouse drag ── */
    dragEl.addEventListener('mousedown', function(e){
      if(e.target.closest && e.target.closest('.bp3-nav')) return;
      if(e.button !== 0) return;
      e.preventDefault();
      window._bpCarouselUserScrolled = true;
      drag.active=true; drag.startX=e.clientX; drag.startOff=offset;
      drag.velX=0; drag.lastX=e.clientX; drag.lastT=Date.now(); drag.moved=false;
      dragEl.style.cursor='grabbing';
      tracks().forEach(function(tr){ tr.style.transition='none'; });
    });

    if(_mmove) window.removeEventListener('mousemove',_mmove);
    if(_mup)   window.removeEventListener('mouseup',_mup);

    _mmove = function(e){
      if(!drag.active) return;
      var dx  = e.clientX - drag.startX;
      var now = Date.now();
      if(Math.abs(dx)>3) drag.moved=true;
      drag.velX  = (e.clientX-drag.lastX) / Math.max(1, now-drag.lastT);
      drag.lastX = e.clientX; drag.lastT=now;
      applyOffset(drag.startOff - dx);
    };
    _mup = function(){
      if(!drag.active) return;
      drag.active=false;
      dragEl.style.cursor='grab';
      if(!drag.moved){ updateUI(); return; }
      var fling = offset - drag.velX*180;
      var cw    = colWidth()||96;
      page = Math.round(fling / (cw*PER_PAGE));
      snapToOffset(offsetForPage(page), 360);
    };
    window.addEventListener('mousemove', _mmove);
    window.addEventListener('mouseup',   _mup);

    /* ── Wheel ── */
    dragEl.addEventListener('wheel', function(e){
      e.preventDefault(); e.stopPropagation();
      var delta = Math.abs(e.deltaX)>Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      applyOffset(offset + delta*1.2);
      clearTimeout(dragEl._wt);
      dragEl._wt = setTimeout(function(){
        var cw = colWidth()||96;
        page = Math.round(offset/(cw*PER_PAGE));
        page = Math.max(0, Math.min(page, Math.ceil(totalCols()/PER_PAGE)-1));
        snapToOffset(offsetForPage(page), 280);
      }, 150);
    },{passive:false});

    /* ── Touch ── */
    var tX=0,tY=0,tOff=0,tSwipe=false,tVel=0,tLast=0,tLastT=0;
    dragEl.addEventListener('touchstart', function(e){
      tX=e.touches[0].clientX; tY=e.touches[0].clientY;
      tOff=offset; tSwipe=false; tVel=0; tLast=tX; tLastT=Date.now();
      window._bpCarouselUserScrolled=true;
      tracks().forEach(function(tr){ tr.style.transition='none'; });
    },{passive:true});
    dragEl.addEventListener('touchmove', function(e){
      var dx=e.touches[0].clientX-tX, dy=e.touches[0].clientY-tY;
      if(!tSwipe && Math.abs(dx)>Math.abs(dy) && Math.abs(dx)>8) tSwipe=true;
      if(!tSwipe) return;
      e.preventDefault();
      var now=Date.now();
      tVel=(e.touches[0].clientX-tLast)/Math.max(1,now-tLastT);
      tLast=e.touches[0].clientX; tLastT=now;
      applyOffset(tOff-dx);
    },{passive:false});
    dragEl.addEventListener('touchend', function(e){
      if(!tSwipe) return;
      var dx=e.changedTouches[0].clientX-tX;
      var fling = offset - tVel*180;
      var cw=colWidth()||96;
      page=Math.round(fling/(cw*PER_PAGE));
      snapToOffset(offsetForPage(page), 360);
    },{passive:true});

    requestAnimationFrame(updateUI);
    return true;
  }

  var tries=0, iv=setInterval(function(){
    if(setup()||++tries>60) clearInterval(iv);
  },150);

  /* reset เมื่อกลับมาที่ BP tab */
  document.addEventListener('click',function(ev){
    if(ev.target.closest && ev.target.closest('#stab-battlepass')){
      setTimeout(function(){
        var prev=document.getElementById('bp-prev');
        if(prev) prev._bpReady=false;
        page=0; offset=0; tries=0;
        window._bpCarouselUserScrolled=false;
        clearInterval(iv);
        iv=setInterval(function(){ if(setup()||++tries>60) clearInterval(iv); },150);
      },400);
    }
  });

  window.addEventListener('resize', function(){
    var mx=maxOffset();
    if(offset>mx){ offset=mx; tracks().forEach(function(tr){ tr.style.transform='translateX(-'+offset+'px)'; }); }
    updateUI();
  });

  window._bpCarouselRender = updateUI;
  window._bpCarouselGoTo   = function(tierIdx){
    if(window._bpCarouselUserScrolled){ updateUI(); return; }
    page = Math.floor(tierIdx/PER_PAGE);
    setTimeout(function(){ snapToPage(page); }, 300);
  };
})();
</script>
