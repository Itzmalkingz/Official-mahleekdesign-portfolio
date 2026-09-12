"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { IconUpload } from "./icons";

/**
 * Image URL field with an optional Supabase Storage upload.
 * The upload targets the `design-uploads` bucket (created by the Phase 1
 * migration) inside an `admin/<folder>` prefix.
 */
export default function ImageField({
  value,
  onChange,
  folder = "general",
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `admin/${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from("design-uploads")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("design-uploads").getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Uploaded");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(
        msg.includes("bucket") ? "Storage bucket not ready — run the Phase 1 migration." : msg
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ac-card-pad" style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
      {value ? (
        <img
          src={value}
          alt=""
          style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover", border: "1px solid var(--aline)" }}
        />
      ) : (
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 8,
            border: "1px dashed var(--aline)",
            display: "grid",
            placeItems: "center",
            color: "var(--aslate)",
            fontSize: "0.7rem",
            textAlign: "center",
          }}
        >
          none
        </div>
      )}
      <input
        className="ac-input"
        style={{ flex: 1, minWidth: 220 }}
        placeholder="https://…/image.png"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button className="ac-btn sm" disabled={busy} onClick={() => inputRef.current?.click()}>
        <IconUpload size={14} /> {busy ? "Uploading…" : "Upload"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}