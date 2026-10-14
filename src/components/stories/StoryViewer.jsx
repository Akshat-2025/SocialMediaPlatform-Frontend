"use client";

import { useEffect, useRef, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import { StoryProgress } from "./StoryProgress";
import { StoryViewersList } from "./StoryViewersList";
import { useRecordView, useDeleteStory } from "@/features/stories/hooks";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// How long (ms) to show a single image story before auto-advancing
const IMAGE_DURATION_MS = 5000;

/**
 * Full-screen story viewer.
 *
 * Props:
 *  groups       – the full storyGroups array from the feed
 *  groupIndex   – which group to start on
 *  storyIndex   – which story within that group to start on
 *  onClose      – called when the viewer should close
 */
export function StoryViewer({ groups, groupIndex: initialGroupIndex, storyIndex: initialStoryIndex, onClose }) {
  const { user } = useAuth();
  const { mutate: recordView } = useRecordView();
  const { mutate: deleteStory, isPending: isDeleting } = useDeleteStory();

  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(initialStoryIndex);
  const [elapsed, setElapsed] = useState(0); // 0..1
  const [isPaused, setIsPaused] = useState(false);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showViewers, setShowViewers] = useState(false);

  const videoRef = useRef(null);
  const rafRef = useRef(null);
  const startTsRef = useRef(null);   // timestamp when current segment started
  const elapsedMsRef = useRef(0);   // ms already consumed (e.g. before a pause)
  const viewedRef = useRef(new Set()); // storyIds already recorded in this session

  const group = groups[groupIndex];
  const story = group?.stories[storyIndex];
  const isOwner = story && (user?.id === group?.user?.id?.toString());
  const isVideo = story?.mediaType === "video";
  const totalInGroup = group?.stories.length ?? 0;

  // ─── Record view once per story, per session ────────────────────────────────
  useEffect(() => {
    if (!story?.id || isOwner) return;
    if (viewedRef.current.has(story.id)) return;
    viewedRef.current.add(story.id);
    recordView(story.id);
  }, [story?.id, isOwner, recordView]);

  // ─── Reset per-story state when story changes ────────────────────────────────
  useEffect(() => {
    setElapsed(0);
    elapsedMsRef.current = 0;
    startTsRef.current = null;
    setMediaLoaded(false);
    setMediaError(false);
    setIsPaused(false);
  }, [groupIndex, storyIndex]);

  // ─── Progress ticker ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!story || !mediaLoaded) return;

    const duration = isVideo
      ? (story.duration ? story.duration * 1000 : IMAGE_DURATION_MS)
      : IMAGE_DURATION_MS;

    const tick = (ts) => {
      if (isPaused || !mediaLoaded) {
        startTsRef.current = null; // reset so we resume from the right spot
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (!startTsRef.current) startTsRef.current = ts;
      const delta = ts - startTsRef.current;
      startTsRef.current = ts;
      elapsedMsRef.current = Math.min(elapsedMsRef.current + delta, duration);
      const newElapsed = elapsedMsRef.current / duration;
      setElapsed(newElapsed);

      if (newElapsed >= 1) {
        advance(1);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id, mediaLoaded, isPaused, isVideo]);

  // ─── Page visibility: pause when hidden ─────────────────────────────────────
  useEffect(() => {
    const handleVisibility = () => setIsPaused(document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // ─── Keyboard navigation ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") advance(1);
      if (e.key === "ArrowLeft") advance(-1);
      if (e.key === " ") { e.preventDefault(); setIsPaused((p) => !p); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [groupIndex, storyIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Video: sync paused state & end-event ───────────────────────────────────
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !isVideo) return;
    const onEnd = () => advance(1);
    const onCanPlay = () => setMediaLoaded(true);
    vid.addEventListener("ended", onEnd);
    vid.addEventListener("canplay", onCanPlay);
    return () => {
      vid.removeEventListener("ended", onEnd);
      vid.removeEventListener("canplay", onCanPlay);
    };
  }, [story?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !isVideo) return;
    if (isPaused) vid.pause();
    else if (mediaLoaded) vid.play().catch(() => {});
  }, [isPaused, mediaLoaded, isVideo]);

  // ─── Navigation ─────────────────────────────────────────────────────────────
  function advance(dir) {
    cancelAnimationFrame(rafRef.current);
    const nextStory = storyIndex + dir;
    if (nextStory >= 0 && nextStory < totalInGroup) {
      setStoryIndex(nextStory);
      return;
    }
    // Move to the adjacent group
    const nextGroup = groupIndex + dir;
    if (nextGroup >= 0 && nextGroup < groups.length) {
      setGroupIndex(nextGroup);
      setStoryIndex(dir > 0 ? 0 : groups[nextGroup].stories.length - 1);
    } else {
      // Reached the very end or beginning
      onClose();
    }
  }

  if (!story) return null;

  const authorName = group.user.fullName || group.user.username;
  const avatarUrl = group.user.avatar?.url;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
      role="dialog"
      aria-label="Story viewer"
      aria-modal="true"
    >
      {/* ── Media layer ────────────────────────────────────────────────────── */}
      <div className="relative h-full w-full max-w-md mx-auto">
        {/* Background blur/gradient overlay for edges */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70 z-10 pointer-events-none" />

        {/* Loading state */}
        {!mediaLoaded && !mediaError && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-white/70" />
          </div>
        )}

        {/* Error state */}
        {mediaError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 text-white/70">
            <AlertCircle className="h-10 w-10" />
            <p className="text-sm">Could not load media</p>
          </div>
        )}

        {/* Image */}
        {!isVideo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={story.id}
            src={story.mediaUrl}
            alt={story.caption || "Story"}
            className="h-full w-full object-cover"
            onLoad={() => setMediaLoaded(true)}
            onError={() => { setMediaLoaded(true); setMediaError(true); }}
          />
        )}

        {/* Video */}
        {isVideo && (
          <video
            ref={videoRef}
            key={story.id}
            src={story.mediaUrl}
            className="h-full w-full object-cover"
            playsInline
            autoPlay
            muted={muted}
            onError={() => { setMediaLoaded(true); setMediaError(true); }}
          />
        )}

        {/* ── Tap zones ─────────────────────────────────────────────────────── */}
        <button
          aria-label="Previous story"
          className="absolute left-0 top-0 h-full w-1/3 z-30 focus:outline-none"
          onClick={() => advance(-1)}
        />
        <button
          aria-label="Next story"
          className="absolute right-0 top-0 h-full w-1/3 z-30 focus:outline-none"
          onClick={() => advance(1)}
        />

        {/* ── Top HUD ───────────────────────────────────────────────────────── */}
        <div className="absolute top-0 left-0 right-0 z-40 px-3 pt-3 space-y-2">
          {/* Progress bars */}
          <StoryProgress
            count={totalInGroup}
            current={storyIndex}
            elapsed={elapsed}
            isPaused={isPaused || !mediaLoaded}
          />

          {/* Author row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9 ring-2 ring-white/50">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={authorName} />}
                <AvatarFallback className="text-xs bg-secondary">{initials(authorName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">{authorName}</p>
                <p className="text-[11px] text-white/60">
                  {formatDistanceToNowStrict(new Date(story.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              {/* Pause / resume tap helper */}
              <button
                aria-label={isPaused ? "Resume story" : "Pause story"}
                onClick={() => setIsPaused((p) => !p)}
                className="rounded-full p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                {isPaused ? (
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                ) : (
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                )}
              </button>

              {/* Mute toggle for videos */}
              {isVideo && (
                <button
                  aria-label={muted ? "Unmute" : "Mute"}
                  onClick={() => setMuted((m) => !m)}
                  className="rounded-full p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              )}

              {/* Owner: views + delete */}
              {isOwner && (
                <>
                  <button
                    aria-label="View viewers"
                    onClick={() => setShowViewers((v) => !v)}
                    className="rounded-full p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="text-xs font-medium text-white/80">{story.viewsCount}</span>
                  </button>

                  <DeleteStoryButton
                    storyId={story.id}
                    isPending={isDeleting}
                    onDeleted={() => {
                      // After delete, try to move to the next story or close
                      if (totalInGroup > 1) {
                        const next = storyIndex > 0 ? storyIndex - 1 : storyIndex + 1 < totalInGroup ? storyIndex + 1 : -1;
                        if (next >= 0) { setStoryIndex(next); return; }
                      }
                      onClose();
                    }}
                    deleteStory={deleteStory}
                  />
                </>
              )}

              {/* Close */}
              <button
                aria-label="Close story viewer"
                onClick={onClose}
                className="rounded-full p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Caption ───────────────────────────────────────────────────────── */}
        {story.caption && (
          <div className="absolute bottom-0 left-0 right-0 z-40 px-4 pb-8">
            <p className="text-sm text-white/90 text-center drop-shadow-md">{story.caption}</p>
          </div>
        )}

        {/* ── Viewer list panel (owner-only) ────────────────────────────────── */}
        {isOwner && showViewers && (
          <div className="absolute inset-x-0 bottom-0 z-50">
            <StoryViewersList
              storyId={story.id}
              viewsCount={story.viewsCount}
              onClose={() => setShowViewers(false)}
            />
          </div>
        )}
      </div>

      {/* ── Desktop side arrows ───────────────────────────────────────────── */}
      <button
        aria-label="Previous story"
        onClick={() => advance(-1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-50 hidden sm:flex items-center justify-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        aria-label="Next story"
        onClick={() => advance(1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 hidden sm:flex items-center justify-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

// ── Isolated delete confirmation so it doesn't unmount the main viewer ────────
function DeleteStoryButton({ storyId, isPending, onDeleted, deleteStory }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          aria-label="Delete story"
          disabled={isPending}
          className="rounded-full p-1.5 text-white/70 hover:text-red-400 hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete story?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove the story and its media from our servers. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => deleteStory(storyId, { onSuccess: onDeleted })}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
