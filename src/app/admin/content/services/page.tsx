"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { Service } from "@/lib/types";
import { PageHead, Badge, EmptyState, SkeletonRows, MigrateBadge, Field, ConfirmDialog } from "@/components/admin/ui";
import { IconLayers, IconPlus, IconCheck, IconTrash, IconEdit } from "@/components/admin/icons";

const blank: Omit<Service, "id"> = {
  name: "",
  short_description: "",
  full_description: "",
  icon: "",
  image_url: "",
  features: [],
  sort_order: 0,
  published: false,
};

export default function ContentServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrated, setMigrated] = useState<boolean | null>(null);
  const [selected, setSelected] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Service | null>(null);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [fullDesc, setFullDesc] = useState("");
  const [icon, setIcon] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [features, setFeatures] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) setMigrated(false);
      else setMigrated(true);
      setServices((data ?? []) as Service[]);
      setLoading(false);
    })();
  }, []);

  const select = (s: Service) => {
    setSelected(s);
    setCreating(false);
    setName(s.name);
    setShortDesc(s.short_description);
    setFullDesc(s.full_description ?? "");
    setIcon(s.icon ?? "");
    setImageUrl(s.image_url ?? "");
    setFeatures((s.features ?? []).join(", "));
    setSortOrder(s.sort_order);
    setPublished(s.published);
  };

  const reset = () => {
    setSelected(null);
    setCreating(false);
    setName(""); setShortDesc(""); setFullDesc(""); setIcon(""); setImageUrl(""); setFeatures(""); setSortOrder(0); setPublished(false);
  };

  const save = async () => {
    if (!name.trim()) return toast.error("Service name is required");
    setBusy(true);
    const payload = {
      name: name.trim(),
      short_description: shortDesc.trim(),
      full_description: fullDesc.trim() || null,
      icon: icon.trim() || null,
      image_url: imageUrl.trim() || null,
      features: features.split(",").map((f) => f.trim()).filter(Boolean),
      sort_order: Number(sortOrder) || 0,
      published,
    };
    let err: { message: string } | null = null;
    if (creating) {
      const { error } = await supabase.from("services").insert(payload).select().single();
      err = error;
    } else if (selected) {
      const { error } = await supabase.from("services").update(payload).eq("id", selected.id);
      err = error;
    }
    if (err) {
      toast.error(err.message);
      setBusy(false);
      return;
    }
    const { data: list } = await supabase.from("services").select("*").order("sort_order");
    if (list) {
      setServices(list as Service[]);
      const match = (list as Service[]).find((s) => s.name === name.trim());
      if (match) select(match);
    }
    await supabase.from("activity_logs").insert({ action: `${creating ? "created" : "updated"} service`, entity_type: "service", entity_title: name.trim() });
    toast.success(creating ? "Service created" : "Service updated");
    setCreating(false);
    setBusy(false);
  };

  const togglePublished = async (s: Service) => {
    const next = !s.published;
    const { error } = await supabase.from("services").update({ published: next }).eq("id", s.id);
    if (!error) setServices((prev) => prev.map((x) => (x.id === s.id ? { ...x, published: next } : x)));
  };

  const remove = async () => {
    if (!deleting) return;
    const { error } = await supabase.from("services").delete().eq("id", deleting.id);
    if (!error) {
      setServices((prev) => prev.filter((x) => x.id !== deleting.id));
      if (selected?.id === deleting.id) reset();
      toast.success("Service deleted");
    } else toast.error(error.message);
    setDeleting(null);
  };

  return (
    <>
      <PageHead
        title="Services"
        sub="What the studio offers"
        actions={
          <button className="ac-btn primary" onClick={() => { reset(); setCreating(true); }}>
            <IconPlus size={15} /> New service
          </button>
        }
      />

      {migrated === false && <MigrateBadge />}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 0.8fr) minmax(0, 1.4fr)", gap: "1.25rem", alignItems: "start" }}>
        <div className="ac-card">
          <div className="ac-card-head">Services</div>
          {loading ? (
            <SkeletonRows rows={5} cols={2} />
          ) : services.length === 0 ? (
            <EmptyState
              icon={<IconLayers size={26} />}
              title="No services yet"
              sub="Add what you offer and publish it."
            />
          ) : (
            services.map((s) => (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.7rem 1rem",
                  borderBottom: "1px solid var(--aline-soft)",
                  cursor: "pointer",
                  background: selected?.id === s.id ? "#eef4fd" : "transparent",
                }}
                onClick={() => select(s)}
              >
                <span style={{ flex: 1, fontWeight: 600, fontSize: "0.85rem" }}>{s.name}</span>
                <Badge value={s.published ? "published" : "draft"} />
                <button className="ac-btn sm ghost" onClick={(e) => { e.stopPropagation(); togglePublished(s); }} title="Toggle published">
                  <IconCheck size={13} style={s.published ? { color: "var(--agreen)" } : { color: "#b6c2d1" }} />
                </button>
                <button className="ac-btn sm ghost danger" onClick={(e) => { e.stopPropagation(); setDeleting(s); }} title="Delete">
                  <IconTrash size={13} />
                </button>
              </div>
            ))
          )}
        </div>

        {creating || selected ? (
          <div className="ac-card" data-ash-reveal>
            <div className="ac-card-head">
              {creating ? "New service" : `Edit · ${selected?.name}`}
              <button className="ac-btn sm ghost" onClick={reset}>
                <IconEdit size={13} /> Close
              </button>
            </div>
            <div className="ac-card-pad">
              <div className="ac-field-grid">
                <Field label="Name">
                  <input className="ac-input" value={name} onChange={(e) => setName(e.target.value)} />
                </Field>
                <Field label="Icon">
                  <input className="ac-input" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="e.g. palette, code" />
                </Field>
                <Field label="Sort order">
                  <input className="ac-input" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
                </Field>
              </div>
              <Field label="Short description">
                <textarea className="ac-textarea" rows={2} value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} />
              </Field>
              <Field label="Full description">
                <textarea className="ac-textarea" rows={5} value={fullDesc} onChange={(e) => setFullDesc(e.target.value)} />
              </Field>
              <Field label="Image URL">
                <input className="ac-input" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" />
              </Field>
              <Field label="Features" hint="(comma separated)">
                <input className="ac-input" value={features} onChange={(e) => setFeatures(e.target.value)} />
              </Field>
              <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.1rem" }}>
                <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Published</span>
              </label>
              <div style={{ display: "flex", gap: "0.6rem" }}>
                <button className="ac-btn primary" onClick={save} disabled={busy}>
                  <IconCheck size={15} /> {busy ? "Saving…" : "Save"}
                </button>
                <button className="ac-btn" onClick={reset}>Cancel</button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={!!deleting}
        title="Delete service?"
        message={`“${deleting?.name}” will be removed from the services list.`}
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
      />
    </>
  );
}