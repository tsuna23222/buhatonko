// Edit my own profile
const form = document.getElementById("profile-form");
const message = document.getElementById("message");
const FIELDS = ["school", "skills", "avatar_url", "bio"];

async function init() {
  await requireUser();
  const { data: profile } = await api("/api/profile/me");
  FIELDS.forEach((name) => (form[name].value = profile[name] || ""));
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = {};
  FIELDS.forEach((name) => (body[name] = form[name].value));
  const { ok, data } = await api("/api/profile/me", { method: "PUT", body });
  if (ok) {
    const user = await currentUser;
    window.location.href = "/profile.html?id=" + user.id;
  } else {
    showMessage(message, data.error, true);
  }
});

init();
