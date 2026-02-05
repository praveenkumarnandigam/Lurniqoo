"use strict";

/* =========================
   DATA STRUCTURE (CORE)
========================= */

const SubjectStore = {
  data: {},

  ensure(uni, prog, dept, year, sem) {
    return (
      (((this.data[uni] ||= {})[prog] ||= {})[dept] ||= {})[year] ||= {}
    )[sem] ||= new Map();
  },

  add(uni, prog, dept, year, sem, subject, url) {
    this.ensure(uni, prog, dept, year, sem).set(subject, url);
  },

  get(uni, prog, dept, year, sem) {
    return this.data?.[uni]?.[prog]?.[dept]?.[year]?.[sem] || null;
  }
};

/* ====== DEFAULT DATA ====== */
SubjectStore.add("ANU","BTECH","AIML",1,1,"Mathematics-1","https://example.com/math.pdf");
SubjectStore.add("ANU","BTECH","AIML",1,1,"Physics","https://example.com/phy.pdf");
SubjectStore.add("ANU","BTECH","CSE",1,1,"C Programming","https://example.com/c.pdf");

/* =========================
   APP STATE
========================= */
const state = {
  uni:"ANU",
  program:"BTECH",
  dept:null,
  year:null,
  sem:null
};

/* =========================
   VIEW HANDLING
========================= */
function show(id){
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* =========================
   NAV FLOW
========================= */
document.getElementById("btn-anu").onclick=()=>show("view-anu");
document.getElementById("open-btech").onclick=()=>show("view-btech");
document.getElementById("back-anu").onclick=()=>show("view-anu");

document.querySelectorAll(".dep-btn").forEach(b=>{
  b.onclick=()=>{
    state.dept=b.textContent;
    show("view-year");
  };
});

document.getElementById("year-form").onsubmit=e=>{
  e.preventDefault();
  state.year=+document.querySelector("input[name=year]:checked").value;
  show("view-sem");
};

document.getElementById("sem-form").onsubmit=e=>{
  e.preventDefault();
  state.sem=+document.querySelector("input[name=sem]:checked").value;
  showSubjects();
};

/* =========================
   SUBJECT RENDER
========================= */
function showSubjects(){
  const grid=document.getElementById("subjects-grid");
  const title=document.getElementById("subjects-title");
  grid.innerHTML="";
  title.textContent=`${state.dept} – Year ${state.year} – Sem ${state.sem}`;

  const map=SubjectStore.get(
    state.uni,
    state.program,
    state.dept,
    state.year,
    state.sem
  );

  if(!map || map.size===0){
    grid.textContent="No subjects available";
    return;
  }

  map.forEach((url,name)=>{
    const card=document.createElement("div");
    card.className="subject-card";
    card.textContent=name;
    card.onclick=()=>window.open(url,"_blank");
    grid.appendChild(card);
  });

  show("view-subjects");
}

/* =========================
   INIT
========================= */
document.getElementById("year").textContent=new Date().getFullYear();
