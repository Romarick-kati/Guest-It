export default function ActivityList({ items = [] }) {
  return (
    <ul className="flex flex-col divide-y divide-[var(--color-border)]">
      {items.map((a) => (
        <li key={a.id} className="py-3 flex items-center justify-between text-sm gap-4">
          <span className="text-[var(--color-ink)]">{a.text}</span>
          <span className="text-[var(--color-ink-faint)] shrink-0">{a.time}</span>
        </li>
      ))}
    </ul>
  );
}
