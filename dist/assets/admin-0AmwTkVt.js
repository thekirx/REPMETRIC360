import{a as U,l as D,s as p}from"./auth-lOpszQbR.js";/* empty css               */import"https://esm.sh/@supabase/supabase-js@2";const s={totalReps:document.getElementById("totalReps"),activeReps:document.getElementById("activeReps"),totalVisits:document.getElementById("totalVisits"),completedCalls:document.getElementById("completedCalls"),pendingReports:document.getElementById("pendingReports"),quotaAchievement:document.getElementById("quotaAchievement"),sampleDistribution:document.getElementById("sampleDistribution"),upcomingSchedules:document.getElementById("upcomingSchedules"),repMonitoringTable:document.getElementById("repMonitoringTable"),topPerformers:document.getElementById("topPerformers"),underperformers:document.getElementById("underperformers"),visitCompletionRate:document.getElementById("visitCompletionRate"),reportSubmissionTrend:document.getElementById("reportSubmissionTrend"),recentReportsFeed:document.getElementById("recentReportsFeed"),alertsList:document.getElementById("alertsList"),todayAppointments:document.getElementById("todayAppointments"),missedAppointments:document.getElementById("missedAppointments"),completedAppointments:document.getElementById("completedAppointments"),upcomingSchedulesList:document.getElementById("upcomingSchedulesList"),quotaTrackingList:document.getElementById("quotaTrackingList"),quotaAlerts:document.getElementById("quotaAlerts"),lastUpdated:document.getElementById("lastUpdated"),repSearch:document.getElementById("repSearch")};let b=[],q=[],Q=[];async function F(){await U()&&(await A(),X(),C(),setInterval(A,5*60*1e3))}async function A(){try{await Promise.all([V(),j(),G(),z(),J(),K(),W()]),C()}catch(e){console.error("Error loading dashboard data:",e)}}async function V(){try{const{data:e,error:t}=await p.from("profiles").select("id, full_name, email, role, created_at").eq("role","repmeds");if(t)throw t;b=e||[];const a=new Date;a.setHours(0,0,0,0);const r=new Date(a);r.setDate(r.getDate()+1);const{data:i,error:d}=await p.from("visits").select("id, rep_id, status, scheduled_date").gte("scheduled_date",a.toISOString()).lt("scheduled_date",r.toISOString());if(d)throw d;q=i||[];const u=new Set(q.map(h=>h.rep_id)).size,n=q.filter(h=>h.status==="completed").length,{data:c,error:v}=await p.from("reports").select("visit_id").gte("created_at",a.toISOString());if(v)throw v;Q=c||[];const y=new Set(c.map(h=>h.visit_id)),_=q.filter(h=>h.status==="completed"&&!y.has(h.id)).length,l=new Date().toISOString().slice(0,7),{data:g,error:S}=await p.from("quotas").select("*").eq("month",l);if(S)throw S;let I=0;g&&g.length>0&&g.forEach(h=>{const $=(h.doctor_visits_actual||0)/(h.doctor_visits_target||1),O=(h.pharmacy_calls_actual||0)/(h.pharmacy_calls_target||1),x=(h.sample_distribution_actual||0)/(h.sample_distribution_target||1);I+=($+O+x)/3});const w=(g==null?void 0:g.length)>0?Math.round(I/g.length*100):0,{data:L,error:at}=await p.from("sample_distributions").select("quantity").gte("distributed_at",a.toISOString()),H=(L==null?void 0:L.reduce((h,$)=>h+($.quantity||0),0))||0,{data:M,error:rt}=await p.from("visits").select("id").gte("scheduled_date",new Date().toISOString()).eq("status","scheduled").limit(100),N=(M==null?void 0:M.length)||0;f(s.totalReps,b.length),f(s.activeReps,u),f(s.totalVisits,q.length),f(s.completedCalls,n),f(s.pendingReports,_),f(s.quotaAchievement,`${w}%`),f(s.sampleDistribution,H.toLocaleString()),f(s.upcomingSchedules,N)}catch(e){console.error("Error loading summary stats:",e),Y()}}async function j(){try{if(b.length===0){s.repMonitoringTable.innerHTML=`
        <tr><td colspan="6" class="empty-text">No representatives found</td></tr>
      `;return}const e=new Date;e.setHours(0,0,0,0);const t=new Date(e);t.setDate(t.getDate()+1);const{data:a,error:r}=await p.from("visits").select("rep_id, status, scheduled_date, notes").gte("scheduled_date",e.toISOString()).lt("scheduled_date",t.toISOString());if(r)throw r;const i=new Date().toISOString().slice(0,7),{data:d,error:m}=await p.from("quotas").select("rep_id, doctor_visits_target, doctor_visits_actual").eq("month",i);if(m)throw m;const u=b.map(n=>{const c=(a==null?void 0:a.filter(w=>w.rep_id===n.id))||[],v=c.filter(w=>w.status==="completed").length,y=c.length>0?new Date(Math.max(...c.map(w=>new Date(w.scheduled_date)))):null,_=d==null?void 0:d.find(w=>w.rep_id===n.id),l=_?Math.round((_.doctor_visits_actual||0)/(_.doctor_visits_target||1)*100):0;let g="inactive",S="badge-warning";c.length>0&&(g="active",S="badge-success");const I=y?y.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}):"No activity";return{...n,visitsToday:v,quotaProgress:l,status:g,statusClass:S,lastActivity:I,territory:"Metro Manila"}});P(u),window.allRepData=u}catch(e){console.error("Error loading representative monitoring:",e),s.repMonitoringTable.innerHTML=`
      <tr><td colspan="6" class="empty-text">Error loading data</td></tr>
    `}}function P(e){if(e.length===0){s.repMonitoringTable.innerHTML=`
      <tr><td colspan="6" class="empty-text">No representatives found</td></tr>
    `;return}s.repMonitoringTable.innerHTML=e.map(t=>`
    <tr>
      <td>
        <div class="rep-name">${t.full_name||"Unknown"}</div>
        <div class="rep-email">${t.email||""}</div>
      </td>
      <td>${t.territory}</td>
      <td><span class="badge ${t.statusClass}">${t.status}</span></td>
      <td>${t.visitsToday}</td>
      <td>
        <div class="progress-bar" style="height: 8px;">
          <div class="progress-fill ${T(t.quotaProgress/100)}" 
               style="width: ${t.quotaProgress}%"></div>
        </div>
        <span class="progress-percent">${t.quotaProgress}%</span>
      </td>
      <td>${t.lastActivity}</td>
    </tr>
  `).join("")}async function G(){try{const e=new Date;e.setDate(1),e.setHours(0,0,0,0);const{data:t,error:a}=await p.from("visits").select("rep_id, status").gte("scheduled_date",e.toISOString());if(a)throw a;const r={};b.forEach(l=>{r[l.id]={name:l.full_name||"Unknown",completed:0,scheduled:0}}),t==null||t.forEach(l=>{r[l.rep_id]&&(r[l.rep_id].scheduled++,l.status==="completed"&&r[l.rep_id].completed++)});const i=Object.values(r).filter(l=>l.scheduled>0).map(l=>({...l,rate:l.scheduled>0?l.completed/l.scheduled:0})).sort((l,g)=>g.rate-l.rate),d=i.slice(0,3),m=i.slice(-3).reverse(),u=(t==null?void 0:t.length)||0,n=(t==null?void 0:t.filter(l=>l.status==="completed").length)||0,c=u>0?Math.round(n/u*100):0,{data:v,error:y}=await p.from("reports").select("id").gte("created_at",e.toISOString());if(y)throw y;const _=n>0?Math.round(((v==null?void 0:v.length)||0)/n*100):0;s.topPerformers.innerHTML=d.length>0?d.map(l=>`
          <div class="performer-item">
            <span class="performer-name">${l.name}</span>
            <span class="performer-rate">${Math.round(l.rate*100)}%</span>
          </div>
        `).join(""):'<div class="empty-text">No data available</div>',s.underperformers.innerHTML=m.length>0?m.map(l=>`
          <div class="performer-item underperformer">
            <span class="performer-name">${l.name}</span>
            <span class="performer-rate">${Math.round(l.rate*100)}%</span>
          </div>
        `).join(""):'<div class="empty-text">No data available</div>',f(s.visitCompletionRate,`${c}%`),f(s.reportSubmissionTrend,`${_}%`)}catch(e){console.error("Error loading performance analytics:",e),s.topPerformers.innerHTML='<div class="empty-text">Error loading data</div>',s.underperformers.innerHTML='<div class="empty-text">Error loading data</div>'}}async function z(){try{const{data:e,error:t}=await p.from("reports").select(`
        id,
        created_at,
        notes,
        visit:visits(
          rep_id,
          scheduled_date,
          doctors(name, clinic_location)
        )
      `).order("created_at",{ascending:!1}).limit(10);if(t)throw t;if(!e||e.length===0){s.recentReportsFeed.innerHTML=`
        <div class="activity-item">
          <span class="activity-detail">No recent reports</span>
        </div>
      `;return}s.recentReportsFeed.innerHTML=e.map(a=>{var c,v,y,_;const i=new Date(a.created_at).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!0}),d=((v=(c=a.visit)==null?void 0:c.doctors)==null?void 0:v.name)||"Unknown",m=((_=(y=a.visit)==null?void 0:y.doctors)==null?void 0:_.clinic_location)||"",u=b.find(l=>{var g;return l.id===((g=a.visit)==null?void 0:g.rep_id)}),n=(u==null?void 0:u.full_name)||"Unknown Rep";return`
        <div class="activity-item">
          <span class="activity-time">${i}</span>
          <span class="activity-user">${n}</span>
          <span class="activity-type">Report</span>
          <span class="activity-detail">${d}${m?" - "+m:""}</span>
        </div>
      `}).join("")}catch(e){console.error("Error loading recent reports:",e),s.recentReportsFeed.innerHTML=`
      <div class="activity-item">
        <span class="activity-detail">Error loading reports</span>
      </div>
    `}}async function J(){try{const e=new Date;e.setHours(0,0,0,0);const t=new Date(e);t.setDate(t.getDate()+1);const{data:a,error:r}=await p.from("visits").select(`
        id,
        scheduled_date,
        status,
        rep_id,
        doctors(name, clinic_location)
      `).gte("scheduled_date",e.toISOString()).lt("scheduled_date",t.toISOString()).order("scheduled_date",{ascending:!0});if(r)throw r;const i=(a==null?void 0:a.length)||0,d=(a==null?void 0:a.filter(n=>n.status==="completed").length)||0,m=(a==null?void 0:a.filter(n=>n.status==="missed").length)||0;f(s.todayAppointments,i),f(s.missedAppointments,m),f(s.completedAppointments,d);const u=(a==null?void 0:a.filter(n=>n.status==="scheduled"&&new Date(n.scheduled_date)>new Date).slice(0,5))||[];u.length>0?s.upcomingSchedulesList.innerHTML=`
        <h4>Upcoming Today</h4>
        ${u.map(n=>{var l;const c=new Date(n.scheduled_date).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!0}),v=b.find(g=>g.id===n.rep_id),y=(v==null?void 0:v.full_name)||"Unknown",_=((l=n.doctors)==null?void 0:l.name)||"Unknown";return`
            <div class="schedule-item">
              <span class="schedule-time">${c}</span>
              <span class="schedule-rep">${y}</span>
              <span class="schedule-detail">${_}</span>
            </div>
          `}).join("")}
      `:s.upcomingSchedulesList.innerHTML=`
        <h4>Upcoming Today</h4>
        <div class="empty-text">No upcoming appointments</div>
      `}catch(e){console.error("Error loading schedule overview:",e)}}async function K(){try{const e=new Date().toISOString().slice(0,7),{data:t,error:a}=await p.from("quotas").select("*").eq("month",e);if(a)throw a;if(!t||t.length===0){s.quotaTrackingList.innerHTML=`
        <div class="empty-text">No quota data for this month</div>
      `;return}const r=t.reduce((n,c)=>n+(c.doctor_visits_actual||0)/(c.doctor_visits_target||1),0)/t.length,i=t.reduce((n,c)=>n+(c.pharmacy_calls_actual||0)/(c.pharmacy_calls_target||1),0)/t.length,d=t.reduce((n,c)=>n+(c.sample_distribution_actual||0)/(c.sample_distribution_target||1),0)/t.length,m=(r+i+d)/3,u=t.filter(n=>(n.doctor_visits_actual||0)/(n.doctor_visits_target||1)<.5).length;s.quotaTrackingList.innerHTML=`
      <div class="quota-track-item">
        <div class="quota-track-header">
          <span class="quota-rep-name">Team Average</span>
          <span class="quota-percentage">${Math.round(m*100)}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${T(m)}" style="width: ${m*100}%"></div>
        </div>
      </div>
      <div class="quota-track-item">
        <div class="quota-track-header">
          <span class="quota-rep-name">Doctor Visits Target</span>
          <span class="quota-percentage">${Math.round(r*100)}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${T(r)}" style="width: ${r*100}%"></div>
        </div>
      </div>
      <div class="quota-track-item">
        <div class="quota-track-header">
          <span class="quota-rep-name">Pharmacy Calls Target</span>
          <span class="quota-percentage">${Math.round(i*100)}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${T(i)}" style="width: ${i*100}%"></div>
        </div>
      </div>
      <div class="quota-track-item">
        <div class="quota-track-header">
          <span class="quota-rep-name">Sample Distribution</span>
          <span class="quota-percentage">${Math.round(d*100)}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${T(d)}" style="width: ${d*100}%"></div>
        </div>
      </div>
    `,u>0?(s.quotaAlerts.className="info-box warning",s.quotaAlerts.innerHTML=`<strong>Attention:</strong> ${u} rep${u>1?"s":""} falling behind monthly target`):(s.quotaAlerts.className="info-box success",s.quotaAlerts.innerHTML="<strong>Great!</strong> All reps on track with monthly targets")}catch(e){console.error("Error loading quota tracking:",e)}}async function W(){try{const e=new Date;e.setHours(0,0,0,0);const t=new Date(e);t.setDate(t.getDate()-3);const{data:a,error:r}=await p.from("visits").select("rep_id").gte("scheduled_date",t.toISOString());if(r)throw r;const i=new Set((a==null?void 0:a.map(c=>c.rep_id))||[]),d=b.filter(c=>!i.has(c.id)),{data:m,error:u}=await p.from("visits").select("id").eq("status","completed").gte("scheduled_date",e.toISOString());if(u)throw u;const n=[];d.length>0&&n.push({type:"alert-warning",icon:"person_off",title:"Inactive Representatives",message:`${d.length} rep${d.length>1?"s":""} with no activity in 3 days`}),m&&m.length>0&&n.push({type:"alert-info",icon:"assignment_late",title:"Pending Reports",message:`${m.length} visit${m.length>1?"s":""} awaiting report submission`}),n.length===0&&n.push({type:"alert-success",icon:"check_circle",title:"All Systems Normal",message:"No critical alerts at this time"}),s.alertsList.innerHTML=n.map(c=>`
      <div class="alert-item ${c.type}">
        <span class="material-symbols-outlined">${c.icon}</span>
        <div class="alert-content">
          <strong>${c.title}</strong>
          <span>${c.message}</span>
        </div>
      </div>
    `).join("")}catch(e){console.error("Error loading alerts:",e)}}function X(){const e=document.getElementById("logoutBtn"),t=document.getElementById("logoutBtnMobile");e&&e.addEventListener("click",D),t&&t.addEventListener("click",D);const a=document.querySelector(".hamburger"),r=document.querySelector(".mobile-menu");a&&r&&a.addEventListener("click",()=>{a.classList.toggle("active"),r.classList.toggle("active")}),s.repSearch&&s.repSearch.addEventListener("input",i=>{const d=i.target.value.toLowerCase();if(window.allRepData){const m=window.allRepData.filter(u=>{var n,c;return((n=u.full_name)==null?void 0:n.toLowerCase().includes(d))||((c=u.email)==null?void 0:c.toLowerCase().includes(d))});P(m)}})}function T(e){return e<.3?"low":e<.7?"medium":"high"}function f(e,t){e&&(e.textContent=t)}function C(){s.lastUpdated&&(s.lastUpdated.textContent=new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}))}function Y(){[s.totalReps,s.activeReps,s.totalVisits,s.completedCalls,s.pendingReports,s.quotaAchievement,s.sampleDistribution,s.upcomingSchedules].forEach(t=>{t&&(t.textContent="--")})}document.addEventListener("DOMContentLoaded",F);const o={repSelect:document.getElementById("quota-rep-select"),monthPicker:document.getElementById("quota-month-picker"),doctorVisitsTarget:document.getElementById("doctor-visits-target"),pharmacyCallsTarget:document.getElementById("pharmacy-calls-target"),sampleDistributionTarget:document.getElementById("sample-distribution-target"),meetingsTarget:document.getElementById("meetings-target"),loadQuotaBtn:document.getElementById("load-quota-btn"),saveQuotaBtn:document.getElementById("save-quota-btn"),quotaFeedback:document.getElementById("quota-feedback"),quotasTableBody:document.getElementById("quotas-table-body")};let R=[];async function Z(){const e=document.getElementById("quota-rep-select");if(!e)return;e.innerHTML='<option value="">Loading RepMeds...</option>',console.log("[loadRepList] Fetching repmeds from profiles table...");const{data:t,error:a}=await p.from("profiles").select("id, full_name, email").eq("role","repmeds").order("full_name",{ascending:!0});if(a){console.error("[loadRepList] Error fetching repmeds:",a),e.innerHTML='<option value="" disabled>Error loading RepMeds</option>';return}if(console.log("[loadRepList] Found",(t==null?void 0:t.length)||0,"repmeds"),!t||t.length===0){e.innerHTML='<option value="" disabled>No RepMeds found</option>';return}e.innerHTML='<option value="">Select a RepMed...</option>',t.forEach(r=>{const i=document.createElement("option");i.value=r.id,i.textContent=r.full_name||r.email||"Unknown Rep",e.appendChild(i)})}async function k(e,t){try{if(!e||!t){E("Please select a RepMed and month","error");return}const{data:a,error:r}=await p.from("quotas").select("*").eq("rep_id",e).eq("month",t).single();if(r&&r.code!=="PGRST116")throw r;a?(o.doctorVisitsTarget.value=a.doctor_visits_target||0,o.pharmacyCallsTarget.value=a.pharmacy_calls_target||0,o.sampleDistributionTarget.value=a.sample_distribution_target||0,o.meetingsTarget.value=a.meetings_target||0,E("Quota loaded successfully","success")):(o.doctorVisitsTarget.value="",o.pharmacyCallsTarget.value="",o.sampleDistributionTarget.value="",o.meetingsTarget.value="",E("No quota found for this rep/month — enter new targets","success"))}catch(a){console.error("Error loading quota:",a),E(`Error loading quota: ${a.message}`,"error")}}async function tt(){try{const e=o.repSelect.value,t=o.monthPicker.value,a=parseInt(o.doctorVisitsTarget.value,10)||0,r=parseInt(o.pharmacyCallsTarget.value,10)||0,i=parseInt(o.sampleDistributionTarget.value,10)||0,d=parseInt(o.meetingsTarget.value,10)||0;if(!e){E("Please select a RepMed","error");return}if(!t){E("Please select a month","error");return}if(a<0||r<0||i<0||d<0){E("All targets must be positive numbers","error");return}const{data:m,error:u}=await p.functions.invoke("upsert-quotas",{body:{rep_id:e,month:t,doctor_visits_target:a,pharmacy_calls_target:r,sample_distribution_target:i,meetings_target:d}});if(u)throw u;E("Quota saved successfully!","success"),await B(t)}catch(e){console.error("Error saving quota:",e),E(`Error saving quota: ${e.message}`,"error")}}async function B(e){try{if(!e)return;const{data:t,error:a}=await p.from("quotas").select("*").eq("month",e);if(a)throw a;if(R.length===0){const{data:r,error:i}=await p.from("profiles").select("id, full_name, email").eq("role","repmeds");if(i)throw i;R=r||[]}if(!t||t.length===0){o.quotasTableBody.innerHTML=`
        <tr>
          <td colspan="6" class="empty-text">No quotas set for this month</td>
        </tr>
      `;return}o.quotasTableBody.innerHTML=t.map(r=>{const i=R.find(m=>m.id===r.rep_id);return`
        <tr>
          <td>${(i==null?void 0:i.full_name)||(i==null?void 0:i.email)||"Unknown"}</td>
          <td>${r.doctor_visits_target||0}</td>
          <td>${r.pharmacy_calls_target||0}</td>
          <td>${r.sample_distribution_target||0}</td>
          <td>${r.meetings_target||0}</td>
          <td>
            <button type="button" class="btn btn-sm btn-secondary edit-quota-btn" 
                    data-rep-id="${r.rep_id}" 
                    data-month="${r.month}">
              Edit
            </button>
          </td>
        </tr>
      `}).join(""),o.quotasTableBody.querySelectorAll(".edit-quota-btn").forEach(r=>{r.addEventListener("click",()=>{const i=r.dataset.repId,d=r.dataset.month;o.repSelect.value=i,o.monthPicker.value=d,k(i,d)})})}catch(t){console.error("Error loading quotas table:",t),o.quotasTableBody.innerHTML=`
      <tr>
        <td colspan="6" class="empty-text">Error loading quotas</td>
      </tr>
    `}}function E(e,t){o.quotaFeedback&&(o.quotaFeedback.innerHTML=e,o.quotaFeedback.className=`quota-feedback ${t}`,o.quotaFeedback.style.display="block",setTimeout(()=>{o.quotaFeedback&&(o.quotaFeedback.style.display="none")},5e3))}function et(){const e=new Date().toISOString().slice(0,7);o.monthPicker&&(o.monthPicker.value=e),Z(),B(e),o.loadQuotaBtn&&o.loadQuotaBtn.addEventListener("click",()=>{const t=o.repSelect.value,a=o.monthPicker.value;k(t,a)}),o.saveQuotaBtn&&o.saveQuotaBtn.addEventListener("click",tt),o.monthPicker&&o.monthPicker.addEventListener("change",()=>{const t=o.monthPicker.value;B(t)}),o.repSelect&&o.repSelect.addEventListener("change",()=>{const t=o.repSelect.value,a=o.monthPicker.value;t&&a&&k(t,a)})}document.addEventListener("DOMContentLoaded",et);
