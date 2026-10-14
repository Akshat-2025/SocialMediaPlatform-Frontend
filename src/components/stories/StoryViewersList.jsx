"use client";

import { Loader2, Eye, X } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import { useStoryViewers } from "@/features/stories/hooks";

/**
 * Slide-up panel that shows who viewed a story.
 * Only rendered when the owner has tapped the Eye icon.
 *
 * Props:
 *   storyId    – the story's id string
 *   viewsCount – the denormalized count already on the story object
 *   onClose    – callback to collapse the panel
 */
export function StoryViewersList({ storyId, viewsCount, onClose }) {
  const { data, isLoading, isError } = useStoryViewers(storyId, true);
  const viewers = data?.viewers ?? [];

  return (
    <div className="bg-card/95 backdrop-blur-xl rounded-t-2xl border-t border-white/10 max-h-[55vh] flex flex-col">
      {/* Handle bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <span>
            {viewsCount} {viewsCount === 1 ? "view" : "views"}
          </span>
        </div>
        <button
          aria-label="Close viewers list"
          onClick={onClose}
          className="rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Viewer list */}
      <div className="overflow-y-auto flex-1 scrollbar-thin">
        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {isError && (
          <p className="text-center text-sm text-muted-foreground py-10">
            Could not load viewers.
          </p>
        )}
        {!isLoading && !isError && viewers.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-10">
            No views yet.
          </p>
        )}
        {viewers.map(({ user, viewedAt }) => (
          <div key={user.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
            <Avatar className="h-9 w-9 shrink-0">
              {user.avatar?.url && <AvatarImage src={user.avatar.url} alt={user.fullName} />}
              <AvatarFallback className="text-xs bg-secondary">{initials(user.fullName || user.username)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.fullName}</p>
              <p className="text-xs text-muted-foreground">@{user.username}</p>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              {formatDistanceToNowStrict(new Date(viewedAt), { addSuffix: true })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
