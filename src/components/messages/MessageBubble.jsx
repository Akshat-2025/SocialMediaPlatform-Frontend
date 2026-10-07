import { cn } from "@/lib/utils";
import { RelativeTime } from "@/components/shared/RelativeTime";

export function MessageBubble({ message, isOwn }) {
  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-secondary text-secondary-foreground rounded-bl-sm"
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p
          className={cn(
            "mt-0.5 text-[10px]",
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          <RelativeTime date={message.createdAt} />
        </p>
      </div>
    </div>
  );
}
