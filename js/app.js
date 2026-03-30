// app.js - Main application logic for RepMetric 360
// Handles auth state, data routing, and shared utilities

import { supabase } from "./supabaseClient.js";
import { requireAuth, getUser, getUserRole, isAdmin } from "./auth.js";

// ============================================
// AUTH STATE MANAGEMENT
// ============================================

// Check if user is authenticated and redirect if needed
export async function checkAuth() {
  const user = await getUser();
  
  if (!user) {
    // Not logged in, redirect to login
    window.location.href = "/login.html";
    return null;
  }
  
  return user;
}

// Check if admin and redirect to admin dashboard
export async function checkAdminAccess() {
  const admin = await isAdmin();
  
  if (admin && !window.location.pathname.includes("admin")) {
    // Admin user on regular page, redirect to admin
    window.location.href = "/admin.html";
    return true;
  }
  
  return admin;
}

// ============================================
// DATA FETCHING UTILITIES
// ============================================

// Fetch user's activities with error handling
export async function fetchUserActivities(userId, limit = 5) {
  const { data, error } = await supabase
    .from("visits")
    .select("id, scheduled_date, status, notes, doctors(name, specialty, clinic_location)")
    .eq("rep_id", userId)
    .order("scheduled_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching activities:", error);
    return [];
  }

  return data || [];
}

// Fetch appointments for a specific date
export async function fetchAppointments(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from("visits")
    .select("id, scheduled_date, status, notes, doctors(id, name, specialty, clinic_location)")
    .eq("rep_id", userId)
    .gte("scheduled_date", startOfDay.toISOString())
    .lte("scheduled_date", endOfDay.toISOString())
    .order("scheduled_date", { ascending: true });

  if (error) {
    console.error("Error fetching appointments:", error);
    return { error: error.message };
  }

  return { data: data || [] };
}

// Fetch user's quota for current month
export async function fetchUserQuota(userId) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const { data, error } = await supabase
    .from("quotas")
    .select("*")
    .eq("rep_id", userId)
    .eq("month", currentMonth)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching quota:", error);
  }

  return data || null;
}

// Fetch completed visits count for current month
export async function fetchCompletedVisits(userId) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("visits")
    .select("id, status")
    .eq("rep_id", userId)
    .gte("scheduled_date", startOfMonth.toISOString())
    .eq("status", "completed");

  if (error) {
    console.error("Error fetching completed visits:", error);
    return 0;
  }

  return data?.length || 0;
}

// Fetch user's reports
export async function fetchUserReports(userId) {
  const { data, error } = await supabase
    .from("reports")
    .select("id, created_at, notes, doctor_feedback, samples_distributed, status, visits(id, scheduled_date, doctors(name, clinic_location))")
    .eq("rep_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reports:", error);
    return [];
  }

  return data || [];
}

// ============================================
// DATA INSERTION UTILITIES
// ============================================

// Log a new activity
export async function logActivity(userId, activityData) {
  const { activityType, details, location } = activityData;

  const { data, error } = await supabase
    .from("visits")
    .insert([
      {
        rep_id: userId,
        scheduled_date: new Date().toISOString(),
        status: "completed",
        notes: details,
        location: location,
        // Map activity type to appropriate values
        activity_type: activityType
      }
    ])
    .select();

  if (error) {
    console.error("Error logging activity:", error);
    return { error: error.message };
  }

  return { data };
}

// Create a new report
export async function createReport(userId, reportData) {
  const { visitId, notes, doctorFeedback, samplesDistributed } = reportData;

  const { data, error } = await supabase
    .from("reports")
    .insert([
      {
        rep_id: userId,
        visit_id: visitId,
        notes: notes,
        doctor_feedback: doctorFeedback,
        samples_distributed: samplesDistributed,
        status: "completed"
      }
    ])
    .select();

  if (error) {
    console.error("Error creating report:", error);
    return { error: error.message };
  }

  return { data };
}

// ============================================
// ADMIN DATA FETCHING
// ============================================

// Fetch all reps (for admin)
export async function fetchAllReps() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "repmeds");

  if (error) {
    console.error("Error fetching reps:", error);
    return [];
  }

  return data || [];
}

// Fetch all visits across all reps (for admin)
export async function fetchAllVisits() {
  const { data, error } = await supabase
    .from("visits")
    .select("*, profiles(full_name), doctors(name)")
    .order("scheduled_date", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching all visits:", error);
    return [];
  }

  return data || [];
}

// ============================================
// UI HELPERS
// ============================================

// Format time for display
export function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", { 
    hour: "2-digit", 
    minute: "2-digit",
    hour12: true 
  });
}

// Format date for display
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-CA"); // YYYY-MM-DD
}

// Get progress bar color class
export function getProgressClass(ratio) {
  if (ratio < 0.3) return "low";
  if (ratio < 0.7) return "medium";
  return "high";
}

// Calculate percentage
export function calculatePercentage(current, total) {
  if (!total || total === 0) return 0;
  return Math.round((current / total) * 100);
}

// Show loading state
export function showLoading(element, message = "Loading...") {
  element.innerHTML = `<p class="loading-text">${message}</p>`;
}

// Show error state
export function showError(element, message = "Error loading data") {
  element.innerHTML = `
    <div class="error-state">
      <p>${message}</p>
    </div>
  `;
}

// Show empty state
export function showEmpty(element, message = "No data available") {
  element.innerHTML = `
    <div class="empty-state">
      <p>${message}</p>
    </div>
  `;
}
