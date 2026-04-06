import{a as H,l as T,s as h}from"./auth-DmsNQpks.js";/* empty css               */import"https://esm.sh/@supabase/supabase-js@2";const s={totalReps:document.getElementById("totalReps"),activeReps:document.getElementById("activeReps"),totalVisits:document.getElementById("totalVisits"),completedCalls:document.getElementById("completedCalls"),pendingReports:document.getElementById("pendingReports"),quotaAchievement:document.getElementById("quotaAchievement"),sampleDistribution:document.getElementById("sampleDistribution"),upcomingSchedules:document.getElementById("upcomingSchedules"),repMonitoringTable:document.getElementById("repMonitoringTable"),topPerformers:document.getElementById("topPerformers"),underperformers:document.getElementById("underperformers"),visitCompletionRate:document.getElementById("visitCompletionRate"),reportSubmissionTrend:document.getElementById("reportSubmissionTrend"),recentReportsFeed:document.getElementById("recentReportsFeed"),alertsList:document.getElementById("alertsList"),todayAppointments:document.getElementById("todayAppointments"),missedAppointments:document.getElementById("missedAppointments"),completedAppointments:document.getElementById("completedAppointments"),upcomingSchedulesList:document.getElementById("upcomingSchedulesList"),quotaTrackingList:document.getElementById("quotaTrackingList"),quotaAlerts:document.getElementById("quotaAlerts"),lastUpdated:document.getElementById("lastUpdated"),repSearch:document.getElementById("repSearch")};let w=[],E=[],P=[];async function O(){await H()&&(await q(),z(),R(),setInterval(q,5*60*1e3))}async function q(){try{await Promise.all([U(),x(),N(),j(),F(),V(),Q()]),R()}catch(e){console.error("Error loading dashboard data:",e)}}async function U(){try{const{data:e,error:t}=await h.from("profiles").select("id, full_name, email, role, created_at").eq("role","repmeds");if(t)throw t;w=e||[];const r=new Date;r.setHours(0,0,0,0);const i=new Date(r);i.setDate(i.getDate()+1);const{data:u,error:c}=await h.from("visits").select("id, rep_id, status, scheduled_date").gte("scheduled_date",r.toISOString()).lt("scheduled_date",i.toISOString());if(c)throw c;E=u||[];const d=new Set(E.map(p=>p.rep_id)).size,a=E.filter(p=>p.status==="completed").length,{data:o,error:g}=await h.from("reports").select("visit_id").gte("created_at",r.toISOString());if(g)throw g;P=o||[];const f=new Set(o.map(p=>p.visit_id)),y=E.filter(p=>p.status==="completed"&&!f.has(p.id)).length,n=new Date().toISOString().slice(0,7),{data:m,error:S}=await h.from("quotas").select("*").eq("month",n);if(S)throw S;let I=0;m&&m.length>0&&m.forEach(p=>{const M=(p.doctor_visits_actual||0)/(p.doctor_visits_target||1),k=(p.pharmacy_calls_actual||0)/(p.pharmacy_calls_target||1),C=(p.sample_distribution_actual||0)/(p.sample_distribution_target||1);I+=(M+k+C)/3});const _=(m==null?void 0:m.length)>0?Math.round(I/m.length*100):0,{data:L,error:J}=await h.from("sample_distributions").select("quantity").gte("distributed_at",r.toISOString()),A=(L==null?void 0:L.reduce((p,M)=>p+(M.quantity||0),0))||0,{data:$,error:K}=await h.from("visits").select("id").gte("scheduled_date",new Date().toISOString()).eq("status","scheduled").limit(100),B=($==null?void 0:$.length)||0;v(s.totalReps,w.length),v(s.activeReps,d),v(s.totalVisits,E.length),v(s.completedCalls,a),v(s.pendingReports,y),v(s.quotaAchievement,`${_}%`),v(s.sampleDistribution,A.toLocaleString()),v(s.upcomingSchedules,B)}catch(e){console.error("Error loading summary stats:",e),G()}}async function x(){try{if(w.length===0){s.repMonitoringTable.innerHTML=`
        <tr><td colspan="6" class="empty-text">No representatives found</td></tr>
      `;return}const e=new Date;e.setHours(0,0,0,0);const t=new Date(e);t.setDate(t.getDate()+1);const{data:r,error:i}=await h.from("visits").select("rep_id, status, scheduled_date, notes").gte("scheduled_date",e.toISOString()).lt("scheduled_date",t.toISOString());if(i)throw i;const u=new Date().toISOString().slice(0,7),{data:c,error:l}=await h.from("quotas").select("rep_id, doctor_visits_target, doctor_visits_actual").eq("month",u);if(l)throw l;const d=w.map(a=>{const o=(r==null?void 0:r.filter(_=>_.rep_id===a.id))||[],g=o.filter(_=>_.status==="completed").length,f=o.length>0?new Date(Math.max(...o.map(_=>new Date(_.scheduled_date)))):null,y=c==null?void 0:c.find(_=>_.rep_id===a.id),n=y?Math.round((y.doctor_visits_actual||0)/(y.doctor_visits_target||1)*100):0;let m="inactive",S="badge-warning";o.length>0&&(m="active",S="badge-success");const I=f?f.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}):"No activity";return{...a,visitsToday:g,quotaProgress:n,status:m,statusClass:S,lastActivity:I,territory:"Metro Manila"}});D(d),window.allRepData=d}catch(e){console.error("Error loading representative monitoring:",e),s.repMonitoringTable.innerHTML=`
      <tr><td colspan="6" class="empty-text">Error loading data</td></tr>
    `}}function D(e){if(e.length===0){s.repMonitoringTable.innerHTML=`
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
          <div class="progress-fill ${b(t.quotaProgress/100)}" 
               style="width: ${t.quotaProgress}%"></div>
        </div>
        <span class="progress-percent">${t.quotaProgress}%</span>
      </td>
      <td>${t.lastActivity}</td>
    </tr>
  `).join("")}async function N(){try{const e=new Date;e.setDate(1),e.setHours(0,0,0,0);const{data:t,error:r}=await h.from("visits").select("rep_id, status").gte("scheduled_date",e.toISOString());if(r)throw r;const i={};w.forEach(n=>{i[n.id]={name:n.full_name||"Unknown",completed:0,scheduled:0}}),t==null||t.forEach(n=>{i[n.rep_id]&&(i[n.rep_id].scheduled++,n.status==="completed"&&i[n.rep_id].completed++)});const u=Object.values(i).filter(n=>n.scheduled>0).map(n=>({...n,rate:n.scheduled>0?n.completed/n.scheduled:0})).sort((n,m)=>m.rate-n.rate),c=u.slice(0,3),l=u.slice(-3).reverse(),d=(t==null?void 0:t.length)||0,a=(t==null?void 0:t.filter(n=>n.status==="completed").length)||0,o=d>0?Math.round(a/d*100):0,{data:g,error:f}=await h.from("reports").select("id").gte("created_at",e.toISOString());if(f)throw f;const y=a>0?Math.round(((g==null?void 0:g.length)||0)/a*100):0;s.topPerformers.innerHTML=c.length>0?c.map(n=>`
          <div class="performer-item">
            <span class="performer-name">${n.name}</span>
            <span class="performer-rate">${Math.round(n.rate*100)}%</span>
          </div>
        `).join(""):'<div class="empty-text">No data available</div>',s.underperformers.innerHTML=l.length>0?l.map(n=>`
          <div class="performer-item underperformer">
            <span class="performer-name">${n.name}</span>
            <span class="performer-rate">${Math.round(n.rate*100)}%</span>
          </div>
        `).join(""):'<div class="empty-text">No data available</div>',v(s.visitCompletionRate,`${o}%`),v(s.reportSubmissionTrend,`${y}%`)}catch(e){console.error("Error loading performance analytics:",e),s.topPerformers.innerHTML='<div class="empty-text">Error loading data</div>',s.underperformers.innerHTML='<div class="empty-text">Error loading data</div>'}}async function j(){try{const{data:e,error:t}=await h.from("reports").select(`
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
      `;return}s.recentReportsFeed.innerHTML=e.map(r=>{var o,g,f,y;const u=new Date(r.created_at).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!0}),c=((g=(o=r.visit)==null?void 0:o.doctors)==null?void 0:g.name)||"Unknown",l=((y=(f=r.visit)==null?void 0:f.doctors)==null?void 0:y.clinic_location)||"",d=w.find(n=>{var m;return n.id===((m=r.visit)==null?void 0:m.rep_id)}),a=(d==null?void 0:d.full_name)||"Unknown Rep";return`
        <div class="activity-item">
          <span class="activity-time">${u}</span>
          <span class="activity-user">${a}</span>
          <span class="activity-type">Report</span>
          <span class="activity-detail">${c}${l?" - "+l:""}</span>
        </div>
      `}).join("")}catch(e){console.error("Error loading recent reports:",e),s.recentReportsFeed.innerHTML=`
      <div class="activity-item">
        <span class="activity-detail">Error loading reports</span>
      </div>
    `}}async function F(){try{const e=new Date;e.setHours(0,0,0,0);const t=new Date(e);t.setDate(t.getDate()+1);const{data:r,error:i}=await h.from("visits").select(`
        id,
        scheduled_date,
        status,
        rep_id,
        doctors(name, clinic_location)
      `).gte("scheduled_date",e.toISOString()).lt("scheduled_date",t.toISOString()).order("scheduled_date",{ascending:!0});if(i)throw i;const u=(r==null?void 0:r.length)||0,c=(r==null?void 0:r.filter(a=>a.status==="completed").length)||0,l=(r==null?void 0:r.filter(a=>a.status==="missed").length)||0;v(s.todayAppointments,u),v(s.missedAppointments,l),v(s.completedAppointments,c);const d=(r==null?void 0:r.filter(a=>a.status==="scheduled"&&new Date(a.scheduled_date)>new Date).slice(0,5))||[];d.length>0?s.upcomingSchedulesList.innerHTML=`
        <h4>Upcoming Today</h4>
        ${d.map(a=>{var n;const o=new Date(a.scheduled_date).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!0}),g=w.find(m=>m.id===a.rep_id),f=(g==null?void 0:g.full_name)||"Unknown",y=((n=a.doctors)==null?void 0:n.name)||"Unknown";return`
            <div class="schedule-item">
              <span class="schedule-time">${o}</span>
              <span class="schedule-rep">${f}</span>
              <span class="schedule-detail">${y}</span>
            </div>
          `}).join("")}
      `:s.upcomingSchedulesList.innerHTML=`
        <h4>Upcoming Today</h4>
        <div class="empty-text">No upcoming appointments</div>
      `}catch(e){console.error("Error loading schedule overview:",e)}}async function V(){try{const e=new Date().toISOString().slice(0,7),{data:t,error:r}=await h.from("quotas").select("*").eq("month",e);if(r)throw r;if(!t||t.length===0){s.quotaTrackingList.innerHTML=`
        <div class="empty-text">No quota data for this month</div>
      `;return}const i=t.reduce((a,o)=>a+(o.doctor_visits_actual||0)/(o.doctor_visits_target||1),0)/t.length,u=t.reduce((a,o)=>a+(o.pharmacy_calls_actual||0)/(o.pharmacy_calls_target||1),0)/t.length,c=t.reduce((a,o)=>a+(o.sample_distribution_actual||0)/(o.sample_distribution_target||1),0)/t.length,l=(i+u+c)/3,d=t.filter(a=>(a.doctor_visits_actual||0)/(a.doctor_visits_target||1)<.5).length;s.quotaTrackingList.innerHTML=`
      <div class="quota-track-item">
        <div class="quota-track-header">
          <span class="quota-rep-name">Team Average</span>
          <span class="quota-percentage">${Math.round(l*100)}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${b(l)}" style="width: ${l*100}%"></div>
        </div>
      </div>
      <div class="quota-track-item">
        <div class="quota-track-header">
          <span class="quota-rep-name">Doctor Visits Target</span>
          <span class="quota-percentage">${Math.round(i*100)}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${b(i)}" style="width: ${i*100}%"></div>
        </div>
      </div>
      <div class="quota-track-item">
        <div class="quota-track-header">
          <span class="quota-rep-name">Pharmacy Calls Target</span>
          <span class="quota-percentage">${Math.round(u*100)}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${b(u)}" style="width: ${u*100}%"></div>
        </div>
      </div>
      <div class="quota-track-item">
        <div class="quota-track-header">
          <span class="quota-rep-name">Sample Distribution</span>
          <span class="quota-percentage">${Math.round(c*100)}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${b(c)}" style="width: ${c*100}%"></div>
        </div>
      </div>
    `,d>0?(s.quotaAlerts.className="info-box warning",s.quotaAlerts.innerHTML=`<strong>Attention:</strong> ${d} rep${d>1?"s":""} falling behind monthly target`):(s.quotaAlerts.className="info-box success",s.quotaAlerts.innerHTML="<strong>Great!</strong> All reps on track with monthly targets")}catch(e){console.error("Error loading quota tracking:",e)}}async function Q(){try{const e=new Date;e.setHours(0,0,0,0);const t=new Date(e);t.setDate(t.getDate()-3);const{data:r,error:i}=await h.from("visits").select("rep_id").gte("scheduled_date",t.toISOString());if(i)throw i;const u=new Set((r==null?void 0:r.map(o=>o.rep_id))||[]),c=w.filter(o=>!u.has(o.id)),{data:l,error:d}=await h.from("visits").select("id").eq("status","completed").gte("scheduled_date",e.toISOString());if(d)throw d;const a=[];c.length>0&&a.push({type:"alert-warning",icon:"person_off",title:"Inactive Representatives",message:`${c.length} rep${c.length>1?"s":""} with no activity in 3 days`}),l&&l.length>0&&a.push({type:"alert-info",icon:"assignment_late",title:"Pending Reports",message:`${l.length} visit${l.length>1?"s":""} awaiting report submission`}),a.length===0&&a.push({type:"alert-success",icon:"check_circle",title:"All Systems Normal",message:"No critical alerts at this time"}),s.alertsList.innerHTML=a.map(o=>`
      <div class="alert-item ${o.type}">
        <span class="material-symbols-outlined">${o.icon}</span>
        <div class="alert-content">
          <strong>${o.title}</strong>
          <span>${o.message}</span>
        </div>
      </div>
    `).join("")}catch(e){console.error("Error loading alerts:",e)}}function z(){const e=document.getElementById("logoutBtn"),t=document.getElementById("logoutBtnMobile");e&&e.addEventListener("click",T),t&&t.addEventListener("click",T);const r=document.querySelector(".hamburger"),i=document.querySelector(".mobile-menu");r&&i&&r.addEventListener("click",()=>{r.classList.toggle("active"),i.classList.toggle("active")}),s.repSearch&&s.repSearch.addEventListener("input",u=>{const c=u.target.value.toLowerCase();if(window.allRepData){const l=window.allRepData.filter(d=>{var a,o;return((a=d.full_name)==null?void 0:a.toLowerCase().includes(c))||((o=d.email)==null?void 0:o.toLowerCase().includes(c))});D(l)}})}function b(e){return e<.3?"low":e<.7?"medium":"high"}function v(e,t){e&&(e.textContent=t)}function R(){s.lastUpdated&&(s.lastUpdated.textContent=new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}))}function G(){[s.totalReps,s.activeReps,s.totalVisits,s.completedCalls,s.pendingReports,s.quotaAchievement,s.sampleDistribution,s.upcomingSchedules].forEach(t=>{t&&(t.textContent="--")})}document.addEventListener("DOMContentLoaded",O);
