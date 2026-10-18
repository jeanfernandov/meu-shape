const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const STORE = "meuShapePWA_v1";
const plan = {
  "Superior A": {type:"upper", exercises:[["Supino reto",3,"6–10"],["Remada com apoio no peito",3,"8–12"],["Supino inclinado com halteres",3,"8–12"],["Puxada alta na polia",3,"8–12"],["Elevação lateral",3,"12–20"],["Tríceps na polia",2,"10–15"],["Rosca direta",2,"10–15"]]},
  "Inferior A": {type:"lower", exercises:[["Agachamento ou leg press",3,"6–10"],["Levantamento romeno",3,"8–10"],["Cadeira extensora",3,"10–15"],["Mesa flexora",3,"10–15"],["Panturrilha",4,"10–20"],["Abdominal na polia",3,"10–15"]]},
  "Superior B": {type:"upper", exercises:[["Puxada alta ou barra assistida",3,"6–10"],["Supino inclinado",3,"8–12"],["Remada baixa",3,"8–12"],["Crucifixo na máquina",2,"12–15"],["Desenvolvimento de ombros",2,"8–12"],["Rosca martelo",3,"10–15"],["Tríceps acima da cabeça na polia",3,"10–15"]]},
  "Inferior B": {type:"lower", exercises:[["Hack squat ou leg press",3,"8–12"],["Hip thrust",3,"8–12"],["Mesa flexora",3,"10–15"],["Afundo ou passada",2,"10–12 por perna"],["Cadeira extensora",2,"12–15"],["Panturrilha",4,"12–20"],["Abdominal",3,"10–15"]]}
};
const dayPlan = [null,"Superior A","Inferior A",null,"Superior B","Inferior B",null]; // JS weekday: Sun=0
const dayNames = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const parseDate = s => {const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d,12)};
const fmtDate = s => parseDate(s).toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"});
let state = loadState();
let selectedDate = iso(new Date());
let calendarMonth = new Date(new Date().getFullYear(),new Date().getMonth(),1);
let currentWorkout = "Superior A";
let deferredInstallPrompt = null;

