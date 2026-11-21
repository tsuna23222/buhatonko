const form = document.getElementById("register-form");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault(); // stop the page from reloading

  const { ok, data } = await api("/api/auth/register", {
    method: "POST",
    body: {
      full_name: form.full_name.value,
      email: form.email.value,
      password: form.password.value,
    },
  });

  if (ok) {
    showMessage(message, data.message + " Taking you to the login page...", false);
    setTimeout(() => (window.location.href = "/login.html"), 1500);
  } else {
    showMessage(message, data.error, true);
  }
});
