"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/components/users/UserAvatar";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { PostImages } from "./PostImages";
import { LikeButton } from "./LikeButton";
import { PostActionsMenu } from "./PostActionsMenu";
import { useAuth } from "@/hooks/useAuth";

export function PostCard({ post, linkToDetail = true }) {
  const { user } = useAuth();
  const isAuthor = user?.id === post.author?.id || user?.id === post.author?._id;

  const Body = (
    <>
      {post.content && (
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
          {post.content}
        </p>
      )}
      {post.images?.length > 0 && <PostImages images={post.images} />}
    </>
  );

  return (
    <Card className="spine overflow-hidden">
      <div className="p-5 pl-6 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <UserAvatar user={post.author} size="md" />
            <div className="leading-tight">
              <Link href={`/profile/${post.author?.username}`} className="font-medium text-sm hover:underline">
                {post.author?.fullName}
              </Link>
              <p className="text-xs text-muted-foreground">
                @{post.author?.username} · <RelativeTime date={post.createdAt} />
              </p>
            </div>
          </div>
          {isAuthor && <PostActionsMenu post={post} />}
        </div>

        {linkToDetail ? (
          <Link href={`/post/${post._id}`} className="block space-y-3">
            {Body}
          </Link>
        ) : (
          <div className="space-y-3">{Body}</div>
        )}

        <div className="flex items-center gap-5 pt-1">
          <LikeButton post={post} />
          <Link
            href={`/post/${post._id}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
          >
            <MessageCircle className="h-[18px] w-[18px]" />
            {post.commentsCount ?? 0}
          </Link>
        </div>
      </div>
    </Card>
  );
}
