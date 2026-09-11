export default function Toggle({ checked, onChange, label, description, className = "" }) {
  const body = (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange?.(!checked)}
      className={`relative h-6 w-11 rounded-full shrink-0 transition-colors duration-300 ease-out active:scale-95 ${
        checked ? "bg-[var(--color-accent)]" : "bg-[var(--color-surface-sunken)]"
      }`}
      style={{ transition: "background-color 300ms ease-out, transform 150ms ease-out" }}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
        style={{ transition: "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      />
    </button>
  );

  if (!label) return <div className={className}>{body}</div>;

  return (
    <div className={`flex items-center justify-between py-3 ${className}`}>
      <div>
        <p className="text-sm font-medium text-[var(--color-ink)]">{label}</p>
        {description && <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{description}</p>}
      </div>
      {body}
    </div>
  );
}
