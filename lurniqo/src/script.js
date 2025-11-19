// Init immediately (works in CodePen or standalone)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init(){
  const RESTORE_THRESHOLD = 20;
  const state = {
    mode: 'home',
    inAnim: false,
    programmaticScroll: false,
    aimlYear: null, // '1st' | '2nd' | '3rd' | '4th'
    aimlSem: null   // '1' | '2'
  };

  // Convert Google Drive "file/d/ID/view" → direct download
  const driveUrl = (input)=>{
    const s = String(input || '');
    const m = s.match(/\/d\/([^/]+)/) || s.match(/[?&]id=([^&]+)/);
    const id = m ? m[1] : null;
    return id ? `https://drive.google.com/uc?export=download&id=${id}` : s;
  };

  // Your Drive links (replace placeholders)
  const SUBJECT_URLS = {
    'AIML|1st|1': {
      'Mathematics-1': driveUrl('https://drive.google.com/file/d/1uH1re21YAQyXEzBeHKB_0xFzTcUFNZoz/view?usp=drive_link'),
      'Physics'      : driveUrl('https://drive.google.com/file/d/1OaAwotmOL-0Va9M7tJ2xlawQlJFES6xl/view?usp=drive_link'),
      'BEE'          : driveUrl('https://drive.google.com/file/d/1aMTRzvd2ipUHIqIcLGbT8FGvkZ0Cr8c8/view?usp=drive_link'),
      'EG'           : driveUrl('https://drive.google.com/file/d/1Ml578a5rIwh_ukqNt40p4S1gQb0wZan6/view?usp=drive_link'),
      'C'            : driveUrl('https://drive.google.com/file/d/1UVWXY56789abcdef01234/view?usp=sharing')
    }
  };

  const setActiveView = (id)=>{
    ['view-home','view-anu','view-btech','view-aiml-year','view-aiml-sem','view-aiml-subjects'].forEach(v=>{
      const el = document.getElementById(v);
      if (!el) return;
      el.classList.toggle('active', v === id);
    });
  };
  const scrollToEl = (el)=>{
    if (!el) return;
    state.programmaticScroll = true;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(()=>{ state.programmaticScroll = false; }, 600);
  };

  function animateToANU(){
    if (state.inAnim || state.mode !== 'home') return;
    state.inAnim = true;
    document.body.classList.add('transitioning');
    setTimeout(()=>{
      document.body.classList.remove('transitioning');
      document.body.classList.add('mode-anu');
      setActiveView('view-anu');
      state.mode = 'anu';
      scrollToEl(document.querySelector('#view-anu .programs'));
      state.inAnim = false;
    },520);
  }
  function goBTech(){
    if (state.inAnim) return;
    document.body.classList.add('mode-anu');
    setActiveView('view-btech');
    state.mode = 'btech';
    scrollToEl(document.querySelector('#view-btech .dep-grid'));
  }
  function goAimlYear(){
    if (state.inAnim) return;
    setActiveView('view-aiml-year');
    state.mode = 'aiml-year';
    scrollToEl(document.querySelector('#view-aiml-year .choice-form'));
  }
  function goAimlSem(){
    if (state.inAnim) return;
    document.getElementById('aiml-year-label').textContent = `${state.aimlYear} Year`;
    setActiveView('view-aiml-sem');
    state.mode = 'aiml-sem';
    scrollToEl(document.querySelector('#view-aiml-sem .choice-form'));
  }
  function goAimlSubjects(){
    if (state.inAnim) return;
    document.getElementById('subjects-title').textContent =
      `AIML — ${state.aimlYear} Year — Semester ${state.aimlSem} — Subjects`;
    setActiveView('view-aiml-subjects');
    state.mode = 'aiml-subjects';
    scrollToEl(document.querySelector('#view-aiml-subjects .subject-grid'));
  }
  function animateToHome(){
    if (state.inAnim || state.mode === 'home') return;
    state.inAnim = true;
    setActiveView('view-home');
    document.body.classList.add('transitioning-back');
    document.body.classList.remove('mode-anu');
    setTimeout(()=>{
      document.body.classList.remove('transitioning-back');
      state.mode = 'home';
      state.programmaticScroll = true;
      window.scrollTo({ top: 0, behavior: 'instant' });
      setTimeout(()=>{ state.programmaticScroll = false; },150);
      state.inAnim = false;
    },520);
  }

  // Nav & cards
  document.getElementById('btn-anu')?.addEventListener('click', e=>{ e.preventDefault(); animateToANU(); });
  document.getElementById('btn-jntuk')?.addEventListener('click', e=>{ e.preventDefault(); alert('JNTUK — Coming soon'); });
  document.getElementById('btn-rvrjc')?.addEventListener('click', e=>{ e.preventDefault(); alert('RVRJC — Coming soon'); });

  document.getElementById('open-btech')?.addEventListener('click', e=>{ e.preventDefault(); goBTech(); });
  document.getElementById('open-mtech')?.addEventListener('click', e=>{ e.preventDefault(); alert('M.Tech — coming soon'); });
  document.getElementById('back-anu')?.addEventListener('click', e=>{
    e.preventDefault(); setActiveView('view-anu'); state.mode='anu';
    scrollToEl(document.querySelector('#view-anu .programs'));
  });

  document.querySelectorAll('.dep-btn').forEach(btn=>{
    btn.addEventListener('click', e=>{
      e.preventDefault();
      const dept = btn.textContent.trim();
      if (dept === 'AIML') goAimlYear();
      else alert(`${dept} — coming soon`);
    });
  });

  // YEAR form (mobile-safe: label contains input)
  const yearForm = document.getElementById('aiml-year-form');
  yearForm?.addEventListener('submit', e=>{
    e.preventDefault();
    const checked = yearForm.querySelector('input[name="year"]:checked');
    if (!checked) { alert('Please select a year'); return; }
    const map = {'1':'1st','2':'2nd','3':'3rd','4':'4th'};
    state.aimlYear = map[checked.value] || `${checked.value}th`;
    goAimlSem();
  });
  document.getElementById('back-btech')?.addEventListener('click', e=>{ e.preventDefault(); goBTech(); });

  // SEM form
  const semForm = document.getElementById('aiml-sem-form');
  semForm?.addEventListener('submit', e=>{
    e.preventDefault();
    const checked = semForm.querySelector('input[name="semester"]:checked');
    if (!checked) { alert('Please select a semester'); return; }
    state.aimlSem = checked.value;
    if (state.aimlYear === '1st' && state.aimlSem === '1') goAimlSubjects();
    else alert(`Subjects for ${state.aimlYear} Year, Semester ${state.aimlSem} — coming soon`);
  });
  document.getElementById('back-aiml-year')?.addEventListener('click', e=>{ e.preventDefault(); goAimlYear(); });
  document.getElementById('back-aiml-sem')?.addEventListener('click', e=>{ e.preventDefault(); goAimlSem(); });

  // Topbar + Sidebar nav
  document.querySelectorAll('#topbar .nav a').forEach(a=>{
    a.addEventListener('click', e=>{
      const route = a.dataset.route;
      if (!route || route==='home'){ e.preventDefault(); animateToHome(); return; }
      e.preventDefault(); alert(`${route.toUpperCase()} page coming soon`);
    });
  });
  document.querySelectorAll('#sidebar .side-nav a, #sidebar .brand').forEach(a=>{
    a.addEventListener('click', e=>{
      const route = a.dataset.route;
      if (!route || route==='home'){ e.preventDefault(); animateToHome(); return; }
      e.preventDefault(); alert(`${route.toUpperCase()} page coming soon`);
    });
  });

  // Restore home at top
  window.addEventListener('scroll', ()=>{
    if (state.programmaticScroll || state.inAnim) return;
    if (state.mode!=='home' && window.scrollY <= RESTORE_THRESHOLD) animateToHome();
  });

  // Subject download
  function triggerDownload(url, filename){
    const a = document.createElement('a');
    a.href = url; a.download = filename || ''; a.rel = 'noopener'; a.target = '_self';
    document.body.appendChild(a); a.click(); a.remove();
  }
  document.querySelectorAll('#subjects-grid .subject-card').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const subject = btn.dataset.subject;
      const key = `AIML|${state.aimlYear}|${state.aimlSem}`;
      const url = SUBJECT_URLS[key]?.[subject];
      if (!url){ alert(`No Drive link set for ${subject} (${key}).`); return; }
      triggerDownload(url, `${subject}.pdf`);
    });
  });

  // Footer year
  document.getElementById('year').textContent = new Date().getFullYear();
}
