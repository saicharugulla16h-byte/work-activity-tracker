/* Work Activity Tracker V2.5
   Supabase-backed, authenticated frontend.
   UI is based on V2.4; persistent data lives in Supabase.
*/
const SUPABASE_URL = "https://uwmsnhglfxntkubfhfyc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_RE4qab_OkBeBS71zlXr3Gw_rjuVD82-";
const SUPABASE_REST_URL = `${SUPABASE_URL}/rest/v1`;
const SUPABASE_AUTH_URL = `${SUPABASE_URL}/auth/v1`;
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
let authSession = null;
let authUser = null;

const iso = (d) => new Date(d).toISOString().slice(0,10);
const today = iso(new Date());

const D = {
  currentUserId: "",
  users: [],
  projects: [],
  versions: [],
  activities: [],
  categories: [],
  pillars: [],
  dealStatuses: [],
  projectStatuses: [],
  versionStatuses: []
};

function dateOnly(v){
  if(!v) return "";
  const s=String(v);
  if(/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m=s.match(/^(\d{4}-\d{2}-\d{2})/);
  if(m)return m[1];
  const d=new Date(v);
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0,10);
}
function boolValue(v){
  if(v===true)return true;
  return ["true","1","yes","active"].includes(String(v).trim().toLowerCase());
}
function splitPillars(v){
  if(Array.isArray(v))return v;
  if(!v)return [];
  return String(v).split(/\s*[;,]\s*/).map(x=>x.trim()).filter(Boolean);
}
function normalizeProfile(r={}){return {id:String(r["Profile ID"]||r.id||""),name:String(r.Name||r.name||""),email:String(r.Email||r.email||""),employeeId:String(r["Employee ID"]||r.employee_id||""),designation:String(r.Designation||r.designation||""),practice:String(r["Practice / Business Unit"]||r.practice_business_unit||""),manager:String(r.Manager||r.manager||""),location:String(r.Location||r.location||""),joiningDate:dateOnly(r["Joining Date"]||r.joining_date),profileUrl:String(r["Profile URL"]||r.profile_url||""),bio:String(r.Bio||r.bio||""),role:String(r.Role||r.role||"User"),active:boolValue(r.Active ?? r.active)};}
function normalizeCategory(r={}){return {id:String(r["Category ID"]||r.id||""),name:String(r["Category Name"]||r.name||""),description:String(r.Description||r.description||""),active:boolValue(r.Active ?? r.active),order:Number(r["Display Order"]??r.display_order??0)};}
function normalizePillar(r={}){return {id:String(r["Pillar ID"]||r.id||""),name:String(r["Pillar Name"]||r.name||""),description:String(r.Description||r.description||""),active:boolValue(r.Active ?? r.active),order:Number(r["Display Order"]??r.display_order??0)};}
function normalizeStatus(r,idField){return {id:String(r[idField]||r.id||""),name:String(r["Status Name"]||r.name||""),active:boolValue(r.Active ?? r.active),order:Number(r["Display Order"]??r.display_order??0)};}
function normalizeProject(r={}){return {id:String(r["Project ID"]||r.id||""),name:String(r["Project Name"]||r.name||""),client:String(r["Client / Account"]||r.client_account||""),url:String(r["Project URL"]||r.project_url||""),dealStatusId:String(r["Deal Status ID"]||r.deal_status_id||""),projectStatusId:String(r["Project Status ID"]||r.project_status_id||""),dealStatus:"",projectStatus:"",startDate:dateOnly(r["Start Date"]||r.start_date),targetEndDate:dateOnly(r["Target End Date"]||r.target_end_date),notes:String(r.Notes||r.notes||""),createdBy:String(r["Created By"]||r.created_by||""),pillars:splitPillars(r.Pillars||r.pillars)};}
function normalizeVersion(r={}){return {id:String(r["Version ID"]||r.id||""),projectId:String(r["Project ID"]||r.project_id||""),number:String(r["Version Number"]||r.version_number||""),name:String(r["Version Name"]||r.version_name||""),reason:String(r.Reason||r.reason||""),statusId:String(r["Version Status ID"]||r.version_status_id||""),status:"",url:String(r["Version URL"]||r.version_url||""),date:dateOnly(r["Created Date"]||r.created_date),notes:String(r.Notes||r.notes||"")};}
function normalizeActivity(r={}){return {id:String(r["Activity ID"]||r.id||""),projectId:String(r["Project ID"]||r.project_id||""),versionId:String(r["Version ID"]||r.version_id||""),date:dateOnly(r["Activity Date"]||r.activity_date),categoryId:String(r["Category ID"]||r.category_id||""),category:"",title:String(r["Activity Title"]||r.activity_title||""),details:String(r["Details / Outcome"]||r.details_outcome||""),status:String(r["Activity Status"]||r.activity_status||""),hours:Number(r.Hours??r.hours??0),url:String(r.URL||r.url||""),tags:String(r.Tags||r.tags||""),userId:String(r["User ID"]||r.user_id||"")};}

