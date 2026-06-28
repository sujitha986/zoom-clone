"use client";

import Link from "next/link";
import { CalendarDays, Home, Menu, MessageSquare, Search, Settings, UserRound, Users, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/schedule", label: "Meetings", icon: CalendarDays },
  { href: "/join", label: "Contacts", icon: Users },
  { href: "/dashboard", label: "Team Chat", icon: MessageSquare },
];

export function AppShell({
  children,
  searchValue = "",
  onSearchChange,
}: {
  children: React.ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function renderNavigation() {
    return (
      <>
      <nav className="side-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link className={`nav-link ${active ? "active" : ""}`} href={item.href} key={item.label}>
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <Link className="nav-link settings-link" href="/dashboard">
        <Settings size={20} />
        <span>Settings</span>
      </Link>
    </>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">z</span>
          <span>Zoom</span>
        </div>
        {renderNavigation()}
      </aside>
      <main className="main-area">
        <header className="topbar">
          <button
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            className="mobile-menu-button"
            onClick={() => setMobileOpen((open) => !open)}
            type="button"
          >
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
          <label className="search-box">
            <Search size={18} />
            <input
              aria-label="Search meetings"
              disabled={!onSearchChange}
              onChange={(event) => onSearchChange?.(event.target.value)}
              placeholder="Search meetings"
              value={searchValue}
            />
          </label>
          <div className="profile-chip">
            <UserRound size={18} />
            <span>Demo Host</span>
          </div>
        </header>
        {mobileOpen ? <div className="mobile-nav">{renderNavigation()}</div> : null}
        {children}
      </main>
    </div>
  );
}
