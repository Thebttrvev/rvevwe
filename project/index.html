<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Revolution</title>
<link href="https://fonts.googleapis.com/css2?family=Bangers&family=Kanit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body>

<!-- ✦ BACKGROUND SPINNING RINGS ✦ -->
<canvas id="bg-rings-canvas" style="position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;"></canvas>
<script src="bg-rings.js"></script>

<!-- DECO RINGS REMOVED -->
<div id="loading-splash" style="
  position:fixed;inset:0;z-index:9999;
  background:#110c0f;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  transition:opacity .4s ease;
">
  <!-- Stars background for loading -->
  <div style="position:absolute;inset:0;pointer-events:none;overflow:hidden;">
    <div style="position:absolute;width:3px;height:3px;background:#C8A060;border-radius:50%;top:15%;left:20%;box-shadow:0 0 6px #C8A060;animation:sparkle 3s ease-in-out infinite;"></div>
    <div style="position:absolute;width:2px;height:2px;background:#fff;border-radius:50%;top:25%;right:25%;box-shadow:0 0 4px #fff;animation:sparkle 2s ease-in-out infinite .5s;"></div>
    <div style="position:absolute;width:3px;height:3px;background:#C8A060;border-radius:50%;bottom:30%;left:15%;box-shadow:0 0 6px #C8A060;animation:sparkle 4s ease-in-out infinite 1s;"></div>
    <div style="position:absolute;width:2px;height:2px;background:#D4899E;border-radius:50%;bottom:20%;right:20%;box-shadow:0 0 5px #D4899E;animation:sparkle 3.5s ease-in-out infinite 1.5s;"></div>
    <div style="position:absolute;width:2px;height:2px;background:#fff;border-radius:50%;top:40%;left:8%;box-shadow:0 0 4px #fff;animation:sparkle 2.5s ease-in-out infinite 2s;"></div>
    <div style="position:absolute;width:3px;height:3px;background:#C8A060;border-radius:50%;top:60%;right:10%;box-shadow:0 0 6px #C8A060;animation:sparkle 3s ease-in-out infinite 0.8s;"></div>
  </div>
  <div id="splash-explode-wrap">
    <canvas id="splash-explode-canvas"></canvas>
    <img src="__REAL_LOGO__" alt="Revolution" draggable="false" style="
      width:clamp(120px,30vw,200px);max-width:200px;
      animation:logoFloat 3s ease-in-out infinite;
      filter:drop-shadow(0 0 10px rgba(196,104,138,0.65)) drop-shadow(0 0 24px rgba(176,80,105,0.25));
      pointer-events:none;user-select:none;-webkit-user-drag:none;
      transform:translateZ(0);
      image-rendering:auto;
    ">
  </div>
  <div style="margin-top:36px;display:flex;flex-direction:column;align-items:center;gap:10px;">
    <div style="width:220px;height:4px;background:rgba(255,255,255,0.07);border-radius:4px;overflow:hidden;box-shadow:0 0 12px rgba(196,104,138,0.1);">
      <div id="splash-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#B55070,#C4688A,#D4899E);border-radius:4px;transition:width .4s ease;box-shadow:0 0 12px rgba(196,104,138,0.9);"></div>
    </div>
    <div style="font-size:11px;color:rgba(255,255,255,0.3);letter-spacing:5px;font-family:'Kanit',sans-serif;font-weight:300;text-transform:uppercase;">กำลังโหลด</div>
  </div>
</div>

