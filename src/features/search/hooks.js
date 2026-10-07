"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { searchApi } from "./api";

const nextPageParam = (lastPage) =>
  lastPage.pagination.page < lastPage.pagination.totalPages
    ? lastPage.pagination.page + 1
    : undefined;

export function useSearchUsers(q) {
  return useInfiniteQuery({
    queryKey: ["search", "users", q],
    queryFn: ({ pageParam }) => searchApi.searchUsers(q, { pageParam }),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
    enabled: !!q?.trim(),
  });
}

export function useSearchPosts(q) {
  return useInfiniteQuery({
    queryKey: ["search", "posts", q],
    queryFn: ({ pageParam }) => searchApi.searchPosts(q, { pageParam }),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
    enabled: !!q?.trim(),
  });
}
