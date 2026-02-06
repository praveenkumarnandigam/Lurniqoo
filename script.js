(function () {
  'use strict';

  /* ---------------- HELPERS ---------------- */
  function el(id) {
    return document.getElementById(id);
  }

  function drivePreviewUrl(input) {
    const s = String(input || '').trim();
    const m = s.match(/\/d\/([^/]+)/) || s.match(/[?&]id=([^&]+)/);
    return m
      ? 'https://drive.google.com/file/d/' + m[1] + '/preview?rm=minimal'
      : s;
  }

  /* ---------------- SUBJECT DATA ---------------- */
  const SUBJECT_URLS = {
    'AIML|1st|1': {
      'Mathematics-1': drivePreviewUrl(''),
      'Physics': drivePreviewUrl(''),
      'BEE': drivePreviewUrl(''),
      'EG': drivePreviewUrl(''),
      'C': drivePreviewUrl('')
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
    },

    'DS|1st|1': {
      'Mathematics-1': '',
      'Physics': '',
      'BEE': '',
      'EG': '',
      'C': ''
    },
    'DS|1st|2': {
      'Mathematics-2': '',
      'Chemistry': '',
      'English': '',
      'DE': '',
      'Python': '',
      'ES': ''
    },

    'CY|1st|1': {
      'Mathematics-1': '',
      'Physics': '',
      'BEE': '',
      'EG': '',
      'C': ''
    },
    'CY|1st|2': {
      'Mathematics-2': '',
      'Chemistry': '',
      'English': '',
      'DE': '',
      'Python': '',
      'ES': ''
    }
  };

  /* ---------------- APP STATE ---------------- */
  const state = {
    dept: null,
    year: null,
    sem: null,
    mode: 'home'
  };

  /* ---------------- VIEW HANDLING ---------------- */
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

    document.body.classList.toggle('mode-anu', id !== 'view-home');
  }

  /* ---------------- NAVIGATION ---------------- */
  function animateToANU() {
    setActiveView('view-anu');
    state.mode = 'anu';
  }

  function goBTech() {
    setActiveView('view-btech');
    state.mode = 'btech';
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
      state.dept + ' — ' + state.year + ' Year — Semester ' + state.sem;

    setActiveView('view-dept-subjects');
    renderSubjects();
  }

  /* ---------------- SUBJECT GRID ---------------- */
  function renderSubjects() {
    const grid = el('subjects-grid');
    grid.innerHTML = '';

    const key = `${state.dept}|${state.year}|${state.sem}`;
    const subjects = SUBJECT_URLS[key];

    if (!subjects) {
      grid.innerHTML = '<p style="color:#999;text-align:center">No subjects</p>';
      return;
    }

    Object.keys(subjects).forEach(sub => {
      const btn = document.createElement('button');
      btn.className = 'subject-card';
      btn.dataset.subject = sub;
      btn.textContent = sub;
      grid.appendChild(btn);
    });
  }

  /* ---------------- SUBJECT VIEWER ---------------- */
  const viewer = el('subject-viewer');
  const viewerFrame = el('subject-viewer-frame');
  const viewerTitle = el('subject-viewer-title');
  const viewerClose = el('close-subject-viewer');

  function closeSubjectViewer() {
    viewer.setAttribute('aria-hidden', 'true');
    viewerFrame.src = '';
    history.back();
  }

  viewerClose.addEventListener('click', closeSubjectViewer);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && viewer.getAttribute('aria-hidden') === 'false') {
      closeSubjectViewer();
    }
  });

  window.addEventListener('popstate', () => {
    if (viewer.getAttribute('aria-hidden') === 'false') {
      viewer.setAttribute('aria-hidden', 'true');
      viewerFrame.src = '';
    }
  });

  /* ---------------- EVENT DELEGATION ---------------- */
  document.addEventListener('click', e => {
    const t = e.target;

    if (t.id === 'btn-anu') {
      e.preventDefault();
      animateToANU();
    }

    if (t.id === 'open-btech') {
      e.preventDefault();
      goBTech();
    }

    if (t.classList.contains('dep-btn')) {
      e.preventDefault();
      openDeptYear(t.textContent.trim());
    }

    if (t.classList.contains('subject-card')) {
      e.preventDefault();
      const key = `${state.dept}|${state.year}|${state.sem}`;
      const url = SUBJECT_URLS[key]?.[t.dataset.subject];
      if (!url) return alert('No content available');

      viewerTitle.textContent = t.dataset.subject;
      viewerFrame.src = url;
      viewer.setAttribute('aria-hidden', 'false');
      history.pushState({ viewer: true }, '');
    }
  });

  /* ---------------- FORMS ---------------- */
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

  /* ---------------- INIT ---------------- */
  el('year').textContent = new Date().getFullYear();
  setActiveView('view-home');

})();
