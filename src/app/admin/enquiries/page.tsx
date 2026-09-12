"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import type { Enquiry } from "@/lib/types";
import { PageHead, Badge, EmptyState, SkeletonRows, MigrateBadge, timeAgo, StatusDot } from "@/components/admin/ui";
import { IconSearch, IconInbox, IconMail } from "@/components/admin/icons";

const STATUS_TABS = ["all", "new", "contacted", "discussion", "won", "closed"] as const;
const PRIORITY_DOT: Record<string, string> = { low: "gray", normal: "blue", high: "amber", urgent: "red" };

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrated, setMigrated] = useState<boolean | null>(null);
  const [tab, setTab] = useState<(typeof STATUS_TABS)[number]>("new");
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState("all");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) setMigrated(false);
      else setMigrated(true);
      setEnquiries((data ?? []) as Enquiry[]);
      setLoading(false);
    })();
  }, []);

  const filtered = enquiries.filter((e) => {
    if (e.archived) return false;
    if (tab !== "all" && e.status !== tab) return false;
    if (priority !== "all" && (e.priority ?? "normal") !== priority) return false;
    if (query && !`${e.name} ${e.email} ${e.business ?? ""} ${e.message}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const counts: Record<string, number> = { all: 0, new: 0, contacted: 0, discussion: 0, won: 0, closed: 0 };
  for (const e of enquiries) {
    if (e.archived) continue;
    counts.all++;
    counts[e.status]++;
  }

  return (
    <>
      <PageHead
        title="Enquiries"
        sub="Leads from the contact form"
        actions={
          <a href="mailto:mahleekdesign@gmail.com" className="ac-btn ghost">
            <IconMail size={15} /> Studio inbox
          </a>
        }
      />

      {migrated === false && <MigrateBadge />}

      <div className="ac-toolbar" style={{ marginBottom: "1.1rem" }}>
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            className={`ac-btn sm ${tab === s ? "primary" : ""}`}
            onClick={() => setTab(s)}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            <span style={{ opacity: 0.75, fontWeight: 700 }}>{counts[s]}</span>
          </button>
        ))}
        <div className="spacer" />
        <div className="ac-search">
          <IconSearch size={15} />
          <input className="ac-input" placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select className="ac-select" style={{ width: 130 }} value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="all">Any priority</option>
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div className="ac-card">
        <div className="ac-table-wrap">
          {loading ? (
            <SkeletonRows rows={8} cols={5} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<IconInbox size={26} />}
              title={enquiries.length === 0 ? "No enquiries yet" : "No leads in this view"}
              sub={enquiries.length === 0 ? "When visitors submit the contact form, their messages appear here." : "Try a different status tab or search."}
            />
          ) : (
            <table className="ac-table">
              <thead>
                <tr>
                  <th>From</th>
                  <th>Project type</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Received</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} style={{ opacity: e.read_at ? 0.72 : 1 }}>
                    <td>
                      <div className="row-title" style={{ fontWeight: e.read_at ? 500 : 700 }}>
                        <Link href={`/admin/enquiries/${e.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                          {e.name}
                        </Link>
                        {!e.read_at && <span style={{ color: "var(--ablue)", marginLeft: "0.4rem" }}>●</span>}
                      </div>
                      <div className="row-sub">{e.email}{e.business ? ` · ${e.business}` : ""}</div>
                    </td>
                    <td style={{ fontSize: "0.82rem" }}>{e.project_type}</td>
                    <td><Badge value={e.status} /></td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "var(--aslate)" }}>
                        <StatusDot tone={PRIORITY_DOT[e.priority ?? "normal"]} />
                        {(e.priority ?? "normal").charAt(0).toUpperCase() + (e.priority ?? "normal").slice(1)}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "var(--aslate)" }}>{timeAgo(e.created_at)}</td>
                    <td>
                      <Link href={`/admin/enquiries/${e.id}`} className="ac-btn sm ghost">
                        Open →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="ac-pager">
          <span>{filtered.length} shown · {enquiries.length} total</span>
        </div>
      </div>
    </>
  );
}