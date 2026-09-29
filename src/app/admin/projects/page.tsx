"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { Project } from "@/lib/types";
import { PageHead, Badge, EmptyState, SkeletonRows, ConfirmDialog, MigrateBadge } from "@/components/admin/ui";
import { IconPlus, IconSearch, IconExternal, IconEdit, IconTrash, IconFolder, IconCheck } from "@/components/admin/icons";
import SafeImage from "@/components/ui/SafeImage";

const PAGE_SIZE = 12;
const categoryLabels: Record<string, string> = {
  "brand-identity": "Brand Identity",
  "web-systems": "Web System",
  "brand-web": "Brand + Web",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrated, setMigrated] = useState<boolean | null>(null);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(0);
  const [deleting, setDeleting] = useState<Project | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) setMigrated(false);
      else setMigrated(true);
      setProjects((data ?? []) as Project[]);
      setLoading(false);
    })();
  }, []);

  const filtered = projects.filter((p) => {
    if (query && !`${p.title} ${p.slug} ${p.client ?? ""}`.toLowerCase().includes(query.toLowerCase())) return false;
    if (cat !== "all" && p.category !== cat) return false;
    if (status === "published" && !p.published) return false;
    if (status === "draft" && (p.published || p.archived)) return false;
    if (status === "archived" && !p.archived) return false;
    return true;
  });

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const togglePublished = async (p: Project) => {
    const next = !p.published;
    const { error } = await supabase.from("projects").update({ published: next }).eq("id", p.id);
    if (error) return toast.error(error.message);
    setProjects((prev) => prev.map((x) => (x.id === p.id ? { ...x, published: next } : x)));
    await supabase.from("activity_logs").insert({ action: next ? "published project" : "unpublished project", entity_type: "project", entity_title: p.title });
    toast.success(next ? "Published" : "Unpublished");
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const { error } = await supabase.from("projects").delete().eq("id", deleting.id);
    if (error) {
      toast.error(error.message);
      setDeleting(null);
      return;
    }
    setProjects((prev) => prev.filter((x) => x.id !== deleting.id));
    await supabase.from("activity_logs").insert({ action: "deleted project", entity_type: "project", entity_title: deleting.title });
    toast.success("Project deleted");
    setDeleting(null);
  };

  return (
    <>
      <PageHead
        title="Projects"
        sub="The full portfolio, CMS-managed"
        actions={
          <Link href="/admin/projects/new" className="ac-btn primary">
            <IconPlus size={15} /> New Project
          </Link>
        }
      />

      {migrated === false && <MigrateBadge />}

      <div className="ac-toolbar">
        <div className="ac-search">
          <IconSearch size={15} />
          <input
            className="ac-input"
            placeholder="Search title, slug, client…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <select className="ac-select" style={{ width: 170 }} value={cat} onChange={(e) => { setCat(e.target.value); setPage(0); }}>
          <option value="all">All categories</option>
          <option value="brand-identity">Brand Identity</option>
          <option value="web-systems">Web Systems</option>
          <option value="brand-web">Brand + Web</option>
        </select>
        <select className="ac-select" style={{ width: 140 }} value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="ac-card">
        <div className="ac-table-wrap">
          {loading ? (
            <SkeletonRows rows={8} cols={5} />
          ) : pageItems.length === 0 ? (
            <EmptyState
              icon={<IconFolder size={26} />}
              title={projects.length === 0 ? "No projects yet" : "No matches"}
              sub={projects.length === 0 ? "Create your first project to start populating the portfolio." : "Try adjusting the filters."}
              action={
                projects.length === 0 ? (
                  <Link href="/admin/projects/new" className="ac-btn primary">
                    <IconPlus size={14} /> Create project
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <table className="ac-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Order</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {pageItems.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {typeof p.cover_image === "string" ? (
                          <SafeImage src={p.cover_image} alt="" style={{ width: 46, height: 40, borderRadius: 6, objectFit: "cover", border: "1px solid var(--aline)" }} />
                        ) : (
                          <div style={{ width: 46, height: 40, borderRadius: 6, background: "var(--apaper-2)" }} />
                        )}
                        <div>
                          <div className="row-title">
                            <Link href={`/admin/projects/${p.id}/edit`} style={{ textDecoration: "none", color: "inherit" }}>
                              {p.title}
                            </Link>
                          </div>
                          <div className="row-sub">/{p.slug} {p.year ? `· ${p.year}` : ""}</div>
                        </div>
                      </div>
                    </td>
                    <td><Badge value={categoryLabels[p.category] || p.category} /></td>
                    <td>
                      {p.archived ? <Badge value="archived" /> : <Badge value={p.published ? "published" : "draft"} />}
                    </td>
                    <td style={{ color: "var(--aslate)", fontSize: "0.8rem" }}>{p.sort_order}</td>
                    <td>
                      <div className="ac-row-actions">
                        <button className="ac-btn sm ghost" onClick={() => togglePublished(p)} title={p.published ? "Unpublish" : "Publish"}>
                          <IconCheck size={14} style={p.published ? { color: "var(--agreen)" } : { color: "#b6c2d1" }} />
                        </button>
                        <Link href={`/work/${p.slug}`} target="_blank" className="ac-btn sm ghost" title="View site">
                          <IconExternal size={14} />
                        </Link>
                        <Link href={`/admin/projects/${p.id}/edit`} className="ac-btn sm ghost" title="Edit">
                          <IconEdit size={14} />
                        </Link>
                        <button className="ac-btn sm ghost danger" onClick={() => setDeleting(p)} title="Delete">
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
        <div className="ac-pager">
          <span>
            {filtered.length} project{filtered.length === 1 ? "" : "s"}
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="ac-btn sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              ← Prev
            </button>
            <span style={{ alignSelf: "center", fontSize: "0.8rem", color: "var(--aslate)" }}>
              {page + 1} / {pages}
            </span>
            <button className="ac-btn sm" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>
              Next →
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleting}
        title="Delete project?"
        message={`“${deleting?.title}” will be permanently removed. This cannot be undone.`}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}