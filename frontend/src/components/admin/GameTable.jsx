import { Link } from "react-router-dom";
import GameStatusBadge from "../game/GameStatusBadge";
import { formatCurrency } from "../../lib/gameStatus";
import { GAME_STATUS } from "../../lib/gameStatus";
import { GAME_TYPES } from "../../lib/mockData";
import Dropdown, { DropdownItem } from "../ui/Dropdown";
import SortableTh from "../ui/SortableTh";
import { useSortableData } from "../../lib/useSortableData";
import { icons } from "../ui/icons";
import { useToast } from "../../context/ToastContext";

function gameTypeLabel(type) {
  return GAME_TYPES.find((t) => t.value === type)?.label || type || "—";
}

function RowActions({ game }) {
  const { notify } = useToast();
  const isLive = game.status === GAME_STATUS.LIVE || game.status === GAME_STATUS.PAUSED;

  return (
    <div className="flex items-center justify-end gap-3">
      <Link to={`/admin/games/${game.id}`} className="text-[var(--color-accent)] hover:underline font-medium">
        View
      </Link>
      {(game.status === GAME_STATUS.DRAFT || game.status === GAME_STATUS.UPCOMING) && (
        <Link to={`/admin/games/${game.id}/edit`} className="text-[var(--color-accent)] hover:underline font-medium">
          Edit
        </Link>
      )}
      {isLive && (
        <Link to={`/admin/games/${game.id}/live`} className="text-[var(--color-accent)] hover:underline font-medium">
          Monitor
        </Link>
      )}
      {game.status === GAME_STATUS.COMPLETED && (
        <Link to={`/admin/games/${game.id}/result`} className="text-[var(--color-accent)] hover:underline font-medium">
          Result
        </Link>
      )}
      <Dropdown
        trigger={
          <span className="h-7 w-7 rounded-md flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)]">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <circle cx="4" cy="10" r="1.4" />
              <circle cx="10" cy="10" r="1.4" />
              <circle cx="16" cy="10" r="1.4" />
            </svg>
          </span>
        }
      >
        <DropdownItem onClick={() => notify(`"${game.title}" duplicated as a draft.`, { type: "success" })}>
          Duplicate
        </DropdownItem>
        {game.status === GAME_STATUS.UPCOMING || game.status === GAME_STATUS.DRAFT ? (
          <DropdownItem onClick={() => notify(`"${game.title}" activated successfully.`, { type: "success" })}>
            Activate
          </DropdownItem>
        ) : isLive ? (
          <DropdownItem onClick={() => notify(`"${game.title}" deactivated.`, { type: "info" })}>
            Deactivate
          </DropdownItem>
        ) : null}
        <DropdownItem
          onClick={() => window.location.assign(`/admin/games/${game.id}/participants`)}
        >
          View participants
        </DropdownItem>
      </Dropdown>
    </div>
  );
}

export default function GameTable({ games = [] }) {
  const { sorted, sortKey, sortDir, toggleSort } = useSortableData(games, {
    accessors: {
      title: (g) => g.title?.toLowerCase(),
      type: (g) => gameTypeLabel(g.gameType),
      status: (g) => g.status,
      participants: (g) => g.participants,
      entryFee: (g) => g.entryFee,
      prize: (g) => g.prize,
    },
  });

  return (
    <div className="w-full">
      {/* Desktop / tablet table */}
      <div className="hidden md:block overflow-x-auto scroll-thin rounded-2xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--color-surface-muted)] text-left text-[var(--color-ink-muted)]">
              <SortableTh label="Game" sortKeyName="title" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Type" sortKeyName="type" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Status" sortKeyName="status" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Participants" sortKeyName="participants" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Entry fee" sortKeyName="entryFee" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Prize" sortKeyName="prize" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {sorted.map((game) => (
              <tr key={game.id} className="hover:bg-[var(--color-surface-muted)]/60">
                <td className="px-5 py-3.5 font-medium text-[var(--color-ink)]">{game.title}</td>
                <td className="px-5 py-3.5 text-[var(--color-ink-muted)]">{gameTypeLabel(game.gameType)}</td>
                <td className="px-5 py-3.5">
                  <GameStatusBadge status={game.status} />
                </td>
                <td className="px-5 py-3.5 text-[var(--color-ink-muted)]">{game.participants}</td>
                <td className="px-5 py-3.5 text-[var(--color-ink-muted)]">
                  {game.entryFee ? formatCurrency(game.entryFee, game.currency) : "Free"}
                </td>
                <td className="px-5 py-3.5 text-[var(--color-ink-muted)]">
                  {game.prize ? formatCurrency(game.prize, game.currency) : "--"}
                </td>
                <td className="px-5 py-3.5">
                  <RowActions game={game} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {sorted.map((game) => (
          <div key={game.id} className="border border-[var(--color-border)] rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium text-[var(--color-ink)]">{game.title}</p>
              <GameStatusBadge status={game.status} />
            </div>
            <p className="text-xs text-[var(--color-ink-faint)] mt-0.5">{gameTypeLabel(game.gameType)}</p>
            <div className="flex items-center justify-between mt-3 text-sm text-[var(--color-ink-muted)]">
              <span>{game.participants} participants</span>
              <span>{game.prize ? formatCurrency(game.prize, game.currency) : "--"}</span>
            </div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[var(--color-border)]">
              <RowActions game={game} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
