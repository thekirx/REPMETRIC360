import { supabase } from "./supabaseClient.js";
import { requireAuth } from "./auth.js";

await requireAuth();

const visitForm = document.querySelector("#visitForm");

visitForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const doctor_id = document.querySelector("#doctorSelect").value;
  const scheduled_date = document.querySelector("#scheduledDate").value;

  const { error } = await supabase.from("visits").insert([
    {
      doctor_id,
      scheduled_date
    }
  ]);

  if (error) {
    alert(error.message);
    return;
  }

  alert("Visit scheduled");
});
