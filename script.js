(function () {
  'use strict';

  /* ─── HELPERS ─────────────────────────────── */
  const el  = id => document.getElementById(id);
  const qs  = sel => document.querySelector(sel);

  function scrollToTop() {
    window.scrollTo(0, 0);
  }

  /* ─── STATE ───────────────────────────────── */
  const state = { dept: null, year: null };

  /* ─── MOBILE MENU ─────────────────────────── */
  const hamburgerBtn = el('hamburger-btn');
  const closeMenuBtn = el('close-menu-btn');
  const mobileMenu   = el('mobile-menu');

  function openMenu() {
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    hamburgerBtn?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileMenu?.classList.remove('open');
    mobileMenu?.setAttribute('aria-hidden', 'true');
    hamburgerBtn?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function updateMobileActiveLink(route) {
    document.querySelectorAll('.mobile-nav-link').forEach(a => {
      a.classList.toggle('mob-active', a.dataset.route === route);
    });
  }

  /* ─── VIEW IDs ────────────────────────────── */
  const ALL_VIEWS = [
    'view-home',
    'view-anu',
    'view-btech',
    'view-dept-year',
    'view-dept-subjects',
    'view-about',
    'view-notifications'
  ];

  /* ─── ACTIVE SIDE LINK ────────────────────── */
  function updateSideLink(route) {
    document.querySelectorAll('.side-link').forEach(a => {
      a.classList.toggle('active', a.dataset.route === route);
    });
    // sync mobile bottom nav
    document.querySelectorAll('.mob-item').forEach(a => {
      a.classList.toggle('mob-active', a.dataset.mob === route);
    });
    // sync desktop topbar nav links
    document.querySelectorAll('.nav-link').forEach(a => {
      a.classList.toggle('active', a.dataset.route === route);
    });
  }

  /* ─── LIVE CLOCK ─────────────────────────── */
  function updateClock() {
    const t = el('status-time');
    if (!t) return;
    const now = new Date();
    const h   = now.getHours();
    const m   = String(now.getMinutes()).padStart(2, '0');
    t.textContent = h + ':' + m;
  }
  updateClock();
  setInterval(updateClock, 30000);

  /* ─── SET ACTIVE VIEW ─────────────────────── */
  function setActiveView(viewId, sideRoute, skipScroll) {
    ALL_VIEWS.forEach(id => {
      const v = el(id);
      if (v) v.classList.toggle('active', id === viewId);
    });

    const isHome = viewId === 'view-home';
    document.body.classList.toggle('mode-anu', !isHome);

    updateSideLink(sideRoute || null);
    updateMobileActiveLink(sideRoute || null);
    closeMenu();
    if (!skipScroll) scrollToTop();
  }

  /* ─── NAV ACTIONS ─────────────────────────── */
  function goHome() {
    setActiveView('view-home', 'home');
  }

  function goAbout() {
    setActiveView('view-about', 'about');
    initReveal();
  }

  function goNotifications() {
    setActiveView('view-notifications', 'notifications');
    initReveal();
  }

  function goANU() {
    setActiveView('view-anu', 'syllabus', true);
    window.scrollTo(0, 0);
    setTimeout(() => {
      el('open-btech')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
  }

  function goBTech() {
    setActiveView('view-btech', 'syllabus', true);
    window.scrollTo(0, 0);
    setTimeout(() => {
      el('view-btech')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  }

  function goDept(dept) {
    state.dept = dept;
    el('dept-year-heading').textContent = dept + ' — Select Year';
    document.querySelectorAll('input[name="year"]').forEach(r => r.checked = false);
    setActiveView('view-dept-year', 'syllabus', true);
    window.scrollTo(0, 0);
    setTimeout(() => {
      el('dept-year-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  }

  function goSubjects() {
    el('subjects-title').textContent =
      `${state.dept} — ${state.year} Year`;
    setActiveView('view-dept-subjects', 'syllabus', true);
    window.scrollTo(0, 0);
    setTimeout(() => {
      el('subjects-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    renderSubjects();
  }

  /* ─── SUBJECT DATA ────────────────────────── */
  const SUBJECT_URLS = {
    'AIML|1st|1': {
      'Mathematics – I':       'https://drive.google.com/file/d/1uH1re21YAQyXEzBeHKB_0xFzTcUFNZoz/view?usp=drive_link',
      'Physics':               'https://drive.google.com/file/d/1OaAwotmOL-0Va9M7tJ2xlawQlJFES6xl/view?usp=drive_link',
      'Basic Electrical Engg': 'https://drive.google.com/file/d/1aMTRzvd2ipUHIqIcLGbT8FGvkZ0Cr8c8/view?usp=drive_link',
      'Engineering Graphics':  'https://drive.google.com/file/d/1Ml578a5rIwh_ukqNt40p4S1gQb0wZan6/view?usp=drive_link',
      'C Programming':         'https://drive.google.com/file/d/1RO544NsUs-2GQMEeMcTbx6QwwPJ5hAvZ/view?usp=drive_link'
    },
    'AIML|1st|2': {
      'Mathematics – II': '',
      'Chemistry':        '',
      'Digital Electronics': '',
      'Python':           '',
      'Environmental Science': '',
      'English' :'https://drive.google.com/file/d/1rY___th3Y6jcdYSdWqHospxD0rEQeVap/view?usp=drive_link'
    },
    'CSE|1st|1': {
      'Mathematics – I':       'https://drive.google.com/file/d/1uH1re21YAQyXEzBeHKB_0xFzTcUFNZoz/view?usp=drive_link',
      'Physics':               'https://drive.google.com/file/d/1OaAwotmOL-0Va9M7tJ2xlawQlJFES6xl/view?usp=drive_link',
      'Basic Electrical Engg': 'https://drive.google.com/file/d/1aMTRzvd2ipUHIqIcLGbT8FGvkZ0Cr8c8/view?usp=drive_link',
      'Engineering Graphics':  'https://drive.google.com/file/d/1Ml578a5rIwh_ukqNt40p4S1gQb0wZan6/view?usp=drive_link',
      'C Programming':         'https://drive.google.com/file/d/1RO544NsUs-2GQMEeMcTbx6QwwPJ5hAvZ/view?usp=drive_link'
    },
    'CSE|1st|2': {
      'Mathematics – II': '',
      'Chemistry':        '',
      'Digital Electronics': '',
      'Python':           '',
      'Environmental Science': '',
      'English' :''    
    },
    'DS|1st|1': {
      'Mathematics – I':       'https://drive.google.com/file/d/1uH1re21YAQyXEzBeHKB_0xFzTcUFNZoz/view?usp=drive_link',
      'Physics':               'https://drive.google.com/file/d/1OaAwotmOL-0Va9M7tJ2xlawQlJFES6xl/view?usp=drive_link',
      'Basic Electrical Engg': 'https://drive.google.com/file/d/1aMTRzvd2ipUHIqIcLGbT8FGvkZ0Cr8c8/view?usp=drive_link',
      'Engineering Graphics':  'https://drive.google.com/file/d/1Ml578a5rIwh_ukqNt40p4S1gQb0wZan6/view?usp=drive_link',
      'C Programming':         'https://drive.google.com/file/d/1RO544NsUs-2GQMEeMcTbx6QwwPJ5hAvZ/view?usp=drive_link'
    },
    'DS|1st|2': {
      'Mathematics – II': '',
      'Chemistry':        '',
      'Digital Electronics': '',
      'Python':           '',
      'Environmental Science': '',
      'English' :'https://drive.google.com/file/d/1rY___th3Y6jcdYSdWqHospxD0rEQeVap/view?usp=drive_link'
    },
    'CY|1st|1': {
      'Mathematics – I':       'https://drive.google.com/file/d/1uH1re21YAQyXEzBeHKB_0xFzTcUFNZoz/view?usp=drive_link',
      'Physics':               'https://drive.google.com/file/d/1OaAwotmOL-0Va9M7tJ2xlawQlJFES6xl/view?usp=drive_link',
      'Basic Electrical Engg': 'https://drive.google.com/file/d/1aMTRzvd2ipUHIqIcLGbT8FGvkZ0Cr8c8/view?usp=drive_link',
      'Engineering Graphics':  'https://drive.google.com/file/d/1Ml578a5rIwh_ukqNt40p4S1gQb0wZan6/view?usp=drive_link',
      'C Programming':         'https://drive.google.com/file/d/1RO544NsUs-2GQMEeMcTbx6QwwPJ5hAvZ/view?usp=drive_link'
    },
    'CY|1st|2': {
      'Mathematics – II': '',
      'Chemistry':        '',
      'Digital Electronics': '',
      'Python':           '',
      'Environmental Science': '',
      'English' :'https://drive.google.com/file/d/1rY___th3Y6jcdYSdWqHospxD0rEQeVap/view?usp=drive_link'
    }
  };

  function renderSubjects() {
    const grid = el('subjects-grid');
    grid.innerHTML = '';

    const keySem1 = `${state.dept}|${state.year}|1`;
    const keySem2 = `${state.dept}|${state.year}|2`;
    const subjectsSem1 = SUBJECT_URLS[keySem1];
    const subjectsSem2 = SUBJECT_URLS[keySem2];

    const hasSem1 = subjectsSem1 && Object.keys(subjectsSem1).length > 0;
    const hasSem2 = subjectsSem2 && Object.keys(subjectsSem2).length > 0;

    if (!hasSem1 && !hasSem2) {
      grid.innerHTML =
        '<p class="no-subjects">No subjects available yet for this selection.</p>';
      return;
    }

    if (hasSem1) {
      const sem1Title = document.createElement('h3');
      sem1Title.className = 'semester-title';
      sem1Title.textContent = 'Semester 1';
      sem1Title.style.gridColumn = '1 / -1';
      sem1Title.style.color = 'var(--text-main)';
      sem1Title.style.marginTop = '0.5rem';
      sem1Title.style.marginBottom = '0.5rem';
      grid.appendChild(sem1Title);

      Object.entries(subjectsSem1).forEach(([name, url]) => {
        const btn = document.createElement('button');
        btn.className   = 'subject-card';
        btn.textContent = name;
        btn.dataset.url = url;
        grid.appendChild(btn);
      });
    }

    if (hasSem2) {
      const sem2Title = document.createElement('h3');
      sem2Title.className = 'semester-title';
      sem2Title.textContent = 'Semester 2';
      sem2Title.style.gridColumn = '1 / -1';
      sem2Title.style.color = 'var(--text-main)';
      sem2Title.style.marginTop = '1rem';
      sem2Title.style.marginBottom = '0.5rem';
      grid.appendChild(sem2Title);

      Object.entries(subjectsSem2).forEach(([name, url]) => {
        const btn = document.createElement('button');
        btn.className   = 'subject-card';
        btn.textContent = name;
        btn.dataset.url = url;
        grid.appendChild(btn);
      });
    }
  }

  /* ─── SUBJECT VIEWER ──────────────────────── */
  function openSubjectViewer(name, url) {
    const viewer = el('subject-viewer');
    el('subject-viewer-title').textContent = name;
    
    // Convert Google Drive view links to preview links for iframes
    if (url && url.includes('drive.google.com') && url.includes('/view')) {
      url = url.replace(/\/view.*/, '/preview');
    }
    
    el('subject-viewer-frame').src = url || 'about:blank';
    viewer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeSubjectViewer() {
    const viewer = el('subject-viewer');
    viewer.setAttribute('aria-hidden', 'true');
    el('subject-viewer-frame').src = 'about:blank';
    document.body.style.overflow = '';
  }

  /* ─── CLICK ROUTER ────────────────────────── */
  document.addEventListener('click', e => {
    const t = e.target;

    /* — data-route links (topbar & sidebar) — */
    const routeEl = t.closest('[data-route]');
    if (routeEl) {
      const r = routeEl.dataset.route;
      if (r === 'home')          { e.preventDefault(); goHome();          return; }
      if (r === 'about')         { e.preventDefault(); goAbout();         return; }
      if (r === 'notifications') { e.preventDefault(); goNotifications(); return; }
      if (r === 'syllabus')      { e.preventDefault(); goANU();           return; }
    }

    /* — Portal buttons — */
    if (t.closest('#btn-anu'))    { e.preventDefault(); goANU();    return; }
    if (t.closest('#open-btech')) { e.preventDefault(); goBTech();  return; }

    /* — Department buttons — */
    const deptBtn = t.closest('.dep-btn');
    if (deptBtn) {
      e.preventDefault();
      goDept(deptBtn.dataset.dept || deptBtn.textContent.trim());
      return;
    }

    /* — Subject cards — */
    const subCard = t.closest('.subject-card');
    if (subCard) {
      openSubjectViewer(subCard.textContent.trim(), subCard.dataset.url);
      return;
    }

    /* — Back buttons — */
    if (t.closest('#back-anu'))       { e.preventDefault(); goANU();       return; }
    if (t.closest('#back-btech'))     { e.preventDefault(); goBTech();     return; }
    if (t.closest('#back-dept-year')) { e.preventDefault(); setActiveView('view-dept-year', 'syllabus'); return; }

    /* — Close subject viewer — */
    if (t.closest('#close-subject-viewer')) { closeSubjectViewer(); return; }
  });

  /* Close viewer with Escape key */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSubjectViewer();
  });

  /* ─── FORMS ───────────────────────────────── */
  el('dept-year-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const v = qs('input[name="year"]:checked');
    if (!v) { showFormError('Please select a year to continue.'); return; }
    state.year = { 1: '1st', 2: '2nd', 3: '3rd', 4: '4th' }[v.value];
    goSubjects();
  });

  function showFormError(msg) {
    // non-blocking toast instead of alert()
    const existing = document.querySelector('.form-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'form-toast';
    toast.textContent = msg;
    Object.assign(toast.style, {
      position:     'fixed',
      bottom:       '24px',
      left:         '50%',
      transform:    'translateX(-50%)',
      background:   'rgba(20,30,55,.95)',
      border:       '1px solid rgba(91,142,240,.35)',
      color:        '#e4e9f5',
      padding:      '.65rem 1.2rem',
      borderRadius: '10px',
      fontSize:     '.88rem',
      fontWeight:   '600',
      zIndex:       '9999',
      backdropFilter: 'blur(14px)',
      boxShadow:    '0 8px 24px rgba(0,0,0,.4)',
      pointerEvents: 'none'
    });

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  /* ─── SCROLL REVEAL ───────────────────────── */
  let revealObserver = null;

  function initReveal() {
    if (revealObserver) revealObserver.disconnect();

    const targets = document.querySelectorAll('.reveal');

    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.12 });

    targets.forEach(el => revealObserver.observe(el));
  }

  /* ─── HAMBURGER EVENTS ────────────────────── */
  hamburgerBtn?.addEventListener('click', openMenu);
  closeMenuBtn?.addEventListener('click', closeMenu);
  mobileMenu?.addEventListener('click', e => {
    if (!e.target.closest('.mobile-menu-inner')) closeMenu();
  });

  /* ─── NOTIFICATION PERMISSION ─────────────── */
  function requestNotificationPermission() {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
      return;
    }
    if (Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          console.log("Notification permission granted.");
          // Optional: welcome notification
          // new Notification("Lurniqoo", { body: "You will now receive important updates." });
        }
      });
    }
  }

  /* ─── INIT ────────────────────────────────── */
  requestNotificationPermission();
  el('year').textContent = new Date().getFullYear();
  setActiveView('view-home', 'home');

})();
