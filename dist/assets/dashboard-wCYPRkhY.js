import{r as T,u as E,s as d}from"./auth-lOpszQbR.js";/* empty css               */import"https://esm.sh/@supabase/supabase-js@2";const f=document.querySelector(".activity-feed"),L=document.querySelector(".dashboard-right .card:first-child");async function C(){const i=await T();i&&(await E(),await Promise.all([$(i.id),b(i.id)]),I(i.id))}function P(i){return i?i.split("-").map(a=>a.charAt(0).toUpperCase()+a.slice(1)).join(" "):"Activity"}async function $(i){f.innerHTML=`
    <div class="activity-item">
      <span class="activity-detail">Loading activities...</span>
    </div>
  `;const{data:{session:a}}=await d.auth.getSession();if(!a){f.innerHTML=`
      <div class="activity-item">
        <span class="activity-detail">Session expired. Please log in again.</span>
      </div>
    `;return}const p=a.user.id,[n,e]=await Promise.all([d.from("activities").select("id, activity_type, details, location, created_at").eq("rep_id",p).order("created_at",{ascending:!1}).limit(10),d.from("visits").select("id, scheduled_date, status, notes, doctors(name, specialty, clinic_location)").eq("rep_id",p).order("scheduled_date",{ascending:!1}).limit(10)]);n.error&&console.error("Error loading activities:",n.error),e.error&&console.error("Error loading visits:",e.error);const c=n.data||[],o=e.data||[];if(c.length===0&&o.length===0){f.innerHTML=`
      <div class="activity-item">
        <span class="activity-detail">No activities yet. Log your first activity!</span>
      </div>
    `;return}const r=[...c.map(t=>({id:t.id,type:"activity",date:new Date(t.created_at),activityType:P(t.activity_type),detail:t.details||"",location:t.location||""})),...o.map(t=>{var s,u,v;const l=((s=t.doctors)==null?void 0:s.name)||"Unknown Doctor",m=((u=t.doctors)==null?void 0:u.clinic_location)||"",g=(v=t.doctors)!=null&&v.specialty?"Doctor Visit":"Pharmacy Call";return{id:t.id,type:"visit",date:new Date(t.scheduled_date),activityType:g,detail:`${l}${m?" - "+m:""}`,location:m}})];r.sort((t,l)=>l.date-t.date);const _=r.slice(0,10);f.innerHTML=_.map(t=>`
      <div class="activity-item">
        <span class="activity-time">${t.date.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!0})}</span>
        <span class="activity-type">${t.activityType}</span>
        <span class="activity-detail">${t.detail}${t.location&&!t.detail.includes(t.location)?" - "+t.location:""}</span>
      </div>
    `).join("")}async function b(i){const{data:{session:a}}=await d.auth.getSession();if(!a){console.error("Session expired in loadProgressReporting");return}const p=a.user.id,n=new Date().toISOString().slice(0,7),{data:e,error:c}=await d.from("quotas").select("*").eq("rep_id",p).eq("month",n).single();if(c&&c.code!=="PGRST116"){console.error("Error loading quota:",c);return}const o=new Date;o.setDate(1),o.setHours(0,0,0,0);const r=new Date;r.setMonth(r.getMonth()+1),r.setDate(0),r.setHours(23,59,59,999);const{data:_,error:t}=await d.from("activities").select("activity_type").eq("rep_id",p).gte("created_at",o.toISOString()).lte("created_at",r.toISOString());t&&console.error("Error loading activities:",t);let l=0,m=0,g=0;(_||[]).forEach(D=>{var S;const y=((S=D.activity_type)==null?void 0:S.toLowerCase())||"";y.includes("doctor")||y.includes("visit")?l++:y.includes("pharmacy")||y.includes("call")?m++:y.includes("sample")||y.includes("distribution")?g++:l++});const s={doctor_visits:(e==null?void 0:e.doctor_visits_target)||10,pharmacy_calls:(e==null?void 0:e.pharmacy_calls_target)||15,sample_distribution:(e==null?void 0:e.sample_distribution_target)||20},u=Math.min(l,s.doctor_visits),v=Math.min(m,s.pharmacy_calls),h=Math.min(g,s.sample_distribution),M=`
    <h2>Progress Reporting</h2>
    <p class="card-subtitle">Track your targets and quotas</p>

    <div class="progress-item">
      <div class="progress-header">
        <span>Doctor Visits</span>
        <span class="progress-count">${u}/${s.doctor_visits}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${w(u/s.doctor_visits)}" 
             style="width: ${u/s.doctor_visits*100}%"></div>
      </div>
      <span class="progress-percent">${Math.round(u/s.doctor_visits*100)}%</span>
    </div>

    <div class="progress-item">
      <div class="progress-header">
        <span>Pharmacy Calls</span>
        <span class="progress-count">${v}/${s.pharmacy_calls}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${w(v/s.pharmacy_calls)}" 
             style="width: ${v/s.pharmacy_calls*100}%"></div>
      </div>
      <span class="progress-percent">${Math.round(v/s.pharmacy_calls*100)}%</span>
    </div>

    <div class="progress-item">
      <div class="progress-header">
        <span>Sample Distribution</span>
        <span class="progress-count">${h}/${s.sample_distribution}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${w(h/s.sample_distribution)}" 
             style="width: ${h/s.sample_distribution*100}%"></div>
      </div>
      <span class="progress-percent">${Math.round(h/s.sample_distribution*100)}%</span>
    </div>
  `;L.innerHTML=M}function w(i){return i<.3?"low":i<.7?"medium":"high"}function I(i){const a=document.querySelector(".activity-form");a&&a.addEventListener("submit",async p=>{p.preventDefault();const n=document.getElementById("activity-type").value,e=document.getElementById("activity-details").value,c=document.getElementById("activity-location").value;if(!n){alert("Please select an activity type");return}const{data:{session:o}}=await d.auth.getSession();if(!o){alert("Session expired. Please log in again.");return}const{error:r}=await d.from("activities").insert([{rep_id:o.user.id,activity_type:n,details:e,location:c}]);if(r){console.error("Error logging activity:",r),alert("Failed to log activity: "+r.message);return}a.reset(),await $(),await b(),alert("Activity logged successfully!")})}document.addEventListener("DOMContentLoaded",C);