<!-- ══ SCREEN 1: LOGIN ══ -->
<div id="login-screen" class="screen">
  <!-- SCREEN RINGS REMOVED -->

  <!-- ✦ Aurora background canvas ✦ -->
  <canvas id="login-aurora-canvas" style="position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2;"></canvas>

  <!-- Top-left logo (fixed, won't scroll) -->
  <div style="position:fixed;top:16px;left:16px;z-index:15;">
    <img src="__ORIG_LOGO__" alt="Revolution" draggable="false" style="width:100px;height:auto;filter:drop-shadow(0 0 12px rgba(196,104,138,0.5));opacity:0.85;pointer-events:none;user-select:none;-webkit-user-drag:none;">
  </div>

  <div class="login-inner">
    <div class="login-logo" style="margin-bottom:24px;">
      <div class="logo-explode-wrap">
        <canvas class="logo-explode-canvas" id="login-explode-canvas"></canvas>
        <div class="logo-ring-wrap">
          <div class="lr lr-3"></div>
          <div class="lr lr-2"></div>
          <div class="lr lr-1"></div>
          <!-- metallic inner ring -->
          <div class="lr-metallic"></div>
          <!-- broken rings (REVOLVE-style) -->
          <div class="bring-wrap">
            <div class="bring bring-1"></div>
            <div class="bring bring-2"></div>
            <div class="bring bring-3"></div>
            <div class="bring bring-4"></div>
          </div>
          <!-- canvas particle orbit (disabled) -->
          <canvas id="logo-orbit-canvas" style="display:none;pointer-events:none;"></canvas>
          <img src="__REAL_LOGO__" alt="Revolution" class="logo-img">
        </div>
      </div>
    </div>

    <div class="login-box">
      <div id="mode-main">

        <!-- Step 1: Username + Password -->
        <div id="main-step1" class="step">
          <span class="lbl">Username</span>
          <div class="inp-wrap">
            <input class="inp" id="s-name" type="text" placeholder="ชื่อ-สกุลของคุณ..." autocomplete="username"
              onkeydown="if(event.key==='Enter')document.getElementById('s-password').focus()">
          </div>
          <span class="lbl">Password</span>
          <div class="inp-wrap">
            <input class="inp inp-with-icon" id="s-password" type="password"
              placeholder="รหัสผ่าน 4 หลัก" autocomplete="current-password" maxlength="4" inputmode="numeric"
              onkeydown="if(event.key==='Enter')smartLogin()">
            <button class="inp-icon" onclick="togglePwVis('s-password',this)">👁</button>
          </div>
          <button class="btn-main btn-pink" onclick="smartLogin()" style="margin-top:4px;">เข้าสู่ระบบ →</button>
          <div style="text-align:center;margin:14px 0 2px;">
            <button class="link-btn" onclick="showRegister()"
              style="background:transparent;border:none;color:rgba(255,255,255,0.3);font-size:12px;letter-spacing:1px;padding:4px;cursor:pointer;font-family:'Kanit',sans-serif;">
              หรือ ยังไม่มีบัญชี? <span style="color:var(--pink-light);">สมัครที่นี่</span>
            </button>
          </div>
          <div style="text-align:center;margin-top:10px;">
            <button onclick="adminTap()" style="background:transparent;border:none;color:rgba(255,255,255,0.05);font-size:10px;cursor:pointer;">★</button>
          </div>
        </div>

        <!-- Step 3: สมัคร หน้า 1 -->
        <div id="main-step3" style="display:none;" class="step">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
            <button onclick="mainBack()" style="background:transparent;border:1.5px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.45);font-family:'Kanit',sans-serif;font-size:12px;padding:4px 12px;cursor:pointer;border-radius:8px;letter-spacing:1px;">← กลับ</button>
            <div style="font-size:13px;color:rgba(210,180,130,0.75);letter-spacing:.5px;font-weight:600;">✨ สมัครบัญชีใหม่ <span style="color:rgba(255,255,255,0.25);font-size:11px;">(1/2)</span></div>
          </div>
          <div class="avatar-upload" onclick="document.getElementById('avatar-file-input').click()">
            <div class="avatar-preview" id="r-avatar-preview">📷</div>
            <div class="avatar-upload-label">แตะเพื่ออัพโหลดรูปโปรไฟล์</div>
          </div>
          <input type="file" id="avatar-file-input" accept="image/*" onchange="handleAvatarUpload(this)">
          <span class="lbl">Username (ชื่อ-สกุล)</span>
          <div class="inp-wrap">
            <input class="inp yellow-inp" id="r-name" type="text" placeholder="กรอกชื่อ-สกุลจริง..." autocomplete="username">
          </div>
          <span class="lbl">Password (ตัวเลข 4 หลัก)</span>
          <div class="inp-wrap">
            <input class="inp yellow-inp inp-with-icon" id="r-password-direct" type="password"
              placeholder="ตั้งรหัสผ่าน 4 หลัก" autocomplete="new-password" maxlength="4" inputmode="numeric">
            <button class="inp-icon" onclick="togglePwVis('r-password-direct',this)">👁</button>
          </div>
          <button class="btn-main btn-yellow" onclick="goRegStep2()" style="margin-top:4px;">ถัดไป →</button>
        </div>

        <!-- Hidden persistent reg fields (keep values across step transitions) -->
        <input type="hidden" id="reg-name-cache" value="">
        <input type="hidden" id="reg-pw-cache" value="">

        <!-- Step 3b: สมัคร หน้า 2 (Xbox) -->
        <div id="main-step3b" style="display:none;" class="step">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
            <button onclick="document.getElementById('main-step3b').style.display='none';document.getElementById('main-step3').style.display='block';document.getElementById('login-err').textContent='';_regName='';_regPw='';document.getElementById('reg-name-cache').value='';document.getElementById('reg-pw-cache').value='';" style="background:transparent;border:1.5px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.45);font-family:'Kanit',sans-serif;font-size:12px;padding:4px 12px;cursor:pointer;border-radius:8px;letter-spacing:1px;">← กลับ</button>
            <div style="font-size:13px;color:rgba(210,180,130,0.75);letter-spacing:.5px;font-weight:600;">✨ สมัครบัญชีใหม่ <span style="color:rgba(255,255,255,0.25);font-size:11px;">(2/2)</span></div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:7px;">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Xbox_one_logo.svg/40px-Xbox_one_logo.svg.png" style="height:14px;opacity:0.7;" draggable="false">
            <span class="lbl" style="margin-bottom:0;">Xbox Gamertag <span style="color:rgba(255,80,80,0.8);font-size:10px;">*จำเป็น</span></span>
          </div>
          <div class="inp-wrap">
            <input class="inp" id="r-xbox" type="text" placeholder="Xbox Gamertag ของคุณ..." autocomplete="off"
              style="border-color:rgba(16,200,16,0.25);background:rgba(16,200,16,0.04);"
              onfocus="document.getElementById('login-err').textContent='';this.style.borderColor='rgba(16,200,16,0.6)';this.style.boxShadow='0 0 0 3px rgba(16,200,16,0.1)'"
              oninput="document.getElementById('login-err').textContent=''"
              onblur="this.style.borderColor='rgba(16,200,16,0.25)';this.style.boxShadow='none'">
          </div>
          <div class="info-box" style="margin-bottom:12px;">ชื่อ-สกุลคือ Username • รหัส 4 หลักที่ตั้งเองคือ Password</div>
          <button class="btn-main btn-yellow" onclick="rDirectRegister()">🎮 สมัครเลย</button>
        </div>

        <!-- Step 5: Admin Login -->
        <div id="main-step5" style="display:none;" class="step">
          <div style="font-size:12px;color:rgba(196,104,138,0.6);text-align:center;margin-bottom:16px;letter-spacing:1px;">🔐 Admin Access</div>
          <span class="lbl">Admin Password</span>
          <div class="inp-wrap">
            <input class="inp inp-with-icon" id="a-password" type="password"
              placeholder="รหัสผ่าน Admin..." autocomplete="current-password"
              onkeydown="if(event.key==='Enter')aDoLogin()">
            <button class="inp-icon" onclick="togglePwVis('a-password',this)">👁</button>
          </div>
          <button class="btn-main btn-pink" onclick="aDoLogin()">เข้าสู่ระบบ Admin →</button>
          <button onclick="mainBack()" class="btn-main" style="margin-top:10px;background:transparent;border:1.5px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.5);font-size:14px;letter-spacing:1px;">← ย้อนกลับ</button>
        </div>

      <div class="login-err" id="login-err" style="margin-top:8px;"></div>
      <div class="login-ok" id="login-ok" style="margin-top:8px;"></div>
      </div><!-- /mode-main -->
    </div><!-- /login-box -->

      <div id="mode-student" style="display:none;"></div>
      <div id="mode-register" style="display:none;"></div>
      <div id="mode-admin" style="display:none;"></div>
  </div><!-- /login-inner -->
</div>

<!-- ══ SCREEN 2: ADMIN ══ -->
<div id="admin-screen" class="screen">
  <!-- UNIFIED ADMIN NAVBAR -->
  <div class="unified-navbar">
    <!-- LEFT: logo + badge -->
    <div class="unav-top">
      <div class="unav-logo-wrap">
        <img src="__ORIG_LOGO__" draggable="false" class="unav-logo-img" style="pointer-events:none;user-select:none;-webkit-user-drag:none;">
        <span class="unav-badge-admin">ADMIN</span>
        <span id="online-badge" class="unav-online-badge"></span>
      </div>
    </div>
    <!-- CENTER: tabs in pill -->
    <div class="unav-tabs">
      <div class="unav-tabs-inner">
        <button class="unav-tab active" id="atab-students" onclick="switchAdminTab('students')">
          <span class="unav-tab-icon">👥</span><span class="unav-tab-label">นักเรียน</span>
        </button>
        <button class="unav-tab" id="atab-online" onclick="switchAdminTab('online')">
          <span class="unav-tab-icon">🟢</span><span class="unav-tab-label">ออนไลน์</span><span class="unav-tab-badge" id="atab-online-count">0</span>
        </button>
        <button class="unav-tab" id="atab-chats" onclick="switchAdminTab('chats')">
          <span class="unav-tab-icon">💬</span><span class="unav-tab-label">แชท</span><span class="unav-tab-badge pink" id="atab-chats-count">0</span>
        </button>
        <button class="unav-tab" id="atab-stats" onclick="switchAdminTab('stats')">
          <span class="unav-tab-icon">📊</span><span class="unav-tab-label">สถิติ</span>
        </button>
        <button class="unav-tab" id="atab-shop" onclick="switchAdminTab('shop')">
          <span class="unav-tab-icon">🛒</span><span class="unav-tab-label">ของ</span>
        </button>
        <button class="unav-tab" id="atab-bp" onclick="switchAdminTab('bp')">
          <span class="unav-tab-icon">🎖</span><span class="unav-tab-label">BP</span><span class="unav-tab-badge pink" id="atab-bp-count" style="display:none;">0</span>
        </button>
      </div>
    </div>
    <!-- RIGHT: user + logout -->
    <div class="unav-user">
      <span id="admin-user-label" class="unav-username">Admin</span>
      <button class="unav-logout-btn" onclick="logout()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        ออก
      </button>
    </div>
  </div>

  <!-- DEADLINE BANNER -->
  <div class="deadline-banner open" id="deadline-banner-a">
    <div class="deadline-status"><div class="deadline-dot"></div><div class="deadline-text" id="deadline-text-a">กำลังรับเช็คชื่อ — ปิดเวลา <strong id="deadline-disp-a">20:00</strong></div></div>
    <div class="countdown" id="countdown-a"></div>
  </div>

  <div class="admin-outer">
  <div class="admin-body">

    <!-- ── TAB: STUDENTS ── -->
    <div class="admin-page active" id="apage-students">
      <div class="deadline-settings">
        <span class="settings-label" style="font-family:'Bangers',cursive;font-size:14px;color:var(--yellow);letter-spacing:1px;">⏰ เวลาปิด</span>
        <input type="time" class="time-input" id="deadline-time-input" value="20:00">
        <div class="toggle-deadline" style="display:flex;align-items:center;gap:8px;">
          <div class="toggle-track on" id="deadline-toggle" onclick="toggleDeadlineActive()"><div class="toggle-thumb"></div></div>
          <span class="toggle-text" id="deadline-toggle-text">เปิดรับอยู่</span>
        </div>
        <button class="btn-sm" onclick="saveDeadline()">✓ บันทึก</button>
        <button class="btn-export" onclick="exportCSV()" style="margin-left:auto;">⬇ CSV</button>
      </div>
      <div class="stats-bar">
        <div class="stat-card c1"><div class="stat-num" id="stat-total">0</div><div class="stat-label">ทั้งหมด</div></div>
        <div class="stat-card c2"><div class="stat-num" id="stat-present">0</div><div class="stat-label">มาแล้ว</div></div>
        <div class="stat-card c3"><div class="stat-num" id="stat-pct">0%</div><div class="stat-label">เปอร์เซ็นต์</div></div>
      </div>
      <div class="controls">
        <div class="search-wrap">
          <input class="search-input" id="search-a" type="text" placeholder="ค้นหาชื่อ..." oninput="renderAdmin()">
        </div>
        <button class="btn-sm red-ghost" onclick="resetAll()">↺ RESET</button>
        <button class="btn-sm red-ghost" onclick="resetFriendData()" style="margin-left:4px;" title="ลบข้อมูล Like และ Swipe ทั้งหมด">💜 Reset Likes</button>
      </div>
      <div class="filter-tabs">
        <button class="tab t-all active-tab" onclick="setFilter('all',this)">ALL</button>
        <button class="tab t-present" onclick="setFilter('present',this)">มาแล้ว ✓</button>
        <button class="tab t-absent" onclick="setFilter('absent',this)">ยังไม่มา</button>
      </div>
      <div class="grid-wrap">
        <div class="student-grid" id="student-grid-a"></div>
      </div>
    </div>

    <!-- ── TAB: ONLINE ── -->
    <div class="admin-page" id="apage-online">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;flex-wrap:wrap;gap:8px;">
        <div style="font-family:'Bangers',cursive;font-size:20px;letter-spacing:3px;color:#90b0a0;">🟢 ออนไลน์ตอนนี้</div>
        <div id="online-refresh-time" style="font-size:10px;color:rgba(255,255,255,0.2);letter-spacing:1px;"></div>
      </div>
      <div id="admin-online-list" style="display:flex;flex-direction:column;gap:8px;"></div>
    </div>

    <!-- ── TAB: CHATS ── -->
    <div class="admin-page" id="apage-chats">
      <div style="font-family:'Bangers',cursive;font-size:20px;letter-spacing:3px;color:var(--pink);margin-bottom:4px;">💬 แชทที่กำลังมีอยู่</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.2);margin-bottom:14px;letter-spacing:.5px;">realtime จาก Firebase — อัปเดตทันที</div>
      <div id="admin-chats-list" style="display:flex;flex-direction:column;gap:10px;"></div>
    </div>

    <!-- ── TAB: STATS ── -->
    <div class="admin-page" id="apage-stats">
      <div style="font-family:'Bangers',cursive;font-size:20px;letter-spacing:3px;color:var(--yellow);margin-bottom:12px;">📊 สถิติภาพรวม</div>

      <!-- Big Numbers -->
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:14px;">
        <div class="stat-big-card" style="border-color:rgba(196,104,138,0.3);">
          <div style="font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">นักเรียนทั้งหมด</div>
          <div id="sbig-total" style="font-family:'Bangers',cursive;font-size:48px;color:var(--pink);line-height:1;">0</div>
          <div style="font-size:10px;color:rgba(255,255,255,0.2);margin-top:4px;">คน</div>
        </div>
        <div class="stat-big-card" style="border-color:rgba(0,240,255,0.3);">
          <div style="font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">มาแล้ว</div>
          <div id="sbig-present" style="font-family:'Bangers',cursive;font-size:48px;color:var(--cyan);line-height:1;">0</div>
          <div style="font-size:10px;color:rgba(255,255,255,0.2);margin-top:4px;">คน</div>
        </div>
        <div class="stat-big-card" style="border-color:rgba(255,64,96,0.3);">
          <div style="font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">ยังไม่มา</div>
          <div id="sbig-absent" style="font-family:'Bangers',cursive;font-size:48px;color:var(--red);line-height:1;">0</div>
          <div style="font-size:10px;color:rgba(255,255,255,0.2);margin-top:4px;">คน</div>
        </div>
        <div class="stat-big-card" style="border-color:rgba(140,160,150,0.3);">
          <div style="font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">ออนไลน์</div>
          <div id="sbig-online" style="font-family:'Bangers',cursive;font-size:48px;color:#90b0a0;line-height:1;">0</div>
          <div style="font-size:10px;color:rgba(255,255,255,0.2);margin-top:4px;">คน</div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:16px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <span style="font-size:12px;color:rgba(255,255,255,0.4);letter-spacing:1px;">การเช็คชื่อ</span>
          <span id="spct-text" style="font-family:'Bangers',cursive;font-size:22px;color:var(--yellow);letter-spacing:2px;">0%</span>
        </div>
        <div style="height:10px;background:rgba(255,255,255,0.06);border-radius:6px;overflow:hidden;">
          <div id="spct-bar" style="height:100%;width:0%;background:linear-gradient(90deg,var(--pink),var(--cyan));border-radius:6px;transition:width .6s;"></div>
        </div>
      </div>

      <!-- Checkin Timeline -->
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:16px;">
        <div style="font-size:11px;color:rgba(255,255,255,0.3);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">⏱ ล่าสุดที่มา</div>
        <div id="stats-recent-list" style="display:flex;flex-direction:column;gap:6px;max-height:200px;overflow-y:auto;"></div>
      </div>
    </div>

    <!-- ── TAB: SHOP MANAGEMENT ── -->
    <div class="admin-page" id="apage-shop">
      <div style="font-family:'Bangers',cursive;font-size:20px;letter-spacing:3px;color:var(--yellow);margin-bottom:4px;">🛒 จัดการของที่ต้องซื้อ</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.2);margin-bottom:12px;letter-spacing:.5px;">ของที่เพิ่มจะแสดงในหน้าซื้อของของ User ทันที</div>

      <!-- Add item form -->
      <div style="background:rgba(210,180,130,0.04);border:1px solid rgba(210,180,130,0.15);border-radius:14px;padding:14px;margin-bottom:12px;">
        <div style="font-size:11px;color:rgba(210,180,130,0.5);letter-spacing:1px;margin-bottom:10px;text-transform:uppercase;">＋ เพิ่มสินค้า</div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <input class="search-input" id="admin-shop-name" placeholder="ชื่อสินค้า..." style="border-color:rgba(210,180,130,0.2);" onkeydown="if(event.key==='Enter')adminAddShopItem()">
          <div style="display:flex;gap:8px;">
            <input class="search-input" id="admin-shop-price" type="number" placeholder="ราคา (บาท)" style="flex:1;border-color:rgba(210,180,130,0.2);" min="0">
            <input class="search-input" id="admin-shop-cat" placeholder="หมวด (เช่น ของสด)" style="flex:1;border-color:rgba(210,180,130,0.2);">
          </div>
          <input class="search-input" id="admin-shop-note" placeholder="หมายเหตุ (ไม่บังคับ)..." style="border-color:rgba(210,180,130,0.2);" onkeydown="if(event.key==='Enter')adminAddShopItem()">
          <button onclick="adminAddShopItem()" style="background:linear-gradient(135deg,#C8A060,#B89050);border:none;color:#120b0e;font-family:'Kanit',sans-serif;font-size:13px;font-weight:700;padding:11px;border-radius:12px;cursor:pointer;letter-spacing:.5px;">＋ เพิ่มสินค้า</button>
        </div>
      </div>

      <!-- Item list -->
      <div id="admin-shop-list" style="display:flex;flex-direction:column;gap:8px;"></div>
    </div>

    <!-- ── TAB: BATTLE PASS ── -->
    <div class="admin-page" id="apage-bp">
      <div style="font-family:'Bangers',cursive;font-size:20px;letter-spacing:3px;color:#C8A060;margin-bottom:4px;">🎖 Battle Pass Admin</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.2);margin-bottom:14px;letter-spacing:.5px;">จัดการ XP นักเรียน + ยืนยันรางวัลที่ขอรับ</div>

      <!-- XP Manager -->
      <div style="background:rgba(210,180,130,0.05);border:1px solid rgba(210,180,130,0.18);border-radius:14px;padding:14px;margin-bottom:14px;">
        <div style="font-size:11px;color:rgba(210,180,130,0.6);letter-spacing:1px;margin-bottom:10px;text-transform:uppercase;">⚡ จัดการ XP นักเรียน</div>
        <div style="display:flex;gap:8px;margin-bottom:10px;">
          <input class="search-input" id="bp-admin-search" placeholder="ค้นหาชื่อนักเรียน..." style="flex:1;border-color:rgba(210,180,130,0.2);" oninput="renderBPAdminList()">
        </div>
        <div id="bp-admin-student-list" style="display:flex;flex-direction:column;gap:8px;max-height:320px;overflow-y:auto;"></div>
      </div>


      <!-- ── Tier Editor ── -->
      <div style="background:rgba(100,180,255,0.04);border:1px solid rgba(100,180,255,0.18);border-radius:14px;padding:14px;margin-bottom:14px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <div style="font-size:11px;color:rgba(100,180,255,0.7);letter-spacing:1px;text-transform:uppercase;">🎚️ แก้ไข Tier Config (25 ขั้น)</div>
          <button onclick="saveBPTiersAdmin()" style="background:linear-gradient(135deg,#5090C8,#3070A8);border:none;color:#fff;font-family:'Kanit',sans-serif;font-size:11px;font-weight:700;padding:6px 14px;border-radius:10px;cursor:pointer;letter-spacing:.5px;">💾 บันทึกทั้งหมด</button>
        </div>
        <div style="font-size:10px;color:rgba(255,255,255,0.2);margin-bottom:10px;">แก้ไขชื่อ, XP ที่ต้องการ, สี, และรางวัลของแต่ละ Tier แล้วกด บันทึก</div>
        <div id="bp-tier-editor-list" style="display:flex;flex-direction:column;gap:6px;max-height:400px;overflow-y:auto;"></div>
      </div>

      <!-- Claim Queue -->
      <div style="background:rgba(196,104,138,0.05);border:1px solid rgba(196,104,138,0.18);border-radius:14px;padding:14px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <div style="font-size:11px;color:rgba(196,104,138,0.7);letter-spacing:1px;text-transform:uppercase;">📥 รายการรอรับรางวัล</div>
          <button onclick="refreshBPQueue()" style="background:transparent;border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.4);font-family:'Kanit',sans-serif;font-size:11px;padding:4px 10px;border-radius:8px;cursor:pointer;">🔄 โหลดใหม่</button>
        </div>
        <div id="bp-queue-list" style="display:flex;flex-direction:column;gap:8px;">
          <div style="text-align:center;padding:24px;color:rgba(255,255,255,0.15);font-size:12px;">กด 🔄 โหลดใหม่เพื่อดูรายการ</div>
        </div>
      </div>
    </div>

  </div>
  </div>
