import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchUser } from "../../lib/api";
import { TableSkeleton } from "../../components/ui/Skeleton";
import ErrorState from "../../components/ui/ErrorState";
import Card, { CardHeader } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { useToast } from "../../context/ToastContext";

const STATUS_TONE = { ACTIVE: "success", INACTIVE: "neutral", SUSPENDED: "danger" };

export default function AdminUserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [status, setStatus] = useState("loading");
  const [user, setUser] = useState(null);

  const load = async () => {
    setStatus("loading");
    try {
      setUser(await fetchUser(id));
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (status === "loading") return <TableSkeleton cols={4} rows={4} />;
  if (status === "error") return <ErrorState onRetry={load} />;

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <button
        onClick={() => navigate("/admin/users")}
        className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] w-fit"
      >
        ← Back to users
      </button>

      <Card>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-[var(--color-surface-sunken)] flex items-center justify-center font-display font-semibold text-lg text-[var(--color-ink-muted)]">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">{user.name}</h2>
              <Badge tone={STATUS_TONE[user.status]}>{user.status}</Badge>
            </div>
            <p className="text-sm text-[var(--color-ink-muted)]">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <Stat label="Games played" value={user.gamesPlayed} />
          <Stat label="Wins" value={user.wins} />
          <Stat label="Losses" value={user.losses} />
          <Stat label="Points" value={user.points} />
        </div>

        <p className="text-xs text-[var(--color-ink-faint)] mt-4">Joined {user.joined}</p>

        <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-[var(--color-border)]">
          <Button variant="outline" onClick={() => notify("Profile editing arrives with the backend.", { type: "info" })}>
            Edit account
          </Button>
          {user.status === "SUSPENDED" ? (
            <Button onClick={() => notify(`${user.name} reactivated.`, { type: "success" })}>Activate account</Button>
          ) : (
            <Button variant="danger" onClick={() => notify(`${user.name} suspended.`, { type: "info" })}>
              Suspend account
            </Button>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title="Recent games" subtitle="Games this player has taken part in" />
        <p className="text-sm text-[var(--color-ink-muted)] mt-4">
          Per-player game history will appear here once the backend provides it.
        </p>
      </Card>

      <Card>
        <CardHeader title="Transactions" subtitle="Payments and payouts linked to this account" />
        <p className="text-sm text-[var(--color-ink-muted)] mt-4">
          This player's transaction history will appear here once connected to real payment data.
        </p>
      </Card>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-[var(--color-surface-muted)] rounded-xl px-3 py-3">
      <p className="text-xs text-[var(--color-ink-muted)]">{label}</p>
      <p className="font-display font-semibold text-[var(--color-ink)] mt-0.5 text-sm">{value}</p>
    </div>
  );
}
