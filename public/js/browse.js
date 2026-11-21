// Browse page: search + filters. Filters are kept in the URL so links can be shared.
const form = document.getElementById("filters");
const results = document.getElementById("results");
const count = document.getElementById("count");

async function loadCategories() {
  const { data } = await api("/api/services/categories");
  data.forEach((c) => form.category.append(el("option", { value: c.id }, c.name)));
}

async function search() {
  const params = new URLSearchParams(window.location.search);
  form.q.value = params.get("q") || "";
  form.category.value = params.get("category") || "";
  form.max_price.value = params.get("max_price") || "";
  form.mode.value = params.get("mode") || "";

  results.replaceChildren(el("p", { className: "muted" }, "Searching..."));
  const { ok, data } = await api("/api/services?" + params.toString());
  results.replaceChildren();

  if (!ok) {
    results.append(el("p", { className: "message error" }, data.error));
    return;
  }
  count.textContent = data.length + (data.length === 1 ? " service found" : " services found");
  if (data.length === 0) {
    results.append(el("p", { className: "muted" }, "No services match your search. Try different filters."));
  }
  data.forEach((s) => results.append(serviceCard(s)));
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const params = new URLSearchParams();
  for (const name of ["q", "category", "max_price", "mode"]) {
    if (form[name].value) params.set(name, form[name].value);
  }
  history.pushState(null, "", "?" + params.toString());
  search();
});

window.addEventListener("popstate", search);

loadCategories().then(search);