</div>



<!-- ══ SCREEN 3: STUDENT ══ -->
<div id="student-screen" class="screen">
  <!-- ═══ STUDENT SCREEN BACKGROUND LAYER (all wrapped in one absolute div) ═══ -->
  <div style="position:absolute;inset:0;pointer-events:none;z-index:0;overflow:hidden;">
  <!-- solid bg -->
  <div style="position:absolute;inset:0;background:rgba(7,3,16,0.0);"></div>
  <!-- radial glows -->
  <div style="position:absolute;inset:0;pointer-events:none;z-index:1;
    background:
      radial-gradient(ellipse 80% 60% at 15% 10%, rgba(255,0,120,0.35) 0%, transparent 55%),
      radial-gradient(ellipse 60% 45% at 50% 0%,  rgba(115,58,78,0.30)  0%, transparent 55%),
      radial-gradient(ellipse 40% 30% at 75% 18%, rgba(255,0,130,0.26) 0%, transparent 50%),
      radial-gradient(ellipse 65% 50% at 85% 90%, rgba(185,85,115,0.30) 0%, transparent 55%),
      radial-gradient(ellipse 45% 35% at 20% 78%, rgba(196,104,138,0.24) 0%, transparent 52%);
  "></div>
  <!-- pulsing glow orbs - reduced opacity to prevent flicker -->
  <div style="position:absolute;inset:0;pointer-events:none;z-index:1;
    background:
      radial-gradient(ellipse 90% 65% at 50% 105%, rgba(176,80,105,0.14) 0%, transparent 55%),
      radial-gradient(ellipse 70% 55% at 0% 0%, rgba(196,104,138,0.12) 0%, transparent 55%),
      radial-gradient(ellipse 50% 40% at 100% 50%, rgba(155,70,95,0.10) 0%, transparent 52%);
  "></div>
  <!-- big side orbs like login -->
  <div style="position:absolute;left:-180px;top:15%;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,rgba(180,90,120,0.18) 0%,rgba(180,0,90,0.12) 40%,transparent 70%);pointer-events:none;z-index:1;"></div>
  <div style="position:absolute;right:-180px;bottom:5%;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(160,80,110,0.14) 0%,rgba(160,0,80,0.10) 40%,transparent 70%);pointer-events:none;z-index:1;"></div>
  <div style="position:absolute;right:3%;top:6%;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(196,104,138,0.16) 0%,transparent 70%);pointer-events:none;z-index:1;"></div>
  <!-- ═══ SVG CONSTELLATION + TRIANGLES (CSS animated) ═══ -->
  <svg style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2;overflow:hidden;" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
    <defs>
