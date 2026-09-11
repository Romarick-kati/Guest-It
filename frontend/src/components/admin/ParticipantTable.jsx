import Badge from "../ui/Badge";

export default function ParticipantTable({ participants = [] }) {
  return (
    <div className="w-full">
      <div className="hidden md:block overflow-x-auto scroll-thin rounded-2xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--color-surface-muted)] text-left text-[var(--color-ink-muted)]">
              <th className="px-5 py-3 font-medium">Player</th>
              <th className="px-5 py-3 font-medium">Joined</th>
              <th className="px-5 py-3 font-medium">Payment</th>
              <th className="px-5 py-3 font-medium">Submission</th>
              <th className="px-5 py-3 font-medium">Submitted at</th>
              <th className="px-5 py-3 font-medium">Eligibility</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {participants.map((p) => (
              <tr key={p.id} className="hover:bg-[var(--color-surface-muted)]/60">
                <td className="px-5 py-3.5 font-medium text-[var(--color-ink)]">{p.name}</td>
                <td className="px-5 py-3.5 text-[var(--color-ink-muted)]">{p.joined || "--"}</td>
                <td className="px-5 py-3.5">
                  <Badge tone={p.payment === "CONFIRMED" ? "success" : "warning"}>{p.payment || "--"}</Badge>
                </td>
                <td className="px-5 py-3.5">
                  <Badge tone={p.status === "SUBMITTED" ? "success" : "neutral"}>{p.status}</Badge>
                </td>
                <td className="px-5 py-3.5 text-[var(--color-ink-muted)]">{p.submittedAt || "--"}</td>
                <td className="px-5 py-3.5">
                  <Badge tone={p.eligibility === "ELIGIBLE" ? "info" : "danger"}>{p.eligibility || "--"}</Badge>
                  {p.eligibilityReason && (
                    <p className="text-xs text-[var(--color-ink-faint)] mt-1">{p.eligibilityReason}</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden flex flex-col gap-3">
        {participants.map((p) => (
          <div key={p.id} className="border border-[var(--color-border)] rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium text-[var(--color-ink)]">{p.name}</p>
              <Badge tone={p.status === "SUBMITTED" ? "success" : "neutral"}>{p.status}</Badge>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge tone={p.payment === "CONFIRMED" ? "success" : "warning"}>{p.payment || "--"}</Badge>
              <Badge tone={p.eligibility === "ELIGIBLE" ? "info" : "danger"}>{p.eligibility || "--"}</Badge>
            </div>
            {p.eligibilityReason && (
              <p className="text-xs text-[var(--color-ink-faint)] mt-1.5">{p.eligibilityReason}</p>
            )}
            <div className="flex items-center justify-between mt-2 text-xs text-[var(--color-ink-faint)]">
              <span>Joined: {p.joined || "--"}</span>
              <span>Submitted: {p.submittedAt || "--"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
