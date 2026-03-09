import{s as f}from"./supabaseClient-D4v529L2.js";/* empty css               */import{r as w,a as D}from"./auth-8WVZwt0Y.js";import"https://esm.sh/@supabase/supabase-js@2";const r=document.querySelector(".appointment-list"),S=document.querySelector(".appointments-section h2");let p=new Date,d=new Date;async function b(){const n=await w();n&&(L(),await u(n.id,d))}function L(){const n=document.querySelectorAll(".calendar-day");n.forEach(a=>{a.addEventListener("click",async()=>{n.forEach(c=>c.classList.remove("selected")),a.classList.add("selected");const i=parseInt(a.textContent);d=new Date(p.getFullYear(),p.getMonth(),i);const o=["January","February","March","April","May","June","July","August","September","October","November","December"];S.textContent=`${i} ${o[d.getMonth()]} Appointments`;const s=await D();s&&await u(s.id,d)})})}async function u(n,a){const i=new Date(a);i.setHours(0,0,0,0);const o=new Date(a);o.setHours(23,59,59,999);const{data:s,error:c}=await f.from("visits").select("id, scheduled_date, status, notes, doctors(id, name, specialty, clinic_location)").eq("rep_id",n).gte("scheduled_date",i.toISOString()).lte("scheduled_date",o.toISOString()).order("scheduled_date",{ascending:!0});if(c){console.error("Error loading appointments:",c),r.innerHTML=`
      <div class="appointment-card">
        <div class="appointment-details">
          <h3>Error loading appointments</h3>
          <p>Please try again later</p>
        </div>
      </div>
    `;return}if(!s||s.length===0){r.innerHTML=`
      <div class="appointment-card">
        <div class="appointment-details">
          <h3>No appointments scheduled</h3>
          <p>Rest day! Or add a new visit.</p>
        </div>
      </div>
    `;return}r.innerHTML=s.map(t=>{const m=new Date(t.scheduled_date).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!0}),e=t.doctors,h=(e==null?void 0:e.name)||"Unknown",l=(e==null?void 0:e.specialty)||"",g=(e==null?void 0:e.clinic_location)||t.notes||"",y=t.status==="completed"?"badge-success":t.status==="cancelled"?"badge-error":"badge-warning",v=t.status==="completed"?"Completed":t.status==="cancelled"?"Cancelled":"Pending";return`
      <div class="appointment-card" data-visit-id="${t.id}">
        <div class="appointment-time">${m}</div>
        <div class="appointment-details">
          <h3>${h}${l?" - "+l:""}</h3>
          <p>${g}</p>
        </div>
        <span class="badge ${y}">${v}</span>
      </div>
    `}).join("")}document.addEventListener("DOMContentLoaded",b);
