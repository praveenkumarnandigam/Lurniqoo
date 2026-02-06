(function () {
  'use strict';

  /* ---------- HELPERS ---------- */
  const el = id => document.getElementById(id);

  function autoSwipeTo(anchorId) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const anchor = el(anchorId);
        if (anchor) {
          anchor.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  /* ---------- SUBJECT DATA ---------- */
  const SUBJECT_URLS = {
    'AIML|1st|1': {
      'Mathematics-1': '',
      'Physics': '',
      'BEE': '',
      'EG': '',
      'C': ''
    },
    'AIML|1st|2': {
      'Mathematics-2': '',
      'Chemistry': '',
      'English': '',
      'DE': '',
      'Python': '',
      'ES': ''
    },
    'CSE|1st|1': {
      'Mathematics-1': '',
      'Physics': '',
      'BEE': '',
      'EG': '',
      'C': ''
    },
    'CSE|1st|2': {
      'Mathematics-2': '',
      'Chemistry': '',
      'English': '',
      'DE': '',
      'Python': '',
      'ES': ''
    }
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
      'view-dept-subjects',
      'view-about'
    ];

    views.forEach(v => {
      const node = el(v);
      if (node) node.classList.toggle('active', v === id);
    });

    if (id !== 'view-home') {
      document.body.classList.add('mode-anu');
    } else {
      document.body.classList.remove('mode-anu');
    }
  }

  /* ---------- NAVIGATION ---------- */
  function goANU() {
    setActiveView('view-anu');
    autoSwipeTo('anu-anchor');
  }

  function goBTech() {
    setActiveView('view-btech');
    autoSwipeTo('btech-anchor');
  }

  function openDeptYear(dept) {
    state.dept = dept;
    el('dept-year-heading').textContent = dept + ' — Select Year';
    setActiveView('view-dept-year');
    autoSwipeTo('year-anchor');
  }

  function openDeptSem() {
    el('dept-sem-heading').textContent = state.dept;
    el('dept-year-label').textContent = state.year + ' Year';
    setActiveView('view-dept-sem');
    autoSwipeTo('sem-anchor');
  }

  function openSubjects() {
    el('subjects-title').textContent =
      `${state.dept} — ${state.year} Year — Semester ${state.sem}`;
    setActiveView('view-dept-subjects');
    renderSubjects();
    autoSwipeTo('subjects-anchor');
  }

  /* ---------- SUBJECT GRID ---------- */
  function renderSubjects() {
    const grid = el('subjects-grid');
    grid.innerHTML = '';

    const key = `${state.dept}|${state.year}|${state.sem}`;
    const subjects = SUBJECT_URLS[key];

    if (!subjects) {
      grid.innerHTML =
        '<p style="text-align:center;color:#999">No subjects</p>';
      return;
    }

    Object.keys(subjects).forEach(sub => {
      const btn = document.createElement('button');
      btn.className = 'subject-card';
      btn.textContent = sub;
      btn.dataset.subject = sub;
      grid.appendChild(btn);
    });
  }

  /* ---------- EVENTS ---------- */
  document.addEventListener('click', e => {
    const t = e.target;
    /* ---------- TOP NAV ROUTES ---------- */
const route = t.closest('[data-route]');
if (route) {
  e.preventDefault();

  const page = route.dataset.route;

  if (page === 'home') {
    setActiveView('view-home');
  }

  if (page === 'about') {
    setActiveView('view-about');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return;
}


    if (t.closest('#btn-anu')) {
      e.preventDefault();
      goANU();
      return;
    }

    if (t.closest('#open-btech')) {
      e.preventDefault();
      goBTech();
      return;
    }

    const deptBtn = t.closest('.dep-btn');
    if (deptBtn) {
      e.preventDefault();
      openDeptYear(deptBtn.textContent.trim());
      return;
    }

    if (t.closest('#back-anu')) {
      goANU();
      return;
    }

    if (t.closest('#back-btech')) {
      goBTech();
      return;
    }

    if (t.closest('#back-dept-year')) {
      setActiveView('view-dept-year');
      autoSwipeTo('year-anchor');
      return;
    }

    if (t.closest('#back-dept-sem')) {
      setActiveView('view-dept-sem');
      autoSwipeTo('sem-anchor');
      return;
    }

    const subBtn = t.closest('.subject-card');
    if (subBtn) {
      alert('Subject clicked: ' + subBtn.dataset.subject);
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

  /* ---------- SIDEBAR / TOPBAR SCROLL CONTROL ---------- */
  window.addEventListener('scroll', () => {
    if (window.scrollY < 40) {
      document.body.classList.remove('mode-anu');
    }
    if (window.scrollY > 80) {
      document.body.classList.add('mode-anu');
    }
  });

  /* ---------- ABOUT PAGE SCROLL REVEAL ---------- */
const reveals = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  },
  { threshold: 0.15 }
);

reveals.forEach(el => revealObserver.observe(el));

})();
