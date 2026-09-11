export default function LoadingState({ label = "Loading...", fullPage = false, className = "" }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-[var(--color-ink-muted)] ${
        fullPage ? "min-h-[50vh]" : "py-12"
      } ${className}`}
      role="status"
      aria-live="polite"
    >
      <svg className="h-6 w-6 animate-spin text-[var(--color-accent)]" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <p className="text-sm">{label}</p>
    </div>
  );
}
