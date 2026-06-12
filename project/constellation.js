/*
   STUDENT SCREEN — CONSTELLATION + TRIANGLES + STARS
   (same effect as login screen)
═══════════════════════════════════════════════════ */
(function(){
  var cvs = document.createElement('canvas');
  cvs.id = 'student-tri-canvas';
  cvs.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:5;display:none;';
  document.body.appendChild(cvs);
  var ctx = cvs.getContext('2d');
  var W, H;
  /* show/hide with student screen */
  var studentScreen = null;
  function checkVisibility(){
    if(!studentScreen) studentScreen = document.getElementById('student-screen');
    var visible = studentScreen && studentScreen.classList.contains('active');
    cvs.style.display = visible ? 'block' : 'none';
  }
  setInterval(checkVisibility, 300);
  function resize(){ W = cvs.width = window.innerWidth; H = cvs.height = window.innerHeight; initParticles(); }
  window.addEventListener('resize', resize);

  /* ── constellation nodes ── */
  var nodes = [];
  var NODE_COUNT = 38;
  function initParticles(){
    nodes = [];
    for(var i = 0; i < NODE_COUNT; i++){
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random()-0.5)*0.22,
        vy: (Math.random()-0.5)*0.18,
        r: 0.8 + Math.random()*1.4,
        alpha: 0.06 + Math.random()*0.18,
        phase: Math.random()*Math.PI*2,
        speed: 0.015 + Math.random()*0.03,
        col: Math.random()<0.5?'255,31,142':'255,255,255'
      });
    }
    /* ── triangles ── */
    tris = [];
    for(var t=0;t<12;t++){
      tris.push({
        x: Math.random()*W, y: Math.random()*H,
        size: 8+Math.random()*18,
        vx: (Math.random()-0.5)*0.32, vy: (Math.random()-0.5)*0.25,
        rot: Math.random()*Math.PI*2, vr: (Math.random()-0.5)*0.007,
        alpha: 0.04+Math.random()*0.09,
        col: Math.random()<0.6?'255,31,142':'200,0,100',
        pulse: Math.random()*Math.PI*2, pulseSpeed: 0.012+Math.random()*0.018,
        filled: Math.random()<0.35
      });
    }
  }
  var tris = [];
  resize();

  var CONNECT_DIST = 130;

  function drawTri(tr, now){
    ctx.save();
    ctx.translate(tr.x, tr.y);
    ctx.rotate(tr.rot);
    var pulse = 0.7+0.3*Math.sin(tr.pulse+now*tr.pulseSpeed);
    var a = tr.alpha*pulse;
    var s = tr.size;
    ctx.beginPath();
    ctx.moveTo(0,-s); ctx.lineTo(s*0.866,s*0.5); ctx.lineTo(-s*0.866,s*0.5);
    ctx.closePath();
    if(tr.filled){ ctx.fillStyle='rgba('+tr.col+','+(a*0.5)+')'; ctx.fill(); }
    ctx.strokeStyle='rgba('+tr.col+','+a+')';
    ctx.lineWidth=0.8; ctx.stroke();
    ctx.restore();
  }

  var lastT=0;
  function tick(now){
    if(now-lastT<80){ requestAnimationFrame(tick); return; } /* ~12fps */
    lastT=now;
    ctx.clearRect(0,0,W,H);
    var t = now*0.001;

    /* nodes move + wrap */
    for(var i=0;i<nodes.length;i++){
      var n=nodes[i];
      n.x+=n.vx; n.y+=n.vy;
      if(n.x<0)n.x=W; if(n.x>W)n.x=0;
      if(n.y<0)n.y=H; if(n.y>H)n.y=0;
    }

    /* constellation lines */
    for(var i=0;i<nodes.length;i++){
      for(var j=i+1;j<nodes.length;j++){
        var dx=nodes[i].x-nodes[j].x, dy=nodes[i].y-nodes[j].y;
        var d=Math.sqrt(dx*dx+dy*dy);
        if(d<CONNECT_DIST){
          var a=(1-d/CONNECT_DIST)*0.12;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x,nodes[i].y);
          ctx.lineTo(nodes[j].x,nodes[j].y);
          ctx.strokeStyle='rgba(196,104,138,'+a+')';
          ctx.lineWidth=0.6; ctx.stroke();
        }
      }
    }

    /* star dots */
    for(var i=0;i<nodes.length;i++){
      var n=nodes[i];
      var sa=n.alpha*(0.4+0.6*Math.abs(Math.sin(n.phase+t*n.speed)));
      ctx.beginPath();
      ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
      ctx.fillStyle='rgba('+n.col+','+sa+')';
      ctx.fill();
    }

    /* triangles */
    for(var i=0;i<tris.length;i++){
      var tr=tris[i];
      tr.x+=tr.vx; tr.y+=tr.vy; tr.rot+=tr.vr;
      if(tr.x<-50)tr.x=W+50; if(tr.x>W+50)tr.x=-50;
      if(tr.y<-50)tr.y=H+50; if(tr.y>H+50)tr.y=-50;
      drawTri(tr,t);
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
