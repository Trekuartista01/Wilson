"use client";

import { useEffect, useRef } from "react";

/**
 * Homepage hero background video (public/videos/hero.mp4: 6 s, 1080p, no sound, looping).
 * Muted + playsInline so phones autoplay it; the poster (its first frame) shows until it
 * starts. With prefers-reduced-motion it stays paused on the poster. When the logo intro
 * opens its curtains the video restarts, so visitors see it from the beginning.
 */
export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
      return;
    }
    const html = document.documentElement;
    if (html.dataset.intro !== "play") return;
    const observer = new MutationObserver(() => {
      if (html.dataset.intro === "play") return;
      video.currentTime = 0;
      video.play().catch(() => {});
      observer.disconnect();
    });
    observer.observe(html, { attributes: true, attributeFilter: ["data-intro"] });
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster="/videos/new-hero.mp4"
      aria-hidden
      className="absolute inset-0 size-full object-cover"
    >
      <source src="/videos/new-hero.mp4" type="video/mp4" />
    </video>
  );
}
