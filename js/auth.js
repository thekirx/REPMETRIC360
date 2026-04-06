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
    console.log("[updateAdminNav] isUserAdmin:", isUserAdmin);
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
  console.log("[getUserRole] Checking user ID:", session?.user?.id);
  
  if (!session) {
    console.log("[getUserRole] No session found, returning null");
    return null;
  }
  
  // Kunin ang role mula sa user metadata
  const role = session.user.user_metadata?.role;
  console.log("[getUserRole] user_metadata.role found:", role);
  
  if (role) {
    console.log("[getUserRole] Returning role from user_metadata:", role.toLowerCase());
    return role.toLowerCase();
  }
  
  // Fallback: kunin mula sa profiles table
  console.log("[getUserRole] Querying profiles table for user:", session.user.id);
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();
  
  console.log("[getUserRole] Profiles query result - data:", data, "error:", error);
  
  if (error || !data) {
    console.log("[getUserRole] No profile found or error, returning default 'repmeds'");
    return "repmeds"; // Default role
  }
  
  console.log("[getUserRole] Returning role from profiles table:", data.role);
  return data.role?.toLowerCase() || "repmeds";
}

export async function isAdmin() {
  const role = await getUserRole();
  console.log("[isAdmin] Role value:", role, "Comparison result:", role?.toLowerCase() === "admin");
  return role?.toLowerCase() === "admin";
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
