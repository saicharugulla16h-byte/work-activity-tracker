
/* Work Activity Tracker V2
   Frontend prototype only. Data is intentionally in-memory.
   Authentication below is demo-only and will be replaced by Google Apps Script.
*/
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
const iso = (d) => new Date(d).toISOString().slice(0,10);
const today = iso(new Date());

const D = {
  currentUserId: "u1",
  users: [
    {id:"u1",name:"Sai Prashant",email:"sai@example.com",employeeId:"EMP001",designation:"Solution Architect",practice:"Data & AI",manager:"Manager Name",location:"India",joiningDate:"2021-04-12",profileUrl:"",bio:"Work activity tracker administrator.",role:"Admin",active:true,password:"demo123"}
  ],
  projects: [
    {id:"p1",name:"Regions Bank",client:"Regions Bank",url:"https://example.com/regions",dealStatus:"Ongoing",projectStatus:"Active",pillars:["Proposal & RFP Excellence","Sales Enablement & GTM Support"],startDate:"2026-01-05",targetEndDate:"2026-09-30",notes:"Data and AI proposal work.",createdBy:"u1"},
    {id:"p2",name:"Godrej Capital",client:"Godrej Capital",url:"",dealStatus:"Won",projectStatus:"Active",pillars:["Proposal & RFP Excellence"],startDate:"2026-01-10",targetEndDate:"2026-08-31",notes:"Data platform modernization.",createdBy:"u1"},
    {id:"p3",name:"Deloitte Data Support",client:"Deloitte",url:"",dealStatus:"Completed",projectStatus:"Completed",pillars:["Sales Enablement & GTM Support"],startDate:"2026-01-15",targetEndDate:"2026-05-31",notes:"Data support engagement.",createdBy:"u1"}
  ],
  versions: [
    {id:"v1",projectId:"p1",number:"V1",name:"Initial Proposal",reason:"New project approach",status:"Baseline",url:"",date:"2026-01-08",notes:"Initial proposal baseline."},
    {id:"v2",projectId:"p1",number:"V2",name:"Revised Approach",reason:"Client feedback",status:"Submitted",url:"",date:"2026-02-12",notes:"Revised architecture and delivery approach."},
    {id:"v3",projectId:"p1",number:"V3",name:"Revised / Rejected",reason:"Client rejection",status:"Rejected",url:"",date:"2026-03-10",notes:"Client rejected the previous approach."},
    {id:"v4",projectId:"p1",number:"V4",name:"Rebuilt Current Version",reason:"Major scope change",status:"In Progress",url:"",date:"2026-04-06",notes:"Rebuilt proposal with Azure Container, Power BI and AI/Agentic AI."},
    {id:"v5",projectId:"p2",number:"V1",name:"Initial Modernization Proposal",reason:"New project approach",status:"Approved",url:"",date:"2026-01-20",notes:"Initial Godrej proposal."}
  ],
  activities: [
    {id:"a1",projectId:"p1",versionId:"v4",date:"2026-09-08",category:"Architecture",title:"Refined solution architecture",details:"Refined the end-to-end architecture for the current proposal version.",status:"Completed",hours:3.5,url:"",tags:"Architecture, Azure",userId:"u1"},
    {id:"a2",projectId:"p1",versionId:"v4",date:"2026-09-07",category:"AI / GenAI",title:"Defined AI / GenAI capability",details:"Defined AI and GenAI positioning for the client discussion.",status:"Completed",hours:2,url:"",tags:"AI, GenAI",userId:"u1"},
    {id:"a3",projectId:"p1",versionId:"v4",date:"2026-09-05",category:"Agentic AI",title:"Defined Agentic AI approach",details:"Outlined the Agentic AI capability and use cases.",status:"Completed",hours:2.5,url:"",tags:"Agentic AI",userId:"u1"},
    {id:"a4",projectId:"p1",versionId:"v4",date:"2026-09-04",category:"Presentation / Demo",title:"Prepared client presentation",details:"Prepared and refined the client-facing presentation.",status:"Completed",hours:3,url:"",tags:"Presentation",userId:"u1"},
    {id:"a5",projectId:"p1",versionId:"v2",date:"2026-02-10",category:"Power BI",title:"Separated Power BI capability",details:"Defined Power BI capability as a distinct section of the solution.",status:"Completed",hours:2,url:"",tags:"Power BI",userId:"u1"},
    {id:"a6",projectId:"p2",versionId:"v5",date:"2026-01-18",category:"Solution Design",title:"Data platform modernization design",details:"Developed the modernization approach.",status:"Completed",hours:4,url:"",tags:"Databricks, Data",userId:"u1"},
    {id:"a7",projectId:"p3",versionId:"",date:"2026-05-12",category:"Client Delivery",title:"Data support activity",details:"Provided data support for the engagement.",status:"Completed",hours:3,url:"",tags:"Data",userId:"u1"}
  ],
  categories: [
    {id:"c1",name:"Client Delivery",description:"Direct delivery work.",active:true,order:1},
    {id:"c2",name:"Client Meeting / Discussion",description:"Client meetings and discussions.",active:true,order:2},
    {id:"c3",name:"Workshop",description:"Workshops and working sessions.",active:true,order:3},
    {id:"c4",name:"Presentation / Demo",description:"Presentations and demos.",active:true,order:4},
    {id:"c5",name:"Requirement Analysis",description:"Requirement analysis and discovery.",active:true,order:5},
    {id:"c6",name:"Solution Design",description:"Solution design work.",active:true,order:6},
    {id:"c7",name:"Architecture",description:"Architecture and technical design.",active:true,order:7},
    {id:"c8",name:"Proposal / RFP",description:"Proposal and RFP preparation.",active:true,order:8},
    {id:"c9",name:"Solutioning",description:"Solutioning and response development.",active:true,order:9},
    {id:"c10",name:"Estimation / Effort Analysis",description:"Effort and estimation work.",active:true,order:10},
    {id:"c11",name:"Proposal Review",description:"Review and quality checks.",active:true,order:11},
    {id:"c12",name:"Sales / GTM Support",description:"Sales and GTM support.",active:true,order:12},
    {id:"c13",name:"Collateral / Reusable Asset",description:"Reusable collateral.",active:true,order:13},
    {id:"c14",name:"AI / GenAI",description:"AI and GenAI activities.",active:true,order:14},
    {id:"c15",name:"Agentic AI",description:"Agentic AI activities.",active:true,order:15},
    {id:"c16",name:"Data & Analytics",description:"Data and analytics activities.",active:true,order:16},
    {id:"c17",name:"Architecture / Technology Research",description:"Research and technology assessment.",active:true,order:17},
    {id:"c18",name:"POC / Prototype",description:"Proofs of concept and prototypes.",active:true,order:18},
    {id:"c19",name:"Innovation",description:"Innovation initiatives.",active:true,order:19},
    {id:"c20",name:"Internal Initiative",description:"Internal initiatives.",active:true,order:20},
    {id:"c21",name:"Knowledge Sharing",description:"Knowledge sharing.",active:true,order:21},
    {id:"c22",name:"Mentoring / Coaching",description:"Mentoring and coaching.",active:true,order:22},
    {id:"c23",name:"Team / Practice Contribution",description:"Team and practice contribution.",active:true,order:23},
    {id:"c24",name:"Process Improvement",description:"Process improvements.",active:true,order:24},
    {id:"c25",name:"Learning / Training",description:"Learning and training.",active:true,order:25},
    {id:"c26",name:"Certification",description:"Certification activities.",active:true,order:26},
    {id:"c27",name:"Skill Development",description:"Skill development.",active:true,order:27},
    {id:"c28",name:"Documentation",description:"General documentation.",active:true,order:28},
    {id:"c29",name:"Technical Documentation",description:"Technical documentation.",active:true,order:29},
    {id:"c30",name:"Reusable Asset Creation",description:"Reusable asset creation.",active:true,order:30}
  ],
  pillars: [
    {id:"pl1",name:"Collateral Development & Reusable Asset Creation",description:"",active:true,order:1},
    {id:"pl2",name:"Proposal & RFP Excellence",description:"",active:true,order:2},
    {id:"pl3",name:"Market Intelligence & Trend Analysis",description:"",active:true,order:3},
    {id:"pl4",name:"Sales Enablement & GTM Support",description:"",active:true,order:4},
    {id:"pl5",name:"Self Improvement & Skill Enhancement",description:"",active:true,order:5}
  ],
  dealStatuses: [
    {id:"ds1",name:"Won",active:true,order:1},
    {id:"ds2",name:"Completed",active:true,order:2},
    {id:"ds3",name:"Lost",active:true,order:3},
    {id:"ds4",name:"Ongoing",active:true,order:4}
  ],
  projectStatuses: [
    {id:"ps1",name:"Active",active:true,order:1},
    {id:"ps2",name:"Completed",active:true,order:2},
    {id:"ps3",name:"On Hold",active:true,order:3},
    {id:"ps4",name:"Cancelled",active:true,order:4}
  ],
  versionStatuses: [
    {id:"vs1",name:"Baseline",active:true,order:1},
    {id:"vs2",name:"In Progress",active:true,order:2},
    {id:"vs3",name:"Submitted",active:true,order:3},
    {id:"vs4",name:"Under Review",active:true,order:4},
    {id:"vs5",name:"Approved",active:true,order:5},
    {id:"vs6",name:"Rejected",active:true,order:6},
    {id:"vs7",name:"Superseded",active:true,order:7},
    {id:"vs8",name:"Final",active:true,order:8}
  ]
};