const tableMap={
  users:"profiles",projects:"projects",versions:"versions",activities:"activities",
  categories:"activity_categories",pillars:"pillars",dealStatuses:"deal_statuses",
  projectStatuses:"project_statuses",versionStatuses:"version_statuses",projectPillars:"project_pillars"
};
const masterTableMap={category:"activity_categories",pillar:"pillars",dealStatus:"deal_statuses",projectStatus:"project_statuses",versionStatus:"version_statuses"};

function sbHeaders(extra={}){
  const token=authSession?.access_token||SUPABASE_PUBLISHABLE_KEY;
  return {"apikey":SUPABASE_PUBLISHABLE_KEY,"Authorization":`Bearer ${token}`,"Content-Type":"application/json",...extra};
}
async function sbFetch(path,options={}){
  const response=await fetch(`${SUPABASE_REST_URL}/${path}`,{...options,headers:sbHeaders(options.headers||{})});
  const text=await response.text();
  let body=null;
  if(text){try{body=JSON.parse(text)}catch(_){body=text}}
  if(!response.ok){
    const msg=body?.message||body?.hint||body?.details||body?.error||`Supabase request failed (${response.status})`;
    throw new Error(String(msg));
  }
  return body;
}

function dbToProfile(r){return {"Profile ID":r.id,Name:r.name||"",Email:r.email||"","Employee ID":r.employee_id||"",Designation:r.designation||"","Practice / Business Unit":r.practice_business_unit||"",Manager:r.manager||"",Location:r.location||"","Joining Date":r.joining_date||"","Profile URL":r.profile_url||"",Bio:r.bio||"",Role:r.role||"User",Active:r.active!==false};}
function dbToCategory(r){return {"Category ID":r.id,"Category Name":r.name||"",Description:r.description||"",Active:r.active!==false,"Display Order":r.display_order||0};}
function dbToPillar(r){return {"Pillar ID":r.id,"Pillar Name":r.name||"",Description:r.description||"",Active:r.active!==false,"Display Order":r.display_order||0};}
function dbToStatus(r,idLabel){return {[idLabel]:r.id,"Status Name":r.name||"",Active:r.active!==false,"Display Order":r.display_order||0};}
function dbToProject(r,pillarNames=[]){return {"Project ID":r.id,"Project Name":r.name||"","Client / Account":r.client_account||"","Project URL":r.project_url||"","Deal Status ID":r.deal_status_id||"","Project Status ID":r.project_status_id||"","Start Date":r.start_date||"","Target End Date":r.target_end_date||"",Notes:r.notes||"","Created By":r.created_by||"",Pillars:pillarNames};}
function dbToVersion(r){return {"Version ID":r.id,"Project ID":r.project_id,"Version Number":r.version_number||"","Version Name":r.version_name||"",Reason:r.reason||"","Version Status ID":r.version_status_id||"","Version URL":r.version_url||"","Created Date":r.created_date||"",Notes:r.notes||""};}
function dbToActivity(r){return {"Activity ID":r.id,"Project ID":r.project_id,"Version ID":r.version_id||"","Activity Date":r.activity_date||"","Category ID":r.category_id||"","Activity Title":r.activity_title||"","Details / Outcome":r.details_outcome||"","Activity Status":r.activity_status||"",Hours:r.hours??0,URL:r.url||"",Tags:r.tags||"","User ID":r.user_id||""};}

async function fetchTable(table,query="select=*"){
  return await sbFetch(`${table}?${query}`) || [];
}
async function bootstrapData(){
  const [profiles,projects,versions,activities,categories,pillars,dealStatuses,projectStatuses,versionStatuses,projectPillars]=await Promise.all([
    fetchTable(tableMap.users,`select=id,name,email,employee_id,designation,practice_business_unit,manager,location,joining_date,profile_url,bio,role,active&id=eq.${encodeURIComponent(authUser.id)}`),
    fetchTable(tableMap.projects,"select=*&order=name.asc"),
    fetchTable(tableMap.versions,"select=*&order=created_date.asc"),
    fetchTable(tableMap.activities,"select=*&order=activity_date.desc"),
    fetchTable(tableMap.categories,"select=*&order=display_order.asc"),
    fetchTable(tableMap.pillars,"select=*&order=display_order.asc"),
    fetchTable(tableMap.dealStatuses,"select=*&order=display_order.asc"),
    fetchTable(tableMap.projectStatuses,"select=*&order=display_order.asc"),
    fetchTable(tableMap.versionStatuses,"select=*&order=display_order.asc"),
    fetchTable(tableMap.projectPillars,"select=project_id,pillar_id")
  ]);
  const pillarById=Object.fromEntries(pillars.map(x=>[String(x.id),x.name]));
  const projectPillarsByProject={};
  projectPillars.forEach(x=>{(projectPillarsByProject[x.project_id] ||= []); const n=pillarById[String(x.pillar_id)]; if(n) projectPillarsByProject[x.project_id].push(n)});
  return {
    profiles:profiles.map(dbToProfile),
    projects:projects.map(x=>dbToProject(x,projectPillarsByProject[x.id]||[])),
    versions:versions.map(dbToVersion),activities:activities.map(dbToActivity),
    activityCategories:categories.map(dbToCategory),pillars:pillars.map(dbToPillar),
    dealStatuses:dealStatuses.map(x=>dbToStatus(x,"Deal Status ID")),
    projectStatuses:projectStatuses.map(x=>dbToStatus(x,"Project Status ID")),
    versionStatuses:versionStatuses.map(x=>dbToStatus(x,"Version Status ID"))
  };
}

