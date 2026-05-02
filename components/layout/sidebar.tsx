"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import Avatar from "@/components/ui/avatar";
import Icon from "@/components/ui/icon";
import type { User } from "@/lib/types";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  roles?: string[];
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/cases", label: "Case Ledger", icon: "gavel" },
  { href: "/analytics", label: "Analytics", icon: "analytics" },
  {
    href: "/user-management",
    label: "User Management",
    icon: "manage_accounts",
    roles: ["super_admin", "admin"],
  },
  {
    href: "/tenant-management",
    label: "Tenant Management",
    icon: "corporate_fare",
    roles: ["super_admin"],
  },
];

export default function Sidebar({
  currentUser,
  onLogout,
}: {
  currentUser: User | null;
  onLogout: () => void;
}) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter(
    (item) =>
      !item.roles || (currentUser && item.roles.includes(currentUser.role)),
  );

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low flex flex-col p-6 gap-2 z-40">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="font-heading font-bold text-xl text-primary-container tracking-tight">
          InsightHub
        </h1>
        <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1 opacity-60">
          Sovereign Archive
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1">
        {visibleItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 hover:translate-x-1 ${
                isActive
                  ? "bg-surface-container-lowest text-primary-container shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-lowest/50"
              }`}
            >
              <Icon name={item.icon} filled={isActive} />
              <span className="font-body text-sm font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto pt-6 border-t border-outline-variant/20">
        <Link
          href="/cases"
          className="w-full bg-gradient-to-r from-primary to-primary-container text-white py-3 rounded-md font-body text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Icon name="add" className="text-sm" />
          New Case
        </Link>

        {currentUser && (
          <div className="flex items-center gap-3 mt-6">
            <Avatar name={currentUser.name} size="md" />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-bold text-primary truncate">
                {currentUser.name}
              </span>
              <span className="text-[10px] uppercase text-on-surface-variant tracking-wider">
                {currentUser.role.replace("_", " ")}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="text-on-surface-variant hover:text-error transition-colors p-1 shrink-0"
              title="Sign out"
            >
              <Icon name="logout" className="text-lg" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
