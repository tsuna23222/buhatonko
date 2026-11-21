// Admin panel: stats, reports, student verification, listings, categories

function table(headers, rows) {
  if (rows.length === 0) return el("p", { className: "muted" }, "Nothing here.");
  return el("div", { className: "table-wrap" },
    el("table", {},
      el("thead", {}, el("tr", {}, headers.map((h) => el("th", {}, h)))),
      el("tbody", {}, rows.map((cells) => el("tr", {}, cells.map((c) => el("td", {}, c)))))
    )
  );
}

async function act(url, body) {
  const { ok, data } = await api(url, { method: "PATCH", body });
  if (!ok) alert(data.error);
  load();
}

function statCard(label, value, sub) {
  return el("div", { className: "card" },
    el("p", { className: "muted" }, label),
    el("p", { className: "price", style: "font-size:1.8rem;padding:0" }, value),
    sub ? el("p", { className: "muted" }, sub) : null
  );
}

async function load() {
  const user = await requireUser();
  if (user.role !== "admin") {
    document.querySelector("main").replaceChildren(el("h1", {}, "Admins only."));
    return;
  }

  const [stats, reports, users, services, categories] = await Promise.all([
    api("/api/admin/stats"),
    api("/api/admin/reports"),
    api("/api/admin/users"),
    api("/api/admin/services"),
    api("/api/services/categories"),
  ]);

  // Overview
  const s = stats.data;
  const totalJobs = Object.values(s.jobs).reduce((a, b) => a + b, 0);
  document.getElementById("stats").replaceChildren(
    statCard("Students", s.users.total, s.users.verified + " verified"),
    statCard("Services", s.services.total, s.services.active + " active"),
    statCard("Job requests", totalJobs, (s.jobs.completed || 0) + " completed"),
    statCard("Reviews", s.reviews.total, s.reviews.avg ? "Average ★ " + s.reviews.avg : "No ratings yet"),
    statCard("Open reports", s.open_reports)
  );

  // Reports
  document.getElementById("reports").replaceChildren(table(
    ["Reported", "Reason", "By", "Date", "Status", ""],
    reports.data.map((r) => [
      el("a", { href: r.target_type === "service" ? "/service.html?id=" + r.target_id : "/profile.html?id=" + r.target_id },
        (r.target_type === "service" ? "Service: " : "Student: ") + (r.target_name || "(deleted)")),
      el("span", { className: "pre" }, r.reason),
      r.reporter_name,
      formatDate(r.created_at),
      el("span", { className: "badge badge-" + (r.status === "open" ? "requested" : r.status === "resolved" ? "completed" : "cancelled") }, r.status),
      r.status === "open"
        ? el("div", { className: "actions" },
            el("button", { className: "btn-small", onclick: () => {
              const note = prompt("What action did you take? (optional)") ;
              if (note !== null) act("/api/admin/reports/" + r.id, { status: "resolved", admin_note: note });
            } }, "Resolve"),
            el("button", { className: "btn-small btn-secondary", onclick: () => act("/api/admin/reports/" + r.id, { status: "dismissed" }) }, "Dismiss"))
        : el("span", { className: "muted" }, r.admin_note || ""),
    ])
  ));

  // Students
  document.getElementById("users").replaceChildren(table(
    ["Name", "Email", "School", "Joined", "Verified", ""],
    users.data.map((u) => [
      el("a", { href: "/profile.html?id=" + u.id }, u.full_name + (u.role === "admin" ? " (admin)" : "")),
      u.email,
      u.school || "—",
      formatDate(u.created_at),
      u.is_verified ? "✔ Yes" : "No",
      el("button", {
        className: "btn-small" + (u.is_verified ? " btn-secondary" : ""),
        onclick: () => act("/api/admin/users/" + u.id, { is_verified: !u.is_verified }),
      }, u.is_verified ? "Remove" : "Verify"),
    ])
  ));

  // Services
  document.getElementById("services").replaceChildren(table(
    ["Title", "Provider", "Category", "Price", "Status", ""],
    services.data.map((sv) => [
      el("a", { href: "/service.html?id=" + sv.id }, sv.title),
      sv.provider_name,
      sv.category,
      priceLabel(sv),
      statusBadge(sv.status),
      el("button", {
        className: "btn-small" + (sv.status === "active" ? " btn-danger" : ""),
        onclick: () => act("/api/admin/services/" + sv.id, { status: sv.status === "active" ? "paused" : "active" }),
      }, sv.status === "active" ? "Hide" : "Restore"),
    ])
  ));

  // Categories
  document.getElementById("categories").replaceChildren(...categories.data.map((c) => el("span", { className: "tag" }, c.name)));
}

document.getElementById("category-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const { ok, data } = await api("/api/admin/categories", { method: "POST", body: { name: form.name.value } });
  showMessage(document.getElementById("category-message"), ok ? data.message : data.error, !ok);
  if (ok) { form.reset(); load(); }
});

load();
