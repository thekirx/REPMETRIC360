// Schedule.js - Live data from Supabase
import { supabase } from "./supabaseClient.js";
import { requireAuth, getUser, updateAdminNav } from "./auth.js";

// DOM Elements
const appointmentsListEl = document.querySelector(".appointment-list");
const appointmentsTitleEl = document.querySelector(".appointments-section h2");

// State
let currentDate = new Date();
let selectedDate = new Date();

// Initialize schedule page
async function initSchedule() {
  // Update admin nav visibility
  await updateAdminNav();
  
  const user = await requireAuth();
  if (!user) return;

  // Setup calendar with today's date highlighted
  setupCalendar();
  highlightToday();
  
  // Load appointments for selected date
  await loadAppointments(user.id, selectedDate);
}

// Highlight today's date on calendar
function highlightToday() {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Update calendar header to current month/year
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const header = document.querySelector(".calendar-header h2");
  if (header) {
    header.textContent = `${monthNames[currentMonth]} ${currentYear}`;
  }
  
  // Highlight today's date
  const calendarDays = document.querySelectorAll(".calendar-day");
  calendarDays.forEach(day => {
    day.classList.remove("selected");
    if (parseInt(day.textContent) === currentDay) {
      day.classList.add("selected");
    }
  });
  
  // Update title to today
  if (appointmentsTitleEl) {
    appointmentsTitleEl.textContent = `${currentDay} ${monthNames[currentMonth]} Appointments`;
  }
  
  // Update selected date
  selectedDate = today;
}

// Setup calendar interactions
function setupCalendar() {
  const calendarDays = document.querySelectorAll(".calendar-day");
  
  calendarDays.forEach(day => {
    day.addEventListener("click", async () => {
      // Remove selected from all
      calendarDays.forEach(d => d.classList.remove("selected"));
      // Add selected to clicked
      day.classList.add("selected");
      
      // Update selected date
      const dayNum = parseInt(day.textContent);
      selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
      
      // Update title
      const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
      appointmentsTitleEl.textContent = `${dayNum} ${monthNames[selectedDate.getMonth()]} Appointments`;
      
      // Reload appointments
      const user = await getUser();
      if (user) {
        await loadAppointments(user.id, selectedDate);
      }
    });
  });
}

// Fetch and render appointments for a specific date
async function loadAppointments(userId, date) {
  // Format date for query (start and end of day)
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const { data: visits, error } = await supabase
    .from("visits")
    .select("id, scheduled_date, status, notes, doctors(id, name, specialty, clinic_location)")
    .eq("rep_id", userId)
    .gte("scheduled_date", startOfDay.toISOString())
    .lte("scheduled_date", endOfDay.toISOString())
    .order("scheduled_date", { ascending: true });

  if (error) {
    console.error("Error loading appointments:", error);
    appointmentsListEl.innerHTML = `
      <div class="appointment-card">
        <div class="appointment-details">
          <h3>Error loading appointments</h3>
          <p>Please try again later</p>
        </div>
      </div>
    `;
    return;
  }

  if (!visits || visits.length === 0) {
    appointmentsListEl.innerHTML = `
      <div class="appointment-card">
        <div class="appointment-details">
          <h3>No appointments scheduled</h3>
          <p>Rest day! Or add a new visit.</p>
        </div>
      </div>
    `;
    return;
  }

  // Render appointments
  appointmentsListEl.innerHTML = visits.map(visit => {
    const date = new Date(visit.scheduled_date);
    const timeStr = date.toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit",
      hour12: true 
    });
    
    const doctor = visit.doctors;
    const doctorName = doctor?.name || "Unknown";
    const specialty = doctor?.specialty || "";
    const location = doctor?.clinic_location || visit.notes || "";
    
    const statusClass = visit.status === "completed" ? "badge-success" : 
                       visit.status === "cancelled" ? "badge-error" : "badge-warning";
    const statusText = visit.status === "completed" ? "Completed" : 
                      visit.status === "cancelled" ? "Cancelled" : "Pending";

    return `
      <div class="appointment-card" data-visit-id="${visit.id}">
        <div class="appointment-time">${timeStr}</div>
        <div class="appointment-details">
          <h3>${doctorName}${specialty ? " - " + specialty : ""}</h3>
          <p>${location}</p>
        </div>
        <span class="badge ${statusClass}">${statusText}</span>
      </div>
    `;
  }).join("");
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initSchedule);
