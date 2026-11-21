const form = document.getElementById("login-form");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const { ok, data } = await api("/api/auth/login", {
    method: "POST",
    body: { email: form.email.value, password: form.password.value },
  });

  if (ok) {
    // Go back to the page that sent us here, or the dashboard
    const next = getParam("next");
    window.location.href = next && next.startsWith("/") ? next : "/dashboard.html";
  } else {
    showMessage(message, data.error, true);
  }
});
