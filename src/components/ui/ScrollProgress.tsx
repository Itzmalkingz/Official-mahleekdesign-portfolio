"use client";

import { useEffect } from "react";

export default function ScrollProgress() {
  useEffect(() => {
    const bar = document.getElementById("scrollProgress");
    if (!bar) return;

    let ticking = false;

    const update = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      bar.style.height = `${Math.min(progress * 100, 100)}%`;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
