export default function SortableTh({ label, sortKeyName, activeKey, dir, onSort, className = "" }) {
  const isActive = activeKey === sortKeyName;
  return (
    <th className={`px-5 py-3 font-medium select-none ${className}`}>
      <button
        type="button"
        onClick={() => onSort(sortKeyName)}
        className={`inline-flex items-center gap-1 hover:text-[var(--color-ink)] ${
          isActive ? "text-[var(--color-ink)]" : ""
        }`}
      >
        {label}
        <span className="inline-flex flex-col leading-none text-[9px] -space-y-0.5">
          <span className={isActive && dir === "asc" ? "text-[var(--color-accent)]" : "text-[var(--color-ink-faint)]"}>▲</span>
          <span className={isActive && dir === "desc" ? "text-[var(--color-accent)]" : "text-[var(--color-ink-faint)]"}>▼</span>
        </span>
      </button>
    </th>
  );
}
