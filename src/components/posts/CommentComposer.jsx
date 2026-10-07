"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/users/UserAvatar";
import { useAuth } from "@/hooks/useAuth";
import { useAddComment } from "@/features/posts/hooks";

export function CommentComposer({ postId }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const { mutate, isPending } = useAddComment();

  if (!user) return null;

  const submit = () => {
    if (!content.trim()) return;
    mutate(
      { postId, content },
      { onSuccess: () => setContent("") }
    );
  };

  return (
    <div className="flex items-start gap-2.5">
      <UserAvatar user={user} size="sm" />
      <div className="flex-1 flex items-end gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Add a comment..."
          rows={1}
          maxLength={500}
          className="min-h-[38px] resize-none py-2"
        />
        <Button size="icon" variant="ghost" disabled={isPending || !content.trim()} onClick={submit}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
