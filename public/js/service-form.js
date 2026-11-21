// Create a new service, or edit one when the URL has ?id=
const form = document.getElementById("service-form");
const message = document.getElementById("message");
const editId = getParam("id");

async function init() {
  await requireUser();

  const { data: categories } = await api("/api/services/categories");
  categories.forEach((c) => form.category_id.append(el("option", { value: c.id }, c.name)));

  if (editId) {
    document.getElementById("form-title").textContent = "Edit service";
    form.querySelector("button").textContent = "Save changes";
    const { ok, data: s } = await api("/api/services/" + editId);
    if (!ok || !s.is_owner) {
      showMessage(message, "Service not found.", true);
      form.hidden = true;
      return;
    }
    for (const name of ["title", "category_id", "description", "price", "price_type", "delivery_days", "delivery_mode"]) {
      form[name].value = s[name];
    }
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = {};
  for (const name of ["title", "category_id", "description", "price", "price_type", "delivery_days", "delivery_mode"]) {
    body[name] = form[name].value;
  }

  const { ok, data } = await api(editId ? "/api/services/" + editId : "/api/services", {
    method: editId ? "PUT" : "POST",
    body,
  });

  if (ok) {
    window.location.href = "/service.html?id=" + (editId || data.id);
  } else {
    showMessage(message, data.error, true);
  }
});

init();
