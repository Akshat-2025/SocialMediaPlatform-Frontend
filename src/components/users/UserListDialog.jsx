"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserListItem } from "./UserListItem";
import { EmptyState } from "@/components/shared/EmptyState";
import { InfiniteScrollTrigger } from "@/components/shared/InfiniteScrollTrigger";
import { PageSpinner } from "@/components/shared/Spinner";
import { useFollowers, useFollowing } from "@/features/users/hooks";
import { Users } from "lucide-react";

export function UserListDialog({ open, onOpenChange, userId, mode, title }) {
  const followers = useFollowers(mode === "followers" ? userId : null);
  const following = useFollowing(mode === "following" ? userId : null);
  const query = mode === "followers" ? followers : following;

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = query;
  const listKey = mode === "followers" ? "followers" : "following";
  const items = data?.pages.flatMap((p) => p[listKey]) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] -mx-2 px-2">
          {isLoading ? (
            <PageSpinner />
          ) : items.length === 0 ? (
            <EmptyState icon={Users} title={`No ${mode} yet`} />
          ) : (
            <div className="divide-y divide-border">
              {items.map((u) => (
                <UserListItem key={u._id} user={u} />
              ))}
            </div>
          )}
          <InfiniteScrollTrigger
            onLoadMore={fetchNextPage}
            hasMore={!!hasNextPage}
            isFetching={isFetchingNextPage}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
