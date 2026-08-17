"use client";

import { useEffect, useState, FormEvent, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";
import toast, { Toaster } from "react-hot-toast";

export default function AdminDashboardPage() {
  const [user, setUser] = useState<unknown>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"web" | "design">("web");
  const [liveUrl, setLiveUrl] = useState("");
  const [tags, setTags] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);

  const fetchProjects = useCallback(async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setProjects(data as Project[]);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin/login");
        return;
      }
      setUser(session.user);
      await fetchProjects();
      setLoading(false);
    };
    checkAuth();
  }, [router, fetchProjects]);

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from("design-uploads")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("design-uploads")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSubmitting(true);

    let imageUrl = "";
    if (imageFile) {
      const url = await uploadImage(imageFile);
      if (url) imageUrl = url;
      else {
        toast.error("Image upload failed");
        setSubmitting(false);
        return;
      }
    }

    const imageUrls: string[] = [];
    if (category === "design" && additionalImages.length > 0) {
      for (const file of additionalImages) {
        const url = await uploadImage(file);
        if (url) imageUrls.push(url);
      }
    }

    const parsedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const { error: insertError } = await supabase.from("projects").insert({
      title: title.trim(),
      description: description.trim(),
      category,
      image_url: imageUrl,
      images: imageUrls,
      live_url: liveUrl.trim(),
      tags: parsedTags,
    });

    if (insertError) {
      toast.error(`Error: ${insertError.message}`);
    } else {
      toast.success("Project added successfully!");
      setTitle("");
      setDescription("");
      setCategory("web");
      setLiveUrl("");
      setTags("");
      setImageFile(null);
      setAdditionalImages([]);
      await fetchProjects();
    }

    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) {
      toast.error("Delete failed");
    } else {
      toast.success("Deleted successfully");
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <p style={{ color: "#bdb5aa" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="section-padding" style={{ paddingTop: "9rem", paddingBottom: "4rem" }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(15,15,17,0.95)",
            color: "#f6f1e8",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "0.85rem",
          },
        }}
      />

      <div className="dashboard-grid">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <button className="btn-ghost" onClick={handleSignOut} style={{ minWidth: "auto" }}>
            Sign Out
          </button>
        </div>

        {/* Add New Entry */}
        <div className="dashboard-section">
          <h2>Add New {category === "web" ? "Web Project" : "Design"}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1.2rem" }}>
              <div className="form-group">
                <label htmlFor="d-title">Title *</label>
                <input
                  id="d-title"
                  type="text"
                  placeholder="Project name"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="d-category">Category</label>
                <select
                  id="d-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as "web" | "design")}
                >
                  <option value="web">Web Development</option>
                  <option value="design">Graphic Design</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="d-desc">Description</label>
              <textarea
                id="d-desc"
                placeholder="Brief project description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {category === "web" && (
              <div className="form-group">
                <label htmlFor="d-url">Live URL</label>
                <input
                  id="d-url"
                  type="url"
                  placeholder="https://example.com"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="d-tags">Tags (comma-separated)</label>
              <input
                id="d-tags"
                type="text"
                placeholder="Brand Design, Logo, Social Media"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="d-image">Cover Image</label>
              <input
                id="d-image"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                style={{ padding: "0.5rem", fontSize: "0.85rem" }}
              />
            </div>

            {category === "design" && (
              <div className="form-group">
                <label htmlFor="d-images">Additional Images (for albums)</label>
                <input
                  id="d-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setAdditionalImages(Array.from(e.target.files || []))}
                  style={{ padding: "0.5rem", fontSize: "0.85rem" }}
                />
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%", marginTop: "0.5rem" }}
              disabled={submitting}
            >
              {submitting ? "Uploading..." : "Add Project"}
            </button>
          </form>
        </div>

        {/* Existing Entries */}
        <div className="dashboard-section">
          <h2>Existing Entries ({projects.length})</h2>
          {projects.length === 0 ? (
            <p style={{ color: "#7d776f" }}>No entries yet. Add your first project above.</p>
          ) : (
            <div className="entry-list">
              {projects.map((project) => (
                <div key={project.id} className="entry-row">
                  {project.image_url ? (
                    <img src={project.image_url} alt={project.title} className="entry-thumb" />
                  ) : (
                    <div
                      className="entry-thumb"
                      style={{
                        background: "linear-gradient(135deg, rgba(217,182,111,0.2), rgba(92,225,230,0.15))",
                        display: "grid",
                        placeItems: "center",
                        fontSize: "0.9rem",
                        fontWeight: 900,
                        color: "#d9b66f",
                      }}
                    >
                      {project.title[0]}
                    </div>
                  )}
                  <div className="entry-info">
                    <h3>{project.title}</h3>
                    <span>{project.category} {project.tags?.length ? `— ${project.tags.join(", ")}` : ""}</span>
                  </div>
                  <button
                    className="btn-danger"
                    type="button"
                    onClick={() => handleDelete(project.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
