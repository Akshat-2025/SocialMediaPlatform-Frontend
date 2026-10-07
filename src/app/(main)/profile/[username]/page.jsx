"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { CalendarDays, FileQuestion, NotebookPen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/users/UserAvatar";
import { FollowButton } from "@/components/users/FollowButton";
import { MessageButton } from "@/components/messages/MessageButton";
import { UserListDialog } from "@/components/users/UserListDialog";
import { PostCard } from "@/components/posts/PostCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageSpinner } from "@/components/shared/Spinner";
import { InfiniteScrollTrigger } from "@/components/shared/InfiniteScrollTrigger";
import { useUserProfile } from "@/features/users/hooks";
import { useUserPosts } from "@/features/posts/hooks";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const { data: profile, isLoading } = useUserProfile(username);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: postsLoading } =
    useUserPosts(profile?.id);
  const [listDialog, setListDialog] = useState(null); // "followers" | "following" | null

  if (isLoading) return <PageSpinner />;

  if (!profile) {
    return <EmptyState icon={FileQuestion} title="User not found" description="This profile doesn't exist." />;
  }

  const posts = data?.pages.flatMap((p) => p.posts) || [];
  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="space-y-6">
      <Card className="spine overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/5" />
        <div className="px-5 pb-5">
          <div className="-mt-10 flex items-end justify-between">
            <UserAvatar user={profile} size="xl" href={undefined} className="ring-4 ring-card" />
            {isOwnProfile ? (
              <Button variant="outline" size="sm" asChild>
                <a href="/settings">Edit profile</a>
              </Button>
            ) : (
              <div className="flex gap-2">
                <MessageButton userId={profile.id} />
                <FollowButton profile={profile} />
              </div>
            )}
          </div>

          <div className="mt-3">
            <h1 className="font-display text-xl font-semibold">{profile.fullName}</h1>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          </div>

          {profile.bio && <p className="mt-3 text-sm leading-relaxed">{profile.bio}</p>}

          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            Joined {format(new Date(profile.createdAt), "MMMM yyyy")}
          </p>

          <div className="mt-4 flex gap-5 text-sm">
            <button onClick={() => setListDialog("followers")} className="hover:underline">
              <span className="font-semibold">{profile.followersCount}</span>{" "}
              <span className="text-muted-foreground">Followers</span>
            </button>
            <button onClick={() => setListDialog("following")} className="hover:underline">
              <span className="font-semibold">{profile.followingCount}</span>{" "}
              <span className="text-muted-foreground">Following</span>
            </button>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {postsLoading ? (
          <PageSpinner />
        ) : posts.length === 0 ? (
          <EmptyState icon={NotebookPen} title="No posts yet" />
        ) : (
          posts.map((post) => <PostCard key={post._id} post={post} />)
        )}
        <InfiniteScrollTrigger onLoadMore={fetchNextPage} hasMore={!!hasNextPage} isFetching={isFetchingNextPage} />
      </div>

      <UserListDialog
        open={!!listDialog}
        onOpenChange={(open) => !open && setListDialog(null)}
        userId={profile.id}
        mode={listDialog}
        title={listDialog === "followers" ? "Followers" : "Following"}
      />
    </div>
  );
}
