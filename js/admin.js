// Admin Dashboard - Field Force Management Command Center
// Admin-only access with role-based authorization
import { supabase } from "./supabaseclient.js";
import { requireAdmin, logout, getUserRole } from "./auth.js";

// DOM Elements
const elements = {
  totalReps: document.getElementById("totalReps"),
  activeReps: document.getElementById("activeReps"),
  totalVisits: document.getElementById("totalVisits"),
  completedCalls: document.getElementById("completedCalls"),
  pendingReports: document.getElementById("pendingReports"),
  quotaAchievement: document.getElementById("quotaAchievement"),
  sampleDistribution: document.getElementById("sampleDistribution"),
  upcomingSchedules: document.getElementById("upcomingSchedules"),
  repMonitoringTable: document.getElementById("repMonitoringTable"),
  topPerformers: document.getElementById("topPerformers"),
  underperformers: document.getElementById("underperformers"),
  visitCompletionRate: document.getElementById("visitCompletionRate"),
  reportSubmissionTrend: document.getElementById("reportSubmissionTrend"),
  recentReportsFeed: document.getElementById("recentReportsFeed"),
  alertsList: document.getElementById("alertsList"),
  todayAppointments: document.getElementById("todayAppointments"),
  missedAppointments: document.getElementById("missedAppointments"),
  completedAppointments: document.getElementById("completedAppointments"),
  upcomingSchedulesList: document.getElementById("upcomingSchedulesList"),
  quotaTrackingList: document.getElementById("quotaTrackingList"),
  quotaAlerts: document.getElementById("quotaAlerts"),
  lastUpdated: document.getElementById("lastUpdated"),
  repSearch: document.getElementById("repSearch")
};

// State
let allRepresentatives = [];
let allVisits = [];
let allReports = [];
let allSchedules = [];

