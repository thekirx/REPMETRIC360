import{r as b,u as S,b as A,s as x}from"./auth-lOpszQbR.js";/* empty css               */import"https://esm.sh/@supabase/supabase-js@2";const m=document.querySelector(".appointment-list"),p=document.querySelector(".appointments-section h2"),i=document.getElementById("calendarGrid"),f=document.getElementById("currentMonthDisplay"),D=document.getElementById("prevMonth"),M=document.getElementById("nextMonth");let u=new Date,n=new Date;const y=["January","February","March","April","May","June","July","August","September","October","November","December"];async function I(){const a=await b();a&&(await S(),g(n.getFullYear(),n.getMonth()),N(),await v(a.id,u))}function g(a,t){if(!i)return;const l=Array.from(i.children).slice(0,7);i.innerHTML="",l.forEach(e=>i.appendChild(e));const r=new Date(a,t,1).getDay(),o=new Date(a,t+1,0).getDate();f&&(f.textContent=`${y[t]} ${a}`);for(let e=0;e<r;e++){const s=document.createElement("div");s.className="calendar-day empty",s.style.visibility="hidden",i.appendChild(s)}const c=new Date;for(let e=1;e<=o;e++){const s=document.createElement("div");s.className="calendar-day",s.textContent=e,s.dataset.day=e,a===c.getFullYear()&&t===c.getMonth()&&e===c.getDate()&&(s.classList.add("selected"),u=new Date(a,t,e),p&&(p.textContent=`${e} ${y[t]} Appointments`)),i.appendChild(s)}}function N(){i&&i.addEventListener("click",async a=>{const t=a.target.closest(".calendar-day:not(.empty)");if(!t)return;i.querySelectorAll(".calendar-day").forEach(c=>c.classList.remove("selected")),t.classList.add("selected");const r=parseInt(t.textContent);u=new Date(n.getFullYear(),n.getMonth(),r),p&&(p.textContent=`${r} ${y[n.getMonth()]} Appointments`);const o=await A();o&&await v(o.id,u)}),D&&D.addEventListener("click",()=>{n.setMonth(n.getMonth()-1),g(n.getFullYear(),n.getMonth())}),M&&M.addEventListener("click",()=>{n.setMonth(n.getMonth()+1),g(n.getFullYear(),n.getMonth())})}async function v(a,t){const l=new Date(t);l.setHours(0,0,0,0);const r=new Date(t);r.setHours(23,59,59,999);const{data:o,error:c}=await x.from("visits").select("id, scheduled_date, status, notes, doctors(id, name, specialty, clinic_location)").eq("rep_id",a).gte("scheduled_date",l.toISOString()).lte("scheduled_date",r.toISOString()).order("scheduled_date",{ascending:!0});if(c){console.error("Error loading appointments:",c),m.innerHTML=`
      <div class="appointment-card">
        <div class="appointment-details">
          <h3>Error loading appointments</h3>
          <p>Please try again later</p>
        </div>
      </div>
    `;return}if(!o||o.length===0){m.innerHTML=`
      <div class="appointment-card">
        <div class="appointment-details">
          <h3>No appointments scheduled</h3>
          <p>Rest day! Or add a new visit.</p>
        </div>
      </div>
    `;return}m.innerHTML=o.map(e=>{const E=new Date(e.scheduled_date).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!0}),d=e.doctors,w=(d==null?void 0:d.name)||"Unknown",h=(d==null?void 0:d.specialty)||"",C=(d==null?void 0:d.clinic_location)||e.notes||"",L=e.status==="completed"?"badge-success":e.status==="cancelled"?"badge-error":"badge-warning",$=e.status==="completed"?"Completed":e.status==="cancelled"?"Cancelled":"Pending";return`
      <div class="appointment-card" data-visit-id="${e.id}">
        <div class="appointment-time">${E}</div>
        <div class="appointment-details">
          <h3>${w}${h?" - "+h:""}</h3>
          <p>${C}</p>
        </div>
        <span class="badge ${L}">${$}</span>
      </div>
    `}).join("")}document.addEventListener("DOMContentLoaded",I);
