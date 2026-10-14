"use client";

import { useRef, useState } from "react";
import { ImagePlus, Video, X, Upload, AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCreateStory } from "@/features/stories/hooks";
import { cn } from "@/lib/utils";

// Mirror the backend's real limits (env defaults if not overridden)
const MAX_IMAGE_MB = 10;
const MAX_VIDEO_MB = 50;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

/**
 * Create Story Modal
 *
 * Props:
 *   open    – boolean
 *   onClose – callback
 */
export function CreateStoryModal({ open, onClose }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState("");
  const [validationError, setValidationError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const { mutate: createStory, isPending } = useCreateStory();

  function handleClose() {
    if (isPending) return; // prevent accidental close during upload
    resetState();
    onClose();
  }

  function resetState() {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCaption("");
    setValidationError("");
    setUploadProgress(0);
  }

  function handleFileChange(e) {
    const selected = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!selected) return;
    const error = validateFile(selected);
    if (error) { setValidationError(error); return; }
    setValidationError("");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  }

  function validateFile(f) {
    if (!ALLOWED_TYPES.includes(f.type)) {
      return "Only JPEG/PNG/WebP images or MP4/MOV/WebM videos are allowed.";
    }
    const isVideo = ALLOWED_VIDEO_TYPES.includes(f.type);
    const limitMb = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB;
    if (f.size > limitMb * 1024 * 1024) {
      return `${isVideo ? "Video" : "Image"} must be under ${limitMb} MB.`;
    }
    return "";
  }

  function handleSubmit() {
    if (!file || isPending) return;
    const error = validateFile(file);
    if (error) { setValidationError(error); return; }

    createStory(
      { media: file, caption },
      {
        onSuccess: () => {
          resetState();
          onClose();
        },
        onError: () => {
          setUploadProgress(0);
        },
      }
    );
  }

  const isVideo = file && ALLOWED_VIDEO_TYPES.includes(file.type);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Story</DialogTitle>
          <DialogDescription>
            Share a photo or video for 24 hours. Max {MAX_IMAGE_MB} MB for images, {MAX_VIDEO_MB} MB for videos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop zone / Preview */}
          <div
            className={cn(
              "relative rounded-xl border-2 border-dashed overflow-hidden transition-colors",
              file
                ? "border-primary/40 bg-transparent"
                : "border-border bg-secondary/40 hover:border-primary/40 cursor-pointer"
            )}
            style={{ aspectRatio: "9/16", maxHeight: 420 }}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            {!file && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <div className="flex gap-3">
                  <ImagePlus className="h-8 w-8 text-primary/60" />
                  <Video className="h-8 w-8 text-accent/60" />
                </div>
                <p className="text-sm font-medium">Tap to choose a photo or video</p>
                <p className="text-xs">JPEG · PNG · WebP · MP4 · MOV · WebM</p>
              </div>
            )}

            {file && !isVideo && previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Story preview"
                className="h-full w-full object-cover"
              />
            )}

            {file && isVideo && previewUrl && (
              <video
                src={previewUrl}
                className="h-full w-full object-cover"
                muted
                playsInline
                loop
                autoPlay
              />
            )}

            {/* Remove file button */}
            {file && (
              <button
                type="button"
                aria-label="Remove media"
                onClick={(e) => { e.stopPropagation(); resetState(); }}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Replace media button (when file is chosen) */}
          {file && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              Replace media
            </Button>
          )}

          {/* Caption */}
          <div>
            <label
              htmlFor="story-caption"
              className="text-xs font-medium text-muted-foreground mb-1 block"
            >
              Caption (optional, max 200 chars)
            </label>
            <input
              id="story-caption"
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value.slice(0, 200))}
              placeholder="Say something about your story…"
              className="w-full rounded-lg bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring border border-border"
            />
          </div>

          {/* Validation error */}
          {validationError && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Upload progress bar (visible during upload) */}
          {isPending && (
            <div className="space-y-1">
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-ember to-primary transition-all duration-200"
                  style={{ width: `${uploadProgress || 30}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">Uploading…</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 bg-gradient-to-r from-ember to-primary shadow-lg shadow-ember/20 hover:brightness-110"
              onClick={handleSubmit}
              disabled={!file || isPending}
              id="create-story-submit"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Post Story
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
