import Image from "next/image";
import { cn } from "@/lib/utils";

export function PostImages({ images }) {
  if (!images?.length) return null;

  const count = images.length;

  return (
    <div
      className={cn(
        "grid gap-0.5 overflow-hidden rounded-md border border-border",
        count === 1 && "grid-cols-1",
        count === 2 && "grid-cols-2",
        count === 3 && "grid-cols-2",
        count === 4 && "grid-cols-2"
      )}
    >
      {images.map((img, i) => (
        <div
          key={img.publicId || i}
          className={cn(
            "relative bg-muted",
            count === 1 ? "aspect-[4/3]" : "aspect-square",
            count === 3 && i === 0 && "row-span-2 aspect-auto"
          )}
        >
          <Image
            src={img.url}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 600px"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
