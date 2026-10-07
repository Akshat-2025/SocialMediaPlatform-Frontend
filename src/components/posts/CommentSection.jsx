"use client";

import { MessageCircle } from "lucide-react";
import { useComments } from "@/features/posts/hooks";
import { CommentComposer } from "./CommentComposer";
import { CommentItem } from "./CommentItem";
import { InfiniteScrollTrigger } from "@/components/shared/InfiniteScrollTrigger";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

export function CommentSection({ postId }) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useComments(postId);
  const comments = data?.pages.flatMap((p) => p.comments) || [];

  return (
    <div className="space-y-4">
      <CommentComposer postId={postId} />

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-2.5">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-12 flex-1 rounded-lg" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <EmptyState icon={MessageCircle} title="No comments yet" description="Be the first to say something." />
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} postId={postId} />
          ))}
        </div>
      )}

      <InfiniteScrollTrigger
        onLoadMore={fetchNextPage}
        hasMore={!!hasNextPage}
        isFetching={isFetchingNextPage}
      />
    </div>
  );
}
