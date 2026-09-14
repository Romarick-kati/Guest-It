import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchUsers } from "../../lib/api";
import { TableSkeleton } from "../../components/ui/Skeleton";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/ui/Pagination";
import Dropdown, { DropdownItem } from "../../components/ui/Dropdown";
import SortableTh from "../../components/ui/SortableTh";
import { usePagination } from "../../lib/usePagination";
import { useSortableData } from "../../lib/useSortableData";
import { icons } from "../../components/ui/icons";
import { useToast } from "../../context/ToastContext";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "SUSPENDED", label: "Suspended" },
];

const STATUS_TONE = { ACTIVE: "success", INACTIVE: "neutral", SUSPENDED: "danger" };

function UserActions({ user }) {
  const { notify } = useToast();
  return (
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
      <DropdownItem onClick={() => (window.location.href = `/admin/users/${user.id}`)}>View</DropdownItem>
      <DropdownItem onClick={() => notify(`Edit ${user.name} — coming once backend is connected.`, { type: "info" })}>
        Edit
      </DropdownItem>
      {user.status === "SUSPENDED" ? (
        <DropdownItem onClick={() => notify(`${user.name} reactivated.`, { type: "success" })}>Activate</DropdownItem>
      ) : (
        <DropdownItem onClick={() => notify(`${user.name} suspended.`, { type: "info" })} className="text-[var(--color-danger)]">
          Suspend
        </DropdownItem>
      )}
    </Dropdown>
  );
}

export default function AdminUsers() {
  const [status, setStatus] = useState("loading");
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const load = async () => {
    setStatus("loading");
    try {
      setUsers(await fetchUsers());
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      users.filter((u) => {
        const matchesSearch =
          u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [users, search, statusFilter]
  );
  const { sorted, sortKey, sortDir, toggleSort } = useSortableData(filtered, {
    defaultKey: "name",
    accessors: { name: (u) => u.name.toLowerCase(), email: (u) => u.email.toLowerCase() },
  });
  const { page, setPage, totalPages, pageItems } = usePagination(sorted, 6);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Users</h2>
        <p className="text-sm text-[var(--color-ink-muted)]">All registered players on ON Point</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          containerClassName="flex-1"
          prefix={<icons.search className="h-4 w-4" />}
        />
        <Select options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} containerClassName="sm:w-52" />
      </div>

      {status === "loading" && <TableSkeleton cols={6} />}
      {status === "error" && <ErrorState onRetry={load} />}
      {status === "success" && filtered.length === 0 && (
        <EmptyState title="No users found" description="Try a different search term or filter." />
      )}
      {status === "success" && filtered.length > 0 && (
        <>
          <div className="hidden md:block overflow-x-auto scroll-thin rounded-2xl border border-[var(--color-border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--color-surface-muted)] text-left text-[var(--color-ink-muted)]">
                  <SortableTh label="Name" sortKeyName="name" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Email" sortKeyName="email" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Status" sortKeyName="status" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Games played" sortKeyName="gamesPlayed" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Wins" sortKeyName="wins" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Joined" sortKeyName="joined" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {pageItems.map((u) => (
                  <tr key={u.id} className="hover:bg-[var(--color-surface-muted)]/60">
                    <td className="px-5 py-3.5 font-medium text-[var(--color-ink)]">
                      <Link to={`/admin/users/${u.id}`} className="hover:text-[var(--color-accent)] hover:underline">
                        {u.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--color-ink-muted)]">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <Badge tone={STATUS_TONE[u.status]}>{u.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--color-ink-muted)]">{u.gamesPlayed}</td>
                    <td className="px-5 py-3.5 text-[var(--color-ink-muted)]">{u.wins}</td>
                    <td className="px-5 py-3.5 text-[var(--color-ink-muted)]">{u.joined}</td>
                    <td className="px-5 py-3.5 text-right">
                      <UserActions user={u} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden flex flex-col gap-3">
            {pageItems.map((u) => (
              <div key={u.id} className="border border-[var(--color-border)] rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <Link to={`/admin/users/${u.id}`} className="font-medium text-[var(--color-ink)]">
                    {u.name}
                  </Link>
                  <Badge tone={STATUS_TONE[u.status]}>{u.status}</Badge>
                </div>
                <p className="text-sm text-[var(--color-ink-muted)] mt-1">{u.email}</p>
                <div className="flex items-center justify-between mt-2 text-xs text-[var(--color-ink-faint)]">
                  <span>{u.gamesPlayed} games · {u.wins} wins</span>
                  <span>Joined {u.joined}</span>
                </div>
              </div>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