const SESSION_KEY = "wat_session_v1";
const S = {
  page:"dashboard",
  projectId:null,
  authenticated:false,
  search:"",
  filters:{project:"",category:"",status:"",from:"",to:""},
  expandedVersions:{}
};

const el = (id) => document.getElementById(id);
const currentUser = () => D.users.find(u=>u.id===D.currentUserId) || D.users[0];
const isAdmin = () => currentUser()?.role === "Admin";
const initials = (name="") => name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase();
const escapeHtml = (v="") => String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const projectById = id => D.projects.find(x=>x.id===id);
const versionById = id => D.versions.find(x=>x.id===id);
const activeCategories = () => D.categories.filter(x=>x.active).sort((a,b)=>a.order-b.order);
const activePillars = () => D.pillars.filter(x=>x.active).sort((a,b)=>a.order-b.order);
const activeDealStatuses = () => D.dealStatuses.filter(x=>x.active).sort((a,b)=>a.order-b.order);
const activeProjectStatuses = () => D.projectStatuses.filter(x=>x.active).sort((a,b)=>a.order-b.order);
const activeVersionStatuses = () => D.versionStatuses.filter(x=>x.active).sort((a,b)=>a.order-b.order);

function fmtDate(v){
  if(!v) return "—";
  const d = new Date(v+"T00:00:00");
  return d.toLocaleDateString(undefined,{day:"2-digit",month:"short",year:"numeric"});
}
function toast(message,type=""){
  const root=el("toastRoot");
  const div=document.createElement("div");
  div.className=`toast ${type}`;
  div.textContent=message;
  root.appendChild(div);
  setTimeout(()=>div.remove(),2600);
}
function icon(name){
  const paths={
    dashboard:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    activity:'<path d="M4 12h4l2-7 4 14 2-7h4"/><path d="M3 19h18"/>',
    projects:'<path d="M3 7h7l2 2h9v10H3z"/><path d="M3 7V5h7l2 2"/>',
    report:'<path d="M4 19V9"/><path d="M10 19V5"/><path d="M16 19v-7"/><path d="M22 19H2"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-2.5v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H6v-2.5h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V5h2.5v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2v2.5h-.2a1.7 1.7 0 0 0-1.5 1Z"/>',
    profile:'<circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4 3.5-6 8-6s7.2 2 8 6"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
    edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13 6 4 4"/>',
    trash:'<path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 14h10l1-14"/><path d="M9 7V4h6v3"/>',
    close:'<path d="M6 6l12 12M18 6 6 18"/>',
    arrow:'<path d="m9 18 6-6-6-6"/>',
    back:'<path d="m15 18-6-6 6-6"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
    logout:'<path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M21 4v16"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M5 21c1-4 3.3-6 7-6s6 2 7 6"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    eye:'<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
    link:'<path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1"/>'
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.dashboard}</svg>`;
}

function render(){
  document.title = "Work Activity Tracker";
  if(!S.authenticated){ renderAuth(); return; }
  renderApp();
}
function renderAuth(){
  el("app").innerHTML=`
    <div class="login-shell">
      <div class="login-card">
        <div class="login-brand-mark">WAT</div>
        <div class="login-brand">WORK ACTIVITY TRACKER</div>
        <div class="login-sub">A structured workspace for projects, versions and work activities.</div>
        <div class="login-divider"></div>
        <h1 class="login-title">Sign in</h1>
        <div class="login-help">Use the credentials provided by your administrator.</div>
        <form class="login-form" onsubmit="submitAuth(event)">
          <div class="field"><label>Email</label><input id="authEmail" type="email" autocomplete="username" required placeholder="name@company.com"></div>
          <div class="field"><label>Password</label><input id="authPassword" type="password" autocomplete="current-password" required placeholder="Enter your password"></div>
          <button class="btn btn-primary login-submit" type="submit">Sign in <span>→</span></button>
        </form>
        <div class="login-security"><span class="security-dot"></span> Access is managed by an administrator.</div>
      </div>
    </div>`;
}
function submitAuth(e){
  e.preventDefault();
  const email=el("authEmail").value.trim().toLowerCase();
  const password=el("authPassword").value;
  const u=D.users.find(x=>x.email.toLowerCase()===email);
  if(!u || password!==u.password){toast("Invalid email or password","error");return}
  if(!u.active){toast("This account is inactive. Contact an administrator.","error");return}
  D.currentUserId=u.id;
  S.authenticated=true;
  S.page="dashboard";
  localStorage.setItem(SESSION_KEY,u.id);
  render();
  toast("Signed in successfully","success");
}
function restoreSession(){
  const id=localStorage.getItem(SESSION_KEY);
  const u=id && D.users.find(x=>x.id===id);
  if(u && u.active){
    D.currentUserId=u.id;
    S.authenticated=true;
    return true;
  }
  localStorage.removeItem(SESSION_KEY);
  return false;
}
function renderApp(){
  const u=currentUser();
  el("app").innerHTML=`
    <div class="app-shell">
      <aside class="sidebar" id="sidebar">
        <div class="brand">
          <div class="brand-name">WORK ACTIVITY<br>TRACKER</div>
        </div>
        <nav class="nav">
          ${navBtn("dashboard","Dashboard","dashboard")}
          ${navBtn("activities","Activities","activity")}
          ${navBtn("projects","Projects","projects")}
          ${navBtn("reports","Reports","report")}
          ${isAdmin()?navBtn("settings","Settings","settings"):""}
          ${navBtn("profile","Profile","profile")}
        </nav>
        <div class="sidebar-bottom">
          <div class="user-mini">
            <div class="avatar">${initials(u.name)}</div>
            <div><div class="user-mini-name">${escapeHtml(u.name)}</div><div class="user-mini-role">${escapeHtml(u.role)}</div></div>
          </div>
          <button class="logout-btn" onclick="logout()">${icon("logout")} <span>Sign out</span></button>
        </div>
      </aside>
      <main class="main">
        <header class="topbar">
          <div class="topbar-actions">
            <button class="icon-btn mobile-menu" onclick="toggleSidebar()">${icon("menu")}</button>
            <span class="page-label">Work Activity Tracker</span>
          </div>
          <div class="topbar-actions">
            <button class="btn btn-sm" onclick="go('profile')">${icon("user")} ${escapeHtml(u.name)}</button>
          </div>
        </header>
        <div class="content">${renderPage()}</div>
      </main>
    </div>
    <div id="modalRoot"></div>`;
}
function navBtn(page,label,ic){
  return `<button class="nav-btn ${S.page===page?"active":""}" onclick="go('${page}')"><span class="nav-icon">${icon(ic)}</span>${label}</button>`;
}
function go(page){
  S.page=page; S.projectId=null; closeModal(); render(); window.scrollTo(0,0);
}
function toggleSidebar(){el("sidebar")?.classList.toggle("open")}
function logout(){localStorage.removeItem("wat_session");S.authenticated=false;S.authMode="login";render();toast("Signed out","success")}

function renderPage(){
  switch(S.page){
    case "activities": return pageActivities();
    case "projects": return pageProjects();
    case "reports": return pageReports();
    case "settings": return pageSettings();
    case "profile": return pageProfile();
    case "projectDetail": return pageProjectDetail();
    default: return pageDashboard();
  }
}

function pageHead(title,sub,actions=""){
  return `<div class="page-head"><div><h1 class="page-title">${title}</h1><p class="page-subtitle">${sub}</p></div><div class="actions">${actions}</div></div>`;
}
function pageDashboard(){
  const acts=visibleActivities();
  const hours=acts.reduce((s,a)=>s+Number(a.hours||0),0);
  const activeProjects=D.projects.filter(p=>p.projectStatus==="Active").length;
  const completed=acts.filter(a=>a.status==="Completed").length;
  const last7=[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));return iso(d)});
  const trend=last7.map(d=>({date:d,count:acts.filter(a=>a.date===d).length}));
  const max=Math.max(1,...trend.map(x=>x.count));
  const cats=activeCategories().map(c=>({name:c.name,count:acts.filter(a=>a.category===c.name).length})).filter(x=>x.count).sort((a,b)=>b.count-a.count).slice(0,7);
  const maxCat=Math.max(1,...cats.map(x=>x.count));
  return `
    ${pageHead("Dashboard","A concise view of your work activity and project progress.",`<button class="btn btn-primary" onclick="openActivity()">${icon("plus")} Add Activity</button>`)}
    <div class="kpis">
      ${kpi("Activities",acts.length,"Current visible activity records","activity")}
      ${kpi("Hours",hours.toFixed(1),"Total logged hours","report")}
      ${kpi("Active Projects",activeProjects,"Projects currently active","projects")}
      ${kpi("Completed Work",completed,"Completed activity records","check")}
    </div>
    <div class="grid-2">
      <section class="card section-card">
        <div class="card-head"><div><h2 class="card-title">Activity Trend</h2><p class="card-sub">Last 7 days</p></div></div>
        <div class="chart-bars">${trend.map(x=>`<div class="bar-wrap"><div class="bar-value">${x.count}</div><div class="bar" style="height:${Math.max(5,(x.count/max)*140)}px"></div><div class="bar-label">${new Date(x.date+"T00:00:00").toLocaleDateString(undefined,{weekday:"short"})}</div></div>`).join("")}</div>
      </section>
      <section class="card section-card">
        <div class="card-head"><div><h2 class="card-title">Activity by Category</h2><p class="card-sub">Top categories</p></div></div>
        ${cats.length?`<div class="category-list">${cats.map(x=>`<div class="cat-row"><div><div class="cat-name">${escapeHtml(x.name)}</div><div class="cat-track"><div class="cat-fill" style="width:${(x.count/maxCat)*100}%"></div></div></div><div class="cat-count">${x.count}</div></div>`).join("")}</div>`:`<div class="empty"><div class="empty-title">No activity yet</div><div class="empty-sub">Add an activity to see category insights.</div></div>`}
      </section>
    </div>
    <section class="card section-card" style="margin-top:18px">
      <div class="card-head"><div><h2 class="card-title">Recent Activity</h2><p class="card-sub">Latest recorded work</p></div><button class="btn btn-sm" onclick="go('activities')">View all</button></div>
      ${activityList(acts.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6))}
    </section>`;
}
function kpi(label,value,note,ic){return `<div class="card kpi"><div class="kpi-top"><span>${label}</span><span class="kpi-icon">${icon(ic)}</span></div><div class="kpi-value">${value}</div><div class="kpi-note">${note}</div></div>`}
function activityList(list){
  if(!list.length)return `<div class="empty"><div class="empty-title">No activities found</div><div class="empty-sub">There are no activity records matching this view.</div></div>`;
  return `<div class="activity-list">${list.map(a=>{
    const p=projectById(a.projectId),v=versionById(a.versionId);
    return `<div class="activity-item"><div class="activity-date">${fmtDate(a.date)}</div><div><div class="activity-title">${escapeHtml(a.title)}</div><div class="activity-meta">${escapeHtml(p?.name||"")} ${v?`· ${escapeHtml(v.number)}`:""} · ${escapeHtml(a.category)}</div></div><div class="activity-hours">${Number(a.hours||0).toFixed(1)}h</div></div>`;
  }).join("")}</div>`;
}

function visibleActivities(){
  let list=D.activities.filter(a=>a.userId===D.currentUserId || isAdmin());
  const f=S.filters;
  if(S.search) {
    const q=S.search.toLowerCase();
    list=list.filter(a=>[a.title,a.details,a.tags,a.category,projectById(a.projectId)?.name].some(v=>String(v||"").toLowerCase().includes(q)));
  }
  if(f.project)list=list.filter(a=>a.projectId===f.project);
  if(f.category)list=list.filter(a=>a.category===f.category);
  if(f.status)list=list.filter(a=>a.status===f.status);
  if(f.from)list=list.filter(a=>a.date>=f.from);
  if(f.to)list=list.filter(a=>a.date<=f.to);
  return list;
}
function pageActivities(){
  const acts=visibleActivities().sort((a,b)=>b.date.localeCompare(a.date));
  const projects=D.projects.filter(p=>isAdmin()||p.createdBy===D.currentUserId);
  return `
    ${pageHead("Activities","Record the work you personally performed.",`<button class="btn btn-primary" onclick="openActivity()">${icon("plus")} Add Activity</button>`)}
    <section class="card">
      <div class="filters">
        <div class="field"><label>Search</label><input value="${escapeHtml(S.search)}" oninput="S.search=this.value;refreshPage()" placeholder="Search activity, project, tags..."></div>
        <div class="field"><label>Project</label><select onchange="S.filters.project=this.value;refreshPage()"><option value="">All Projects</option>${projects.map(p=>`<option value="${p.id}" ${S.filters.project===p.id?"selected":""}>${escapeHtml(p.name)}</option>`).join("")}</select></div>
        <div class="field"><label>Category</label><select onchange="S.filters.category=this.value;refreshPage()"><option value="">All Categories</option>${activeCategories().map(c=>`<option ${S.filters.category===c.name?"selected":""}>${escapeHtml(c.name)}</option>`).join("")}</select></div>
        <div class="field"><label>Status</label><select onchange="S.filters.status=this.value;refreshPage()"><option value="">All Status</option>${["Completed","In Progress","Blocked"].map(x=>`<option ${S.filters.status===x?"selected":""}>${x}</option>`).join("")}</select></div>
        <div class="field"><label>From</label><input type="date" value="${S.filters.from}" onchange="S.filters.from=this.value;refreshPage()"></div>
        <div class="field"><label>To</label><input type="date" value="${S.filters.to}" onchange="S.filters.to=this.value;refreshPage()"></div>
        <div style="display:flex;align-items:flex-end"><button class="btn btn-sm" onclick="resetActivityFilters()">Reset</button></div>
      </div>
    </section>
    <section class="card" style="margin-top:16px">
      <div class="table-wrap">${acts.length?`
        <table class="table"><thead><tr><th>Date</th><th>Activity</th><th>Project / Version</th><th>Category</th><th>Status</th><th>Hours</th><th></th></tr></thead>
        <tbody>${acts.map(a=>{
          const p=projectById(a.projectId),v=versionById(a.versionId);
          return `<tr><td>${fmtDate(a.date)}</td><td><div class="table-title">${escapeHtml(a.title)}</div><div class="table-muted">${escapeHtml(a.details).slice(0,90)}</div></td><td>${escapeHtml(p?.name||"")}<div class="table-muted">${v?escapeHtml(v.number+" · "+v.name):"No version"}</div></td><td>${escapeHtml(a.category)}</td><td>${statusBadge(a.status)}</td><td>${Number(a.hours||0).toFixed(1)}</td><td><div class="row-actions"><button class="icon-btn" title="Edit" onclick="openActivity('${a.id}')">${icon("edit")}</button><button class="icon-btn" title="Delete" onclick="deleteActivity('${a.id}')">${icon("trash")}</button></div></td></tr>`;
        }).join("")}</tbody></table>`:`<div class="empty"><div class="empty-title">No activities found</div><div class="empty-sub">Try resetting the filters or add a new activity.</div></div>`}</div>
    </section>`;
}
function resetActivityFilters(){S.search="";S.filters={project:"",category:"",status:"",from:"",to:""};refreshPage()}
function refreshPage(){renderApp()}

function statusBadge(s){
  const cls=s==="Completed"||s==="Approved"||s==="Won"||s==="Active"||s==="Final"?"badge-success":s==="Rejected"||s==="Lost"||s==="Blocked"||s==="Cancelled"?"badge-danger":s==="In Progress"||s==="Submitted"||s==="Under Review"||s==="Ongoing"||s==="On Hold"?"badge-warning":"badge-neutral";
  return `<span class="badge ${cls}">${escapeHtml(s)}</span>`;
}

function pageProjects(){
  const projects=D.projects.filter(p=>isAdmin()||p.createdBy===D.currentUserId);
  return `
    ${pageHead("Projects","Manage clients, opportunities and their version history.",`<button class="btn btn-primary" onclick="openProject()">${icon("plus")} Add Project</button>`)}
    <div class="project-grid">${projects.length?projects.map(projectCard).join(""):`<div class="card empty" style="grid-column:1/-1"><div class="empty-title">No projects yet</div><div class="empty-sub">Create your first project.</div></div>`}</div>`;
}
function projectCard(p){
  const versions=D.versions.filter(v=>v.projectId===p.id);
  const acts=D.activities.filter(a=>a.projectId===p.id && (isAdmin()||a.userId===D.currentUserId));
  return `<div class="card project-card">
    <div class="project-top"><div><div class="project-name">${escapeHtml(p.name)}</div><div class="project-client">${escapeHtml(p.client)}</div></div>${statusBadge(p.projectStatus)}</div>
    <div class="project-pills">${p.pillars.map(x=>`<span class="badge badge-blue">${escapeHtml(x)}</span>`).join("")}</div>
    <div style="margin-top:10px">${statusBadge(p.dealStatus)}</div>
    <div class="project-stats"><div><div class="stat-value">${versions.length}</div><div class="stat-label">Versions</div></div><div><div class="stat-value">${acts.length}</div><div class="stat-label">Activities</div></div><div><div class="stat-value">${acts.reduce((s,a)=>s+Number(a.hours||0),0).toFixed(1)}</div><div class="stat-label">Hours</div></div></div>
    <div class="actions" style="margin-top:13px"><button class="btn btn-sm" onclick="openProjectDetail('${p.id}')">${icon("eye")} View</button><button class="btn btn-sm" onclick="openProject('${p.id}')">${icon("edit")} Edit</button><button class="btn btn-sm btn-danger" onclick="deleteProject('${p.id}')">${icon("trash")} Delete</button></div>
  </div>`;
}
function openProjectDetail(id){S.projectId=id;S.page="projectDetail";render()}
function pageProjectDetail(){
  const p=projectById(S.projectId); if(!p)return pageProjects();
  const versions=D.versions.filter(v=>v.projectId===p.id);
  return `
    <div class="actions" style="margin-bottom:14px"><button class="btn btn-sm" onclick="go('projects')">${icon("back")} Back to Projects</button></div>
    <section class="card detail-hero">
      <div class="detail-title-row"><div><div class="detail-name">${escapeHtml(p.name)}</div><div class="detail-client">${escapeHtml(p.client)}</div><div class="detail-pills">${p.pillars.map(x=>`<span class="badge badge-blue">${escapeHtml(x)}</span>`).join("")}</div></div><div class="actions"><button class="btn btn-sm" onclick="openProject('${p.id}')">${icon("edit")} Edit</button><button class="btn btn-primary btn-sm" onclick="openActivity('', '${p.id}')">${icon("plus")} Add Activity</button><button class="btn btn-sm" onclick="openVersion('', '${p.id}')">${icon("plus")} Add Version</button></div></div>
      <div class="detail-info"><div><div class="info-label">Deal Status</div><div class="info-value">${statusBadge(p.dealStatus)}</div></div><div><div class="info-label">Project Status</div><div class="info-value">${statusBadge(p.projectStatus)}</div></div><div><div class="info-label">Start Date</div><div class="info-value">${fmtDate(p.startDate)}</div></div><div><div class="info-label">Target End</div><div class="info-value">${fmtDate(p.targetEndDate)}</div></div></div>
    </section>
    <section class="card section-card">
      <div class="card-head"><div><h2 class="card-title">Versions</h2><p class="card-sub">Major or material deliverable states for this project.</p></div></div>
      <div class="version-list">${versions.length?versions.map(v=>versionCard(v)).join(""):`<div class="empty"><div class="empty-title">No versions yet</div><div class="empty-sub">Add a version when there is a major change in approach or deliverable state.</div></div>`}</div>
    </section>`;
}
function versionCard(v){
  const open=!!S.expandedVersions[v.id];
  const acts=D.activities.filter(a=>a.versionId===v.id && (isAdmin()||a.userId===D.currentUserId)).sort((a,b)=>b.date.localeCompare(a.date));
  return `<div class="version-card">
    <div class="version-head"><div class="version-main"><div class="version-number">${escapeHtml(v.number)}</div><div><div class="version-name">${escapeHtml(v.name)}</div><div class="version-reason">${escapeHtml(v.reason)}</div></div></div><div class="actions">${statusBadge(v.status)}<button class="icon-btn" onclick="S.expandedVersions['${v.id}']=!S.expandedVersions['${v.id}'];refreshPage()">${icon(open?"back":"arrow")}</button><button class="icon-btn" onclick="openVersion('${v.id}')">${icon("edit")}</button></div></div>
    ${open?`<div class="version-body"><div class="version-meta"><span>Created: <strong>${fmtDate(v.date)}</strong></span><span>Activities: <strong>${acts.length}</strong></span>${v.url?`<span><a href="${escapeHtml(v.url)}" target="_blank">${icon("link")} Version URL</a></span>`:""}</div><div class="actions" style="margin-top:11px"><button class="btn btn-sm btn-primary" onclick="openActivity('', '${v.projectId}', '${v.id}')">${icon("plus")} Add Activity</button><button class="btn btn-sm" onclick="deleteVersion('${v.id}')">${icon("trash")} Delete Version</button></div><div class="version-activities">${activityList(acts)}</div></div>`:""}
  </div>`;
}

function pageReports(){
  const acts=D.activities.filter(a=>isAdmin()||a.userId===D.currentUserId).filter(a=>!S.filters.from||a.date>=S.filters.from).filter(a=>!S.filters.to||a.date<=S.filters.to);
  const hours=acts.reduce((s,a)=>s+Number(a.hours||0),0);
  const byProject={}; const byCat={};
  acts.forEach(a=>{const p=projectById(a.projectId)?.name||"Unknown";byProject[p]=(byProject[p]||0)+1;byCat[a.category]=(byCat[a.category]||0)+1});
  return `
    ${pageHead("Reports","Summarize your recorded work over a selected period.",`<button class="btn" onclick="exportCsv()">${icon("download")} Export CSV</button><button class="btn" onclick="window.print()">Print / PDF</button>`)}
    <section class="card section-card" style="margin-bottom:16px"><div class="form-grid"><div class="field"><label>From</label><input type="date" value="${S.filters.from}" onchange="S.filters.from=this.value;refreshPage()"></div><div class="field"><label>To</label><input type="date" value="${S.filters.to}" onchange="S.filters.to=this.value;refreshPage()"></div></div></section>
    <div class="report-grid"><div class="card report-box"><div class="report-label">Activities</div><div class="report-value">${acts.length}</div></div><div class="card report-box"><div class="report-label">Hours</div><div class="report-value">${hours.toFixed(1)}</div></div><div class="card report-box"><div class="report-label">Projects touched</div><div class="report-value">${Object.keys(byProject).length}</div></div></div>
    <div class="grid-2" style="margin-top:16px">
      <section class="card section-card"><div class="card-head"><div><h2 class="card-title">By Project</h2></div></div>${Object.keys(byProject).length?Object.entries(byProject).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div style="display:flex;justify-content:space-between;padding:11px 0;border-bottom:1px solid var(--line);font-size:12px"><span>${escapeHtml(k)}</span><strong>${v}</strong></div>`).join(""):`<div class="empty"><div class="empty-title">No report data</div></div>`}</section>
      <section class="card section-card"><div class="card-head"><div><h2 class="card-title">By Category</h2></div></div>${Object.keys(byCat).length?Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div style="display:flex;justify-content:space-between;padding:11px 0;border-bottom:1px solid var(--line);font-size:12px"><span>${escapeHtml(k)}</span><strong>${v}</strong></div>`).join(""):`<div class="empty"><div class="empty-title">No report data</div></div>`}</section>
    </div>`;
}

function pageSettings(){
  if(!isAdmin())return pageDashboard();
  return `
    ${pageHead("Settings","Manage the master values used throughout the tracker. Only active values appear in new forms.")}
    <div class="note" style="margin-bottom:16px">Inactive master values remain on historical records but are hidden from new selections. This prevents historical data from being broken by configuration changes.</div>
    <div class="settings-grid">
      ${masterCard("Activity Categories",D.categories,"category","Category")}
      ${masterCard("Pillars",D.pillars,"pillar","Pillar")}
      ${masterCard("Deal Status",D.dealStatuses,"dealStatus","Deal Status")}
      ${masterCard("Project Status",D.projectStatuses,"projectStatus","Project Status")}
      ${masterCard("Version Status",D.versionStatuses,"versionStatus","Version Status")}
    </div>`;
}
function masterCard(title,list,type,label){
  list=[...list].sort((a,b)=>a.order-b.order);
  return `<section class="card master-card"><div class="card-head"><div><h2 class="card-title">${title}</h2><p class="card-sub">${list.filter(x=>x.active).length} active · ${list.length} total</p></div><button class="btn btn-sm btn-primary" onclick="openMaster('${type}')">${icon("plus")} Add</button></div><div class="master-list">${list.map(x=>`
    <div class="master-row"><div><div class="master-name">${escapeHtml(x.name)}</div>${x.description?`<div class="master-description">${escapeHtml(x.description)}</div>`:""}</div>
      <div class="toggle-wrap"><span class="toggle-label ${x.active?"on":""}">${x.active?"Active":"Inactive"}</span><button class="toggle ${x.active?"on":""}" aria-label="Toggle ${escapeHtml(x.name)}" onclick="toggleMaster('${type}','${x.id}')"><span></span></button></div>
      <div class="row-actions"><button class="icon-btn" title="Edit" onclick="openMaster('${type}','${x.id}')">${icon("edit")}</button><button class="icon-btn" title="Delete" onclick="deleteMaster('${type}','${x.id}')">${icon("trash")}</button></div>
    </div>`).join("")}</div></section>`;
}

function pageProfile(){
  const u=currentUser();
  return `
    ${pageHead("Profile","Manage your profile and, for administrators, the people who can access the application.",isAdmin()?`<button class="btn btn-primary" onclick="openUser()">${icon("plus")} Add User</button>`:"")}
    <div class="profile-grid">
      <section class="card profile-card">
        <div class="profile-header"><div class="profile-avatar">${initials(u.name)}</div><div><div class="profile-name">${escapeHtml(u.name)}</div><div class="profile-role">${escapeHtml(u.designation||"")} · ${escapeHtml(u.role)}</div></div></div>
        <div class="form-grid">
          ${profileInfo("Name",u.name)}${profileInfo("Email",u.email)}${profileInfo("Employee ID",u.employeeId)}${profileInfo("Designation",u.designation)}${profileInfo("Practice / Business Unit",u.practice)}${profileInfo("Manager",u.manager)}${profileInfo("Location",u.location)}${profileInfo("Joining Date",u.joiningDate?fmtDate(u.joiningDate):"—")}${profileInfo("Profile URL",u.profileUrl||"—")}${profileInfo("Role",u.role)}<div class="span-2">${profileInfo("Bio",u.bio||"—")}</div>
        </div>
        <div class="actions" style="margin-top:18px"><button class="btn btn-primary" onclick="openUser('${u.id}')">${icon("edit")} Edit My Profile</button></div>
      </section>
      ${isAdmin()?`
      <section class="card profile-card">
        <div class="card-head"><div><h2 class="card-title">User Access</h2><p class="card-sub">Only active profiles can access the application.</p></div><span class="badge badge-blue">${D.users.filter(x=>x.active).length} active</span></div>
        <div class="user-list">${D.users.map(x=>`
          <div class="user-row"><div><div class="user-name">${escapeHtml(x.name)}</div><div class="user-email">${escapeHtml(x.email)}</div></div><div>${escapeHtml(x.designation||"—")}</div><div>${statusBadge(x.role)}</div><div>${x.active?statusBadge("Active"):statusBadge("Inactive")}</div><div class="row-actions"><button class="icon-btn" onclick="openUser('${x.id}')">${icon("edit")}</button></div></div>`).join("")}</div>
      </section>`:""}
    </div>`;
}
function profileInfo(label,value){return `<div><div class="info-label">${label}</div><div class="info-value">${escapeHtml(value||"—")}</div></div>`}

function openActivity(id="",projectId="",versionId=""){
  const a=D.activities.find(x=>x.id===id);
  const selectedProject=projectId||a?.projectId||"";
  const selectedVersion=versionId||a?.versionId||"";
  openModal(a?"Edit Activity":"Add Activity",`
    <form id="activityForm" onsubmit="saveActivity(event,'${id}')">
      <div class="form-grid">
        <div class="field"><label>Date</label><input id="afDate" type="date" required value="${a?.date||today}"></div>
        <div class="field"><label>Project</label><select id="afProject" required onchange="populateActivityVersions()"><option value="">Select project</option>${D.projects.filter(p=>isAdmin()||p.createdBy===D.currentUserId).map(p=>`<option value="${p.id}" ${selectedProject===p.id?"selected":""}>${escapeHtml(p.name)}</option>`).join("")}</select></div>
        <div class="field"><label>Version</label><select id="afVersion"><option value="">No version</option>${D.versions.filter(v=>v.projectId===selectedProject).map(v=>`<option value="${v.id}" ${selectedVersion===v.id?"selected":""}>${escapeHtml(v.number+" · "+v.name)}</option>`).join("")}</select></div>
        <div class="field"><label>Category</label><select id="afCategory" required><option value="">Select category</option>${activeCategories().map(c=>`<option ${a?.category===c.name?"selected":""}>${escapeHtml(c.name)}</option>`).join("")}</select></div>
        <div class="field span-2"><label>Activity Title</label><input id="afTitle" required value="${escapeHtml(a?.title||"")}" placeholder="What did you do?"></div>
        <div class="field span-2"><label>Details / Outcome</label><textarea id="afDetails" required placeholder="Capture the work performed and outcome.">${escapeHtml(a?.details||"")}</textarea></div>
        <div class="field"><label>Status</label><select id="afStatus">${["Completed","In Progress","Blocked"].map(x=>`<option ${a?.status===x?"selected":""}>${x}</option>`).join("")}</select></div>
        <div class="field"><label>Hours</label><input id="afHours" type="number" min="0" step="0.25" value="${a?.hours??""}" required></div>
        <div class="field"><label>URL</label><input id="afUrl" type="url" value="${escapeHtml(a?.url||"")}" placeholder="https://..."></div>
        <div class="field"><label>Tags</label><input id="afTags" value="${escapeHtml(a?.tags||"")}" placeholder="Azure, AI, Power BI"></div>
      </div>
      <div class="modal-foot"><button type="button" class="btn" onclick="closeModal()">Cancel</button><button class="btn btn-primary" type="submit">${a?"Save Changes":"Add Activity"}</button></div>
    </form>`);
}
function populateActivityVersions(){
  const project=el("afProject")?.value||"";
  const select=el("afVersion"); if(!select)return;
  select.innerHTML='<option value="">No version</option>'+D.versions.filter(v=>v.projectId===project).map(v=>`<option value="${v.id}">${escapeHtml(v.number+" · "+v.name)}</option>`).join("");
}
function saveActivity(e,id){
  e.preventDefault();
  const obj={projectId:el("afProject").value,versionId:el("afVersion").value,date:el("afDate").value,category:el("afCategory").value,title:el("afTitle").value.trim(),details:el("afDetails").value.trim(),status:el("afStatus").value,hours:Number(el("afHours").value),url:el("afUrl").value.trim(),tags:el("afTags").value.trim(),userId:currentUser().id};
  if(!obj.projectId||!obj.category||!obj.title){toast("Please complete the required fields.","error");return}
  if(id){Object.assign(D.activities.find(a=>a.id===id),obj);toast("Activity updated","success")}else{D.activities.push({id:uid("a"),...obj});toast("Activity added","success")}
  closeModal();refreshPage();
}
function deleteActivity(id){
  if(!confirm("Delete this activity? This cannot be undone in the prototype."))return;
  D.activities=D.activities.filter(a=>a.id!==id);toast("Activity deleted","success");refreshPage();
}

function openProject(id=""){
  const p=D.projects.find(x=>x.id===id);
  openModal(p?"Edit Project":"Add Project",`
    <form onsubmit="saveProject(event,'${id}')"><div class="form-grid">
      <div class="field"><label>Project Name</label><input id="pfName" required value="${escapeHtml(p?.name||"")}"></div>
      <div class="field"><label>Client / Account</label><input id="pfClient" required value="${escapeHtml(p?.client||"")}"></div>
      <div class="field"><label>Deal Status</label><select id="pfDeal">${activeDealStatuses().map(x=>`<option ${p?.dealStatus===x.name?"selected":""}>${escapeHtml(x.name)}</option>`).join("")}</select></div>
      <div class="field"><label>Project Status</label><select id="pfStatus">${activeProjectStatuses().map(x=>`<option ${p?.projectStatus===x.name?"selected":""}>${escapeHtml(x.name)}</option>`).join("")}</select></div>
      <div class="field"><label>Start Date</label><input id="pfStart" type="date" value="${p?.startDate||""}"></div>
      <div class="field"><label>Target End Date</label><input id="pfEnd" type="date" value="${p?.targetEndDate||""}"></div>
      <div class="field span-2"><label>Project URL</label><input id="pfUrl" type="url" value="${escapeHtml(p?.url||"")}" placeholder="https://..."></div>
      <div class="field span-2"><label>Pillars</label><div class="pill-select">${activePillars().map(x=>`<button type="button" class="pill-option ${p?.pillars?.includes(x.name)?"selected":""}" data-pillar="${escapeHtml(x.name)}" onclick="this.classList.toggle('selected')">${escapeHtml(x.name)}</button>`).join("")}</div></div>
      <div class="field span-2"><label>Notes</label><textarea id="pfNotes">${escapeHtml(p?.notes||"")}</textarea></div>
    </div><div class="modal-foot"><button type="button" class="btn" onclick="closeModal()">Cancel</button><button class="btn btn-primary" type="submit">${p?"Save Changes":"Add Project"}</button></div></form>`);
}
function saveProject(e,id){
  e.preventDefault();
  const pillars=[...document.querySelectorAll("[data-pillar].selected")].map(x=>x.dataset.pillar);
  const obj={name:el("pfName").value.trim(),client:el("pfClient").value.trim(),dealStatus:el("pfDeal").value,projectStatus:el("pfStatus").value,startDate:el("pfStart").value,targetEndDate:el("pfEnd").value,url:el("pfUrl").value.trim(),pillars,notes:el("pfNotes").value.trim()};
  if(id){Object.assign(projectById(id),obj);toast("Project updated","success")}else{D.projects.push({id:uid("p"),...obj,createdBy:currentUser().id});toast("Project added","success")}
  closeModal();refreshPage();
}

function deleteProject(id){
  const p=projectById(id);
  if(!p)return;
  const versionCount=D.versions.filter(v=>v.projectId===id).length;
  const activityCount=D.activities.filter(a=>a.projectId===id).length;
  openModal("Delete Project",`
    <div class="note" style="border-color:#f0c7cb;background:#fff5f5;color:#7e3036">
      <strong>This action is permanent.</strong><br>
      Deleting <strong>${escapeHtml(p.name)}</strong> will also delete ${versionCount} version${versionCount===1?"":"s"} and ${activityCount} activit${activityCount===1?"y":"ies"} associated with this project.
    </div>
    <div style="margin-top:15px;font-size:12px;color:var(--muted)">The project, its versions and its activities will be removed from this prototype.</div>
    <div class="modal-foot">
      <button type="button" class="btn" onclick="closeModal()">Cancel</button>
      <button type="button" class="btn btn-danger" onclick="confirmDeleteProject('${id}')">${icon("trash")} Delete Project</button>
    </div>`);
}
function confirmDeleteProject(id){
  const p=projectById(id);
  if(!p)return;
  D.activities=D.activities.filter(a=>a.projectId!==id);
  D.versions=D.versions.filter(v=>v.projectId!==id);
  D.projects=D.projects.filter(x=>x.id!==id);
  closeModal();
  if(S.projectId===id)S.projectId=null;
  toast(`Project "${p.name}" deleted`,"success");
  S.page="projects";
  refreshPage();
}

function openVersion(id="",projectId=""){
  const v=D.versions.find(x=>x.id===id);
  const pid=projectId||v?.projectId||S.projectId||"";
  const nextNumber=v?.number||`V${D.versions.filter(x=>x.projectId===pid).length+1}`;
  openModal(v?"Edit Version":"Add Version",`
    <form onsubmit="saveVersion(event,'${id}')"><div class="form-grid">
      <div class="field"><label>Project</label><select id="vfProject" required ${v||projectId?"disabled":""}>${D.projects.filter(p=>isAdmin()||p.createdBy===D.currentUserId).map(p=>`<option value="${p.id}" ${pid===p.id?"selected":""}>${escapeHtml(p.name)}</option>`).join("")}</select></div>
      <div class="field"><label>Version Number</label><input id="vfNumber" required value="${escapeHtml(nextNumber)}"></div>
      <div class="field span-2"><label>Version Name</label><input id="vfName" required value="${escapeHtml(v?.name||"")}"></div>
      <div class="field"><label>Reason</label><select id="vfReason">${["New project approach","Client feedback","Client rejection","Major scope change","Internal refinement","Final version","Other"].map(x=>`<option ${v?.reason===x?"selected":""}>${x}</option>`).join("")}</select></div>
      <div class="field"><label>Version Status</label><select id="vfStatus">${activeVersionStatuses().map(x=>`<option ${v?.status===x.name?"selected":""}>${escapeHtml(x.name)}</option>`).join("")}</select></div>
      <div class="field"><label>Creation Date</label><input id="vfDate" type="date" value="${v?.date||today}"></div>
      <div class="field"><label>Version URL</label><input id="vfUrl" type="url" value="${escapeHtml(v?.url||"")}" placeholder="https://..."></div>
      <div class="field span-2"><label>Notes</label><textarea id="vfNotes">${escapeHtml(v?.notes||"")}</textarea></div>
    </div><div class="modal-foot"><button type="button" class="btn" onclick="closeModal()">Cancel</button><button class="btn btn-primary" type="submit">${v?"Save Changes":"Add Version"}</button></div></form>`);
}
function saveVersion(e,id){
  e.preventDefault();
  const obj={projectId:el("vfProject").value,number:el("vfNumber").value.trim(),name:el("vfName").value.trim(),reason:el("vfReason").value,status:el("vfStatus").value,date:el("vfDate").value,url:el("vfUrl").value.trim(),notes:el("vfNotes").value.trim()};
  if(id){Object.assign(versionById(id),obj);toast("Version updated","success")}else{D.versions.push({id:uid("v"),...obj});toast("Version added","success")}
  closeModal();refreshPage();
}
function deleteVersion(id){
  const has=D.activities.some(a=>a.versionId===id);
  if(has){toast("This version has activities. Delete or reassign those activities first.","error");return}
  if(!confirm("Delete this version?"))return;
  D.versions=D.versions.filter(v=>v.id!==id);toast("Version deleted","success");refreshPage();
}

const masterMap={category:"categories",pillar:"pillars",dealStatus:"dealStatuses",projectStatus:"projectStatuses",versionStatus:"versionStatuses"};
function openMaster(type,id=""){
  const arr=D[masterMap[type]], item=arr.find(x=>x.id===id);
  openModal(item?"Edit Master Value":"Add Master Value",`
    <form onsubmit="saveMaster(event,'${type}','${id}')"><div class="form-grid">
      <div class="field span-2"><label>${type==="category"?"Category":type==="pillar"?"Pillar":type==="dealStatus"?"Deal Status":type==="projectStatus"?"Project Status":"Version Status"} Name</label><input id="mfName" required value="${escapeHtml(item?.name||"")}"></div>
      ${type==="category"||type==="pillar"?`<div class="field span-2"><label>Description</label><textarea id="mfDesc">${escapeHtml(item?.description||"")}</textarea></div>`:""}
      <div class="field"><label>Display Order</label><input id="mfOrder" type="number" min="1" value="${item?.order||arr.length+1}"></div>
      <div class="field"><label>Active</label><div class="toggle-wrap" style="margin-top:4px"><button type="button" id="mfToggle" class="toggle ${item?.active!==false?"on":""}" onclick="this.classList.toggle('on')"><span></span></button><span id="mfToggleLabel" class="toggle-label ${item?.active!==false?"on":""}">${item?.active!==false?"Active":"Inactive"}</span></div></div>
    </div><div class="modal-foot"><button type="button" class="btn" onclick="closeModal()">Cancel</button><button class="btn btn-primary" type="submit">${item?"Save Changes":"Add Value"}</button></div></form>`);
  const t=el("mfToggle"); t?.addEventListener("click",()=>{const on=t.classList.contains("on");el("mfToggleLabel").textContent=on?"Active":"Inactive";el("mfToggleLabel").className=`toggle-label ${on?"on":""}`});
}
function saveMaster(e,type,id){
  e.preventDefault();
  const arr=D[masterMap[type]], active=el("mfToggle").classList.contains("on");
  const obj={name:el("mfName").value.trim(),active,order:Number(el("mfOrder").value)||arr.length+1};
  if(type==="category"||type==="pillar")obj.description=el("mfDesc").value.trim();
  if(!obj.name){toast("Name is required","error");return}
  if(id){Object.assign(arr.find(x=>x.id===id),obj);toast("Master value updated","success")}else{arr.push({id:uid(type),...obj});toast("Master value added","success")}
  closeModal();refreshPage();
}
function toggleMaster(type,id){
  const item=D[masterMap[type]].find(x=>x.id===id); if(!item)return;
  item.active=!item.active;toast(`${item.name} is now ${item.active?"Active":"Inactive"}`,"success");refreshPage();
}
function masterUsed(type,name){
  if(type==="category")return D.activities.some(a=>a.category===name);
  if(type==="pillar")return D.projects.some(p=>p.pillars?.includes(name));
  if(type==="dealStatus")return D.projects.some(p=>p.dealStatus===name);
  if(type==="projectStatus")return D.projects.some(p=>p.projectStatus===name);
  if(type==="versionStatus")return D.versions.some(v=>v.status===name);
  return false;
}
function deleteMaster(type,id){
  const arr=D[masterMap[type]], item=arr.find(x=>x.id===id); if(!item)return;
  if(masterUsed(type,item.name)){toast("This value is already used by existing records. Deactivate it instead of deleting it.","error");return}
  if(!confirm(`Delete "${item.name}"?`))return;
  D[masterMap[type]]=arr.filter(x=>x.id!==id);toast("Master value deleted","success");refreshPage();
}

function openUser(id=""){
  if(!isAdmin() && id!==currentUser().id){toast("Only administrators can manage users.","error");return}
  const u=D.users.find(x=>x.id===id)||{};
  openModal(id?"Edit User":"Add User",`
    <form onsubmit="saveUser(event,'${id}')"><div class="form-grid">
      <div class="field"><label>Name</label><input id="ufName" required value="${escapeHtml(u.name||"")}"></div>
      <div class="field"><label>Email</label><input id="ufEmail" type="email" required value="${escapeHtml(u.email||"")}"></div>
      <div class="field"><label>Employee ID</label><input id="ufEmp" value="${escapeHtml(u.employeeId||"")}"></div>
      <div class="field"><label>Designation</label><input id="ufDesignation" required value="${escapeHtml(u.designation||"")}"></div>
      <div class="field"><label>Practice / Business Unit</label><input id="ufPractice" value="${escapeHtml(u.practice||"")}"></div>
      <div class="field"><label>Manager</label><input id="ufManager" value="${escapeHtml(u.manager||"")}"></div>
      <div class="field"><label>Location</label><input id="ufLocation" value="${escapeHtml(u.location||"")}"></div>
      <div class="field"><label>Joining Date</label><input id="ufJoining" type="date" value="${u.joiningDate||""}"></div>
      <div class="field"><label>Profile URL</label><input id="ufUrl" type="url" value="${escapeHtml(u.profileUrl||"")}" placeholder="https://..."></div>
      <div class="field"><label>Role</label><select id="ufRole"><option ${u.role==="User"?"selected":""}>User</option><option ${u.role==="Admin"?"selected":""}>Admin</option></select></div>
      <div class="field"><label>${id?"Password":"Initial Password"}</label><input id="ufPassword" type="password" ${id?"":"required"} value="${escapeHtml(id?"":u.password||"")}" placeholder="${id?"Leave blank to keep current password":"Set a temporary password"}"></div>
      <div class="field"><label>Access</label><div class="toggle-wrap" style="margin-top:4px"><button type="button" id="ufActive" class="toggle ${u.active!==false?"on":""}" onclick="this.classList.toggle('on')"><span></span></button><span id="ufActiveLabel" class="toggle-label ${u.active!==false?"on":""}">${u.active!==false?"Active":"Inactive"}</span></div></div>
      <div class="field span-2"><label>Bio</label><textarea id="ufBio">${escapeHtml(u.bio||"")}</textarea></div>
    </div><div class="modal-foot"><button type="button" class="btn" onclick="closeModal()">Cancel</button><button class="btn btn-primary" type="submit">${id?"Save Changes":"Create User"}</button></div></form>`);
  el("ufActive")?.addEventListener("click",()=>{const on=el("ufActive").classList.contains("on");el("ufActiveLabel").textContent=on?"Active":"Inactive";el("ufActiveLabel").className=`toggle-label ${on?"on":""}`});
}
function saveUser(e,id){
  e.preventDefault();
  const email=el("ufEmail").value.trim().toLowerCase();
  if(D.users.some(u=>u.email.toLowerCase()===email && u.id!==id)){toast("Another user already uses this email.","error");return}
  const password=el("ufPassword").value;
  const existing=D.users.find(u=>u.id===id);
  if(!id && !password){toast("An initial password is required.","error");return}
  const obj={
    name:el("ufName").value.trim(),email,employeeId:el("ufEmp").value.trim(),
    designation:el("ufDesignation").value.trim(),practice:el("ufPractice").value.trim(),
    manager:el("ufManager").value.trim(),location:el("ufLocation").value.trim(),
    joiningDate:el("ufJoining").value,profileUrl:el("ufUrl").value.trim(),bio:el("ufBio").value.trim(),
    role:el("ufRole").value,active:el("ufActive").classList.contains("on")
  };
  if(password)obj.password=password;
  if(id){
    Object.assign(existing,obj);
    if(existing.id===currentUser().id && !existing.active){
      localStorage.removeItem(SESSION_KEY);
      S.authenticated=false;
      closeModal();render();toast("Your access has been deactivated.","error");return;
    }
    if(existing.id===currentUser().id && existing.role!=="Admin"){
      // Keep current UI permissions aligned after a role change.
      S.page="dashboard";
    }
    toast("User profile updated","success");
  }else{
    D.users.push({id:uid("u"),...obj});
    toast("User created. Share the login details securely with the user.","success");
  }
  closeModal();refreshPage();
}

function openModal(title,body){
  el("modalRoot").innerHTML=`<div class="modal-backdrop" onclick="if(event.target===this)closeModal()"><div class="modal"><div class="modal-head"><div><div class="modal-title">${title}</div><div class="modal-sub">Complete the information below.</div></div><button class="icon-btn" onclick="closeModal()">${icon("close")}</button></div><div class="modal-body">${body}</div></div></div>`;
}
function closeModal(){if(el("modalRoot"))el("modalRoot").innerHTML=""}

function exportCsv(){
  const acts=visibleActivities();
  const headers=["Date","Project","Version","Category","Title","Details / Outcome","Status","Hours","URL","Tags"];
  const rows=acts.map(a=>[a.date,projectById(a.projectId)?.name||"",versionById(a.versionId)?.number||"",a.category,a.title,a.details,a.status,a.hours,a.url,a.tags]);
  const csv=[headers,...rows].map(r=>r.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download="work-activity-report.csv";a.click();URL.revokeObjectURL(url);
}

function restoreSession(){
  try{
    const saved=JSON.parse(localStorage.getItem("wat_session")||"null");
    if(saved?.signedIn && saved.userId){
      const u=D.users.find(x=>x.id===saved.userId);
      if(u && u.active){
        D.currentUserId=u.id;
        S.authenticated=true;
      }else{
        localStorage.removeItem("wat_session");
      }
    }
  }catch(e){
    localStorage.removeItem("wat_session");
  }
}

restoreSession();
render();
