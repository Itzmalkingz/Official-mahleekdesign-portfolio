"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { Enquiry } from "@/lib/types";
import { PageHead, Badge, EmptyState, ConfirmDialog, Field } from "@/components/admin/ui";
import { IconArrowLeft, IconMail, IconTrash, IconCheck, IconUsers } from "@/components/admin/icons";

export default function EnquiryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const [status, setStatus] = useState<Enquiry["status"]>("new");
  const [priority, setPriority] = useState<Enquiry["priority"] | undefined>("normal");
  const [notes, setNotes] = useState("");
  const [nextFollowUp, setNextFollowUp] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("enquiries")
        .select("*")
        .eq("id", params.id)
        .single();
      if (data) {
        const e = data as Enquiry;
        setEnquiry(e);
        setStatus(e.status);
        setPriority(e.priority ?? "normal");
        setNotes(e.notes ?? "");
        setNextFollowUp(e.next_follow_up_at ? e.next_follow_up_at.slice(0, 10) : "");
        if (!e.read_at) {
          await supabase.from("enquiries").update({ read_at: new Date().toISOString() }).eq("id", e.id);
          setEnquiry({ ...e, read_at: new Date().toISOString() });
        }
      }
      setLoading(false);
    })();
  }, [params.id]);

  const save = async () => {
    setBusy(true);
    const patch: Record<string, unknown> = {
      status,
      priority: priority ?? "normal",
      notes,
      next_follow_up_at: nextFollowUp ? new Date(nextFollowUp + "T12:00:00").toISOString() : null,
    };
    if (status === "contacted") patch.last_contacted_at = new Date().toISOString();

    const { error } = await supabase.from("enquiries").update(patch).eq("id", enquiry!.id);
    if (error) {
      toast.error(error.message);
      setBusy(false);
      return;
    }
    setEnquiry((prev) => (prev ? { ...prev, ...(patch as Partial<Enquiry>) } : prev));
    await supabase.from("activity_logs").insert({
      action: "updated enquiry",
      entity_type: "enquiry",
      entity_title: enquiry?.name,
    });
    toast.success("Saved");
    setBusy(false);
  };

  const convertToClient = async () => {
    setBusy(true);
    const { data: client, error } = await supabase
      .from("clients")
      .insert({
        name: enquiry!.name,
        email: enquiry!.email,
        company: enquiry!.business || null,
        status: "lead",
        notes: enquiry!.message?.slice(0, 400) || null,
      })
      .select("id")
      .single();
    if (error) {
      toast.error(error.message.includes("clients") ? "Clients table not ready — run the Phase 1 migration." : error.message);
      setBusy(false);
      return;
    }
    await supabase.from("enquiries").update({ client_id: client.id, status: "won" }).eq("id", enquiry!.id);
    await supabase.from("activity_logs").insert({ action: "converted enquiry to client", entity_type: "client", entity_title: enquiry?.name });
    toast.success("Converted to client");
    setBusy(false);
  };

  const remove = async () => {
    const { error } = await supabase.from("enquiries").delete().eq("id", enquiry!.id);
    if (!error) {
      await supabase.from("activity_logs").insert({ action: "deleted enquiry", entity_title: enquiry?.name });
      router.push("/admin/enquiries");
    } else toast.error(error.message);
  };

  if (loading) {
    return (
      <>
        <PageHead title="Enquiry" sub="Loading…" />
        <div className="ac-card">Loading…</div>
      </>
    );
  }

  if (!enquiry) {
    return (
      <>
        <PageHead title="Enquiry" />
        <div className="ac-card">
          <EmptyState title="Enquiry not found" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHead
        title={enquiry.name}
        sub={`${enquiry.email}${enquiry.business ? ` · ${enquiry.business}` : ""}`}
        actions={
          <>
            <button className="ac-btn ghost" onClick={() => router.push("/admin/enquiries")}>
              <IconArrowLeft size={15} /> Inbox
            </button>
            <a href={`mailto:${enquiry.email}`} className="ac-btn">
              <IconMail size={15} /> Reply
            </a>
            <button className="ac-btn primary" onClick={convertToClient} disabled={busy}>
              <IconUsers size={15} /> Convert to client
            </button>
          </>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)", gap: "1.25rem", alignItems: "start" }}>
        <div className="ac-card">
          <div className="ac-card-head">Message</div>
          <div className="ac-card-pad" style={{ whiteSpace: "pre-wrap", lineHeight: 1.75, fontSize: "0.95rem" }}>
            {enquiry.message}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(10rem, 1fr))", gap: "1rem", padding: "1rem 1.25rem", borderTop: "1px solid var(--aline-soft)" }}>
            <div>
              <span className="ac-label">Project type</span>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.9rem" }}>{enquiry.project_type}</p>
            </div>
            <div>
              <span className="ac-label">Budget</span>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.9rem" }}>{enquiry.budget || "—"}</p>
            </div>
            <div>
              <span className="ac-label">Timeline</span>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.9rem" }}>{enquiry.timeline || "—"}</p>
            </div>
            <div>
              <span className="ac-label">Received</span>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
                {new Date(enquiry.created_at).toLocaleString()}
              </p>
            </div>
            <div>
              <span className="ac-label">Source</span>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.9rem" }}>{enquiry.source || "website"}</p>
            </div>
          </div>
        </div>

        <div className="ac-card">
          <div className="ac-card-head">Lead management</div>
          <div className="ac-card-pad">
            <div className="ac-field-grid">
              <Field label="Status">
                <select className="ac-select" value={status} onChange={(e) => setStatus(e.target.value as Enquiry["status"])}>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="discussion">Discussion</option>
                  <option value="won">Won</option>
                  <option value="closed">Closed</option>
                </select>
              </Field>
              <Field label="Priority">
                <select className="ac-select" value={priority} onChange={(e) => setPriority(e.target.value as Enquiry["priority"])}>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </Field>
            </div>
            <Field label="Next follow-up">
              <input className="ac-input" type="date" value={nextFollowUp} onChange={(e) => setNextFollowUp(e.target.value)} />
            </Field>
            <Field label="Internal notes">
              <textarea className="ac-textarea" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Context, contact history, next steps…" />
            </Field>

            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              <button className="ac-btn primary" onClick={save} disabled={busy}>
                <IconCheck size={15} /> {busy ? "Saving…" : "Save"}
              </button>
              <button className="ac-btn danger" onClick={() => setConfirmDelete(true)}>
                <IconTrash size={15} /> Delete
              </button>
              {enquiry.status === "won" && (
                <Badge value="won" />
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this enquiry?"
        message="The message and its notes will be permanently removed."
        onCancel={() => setConfirmDelete(false)}
        onConfirm={remove}
      />
    </>
  );
}