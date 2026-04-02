"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "@/app/providers";
import {
  BarChart3,
  ScanLine,
  AlertTriangle,
  Eye,
  Users,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  Layers,
  Bell,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/dashboard/scan", label: "Scan", icon: ScanLine },
  { href: "/dashboard/issues", label: "Issues", icon: AlertTriangle },
  { href: "/dashboard/vision", label: "Vision Sim", icon: Eye },
  { href: "/dashboard/reviews", label: "Human Review", icon: Users },
  { href: "/dashboard/compliance", label: "Compliance", icon: ShieldCheck },
  { href: "/dashboard/universal-design", label: "UD Audit", icon: Layers },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [issueCounts, setIssueCounts] = useState({ openIssues: 0, pendingReviews: 0 });

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    fetch("/api/issues?status=OPEN&page=1")
      .then((r) => r.json())
      .then((d) => {
        setIssueCounts((prev) => ({ ...prev, openIssues: d.pagination?.total ?? 0 }));
      })
      .catch(() => {});
    fetch("/api/reviews?status=PENDING")
      .then((r) => r.json())
      .then((d) => {
        setIssueCounts((prev) => ({ ...prev, pendingReviews: d.issues?.length ?? 0 }));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* ─── Mobile backdrop ─── */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ─── Sidebar ─── */}
      <nav
        aria-label="Main navigation"
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col bg-surface-raised border-r overflow-y-auto flex-shrink-0
          transition-transform duration-200
          md:static md:z-auto md:translate-x-0
          ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          width: collapsed ? 72 : 240,
          borderColor: "var(--color-border)",
        }}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-3 border-b px-5 py-5"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0">
            <ScanLine size={18} className="text-white" />
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm font-bold text-slate-50 leading-tight">
                  AccessiScan
                </p>
                <p className="text-[10px] text-brand-400 font-semibold uppercase tracking-widest">
                  Pro Dashboard
                </p>
              </div>
              <button
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close navigation"
                className="md:hidden p-1 rounded text-slate-500 hover:text-slate-300"
              >
                <X size={16} />
              </button>
            </>
          )}
        </div>

        {/* Nav Links */}
        <div className="flex-1 py-3 px-2 space-y-0.5" role="list">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                role="listitem"
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-touch ${
                  isActive
                    ? "bg-surface-overlay text-slate-50"
                    : "text-slate-400 hover:text-slate-200 hover:bg-surface-overlay/50"
                }`}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}

                {/* Badge for Issues */}
                {!collapsed && item.label === "Issues" && issueCounts.openIssues > 0 && (
                  <span className="ml-auto bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {issueCounts.openIssues > 99 ? "99+" : issueCounts.openIssues}
                  </span>
                )}
                {!collapsed && item.label === "Human Review" && issueCounts.pendingReviews > 0 && (
                  <span className="ml-auto bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {issueCounts.pendingReviews > 99 ? "99+" : issueCounts.pendingReviews}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User info */}
        {!collapsed && session?.user && (
          <div
            className="border-t px-4 py-3 flex items-center gap-2"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-slate-200 truncate leading-tight">
                {(session.user as any).name || (session.user as any).email}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{(session.user as any).email}</p>
            </div>
            {(session.user as any).role === "SUPER_ADMIN" && (
              <span
                aria-label="Super admin account"
                style={{
                  fontSize: "0.625rem", fontWeight: 700, padding: "1px 6px",
                  background: "rgba(129,140,248,0.15)", color: "#818CF8",
                  border: "1px solid rgba(129,140,248,0.3)",
                  borderRadius: 4, letterSpacing: "0.05em", textTransform: "uppercase",
                  flexShrink: 0,
                }}
              >
                Admin
              </span>
            )}
          </div>
        )}

        {/* Theme Switcher */}
        {!collapsed && (
          <div
            className="border-t px-3 pt-3 pb-1"
            style={{ borderColor: "var(--color-border)" }}
          >
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 px-1">
              Appearance
            </p>
            <div className="flex gap-1" role="group" aria-label="Theme selection">
              {(
                [
                  { id: "default", label: "Dark", icon: "🌙" },
                  { id: "light", label: "Light", icon: "☀️" },
                  { id: "high-contrast", label: "High contrast", icon: "◑" },
                  { id: "reduced", label: "Reduced motion", icon: "—" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  aria-label={`Switch to ${t.label} theme`}
                  aria-pressed={theme === t.id}
                  title={t.label}
                  className={`flex-1 flex items-center justify-center py-1.5 rounded-lg text-sm transition-colors min-touch ${
                    theme === t.id
                      ? "bg-brand-600/30 text-brand-300"
                      : "text-slate-500 hover:text-slate-300 hover:bg-surface-overlay/50"
                  }`}
                >
                  <span aria-hidden="true">{t.icon}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Collapse + Sign Out */}
        <div
          className="border-t p-3 space-y-1"
          style={{ borderColor: "var(--color-border)" }}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-surface-overlay/50 w-full min-touch"
          >
            <ChevronLeft
              size={18}
              className={`transition-transform ${collapsed ? "rotate-180" : ""}`}
            />
            {!collapsed && <span>Collapse</span>}
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-900/20 w-full min-touch"
          >
            <LogOut size={18} />
            {!collapsed && <span>Sign out</span>}
          </button>
          {!collapsed && (
            <a
              href="https://ko-fi.com/bra11y"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] text-slate-500 hover:text-slate-300 hover:underline transition-colors w-full"
            >
              <span aria-hidden="true">☕</span>
              <span>Buy me a coffee</span>
            </a>
          )}
        </div>
      </nav>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile top bar */}
        <div
          className="md:hidden flex items-center gap-3 px-4 py-3 bg-surface-raised border-b flex-shrink-0"
          style={{ borderColor: "var(--color-border)" }}
        >
          <button
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation menu"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-surface-overlay"
          >
            <Menu size={20} />
          </button>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <ScanLine size={14} className="text-white" />
          </div>
          <span className="font-display text-sm font-bold text-slate-50">AccessiScan</span>
        </div>

        <main id="main-content" className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
