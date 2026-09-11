export default function EmptyState({
  title = "Nothing here yet",
  description,
  icon,
  action,
  className = "",
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center gap-3 py-14 px-6 ${className}`}>
      <div className="h-12 w-12 rounded-full bg-[var(--color-surface-muted)] flex items-center justify-center text-[var(--color-ink-muted)]">
        {icon || (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h10" />
          </svg>
        )}
      </div>
      <h3 className="font-display font-semibold text-[var(--color-ink)]">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--color-ink-muted)] max-w-sm">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
