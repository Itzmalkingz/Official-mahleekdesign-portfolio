"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { Appointment } from "@/lib/types";
import { PageHead, Badge, EmptyState, SkeletonRows, MigrateBadge, timeAgo } from "@/components/admin/ui";
import { IconCalendar, IconMail, IconCheck } from "@/components/admin/icons";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrated, setMigrated] = useState<boolean | null>(null);
  const [scope, setScope] = useState<"upcoming" | "past" | "all">("upcoming");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true })
        .limit(300);
      if (error) setMigrated(false);
      else setMigrated(true);
      setAppointments((data ?? []) as Appointment[]);
      setLoading(false);
    })();
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const shown = appointments
    .filter((a) => {
      const d = a.appointment_date ?? "9999-12-31";
      if (scope === "upcoming") return d >= today && !["completed", "cancelled", "no-show", "rejected"].includes(a.status);
      if (scope === "past") return d < today || ["completed", "cancelled", "no-show", "rejected"].includes(a.status);
      return true;
    })
    .sort((a, b) => (a.appointment_date ?? "").localeCompare(b.appointment_date ?? ""));

  const setStatus = async (a: Appointment, status: Appointment["status"]) => {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", a.id);
    if (error) return toast.error(error.message);
    setAppointments((prev) => prev.map((x) => (x.id === a.id ? { ...x, status } : x)));
    await supabase.from("activity_logs").insert({ action: `appointment ${status}`, entity_type: "appointment", entity_title: a.name });
    toast.success(`Marked ${status}`);
  };

  const dayLabel = (iso?: string | null) =>
    iso ? `${DAYS[new Date(iso + "T00:00:00").getDay()]}, ${new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : "TBD";

  return (
    <>
      <PageHead
        title="Appointments"
        sub="Booking requests and scheduled sessions"
        actions={
          <>
            {(["upcoming", "past", "all"] as const).map((s) => (
              <button key={s} className={`ac-btn sm ${scope === s ? "primary" : ""}`} onClick={() => setScope(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </>
        }
      />

      {migrated === false && <MigrateBadge />}

      <div className="ac-card">
        <div className="ac-table-wrap">
          {loading ? (
            <SkeletonRows rows={7} cols={5} />
          ) : shown.length === 0 ? (
            <EmptyState
              icon={<IconCalendar size={26} />}
              title="No appointments here"
              sub="Booking requests from the site land in this table."
            />
          ) : (
            <table className="ac-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Who</th>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Requested</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {shown.map((a) => (
                  <tr key={a.id}>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <div className="row-title">{dayLabel(a.appointment_date)}</div>
                      <div className="row-sub">{a.appointment_time ? a.appointment_time.slice(0, 5) : "time TBD"} · {a.duration_minutes}min</div>
                    </td>
                    <td>
                      <div className="row-title">{a.name}</div>
                      <div className="row-sub">
                        <a href={`mailto:${a.email}`} style={{ color: "var(--ablue)", textDecoration: "none" }}>{a.email}</a>
                        {a.company ? ` · ${a.company}` : ""}
                      </div>
                    </td>
                    <td style={{ fontSize: "0.8rem" }}>{a.project_type || "—"}</td>
                    <td>
                      <select
                        className="ac-select"
                        style={{
                          padding: "0.25rem 0.5rem",
                          fontSize: "0.75rem",
                          width: "auto",
                          fontWeight: 600,
                          color:
                            a.status === "confirmed" ? "var(--agreen)" :
                            a.status === "pending" ? "var(--aamber)" :
                            a.status === "completed" ? "var(--ablue)" : "var(--aslate)",
                        }}
                        value={a.status}
                        onChange={(e) => setStatus(a, e.target.value as Appointment["status"])}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no-show">No-show</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "var(--aslate)" }}>{timeAgo(a.created_at)}</td>
                    <td>
                      <div className="ac-row-actions">
                        <a href={`mailto:${a.email}`} className="ac-btn sm ghost">
                          <IconMail size={14} />
                        </a>
                        {a.status === "pending" && (
                          <button className="ac-btn sm ghost" onClick={() => setStatus(a, "confirmed")} title="Confirm">
                            <IconCheck size={14} style={{ color: "var(--agreen)" }} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="ac-pager"><span>{shown.length} shown</span></div>
      </div>
    </>
  );
}