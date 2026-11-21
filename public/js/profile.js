// Public student profile
const content = document.getElementById("content");

async function load() {
  const { ok, data: p } = await api("/api/profile/" + getParam("id"));
  if (!ok) {
    content.replaceChildren(el("h1", {}, p.error));
    return;
  }
  document.title = p.full_name + " – BuhatonKo";
  const user = await currentUser;
  const isMe = user && user.id === p.id;

  const avatar = p.avatar_url
    ? el("img", { src: p.avatar_url, alt: "", className: "avatar" })
    : el("div", { className: "avatar-placeholder" }, p.full_name.charAt(0).toUpperCase());

  const header = el("div", { className: "card" },
    avatar,
    el("h1", {}, p.full_name),
    el("p", { className: "muted" }, p.is_verified ? "✔ Verified student" : "Not yet verified"),
    p.school ? el("p", {}, "🎓 " + p.school) : null,
    el("p", { className: "rating" }, stars(p.rating)),
    el("p", { className: "muted" }, p.completed_jobs + " completed job" + (p.completed_jobs == 1 ? "" : "s")),
    p.skills ? el("p", {}, el("strong", {}, "Skills: "), p.skills) : null,
    el("p", { className: "pre" }, p.bio || "No bio yet."),
    isMe ? el("a", { href: "/profile-edit.html", className: "btn" }, "Edit profile") : null,
    user && !isMe ? reportButton("user", p.id) : null
  );

  const services = el("div", { className: "grid" });
  if (p.services.length === 0) services.append(el("p", { className: "muted" }, "No active services."));
  p.services.forEach((s) => services.append(serviceCard(s)));

  const reviews = el("div", { className: "card" });
  if (p.reviews.length === 0) reviews.append(el("p", { className: "muted" }, "No reviews yet."));
  p.reviews.forEach((r) =>
    reviews.append(el("div", { className: "review" },
      el("strong", {}, r.reviewer_name), " ",
      el("span", { className: "rating" }, "★".repeat(r.rating) + "☆".repeat(5 - r.rating)),
      el("p", { className: "pre" }, r.comment || ""),
      el("small", { className: "muted" }, formatDate(r.created_at))
    ))
  );

  content.replaceChildren(
    el("div", { className: "two-col" },
      el("div", {},
        el("h2", {}, "Services"), services,
        el("h2", {}, "Reviews"), reviews),
      header
    )
  );
}

load();