function projectPayload(data){return {name:data["Project Name"],client_account:data["Client / Account"],project_url:data["Project URL"]||null,deal_status_id:data["Deal Status ID"]||null,project_status_id:data["Project Status ID"]||null,start_date:data["Start Date"]||null,target_end_date:data["Target End Date"]||null,notes:data.Notes||null};}
function versionPayload(data){return {project_id:data["Project ID"],version_number:data["Version Number"],version_name:data["Version Name"],reason:data.Reason||null,version_status_id:data["Version Status ID"]||null,version_url:data["Version URL"]||null,created_date:data["Created Date"]||null,notes:data.Notes||null};}
function activityPayload(data){return {project_id:data["Project ID"],version_id:data["Version ID"]||null,activity_date:data["Activity Date"],category_id:data["Category ID"],activity_title:data["Activity Title"],details_outcome:data["Details / Outcome"],activity_status:data["Activity Status"],hours:Number(data.Hours||0),url:data.URL||null,tags:data.Tags||null,user_id:authUser.id};}
function profilePayload(data){return {id:authUser.id,name:data.Name,email:data.Email,employee_id:data["Employee ID"]||null,designation:data.Designation||null,practice_business_unit:data["Practice / Business Unit"]||null,manager:data.Manager||null,location:data.Location||null,joining_date:data["Joining Date"]||null,profile_url:data["Profile URL"]||null,bio:data.Bio||null,role:data.Role||"User",active:data.Active!==false};}

async function replaceProjectPillars(projectId,pillarNames=[]){
  await sbFetch(`project_pillars?project_id=eq.${encodeURIComponent(projectId)}`,{method:"DELETE",headers:{"Prefer":"return=minimal"}});
  const ids=pillarNames.map(n=>D.pillars.find(p=>p.name===n)?.id).filter(Boolean);
  if(ids.length)await sbFetch("project_pillars",{method:"POST",headers:{"Prefer":"return=minimal"},body:JSON.stringify(ids.map(pillar_id=>({project_id:projectId,pillar_id})))});
}

async function apiRequest(action,payload={}){
  if(action==="bootstrap")return bootstrapData();
  if(action==="create"||action==="update"||action==="delete"){
    const entity=payload.entity, id=payload.id, data=payload.data||{};
    const table=tableMap[entity]||entity;
    if(entity==="projects"){
      if(action==="create"){
        const rows=await sbFetch("projects",{method:"POST",headers:{"Prefer":"return=representation"},body:JSON.stringify({...projectPayload(data),created_by:authUser.id})});
        const row=rows?.[0]; if(!row)throw new Error("Project was not created.");
        await replaceProjectPillars(row.id,data.Pillars?splitPillars(data.Pillars):[]); return row;
      }
      if(action==="update"){
        const rows=await sbFetch(`projects?id=eq.${encodeURIComponent(id)}`,{method:"PATCH",headers:{"Prefer":"return=representation"},body:JSON.stringify(projectPayload(data))});
        await replaceProjectPillars(id,data.Pillars?splitPillars(data.Pillars):[]); return rows?.[0]||{};
      }
      await sbFetch(`activities?project_id=eq.${encodeURIComponent(id)}`,{method:"DELETE",headers:{"Prefer":"return=minimal"}});
      await sbFetch(`versions?project_id=eq.${encodeURIComponent(id)}`,{method:"DELETE",headers:{"Prefer":"return=minimal"}});
      await sbFetch(`project_pillars?project_id=eq.${encodeURIComponent(id)}`,{method:"DELETE",headers:{"Prefer":"return=minimal"}});
      await sbFetch(`projects?id=eq.${encodeURIComponent(id)}`,{method:"DELETE",headers:{"Prefer":"return=minimal"}}); return {};
    }
    if(entity==="versions"||entity==="activities"){
      const dbData=entity==="versions"?versionPayload(data):activityPayload(data);
      if(action==="create")return (await sbFetch(table,{method:"POST",headers:{"Prefer":"return=representation"},body:JSON.stringify(dbData)}))?.[0]||{};
      if(action==="update")return (await sbFetch(`${table}?id=eq.${encodeURIComponent(id)}`,{method:"PATCH",headers:{"Prefer":"return=representation"},body:JSON.stringify(dbData)}))?.[0]||{};
      await sbFetch(`${table}?id=eq.${encodeURIComponent(id)}`,{method:"DELETE",headers:{"Prefer":"return=minimal"}}); return {};
    }
    throw new Error(`Unsupported entity: ${entity}`);
  }
  if(action==="createMaster"||action==="updateMaster"||action==="deleteMaster"){
    const table=masterTableMap[payload.entity]||payload.entity, id=payload.id, data=payload.data||{};
    const dbData={};
    if(payload.entity==="activity_categories")dbData.name=data["Category Name"];
    else if(payload.entity==="pillars")dbData.name=data["Pillar Name"];
    else dbData.name=data["Status Name"];
    if(data.Description!==undefined)dbData.description=data.Description||null;
    if(data.Active!==undefined)dbData.active=data.Active;
    if(data["Display Order"]!==undefined)dbData.display_order=Number(data["Display Order"]||0);
    if(action==="createMaster")return (await sbFetch(table,{method:"POST",headers:{"Prefer":"return=representation"},body:JSON.stringify(dbData)}))?.[0]||{};
    if(action==="updateMaster")return (await sbFetch(`${table}?id=eq.${encodeURIComponent(id)}`,{method:"PATCH",headers:{"Prefer":"return=representation"},body:JSON.stringify(dbData)}))?.[0]||{};
    await sbFetch(`${table}?id=eq.${encodeURIComponent(id)}`,{method:"DELETE",headers:{"Prefer":"return=minimal"}}); return {};
  }
  if(action==="createUser"||action==="updateUser"){
    const id=payload.id, data=profilePayload(payload.data||{});
    if(action==="createUser")return (await sbFetch("profiles",{method:"POST",headers:{"Prefer":"return=representation"},body:JSON.stringify(data)}))?.[0]||{};
    return (await sbFetch(`profiles?id=eq.${encodeURIComponent(id)}`,{method:"PATCH",headers:{"Prefer":"return=representation"},body:JSON.stringify(data)}))?.[0]||{};
  }
  throw new Error(`Unsupported request: ${action}`);
}