<!-- styles moved to style.css -->
    </defs>
    <!-- constellation lines -->
    <line class="s-line" x1="80" y1="120" x2="240" y2="200" stroke="#C4688A" stroke-width="0.7"/>
    <line class="s-line" x1="240" y1="200" x2="380" y2="140" stroke="#C4688A" stroke-width="0.7"/>
    <line class="s-line" x1="380" y1="140" x2="520" y2="280" stroke="#C4688A" stroke-width="0.7"/>
    <line class="s-line" x1="520" y1="280" x2="700" y2="180" stroke="#C4688A" stroke-width="0.7"/>
    <line class="s-line" x1="700" y1="180" x2="900" y2="260" stroke="#C4688A" stroke-width="0.7"/>
    <line class="s-line" x1="900" y1="260" x2="1100" y2="150" stroke="#C4688A" stroke-width="0.7"/>
    <line class="s-line" x1="1100" y1="150" x2="1300" y2="220" stroke="#C4688A" stroke-width="0.7"/>
    <line class="s-line" x1="1300" y1="220" x2="1420" y2="160" stroke="#C4688A" stroke-width="0.7"/>
    <line class="s-line" x1="100" y1="400" x2="280" y2="480" stroke="#C4688A" stroke-width="0.6"/>
    <line class="s-line" x1="280" y1="480" x2="160" y2="600" stroke="#C4688A" stroke-width="0.6"/>
    <line class="s-line" x1="160" y1="600" x2="320" y2="700" stroke="#C4688A" stroke-width="0.6"/>
    <line class="s-line" x1="1200" y1="400" x2="1350" y2="520" stroke="#C4688A" stroke-width="0.6"/>
    <line class="s-line" x1="1350" y1="520" x2="1250" y2="680" stroke="#C4688A" stroke-width="0.6"/>
    <line class="s-line" x1="240" y1="200" x2="100" y2="400" stroke="#C4688A" stroke-width="0.5"/>
    <line class="s-line" x1="1100" y1="150" x2="1200" y2="400" stroke="#C4688A" stroke-width="0.5"/>
    <line class="s-line" x1="80"  y1="750" x2="280" y2="820" stroke="#C4688A" stroke-width="0.6"/>
    <line class="s-line" x1="280" y1="820" x2="480" y2="760" stroke="#C4688A" stroke-width="0.6"/>
    <line class="s-line" x1="1050" y1="780" x2="1250" y2="840" stroke="#C4688A" stroke-width="0.6"/>
    <line class="s-line" x1="1250" y1="840" x2="1420" y2="760" stroke="#C4688A" stroke-width="0.6"/>
    <!-- star dots -->
    <circle class="s-dot" cx="80" cy="120" r="1.5" fill="#D4899E"/>
    <circle class="s-dot" cx="240" cy="200" r="1.8" fill="#C4688A"/>
    <circle class="s-dot" cx="380" cy="140" r="1.3" fill="#fff"/>
    <circle class="s-dot" cx="520" cy="280" r="1.6" fill="#C4688A"/>
    <circle class="s-dot" cx="700" cy="180" r="2.0" fill="#D4899E"/>
    <circle class="s-dot" cx="900" cy="260" r="1.4" fill="#fff"/>
    <circle class="s-dot" cx="1100" cy="150" r="1.7" fill="#C4688A"/>
    <circle class="s-dot" cx="1300" cy="220" r="1.5" fill="#D4899E"/>
    <circle class="s-dot" cx="1420" cy="160" r="1.2" fill="#fff"/>
    <circle class="s-dot" cx="100" cy="400" r="1.4" fill="#C4688A"/>
    <circle class="s-dot" cx="280" cy="480" r="1.8" fill="#D4899E"/>
    <circle class="s-dot" cx="160" cy="600" r="1.5" fill="#fff"/>
    <circle class="s-dot" cx="320" cy="700" r="1.3" fill="#C4688A"/>
    <circle class="s-dot" cx="1200" cy="400" r="1.6" fill="#D4899E"/>
    <circle class="s-dot" cx="1350" cy="520" r="1.4" fill="#C4688A"/>
    <circle class="s-dot" cx="1250" cy="680" r="1.8" fill="#fff"/>
    <circle class="s-dot" cx="80"  cy="750" r="1.3" fill="#C4688A"/>
    <circle class="s-dot" cx="280" cy="820" r="1.6" fill="#D4899E"/>
    <circle class="s-dot" cx="480" cy="760" r="1.4" fill="#fff"/>
    <circle class="s-dot" cx="1050" cy="780" r="1.5" fill="#C4688A"/>
    <circle class="s-dot" cx="1250" cy="840" r="1.7" fill="#D4899E"/>
    <circle class="s-dot" cx="1420" cy="760" r="1.3" fill="#fff"/>
    <!-- extra scatter dots -->
    <circle class="s-dot" cx="600" cy="80" r="1.2" fill="#C4688A"/>
    <circle class="s-dot" cx="800" cy="50" r="1.0" fill="#fff"/>
    <circle class="s-dot" cx="1000" cy="90" r="1.3" fill="#D4899E"/>
    <circle class="s-dot" cx="450" cy="500" r="1.1" fill="#C4688A"/>
    <circle class="s-dot" cx="750" cy="600" r="1.4" fill="#fff"/>
    <circle class="s-dot" cx="950" cy="550" r="1.2" fill="#D4899E"/>
    <circle class="s-dot" cx="650" cy="720" r="1.5" fill="#C4688A"/>
    <circle class="s-dot" cx="850" cy="800" r="1.1" fill="#fff"/>
    <!-- floating triangles -->
    <polygon class="s-tri" points="120,320 108,342 132,342" fill="none" stroke="#C4688A" stroke-width="0.9"/>
    <polygon class="s-tri" points="1380,350 1368,372 1392,372" fill="rgba(196,104,138,0.08)" stroke="#C4688A" stroke-width="0.8"/>
    <polygon class="s-tri" points="450,60 438,82 462,82" fill="none" stroke="#D4899E" stroke-width="0.7"/>
    <polygon class="s-tri" points="1150,580 1138,602 1162,602" fill="none" stroke="#C4688A" stroke-width="0.9"/>
    <polygon class="s-tri" points="250,750 238,772 262,772" fill="rgba(196,104,138,0.06)" stroke="#D4899E" stroke-width="0.8"/>
    <polygon class="s-tri" points="1050,200 1038,222 1062,222" fill="none" stroke="#C4688A" stroke-width="0.7"/>
    <polygon class="s-tri" points="600,450 585,478 615,478" fill="none" stroke="#C4688A" stroke-width="1.0"/>
    <polygon class="s-tri" points="900,700 885,728 915,728" fill="rgba(196,104,138,0.07)" stroke="#D4899E" stroke-width="0.8"/>
    <polygon class="s-tri" points="720,300 705,328 735,328" fill="none" stroke="#C4688A" stroke-width="0.9"/>
    <polygon class="s-tri" points="1300,650 1285,678 1315,678" fill="none" stroke="#C4688A" stroke-width="0.7"/>
    <polygon class="s-tri" points="50,550 35,578 65,578" fill="rgba(196,104,138,0.06)" stroke="#C4688A" stroke-width="0.8"/>
    <polygon class="s-tri" points="1400,480 1385,508 1415,508" fill="none" stroke="#D4899E" stroke-width="0.9"/>
  </svg>
  <!-- spinning rings (same as login) -->
  <!-- floating dust particles + login-style spinning rings -->
  <div style="position:absolute;inset:0;pointer-events:none;z-index:3;overflow:hidden;">
    <div class="dust" style="width:3px;height:3px;background:#C4688A;left:12%;bottom:10%;box-shadow:0 0 6px #C4688A;animation-duration:9s;animation-delay:0s;"></div>
    <div class="dust" style="width:2px;height:2px;background:#fff;left:28%;bottom:15%;box-shadow:0 0 4px #fff;animation-duration:12s;animation-delay:1.5s;"></div>
    <div class="dust" style="width:3px;height:3px;background:#D4899E;left:50%;bottom:8%;box-shadow:0 0 5px #D4899E;animation-duration:10s;animation-delay:3s;"></div>
    <div class="dust" style="width:2px;height:2px;background:#C4688A;left:70%;bottom:12%;box-shadow:0 0 6px #C4688A;animation-duration:14s;animation-delay:0.8s;"></div>
    <div class="dust" style="width:3px;height:3px;background:#fff;left:85%;bottom:6%;box-shadow:0 0 4px #fff;animation-duration:8s;animation-delay:2s;"></div>
    <div class="dust" style="width:2px;height:2px;background:#C4688A;left:40%;bottom:20%;box-shadow:0 0 5px #C4688A;animation-duration:11s;animation-delay:4s;"></div>
    <div class="glow-orb" style="width:350px;height:350px;background:radial-gradient(circle,rgba(196,104,138,0.07) 0%,transparent 70%);bottom:-100px;right:-80px;animation-duration:7s;"></div>
    <div class="glow-orb" style="width:280px;height:280px;background:radial-gradient(circle,rgba(200,0,100,0.06) 0%,transparent 70%);top:20%;left:-60px;animation-duration:9s;animation-delay:2s;"></div>
    <!-- Login-style spinning rings -->
    <div style="position:absolute;width:520px;height:520px;top:-180px;left:-180px;border-radius:50%;">
      <div style="position:absolute;inset:-2px;border-radius:50%;background:conic-gradient(from 0deg,rgba(196,104,138,0) 0deg,rgba(196,104,138,0.45) 40deg,rgba(215,160,182,0.8) 70deg,rgba(255,255,255,0.7) 90deg,rgba(215,160,182,0.8) 110deg,rgba(196,104,138,0.45) 140deg,rgba(196,104,138,0) 200deg,rgba(196,104,138,0) 360deg);-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 2px),white calc(100% - 2px));mask:radial-gradient(farthest-side,transparent calc(100% - 2px),white calc(100% - 2px));animation:ringRotate 22s linear infinite;filter:drop-shadow(0 0 8px rgba(196,104,138,0.5));"></div>
    </div>
    <div style="position:absolute;width:380px;height:380px;bottom:-130px;right:-130px;border-radius:50%;opacity:0.7;">
      <div style="position:absolute;inset:-1.5px;border-radius:50%;background:conic-gradient(from 120deg,rgba(176,80,105,0) 0deg,rgba(190,90,125,0.45) 55deg,rgba(210,155,175,0.75) 85deg,rgba(255,255,255,0.65) 100deg,rgba(190,90,125,0.45) 130deg,rgba(176,80,105,0) 190deg,rgba(176,80,105,0) 360deg);-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 1.5px),white calc(100% - 1.5px));mask:radial-gradient(farthest-side,transparent calc(100% - 1.5px),white calc(100% - 1.5px));animation:ringRotateReverse 18s linear infinite;filter:drop-shadow(0 0 6px rgba(190,90,125,0.4));"></div>
    </div>
    <div style="position:absolute;width:200px;height:200px;top:8%;right:6%;border-radius:50%;opacity:0.55;">
      <div style="position:absolute;inset:-1px;border-radius:50%;background:conic-gradient(from 45deg,rgba(176,80,105,0) 0deg,rgba(200,130,155,0.5) 50deg,rgba(220,175,194,0.75) 78deg,rgba(255,255,255,0.65) 90deg,rgba(200,130,155,0.5) 110deg,rgba(176,80,105,0) 180deg,rgba(176,80,105,0) 360deg);-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 1px),white calc(100% - 1px));mask:radial-gradient(farthest-side,transparent calc(100% - 1px),white calc(100% - 1px));animation:ringRotateReverse 14s linear infinite;filter:drop-shadow(0 0 5px rgba(200,130,155,0.45));"></div>
    </div>
    <div style="position:absolute;width:120px;height:120px;top:60%;right:22%;border-radius:50%;opacity:0.65;">
      <div style="position:absolute;inset:-1px;border-radius:50%;background:conic-gradient(from 90deg,rgba(196,104,138,0) 0deg,rgba(196,104,138,0.7) 40deg,rgba(218,170,190,0.9) 62deg,rgba(255,255,255,0.85) 75deg,rgba(196,104,138,0.7) 100deg,rgba(196,104,138,0) 155deg,rgba(196,104,138,0) 360deg);-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 1px),white calc(100% - 1px));mask:radial-gradient(farthest-side,transparent calc(100% - 1px),white calc(100% - 1px));animation:ringRotateReverse 9s linear infinite;filter:drop-shadow(0 0 7px rgba(196,104,138,0.65));"></div>
    </div>
  </div>
  </div><!-- /background wrapper -->

  <!-- UNIFIED STUDENT NAVBAR -->
  <div class="unified-navbar" style="position:relative;z-index:10;">
    <!-- LEFT: logo -->
    <div class="unav-top">
      <div class="unav-logo-wrap">
        <img src="__ORIG_LOGO__" class="unav-logo-img" style="pointer-events:none;user-select:none;-webkit-user-drag:none;">
      </div>
    </div>
    <!-- CENTER: tabs in pill -->
    <div class="unav-tabs">
      <div class="unav-tabs-inner">
        <button class="unav-tab active" id="stab-profile" onclick="switchStudentTab('profile')">
          <span class="unav-tab-icon">👤</span><span class="unav-tab-label">โปรไฟล์</span>
        </button>
        <button class="unav-tab" id="stab-checkin" onclick="switchStudentTab('checkin')">
          <span class="unav-tab-icon">📋</span><span class="unav-tab-label">เช็คชื่อ</span>
        </button>
        <button class="unav-tab" id="stab-shop" onclick="switchStudentTab('shop')">
          <span class="unav-tab-icon">🛒</span><span class="unav-tab-label">ซื้อของ</span>
        </button>
        <button class="unav-tab" id="stab-friends" onclick="switchStudentTab('friends')">
          <span class="unav-tab-icon">💜</span><span class="unav-tab-label">หาเพื่อน</span>
        </button>
        <button class="unav-tab" id="stab-battlepass" onclick="switchStudentTab('battlepass')">
          <span class="unav-tab-icon">🎖</span><span class="unav-tab-label">PASS</span>
        </button>
      </div>
    </div>
    <!-- RIGHT: avatar + username + logout -->
    <div class="unav-user">
      <div class="unav-avatar" id="topbar-avatar-wrap"><span id="topbar-avatar-emoji">👤</span></div>
      <span id="student-user-label" class="unav-username"></span>
      <button class="unav-logout-btn" onclick="logout()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        ออก
      </button>
    </div>
  </div>

  <!-- deadline banner (shared) -->
  <div class="deadline-banner open" id="deadline-banner-s" style="position:relative;z-index:5;flex-shrink:0;">
    <div class="deadline-status"><div class="deadline-dot"></div><div class="deadline-text" id="deadline-text-s">กำลังรับเช็คชื่อ — ปิดเวลา <strong id="deadline-disp-s">20:00</strong></div></div>
    <div class="countdown" id="countdown-s"></div>
  </div>

  <input type="file" id="profile-file-input" accept="image/*" style="display:none" onchange="handleProfilePhotoChange(this)">

  <!-- ── PAGE: PROFILE ── -->
  <div class="student-page active" id="page-profile" style="overflow-y:auto!important;overflow-x:hidden!important;align-items:stretch!important;padding:0!important;">
    <div style="
      display:flex;flex-direction:column;
      width:100%;max-width:580px;
      margin:0 auto;
      padding:16px 20px 28px;
      box-sizing:border-box;
      gap:10px;
      flex:1;
      min-height:100%;
    ">

      <!-- CARD 1: Avatar + Name — login-box style -->
      <div style="
        flex-shrink:0;
        display:flex;align-items:center;gap:16px;
        background:linear-gradient(160deg,rgba(255,20,110,0.13) 0%,rgba(8,2,18,0.97) 40%,rgba(6,1,14,0.99) 100%);
        border:1.5px solid rgba(196,104,138,0.45);
        border-radius:22px;padding:16px 20px;
        box-shadow:
          0 0 0 1px rgba(196,104,138,0.1),
          0 16px 60px rgba(0,0,0,0.7),
          0 0 80px rgba(196,104,138,0.1),
          inset 0 1.5px 0 rgba(255,255,255,0.12),
          inset 0 -1px 0 rgba(196,104,138,0.06);
        
        position:relative;overflow:hidden;
      ">
        <div style="position:absolute;top:0;left:10%;right:10%;height:1.5px;
                    background:linear-gradient(90deg,transparent,rgba(205,130,158,0.85),rgba(255,255,255,0.4),rgba(205,130,158,0.85),transparent);
                    border-radius:2px;"></div>

        <div style="position:relative;flex-shrink:0;" onclick="document.getElementById('profile-file-input').click()">
          <div class="big-avatar" id="big-avatar" style="
            width:68px;height:68px;font-size:26px;cursor:pointer;
            border:2.5px solid rgba(196,104,138,0.85);
            box-shadow:0 0 0 4px rgba(196,104,138,0.12),0 0 20px rgba(196,104,138,0.4);
          "><span id="big-avatar-emoji">👤</span></div>
          <div style="position:absolute;bottom:-3px;right:-3px;
                      width:22px;height:22px;border-radius:50%;
                      background:linear-gradient(135deg,#C4688A,#8A3855);
                      border:2px solid #100b0d;cursor:pointer;
                      display:flex;align-items:center;justify-content:center;font-size:9px;
                      box-shadow:0 2px 12px rgba(196,104,138,0.7);">✏️</div>
        </div>

        <div style="flex:1;min-width:0;">
          <div class="profile-name" id="big-profile-name" style="
            font-size:clamp(18px,4vw,26px);letter-spacing:3px;
            text-shadow:0 0 28px rgba(196,104,138,0.65);
            white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
            margin-bottom:8px;line-height:1.1;">—</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <span style="padding:5px 14px;font-size:10px;letter-spacing:1.5px;
                         background:rgba(196,104,138,0.15);border:1px solid rgba(196,104,138,0.4);
                         color:#D4A0B8;border-radius:20px;font-weight:700;font-family:'Kanit',sans-serif;
                         box-shadow:0 0 10px rgba(196,104,138,0.15);">★ USER</span>
            <span class="badge badge-online" id="badge-online" style="padding:5px 14px;font-size:10px;letter-spacing:1.5px;border-radius:20px;">🟢 ONLINE</span>
          </div>
        </div>
      </div>

      <!-- CARD 2: Info 2×2 — styled like login inputs -->
      <div style="flex-shrink:0;display:grid;grid-template-columns:1fr 1fr;gap:8px;">

        <div style="
          background:linear-gradient(160deg,rgba(185,85,115,0.07) 0%,rgba(8,2,18,0.95) 100%);
          border:1.5px solid rgba(196,104,138,0.22);
          border-radius:16px;padding:14px 16px;position:relative;overflow:hidden;
          box-shadow:0 4px 24px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.07);
          ">
          <div style="position:absolute;top:0;left:0;width:3px;height:100%;
                      background:linear-gradient(180deg,rgba(196,104,138,0.9),rgba(196,104,138,0.1));border-radius:3px 0 0 3px;"></div>
          <div style="font-size:8px;color:rgba(255,100,170,0.65);letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-bottom:6px;padding-left:6px;">เลขที่</div>
          <div id="pinfo-num" style="font-size:22px;font-weight:700;color:#fff;padding-left:6px;text-shadow:0 0 16px rgba(196,104,138,0.3);">—</div>
        </div>

        <div style="
          background:linear-gradient(160deg,rgba(185,85,115,0.07) 0%,rgba(8,2,18,0.95) 100%);
          border:1.5px solid rgba(196,104,138,0.22);
          border-radius:16px;padding:14px 16px;position:relative;overflow:hidden;
          box-shadow:0 4px 24px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.07);
          ">
          <div style="position:absolute;top:0;left:0;width:3px;height:100%;
                      background:linear-gradient(180deg,rgba(196,104,138,0.9),rgba(196,104,138,0.1));border-radius:3px 0 0 3px;"></div>
          <div style="font-size:8px;color:rgba(255,100,170,0.65);letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-bottom:6px;padding-left:6px;">ชื่อ-สกุล</div>
          <div id="pinfo-name" style="font-size:15px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-left:6px;">—</div>
        </div>

        <div style="
          background:linear-gradient(160deg,rgba(185,85,115,0.07) 0%,rgba(8,2,18,0.95) 100%);
          border:1.5px solid rgba(196,104,138,0.22);
          border-radius:16px;padding:14px 16px;position:relative;overflow:hidden;
          box-shadow:0 4px 24px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.07);
          ">
          <div style="position:absolute;top:0;left:0;width:3px;height:100%;
                      background:linear-gradient(180deg,rgba(196,104,138,0.9),rgba(196,104,138,0.1));border-radius:3px 0 0 3px;"></div>
          <div style="font-size:8px;color:rgba(255,100,170,0.65);letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-bottom:6px;padding-left:6px;">สถานะ</div>
          <div id="pinfo-status" style="font-size:15px;font-weight:700;color:#fff;padding-left:6px;">—</div>
        </div>

        <div style="
          background:linear-gradient(160deg,rgba(185,85,115,0.07) 0%,rgba(8,2,18,0.95) 100%);
          border:1.5px solid rgba(196,104,138,0.22);
          border-radius:16px;padding:14px 16px;position:relative;overflow:hidden;
          box-shadow:0 4px 24px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.07);
          ">
          <div style="position:absolute;top:0;left:0;width:3px;height:100%;
                      background:linear-gradient(180deg,rgba(196,104,138,0.9),rgba(196,104,138,0.1));border-radius:3px 0 0 3px;"></div>
          <div style="font-size:8px;color:rgba(255,100,170,0.65);letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-bottom:6px;padding-left:6px;">เวลาเช็ค</div>
          <div id="pinfo-time" style="font-size:15px;font-weight:700;color:#fff;padding-left:6px;">—</div>
        </div>

      </div>

      <!-- CARD 3+4: Online + Xbox side by side -->
      <div style="flex-shrink:0;display:grid;grid-template-columns:1fr 1fr;gap:8px;">

      <!-- CARD 3: Online -->
      <div style="
        background:linear-gradient(160deg,rgba(140,160,150,0.06) 0%,rgba(8,2,18,0.95) 100%);
        border:1.5px solid rgba(140,160,150,0.28);
        border-radius:16px;padding:12px 14px;
        box-shadow:0 4px 24px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.07);
        
        position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;left:0;width:3px;height:100%;
                    background:linear-gradient(180deg,rgba(140,160,150,0.9),rgba(140,160,150,0.1));border-radius:3px 0 0 3px;"></div>
        <div style="font-size:8px;color:rgba(140,160,150,0.75);letter-spacing:2px;
                    margin-bottom:8px;text-transform:uppercase;font-weight:700;padding-left:6px;
                    display:flex;align-items:center;gap:6px;">
          <span style="width:6px;height:6px;border-radius:50%;background:#90b0a0;
                       box-shadow:0 0 8px #90b0a0;flex-shrink:0;
                       animation:pulse 1.5s ease-in-out infinite;display:inline-block;"></span>
          ออนไลน์ตอนนี้
        </div>
        <div id="online-list-student" style="display:flex;flex-direction:column;gap:5px;max-height:80px;overflow-y:auto;padding-left:6px;"></div>
      </div>

      <!-- CARD 4: Xbox -->
      <div id="xbox-name-card" style="
        background:linear-gradient(160deg,rgba(16,200,16,0.06) 0%,rgba(8,2,18,0.95) 100%);
        border:1.5px solid rgba(16,200,16,0.28);border-radius:16px;
        padding:12px 14px;display:flex;align-items:center;gap:10px;
        box-shadow:0 4px 24px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.07);
        position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;left:0;width:3px;height:100%;
                    background:linear-gradient(180deg,rgba(16,200,16,0.9),rgba(16,200,16,0.1));border-radius:3px 0 0 3px;"></div>
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Xbox_one_logo.svg/120px-Xbox_one_logo.svg.png"
             style="height:20px;opacity:0.9;filter:drop-shadow(0 0 6px rgba(16,200,16,0.65));flex-shrink:0;margin-left:6px;">
        <div style="flex:1;min-width:0;">
          <div style="font-size:8px;color:rgba(16,200,16,0.7);letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-bottom:4px;">Xbox Gamertag</div>
          <div id="xbox-gamertag-display" style="font-size:15px;font-weight:700;color:#90c098;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">—</div>
        </div>
        <span style="font-size:18px;flex-shrink:0;">🎮</span>
      </div>

      </div>

      <!-- CARD 5: Date + Time live -->
      <div id="profile-clock-card" style="
        flex-shrink:0;
        background:linear-gradient(160deg,rgba(255,20,110,0.08) 0%,rgba(8,2,18,0.96) 100%);
        border:1.5px solid rgba(196,104,138,0.22);
        border-radius:16px;padding:14px 20px;
        box-shadow:0 4px 24px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.07);
        display:flex;align-items:center;justify-content:space-between;
        position:relative;overflow:hidden;
      ">
        <div style="position:absolute;top:0;left:10%;right:10%;height:1px;
                    background:linear-gradient(90deg,transparent,rgba(205,130,158,0.5),transparent);"></div>
        <div>
          <div style="font-size:8px;color:rgba(255,100,170,0.65);letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-bottom:4px;">วันนี้</div>
          <div id="profile-date-display" style="font-size:13px;font-weight:600;color:rgba(222,180,198,0.85);letter-spacing:.5px;">—</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:8px;color:rgba(255,100,170,0.65);letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-bottom:4px;">เวลา</div>
          <div id="profile-time-display" style="font-family:'Bangers',cursive;font-size:24px;color:#D4899E;letter-spacing:3px;text-shadow:0 0 16px rgba(196,104,138,0.4);line-height:1;">--:--</div>
        </div>
      </div>

      <!-- CARD 6: Quote of the day -->
      <div style="
        flex-shrink:0;
        background:linear-gradient(160deg,rgba(120,0,80,0.07) 0%,rgba(8,2,18,0.95) 100%);
        border:1.5px solid rgba(196,104,138,0.15);
        border-radius:16px;padding:16px 20px;
        box-shadow:0 4px 24px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.05);
        position:relative;overflow:hidden;
      ">
        <div style="position:absolute;top:0;left:0;width:3px;height:100%;
                    background:linear-gradient(180deg,rgba(196,104,138,0.7),rgba(196,104,138,0.05));border-radius:3px 0 0 3px;"></div>
        <div style="font-size:8px;color:rgba(255,100,170,0.55);letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-bottom:8px;padding-left:8px;">✦ คำคมวันนี้</div>
        <div id="profile-quote" style="font-size:13px;line-height:1.65;color:rgba(222,180,198,0.7);padding-left:8px;font-style:italic;letter-spacing:.3px;">กำลังโหลด...</div>
      </div>

    </div>
  </div>

  <!-- ── PAGE: CHECK-IN ── -->
  <div class="student-page" id="page-checkin">
    <div class="profile-page-wrap" style="display:flex;flex-direction:column;align-items:center;padding-top:16px;">
      <!-- small avatar -->
      <div class="profile-avatar-wrap" style="margin-bottom:10px;">
        <div class="profile-avatar" id="profile-avatar" onclick="document.getElementById('profile-file-input').click()">
          <span id="profile-emoji">👤</span>
        </div>
        <div class="profile-edit-icon" onclick="document.getElementById('profile-file-input').click()">✏️</div>
      </div>
      <div class="profile-name" id="profile-name" style="margin-bottom:2px;">—</div>
      <div class="profile-num" id="profile-num"></div>

      <div class="status-card" id="status-card" style="margin-top:20px;">
        <div style="font-size:11px;color:rgba(255,255,255,0.35);letter-spacing:1px;margin-bottom:6px;">สถานะวันนี้</div>
        <div class="status-big" id="status-big" style="color:rgba(255,255,255,0.3);">ยังไม่เช็คชื่อ</div>
        <div class="status-time" id="status-time"></div>
      </div>

      <div style="margin-top:20px;font-size:12px;color:rgba(255,255,255,0.22);text-align:center;letter-spacing:.5px;line-height:1.9;">
        การเช็คชื่อดำเนินการโดย Admin เท่านั้น<br>ไม่ต้องทำอะไร — มาให้ Admin เห็นก็พอ 😊
      </div>
    </div>
  </div>

  <!-- ── PAGE: SHOPPING ── -->
  <div class="student-page" id="page-shop">
    <div class="shop-wrap">
      <div class="shop-title">🛒 ของที่ต้องซื้อ</div>
      <div class="shop-subtitle">รายการที่ Admin เพิ่มให้</div>
      <div id="student-shop-list" style="display:flex;flex-direction:column;gap:10px;"></div>
      <div id="student-shop-empty" style="text-align:center;padding:48px 16px;color:rgba(255,255,255,0.15);font-size:13px;letter-spacing:1px;display:none;">
        📭 ยังไม่มีรายการ<br><span style="font-size:11px;margin-top:6px;display:block;">รอ Admin เพิ่มของ</span>
      </div>
    </div>
  </div>

