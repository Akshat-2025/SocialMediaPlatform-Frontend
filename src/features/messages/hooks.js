"use client";

import { useEffect } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { messagesApi } from "./api";
import { apiErrorMessage } from "@/lib/axios";
import { getSocket } from "@/lib/socket";

const nextPageParam = (lastPage) =>
  lastPage.pagination.page < lastPage.pagination.totalPages
    ? lastPage.pagination.page + 1
    : undefined;

export function useConversations() {
  return useInfiniteQuery({
    queryKey: ["messages", "conversations"],
    queryFn: ({ pageParam }) => messagesApi.getConversations({ pageParam }),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
  });
}

export function useOrCreateConversation() {
  return useMutation({
    mutationFn: messagesApi.getOrCreateConversation,
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
}

// Each page holds newest-first messages (matches backend sort). Consumers
// should flatten + reverse pages for chronological chat rendering.
export function useMessages(conversationId) {
  return useInfiniteQuery({
    queryKey: ["messages", "thread", conversationId],
    queryFn: ({ pageParam }) => messagesApi.getMessages(conversationId, { pageParam }),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
    enabled: !!conversationId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: messagesApi.sendMessage,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["messages", "thread", variables.conversationId], (old) => {
        if (!old) return old;
        const pages = [...old.pages];
        pages[0] = { ...pages[0], messages: [data.message, ...pages[0].messages] };
        return { ...old, pages };
      });
      queryClient.invalidateQueries({ queryKey: ["messages", "conversations"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: messagesApi.markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", "conversations"] });
    },
  });
}

/**
 * Subscribes to `message:new` for the lifetime of the mounting component and
 * pushes incoming messages straight into the relevant thread + conversation
 * list caches. Mount this once near the root of the messages section.
 */
export function useLiveMessages(currentUserId) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!currentUserId) return;
    const socket = getSocket();

    const handleNewMessage = ({ conversationId, message }) => {
      queryClient.setQueryData(["messages", "thread", conversationId], (old) => {
        if (!old) return old;
        const pages = [...old.pages];
        pages[0] = { ...pages[0], messages: [message, ...pages[0].messages] };
        return { ...old, pages };
      });
      queryClient.invalidateQueries({ queryKey: ["messages", "conversations"] });
    };

    socket.on("message:new", handleNewMessage);
    return () => socket.off("message:new", handleNewMessage);
  }, [currentUserId, queryClient]);
}
