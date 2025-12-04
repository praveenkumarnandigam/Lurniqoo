(function () {
  'use strict';

  /* ---------- Helpers ---------- */
  function el(id) { return document.getElementById(id); }
  function q(sel, root) { return (root || document).querySelector(sel); }
  function qa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function safeJSONParse(s) { try { return JSON.parse(s); } catch (e) { return null; } }

  // Detect mobile (simple)
  var IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  /* ---------- Storage helpers ---------- */
  var STORAGE_KEY = 'lurniqo_subject_urls_v1';

  function loadStoredMap() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY) || '{}';
      var parsed = safeJSONParse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
      console.error('loadStoredMap error', e);
      return {};
    }
  }

  function saveStoredMap(map) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map || {}));
    } catch (e) {
      console.error('saveStoredMap error', e);
      alert('Failed to save data. Storage may be full or blocked.');
    }
  }

  // Make a safe backup string (returns string)
  function makeBackupString() {
    return localStorage.getItem(STORAGE_KEY) || '{}';
  }

  /* ---------- Drive URL helpers ---------- */
  // Convert various google drive forms to direct-download or view depending on platform
  function extractDriveId(url) {
    if (!url) return null;
    var m = String(url).match(/\/d\/([a-zA-Z0-9_-]{5,})/) || String(url).match(/[?&]id=([a-zA-Z0-9_-]{5,})/);
    return m ? m[1] : null;
  }

  function toDirectDownload(url) {
    var id = extractDriveId(url);
    return id ? 'https://drive.google.com/uc?export=download&id=' + id : url;
  }

  function toViewLink(url) {
    var id = extractDriveId(url);
    return id ? 'https://drive.google.com/file/d/' + id + '/view?usp=sharing' : url;
  }

  // Provide the appropriate url for current device:
  // - Desktop: direct-download where possible
  // - Mobile: file/d/ID/view so Drive app/browser opens preview properly
  function browserSafeDownloadUrl(url) {
    if (!url) return url;
    // If it's a drive link, choose view on mobile
    var id = extractDriveId(url);
    if (id) {
      return IS_MOBILE ? toViewLink(url) : toDirectDownload(url);
    }
    // non-drive: return as-is
    return url;
  }

  /* ---------- Default subjects (placeholders) ---------- */
  var DEFAULT_SUBJECTS = (function () {
    function d(u) { return toDirectDownload(u); } // store as direct by default (we will adapt at download time)
    return {
      'AIML|1st|1': {
        'Mathematics-1': d('https://drive.google.com/file/d/1uH1re21YAQyXEzBeHKB_0xFzTcUFNZoz/view?usp=drive_link'),
        'Physics': d('https://drive.google.com/file/d/1OaAwotmOL-0Va9M7tJ2xlawQlJFES6xl/view?usp=drive_link'),
        'BEE': d('https://drive.google.com/file/d/1aMTRzvd2ipUHIqIcLGbT8FGvkZ0Cr8c8/view?usp=drive_link'),
        'EG': d('https://drive.google.com/file/d/1Ml578a5rIwh_ukqNt40p4S1gQb0wZan6/view?usp=drive_link'),
        'C': d('https://drive.google.com/file/d/1UVWXY56789abcdef01234/view?usp=sharing')
      }
    };
  })();

  // Merge defaults with stored
  var storedMap = loadStoredMap();
  var SUBJECT_URLS = {};
  Object.keys(DEFAULT_SUBJECTS).forEach(function (k) { SUBJECT_URLS[k] = Object.assign({}, DEFAULT_SUBJECTS[k]); });
  Object.keys(storedMap).forEach(function (k) { SUBJECT_URLS[k] = Object.assign(SUBJECT_URLS[k] || {}, storedMap[k] || {}); });

  /* ---------- Utilities for key formats ---------- */
  function normalizeYearLabel(y) {
    if (!y) return y;
    y = String(y).trim();
    if (/^\d$/.test(y)) {
      if (y === '1') return '1st';
      if (y === '2') return '2nd';
      if (y === '3') return '3rd';
      return y + 'th';
    }
    return y;
  }

  function storageKeyFor(dept, year, sem) {
    return dept + '|' + normalizeYearLabel(year) + '|' + String(sem);
  }

  /* ---------- State & view helpers ---------- */
  var state = { currentDept: null, yearLabel: null, semester: null, mode: 'home', programmaticScroll: false, inAnim: false };

  function setActiveView(id) {
    var allViews = ['view-home', 'view-anu', 'view-btech', 'view-dept-year', 'view-dept-sem', 'view-dept-subjects'];
    allViews.forEach(function (v) {
      var elv = document.getElementById(v);
      if (!elv) return;
      elv.classList.toggle('active', v === id);
    });

    if (id === 'view-home') {
      document.body.classList.remove('mode-anu');
      var logo = document.getElementById('homeLogo') || document.querySelector('.logo-tile');
      if (logo) {
        logo.style.transition = 'opacity .35s, transform .35s, visibility .35s';
        logo.style.opacity = '1';
        logo.style.visibility = 'visible';
        logo.style.transform = '';
      }
      var topbar = document.getElementById('topbar');
      if (topbar) {
        topbar.style.opacity = '';
        topbar.style.transform = '';
        topbar.style.pointerEvents = '';
      }
    } else {
      if (id === 'view-anu' || id === 'view-btech' || id.startsWith('view-dept')) {
        document.body.classList.add('mode-anu');
        var logo = document.getElementById('homeLogo') || document.querySelector('.logo-tile');
        if (logo) {
          logo.style.opacity = '0';
          logo.style.visibility = 'hidden';
        }
      }
    }
  }

  function scrollToEl(elm) {
    if (!elm) return;
    state.programmaticScroll = true;
    try { elm.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { elm.scrollIntoView(true); }
    setTimeout(function () { state.programmaticScroll = false; }, 600);
  }

  /* ---------- Flow functions ---------- */
  function animateToANU() {
    if (state.inAnim || state.mode !== 'home') return;
    state.inAnim = true;
    document.body.classList.add('transitioning');
    setTimeout(function () {
      document.body.classList.remove('transitioning');
      document.body.classList.add('mode-anu');
      setActiveView('view-anu');
      state.mode = 'anu';
      scrollToEl(document.querySelector('#view-anu .programs'));
      state.inAnim = false;
    }, 480);
  }

  function goBTech() {
    if (state.inAnim) return;
    document.body.classList.add('mode-anu');
    setActiveView('view-btech');
    state.mode = 'btech';
    scrollToEl(document.querySelector('#view-btech .dep-grid'));
  }

  function openDeptYear(dept) {
    state.currentDept = dept;
    var heading = el('dept-year-heading');
    if (heading) heading.textContent = dept + ' — Select Year';
    setActiveView('view-dept-year');
    state.mode = 'dept-year';
    scrollToEl(document.querySelector('#view-dept-year .choice-form'));
  }

  function openDeptSem() {
    var yearLab = el('dept-year-label');
    if (yearLab) yearLab.textContent = state.yearLabel + ' Year';
    var head = el('dept-sem-heading');
    if (head) head.textContent = state.currentDept || 'Department';
    setActiveView('view-dept-sem');
    state.mode = 'dept-sem';
    scrollToEl(document.querySelector('#view-dept-sem .choice-form'));
  }

  function openDeptSubjects() {
    var title = el('subjects-title');
    if (title) title.textContent = (state.currentDept || '') + ' — ' + (state.yearLabel || '') + ' Year — Semester ' + (state.semester || '') + ' — Subjects';
    setActiveView('view-dept-subjects');
    state.mode = 'dept-subjects';
    populateSubjectsGrid();
    scrollToEl(document.querySelector('#view-dept-subjects .subject-grid'));
  }

  function backToBTech() {
    setActiveView('view-btech');
    state.mode = 'btech';
    scrollToEl(document.querySelector('#view-btech .dep-grid'));
  }

  /* ---------- Subjects UI ---------- */
  function populateSubjectsGrid() {
    var grid = el('subjects-grid');
    if (!grid) return;
    grid.innerHTML = '';
    var key = (state.currentDept || '') + '|' + (state.yearLabel || '') + '|' + (state.semester || '');
    var subjects = SUBJECT_URLS[key] || null;
    if (!subjects || Object.keys(subjects).length === 0) {
      var note = document.createElement('div');
      note.style.color = 'var(--muted)';
      note.style.textAlign = 'center';
      note.textContent = 'No subjects configured for ' + key + '. Use Manage files to add.';
      grid.appendChild(note);
      return;
    }
    Object.keys(subjects).forEach(function (sub) {
      var btn = document.createElement('button');
      btn.className = 'subject-card';
      btn.setAttribute('data-subject', sub);
      btn.textContent = sub;
      grid.appendChild(btn);
    });
  }

  function triggerDownload(url, filename) {
    if (!url) { alert('No download URL'); return; }
    var safeUrl = browserSafeDownloadUrl(url);
    try {
      var a = document.createElement('a');
      a.href = safeUrl;
      a.download = filename || '';
      a.rel = 'noopener';
      // On mobile, do not set target=_blank if we want Drive app to handle view link
      if (!IS_MOBILE) a.target = '_self';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert('Unable to start download: ' + (e && e.message ? e.message : 'unknown error'));
    }
  }

  /* ---------- Delegation & event wiring ---------- */
  document.addEventListener('click', function (ev) {
    var t = ev.target;
    while (t && t !== document) {
      // prevent default for empty anchors used as buttons
      if (t.matches && t.matches('a[href="#"]')) { ev.preventDefault(); break; }
      t = t.parentNode;
    }
  });

  // Home/portal buttons
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t) return;

    if (t.matches('#btn-anu')) { e.preventDefault(); animateToANU(); return; }
    if (t.matches('#btn-jntuk')) { e.preventDefault(); alert('JNTUK — Coming soon'); return; }
    if (t.matches('#btn-rvrjc')) { e.preventDefault(); alert('RVRJC — Coming soon'); return; }

    if (t.matches('#open-btech')) { e.preventDefault(); goBTech(); return; }
    if (t.matches('#open-mtech')) { e.preventDefault(); alert('M.Tech — coming soon'); return; }

    if (t.matches('#back-anu')) { e.preventDefault(); setActiveView('view-anu'); state.mode = 'anu'; scrollToEl(document.querySelector('#view-anu .programs')); return; }

    if (t.matches('.dep-btn')) { e.preventDefault(); var dept = (t.textContent || '').trim(); var supported = ['AIML', 'CSE', 'CY', 'DS', 'ME', 'CE', 'EEE', 'ECE']; if (supported.indexOf(dept) === -1) { alert(dept + ' — coming soon'); return; } openDeptYear(dept); return; }

    if (t.matches('#back-btech')) { e.preventDefault(); backToBTech(); return; }
    if (t.matches('#back-dept-year')) { e.preventDefault(); openDeptYear(state.currentDept); return; }
    if (t.matches('#back-dept-sem')) { e.preventDefault(); openDeptSem(); return; }

    if (t.matches('.subject-card')) {
      e.preventDefault();
      var sub = t.getAttribute('data-subject');
      var key = (state.currentDept || '') + '|' + (state.yearLabel || '') + '|' + (state.semester || '');
      var url = (SUBJECT_URLS[key] && SUBJECT_URLS[key][sub]) || null;
      if (!url) { alert('No download link set for ' + sub + ' (' + key + ').'); return; }
      triggerDownload(url, sub + '.pdf');
      return;
    }
  });

  // topbar nav simple routing
  document.addEventListener('click', function (e) {
    var a = e.target;
    if (a && a.matches && a.matches('.nav a')) {
      var route = a.getAttribute('data-route');
      if (!route || route === 'home') { e.preventDefault(); setActiveView('view-home'); state.mode = 'home'; window.scrollTo(0, 0); return; }
      e.preventDefault(); alert((route || 'Page').toUpperCase() + ' — coming soon');
    }
  });

  // sidebar minimal routing
  document.addEventListener('click', function (e) {
    var a = e.target;
    if (!a) return;
    if (a.matches && (a.matches('#sidebar .side-nav a') || a.matches('#sidebar .brand'))) {
      var route = a.getAttribute('data-route');
      if (!route || route === 'home') { e.preventDefault(); setActiveView('view-home'); state.mode = 'home'; window.scrollTo(0, 0); return; }
      e.preventDefault(); alert((route || 'Page').toUpperCase() + ' — coming soon');
    }
  });

  // Year form submit
  var yearForm = el('dept-year-form');
  if (yearForm) {
    yearForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var chosen = yearForm.querySelector('input[name="year"]:checked');
      if (!chosen) { alert('Please select a year'); return; }
      var map = { '1': '1st', '2': '2nd', '3': '3rd', '4': '4th' };
      state.yearLabel = map[chosen.value] || (chosen.value + 'th');
      openDeptSem();
    });
  }

  // Sem form submit
  var semForm = el('dept-sem-form');
  if (semForm) {
    semForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var chosen = semForm.querySelector('input[name="semester"]:checked');
      if (!chosen) { alert('Please select a semester'); return; }
      state.semester = chosen.value;
      openDeptSubjects();
    });
  }

  // on scroll: go back to home if scrolled up
  window.addEventListener('scroll', function () {
    if (state.programmaticScroll || state.inAnim) return;
    if (state.mode !== 'home' && window.scrollY <= 20) { setActiveView('view-home'); state.mode = 'home'; }
  });

  var yearEl = el('year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Robust Admin CRUD & UI ---------- */
  var adminModal = el('admin-modal');
  var adminOpenBtn = el('open-admin');
  var adminCloseBtn = el('close-admin');
  var adminAddBtn = el('admin-add');
  var adminImportBtn = el('admin-import');
  var adminExportBtn = el('admin-export');
  var adminDept = el('admin-dept');
  var adminYear = el('admin-year');
  var adminSem = el('admin-sem');
  var adminSubject = el('admin-subject');
  var adminUrl = el('admin-url');
  var adminListContainer = el('admin-list-contents');

  function showAdmin(open) {
    if (!adminModal) return;
    adminModal.setAttribute('aria-hidden', open ? 'false' : 'true');
    adminModal.style.display = open ? 'grid' : 'none';
    if (open) setTimeout(renderAdminListRobust, 40);
  }

  if (adminOpenBtn) adminOpenBtn.addEventListener('click', function (e) { e.preventDefault(); showAdmin(true); });
  if (adminCloseBtn) adminCloseBtn.addEventListener('click', function (e) { e.preventDefault(); showAdmin(false); });

  // Remove entry flexible: tries exact key then fallback candidates
  function removeEntryFlexible(storageKey, subjectName) {
    var map = loadStoredMap();
    // exact key removal
    if (map[storageKey] && Object.prototype.hasOwnProperty.call(map[storageKey], subjectName)) {
      delete map[storageKey][subjectName];
      if (Object.keys(map[storageKey]).length === 0) delete map[storageKey];
      saveStoredMap(map);
      // update in-memory
      if (SUBJECT_URLS[storageKey] && SUBJECT_URLS[storageKey][subjectName]) delete SUBJECT_URLS[storageKey][subjectName];
      return true;
    }
    // fallback: find candidate keys by dept+sem ignoring year label format
    var parts = storageKey.split('|');
    var dept = parts[0] || '';
    var sem = parts[2] || '';
    var removed = false;
    Object.keys(map).forEach(function (k) {
      var kp = k.split('|');
      if (kp[0] === dept && kp[2] === sem) {
        if (map[k] && Object.prototype.hasOwnProperty.call(map[k], subjectName)) {
          delete map[k][subjectName];
          removed = true;
          if (Object.keys(map[k]).length === 0) delete map[k];
        }
      }
    });
    if (removed) {
      saveStoredMap(map);
      // update in-memory SUBJECT_URLS
      Object.keys(SUBJECT_URLS).forEach(function (k2) {
        if (SUBJECT_URLS[k2] && Object.prototype.hasOwnProperty.call(SUBJECT_URLS[k2], subjectName)) {
          delete SUBJECT_URLS[k2][subjectName];
        }
      });
    }
    return removed;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (m) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]; });
  }

  function renderAdminListRobust() {
    if (!adminListContainer) return;
    adminListContainer.innerHTML = '';
    var combined = Object.assign({}, DEFAULT_SUBJECTS, loadStoredMap());
    var keys = Object.keys(combined).sort();
    if (keys.length === 0) { adminListContainer.textContent = 'No entries yet'; return; }
    keys.forEach(function (k) {
      var block = combined[k] || {};
      Object.keys(block).forEach(function (sub) {
        var row = document.createElement('div');
        row.className = 'admin-entry';
        var left = document.createElement('div');
        left.innerHTML = '<strong>' + escapeHtml(sub) + '</strong><br><small>' + escapeHtml(k.replace(/\|/g, ' • ')) + '</small>';
        var right = document.createElement('div');
        var openBtn = document.createElement('button'); openBtn.textContent = 'Open';
        openBtn.addEventListener('click', function () { window.open(block[sub], '_blank'); });
        var delBtn = document.createElement('button'); delBtn.textContent = 'Delete';
        delBtn.addEventListener('click', function () {
          if (!confirm('Delete "' + sub + '" from ' + k + '?')) return;
          var ok = removeEntryFlexible(k, sub);
          if (!ok) alert('Could not find entry to delete. Consider Exporting JSON and sending it for repair.');
          renderAdminListRobust();
        });
        right.appendChild(openBtn); right.appendChild(delBtn);
        row.appendChild(left); row.appendChild(right);
        adminListContainer.appendChild(row);
      });
    });
  }

  // Add / Save
  if (adminAddBtn) {
    adminAddBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var dept = (adminDept ? adminDept.value : 'AIML') || 'AIML';
      var year = (adminYear ? adminYear.value : '1') || '1';
      var sem = (adminSem ? adminSem.value : '1') || '1';
      var subject = (adminSubject ? (adminSubject.value || '').trim() : '').trim();
      var url = (adminUrl ? (adminUrl.value || '').trim() : '').trim();
      if (!subject || !url) { alert('Provide subject name and URL'); return; }
      var key = storageKeyFor(dept, year, sem);
      var map = loadStoredMap();
      if (!map[key]) map[key] = {};
      // store as direct-download (consistent). Download function will adapt for mobile/desktop.
      map[key][subject] = toDirectDownload(url);
      saveStoredMap(map);
      SUBJECT_URLS[key] = Object.assign(SUBJECT_URLS[key] || {}, map[key]);
      if (adminSubject) adminSubject.value = '';
      if (adminUrl) adminUrl.value = '';
      renderAdminListRobust();
      alert('Saved: ' + subject + ' → ' + dept + ' ' + normalizeYearLabel(year) + ' • Sem ' + sem);
    });
  }

  if (adminExportBtn) {
    adminExportBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var combined = Object.assign({}, DEFAULT_SUBJECTS, loadStoredMap());
      var out = JSON.stringify(combined, null, 2);
      window.prompt('Copy JSON (Ctrl+C then Enter)', out);
    });
  }

  if (adminImportBtn) {
    adminImportBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var paste = window.prompt('Paste JSON exported from another device');
      if (!paste) return;
      try {
        var parsed = JSON.parse(paste);
        if (!parsed || typeof parsed !== 'object') throw new Error('Invalid JSON');
        var cur = loadStoredMap();
        Object.keys(parsed).forEach(function (k) { cur[k] = Object.assign(cur[k] || {}, parsed[k]); });
        saveStoredMap(cur);
        Object.keys(cur).forEach(function (k2) { SUBJECT_URLS[k2] = Object.assign(SUBJECT_URLS[k2] || {}, cur[k2]); });
        renderAdminListRobust();
        alert('Imported OK');
      } catch (err) {
        alert('Invalid JSON: ' + (err && err.message ? err.message : 'parse error'));
      }
    });
  }

  if (adminModal) {
    adminModal.addEventListener('click', function (ev) {
      if (ev.target === adminModal) showAdmin(false);
    });
  }

  // Initial render hook if admin opens
  if (adminOpenBtn) adminOpenBtn.addEventListener('click', function () { setTimeout(renderAdminListRobust, 40); });

  // Expose debug helpers
  window.Lurniqo = Object.assign({}, window.Lurniqo || {}, {
    SUBJECT_URLS: SUBJECT_URLS,
    reloadSubjects: populateSubjectsGrid,
    backupLocal: function () { return makeBackupString(); },
    normalizeStorageKeys: function () {
      // utility to normalize year labels (1 -> 1st etc), runs in-place
      var raw = loadStoredMap();
      var updated = {};
      function yearLabel(n) {
        if (n === '1') return '1st';
        if (n === '2') return '2nd';
        if (n === '3') return '3rd';
        return n + 'th';
      }
      Object.keys(raw).forEach(function (k) {
        var parts = k.split('|');
        if (parts.length === 3) {
          var dept = parts[0].trim();
          var y = parts[1].trim();
          var sem = parts[2].trim();
          if (/^\d$/.test(y)) y = yearLabel(y);
          var newKey = [dept, y, sem].join('|');
          updated[newKey] = Object.assign(updated[newKey] || {}, raw[k]);
        } else updated[k] = raw[k];
      });
      saveStoredMap(Object.assign({}, updated));
      alert('Normalization complete. Reload to see changes.');
    }
  });

  // initial view
  setActiveView('view-home');

})();
