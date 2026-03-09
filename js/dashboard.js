// Dashboard.js - Live data from Supabase
import { supabase } from "./supabaseClient.js";
import { requireAuth, logout, getUser } from "./auth.js";

// DOM Elements
const activityFeedEl = document.querySelector(".activity-feed");
const progressContainerEl = document.querySelector(".dashboard-right .card:first-child");

// Initialize dashboard
async function initDashboard() {
  const user = await requireAuth();
  if (!user) return;

  // Load all data
  await Promise.all([
    loadRecentActivities(user.id),
    loadProgressReporting(user.id)
  ]);

  // Setup activity form submission
  setupActivityForm(user.id);
}

// Fetch and render recent activities
async function loadRecentActivities(userId) {
  const { data: visits, error } = await supabase
    .from("visits")
    .select("id, scheduled_date, status, notes, doctors(name, specialty, clinic_location)")
    .eq("rep_id", userId)
    .order("scheduled_date", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error loading activities:", error);
    return;
  }

  if (!visits || visits.length === 0) {
    activityFeedEl.innerHTML = `
      <div class="activity-item">
        <span class="activity-detail">No activities yet. Log your first activity!</span>
      </div>
    `;
    return;
  }

  // Render activities
  activityFeedEl.innerHTML = visits.map(visit => {
    const date = new Date(visit.scheduled_date);
    const timeStr = date.toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit",
      hour12: true 
    });
    
    const doctorName = visit.doctors?.name || "Unknown Doctor";
    const location = visit.doctors?.clinic_location || "";
    const activityType = visit.doctors?.specialty ? "Doctor Visit" : "Pharmacy Call";
    
    return `
      <div class="activity-item">
        <span class="activity-time">${timeStr}</span>
        <span class="activity-type">${activityType}</span>
        <span class="activity-detail">${doctorName}${location ? " - " + location : ""}</span>
      </div>
    `;
  }).join("");
}

// Fetch quota progress and update progress bars
async function loadProgressReporting(userId) {
  // Get current month's quota
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  
  const { data: quota, error } = await supabase
    .from("quotas")
    .select("*")
    .eq("rep_id", userId)
    .eq("month", currentMonth)
    .single();

  if (error && error.code !== "PGRST116") { // PGRST116 = no rows
    console.error("Error loading quota:", error);
    return;
  }

  // Get completed counts for current month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: visits, error: visitsError } = await supabase
    .from("visits")
    .select("id, status")
    .eq("rep_id", userId)
    .gte("scheduled_date", startOfMonth.toISOString())
    .eq("status", "completed");

  if (visitsError) {
    console.error("Error loading visits:", visitsError);
    return;
  }

  const completedVisits = visits?.length || 0;
  
  // Default quotas if none set
  const targets = {
    doctor_visits: quota?.doctor_visits_target || 10,
    pharmacy_calls: quota?.pharmacy_calls_target || 15,
    sample_distribution: quota?.sample_distribution_target || 20
  };

  // Calculate progress (example distribution)
  const doctorVisits = Math.min(completedVisits, targets.doctor_visits);
  const pharmacyCalls = Math.min(Math.floor(completedVisits * 0.8), targets.pharmacy_calls);
  const samples = Math.min(Math.floor(completedVisits * 2), targets.sample_distribution);

  // Update progress HTML
  const progressHTML = `
    <h2>Progress Reporting</h2>
    <p class="card-subtitle">Track your targets and quotas</p>

    <div class="progress-item">
      <div class="progress-header">
        <span>Doctor Visits</span>
        <span class="progress-count">${doctorVisits}/${targets.doctor_visits}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${getProgressClass(doctorVisits / targets.doctor_visits)}" 
             style="width: ${(doctorVisits / targets.doctor_visits) * 100}%"></div>
      </div>
      <span class="progress-percent">${Math.round((doctorVisits / targets.doctor_visits) * 100)}%</span>
    </div>

    <div class="progress-item">
      <div class="progress-header">
        <span>Pharmacy Calls</span>
        <span class="progress-count">${pharmacyCalls}/${targets.pharmacy_calls}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${getProgressClass(pharmacyCalls / targets.pharmacy_calls)}" 
             style="width: ${(pharmacyCalls / targets.pharmacy_calls) * 100}%"></div>
      </div>
      <span class="progress-percent">${Math.round((pharmacyCalls / targets.pharmacy_calls) * 100)}%</span>
    </div>

    <div class="progress-item">
      <div class="progress-header">
        <span>Sample Distribution</span>
        <span class="progress-count">${samples}/${targets.sample_distribution}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${getProgressClass(samples / targets.sample_distribution)}" 
             style="width: ${(samples / targets.sample_distribution) * 100}%"></div>
      </div>
      <span class="progress-percent">${Math.round((samples / targets.sample_distribution) * 100)}%</span>
    </div>
  `;

  progressContainerEl.innerHTML = progressHTML;
}

// Get CSS class based on progress percentage
function getProgressClass(ratio) {
  if (ratio < 0.3) return "low";
  if (ratio < 0.7) return "medium";
  return "high";
}

// Setup activity form submission
function setupActivityForm(userId) {
  const form = document.querySelector(".activity-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const activityType = document.getElementById("activity-type").value;
    const details = document.getElementById("activity-details").value;
    const location = document.getElementById("activity-location").value;

    if (!activityType) {
      alert("Please select an activity type");
      return;
    }

    // Insert new visit/activity
    const { error } = await supabase
      .from("visits")
      .insert([
        {
          rep_id: userId,
          scheduled_date: new Date().toISOString(),
          status: "completed",
          notes: details,
          location: location
        }
      ]);

    if (error) {
      console.error("Error logging activity:", error);
      alert("Failed to log activity. Please try again.");
      return;
    }

    // Clear form and reload
    form.reset();
    await loadRecentActivities(userId);
    await loadProgressReporting(userId);
    
    alert("Activity logged successfully!");
  });
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initDashboard);
