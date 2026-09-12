"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import { supabase } from "@/lib/supabase/client";
import type { Notification } from "@/lib/types";
import {
  IconDashboard,
  IconFolder,
  IconPlus,
  IconInbox,
  IconUsers,
  IconKanban,
  IconCalendar,
  IconClock,
  IconLayers,
  IconQuote,
  IconHome,
  IconImage,
  IconActivity,
  IconShield,
  IconSettings,
  IconSearch,
  IconBell,
  IconMenu,
  IconClose,
  IconLogOut,
  IconExternal,
} from "./icons";

interface ShellProps {
  profile: {
    email: string;
    full_name?: string | null;
    role: string;
    avatar_url?: string | null;
  };
  children: React.ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: "Overview",
    items: [{ href: "/admin/dashboard", label: "Dashboard", icon: <IconDashboard size={17} /> }],
  },
  {
    section: "Work",
    items: [
      { href: "/admin/projects", label: "Projects", icon: <IconFolder size={17} /> },
      { href: "/admin/projects/new", label: "New Project", icon: <IconPlus size={17} /> },
    ],
  },
  {
    section: "Leads",
    items: [
      { href: "/admin/enquiries", label: "Enquiries", icon: <IconInbox size={17} /> },
      { href: "/admin/clients", label: "Clients", icon: <IconUsers size={17} /> },
      { href: "/admin/pipeline", label: "Pipeline", icon: <IconKanban size={17} /> },
    ],
  },
  {
    section: "Bookings",
    items: [
      { href: "/admin/appointments", label: "Appointments", icon: <IconCalendar size={17} /> },
      { href: "/admin/availability", label: "Availability", icon: <IconClock size={17} /> },
    ],
  },
  {
    section: "Content",
    items: [
      { href: "/admin/content/services", label: "Services", icon: <IconLayers size={17} /> },
      { href: "/admin/content/testimonials", label: "Testimonials", icon: <IconQuote size={17} /> },
      { href: "/admin/content/homepage", label: "Homepage", icon: <IconHome size={17} /> },
      { href: "/admin/media", label: "Media", icon: <IconImage size={17} /> },
    ],
  },
  {
    section: "System",
    items: [
      { href: "/admin/activity", label: "Activity", icon: <IconActivity size={17} /> },
      { href: "/admin/users", label: "Users", icon: <IconShield size={17} /> },
      { href: "/admin/settings", label: "Settings", icon: <IconSettings size={17} /> },
    ],
  },
];

const CMD_ITEMS = NAV.flatMap((g) => g.items).map((n) => ({
  ...n,
  type: "page" as const,
}));

const QUICK_ACTIONS = [
  { label: "New Project", href: "/admin/projects/new", icon: <IconPlus size={16} /> },
  { label: "View Site", href: "/", icon: <IconExternal size={16} /> },
];

