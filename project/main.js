/* ══ BACKEND CONFIG ══ */
const API_BASE = (typeof window !== 'undefined' && window.API_BASE) || 'https://YOUR-APP.onrender.com';
const WS_URL  = API_BASE.replace(/^http/, 'ws');

// ── Session Token ──
let _sessionToken = localStorage.getItem('rev_token') || null;

function setToken(token) {
  _sessionToken = token;
  if (token) localStorage.setItem('rev_token', token);
  else localStorage.removeItem('rev_token');
}

// ── API helper ──
async function api(method, path, body) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (_sessionToken) headers['x-session-token'] = _sessionToken;
  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) {
    setToken(null);
    clearSession();
    showScreen('login-screen');
    throw new Error('session expired');
  }
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── WebSocket (singleton, auto-reconnect) ──
let _ws = null;
let _wsReady = false;
const _wsHandlers = {}; // event → [callbacks]
let _wsReconnectTimer = null;

function wsOn(event, cb) {
  if (!_wsHandlers[event]) _wsHandlers[event] = [];
  _wsHandlers[event].push(cb);
}

function _wsConnect() {
  if (_ws && (_ws.readyState === WebSocket.OPEN || _ws.readyState === WebSocket.CONNECTING)) return;
  _ws = new WebSocket(WS_URL);
  _ws.onopen = () => {
    _wsReady = true;
    clearTimeout(_wsReconnectTimer);
    // re-register online if student is logged in
    if (typeof currentStudent !== 'undefined' && currentStudent) {
      _ws.send(JSON.stringify({ type: 'setOnline', payload: { id: currentStudent.id, name: currentStudent.name } }));
    }
  };
  _ws.onmessage = (e) => {
    try {
      const { event, data } = JSON.parse(e.data);
      const cbs = _wsHandlers[event] || [];
      cbs.forEach(cb => cb(data));
    } catch {}
  };
  _ws.onclose = () => {
    _wsReady = false;
    _wsReconnectTimer = setTimeout(_wsConnect, 3000);
  };
  _ws.onerror = () => { _ws.close(); };
}
_wsConnect();

// heartbeat ทุก 15s
setInterval(() => {
  if (_ws && _ws.readyState === WebSocket.OPEN) {
    _ws.send(JSON.stringify({ type: 'ping' }));
  }
}, 15000);

/* ══ CONSTANTS ══ */
// PIN ถูกย้ายไปเก็บใน backend env แล้ว ไม่มีใน frontend

/* helper — ครูเห็นทุกอย่างแต่แก้ไขไม่ได้ */
function isTeacher() { return currentRole === 'teacher'; }

/* ══ STATE ══ */
let currentRole = null;
let currentStudent = null;
let currentFilter = 'all';
let ctxTarget = null;
let rPinVal = '', sPinVal = '', aPinVal = '';
let rAvatarData = null;
let _regName = '', _regPw = '';
let currentMode = 'student';

let settings = { deadlineTime:'20:00', deadlineActive:true };
let students = [];

/* ══ BACKEND SYNC ══ */
let _sessionRestored = false;

// ── WebSocket: receive realtime updates ──
wsOn('students', (data) => {
  students = data ? Object.values(data) : [];
  const bar = document.getElementById('splash-bar');
  if (bar) bar.style.width = '100%';
  if (!_sessionRestored) { _sessionRestored = true; setTimeout(() => restoreSession(), 200); }
  if (currentRole === 'admin') renderAdmin();
  if (currentRole === 'student' && currentStudent) {
    const updated = students.find(s => s.id === currentStudent.id);
    if (updated) { currentStudent = updated; updateStudentStatus(); }
    const friendsPage = document.getElementById('page-friends');
    if (friendsPage && friendsPage.classList.contains('active') && typeof debouncedBuildDeck !== 'undefined') {
      buildFriendDeck();
    }
  }
});

wsOn('settings', (data) => {
  if (data) {
    settings = data;
    updateDeadlineBanners?.();
    const ti = document.getElementById('deadline-time-input');
    if (ti) ti.value = settings.deadlineTime;
    const tog = document.getElementById('deadline-toggle');
    if (tog) tog.className = 'toggle-track ' + (settings.deadlineActive ? 'on' : '');
    const tt = document.getElementById('deadline-toggle-text');
    if (tt) tt.textContent = settings.deadlineActive ? 'เปิดรับอยู่' : 'ปิดรับแล้ว';
  }
});

// Fetch on load
(async function initLoad() {
  try {
    const [studData, settData] = await Promise.all([
      api('GET', '/students'),
      api('GET', '/settings'),
    ]);
    students = studData ? Object.values(studData) : [];
    const bar = document.getElementById('splash-bar');
    if (bar) bar.style.width = '100%';
    if (!_sessionRestored) { _sessionRestored = true; setTimeout(() => restoreSession(), 200); }
    if (settData && Object.keys(settData).length) {
      settings = settData;
      updateDeadlineBanners?.();
    }
  } catch (e) { console.warn('initLoad error:', e.message); }
})();

// Fallback splash timeout
setTimeout(() => {
  if (!_sessionRestored) {
    _sessionRestored = true;
    try {
      const raw = localStorage.getItem('rev_session');
      if (raw) {
        const sess = JSON.parse(raw);
        if (sess.role === 'admin') {
          currentRole = 'admin'; showScreen('admin-screen'); renderAdmin();
        } else { clearSession(); showScreen('login-screen'); }
      } else { showScreen('login-screen'); }
    } catch(e) { showScreen('login-screen'); }
    hideSplash();
  }
}, 3000);

async function saveStudents() {
  const obj = {};
  students.forEach(s => { obj[s.id] = s; });
  await api('POST', '/students', obj);
}

async function saveSettings() {
  await api('POST', '/settings', settings);
}

function save() {
  saveStudents();
  saveSettings();
}

/* ══ ONLINE PRESENCE ══ */
function setOnline(studentId, name) {
  if (_ws && _ws.readyState === WebSocket.OPEN) {
    _ws.send(JSON.stringify({ type: 'setOnline', payload: { id: studentId, name } }));
    _ws._studentId = studentId;
  }
}
function setOffline() {
  if (_ws && _ws.readyState === WebSocket.OPEN) {
    _ws.send(JSON.stringify({ type: 'setOffline' }));
  }
}
window.addEventListener('beforeunload', setOffline);

window._onlineUsers = null;
wsOn('online', (users) => {
  const wasNull = window._onlineUsers === null;
  window._onlineUsers = users || [];
  updateOnlineBadge();
  if (wasNull && currentRole === 'student' && currentStudent) {
    const friendsPage = document.getElementById('page-friends');
    if (friendsPage && friendsPage.classList.contains('active')) {
      friendDeck = [];
      buildFriendDeck();
    }
  }
});

function updateOnlineBadge() {
  const el = document.getElementById('online-badge');
  const list = window._onlineUsers || [];
  if (el) el.textContent = list.length > 0 ? `🟢 ออนไลน์ ${list.length} คน` : '';

  // update admin online count badge
  const obadge = document.getElementById('atab-online-count');
  if (obadge) obadge.textContent = list.length;

  // refresh admin online tab if active
  if (currentAdminTab === 'online') renderAdminOnline();
  if (currentAdminTab === 'stats')  renderAdminStats();

  // ถ้า student อยู่หน้า friends → แค่ rebuild ถ้ายังไม่มี card ใน DOM
  if (currentRole === 'student' && currentStudent) {
    const friendsPage = document.getElementById('page-friends');
    const swipeView = document.getElementById('friends-swipe-view');
    if (friendsPage && friendsPage.classList.contains('active') &&
        swipeView && swipeView.style.display !== 'none') {
      const stack = document.getElementById('friend-card-stack');
      const hasCards = stack && stack.querySelectorAll('.friend-card').length > 0;
      if (!hasCards) buildFriendDeck();
    }
  }

  // student side: show who's online
  const listEl = document.getElementById('online-list-student');
  if (!listEl) return;
  if (list.length === 0) {
    listEl.innerHTML = `<div style="text-align:center;color:rgba(255,255,255,0.15);font-size:12px;">ยังไม่มีใครออนไลน์</div>`;
    return;
  }
  listEl.innerHTML = list.map(u => {
    const isSelf = currentStudent && u.id === currentStudent.id;
    const student = students.find(s => s.id === u.id);
    const avatarHtml = student && student.avatar
      ? `<img src="${student.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
      : `<span style="font-size:14px;">👤</span>`;
    return `<div style="
      display:flex;align-items:center;gap:10px;
      background:rgba(255,255,255,0.04);
      border:1px solid rgba(140,160,150,${isSelf?'0.35':'0.15'});
      border-radius:10px;padding:8px 12px;
      ${isSelf?'box-shadow:0 0 10px rgba(140,160,150,0.1);':''}
    ">
      <div style="width:30px;height:30px;border-radius:50%;border:1.5px solid rgba(140,160,150,0.4);background:rgba(0,212,255,0.08);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;">${avatarHtml}</div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:13px;font-weight:600;color:${isSelf?'#90b0a0':'rgba(255,255,255,0.85)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          ${u.name}${isSelf?' <span style="font-size:10px;opacity:0.6;">(คุณ)</span>':''}
        </div>
      </div>
      <div style="width:7px;height:7px;border-radius:50%;background:#90b0a0;box-shadow:0 0 6px #90b0a0;flex-shrink:0;animation:pulse 2s ease-in-out infinite;"></div>
    </div>`;
  }).join('');
}

/* ══ HELPERS ══ */
function clearMsg() {
  document.getElementById('login-err').textContent = '';
  document.getElementById('login-ok').textContent = '';
}

function showStep(id) {
  ['main-step1','main-step3','main-step3b','main-step5'].forEach(s => {
    const el = document.getElementById(s); if(el) el.style.display = 'none';
  });
  const target = document.getElementById(id);
  if (target) { target.style.display = ''; target.classList.remove('step'); void target.offsetWidth; target.classList.add('step'); }
  clearMsg();
}

function mainBack() { showStep('main-step1'); sPinVal=''; rPinVal=''; aPinVal=''; updatePinDots('s','','cyan'); updatePinDots('r','','yellow'); updatePinDots('a','',''); }
function goRegStep2() {
  var name = (document.getElementById('r-name').value||'').trim();
  var pw = document.getElementById('r-password-direct').value || '';
  var errEl = document.getElementById('login-err');
  function showRegErr(msg){ errEl.textContent=msg; errEl.scrollIntoView({behavior:'smooth',block:'nearest'}); }
  if(!name){ showRegErr('⚠ กรุณากรอกชื่อ-สกุล'); return; }
  if(pw.length < 4){ showRegErr('⚠ รหัสผ่านต้องครบ 4 หลัก (กรอก: '+pw.length+' หลัก)'); return; }
  errEl.textContent='';
  _regName = name; _regPw = pw;
  document.getElementById('reg-name-cache').value = name;
  document.getElementById('reg-pw-cache').value = pw;
  document.getElementById('main-step3').style.display='none';
  document.getElementById('main-step3b').style.display='block';
  document.getElementById('login-err').textContent = '';
  document.getElementById('login-ok').textContent = '';
  document.getElementById('r-xbox').focus();
}
function showRegister() { _regName=''; _regPw=''; document.getElementById('reg-name-cache').value=''; document.getElementById('reg-pw-cache').value=''; document.getElementById('r-name').value = ''; document.getElementById('r-password-direct').value = ''; document.getElementById('r-xbox').value = ''; document.getElementById('login-err').textContent=''; rAvatarData=null; document.getElementById('r-avatar-preview').innerHTML='📷'; document.getElementById('main-step3b').style.display='none'; showStep('main-step3'); }

/* ══ PIN HELPERS ══ */
function updatePinDots(prefix, val, colorClass='') {
  const dotClass = colorClass ? ' filled ' + colorClass : ' filled';
  for (let i=0;i<4;i++) {
    const d = document.getElementById(prefix+'d'+i);
    if (d) d.className = 'pin-dot' + (i < val.length ? dotClass : '');
  }
}

/* ══ SMART LOGIN (Username + Password) ══ */
function togglePwVis(inputId, btn) {
  const inp = document.getElementById(inputId);
  const ml = inp.getAttribute('maxlength');
  if (inp.type === 'password') { inp.type = 'text'; btn.style.opacity='1'; }
  else { inp.type = 'password'; btn.style.opacity='0.5'; }
  if (ml) inp.setAttribute('maxlength', ml);
}

function smartLogin() {
  const name = document.getElementById('s-name').value.trim();
  const pw = document.getElementById('s-password').value;
  clearMsg();
  if (!name) { document.getElementById('login-err').textContent = '⚠ กรุณากรอก Username'; return; }
  if (!pw) { document.getElementById('login-err').textContent = '⚠ กรุณากรอก Password'; document.getElementById('s-password').focus(); return; }

  // Admin login
  if (name.toLowerCase() === 'admin') {
    fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'admin', password: pw })
    }).then(r => r.json()).then(data => {
      if (!data.ok) {
        document.getElementById('login-err').textContent = '✗ Admin Password ไม่ถูกต้อง';
        document.getElementById('s-password').value = '';
        document.getElementById('s-password').focus();
        return;
      }
      setToken(data.token);
      currentRole = 'admin';
      saveSession('admin', null);
      showScreen('admin-screen');
      renderAdmin();
      updateDeadlineBanners();
      document.getElementById('deadline-time-input').value = settings.deadlineTime;
      const toggle = document.getElementById('deadline-toggle');
      toggle.className = 'toggle-track ' + (settings.deadlineActive ? 'on' : '');
      document.getElementById('deadline-toggle-text').textContent = settings.deadlineActive ? 'เปิดรับอยู่' : 'ปิดรับแล้ว';
    }).catch(() => {
      document.getElementById('login-err').textContent = '✗ เชื่อมต่อ server ไม่ได้';
    });
    return;
  }

  // Teacher login
  if (name.toLowerCase() === 'teacher') {
    fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'teacher', password: pw })
    }).then(r => r.json()).then(data => {
      if (!data.ok) {
        document.getElementById('login-err').textContent = '✗ Teacher Password ไม่ถูกต้อง';
        document.getElementById('s-password').value = '';
        document.getElementById('s-password').focus();
        return;
      }
      setToken(data.token);
      currentRole = 'teacher';
      saveSession('teacher', null);
      showTeacherScreen();
    }).catch(() => {
      document.getElementById('login-err').textContent = '✗ เชื่อมต่อ server ไม่ได้';
    });
    return;
  }

  // User login
  const found = students.find(s => s.name === name);
  if (!found) { document.getElementById('login-err').textContent = '✗ ไม่พบ Username นี้ — กรุณาสมัครก่อน'; return; }
  fetch(API_BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'student', password: pw, studentId: found.id })
  }).then(r => r.json()).then(data => {
    if (!data.ok) {
      document.getElementById('login-err').textContent = '✗ Password ไม่ถูกต้อง';
      document.getElementById('s-password').value = '';
      document.getElementById('s-password').focus();
      return;
    }
    setToken(data.token);
    currentRole = 'student';
    currentStudent = found;
    saveSession('student', found.id);
    showStudentScreen();
  }).catch(() => {
    document.getElementById('login-err').textContent = '✗ เชื่อมต่อ server ไม่ได้';
  });
}

/* ══ STUDENT PIN ══ */
function sPinPress(v) { if(sPinVal.length>=4)return; sPinVal+=v; updatePinDots('s',sPinVal,'cyan'); if(sPinVal.length===4)setTimeout(sDoLogin,200); }
function sPinDel() { sPinVal=sPinVal.slice(0,-1); updatePinDots('s',sPinVal,'cyan'); }
function sPinClear() { sPinVal=''; updatePinDots('s',sPinVal,'cyan'); }

function sDoLogin() {
  const name = document.getElementById('s-name').value.trim();
  const student = students.find(s => s.name === name && s.pin === sPinVal);
  if (!student) {
    document.getElementById('login-err').textContent = '✗ PIN ไม่ถูกต้อง';
    sPinVal=''; updatePinDots('s',sPinVal,'cyan'); return;
  }
  currentRole = 'student';
  currentStudent = student;
  saveSession('student', student.id);
  showStudentScreen();
}

/* ══ REGISTER ══ */
function handleAvatarUpload(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    rAvatarData = e.target.result;
    document.getElementById('r-avatar-preview').innerHTML = `<img src="${rAvatarData}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
  };
  reader.readAsDataURL(file);
}

function rGoPin() {
  // legacy: now handled by rDirectRegister
  rDirectRegister();
}

function rDirectRegister() {
  const nameRaw = _regName || document.getElementById('reg-name-cache').value || document.getElementById('r-name').value || '';
  const name = nameRaw.trim();
  const pw = _regPw || document.getElementById('reg-pw-cache').value || document.getElementById('r-password-direct').value || '';
  const xbox = document.getElementById('r-xbox').value.trim();
  clearMsg();
  if (!name) { document.getElementById('login-err').textContent = '⚠ กรุณากรอกชื่อ-สกุล'; return; }
  if (!pw || pw.length < 4) { document.getElementById('login-err').textContent = '⚠ กรุณาตั้ง Password 4 หลัก'; return; }
  if (!xbox) { document.getElementById('login-err').textContent = '⚠ กรุณากรอก Xbox Gamertag'; document.getElementById('r-xbox').focus(); return; }
  const nameCheck = name.trim().toLowerCase();
  const xboxCheck = xbox.trim().toLowerCase();
  console.log('[REG] students loaded:', students.length, '| checking name:', nameCheck, '| xbox:', xboxCheck);
  console.log('[REG] existing names:', students.map(s => s.name));
  const dupName = students.find(s => (s.name||'').trim().toLowerCase() === nameCheck);
  if (dupName) { document.getElementById('login-err').textContent = '⚠ ชื่อ "' + (dupName.name||name) + '" ถูกใช้แล้ว — ลองชื่ออื่น'; return; }
  const dupXbox = students.find(s => (s.xbox||'').trim().toLowerCase() === xboxCheck);
  if (dupXbox) { document.getElementById('login-err').textContent = '⚠ Xbox Gamertag "' + (dupXbox.xbox||xbox) + '" ถูกใช้แล้ว — ลองชื่ออื่น'; return; }
  const num = students.length + 1;
  const newStudent = { id: Date.now(), num, name, pin: pw, xbox, avatar: rAvatarData || null, status: 'none', checkinTime: null };  students.push(newStudent); save();
  _regName = ''; _regPw = '';
  document.getElementById('reg-name-cache').value = '';
  document.getElementById('reg-pw-cache').value = '';
  document.getElementById('r-name').value = '';
  document.getElementById('r-password-direct').value = '';
  document.getElementById('r-xbox').value = '';
  document.getElementById('r-avatar-preview').innerHTML = '📷';
  rAvatarData = null;
  document.getElementById('login-ok').textContent = '✓ สมัครเสร็จแล้ว!';
  showToast('★ สมัครสำเร็จ!');
  document.getElementById('s-name').value = name;
  document.getElementById('s-password').value = '';
  showStep('main-step1');
  setTimeout(() => document.getElementById('s-password').focus(), 200);
}

function rPinPress(v) { if(rPinVal.length>=4)return; rPinVal+=v; updatePinDots('r',rPinVal,'yellow'); }
function rPinDel() { rPinVal=rPinVal.slice(0,-1); updatePinDots('r',rPinVal,'yellow'); }
function rPinClear() { rPinVal=''; updatePinDots('r',rPinVal,'yellow'); }

function rDoRegister() {
  const name = document.getElementById('r-name').value.trim();
  clearMsg();
  if (rPinVal.length < 4) { document.getElementById('login-err').textContent = '⚠ กรอก PIN ให้ครบ 4 หลัก'; return; }
  if (students.find(s => s.name === name)) { document.getElementById('login-err').textContent = '⚠ ชื่อนี้ถูกใช้แล้ว'; return; }
  const num = students.length + 1;
  const newStudent = { id: Date.now(), num, name, pin: rPinVal, avatar: rAvatarData || null, status: 'none', checkinTime: null };
  students.push(newStudent); save();
  document.getElementById('r-name').value = '';
  document.getElementById('r-avatar-preview').innerHTML = '📷';
  rAvatarData = null; rPinVal = ''; updatePinDots('r',rPinVal,'yellow');
  document.getElementById('login-ok').textContent = '✓ สมัครเสร็จแล้ว!';
  showToast('★ สมัครสำเร็จ!');
  document.getElementById('s-name').value = name;
  showStep('main-step1');
}

/* ══ ADMIN (easter egg) ══ */
let adminTapCount = 0, adminTapTimer = null;
function adminTap() {
  adminTapCount++;
  clearTimeout(adminTapTimer);
  adminTapTimer = setTimeout(() => { adminTapCount = 0; }, 2000);
  if (adminTapCount >= 5) { adminTapCount = 0; aPinVal=''; updatePinDots('a','',''); showStep('main-step5'); const apw=document.getElementById('a-password'); if(apw){apw.value='';setTimeout(()=>apw.focus(),200);} }
}

function aPinPress(v) { if(aPinVal.length>=4)return; aPinVal+=v; updatePinDots('a',aPinVal,''); if(aPinVal.length===4)setTimeout(aDoLogin,200); }
function aPinDel() { aPinVal=aPinVal.slice(0,-1); updatePinDots('a',aPinVal,''); }
function aPinClear() { aPinVal=''; updatePinDots('a',aPinVal,''); }

function aDoLogin() {
  const pw = document.getElementById('a-password') ? document.getElementById('a-password').value.trim() : aPinVal;
  fetch(API_BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'admin', password: pw })
  }).then(r => r.json()).then(data => {
    if (!data.ok) {
      document.getElementById('login-err').textContent = '✗ Password ไม่ถูกต้อง';
      const apw = document.getElementById('a-password'); if(apw){apw.value='';apw.focus();}
      aPinVal=''; return;
    }
    setToken(data.token);
    currentRole = 'admin';
    saveSession('admin', null);
    showScreen('admin-screen');
    renderAdmin();
    updateDeadlineBanners();
    document.getElementById('deadline-time-input').value = settings.deadlineTime;
    const toggle = document.getElementById('deadline-toggle');
    toggle.className = 'toggle-track ' + (settings.deadlineActive ? 'on' : '');
    document.getElementById('deadline-toggle-text').textContent = settings.deadlineActive ? 'เปิดรับอยู่' : 'ปิดรับแล้ว';
  }).catch(() => {
    document.getElementById('login-err').textContent = '✗ เชื่อมต่อ server ไม่ได้';
  });
}

