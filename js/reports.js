// Reports.js - Live data from Supabase
import { supabase } from "./supabaseClient.js";
import { requireAuth, getUser } from "./auth.js";

// DOM Elements
const reportsTableBody = document.querySelector(".reports-table tbody");
const totalReportsEl = document.querySelector(".summary-card:nth-child(1) .summary-number");
const completedReportsEl = document.querySelector(".summary-card:nth-child(2) .summary-number");
const pendingReportsEl = document.querySelector(".summary-card:nth-child(3) .summary-number");

// Initialize reports page
async function initReports() {
  const user = await requireAuth();
  if (!user) return;

  await loadReports(user.id);
}

// Fetch and render reports
async function loadReports(userId) {
  const { data: reports, error } = await supabase
    .from("reports")
    .select("id, created_at, notes, doctor_feedback, samples_distributed, status, visits(id, scheduled_date, doctors(name, clinic_location))")
    .eq("rep_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading reports:", error);
    reportsTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center;">Error loading reports. Please try again.</td>
      </tr>
    `;
    return;
  }

  if (!reports || reports.length === 0) {
    reportsTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center;">No reports yet. Create your first report!</td>
      </tr>
    `;
    
    // Update summary to 0
    updateSummary(0, 0, 0);
    return;
  }

  // Calculate summary stats
  const total = reports.length;
  const completed = reports.filter(r => r.status === "completed").length;
  const pending = reports.filter(r => r.status === "pending").length;
  
  updateSummary(total, completed, pending);

  // Render reports table
  reportsTableBody.innerHTML = reports.map(report => {
    const date = new Date(report.created_at).toLocaleDateString("en-CA"); // YYYY-MM-DD
    const doctor = report.visits?.doctors;
    const doctorName = doctor?.name || "Unknown";
    const location = doctor?.clinic_location || "";
    
    // Determine type based on content
    let type = "Visit";
    let typeClass = "badge-type-visit";
    if (report.samples_distributed && report.samples_distributed > 0) {
      type = "Sample";
      typeClass = "badge-type-sample";
    } else if (location && location.toLowerCase().includes("pharmacy")) {
      type = "Call";
      typeClass = "badge-type-call";
    }
    
    const statusClass = report.status === "completed" ? "badge-success" : "badge-warning";

    return `
      <tr data-report-id="${report.id}">
        <td>${date}</td>
        <td>${doctorName}${location ? " - " + location : ""}</td>
        <td><span class="badge ${typeClass}">${type}</span></td>
        <td><span class="badge ${statusClass}">${report.status === "completed" ? "Completed" : "Pending"}</span></td>
        <td>
          <button class="btn-action btn-view" onclick="viewReport(${report.id})">View</button>
          <button class="btn-action btn-edit" onclick="editReport(${report.id})">Edit</button>
        </td>
      </tr>
    `;
  }).join("");
}

// Update summary cards
function updateSummary(total, completed, pending) {
  if (totalReportsEl) totalReportsEl.textContent = total;
  if (completedReportsEl) completedReportsEl.textContent = completed;
  if (pendingReportsEl) pendingReportsEl.textContent = pending;
}

// View report details
async function viewReport(reportId) {
  const { data: report, error } = await supabase
    .from("reports")
    .select("*, visits(*, doctors(*))")
    .eq("id", reportId)
    .single();

  if (error) {
    alert("Error loading report details");
    return;
  }

  // Simple alert for now - can be replaced with modal
  const doctorName = report.visits?.doctors?.name || "Unknown";
  alert(`Report Details:\nDoctor: ${doctorName}\nNotes: ${report.notes || "N/A"}\nFeedback: ${report.doctor_feedback || "N/A"}\nSamples: ${report.samples_distributed || 0}`);
}

// Edit report
async function editReport(reportId) {
  // Navigate to edit page or show edit modal
  alert(`Edit report ${reportId} - Feature coming soon!`);
}

// Create new report
async function createReport() {
  const user = await getUser();
  if (!user) return;

  // Show form or navigate to create page
  alert("Create new report - Feature coming soon!");
}

// Make functions available globally for onclick handlers
window.viewReport = viewReport;
window.editReport = editReport;
window.createReport = createReport;

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initReports);
