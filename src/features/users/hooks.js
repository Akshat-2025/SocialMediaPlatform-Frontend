"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usersApi } from "./api";
import { apiErrorMessage } from "@/lib/axios";

const nextPageParam = (lastPage) =>
  lastPage.pagination.page < lastPage.pagination.totalPages
    ? lastPage.pagination.page + 1
    : undefined;

export function useUserProfile(username) {
  return useQuery({
    queryKey: ["users", "profile", username],
    queryFn: () => usersApi.getProfile(username).then((d) => d.user),
    enabled: !!username,
  });
}

export function useFollowers(id) {
  return useInfiniteQuery({
    queryKey: ["users", "followers", id],
    queryFn: ({ pageParam }) => usersApi.getFollowers(id, { pageParam }),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
    enabled: !!id,
  });
}

export function useFollowing(id) {
  return useInfiniteQuery({
    queryKey: ["users", "following", id],
    queryFn: ({ pageParam }) => usersApi.getFollowing(id, { pageParam }),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
    enabled: !!id,
  });
}

export function useToggleFollow(username) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.toggleFollow,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["users", "profile", username] });
      const previous = queryClient.getQueryData(["users", "profile", username]);
      if (previous) {
        queryClient.setQueryData(["users", "profile", username], {
          ...previous,
          isFollowing: !previous.isFollowing,
          followersCount: previous.followersCount + (previous.isFollowing ? -1 : 1),
        });
      }
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["users", "profile", username], context.previous);
      }
      toast.error(apiErrorMessage(error));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "profile", username] });
    },
  });
}
