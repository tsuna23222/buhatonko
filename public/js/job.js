// Job page: details, status actions, messages, review
const content = document.getElementById("content");
const jobId = getParam("id");

const ACTION_LABELS = {
  accepted: "Accept request",
  declined: "Decline",
  in_progress: "Start work",
  submitted: "Submit work for review",
  completed: "Confirm completed",
  cancelled: "Cancel request",
};

async function changeStatus(status, job) {
  // "in_progress" from "submitted" means the customer is asking for changes
  const label = job.status === "submitted" && status === "in_progress" ? "Request changes" : ACTION_LABELS[status];
  if (["declined", "cancelled"].includes(status) && !confirm(label + "? This can't be undone.")) return;
  const { ok, data } = await api(`/api/jobs/${jobId}/status`, { method: "PATCH", body: { status } });
  if (!ok) alert(data.error);
  load();
}

function actionButtons(job) {
  if (job.allowed_statuses.length === 0) return null;
  return el("div", { className: "actions" }, job.allowed_statuses.map((status) => {
    const isChange = job.status === "submitted" && status === "in_progress";
    const danger = ["declined", "cancelled"].includes(status);
    return el("button", {
      className: danger ? "btn-danger" : isChange ? "btn-secondary" : "",
      onclick: () => changeStatus(status, job),
    }, isChange ? "Request changes" : ACTION_LABELS[status]);
  }));
}

function nextStepText(job) {
  const mine = job.my_role;
  const tips = {
    requested: mine === "provider" ? "Review the brief, ask questions in the chat, then accept or decline."
                                   : "Waiting for the provider to accept your request.",
    accepted: mine === "provider" ? "Click “Start work” when you begin." : "The provider accepted. Work will start soon.",
    in_progress: mine === "provider" ? "When you're done, share the deliverable in the chat and submit for review."
                                     : "The provider is working on it.",
    submitted: mine === "customer" ? "Check the work. Confirm if it's done, or request changes."
                                   : "Waiting for the customer to confirm.",
    completed: "This job is complete. Payment is arranged directly between the two students.",
    declined: "This request was declined.",
    cancelled: "This request was cancelled.",
  };
  return tips[job.status];
}

function chatBox(job, user) {
  const chat = el("div", { className: "chat" });
  if (job.messages.length === 0) chat.append(el("p", { className: "muted" }, "No messages yet. Say hi!"));
  job.messages.forEach((m) =>
    chat.append(el("div", { className: "bubble" + (m.sender_id === user.id ? " mine" : "") },
      el("small", {}, m.sender_name + " · " + new Date(m.created_at).toLocaleString("en-PH")),
      el("span", { className: "pre" }, m.body)
    ))
  );

  const form = el("form", { className: "row" },
    el("input", { name: "body", placeholder: "Write a message...", autocomplete: "off", maxLength: 2000 }),
    el("button", { type: "submit", style: "flex:0 0 auto" }, "Send")
  );
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.body.value.trim()) return;
    const { ok, data } = await api(`/api/jobs/${jobId}/messages`, { method: "POST", body: { body: form.body.value } });
    if (!ok) return alert(data.error);
    load();
  });

  setTimeout(() => (chat.scrollTop = chat.scrollHeight), 0);
  const closed = ["declined", "cancelled"].includes(job.status);
  return el("div", { className: "card" }, el("h2", {}, "Messages"), chat, closed ? null : form);
}

function reviewBox(job) {
  if (job.status !== "completed") return null;
  if (job.review) {
    return el("div", { className: "card" },
      el("h2", {}, "Review"),
      el("p", { className: "rating" }, "★".repeat(job.review.rating) + "☆".repeat(5 - job.review.rating)),
      el("p", { className: "pre" }, job.review.comment || "")
    );
  }
  if (job.my_role !== "customer") {
    return el("div", { className: "card" }, el("p", { className: "muted" }, "The customer hasn't left a review yet."));
  }
  const message = el("p");
  const form = el("form", {},
    el("h2", {}, "Leave a review"),
    el("label", {}, "Rating", el("select", { name: "rating" },
      [5, 4, 3, 2, 1].map((n) => el("option", { value: n }, "★".repeat(n) + " (" + n + ")")))),
    el("label", {}, "Comment", el("textarea", { name: "comment", rows: 3, maxLength: 1000 })),
    el("button", { type: "submit" }, "Submit review")
  );
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { ok, data } = await api(`/api/jobs/${jobId}/review`, {
      method: "POST", body: { rating: form.rating.value, comment: form.comment.value },
    });
    if (!ok) return showMessage(message, data.error, true);
    load();
  });
  return el("div", { className: "card" }, form, message);
}

let lastMessageCount = null;

async function load() {
  const user = await requireUser();
  const { ok, data: job } = await api("/api/jobs/" + jobId);
  if (!ok) {
    content.replaceChildren(el("h1", {}, job.error), el("a", { href: "/dashboard.html" }, "← Dashboard"));
    return;
  }
  lastMessageCount = job.messages.length;
  const other = job.my_role === "customer"
    ? { label: "Provider", name: job.provider_name, id: job.provider_id }
    : { label: "Customer", name: job.customer_name, id: job.customer_id };

  const left = el("div", {},
    el("a", { href: "/dashboard.html" }, "← Dashboard"),
    el("h1", {}, job.service_title),
    el("div", { className: "card" },
      el("p", {}, statusBadge(job.status), " ", el("span", { className: "muted" }, nextStepText(job))),
      actionButtons(job),
      el("h3", {}, "Brief"),
      el("p", { className: "pre" }, job.brief)
    ),
    el("br"),
    chatBox(job, user),
    el("br"),
    reviewBox(job)
  );

  const right = el("div", {},
    el("div", { className: "card" },
      el("p", {}, el("strong", {}, other.label + ": "), el("a", { href: "/profile.html?id=" + other.id }, other.name)),
      el("p", {}, el("strong", {}, "Budget: "), job.budget ? peso(job.budget) : "—"),
      el("p", {}, el("strong", {}, "Deadline: "), formatDate(job.deadline)),
      el("p", {}, el("strong", {}, "Requested: "), formatDate(job.created_at)),
      el("p", {}, el("a", { href: "/service.html?id=" + job.service_id }, "View service →"))
    ),
    el("br"),
    el("div", { className: "card" },
      el("h3", {}, "History"),
      el("ul", { className: "timeline" }, job.history.map((h) =>
        el("li", {}, statusBadge(h.status), " ", h.changed_by_name, " · ",
          el("span", { className: "muted" }, new Date(h.changed_at).toLocaleString("en-PH")))
      ))
    )
  );

  content.replaceChildren(el("div", { className: "two-col" }, left, right));
}

// Check for new messages every 10 seconds (simple "polling")
setInterval(async () => {
  if (lastMessageCount === null || document.activeElement?.name === "body") return;
  const { ok, data } = await api("/api/jobs/" + jobId);
  if (ok && data.messages.length !== lastMessageCount) load();
}, 10000);

load();
