"use client";

import { useEffect } from "react";

export default function Parallax() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let ticking = false;

    const updateParallax = () => {
      const scenes = document.querySelectorAll("[data-scene]");
      const viewportHeight = window.innerHeight;

      scenes.forEach((scene) => {
        const rect = scene.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > viewportHeight) return;

        const sceneProgress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
        scene.querySelectorAll<HTMLElement>("[data-depth]").forEach((layer) => {
          const depth = Number(layer.getAttribute("data-depth")) || 0;
          const movement = (sceneProgress - 0.5) * depth * 150;
          layer.style.setProperty("--parallax-y", `${movement}px`);
        });
      });

      ticking = false;
    };

    const onFrame = () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onFrame, { passive: true });
    updateParallax();

    return () => window.removeEventListener("scroll", onFrame);
  }, []);

  return null;
}
