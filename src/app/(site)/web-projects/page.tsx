"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import RevealOnScroll from "@/components/ui/RevealOnScroll";

export default function WebProjectsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/web-systems");
  }, [router]);

  return (
    <section className="section-padding" style={{ paddingTop: "9rem" }}>
      <RevealOnScroll>
        <p className="section-kicker">Redirecting...</p>
      </RevealOnScroll>
    </section>
  );
}
