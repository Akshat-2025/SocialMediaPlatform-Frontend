"use client";

import { useEffect } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notificationsApi } from "./api";
import { getSocket } from "@/lib/socket";

const nextPageParam = (lastPage) =>
  lastPage.pagination.page < lastPage.pagination.totalPages
    ? lastPage.pagination.page + 1
    : undefined;

export function useNotifications() {
  return useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) => notificationsApi.getNotifications({ pageParam }),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
  });
}

/** Reads the unread count off the first cached page, without a network call. */
export function useUnreadCount() {
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData(["notifications"]);
  return data?.pages?.[0]?.unreadCount ?? 0;
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

const VERB = { like: "liked your post", comment: "commented on your post", follow: "started following you" };

/** Subscribes to `notification:new`, refreshes the list, and toasts it. */
export function useLiveNotifications(currentUserId) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!currentUserId) return;
    const socket = getSocket();

    const handleNew = (notification) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      const name = notification.sender?.fullName || notification.sender?.username || "Someone";
      toast(`${name} ${VERB[notification.type] || "sent a notification"}`);
    };

    socket.on("notification:new", handleNew);
    return () => socket.off("notification:new", handleNew);
  }, [currentUserId, queryClient]);
}
