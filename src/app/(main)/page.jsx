"use client";

import { NotebookPen } from "lucide-react";
import { PostComposer } from "@/components/posts/PostComposer";
import { PostCard } from "@/components/posts/PostCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { InfiniteScrollTrigger } from "@/components/shared/InfiniteScrollTrigger";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeed } from "@/features/posts/hooks";

export default function FeedPage() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed();
  const posts = data?.pages.flatMap((p) => p.posts) || [];

  return (
    <div className="space-y-4">
      <PostComposer />

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={NotebookPen}
          title="Your feed is quiet"
          description="Follow people to see their posts here, or write the first entry yourself."
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}

      <InfiniteScrollTrigger onLoadMore={fetchNextPage} hasMore={!!hasNextPage} isFetching={isFetchingNextPage} />
    </div>
  );
}