/* ══ LEGACY stubs (ไม่ใช้แล้ว) ══ */
function switchMode() {}
function sGoPin() { smartLogin(); }
function sBack() { mainBack(); }
function rBack() { showStep('main-step3'); }

/* ══ SESSION PERSISTENCE ══ */
function hideSplash() {
  const splash = document.getElementById('loading-splash');
  if (!splash) return;
  splash.style.opacity = '0';
  setTimeout(() => splash.remove(), 300);
}

function saveSession(role, studentId) {
  try {
    localStorage.setItem('rev_session', JSON.stringify({ role, studentId, ts: Date.now() }));
  } catch(e) {}
}
function clearSession() {
  try { localStorage.removeItem('rev_session'); } catch(e) {}
}
function restoreSession() {
  try {
    const raw = localStorage.getItem('rev_session');
    if (!raw) { hideSplash(); showScreen('login-screen'); return; }
    const sess = JSON.parse(raw);
    // expire after 12 hours
    if (Date.now() - sess.ts > 12 * 3600 * 1000) { clearSession(); hideSplash(); showScreen('login-screen'); return; }
    if (sess.role === 'admin') {
      currentRole = 'admin';
      showScreen('admin-screen');
      renderAdmin();
      updateDeadlineBanners();
      const ti = document.getElementById('deadline-time-input');
      if (ti) ti.value = settings.deadlineTime;
      const tog = document.getElementById('deadline-toggle');
      if (tog) tog.className = 'toggle-track ' + (settings.deadlineActive ? 'on' : '');
      const tt = document.getElementById('deadline-toggle-text');
      if (tt) tt.textContent = settings.deadlineActive ? 'เปิดรับอยู่' : 'ปิดรับแล้ว';
      hideSplash();
    } else if (sess.role === 'teacher') {
      currentRole = 'teacher';
      showTeacherScreen();
      hideSplash();
    } else if (sess.role === 'student' && sess.studentId) {
      // wait for students to load then restore
      const tryRestore = () => {
        const s = students.find(x => x.id === sess.studentId);
        if (s) {
          currentRole = 'student';
          currentStudent = s;
          showStudentScreen();
          hideSplash();
        } else if (students.length === 0) {
          // students not loaded yet, retry
          setTimeout(tryRestore, 300);
        } else {
          // student not found (deleted)
          hideSplash();
          showScreen('login-screen');
        }
      };
      tryRestore();
    } else {
      hideSplash();
      showScreen('login-screen');
    }
  } catch(e) { clearSession(); hideSplash(); showScreen('login-screen'); }
}

/* ══ TEACHER SCREEN ══ */
function showTeacherScreen() {
  showScreen('admin-screen');
  renderAdmin();
  updateDeadlineBanners();
  // re-apply after a tick so DOM is ready
  setTimeout(applyTeacherMode, 100);
}

/* ล็อคทุก action ที่ teacher ไม่ควรทำได้ */
function applyTeacherMode() {
  if (!isTeacher()) return;

  // badge navbar
  const badge = document.querySelector('.unav-badge-admin');
  if (badge) {
    badge.textContent = 'TEACHER';
    badge.style.background = 'linear-gradient(135deg,#5090C8,#3070A8)';
  }

  // ซ่อน/disable element แก้ไขทั้งหมด
  const hideSelectors = [
    '#deadline-time-input',
    '#deadline-toggle',
    '.btn-export',
    '#admin-shop-name','#admin-shop-price','#admin-shop-cat','#admin-shop-note',
  ];
  hideSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.style.opacity = '0.2';
      el.style.pointerEvents = 'none';
    });
  });

  // ปุ่ม action ทั้งหมดที่ modify ข้อมูล
  const actionOnclicks = [
    'saveDeadline()','toggleDeadlineActive()','resetAll()','resetFriendData()',
    'adminAddShopItem()','saveBPTiersAdmin()','exportCSV()',
  ];
  actionOnclicks.forEach(oc => {
    document.querySelectorAll('[onclick="' + oc + '"]').forEach(el => {
      el.style.opacity = '0.2';
      el.style.pointerEvents = 'none';
    });
  });

  // ปิด click + right-click บน student grid
  const grid = document.getElementById('student-grid-a');
  if (grid) {
    grid.addEventListener('click', e => e.stopImmediatePropagation(), true);
    grid.addEventListener('contextmenu', e => e.preventDefault(), true);
  }
}

/* ══ STUDENT SCREEN ══ */
function showStudentScreen() {
  const s = currentStudent;
  showScreen('student-screen');
  setOnline(s.id, s.name);
  document.getElementById('student-user-label').textContent = s.name;
  document.getElementById('profile-name').textContent = s.name;
  document.getElementById('profile-num').textContent = 'เลขที่ ' + (s.num || '—');
  document.getElementById('big-profile-name').textContent = s.name;

  // avatar
  const paEl = document.getElementById('profile-avatar');
  const taEl = document.getElementById('topbar-avatar-wrap');
  const baEl = document.getElementById('big-avatar');
  if (s.avatar) {
    paEl.innerHTML = `<img src="${s.avatar}">`;
    taEl.innerHTML = `<img src="${s.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    if (baEl) baEl.innerHTML = `<img src="${s.avatar}" style="width:100%;height:100%;object-fit:cover;">`;
  } else {
    paEl.innerHTML = '<span id="profile-emoji">👤</span>';
    taEl.innerHTML = '<span id="topbar-avatar-emoji">👤</span>';
    if (baEl) baEl.innerHTML = '<span>👤</span>';
  }
  // reset to profile tab (default first page)
  switchStudentTab('profile');
  updateStudentStatus();
  updateDeadlineBanners();
}

function updateStudentStatus() {
  if (!currentStudent) return;
  const s = students.find(x => x.id === currentStudent.id);
  if (!s) return;
  const card = document.getElementById('status-card');
  const big = document.getElementById('status-big');
  const time = document.getElementById('status-time');
  if (s.status === 'present') {
    card.className = 'status-card checked';
    big.style.color = 'var(--cyan)';
    big.textContent = '✓ มาเรียนแล้ว';
    time.textContent = s.checkinTime ? 'เช็คชื่อเวลา ' + s.checkinTime : '';
  } else if (s.status === 'absent') {
    card.className = 'status-card missed';
    big.style.color = 'rgba(255,80,80,.9)';
    big.textContent = '✗ บันทึกขาด';
    time.textContent = '';
  } else {
    card.className = 'status-card';
    big.style.color = 'rgba(255,255,255,0.3)';
    big.textContent = 'ยังไม่เช็คชื่อ';
    time.textContent = '';
  }
}

/* ── Edit name ── */
function openEditName() {
  document.getElementById('edit-name-inp').value = currentStudent.name;
  document.getElementById('edit-modal').classList.add('open');
  setTimeout(() => document.getElementById('edit-name-inp').focus(), 80);
}
function closeEditModal() { document.getElementById('edit-modal').classList.remove('open'); }
function saveEditName() {
  const newName = document.getElementById('edit-name-inp').value.trim();
  if (!newName) { showToast('⚠ กรุณากรอกชื่อ'); return; }
  if (students.find(s => s.name === newName && s.id !== currentStudent.id)) { showToast('⚠ ชื่อนี้ถูกใช้แล้ว'); return; }
  const s = students.find(x => x.id === currentStudent.id);
  s.name = newName;
  currentStudent = s;
  save();
  document.getElementById('profile-name').textContent = newName;
  document.getElementById('student-user-label').textContent = newName;
  const bpn = document.getElementById('big-profile-name');
  if (bpn) bpn.textContent = newName;
  const pn = document.getElementById('pinfo-name');
  if (pn) pn.textContent = newName;
  closeEditModal();
  showToast('✓ บันทึกชื่อแล้ว');
}

/* ── Change profile photo ── */
function handleProfilePhotoChange(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const data = e.target.result;
    const s = students.find(x => x.id === currentStudent.id);
    s.avatar = data; currentStudent = s; save();
    document.getElementById('profile-avatar').innerHTML = `<img src="${data}">`;
    const ta = document.getElementById('topbar-avatar-wrap');
    ta.innerHTML = `<img src="${data}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    const ba = document.getElementById('big-avatar');
    if (ba) ba.innerHTML = `<img src="${data}" style="width:100%;height:100%;object-fit:cover;">`;
    showToast('✓ เปลี่ยนรูปแล้ว');
  };
  reader.readAsDataURL(file);
}

