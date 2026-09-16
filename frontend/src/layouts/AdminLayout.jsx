import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminBreadcrumbs from "./AdminBreadcrumbs";
import { ADMIN_NAV } from "./adminNav";
import { getSession, isSignedIn } from "../lib/auth";

function currentTitle(pathname) {
  const match = [...ADMIN_NAV]
    .sort((a, b) => b.to.length - a.to.length)
    .find((item) => pathname.startsWith(item.to));
  return match?.label || "Admin";
}

function isAdminSignedIn() {
  return isSignedIn() && Boolean(getSession()?.user?.isAdmin);
}

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdminSignedIn()) {
      // replace, not push: this check runs on mount, so a plain push would
      // leave this /admin route in history right behind /signin - hitting
      // the browser back button would land back here and immediately
      // redirect again, making back look broken (same reasoning as the
      // guards on Profile.jsx/GamePlay.jsx).
      navigate("/signin", { replace: true, state: { returnTo: location.pathname } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isAdminSignedIn()) return null;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="sticky top-0 h-screen">
          <AdminSidebar />
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-[var(--color-surface)] shadow-xl">
            <AdminSidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <AdminHeader title={currentTitle(location.pathname)} onMenuClick={() => setDrawerOpen(true)} />

        <main className="p-4 sm:p-6 max-w-7xl">
          <AdminBreadcrumbs />
          <div key={location.pathname} className="page-transition">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