// Reusable state helpers
function showCardLoading(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="state-loading">
      <div class="skeleton skeleton-text" style="width: 60%"></div>
      <div class="skeleton skeleton-text" style="width: 80%"></div>
      <div class="skeleton skeleton-text" style="width: 40%"></div>
    </div>
  `;
}

function showCardError(container, message, retryFn) {
  if (!container) return;
  const retryId = 'retry-' + Math.random().toString(36).substr(2, 9);
  container.innerHTML = `
    <div class="state-error">
      <span class="material-symbols-outlined state-icon">error_outline</span>
      <p class="state-message">${message}</p>
      <button class="btn-retry" id="${retryId}">Try Again</button>
    </div>
  `;
  const retryBtn = document.getElementById(retryId);
  if (retryBtn && retryFn) {
    retryBtn.addEventListener('click', retryFn);
  }
}

function showCardEmpty(container, message, ctaText, ctaHref) {
  if (!container) return;
  const ctaHtml = ctaText && ctaHref 
    ? `<a href="${ctaHref}" class="btn-cta">${ctaText}</a>` 
    : '';
  container.innerHTML = `
    <div class="state-empty">
      <span class="material-symbols-outlined state-icon">inbox</span>
      <p class="state-message">${message}</p>
      ${ctaHtml}
    </div>
  `;
}

function showTableLoading(container, cols) {
  if (!container) return;
  let rows = '';
  for (let i = 0; i < 3; i++) {
    let cells = '';
    for (let j = 0; j < cols; j++) {
      cells += `<td><span class="skeleton skeleton-text" style="width: ${60 + Math.random() * 30}%"></span></td>`;
    }
    rows += `<tr>${cells}</tr>`;
  }
  container.innerHTML = rows;
}

// Initialize admin dashboard
async function initAdminDashboard() {
  // Verify admin access
  const session = await requireAdmin();
  if (!session) return;

  // Load all data
  await loadDashboardData();

  // Setup event listeners
  setupEventListeners();

  // Update last updated timestamp
  updateLastUpdated();

  // Auto-refresh every 5 minutes
  setInterval(loadDashboardData, 5 * 60 * 1000);
}

// Load all dashboard data
async function loadDashboardData() {
  try {
    await Promise.all([
      loadSummaryStats(),
      loadRepresentativeMonitoring(),
      loadPerformanceAnalytics(),
      loadRecentReports(),
      loadScheduleOverview(),
      loadQuotaTracking(),
      loadAlerts()
    ]);
    updateLastUpdated();
  } catch (error) {
    console.error("Error loading dashboard data:", error);
  }
}

// Load summary statistics
async function loadSummaryStats() {
  // Show loading skeletons at start
  const statElements = [
    elements.totalReps,
    elements.activeReps,
    elements.totalVisits,
    elements.completedCalls,
    elements.pendingReports,
    elements.quotaAchievement,
    elements.sampleDistribution,
    elements.upcomingSchedules
  ];
  statElements.forEach(el => {
    if (el) el.innerHTML = '<span class="skeleton skeleton-number"></span>';
  });

  try {
    // Get total representatives (profiles with role = 'repmeds')
    const { data: reps, error: repsError } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .eq("role", "repmeds");

    if (repsError) throw repsError;
    allRepresentatives = reps || [];

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's visits
    const { data: todayVisits, error: visitsError } = await supabase
      .from("visits")
      .select("id, rep_id, status, scheduled_date")
      .gte("scheduled_date", today.toISOString())
      .lt("scheduled_date", tomorrow.toISOString());

    if (visitsError) throw visitsError;
    allVisits = todayVisits || [];

    // Get active reps (those with visits today)
    const activeRepIds = new Set(allVisits.map(v => v.rep_id));
    const activeRepsCount = activeRepIds.size;

    // Get completed calls
    const completedVisits = allVisits.filter(v => v.status === "completed").length;

    // Get pending reports (visits without reports)
    const { data: reports, error: reportsError } = await supabase
      .from("reports")
      .select("visit_id")
      .gte("created_at", today.toISOString());

    if (reportsError) throw reportsError;
    allReports = reports || [];

    const reportedVisitIds = new Set(reports.map(r => r.visit_id));
    const pendingReportsCount = allVisits.filter(v => 
      v.status === "completed" && !reportedVisitIds.has(v.id)
    ).length;

    // Get current month's quota data
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { data: quotas, error: quotasError } = await supabase
      .from("quotas")
      .select("*")
      .eq("month", currentMonth);

    if (quotasError) throw quotasError;

    // Calculate quota achievement
    let totalQuotaProgress = 0;
    if (quotas && quotas.length > 0) {
      quotas.forEach(q => {
        const doctorProgress = (q.doctor_visits_actual || 0) / (q.doctor_visits_target || 1);
        const pharmacyProgress = (q.pharmacy_calls_actual || 0) / (q.pharmacy_calls_target || 1);
        const sampleProgress = (q.sample_distribution_actual || 0) / (q.sample_distribution_target || 1);
        totalQuotaProgress += (doctorProgress + pharmacyProgress + sampleProgress) / 3;
      });
    }
    const avgQuotaAchievement = quotas?.length > 0 
      ? Math.round((totalQuotaProgress / quotas.length) * 100) 
      : 0;

    // Get sample distribution count
    const { data: samples, error: samplesError } = await supabase
      .from("sample_distributions")
      .select("quantity")
      .gte("distributed_at", today.toISOString());

    const totalSamples = samples?.reduce((sum, s) => sum + (s.quantity || 0), 0) || 0;

    // Get upcoming schedules
    const { data: upcoming, error: upcomingError } = await supabase
      .from("visits")
      .select("id")
      .gte("scheduled_date", new Date().toISOString())
      .eq("status", "scheduled")
      .limit(100);

    const upcomingCount = upcoming?.length || 0;

    // Update DOM with actual values
    if (elements.totalReps) elements.totalReps.textContent = allRepresentatives.length;
    if (elements.activeReps) elements.activeReps.textContent = activeRepsCount;
    if (elements.totalVisits) elements.totalVisits.textContent = allVisits.length;
    if (elements.completedCalls) elements.completedCalls.textContent = completedVisits;
    if (elements.pendingReports) elements.pendingReports.textContent = pendingReportsCount;
    if (elements.quotaAchievement) elements.quotaAchievement.textContent = `${avgQuotaAchievement}%`;
    if (elements.sampleDistribution) elements.sampleDistribution.textContent = totalSamples.toLocaleString();
    if (elements.upcomingSchedules) elements.upcomingSchedules.textContent = upcomingCount;

  } catch (error) {
    console.error("Error loading summary stats:", error);
    // Show error state with tooltip
    statElements.forEach(el => {
      if (el) el.innerHTML = '<span class="stat-tooltip" data-tooltip="Data unavailable">--</span>';
    });
  }
}

// Load representative monitoring data
async function loadRepresentativeMonitoring() {
  const repTableBody = elements.repMonitoringTable;
  const tableContainer = repTableBody?.parentElement;
  
  // Show loading skeleton at start
  showTableLoading(repTableBody, 6);

  try {
    if (allRepresentatives.length === 0) {
      showCardEmpty(tableContainer, "No representatives registered yet", "Register a RepMed", "register.html?admin=true");
      return;
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get visits for all reps today
    const { data: todayVisits, error: visitsError } = await supabase
      .from("visits")
      .select("rep_id, status, scheduled_date, notes")
      .gte("scheduled_date", today.toISOString())
      .lt("scheduled_date", tomorrow.toISOString());

    if (visitsError) throw visitsError;

    // Get current month's quota for all reps
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { data: quotas, error: quotasError } = await supabase
      .from("quotas")
      .select("rep_id, doctor_visits_target, doctor_visits_actual")
      .eq("month", currentMonth);

    if (quotasError) throw quotasError;

    // Build rep data
    const repData = allRepresentatives.map(rep => {
      const repVisits = todayVisits?.filter(v => v.rep_id === rep.id) || [];
      const completedVisits = repVisits.filter(v => v.status === "completed").length;
      const lastActivity = repVisits.length > 0 
        ? new Date(Math.max(...repVisits.map(v => new Date(v.scheduled_date))))
        : null;
      
      const quota = quotas?.find(q => q.rep_id === rep.id);
      const quotaProgress = quota 
        ? Math.round(((quota.doctor_visits_actual || 0) / (quota.doctor_visits_target || 1)) * 100)
        : 0;

      // Determine status
      let status = "inactive";
      let statusClass = "badge-warning";
      if (repVisits.length > 0) {
        status = "active";
        statusClass = "badge-success";
      }
      const lastActivityTime = lastActivity 
        ? lastActivity.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        : "No activity";

      return {
        ...rep,
        visitsToday: completedVisits,
        quotaProgress,
        status,
        statusClass,
        lastActivity: lastActivityTime,
        territory: "Metro Manila" // Default territory
      };
    });

    // Render table
    renderRepTable(repData);

    // Store for search functionality
    window.allRepData = repData;

  } catch (error) {
    console.error("Error loading representative monitoring:", error);
    showCardError(tableContainer, "Could not load representatives", loadRepresentativeMonitoring);
  }
}

// Render representative table
function renderRepTable(repData) {
  if (repData.length === 0) {
    elements.repMonitoringTable.innerHTML = `
      <tr><td colspan="6" class="empty-text">No representatives found</td></tr>
    `;
    return;
  }

  elements.repMonitoringTable.innerHTML = repData.map(rep => `
    <tr>
      <td>
        <div class="rep-name">${rep.full_name || "Unknown"}</div>
        <div class="rep-email">${rep.email || ""}</div>
      </td>
      <td>${rep.territory}</td>
      <td><span class="badge ${rep.statusClass}">${rep.status}</span></td>
      <td>${rep.visitsToday}</td>
      <td>
        <div class="progress-bar" style="height: 8px;">
          <div class="progress-fill ${getProgressClass(rep.quotaProgress / 100)}" 
               style="width: ${rep.quotaProgress}%"></div>
        </div>
        <span class="progress-percent">${rep.quotaProgress}%</span>
      </td>
      <td>${rep.lastActivity}</td>
    </tr>
  `).join("");
}

// Load performance analytics
async function loadPerformanceAnalytics() {
  try {
    // Get current month's data
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Get all visits this month
    const { data: monthVisits, error: visitsError } = await supabase
      .from("visits")
      .select("rep_id, status")
      .gte("scheduled_date", startOfMonth.toISOString());

    if (visitsError) throw visitsError;

    // Calculate performance per rep
    const repPerformance = {};
    allRepresentatives.forEach(rep => {
      repPerformance[rep.id] = {
        name: rep.full_name || "Unknown",
        completed: 0,
        scheduled: 0
      };
    });

    monthVisits?.forEach(visit => {
      if (repPerformance[visit.rep_id]) {
        repPerformance[visit.rep_id].scheduled++;
        if (visit.status === "completed") {
          repPerformance[visit.rep_id].completed++;
        }
      }
    });

    // Sort by performance
    const performanceArray = Object.values(repPerformance)
      .filter(p => p.scheduled > 0)
      .map(p => ({
        ...p,
        rate: p.scheduled > 0 ? (p.completed / p.scheduled) : 0
      }))
      .sort((a, b) => b.rate - a.rate);

    const topPerformers = performanceArray.slice(0, 3);
    const underperformers = performanceArray.slice(-3).reverse();

    // Calculate overall completion rate
    const totalScheduled = monthVisits?.length || 0;
    const totalCompleted = monthVisits?.filter(v => v.status === "completed").length || 0;
    const completionRate = totalScheduled > 0 
      ? Math.round((totalCompleted / totalScheduled) * 100) 
      : 0;

    // Get report submission trend
    const { data: monthReports, error: reportsError } = await supabase
      .from("reports")
      .select("id")
      .gte("created_at", startOfMonth.toISOString());

    if (reportsError) throw reportsError;

    const reportSubmissionRate = totalCompleted > 0 
      ? Math.round(((monthReports?.length || 0) / totalCompleted) * 100)
      : 0;

    // Render top performers
    const topPerformersContainer = elements.topPerformers;
    const underperformersContainer = elements.underperformers;
    
    if (topPerformers.length > 0) {
      topPerformersContainer.innerHTML = topPerformers.map(p => `
          <div class="performer-item">
            <span class="performer-name">${p.name}</span>
            <span class="performer-rate">${Math.round(p.rate * 100)}%</span>
          </div>
        `).join("");
    } else {
      showCardEmpty(topPerformersContainer, "No performance data for selected period");
    }

    // Render underperformers
    if (underperformers.length > 0) {
      underperformersContainer.innerHTML = underperformers.map(p => `
          <div class="performer-item underperformer">
            <span class="performer-name">${p.name}</span>
            <span class="performer-rate">${Math.round(p.rate * 100)}%</span>
          </div>
        `).join("");
    } else {
      showCardEmpty(underperformersContainer, "No performance data for selected period");
    }

    // Update metrics
    updateElement(elements.visitCompletionRate, `${completionRate}%`);
    updateElement(elements.reportSubmissionTrend, `${reportSubmissionRate}%`);

  } catch (error) {
    console.error("Error loading performance analytics:", error);
    showCardError(elements.topPerformers, "Could not load analytics data", loadPerformanceAnalytics);
    showCardError(elements.underperformers, "Could not load analytics data", loadPerformanceAnalytics);
  }
}

// Load recent reports/activity feed
async function loadRecentReports() {
  const container = elements.recentReportsFeed;
  
  // Show loading skeleton at start
  showCardLoading(container);

  try {
    const { data: reports, error } = await supabase
      .from("reports")
      .select(`
        id,
        created_at,
        notes,
        visit:visits(
          rep_id,
          scheduled_date,
          doctors(name, clinic_location)
        )
      `)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    if (!reports || reports.length === 0) {
      showCardEmpty(container, "No field reports submitted yet");
      return;
    }

    elements.recentReportsFeed.innerHTML = reports.map(report => {
      const date = new Date(report.created_at);
      const timeStr = date.toLocaleTimeString("en-US", { 
        hour: "2-digit", 
        minute: "2-digit",
        hour12: true 
      });
      
      const doctorName = report.visit?.doctors?.name || "Unknown";
      const location = report.visit?.doctors?.clinic_location || "";
      const rep = allRepresentatives.find(r => r.id === report.visit?.rep_id);
      const repName = rep?.full_name || "Unknown Rep";

      return `
        <div class="activity-item">
          <span class="activity-time">${timeStr}</span>
          <span class="activity-user">${repName}</span>
          <span class="activity-type">Report</span>
          <span class="activity-detail">${doctorName}${location ? " - " + location : ""}</span>
        </div>
      `;
    }).join("");

  } catch (error) {
    console.error("Error loading recent reports:", error);
    showCardError(container, "Could not load field reports", loadRecentReports);
  }
}

// Load schedule overview
async function loadScheduleOverview() {
  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's appointments
    const { data: appointments, error } = await supabase
      .from("visits")
      .select(`
        id,
        scheduled_date,
        status,
        rep_id,
        doctors(name, clinic_location)
      `)
      .gte("scheduled_date", today.toISOString())
      .lt("scheduled_date", tomorrow.toISOString())
      .order("scheduled_date", { ascending: true });

    if (error) throw error;

    const total = appointments?.length || 0;
    const completed = appointments?.filter(a => a.status === "completed").length || 0;
    const missed = appointments?.filter(a => a.status === "missed").length || 0;

    // Use 0 for valid empty state (no appointments), not "--"
    if (elements.todayAppointments) elements.todayAppointments.textContent = total;
    if (elements.missedAppointments) elements.missedAppointments.textContent = missed;
    if (elements.completedAppointments) elements.completedAppointments.textContent = completed;

    // Render upcoming schedules
    const upcoming = appointments?.filter(a => 
      a.status === "scheduled" && new Date(a.scheduled_date) > new Date()
    ).slice(0, 5) || [];

    if (upcoming.length > 0) {
      elements.upcomingSchedulesList.innerHTML = `
        <h4>Upcoming Today</h4>
        ${upcoming.map(appt => {
          const time = new Date(appt.scheduled_date).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          });
          const rep = allRepresentatives.find(r => r.id === appt.rep_id);
          const repName = rep?.full_name || "Unknown";
          const doctorName = appt.doctors?.name || "Unknown";
          
          return `
            <div class="schedule-item">
              <span class="schedule-time">${time}</span>
              <span class="schedule-rep">${repName}</span>
              <span class="schedule-detail">${doctorName}</span>
            </div>
          `;
        }).join("")}
      `;
    } else {
      showCardEmpty(elements.upcomingSchedulesList, "No appointments scheduled for today");
    }

  } catch (error) {
    console.error("Error loading schedule overview:", error);
    // Show error state with retry button
    showCardError(elements.upcomingSchedulesList, "Could not load schedule data", loadScheduleOverview);
    // Show "--" with tooltip for stats on error
    if (elements.todayAppointments) elements.todayAppointments.innerHTML = '<span class="stat-tooltip" data-tooltip="Data unavailable">--</span>';
    if (elements.missedAppointments) elements.missedAppointments.innerHTML = '<span class="stat-tooltip" data-tooltip="Data unavailable">--</span>';
    if (elements.completedAppointments) elements.completedAppointments.innerHTML = '<span class="stat-tooltip" data-tooltip="Data unavailable">--</span>';
  }
}

// Load quota tracking
async function loadQuotaTracking() {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const { data: quotas, error } = await supabase
      .from("quotas")
      .select("*")
      .eq("month", currentMonth);

    if (error) throw error;

    if (!quotas || quotas.length === 0) {
      showCardEmpty(elements.quotaTrackingList, "No quotas set for this month");
      return;
    }

    // Calculate team averages
    const avgDoctorVisits = quotas.reduce((sum, q) => 
      sum + ((q.doctor_visits_actual || 0) / (q.doctor_visits_target || 1)), 0
    ) / quotas.length;

    const avgPharmacyCalls = quotas.reduce((sum, q) => 
      sum + ((q.pharmacy_calls_actual || 0) / (q.pharmacy_calls_target || 1)), 0
    ) / quotas.length;

    const avgSamples = quotas.reduce((sum, q) => 
      sum + ((q.sample_distribution_actual || 0) / (q.sample_distribution_target || 1)), 0
    ) / quotas.length;

    const overallAvg = (avgDoctorVisits + avgPharmacyCalls + avgSamples) / 3;

    // Find reps falling behind (< 50%)
    const behindReps = quotas.filter(q => {
      const doctorProgress = (q.doctor_visits_actual || 0) / (q.doctor_visits_target || 1);
      return doctorProgress < 0.5;
    }).length;

    elements.quotaTrackingList.innerHTML = `
      <div class="quota-track-item">
        <div class="quota-track-header">
          <span class="quota-rep-name">Team Average</span>
          <span class="quota-percentage">${Math.round(overallAvg * 100)}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${getProgressClass(overallAvg)}" style="width: ${overallAvg * 100}%"></div>
        </div>
      </div>
      <div class="quota-track-item">
        <div class="quota-track-header">
          <span class="quota-rep-name">Doctor Visits Target</span>
          <span class="quota-percentage">${Math.round(avgDoctorVisits * 100)}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${getProgressClass(avgDoctorVisits)}" style="width: ${avgDoctorVisits * 100}%"></div>
        </div>
      </div>
      <div class="quota-track-item">
        <div class="quota-track-header">
          <span class="quota-rep-name">Pharmacy Calls Target</span>
          <span class="quota-percentage">${Math.round(avgPharmacyCalls * 100)}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${getProgressClass(avgPharmacyCalls)}" style="width: ${avgPharmacyCalls * 100}%"></div>
        </div>
      </div>
      <div class="quota-track-item">
        <div class="quota-track-header">
          <span class="quota-rep-name">Sample Distribution</span>
          <span class="quota-percentage">${Math.round(avgSamples * 100)}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${getProgressClass(avgSamples)}" style="width: ${avgSamples * 100}%"></div>
        </div>
      </div>
    `;

    // Update quota alerts
    if (behindReps > 0) {
      elements.quotaAlerts.className = "info-box warning";
      elements.quotaAlerts.innerHTML = `<strong>Attention:</strong> ${behindReps} rep${behindReps > 1 ? 's' : ''} falling behind monthly target`;
    } else {
      elements.quotaAlerts.className = "info-box success";
      elements.quotaAlerts.innerHTML = `<strong>Great!</strong> All reps on track with monthly targets`;
    }

  } catch (error) {
    console.error("Error loading quota tracking:", error);
    showCardError(elements.quotaTrackingList, "Could not load quota data", loadQuotaTracking);
  }
}

// Load alerts
async function loadAlerts() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get inactive reps (no visits in last 3 days)
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const { data: recentVisits, error: visitsError } = await supabase
      .from("visits")
      .select("rep_id")
      .gte("scheduled_date", threeDaysAgo.toISOString());

    if (visitsError) throw visitsError;

    const activeRepIds = new Set(recentVisits?.map(v => v.rep_id) || []);
    const inactiveReps = allRepresentatives.filter(r => !activeRepIds.has(r.id));

    // Get pending reports count
    const { data: pendingReports, error: reportsError } = await supabase
      .from("visits")
      .select("id")
      .eq("status", "completed")
      .gte("scheduled_date", today.toISOString());

    if (reportsError) throw reportsError;

    // Build alerts
    const alerts = [];

    if (inactiveReps.length > 0) {
      alerts.push({
        type: "alert-warning",
        icon: "person_off",
        title: "Inactive Representatives",
        message: `${inactiveReps.length} rep${inactiveReps.length > 1 ? 's' : ''} with no activity in 3 days`
      });
    }

    if (pendingReports && pendingReports.length > 0) {
      alerts.push({
        type: "alert-info",
        icon: "assignment_late",
        title: "Pending Reports",
        message: `${pendingReports.length} visit${pendingReports.length > 1 ? 's' : ''} awaiting report submission`
      });
    }

    // Add default success alert if no issues
    if (alerts.length === 0) {
      alerts.push({
        type: "alert-success",
        icon: "check_circle",
        title: "All Systems Normal",
        message: "No critical alerts at this time"
      });
    }

    elements.alertsList.innerHTML = alerts.map(alert => `
      <div class="alert-item ${alert.type}">
        <span class="material-symbols-outlined">${alert.icon}</span>
        <div class="alert-content">
          <strong>${alert.title}</strong>
          <span>${alert.message}</span>
        </div>
      </div>
    `).join("");

    // Add timestamp after alerts load
    const alertsHeader = elements.alertsList.parentElement?.querySelector('h3, .card-header, .section-title');
    if (alertsHeader) {
      // Remove existing timestamp if any
      const existingTimestamp = alertsHeader.parentElement?.querySelector('.alert-timestamp');
      if (existingTimestamp) existingTimestamp.remove();
      
      // Add new timestamp
      const timestamp = document.createElement('span');
      timestamp.className = 'alert-timestamp';
      timestamp.textContent = 'Last checked: just now';
      alertsHeader.appendChild(timestamp);
    }

  } catch (error) {
    console.error("Error loading alerts:", error);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Logout buttons
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutBtnMobile = document.getElementById("logoutBtnMobile");
  
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
  if (logoutBtnMobile) logoutBtnMobile.addEventListener("click", logout);

  // Hamburger menu
  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.querySelector(".mobile-menu");
  
  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      mobileMenu.classList.toggle("active");
    });
  }

  // Rep search
  if (elements.repSearch) {
    elements.repSearch.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      if (window.allRepData) {
        const filtered = window.allRepData.filter(rep => 
          rep.full_name?.toLowerCase().includes(query) ||
          rep.email?.toLowerCase().includes(query)
        );
        renderRepTable(filtered);
      }
    });
  }
}

// Helper: Get progress CSS class
function getProgressClass(ratio) {
  if (ratio < 0.3) return "low";
  if (ratio < 0.7) return "medium";
  return "high";
}

// Helper: Update element text content safely
function updateElement(element, value) {
  if (element) {
    element.textContent = value;
  }
}

// Helper: Update last updated timestamp
function updateLastUpdated() {
  if (elements.lastUpdated) {
    elements.lastUpdated.textContent = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }
}

// Helper: Show error in stats
function showErrorInStats() {
  const statElements = [
    elements.totalReps,
    elements.activeReps,
    elements.totalVisits,
    elements.completedCalls,
    elements.pendingReports,
    elements.quotaAchievement,
    elements.sampleDistribution,
    elements.upcomingSchedules
  ];
  
  statElements.forEach(el => {
    if (el) el.textContent = "--";
  });
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initAdminDashboard);

// ============================================
// QUOTA MANAGEMENT FUNCTIONS
// ============================================

// DOM Elements for Quota Management
const quotaElements = {
  repSelect: document.getElementById("quota-rep-select"),
  monthPicker: document.getElementById("quota-month-picker"),
  doctorVisitsTarget: document.getElementById("doctor-visits-target"),
  pharmacyCallsTarget: document.getElementById("pharmacy-calls-target"),
  sampleDistributionTarget: document.getElementById("sample-distribution-target"),
  meetingsTarget: document.getElementById("meetings-target"),
  loadQuotaBtn: document.getElementById("load-quota-btn"),
  saveQuotaBtn: document.getElementById("save-quota-btn"),
  quotaFeedback: document.getElementById("quota-feedback"),
  quotasTableBody: document.getElementById("quotas-table-body")
};

// Cache for profiles data
let profilesCache = [];

/**
 * Load all RepMeds into the dropdown
 */
async function loadRepList() {
  const select = document.getElementById("quota-rep-select");
  if (!select) return;

  // Clear existing options except placeholder
  select.innerHTML = '<option value="">Loading RepMeds...</option>';

  console.log("[loadRepList] Fetching repmeds from profiles table...");

  const { data: reps, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "repmeds")
    .order("full_name", { ascending: true });

  if (error) {
    console.error("[loadRepList] Error fetching repmeds:", error);
    select.innerHTML = '<option value="" disabled>Error loading RepMeds</option>';
    return;
  }

  console.log("[loadRepList] Found", reps?.length || 0, "repmeds");

  if (!reps || reps.length === 0) {
    select.innerHTML = '<option value="" disabled>No RepMeds found</option>';
    return;
  }

  // Build options
  select.innerHTML = '<option value="">Select a RepMed...</option>';
  reps.forEach(rep => {
    const option = document.createElement("option");
    option.value = rep.id;
    option.textContent = rep.full_name || rep.email || "Unknown Rep";
    select.appendChild(option);
  });
}

/**
 * Load quota data for a specific rep and month
 * @param {string} repId - The rep's profile ID
 * @param {string} month - Month in YYYY-MM format
 */
async function loadRepQuota(repId, month) {
  try {
    if (!repId || !month) {
      showQuotaFeedback("Please select a RepMed and month", "error");
      return;
    }

    const { data: quota, error } = await supabase
      .from("quotas")
      .select("*")
      .eq("rep_id", repId)
      .eq("month", month)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows returned

    if (quota) {
      // Populate inputs with existing values
      quotaElements.doctorVisitsTarget.value = quota.doctor_visits_target || 0;
      quotaElements.pharmacyCallsTarget.value = quota.pharmacy_calls_target || 0;
      quotaElements.sampleDistributionTarget.value = quota.sample_distribution_target || 0;
      quotaElements.meetingsTarget.value = quota.meetings_target || 0;
      showQuotaFeedback("Quota loaded successfully", "success");
    } else {
      // Clear inputs for new quota
      quotaElements.doctorVisitsTarget.value = "";
      quotaElements.pharmacyCallsTarget.value = "";
      quotaElements.sampleDistributionTarget.value = "";
      quotaElements.meetingsTarget.value = "";
      showQuotaFeedback("No quota found for this rep/month — enter new targets", "success");
    }

  } catch (error) {
    console.error("Error loading quota:", error);
    showQuotaFeedback(`Error loading quota: ${error.message}`, "error");
  }
}

/**
 * Save quota data via Edge Function
 */
async function saveQuota() {
  try {
    // Get values from form
    const repId = quotaElements.repSelect.value;
    const month = quotaElements.monthPicker.value;
    const doctorVisitsTarget = parseInt(quotaElements.doctorVisitsTarget.value, 10) || 0;
    const pharmacyCallsTarget = parseInt(quotaElements.pharmacyCallsTarget.value, 10) || 0;
    const sampleDistributionTarget = parseInt(quotaElements.sampleDistributionTarget.value, 10) || 0;
    const meetingsTarget = parseInt(quotaElements.meetingsTarget.value, 10) || 0;

    // Validation
    if (!repId) {
      showQuotaFeedback("Please select a RepMed", "error");
      return;
    }
    if (!month) {
      showQuotaFeedback("Please select a month", "error");
      return;
    }
    if (doctorVisitsTarget < 0 || pharmacyCallsTarget < 0 || sampleDistributionTarget < 0 || meetingsTarget < 0) {
      showQuotaFeedback("All targets must be positive numbers", "error");
      return;
    }

    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke("upsert-quotas", {
      body: {
        rep_id: repId,
        month: month,
        doctor_visits_target: doctorVisitsTarget,
        pharmacy_calls_target: pharmacyCallsTarget,
        sample_distribution_target: sampleDistributionTarget,
        meetings_target: meetingsTarget
      }
    });

    if (error) throw error;

    showQuotaFeedback("Quota saved successfully!", "success");
    
    // Refresh the overview table
    await loadAllQuotasTable(month);

  } catch (error) {
    console.error("Error saving quota:", error);
    showQuotaFeedback(`Error saving quota: ${error.message}`, "error");
  }
}

/**
 * Load all quotas for the given month into the overview table
 * @param {string} month - Month in YYYY-MM format
 */
async function loadAllQuotasTable(month) {
  try {
    if (!month) return;

    // Fetch quotas for the month
    const { data: quotas, error: quotasError } = await supabase
      .from("quotas")
      .select("*")
      .eq("month", month);

    if (quotasError) throw quotasError;

    // If no profiles cached, fetch them
    if (profilesCache.length === 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "repmeds");

      if (profilesError) throw profilesError;
      profilesCache = profiles || [];
    }

    // Render table
    if (!quotas || quotas.length === 0) {
      quotaElements.quotasTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="empty-text">No quotas set for this month</td>
        </tr>
      `;
      return;
    }

    quotaElements.quotasTableBody.innerHTML = quotas.map(quota => {
      const profile = profilesCache.find(p => p.id === quota.rep_id);
      const repName = profile?.full_name || profile?.email || "Unknown";

      return `
        <tr>
          <td>${repName}</td>
          <td>${quota.doctor_visits_target || 0}</td>
          <td>${quota.pharmacy_calls_target || 0}</td>
          <td>${quota.sample_distribution_target || 0}</td>
          <td>${quota.meetings_target || 0}</td>
          <td>
            <button type="button" class="btn btn-sm btn-secondary edit-quota-btn" 
                    data-rep-id="${quota.rep_id}" 
                    data-month="${quota.month}">
              Edit
            </button>
          </td>
        </tr>
      `;
    }).join("");

    // Attach event listeners to edit buttons
    quotaElements.quotasTableBody.querySelectorAll(".edit-quota-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const repId = btn.dataset.repId;
        const month = btn.dataset.month;
        
        // Set the form values
        quotaElements.repSelect.value = repId;
        quotaElements.monthPicker.value = month;
        
        // Load the quota data
        loadRepQuota(repId, month);
      });
    });

  } catch (error) {
    console.error("Error loading quotas table:", error);
    quotaElements.quotasTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-text">Error loading quotas</td>
      </tr>
    `;
  }
}

/**
 * Show feedback message in the quota feedback area
 * @param {string} message - The message to display
 * @param {string} type - 'success' or 'error'
 */
function showQuotaFeedback(message, type) {
  if (!quotaElements.quotaFeedback) return;

  quotaElements.quotaFeedback.innerHTML = message;
  quotaElements.quotaFeedback.className = `quota-feedback ${type}`;
  quotaElements.quotaFeedback.style.display = "block";

  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (quotaElements.quotaFeedback) {
      quotaElements.quotaFeedback.style.display = "none";
    }
  }, 5000);
}

/**
 * Initialize quota management section
 */
function initQuotaManagement() {
  // Set current month as default
  const currentMonth = new Date().toISOString().slice(0, 7);
  if (quotaElements.monthPicker) {
    quotaElements.monthPicker.value = currentMonth;
  }

  // Load initial data
  loadRepList();
  loadAllQuotasTable(currentMonth);

  // Setup event listeners
  if (quotaElements.loadQuotaBtn) {
    quotaElements.loadQuotaBtn.addEventListener("click", () => {
      const repId = quotaElements.repSelect.value;
      const month = quotaElements.monthPicker.value;
      loadRepQuota(repId, month);
    });
  }

  if (quotaElements.saveQuotaBtn) {
    quotaElements.saveQuotaBtn.addEventListener("click", saveQuota);
  }

  if (quotaElements.monthPicker) {
    quotaElements.monthPicker.addEventListener("change", () => {
      const month = quotaElements.monthPicker.value;
      loadAllQuotasTable(month);
    });
  }

  if (quotaElements.repSelect) {
    quotaElements.repSelect.addEventListener("change", () => {
      const repId = quotaElements.repSelect.value;
      const month = quotaElements.monthPicker.value;
      if (repId && month) {
        loadRepQuota(repId, month);
      }
    });
  }
}

// Initialize quota management when DOM is ready
document.addEventListener("DOMContentLoaded", initQuotaManagement);