function blankState(){return {workouts:{},weights:[],settings:{initialWeight:68,targetWeight:74}}}
function loadState(){try{return {...blankState(),...JSON.parse(localStorage.getItem(STORE)||"{}")}}catch{return blankState()}}
function saveState(){localStorage.setItem(STORE,JSON.stringify(state));renderAll()}
function workoutForDate(dateString){return dayPlan[parseDate(dateString).getDay()]||null}
function workoutRecord(dateString,name){if(!state.workouts[dateString])state.workouts[dateString]={};if(!state.workouts[dateString][name])state.workouts[dateString][name]={checks:{},logs:{},completedAt:null};return state.workouts[dateString][name]}
function getRecord(dateString,name){return state.workouts[dateString]?.[name]||{checks:{},logs:{},completedAt:null}}
function isCompleted(dateString,name){return !!state.workouts[dateString]?.[name]?.completedAt}
function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove("show"),2400)}
function go(tab){$$(".page").forEach(p=>p.classList.toggle("active",p.id===tab));$$(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));if(tab==="treinos")renderWorkout();if(tab==="calendario")renderCalendar();window.scrollTo({top:0,behavior:"smooth"})}
$$(".tab").forEach(b=>b.addEventListener("click",()=>go(b.dataset.tab)));
$$("[data-goto]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.goto)));

function renderHome(){
  const w=Number(state.weights.at(-1)?.weight ?? state.settings.initialWeight);
  $("#homeWeight").textContent=w.toLocaleString("pt-BR",{maximumFractionDigits:1});
  const pct=Math.min(100,Math.max(0,(w-68)/(74-68)*100));
  $("#weightProgress").style.width=pct+"%";
  $("#weightMessage").textContent=w>=74?"Meta inicial alcançada! Continue acompanhando sua evolução.":`Faltam ${(74-w).toLocaleString("pt-BR",{maximumFractionDigits:1})} kg para sua meta inicial.`;
  const today=iso(new Date()), name=workoutForDate(today);
  $("#todayDate").textContent=new Date().toLocaleDateString("pt-BR",{weekday:"short",day:"2-digit",month:"short"});
  const holder=$("#todayWorkout");
  if(!name){holder.innerHTML='<p class="muted small">Hoje é dia de recuperação. Priorize alimentação, sono e recuperação muscular.</p><button class="secondary" id="openCalendar">Ver calendário</button>';$("#openCalendar").onclick=()=>go("calendario")}
  else {
    const rec=getRecord(today,name), total=plan[name].exercises.length, done=Object.values(rec.checks).filter(Boolean).length;
    holder.innerHTML=`<div class="day-detail"><div><strong>${name}</strong><p>${total} exercícios · ${done}/${total} marcados${rec.completedAt?" · Concluído":""}</p></div><button class="primary" id="openToday">Abrir treino</button></div>`;
    $("#openToday").onclick=()=>{selectedDate=today;currentWorkout=name;go("treinos")};
  }
  const monday=new Date();monday.setDate(monday.getDate()-(monday.getDay()+6)%7);
  const days=Array.from({length:7},(_,i)=>{const d=new Date(monday);d.setDate(monday.getDate()+i);return d});
  const completed=days.filter(d=>{const n=workoutForDate(iso(d));return n&&isCompleted(iso(d),n)}).length;
  $("#weekCount").textContent=`${completed}/4`;
  $("#weekSummary").innerHTML=days.map(d=>{const s=iso(d),n=workoutForDate(s),done=n&&isCompleted(s,n);return `<div class="week-day ${done?"done":""}"><span>${dayNames[d.getDay()]}</span><i class="mini-dot" style="background:${!n?"#52667d":done?"var(--green)":plan[n].type==="lower"?"var(--purple)":"var(--blue)"}"></i><b>${d.getDate()}</b></div>`}).join("");
}
function renderCalendar(){
  $("#monthLabel").textContent=calendarMonth.toLocaleDateString("pt-BR",{month:"long",year:"numeric"});
  const first=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth(),1);
  const offset=(first.getDay()+6)%7;
  const start=new Date(first);start.setDate(first.getDate()-offset);
  const today=iso(new Date());
  $("#calendarGrid").innerHTML=Array.from({length:42},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);const s=iso(d),n=workoutForDate(s),done=n&&isCompleted(s,n);return `<button class="calendar-day ${d.getMonth()!==calendarMonth.getMonth()?"outside":""} ${s===today?"today":""} ${s===selectedDate?"selected":""} ${n?"has-workout":""} ${n&&plan[n].type==="lower"?"lower":""} ${done?"done":""}" data-date="${s}">${d.getDate()}</button>`}).join("");
  $$(".calendar-day").forEach(b=>b.addEventListener("click",()=>{selectedDate=b.dataset.date;renderCalendar()}));
  $("#selectedDateLabel").textContent=parseDate(selectedDate).toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const name=workoutForDate(selectedDate),details=$("#selectedDayDetails");
  if(!name){details.innerHTML='<div class="day-detail"><div><strong>Dia de descanso</strong><p>Recuperação, caminhada leve opcional e sono.</p></div>🌙</div>'}
  else {details.innerHTML=`<div class="day-detail"><div><strong>${name}</strong><p>${isCompleted(selectedDate,name)?"Treino concluído":"Treino programado"} · ${plan[name].exercises.length} exercícios</p></div><button class="primary" id="openSelected">Abrir treino</button></div>`;$("#openSelected").onclick=()=>{currentWorkout=name;go("treinos")}}
}
$("#prevMonth").addEventListener("click",()=>{calendarMonth.setMonth(calendarMonth.getMonth()-1);renderCalendar()});
$("#nextMonth").addEventListener("click",()=>{calendarMonth.setMonth(calendarMonth.getMonth()+1);renderCalendar()});

