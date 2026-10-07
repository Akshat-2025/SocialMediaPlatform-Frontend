"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UserAvatar } from "@/components/users/UserAvatar";
import { PageSpinner } from "@/components/shared/Spinner";
import { MessageBubble } from "./MessageBubble";
import { ChatComposer } from "./ChatComposer";
import { useMessages, useMarkConversationRead } from "@/features/messages/hooks";
import { useAuth } from "@/hooks/useAuth";
import { useIsUserOnline } from "@/hooks/useOnlineStatus";
import { getSocket } from "@/lib/socket";

export function ChatWindow({ conversation }) {
  const { user } = useAuth();
  const other = conversation.participants.find((p) => p._id !== user?.id);
  const isOnline = useIsUserOnline(other?._id);
  const { data, isLoading, fetchNextPage, hasNextPage } = useMessages(conversation._id);
  const { mutate: markRead } = useMarkConversationRead();
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);
  const typingTimeout = useRef(null);

  // Oldest-first for rendering; backend returns newest-first per page.
  const messages = [...(data?.pages.flatMap((p) => p.messages) || [])].reverse();

  useEffect(() => {
    markRead(conversation._id);
  }, [conversation._id, markRead]);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages.length]);

  useEffect(() => {
    const socket = getSocket();
    const onTyping = ({ conversationId, userId }) => {
      if (conversationId !== conversation._id || userId !== other?._id) return;
      setTyping(true);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setTyping(false), 2500);
    };
    socket.on("message:typing", onTyping);
    return () => socket.off("message:typing", onTyping);
  }, [conversation._id, other?._id]);

  const handleScroll = () => {
    const node = scrollRef.current;
    if (node && node.scrollTop < 100 && hasNextPage) fetchNextPage();
  };

  if (!other) return null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border p-3">
        <Link href="/messages" className="md:hidden text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <UserAvatar user={other} size="sm" showOnline />
        <div className="leading-tight">
          <Link href={`/profile/${other.username}`} className="text-sm font-medium hover:underline">
            {other.fullName}
          </Link>
          <p className="text-xs text-muted-foreground">{isOnline ? "Online" : "Offline"}</p>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 space-y-2 overflow-y-auto p-4 scrollbar-thin"
      >
        {isLoading ? (
          <PageSpinner />
        ) : (
          messages.map((message) => (
            <MessageBubble key={message._id} message={message} isOwn={message.sender?._id === user?.id} />
          ))
        )}
        {typing && (
          <p className="text-xs text-muted-foreground italic">{other.fullName} is typing...</p>
        )}
      </div>

      <ChatComposer conversationId={conversation._id} recipientId={other._id} />
    </div>
  );
}
