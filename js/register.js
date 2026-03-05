// Register form handler
import { supabase } from "./supabaseClient.js";

document.querySelector("#registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = document.querySelector("#fullName").value;
  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });

  if (error) {
    alert(error.message);
    return;
  }

  alert("Account created! Check your email for confirmation.");
  window.location.href = "/login.html";
});
