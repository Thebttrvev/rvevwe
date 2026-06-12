/*
   FLOATING TRIANGLES + TWINKLING STARS — global overlay
═══════════════════════════════════════════════════ */
(function(){
  /* ── canvas setup ── */
  var cvs = document.createElement('canvas');
  cvs.id = 'global-tri-canvas';
  cvs.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:8;';
  document.body.appendChild(cvs);
  var ctx = cvs.getContext('2d');
  var W, H;
  function resize(){ W = cvs.width = window.innerWidth; H = cvs.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  /* ── triangles ── */
  var TRI_COUNT = 14;
  var tris = [];
  for(var i = 0; i < TRI_COUNT; i++){
    tris.push({
      x: Math.random() * 1000,
      y: Math.random() * 800,
      size: 8 + Math.random() * 18,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.28,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.008,
      alpha: 0.04 + Math.random() * 0.09,
      col: Math.random() < 0.6 ? '255,31,142' : '200,0,100',
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.012 + Math.random() * 0.018,
      filled: Math.random() < 0.35
    });
  }

  /* ── stars ── */
  var STAR_COUNT = 55;
  var stars = [];
  for(var j = 0; j < STAR_COUNT; j++){
    stars.push({
      x: Math.random() * 1000,
      y: Math.random() * 800,
      r: 0.5 + Math.random() * 1.2,
      alpha: 0.05 + Math.random() * 0.18,
      phase: Math.random() * Math.PI * 2,
      speed: 0.018 + Math.random() * 0.035,
      col: Math.random() < 0.5 ? '255,31,142' : '255,255,255'
    });
  }

  function drawTriangle(t, now){
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.rotate(t.rot);
    var pulse = 0.7 + 0.3 * Math.sin(t.pulse + now * t.pulseSpeed);
    var a = t.alpha * pulse;
    var s = t.size;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s * 0.866, s * 0.5);
    ctx.lineTo(-s * 0.866, s * 0.5);
    ctx.closePath();
    if(t.filled){
      ctx.fillStyle = 'rgba(' + t.col + ',' + (a * 0.5) + ')';
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(' + t.col + ',' + a + ')';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();
  }

  var lastT2 = 0;
  function tick(now){
    if(now - lastT2 < 100){ requestAnimationFrame(tick); return; } /* ~10fps - decorative only */
    lastT2 = now;
    ctx.clearRect(0, 0, W, H);
    var t = now * 0.001;

    /* triangles */
    for(var i = 0; i < tris.length; i++){
      var tr = tris[i];
      tr.x += tr.vx;
      tr.y += tr.vy;
      tr.rot += tr.vr;
      if(tr.x < -50) tr.x = W + 50;
      if(tr.x > W + 50) tr.x = -50;
      if(tr.y < -50) tr.y = H + 50;
      if(tr.y > H + 50) tr.y = -50;
      drawTriangle(tr, t);
    }

    /* stars */
    for(var j = 0; j < stars.length; j++){
      var st = stars[j];
      var sa = st.alpha * (0.4 + 0.6 * Math.abs(Math.sin(st.phase + t * st.speed)));
      ctx.beginPath();
      ctx.arc(st.x * W / 1000, st.y * H / 800, st.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + st.col + ',' + sa + ')';
      ctx.fill();
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
