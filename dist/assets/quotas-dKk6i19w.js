import{s as _}from"./supabaseClient-D4v529L2.js";/* empty css               */import{r as $}from"./auth-8WVZwt0Y.js";import"https://esm.sh/@supabase/supabase-js@2";const h=document.querySelector(".quota-summary"),y=document.querySelector(".quotas-progress .card");async function C(){const t=await $();t&&await M(t.id)}async function M(t){const i=new Date().toISOString().slice(0,7),{data:s,error:e}=await _.from("quotas").select("*").eq("rep_id",t).eq("month",i).single();e&&e.code!=="PGRST116"&&console.error("Error loading quota:",e);const c=new Date;c.setDate(1),c.setHours(0,0,0,0);const{data:a,error:l}=await _.from("visits").select("id, status").eq("rep_id",t).gte("scheduled_date",c.toISOString());l&&console.error("Error loading visits:",l),a!=null&&a.length;const n=(a==null?void 0:a.filter(b=>b.status==="completed").length)||0,r={doctor_visits:(s==null?void 0:s.doctor_visits_target)||25,pharmacy_calls:(s==null?void 0:s.pharmacy_calls_target)||15,sample_distribution:(s==null?void 0:s.sample_distribution_target)||50,meetings:(s==null?void 0:s.meetings_target)||10},d=Math.min(n,r.doctor_visits),m=Math.min(Math.floor(n*.6),r.pharmacy_calls),p=Math.min(Math.floor(n*2.5),r.sample_distribution),u=Math.min(Math.floor(n*.3),r.meetings),g=r.doctor_visits+r.pharmacy_calls+r.sample_distribution+r.meetings,v=d+m+p+u,f=Math.round(v/g*100);S(f,n,g-v),w({doctor_visits:{current:d,target:r.doctor_visits},pharmacy_calls:{current:m,target:r.pharmacy_calls},sample_distribution:{current:p,target:r.sample_distribution},meetings:{current:u,target:r.meetings}})}function S(t,i,s){if(!h)return;const e=h.querySelectorAll(".summary-card");e[0]&&(e[0].querySelector(".summary-number").textContent=`${t}%`),e[1]&&(e[1].querySelector(".summary-number").textContent=i),e[2]&&(e[2].querySelector(".summary-number").textContent=s)}function w(t){if(!y)return;const i=`
    <h2>Activity Quotas</h2>
    <p class="card-subtitle">Progress sa monthly targets</p>

    <div class="quota-item">
      <div class="quota-header">
        <div class="quota-info">
          <span class="material-symbols-outlined">medical_services</span>
          <span>Doctor Visits</span>
        </div>
        <span class="quota-count">${t.doctor_visits.current} / ${t.doctor_visits.target}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${o(t.doctor_visits.current/t.doctor_visits.target)}" 
             style="width: ${t.doctor_visits.current/t.doctor_visits.target*100}%"></div>
      </div>
      <div class="quota-footer">
        <span>${Math.round(t.doctor_visits.current/t.doctor_visits.target*100)}% Complete</span>
        <span>${t.doctor_visits.target-t.doctor_visits.current} na lang</span>
      </div>
    </div>

    <div class="quota-item">
      <div class="quota-header">
        <div class="quota-info">
          <span class="material-symbols-outlined">local_pharmacy</span>
          <span>Pharmacy Calls</span>
        </div>
        <span class="quota-count">${t.pharmacy_calls.current} / ${t.pharmacy_calls.target}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${o(t.pharmacy_calls.current/t.pharmacy_calls.target)}" 
             style="width: ${t.pharmacy_calls.current/t.pharmacy_calls.target*100}%"></div>
      </div>
      <div class="quota-footer">
        <span>${Math.round(t.pharmacy_calls.current/t.pharmacy_calls.target*100)}% Complete</span>
        <span>${t.pharmacy_calls.target-t.pharmacy_calls.current} na lang</span>
      </div>
    </div>

    <div class="quota-item">
      <div class="quota-header">
        <div class="quota-info">
          <span class="material-symbols-outlined">medication</span>
          <span>Sample Distribution</span>
        </div>
        <span class="quota-count">${t.sample_distribution.current} / ${t.sample_distribution.target}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${o(t.sample_distribution.current/t.sample_distribution.target)}" 
             style="width: ${t.sample_distribution.current/t.sample_distribution.target*100}%"></div>
      </div>
      <div class="quota-footer">
        <span>${Math.round(t.sample_distribution.current/t.sample_distribution.target*100)}% Complete</span>
        <span>${t.sample_distribution.target-t.sample_distribution.current} na lang</span>
      </div>
    </div>

    <div class="quota-item">
      <div class="quota-header">
        <div class="quota-info">
          <span class="material-symbols-outlined">groups</span>
          <span>Meetings</span>
        </div>
        <span class="quota-count">${t.meetings.current} / ${t.meetings.target}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${o(t.meetings.current/t.meetings.target)}" 
             style="width: ${t.meetings.current/t.meetings.target*100}%"></div>
      </div>
      <div class="quota-footer">
        <span>${Math.round(t.meetings.current/t.meetings.target*100)}% Complete</span>
        <span>${t.meetings.target-t.meetings.current} na lang</span>
      </div>
    </div>
  `;y.innerHTML=i}function o(t){return t<.3?"low":t<.7?"medium":"high"}document.addEventListener("DOMContentLoaded",C);
