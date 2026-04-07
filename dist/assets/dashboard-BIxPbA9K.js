import{r as D,u as S,s as m}from"./auth-Bsa9Dh2U.js";/* empty css               */import"https://esm.sh/@supabase/supabase-js@2";const h=document.querySelector(".activity-feed"),E=document.querySelector(".dashboard-right .card:first-child");async function T(){const i=await D();i&&(await S(),await Promise.all([$(i.id),b(i.id)]),L(i.id))}function C(i){return i?i.split("-").map(a=>a.charAt(0).toUpperCase()+a.slice(1)).join(" "):"Activity"}async function $(i){h.innerHTML=`
    <div class="activity-item">
      <span class="activity-detail">Loading activities...</span>
    </div>
  `;const[a,s]=await Promise.all([m.from("activities").select("id, activity_type, details, location, created_at").eq("rep_id",i).order("created_at",{ascending:!1}).limit(10),m.from("visits").select("id, scheduled_date, status, notes, doctors(name, specialty, clinic_location)").eq("rep_id",i).order("scheduled_date",{ascending:!1}).limit(10)]);a.error&&console.error("Error loading activities:",a.error),s.error&&console.error("Error loading visits:",s.error);const o=a.data||[],c=s.data||[];if(o.length===0&&c.length===0){h.innerHTML=`
      <div class="activity-item">
        <span class="activity-detail">No activities yet. Log your first activity!</span>
      </div>
    `;return}const r=[...o.map(t=>({id:t.id,type:"activity",date:new Date(t.created_at),activityType:C(t.activity_type),detail:t.details||"",location:t.location||""})),...c.map(t=>{var e,l,d;const n=((e=t.doctors)==null?void 0:e.name)||"Unknown Doctor",v=((l=t.doctors)==null?void 0:l.clinic_location)||"",y=(d=t.doctors)!=null&&d.specialty?"Doctor Visit":"Pharmacy Call";return{id:t.id,type:"visit",date:new Date(t.scheduled_date),activityType:y,detail:`${n}${v?" - "+v:""}`,location:v}})];r.sort((t,n)=>n.date-t.date);const p=r.slice(0,10);h.innerHTML=p.map(t=>`
      <div class="activity-item">
        <span class="activity-time">${t.date.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!0})}</span>
        <span class="activity-type">${t.activityType}</span>
        <span class="activity-detail">${t.detail}${t.location&&!t.detail.includes(t.location)?" - "+t.location:""}</span>
      </div>
    `).join("")}async function b(i){const a=new Date().toISOString().slice(0,7),{data:s,error:o}=await m.from("quotas").select("*").eq("rep_id",i).eq("month",a).single();if(o&&o.code!=="PGRST116"){console.error("Error loading quota:",o);return}const c=new Date;c.setDate(1),c.setHours(0,0,0,0);const r=new Date;r.setMonth(r.getMonth()+1),r.setDate(0),r.setHours(23,59,59,999);const{data:p,error:t}=await m.from("activities").select("activity_type").eq("rep_id",i).gte("created_at",c.toISOString()).lte("created_at",r.toISOString());t&&console.error("Error loading activities:",t);let n=0,v=0,y=0;(p||[]).forEach(M=>{var f;const u=((f=M.activity_type)==null?void 0:f.toLowerCase())||"";u.includes("doctor")||u.includes("visit")?n++:u.includes("pharmacy")||u.includes("call")?v++:u.includes("sample")||u.includes("distribution")?y++:n++});const e={doctor_visits:(s==null?void 0:s.doctor_visits_target)||10,pharmacy_calls:(s==null?void 0:s.pharmacy_calls_target)||15,sample_distribution:(s==null?void 0:s.sample_distribution_target)||20},l=Math.min(n,e.doctor_visits),d=Math.min(v,e.pharmacy_calls),g=Math.min(y,e.sample_distribution),w=`
    <h2>Progress Reporting</h2>
    <p class="card-subtitle">Track your targets and quotas</p>

    <div class="progress-item">
      <div class="progress-header">
        <span>Doctor Visits</span>
        <span class="progress-count">${l}/${e.doctor_visits}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${_(l/e.doctor_visits)}" 
             style="width: ${l/e.doctor_visits*100}%"></div>
      </div>
      <span class="progress-percent">${Math.round(l/e.doctor_visits*100)}%</span>
    </div>

    <div class="progress-item">
      <div class="progress-header">
        <span>Pharmacy Calls</span>
        <span class="progress-count">${d}/${e.pharmacy_calls}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${_(d/e.pharmacy_calls)}" 
             style="width: ${d/e.pharmacy_calls*100}%"></div>
      </div>
      <span class="progress-percent">${Math.round(d/e.pharmacy_calls*100)}%</span>
    </div>

    <div class="progress-item">
      <div class="progress-header">
        <span>Sample Distribution</span>
        <span class="progress-count">${g}/${e.sample_distribution}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${_(g/e.sample_distribution)}" 
             style="width: ${g/e.sample_distribution*100}%"></div>
      </div>
      <span class="progress-percent">${Math.round(g/e.sample_distribution*100)}%</span>
    </div>
  `;E.innerHTML=w}function _(i){return i<.3?"low":i<.7?"medium":"high"}function L(i){const a=document.querySelector(".activity-form");a&&a.addEventListener("submit",async s=>{s.preventDefault();const o=document.getElementById("activity-type").value,c=document.getElementById("activity-details").value,r=document.getElementById("activity-location").value;if(!o){alert("Please select an activity type");return}const{error:p}=await m.from("activities").insert([{rep_id:i,activity_type:o,details:c,location:r}]);if(p){console.error("Error logging activity:",p),alert("Failed to log activity. Please try again.");return}a.reset(),await $(i),await b(i),alert("Activity logged successfully!")})}document.addEventListener("DOMContentLoaded",T);
