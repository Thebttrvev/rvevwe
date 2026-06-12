(function(){
  var cvs = document.getElementById('bg-rings-canvas');
  var ctx = cvs.getContext('2d');
  var W, H;
  function resize(){ W = cvs.width = window.innerWidth; H = cvs.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  var rings = [
    /* ── LARGE background rings — far depth, very dim ── */
    { fx:0.50, fy:0.42, r:280, spd: 0.04, col:'255,31,142',  a:0.05, lw:1,   arcs:[[0,70],[100,160],[195,265],[290,355]] },
    { fx:0.50, fy:0.42, r:220, spd:-0.06, col:'180,0,80',    a:0.06, lw:1,   arcs:[[15,75],[110,170],[205,260],[300,350]] },

    /* ── TOP-LEFT cluster ── */
    { fx:0.12, fy:0.18, r:85,  spd: 0.20, col:'255,31,142',  a:0.22, lw:1.8, arcs:[[0,50],[85,130],[175,220],[265,310]] },
    { fx:0.12, fy:0.18, r:115, spd:-0.11, col:'200,0,90',    a:0.13, lw:1.2, arcs:[[25,65],[115,155],[205,250],[300,345]] },
    { fx:0.18, fy:0.10, r:45,  spd: 0.35, col:'255,80,160',  a:0.28, lw:2,   arcs:[[0,35],[90,125],[180,215],[270,305]] },

    /* ── TOP-CENTER ── */
    { fx:0.50, fy:0.06, r:70,  spd:-0.18, col:'255,31,142',  a:0.18, lw:1.5, arcs:[[10,55],[100,145],[190,235],[280,325]] },
    { fx:0.50, fy:0.06, r:95,  spd: 0.09, col:'180,0,80',    a:0.10, lw:1,   arcs:[[0,40],[90,135],[185,225],[275,320]] },

    /* ── TOP-RIGHT cluster ── */
    { fx:0.86, fy:0.15, r:90,  spd:-0.17, col:'255,31,142',  a:0.21, lw:1.8, arcs:[[0,45],[88,133],[176,225],[270,315]] },
    { fx:0.86, fy:0.15, r:125, spd: 0.08, col:'200,0,90',    a:0.11, lw:1.2, arcs:[[20,65],[110,160],[200,248],[295,342]] },
    { fx:0.94, fy:0.22, r:50,  spd: 0.32, col:'255,80,160',  a:0.26, lw:2,   arcs:[[0,30],[90,120],[180,210],[270,300]] },

    /* ── MID-LEFT ── */
    { fx:0.07, fy:0.42, r:65,  spd: 0.24, col:'255,31,142',  a:0.20, lw:1.8, arcs:[[5,50],[95,140],[185,230],[275,320]] },
    { fx:0.07, fy:0.42, r:95,  spd:-0.12, col:'160,0,70',    a:0.11, lw:1,   arcs:[[0,45],[92,138],[184,232],[276,324]] },

    /* ── MID-RIGHT ── */
    { fx:0.93, fy:0.45, r:70,  spd:-0.22, col:'255,31,142',  a:0.20, lw:1.8, arcs:[[0,45],[88,133],[178,225],[268,315]] },
    { fx:0.93, fy:0.45, r:100, spd: 0.10, col:'200,0,100',   a:0.11, lw:1,   arcs:[[18,60],[108,153],[198,245],[292,338]] },

    /* ── MID-CENTER-LEFT (fills gap) ── */
    { fx:0.28, fy:0.55, r:55,  spd: 0.28, col:'255,31,142',  a:0.16, lw:1.5, arcs:[[0,40],[90,130],[180,220],[270,310]] },
    { fx:0.28, fy:0.55, r:78,  spd:-0.14, col:'180,0,80',    a:0.09, lw:1,   arcs:[[15,55],[105,148],[198,242],[288,332]] },

    /* ── MID-CENTER-RIGHT (fills gap) ── */
    { fx:0.72, fy:0.52, r:60,  spd:-0.25, col:'255,31,142',  a:0.17, lw:1.5, arcs:[[0,42],[90,132],[182,222],[272,312]] },
    { fx:0.72, fy:0.52, r:82,  spd: 0.12, col:'160,0,70',    a:0.09, lw:1,   arcs:[[20,60],[110,152],[202,244],[292,335]] },

    /* ── LOWER-LEFT ── */
    { fx:0.14, fy:0.75, r:80,  spd: 0.19, col:'255,31,142',  a:0.19, lw:1.8, arcs:[[0,48],[90,138],[182,228],[274,320]] },
    { fx:0.14, fy:0.75, r:110, spd:-0.09, col:'200,0,90',    a:0.10, lw:1,   arcs:[[22,65],[112,158],[202,248],[295,342]] },
    { fx:0.06, fy:0.85, r:42,  spd: 0.38, col:'255,80,160',  a:0.25, lw:2,   arcs:[[0,28],[90,118],[180,208],[270,298]] },

    /* ── LOWER-CENTER ── */
    { fx:0.50, fy:0.88, r:75,  spd:-0.20, col:'255,31,142',  a:0.18, lw:1.5, arcs:[[0,50],[92,142],[184,234],[276,326]] },
    { fx:0.50, fy:0.88, r:105, spd: 0.10, col:'180,0,80',    a:0.09, lw:1,   arcs:[[18,62],[108,156],[200,248],[292,338]] },

    /* ── LOWER-RIGHT ── */
    { fx:0.86, fy:0.78, r:85,  spd: 0.16, col:'255,31,142',  a:0.20, lw:1.8, arcs:[[5,52],[95,142],[185,232],[275,322]] },
    { fx:0.86, fy:0.78, r:118, spd:-0.08, col:'200,0,90',    a:0.10, lw:1,   arcs:[[25,68],[115,160],[205,252],[298,345]] },
    { fx:0.94, fy:0.88, r:48,  spd: 0.34, col:'255,80,160',  a:0.24, lw:2,   arcs:[[0,32],[90,122],[180,212],[270,302]] },

    /* ── ACCENT tiny rings scattered ── */
    { fx:0.35, fy:0.22, r:30,  spd: 0.45, col:'255,100,180', a:0.30, lw:2,   arcs:[[0,45],[90,135],[180,225],[270,315]] },
    { fx:0.65, fy:0.28, r:35,  spd:-0.40, col:'255,100,180', a:0.28, lw:2,   arcs:[[0,40],[90,130],[180,220],[270,310]] },
    { fx:0.22, fy:0.65, r:32,  spd: 0.42, col:'255,80,160',  a:0.28, lw:2,   arcs:[[0,38],[90,128],[180,218],[270,308]] },
    { fx:0.78, fy:0.68, r:28,  spd:-0.48, col:'255,80,160',  a:0.30, lw:2,   arcs:[[0,35],[90,125],[180,215],[270,305]] },
  ];

  /* ── init each ring with smooth breathe & lifecycle ── */
  rings.forEach(function(rg){
    rg.angle    = Math.random() * 360;
    rg.baseA    = rg.a * 0.5;                  /* dimmer overall */
    rg.curA     = 0;
    rg.state    = 'fadein';
    rg.life     = 0;
    rg.onTime   = 400 + Math.random() * 600;   /* stay longer */
    rg.fadeSpd  = 0.004 + Math.random()*0.005; /* very slow fade */
    rg.breatheOffset = Math.random() * Math.PI * 2;
    rg.delay    = Math.random() * 300;
  });

  function randomPos(rg){
    var fx, fy, tries = 0;
    do {
      fx = 0.04 + Math.random() * 0.92;
      fy = 0.04 + Math.random() * 0.92;
      tries++;
    } while(tries < 30 && fx > 0.32 && fx < 0.68 && fy > 0.22 && fy < 0.82);
    rg.fx = fx;
    rg.fy = fy;
    rg.r  = 28 + Math.random() * 110;
    rg.spd = (Math.random() < 0.5 ? 1 : -1) * (0.03 + Math.random() * 0.14);
  }

  function toRad(d){ return d * Math.PI / 180; }

  function drawRing(rg){
    if(rg.curA <= 0.004) return;
    var cx = rg.fx * W, cy = rg.fy * H, a = rg.angle;
    ctx.save();
    ctx.strokeStyle = 'rgba(' + rg.col + ',' + rg.curA + ')';
    ctx.lineWidth = rg.lw;
    ctx.lineCap = 'round';
    rg.arcs.forEach(function(arc){
      var s = toRad(arc[0] + a), e = toRad(arc[1] + a);
      ctx.beginPath(); ctx.arc(cx, cy, rg.r, s, e); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx + Math.cos(s)*rg.r, cy + Math.sin(s)*rg.r, rg.lw*1.3, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(' + rg.col + ',' + Math.min(rg.curA*2,0.35) + ')'; ctx.fill();
      ctx.beginPath(); ctx.arc(cx + Math.cos(e)*rg.r, cy + Math.sin(e)*rg.r, rg.lw*1.3, 0, Math.PI*2); ctx.fill();
    });
    ctx.restore();
  }

  var frame = 0;
  function tick(){
    ctx.clearRect(0, 0, W, H);
    frame++;

    rings.forEach(function(rg){
      if(rg.delay > 0){ rg.delay--; return; }

      rg.angle += rg.spd;
      rg.life++;

      if(rg.state === 'fadein'){
        rg.curA = Math.min(rg.curA + rg.fadeSpd, rg.baseA);
        if(rg.curA >= rg.baseA - 0.002){
          rg.state = 'on';
          rg.life  = 0;
        }
      }
      else if(rg.state === 'on'){
        /* gentle slow breathe — no flicker, just a soft sine pulse */
        rg.curA = rg.baseA * (0.65 + 0.35 * Math.sin(frame * 0.012 + rg.breatheOffset));
        if(rg.life > rg.onTime){ rg.state = 'fadeout'; }
      }
      else if(rg.state === 'fadeout'){
        rg.curA = Math.max(rg.curA - rg.fadeSpd, 0);
        if(rg.curA <= 0) rg.state = 'dead';
      }
      else if(rg.state === 'dead'){
        randomPos(rg);
        rg.angle   = Math.random() * 360;
        rg.curA    = 0;
        rg.life    = 0;
        rg.onTime  = 400 + Math.random() * 600;
        rg.fadeSpd = 0.003 + Math.random() * 0.005;
        rg.breatheOffset = Math.random() * Math.PI * 2;
        rg.delay   = 80 + Math.random() * 160;
        rg.state   = 'fadein';
      }

      drawRing(rg);
    });

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
