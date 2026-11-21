// Service detail page + request form
const content = document.getElementById("content");
const serviceId = getParam("id");

async function load() {
  const { ok, data: s } = await api("/api/services/" + serviceId);
  if (!ok) {
    content.replaceChildren(el("h1", {}, s.error), el("a", { href: "/browse.html" }, "← Back to browse"));
    return;
  }
  document.title = s.title + " – BuhatonKo";
  const user = await currentUser;

  // Left column: service details and reviews
  const reviews = el("div", { className: "card" }, el("h2", {}, "Reviews"));
  if (s.reviews.length === 0) reviews.append(el("p", { className: "muted" }, "No reviews yet."));
  s.reviews.forEach((r) =>
    reviews.append(el("div", { className: "review" },
      el("strong", {}, r.reviewer_name), " ",
      el("span", { className: "rating" }, "★".repeat(r.rating) + "☆".repeat(5 - r.rating)),
      el("p", { className: "pre" }, r.comment || ""),
      el("small", { className: "muted" }, formatDate(r.created_at))
    ))
  );

  const left = el("div", {},
    el("span", { className: "tag" }, s.category),
    s.status === "paused" ? el("span", {}, " ", statusBadge("paused")) : null,
    el("h1", {}, s.title),
    el("div", { className: "card" },
      el("p", { className: "price" }, priceLabel(s)),
      el("p", {}, "⏱ Delivery: ", s.delivery_days + (s.delivery_days == 1 ? " day" : " days"),
        " · 📍 ", MODE_LABELS[s.delivery_mode]),
      el("h3", {}, "About this service"),
      el("p", { className: "pre" }, s.description)
    ),
    el("br"),
    reviews
  );

  // Right column: provider + action box
  const avatar = s.avatar_url
    ? el("img", { src: s.avatar_url, alt: "", className: "avatar" })
    : el("div", { className: "avatar-placeholder" }, s.provider_name.charAt(0).toUpperCase());

  const actionBox = el("div", { className: "card" });

  if (s.is_owner) {
    actionBox.append(
      el("h3", {}, "This is your service"),
      el("div", { className: "actions" },
        el("a", { href: "/service-form.html?id=" + s.id, className: "btn" }, "Edit"),
        el("a", { href: "/dashboard.html", className: "btn btn-secondary" }, "Dashboard")
      )
    );
  } else if (!user) {
    actionBox.append(
      el("h3", {}, "Want to hire " + s.provider_name + "?"),
      el("a", { href: "/login.html?next=" + encodeURIComponent(location.pathname + location.search), className: "btn" }, "Log in to request")
    );
  } else {
    const message = el("p");
    const form = el("form", {},
      el("h3", {}, "Request this service"),
      el("label", {}, "What do you need?",
        el("textarea", { name: "brief", rows: 5, required: true, maxLength: 3000,
          placeholder: "Describe the task, what you expect to receive, and any links or references." })),
      el("label", {}, "Your budget (₱)", el("input", { type: "number", name: "budget", min: 0, step: "0.01", value: s.price })),
      el("label", {}, "Deadline", el("input", { type: "date", name: "deadline", min: new Date().toISOString().slice(0, 10) })),
      el("button", { type: "submit" }, "Send request")
    );
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const { ok, data } = await api("/api/jobs", {
        method: "POST",
        body: {
          service_id: s.id,
          brief: form.brief.value,
          budget: form.budget.value,
          deadline: form.deadline.value,
        },
      });
      if (ok) {
        window.location.href = "/job.html?id=" + data.id;
      } else {
        showMessage(message, data.error, true);
      }
    });
    actionBox.append(form, message);
  }

  const right = el("div", {},
    el("div", { className: "card provider-box" },
      avatar,
      el("h3", {}, el("a", { href: "/profile.html?id=" + s.provider_id }, s.provider_name)),
      el("p", { className: "muted" }, s.is_verified ? "✔ Verified student" : "Not yet verified"),
      s.school ? el("p", { className: "muted" }, "🎓 " + s.school) : null,
      s.skills ? el("p", { className: "muted" }, "Skills: " + s.skills) : null
    ),
    el("br"),
    actionBox
  );

  content.replaceChildren(el("div", { className: "two-col" }, left, right));
}

load();
