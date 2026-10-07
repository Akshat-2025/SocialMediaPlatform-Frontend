"use client";

import { useEffect, useRef } from "react";
import { Spinner } from "./Spinner";

/** Drop at the bottom of a list; fires onLoadMore when it scrolls into view. */
export function InfiniteScrollTrigger({ onLoadMore, hasMore, isFetching }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!hasMore) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMore();
      },
      { rootMargin: "300px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore]);

  if (!hasMore) return null;

  return (
    <div ref={ref} className="flex justify-center py-6">
      {isFetching && <Spinner />}
    </div>
  );
}
