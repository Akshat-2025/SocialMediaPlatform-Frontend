"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * A single segmented progress bar for the story viewer.
 *
 * Props:
 *  count       – total number of segments (= total stories in the group)
 *  current     – index of the currently active story (0-based)
 *  elapsed     – 0..1 float representing how far through the current segment we are
 *  isPaused    – when true, the animated bar freezes
 */
export function StoryProgress({ count, current, elapsed, isPaused, className }) {
  return (
    <div className={cn("flex w-full gap-1", className)} role="progressbar" aria-label="Story progress">
      {Array.from({ length: count }, (_, i) => (
        <Segment
          key={i}
          state={i < current ? "done" : i === current ? "active" : "idle"}
          fill={i === current ? elapsed : i < current ? 1 : 0}
          isPaused={isPaused}
        />
      ))}
    </div>
  );
}

function Segment({ state, fill, isPaused }) {
  const fillRef = useRef(null);

  // We drive the fill via a CSS custom property so we can transition it
  useEffect(() => {
    if (!fillRef.current) return;
    fillRef.current.style.setProperty("--fill", `${Math.min(1, Math.max(0, fill)) * 100}%`);
  }, [fill]);

  return (
    <div className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
      <div
        ref={fillRef}
        className={cn(
          "h-full w-[var(--fill,0%)] rounded-full",
          state === "done"
            ? "bg-white"
            : state === "active"
            ? "bg-white"
            : "bg-transparent",
          // Only transition when active (avoids a flash when jumping between stories)
          state === "active" && !isPaused ? "transition-none" : ""
        )}
        style={{ "--fill": `${fill * 100}%` }}
      />
    </div>
  );
}
