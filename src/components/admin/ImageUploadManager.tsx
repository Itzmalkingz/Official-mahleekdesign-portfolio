"use client";

import { useRef, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { IconPlus, IconUpload } from "./icons";

export interface PendingImage {
  file?: File;
  url?: string;
  altText?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ACCEPT_ATTR = "image/jpeg,image/png,image/webp,image/gif";

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Only JPEG, PNG, WebP, or GIF images are allowed.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return `${file.name} exceeds the 10 MB limit.`;
  }
  return null;
}

function previewFor(item: PendingImage): string {
  if (item.file) return URL.createObjectURL(item.file);
  return item.url ?? "";
}

export default function ImageUploadManager({
  cover,
  gallery,
  onCoverChange,
  onGalleryChange,
}: {
  cover: PendingImage | null;
  gallery: PendingImage[];
  onCoverChange: (c: PendingImage | null) => void;
  onGalleryChange: (g: PendingImage[]) => void;
}) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const moreInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      // Revoke any object URLs that are still valid (best-effort cleanup)
    };
  }, []);

  const addCover = useCallback(
    (files: File[]) => {
      for (const file of files) {
        const err = validateFile(file);
        if (err) {
          toast.error(err);
          continue;
        }
        onCoverChange({ file, altText: "" });
        break;
      }
    },
    [onCoverChange]
  );

  const addMore = useCallback(
    (files: File[]) => {
      const valid: PendingImage[] = [];
      for (const file of files) {
        const err = validateFile(file);
        if (err) {
          toast.error(err);
          continue;
        }
        valid.push({ file, altText: "" });
      }
      if (valid.length) onGalleryChange([...gallery, ...valid]);
    },
    [gallery, onGalleryChange]
  );

  const removeGallery = (index: number) => {
    onGalleryChange(gallery.filter((_, i) => i !== index));
  };

  const setAsCover = (index: number) => {
    const item = gallery[index];
    if (!item) return;
    onGalleryChange(gallery.filter((_, i) => i !== index));
    onCoverChange(item);
  };

  const moveGallery = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= gallery.length) return;
    const next = [...gallery];
    [next[index], next[j]] = [next[j], next[index]];
    onGalleryChange(next);
  };

  const setAltText = (index: number, alt: string) => {
    onGalleryChange(gallery.map((g, i) => (i === index ? { ...g, altText: alt } : g)));
  };

  const coverPreview = cover ? previewFor(cover) : "";

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      {/* ── Cover ── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <label className="ac-label" style={{ marginBottom: 0 }}>
            Cover image <span style={{ textTransform: "none", fontWeight: 500, marginLeft: "0.3rem" }}>(required)</span>
          </label>
          {cover && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                padding: "0.15rem 0.55rem",
                borderRadius: 99,
                background: "var(--ablue)",
                color: "#fff",
                fontSize: "0.65rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Cover
            </span>
          )}
        </div>

        {cover ? (
          <div style={{ display: "flex", gap: "0.9rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "none" }}>
              <img
                src={coverPreview}
                alt="Cover preview"
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 8,
                  objectFit: "cover",
                  border: "2px solid var(--ablue)",
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
              <input
                className="ac-input"
                style={{ width: "min(280px, 100%)" }}
                placeholder="Alt text"
                value={cover.altText ?? ""}
                onChange={(e) => onCoverChange({ ...cover, altText: e.target.value })}
              />
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                <button type="button" className="ac-btn sm" onClick={() => coverInputRef.current?.click()}>
                  Change cover
                </button>
                <button type="button" className="ac-btn sm ghost danger" onClick={() => onCoverChange(null)}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="ac-btn primary"
            onClick={() => coverInputRef.current?.click()}
            style={{ width: "100%", justifyContent: "center", padding: "1rem" }}
          >
            <IconUpload size={16} /> Select cover image
          </button>
        )}

        <input
          ref={coverInputRef}
          type="file"
          accept={ACCEPT_ATTR}
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files?.length) addCover(Array.from(e.target.files));
            e.target.value = "";
          }}
        />
      </div>

      {/* ── Additional designs ── */}
      <div>
        <label className="ac-label">Additional designs</label>

        {gallery.length > 0 && (
          <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
            {gallery.map((item, i) => {
              const src = previewFor(item);
              return (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gap: "0.35rem",
                    width: 96,
                    border: "1px solid var(--aline)",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <img src={src} alt="" style={{ width: 96, height: 96, objectFit: "cover", display: "block" }} />
                    <button
                      type="button"
                      onClick={() => removeGallery(i)}
                      aria-label="Remove image"
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: "none",
                        background: "rgba(0,0,0,0.6)",
                        color: "#fff",
                        fontSize: "0.7rem",
                        cursor: "pointer",
                        display: "grid",
                        placeItems: "center",
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <input
                    className="ac-input"
                    style={{ fontSize: "0.72rem", padding: "0.2rem 0.4rem", borderRadius: 6 }}
                    placeholder="Alt"
                    value={item.altText ?? ""}
                    onChange={(e) => setAltText(i, e.target.value)}
                  />
                  <div style={{ display: "flex", gap: "0.2rem", justifyContent: "center" }}>
                    <button
                      type="button"
                      className="ac-btn sm ghost"
                      style={{ padding: "0.15rem 0.45rem", fontSize: "0.68rem" }}
                      onClick={() => setAsCover(i)}
                      title="Set as cover"
                    >
                      ★
                    </button>
                    <button
                      type="button"
                      className="ac-btn sm ghost"
                      style={{ padding: "0.15rem 0.45rem", fontSize: "0.68rem", opacity: i === 0 ? 0.35 : 1 }}
                      onClick={() => moveGallery(i, -1)}
                      disabled={i === 0}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="ac-btn sm ghost"
                      style={{ padding: "0.15rem 0.45rem", fontSize: "0.68rem", opacity: i === gallery.length - 1 ? 0.35 : 1 }}
                      onClick={() => moveGallery(i, 1)}
                      disabled={i === gallery.length - 1}
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button type="button" className="ac-btn sm" onClick={() => moreInputRef.current?.click()}>
          <IconPlus size={14} /> Add more images
        </button>
        <input
          ref={moreInputRef}
          type="file"
          accept={ACCEPT_ATTR}
          multiple
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files?.length) addMore(Array.from(e.target.files));
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
