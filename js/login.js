// Login form handler
import { supabase } from "./supabaseclient.js";

// Toggle password visibility
const toggleBtn = document.querySelector(".password-toggle");
const passwordInput = document.querySelector("#password");

if (toggleBtn && passwordInput) {
  toggleBtn.addEventListener("click", () => {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    
    // Palitan ang icon
    const icon = toggleBtn.querySelector("span");
    if (icon) {
      icon.textContent = type === "password" ? "visibility" : "visibility_off";
    }
  });
}

document.querySelector("#loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  window.location.href = "/dashboard.html";
});