function applyBootstrap(data){
  const categories=(data.activityCategories||[]).map(normalizeCategory);
  const pillars=(data.pillars||[]).map(normalizePillar);
  const dealStatuses=(data.dealStatuses||[]).map(r=>normalizeStatus(r,"Deal Status ID"));
  const projectStatuses=(data.projectStatuses||[]).map(r=>normalizeStatus(r,"Project Status ID"));
  const versionStatuses=(data.versionStatuses||[]).map(r=>normalizeStatus(r,"Version Status ID"));
  const projects=(data.projects||[]).map(normalizeProject), versions=(data.versions||[]).map(normalizeVersion), activities=(data.activities||[]).map(normalizeActivity), users=(data.profiles||[]).map(normalizeProfile);
  const dealById=Object.fromEntries(dealStatuses.map(x=>[x.id,x.name])), projectByStatusId=Object.fromEntries(projectStatuses.map(x=>[x.id,x.name])), versionByStatusId=Object.fromEntries(versionStatuses.map(x=>[x.id,x.name])), categoryById=Object.fromEntries(categories.map(x=>[x.id,x.name]));
  projects.forEach(p=>{p.dealStatus=dealById[p.dealStatusId]||"";p.projectStatus=projectByStatusId[p.projectStatusId]||"";});
  versions.forEach(v=>v.status=versionByStatusId[v.statusId]||""); activities.forEach(a=>a.category=categoryById[a.categoryId]||"");
  D.users=users; D.projects=projects; D.versions=versions; D.activities=activities; D.categories=categories; D.pillars=pillars; D.dealStatuses=dealStatuses; D.projectStatuses=projectStatuses; D.versionStatuses=versionStatuses;
  if(users[0])D.currentUserId=users[0].id;
}

async function loadBackendData(){const data=await apiRequest("bootstrap");applyBootstrap(data);return data;}
async function syncAfterChange(){try{await loadBackendData();refreshPage();}catch(err){handleApiError(err);}}
function handleApiError(err){toast(String(err?.message||err||"Request failed"),"error");}

const S = {page:"dashboard",projectId:null,search:"",filters:{project:"",category:"",status:"",from:"",to:""},expandedVersions:{},loading:true};


const el = (id) => document.getElementById(id);
const currentUser = () => D.users.find(u=>u.id===D.currentUserId) || {id:authUser?.id||"",name:authUser?.email?.split("@")[0]||"Workspace",email:authUser?.email||"",designation:"",practice:"",manager:"",location:"",joiningDate:"",profileUrl:"",bio:"",role:"User",active:true};
const isAdmin = () => true;
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

