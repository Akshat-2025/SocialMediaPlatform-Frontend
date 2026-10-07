"use client";

import { useSelector } from "react-redux";
import { selectAuthStatus, selectCurrentUser } from "@/store/slices/authSlice";

export function useAuth() {
  const user = useSelector(selectCurrentUser);
  const status = useSelector(selectAuthStatus);

  return {
    user,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading" || status === "idle",
  };
}
