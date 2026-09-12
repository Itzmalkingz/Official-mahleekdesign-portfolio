"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import ProjectForm from "@/components/admin/ProjectForm";
import ProjectImport, { type ImportedProject } from "@/components/admin/ProjectImport";
import { PageHead } from "@/components/admin/ui";

export default function NewProjectPage() {
  const [prefill, setPrefill] = useState<ImportedProject | null>(null);
  const [formKey, setFormKey] = useState(0);

  const handleImported = (p: ImportedProject) => {
    const clean = { ...p };
    delete (clean as Record<string, unknown>)._screenshot;
    delete (clean as Record<string, unknown>)._caseStudy;
    setPrefill(clean);
    setFormKey((k) => k + 1);
    toast.success("Form prefilled from scraped site");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <PageHead
        title="New Project"
        sub="Add a case study to the portfolio"
        actions={
          <a href="/" target="_blank" className="ac-btn ghost" style={{ textDecoration: "none" }}>
            View Live Site
          </a>
        }
      />
      <ProjectImport onImported={handleImported} />
      {prefill && (
        <button className="ac-btn sm ghost" style={{ marginBottom: "1rem" }} onClick={() => { setPrefill(null); setFormKey((k) => k + 1); }}>
          Reset (start blank)
        </button>
      )}
      <ProjectForm key={formKey} mode="create" initial={prefill} />
    </>
  );
}