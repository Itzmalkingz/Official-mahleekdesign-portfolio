"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";
import ProjectForm from "@/components/admin/ProjectForm";
import { PageHead, EmptyState } from "@/components/admin/ui";

export default function EditProjectPage() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", params.id)
        .single();
      if (error) setMissing(true);
      else setProject(data as Project);
      setLoading(false);
    })();
  }, [params.id]);

  if (loading) {
    return (
      <>
        <PageHead title="Edit Project" sub="Loading…" />
        <div className="ac-card"><div className="ac-card-pad">Loading…</div></div>
      </>
    );
  }

  if (missing || !project) {
    return (
      <div className="ac-card">
        <EmptyState title="Project not found" sub="It may have been deleted." />
      </div>
    );
  }

  return (
    <>
      <PageHead title={`Edit · ${project.title}`} sub={`/work/${project.slug}`} />
      <ProjectForm key={project.id} initial={project} mode="edit" />
    </>
  );
}