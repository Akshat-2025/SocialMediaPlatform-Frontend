"use client";

import { Button } from "@/components/ui/button";
import { useToggleFollow } from "@/features/users/hooks";
import { useAuth } from "@/hooks/useAuth";

export function FollowButton({ profile, size = "default" }) {
  const { user: currentUser } = useAuth();
  const { mutate, isPending } = useToggleFollow(profile.username);

  if (!currentUser || currentUser.id === profile.id) return null;

  return (
    <Button
      size={size}
      variant={profile.isFollowing ? "outline" : "default"}
      disabled={isPending}
      onClick={() => mutate(profile.id)}
    >
      {profile.isFollowing ? "Following" : "Follow"}
    </Button>
  );
}
