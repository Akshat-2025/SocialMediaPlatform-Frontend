"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useUpdatePost } from "@/features/posts/hooks";

export function EditPostDialog({ post, open, onOpenChange }) {
  const [content, setContent] = useState(post.content || "");
  const [removeImageIds, setRemoveImageIds] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const { mutate, isPending } = useUpdatePost();

  const remainingImages = post.images.filter((img) => !removeImageIds.includes(img.publicId));

  const handleSubmit = () => {
    mutate(
      { id: post._id, content, removeImageIds, images: newImages },
      {
        onSuccess: () => {
          onOpenChange(false);
          setNewImages([]);
          setRemoveImageIds([]);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit post</DialogTitle>
        </DialogHeader>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="What's on your mind?"
        />

        {remainingImages.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {remainingImages.map((img) => (
              <div key={img.publicId} className="relative aspect-square rounded-md overflow-hidden border border-border">
                <Image src={img.url} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setRemoveImageIds((ids) => [...ids, img.publicId])}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {remainingImages.length + newImages.length < 4 && (
          <label className="inline-flex w-fit cursor-pointer items-center rounded-md border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary">
            Add image
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setNewImages((prev) => [...prev, ...files].slice(0, 4 - remainingImages.length));
              }}
            />
          </label>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
