import { supabase } from "./supabaseClient.js";
import { requireAuth } from "./auth.js";

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
