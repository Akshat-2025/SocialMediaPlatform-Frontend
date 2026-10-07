"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { authApi } from "./api";
import { setUser, clearUser, setAuthLoading, patchUser } from "@/store/slices/authSlice";
import { apiErrorMessage } from "@/lib/axios";
import { getSocket, disconnectSocket } from "@/lib/socket";

/**
 * Bootstraps auth state on app load by calling GET /auth/me. The cookie is
 * httpOnly so this is the only way the client can know whether a session
 * exists. Also connects the socket once a user is confirmed.
 */
export function useCurrentUser() {
  const dispatch = useDispatch();

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      dispatch(setAuthLoading());
      try {
        const data = await authApi.me();
        dispatch(setUser(data.user));
        const socket = getSocket();
        if (!socket.connected) socket.connect();
        return data.user;
      } catch (error) {
        dispatch(clearUser());
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      dispatch(setUser(data.user));
      queryClient.setQueryData(["auth", "me"], data.user);
      const socket = getSocket();
      if (!socket.connected) socket.connect();
      toast.success(data.message || "Logged in successfully");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
}

export function useRegister() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      dispatch(setUser(data.user));
      queryClient.setQueryData(["auth", "me"], data.user);
      const socket = getSocket();
      if (!socket.connected) socket.connect();
      toast.success(data.message || "Welcome!");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
}

export function useLogout() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      dispatch(clearUser());
      disconnectSocket();
      queryClient.clear();
      toast.success("Logged out");
    },
  });
}

export function useUpdateProfile() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (data) => {
      dispatch(setUser(data.user));
      queryClient.setQueryData(["auth", "me"], data.user);
      toast.success(data.message || "Profile updated");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
}

export function useUploadAvatar() {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: authApi.uploadAvatar,
    onSuccess: (data) => {
      dispatch(patchUser({ avatar: data.avatar }));
      toast.success(data.message || "Avatar updated");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
}

export function useRemoveAvatar() {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: authApi.removeAvatar,
    onSuccess: (data) => {
      dispatch(patchUser({ avatar: data.avatar }));
      toast.success(data.message || "Avatar removed");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
}
