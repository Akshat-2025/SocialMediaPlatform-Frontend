"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, Pencil, Check, X } from "lucide-react";
import { UserAvatar } from "@/components/users/UserAvatar";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useDeleteComment, useUpdateComment } from "@/features/posts/hooks";

export function CommentItem({ comment, postId }) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  const { mutate: updateComment, isPending: updating } = useUpdateComment();
  const { mutate: deleteComment, isPending: deleting } = useDeleteComment();

  const isAuthor = user?.id === comment.author?.id || user?.id === comment.author?._id;

  const save = () => {
    if (!content.trim()) return;
    updateComment(
      { postId, commentId: comment._id, content },
      { onSuccess: () => setEditing(false) }
    );
  };

  return (
    <div className="flex items-start gap-2.5">
      <UserAvatar user={comment.author} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="rounded-lg bg-secondary px-3 py-2">
          <div className="flex items-center gap-1.5">
            <Link href={`/profile/${comment.author?.username}`} className="text-xs font-medium hover:underline">
              {comment.author?.fullName}
            </Link>
            <span className="text-[11px] text-muted-foreground">
              <RelativeTime date={comment.createdAt} />
            </span>
          </div>
          {editing ? (
            <div className="mt-1 space-y-2">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={2}
                maxLength={500}
                className="bg-background"
              />
              <div className="flex gap-1">
                <Button size="icon" className="h-6 w-6" disabled={updating} onClick={save}>
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => {
                    setEditing(false);
                    setContent(comment.content);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-0.5 whitespace-pre-wrap text-sm">{comment.content}</p>
          )}
        </div>
        {isAuthor && !editing && (
          <div className="mt-1 flex gap-3 pl-1">
            <button
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary"
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-3 w-3" /> Edit
            </button>
            <button
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive"
              disabled={deleting}
              onClick={() => deleteComment({ postId, commentId: comment._id })}
            >
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
