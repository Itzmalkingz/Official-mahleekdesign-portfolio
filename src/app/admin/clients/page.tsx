"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { Client } from "@/lib/types";
import { PageHead, Badge, EmptyState, SkeletonRows, MigrateBadge, ConfirmDialog, Field, timeAgo } from "@/components/admin/ui";
import { IconUsers, IconPlus, IconTrash, IconMail } from "@/components/admin/icons";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrated, setMigrated] = useState<boolean | null>(null);
  const [deleting, setDeleting] = useState<Client | null>(null);
  const [adding, setAdding] = useState(false);

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) setMigrated(false);
      else setMigrated(true);
      setClients((data ?? []) as Client[]);
      setLoading(false);
    })();
  }, []);

  const addClient = async () => {
    if (!name.trim()) return toast.error("Name is required");
    const { data, error } = await supabase
      .from("clients")
      .insert({ name: name.trim(), company: company.trim() || null, email: email.trim() || null, notes: notes.trim() || null, status: "lead" })
      .select()
      .single();
    if (error) {
      toast.error(error.message.includes("clients") ? "Clients table not ready — run the Phase 1 migration." : error.message);
      return;
    }
    setClients((prev) => [data as Client, ...prev]);
    setName(""); setCompany(""); setEmail(""); setNotes(""); setAdding(false);
    await supabase.from("activity_logs").insert({ action: "added client", entity_type: "client", entity_title: name.trim() });
    toast.success("Client added");
  };

  const setStatus = async (c: Client, status: Client["status"]) => {
    const { error } = await supabase.from("clients").update({ status }).eq("id", c.id);
    if (!error) setClients((prev) => prev.map((x) => (x.id === c.id ? { ...x, status } : x)));
  };

  const remove = async () => {
    if (!deleting) return;
    const { error } = await supabase.from("clients").delete().eq("id", deleting.id);
    if (!error) {
      setClients((prev) => prev.filter((x) => x.id !== deleting.id));
      toast.success("Client removed");
    } else toast.error(error.message);
    setDeleting(null);
  };

  return (
    <>
      <PageHead
        title="Clients"
        sub="People and businesses you work with"
        actions={
          <button className="ac-btn primary" onClick={() => setAdding((v) => !v)}>
            <IconPlus size={15} /> Add client
          </button>
        }
      />

      {migrated === false && <MigrateBadge />}

      {adding && (
        <div className="ac-card" style={{ marginBottom: "1.25rem", padding: "1.25rem" }} data-ash-reveal>
          <div className="ac-field-grid">
            <Field label="Name" hint="(required)">
              <input className="ac-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
            </Field>
            <Field label="Company">
              <input className="ac-input" value={company} onChange={(e) => setCompany(e.target.value)} />
            </Field>
            <Field label="Email">
              <input className="ac-input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
          </div>
          <Field label="Notes">
            <textarea className="ac-textarea" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <button className="ac-btn primary" onClick={addClient}>Add client</button>
            <button className="ac-btn" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="ac-card">
        <div className="ac-table-wrap">
          {loading ? (
            <SkeletonRows rows={6} cols={5} />
          ) : clients.length === 0 ? (
            <EmptyState
              icon={<IconUsers size={26} />}
              title="No clients yet"
              sub="Clients are created from enquiries or added manually."
              action={
                <button className="ac-btn primary" onClick={() => setAdding(true)}>
                  <IconPlus size={14} /> Add first client
                </button>
              }
            />
          ) : (
            <table className="ac-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Added</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="row-title">{c.name}</div>
                      <div className="row-sub">
                        {c.email ? (
                          <a href={`mailto:${c.email}`} style={{ color: "var(--ablue)", textDecoration: "none" }}>
                            {c.email}
                          </a>
                        ) : (
                          "no email"
                        )}
                      </div>
                    </td>
                    <td>{c.company || "—"}</td>
                    <td>
                      <select
                        className="ac-select"
                        style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", width: "auto" }}
                        value={c.status}
                        onChange={(e) => setStatus(c, e.target.value as Client["status"])}
                      >
                        <option value="active">Active</option>
                        <option value="lead">Lead</option>
                        <option value="past">Past</option>
                      </select>
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "var(--aslate)" }}>{timeAgo(c.created_at)}</td>
                    <td>
                      <div className="ac-row-actions">
                        {c.email && (
                          <a href={`mailto:${c.email}`} className="ac-btn sm ghost">
                            <IconMail size={14} />
                          </a>
                        )}
                        <button className="ac-btn sm ghost danger" onClick={() => setDeleting(c)}>
                          <IconTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleting}
        title="Remove client?"
        message={`“${deleting?.name}” will be removed. Their linked works stay intact.`}
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
      />
    </>
  );
}