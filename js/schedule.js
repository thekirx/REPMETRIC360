// Schedule.js - Live data from Supabase
import { supabase } from "./supabaseclient.js";
import { requireAuth, getUser, updateAdminNav } from "./auth.js";

// DOM Elements
const appointmentsListEl = document.querySelector(".appointment-list");
const appointmentsTitleEl = document.querySelector(".appointments-section h2");
const calendarGridEl = document.getElementById("calendarGrid");
const currentMonthDisplayEl = document.getElementById("currentMonthDisplay");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

// State
let currentDate = new Date(); // Ito yung month/year na naka-display sa calendar
let selectedDate = new Date(); // Ito yung specific day na pinili ng user
let displayDate = new Date(); // Ito yung current month na tinitignan sa calendar

// Month names para sa header display
const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

// Initialize schedule page
async function initSchedule() {
  const session = await requireAuth();
  if (!session) return;
  const userId = session.user.id;

  // Update admin nav visibility
  await updateAdminNav();

  // DEV NOTE: Generate calendar muna bago mag-setup ng click handlers
  // Dapat April 2026 ang default (current month based on system time)
  generateCalendar(displayDate.getFullYear(), displayDate.getMonth());
  
  // Setup calendar interactions
  setupCalendar();
  
  // Load appointments for selected date
  await loadAppointments(userId, selectedDate);
}

// Generate calendar grid dynamically based on year and month
// DEV NOTE: Dapat dynamic to - kaya nga generateCalendar function para flexible
function generateCalendar(year, month) {
  if (!calendarGridEl) return;
  
  // Clear existing day cells pero keep the headers (first 7 children)
  // Ito yung Sun-Mon-Tue-Wed-Thu-Fri-Sat headers
  const headers = Array.from(calendarGridEl.children).slice(0, 7);
  calendarGridEl.innerHTML = "";
  headers.forEach(header => calendarGridEl.appendChild(header));
  
  // Calculate first day ng month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  // Calculate total days sa month na to
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Update header display
  if (currentMonthDisplayEl) {
    currentMonthDisplayEl.textContent = `${monthNames[month]} ${year}`;
  }
  
  // Create empty placeholder divs para sa days before the 1st
  // Para aligned yung calendar properly
  for (let i = 0; i < firstDayOfMonth; i++) {
    const emptyDay = document.createElement("div");
    emptyDay.className = "calendar-day empty";
    emptyDay.style.visibility = "hidden"; // Hide pero occupy pa rin ng space
    calendarGridEl.appendChild(emptyDay);
  }
  
  // Create .calendar-day divs para sa bawat day ng month
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEl = document.createElement("div");
    dayEl.className = "calendar-day";
    dayEl.textContent = day;
    dayEl.dataset.day = day; // Store day number para madaling makuha later
    
    // Highlight today's date with .selected class if viewing current month
    // DEV NOTE: Check muna if same month and year para accurate
    if (year === today.getFullYear() && 
        month === today.getMonth() && 
        day === today.getDate()) {
      dayEl.classList.add("selected");
      
      // Update selected date to today
      selectedDate = new Date(year, month, day);
      
      // Update appointments title
      if (appointmentsTitleEl) {
        appointmentsTitleEl.textContent = `${day} ${monthNames[month]} Appointments`;
      }
    }
    
    calendarGridEl.appendChild(dayEl);
  }
}

// Highlight today's date on calendar
// DEV NOTE: Simplified na to kasi sa generateCalendar na nangyayari yung highlighting
function highlightToday() {
  const today = new Date();
  
  // Check kung current month yung naka-display
  if (displayDate.getMonth() === today.getMonth() && 
      displayDate.getFullYear() === today.getFullYear()) {
    // Find today's day element
    const calendarDays = calendarGridEl.querySelectorAll(".calendar-day:not(.empty)");
    calendarDays.forEach(day => {
      day.classList.remove("selected");
      if (parseInt(day.textContent) === today.getDate()) {
        day.classList.add("selected");
      }
    });
    
    // Update selected date to today
    selectedDate = new Date();
    
    // Update appointments title
    if (appointmentsTitleEl) {
      appointmentsTitleEl.textContent = `${today.getDate()} ${monthNames[today.getMonth()]} Appointments`;
    }
  }
}

// Setup calendar interactions
// DEV NOTE: Gumamit tayo ng event delegation para kahit dynamic yung days, gumana pa rin
function setupCalendar() {
  // Event delegation sa calendar grid para sa dynamically created days
  if (calendarGridEl) {
    calendarGridEl.addEventListener("click", async (e) => {
      // Check kung .calendar-day yung tinap (at hindi empty placeholder)
      const dayEl = e.target.closest(".calendar-day:not(.empty)");
      if (!dayEl) return;
      
      // Remove selected from all days
      const calendarDays = calendarGridEl.querySelectorAll(".calendar-day");
      calendarDays.forEach(d => d.classList.remove("selected"));
      
      // Add selected to clicked day
      dayEl.classList.add("selected");
      
      // Update selected date
      const dayNum = parseInt(dayEl.textContent);
      selectedDate = new Date(displayDate.getFullYear(), displayDate.getMonth(), dayNum);
      
      // Update title
      if (appointmentsTitleEl) {
        appointmentsTitleEl.textContent = `${dayNum} ${monthNames[displayDate.getMonth()]} Appointments`;
      }
      
      // Reload appointments
      const user = await getUser();
      if (user) {
        await loadAppointments(user.id, selectedDate);
      }
    });
  }
  
  // Month navigation handlers
  // DEV NOTE: Dapat may prev/next month buttons para ma-navigate yung calendar
  if (prevMonthBtn) {
    prevMonthBtn.addEventListener("click", () => {
      displayDate.setMonth(displayDate.getMonth() - 1);
      generateCalendar(displayDate.getFullYear(), displayDate.getMonth());
    });
  }
  
  if (nextMonthBtn) {
    nextMonthBtn.addEventListener("click", () => {
      displayDate.setMonth(displayDate.getMonth() + 1);
      generateCalendar(displayDate.getFullYear(), displayDate.getMonth());
    });
  }
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
