/*
   LOGO EXPLODE FX — วงกลมระเบิด + เส้นพุ่ง + glow
   ใช้กับ: splash canvas + login canvas
═══════════════════════════════════════════════════ */
(function(){

  function createExplodeFX(canvas, opts){
    if(!canvas) return;
    opts = opts || {};
    var R = opts.radius || 160;   // ขนาด canvas ครึ่งหนึ่ง
    var SIZE = R * 2;
    canvas.width  = SIZE;
    canvas.height = SIZE;
    canvas.style.width  = SIZE + 'px';
    canvas.style.height = SIZE + 'px';

    var ctx = canvas.getContext('2d');
    var cx = R, cy = R;
    var t = 0;

    /* ── วงกลมซ้อน ── */
    var rings = [
      { r: R*0.28, speed: 0.008,  dir:  1, dash: [6,8],   alpha: 0.85, w: 2.2,  color: 'rgba(196,104,138,' },
      { r: R*0.42, speed: 0.005,  dir: -1, dash: [12,6],  alpha: 0.65, w: 1.5,  color: 'rgba(176,80,105,' },
      { r: R*0.58, speed: 0.003,  dir:  1, dash: [3,14],  alpha: 0.40, w: 1.0,  color: 'rgba(255,80,160,' },
      { r: R*0.72, speed: 0.0018, dir: -1, dash: [20,10], alpha: 0.25, w: 0.8,  color: 'rgba(155,70,95,' },
      { r: R*0.88, speed: 0.001,  dir:  1, dash: [1,30],  alpha: 0.15, w: 0.6,  color: 'rgba(196,104,138,' },
    ];

    /* ── เส้นพุ่งออก (spikes) ── */
    var SPIKE_COUNT = 18;
    var spikes = [];
    for(var i = 0; i < SPIKE_COUNT; i++){
      var angle = (Math.PI*2 / SPIKE_COUNT) * i;
      var isPrimary = (i % 3 === 0);
      spikes.push({
        angle:  angle,
        len:    isPrimary ? R*(0.55 + Math.random()*0.3) : R*(0.18 + Math.random()*0.22),
        width:  isPrimary ? 1.8 : 0.9,
        alpha:  isPrimary ? 0.75 : 0.38,
        phase:  Math.random() * Math.PI * 2,
        speed:  0.018 + Math.random() * 0.022,
        color:  isPrimary ? 'rgba(196,104,138,' : 'rgba(255,120,180,'
      });
    }

    /* ── จุด glitter บนวง ── */
    var GLITTER_COUNT = 28;
    var glitters = [];
    for(var g = 0; g < GLITTER_COUNT; g++){
      var ringIdx = Math.floor(Math.random() * rings.length);
      glitters.push({
        ringIdx: ringIdx,
        angleOffset: Math.random() * Math.PI * 2,
        r:    1.2 + Math.random() * 2.2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.04 + Math.random() * 0.04,
        color: Math.random() > 0.5 ? 'rgba(255,255,255,' : 'rgba(196,104,138,'
      });
    }

    /* ── ชาร์ด (เศษสะเก็ด) ── */
    var SHARD_COUNT = 14;
    var shards = [];
    for(var s = 0; s < SHARD_COUNT; s++){
      var a0 = Math.random() * Math.PI * 2;
      var rd = R*(0.25 + Math.random()*0.62);
      shards.push({
        x: cx + Math.cos(a0)*rd,
        y: cy + Math.sin(a0)*rd,
        len: 4 + Math.random()*10,
        angle: a0 + Math.PI/2,
        phase: Math.random()*Math.PI*2,
        speed: 0.02 + Math.random()*0.025,
        alpha: 0.4 + Math.random()*0.5,
        color: Math.random()>0.6 ? 'rgba(210,180,130,' : 'rgba(196,104,138,'
      });
    }

    function drawRing(ring, tt){
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ring.dir * ring.speed * tt);
      ctx.beginPath();
      ctx.arc(0, 0, ring.r, 0, Math.PI*2);
      ctx.setLineDash(ring.dash);
      ctx.strokeStyle = ring.color + ring.alpha + ')';
      ctx.lineWidth = ring.w;
      /* glow */
      ctx.shadowColor = ring.color + '0.9)';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    function drawSpikes(tt){
      spikes.forEach(function(sp){
        var pulse = 0.5 + 0.5 * Math.sin(sp.phase + tt * sp.speed);
        var len   = sp.len * (0.7 + 0.3 * pulse);
        var a     = sp.alpha * (0.5 + 0.5 * pulse);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(sp.angle + tt * 0.0006);
        /* gradient spike */
        var grad = ctx.createLinearGradient(0, 0, len, 0);
        grad.addColorStop(0,   sp.color + a + ')');
        grad.addColorStop(0.4, sp.color + (a*0.7) + ')');
        grad.addColorStop(1,   sp.color + '0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = sp.width;
        ctx.shadowColor = sp.color + '0.8)';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(len, 0);
        ctx.stroke();
        ctx.restore();
      });
    }

    function drawGlitters(tt){
      glitters.forEach(function(gl){
        var ring = rings[gl.ringIdx];
        var angle = gl.angleOffset + ring.dir * ring.speed * tt;
        var px = cx + Math.cos(angle) * ring.r;
        var py = cy + Math.sin(angle) * ring.r;
        var pulse = 0.3 + 0.7 * Math.abs(Math.sin(gl.phase + tt * gl.speed));
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, gl.r * pulse, 0, Math.PI*2);
        ctx.fillStyle = gl.color + (pulse * 0.95) + ')';
        ctx.shadowColor = gl.color + '1)';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      });
    }

    function drawShards(tt){
      shards.forEach(function(sh){
        var pulse = 0.4 + 0.6 * Math.abs(Math.sin(sh.phase + tt * sh.speed));
        ctx.save();
        ctx.translate(sh.x, sh.y);
        ctx.rotate(sh.angle + tt * 0.003);
        ctx.strokeStyle = sh.color + (sh.alpha * pulse) + ')';
        ctx.lineWidth = 1.2;
        ctx.shadowColor = sh.color + '0.8)';
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(sh.len * pulse, -sh.len * 0.4 * pulse);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(sh.len * 0.6 * pulse, sh.len * 0.5 * pulse);
        ctx.stroke();
        ctx.restore();
      });
    }

    /* กลม glow ตรงกลาง */
    function drawCoreGlow(){
      var coreR = R * 0.18;
      var g = ctx.createRadialGradient(cx,cy,0, cx,cy,coreR);
      g.addColorStop(0,   'rgba(196,104,138,0.22)');
      g.addColorStop(0.5, 'rgba(176,80,105,0.10)');
      g.addColorStop(1,   'rgba(176,80,105,0)');
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI*2);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.restore();
    }

    var lastFX = 0;
    function tick(now){
      if(now - lastFX < 50){ requestAnimationFrame(tick); return; } /* ~20fps */
      lastFX = now;
      ctx.clearRect(0, 0, SIZE, SIZE);
      t++;
      drawCoreGlow();
      rings.forEach(function(ring){ drawRing(ring, t); });
      drawSpikes(t);
      drawGlitters(t);
      drawShards(t);
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ── รอ DOM พร้อม แล้วยิงทั้งสองจุด ── */
  function init(){
    /* Splash — ใหญ่กว่า */
    createExplodeFX(document.getElementById('splash-explode-canvas'), { radius: 220 });
    /* Login logo */
    createExplodeFX(document.getElementById('login-explode-canvas'), { radius: 180 });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
