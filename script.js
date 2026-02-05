(function () {
  'use strict';
  const el = (id) => document.getElementById(id);
  
  const state = { currentDept: null, yearLabel: null, semester: null };

  function setActiveView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = el(viewId);
    if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (viewId === 'view-home') {
      document.body.classList.remove('mode-anu');
    } else {
      document.body.classList.add('mode-anu');
    }
  }

  // --- BUTTON CLICKS ---
  el('btn-anu').onclick = (e) => {
    e.preventDefault();
    setActiveView('view-anu');
  };

  el('open-btech').onclick = () => setActiveView('view-btech');

  document.querySelectorAll('.dep-pill').forEach(btn => {
    btn.onclick = () => {
      state.currentDept = btn.innerText;
      el('dept-year-heading').innerText = `${state.currentDept} - Choose Year`;
      setActiveView('view-dept-year');
    };
  });

  el('dept-year-form').onsubmit = (e) => {
    e.preventDefault();
    const val = e.target.year.value;
    if (!val) return alert("Please select a year");
    state.yearLabel = val + (val === '1' ? 'st' : val === '2' ? 'nd' : val === '3' ? 'rd' : 'th');
    el('dept-year-label').innerText = state.yearLabel;
    el('dept-sem-heading').innerText = state.currentDept;
    setActiveView('view-dept-sem');
  };

  el('dept-sem-form').onsubmit = (e) => {
    e.preventDefault();
    state.semester = e.target.semester.value;
    if (!state.semester) return alert("Please select a semester");
    // logic to load subjects would go here
    setActiveView('view-dept-subjects');
  };

  // Back Navigation logic
  el('back-anu').onclick = () => setActiveView('view-anu');
  el('back-btech').onclick = () => setActiveView('view-btech');
  el('back-dept-year').onclick = () => setActiveView('view-dept-year');
  el('back-dept-sem').onclick = () => setActiveView('view-dept-sem');

  // Year in Footer
  el('year').innerText = new Date().getFullYear();

})();