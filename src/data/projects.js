// ── Projects registry ────────────────────────────────────────────────────────
// Add new projects here. They appear automatically on the homepage and
// the /projects listing page.
//
// Fields:
//   id        — url slug, e.g. "championship-table"
//   title     — display title
//   summary   — one sentence description (shown on cards)
//   tags      — array from: sport, nhs, data, writing, photography, productivity, politics
//   date      — ISO date string
//   featured  — show in hero area on homepage
//   external  — if true, href links off-site
//   href      — path or URL (only needed if external: true)
//   status    — "live" | "draft" | "wip"

const projects = [
  {
    id: "championship-table",
    title: "EFL Championship 2025/26 — Table Race",
    summary: "Animated bump chart showing every team's league position across every matchday of the season, computed from real match results.",
    tags: ["sport", "data"],
    date: "2026-04-15",
    featured: true,
    status: "live",
  },
]

export default projects
