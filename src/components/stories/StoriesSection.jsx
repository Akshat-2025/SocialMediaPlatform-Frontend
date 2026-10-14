"use client";

import { useState } from "react";
import { Plus, Clapperboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { StoryCard } from "./StoryCard";
import { StoryViewer } from "./StoryViewer";
import { CreateStoryModal } from "./CreateStoryModal";
import { useStoriesFeed } from "@/features/stories/hooks";
import { useAuth } from "@/hooks/useAuth";

/**
 * Horizontal Stories tray — placed above the feed.
 * Handles loading, empty, error, and populated states.
 */
export function StoriesSection() {
  const { user } = useAuth();
  const { data: storyGroups, isLoading, isError } = useStoriesFeed();

  const [viewerState, setViewerState] = useState(null); // { groupIndex, storyIndex } | null
  const [createOpen, setCreateOpen] = useState(false);

  if (isLoading) return <StoriesSkeleton />;
  if (isError) return null; // Silently hide on error; feed still loads

  // Build tray: currentUser's group first (from backend sort), then others
  const groups = storyGroups ?? [];

  // Find if the current user already has a group in the feed
  const myGroup = groups.find((g) => g.user.id?.toString() === user?.id?.toString());
  const hasNoStories = groups.length === 0;

  return (
    <>
      {/* ── Tray container ────────────────────────────────────────────────── */}
      <div className="glass-panel px-4 py-3 overflow-hidden">
        <div
          className="flex gap-4 overflow-x-auto scrollbar-thin pb-1 -mx-1 px-1"
          role="list"
          aria-label="Stories"
        >
          {/* ── Create story card ──────────────────────────────────────────── */}
          <CreateStoryCard
            user={user}
            hasOwnStory={!!myGroup}
            onClick={() => {
              if (myGroup) {
                // User has existing story — open viewer on their group
                setViewerState({ groupIndex: groups.indexOf(myGroup), storyIndex: 0 });
              } else {
                setCreateOpen(true);
              }
            }}
          />

          {/* ── Other users' stories ──────────────────────────────────────── */}
          {hasNoStories ? (
            <div className="flex items-center px-2">
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                No stories yet — be the first!
              </p>
            </div>
          ) : (
            groups
              .filter((g) => g.user.id?.toString() !== user?.id?.toString()) // own already shown
              .map((group) => {
                const globalIndex = groups.indexOf(group);
                return (
                  <div key={group.user.id} role="listitem">
                    <StoryCard
                      group={group}
                      isCurrentUser={false}
                      onClick={() => setViewerState({ groupIndex: globalIndex, storyIndex: 0 })}
                    />
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* ── Full-screen viewer ────────────────────────────────────────────── */}
      {viewerState !== null && (
        <StoryViewer
          groups={groups}
          groupIndex={viewerState.groupIndex}
          storyIndex={viewerState.storyIndex}
          onClose={() => setViewerState(null)}
        />
      )}

      {/* ── Create Story Modal ────────────────────────────────────────────── */}
      <CreateStoryModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}

// ── Create Story Card ─────────────────────────────────────────────────────────
function CreateStoryCard({ user, hasOwnStory, onClick }) {
  const avatarUrl = user?.avatar?.url;
  const name = user?.fullName || user?.username || "";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={hasOwnStory ? "View your story" : "Create a story"}
      className={cn(
        "flex flex-col items-center gap-1.5 flex-shrink-0 w-[72px] group",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
      )}
    >
      <span className="relative flex h-[62px] w-[62px] items-center justify-center">
        {/* Gradient ring when user has own story */}
        <span
          className={cn(
            "absolute inset-0 rounded-full p-[2.5px]",
            hasOwnStory ? "story-ring-unseen" : "bg-transparent"
          )}
        />
        <Avatar className={cn("relative z-10 h-[54px] w-[54px] ring-2 ring-background", !hasOwnStory && "border-2 border-dashed border-primary/40")}>
          {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
          <AvatarFallback className="bg-secondary text-sm font-medium">
            {initials(name) || "?"}
          </AvatarFallback>
        </Avatar>

        {/* Plus badge */}
        {!hasOwnStory && (
          <span
            className="absolute bottom-0 right-0 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-ember to-primary shadow-md ring-2 ring-background"
            aria-hidden="true"
          >
            <Plus className="h-3 w-3 text-white" />
          </span>
        )}
      </span>

      <span className="text-[11px] leading-tight text-center w-full truncate px-1 text-muted-foreground group-hover:text-foreground transition-colors">
        {hasOwnStory ? "Your story" : "Add story"}
      </span>
    </button>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function StoriesSkeleton() {
  return (
    <div className="glass-panel px-4 py-3">
      <div className="flex gap-4 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0 w-[72px]">
            <Skeleton className="h-[62px] w-[62px] rounded-full" />
            <Skeleton className="h-2.5 w-12 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
