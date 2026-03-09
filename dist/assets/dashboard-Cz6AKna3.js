import{s as m}from"./supabaseClient-D4v529L2.js";/* empty css               */import{r as f}from"./auth-8WVZwt0Y.js";import"https://esm.sh/@supabase/supabase-js@2";const v=document.querySelector(".activity-feed"),_=document.querySelector(".dashboard-right .card:first-child");async function $(){const s=await f();s&&(await Promise.all([g(s.id),y(s.id)]),w(s.id))}async function g(s){const{data:r,error:e}=await m.from("visits").select("id, scheduled_date, status, notes, doctors(name, specialty, clinic_location)").eq("rep_id",s).order("scheduled_date",{ascending:!1}).limit(5);if(e){console.error("Error loading activities:",e);return}if(!r||r.length===0){v.innerHTML=`
      <div class="activity-item">
        <span class="activity-detail">No activities yet. Log your first activity!</span>
      </div>
    `;return}v.innerHTML=r.map(i=>{var n,c,l;const a=new Date(i.scheduled_date).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!0}),o=((n=i.doctors)==null?void 0:n.name)||"Unknown Doctor",p=((c=i.doctors)==null?void 0:c.clinic_location)||"",t=(l=i.doctors)!=null&&l.specialty?"Doctor Visit":"Pharmacy Call";return`
      <div class="activity-item">
        <span class="activity-time">${a}</span>
        <span class="activity-type">${t}</span>
        <span class="activity-detail">${o}${p?" - "+p:""}</span>
      </div>
    `}).join("")}async function y(s){const r=new Date().toISOString().slice(0,7),{data:e,error:i}=await m.from("quotas").select("*").eq("rep_id",s).eq("month",r).single();if(i&&i.code!=="PGRST116"){console.error("Error loading quota:",i);return}const d=new Date;d.setDate(1),d.setHours(0,0,0,0);const{data:a,error:o}=await m.from("visits").select("id, status").eq("rep_id",s).gte("scheduled_date",d.toISOString()).eq("status","completed");if(o){console.error("Error loading visits:",o);return}const p=(a==null?void 0:a.length)||0,t={doctor_visits:(e==null?void 0:e.doctor_visits_target)||10,pharmacy_calls:(e==null?void 0:e.pharmacy_calls_target)||15,sample_distribution:(e==null?void 0:e.sample_distribution_target)||20},n=Math.min(p,t.doctor_visits),c=Math.min(Math.floor(p*.8),t.pharmacy_calls),l=Math.min(Math.floor(p*2),t.sample_distribution),h=`
    <h2>Progress Reporting</h2>
    <p class="card-subtitle">Track your targets and quotas</p>

    <div class="progress-item">
      <div class="progress-header">
        <span>Doctor Visits</span>
        <span class="progress-count">${n}/${t.doctor_visits}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${u(n/t.doctor_visits)}" 
             style="width: ${n/t.doctor_visits*100}%"></div>
      </div>
      <span class="progress-percent">${Math.round(n/t.doctor_visits*100)}%</span>
    </div>

    <div class="progress-item">
      <div class="progress-header">
        <span>Pharmacy Calls</span>
        <span class="progress-count">${c}/${t.pharmacy_calls}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${u(c/t.pharmacy_calls)}" 
             style="width: ${c/t.pharmacy_calls*100}%"></div>
      </div>
      <span class="progress-percent">${Math.round(c/t.pharmacy_calls*100)}%</span>
    </div>

    <div class="progress-item">
      <div class="progress-header">
        <span>Sample Distribution</span>
        <span class="progress-count">${l}/${t.sample_distribution}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${u(l/t.sample_distribution)}" 
             style="width: ${l/t.sample_distribution*100}%"></div>
      </div>
      <span class="progress-percent">${Math.round(l/t.sample_distribution*100)}%</span>
    </div>
  `;_.innerHTML=h}function u(s){return s<.3?"low":s<.7?"medium":"high"}function w(s){const r=document.querySelector(".activity-form");r&&r.addEventListener("submit",async e=>{e.preventDefault();const i=document.getElementById("activity-type").value,d=document.getElementById("activity-details").value,a=document.getElementById("activity-location").value;if(!i){alert("Please select an activity type");return}const{error:o}=await m.from("visits").insert([{rep_id:s,scheduled_date:new Date().toISOString(),status:"completed",notes:d,location:a}]);if(o){console.error("Error logging activity:",o),alert("Failed to log activity. Please try again.");return}r.reset(),await g(s),await y(s),alert("Activity logged successfully!")})}document.addEventListener("DOMContentLoaded",$);