function renderWorkout(){
  $("#workoutPicker").innerHTML=Object.keys(plan).map(n=>`<button class="workout-option ${n===currentWorkout?"active":""}" data-workout="${n}"><strong>${n}</strong><span>${plan[n].type==="upper"?"Peito, costas, ombros e braços":"Pernas, glúteos e abdômen"}</span></button>`).join("");
  $$(".workout-option").forEach(b=>b.addEventListener("click",()=>{currentWorkout=b.dataset.workout;renderWorkout()}));
  const rec=workoutRecord(selectedDate,currentWorkout), exercises=plan[currentWorkout].exercises;
  const done=exercises.filter((_,i)=>rec.checks[i]).length;
  $("#workoutDetail").innerHTML=`<div class="section-heading"><div><p class="eyebrow">${fmtDate(selectedDate)}</p><h3>${currentWorkout}</h3></div><span class="pill">${done}/${exercises.length}</span></div><p class="muted small">Marque cada exercício ao terminar. Você também pode anotar a carga para acompanhar a progressão.</p><div class="workout-progress"><div style="width:${done/exercises.length*100}%"></div></div>${exercises.map((e,i)=>`<div class="exercise"><input type="checkbox" aria-label="Marcar ${e[0]}" data-check="${i}" ${rec.checks[i]?"checked":""}><div class="exercise-main"><strong>${e[0]}</strong><small>${e[1]} séries · ${e[2]} repetições</small><div class="exercise-fields"><label>Carga (kg)<input type="number" min="0" step="0.5" placeholder="ex.: 20" data-load="${i}" value="${rec.logs[i]?.load??""}"></label><label>Reps realizadas<input type="text" placeholder="ex.: 10/9/8" data-reps="${i}" value="${rec.logs[i]?.reps??""}"></label></div></div></div>`).join("")}<button id="finishWorkout" class="primary full">${rec.completedAt?"Treino concluído ✓":"Finalizar treino"}</button><button id="clearWorkout" class="secondary full">Desmarcar este treino</button>`;
  $$("[data-check]").forEach(el=>el.addEventListener("change",()=>{rec.checks[el.dataset.check]=el.checked;saveState();renderWorkout()}));
  $$("[data-load]").forEach(el=>el.addEventListener("change",()=>{rec.logs[el.dataset.load]={...(rec.logs[el.dataset.load]||{}),load:el.value};persistOnly()}));
  $$("[data-reps]").forEach(el=>el.addEventListener("change",()=>{rec.logs[el.dataset.reps]={...(rec.logs[el.dataset.reps]||{}),reps:el.value};persistOnly()}));
  $("#finishWorkout").addEventListener("click",()=>{const all=exercises.every((_,i)=>rec.checks[i]);if(!all){toast("Marque todos os exercícios antes de finalizar.");return}rec.completedAt=new Date().toISOString();saveState();toast("Treino salvo no histórico!");});
  $("#clearWorkout").addEventListener("click",()=>{if(confirm("Desmarcar todos os exercícios deste treino?")){delete state.workouts[selectedDate]?.[currentWorkout];saveState();renderWorkout();toast("Marcações removidas.")}});
}
function persistOnly(){localStorage.setItem(STORE,JSON.stringify(state))}
function renderHistory(){
  const entries=[];
  Object.entries(state.workouts).forEach(([date,workouts])=>Object.entries(workouts).forEach(([name,rec])=>{if(rec.completedAt)entries.push({date,name,at:rec.completedAt})}));
  entries.sort((a,b)=>b.at.localeCompare(a.at));
  $("#totalWorkouts").textContent=entries.length;
  let streak=0,d=new Date();
  while(true){const s=iso(d),n=workoutForDate(s);if(n&&isCompleted(s,n)){streak++;d.setDate(d.getDate()-1);continue}if(!n){d.setDate(d.getDate()-1);continue}break}
  $("#streak").textContent=`${streak} ${streak===1?"dia":"dias"}`;
  $("#historyList").innerHTML=entries.length?entries.slice(0,30).map(e=>`<div class="history-item"><div class="history-icon">⚒</div><div><strong>${e.name}</strong><small>${fmtDate(e.date)}</small></div><time>${new Date(e.at).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</time></div>`).join(""):'<p class="empty">Nenhum treino concluído ainda. Seus treinos finalizados aparecerão aqui.</p>';
  $("#weightHistory").innerHTML=state.weights.length?state.weights.slice(-7).reverse().map(w=>`<div class="history-item"><div class="history-icon">⚖</div><div><strong>${Number(w.weight).toLocaleString("pt-BR")} kg</strong><small>${fmtDate(w.date)}</small></div></div>`).join(""):'<p class="empty">Nenhuma pesagem registrada ainda.</p>';
}
function renderAll(){renderHome();renderCalendar();renderWorkout();renderHistory()}
$("#weightForm").addEventListener("submit",e=>{e.preventDefault();const val=Number($("#weightInput").value);if(!val||val<30||val>300){toast("Digite um peso válido.");return}const date=iso(new Date());state.weights=state.weights.filter(w=>w.date!==date);state.weights.push({date,weight:val});state.weights.sort((a,b)=>a.date.localeCompare(b.date));saveState();$("#weightInput").value="";toast("Peso salvo!")});
$("#exportBtn").addEventListener("click",()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`meu-shape-backup-${iso(new Date())}.json`;a.click();URL.revokeObjectURL(url);toast("Backup exportado.")});
$("#importInput").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;try{const imported=JSON.parse(await file.text());if(!imported.workouts||!Array.isArray(imported.weights))throw new Error("Formato inválido");if(confirm("Importar backup? Os dados atuais serão substituídos.")){state={...blankState(),...imported};saveState();toast("Backup importado.")}}catch{toast("Não foi possível ler esse backup.")}e.target.value=""});
$("#resetBtn").addEventListener("click",()=>{if(confirm("Isso apagará o histórico de treinos e pesos deste navegador. Exporte um backup antes, se necessário. Continuar?")){state=blankState();saveState();toast("Dados apagados.")}});

window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstallPrompt=e;$("#installBtn").classList.remove("hidden")});
$("#installBtn").addEventListener("click",async()=>{if(!deferredInstallPrompt){toast("No Chrome Android, use o menu ⋮ e escolha Instalar app ou Adicionar à tela inicial.");return}deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;$("#installBtn").classList.add("hidden")});
if("serviceWorker" in navigator && location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
renderAll();
