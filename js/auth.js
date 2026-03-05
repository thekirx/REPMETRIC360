// Auth helpers para sa session checking at logout
import { supabase } from "./supabaseClient.js";

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data?.session ?? null;
}

export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    window.location.href = "/login.html";
    return null;
  }

  return session;
}

export async function logout() {
  await supabase.auth.signOut();
  window.location.href = "/login.html";
}
