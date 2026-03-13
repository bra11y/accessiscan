"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  ScanLine,
  AlertTriangle,
  Eye,
  Users,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronLeft,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/scan", label: "Scan", icon: ScanLine },
  { href: "/issues", label: "Issues", icon: AlertTriangle },
  { href: "/vision", label: "Vision Sim", icon: Eye },
  { href: "/reviews", label: "Human Review", icon: Users },
  { href: "/compliance", label: "Compliance", icon: ShieldCheck },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface">
      {/* ─── Sidebar ─── */}
      <nav
        aria-label="Main navigation"
        className="flex flex-col bg-surface-raised border-r transition-all duration-200"
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
            <div>
              <p className="font-display text-sm font-bold text-slate-50 leading-tight">
                AccessiScan
              </p>
              <p className="text-[10px] text-brand-400 font-semibold uppercase tracking-widest">
                Pro Dashboard
              </p>
            </div>
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
                {!collapsed && item.label === "Issues" && (
                  <span className="ml-auto bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    5
                  </span>
                )}
                {!collapsed && item.label === "Human Review" && (
                  <span className="ml-auto bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    4
                  </span>
                )}
              </Link>
            );
          })}
        </div>

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
        </div>
      </nav>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main id="main-content" className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
