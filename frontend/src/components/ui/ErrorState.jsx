export default function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this. Please try again.",
  onRetry,
  className = "",
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center gap-3 py-14 px-6 ${className}`}>
      <div className="h-12 w-12 rounded-full bg-[var(--color-danger-soft)] flex items-center justify-center text-[var(--color-danger)]">
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A1 1 0 003 19.5h18a1 1 0 00.89-1.46L13.71 3.86a1 1 0 00-1.72 0z" />
        </svg>
      </div>
      <h3 className="font-display font-semibold text-[var(--color-ink)]">{title}</h3>
      <p className="text-sm text-[var(--color-ink-muted)] max-w-sm">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 text-sm font-medium text-[var(--color-accent)] hover:underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}
