"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { Testimonial } from "@/lib/types";
import { PageHead, Badge, EmptyState, SkeletonRows, MigrateBadge, Field, ConfirmDialog } from "@/components/admin/ui";
import { IconQuote, IconPlus, IconCheck, IconTrash } from "@/components/admin/icons";

export default function ContentTestimonialsPage() {
  const [list, setList] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrated, setMigrated] = useState<boolean | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<Testimonial | null>(null);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [role, setRole] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [featured, setFeatured] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("featured", { ascending: false })
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) setMigrated(false);
      else setMigrated(true);
      setList((data ?? []) as Testimonial[]);
      setLoading(false);
    })();
  }, []);

  const reset = () => {
    setName(""); setBusiness(""); setRole(""); setContent(""); setImageUrl("");
    setFeatured(true); setSortOrder(0); setAdding(false);
  };

  const add = async () => {
    if (!name.trim() || !content.trim()) return toast.error("Name and content are required");
    setBusy(true);
    const { data, error } = await supabase
      .from("testimonials")
      .insert({
        name: name.trim(),
        business: business.trim() || null,
        role: role.trim() || null,
        content: content.trim(),
        image_url: imageUrl.trim() || null,
        published: true,
        featured,
        sort_order: Number(sortOrder) || 0,
      })
      .select()
      .single();
    if (error) {
      toast.error(error.message);
      setBusy(false);
      return;
    }
    setList((prev) => [data as Testimonial, ...prev]);
    await supabase.from("activity_logs").insert({ action: "added testimonial", entity_type: "testimonial", entity_title: name.trim() });
    toast.success("Testimonial added");
    setBusy(false);
    reset();
  };

  const toggle = async (t: Testimonial) => {
    const next = !t.published;
    const { error } = await supabase.from("testimonials").update({ published: next }).eq("id", t.id);
    if (!error) setList((prev) => prev.map((x) => (x.id === t.id ? { ...x, published: next } : x)));
  };

  const remove = async () => {
    if (!deleting) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", deleting.id);
    if (!error) {
      setList((prev) => prev.filter((x) => x.id !== deleting.id));
      toast.success("Deleted");
    } else toast.error(error.message);
    setDeleting(null);
  };

  return (
    <>
      <PageHead
        title="Testimonials"
        sub="Client quotes shown on the site"
        actions={
          <button className="ac-btn primary" onClick={() => setAdding((v) => !v)}>
            <IconPlus size={15} /> Add testimonial
          </button>
        }
      />

      {migrated === false && <MigrateBadge />}

      {adding && (
        <div className="ac-card" style={{ marginBottom: "1.25rem", padding: "1.25rem" }} data-ash-reveal>
          <div className="ac-field-grid">
            <Field label="Name">
              <input className="ac-input" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Business">
              <input className="ac-input" value={business} onChange={(e) => setBusiness(e.target.value)} />
            </Field>
            <Field label="Role">
              <input className="ac-input" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Founder" />
            </Field>
            <Field label="Image URL">
              <input className="ac-input" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" />
            </Field>
            <Field label="Sort order">
              <input className="ac-input" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
            </Field>
          </div>
          <Field label="Quote">
            <textarea className="ac-textarea" rows={3} value={content} onChange={(e) => setContent(e.target.value)} />
          </Field>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.1rem" }}>
            <label style={{ display: "flex", gap: "0.45rem", alignItems: "center", fontSize: "0.85rem", fontWeight: 600 }}>
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> Featured
            </label>
            <button className="ac-btn primary" onClick={add} disabled={busy}>
              <IconCheck size={15} /> {busy ? "Adding…" : "Add"}
            </button>
          </div>
        </div>
      )}

      <div className="ac-card">
        {loading ? (
          <SkeletonRows rows={6} cols={3} />
        ) : list.length === 0 ? (
          <EmptyState
            icon={<IconQuote size={26} />}
            title="No testimonials yet"
            sub="Add quotes from past clients."
          />
        ) : (
          <div style={{ padding: "0.5rem 0", display: "grid", gap: 0 }}>
            {list.map((t) => (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  gap: "1rem",
                  padding: "1rem 1.25rem",
                  borderBottom: "1px solid var(--aline-soft)",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    flex: "none",
                    width: 32,
                    height: 32,
                    borderRadius: 50,
                    display: "grid",
                    placeItems: "center",
                    background: "var(--apaper-2)",
                    color: "var(--aslate)",
                  }}
                >
                  {t.image_url ? (
                    <img src={t.image_url} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    <IconQuote size={15} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.6, color: "var(--ink)" }}>
                    “{t.content}”
                  </p>
                  <div style={{ marginTop: "0.5rem", fontWeight: 600, fontSize: "0.85rem" }}>
                    {t.name}
                    {(t.business || t.role) && (
                      <span style={{ color: "var(--aslate)", fontWeight: 500 }}>
                        {t.role ? ` · ${t.role}` : ""}
                        {t.business ? ` · ${t.business}` : ""}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                  <Badge value={t.published ? "published" : "draft"} />
                  <button className="ac-btn sm ghost" onClick={() => toggle(t)} title="Toggle published">
                    <IconCheck size={13} style={t.published ? { color: "var(--agreen)" } : { color: "#b6c2d1" }} />
                  </button>
                  <button className="ac-btn sm ghost danger" onClick={() => setDeleting(t)} title="Delete">
                    <IconTrash size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleting}
        title="Delete testimonial?"
        message={`The quote from “${deleting?.name}” will be removed.`}
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
      />
    </>
  );
}