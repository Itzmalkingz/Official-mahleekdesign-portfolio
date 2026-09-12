"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import type { Enquiry, ActivityLog, Appointment } from "@/lib/types";
import {
  PageHead,
  StatCard,
  Badge,
  timeAgo,
  EmptyState,
  SkeletonRows,
  MigrateBadge,
} from "@/components/admin/ui";
import {
  IconFolder,
  IconInbox,
  IconBell,
  IconCalendar,
  IconPlus,
  IconExternal,
  IconActivity,
} from "@/components/admin/icons";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [migrated, setMigrated] = useState<boolean | null>(null);

  const [projects, setProjects] = useState(0);
  const [openEnquiries, setOpenEnquiries] = useState(0);
  const [unread, setUnread] = useState(0);
  const [upcoming, setUpcoming] = useState(0);

  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    (async () => {
      let ok = true;

      const { count: pCount, error: pErr } = await supabase
        .from("projects")
        .select("id", { count: "exact", head: true });
      if (pErr) { setMigrated(false); ok = false; } else if (migrated === null) setMigrated(true);
      setProjects(pCount ?? 0);

      const { count: eCount } = await supabase
        .from("enquiries")
        .select("id", { count: "exact", head: true })
        .in("status", ["new", "contacted", "discussion"]);
      setOpenEnquiries(eCount ?? 0);

      const { count: nCount } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("read", false);
      setUnread(nCount ?? 0);

      const today = new Date().toISOString().slice(0, 10);
      const { count: aCount } = await supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .in("status", ["pending", "confirmed"])
        .gte("appointment_date", today);
      setUpcoming(aCount ?? 0);

      const { data: enquires } = await supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentEnquiries((enquires ?? []) as Enquiry[]);

      const { data: apps } = await supabase
        .from("appointments")
        .select("*")
        .in("status", ["pending", "confirmed"])
        .gte("appointment_date", today)
        .order("appointment_date", { ascending: true })
        .limit(4);
      setAppointments((apps ?? []) as Appointment[]);

      const { data: logs } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);
      setActivity((logs ?? []) as ActivityLog[]);

      if (ok && migrated === null) setMigrated(true);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <>
        <PageHead title="Dashboard" sub="Studio at a glance" />
        <div className="ac-stat-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="ac-stat">
              <div className="ac-skel" style={{ width: 36, height: 36, borderRadius: 9, marginBottom: 14 }} />
              <div className="ac-skel" style={{ width: "55%", height: 24, marginBottom: 8 }} />
              <div className="ac-skel" style={{ width: "75%", height: 12 }} />
            </div>
          ))}
        </div>
        <div className="ac-card">
          <SkeletonRows rows={5} cols={4} />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHead
        title="Dashboard"
        sub={new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        actions={
          <>
            <Link href="/admin/projects/new" className="ac-btn primary">
              <IconPlus size={15} /> New Project
            </Link>
            <Link href="/" target="_blank" className="ac-btn ghost">
              <IconExternal size={15} /> View Site
            </Link>
          </>
        }
      />

      {migrated === false && <MigrateBadge />}

      <div className="ac-stat-grid">
        <StatCard icon={<IconFolder size={17} />} label="Published projects" value={projects} hint="Total in database" />
        <StatCard icon={<IconInbox size={17} />} label="Open enquiries" value={openEnquiries} hint="new · contacted · discussion" />
        <StatCard icon={<IconBell size={17} />} label="Unread alerts" value={unread} hint="Bell notifications" />
        <StatCard icon={<IconCalendar size={17} />} label="Upcoming" value={upcoming} hint="Pending + confirmed bookings" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr)",
          gap: "1.25rem",
          alignItems: "start",
        }}
      >
        {/* Recent enquiries */}
        <div className="ac-card">
          <div className="ac-card-head">
            Recent Enquiries
            <Link href="/admin/enquiries" className="hint" style={{ textDecoration: "none", color: "var(--ablue)" }}>
              View all →
            </Link>
          </div>
          {recentEnquiries.length === 0 ? (
            <EmptyState
              icon={<IconInbox size={26} />}
              title="No enquiries yet"
              sub="New contact form messages land here."
            />
          ) : (
            <>
              {recentEnquiries.map((e) => (
                <Link
                  key={e.id}
                  href={`/admin/enquiries/${e.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.8rem 1.25rem",
                    borderBottom: "1px solid var(--aline-soft)",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div
                    style={{
                      flex: "none",
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      display: "grid",
                      placeItems: "center",
                      background: "#e5eefc",
                      color: "var(--ablue)",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                    }}
                  >
                    {e.name[0]?.toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {e.name} <span style={{ color: "var(--aslate)", fontWeight: 500 }}>· {e.project_type}</span>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--aslate)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {e.message}
                    </div>
                  </div>
                  <Badge value={e.status} />
                  <span style={{ fontSize: "0.72rem", color: "#93a2b4", flex: "none" }}>{timeAgo(e.created_at)}</span>
                </Link>
              ))}
            </>
          )}
        </div>

        {/* Upcoming appointments */}
        <div className="ac-card">
          <div className="ac-card-head">
            Bookings
            <Link href="/admin/appointments" className="hint" style={{ textDecoration: "none", color: "var(--ablue)" }}>
              All →
            </Link>
          </div>
          {appointments.length === 0 ? (
            <EmptyState icon={<IconCalendar size={26} />} title="No upcoming" sub="Appointments due soon will appear here." />
          ) : (
            appointments.map((a) => (
              <div key={a.id} style={{ padding: "0.8rem 1.25rem", borderBottom: "1px solid var(--aline-soft)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{a.name}</span>
                  <span style={{ marginLeft: "auto" }}>
                    <Badge value={a.status} />
                  </span>
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--aslate)", marginTop: "0.2rem" }}>
                  {a.appointment_date
                    ? `${new Date(a.appointment_date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`
                    : "Date TBD"}
                  {a.appointment_time && ` · ${a.appointment_time.slice(0, 5)}`}
                  {a.project_type && ` · ${a.project_type}`}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Activity */}
        <div className="ac-card">
          <div className="ac-card-head">
            Activity
            <Link href="/admin/activity" className="hint" style={{ textDecoration: "none", color: "var(--ablue)" }}>
              All →
            </Link>
          </div>
          {activity.length === 0 ? (
            <EmptyState
              icon={<IconActivity size={26} />}
              title="Quiet so far"
              sub="Studio actions are logged here after the migration runs."
            />
          ) : (
            activity.map((a) => (
              <div key={a.id} style={{ display: "flex", gap: "0.7rem", padding: "0.7rem 1.25rem", borderBottom: "1px solid var(--aline-soft)" }}>
                <div
                  style={{
                    flex: "none",
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    marginTop: 6,
                    background: "var(--ablue-bright)",
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "0.82rem", lineHeight: 1.4 }}>
                    <b>{a.actor_email?.split("@")[0] || "system"}</b> {a.action}
                    {a.entity_title && <span> · {a.entity_title}</span>}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#93a2b4" }}>{timeAgo(a.created_at)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}