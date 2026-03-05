import { supabase } from "./lib/supabaseClient";

// Note: Dapat naka-log in as Admin para gumana to
// Kasi may 401/403 checks sa index.ts ng upsert-quotas function

export async function runQuotaTest() {
  const { data, error } = await supabase.functions.invoke("upsert-quotas", {
    body: {
      rep_id: "035eda73-4fc6-4168-89a6-4806c6909b69",
      target_visits: 10,
      target_samples: 30,
      month: 3,
      year: 2026
    }
  });

  if (error) {
    console.log("Error:", error.message);
  } else {
    console.log("Success:", data);
  }
}
