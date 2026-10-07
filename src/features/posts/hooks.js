"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { postsApi } from "./api";
import { apiErrorMessage } from "@/lib/axios";

const nextPageParam = (lastPage) =>
  lastPage.pagination.page < lastPage.pagination.totalPages
    ? lastPage.pagination.page + 1
    : undefined;

export function useFeed() {
  return useInfiniteQuery({
    queryKey: ["posts", "feed"],
    queryFn: ({ pageParam }) => postsApi.getFeed({ pageParam }),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
  });
}

export function useUserPosts(userId) {
  return useInfiniteQuery({
    queryKey: ["posts", "user", userId],
    queryFn: ({ pageParam }) => postsApi.getUserPosts(userId, { pageParam }),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
    enabled: !!userId,
  });
}

export function usePost(id) {
  return useQuery({
    queryKey: ["posts", "detail", id],
    queryFn: () => postsApi.getPost(id).then((d) => d.post),
    enabled: !!id,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postsApi.createPost,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "user", data.post.author.id] });
      toast.success(data.message || "Post created");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postsApi.updatePost,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success(data.message || "Post updated");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postsApi.deletePost,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success(data.message || "Post deleted");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
}

// Patches every cached page/collection that could contain this post so the
// like count + heart state update everywhere at once (feed, profile, detail).
function patchPostInCaches(queryClient, postId, updater) {
  queryClient.setQueriesData({ queryKey: ["posts"] }, (old) => {
    if (!old) return old;
    if (old.pages) {
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          posts: page.posts?.map((p) => (p._id === postId ? updater(p) : p)),
        })),
      };
    }
    if (old._id === postId) return updater(old);
    return old;
  });
}

export function useToggleLike(currentUserId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postsApi.toggleLike,
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      patchPostInCaches(queryClient, postId, (p) => {
        const alreadyLiked = p.likes?.some((id) => id === currentUserId || id?._id === currentUserId);
        return {
          ...p,
          likes: alreadyLiked
            ? p.likes.filter((id) => id !== currentUserId && id?._id !== currentUserId)
            : [...(p.likes || []), currentUserId],
        };
      });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
    onSettled: (_data, _err, postId) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useComments(postId) {
  return useInfiniteQuery({
    queryKey: ["comments", postId],
    queryFn: ({ pageParam }) => postsApi.getComments(postId, { pageParam }),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
    enabled: !!postId,
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postsApi.addComment,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postsApi.updateComment,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
      toast.success("Comment updated");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postsApi.deleteComment,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Comment deleted");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
}