</div>

  <!-- ── PAGE: FIND FRIENDS (Tinder Style) ── -->
  <div class="student-page" id="page-friends" style="position:relative;">

    <!-- Swipe View (always visible as base) -->
    <div id="friends-swipe-view" style="display:flex;flex-direction:column;align-items:center;justify-content:flex-start;height:100%;padding:10px 24px 16px;gap:0;overflow:hidden;">
      <div style="font-size:10px;color:rgba(255,255,255,0.18);letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;font-weight:500;flex-shrink:0;">💜 หาเพื่อนเล่นเกม</div>

      <!-- Card Stack -->
      <div id="friend-card-stack" style="position:relative;width:min(460px, 90vw);height:min(580px, calc(100dvh - 280px));flex-shrink:0;touch-action:none;">
        <div id="friend-no-more" style="display:none;text-align:center;padding-top:80px;color:rgba(255,255,255,0.2);font-size:14px;letter-spacing:1px;">
          ✨ หมดแล้ว<br><span style="font-size:11px;">รอเพื่อนออนไลน์เข้ามา</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="display:flex;gap:20px;flex-shrink:0;align-items:center;margin-top:12px;">
        <button id="btn-nope" onclick="swipeCard('left')" style="width:64px;height:64px;border-radius:50%;background:rgba(12,6,12,0.9);border:2px solid rgba(255,60,90,0.5);font-size:26px;cursor:pointer;transition:all .25s cubic-bezier(.34,1.56,.64,1);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(255,60,90,0.2),inset 0 1px 0 rgba(255,255,255,0.05);color:#b04060;" onmouseover="this.style.transform='scale(1.1)';this.style.boxShadow='0 8px 28px rgba(255,60,90,0.55),inset 0 1px 0 rgba(255,255,255,0.05)';this.style.borderColor='rgba(255,60,90,0.85)'" onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 4px 20px rgba(255,60,90,0.2),inset 0 1px 0 rgba(255,255,255,0.05)';this.style.borderColor='rgba(255,60,90,0.5)'">✕</button>
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
          <button id="btn-like" onclick="swipeCard('right')" style="width:72px;height:72px;border-radius:50%;background:linear-gradient(145deg,#C4688A 0%,#A04565 50%,#7a4060 100%);border:none;font-size:30px;cursor:pointer;transition:all .25s cubic-bezier(.34,1.56,.64,1);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 28px rgba(196,104,138,0.55),0 0 0 1px rgba(196,104,138,0.2),inset 0 1px 0 rgba(255,255,255,0.2);" onmouseover="this.style.transform='scale(1.12) translateY(-2px)';this.style.boxShadow='0 10px 36px rgba(196,104,138,0.75),0 0 0 1px rgba(196,104,138,0.3),inset 0 1px 0 rgba(255,255,255,0.2)'" onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 6px 28px rgba(196,104,138,0.55),0 0 0 1px rgba(196,104,138,0.2),inset 0 1px 0 rgba(255,255,255,0.2)'">💜</button>
        </div>
        <button id="btn-nope2" onclick="window.location.reload?undefined:null" style="display:none"></button>
      </div>
      <div style="font-size:9px;color:rgba(255,255,255,0.12);letter-spacing:2px;margin-top:8px;text-transform:uppercase;">ปัดซ้าย = ไม่ &nbsp;•&nbsp; ปัดขวา = ชอบ</div>
    </div>

    <!-- Match Overlay (full page) -->
    <div id="friends-match-view" style="display:none;position:absolute;inset:0;z-index:20;background:rgba(8,5,16,0.97);flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;">
      <div style="font-size:56px;margin-bottom:8px;animation:matchPop .4s cubic-bezier(.34,1.56,.64,1);">💜</div>
      <div style="font-family:'Bangers',cursive;font-size:40px;letter-spacing:4px;color:var(--pink);text-shadow:0 0 30px var(--pink-glow),0 0 60px var(--pink-glow);margin-bottom:6px;">MATCH!</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:6px;">คุณกับ <span id="match-name" style="color:#fff;font-weight:700;"></span> แมทช์กันแล้ว!</div>
      <div style="font-size:11px;color:rgba(210,180,130,0.6);letter-spacing:1px;margin-bottom:24px;">⏱ แชทได้ 3:30 นาที</div>
      <button onclick="openMatchChat()" style="background:linear-gradient(135deg,#C4688A,#A04565);border:none;color:#fff;font-family:'Kanit',sans-serif;font-size:15px;font-weight:700;padding:14px 36px;border-radius:20px;cursor:pointer;box-shadow:0 4px 24px rgba(196,104,138,0.5);letter-spacing:1px;margin-bottom:12px;">💬 แชทเลย</button>
      <button onclick="closeMatchView()" style="background:transparent;border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.4);font-family:'Kanit',sans-serif;font-size:12px;padding:10px 24px;border-radius:14px;cursor:pointer;">กลับไปหาเพื่อน</button>
    </div>
  </div>

  <!-- ── PAGE: BATTLEPASS v3 (pink-grey game-style, image-matched) ── -->
