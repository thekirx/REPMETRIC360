// Dashboard.js - Live data from Supabase
import { supabase } from "./supabaseclient.js";
import { requireAuth, logout, getUser, updateAdminNav } from "./auth.js";

// DOM Elements
const activityFeedEl = document.querySelector(".activity-feed");
const progressContainerEl = document.querySelector(".dashboard-right .card:first-child");

// Initialize dashboard
async function initDashboard() {
  const user = await requireAuth();
  if (!user) return;
  
  // Update admin nav visibility AFTER auth is confirmed
  await updateAdminNav();

  // Load all data
  await Promise.all([
    loadRecentActivities(user.id),
    loadProgressReporting(user.id)
  ]);

  // Setup activity form submission
  setupActivityForm(user.id);
}

// Helper function to format activity type for display
function formatActivityType(type) {
  if (!type) return "Activity";
  return type
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Fetch and render recent activities from both activities and visits tables
async function loadRecentActivities(userId) {
  // Show loading state
  activityFeedEl.innerHTML = `
    <div class="activity-item">
      <span class="activity-detail">Loading activities...</span>
    </div>
  `;

  // Get fresh user session for the queries
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    activityFeedEl.innerHTML = `
      <div class="activity-item">
        <span class="activity-detail">Session expired. Please log in again.</span>
      </div>
    `;
    return;
  }
  const currentUserId = session.user.id;

  // Query both tables in parallel
  const [activitiesResult, visitsResult] = await Promise.all([
    // Query activities table for user-logged activities
    supabase
      .from("activities")
      .select("id, activity_type, details, location, created_at")
      .eq("rep_id", currentUserId)
      .order("created_at", { ascending: false })
      .limit(10),
    
    // Query visits table for scheduled visits with doctor info
    supabase
      .from("visits")
      .select("id, scheduled_date, status, notes, doctors(name, specialty, clinic_location)")
      .eq("rep_id", currentUserId)
      .order("scheduled_date", { ascending: false })
      .limit(10)
  ]);

  if (activitiesResult.error) {
    console.error("Error loading activities:", activitiesResult.error);
  }
  if (visitsResult.error) {
    console.error("Error loading visits:", visitsResult.error);
  }

  const activities = activitiesResult.data || [];
  const visits = visitsResult.data || [];

  // If no activities or visits, show empty state
  if (activities.length === 0 && visits.length === 0) {
    activityFeedEl.innerHTML = `
      <div class="activity-item">
        <span class="activity-detail">No activities yet. Log your first activity!</span>
      </div>
    `;
    return;
  }

  // Combine and normalize both types of activities
  const combinedActivities = [
    // Map activities table items
    ...activities.map(activity => ({
      id: activity.id,
      type: "activity",
      date: new Date(activity.created_at),
      activityType: formatActivityType(activity.activity_type),
      detail: activity.details || "",
      location: activity.location || ""
    })),
    
    // Map visits table items
    ...visits.map(visit => {
      const doctorName = visit.doctors?.name || "Unknown Doctor";
      const location = visit.doctors?.clinic_location || "";
      const activityType = visit.doctors?.specialty ? "Doctor Visit" : "Pharmacy Call";
      
      return {
        id: visit.id,
        type: "visit",
        date: new Date(visit.scheduled_date),
        activityType: activityType,
        detail: `${doctorName}${location ? " - " + location : ""}`,
        location: location
      };
    })
  ];

  // Sort by date (most recent first) and limit to 10
  combinedActivities.sort((a, b) => b.date - a.date);
  const recentActivities = combinedActivities.slice(0, 10);

  // Render activities
  activityFeedEl.innerHTML = recentActivities.map(activity => {
    const timeStr = activity.date.toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit",
      hour12: true 
    });
    
    return `
      <div class="activity-item">
        <span class="activity-time">${timeStr}</span>
        <span class="activity-type">${activity.activityType}</span>
        <span class="activity-detail">${activity.detail}${activity.location && !activity.detail.includes(activity.location) ? " - " + activity.location : ""}</span>
      </div>
    `;
  }).join("");
}

// Fetch quota progress and update progress bars
async function loadProgressReporting(userId) {
  // Get fresh user session for the queries
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.error("Session expired in loadProgressReporting");
    return;
  }
  const currentUserId = session.user.id;

  // Get current month's quota
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  
  const { data: quota, error } = await supabase
    .from("quotas")
    .select("*")
    .eq("rep_id", currentUserId)
    .eq("month", currentMonth)
    .single();

  if (error && error.code !== "PGRST116") { // PGRST116 = no rows
    console.error("Error loading quota:", error);
    return;
  }

  // Get activity counts for current month from activities table
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const endOfMonth = new Date();
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);
  endOfMonth.setHours(23, 59, 59, 999);

  // Query activities table for counts by type
  const { data: activities, error: activitiesError } = await supabase
    .from("activities")
    .select("activity_type")
    .eq("rep_id", currentUserId)
    .gte("created_at", startOfMonth.toISOString())
    .lte("created_at", endOfMonth.toISOString());

  if (activitiesError) {
    console.error("Error loading activities:", activitiesError);
  }

  // Count activities by type
  let doctorVisitsCount = 0;
  let pharmacyCallsCount = 0;
  let sampleDistributionCount = 0;

  (activities || []).forEach(activity => {
    const type = activity.activity_type?.toLowerCase() || "";
    if (type.includes("doctor") || type.includes("visit")) {
      doctorVisitsCount++;
    } else if (type.includes("pharmacy") || type.includes("call")) {
      pharmacyCallsCount++;
    } else if (type.includes("sample") || type.includes("distribution")) {
      sampleDistributionCount++;
    } else {
      // Default to doctor visits for unknown types
      doctorVisitsCount++;
    }
  });
  
  // Default quotas if none set
  const targets = {
    doctor_visits: quota?.doctor_visits_target || 10,
    pharmacy_calls: quota?.pharmacy_calls_target || 15,
    sample_distribution: quota?.sample_distribution_target || 20
  };

  // Calculate progress
  const doctorVisits = Math.min(doctorVisitsCount, targets.doctor_visits);
  const pharmacyCalls = Math.min(pharmacyCallsCount, targets.pharmacy_calls);
  const samples = Math.min(sampleDistributionCount, targets.sample_distribution);

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

    // Get fresh user session for the insert
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("Session expired. Please log in again.");
      return;
    }

    // Insert new activity into activities table
    const { error } = await supabase
      .from("activities")
      .insert([
        {
          rep_id: session.user.id,  // Use session.user.id directly, not the passed userId
          activity_type: activityType,
          details: details,
          location: location
        }
      ]);

    if (error) {
      console.error("Error logging activity:", error);
      alert("Failed to log activity: " + error.message);
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
