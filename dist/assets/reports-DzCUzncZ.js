import{s as f,b as h,r as _,u as C}from"./auth-C6cLn3GG.js";/* empty css               */import"https://esm.sh/@supabase/supabase-js@2";const u=document.querySelector(".reports-table tbody"),m=document.querySelector(".summary-card:nth-child(1) .summary-number"),b=document.querySelector(".summary-card:nth-child(2) .summary-number"),y=document.querySelector(".summary-card:nth-child(3) .summary-number");async function v(){const n=await _();n&&(await C(),await E(n.id))}async function E(n){const{data:t,error:r}=await f.from("reports").select("id, created_at, notes, doctor_feedback, samples_distributed, status, visits(id, scheduled_date, doctors(name, clinic_location))").eq("rep_id",n).order("created_at",{ascending:!1});if(r){console.error("Error loading reports:",r),u.innerHTML=`
      <tr>
        <td colspan="5" style="text-align: center;">Error loading reports. Please try again.</td>
      </tr>
    `;return}if(!t||t.length===0){u.innerHTML=`
      <tr>
        <td colspan="5" style="text-align: center;">No reports yet. Create your first report!</td>
      </tr>
    `,g(0,0,0);return}const d=t.length,s=t.filter(e=>e.status==="completed").length,a=t.filter(e=>e.status==="pending").length;g(d,s,a),u.innerHTML=t.map(e=>{var p;const w=new Date(e.created_at).toLocaleDateString("en-CA"),o=(p=e.visits)==null?void 0:p.doctors,$=(o==null?void 0:o.name)||"Unknown",i=(o==null?void 0:o.clinic_location)||"";let c="Visit",l="badge-type-visit";e.samples_distributed&&e.samples_distributed>0?(c="Sample",l="badge-type-sample"):i&&i.toLowerCase().includes("pharmacy")&&(c="Call",l="badge-type-call");const R=e.status==="completed"?"badge-success":"badge-warning";return`
      <tr data-report-id="${e.id}">
        <td>${w}</td>
        <td>${$}${i?" - "+i:""}</td>
        <td><span class="badge ${l}">${c}</span></td>
        <td><span class="badge ${R}">${e.status==="completed"?"Completed":"Pending"}</span></td>
        <td>
          <button class="btn-action btn-view" onclick="viewReport(${e.id})">View</button>
          <button class="btn-action btn-edit" onclick="editReport(${e.id})">Edit</button>
        </td>
      </tr>
    `}).join("")}function g(n,t,r){m&&(m.textContent=n),b&&(b.textContent=t),y&&(y.textContent=r)}async function S(n){var s,a;const{data:t,error:r}=await f.from("reports").select("*, visits(*, doctors(*))").eq("id",n).single();if(r){alert("Error loading report details");return}const d=((a=(s=t.visits)==null?void 0:s.doctors)==null?void 0:a.name)||"Unknown";alert(`Report Details:
Doctor: ${d}
Notes: ${t.notes||"N/A"}
Feedback: ${t.doctor_feedback||"N/A"}
Samples: ${t.samples_distributed||0}`)}async function k(n){alert(`Edit report ${n} - Feature coming soon!`)}async function q(){await h()&&alert("Create new report - Feature coming soon!")}window.viewReport=S;window.editReport=k;window.createReport=q;document.addEventListener("DOMContentLoaded",v);
