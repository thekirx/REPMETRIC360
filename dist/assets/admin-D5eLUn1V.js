import{a as z,s as h,l as P}from"./auth-lOpszQbR.js";/* empty css               */import"https://esm.sh/@supabase/supabase-js@2";const o={totalReps:document.getElementById("totalReps"),activeReps:document.getElementById("activeReps"),totalVisits:document.getElementById("totalVisits"),completedCalls:document.getElementById("completedCalls"),pendingReports:document.getElementById("pendingReports"),quotaAchievement:document.getElementById("quotaAchievement"),sampleDistribution:document.getElementById("sampleDistribution"),upcomingSchedules:document.getElementById("upcomingSchedules"),repMonitoringTable:document.getElementById("repMonitoringTable"),topPerformers:document.getElementById("topPerformers"),underperformers:document.getElementById("underperformers"),visitCompletionRate:document.getElementById("visitCompletionRate"),reportSubmissionTrend:document.getElementById("reportSubmissionTrend"),recentReportsFeed:document.getElementById("recentReportsFeed"),alertsList:document.getElementById("alertsList"),todayAppointments:document.getElementById("todayAppointments"),missedAppointments:document.getElementById("missedAppointments"),completedAppointments:document.getElementById("completedAppointments"),upcomingSchedulesList:document.getElementById("upcomingSchedulesList"),quotaTrackingList:document.getElementById("quotaTrackingList"),quotaAlerts:document.getElementById("quotaAlerts"),lastUpdated:document.getElementById("lastUpdated"),repSearch:document.getElementById("repSearch")};let E=[],I=[],K=[];function X(e){e&&(e.innerHTML=`
    <div class="state-loading">
      <div class="skeleton skeleton-text" style="width: 60%"></div>
      <div class="skeleton skeleton-text" style="width: 80%"></div>
      <div class="skeleton skeleton-text" style="width: 40%"></div>
    </div>
  `)}function q(e,t,s){if(!e)return;const a="retry-"+Math.random().toString(36).substr(2,9);e.innerHTML=`
    <div class="state-error">
      <span class="material-symbols-outlined state-icon">error_outline</span>
      <p class="state-message">${t}</p>
      <button class="btn-retry" id="${a}">Try Again</button>
    </div>
  `;const r=document.getElementById(a);r&&s&&r.addEventListener("click",s)}function T(e,t,s,a){if(!e)return;const r=s&&a?`<a href="${a}" class="btn-cta">${s}</a>`:"";e.innerHTML=`
    <div class="state-empty">
      <span class="material-symbols-outlined state-icon">inbox</span>
      <p class="state-message">${t}</p>
      ${r}
    </div>
  `}function Y(e,t){if(!e)return;let s="";for(let a=0;a<3;a++){let r="";for(let c=0;c<t;c++)r+=`<td><span class="skeleton skeleton-text" style="width: ${60+Math.random()*30}%"></span></td>`;s+=`<tr>${r}</tr>`}e.innerHTML=s}async function Z(){var s;if(!await z())return;const{data:t}=await h.auth.refreshSession();t!=null&&t.session&&console.log("[initAdminDashboard] Session refreshed, role in JWT:",(s=t.session.user.user_metadata)==null?void 0:s.role),await H(),st(),V(),setInterval(H,5*60*1e3)}async function H(){try{await Promise.all([tt(),N(),D(),U(),Q(),F(),et()]),V()}catch(e){console.error("Error loading dashboard data:",e)}}async function tt(){const e=[o.totalReps,o.activeReps,o.totalVisits,o.completedCalls,o.pendingReports,o.quotaAchievement,o.sampleDistribution,o.upcomingSchedules];e.forEach(t=>{t&&(t.innerHTML='<span class="skeleton skeleton-number"></span>')});try{const{data:t,error:s}=await h.from("profiles").select("id, full_name, email, role, created_at").eq("role","repmeds");if(s)throw s;E=t||[];const a=new Date;a.setHours(0,0,0,0);const r=new Date(a);r.setDate(r.getDate()+1);const{data:c,error:p}=await h.from("visits").select("id, rep_id, status, scheduled_date").gte("scheduled_date",a.toISOString()).lt("scheduled_date",r.toISOString());if(p)throw p;I=c||[];const i=new Set(I.map(y=>y.rep_id)).size,u=I.filter(y=>y.status==="completed").length,{data:m,error:f}=await h.from("reports").select("visit_id").gte("created_at",a.toISOString());if(f)throw f;K=m||[];const g=new Set(m.map(y=>y.visit_id)),v=I.filter(y=>y.status==="completed"&&!g.has(y.id)).length,_=new Date().toISOString().slice(0,7),{data:l,error:S}=await h.from("quotas").select("*").eq("month",_);if(S)throw S;let L=0;l&&l.length>0&&l.forEach(y=>{const R=(y.doctor_visits_actual||0)/(y.doctor_visits_target||1),J=(y.pharmacy_calls_actual||0)/(y.pharmacy_calls_target||1),W=(y.sample_distribution_actual||0)/(y.sample_distribution_target||1);L+=(R+J+W)/3});const M=(l==null?void 0:l.length)>0?Math.round(L/l.length*100):0,{data:w,error:nt}=await h.from("sample_distributions").select("quantity").gte("distributed_at",a.toISOString()),j=(w==null?void 0:w.reduce((y,R)=>y+(R.quantity||0),0))||0,{data:$,error:it}=await h.from("visits").select("id").gte("scheduled_date",new Date().toISOString()).eq("status","scheduled").limit(100),G=($==null?void 0:$.length)||0;o.totalReps&&(o.totalReps.textContent=E.length),o.activeReps&&(o.activeReps.textContent=i),o.totalVisits&&(o.totalVisits.textContent=I.length),o.completedCalls&&(o.completedCalls.textContent=u),o.pendingReports&&(o.pendingReports.textContent=v),o.quotaAchievement&&(o.quotaAchievement.textContent=`${M}%`),o.sampleDistribution&&(o.sampleDistribution.textContent=j.toLocaleString()),o.upcomingSchedules&&(o.upcomingSchedules.textContent=G)}catch(t){console.error("Error loading summary stats:",t),e.forEach(s=>{s&&(s.innerHTML='<span class="stat-tooltip" data-tooltip="Data unavailable">--</span>')})}}async function N(){const e=o.repMonitoringTable,t=e==null?void 0:e.parentElement;Y(e,6);try{if(E.length===0){T(t,"No representatives registered yet","Register a RepMed","register.html?admin=true");return}const s=new Date;s.setHours(0,0,0,0);const a=new Date(s);a.setDate(a.getDate()+1);const{data:r,error:c}=await h.from("visits").select("rep_id, status, scheduled_date, notes").gte("scheduled_date",s.toISOString()).lt("scheduled_date",a.toISOString());if(c)throw c;const p=new Date().toISOString().slice(0,7),{data:d,error:i}=await h.from("quotas").select("rep_id, doctor_visits_target, doctor_visits_actual").eq("month",p);if(i)throw i;const u=E.map(m=>{const f=(r==null?void 0:r.filter(w=>w.rep_id===m.id))||[],g=f.filter(w=>w.status==="completed").length,v=f.length>0?new Date(Math.max(...f.map(w=>new Date(w.scheduled_date)))):null,_=d==null?void 0:d.find(w=>w.rep_id===m.id),l=_?Math.round((_.doctor_visits_actual||0)/(_.doctor_visits_target||1)*100):0;let S="inactive",L="badge-warning";f.length>0&&(S="active",L="badge-success");const M=v?v.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}):"No activity";return{...m,visitsToday:g,quotaProgress:l,status:S,statusClass:L,lastActivity:M,territory:"Metro Manila"}});O(u),window.allRepData=u}catch(s){console.error("Error loading representative monitoring:",s),q(t,"Could not load representatives",N)}}function O(e){if(e.length===0){o.repMonitoringTable.innerHTML=`
      <tr><td colspan="6" class="empty-text">No representatives found</td></tr>
    `;return}o.repMonitoringTable.innerHTML=e.map(t=>`
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
          <div class="progress-fill ${k(t.quotaProgress/100)}" 
               style="width: ${t.quotaProgress}%"></div>
        </div>
        <span class="progress-percent">${t.quotaProgress}%</span>
      </td>
      <td>${t.lastActivity}</td>
    </tr>
  `).join("")}async function D(){try{const e=new Date;e.setDate(1),e.setHours(0,0,0,0);const{data:t,error:s}=await h.from("visits").select("rep_id, status").gte("scheduled_date",e.toISOString());if(s)throw s;const a={};E.forEach(l=>{a[l.id]={name:l.full_name||"Unknown",completed:0,scheduled:0}}),t==null||t.forEach(l=>{a[l.rep_id]&&(a[l.rep_id].scheduled++,l.status==="completed"&&a[l.rep_id].completed++)});const r=Object.values(a).filter(l=>l.scheduled>0).map(l=>({...l,rate:l.scheduled>0?l.completed/l.scheduled:0})).sort((l,S)=>S.rate-l.rate),c=r.slice(0,3),p=r.slice(-3).reverse(),d=(t==null?void 0:t.length)||0,i=(t==null?void 0:t.filter(l=>l.status==="completed").length)||0,u=d>0?Math.round(i/d*100):0,{data:m,error:f}=await h.from("reports").select("id").gte("created_at",e.toISOString());if(f)throw f;const g=i>0?Math.round(((m==null?void 0:m.length)||0)/i*100):0,v=o.topPerformers,_=o.underperformers;c.length>0?v.innerHTML=c.map(l=>`
          <div class="performer-item">
            <span class="performer-name">${l.name}</span>
            <span class="performer-rate">${Math.round(l.rate*100)}%</span>
          </div>
        `).join(""):T(v,"No performance data for selected period"),p.length>0?_.innerHTML=p.map(l=>`
          <div class="performer-item underperformer">
            <span class="performer-name">${l.name}</span>
            <span class="performer-rate">${Math.round(l.rate*100)}%</span>
          </div>
        `).join(""):T(_,"No performance data for selected period"),x(o.visitCompletionRate,`${u}%`),x(o.reportSubmissionTrend,`${g}%`)}catch(e){console.error("Error loading performance analytics:",e),q(o.topPerformers,"Could not load analytics data",D),q(o.underperformers,"Could not load analytics data",D)}}async function U(){const e=o.recentReportsFeed;X(e);try{const{data:t,error:s}=await h.from("reports").select(`
        id,
        created_at,
        notes,
        visit:visits(
          rep_id,
          scheduled_date,
          doctors(name, clinic_location)
        )
      `).order("created_at",{ascending:!1}).limit(10);if(s)throw s;if(!t||t.length===0){T(e,"No field reports submitted yet");return}o.recentReportsFeed.innerHTML=t.map(a=>{var m,f,g,v;const c=new Date(a.created_at).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!0}),p=((f=(m=a.visit)==null?void 0:m.doctors)==null?void 0:f.name)||"Unknown",d=((v=(g=a.visit)==null?void 0:g.doctors)==null?void 0:v.clinic_location)||"",i=E.find(_=>{var l;return _.id===((l=a.visit)==null?void 0:l.rep_id)}),u=(i==null?void 0:i.full_name)||"Unknown Rep";return`
        <div class="activity-item">
          <span class="activity-time">${c}</span>
          <span class="activity-user">${u}</span>
          <span class="activity-type">Report</span>
          <span class="activity-detail">${p}${d?" - "+d:""}</span>
        </div>
      `}).join("")}catch(t){console.error("Error loading recent reports:",t),q(e,"Could not load field reports",U)}}async function Q(){try{const e=new Date;e.setHours(0,0,0,0);const t=new Date(e);t.setDate(t.getDate()+1);const{data:s,error:a}=await h.from("visits").select(`
        id,
        scheduled_date,
        status,
        rep_id,
        doctors(name, clinic_location)
      `).gte("scheduled_date",e.toISOString()).lt("scheduled_date",t.toISOString()).order("scheduled_date",{ascending:!0});if(a)throw a;const r=(s==null?void 0:s.length)||0,c=(s==null?void 0:s.filter(i=>i.status==="completed").length)||0,p=(s==null?void 0:s.filter(i=>i.status==="missed").length)||0;o.todayAppointments&&(o.todayAppointments.textContent=r),o.missedAppointments&&(o.missedAppointments.textContent=p),o.completedAppointments&&(o.completedAppointments.textContent=c);const d=(s==null?void 0:s.filter(i=>i.status==="scheduled"&&new Date(i.scheduled_date)>new Date).slice(0,5))||[];d.length>0?o.upcomingSchedulesList.innerHTML=`
        <h4>Upcoming Today</h4>
        ${d.map(i=>{var v;const u=new Date(i.scheduled_date).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!0}),m=E.find(_=>_.id===i.rep_id),f=(m==null?void 0:m.full_name)||"Unknown",g=((v=i.doctors)==null?void 0:v.name)||"Unknown";return`
            <div class="schedule-item">
              <span class="schedule-time">${u}</span>
              <span class="schedule-rep">${f}</span>
              <span class="schedule-detail">${g}</span>
            </div>
          `}).join("")}
      `:T(o.upcomingSchedulesList,"No appointments scheduled for today")}catch(e){console.error("Error loading schedule overview:",e),q(o.upcomingSchedulesList,"Could not load schedule data",Q),o.todayAppointments&&(o.todayAppointments.innerHTML='<span class="stat-tooltip" data-tooltip="Data unavailable">--</span>'),o.missedAppointments&&(o.missedAppointments.innerHTML='<span class="stat-tooltip" data-tooltip="Data unavailable">--</span>'),o.completedAppointments&&(o.completedAppointments.innerHTML='<span class="stat-tooltip" data-tooltip="Data unavailable">--</span>')}}async function F(){try{const e=new Date().toISOString().slice(0,7),{data:t,error:s}=await h.from("quotas").select("*").eq("month",e);if(s)throw s;if(!t||t.length===0){T(o.quotaTrackingList,"No quotas set for this month");return}const a=t.reduce((i,u)=>i+(u.doctor_visits_actual||0)/(u.doctor_visits_target||1),0)/t.length,r=t.reduce((i,u)=>i+(u.pharmacy_calls_actual||0)/(u.pharmacy_calls_target||1),0)/t.length,c=t.reduce((i,u)=>i+(u.sample_distribution_actual||0)/(u.sample_distribution_target||1),0)/t.length,p=(a+r+c)/3,d=t.filter(i=>(i.doctor_visits_actual||0)/(i.doctor_visits_target||1)<.5).length;o.quotaTrackingList.innerHTML=`
      <div class="quota-track-item">
        <div class="quota-track-header">
          <span class="quota-rep-name">Team Average</span>
          <span class="quota-percentage">${Math.round(p*100)}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${k(p)}" style="width: ${p*100}%"></div>
        </div>
      </div>
      <div class="quota-track-item">
        <div class="quota-track-header">
          <span class="quota-rep-name">Doctor Visits Target</span>
          <span class="quota-percentage">${Math.round(a*100)}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${k(a)}" style="width: ${a*100}%"></div>
        </div>
      </div>
      <div class="quota-track-item">
        <div class="quota-track-header">
          <span class="quota-rep-name">Pharmacy Calls Target</span>
          <span class="quota-percentage">${Math.round(r*100)}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${k(r)}" style="width: ${r*100}%"></div>
        </div>
      </div>
      <div class="quota-track-item">
        <div class="quota-track-header">
          <span class="quota-rep-name">Sample Distribution</span>
          <span class="quota-percentage">${Math.round(c*100)}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${k(c)}" style="width: ${c*100}%"></div>
        </div>
      </div>
    `,d>0?(o.quotaAlerts.className="info-box warning",o.quotaAlerts.innerHTML=`<strong>Attention:</strong> ${d} rep${d>1?"s":""} falling behind monthly target`):(o.quotaAlerts.className="info-box success",o.quotaAlerts.innerHTML="<strong>Great!</strong> All reps on track with monthly targets")}catch(e){console.error("Error loading quota tracking:",e),q(o.quotaTrackingList,"Could not load quota data",F)}}async function et(){var e,t;try{const s=new Date;s.setHours(0,0,0,0);const a=new Date(s);a.setDate(a.getDate()-3);const{data:r,error:c}=await h.from("visits").select("rep_id").gte("scheduled_date",a.toISOString());if(c)throw c;const p=new Set((r==null?void 0:r.map(g=>g.rep_id))||[]),d=E.filter(g=>!p.has(g.id)),{data:i,error:u}=await h.from("visits").select("id").eq("status","completed").gte("scheduled_date",s.toISOString());if(u)throw u;const m=[];d.length>0&&m.push({type:"alert-warning",icon:"person_off",title:"Inactive Representatives",message:`${d.length} rep${d.length>1?"s":""} with no activity in 3 days`}),i&&i.length>0&&m.push({type:"alert-info",icon:"assignment_late",title:"Pending Reports",message:`${i.length} visit${i.length>1?"s":""} awaiting report submission`}),m.length===0&&m.push({type:"alert-success",icon:"check_circle",title:"All Systems Normal",message:"No critical alerts at this time"}),o.alertsList.innerHTML=m.map(g=>`
      <div class="alert-item ${g.type}">
        <span class="material-symbols-outlined">${g.icon}</span>
        <div class="alert-content">
          <strong>${g.title}</strong>
          <span>${g.message}</span>
        </div>
      </div>
    `).join("");const f=(e=o.alertsList.parentElement)==null?void 0:e.querySelector("h3, .card-header, .section-title");if(f){const g=(t=f.parentElement)==null?void 0:t.querySelector(".alert-timestamp");g&&g.remove();const v=document.createElement("span");v.className="alert-timestamp",v.textContent="Last checked: just now",f.appendChild(v)}}catch(s){console.error("Error loading alerts:",s)}}function st(){const e=document.getElementById("logoutBtn"),t=document.getElementById("logoutBtnMobile");e&&e.addEventListener("click",P),t&&t.addEventListener("click",P);const s=document.querySelector(".hamburger"),a=document.querySelector(".mobile-menu");s&&a&&s.addEventListener("click",()=>{s.classList.toggle("active"),a.classList.toggle("active")}),o.repSearch&&o.repSearch.addEventListener("input",r=>{const c=r.target.value.toLowerCase();if(window.allRepData){const p=window.allRepData.filter(d=>{var i,u;return((i=d.full_name)==null?void 0:i.toLowerCase().includes(c))||((u=d.email)==null?void 0:u.toLowerCase().includes(c))});O(p)}})}function k(e){return e<.3?"low":e<.7?"medium":"high"}function x(e,t){e&&(e.textContent=t)}function V(){o.lastUpdated&&(o.lastUpdated.textContent=new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}))}document.addEventListener("DOMContentLoaded",Z);const n={repSelect:document.getElementById("quota-rep-select"),monthPicker:document.getElementById("quota-month-picker"),doctorVisitsTarget:document.getElementById("doctor-visits-target"),pharmacyCallsTarget:document.getElementById("pharmacy-calls-target"),sampleDistributionTarget:document.getElementById("sample-distribution-target"),meetingsTarget:document.getElementById("meetings-target"),loadQuotaBtn:document.getElementById("load-quota-btn"),saveQuotaBtn:document.getElementById("save-quota-btn"),quotaFeedback:document.getElementById("quota-feedback"),quotasTableBody:document.getElementById("quotas-table-body")};let C=[];async function at(){const e=document.getElementById("quota-rep-select");if(!e)return;e.innerHTML='<option value="">Loading RepMeds...</option>',console.log("[loadRepList] Fetching repmeds from profiles table...");const{data:t,error:s}=await h.from("profiles").select("id, full_name, email").eq("role","repmeds").order("full_name",{ascending:!0});if(s){console.error("[loadRepList] Error fetching repmeds:",s),e.innerHTML='<option value="" disabled>Error loading RepMeds</option>';return}if(console.log("[loadRepList] Found",(t==null?void 0:t.length)||0,"repmeds"),!t||t.length===0){console.warn("[loadRepList] No repmeds returned — this may be caused by RLS policy blocking the query. Check that admin role is in JWT user_metadata."),e.innerHTML='<option value="" disabled>No RepMeds found</option>';return}e.innerHTML='<option value="">Select a RepMed...</option>',t.forEach(a=>{const r=document.createElement("option");r.value=a.id,r.textContent=a.full_name||a.email||"Unknown Rep",e.appendChild(r)})}async function B(e,t){try{if(!e||!t){b("Please select a RepMed and month","error");return}const{data:s,error:a}=await h.from("quotas").select("*").eq("rep_id",e).eq("month",t).single();if(a&&a.code!=="PGRST116")throw a;s?(n.doctorVisitsTarget.value=s.doctor_visits_target||0,n.pharmacyCallsTarget.value=s.pharmacy_calls_target||0,n.sampleDistributionTarget.value=s.sample_distribution_target||0,n.meetingsTarget.value=s.meetings_target||0,b("Quota loaded successfully","success")):(n.doctorVisitsTarget.value="",n.pharmacyCallsTarget.value="",n.sampleDistributionTarget.value="",n.meetingsTarget.value="",b("No quota found for this rep/month — enter new targets","success"))}catch(s){console.error("Error loading quota:",s),b(`Error loading quota: ${s.message}`,"error")}}async function ot(){try{const e=n.repSelect.value,t=n.monthPicker.value,s=parseInt(n.doctorVisitsTarget.value,10)||0,a=parseInt(n.pharmacyCallsTarget.value,10)||0,r=parseInt(n.sampleDistributionTarget.value,10)||0,c=parseInt(n.meetingsTarget.value,10)||0;if(!e){b("Please select a RepMed","error");return}if(!t){b("Please select a month","error");return}if(s<0||a<0||r<0||c<0){b("All targets must be positive numbers","error");return}const{data:p,error:d}=await h.functions.invoke("upsert-quotas",{body:{rep_id:e,month:t,doctor_visits_target:s,pharmacy_calls_target:a,sample_distribution_target:r,meetings_target:c}});if(d)throw d;b("Quota saved successfully!","success"),await A(t)}catch(e){console.error("Error saving quota:",e),b(`Error saving quota: ${e.message}`,"error")}}async function A(e){try{if(!e)return;const{data:t,error:s}=await h.from("quotas").select("*").eq("month",e);if(s)throw s;if(C.length===0){const{data:a,error:r}=await h.from("profiles").select("id, full_name, email").eq("role","repmeds");if(r)throw r;C=a||[]}if(!t||t.length===0){n.quotasTableBody.innerHTML=`
        <tr>
          <td colspan="6" class="empty-text">No quotas set for this month</td>
        </tr>
      `;return}n.quotasTableBody.innerHTML=t.map(a=>{const r=C.find(p=>p.id===a.rep_id);return`
        <tr>
          <td>${(r==null?void 0:r.full_name)||(r==null?void 0:r.email)||"Unknown"}</td>
          <td>${a.doctor_visits_target||0}</td>
          <td>${a.pharmacy_calls_target||0}</td>
          <td>${a.sample_distribution_target||0}</td>
          <td>${a.meetings_target||0}</td>
          <td>
            <button type="button" class="btn btn-sm btn-secondary edit-quota-btn" 
                    data-rep-id="${a.rep_id}" 
                    data-month="${a.month}">
              Edit
            </button>
          </td>
        </tr>
      `}).join(""),n.quotasTableBody.querySelectorAll(".edit-quota-btn").forEach(a=>{a.addEventListener("click",()=>{const r=a.dataset.repId,c=a.dataset.month;n.repSelect.value=r,n.monthPicker.value=c,B(r,c)})})}catch(t){console.error("Error loading quotas table:",t),n.quotasTableBody.innerHTML=`
      <tr>
        <td colspan="6" class="empty-text">Error loading quotas</td>
      </tr>
    `}}function b(e,t){n.quotaFeedback&&(n.quotaFeedback.innerHTML=e,n.quotaFeedback.className=`quota-feedback ${t}`,n.quotaFeedback.style.display="block",setTimeout(()=>{n.quotaFeedback&&(n.quotaFeedback.style.display="none")},5e3))}function rt(){const e=new Date().toISOString().slice(0,7);n.monthPicker&&(n.monthPicker.value=e),at(),A(e),n.loadQuotaBtn&&n.loadQuotaBtn.addEventListener("click",()=>{const t=n.repSelect.value,s=n.monthPicker.value;B(t,s)}),n.saveQuotaBtn&&n.saveQuotaBtn.addEventListener("click",ot),n.monthPicker&&n.monthPicker.addEventListener("change",()=>{const t=n.monthPicker.value;A(t)}),n.repSelect&&n.repSelect.addEventListener("change",()=>{const t=n.repSelect.value,s=n.monthPicker.value;t&&s&&B(t,s)})}document.addEventListener("DOMContentLoaded",rt);
