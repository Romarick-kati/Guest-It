import { useMemo, useState } from "react";

// Simple client-side pagination helper shared by admin list pages.
export function usePagination(items, pageSize = 5) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize]
  );
  return { page: safePage, setPage, totalPages, pageItems };
}