function render(){document.title="Work Activity Tracker";renderApp();}
function renderApp(){
  const u=currentUser();
  el("app").innerHTML=`
    <div class="app-shell">
      <aside class="sidebar" id="sidebar">
        <div class="brand"><div class="brand-name">WORK ACTIVITY<br>TRACKER</div></div>
        <nav class="nav">
          ${navBtn("dashboard","Dashboard","dashboard")}
          ${navBtn("activities","Activities","activity")}
          ${navBtn("projects","Projects","projects")}
          ${navBtn("reports","Reports","report")}
          ${navBtn("settings","Settings","settings")}
          ${navBtn("profile","Profile","profile")}
        </nav>
        <div class="sidebar-bottom">
          <div class="user-mini"><div class="avatar">${initials(u.name||"WAT")}</div><div><div class="user-mini-name">${escapeHtml(u.name||"Workspace")}</div><div class="user-mini-role">Signed in</div></div></div>
          <button class="logout-btn" onclick="logout()">${icon("logout")} Sign out</button><div class="note" style="font-size:10px;padding:8px 9px;background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.1);color:#b9c7d9">Authenticated via Supabase</div>
        </div>
      </aside>
      <main class="main">
        <header class="topbar"><div class="topbar-actions"><button class="icon-btn mobile-menu" onclick="toggleSidebar()">${icon("menu")}</button><span class="page-label">Work Activity Tracker</span></div><div class="topbar-actions"><button class="btn btn-sm" onclick="go('profile')">${icon("user")} ${escapeHtml(u.name||"Workspace")}</button></div></header>
        <div class="content">${renderPage()}</div>
      </main>
    </div><div id="modalRoot"></div>`;
}
function navBtn(page,label,ic){return `<button class="nav-btn ${S.page===page?"active":""}" onclick="go('${page}')"><span class="nav-icon">${icon(ic)}</span>${label}</button>`;}
function go(page){S.page=page;S.projectId=null;closeModal();render();window.scrollTo(0,0);}
function toggleSidebar(){el("sidebar")?.classList.toggle("open")}
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
  let list=D.activities.slice();
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
  const projects=D.projects;
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
  const projects=D.projects;
  return `
    ${pageHead("Projects","Manage clients, opportunities and their version history.",`<button class="btn btn-primary" onclick="openProject()">${icon("plus")} Add Project</button>`)}
    <div class="project-grid">${projects.length?projects.map(projectCard).join(""):`<div class="card empty" style="grid-column:1/-1"><div class="empty-title">No projects yet</div><div class="empty-sub">Create your first project.</div></div>`}</div>`;
}
function projectCard(p){
  const versions=D.versions.filter(v=>v.projectId===p.id);
  const acts=D.activities.filter(a=>a.projectId===p.id);
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
  const acts=D.activities.filter(a=>a.versionId===v.id).sort((a,b)=>b.date.localeCompare(a.date));
  return `<div class="version-card">
    <div class="version-head"><div class="version-main"><div class="version-number">${escapeHtml(v.number)}</div><div><div class="version-name">${escapeHtml(v.name)}</div><div class="version-reason">${escapeHtml(v.reason)}</div></div></div><div class="actions">${statusBadge(v.status)}<button class="icon-btn" onclick="S.expandedVersions['${v.id}']=!S.expandedVersions['${v.id}'];refreshPage()">${icon(open?"back":"arrow")}</button><button class="icon-btn" onclick="openVersion('${v.id}')">${icon("edit")}</button></div></div>
    ${open?`<div class="version-body"><div class="version-meta"><span>Created: <strong>${fmtDate(v.date)}</strong></span><span>Activities: <strong>${acts.length}</strong></span>${v.url?`<span><a href="${escapeHtml(v.url)}" target="_blank">${icon("link")} Version URL</a></span>`:""}</div><div class="actions" style="margin-top:11px"><button class="btn btn-sm btn-primary" onclick="openActivity('', '${v.projectId}', '${v.id}')">${icon("plus")} Add Activity</button><button class="btn btn-sm" onclick="deleteVersion('${v.id}')">${icon("trash")} Delete Version</button></div><div class="version-activities">${activityList(acts)}</div></div>`:""}
  </div>`;
}

