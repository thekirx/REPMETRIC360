import { supabase } from "./supabaseClient.js";
import { requireAuth } from "./auth.js";

// Init function para i-wrap ang auth at setup
async function initPage() {
  // Check auth muna bago magload ng page
  await requireAuth();

  // Load quotas data
  await loadQuotas();
}

async function loadQuotas() {

  const { data, error } = await supabase
    .from("quotas")
    .select("*");

  if (error) {
    console.log(error);
    return;
  }

  console.log("Quota Data:", data);
}

// Run init kapag ready na ang DOM
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPage);
} else {
  initPage();
}
