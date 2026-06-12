/*
   AURORA — แสงเหนือ ribbon หน้า login
   หลายชั้น ไหลช้า shimmer ละเอียด สีชมพู-ม่วง
═══════════════════════════════════════════════════ */
(function(){
  var canvas = document.getElementById('login-aurora-canvas');
  if(!canvas) return;
  canvas.style.willChange = 'transform';
  var ctx = canvas.getContext('2d');
  var W, H;

  function resize(){
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── ribbon definition ──
     each ribbon = sine wave band flowing across screen
     y0      = base Y position (0–1 of H)
     amp     = wave amplitude (px)
     freq    = spatial frequency of wave
     speed   = how fast the wave phase moves
     drift   = slow vertical drift speed
     thick   = band thickness (px)
     color   = [r,g,b]
     alpha   = max opacity
     shimmer = brightness oscillation speed
  */
  var ribbons = [
    { y0:0.20, amp:25,  freq:0.0010, speed:0.00004, drift: 0.000008, thick:80,  color:[255,0,110],   alpha:0.022, shimmer:0.00012, sPhase:0.0   },
    { y0:0.42, amp:42,  freq:0.0007, speed:0.00002, drift:-0.000004, thick:130, color:[160,0,80],    alpha:0.016, shimmer:0.00006, sPhase:0.8   },
    { y0:0.10, amp:18,  freq:0.0009, speed:0.00007, drift: 0.000006, thick: 55, color:[255,80,180],  alpha:0.015, shimmer:0.00014, sPhase:2.5   },
  ];

  var t = 0;

  /* draw one ribbon pass — single gradient path (fast) */
  function drawRibbon(r, tt){
    var baseY  = r.y0 * H + Math.sin(r.drift * tt * 1000 + r.sPhase) * H * 0.05;
    var phase  = r.speed * tt * 1000;
    var sVal   = 0.6 + 0.4 * Math.sin(r.shimmer * tt * 1000 + r.sPhase);
    var alpha  = r.alpha * sVal;
    var rc = r.color;

    var grad = ctx.createLinearGradient(0, baseY - r.thick, 0, baseY + r.thick);
    grad.addColorStop(0,   'rgba('+rc[0]+','+rc[1]+','+rc[2]+',0)');
    grad.addColorStop(0.35,'rgba('+rc[0]+','+rc[1]+','+rc[2]+','+(alpha*0.7)+')');
    grad.addColorStop(0.50,'rgba('+rc[0]+','+rc[1]+','+rc[2]+','+alpha+')');
    grad.addColorStop(0.65,'rgba('+rc[0]+','+rc[1]+','+rc[2]+','+(alpha*0.7)+')');
    grad.addColorStop(1,   'rgba('+rc[0]+','+rc[1]+','+rc[2]+',0)');

    ctx.beginPath();
    var step = 16;
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

  /* subtle shimmer overlay — thin bright line at ribbon peak */
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
    ctx.strokeStyle = 'rgba(222,180,198,'+(sVal * r.alpha * 0.25)+')';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  var lastT = 0;
  function tick(now){
    if(now - lastT < 66){ requestAnimationFrame(tick); return; } // ~15fps
    lastT = now;
    t++;
    ctx.clearRect(0, 0, W, H);

    /* draw back ribbons first (large, dim) */
    for(var i = ribbons.length - 1; i >= 0; i--){
      drawRibbon(ribbons[i], t);
    }
    /* shimmer lines on top */
    for(var j = 0; j < ribbons.length; j++){
      drawShimmer(ribbons[j], t);
    }

    requestAnimationFrame(tick);
  }
  tick(0);
})();
