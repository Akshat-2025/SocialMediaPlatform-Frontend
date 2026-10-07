"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageSpinner } from "@/components/shared/Spinner";
import { InfiniteScrollTrigger } from "@/components/shared/InfiniteScrollTrigger";
import { useMarkAllNotificationsRead, useNotifications, useUnreadCount } from "@/features/notifications/hooks";

export default function NotificationsPage() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useNotifications();
  const { mutate: markAll, isPending } = useMarkAllNotificationsRead();
  const unreadCount = useUnreadCount();
  const notifications = data?.pages.flatMap((p) => p.notifications) || [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold">Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" disabled={isPending} onClick={() => markAll()}>
            Mark all as read
          </Button>
        )}
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="Nothing here yet" description="Likes, comments, and new followers will show up here." />
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
          {notifications.map((n) => (
            <NotificationItem key={n._id} notification={n} />
          ))}
        </div>
      )}

      <InfiniteScrollTrigger onLoadMore={fetchNextPage} hasMore={!!hasNextPage} isFetching={isFetchingNextPage} />
    </div>
  );
}