/* ══ LOGOUT ══ */
function logout() {
  setOffline();
  clearSession();
  currentRole = null; currentStudent = null;
  sPinVal=''; rPinVal=''; aPinVal='';
  document.getElementById('s-name').value = '';
  const pwField = document.getElementById('s-password'); if(pwField) pwField.value = '';
  const apwField = document.getElementById('a-password'); if(apwField) apwField.value = '';
  showStep('main-step1');
  showScreen('login-screen');
  setTimeout(()=>{ const n=document.getElementById('s-name'); if(n)n.focus(); }, 100);
}

/* ══ ADMIN FUNCTIONS ══ */
function renderAdmin() {
  const grid = document.getElementById('student-grid-a');
  const q = document.getElementById('search-a').value.toLowerCase();
  let list = students.filter(s => {
    if (q && !s.name.toLowerCase().includes(q) && !String(s.num).includes(q)) return false;
    if (currentFilter === 'present') return s.status === 'present';
    if (currentFilter === 'absent') return s.status !== 'present';
    return true;
  });
  if (!list.length) { grid.innerHTML = '<div class="empty-state">★ ไม่พบรายชื่อ ★</div>'; updateStats(); return; }
  grid.innerHTML = list.map(s => {
    const cls = s.status==='present' ? 'present' : s.status==='absent' ? 'absent' : '';
    const statusText = s.status==='present' ? `✓ มาแล้ว ${s.checkinTime?'('+s.checkinTime+')':''}` : s.status==='absent' ? '✗ ขาด' : 'ยังไม่เช็ค';
    const avatarHtml = s.avatar ? `<img src="${s.avatar}">` : '👤';
    const isOnline = (window._onlineUsers||[]).some(u => u.id === s.id);
    const onlineDot = isOnline ? `<span style="width:7px;height:7px;border-radius:50%;background:#90b0a0;box-shadow:0 0 6px #90b0a0;flex-shrink:0;display:inline-block;"></span>` : '';
    return `<div class="student-card ${cls}" onclick="adminToggle(${s.id})" oncontextmenu="openCtx(event,${s.id})">
      <div class="card-avatar">${avatarHtml}</div>
      <div class="card-info">
        <div class="card-num">เลขที่ ${s.num||'—'} ${onlineDot}</div>
        <div class="card-name">${s.name}</div>
        <div class="card-status">${statusText}</div>
      </div>
      <div class="status-dot"></div>
    </div>`;
  }).join('');
  updateStats();
  if (currentAdminTab === 'stats') renderAdminStats();
}

function updateStats() {
  const total = students.length;
  const present = students.filter(s=>s.status==='present').length;
  const pct = total > 0 ? Math.round(present/total*100) : 0;
  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-present').textContent = present;
  document.getElementById('stat-pct').textContent = pct+'%';
}

function adminToggle(id) {
  if (isTeacher()) return; // teacher = read-only
  const s = students.find(x=>x.id===id);
  if (!s) return;
  if (s.status==='none') {
    s.status='present';
    s.checkinTime=new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'});
    const today = new Date().toDateString();
    if (s.bp_xp_today !== today) {
      s.bp_xp = (s.bp_xp || 0) + 1;
      s.bp_xp_today = today;
    }
  }
  else if (s.status==='present') { s.status='absent'; s.checkinTime=null; }
  else { s.status='none'; s.checkinTime=null; }
  save(); renderAdmin();
  const msgs={present:'✓ เช็คชื่อแล้ว! +1 XP 🎖',absent:'✗ บันทึกขาด',none:'↺ รีเซ็ต'};
  showToast(msgs[s.status]);
  if (currentStudent && currentStudent.id === id) {
    currentStudent = s; updateStudentStatus();
    const bpPage = document.getElementById('page-battlepass');
    if (bpPage && bpPage.classList.contains('active')) renderBattlepass();
  }
}

function setFilter(f, el) {
  currentFilter = f;
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active-tab'));
  el.classList.add('active-tab');
  renderAdmin();
}

function resetAll() {
  if (!confirm('รีเซ็ตสถานะเช็คชื่อทั้งหมดใช่ไหม?')) return;
  students.forEach(s=>{s.status='none';s.checkinTime=null;});
  save(); renderAdmin(); showToast('↺ รีเซ็ตทั้งหมดแล้ว');
}

async function resetFriendData() {
  if (!confirm('ลบข้อมูล Like และ Swipe ทั้งหมดใช่ไหม?\n(นักเรียนจะ swipe กันใหม่ได้)')) return;
  await api('DELETE', '/likes');
  await api('DELETE', '/swipes');
  showToast('↺ รีเซ็ต Like/Swipe ทั้งหมดแล้ว');
}

/* ── ctx menu ── */
function openCtx(e, id) { e.preventDefault(); if (isTeacher()) return; ctxTarget=id; const m=document.getElementById('ctx-menu'); m.style.left=Math.min(e.clientX,window.innerWidth-160)+'px'; m.style.top=Math.min(e.clientY,window.innerHeight-180)+'px'; m.classList.add('open'); }
function closeCtx() { document.getElementById('ctx-menu').classList.remove('open'); }
function ctxPresent() {
  const s=students.find(x=>x.id===ctxTarget);
  if(s){
    s.status='present';
    s.checkinTime=new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'});
    // ── give BP XP once per day ──
    const today=new Date().toLocaleDateString('th-TH');
    if(s.bp_xp_today !== today){
      s.bp_xp=(s.bp_xp||0)+1;
      s.bp_xp_today=today;
    }
    save();renderAdmin();showToast('✓ เช็คชื่อแล้ว! +1 XP 🎖');
    if(currentStudent&&currentStudent.id===ctxTarget){currentStudent=s;updateStudentStatus();}
  }
  closeCtx();
}
function ctxAbsent() { const s=students.find(x=>x.id===ctxTarget); if(s){s.status='absent';s.checkinTime=null;save();renderAdmin();showToast('✗ บันทึกขาด');if(currentStudent&&currentStudent.id===ctxTarget){currentStudent=s;updateStudentStatus();}} closeCtx(); }
function ctxReset() { const s=students.find(x=>x.id===ctxTarget); if(s){s.status='none';s.checkinTime=null;save();renderAdmin();showToast('↺ รีเซ็ต');} closeCtx(); }
function ctxEditName() {
  closeCtx();
  const s = students.find(x => x.id === ctxTarget);
  if (!s) return;
  document.getElementById('admin-edit-name-inp').value = s.name;
  document.getElementById('admin-edit-modal').classList.add('open');
  setTimeout(() => document.getElementById('admin-edit-name-inp').focus(), 80);
}
function adminCloseEditModal() { document.getElementById('admin-edit-modal').classList.remove('open'); }
function adminSaveEditName() {
  const newName = document.getElementById('admin-edit-name-inp').value.trim();
  if (!newName) { showToast('⚠ กรุณากรอกชื่อ'); return; }
  if (students.find(s => s.name === newName && s.id !== ctxTarget)) { showToast('⚠ ชื่อนี้ถูกใช้แล้ว'); return; }
  const s = students.find(x => x.id === ctxTarget);
  if (!s) return;
  s.name = newName;
  save();
  renderAdmin();
  adminCloseEditModal();
  showToast('✓ แก้ชื่อ "' + newName + '" แล้ว');
}

async function ctxDelete() {
  const s = students.find(x => x.id === ctxTarget);
  if (!s) { closeCtx(); return; }
  if (!confirm('ลบบัญชี "' + s.name + '" ออกจากระบบ?\n\nข้อมูลที่จะถูกลบ:\n- บัญชีผู้ใช้\n- ประวัติ Like / Match\n- ประวัติแชท\n\nไม่สามารถกู้คืนได้!')) { closeCtx(); return; }
  closeCtx();
  const id = String(ctxTarget);
  // Delete all likes involving this student via backend
  await api('DELETE', '/admin/student/' + id + '/likes-and-chats');
  await api('DELETE', '/admin/student/' + id + '/chat');
  students = students.filter(x => x.id !== ctxTarget);
  save();
  renderAdmin();
  showToast('ลบบัญชี ' + s.name + ' แล้ว');
}

/* ── Deadline ── */
function isDeadlinePassed() {
  if (!settings.deadlineActive) return false;
  const now=new Date(); const [h,m]=settings.deadlineTime.split(':').map(Number);
  const dl=new Date(); dl.setHours(h,m,0,0); return now>=dl;
}
function getCountdown() {
  if (!settings.deadlineActive) return '';
  const now=new Date(); const [h,m]=settings.deadlineTime.split(':').map(Number);
  const dl=new Date(); dl.setHours(h,m,0,0); const diff=dl-now;
  if (diff<=0) return '';
  const hL=Math.floor(diff/3600000),mL=Math.floor((diff%3600000)/60000),sL=Math.floor((diff%60000)/1000);
  return hL>0?`อีก ${hL}:${String(mL).padStart(2,'0')}:${String(sL).padStart(2,'0')}`:`อีก ${mL}:${String(sL).padStart(2,'0')}`;
}
function updateDeadlineBanners() {
  const passed=isDeadlinePassed();
  [{b:'deadline-banner-a',t:'deadline-text-a',d:'deadline-disp-a',c:'countdown-a'},{b:'deadline-banner-s',t:'deadline-text-s',d:'deadline-disp-s',c:'countdown-s'}].forEach(x=>{
    const el=document.getElementById(x.b); if(!el)return;
    el.className='deadline-banner '+(passed?'closed':'open');
    const de=document.getElementById(x.d); if(de)de.textContent=settings.deadlineActive?settings.deadlineTime:'ไม่จำกัด';
    const te=document.getElementById(x.t); if(te){
      if(!settings.deadlineActive)te.innerHTML='เปิดรับเช็คชื่อ — <strong>ไม่มีกำหนดเวลา</strong>';
      else if(passed)te.innerHTML=`หมดเวลาแล้ว — ปิดเมื่อ <strong>${settings.deadlineTime}</strong>`;
      else te.innerHTML=`กำลังรับเช็คชื่อ — ปิดเวลา <strong>${settings.deadlineTime}</strong>`;
    }
    const ce=document.getElementById(x.c); if(ce)ce.textContent=(!passed&&settings.deadlineActive)?getCountdown():'';
  });
}
function saveDeadline() { const v=document.getElementById('deadline-time-input').value; if(!v){showToast('⚠ กรุณาเลือกเวลา');return;} settings.deadlineTime=v; save(); updateDeadlineBanners(); showToast('✓ บันทึกเวลา '+v+' แล้ว'); }
function toggleDeadlineActive() {
  settings.deadlineActive=!settings.deadlineActive;
  const t=document.getElementById('deadline-toggle'); t.className='toggle-track '+(settings.deadlineActive?'on':'');
  document.getElementById('deadline-toggle-text').textContent=settings.deadlineActive?'เปิดรับอยู่':'ปิดรับแล้ว';
  save(); updateDeadlineBanners(); showToast(settings.deadlineActive?'✓ เปิดรับเช็คชื่อ':'✗ ปิดรับเช็คชื่อ');
}

/* ── Export ── */
function exportCSV() {
  const rows=[['เลขที่','ชื่อ-สกุล','สถานะ','เวลาเช็คชื่อ']];
  students.forEach(s=>rows.push([s.num,s.name,s.status==='present'?'มา':s.status==='absent'?'ขาด':'-',s.checkinTime||'-']));
  const csv='\uFEFF'+rows.map(r=>r.join(',')).join('\n');
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
  a.download='revolution_'+new Date().toLocaleDateString('th')+'.csv'; a.click(); showToast('⬇ Export แล้ว!');
}

/* ══ UTILS ══ */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  const isLogin = id === 'login-screen';
  document.body.classList.toggle('on-login', isLogin);
  if(isLogin) spawnLoginParticles();
  /* sync student effect canvases */
  var isStudent = id === 'student-screen';
  ['student-aurora-canvas','student-tri-canvas'].forEach(function(cid){
    var c = document.getElementById(cid);
    if(c) c.style.display = isStudent ? 'block' : 'none';
  });
  /* hide global tri canvas on student screen (student has its own) */
  var gTri = document.getElementById('global-tri-canvas');
  if(gTri) gTri.style.display = isStudent ? 'none' : 'block';
}

/* ── Login particle spawner ── */
let _particlesSpawned = false;
function spawnLoginParticles(){
  if(_particlesSpawned) return;
  _particlesSpawned = true;
  const container = document.querySelector('.deco-rings');
  if(!container) return;

  /* dust motes – tiny rising dots */
  const dustCols = ['rgba(196,104,138,', 'rgba(255,80,180,', 'rgba(255,150,210,', 'rgba(255,255,255,'];
  for(let i=0;i<28;i++){
    const d = document.createElement('div');
    d.className = 'dust';
    const sz = 1.5 + Math.random()*2.5;
    const col = dustCols[Math.floor(Math.random()*dustCols.length)];
    const alpha = 0.4 + Math.random()*0.5;
    d.style.cssText = `
      width:${sz}px; height:${sz}px;
      left:${Math.random()*100}%;
      top:${20+Math.random()*75}%;
      background:${col}${alpha});
      box-shadow:0 0 ${sz*2}px ${sz}px ${col}0.3);
      animation-duration:${5+Math.random()*10}s;
      animation-delay:${Math.random()*8}s;
    `;
    container.appendChild(d);
  }

  /* glow orbs – large soft radial blobs */
  const orbData = [
    {x:18, y:35, sz:320, col:'rgba(176,80,105,', dur:9,  delay:0},
    {x:78, y:60, sz:280, col:'rgba(155,70,95,',  dur:12, delay:3},
    {x:50, y:15, sz:200, col:'rgba(255,80,160,',dur:7,  delay:1.5},
    {x:10, y:70, sz:240, col:'rgba(255,0,120,', dur:11, delay:5},
    {x:85, y:25, sz:190, col:'rgba(180,0,90,',  dur:8,  delay:2},
  ];
  orbData.forEach(o=>{
    const el = document.createElement('div');
    el.className = 'glow-orb';
    el.style.cssText = `
      width:${o.sz}px; height:${o.sz}px;
      left:${o.x}%; top:${o.y}%;
      transform:translate(-50%,-50%);
      background:radial-gradient(circle, ${o.col}0.18) 0%, ${o.col}0.06) 45%, transparent 70%);
      animation-duration:${o.dur}s;
      animation-delay:${o.delay}s;
    `;
    container.appendChild(el);
  });
}
function showToast(msg) { const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2200); }

function updateClock() {
  updateDeadlineBanners();
  if (currentRole==='student') updateStudentStatus();
}

document.addEventListener('click', e => { if(!e.target.closest('#ctx-menu'))closeCtx(); if(e.target===document.getElementById('edit-modal'))closeEditModal(); if(e.target===document.getElementById('admin-edit-modal'))adminCloseEditModal(); });
document.addEventListener('keydown', e => { if(e.key==='Escape')closeEditModal(); });
updateClock();
setInterval(updateClock, 1000);
setTimeout(()=>document.getElementById('s-name').focus(), 100);

/* ══ STARS & PARTICLES removed — replaced by CSS spin-rings ══ */

