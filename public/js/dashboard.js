// Dashboard: incoming requests, my requests, my services

function jobTable(jobs, otherLabel, otherKey) {
  if (jobs.length === 0) return el("p", { className: "muted" }, "Nothing here yet.");
  return el("div", { className: "table-wrap" },
    el("table", {},
      el("thead", {}, el("tr", {},
        el("th", {}, "Service"), el("th", {}, otherLabel), el("th", {}, "Budget"),
        el("th", {}, "Deadline"), el("th", {}, "Status"), el("th", {}, ""))),
      el("tbody", {}, jobs.map((j) => el("tr", {},
        el("td", {}, j.service_title),
        el("td", {}, j[otherKey]),
        el("td", {}, j.budget ? peso(j.budget) : "—"),
        el("td", {}, formatDate(j.deadline)),
        el("td", {}, statusBadge(j.status)),
        el("td", {}, el("a", { href: "/job.html?id=" + j.id }, "Open →"))
      )))
    )
  );
}

function servicesTable(services) {
  if (services.length === 0) return el("p", { className: "muted" }, "You haven't offered any services yet.");
  return el("div", { className: "table-wrap" },
    el("table", {},
      el("thead", {}, el("tr", {},
        el("th", {}, "Title"), el("th", {}, "Category"), el("th", {}, "Price"),
        el("th", {}, "Status"), el("th", {}, ""))),
      el("tbody", {}, services.map((s) => {
        const toggle = el("button", {
          className: "btn-small btn-secondary",
          onclick: async () => {
            const next = s.status === "active" ? "paused" : "active";
            const { ok, data } = await api(`/api/services/${s.id}/status`, { method: "PATCH", body: { status: next } });
            if (ok) load(); else alertBox(data.error);
          },
        }, s.status === "active" ? "Pause" : "Activate");
        return el("tr", {},
          el("td", {}, el("a", { href: "/service.html?id=" + s.id }, s.title)),
          el("td", {}, s.category),
          el("td", {}, priceLabel(s)),
          el("td", {}, statusBadge(s.status)),
          el("td", {}, el("div", { className: "actions" },
            el("a", { href: "/service-form.html?id=" + s.id, className: "btn btn-small" }, "Edit"), toggle))
        );
      }))
    )
  );
}

function alertBox(text) {
  document.querySelector("main").prepend(el("p", { className: "message error" }, text));
}

async function load() {
  await requireUser();
  const [jobs, services] = await Promise.all([api("/api/jobs/mine"), api("/api/services/mine")]);

  document.getElementById("incoming").replaceChildren(jobTable(jobs.data.as_provider, "Customer", "customer_name"));
  document.getElementById("outgoing").replaceChildren(jobTable(jobs.data.as_customer, "Provider", "provider_name"));
  document.getElementById("services").replaceChildren(servicesTable(services.data));
}

load();
