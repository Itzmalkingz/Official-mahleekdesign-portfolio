"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { PageHead, Field, MigrateBadge } from "@/components/admin/ui";
import { IconSettings, IconCheck } from "@/components/admin/icons";

type Section = {
  key: string;
  title: string;
  fields: Record<string, string>;
};

const EMPTY: Section[] = [
  { key: "general", title: "General", fields: { site_name: "", site_url: "", description: "" } },
  { key: "contact", title: "Contact", fields: { email: "", phone: "", whatsapp: "", location: "" } },
  { key: "social", title: "Social", fields: { github: "", twitter: "", instagram: "", linkedin: "" } },
  { key: "booking", title: "Booking", fields: { enabled: "", confirmation_message: "" } },
];

export default function SettingsPage() {
  const [sections, setSections] = useState<Section[]>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [ready, setReady] = useState<boolean | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const keys = EMPTY.map((s) => s.key);
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .in("key", keys);
      if (error) setReady(false);
      else {
        setReady(true);
        setSections((prev) =>
          prev.map((s) => {
            const row = (data ?? []).find((r) => r.key === s.key);
            return row
              ? { ...s, fields: { ...s.fields, ...(row.value as Record<string, string>) } }
              : s;
          })
        );
      }
      setLoaded(true);
    })();
  }, []);

  const setField = (key: string, field: string, value: string) =>
    setSections((prev) =>
      prev.map((s) =>
        s.key === key ? { ...s, fields: { ...s.fields, [field]: value } } : s
      )
    );

  const save = async (section: Section) => {
    setBusyKey(section.key);
    const { error } = await supabase
      .from("settings")
      .upsert({ key: section.key, value: section.fields }, { onConflict: "key" });
    if (error) {
      toast.error(
        error.message.includes("settings") ? "Settings table not ready — run the Phase 1 migration." : error.message
      );
    } else {
      await supabase.from("activity_logs").insert({ action: `updated settings · ${section.key}`, entity_type: "settings" });
      toast.success(`${section.title} saved`);
    }
    setBusyKey(null);
  };

  return (
    <>
      <PageHead title="Settings" sub="Studio configuration stored in Supabase" />

      {!loaded && <div className="ac-card"><div className="ac-card-pad">Loading…</div></div>}
      {loaded && ready === false && <MigrateBadge />}

      {loaded && (
        <div style={{ display: "grid", gap: "1.25rem", maxWidth: 820 }}>
          {sections.map((section) => (
            <div className="ac-card" key={section.key}>
              <div className="ac-card-head">
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                  <IconSettings size={15} /> {section.title}
                </span>
                <button className="ac-btn sm" onClick={() => save(section)} disabled={busyKey === section.key}>
                  <IconCheck size={13} style={{ color: "var(--agreen)" }} /> {busyKey === section.key ? "Saving…" : "Save"}
                </button>
              </div>
              <div className="ac-card-pad">
                <div className="ac-field-grid">
                  {Object.entries(section.fields).map(([field, value]) => (
                    <Field key={field} label={field.replaceAll("_", " ")}>
                      <input
                        className="ac-input"
                        value={value}
                        onChange={(e) => setField(section.key, field, e.target.value)}
                        placeholder={field === "enabled" ? "true / false" : ""}
                      />
                    </Field>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <p style={{ fontSize: "0.78rem", color: "var(--aslate)" }}>
            Note: write access to settings is restricted to admins by database policy.
          </p>
        </div>
      )}
    </>
  );
}