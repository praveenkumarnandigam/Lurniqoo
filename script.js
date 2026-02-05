// script.js — now with ADMIN login (client-side)
(function () {
  'use strict';

  // --- helpers
  function el(id) { return document.getElementById(id); }
  function safeJSONParse(s) { try { return JSON.parse(s); } catch (e) { return null; } }
  function driveUrl(input){
  var s = String(input || '').trim();
  var m = s.match(/\/d\/([^/]+)/) || s.match(/[?&]id=([^&]+)/);
  return m
    ? 'https://drive.google.com/file/d/' + m[1] + '/preview?rm=minimal'
    : s;
}


  // --- storage
  var STORAGE_KEY = 'lurniqo_subject_urls_v1';
  function loadStoredMap(){ try { var r = localStorage.getItem(STORAGE_KEY); return r ? safeJSONParse(r) || {} : {}; } catch(e){ return {}; } }
  function saveStoredMap(m){ try { localStorage.setItem(STORAGE_KEY, JSON.stringify(m || {})); } catch(e){ console.error(e); } }

  // --- default placeholders (AIML and copied)
  var DEFAULT_SUBJECTS = (function(){
    var set = {
      'Mathematics-1': driveUrl('https://drive.google.com/file/d/1uH1re21YAQyXEzBeHKB_0xFzTcUFNZoz/view?usp=drive_link'),
      'Physics': driveUrl('https://drive.google.com/file/d/1OaAwotmOL-0Va9M7tJ2xlawQlJFES6xl/view?usp=drive_link'),
      'BEE': driveUrl('https://drive.google.com/file/d/1aMTRzvd2ipUHIqIcLGbT8FGvkZ0Cr8c8/view?usp=drive_link'),
      'EG': driveUrl('https://drive.google.com/file/d/1Ml578a5rIwh_ukqNt40p4S1gQb0wZan6/view?usp=drive_link'),
      'C': driveUrl('https://drive.google.com/file/d/1RO544NsUs-2GQMEeMcTbx6QwwPJ5hAvZ/view?usp=drive_link')
    };
    return {
      'AIML|1st|1': Object.assign({}, set),
      'CSE|1st|1' : Object.assign({}, set),
      'CY|1st|1'  : Object.assign({}, set),
      'DS|1st|1'  : Object.assign({}, set)
    };
  })();

  // --- SUBJECT_URLS runtime (merge default + stored)
  var SUBJECT_URLS = {};
  var storedMap = loadStoredMap();
  Object.keys(DEFAULT_SUBJECTS).forEach(function(k){ SUBJECT_URLS[k] = Object.assign({}, DEFAULT_SUBJECTS[k]); });
  Object.keys(storedMap).forEach(function(k){ SUBJECT_URLS[k] = Object.assign(SUBJECT_URLS[k] || {}, storedMap[k]); });

  // --- app state
  var state = { currentDept:null, yearLabel:null, semester:null, mode:'home', programmaticScroll:false, inAnim:false };

  // --- UI helpers
  function setActiveView(id) {
  // list of all view ids (keeps earlier behavior)
  var allViews = ['view-home','view-anu','view-btech','view-dept-year','view-dept-sem','view-dept-subjects'];
  allViews.forEach(function(v){
    var el = document.getElementById(v);
    if (!el) return;
    el.classList.toggle('active', v === id);
  });

  // If we're returning to home — clear ANU mode and restore centered logo
  if (id === 'view-home') {
    document.body.classList.remove('mode-anu');

    // restore logo tile visibility and transforms (defensive)
    var logo = document.getElementById('homeLogo') || document.querySelector('.logo-tile');
    if (logo) {
      logo.style.transition = 'opacity .35s, transform .35s, visibility .35s';
      logo.style.opacity = '1';
      logo.style.visibility = 'visible';
      // If previous code applied inline transform, reset it:
      logo.style.transform = '';
    }

    // restore topbar (in case it was hidden)
    var topbar = document.getElementById('topbar');
    if (topbar) {
      topbar.style.opacity = '';
      topbar.style.transform = '';
      topbar.style.pointerEvents = '';
    }
  } else {
    // Entering ANU-related views — make sure mode class is applied so sidebar behavior works.
    if (id === 'view-anu' || id === 'view-btech' || id.startsWith('view-dept')) {
      document.body.classList.add('mode-anu');
      // additionally hide centered logo (defensive)
      var logo = document.getElementById('homeLogo') || document.querySelector('.logo-tile');
      if (logo) {
        logo.style.opacity = '0';
        logo.style.visibility = 'hidden';
        // optional: move it away if you used transform-based animation
        // logo.style.transform = 'translate(-44vw,-18vh) scale(.38)'; 
      }
    }
  }
}

  function scrollToEl(elm){ if(!elm) return; state.programmaticScroll=true; try{ elm.scrollIntoView({behavior:'smooth', block:'start'}); }catch(e){ elm.scrollIntoView(true);} setTimeout(function(){ state.programmaticScroll=false; },600); }

  // --- nav flows (same as before)
  function animateToANU(){ if(state.inAnim||state.mode!=='home') return; state.inAnim=true; document.body.classList.add('transitioning'); setTimeout(function(){ document.body.classList.remove('transitioning'); document.body.classList.add('mode-anu'); setActiveView('view-anu'); state.mode='anu'; scrollToEl(document.querySelector('#view-anu .programs')); state.inAnim=false; },480); }
  function goBTech(){ if(state.inAnim) return; document.body.classList.add('mode-anu'); setActiveView('view-btech'); state.mode='btech'; scrollToEl(document.querySelector('#view-btech .dep-grid')); }
  function openDeptYear(dept){ state.currentDept = dept; var h = document.getElementById('dept-year-heading'); if(h) h.textContent = dept + ' — Select Year'; setActiveView('view-dept-year'); state.mode='dept-year'; scrollToEl(document.querySelector('#view-dept-year .choice-form')); }
  function openDeptSem(){ var lab = document.getElementById('dept-year-label'); if(lab) lab.textContent = state.yearLabel + ' Year'; var head = document.getElementById('dept-sem-heading'); if(head) head.textContent = state.currentDept; setActiveView('view-dept-sem'); state.mode='dept-sem'; scrollToEl(document.querySelector('#view-dept-sem .choice-form')); }
  function openDeptSubjects(){ var t = document.getElementById('subjects-title'); if(t) t.textContent = state.currentDept + ' — ' + state.yearLabel + ' Year — Semester ' + state.semester + ' — Subjects'; setActiveView('view-dept-subjects'); state.mode='dept-subjects'; populateSubjectsGrid(); scrollToEl(document.querySelector('#view-dept-subjects .subject-grid')); }
  function backToBTech(){ setActiveView('view-btech'); state.mode='btech'; scrollToEl(document.querySelector('#view-btech .dep-grid')); }

  // --- subjects UI
  function populateSubjectsGrid(){
    var grid = document.getElementById('subjects-grid');
    if(!grid) return;
    grid.innerHTML = '';
    var key = (state.currentDept||'') + '|' + (state.yearLabel||'') + '|' + (state.semester||'');
    var subjects = SUBJECT_URLS[key] || null;
    if(!subjects || Object.keys(subjects).length === 0){
      var note = document.createElement('div'); note.style.color='var(--muted)'; note.style.textAlign='center'; note.textContent = 'No subjects configured for ' + key + '. Use ADMIN to add.'; grid.appendChild(note); return;
    }
    Object.keys(subjects).forEach(function(sub){
      var btn = document.createElement('button'); btn.className='subject-card'; btn.setAttribute('data-subject', sub); btn.textContent = sub; grid.appendChild(btn);
    });
  }
  function triggerDownload(url, filename){
    if(!url){ alert('No URL'); return; } var a=document.createElement('a'); a.href=url; a.download=filename||''; a.rel='noopener'; a.target='_self'; document.body.appendChild(a); a.click(); a.remove();
  }

  // --- delegated click helper
  function delegateClick(selector, handler){ document.addEventListener('click', function(ev){ var t=ev.target; while(t&&t!==document){ if(t.matches&&t.matches(selector)){ handler(ev,t); return } t=t.parentNode; } }); }
  delegateClick('a[href="#"]', function(e){ e.preventDefault(); });

  // --- main UI wiring
  delegateClick('#btn-anu', function(e){ e.preventDefault(); animateToANU(); });
  delegateClick('#btn-jntuk', function(e){ e.preventDefault(); alert('JNTUK — Coming soon'); });
  delegateClick('#btn-rvrjc', function(e){ e.preventDefault(); alert('RVRJC — Coming soon'); });
  delegateClick('#open-btech', function(e){ e.preventDefault(); goBTech(); });
  delegateClick('#open-mtech', function(e){ e.preventDefault(); alert('M.Tech — coming soon'); });
  delegateClick('#back-anu', function(e){ e.preventDefault(); setActiveView('view-anu'); state.mode='anu'; scrollToEl(document.querySelector('#view-anu .programs')); });
  delegateClick('.dep-btn', function(e, btn){ e.preventDefault(); var dept=(btn.textContent||'').trim(); openDeptYear(dept); });
  delegateClick('#back-btech', function(e){ e.preventDefault(); backToBTech(); });
  delegateClick('#back-dept-year', function(e){ e.preventDefault(); openDeptYear(state.currentDept); });
  delegateClick('#back-dept-sem', function(e){ e.preventDefault(); openDeptSem(); });

  var yearForm = el('dept-year-form'); if(yearForm) yearForm.addEventListener('submit', function(e){ e.preventDefault(); var chosen = yearForm.querySelector('input[name="year"]:checked'); if(!chosen){ alert('Please select a year'); return } var map={'1':'1st','2':'2nd','3':'3rd','4':'4th'}; state.yearLabel = map[chosen.value] || (chosen.value + 'th'); openDeptSem(); });
  var semForm = el('dept-sem-form'); if(semForm) semForm.addEventListener('submit', function(e){ e.preventDefault(); var chosen = semForm.querySelector('input[name="semester"]:checked'); if(!chosen){ alert('Please select a semester'); return } state.semester = chosen.value; openDeptSubjects(); });

const viewer = el('subject-viewer');
const viewerFrame = el('subject-viewer-frame');
const viewerTitle = el('subject-viewer-title');
const viewerClose = el('close-subject-viewer');

delegateClick('.subject-card', function(e, btn){
  e.preventDefault();

  const sub = btn.getAttribute('data-subject');
  const key =
    (state.currentDept||'') + '|' +
    (state.yearLabel||'') + '|' +
    (state.semester||'');

  const url = SUBJECT_URLS[key]?.[sub];
  if(!url){
    alert('No content available');
    return;
  }

  viewerTitle.textContent = sub;
  viewerFrame.src = url;
  viewer.setAttribute('aria-hidden','false');
});

if(viewerClose){
  viewerClose.addEventListener('click', function(){
    viewer.setAttribute('aria-hidden','true');
    viewerFrame.src = '';
  });
}

  window.addEventListener('scroll', function(){ if(state.programmaticScroll||state.inAnim) return; if(state.mode!=='home' && window.scrollY<=20){ setActiveView('view-home'); state.mode='home'; } });

  var yearEl = el('year'); if(yearEl) yearEl.textContent = new Date().getFullYear();

  // --- AUTH: credentials & session
  var ADMIN_USER = 'LURNIQOO';
  var ADMIN_PASS = '868684';
  var SESSION_KEY = 'lurniqo_admin_session';

  function isLoggedIn(){
    try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch(e){ return false; }
  }
  function setLoggedIn(val){
    try { if(val) sessionStorage.setItem(SESSION_KEY,'1'); else sessionStorage.removeItem(SESSION_KEY); } catch(e) {}
  }

  // --- login modal wiring
  var loginModal = el('login-modal');
  var loginOpenBtn = el('open-login');
  var loginCancel = el('login-cancel');
  var loginForm = el('login-form');
  var loginUser = el('login-user');
  var loginPass = el('login-pass');

  function showLogin(open){
    if(!loginModal) return;
    loginModal.setAttribute('aria-hidden', open ? 'false' : 'true');
    loginModal.style.display = open ? 'grid' : 'none';
    if(open){ if(loginUser) loginUser.focus(); }
  }

  if(loginOpenBtn) loginOpenBtn.addEventListener('click', function(e){ e.preventDefault(); showLogin(true); });

  if(loginCancel) loginCancel.addEventListener('click', function(e){ e.preventDefault(); showLogin(false); });

  if(loginForm){
    loginForm.addEventListener('submit', function(e){
      e.preventDefault();
      var u = (loginUser.value||'').trim();
      var p = (loginPass.value||'').trim();
      // Check exact match (case-sensitive username)
      if(u === ADMIN_USER && p === ADMIN_PASS){
        setLoggedIn(true);
        showLogin(false);
        openAdminModal(); // open admin panel immediately after success
      } else {
        alert('Invalid credentials');
      }
    });
  }

  // --- ADMIN panel (gated)
  var adminModal = el('admin-modal');
  var adminClose = el('close-admin');
  var adminLogout = el('admin-logout');
  var adminAdd = el('admin-add');
  var adminImport = el('admin-import');
  var adminExport = el('admin-export');
  var adminDept = el('admin-dept');
  var adminYear = el('admin-year');
  var adminSem = el('admin-sem');
  var adminSubject = el('admin-subject');
  var adminUrl = el('admin-url');
  var adminList = el('admin-list-contents');

  function openAdminModal(){
    if(!isLoggedIn()){ showLogin(true); return; }
    if(!adminModal) return;
    adminModal.setAttribute('aria-hidden','false');
    adminModal.style.display = 'grid';
    renderAdminList();
  }
  function closeAdminModal(){ if(!adminModal) return; adminModal.setAttribute('aria-hidden','true'); adminModal.style.display = 'none'; }

  if(adminClose) adminClose.addEventListener('click', function(e){ e.preventDefault(); closeAdminModal(); });
  if(adminLogout) adminLogout.addEventListener('click', function(e){ e.preventDefault(); if(confirm('Logout admin?')){ setLoggedIn(false); closeAdminModal(); alert('Logged out'); } });

  // If user clicks ADMIN button and already logged in, open admin directly
  if(loginOpenBtn){
    loginOpenBtn.addEventListener('click', function(e){
      if(isLoggedIn()){ e.preventDefault(); openAdminModal(); }
    });
  }

  // admin CRUD functions (same as previous)
  function storageKeyFor(dept, year, sem){ return dept + '|' + year + '|' + sem; }

  function addOrUpdateEntry(dept, year, sem, subjectName, url){
    if(!dept||!year||!sem||!subjectName||!url){ alert('Fill all fields'); return; }
    var key = storageKeyFor(dept, year, sem);
    var stored = loadStoredMap();
    if(!stored[key]) stored[key] = {};
    stored[key][subjectName] = driveUrl(url);
    saveStoredMap(stored);
    SUBJECT_URLS[key] = Object.assign(SUBJECT_URLS[key] || {}, stored[key]);
    renderAdminList();
    alert('Saved: ' + subjectName + ' → ' + dept + ' ' + year + ' Sem ' + sem);
  }

  function removeEntry(key, subject){
    var stored = loadStoredMap();
    if(!stored[key]) return;
    if(stored[key][subject]) delete stored[key][subject];
    if(Object.keys(stored[key]).length === 0) delete stored[key];
    saveStoredMap(stored);
    if(SUBJECT_URLS[key] && SUBJECT_URLS[key][subject]) delete SUBJECT_URLS[key][subject];
    renderAdminList();
  }

  function renderAdminList(){
    if(!adminList) return;
    adminList.innerHTML = '';
    var combined = Object.assign({}, DEFAULT_SUBJECTS, loadStoredMap());
    var keys = Object.keys(combined).sort();
    if(keys.length === 0){ adminList.textContent = 'No entries yet'; return; }
    keys.forEach(function(k){
      var parts = k.split('|'); var dept = parts[0]||'?'; var year = parts[1]||'?'; var sem = parts[2]||'?';
      var block = combined[k] || {};
      Object.keys(block).forEach(function(sub){
        var row = document.createElement('div'); row.className = 'admin-entry';
        var left = document.createElement('div'); left.innerHTML = '<strong>' + escapeHtml(sub) + '</strong><br><small>' + escapeHtml(dept) + ' • ' + escapeHtml(year) + ' • Sem ' + escapeHtml(sem) + '</small>';
        var right = document.createElement('div');
        var openBtn = document.createElement('button'); openBtn.textContent='Open'; openBtn.addEventListener('click', function(){ window.open(block[sub], '_blank'); });
        var delBtn = document.createElement('button'); delBtn.textContent='Delete'; delBtn.addEventListener('click', function(){ if(confirm('Delete ' + sub + '?')) removeEntry(k, sub); });
        right.appendChild(openBtn); right.appendChild(delBtn);
        row.appendChild(left); row.appendChild(right);
        adminList.appendChild(row);
      });
    });
  }

  if(adminAdd) adminAdd.addEventListener('click', function(e){ e.preventDefault(); var dept = adminDept ? adminDept.value : ''; var year = adminYear ? adminYear.value : ''; var sem = adminSem ? adminSem.value : ''; var sub = adminSubject ? (adminSubject.value||'').trim() : ''; var url = adminUrl ? (adminUrl.value||'').trim() : ''; if(!sub||!url){ alert('Provide subject name and URL'); return; } addOrUpdateEntry(dept, year, sem, sub, url); if(adminSubject) adminSubject.value=''; if(adminUrl) adminUrl.value=''; });

  if(adminExport) adminExport.addEventListener('click', function(e){ e.preventDefault(); var combined = Object.assign({}, DEFAULT_SUBJECTS, loadStoredMap()); var out = JSON.stringify(combined, null, 2); window.prompt('Copy JSON (Ctrl+C then Enter)', out); });

  if(adminImport) adminImport.addEventListener('click', function(e){ e.preventDefault(); var paste = window.prompt('Paste JSON exported from another device'); if(!paste) return; try { var parsed = JSON.parse(paste); if(!parsed||typeof parsed!=='object') throw new Error('Invalid'); var cur = loadStoredMap(); Object.keys(parsed).forEach(function(k){ cur[k] = Object.assign(cur[k]||{}, parsed[k]); }); saveStoredMap(cur); Object.keys(cur).forEach(function(k2){ SUBJECT_URLS[k2] = Object.assign(SUBJECT_URLS[k2]||{}, cur[k2]); }); renderAdminList(); alert('Imported OK'); } catch(err){ alert('Invalid JSON: ' + (err && err.message ? err.message : 'parse error')); } });

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]; }); }

  // expose debug hook read-only
  window.Lurniqo = Object.assign({}, window.Lurniqo||{}, { SUBJECT_URLS: SUBJECT_URLS, reloadSubjects: populateSubjectsGrid });

  // initial view
  setActiveView('view-home');

})();