import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Use POST" }), { status: 405 });
    }

    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing Bearer token" }), { status: 401 });
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabaseUserClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false }
    });

    const supabaseAdmin = createClient(url, serviceKey, {
      auth: { persistSession: false }
    });

    // Validate logged-in user
    const { data: userData, error: userErr } =
      await supabaseUserClient.auth.getUser();

    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401
      });
    }

    const userId = userData.user.id;

    // Check admin role
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (!profile || profile.role !== "admin") {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403
      });
    }

    const body = await req.json();

    const { data, error } = await supabaseAdmin
      .from("quotas")
      .upsert(
        {
          rep_id: body.rep_id,
          target_visits: body.target_visits ?? 0,
          target_samples: body.target_samples ?? 0,
          month: body.month,
          year: body.year
        },
        { onConflict: "rep_id,month,year" }
      )
      .select("*")
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500
      });
    }

    return new Response(JSON.stringify({ ok: true, quota: data }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500
    });
  }
});