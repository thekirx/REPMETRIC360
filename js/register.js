// Register form handler
import { supabase } from "./supabaseClient.js";

// Toggle password visibility para sa lahat ng password fields
document.querySelectorAll(".password-toggle").forEach((toggleBtn) => {
  toggleBtn.addEventListener("click", () => {
    // Hanapin ang input na katabi ng button
    const passwordInput = toggleBtn.parentElement.querySelector("input[type='password'], input[type='text']");
    
    if (passwordInput) {
      const type = passwordInput.type === "password" ? "text" : "password";
      passwordInput.type = type;
      
      // Palitan ang icon
      const icon = toggleBtn.querySelector("span");
      if (icon) {
        icon.textContent = type === "password" ? "visibility" : "visibility_off";
      }
    }
  });
});

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
