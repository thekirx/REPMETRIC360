import{r as $,u as C,s as _}from"./auth-Bsa9Dh2U.js";/* empty css               */import"https://esm.sh/@supabase/supabase-js@2";const h=document.querySelector(".quota-summary"),y=document.querySelector(".quotas-progress .card");async function M(){const t=await $();t&&(await C(),await S(t.id))}async function S(t){const i=new Date().toISOString().slice(0,7),{data:s,error:a}=await _.from("quotas").select("*").eq("rep_id",t).eq("month",i).single();a&&a.code!=="PGRST116"&&console.error("Error loading quota:",a);const o=new Date;o.setDate(1),o.setHours(0,0,0,0);const{data:e,error:l}=await _.from("visits").select("id, status").eq("rep_id",t).gte("scheduled_date",o.toISOString());l&&console.error("Error loading visits:",l),e!=null&&e.length;const n=(e==null?void 0:e.filter(b=>b.status==="completed").length)||0,r={doctor_visits:(s==null?void 0:s.doctor_visits_target)||25,pharmacy_calls:(s==null?void 0:s.pharmacy_calls_target)||15,sample_distribution:(s==null?void 0:s.sample_distribution_target)||50,meetings:(s==null?void 0:s.meetings_target)||10},d=Math.min(n,r.doctor_visits),m=Math.min(Math.floor(n*.6),r.pharmacy_calls),p=Math.min(Math.floor(n*2.5),r.sample_distribution),u=Math.min(Math.floor(n*.3),r.meetings),g=r.doctor_visits+r.pharmacy_calls+r.sample_distribution+r.meetings,v=d+m+p+u,f=Math.round(v/g*100);w(f,n,g-v),D({doctor_visits:{current:d,target:r.doctor_visits},pharmacy_calls:{current:m,target:r.pharmacy_calls},sample_distribution:{current:p,target:r.sample_distribution},meetings:{current:u,target:r.meetings}})}function w(t,i,s){if(!h)return;const a=h.querySelectorAll(".summary-card");a[0]&&(a[0].querySelector(".summary-number").textContent=`${t}%`),a[1]&&(a[1].querySelector(".summary-number").textContent=i),a[2]&&(a[2].querySelector(".summary-number").textContent=s)}function D(t){if(!y)return;const i=`
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
        <div class="progress-fill ${c(t.doctor_visits.current/t.doctor_visits.target)}" 
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
        <div class="progress-fill ${c(t.pharmacy_calls.current/t.pharmacy_calls.target)}" 
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
        <div class="progress-fill ${c(t.sample_distribution.current/t.sample_distribution.target)}" 
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
        <div class="progress-fill ${c(t.meetings.current/t.meetings.target)}" 
             style="width: ${t.meetings.current/t.meetings.target*100}%"></div>
      </div>
      <div class="quota-footer">
        <span>${Math.round(t.meetings.current/t.meetings.target*100)}% Complete</span>
        <span>${t.meetings.target-t.meetings.current} na lang</span>
      </div>
    </div>
  `;y.innerHTML=i}function c(t){return t<.3?"low":t<.7?"medium":"high"}document.addEventListener("DOMContentLoaded",M);