export default function AdminShell({ profile, children }: ShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  const bare = pathname === "/admin/login" || pathname === "/admin/no-access";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [cmdIdx, setCmdIdx] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notif, setNotif] = useState<Notification[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const cmdRef = useRef<HTMLInputElement>(null);
  const cmdListRef = useRef<HTMLDivElement>(null);
  const cmdItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /* Close mobile sidebar on nav */
  useEffect(() => setSidebarOpen(false), [pathname]);

  /* Notifications */
  useEffect(() => {
    if (bare) return;
    (async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id, type, title, message, link, read, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      setNotif(data ?? []);
    })();
  }, []);

  const unread = notif.filter((n) => !n.read).length;

  const markAllRead = useCallback(async () => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("read", false);
    setNotif((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  /* Command palette */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
        setCmdQuery("");
        setCmdIdx(0);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const cmdResults = [
    ...CMD_ITEMS.filter((n) =>
      n.label.toLowerCase().includes(cmdQuery.toLowerCase())
    ),
    ...QUICK_ACTIONS.filter(
      (a) =>
        a.label.toLowerCase().includes(cmdQuery.toLowerCase()) &&
        !CMD_ITEMS.some((m) => m.href === a.href)
    ),
  ];

  useEffect(() => {
    if (!cmdOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCmdOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setCmdIdx((prev) => Math.min(prev + 1, cmdResults.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setCmdIdx((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && cmdResults[cmdIdx]) {
        setCmdOpen(false);
        router.push(cmdResults[cmdIdx].href);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [cmdOpen, cmdIdx, cmdResults, router]);

  useEffect(() => {
    if (cmdOpen) setTimeout(() => cmdRef.current?.focus(), 20);
  }, [cmdOpen]);

  useEffect(() => {
    cmdListRef.current
      ?.querySelector(`[data-cmd="${cmdIdx}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [cmdIdx]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (bare)
    return (
      <>
        <Toaster position="top-right" containerStyle={{ zIndex: 200 }} />
        {children}
      </>
    );

  const initials = (profile.email || "M").slice(0, 1).toUpperCase();

  return (
    <>
      <Toaster position="top-right" containerStyle={{ zIndex: 200 }} />
      {/* Overlay + Sidebar */}
      {sidebarOpen && (
        <div
          className="ash-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`ash-sidebar ${sidebarOpen ? "open" : ""}`}>
        <Link href="/admin/dashboard" className="ash-brand">
          <img src="/images/favicon/branding-module-1.png" alt="" />
          <span className="ash-brand-name">
            Mahleek<span className="ash-brand-sub">Studio</span>
          </span>
        </Link>

        <nav className="ash-nav">
          {NAV.map((group) => (
            <div key={group.section}>
              <div className="ash-nav-group-label">{group.section}</div>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={pathname === item.href ? "active" : ""}
                >
                  {item.icon}
                  {item.label}
                  {typeof item.count === "number" && item.count > 0 && (
                    <span className="ash-nav-count">{item.count}</span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="ash-sidebar-foot">
          <Link href="/" target="_blank" rel="noopener noreferrer">
            <IconExternal size={15} /> View Site
          </Link>
        </div>
      </aside>

      <div className="ash-main">
        {/* Topbar */}
        <header className="ash-topbar">
          <button
            className="ash-icon-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <IconMenu size={18} />
          </button>

          <button
            className="ash-command-hint"
            onClick={() => setCmdOpen(true)}
          >
            <IconSearch size={15} />
            Search…
            <kbd>⌘K</kbd>
          </button>

          <div className="ash-topbar-actions">
            {/* Notifications */}
            <div style={{ position: "relative" }}>
              <button
                className="ash-icon-btn"
                onClick={() => {
                  setNotifOpen((prev) => !prev);
                  setMenuOpen(false);
                }}
                aria-label="Notifications"
              >
                <IconBell size={18} />
                {unread > 0 && <span className="dot" />}
              </button>

              {notifOpen && (
                <div className="ash-pop" role="menu">
                  <div className="ash-pop-head">
                    Notifications
                    {unread > 0 && (
                      <button
                        className="ac-btn sm ghost"
                        onClick={() => {
                          markAllRead();
                          setNotifOpen(false);
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="ash-pop-scroll">
                    {notif.length === 0 && (
                      <div className="ac-empty" style={{ padding: "2rem" }}>
                        <div className="ttl">No notifications yet</div>
                      </div>
                    )}
                    {notif.map((n) => (
                      <div
                        key={n.id}
                        className={`ash-notif-item ${!n.read ? "unread" : ""}`}
                        role="menuitem"
                        onClick={() => {
                          if (n.link) router.push(n.link);
                          setNotifOpen(false);
                        }}
                      >
                        <div className="ash-notif-icon">
                          <IconInbox size={15} />
                        </div>
                        <div className="ash-notif-body">
                          <div className="t">{n.title}</div>
                          {n.message && <div className="m">{n.message}</div>}
                          <div className="ts">
                            {new Date(n.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div style={{ position: "relative" }}>
              <button
                className="ash-user"
                onClick={() => {
                  setMenuOpen((prev) => !prev);
                  setNotifOpen(false);
                }}
                aria-label="Account"
              >
                <div className="ash-avatar">{initials}</div>
                <div className="ash-user-meta">
                  <span className="name">
                    {profile.full_name || profile.email}
                  </span>
                  <span className="role">{profile.role}</span>
                </div>
              </button>

              {menuOpen && (
                <div className="ash-pop ash-menu" role="menu">
                  <button onClick={() => { router.push("/admin/settings"); setMenuOpen(false); }}>
                    <IconSettings size={16} /> Settings
                  </button>
                  <button onClick={handleSignOut} className="danger">
                    <IconLogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="ash-content">{children}</main>
      </div>

      {/* Command palette */}
      {cmdOpen && (
        <div
          className="cp-overlay"
          role="dialog"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCmdOpen(false);
          }}
        >
          <div className="cp-panel">
            <div className="cp-input-row">
              <IconSearch size={17} />
              <input
                ref={cmdRef}
                value={cmdQuery}
                onChange={(e) => {
                  setCmdQuery(e.target.value);
                  setCmdIdx(0);
                }}
                placeholder="Navigate or run action…"
                aria-label="Command palette"
              />
              <kbd
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  border: "1px solid var(--aline)",
                  background: "var(--apaper)",
                  borderRadius: 4,
                  padding: "0.05rem 0.35rem",
                  color: "var(--aslate)",
                }}
              >
                ESC
              </kbd>
            </div>

            <div className="cp-scroll" ref={cmdListRef}>
              {cmdResults.length === 0 && (
                <div className="cp-empty">No matching actions.</div>
              )}

              <div className="cp-group-label">Pages</div>
              {cmdResults.map((item, i) => (
                <button
                  key={item.href}
                  ref={(el) => { cmdItemRefs.current[i] = el; }}
                  className={`cp-item ${i === cmdIdx ? "hl" : ""}`}
                  data-cmd={i}
                  onMouseEnter={() => setCmdIdx(i)}
                  onClick={() => {
                    setCmdOpen(false);
                    router.push(item.href);
                  }}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}