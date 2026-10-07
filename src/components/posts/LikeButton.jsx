"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToggleLike } from "@/features/posts/hooks";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function LikeButton({ post }) {
  const { user, isAuthenticated } = useAuth();
  const { mutate } = useToggleLike(user?.id);
  const [burst, setBurst] = useState(false);

  const liked = post.likes?.some((id) => id === user?.id || id?._id === user?.id);
  const count = post.likes?.length ?? 0;

  const handleClick = () => {
    if (!isAuthenticated) {
      toast.error("Log in to like posts");
      return;
    }
    if (!liked) setBurst(true);
    mutate(post._id);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group relative flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-ember"
      aria-pressed={liked}
      aria-label={liked ? "Unlike post" : "Like post"}
    >
      <span className="relative flex h-6 w-6 items-center justify-center">
        <Heart
          className={cn(
            "h-[18px] w-[18px] transition-transform group-active:scale-90",
            liked && "fill-ember text-ember"
          )}
        />
        <AnimatePresence onExitComplete={() => setBurst(false)}>
          {burst && (
            <motion.span
              initial={{ scale: 0.6, opacity: 0.7 }}
              animate={{ scale: 1.8, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="absolute inset-0 rounded-full bg-ember/40"
            />
          )}
        </AnimatePresence>
      </span>
      <span className={cn(liked && "text-ember")}>{count}</span>
    </button>
  );
}
