"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { Enquiry } from "@/lib/types";
import { PageHead, EmptyState, MigrateBadge, StatusDot } from "@/components/admin/ui";
import { IconKanban, IconChevronDown, IconArrowLeft } from "@/components/admin/icons";

type Stage = Enquiry["status"];

const STAGES: { key: Stage; label: string }[] = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "discussion", label: "Discussion" },
  { key: "won", label: "Won" },
  { key: "closed", label: "Closed" },
];

const PRIORITY_DOT: Record<string, string> = { low: "gray", normal: "blue", high: "amber", urgent: "red" };

export default function PipelinePage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrated, setMigrated] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) setMigrated(false);
      else setMigrated(true);
      setEnquiries((data ?? []).filter((e: Enquiry) => !e.archived) as Enquiry[]);
      setLoading(false);
    })();
  }, []);

  const advance = async (e: Enquiry, dir: -1 | 1) => {
    const idx = STAGES.findIndex((s) => s.key === e.status);
    const next = STAGES[idx + dir];
    if (!next) return;
    const patch: Partial<Enquiry> = { status: next.key as Stage };
    if (next.key === "contacted") patch.last_contacted_at = new Date().toISOString();
    const { error } = await supabase.from("enquiries").update(patch).eq("id", e.id);
    if (error) return toast.error(error.message);
    setEnquiries((prev) => prev.map((x) => (x.id === e.id ? { ...x, status: next.key as Stage } : x)));
  };

  return (
    <>
      <PageHead title="Pipeline" sub="Drag-free kanban — move leads through stages" />

      {migrated === false && <MigrateBadge />}

      {loading ? (
        <div className="ac-card"><div className="ac-card-pad">Loading…</div></div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
            alignItems: "start",
          }}
        >
          {STAGES.map((stage) => {
            const items = enquiries.filter((e) => e.status === stage.key);
            return (
              <div key={stage.key} className="ac-card" style={{ overflow: "visible" }}>
                <div className="ac-card-head">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
                    <span className={`ac-status-dot ${stage.key === "won" ? "green" : stage.key === "closed" ? "gray" : stage.key === "contacted" ? "amber" : "blue"}`} />
                    {stage.label}
                  </span>
                  <span className="hint">{items.length}</span>
                </div>
                <div style={{ padding: "0.6rem 0.75rem", display: "grid", gap: "0.6rem", minHeight: 120 }}>
                  {items.length === 0 && (
                    <div style={{ fontSize: "0.78rem", color: "#b2bfce", textAlign: "center", padding: "1rem 0" }}>
                      Empty stage
                    </div>
                  )}
                  {items.map((e) => (
                    <div
                      key={e.id}
                      className="ac-card-pad"
                      style={{
                        padding: "0.75rem",
                        border: "1px solid var(--aline)",
                        background: "#fff",
                        borderRadius: 9,
                        cursor: "pointer",
                        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                      }}
                      onClick={() => (window.location.href = `/admin/enquiries/${e.id}`)}
                      onMouseEnter={(ev) => ((ev.currentTarget as HTMLElement).style.boxShadow = "var(--ashadow)")}
                      onMouseLeave={(ev) => ((ev.currentTarget as HTMLElement).style.boxShadow = "none")}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <StatusDot tone={PRIORITY_DOT[e.priority ?? "normal"]} />
                        <span style={{ fontWeight: 600, fontSize: "0.82rem" }}>{e.name}</span>
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--aslate)", marginTop: "0.2rem" }}>
                        {e.project_type}
                        {e.budget ? ` · ${e.budget}` : ""}
                      </div>
                      <div style={{ display: "flex", gap: "0.25rem", marginTop: "0.6rem" }}>
                        <button
                          className="ac-btn sm ghost"
                          disabled={stage.key === "new"}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            advance(e, -1);
                          }}
                          title="Previous stage"
                        >
                          <IconArrowLeft size={13} />
                        </button>
                        <button
                          className="ac-btn sm ghost"
                          disabled={stage.key === "closed"}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            advance(e, 1);
                          }}
                          title="Next stage"
                        >
                          <IconChevronDown size={13} style={{ transform: "rotate(-90deg)" }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && enquiries.length === 0 && migrated !== false && (
        <div className="ac-card" style={{ marginTop: "1rem" }}>
          <EmptyState icon={<IconKanban size={26} />} title="Pipeline is empty" sub="New enquiries appear here, ready to be triaged." />
        </div>
      )}
    </>
  );
}