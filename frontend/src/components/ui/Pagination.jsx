import { icons } from "./icons";

export default function Pagination({ page, totalPages, onChange, className = "" }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== "...") pages.push("...");
  }

  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <p className="text-xs text-[var(--color-ink-muted)]">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          aria-label="Previous page"
          className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <icons.chevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`e${i}`} className="px-1 text-[var(--color-ink-faint)] text-sm">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`h-8 w-8 rounded-lg text-sm font-medium ${
                p === page
                  ? "bg-[var(--color-ink)] text-[var(--color-bg)]"
                  : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)]"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          aria-label="Next page"
          className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <icons.chevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