/* ══ ADMIN TAB SWITCHING ══ */
let currentAdminTab = 'students';
function switchAdminTab(tab) {
  currentAdminTab = tab;
  ['students','online','chats','stats','shop','bp'].forEach(t => {
    const page = document.getElementById('apage-'+t);
    const btn  = document.getElementById('atab-'+t);
    if (page) page.classList.toggle('active', t===tab);
    if (btn)  btn.classList.toggle('active', t===tab);
  });
  if (tab === 'online')  renderAdminOnline();
  if (tab === 'chats')   renderAdminChats();
  if (tab === 'stats')   renderAdminStats();
  if (tab === 'shop')    renderAdminShop();
  if (tab === 'bp')      { renderBPAdminList(); refreshBPQueue(); renderBPTierEditor(); }
  // re-apply read-only lock after render
  setTimeout(applyTeacherMode, 50);
}

function renderAdminOnline() {
  const list = window._onlineUsers || [];
  const el = document.getElementById('admin-online-list');
  if (!el) return;
  const now = Date.now();
  document.getElementById('online-refresh-time').textContent =
    'อัปเดต ' + new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  if (list.length === 0) {
    el.innerHTML = `<div style="text-align:center;padding:48px;color:rgba(255,255,255,0.15);font-size:13px;letter-spacing:1px;">ยังไม่มีใครออนไลน์</div>`;
    return;
  }
  el.innerHTML = list.map(u => {
    const s = students.find(x => x.id === u.id);
    const secAgo = Math.floor((now - u.ts) / 1000);
    const timeAgo = secAgo < 60 ? secAgo + 'วิที่แล้ว' : Math.floor(secAgo/60) + 'นาทีที่แล้ว';
    const avatarHtml = s && s.avatar
      ? `<img src="${s.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
      : `<span style="font-size:18px;">👤</span>`;
    const statusText = s ? (s.status==='present' ? '✓ เช็คชื่อแล้ว' : s.status==='absent' ? '✗ ขาด' : 'ยังไม่เช็ค') : '—';
    const statusColor = s ? (s.status==='present' ? 'var(--cyan)' : s.status==='absent' ? 'rgba(255,80,80,.7)' : 'rgba(255,255,255,0.3)') : 'rgba(255,255,255,0.2)';
    return `<div style="
      display:flex;align-items:center;gap:12px;
      background:rgba(140,160,150,0.04);
      border:1px solid rgba(140,160,150,0.15);
      border-radius:14px;padding:12px 16px;
      cursor:pointer;transition:all .18s;
    " onclick="adminToggle(${u.id})" oncontextmenu="openCtx(event,${u.id})">
      <div style="position:relative;flex-shrink:0;">
        <div style="width:44px;height:44px;border-radius:50%;border:2px solid rgba(140,160,150,0.4);background:rgba(0,212,255,0.08);display:flex;align-items:center;justify-content:center;overflow:hidden;">${avatarHtml}</div>
        <div style="position:absolute;bottom:0;right:0;width:12px;height:12px;border-radius:50%;background:#90b0a0;border:2px solid var(--black);box-shadow:0 0 6px #90b0a0;animation:pulse 2s infinite;"></div>
      </div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:14px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${u.name}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:2px;letter-spacing:.5px;">${timeAgo}</div>
      </div>
      <div style="text-align:right;flex-shrink:0;">
        <div style="font-size:11px;font-weight:600;color:${statusColor};">${statusText}</div>
        ${s ? `<div style="font-size:10px;color:rgba(255,255,255,0.2);margin-top:2px;">เลขที่ ${s.num||'—'}</div>` : ''}
      </div>
    </div>`;
  }).join('');
}

function renderAdminChats() {
  const el = document.getElementById('admin-chats-list');
  if (!el) return;
  // Subscribe once to all chats
  wsOn('chats_admin', (snap) => {
    const data = snap.val();
    if (!data || Object.keys(data).length === 0) {
      el.innerHTML = `<div style="text-align:center;padding:48px;color:rgba(255,255,255,0.15);font-size:13px;letter-spacing:1px;">ไม่มีแชทที่กำลังดำเนินอยู่</div>`;
      document.getElementById('atab-chats-count').textContent = '0';
      return;
    }
    const chatKeys = Object.keys(data);
    document.getElementById('atab-chats-count').textContent = chatKeys.length;
    el.innerHTML = chatKeys.map(key => {
      const msgs = Object.values(data[key]).sort((a,b) => a.ts - b.ts);
      const lastMsg = msgs[msgs.length - 1];
      const ids = key.split('_');
      const s1 = students.find(s => String(s.id) === ids[0]);
      const s2 = students.find(s => String(s.id) === ids[1]);
      const n1 = s1 ? s1.name : ids[0];
      const n2 = s2 ? s2.name : ids[1];
      const lastTime = lastMsg ? new Date(lastMsg.ts).toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'}) : '';

      const av1 = s1 && s1.avatar ? `<img src="${s1.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">` : '👤';
      const av2 = s2 && s2.avatar ? `<img src="${s2.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">` : '👤';

      return `<div style="
        background:rgba(196,104,138,0.04);border:1px solid rgba(196,104,138,0.15);
        border-radius:16px;padding:14px 16px;
      ">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <div style="display:flex;align-items:center;">
            <div style="width:36px;height:36px;border-radius:50%;border:2px solid var(--pink);background:rgba(196,104,138,0.1);display:flex;align-items:center;justify-content:center;font-size:14px;overflow:hidden;">${av1}</div>
            <div style="width:36px;height:36px;border-radius:50%;border:2px solid var(--cyan);background:rgba(0,240,255,0.07);display:flex;align-items:center;justify-content:center;font-size:14px;overflow:hidden;margin-left:-10px;">${av2}</div>
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:13px;font-weight:700;color:#fff;">${n1} <span style="color:var(--pink);">✕</span> ${n2}</div>
            <div style="font-size:10px;color:rgba(255,255,255,0.25);margin-top:1px;">${msgs.length} ข้อความ • ล่าสุด ${lastTime}</div>
          </div>
          <button onclick="deleteAdminChat('${key}')" style="background:rgba(255,64,96,0.1);border:1px solid rgba(255,64,96,0.2);color:rgba(255,100,100,0.7);font-size:11px;padding:5px 10px;border-radius:8px;cursor:pointer;font-family:'Kanit',sans-serif;white-space:nowrap;">🗑 ลบ</button>
        </div>
        <div style="max-height:120px;overflow-y:auto;display:flex;flex-direction:column;gap:5px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.05);">
          ${msgs.slice(-4).map(m => {
            const sender = students.find(s => s.id === m.senderId);
            const sName = sender ? sender.name : m.senderName || '?';
            return `<div style="font-size:11px;color:rgba(255,255,255,0.55);line-height:1.5;"><span style="color:rgba(196,104,138,0.7);font-weight:600;">${sName}:</span> ${escHtml(m.text)}</div>`;
          }).join('')}
        </div>
      </div>`;
    }).join('');
  }, { onlyOnce: true });
}

function deleteAdminChat(key) {
  if (!confirm('ลบแชทนี้ออกใช่ไหม?')) return;
  api('DELETE', '/chats/' + key);
  showToast('🗑 ลบแชทแล้ว');
  setTimeout(() => renderAdminChats(), 500);
}

function renderAdminStats() {
  const total = students.length;
  const present = students.filter(s => s.status==='present').length;
  const absent = students.filter(s => s.status==='absent').length;
  const online = (window._onlineUsers || []).length;
  const pct = total > 0 ? Math.round(present/total*100) : 0;

  const sb = id => { const e = document.getElementById(id); if(e) return e; return {textContent:''};};
  sb('sbig-total').textContent = total;
  sb('sbig-present').textContent = present;
  sb('sbig-absent').textContent = absent;
  sb('sbig-online').textContent = online;
  sb('spct-text').textContent = pct + '%';
  const bar = document.getElementById('spct-bar');
  if (bar) bar.style.width = pct + '%';

  // Recent checkins
  const recentEl = document.getElementById('stats-recent-list');
  if (recentEl) {
    const checked = students
      .filter(s => s.status==='present' && s.checkinTime)
      .sort((a,b) => (b.checkinTime||'').localeCompare(a.checkinTime||''))
      .slice(0, 10);
    if (checked.length === 0) {
      recentEl.innerHTML = `<div style="color:rgba(255,255,255,0.15);font-size:12px;text-align:center;padding:12px;">ยังไม่มีใครเช็คชื่อ</div>`;
    } else {
      recentEl.innerHTML = checked.map((s,i) => {
        const avHtml = s.avatar ? `<img src="${s.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">` : '👤';
        return `<div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
          <div style="width:7px;height:7px;border-radius:50%;background:var(--cyan);box-shadow:0 0 5px var(--cyan);flex-shrink:0;"></div>
          <div style="width:28px;height:28px;border-radius:50%;border:1.5px solid rgba(0,240,255,0.3);overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;">${avHtml}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:12px;font-weight:600;color:rgba(255,255,255,.85);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.name}</div>
          </div>
          <div style="font-size:11px;color:rgba(0,240,255,.6);font-weight:600;flex-shrink:0;">${s.checkinTime}</div>
        </div>`;
      }).join('');
    }
  }
}

/* ══ STUDENT TAB SWITCHING ══ */
function switchStudentTab(tab) {
  ['profile','checkin','shop','friends','battlepass'].forEach(t => {
    const page = document.getElementById('page-'+t);
    const btn  = document.getElementById('stab-'+t);
    if (page) page.classList.toggle('active', t===tab);
    if (btn)  btn.classList.toggle('active', t===tab);
  });
  if (tab === 'profile') updateProfilePage();
  if (tab === 'shop') renderStudentShop();
  if (tab === 'friends') initFriendsPage();
  if (tab === 'battlepass') renderBattlepass();
}

/* ══ PROFILE PAGE ══ */
function updateProfilePage() {
  if (!currentStudent) return;
  const s = students.find(x => x.id === currentStudent.id) || currentStudent;
  document.getElementById('big-profile-name').textContent = s.name;
  document.getElementById('pinfo-name').textContent = s.name;
  document.getElementById('pinfo-num').textContent = 'เลขที่ ' + (s.num || '—');
  const statusMap = { present: '✓ มาเรียนแล้ว', absent: '✗ บันทึกขาด', none: 'ยังไม่เช็คชื่อ' };
  document.getElementById('pinfo-status').textContent = statusMap[s.status] || '—';
  document.getElementById('pinfo-time').textContent = s.checkinTime || '—';
  const ba = document.getElementById('big-avatar');
  if (s.avatar) {
    ba.innerHTML = `<img src="${s.avatar}" style="width:100%;height:100%;object-fit:cover;">`;
  } else {
    ba.innerHTML = '<span id="big-avatar-emoji">👤</span>';
  }
  // Xbox gamertag from saved field
  const xgt = document.getElementById('xbox-gamertag-display');
  if (xgt) xgt.textContent = s.xbox || s.name || '—';
}

/* ══ BATTLEPASS ══ */
// Default 25-tier config (can be overridden via admin)
const BP_TIERS_DEFAULT = [
  { tier:1,  label:'RECRUIT',      xpNeeded:0,  color:'#9ca3af', reward:'🎮 เริ่มต้น' },
  { tier:2,  label:'BRONZE I',     xpNeeded:2,  color:'#CD7F32', reward:'🥉 Bronze Badge' },
  { tier:3,  label:'BRONZE II',    xpNeeded:4,  color:'#D4893A', reward:'⚙️ Iron Frame' },
  { tier:4,  label:'IRON I',       xpNeeded:6,  color:'#a8a9ad', reward:'🔩 Iron Badge' },
  { tier:5,  label:'IRON II',      xpNeeded:8,  color:'#b0b2b5', reward:'🛡️ Iron Shield' },
  { tier:6,  label:'SILVER I',     xpNeeded:10, color:'#C0C0C0', reward:'🥈 Silver Badge' },
  { tier:7,  label:'SILVER II',    xpNeeded:13, color:'#cacaca', reward:'⚔️ Silver Blade' },
  { tier:8,  label:'GOLD I',       xpNeeded:16, color:'#C8A060', reward:'🥇 Gold Badge' },
  { tier:9,  label:'GOLD II',      xpNeeded:19, color:'#D4A847', reward:'🏅 Gold Medal' },
  { tier:10, label:'PLATINUM I',   xpNeeded:22, color:'#e5e4e2', reward:'💎 Platinum Frame' },
  { tier:11, label:'PLATINUM II',  xpNeeded:25, color:'#eeeced', reward:'✨ Plat Glow' },
  { tier:12, label:'DIAMOND I',    xpNeeded:28, color:'#bfe3f7', reward:'💠 Diamond Badge' },
  { tier:13, label:'DIAMOND II',   xpNeeded:31, color:'#a8d8f0', reward:'🔷 Diamond Frame' },
  { tier:14, label:'EMERALD I',    xpNeeded:34, color:'#5edc8c', reward:'💚 Emerald Badge' },
  { tier:15, label:'EMERALD II',   xpNeeded:37, color:'#3ec878', reward:'🌿 Emerald Glow' },
  { tier:16, label:'MASTER I',     xpNeeded:40, color:'#D4899E', reward:'⚡ Master Frame' },
  { tier:17, label:'MASTER II',    xpNeeded:43, color:'#CC7090', reward:'🌀 Master Glow' },
  { tier:18, label:'CHAMPION I',   xpNeeded:46, color:'#C4688A', reward:'🏆 Champion Badge' },
  { tier:19, label:'CHAMPION II',  xpNeeded:50, color:'#B85A7C', reward:'👑 Champion Crown' },
  { tier:20, label:'LEGEND I',     xpNeeded:54, color:'#f0b060', reward:'⚡ Legend Glow' },
  { tier:21, label:'LEGEND II',    xpNeeded:58, color:'#e8a050', reward:'🌠 Legend Aura' },
  { tier:22, label:'ELITE',        xpNeeded:62, color:'#e070d0', reward:'🔮 Elite Badge' },
  { tier:23, label:'MYTHIC',       xpNeeded:67, color:'#cc50c0', reward:'🌌 Mythic Frame' },
  { tier:24, label:'IMMORTAL',     xpNeeded:72, color:'#ff8844', reward:'🔥 Immortal Glow' },
  { tier:25, label:'REVOLUTION',   xpNeeded:78, color:'#C8A060', reward:'🌟 REVOLUTION RANK' },
];

let BP_TIERS = BP_TIERS_DEFAULT.map(t => ({...t}));

// Load tier config + listen realtime
(async () => {
  const saved = await api('GET', '/bp/tiers');
  if (saved) {
    BP_TIERS = BP_TIERS_DEFAULT.map(def => {
      const ov = saved[def.tier];
      return ov ? { ...def, ...ov, tier: def.tier } : { ...def };
    });
  }
  if (currentRole === 'student') {
    const bpPage = document.getElementById('page-battlepass');
    if (bpPage && bpPage.classList.contains('active')) renderBattlepass();
  }
  if (currentAdminTab === 'bp') renderBPTierEditor();
})();
wsOn('bp_tiers', (saved) => {
  if (saved) {
    BP_TIERS = BP_TIERS_DEFAULT.map(def => {
      const ov = saved[def.tier];
      return ov ? { ...def, ...ov, tier: def.tier } : { ...def };
    });
  } else {
    BP_TIERS = BP_TIERS_DEFAULT.map(t => ({...t}));
  }
  if (currentRole === 'student') {
    const bpPage = document.getElementById('page-battlepass');
    if (bpPage && bpPage.classList.contains('active')) renderBattlepass();
  }
  if (currentAdminTab === 'bp') renderBPTierEditor();
});

async function saveBPTiers() {
  const obj = {};
  BP_TIERS.forEach(t => { obj[t.tier] = { label: t.label, xpNeeded: t.xpNeeded, color: t.color, reward: t.reward }; });
  await api('POST', '/bp/tiers', obj);
}

/* ── FREE REWARDS per tier (auto-generated from BP_TIERS, editable via admin) ── */
let BP_FREE_REWARDS_OVERRIDE = {};
(async () => {
  const d = await api('GET', '/bp/free-rewards');
  BP_FREE_REWARDS_OVERRIDE = d || {};
})();
wsOn('bp_free_rewards', (d) => {
  BP_FREE_REWARDS_OVERRIDE = d || {};
  if (currentRole === 'student') {
    const bpPage = document.getElementById('page-battlepass');
    if (bpPage && bpPage.classList.contains('active')) renderBattlepass();
  }
});

function getBPFreeReward(tier) {
  if (BP_FREE_REWARDS_OVERRIDE[tier]) return BP_FREE_REWARDS_OVERRIDE[tier];
  const defaults = {
    1:  { emoji:'🎮', label:'Starter' },
    2:  { emoji:'🧑‍🎤', label:'Skin A' },
    3:  { emoji:'🧑‍🚀', label:'Skin B' },
    4:  { emoji:'🦸',  label:'Skin C' },
    5:  { emoji:'🎖',  label:'Badge I' },
    6:  { emoji:'🥷',  label:'Skin D' },
    7:  { emoji:'🤖',  label:'Skin E' },
    8:  { emoji:'👾',  label:'Skin F' },
    9:  { emoji:'💀',  label:'Skin G' },
    10: { emoji:'✨',  label:'Glow' },
    11: { emoji:'🌀',  label:'Trail' },
    12: { emoji:'💠',  label:'Badge II' },
    13: { emoji:'🔷',  label:'Frame A' },
    14: { emoji:'🌿',  label:'Skin H' },
    15: { emoji:'💚',  label:'Glow II' },
    16: { emoji:'⚡',  label:'Badge III' },
    17: { emoji:'🌪',  label:'Aura' },
    18: { emoji:'🏆',  label:'Trophy' },
    19: { emoji:'👑',  label:'Crown' },
    20: { emoji:'🌟',  label:'Star' },
    21: { emoji:'🌠',  label:'Nebula' },
    22: { emoji:'🔮',  label:'Crystal' },
    23: { emoji:'🌌',  label:'Galaxy' },
    24: { emoji:'🔥',  label:'Flame' },
    25: { emoji:'🌟',  label:'REVOLUTION' },
  };
  return defaults[tier] || { emoji:'🎁', label:'Reward' };
}

// Wrap getter so renderBattlepass still works with BP_FREE_REWARDS[t.tier] pattern
const BP_FREE_REWARDS = new Proxy({}, {
  get(target, prop) { return getBPFreeReward(parseInt(prop)); }
});

/* ── SEASON END DATE (stored in Redis, editable by admin) ── */
let bpSeasonEnd = null; // timestamp ms
let bpSeasonTimerInterval = null;

function startBPSeasonTimer() {
  if (bpSeasonTimerInterval) clearInterval(bpSeasonTimerInterval);
  function tick() {
    const el = document.getElementById('bp-season-timer');
    if (!el) return;
    const end = bpSeasonEnd || (Date.now() + 30*24*3600*1000); // default 30d
    const diff = end - Date.now();
    if (diff <= 0) { el.textContent = 'ENDED'; return; }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    if (d > 0) el.textContent = d + 'd ' + h + 'h';
    else if (h > 0) el.textContent = h + 'h ' + m + 'm';
    else el.textContent = m + 'm';
  }
  tick();
  bpSeasonTimerInterval = setInterval(tick, 60000);
}

// Load season end
(async () => {
  const d = await api('GET', '/bp/season-end');
  if (d && d.value) bpSeasonEnd = d.value;
  startBPSeasonTimer();
})();
wsOn('bp_season_end', (val) => {
  if (val) bpSeasonEnd = val;
  startBPSeasonTimer();
});

function getBPState() {
  const s = currentStudent ? (students.find(x => x.id === currentStudent.id) || currentStudent) : null;
  const xp = s ? (s.bp_xp || 0) : 0;
  let tierData = BP_TIERS[0];
  for (let i = BP_TIERS.length - 1; i >= 0; i--) {
    if (xp >= BP_TIERS[i].xpNeeded) { tierData = BP_TIERS[i]; break; }
  }
  const nextTier = BP_TIERS.find(t => t.tier === tierData.tier + 1) || null;
  return { xp, tierData, nextTier, s };
}

function renderBattlepass() {
  const { xp, tierData, nextTier, s } = getBPState();

  const tierNumEl   = document.getElementById('bp-tier-num');
  const tierLabelEl = document.getElementById('bp-tier-label');
  const xpTextEl    = document.getElementById('bp-xp-text');
  const xpBarEl     = document.getElementById('bp-xp-bar');
  const xpNeededEl  = document.getElementById('bp-xp-needed');
  const hintEl      = document.getElementById('bp-next-hint');
  if (!tierNumEl) return;

  tierNumEl.textContent = tierData.tier;
  tierNumEl.style.color = tierData.color;
  tierNumEl.style.textShadow = `0 0 20px ${tierData.color}cc`;
  if (tierLabelEl) { tierLabelEl.textContent = tierData.label; tierLabelEl.style.color = tierData.color; }

  if (nextTier) {
    const cur    = xp - tierData.xpNeeded;
    const needed = nextTier.xpNeeded - tierData.xpNeeded;
    const pct    = Math.min(100, Math.round(cur / needed * 100));
    if (xpTextEl)   xpTextEl.textContent = `${cur} / ${needed} XP`;
    if (xpBarEl)    { xpBarEl.style.width = pct + '%'; xpBarEl.style.boxShadow = `0 0 12px ${tierData.color}cc`; }
    if (xpNeededEl) xpNeededEl.textContent = needed - cur;
    if (hintEl)     hintEl.style.display = '';
  } else {
    if (xpTextEl) xpTextEl.textContent = 'MAX TIER ★';
    if (xpBarEl)  xpBarEl.style.width = '100%';
    if (hintEl)   { hintEl.innerHTML = '🌟 REVOLUTION — Tier สูงสุดแล้ว!'; hintEl.style.color = '#C8A060'; }
  }

  // ── Tier Track — render 3 separate tracks: free / num / paid ──
  const freeTrackEl = document.getElementById('bp-free-track');
  const numTrackEl  = document.getElementById('bp-num-track');
  const trackEl     = document.getElementById('bp-tier-track');

  const PAID_EMOJIS = {
    1: '💰', 2: '🎁', 3: '❓', 4: '💎', 5: '🤖',
    6: '🦾', 7: '🤯', 8: '👟', 9: '⚡', 10: '🏆',
    11: '🌀', 12: '💠', 13: '🔷', 14: '🌿', 15: '💚',
    16: '🌪', 17: '🌌', 18: '👑', 19: '🔥', 20: '🌟',
    21: '🌠', 22: '🔮', 23: '🌌', 24: '🔥', 25: '🌟'
  };

  if (freeTrackEl) {
    freeTrackEl.innerHTML = BP_TIERS.map((t, idx) => {
      const done    = xp >= t.xpNeeded;
      const current = t.tier === tierData.tier;
      const fr      = BP_FREE_REWARDS[t.tier] || { emoji:'🎁', label:'' };
      return `<div class="bp3-tier-col">
        <div class="bp3-cell-free ${done?'done':current?'current':'locked'}">
          ${current ? `<div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(200,160,255,0.55),transparent);"></div>` : ''}
          <div style="font-size:${done?'32':'26'}px;line-height:1;filter:${done?'none':'grayscale(0.8) opacity(0.4)'};">${fr.emoji}</div>
          <div style="font-size:10px;color:${done?'rgba(200,165,230,0.85)':'rgba(180,140,200,0.25)'};letter-spacing:.5px;text-align:center;line-height:1.2;font-weight:${done?'700':'400'};">${done?'✓ '+fr.label:fr.label}</div>
        </div>
      </div>`;
    }).join('');
  }

  if (numTrackEl) {
    numTrackEl.innerHTML = BP_TIERS.map((t, idx) => {
      const done    = xp >= t.xpNeeded;
      const current = t.tier === tierData.tier;
      const nextDone = idx < BP_TIERS.length-1 && xp >= BP_TIERS[idx+1].xpNeeded;
      return `<div class="bp3-tier-col">
        <div class="bp3-cell-num" style="
          background:${current ? 'linear-gradient(135deg,'+t.color+'28,'+t.color+'12)' : done ? t.color+'12' : 'rgba(255,255,255,0.03)'};
          border-right:1px solid ${current ? t.color+'55' : done ? t.color+'28' : 'rgba(255,255,255,0.05)'};
          border-top:1px solid ${current ? t.color+'44' : 'transparent'};
          border-bottom:1px solid ${current ? t.color+'44' : 'transparent'};
          position:relative;
        ">
          <div style="font-family:'Bangers',cursive;font-size:14px;letter-spacing:1.5px;color:${done?t.color:current?t.color+'cc':'rgba(255,255,255,0.25)'};text-shadow:${current?'0 0 10px '+t.color+'bb':'none'};">${t.tier}</div>
          ${current ? `<div style="position:absolute;bottom:-1px;left:50%;transform:translateX(-50%);width:28px;height:2px;background:${t.color};border-radius:1px;box-shadow:0 0 8px ${t.color};"></div>` : ''}
        </div>
      </div>`;
    }).join('');
  }

  if (trackEl) {
    trackEl.innerHTML = BP_TIERS.map((t, idx) => {
      const done    = xp >= t.xpNeeded;
      const current = t.tier === tierData.tier;
      const claimRew = BP_CLAIM_REWARDS[t.tier];
      return `<div class="bp3-tier-col">
        <div class="bp3-cell-paid ${done?'done':current?'current':'locked'}" style="
          box-shadow:${current ? '0 0 28px '+t.color+'3a,inset 0 0 20px '+t.color+'0c' : done ? '0 0 12px '+t.color+'18' : 'none'};
        ">
          ${current ? `<div style="position:absolute;top:0;left:50%;transform:translateX(-50%);font-size:9px;font-weight:700;letter-spacing:1px;padding:2px 8px;background:${t.color};color:#fff;border-radius:0 0 8px 8px;white-space:nowrap;box-shadow:0 2px 10px ${t.color}88;z-index:2;">NOW</div>` : ''}
          <div style="font-size:30px;line-height:1;margin-top:${current?'12px':'0'};filter:${done?'none':'grayscale(0.8) opacity(0.25)'};">${done ? (PAID_EMOJIS[t.tier]||'🎁') : '🔒'}</div>
          ${done && claimRew ? `<div style="font-size:9px;color:${t.color};font-weight:700;text-align:center;padding:0 4px;line-height:1.3;max-width:88px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${claimRew.label.replace(/x\d+/,'').trim()}</div>` : ''}
          ${done && !claimRew ? `<div style="font-size:11px;color:${t.color}88;">✓ FREE</div>` : ''}
          ${!done ? `<div style="font-size:9px;color:rgba(196,104,138,0.35);letter-spacing:.5px;font-weight:700;">${t.xpNeeded} XP</div>` : ''}
        </div>
      </div>`;
    }).join('');

    // Jump carousel to current tier — only on first open, not every re-render
    if (!window._bpCarouselUserScrolled) {
      setTimeout(() => {
        const currentIdx = BP_TIERS.findIndex(t => t.tier === tierData.tier);
        if(typeof window._bpCarouselGoTo === 'function') window._bpCarouselGoTo(currentIdx);
        else if(typeof window._bpCarouselRender === 'function') window._bpCarouselRender();
      }, 200);
    } else {
      setTimeout(() => {
        if(typeof window._bpCarouselRender === 'function') window._bpCarouselRender();
      }, 50);
    }
  }

  // Missions — fixed height rows, scrollable container
  const missionsEl = document.getElementById('bp-missions');
  if (missionsEl) {
    const checkedToday = s && s.status === 'present';
    const t = (idx) => BP_TIERS[idx] || BP_TIERS[BP_TIERS.length-1];
    const missions = [
      { icon:'📋', title:'เช็คชื่อวันนี้',             desc:'มาเรียนและถูกเช็คชื่อ (+1 XP)',               done: checkedToday },
      { icon:'🥉', title:`Tier 5 — ${t(4).label}`,    desc:`สะสม ${t(4).xpNeeded} XP`,                 done: xp >= t(4).xpNeeded },
      { icon:'🥇', title:`Tier 10 — ${t(9).label}`,   desc:`สะสม ${t(9).xpNeeded} XP`,                 done: xp >= t(9).xpNeeded },
      { icon:'💠', title:`Tier 15 — ${t(14).label}`,  desc:`สะสม ${t(14).xpNeeded} XP`,                done: xp >= t(14).xpNeeded },
      { icon:'🔥', title:`Tier 20 — ${t(19).label}`,  desc:`สะสม ${t(19).xpNeeded} XP`,                done: xp >= t(19).xpNeeded },
      { icon:'🌟', title:'REVOLUTION RANK',              desc:`สะสม ${BP_TIERS[BP_TIERS.length-1].xpNeeded} XP`, done: xp >= BP_TIERS[BP_TIERS.length-1].xpNeeded },
    ];
    missionsEl.innerHTML = missions.map(m => `
      <div style="
        flex-shrink:0;
        display:flex;align-items:center;gap:12px;
        background:${m.done ? 'rgba(196,104,138,0.08)' : 'rgba(255,255,255,0.025)'};
        border:1px solid ${m.done ? 'rgba(255,105,185,0.35)' : 'rgba(200,140,180,0.1)'};
        border-radius:14px;padding:12px 16px;
        box-shadow:${m.done ? '0 0 16px rgba(196,104,138,0.1)' : 'none'};
        transition:all .3s;
      ">
        <div style="font-size:24px;flex-shrink:0;line-height:1;">${m.icon}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:14px;font-weight:700;color:${m.done ? '#D4A0B8' : 'rgba(255,255,255,.85)'};">${m.title}</div>
          <div style="font-size:11px;color:rgba(200,140,180,0.4);margin-top:3px;">${m.desc}</div>
        </div>
        <div style="width:26px;height:26px;border-radius:50%;flex-shrink:0;
          background:${m.done ? 'rgba(196,104,138,0.2)' : 'rgba(255,255,255,0.04)'};
          border:1.5px solid ${m.done ? 'rgba(255,105,185,0.7)' : 'rgba(200,140,180,0.15)'};
          display:flex;align-items:center;justify-content:center;
          font-size:13px;color:${m.done ? '#D4A0B8' : 'rgba(180,120,160,0.3)'};">${m.done ? '✓' : '○'}</div>
      </div>`).join('');
  }

  // ── Claim Rewards section ──
  renderClaimRewards(xp, s);
}

/* ══ BP CLAIM REWARDS ══ */
// Default in-game rewards — overrideable via admin
const BP_CLAIM_REWARDS_DEFAULT = {
  2:  { item: "iron_ingot",     amount: 8,  label: "⚙️ Iron Ingot x8" },
  3:  { item: "iron_ingot",     amount: 16, label: "⚙️ Iron Ingot x16" },
  4:  { item: "golden_apple",   amount: 1,  label: "🍎 Golden Apple x1" },
  5:  { item: "diamond",        amount: 2,  label: "💎 Diamond x2" },
  6:  { item: "diamond",        amount: 4,  label: "💎 Diamond x4" },
  7:  { item: "golden_apple",   amount: 3,  label: "🍎 Golden Apple x3" },
  8:  { item: "emerald",        amount: 3,  label: "💚 Emerald x3" },
  9:  { item: "emerald",        amount: 6,  label: "💚 Emerald x6" },
  10: { item: "netherite_scrap",amount: 1,  label: "🔥 Netherite Scrap x1" },
  11: { item: "diamond",        amount: 8,  label: "💎 Diamond x8" },
  12: { item: "netherite_scrap",amount: 2,  label: "🔥 Netherite Scrap x2" },
  13: { item: "elytra",         amount: 1,  label: "🪂 Elytra x1" },
  14: { item: "emerald",        amount: 10, label: "💚 Emerald x10" },
  15: { item: "netherite_scrap",amount: 3,  label: "🔥 Netherite Scrap x3" },
  16: { item: "netherite_ingot",amount: 1,  label: "⚡ Netherite Ingot x1" },
  17: { item: "diamond",        amount: 12, label: "💎 Diamond x12" },
  18: { item: "beacon",         amount: 1,  label: "🏆 Beacon x1" },
  19: { item: "netherite_ingot",amount: 2,  label: "⚡ Netherite Ingot x2" },
  20: { item: "netherite_ingot",amount: 3,  label: "⚡ Netherite Ingot x3" },
  21: { item: "diamond",        amount: 16, label: "💎 Diamond x16" },
  22: { item: "netherite_ingot",amount: 4,  label: "⚡ Netherite Ingot x4" },
  23: { item: "beacon",         amount: 2,  label: "🏆 Beacon x2" },
  24: { item: "netherite_ingot",amount: 6,  label: "⚡ Netherite Ingot x6" },
  25: { item: "special_title",  amount: 1,  label: "🌟 REVOLUTION Title" },
};

let BP_CLAIM_REWARDS = { ...BP_CLAIM_REWARDS_DEFAULT };

(async () => {
  const d = await api('GET', '/bp/claim-rewards');
  if (d) BP_CLAIM_REWARDS = { ...BP_CLAIM_REWARDS_DEFAULT, ...d };
  if (currentAdminTab === 'bp') renderBPTierEditor();
})();
wsOn('bp_claim_rewards', (d) => {
  BP_CLAIM_REWARDS = d ? { ...BP_CLAIM_REWARDS_DEFAULT, ...d } : { ...BP_CLAIM_REWARDS_DEFAULT };
  if (currentAdminTab === 'bp') renderBPTierEditor();
});

function renderClaimRewards(xp, s) {
  const listEl    = document.getElementById('bp-claim-list');
  const emptyEl   = document.getElementById('bp-claim-empty');
  const histWrap  = document.getElementById('bp-claim-history-wrap');
  const histEl    = document.getElementById('bp-claim-history');
  if (!listEl) return;

  const claimed  = (s && s.bp_claimed) ? s.bp_claimed : {};  // { "2": true, "5": true, ... }
  const pending  = [];
  const done     = [];

  for (const [tierStr, reward] of Object.entries(BP_CLAIM_REWARDS)) {
    const tier = parseInt(tierStr);
    const tierDef = BP_TIERS.find(t => t.tier === tier);
    if (!tierDef) continue;
    if (xp >= tierDef.xpNeeded) {
      if (claimed[tierStr]) {
        done.push({ tier, tierDef, reward, claimedAt: claimed[tierStr] });
      } else {
        pending.push({ tier, tierDef, reward });
      }
    }
  }

  if (pending.length === 0) {
    listEl.innerHTML = '';
    emptyEl.style.display = 'block';
  } else {
    emptyEl.style.display = 'none';
    listEl.innerHTML = pending.map(p => `
      <div style="
        display:flex;align-items:center;gap:12px;
        background:linear-gradient(135deg,rgba(210,180,130,0.1) 0%,rgba(196,104,138,0.07) 100%);
        border:1.5px solid rgba(210,180,130,0.45);
        border-radius:16px;padding:14px 16px;
        box-shadow:0 0 20px rgba(210,180,130,0.08);
        animation:stepIn .3s cubic-bezier(.34,1.56,.64,1);
      ">
        <div style="flex-shrink:0;text-align:center;min-width:40px;">
          <div style="font-family:'Bangers',cursive;font-size:26px;color:${p.tierDef.color};line-height:1;text-shadow:0 0 12px ${p.tierDef.color}88;">${p.tier}</div>
          <div style="font-size:10px;color:rgba(255,255,255,0.35);letter-spacing:1px;margin-top:2px;">${p.tierDef.label}</div>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:15px;font-weight:700;color:#C8A060;">${p.reward.label}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:3px;letter-spacing:.5px;">Tier ${p.tier} reward — รับในเกม Minecraft</div>
        </div>
        <button onclick="claimBPReward(${p.tier})" style="
          flex-shrink:0;
          background:linear-gradient(135deg,#C8A060,#FF8C00);
          border:none;color:#120b0e;
          font-family:'Kanit',sans-serif;font-size:13px;font-weight:700;
          padding:10px 18px;border-radius:12px;cursor:pointer;
          letter-spacing:1px;white-space:nowrap;
          box-shadow:0 4px 16px rgba(210,180,130,0.4);
          transition:all .2s;
        " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(210,180,130,0.6)'"
           onmouseout="this.style.transform='';this.style.boxShadow='0 4px 16px rgba(210,180,130,0.4)'">
          🎁 รับเลย
        </button>
      </div>`).join('');
  }

  // History
  if (done.length > 0) {
    histWrap.style.display = 'block';
    histEl.innerHTML = done.map(d => {
      const dateStr = typeof d.claimedAt === 'number'
        ? new Date(d.claimedAt).toLocaleString('th-TH',{hour:'2-digit',minute:'2-digit',day:'numeric',month:'short'})
        : '—';
      return `<div style="
        display:flex;align-items:center;gap:10px;
        background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07);
        border-radius:10px;padding:8px 14px;opacity:.6;
      ">
        <div style="font-size:12px;font-family:'Bangers',cursive;color:${d.tierDef.color};min-width:30px;text-align:center;">${d.tier}</div>
        <div style="flex:1;font-size:13px;color:rgba(255,255,255,0.55);">${d.reward.label}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.25);">✓ ${dateStr}</div>
      </div>`;
    }).join('');
  } else {
    histWrap.style.display = 'none';
  }
}

async function claimBPReward(tier) {
  if (!currentStudent) return;
  const s = students.find(x => x.id === currentStudent.id);
  if (!s) return;
  const reward = BP_CLAIM_REWARDS[tier];
  if (!reward) return;

  // ป้องกัน double-claim
  if (s.bp_claimed && s.bp_claimed[tier]) {
    showToast('รับรางวัลนี้ไปแล้ว!');
    return;
  }

  // บันทึก claimed ลง student data
  if (!s.bp_claimed) s.bp_claimed = {};
  s.bp_claimed[tier] = Date.now();

  // เขียน claim queue ลง backend: /bp/queue/{studentId}_{tier}
  const queueKey = `${s.id}_tier${tier}`;
  await api('POST', '/bp/queue/' + queueKey, {
    studentId: s.id,
    playerName: s.xbox || s.name,
    tier,
    item: reward.item,
    amount: reward.amount,
    label: reward.label,
    claimedAt: Date.now(),
    status: 'pending'   // addon จะเปลี่ยนเป็น 'done' เมื่อให้ของแล้ว
  });

  // อัปเดต student record
  const obj = {};
  students.forEach(st => { obj[st.id] = st; });
  await api('POST', '/students', obj);

  showToast(`🎁 ส่งคำขอรับ ${reward.label} แล้ว! รอรับในเกม`);
  renderBattlepass();
}

/* ── BP ADMIN: XP Manager ── */
function renderBPAdminList() {
  const el = document.getElementById('bp-admin-student-list');
  if (!el) return;
  const q = (document.getElementById('bp-admin-search')?.value || '').toLowerCase();
  const list = students.filter(s => !q || s.name.toLowerCase().includes(q));
  if (list.length === 0) {
    el.innerHTML = `<div style="text-align:center;padding:16px;color:rgba(255,255,255,0.2);font-size:12px;">ไม่พบนักเรียน</div>`;
    return;
  }
  el.innerHTML = list.map(s => {
    const xp = s.bp_xp || 0;
    const tier = [...BP_TIERS].reverse().find(t => xp >= t.xpNeeded) || BP_TIERS[0];
    return `<div style="display:flex;align-items:center;gap:10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:10px 12px;">
      <div style="flex:1;min-width:0;">
        <div style="font-size:13px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.name}</div>
        <div style="font-size:11px;color:${tier.color};font-weight:700;">${tier.label} · ${xp} XP</div>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0;">
        <button onclick="adminBPXP(${s.id},-1)" style="width:30px;height:30px;border-radius:8px;background:rgba(255,0,85,0.15);border:1px solid rgba(255,0,85,0.3);color:#c05070;font-size:16px;cursor:pointer;line-height:1;font-family:'Kanit',sans-serif;">−</button>
        <button onclick="adminBPXP(${s.id},+1)" style="width:30px;height:30px;border-radius:8px;background:rgba(210,180,130,0.12);border:1px solid rgba(210,180,130,0.3);color:#C8A060;font-size:16px;cursor:pointer;line-height:1;font-family:'Kanit',sans-serif;">+</button>
        <button onclick="adminBPXPInput(${s.id})" style="height:30px;padding:0 10px;border-radius:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.5);font-size:11px;cursor:pointer;font-family:'Kanit',sans-serif;">ตั้งค่า</button>
      </div>
    </div>`;
  }).join('');
}

function adminBPXP(id, delta) {
  const s = students.find(x => x.id === id);
  if (!s) return;
  s.bp_xp = Math.max(0, (s.bp_xp || 0) + delta);
  save();
  renderBPAdminList();
  showToast(`${delta > 0 ? '+' : ''}${delta} XP → ${s.name} (รวม ${s.bp_xp} XP)`);
}

function adminBPXPInput(id) {
  const s = students.find(x => x.id === id);
  if (!s) return;
  const val = prompt(`ตั้ง XP ให้ ${s.name} (ปัจจุบัน: ${s.bp_xp || 0} XP)`, s.bp_xp || 0);
  if (val === null) return;
  const n = parseInt(val);
  if (isNaN(n) || n < 0) { showToast('ใส่ตัวเลขที่ถูกต้อง'); return; }
  s.bp_xp = n;
  save();
  renderBPAdminList();
  showToast(`✓ ตั้ง XP ${s.name} = ${n} XP`);
}

/* ── BP ADMIN: Tier Editor ── */
function renderBPTierEditor() {
  const el = document.getElementById('bp-tier-editor-list');
  if (!el) return;
  // Also re-render when admin opens bp tab
  if (currentAdminTab === 'bp') renderBPAdminList();
  el.innerHTML = BP_TIERS.map(t => {
    const claim = BP_CLAIM_REWARDS[t.tier] || {};
    return `<div style="background:rgba(255,255,255,0.02);border:1px solid rgba(100,180,255,0.12);border-radius:10px;padding:10px 12px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
        <div style="font-family:'Bangers',cursive;font-size:18px;color:${t.color};min-width:28px;text-shadow:0 0 10px ${t.color}88;">T${t.tier}</div>
        <input id="bped-label-${t.tier}" value="${t.label}" style="flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(100,180,255,0.2);color:#fff;font-family:'Kanit',sans-serif;font-size:12px;padding:5px 10px;border-radius:8px;outline:none;" placeholder="Label">
        <input id="bped-color-${t.tier}" type="color" value="${t.color}" style="width:32px;height:32px;border:none;background:transparent;cursor:pointer;border-radius:6px;padding:0;">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
        <div>
          <div style="font-size:9px;color:rgba(255,255,255,0.3);letter-spacing:1px;margin-bottom:3px;">XP ที่ต้องการ</div>
          <input id="bped-xp-${t.tier}" type="number" value="${t.xpNeeded}" min="0" style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(100,180,255,0.2);color:#C8A060;font-family:'Kanit',sans-serif;font-size:13px;font-weight:700;padding:5px 10px;border-radius:8px;outline:none;">
        </div>
        <div>
          <div style="font-size:9px;color:rgba(255,255,255,0.3);letter-spacing:1px;margin-bottom:3px;">รางวัล Free</div>
          <input id="bped-reward-${t.tier}" value="${t.reward}" style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(100,180,255,0.2);color:#D4A0B8;font-family:'Kanit',sans-serif;font-size:11px;padding:5px 10px;border-radius:8px;outline:none;" placeholder="รางวัล Free">
        </div>
      </div>
      <div style="margin-top:6px;">
        <div style="font-size:9px;color:rgba(255,255,255,0.3);letter-spacing:1px;margin-bottom:3px;">Claim Reward (ของในเกม)</div>
        <input id="bped-claim-${t.tier}" value="${claim.label || ''  }" style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(210,180,130,0.2);color:#C8A060;font-family:'Kanit',sans-serif;font-size:11px;padding:5px 10px;border-radius:8px;outline:none;" placeholder="เช่น 💎 Diamond x3 (เว้นว่างถ้าไม่มี)">
      </div>
    </div>`;
  }).join('');
}

async function saveBPTiersAdmin() {
  // Read tier editor inputs
  const tiersObj = {};
  const claimsObj = {};
  BP_TIERS.forEach(t => {
    const label  = document.getElementById(`bped-label-${t.tier}`)?.value.trim() || t.label;
    const color  = document.getElementById(`bped-color-${t.tier}`)?.value || t.color;
    const xp     = parseInt(document.getElementById(`bped-xp-${t.tier}`)?.value) || 0;
    const reward = document.getElementById(`bped-reward-${t.tier}`)?.value.trim() || t.reward;
    const claim  = document.getElementById(`bped-claim-${t.tier}`)?.value.trim() || '';
    tiersObj[t.tier] = { label, color, xpNeeded: xp, reward };
    if (claim) claimsObj[t.tier] = { label: claim, item: `tier_${t.tier}`, amount: 1 };
  });
  try {
    await api('POST', '/bp/tiers', tiersObj);
    await api('POST', '/bp/claim-rewards', claimsObj);
    showToast('✓ บันทึก Tier Config แล้ว!');
  } catch(e) { showToast('Error: ' + e.message); }
}

/* ── BP ADMIN: Queue Viewer ── */
async function refreshBPQueue() {
  const el = document.getElementById('bp-queue-list');
  if (!el) return;
  el.innerHTML = `<div style="text-align:center;padding:20px;color:rgba(255,255,255,0.2);font-size:12px;">⏳ กำลังโหลด...</div>`;
  try {
    const data = await api('GET', '/bp/queue');
    if (!data || Object.keys(data).length === 0) {
      el.innerHTML = `<div style="text-align:center;padding:24px;color:rgba(255,255,255,0.15);font-size:12px;letter-spacing:1px;">ไม่มีรายการรอรับ ✓</div>`;
      const badge = document.getElementById('atab-bp-count');
      if (badge) badge.style.display = 'none';
      return;
    }
    const items = Object.entries(data).sort((a,b) => (b[1].claimedAt||0)-(a[1].claimedAt||0));
    const pending = items.filter(([,v]) => v.status === 'pending');
    const done    = items.filter(([,v]) => v.status !== 'pending');

    // update badge
    const badge = document.getElementById('atab-bp-count');
    if (badge) {
      badge.textContent = pending.length;
      badge.style.display = pending.length > 0 ? '' : 'none';
    }

    const renderItem = ([key, v]) => {
      const isPending = v.status === 'pending';
      const dt = v.claimedAt ? new Date(v.claimedAt).toLocaleString('th-TH',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) : '';
      return `<div style="display:flex;align-items:center;gap:10px;background:${isPending?'rgba(210,180,130,0.05)':'rgba(255,255,255,0.02)'};border:1px solid ${isPending?'rgba(210,180,130,0.2)':'rgba(255,255,255,0.06)'};border-radius:12px;padding:10px 12px;">
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:600;color:${isPending?'#C8A060':'rgba(255,255,255,0.4)'};">${v.playerName || v.studentId}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.4);">Tier ${v.tier} — ${v.label || v.item}</div>
          <div style="font-size:10px;color:rgba(255,255,255,0.2);">${dt}</div>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0;align-items:center;">
          ${isPending
            ? `<span style="font-size:10px;color:#C8A060;background:rgba(210,180,130,0.12);border:1px solid rgba(210,180,130,0.25);padding:3px 8px;border-radius:6px;font-weight:700;">รอให้ของ</span>
               <button onclick="adminBPDone('${key}')" style="padding:5px 12px;border-radius:8px;background:linear-gradient(135deg,#C8A060,#B89050);border:none;color:#120b0e;font-family:'Kanit',sans-serif;font-size:11px;font-weight:700;cursor:pointer;">✓ ให้แล้ว</button>`
            : `<span style="font-size:10px;color:rgba(255,255,255,0.25);background:rgba(255,255,255,0.05);padding:3px 8px;border-radius:6px;">✓ เสร็จแล้ว</span>`
          }
          <button onclick="adminBPDelete('${key}')" style="width:26px;height:26px;border-radius:7px;background:rgba(255,0,85,0.1);border:1px solid rgba(255,0,85,0.2);color:rgba(255,80,80,0.6);font-size:13px;cursor:pointer;line-height:1;">✕</button>
        </div>
      </div>`;
    };

    el.innerHTML = [
      pending.length ? `<div style="font-size:10px;color:rgba(210,180,130,0.5);letter-spacing:1px;margin-bottom:4px;text-transform:uppercase;">⏳ รอดำเนินการ (${pending.length})</div>` : '',
      ...pending.map(renderItem),
      done.length ? `<div style="font-size:10px;color:rgba(255,255,255,0.2);letter-spacing:1px;margin:10px 0 4px;text-transform:uppercase;">✓ เสร็จแล้ว (${done.length})</div>` : '',
      ...done.map(renderItem),
    ].join('');
  } catch(e) {
    el.innerHTML = `<div style="text-align:center;padding:20px;color:rgba(255,80,80,0.5);font-size:12px;">โหลดไม่ได้: ${e.message}</div>`;
  }
}

async function adminBPDone(key) {
  try {
    await api('PATCH', '/bp/queue/' + key + '/status', { status: 'done' });
    showToast('✓ บันทึกว่าให้ของแล้ว');
    refreshBPQueue();
  } catch(e) { showToast('Error: ' + e.message); }
}

async function adminBPDelete(key) {
  try {
    await api('DELETE', '/bp/queue/' + key);
    showToast('🗑 ลบรายการแล้ว');
    refreshBPQueue();
  } catch(e) { showToast('Error: ' + e.message); }
}


let shopData = JSON.parse(localStorage.getItem('rev_shop') || 'null') || {
  cats: [
    { id: 1, name: '🥬 ของสด', icon: '🥬', items: [] },
    { id: 2, name: '🧃 เครื่องดื่ม', icon: '🧃', items: [] },
    { id: 3, name: '🧴 ของใช้', icon: '🧴', items: [] },
  ]
};
let openCats = {};

function saveShop() {
  localStorage.setItem('rev_shop', JSON.stringify(shopData));
}

function addCategory() {
  const inp = document.getElementById('new-cat-inp');
  const name = inp.value.trim();
  if (!name) return;
  shopData.cats.push({ id: Date.now(), name, icon: '📦', items: [] });
  saveShop(); renderShop();
  inp.value = '';
}

function addItem(catId) {
  const inp = document.getElementById('item-inp-' + catId);
  const name = inp.value.trim();
  if (!name) return;
  const cat = shopData.cats.find(c => c.id === catId);
  if (!cat) return;
  cat.items.push({ id: Date.now(), name, done: false });
  saveShop(); renderShop();
  openCats[catId] = true;
}

function toggleItem(catId, itemId) {
  const cat = shopData.cats.find(c => c.id === catId);
  if (!cat) return;
  const item = cat.items.find(i => i.id === itemId);
  if (item) item.done = !item.done;
  saveShop(); renderShop();
  openCats[catId] = true;
}

function toggleCat(catId) {
  openCats[catId] = !openCats[catId];
  renderShop();
}

function deleteItem(catId, itemId) {
  const cat = shopData.cats.find(c => c.id === catId);
  if (!cat) return;
  cat.items = cat.items.filter(i => i.id !== itemId);
  saveShop(); renderShop();
  openCats[catId] = true;
}

function renderShop() {
  const listEl = document.getElementById('cat-list');
  if (!listEl) return;
  let totalItems = 0, doneItems = 0;
  shopData.cats.forEach(c => { totalItems += c.items.length; doneItems += c.items.filter(i => i.done).length; });
  document.getElementById('shop-prog-val').textContent = doneItems + ' / ' + totalItems;
  const pct = totalItems > 0 ? Math.round(doneItems / totalItems * 100) : 0;
  document.getElementById('shop-prog-bar').style.width = pct + '%';

  listEl.innerHTML = shopData.cats.map(cat => {
    const isOpen = openCats[cat.id];
    const doneCnt = cat.items.filter(i => i.done).length;
    const itemsHtml = cat.items.map(item => `
      <div class="shop-item ${item.done ? 'checked' : ''}">
        <div class="shop-check ${item.done ? 'done' : ''}" onclick="toggleItem(${cat.id},${item.id})"></div>
        <span class="shop-item-name">${item.name}</span>
        <span onclick="deleteItem(${cat.id},${item.id})" style="color:rgba(255,100,100,0.3);cursor:pointer;font-size:16px;padding:0 4px;">✕</span>
      </div>`).join('');
    return `<div class="cat-card ${isOpen ? 'open' : ''}">
      <div class="cat-header" onclick="toggleCat(${cat.id})">
        <span class="cat-icon">${cat.icon}</span>
        <span class="cat-name">${cat.name}</span>
        <span class="cat-count">${doneCnt}/${cat.items.length}</span>
        <span class="cat-chevron">›</span>
      </div>
      <div class="cat-items">
        ${itemsHtml || '<div style="font-size:12px;color:rgba(255,255,255,0.2);padding:4px 0 8px;">ยังไม่มีรายการ</div>'}
        <div class="add-item-row">
          <input class="add-item-inp" id="item-inp-${cat.id}" placeholder="เพิ่มรายการ..." onkeydown="if(event.key==='Enter')addItem(${cat.id})">
          <button class="btn-add-item" onclick="addItem(${cat.id})">＋</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

/* ══ ADMIN SHOP MANAGEMENT ══ */
// Load shop + listen realtime
(async () => {
  const items = await api('GET', '/shop');
  window._shopItems = items || [];
  if (currentAdminTab === 'shop') renderAdminShop();
  renderStudentShop();
})();
wsOn('shopitems', (items) => {
  window._shopItems = items || [];
  if (currentAdminTab === 'shop') renderAdminShop();
  renderStudentShop();
});

function adminAddShopItem() {
  const name = document.getElementById('admin-shop-name').value.trim();
  const price = document.getElementById('admin-shop-price').value.trim();
  const cat   = document.getElementById('admin-shop-cat').value.trim();
  const note  = document.getElementById('admin-shop-note').value.trim();
  if (!name) { showToast('⚠ กรุณากรอกชื่อสินค้า'); return; }
  const id = Date.now();
  api('POST', '/shop/' + id, { id, name, price: price || '', cat: cat || 'ทั่วไป', note: note || '', ts: id });
  document.getElementById('admin-shop-name').value = '';
  document.getElementById('admin-shop-price').value = '';
  document.getElementById('admin-shop-cat').value = '';
  document.getElementById('admin-shop-note').value = '';
  showToast('✓ เพิ่มสินค้าแล้ว');
}

function adminDeleteShopItem(id) {
  api('DELETE', '/shop/' + id);
  showToast('🗑 ลบสินค้าแล้ว');
}

function renderAdminShop() {
  const el = document.getElementById('admin-shop-list');
  if (!el) return;
  const items = window._shopItems || [];
  if (items.length === 0) {
    el.innerHTML = `<div style="text-align:center;padding:32px;color:rgba(255,255,255,0.15);font-size:12px;letter-spacing:1px;">ยังไม่มีสินค้า</div>`;
    return;
  }
  el.innerHTML = items.map(item => `
    <div style="display:flex;align-items:center;gap:10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:11px 14px;">
      <div style="flex:1;min-width:0;">
        <div style="font-size:13px;font-weight:700;color:rgba(255,255,255,.9);">${escHtml(item.name)}</div>
        <div style="font-size:10px;color:rgba(255,255,255,0.3);margin-top:2px;display:flex;gap:10px;flex-wrap:wrap;">
          ${item.cat ? `<span>📦 ${escHtml(item.cat)}</span>` : ''}
          ${item.price ? `<span style="color:var(--yellow);">฿${escHtml(item.price)}</span>` : ''}
          ${item.note ? `<span style="color:rgba(255,255,255,0.2);">📝 ${escHtml(item.note)}</span>` : ''}
        </div>
      </div>
      <button onclick="adminDeleteShopItem(${item.id})" style="background:rgba(255,64,96,0.1);border:1px solid rgba(255,64,96,0.2);color:rgba(255,100,100,0.7);font-size:14px;width:32px;height:32px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;">✕</button>
    </div>`).join('');
}

function renderStudentShop() {
  const el = document.getElementById('student-shop-list');
  const emptyEl = document.getElementById('student-shop-empty');
  if (!el) return;
  const items = window._shopItems || [];
  if (items.length === 0) {
    el.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  // Group by category
  const cats = {};
  items.forEach(item => {
    const c = item.cat || 'ทั่วไป';
    if (!cats[c]) cats[c] = [];
    cats[c].push(item);
  });

  el.innerHTML = Object.entries(cats).map(([cat, catItems]) => `
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;">
      <div style="padding:11px 16px;background:rgba(255,255,255,0.02);border-bottom:1px solid rgba(255,255,255,0.05);font-size:12px;font-weight:700;color:rgba(255,255,255,0.5);letter-spacing:1px;">📦 ${escHtml(cat)}</div>
      ${catItems.map(item => `
        <div style="display:flex;align-items:center;gap:12px;padding:11px 16px;border-bottom:1px solid rgba(255,255,255,0.03);">
          <div style="flex:1;min-width:0;">
            <div style="font-size:13px;font-weight:600;color:rgba(255,255,255,.85);">${escHtml(item.name)}</div>
            ${item.note ? `<div style="font-size:11px;color:rgba(255,255,255,0.25);margin-top:2px;">${escHtml(item.note)}</div>` : ''}
          </div>
          ${item.price ? `<div style="font-family:'Bangers',cursive;font-size:18px;color:var(--yellow);letter-spacing:1px;flex-shrink:0;">฿${escHtml(item.price)}</div>` : ''}
        </div>`).join('')}
    </div>`).join('');
}

/* ══ FRIENDS / TINDER SWIPE ══ */
let friendDeck = [];
let matchedPartner = null;
let chatTimerInterval = null;
let chatSecondsLeft = 210;
let chatPartnerId = null;
let chatMessages = [];
let mySwipedIds = new Set();
let chatUnsubscribe = null;
let incomingLikeUnsub = null;
let _isDragging = false;

function initFriendsPage() {
  showFriendsView('swipe');
  mySwipedIds = new Set();
  friendDeck = [];
  renderFriendStack(); // render ทันทีด้วยข้อมูลที่มี

  // WebSocket handles likes broadcast; register handler once
  incomingLikeUnsub = null;
  wsOn('likes', async (data) => {
    if (!data || !currentStudent) return;
    const myId = String(currentStudent.id);
    const suffix = '_likes_' + myId;
    const likesMe = Object.keys(data).filter(k => k.endsWith(suffix));
    for (const lk of likesMe) {
      const fromIdStr = lk.slice(0, lk.length - suffix.length);
      const myLikeKey = myId + '_likes_' + fromIdStr;
      if (data[myLikeKey] && !matchedPartner) {
        const partner = students.find(s => String(s.id) === fromIdStr);
        if (partner) {
          const chatEl = document.getElementById('friends-chat-view');
          const matchEl = document.getElementById('friends-match-view');
          const chatHidden = !chatEl || chatEl.style.display === 'none' || chatEl.style.display === '';
          const matchHidden = !matchEl || matchEl.style.display === 'none';
          if (chatHidden && matchHidden) showMatch(partner);
        }
      } else if (!data[myLikeKey]) {
        const partner = students.find(s => String(s.id) === fromIdStr);
        if (partner) showToast('💜 มีคนสนใจคุณอยู่ — ลอง swipe ดูนะ!');
      }
    }
  });
}

function buildFriendDeck() {
  if (!currentStudent) return;
  if (_isDragging) return;
  if (students.length === 0) return;

  const onlineIds = new Set((window._onlineUsers || []).map(u => String(u.id)));
  const onlineReady = window._onlineUsers !== null && window._onlineUsers !== undefined;

  const others = students.filter(s => {
    if (s.id === currentStudent.id) return false;
    if (mySwipedIds.has(s.id)) return false;
    if (!onlineReady) return true; // ยังไม่ได้ข้อมูล online → แสดงทุกคนก่อน
    return onlineIds.has(String(s.id)); // โหลดแล้ว → กรองเฉพาะ online
  });

  friendDeck = [...others].sort(() => Math.random() - 0.5);
  renderFriendStack();
}

function renderFriendStack() {
  const stack = document.getElementById('friend-card-stack');
  const noMore = document.getElementById('friend-no-more');
  if (!stack) return;
  stack.innerHTML = '';

  // ถ้า students ยังไม่โหลด
  if (!currentStudent || students.length === 0) {
    if (noMore) {
      noMore.style.display = 'block';
      noMore.innerHTML = '<div style="text-align:center;padding-top:80px;color:rgba(255,255,255,0.2);font-size:14px;">⏳ กำลังโหลด...</div>';
    }
    document.getElementById('btn-nope').style.display = 'none';
    document.getElementById('btn-like').style.display = 'none';
    // retry เมื่อ students โหลดเสร็จ
    setTimeout(() => {
      if (currentStudent && students.length > 0) buildFriendDeck();
      else renderFriendStack();
    }, 600);
    return;
  }

  // คำนวณ deck จาก students ถ้า friendDeck ว่าง
  if (friendDeck.length === 0) {
    const onlineIds = new Set((window._onlineUsers || []).map(u => String(u.id)));
    const onlineReady = window._onlineUsers !== null && window._onlineUsers !== undefined;
    const others = students.filter(s => {
      if (s.id === currentStudent.id) return false;
      if (mySwipedIds.has(s.id)) return false;
      // ถ้า online ยังไม่โหลด → แสดงทุกคนก่อน
      if (!onlineReady) return true;
      // โหลดแล้ว → กรองเฉพาะ online
      return onlineIds.has(String(s.id));
    });
    friendDeck = [...others].sort(() => Math.random() - 0.5);
  }

  if (friendDeck.length === 0) {
    if (noMore) {
      noMore.style.display = 'block';
      noMore.innerHTML = '<div style="text-align:center;padding-top:60px;"><div style="font-size:48px;margin-bottom:12px;">💜</div><div style="color:rgba(255,255,255,0.25);font-size:14px;letter-spacing:1px;line-height:2;">swipe หมดแล้ว!<br><span style="font-size:11px;color:rgba(255,255,255,0.12);">รอเพื่อนคนใหม่เข้ามา</span></div></div>';
    }
    document.getElementById('btn-nope').style.display = 'none';
    document.getElementById('btn-like').style.display = 'none';
    return;
  }

  if (noMore) noMore.style.display = 'none';
  document.getElementById('btn-nope').style.display = 'flex';
  document.getElementById('btn-like').style.display = 'flex';

  const visible = friendDeck.slice(0, 2);
  visible.reverse().forEach((s, i) => {
    const card = buildFriendCardEl(s, i === 1);
    stack.appendChild(card);
  });
  if (visible.length > 0) setupSwipe(stack.lastChild, visible[visible.length - 1]);
}

function buildFriendCardEl(s, isTop) {
  const card = document.createElement('div');
  card.className = isTop ? 'friend-card' : 'friend-card behind';
  card.style.transform = isTop ? 'scale(1) translateY(0)' : 'scale(0.97) translateY(10px)';
  card.style.zIndex = isTop ? 2 : 1;
  const isOnline = (window._onlineUsers || []).some(u => String(u.id) === String(s.id));
  const avatarHtml = s.avatar
    ? `<img class="friend-card-img" src="${s.avatar}">`
    : `<div class="friend-card-emoji">👤</div>`;
  card.innerHTML = `
    ${avatarHtml}
    <div style="position:absolute;inset:0;pointer-events:none;background:linear-gradient(to bottom, transparent 40%, rgba(8,5,16,0.75) 75%, rgba(8,5,16,1) 100%);z-index:1;border-radius:28px;"></div>
    <div class="swipe-label like">💜 LIKE</div>
    <div class="swipe-label nope">NOPE ✕</div>
    <div class="friend-card-info" style="position:relative;z-index:2;">
      <div class="friend-card-name">${s.name}</div>
      <div class="friend-card-tag">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Xbox_one_logo.svg/40px-Xbox_one_logo.svg.png" style="height:12px;opacity:0.6;filter:brightness(0) invert(1);">
        <span style="color:rgba(255,255,255,0.5);font-size:12px;">${s.xbox || s.name}</span>
        ${isOnline ? '<span style="background:linear-gradient(135deg,#70b890,#60a880);color:#000;font-size:8px;font-weight:800;padding:3px 9px;border-radius:20px;letter-spacing:1px;box-shadow:0 2px 8px rgba(0,230,118,0.4);">ONLINE</span>' : '<span style="color:rgba(255,255,255,0.15);font-size:9px;letter-spacing:.5px;">offline</span>'}
      </div>
      <span class="friend-card-badge">🎮 GAMER</span>
    </div>`;
  return card;
}

function setupSwipe(card, student) {
  let startX = 0, curX = 0, dragging = false;
  function onStart(e) {
    if (e.target.tagName === 'BUTTON') return;
    dragging = true; _isDragging = true;
    startX = (e.touches ? e.touches[0].clientX : e.clientX);
    card.style.transition = 'none';
    if (e.type === 'mousedown') e.preventDefault();
  }
  function onMove(e) {
    if (!dragging) return;
    curX = (e.touches ? e.touches[0].clientX : e.clientX) - startX;
    card.style.transform = `translateX(${curX}px) rotate(${curX * 0.08}deg)`;
    const like = card.querySelector('.swipe-label.like');
    const nope = card.querySelector('.swipe-label.nope');
    if (curX > 20) { like.style.opacity = Math.min((curX-20)/60,1); nope.style.opacity=0; }
    else if (curX < -20) { nope.style.opacity = Math.min((-curX-20)/60,1); like.style.opacity=0; }
    else { like.style.opacity=0; nope.style.opacity=0; }
  }
  function onEnd(e) {
    if (!dragging) return; dragging=false; _isDragging=false;
    card.style.transition = 'transform .35s cubic-bezier(.34,1.2,.64,1)';
    if (curX > 80) doSwipe('right', card, student);
    else if (curX < -80) doSwipe('left', card, student);
    else {
      card.style.transform = 'scale(1) translateY(0)';
      card.querySelector('.swipe-label.like').style.opacity = 0;
      card.querySelector('.swipe-label.nope').style.opacity = 0;
    }
    curX = 0;
  }
  card.addEventListener('mousedown', onStart);
  card.addEventListener('touchstart', onStart, {passive:false});
  card.addEventListener('mousemove', onMove);
  card.addEventListener('touchmove', onMove, {passive:true});
  card.addEventListener('mouseup', onEnd);
  card.addEventListener('touchend', onEnd);
  window.addEventListener('mouseup', e => { if(dragging) onEnd(e); }, {once:true});
  window.addEventListener('touchend', e => { if(dragging) onEnd(e); }, {once:true});
}

function doSwipe(dir, card, student) {
  card.style.transition = 'transform .45s ease, opacity .45s ease';
  if (dir === 'right') {
    card.style.transform = 'translateX(130%) rotate(25deg)';
    card.style.opacity = '0';
    setTimeout(async () => {
      friendDeck.shift(); mySwipedIds.add(student.id); renderFriendStack();
      const likeKey = String(currentStudent.id) + '_likes_' + String(student.id);
      const reverseKey = String(student.id) + '_likes_' + String(currentStudent.id);
      const reverseData = await api('GET', '/likes/' + reverseKey);
      await api('POST', '/likes/' + likeKey, { from: currentStudent.id, to: student.id, ts: Date.now() });
      if (reverseData) showMatch(student);
      else showToast('💜 ส่ง Like แล้ว รอให้เขา Like กลับ!');
    }, 350);
  } else {
    card.style.transform = 'translateX(-130%) rotate(-25deg)';
    card.style.opacity = '0';
    setTimeout(() => { friendDeck.shift(); mySwipedIds.add(student.id); renderFriendStack(); }, 350);
  }
}

function swipeCard(dir) {
  const stack = document.getElementById('friend-card-stack');
  const topCard = stack.lastChild;
  if (!topCard || topCard === document.getElementById('friend-no-more')) return;
  if (!friendDeck[0]) return;
  doSwipe(dir, topCard, friendDeck[0]);
}

function showMatch(partner) {
  matchedPartner = partner;
  document.getElementById('match-name').textContent = partner.name;
  showFriendsView('match');
}

function closeMatchView() {
  matchedPartner = null;
  showFriendsView('swipe');
}

async function openMatchChat() {
  if (!matchedPartner) return;
  const likeKey1 = String(currentStudent.id) + '_likes_' + String(matchedPartner.id);
  const likeKey2 = String(matchedPartner.id) + '_likes_' + String(currentStudent.id);
  await api('DELETE', '/likes/' + likeKey1);
  await api('DELETE', '/likes/' + likeKey2);
  chatPartnerId = matchedPartner.id;
  chatMessages = [];
  document.getElementById('chat-partner-name').textContent = matchedPartner.name;
  const av = document.getElementById('chat-partner-avatar');
  av.innerHTML = matchedPartner.avatar
    ? `<img src="${matchedPartner.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
    : '👤';
  document.getElementById('chat-messages').innerHTML = '';
  document.getElementById('chat-input').value = '';

  // ── ใช้ startTs จาก backend เพื่อให้ timer ตรงกันทั้งสองฝั่ง ──
  const chatKey = [String(currentStudent.id), String(chatPartnerId)].sort().join('_');
  let startTs;
  const metaData = await api('GET', '/chat-meta/' + chatKey);
  if (metaData && metaData.startTs) {
    startTs = metaData.startTs;
  } else {
    startTs = Date.now();
    await api('POST', '/chat-meta/' + chatKey, { startTs });
  }
  startChatTimer(startTs);

  showFriendsView('chat');
  chatUnsubscribe = null;
  // Register realtime chat handler via WebSocket
  wsOn('chat_' + chatKey, (data) => {
    chatMessages = data ? Object.values(data).sort((a,b) => a.ts - b.ts) : [];
    renderChatMessages();
  });
  // Fetch current messages immediately
  api('GET', '/chats/' + chatKey).then(data => {
    chatMessages = data ? Object.values(data).sort((a,b) => a.ts - b.ts) : [];
    renderChatMessages();
  });

  // ── ฟัง meta: ถ้าอีกฝั่งลบ (หมดเวลา) → kick ออกทั้งคู่ ──
  window._chatMetaUnsub = null;
  wsOn('chat_meta_' + chatKey, (data) => {
    if (data === null && chatPartnerId) {
      clearInterval(chatTimerInterval);
      chatSecondsLeft = 0;
      updateChatTimerDisplay();
      const inp = document.getElementById('chat-input');
      if (inp) { inp.disabled = true; inp.placeholder = '⏱ หมดเวลาแชทแล้ว'; }
      chatPartnerId = null; matchedPartner = null; chatMessages = [];
      showToast('⏱ หมดเวลาแชท — แชทถูกลบแล้ว');
      friendDeck = [];
      setTimeout(() => { showFriendsView('swipe'); }, 1200);
    }
  });
}

function renderChatMessages() {
  const el = document.getElementById('chat-messages');
  if (!el) return;
  // sort ascending by timestamp → ข้อความเก่าบนสุด ใหม่ล่างสุด
  const sorted = [...chatMessages].sort((a, b) => a.ts - b.ts);
  el.innerHTML = sorted.map(m => {
    const isMe = String(m.senderId) === String(currentStudent.id);
    const t = new Date(m.ts).toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'});
    return `<div class="chat-bubble-wrap ${isMe?'me':'them'}">
      <div class="chat-bubble ${isMe?'me':'them'}">${escHtml(m.text)}</div>
      <div class="chat-time">${t}</div>
    </div>`;
  }).join('');
  // scroll ลงล่างสุดเสมอ
  requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
}

function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function sendChatMessage() {
  const inp = document.getElementById('chat-input');
  const text = inp.value.trim();
  if (!text || !chatPartnerId || chatSecondsLeft <= 0) return;
  const chatKey = [String(currentStudent.id), String(chatPartnerId)].sort().join('_');
  const msgId = Date.now();
  api('POST', '/chats/' + chatKey + '/' + msgId, {
    senderId: currentStudent.id, senderName: currentStudent.name, text, ts: msgId
  });
  inp.value = '';
}

function startChatTimer(startTs) {
  const CHAT_DURATION = 210;
  clearInterval(chatTimerInterval);
  const tick = () => {
    const elapsed = Math.floor((Date.now() - startTs) / 1000);
    chatSecondsLeft = Math.max(0, CHAT_DURATION - elapsed);
    updateChatTimerDisplay();
    if (chatSecondsLeft <= 0) { clearInterval(chatTimerInterval); endChat(); }
  };
  tick();
  chatTimerInterval = setInterval(tick, 1000);
}

function updateChatTimerDisplay() {
  const m = Math.floor(chatSecondsLeft / 60);
  const s = chatSecondsLeft % 60;
  const el = document.getElementById('chat-countdown');
  if (el) el.textContent = m + ':' + String(s).padStart(2,'0');
  const bar = document.getElementById('chat-timer-bar');
  if (bar) {
    bar.style.width = (chatSecondsLeft / 210 * 100) + '%';
    bar.style.background = chatSecondsLeft < 30 ? 'linear-gradient(90deg,#C04060,#C4688A)' : '';
  }
}

function endChat() {
  // unsubscribe FIRST so our own delete doesn't re-trigger the meta listener
  if (window._chatMetaUnsub) { window._chatMetaUnsub(); window._chatMetaUnsub = null; }
  if (chatPartnerId) {
    const chatKey = [String(currentStudent.id), String(chatPartnerId)].sort().join('_');
    api('DELETE', '/chats/' + chatKey);
    if (chatUnsubscribe) { chatUnsubscribe(); chatUnsubscribe = null; }
  }
  const inp = document.getElementById('chat-input');
  if (inp) { inp.disabled = false; inp.placeholder = 'พิมพ์ข้อความ...'; inp.value = ''; }
  chatPartnerId = null; matchedPartner = null; chatMessages = [];
  showToast('⏱ หมดเวลาแชท — แชทถูกลบแล้ว');
  friendDeck = [];
  showFriendsView('swipe');
}

function closeChatView() {
  clearInterval(chatTimerInterval);
  if (chatUnsubscribe) { chatUnsubscribe(); chatUnsubscribe = null; }
  if (window._chatMetaUnsub) { window._chatMetaUnsub(); window._chatMetaUnsub = null; }
  const inp = document.getElementById('chat-input');
  if (inp) { inp.disabled = false; inp.placeholder = 'พิมพ์ข้อความ...'; }
  showFriendsView('swipe');
}

function showFriendsView(view) {
  const swipe = document.getElementById('friends-swipe-view');
  if (swipe) swipe.style.display = 'flex';

  const matchEl = document.getElementById('friends-match-view');
  if (matchEl) matchEl.style.display = view === 'match' ? 'flex' : 'none';

  const chatEl = document.getElementById('friends-chat-view');
  if (chatEl) {
    chatEl.style.display = view === 'chat' ? 'flex' : 'none';
    if (view === 'chat') {
      chatEl.style.flexDirection = 'column';
      chatEl.style.zIndex = '99999';
    }
  }

  if (view === 'swipe') {
    clearInterval(chatTimerInterval);
    renderFriendStack();
  }
}

/* ══ EXPOSE GLOBALS (required for type="module") ══ */
Object.assign(window, {
  switchStudentTab, updateProfilePage, renderStudentShop,
  switchAdminTab, renderAdminOnline, renderAdminChats, renderAdminStats, renderAdminShop, deleteAdminChat, adminAddShopItem, adminDeleteShopItem,
  renderBPAdminList, adminBPXP, adminBPXPInput, refreshBPQueue, adminBPDone, adminBPDelete,

  smartLogin, mainBack, showRegister, adminTap, rDirectRegister, togglePwVis, goRegStep2,
  sPinPress, sPinDel, sPinClear,
  rPinPress, rPinDel, rPinClear, rGoPin, rDoRegister,
  aPinPress, aPinDel, aPinClear, aDoLogin,
  logout, renderAdmin, setFilter, resetAll, resetFriendData,
  saveDeadline, toggleDeadlineActive, exportCSV,
  openCtx, closeCtx, ctxPresent, ctxAbsent, ctxReset, ctxDelete, ctxEditName, adminSaveEditName, adminCloseEditModal,
  openEditName, closeEditModal, saveEditName,
  handleAvatarUpload, handleProfilePhotoChange,
  showStep, sGoPin, sBack, rBack, switchMode,
  adminToggle, updateStats, showStudentScreen, showTeacherScreen, applyTeacherMode,
  initFriendsPage, swipeCard, showMatch, closeMatchView, openMatchChat, sendChatMessage, closeChatView, endChat
});
