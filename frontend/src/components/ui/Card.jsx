export default function Card({
  children,
  className = "",
  padded = true,
  hoverable = false,
  as: Tag = "div",
  ...props
}) {
  return (
    <Tag
      className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl ${padded ? "p-5" : ""} ${hoverable ? "hover-lift" : ""} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ title, subtitle, action, className = "" }) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div>
        <h3 className="font-display font-semibold text-lg text-[var(--color-ink)]">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-[var(--color-ink-muted)] mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
