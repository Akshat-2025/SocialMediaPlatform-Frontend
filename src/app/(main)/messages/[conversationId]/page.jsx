"use client";

import { useParams } from "next/navigation";
import { ChatWindow } from "@/components/messages/ChatWindow";
import { PageSpinner } from "@/components/shared/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { FileQuestion } from "lucide-react";
import { useConversations } from "@/features/messages/hooks";

export default function ConversationPage() {
  const { conversationId } = useParams();
  // Shares the ["messages","conversations"] cache with the list page, so this
  // resolves instantly if the user navigated from there.
  const { data, isLoading } = useConversations();
  const conversations = data?.pages.flatMap((p) => p.conversations) || [];
  const conversation = conversations.find((c) => c._id === conversationId);

  if (isLoading) return <PageSpinner />;

  if (!conversation) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="Conversation not found"
        description="Go back to messages and pick a conversation from the list."
      />
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] overflow-hidden rounded-lg border border-border">
      <ChatWindow conversation={conversation} />
    </div>
  );
}
