import { Link, useLocation } from "react-router-dom";

// Human-readable overrides for path segments that aren't just IDs.
const LABELS = {
  admin: "Dashboard",
  games: "Games",
  create: "Create",
  edit: "Edit",
  live: "Live",
  participants: "Participants",
  result: "Result",
  results: "Results",
  winners: "Winners",
  users: "Users",
  transactions: "Transactions",
  notifications: "Notifications",
  settings: "Settings",
};

function labelFor(segment, index, segments) {
  if (LABELS[segment]) return LABELS[segment];
  // Likely an :id segment (e.g. a game or user id) — show it plainly.
  return segment.length <= 12 ? segment : `${segment.slice(0, 10)}…`;
}

export default function AdminBreadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  let path = "";
  const crumbs = segments.map((seg, i) => {
    path += `/${seg}`;
    return { label: labelFor(seg, i, segments), to: path, isLast: i === segments.length - 1 };
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center flex-wrap gap-1.5 text-sm text-[var(--color-ink-muted)]">
        {crumbs.map((c) => (
          <li key={c.to} className="flex items-center gap-1.5">
            {c.isLast ? (
              <span className="text-[var(--color-ink)] font-medium">{c.label}</span>
            ) : (
              <>
                <Link to={c.to} className="hover:text-[var(--color-ink)] hover:underline">
                  {c.label}
                </Link>
                <span className="text-[var(--color-ink-faint)]">/</span>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
