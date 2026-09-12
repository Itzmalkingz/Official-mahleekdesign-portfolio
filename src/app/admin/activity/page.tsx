"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { ActivityLog } from "@/lib/types";
import { PageHead, EmptyState, SkeletonRows, MigrateBadge, timeAgo } from "@/components/admin/ui";
import { IconActivity, IconSearch } from "@/components/admin/icons";

const PAGE_SIZE = 20;

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrated, setMigrated] = useState<boolean | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) setMigrated(false);
      else setMigrated(true);
      setLogs((data ?? []) as ActivityLog[]);
      setLoading(false);
    })();
  }, []);

  const filtered = logs.filter((l) =>
    !query || `${l.action} ${l.actor_email ?? ""} ${l.entity_title ?? ""}`.toLowerCase().includes(query.toLowerCase())
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <>
      <PageHead title="Activity" sub="Every meaningful change, time-stamped" />

      {migrated === false && <MigrateBadge />}

      <div className="ac-toolbar">
        <div className="ac-search">
          <IconSearch size={15} />
          <input className="ac-input" placeholder="Search action, email, title…" value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} />
        </div>
      </div>

      <div className="ac-card">
        {loading ? (
          <SkeletonRows rows={10} cols={3} />
        ) : pageItems.length === 0 ? (
          <EmptyState
            icon={<IconActivity size={26} />}
            title={logs.length === 0 ? "No activity yet" : "No matches"}
            sub={logs.length === 0 ? "Changes made across the console are logged here." : "Try a different search."}
          />
        ) : (
          <div>
            {pageItems.map((l) => (
              <div
                key={l.id}
                style={{
                  display: "flex",
                  gap: "0.9rem",
                  padding: "0.85rem 1.25rem",
                  borderBottom: "1px solid var(--aline-soft)",
                  alignItems: "flex-start",
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
                    background: "var(--apaper-2)",
                    color: "var(--aslate)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  {(l.entity_type ?? "sys").slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.86rem" }}>
                    <b>{l.actor_email?.split("@")[0] || "system"}</b>
                    <span style={{ color: "var(--aslate)" }}> {l.action}</span>
                    {l.entity_title && <b> · {l.entity_title}</b>}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#93a2b4", marginTop: "0.15rem" }}>
                    {l.entity_type ? `${l.entity_type} · ` : ""}
                    {new Date(l.created_at).toLocaleString()}
                  </div>
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--aslate)", flex: "none" }}>{timeAgo(l.created_at)}</span>
              </div>
            ))}
            <div className="ac-pager">
              <span>{filtered.length} logged events</span>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <button className="ac-btn sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>← Prev</button>
                <span style={{ fontSize: "0.8rem", color: "var(--aslate)" }}>{page + 1} / {pages}</span>
                <button className="ac-btn sm" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>Next →</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}