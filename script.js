(function () {
  'use strict';

  /* ---------- HELPERS ---------- */
  function el(id) {
    return document.getElementById(id);
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
      'view-dept-subjects'
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

    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function animateToANU() {
    setActiveView('view-anu');

    // auto swipe to B.Tech
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const anchor = el('btech-anchor');
        if (anchor) {
          anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  function goBTech() {
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
      grid.innerHTML = '<p style="text-align:center;color:#999">No subjects</p>';
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

    // ANU
    if (t.closest('#btn-anu')) {
      e.preventDefault();
      animateToANU();
      return;
    }

    // B.Tech
    if (t.closest('#open-btech')) {
      e.preventDefault();
      goBTech();
      return;
    }

    // Departments
    const deptBtn = t.closest('.dep-btn');
    if (deptBtn) {
      e.preventDefault();
      openDeptYear(deptBtn.textContent.trim());
      return;
    }

    // Back buttons
    if (t.closest('#back-anu')) {
      setActiveView('view-anu');
      return;
    }

    if (t.closest('#back-btech')) {
      setActiveView('view-btech');
      return;
    }

    if (t.closest('#back-dept-year')) {
      setActiveView('view-dept-year');
      return;
    }

    if (t.closest('#back-dept-sem')) {
      setActiveView('view-dept-sem');
      return;
    }

    // Subject click
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

  /* ---------- SCROLL SIDEBAR CONTROL ---------- */
  window.addEventListener('scroll', () => {
    if (window.scrollY < 40) {
      document.body.classList.remove('mode-anu');
    }
    if (window.scrollY > 80) {
      document.body.classList.add('mode-anu');
    }
  });

})();
