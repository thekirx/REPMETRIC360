import { supabase } from "./supabaseClient.js";
import { requireAuth } from "./auth.js";

// Init function para i-wrap ang auth at setup
async function initPage() {
  // Check auth muna bago magload ng page
  await requireAuth();

  document.querySelector("#submitReportBtn").addEventListener("click", async () => {

    const visit_id = document.querySelector("#visitSelect").value;
    const notes = document.querySelector("#notes").value;
    const doctor_feedback = document.querySelector("#doctorFeedback").value;
    const samples_distributed = document.querySelector("#samplesDistributed").value;

    const { error } = await supabase.from("reports").insert([
      {
        visit_id,
        notes,
        doctor_feedback,
        samples_distributed
      }
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Report submitted");
  });
}

// Run init kapag ready na ang DOM
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPage);
} else {
  initPage();
}
