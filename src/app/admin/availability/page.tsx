"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { Availability } from "@/lib/types";
import { PageHead, Field, MigrateBadge } from "@/components/admin/ui";
import { IconClock, IconCheck } from "@/components/admin/icons";

const WORKDAYS = [
  { v: 0, label: "Sun" },
  { v: 1, label: "Mon" },
  { v: 2, label: "Tue" },
  { v: 3, label: "Wed" },
  { v: 4, label: "Thu" },
  { v: 5, label: "Fri" },
  { v: 6, label: "Sat" },
];

export default function AvailabilityPage() {
  const [row, setRow] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(true);
  const [migrated, setMigrated] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [slot, setSlot] = useState(30);
  const [buffer, setBuffer] = useState(15);
  const [maxPerDay, setMaxPerDay] = useState(5);
  const [timezone, setTimezone] = useState("Africa/Lagos");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("availability")
        .select("*")
        .eq("id", 1)
        .single();
      if (error) setMigrated(false);
      else if (data) {
        const a = data as Availability;
        setRow(a);
        setDays(a.working_days);
        setStart(a.start_time?.slice(0, 5) ?? "09:00");
        setEnd(a.end_time?.slice(0, 5) ?? "17:00");
        setSlot(a.slot_duration_minutes);
        setBuffer(a.buffer_minutes);
        setMaxPerDay(a.max_bookings_per_day);
        setTimezone(a.timezone);
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setBusy(true);
    const payload = {
      working_days: days.length ? days : [1, 2, 3, 4, 5],
      start_time: start,
      end_time: end,
      slot_duration_minutes: Number(slot) || 30,
      buffer_minutes: Number(buffer) || 0,
      max_bookings_per_day: Number(maxPerDay) || 5,
      timezone: timezone.trim() || "Africa/Lagos",
    };
    if (row) {
      const { error } = await supabase.from("availability").update(payload).eq("id", 1);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("availability").insert({ id: 1, ...payload });
      if (error) return toast.error(error.message.includes("availability") ? "Availability table not ready — run the Phase 1 migration." : error.message);
    }
    await supabase.from("activity_logs").insert({ action: "updated availability" });
    toast.success("Availability saved");
    setBusy(false);
  };

  const toggleDay = (v: number) =>
    setDays((prev) => (prev.includes(v) ? prev.filter((d) => d !== v) : [...prev, v].sort()));

  if (loading) {
    return (
      <>
        <PageHead title="Availability" sub="Booking rules" />
        <div className="ac-card">Loading…</div>
      </>
    );
  }

  return (
    <>
      <PageHead
        title="Availability"
        sub="When you accept bookings and how they're structured"
        actions={
          <button className="ac-btn primary" onClick={save} disabled={busy}>
            <IconCheck size={15} /> {busy ? "Saving…" : "Save changes"}
          </button>
        }
      />

      {migrated === false && <MigrateBadge />}

      <div className="ac-card" style={{ maxWidth: 720, padding: "1.25rem" }}>
        <Field label="Working days">
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {WORKDAYS.map((d) => (
              <button
                key={d.v}
                className={`ac-btn sm ${days.includes(d.v) ? "primary" : ""}`}
                onClick={() => toggleDay(d.v)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </Field>

        <div className="ac-field-grid">
          <Field label="Start time">
            <input className="ac-input" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
          </Field>
          <Field label="End time">
            <input className="ac-input" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
          </Field>
          <Field label="Slot length (min)">
            <input className="ac-input" type="number" value={slot} onChange={(e) => setSlot(Number(e.target.value))} />
          </Field>
          <Field label="Buffer (min)">
            <input className="ac-input" type="number" value={buffer} onChange={(e) => setBuffer(Number(e.target.value))} />
          </Field>
          <Field label="Max bookings / day">
            <input className="ac-input" type="number" value={maxPerDay} onChange={(e) => setMaxPerDay(Number(e.target.value))} />
          </Field>
          <Field label="Timezone">
            <input className="ac-input" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
          </Field>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem", fontSize: "0.8rem", color: "var(--aslate)" }}>
          <IconClock size={15} />
          The public booking widget will honor these rules once the migration and widget ship.
        </div>
      </div>
    </>
  );
}