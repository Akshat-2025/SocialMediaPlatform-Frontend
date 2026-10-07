"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/users/UserAvatar";
import { useAuth } from "@/hooks/useAuth";
import { useCreatePost } from "@/features/posts/hooks";

export function PostComposer() {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const { mutate, isPending } = useCreatePost();

  const previews = images.map((file) => URL.createObjectURL(file));
  const canPost = (content.trim().length > 0 || images.length > 0) && !isPending;

  const handleSubmit = () => {
    mutate(
      { content, images },
      {
        onSuccess: () => {
          setContent("");
          setImages([]);
        },
      }
    );
  };

  if (!user) return null;

  return (
    <Card className="spine glow-ring p-5 pl-6 space-y-4">
      <div className="flex gap-3">
        <UserAvatar user={user} size="md" href={undefined} />
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write something worth marking in the margin..."
          rows={3}
          maxLength={2000}
          className="border-0 px-0 resize-none focus-visible:ring-0 shadow-none"
        />
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-4 gap-2 pl-12">
          {previews.map((src, i) => (
            <div key={src} className="relative aspect-square rounded-md overflow-hidden border border-border">
              <Image src={src} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => setImages((imgs) => imgs.filter((_, idx) => idx !== i))}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pl-12">
        <label
          className={`inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground hover:text-primary ${
            images.length >= 4 ? "pointer-events-none opacity-40" : ""
          }`}
        >
          <ImagePlus className="h-[18px] w-[18px]" />
          Photo
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              setImages((prev) => [...prev, ...files].slice(0, 4));
            }}
          />
        </label>
        <Button size="sm" disabled={!canPost} onClick={handleSubmit}>
          Post
        </Button>
      </div>
    </Card>
  );
}
