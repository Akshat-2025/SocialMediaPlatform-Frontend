"use client";

import Link from "next/link";
import { Heart, MessageCircle, UserPlus } from "lucide-react";
import { UserAvatar } from "@/components/users/UserAvatar";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { cn } from "@/lib/utils";
import { useMarkNotificationRead } from "@/features/notifications/hooks";

const META = {
  like: { icon: Heart, verb: "liked your post", iconClass: "text-ember" },
  comment: { icon: MessageCircle, verb: "commented on your post", iconClass: "text-primary" },
  follow: { icon: UserPlus, verb: "started following you", iconClass: "text-primary" },
};

export function NotificationItem({ notification }) {
  const { mutate: markRead } = useMarkNotificationRead();
  const meta = META[notification.type] || META.follow;
  const Icon = meta.icon;

  const href =
    notification.type === "follow"
      ? `/profile/${notification.sender?.username}`
      : notification.post
      ? `/post/${notification.post._id || notification.post}`
      : "#";

  return (
    <Link
      href={href}
      onClick={() => !notification.read && markRead(notification._id)}
      className={cn(
        "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-secondary",
        !notification.read && "bg-primary/5"
      )}
    >
      <span className="relative">
        <UserAvatar user={notification.sender} size="md" href={undefined} />
        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-card ring-1 ring-border">
          <Icon className={cn("h-3 w-3", meta.iconClass)} />
        </span>
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="font-medium">{notification.sender?.fullName}</span>{" "}
          <span className="text-muted-foreground">{meta.verb}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          <RelativeTime date={notification.createdAt} />
        </p>
      </div>
      {!notification.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ember" />}
    </Link>
  );
}
