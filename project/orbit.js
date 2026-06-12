   LOGO SAW-BLADE PARTICLE ORBIT
   Particles stream along 3 circular orbits like saw teeth —
   fast-moving, glowing, with comet tail trails.
═══════════════════════════════════════════════════ */
(function(){
  var canvas = document.getElementById('logo-orbit-canvas');
  if(!canvas) return;
  canvas.style.willChange = 'transform';
  var ctx = canvas.getContext('2d');

  /* Orbits: radius, particle count, direction, speed, color, particle size */
  var orbits = [
    { r:30,  n:10, dir:1,  spd:0.028, col:'255,31,142',  pSize:1.0, trailLen:6,  lineAlpha:0.07 },
    { r:42,  n:14, dir:-1, spd:0.018, col:'255,105,170', pSize:0.9, trailLen:8,  lineAlpha:0.05 },
    { r:56,  n:8,  dir:1,  spd:0.010, col:'200,0,100',   pSize:1.1, trailLen:10, lineAlpha:0.03 },
  ];

  /* SIZE of canvas — big enough to hold outermost orbit + glow */
  var SIZE = (orbits[orbits.length-1].r + 22) * 2;
  canvas.width  = SIZE;
  canvas.height = SIZE;
  var cx = SIZE/2, cy = SIZE/2;

  /* Build particles per orbit */
  orbits.forEach(function(orb){
    orb.particles = [];
    for(var i = 0; i < orb.n; i++){
      orb.particles.push({
        angle: (Math.PI*2/orb.n) * i,
        speed: orb.spd * (0.85 + Math.random()*0.30),
        size:  orb.pSize * (0.7 + Math.random()*0.6),
        phase: Math.random()*Math.PI*2,  /* shimmer offset */
        trail: []                         /* history of positions */
      });
    }
  });

  var t = 0;
  var lastT = 0;

  function tick(now){
    if(now - lastT < 33){ requestAnimationFrame(tick); return; } /* ~30fps */
    lastT = now;
    ctx.clearRect(0, 0, SIZE, SIZE);
    t++;

    orbits.forEach(function(orb){
      /* ── draw ghost orbit ring ── */
      ctx.beginPath();
      ctx.arc(cx, cy, orb.r, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba('+orb.col+','+orb.lineAlpha+')';
      ctx.lineWidth = 1;
      ctx.stroke();

      orb.particles.forEach(function(p){
        /* advance angle */
        p.angle += orb.dir * p.speed;
        var px = cx + Math.cos(p.angle) * orb.r;
        var py = cy + Math.sin(p.angle) * orb.r;

        /* push to trail history */
        p.trail.push({x:px, y:py});
        if(p.trail.length > orb.trailLen) p.trail.shift();

        /* ── draw comet trail ── */
        if(p.trail.length > 1){
          for(var k = 1; k < p.trail.length; k++){
            var alpha = (k / p.trail.length) * 0.55;
            ctx.beginPath();
            ctx.moveTo(p.trail[k-1].x, p.trail[k-1].y);
            ctx.lineTo(p.trail[k].x,   p.trail[k].y);
            ctx.strokeStyle = 'rgba('+orb.col+','+alpha+')';
            ctx.lineWidth = p.size * (k / p.trail.length) * 0.9;
            ctx.lineCap = 'round';
            ctx.stroke();
          }
        }

        /* ── draw glowing particle head ── */
        var shimmer = 0.75 + 0.25*Math.sin(p.phase + t*0.04);
        var r = p.size * shimmer;

        /* outer glow */
        var grd = ctx.createRadialGradient(px,py,0, px,py,r*3.5);
        grd.addColorStop(0,   'rgba('+orb.col+','+(0.9*shimmer)+')');
        grd.addColorStop(0.4, 'rgba('+orb.col+','+(0.45*shimmer)+')');
        grd.addColorStop(1,   'rgba('+orb.col+',0)');
        ctx.beginPath();
        ctx.arc(px, py, r*3.5, 0, Math.PI*2);
        ctx.fillStyle = grd;
        ctx.fill();

        /* core dot */
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255,255,255,'+(0.92*shimmer)+')';
        ctx.fill();
      });
    });

    requestAnimationFrame(tick);
  }

  /* Wait until login screen is visible or DOM ready */
  function init(){
    requestAnimationFrame(tick);
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
