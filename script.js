(function () {
  'use strict';

  /* ================= HELPERS ================= */
  const el = id => document.getElementById(id);

  function autoSwipe(anchorId) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const a = el(anchorId);
        if (a) a.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ================= STATE ================= */
  const state = { dept: null, year: null, sem: null };

  /* ================= VIEWS ================= */
  const VIEWS = [
    'view-home',
    'view-anu',
    'view-btech',
    'view-dept-year',
    'view-dept-sem',
    'view-dept-subjects',
    'view-about',
    'view-notifications'
  ];

  function setActiveView(viewId) {
    VIEWS.forEach(id => {
      const v = el(id);
      if (v) v.classList.toggle('active', id === viewId);
    });

    if (viewId !== 'view-home') {
      document.body.classList.add('mode-anu');
    } else {
      document.body.classList.remove('mode-anu');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ================= NAV ACTIONS ================= */
  function goHome() {
    setActiveView('view-home');
  }

  function goAbout() {
    setActiveView('view-about');
    initReveal(); // re-init reveal when About opens
  }

  function goANU() {
    setActiveView('view-anu');
    autoSwipe('anu-anchor');
  }

  function goBTech() {
    setActiveView('view-btech');
    autoSwipe('btech-anchor');
  }

  function goDept(dept) {
    state.dept = dept;
    el('dept-year-heading').textContent = dept + ' — Select Year';
    setActiveView('view-dept-year');
    autoSwipe('year-anchor');
  }

  function goSem() {
    el('dept-sem-heading').textContent = state.dept;
    el('dept-year-label').textContent = state.year + ' Year';
    setActiveView('view-dept-sem');
    autoSwipe('sem-anchor');
  }

  function goSubjects() {
    el('subjects-title').textContent =
      `${state.dept} — ${state.year} Year — Semester ${state.sem}`;
    setActiveView('view-dept-subjects');
    renderSubjects();
    autoSwipe('subjects-anchor');
  }

  /* ================= SUBJECT GRID ================= */
  const SUBJECT_URLS = {
    'AIML|1st|1': { 'Mathematics-1': '', 'Physics': '', 'BEE': '', 'EG': '', 'C': '' },
    'AIML|1st|2': { 'Mathematics-2': '', 'Chemistry': '', 'English': '', 'DE': '', 'Python': '', 'ES': '' },
    'CSE|1st|1': { 'Mathematics-1': '', 'Physics': '', 'BEE': '', 'EG': '', 'C': '' },
    'CSE|1st|2': { 'Mathematics-2': '', 'Chemistry': '', 'English': '', 'DE': '', 'Python': '', 'ES': '' }
  };

  function renderSubjects() {
    const grid = el('subjects-grid');
    grid.innerHTML = '';

    const key = `${state.dept}|${state.year}|${state.sem}`;
    const subjects = SUBJECT_URLS[key];

    if (!subjects) {
      grid.innerHTML = '<p style="text-align:center;color:#999">No subjects</p>';
      return;
    }

    Object.keys(subjects).forEach(sub => {
      const btn = document.createElement('button');
      btn.className = 'subject-card';
      btn.textContent = sub;
      grid.appendChild(btn);
    });
  }

  /* ================= CLICK ROUTER ================= */
  document.addEventListener('click', e => {
    const t = e.target;

    // data-route (topbar & sidebar)
    const route = t.closest('[data-route]');
    if (route) {
      e.preventDefault();
      const r = route.dataset.route;
      if (r === 'home') goHome();
      if (r === 'about') goAbout();
       if (r === 'notifications') {
    setActiveView('view-notifications');
      return;
    }

    if (t.closest('#btn-anu')) return e.preventDefault(), goANU();
    if (t.closest('#open-btech')) return e.preventDefault(), goBTech();

    const deptBtn = t.closest('.dep-btn');
    if (deptBtn) return e.preventDefault(), goDept(deptBtn.textContent.trim());

    if (t.closest('#back-anu')) return goANU();
    if (t.closest('#back-btech')) return goBTech();
    if (t.closest('#back-dept-year')) return setActiveView('view-dept-year'), autoSwipe('year-anchor');
    if (t.closest('#back-dept-sem')) return setActiveView('view-dept-sem'), autoSwipe('sem-anchor');
  });

  /* ================= FORMS ================= */
  el('dept-year-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const v = document.querySelector('input[name="year"]:checked');
    if (!v) return alert('Select year');
    state.year = { 1: '1st', 2: '2nd', 3: '3rd', 4: '4th' }[v.value];
    goSem();
  });

  el('dept-sem-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const v = document.querySelector('input[name="semester"]:checked');
    if (!v) return alert('Select semester');
    state.sem = v.value;
    goSubjects();
  });

  /* ================= SCROLL REVEAL ================= */
  let revealObserver;
  function initReveal() {
    if (revealObserver) revealObserver.disconnect();

    const reveals = document.querySelectorAll('#view-about .reveal');

    revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('active');
        });
      },
      { threshold: 0.15 }
    );

    reveals.forEach(el => revealObserver.observe(el));
  }

  /* ================= INIT ================= */
  el('year').textContent = new Date().getFullYear();
  setActiveView('view-home');

  window.addEventListener('scroll', () => {
    if (window.scrollY < 40) document.body.classList.remove('mode-anu');
    if (window.scrollY > 80) document.body.classList.add('mode-anu');
  });

})();
