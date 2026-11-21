// Homepage: categories, recent services, database status

api("/api/services/categories").then(({ ok, data }) => {
  if (!ok) return;
  const box = document.getElementById("categories");
  data.forEach((c) => box.append(el("a", { href: "/browse.html?category=" + c.id }, c.name)));
});

api("/api/services?limit=8").then(({ ok, data }) => {
  const box = document.getElementById("recent");
  if (!ok || data.length === 0) {
    box.append(el("p", { className: "muted" }, "No services yet. Be the first to offer one!"));
    return;
  }
  data.forEach((s) => box.append(serviceCard(s)));
});

api("/api/test-db").then(({ ok, data }) => {
  document.getElementById("db-status").textContent = ok
    ? "Database connected ✅ (1 + 1 = " + data[0].result + ")"
    : "Database error ❌";
});
