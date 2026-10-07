"use client";

import { MessageCircle } from "lucide-react";
import { ConversationListItem } from "@/components/messages/ConversationListItem";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageSpinner } from "@/components/shared/Spinner";
import { InfiniteScrollTrigger } from "@/components/shared/InfiniteScrollTrigger";
import { useConversations } from "@/features/messages/hooks";

export default function MessagesPage() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useConversations();
  const conversations = data?.pages.flatMap((p) => p.conversations) || [];

  return (
    <div className="space-y-1">
      <h1 className="mb-4 font-display text-xl font-semibold">Messages</h1>

      {isLoading ? (
        <PageSpinner />
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="No conversations yet"
          description="Visit a profile and start a DM to see it here."
        />
      ) : (
        conversations.map((c) => <ConversationListItem key={c._id} conversation={c} />)
      )}

      <InfiniteScrollTrigger onLoadMore={fetchNextPage} hasMore={!!hasNextPage} isFetching={isFetchingNextPage} />
    </div>
  );
}
