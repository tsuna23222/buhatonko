// Shared helpers used by every page. Load this file BEFORE the page's own script.

// Calls the API and returns { ok, status, data }
async function api(url, options = {}) {
  const opts = { ...options, headers: { ...(options.headers || {}) } };
  if (opts.body && typeof opts.body !== "string") {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(opts.body);
  }
  const res = await fetch(url, opts);
  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    data = { error: "Unexpected server response." };
  }
  return { ok: res.ok, status: res.status, data };
}

// Creates an HTML element safely.
// Text is always set with textContent, so user-typed content can never run as code (XSS).
// Example: el("a", { href: "/x", className: "btn" }, "Click me")
function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) continue;
    if (key.startsWith("on")) node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === "className") node.className = value;
    else if (key in node) node[key] = value;
    else node.setAttribute(key, value);
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

function peso(amount) {
  return "₱" + Number(amount).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function priceLabel(s) {
  return (s.price_type === "starting" ? "From " : "") + peso(s.price);
}

const MODE_LABELS = { online: "Online", in_person: "In person", both: "Online or in person" };

const STATUS_LABELS = {
  requested: "Requested",
  accepted: "Accepted",
  declined: "Declined",
  in_progress: "In progress",
  submitted: "Submitted for review",
  completed: "Completed",
  cancelled: "Cancelled",
  active: "Active",
  paused: "Paused",
};

function statusBadge(status) {
  return el("span", { className: "badge badge-" + status }, STATUS_LABELS[status] || status);
}

function stars(rating) {
  if (!rating) return "No reviews yet";
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full) + " " + rating;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function showMessage(target, text, isError) {
  target.textContent = text;
  target.className = "message " + (isError ? "error" : "success");
}

// Loads the logged-in user once (or null) and draws the top navigation bar.
const currentUser = api("/api/auth/me").then((r) => (r.ok ? r.data : null));

async function renderNav() {
  const user = await currentUser;
  const links = [el("a", { href: "/browse.html" }, "Browse services")];

  if (user) {
    links.push(
      el("a", { href: "/dashboard.html" }, "Dashboard"),
      el("a", { href: "/service-form.html", className: "btn btn-small" }, "+ Offer a service"),
      el("a", { href: "/profile.html?id=" + user.id }, user.full_name),
      el("button", {
        className: "link-button",
        onclick: async () => {
          await api("/api/auth/logout", { method: "POST" });
          window.location.href = "/";
        },
      }, "Log out")
    );
  } else {
    links.push(
      el("a", { href: "/login.html" }, "Log in"),
      el("a", { href: "/register.html", className: "btn btn-small" }, "Sign up")
    );
  }

  const nav = el("header", { className: "site-header" },
    el("div", { className: "container nav" },
      el("a", { href: "/", className: "logo" }, "Buhaton", el("span", {}, "Ko")),
      el("nav", { className: "nav-links" }, links)
    )
  );
  document.body.prepend(nav);
}

// Use on pages that need a logged-in user. Sends visitors to the login page.
async function requireUser() {
  const user = await currentUser;
  if (!user) {
    window.location.href = "/login.html?next=" + encodeURIComponent(location.pathname + location.search);
    throw new Error("Not logged in");
  }
  return user;
}

// A service card used on the homepage, browse page and profiles
function serviceCard(s) {
  return el("a", { href: "/service.html?id=" + s.id, className: "card service-card" },
    el("span", { className: "tag" }, s.category),
    el("h3", {}, s.title),
    s.provider_name
      ? el("p", { className: "muted" }, "by " + s.provider_name + (s.is_verified ? " ✔" : ""))
      : null,
    s.review_count !== undefined
      ? el("p", { className: "rating" }, stars(s.rating) + (s.review_count ? ` (${s.review_count})` : ""))
      : null,
    el("p", { className: "price" }, priceLabel(s))
  );
}

renderNav();
