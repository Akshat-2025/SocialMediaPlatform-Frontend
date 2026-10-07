"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserAvatar } from "@/components/users/UserAvatar";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export function ConversationListItem({ conversation }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const other = conversation.participants.find((p) => p._id !== user?.id);
  const isActive = pathname === `/messages/${conversation._id}`;
  const lastMessage = conversation.lastMessage;
  const unread = lastMessage && lastMessage.sender !== user?.id && !lastMessage.readBy?.includes(user?.id);

  if (!other) return null;

  return (
    <Link
      href={`/messages/${conversation._id}`}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-secondary",
        isActive && "bg-secondary"
      )}
    >
      <UserAvatar user={other} size="md" href={undefined} showOnline />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium">{other.fullName}</p>
          {conversation.lastMessageAt && (
            <span className="shrink-0 text-[11px] text-muted-foreground">
              <RelativeTime date={conversation.lastMessageAt} />
            </span>
          )}
        </div>
        <p className={cn("truncate text-xs", unread ? "font-medium text-foreground" : "text-muted-foreground")}>
          {lastMessage?.content || "Say hello \u{1F44B}"}
        </p>
      </div>
      {unread && <span className="h-2 w-2 shrink-0 rounded-full bg-ember" />}
    </Link>
  );
}
