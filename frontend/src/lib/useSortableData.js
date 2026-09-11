import { useMemo, useState } from "react";

/**
 * Lightweight sortable-table helper shared by every admin table.
 * `accessors` maps a column key to a function that pulls the comparable
 * value off a row, so numeric/date columns sort correctly instead of as
 * strings.
 */
export function useSortableData(items, { defaultKey = null, defaultDir = "asc", accessors = {} } = {}) {
  const [sortKey, setSortKey] = useState(defaultKey);
  const [sortDir, setSortDir] = useState(defaultDir);

  const toggleSort = (key) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    if (!sortKey) return items;
    const accessor = accessors[sortKey] || ((row) => row[sortKey]);
    const copy = [...items];
    copy.sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") return av - bv;
      return String(av).localeCompare(String(bv));
    });
    if (sortDir === "desc") copy.reverse();
    return copy;
  }, [items, sortKey, sortDir, accessors]);

  return { sorted, sortKey, sortDir, toggleSort };
}
