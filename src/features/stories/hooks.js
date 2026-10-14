"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { storiesApi } from "./api";
import { apiErrorMessage } from "@/lib/axios";

export const STORIES_FEED_KEY = ["stories", "feed"];

/** Fetches the horizontal story tray data. staleTime = 60 s to avoid hammering the backend. */
export function useStoriesFeed() {
  return useQuery({
    queryKey: STORIES_FEED_KEY,
    queryFn: storiesApi.getFeed,
    staleTime: 60 * 1000,
    select: (data) => data.storyGroups ?? [],
  });
}

/** Creates a new story and invalidates the feed so the tray refreshes. */
export function useCreateStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: storiesApi.createStory,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: STORIES_FEED_KEY });
      toast.success(data.message || "Story posted!");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
}

/**
 * Records a view for a single story.
 * Returns the mutation directly — callers are responsible for calling mutate
 * at the right time (after the story becomes visible, not on every render).
 * We never show a toast here; it's a silent background action.
 */
export function useRecordView() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: storiesApi.recordView,
    onSuccess: (data, storyId) => {
      // Patch the cached feed so hasViewed flips immediately without a refetch
      queryClient.setQueryData(STORIES_FEED_KEY, (old) => {
        if (!old) return old;
        return {
          ...old,
          storyGroups: (old.storyGroups ?? []).map((group) => ({
            ...group,
            stories: group.stories.map((s) =>
              s.id === storyId
                ? { ...s, hasViewed: true, viewsCount: data.viewsCount ?? s.viewsCount }
                : s
            ),
            hasUnseen: group.stories.some(
              (s) => !s.hasViewed && s.id !== storyId
            ),
          })),
        };
      });
    },
    // Silently ignore errors — a failed view record should not interrupt the viewer UX
    onError: () => {},
  });
}

/** Owner-only: fetch the viewer list for a single story. */
export function useStoryViewers(storyId, enabled = false) {
  return useQuery({
    queryKey: ["stories", "viewers", storyId],
    queryFn: () => storiesApi.getViewers(storyId),
    enabled: !!storyId && enabled,
    staleTime: 30 * 1000,
  });
}

/** Deletes a story and refreshes the feed. */
export function useDeleteStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: storiesApi.deleteStory,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: STORIES_FEED_KEY });
      toast.success(data.message || "Story deleted");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
}
