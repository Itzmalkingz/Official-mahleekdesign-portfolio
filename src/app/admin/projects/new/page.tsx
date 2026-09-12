import ProjectForm from "@/components/admin/ProjectForm";
import { PageHead } from "@/components/admin/ui";

export default function NewProjectPage() {
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
      <ProjectForm mode="create" />
    </>
  );
}