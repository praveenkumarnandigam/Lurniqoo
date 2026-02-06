(function () {
  'use strict';

  /* ---------- HELPERS ---------- */
  function el(id) {
    return document.getElementById(id);
  }

  function hideHomeLogo() {
    const logo = document.querySelector('#view-home .logo-tile');
    if (logo) {
      logo.style.opacity = '0';
      logo.style.visibility = 'hidden';
    }
  }

  function showHomeLogo() {
    const logo = document.querySelector('#view-home .logo-tile');
    if (logo) {
      logo.style.opacity = '1';
      logo.style.visibility = 'visible';
    }
  }

  /* ---------- SUBJECT DATA ---------- */
  const SUBJECT_URLS = {
    'AIML|1st|1': { 'Mathematics-1': '', 'Physics': '', 'BEE': '', 'EG': '', 'C': '' },
    'AIML|1st|2': { 'Mathematics-2': '', 'Chemistry': '', 'English': '', 'DE': '', 'Python': '', 'ES': '' },

    'CSE|1st|1': { 'Mathematics-1': '', 'Physics': '', 'BEE': '', 'EG': '', 'C': '' },
    'CSE|1st|2': { 'Mathematics-2': '', 'Chemistry': '', 'English': '', 'DE': '', 'Python': '', 'ES': '' },

    'DS|1st|1': { 'Mathematics-1': '', 'Physics': '', 'BEE': '', 'EG': '', 'C': '' },
    'DS|1st|2': { 'Mathematics-2': '', 'Chemistry': '', 'English': '', 'DE': '', 'Python': '', 'ES': '' },

    'CY|1st|1': { 'Mathematics-1': '', 'Physics': '', 'BEE': '', 'EG': '', 'C': '' },
    'CY|1st|2': { 'Mathematics-2': '', 'Chemistry': '', 'English': '', 'DE': '', 'Python': '', 'ES': '' }
  };

  /* ---------- STATE ---------- */
  const state = {
    dept: null,
    year: null,
    sem: null
  };

  /* ---------- VIEW HANDLING ---------- */
  function setActiveView(id) {
    const views = [
      'view-home',
      'view-anu',
      'view-btech',
      'view-dept-year',
      'view-dept-sem',
      'view-dept-subjects'
    ];

    views.forEach(v => {
      const node = el(v);
      if (node) node.classList.toggle('active', v === id);
    });

    if (id === 'view-home') {
      document.body.classList.remove('mode-anu');
      showHomeLogo();
    } else {
      document.body.classList.add('mode-anu');
    }
  }

  /* ---------- NAVIGATION ---------- */
  function goToBTechFromANU() {
    hideHomeLogo();
    setActiveView('view-btech');
  }

  function openDeptYear(dept) {
    state.dept = dept;
    el('dept-year-heading').textContent = dept + ' — Select Year';
    setActiveView('view-dept-year');
  }

  function openDeptSem() {
    el('dept-sem-heading').textContent = state.dept;
    el('dept-year-label').textContent = state.year + ' Year';
    setActiveView('view-dept-sem');
  }

  function openSubjects() {
    el('subjects-title').textContent =
      `${state.dept} — ${state.year} Year — Semester ${state.sem}`;
    setActiveView('view-dept-subjects');
    renderSubjects();
  }

  /* ---------- SUBJECT GRID ---------- */
  function renderSubjects() {
    const grid = el('subjects-grid');
    grid.innerHTML = '';

    const key = `${state.dept}|${state.year}|${state.sem}`;
    const subjects = SUBJECT_URLS[key];

    if (!subjects) {
      grid.innerHTML =
        '<p style="text-align:center;color:#999">No subjects available</p>';
      return;
    }

    Object.keys(subjects).forEach(sub => {
      const btn = document.createElement('button');
      btn.className = 'subject-card';
      btn.textContent = sub;
      grid.appendChild(btn);
    });
  }

  /* ---------- EVENTS ---------- */
  document.addEventListener('click', e => {
    const t = e.target;

    if (t.closest('#btn-anu')) {
      e.preventDefault();
      goToBTechFromANU();
      return;
    }

    const deptBtn = t.closest('.dep-btn');
    if (deptBtn) {
      e.preventDefault();
      openDeptYear(deptBtn.textContent.trim());
      return;
    }

    const subBtn = t.closest('.subject-card');
    if (subBtn) {
      e.preventDefault();
      alert(subBtn.textContent + ' clicked');
    }
  });

  /* ---------- FORMS ---------- */
  el('dept-year-form').addEventListener('submit', e => {
    e.preventDefault();
    const v = document.querySelector('input[name="year"]:checked');
    if (!v) return alert('Select year');

    state.year = { '1': '1st', '2': '2nd', '3': '3rd', '4': '4th' }[v.value];
    openDeptSem();
  });

  el('dept-sem-form').addEventListener('submit', e => {
    e.preventDefault();
    const v = document.querySelector('input[name="semester"]:checked');
    if (!v) return alert('Select semester');

    state.sem = v.value;
    openSubjects();
  });

  /* ---------- INIT ---------- */
  el('year').textContent = new Date().getFullYear();
  setActiveView('view-home');

})();
