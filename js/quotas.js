// Quotas.js - Live data from Supabase
import { supabase } from "./supabaseClient.js";
import { requireAuth } from "./auth.js";

// DOM Elements
const summaryCardsEl = document.querySelector(".quota-summary");
const quotasProgressEl = document.querySelector(".quotas-progress .card");

// Initialize quotas page
async function initQuotas() {
  const user = await requireAuth();
  if (!user) return;

  await loadQuotaData(user.id);
}

// Fetch and render quota data
async function loadQuotaData(userId) {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  
  // Get quota for current month
  const { data: quota, error } = await supabase
    .from("quotas")
    .select("*")
    .eq("rep_id", userId)
    .eq("month", currentMonth)
    .single();

  if (error && error.code !== "PGRST116") { // PGRST116 = no rows found
    console.error("Error loading quota:", error);
  }

  // Get actual completed counts for this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: visits, error: visitsError } = await supabase
    .from("visits")
    .select("id, status")
    .eq("rep_id", userId)
    .gte("scheduled_date", startOfMonth.toISOString());

  if (visitsError) {
    console.error("Error loading visits:", visitsError);
  }

  const totalVisits = visits?.length || 0;
  const completedVisits = visits?.filter(v => v.status === "completed").length || 0;

  // Default targets if no quota set
  const targets = {
    doctor_visits: quota?.doctor_visits_target || 25,
    pharmacy_calls: quota?.pharmacy_calls_target || 15,
    sample_distribution: quota?.sample_distribution_target || 50,
    meetings: quota?.meetings_target || 10
  };

  // Calculate progress (example logic - adjust based on your business rules)
  const doctorVisitsCount = Math.min(completedVisits, targets.doctor_visits);
  const pharmacyCallsCount = Math.min(Math.floor(completedVisits * 0.6), targets.pharmacy_calls);
  const samplesCount = Math.min(Math.floor(completedVisits * 2.5), targets.sample_distribution);
  const meetingsCount = Math.min(Math.floor(completedVisits * 0.3), targets.meetings);

  // Calculate overall progress
  const totalTarget = targets.doctor_visits + targets.pharmacy_calls + targets.sample_distribution + targets.meetings;
  const totalCompleted = doctorVisitsCount + pharmacyCallsCount + samplesCount + meetingsCount;
  const overallProgress = Math.round((totalCompleted / totalTarget) * 100);

  // Update summary cards
  updateSummaryCards(overallProgress, completedVisits, totalTarget - totalCompleted);

  // Update progress bars
  updateProgressBars({
    doctor_visits: { current: doctorVisitsCount, target: targets.doctor_visits },
    pharmacy_calls: { current: pharmacyCallsCount, target: targets.pharmacy_calls },
    sample_distribution: { current: samplesCount, target: targets.sample_distribution },
    meetings: { current: meetingsCount, target: targets.meetings }
  });
}

// Update summary cards with live data
function updateSummaryCards(progressPercent, completedCount, remainingCount) {
  if (!summaryCardsEl) return;

  const cards = summaryCardsEl.querySelectorAll(".summary-card");
  
  // Monthly Target card
  if (cards[0]) {
    cards[0].querySelector(".summary-number").textContent = `${progressPercent}%`;
  }
  
  // Completed card
  if (cards[1]) {
    cards[1].querySelector(".summary-number").textContent = completedCount;
  }
  
  // Remaining card
  if (cards[2]) {
    cards[2].querySelector(".summary-number").textContent = remainingCount;
  }
}

// Update progress bars
function updateProgressBars(quotas) {
  if (!quotasProgressEl) return;

  const progressHTML = `
    <h2>Activity Quotas</h2>
    <p class="card-subtitle">Progress sa monthly targets</p>

    <div class="quota-item">
      <div class="quota-header">
        <div class="quota-info">
          <span class="material-symbols-outlined">medical_services</span>
          <span>Doctor Visits</span>
        </div>
        <span class="quota-count">${quotas.doctor_visits.current} / ${quotas.doctor_visits.target}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${getProgressClass(quotas.doctor_visits.current / quotas.doctor_visits.target)}" 
             style="width: ${(quotas.doctor_visits.current / quotas.doctor_visits.target) * 100}%"></div>
      </div>
      <div class="quota-footer">
        <span>${Math.round((quotas.doctor_visits.current / quotas.doctor_visits.target) * 100)}% Complete</span>
        <span>${quotas.doctor_visits.target - quotas.doctor_visits.current} na lang</span>
      </div>
    </div>

    <div class="quota-item">
      <div class="quota-header">
        <div class="quota-info">
          <span class="material-symbols-outlined">local_pharmacy</span>
          <span>Pharmacy Calls</span>
        </div>
        <span class="quota-count">${quotas.pharmacy_calls.current} / ${quotas.pharmacy_calls.target}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${getProgressClass(quotas.pharmacy_calls.current / quotas.pharmacy_calls.target)}" 
             style="width: ${(quotas.pharmacy_calls.current / quotas.pharmacy_calls.target) * 100}%"></div>
      </div>
      <div class="quota-footer">
        <span>${Math.round((quotas.pharmacy_calls.current / quotas.pharmacy_calls.target) * 100)}% Complete</span>
        <span>${quotas.pharmacy_calls.target - quotas.pharmacy_calls.current} na lang</span>
      </div>
    </div>

    <div class="quota-item">
      <div class="quota-header">
        <div class="quota-info">
          <span class="material-symbols-outlined">medication</span>
          <span>Sample Distribution</span>
        </div>
        <span class="quota-count">${quotas.sample_distribution.current} / ${quotas.sample_distribution.target}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${getProgressClass(quotas.sample_distribution.current / quotas.sample_distribution.target)}" 
             style="width: ${(quotas.sample_distribution.current / quotas.sample_distribution.target) * 100}%"></div>
      </div>
      <div class="quota-footer">
        <span>${Math.round((quotas.sample_distribution.current / quotas.sample_distribution.target) * 100)}% Complete</span>
        <span>${quotas.sample_distribution.target - quotas.sample_distribution.current} na lang</span>
      </div>
    </div>

    <div class="quota-item">
      <div class="quota-header">
        <div class="quota-info">
          <span class="material-symbols-outlined">groups</span>
          <span>Meetings</span>
        </div>
        <span class="quota-count">${quotas.meetings.current} / ${quotas.meetings.target}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${getProgressClass(quotas.meetings.current / quotas.meetings.target)}" 
             style="width: ${(quotas.meetings.current / quotas.meetings.target) * 100}%"></div>
      </div>
      <div class="quota-footer">
        <span>${Math.round((quotas.meetings.current / quotas.meetings.target) * 100)}% Complete</span>
        <span>${quotas.meetings.target - quotas.meetings.current} na lang</span>
      </div>
    </div>
  `;

  quotasProgressEl.innerHTML = progressHTML;
}

// Get CSS class based on progress
function getProgressClass(ratio) {
  if (ratio < 0.3) return "low";
  if (ratio < 0.7) return "medium";
  return "high";
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initQuotas);
