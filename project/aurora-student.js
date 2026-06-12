/*
   STUDENT SCREEN AURORA — same ribbon effect as login
═══════════════════════════════════════════════════ */
(function(){
  /* create aurora canvas at body level */
  var canvas = document.createElement('canvas');
  canvas.id = 'student-aurora-canvas';
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;display:none;will-change:transform;';
  document.body.appendChild(canvas);
  /* show/hide with student screen */
  var _sScreen = null;
  function _checkAuroraVis(){
    if(!_sScreen) _sScreen = document.getElementById('student-screen');
    canvas.style.display = (_sScreen && _sScreen.classList.contains('active')) ? 'block' : 'none';
  }
  setInterval(_checkAuroraVis, 300);
  var ctx = canvas.getContext('2d');
  var W, H;
  function resize(){
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── ribbon config เหมือน login เป๊ะๆ — alpha สูงขึ้น มองเห็นชัด ── */
  var ribbons = [
    { y0:0.18, amp:30,  freq:0.0010, speed:0.00004, drift: 0.000008, thick:110, color:[255,0,110],   alpha:0.18, shimmer:0.00012, sPhase:0.0   },
    { y0:0.45, amp:50,  freq:0.0007, speed:0.00002, drift:-0.000004, thick:160, color:[160,0,80],    alpha:0.14, shimmer:0.00006, sPhase:0.8   },
    { y0:0.72, amp:35,  freq:0.0008, speed:0.00003, drift: 0.000006, thick:120, color:[255,31,142],  alpha:0.15, shimmer:0.00010, sPhase:1.8   },
    { y0:0.08, amp:20,  freq:0.0009, speed:0.00007, drift: 0.000006, thick: 70, color:[255,80,180],  alpha:0.12, shimmer:0.00014, sPhase:2.5   },
  ];
  var t = 0;

  function drawRibbon(r, tt){
    var baseY  = r.y0 * H + Math.sin(r.drift * tt * 1000 + r.sPhase) * H * 0.05;
    var phase  = r.speed * tt * 1000;
    var sVal   = 0.55 + 0.45 * Math.sin(r.shimmer * tt * 1000 + r.sPhase);
    var alpha  = r.alpha * sVal;
    var rc = r.color;

    var grad = ctx.createLinearGradient(0, baseY - r.thick, 0, baseY + r.thick);
    grad.addColorStop(0,   'rgba('+rc[0]+','+rc[1]+','+rc[2]+',0)');
    grad.addColorStop(0.30,'rgba('+rc[0]+','+rc[1]+','+rc[2]+','+(alpha*0.6)+')');
    grad.addColorStop(0.50,'rgba('+rc[0]+','+rc[1]+','+rc[2]+','+alpha+')');
    grad.addColorStop(0.70,'rgba('+rc[0]+','+rc[1]+','+rc[2]+','+(alpha*0.6)+')');
    grad.addColorStop(1,   'rgba('+rc[0]+','+rc[1]+','+rc[2]+',0)');

    ctx.beginPath();
    var step = 12;
    ctx.moveTo(0, baseY - r.thick + Math.sin(r.freq * 0 + phase) * r.amp);
    for(var x = 0; x <= W; x += step){
      var wave = Math.sin(r.freq * x + phase) * r.amp + Math.sin(r.freq * x * 1.6 + phase * 0.5) * r.amp * 0.25;
      ctx.lineTo(x, baseY - r.thick + wave);
    }
    for(var x2 = W; x2 >= 0; x2 -= step){
      var wave2 = Math.sin(r.freq * x2 + phase) * r.amp + Math.sin(r.freq * x2 * 1.6 + phase * 0.5) * r.amp * 0.25;
      ctx.lineTo(x2, baseY + r.thick + wave2);
    }
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  }
  function drawShimmer(r, tt){
    var baseY = r.y0 * H + Math.sin(r.drift * tt * 1000 + r.sPhase) * H * 0.06;
    var phase = r.speed * tt * 1000;
    var sVal  = 0.3 + 0.7 * Math.abs(Math.sin(r.shimmer * tt * 1000 * 1.8 + r.sPhase + 1));
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    for(var x = 0; x <= W; x += 4){
      var cy = baseY + Math.sin(r.freq * x + phase) * r.amp
                     + Math.sin(r.freq * x * 1.7 + phase * 0.6) * r.amp * 0.3;
      ctx.lineTo(x, cy);
    }
    ctx.strokeStyle = 'rgba(222,180,198,'+(sVal * r.alpha * 0.6)+')';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  var lastT = 0;
  function tick(now){
    if(now - lastT < 33){ requestAnimationFrame(tick); return; } /* ~30fps — ชัดขึ้น */
    lastT = now;
    t++;
    ctx.clearRect(0, 0, W, H);
    for(var i = ribbons.length - 1; i >= 0; i--) drawRibbon(ribbons[i], t);
    for(var j = 0; j < ribbons.length; j++)       drawShimmer(ribbons[j], t);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
