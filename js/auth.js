// Auth helpers para sa session checking at logout
import { supabase } from "./supabaseclient.js";

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data?.session ?? null;
}

// Show/hide admin navigation links based on user role
export async function updateAdminNav() {
  const adminLinks = document.querySelectorAll(".admin-only");
  
  try {
    const isUserAdmin = await isAdmin();
    adminLinks.forEach(link => {
      link.style.display = isUserAdmin ? "" : "none";
    });
  } catch (error) {
    console.error("Error updating admin nav:", error);
    adminLinks.forEach(link => {
      link.style.display = "none";
    });
  }
}

export async function getUser() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user ?? null;
}

export async function getUserRole() {
  const session = await getSession();
  if (!session) return null;
  
  // Kunin ang role mula sa user metadata
  const role = session.user.user_metadata?.role;
  if (role) return role;
  
  // Fallback: kunin mula sa profiles table
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();
  
  if (error || !data) return "repmeds"; // Default role
  return data.role;
}

export async function isAdmin() {
  const role = await getUserRole();
  return role === "admin";
}

export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    window.location.href = "/login.html";
    return null;
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (!session) return null;
  
  const role = await getUserRole();
  if (role !== "admin") {
    alert("Admin access only!");
    window.location.href = "/dashboard.html";
    return null;
  }
  
  return session;
}

export async function logout() {
  await supabase.auth.signOut();
  window.location.href = "/login.html";
}
