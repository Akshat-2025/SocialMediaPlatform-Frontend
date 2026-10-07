"use client";

import { useParams } from "next/navigation";
import { PostCard } from "@/components/posts/PostCard";
import { CommentSection } from "@/components/posts/CommentSection";
import { PageSpinner } from "@/components/shared/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { usePost } from "@/features/posts/hooks";
import { FileQuestion } from "lucide-react";

export default function PostDetailPage() {
  const { id } = useParams();
  const { data: post, isLoading, isError } = usePost(id);

  if (isLoading) return <PageSpinner />;

  if (isError || !post) {
    return <EmptyState icon={FileQuestion} title="Post not found" description="It may have been deleted." />;
  }

  return (
    <div className="space-y-6">
      <PostCard post={post} linkToDetail={false} />
      <CommentSection postId={post._id} />
    </div>
  );
}
