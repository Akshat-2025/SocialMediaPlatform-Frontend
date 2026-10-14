"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";

/**
 * A single story bubble in the horizontal tray.
 *
 * Props:
 *   group        – { user, stories, hasUnseen }
 *   isCurrentUser – boolean – renders the "create" variant if true
 *   onClick      – () => void
 */
export function StoryCard({ group, isCurrentUser, onClick }) {
  const user = group.user;
  const avatarUrl = user?.avatar?.url;
  const name = user?.fullName || user?.username || "";
  const hasUnseen = group.hasUnseen;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isCurrentUser ? "View your story" : `View ${name}'s story`}
      className={cn(
        "flex flex-col items-center gap-1.5 flex-shrink-0 w-[72px] group",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
      )}
    >
      {/* Ring + avatar */}
      <span
        className={cn(
          "relative flex h-[62px] w-[62px] items-center justify-center rounded-full p-[2.5px]",
          hasUnseen && !isCurrentUser
            ? "story-ring-unseen"   // animated gradient ring
            : "story-ring-seen"    // muted ring
        )}
      >
        <Avatar className="h-full w-full ring-2 ring-background">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
          <AvatarFallback className="bg-secondary text-sm font-medium">
            {initials(name) || "?"}
          </AvatarFallback>
        </Avatar>

        {/* View indicator dot — only for already-viewed (not own) */}
        {!isCurrentUser && !hasUnseen && (
          <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full bg-muted border-2 border-background" />
        )}
      </span>

      {/* Username label */}
      <span className={cn(
        "text-[11px] leading-tight text-center w-full truncate px-1",
        hasUnseen && !isCurrentUser
          ? "text-foreground font-semibold"
          : "text-muted-foreground"
      )}>
        {isCurrentUser ? "Your story" : name}
      </span>
    </button>
  );
}
