const TONE_STYLES = {
  neutral: "bg-[var(--color-surface-sunken)] text-[var(--color-ink-muted)]",
  success: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  danger: "bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
  warning: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
};

export default function StatusScreen({ icon, tone = "neutral", title, description, children }) {
  return (
    <div className="max-w-sm mx-auto px-4 sm:px-6 py-20 text-center flex flex-col items-center">
      <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-5 ${TONE_STYLES[tone]}`}>
        {icon}
      </div>
      <h1 className="font-display text-xl font-semibold text-[var(--color-ink)]">{title}</h1>
      {description && <p className="text-sm text-[var(--color-ink-muted)] mt-2">{description}</p>}
      {children && <div className="w-full mt-6 flex flex-col gap-2">{children}</div>}
    </div>
  );
}

export function Spinner({ className = "h-7 w-7" }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export function CheckIcon({ className = "h-7 w-7" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function XIcon({ className = "h-7 w-7" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
