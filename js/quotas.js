import { supabase } from "./supabaseClient.js";
import { requireAuth } from "./auth.js";

await requireAuth();

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

loadQuotas();