<!-- styles moved to style.css -->

  <div class="student-page" id="page-battlepass" style="overflow-y:auto!important;overflow-x:hidden!important;align-items:stretch!important;">
    <div style="width:100%;display:flex;flex-direction:column;padding:0 0 40px;box-sizing:border-box;gap:0;">

      <!-- ══ TOP BAR ══ -->
      <div class="bp3-header">
        <div class="bp3-season-chip">
          <div style="width:8px;height:8px;border-radius:50%;background:#c07898;animation:pulse-dot 1.5s ease-in-out infinite;flex-shrink:0;"></div>
          <div style="font-size:11px;color:rgba(230,160,210,0.9);font-weight:700;letter-spacing:.8px;">Season Ends:</div>
          <div style="font-family:'Bangers',cursive;font-size:16px;color:#d0a8b8;letter-spacing:1px;" id="bp-season-timer">12d 11h</div>
        </div>
        <div class="bp3-title-center">
          <div class="bp3-season-title">SEASON 1</div>
          <div class="bp3-season-sub">Complete mission to unlock rewards!</div>
        </div>
        <div class="bp3-settings-btn">⚙</div>
      </div>

      <!-- ══ XP PROGRESS STRIP ══ -->
      <div class="bp3-xp-strip">
        <div class="bp3-tier-badge">
          <div id="bp-tier-num" style="font-family:'Bangers',cursive;font-size:20px;color:#d0a8b8;line-height:1;">1</div>
        </div>
        <div class="bp3-xp-bar-wrap">
          <div id="bp-xp-bar" style="height:100%;width:0%;
            background:linear-gradient(90deg,#7a4055,#b8607a,#d090a8);
            border-radius:7px;transition:width .8s cubic-bezier(.34,1.56,.64,1);
            box-shadow:0 0 12px rgba(175,100,130,0.7);"></div>
        </div>
        <div id="bp-xp-text" style="font-size:13px;color:rgba(210,150,190,0.9);font-weight:700;white-space:nowrap;flex-shrink:0;">0/3 XP</div>
        <div id="bp-tier-label" class="bp3-rank-pill">RECRUIT</div>
      </div>

      <!-- ══ BATTLE PASS TRACK ══ -->
      <div class="bp3-track-shell" id="bp-track-container">

        <!-- main 2-row layout: labels + scrollable cards -->
        <div style="display:flex;align-items:stretch;">

          <!-- LEFT: label column -->
          <div class="bp3-labels-col">
            <div class="bp3-label-free">
              <div style="font-size:26px;">🛡</div>
              <div style="font-size:9px;font-weight:700;letter-spacing:1px;color:rgba(190,155,168,0.75);text-transform:uppercase;text-align:center;line-height:1.3;">FREE<br>REWARDS</div>
            </div>
            <div class="bp3-label-paid">
              <div style="font-family:'Bangers',cursive;font-size:16px;font-weight:700;
                background:linear-gradient(135deg,#e8c4d0,#b8607a);
                -webkit-background-clip:text;-webkit-text-fill-color:transparent;
                letter-spacing:2px;text-align:center;line-height:1.1;">BATTLE<br>PASS</div>
              <button onclick="showBPUpgrade()" style="
                background:linear-gradient(135deg,#b8607a,#7a3850);
                border:none;color:#fff;font-family:'Kanit',sans-serif;
                font-size:9px;font-weight:700;letter-spacing:.8px;
                padding:5px 10px;border-radius:9px;cursor:pointer;
                box-shadow:0 2px 12px rgba(200,60,130,0.5);
                white-space:nowrap;line-height:1.4;
              ">GET SEASON<br>PASS</button>
            </div>
          </div>

          <!-- RIGHT: scrollable track -->
          <div style="flex:1;overflow:hidden;position:relative;min-height:200px;">
            <button id="bp-prev" class="bp3-nav" style="left:4px;">‹</button>
            <button id="bp-next" class="bp3-nav" style="right:4px;">›</button>

            <div id="bp-tier-viewport" style="overflow:hidden;padding:0 32px;touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab;height:100%;min-height:200px;">
              <!-- FREE ROW -->
              <div style="display:flex;gap:0;width:max-content;pointer-events:none;" id="bp-free-track"></div>
              <!-- NUMBER STRIP -->
              <div style="display:flex;gap:0;width:max-content;overflow:hidden;pointer-events:none;" id="bp-num-track"></div>
              <!-- PAID ROW -->
              <div id="bp-tier-track" style="display:flex;gap:0;width:max-content;pointer-events:none;"></div>
            </div>
          </div>
        </div>

        <!-- nav hint + dots -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 18px 0;gap:8px;">
          <div style="font-size:10px;color:rgba(170,110,150,0.4);letter-spacing:.8px;white-space:nowrap;">← เลื่อนดูรางวัล →</div>
          <div id="bp-track-dots" style="display:flex;gap:6px;align-items:center;flex:1;justify-content:center;"></div>
          <span id="bp-track-pos" style="font-size:11px;color:rgba(175,130,155,0.45);font-weight:700;white-space:nowrap;flex-shrink:0;">1/4</span>
        </div>
        <div class="bp3-hint" id="bp-next-hint">มาอีก <span id="bp-xp-needed" style="color:rgba(240,140,200,0.9);font-weight:700;">3</span> ครั้งเพื่อ tier ต่อไป</div>
      </div>

      <!-- ══ MISSIONS ══ -->
      <div class="bp3-section">
        <div class="bp3-section-title">📋 MISSIONS</div>
        <div id="bp-missions" style="display:flex;flex-direction:column;gap:8px;width:100%;"></div>
      </div>

      <!-- ══ CLAIM REWARDS ══ -->
      <div class="bp3-section" style="border-color:rgba(220,130,190,0.2);margin-bottom:12px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;left:8%;right:8%;height:1px;
            background:linear-gradient(90deg,transparent,rgba(195,135,162,0.5),rgba(255,255,255,0.15),rgba(195,135,162,0.5),transparent);"></div>
        <div class="bp3-section-title">🎁 CLAIM REWARDS</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.25);margin-bottom:12px;letter-spacing:.3px;">รางวัลที่ unlock แล้ว — กดรับเพื่อรับของในเกม</div>
        <div id="bp-claim-list" style="display:flex;flex-direction:column;gap:8px;width:100%;"></div>
        <div id="bp-claim-empty" style="display:none;text-align:center;padding:20px;color:rgba(255,255,255,0.14);font-size:12px;letter-spacing:1px;">
          ยังไม่มีรางวัลที่รอรับ<br><span style="font-size:10px;opacity:.6;">เก็บ XP เพิ่มเพื่อ unlock tier ใหม่</span>
        </div>
        <div id="bp-claim-history-wrap" style="margin-top:10px;display:none;">
          <div style="font-size:8px;color:rgba(255,255,255,0.1);letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">ประวัติการรับแล้ว</div>
          <div id="bp-claim-history" style="display:flex;flex-direction:column;gap:5px;"></div>
        </div>
      </div>

    </div>
  </div>

<!-- edit name modal -->
<div class="modal-overlay" id="edit-modal">
  <div class="modal">
    <div class="modal-title">✏ แก้ไขชื่อ</div>
    <span class="lbl">ชื่อ-สกุลใหม่</span>
    <input class="inp" id="edit-name-inp" type="text" placeholder="กรอกชื่อใหม่..." onkeydown="if(event.key==='Enter')saveEditName()">
    <div class="modal-btns">
      <button class="btn-confirm" onclick="saveEditName()">✓ บันทึก</button>
      <button class="btn-cancel" onclick="closeEditModal()">ยกเลิก</button>
    </div>
  </div>
</div>

<!-- admin edit name modal -->
<div class="modal-overlay" id="admin-edit-modal">
  <div class="modal">
    <div class="modal-title" style="color:rgba(100,180,255,0.9);">✏ Admin — แก้ไขชื่อ</div>
    <span class="lbl">ชื่อ-สกุลใหม่</span>
    <input class="inp" id="admin-edit-name-inp" type="text" placeholder="กรอกชื่อใหม่..." onkeydown="if(event.key==='Enter')adminSaveEditName()">
    <div class="modal-btns">
      <button class="btn-confirm" onclick="adminSaveEditName()">✓ บันทึก</button>
      <button class="btn-cancel" onclick="adminCloseEditModal()">ยกเลิก</button>
    </div>
  </div>
</div>



<!-- ctx menu -->
<div class="ctx-menu" id="ctx-menu">
  <div class="ctx-item" onclick="ctxPresent()">✓ เช็คชื่อ (มา)</div>
  <div class="ctx-item" onclick="ctxAbsent()">✗ บันทึกขาด</div>
  <div class="ctx-item" onclick="ctxReset()">↺ รีเซ็ต</div>
  <div class="ctx-item" onclick="ctxEditName()" style="color:rgba(100,180,255,0.9);">✏ แก้ไขชื่อ</div>
  <div class="ctx-item danger" onclick="ctxDelete()">🗑 ลบออก</div>
</div>

<div class="toast" id="toast"></div>



<script>
  // ── ตั้งค่า Backend URL และ API Key ──
  window.API_BASE = 'https://rvevwe-backend.onrender.com';
</script>
<script type="module" src="main.js"></script>



<!-- Chat Panel - inside student screen, covers full screen -->
<div id="friends-chat-view" style="position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;display:none;flex-direction:column;background:#130d10;">
  <!-- Header -->
  <div style="display:flex;align-items:center;gap:10px;padding:14px 16px;background:rgba(196,104,138,0.08);border-bottom:1px solid rgba(196,104,138,0.2);flex-shrink:0;padding-top:max(14px,env(safe-area-inset-top,14px));">
    <button onclick="closeChatView()" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);color:#fff;font-size:14px;cursor:pointer;width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Kanit',sans-serif;">← กลับ</button>
    <div id="chat-partner-avatar" style="width:36px;height:36px;border-radius:50%;border:2px solid #C4688A;background:rgba(196,104,138,0.1);display:flex;align-items:center;justify-content:center;font-size:16px;overflow:hidden;flex-shrink:0;">👤</div>
    <div style="flex:1;min-width:0;">
      <div id="chat-partner-name" style="font-size:14px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:'Kanit',sans-serif;"></div>
      <div style="font-size:10px;color:rgba(210,180,130,0.8);margin-top:2px;font-family:'Kanit',sans-serif;">⏱ เหลือ <span id="chat-countdown" style="font-weight:700;">3:30</span></div>
    </div>
    <div style="width:80px;height:4px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden;flex-shrink:0;">
      <div id="chat-timer-bar" style="height:100%;width:100%;background:linear-gradient(90deg,#C4688A,#C8A060);transition:width 1s linear;"></div>
    </div>
  </div>
  <!-- Messages -->
  <div id="chat-messages" style="flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px;scroll-behavior:smooth;"></div>
  <!-- Input -->
  <div style="display:flex;gap:8px;padding:10px 12px 14px;background:rgba(0,0,0,0.4);border-top:1px solid rgba(255,255,255,0.07);flex-shrink:0;">
    <input id="chat-input" type="text" placeholder="พิมพ์ข้อความ..." maxlength="200"
      style="flex:1;background:rgba(255,255,255,0.07);border:1.5px solid rgba(255,255,255,0.12);color:#fff;font-family:'Kanit',sans-serif;font-size:13px;padding:10px 14px;border-radius:22px;outline:none;"
      onfocus="this.style.borderColor='rgba(196,104,138,0.6)'"
      onblur="this.style.borderColor='rgba(255,255,255,0.12)'"
      onkeydown="if(event.key==='Enter')sendChatMessage()">
    <button onclick="sendChatMessage()" style="background:linear-gradient(135deg,#C4688A,#A04565);border:none;color:#fff;font-size:18px;width:44px;height:44px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;">➤</button>
  </div>
</div>

<script src="images.js"></script>
<script src="logo-fx.js"></script>
<script src="particles.js"></script>
<script src="aurora.js"></script>
<script src="orbit.js"></script>
<script src="aurora-student.js"></script>
<script src="constellation.js"></script>
<script src="clock-carousel.js"></script>

</body>
</html>
