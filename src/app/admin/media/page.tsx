"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { MediaItem } from "@/lib/types";
import { PageHead, EmptyState, SkeletonRows, ConfirmDialog } from "@/components/admin/ui";
import { IconImage, IconUpload, IconTrash, IconLink } from "@/components/admin/icons";

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<MediaItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("media")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (data) setItems(data as MediaItem[]);
      setLoading(false);
    })();
  }, []);

  const upload = async (raw: File[]) => {
    setBusy(true);
    for (const file of raw) {
      try {
        const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
        const path = `media/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("design-uploads")
          .upload(path, file, { upsert: false, contentType: file.type });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("design-uploads").getPublicUrl(path);
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const { data: row, error: rowErr } = await supabase
          .from("media")
          .insert({
            name: file.name,
            path,
            bucket: "design-uploads",
            url: pub.publicUrl,
            mime_type: file.type || null,
            size_bytes: file.size,
            uploaded_by: user?.id,
          })
          .select()
          .single();
        if (rowErr) {
          await supabase.storage.from("design-uploads").remove([path]);
          throw rowErr;
        }
        setItems((prev) => [row as MediaItem, ...prev]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        toast.error(msg.includes("bucket") ? "Storage bucket not ready — run the Phase 1 migration first." : msg);
      }
    }
    setBusy(false);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const { error: stErr } = await supabase.storage.from("design-uploads").remove([deleting.path]);
    if (stErr && !stErr.message.includes("bucket")) {
      toast.error(stErr.message);
      setDeleting(null);
      return;
    }
    const { error } = await supabase.from("media").delete().eq("id", deleting.id);
    if (error) toast.error(error.message);
    else {
      setItems((prev) => prev.filter((x) => x.id !== deleting.id));
      toast.success("File removed");
    }
    setDeleting(null);
  };

  const copyUrl = (url: string) => {
    navigator.clipboard?.writeText(url).then(() => toast.success("URL copied")).catch(() => toast.error("Could not copy"));
  };

  return (
    <>
      <PageHead
        title="Media"
        sub="Files uploaded to the design-uploads storage bucket"
        actions={
          <button className="ac-btn primary" disabled={busy} onClick={() => inputRef.current?.click()}>
            <IconUpload size={15} /> {busy ? "Uploading…" : "Upload"}
          </button>
        }
      />

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*,application/pdf"
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files?.length) upload(Array.from(e.target.files));
          e.target.value = "";
        }}
      />

      {loading ? (
        <div className="ac-card"><SkeletonRows rows={6} cols={4} /></div>
      ) : items.length === 0 ? (
        <div className="ac-card">
          <EmptyState
            icon={<IconImage size={26} />}
            title="No files yet"
            sub="Upload images, videos and documents. The bucket is created by the Phase 1 migration."
            action={
              <button className="ac-btn primary" onClick={() => inputRef.current?.click()}>
                <IconUpload size={14} /> Upload files
              </button>
            }
          />
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "0.9rem",
          }}
        >
          {items.map((m) => (
            <div key={m.id} className="ac-card" style={{ overflow: "hidden" }}>
              <div style={{ aspectRatio: "4/3", background: "var(--apaper-2)", display: "grid", placeItems: "center", overflow: "hidden" }}>
                {m.url && m.mime_type?.startsWith("image") ? (
                  <img src={m.url} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                ) : (
                  <span style={{ fontSize: "0.72rem", color: "var(--aslate)", padding: "0.5rem", textAlign: "center", wordBreak: "break-all" }}>
                    {m.mime_type || "file"}
                  </span>
                )}
              </div>
              <div style={{ padding: "0.7rem 0.85rem" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={m.name}>
                  {m.name}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--aslate)", marginTop: "0.1rem" }}>
                  {m.size_bytes ? `${(m.size_bytes / 1024).toFixed(0)} KB` : ""} · {new Date(m.created_at).toLocaleDateString()}
                </div>
                <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.6rem" }}>
                  {m.url && (
                    <button className="ac-btn sm ghost" onClick={() => copyUrl(m.url!)} title="Copy URL">
                      <IconLink size={13} />
                    </button>
                  )}
                  <button className="ac-btn sm ghost danger" onClick={() => setDeleting(m)} title="Delete">
                    <IconTrash size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Delete file?"
        message={`“${deleting?.name}” will be removed from storage. URLs pointing to it will break.`}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}