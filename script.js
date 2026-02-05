(function () {
  'use strict';

  const el = (id) => document.getElementById(id);
  
  // --- STATE ---
  const state = { 
    currentDept: null, 
    yearLabel: null, 
    semester: null, 
    mode: 'home' 
  };

  // --- STORAGE LOGIC ---
  const STORAGE_KEY = 'lurniqo_data_v1';
  const getStoredData = () => JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  const saveStoredData = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  // Default Initial Data
  const DEFAULT_SUBJECTS = {
    'AIML|1st|1': { 'Mathematics-1': 'https://drive.google.com/file/d/1uH1re21YAQyXEzBeHKB_0xFzTcUFNZoz/view' },
    'CSE|1st|1': { 'Mathematics-1': 'https://drive.google.com/file/d/1uH1re21YAQyXEzBeHKB_0xFzTcUFNZoz/view' }
  };

  // --- NAVIGATION ---
  function setActiveView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = el(viewId);
    if (target) target.classList.add('active');

    // Handle Layout and Logo
    if (viewId === 'view-home') {
      document.body.classList.remove('mode-anu', 'transitioning');
      state.mode = 'home';
      const logo = el('main-logo');
      if (logo) { logo.style.opacity = '1'; logo.style.transform = ''; logo.style.visibility = 'visible'; }
    } else {
      document.body.classList.add('mode-anu');
    }
  }

  // --- GOOGLE DRIVE HELPER ---
  function getDirectLink(url) {
    const m = url.match(/\/d\/([^/]+)/);
    return m ? `https://drive.google.com/uc?export=view&id=${m[1]}` : url;
  }

  // --- UI HANDLERS ---
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-route]');
    if (t) {
      e.preventDefault();
      const route = t.getAttribute('data-route');
      if (route === 'home') setActiveView('view-home');
      else alert(route + " coming soon!");
    }
  });

  el('btn-anu').onclick = () => {
    document.body.classList.add('transitioning');
    setTimeout(() => {
      setActiveView('view-anu');
    }, 500);
  };

  el('open-btech').onclick = () => setActiveView('view-btech');

  document.querySelectorAll('.dep-btn').forEach(btn => {
    btn.onclick = () => {
      state.currentDept = btn.innerText;
      el('dept-year-heading').innerText = `${state.currentDept} - Select Year`;
      setActiveView('view-dept-year');
    };
  });

  el('dept-year-form').onsubmit = (e) => {
    e.preventDefault();
    const val = e.target.year.value;
    if (!val) return alert("Select a year");
    state.yearLabel = val === '1' ? '1st' : val === '2' ? '2nd' : val === '3' ? '3rd' : '4th';
    el('dept-year-label').innerText = state.yearLabel + " Year";
    el('dept-sem-heading').innerText = state.currentDept;
    setActiveView('view-dept-sem');
  };

  el('dept-sem-form').onsubmit = (e) => {
    e.preventDefault();
    state.semester = e.target.semester.value;
    if (!state.semester) return alert("Select a semester");
    renderSubjects();
    setActiveView('view-dept-subjects');
  };

  // Back Buttons
  el('back-anu').onclick = () => setActiveView('view-anu');
  el('back-btech').onclick = () => setActiveView('view-btech');
  el('back-dept-year').onclick = () => setActiveView('view-dept-year');
  el('back-dept-sem').onclick = () => setActiveView('view-dept-sem');

  // --- SUBJECT RENDERING ---
  function renderSubjects() {
    const grid = el('subjects-grid');
    grid.innerHTML = '';
    const key = `${state.currentDept}|${state.yearLabel}|${state.semester}`;
    const data = { ...DEFAULT_SUBJECTS, ...getStoredData() };
    const subs = data[key];

    if (!subs) {
      grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:var(--muted);">No subjects found for this selection.</p>';
      return;
    }

    Object.keys(subs).forEach(name => {
      const card = document.createElement('div');
      card.className = 'subject-card';
      card.innerText = name;
      card.onclick = () => window.open(getDirectLink(subs[name]), '_blank');
      grid.appendChild(card);
    });
    el('subjects-title').innerText = `${state.currentDept} • ${state.yearLabel} • Sem ${state.semester}`;
  }

  // --- ADMIN & LOGIN ---
  const ADMIN_CREDS = { u: 'LURNIQOO', p: '868684' };

  el('open-login').onclick = () => {
    el('login-modal').style.display = 'grid';
  };

  el('login-cancel').onclick = () => el('login-modal').style.display = 'none';

  el('login-form').onsubmit = (e) => {
    e.preventDefault();
    if (el('login-user').value === ADMIN_CREDS.u && el('login-pass').value === ADMIN_CREDS.p) {
        el('login-modal').style.display = 'none';
        el('admin-modal').style.display = 'grid';
        renderAdminList();
    } else {
        alert("Wrong credentials");
    }
  };

  el('admin-add').onclick = () => {
    const d = el('admin-dept').value, y = el('admin-year').value, s = el('admin-sem').value;
    const sub = el('admin-subject').value, url = el('admin-url').value;
    if (!sub || !url) return alert("Fill all fields");

    const data = getStoredData();
    const key = `${d}|${y}|${s}`;
    if (!data[key]) data[key] = {};
    data[key][sub] = url;
    saveStoredData(data);
    renderAdminList();
    alert("Saved!");
  };

  function renderAdminList() {
    const container = el('admin-list-contents');
    container.innerHTML = '';
    const data = getStoredData();
    Object.keys(data).forEach(key => {
        Object.keys(data[key]).forEach(sub => {
            const item = document.createElement('div');
            item.style = "display:flex; justify-content:space-between; background:#111; padding:5px; margin-bottom:5px; font-size:12px;";
            item.innerHTML = `<span>${key} - ${sub}</span> <button onclick="deleteEntry('${key}','${sub}')">X</button>`;
            container.appendChild(item);
        });
    });
  }

  window.deleteEntry = (key, sub) => {
    const data = getStoredData();
    delete data[key][sub];
    if (Object.keys(data[key]).length === 0) delete data[key];
    saveStoredData(data);
    renderAdminList();
  };

  el('close-admin').onclick = () => el('admin-modal').style.display = 'none';
  el('admin-logout').onclick = () => location.reload();

  el('year').innerText = new Date().getFullYear();

})();