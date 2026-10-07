"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSocket } from "@/lib/socket";
import { userCameOnline, userWentOffline, selectOnlineUserIds } from "@/store/slices/uiSlice";

/** Mount once near the app root; tracks presence events into Redux. */
export function useOnlineStatusSubscription() {
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = getSocket();
    const onOnline = ({ userId }) => dispatch(userCameOnline(userId));
    const onOffline = ({ userId }) => dispatch(userWentOffline(userId));

    socket.on("user:online", onOnline);
    socket.on("user:offline", onOffline);
    return () => {
      socket.off("user:online", onOnline);
      socket.off("user:offline", onOffline);
    };
  }, [dispatch]);
}

export function useIsUserOnline(userId) {
  const onlineIds = useSelector(selectOnlineUserIds);
  return onlineIds.includes(userId);
}
