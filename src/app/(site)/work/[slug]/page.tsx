"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";
import ProjectCaseDetail from "@/components/case/ProjectCaseDetail";

export default function WorkProjectPage() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [related, setRelated] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", params.slug)
        .eq("published", true)
        .single();

      if (data) {
        setProject(data as Project);
        const { data: relatedData } = await supabase
          .from("projects")
          .select("*")
          .eq("category", data.category)
          .eq("published", true)
          .neq("id", data.id)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false })
          .limit(3);
        setRelated((relatedData ?? []) as Project[]);
      }

      setLoading(false);
    };

    fetchProject();
  }, [params.slug]);

  if (loading) {
    return (
      <section className="section-padding" style={{ paddingTop: "9rem" }}>
        <div className="empty-state">
          <h3>Loading project…</h3>
        </div>
      </section>
    );
  }

  if (!project) {
    return (
      <section className="section-padding" style={{ paddingTop: "9rem" }}>
        <div className="empty-state">
          <h3>Project not found</h3>
          <Link href="/work" className="btn-primary" style={{ marginTop: "1.5rem", display: "inline-block" }}>
            Back to Projects
          </Link>
        </div>
      </section>
    );
  }

  return <ProjectCaseDetail project={project} related={related} backHref="/work" backLabel="Work" />;
}