function pageReports(){
  const acts=D.activities.slice().filter(a=>!S.filters.from||a.date>=S.filters.from).filter(a=>!S.filters.to||a.date<=S.filters.to);
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
  return `${pageHead("Profile","Your appraisal and professional profile information.")}
    <section class="card profile-card">
      <div class="profile-header"><div class="profile-avatar">${initials(u.name||"Workspace")}</div><div><div class="profile-name">${escapeHtml(u.name||"Workspace")}</div><div class="profile-role">${escapeHtml(u.designation||"Workspace profile")}</div></div></div>
      <div class="note">Your account identity is managed by Supabase Authentication. This profile stores only the professional information used by the tracker.</div>
      <div class="form-grid" style="margin-top:18px">${profileInfo("Name",u.name||"—")}${profileInfo("Email",u.email||"—")}${profileInfo("Employee ID",u.employeeId||"—")}${profileInfo("Designation",u.designation||"—")}${profileInfo("Practice / Business Unit",u.practice||"—")}${profileInfo("Manager",u.manager||"—")}</div>
      <div class="actions" style="margin-top:18px"><button class="btn btn-primary" onclick="openUser('${u.id||""}')">${icon("edit")} ${u.id?"Edit Profile":"Create Profile"}</button></div>
    </section>`;
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
        <div class="field"><label>Project</label><select id="afProject" required onchange="populateActivityVersions()"><option value="">Select project</option>${D.projects.map(p=>`<option value="${p.id}" ${selectedProject===p.id?"selected":""}>${escapeHtml(p.name)}</option>`).join("")}</select></div>
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
async function saveActivity(e,id){
  e.preventDefault();
  const categoryName=el("afCategory").value;
  const category=D.categories.find(c=>c.name===categoryName);
  const obj={
    "Project ID":el("afProject").value,
    "Version ID":el("afVersion").value,
    "Activity Date":el("afDate").value,
    "Category ID":category?.id||"",
    "Activity Title":el("afTitle").value.trim(),
    "Details / Outcome":el("afDetails").value.trim(),
    "Activity Status":el("afStatus").value,
    "Hours":Number(el("afHours").value),
    "URL":el("afUrl").value.trim(),
    "Tags":el("afTags").value.trim()
  };
  if(!obj["Project ID"]||!obj["Category ID"]||!obj["Activity Title"]){toast("Please complete the required fields.","error");return}
  try{
    if(id)await apiRequest("update",{entity:"activities",id,data:obj});
    else await apiRequest("create",{entity:"activities",data:obj});
    closeModal();
    await syncAfterChange();
    toast(id?"Activity updated":"Activity added","success");
  }catch(err){handleApiError(err)}
}
async function deleteActivity(id){
  if(!confirm("Delete this activity? This cannot be undone."))return;
  try{
    await apiRequest("delete",{entity:"activities",id});
    await syncAfterChange();
    toast("Activity deleted","success");
  }catch(err){handleApiError(err)}
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
async function saveProject(e,id){
  e.preventDefault();
  const pillars=[...document.querySelectorAll("[data-pillar].selected")].map(x=>x.dataset.pillar);
  const deal=D.dealStatuses.find(x=>x.name===el("pfDeal").value);
  const status=D.projectStatuses.find(x=>x.name===el("pfStatus").value);
  const obj={
    "Project Name":el("pfName").value.trim(),
    "Client / Account":el("pfClient").value.trim(),
    "Project URL":el("pfUrl").value.trim(),
    "Deal Status ID":deal?.id||"",
    "Project Status ID":status?.id||"",
    "Start Date":el("pfStart").value,
    "Target End Date":el("pfEnd").value,
    "Notes":el("pfNotes").value.trim(),
    "Pillars":pillars.join(", ")
  };
  if(!obj["Project Name"]||!obj["Client / Account"]){toast("Please complete the required fields.","error");return}
  try{
    if(id)await apiRequest("update",{entity:"projects",id,data:obj});
    else await apiRequest("create",{entity:"projects",data:obj});
    closeModal();
    await syncAfterChange();
    toast(id?"Project updated":"Project added","success");
  }catch(err){handleApiError(err)}
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
async function confirmDeleteProject(id){
  const p=projectById(id);
  if(!p)return;
  try{
    await apiRequest("delete",{entity:"projects",id});
    closeModal();
    if(S.projectId===id)S.projectId=null;
    S.page="projects";
    await syncAfterChange();
    toast(`Project "${p.name}" deleted`,"success");
  }catch(err){handleApiError(err)}
}

function openVersion(id="",projectId=""){
  const v=D.versions.find(x=>x.id===id);
  const pid=projectId||v?.projectId||S.projectId||"";
  const nextNumber=v?.number||`V${D.versions.filter(x=>x.projectId===pid).length+1}`;
  openModal(v?"Edit Version":"Add Version",`
    <form onsubmit="saveVersion(event,'${id}')"><div class="form-grid">
      <div class="field"><label>Project</label><select id="vfProject" required ${v||projectId?"disabled":""}>${D.projects.map(p=>`<option value="${p.id}" ${pid===p.id?"selected":""}>${escapeHtml(p.name)}</option>`).join("")}</select></div>
      <div class="field"><label>Version Number</label><input id="vfNumber" required value="${escapeHtml(nextNumber)}"></div>
      <div class="field span-2"><label>Version Name</label><input id="vfName" required value="${escapeHtml(v?.name||"")}"></div>
      <div class="field"><label>Reason</label><select id="vfReason">${["New project approach","Client feedback","Client rejection","Major scope change","Internal refinement","Final version","Other"].map(x=>`<option ${v?.reason===x?"selected":""}>${x}</option>`).join("")}</select></div>
      <div class="field"><label>Version Status</label><select id="vfStatus">${activeVersionStatuses().map(x=>`<option ${v?.status===x.name?"selected":""}>${escapeHtml(x.name)}</option>`).join("")}</select></div>
      <div class="field"><label>Creation Date</label><input id="vfDate" type="date" value="${v?.date||today}"></div>
      <div class="field"><label>Version URL</label><input id="vfUrl" type="url" value="${escapeHtml(v?.url||"")}" placeholder="https://..."></div>
      <div class="field span-2"><label>Notes</label><textarea id="vfNotes">${escapeHtml(v?.notes||"")}</textarea></div>
    </div><div class="modal-foot"><button type="button" class="btn" onclick="closeModal()">Cancel</button><button class="btn btn-primary" type="submit">${v?"Save Changes":"Add Version"}</button></div></form>`);
}
async function saveVersion(e,id){
  e.preventDefault();
  const status=D.versionStatuses.find(x=>x.name===el("vfStatus").value);
  const obj={
    "Project ID":el("vfProject").value,
    "Version Number":el("vfNumber").value.trim(),
    "Version Name":el("vfName").value.trim(),
    "Reason":el("vfReason").value,
    "Version Status ID":status?.id||"",
    "Created Date":el("vfDate").value,
    "Version URL":el("vfUrl").value.trim(),
    "Notes":el("vfNotes").value.trim()
  };
  try{
    if(id)await apiRequest("update",{entity:"versions",id,data:obj});
    else await apiRequest("create",{entity:"versions",data:obj});
    closeModal();
    await syncAfterChange();
    toast(id?"Version updated":"Version added","success");
  }catch(err){handleApiError(err)}
}
async function deleteVersion(id){
  const has=D.activities.some(a=>a.versionId===id);
  if(has){toast("This version has activities. Delete or reassign those activities first.","error");return}
  if(!confirm("Delete this version?"))return;
  try{
    await apiRequest("delete",{entity:"versions",id});
    await syncAfterChange();
    toast("Version deleted","success");
  }catch(err){handleApiError(err)}
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
async function saveMaster(e,type,id){
  e.preventDefault();
  const arr=D[masterMap[type]], active=el("mfToggle").classList.contains("on");
  const name=el("mfName").value.trim();
  const order=Number(el("mfOrder").value)||arr.length+1;
  if(!name){toast("Name is required","error");return}
  const data={"Active":active,"Display Order":order};
  if(type==="category")data["Category Name"]=name;
  if(type==="pillar")data["Pillar Name"]=name;
  if(type==="dealStatus"||type==="projectStatus"||type==="versionStatus")data["Status Name"]=name;
  if(type==="category"||type==="pillar")data["Description"]=el("mfDesc").value.trim();
  try{
    if(id)await apiRequest("updateMaster",{entity:masterTableMap[type],id,data});
    else await apiRequest("createMaster",{entity:masterTableMap[type],data});
    closeModal();
    await syncAfterChange();
    toast(id?"Master value updated":"Master value added","success");
  }catch(err){handleApiError(err)}
}
async function toggleMaster(type,id){
  const item=D[masterMap[type]].find(x=>x.id===id); if(!item)return;
  const data={"Active":!item.active};
  try{
    await apiRequest("updateMaster",{entity:masterTableMap[type],id,data});
    await syncAfterChange();
    toast(`${item.name} is now ${!item.active?"Active":"Inactive"}`,"success");
  }catch(err){handleApiError(err)}
}
function masterUsed(type,name){
  if(type==="category")return D.activities.some(a=>a.category===name);
  if(type==="pillar")return D.projects.some(p=>p.pillars?.includes(name));
  if(type==="dealStatus")return D.projects.some(p=>p.dealStatus===name);
  if(type==="projectStatus")return D.projects.some(p=>p.projectStatus===name);
  if(type==="versionStatus")return D.versions.some(v=>v.status===name);
  return false;
}
async function deleteMaster(type,id){
  const arr=D[masterMap[type]], item=arr.find(x=>x.id===id); if(!item)return;
  if(masterUsed(type,item.name)){toast("This value is already used by existing records. Deactivate it instead of deleting it.","error");return}
  if(!confirm(`Delete "${item.name}"?`))return;
  try{
    await apiRequest("deleteMaster",{entity:masterTableMap[type],id});
    await syncAfterChange();
    toast("Master value deleted","success");
  }catch(err){handleApiError(err)}
}

function openUser(id=""){
  const u=D.users.find(x=>x.id===id)||currentUser();
  openModal(id?"Edit Profile":"Create Profile",`<form onsubmit="saveUser(event,'${id}')"><div class="form-grid">
    <div class="field"><label>Name</label><input id="ufName" required value="${escapeHtml(u.name||"")}"></div>
    <div class="field"><label>Email</label><input id="ufEmail" type="email" value="${escapeHtml(u.email||"")}"></div>
    <div class="field"><label>Employee ID</label><input id="ufEmp" value="${escapeHtml(u.employeeId||"")}"></div>
    <div class="field"><label>Designation</label><input id="ufDesignation" value="${escapeHtml(u.designation||"")}"></div>
    <div class="field"><label>Practice / Business Unit</label><input id="ufPractice" value="${escapeHtml(u.practice||"")}"></div>
    <div class="field"><label>Manager</label><input id="ufManager" value="${escapeHtml(u.manager||"")}"></div>
    <div class="field"><label>Location</label><input id="ufLocation" value="${escapeHtml(u.location||"")}"></div>
    <div class="field"><label>Joining Date</label><input id="ufJoining" type="date" value="${u.joiningDate||""}"></div>
    <div class="field"><label>Profile URL</label><input id="ufUrl" type="url" value="${escapeHtml(u.profileUrl||"")}" placeholder="https://..."></div>
    <div class="field span-2"><label>Bio</label><textarea id="ufBio">${escapeHtml(u.bio||"")}</textarea></div>
  </div><div class="modal-foot"><button type="button" class="btn" onclick="closeModal()">Cancel</button><button class="btn btn-primary" type="submit">${id?"Save Changes":"Create Profile"}</button></div></form>`);
}
async function saveUser(e,id){
  e.preventDefault();
  const data={"Name":el("ufName").value.trim(),"Email":el("ufEmail").value.trim().toLowerCase(),"Employee ID":el("ufEmp").value.trim(),"Designation":el("ufDesignation").value.trim(),"Practice / Business Unit":el("ufPractice").value.trim(),"Manager":el("ufManager").value.trim(),"Location":el("ufLocation").value.trim(),"Joining Date":el("ufJoining").value,"Profile URL":el("ufUrl").value.trim(),"Bio":el("ufBio").value.trim(),"Role":"User","Active":true};
  try{const created=await apiRequest(id?"updateUser":"createUser",id?{id,data}:{data});closeModal();await syncAfterChange();if(created?.id&&!id)D.currentUserId=created.id;toast(id?"Profile updated":"Profile created","success");}catch(err){handleApiError(err)}
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

function showLogin(message=""){
  el("app").innerHTML=`<div class="login-shell"><div class="login-card"><div class="login-brand-mark">WAT</div><div class="login-brand">WORK ACTIVITY TRACKER</div><div class="login-sub">Secure access to your personal work and appraisal tracker.</div><div class="login-divider"></div><h1 class="login-title">Sign in</h1><div class="login-help">Use your Supabase account credentials.</div>${message?`<div class="note" style="margin-bottom:16px;border-color:#efc5c9;background:#fff0f1;color:#9f2933">${escapeHtml(message)}</div>`:""}<form class="login-form" onsubmit="submitLogin(event)"><div class="field"><label>Email</label><input id="loginEmail" type="email" autocomplete="username" required></div><div class="field"><label>Password</label><input id="loginPassword" type="password" autocomplete="current-password" required></div><button class="btn btn-primary login-submit" type="submit">Sign in <span>→</span></button></form><div class="login-security">Authentication handled by Supabase Auth</div></div></div>`;
}
async function submitLogin(e){
  e.preventDefault();
  const btn=e.submitter; if(btn){btn.disabled=true;btn.textContent="Signing in…";}
  try{
    const {data,error}=await supabaseClient.auth.signInWithPassword({email:el("loginEmail").value.trim(),password:el("loginPassword").value});
    if(error)throw error;
    authSession=data.session;authUser=data.user;
    await loadBackendData();S.loading=false;render();
  }catch(err){showLogin(err.message||"Unable to sign in.");}
  finally{if(btn)btn.disabled=false;}
}
async function logout(){
  try{await supabaseClient.auth.signOut();}catch(_){}
  authSession=null;authUser=null;D.currentUserId="";D.users=[];S.page="dashboard";S.projectId=null;showLogin("You have been signed out.");
}
async function init(){
  el("app").innerHTML=`<div class="startup-shell"><div class="startup-card"><div class="login-brand-mark">WAT</div><div class="login-brand">WORK ACTIVITY TRACKER</div><div class="login-sub">Checking secure session…</div></div></div>`;
  try{
    const {data,error}=await supabaseClient.auth.getSession();
    if(error)throw error;
    authSession=data.session;authUser=data.session?.user||null;
    if(!authSession||!authUser){S.loading=false;showLogin();return;}
    await loadBackendData();S.loading=false;render();
  }catch(err){
    S.loading=false;
    el("app").innerHTML=`<div class="startup-shell"><div class="startup-card"><div class="login-brand-mark">WAT</div><div class="login-brand">WORK ACTIVITY TRACKER</div><div class="login-sub">Unable to initialize secure access.</div><div class="note" style="margin-top:16px">${escapeHtml(err.message||String(err))}</div><button class="btn btn-primary" style="width:100%;margin-top:14px" onclick="init()">Retry</button></div></div>`;
  }
}
supabaseClient.auth.onAuthStateChange((event,session)=>{
  authSession=session;authUser=session?.user||null;
  if(event==="SIGNED_OUT")showLogin();
});
init();

