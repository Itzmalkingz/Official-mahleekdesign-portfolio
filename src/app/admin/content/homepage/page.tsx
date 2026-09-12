"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { PageHead, Field, MigrateBadge } from "@/components/admin/ui";
import { IconHome, IconCheck } from "@/components/admin/icons";

const DEFAULTS = {
  hero_heading: "",
  hero_description: "",
  cta_primary: "Start a Project",
  cta_secondary: "View Work",
};

export default function ContentHomepagePage() {
  const [values, setValues] = useState(DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const [ready, setReady] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof DEFAULTS) => (e: ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("settings").select("value").eq("key", "homepage").single();
      if (error) setReady(false);
      else {
        setReady(true);
        setValues({ ...DEFAULTS, ...(data.value as Record<string, string>) });
      }
      setLoaded(true);
    })();
  }, []);

  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from("settings").upsert(
      { key: "homepage", value: values },
      { onConflict: "key" }
    );
    if (error) {
      toast.error(error.message.includes("settings") ? "Settings table not ready — run the Phase 1 migration." : error.message);
      setBusy(false);
      return;
    }
    await supabase.from("activity_logs").insert({ action: "updated homepage copy", entity_type: "settings" });
    toast.success("Homepage copy saved");
    setBusy(false);
  };

  return (
    <>
      <PageHead
        title="Homepage"
        sub="Hero and call-to-action copy"
        actions={
          <button className="ac-btn primary" onClick={save} disabled={busy}>
            <IconCheck size={15} /> {busy ? "Saving…" : "Save"}
          </button>
        }
      />

      {!loaded && <div className="ac-card"><div className="ac-card-pad">Loading…</div></div>}
      {loaded && ready === false && <MigrateBadge />}

      {loaded && (
        <div className="ac-card" style={{ maxWidth: 720, padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--aslate)", fontSize: "0.8rem", marginBottom: "1rem" }}>
            <IconHome size={15} />
            These values are managed here for the studio; wiring them into the public homepage renderer is part of the rollout.
          </div>
          <Field label="Hero heading">
            <input className="ac-input" value={values.hero_heading} onChange={set("hero_heading")} placeholder="e.g. Memorable brands. Purposeful web systems." />
          </Field>
          <Field label="Hero description">
            <input className="ac-input" value={values.hero_description} onChange={set("hero_description")} />
          </Field>
          <div className="ac-field-grid">
            <Field label="Primary CTA">
              <input className="ac-input" value={values.cta_primary} onChange={set("cta_primary")} />
            </Field>
            <Field label="Secondary CTA">
              <input className="ac-input" value={values.cta_secondary} onChange={set("cta_secondary")} />
            </Field>
          </div>
        </div>
      )}
    </>
  );
}