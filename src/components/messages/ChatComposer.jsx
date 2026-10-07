"use client";

import { useRef, useState } from "react";
import { Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useSendMessage } from "@/features/messages/hooks";
import { getSocket } from "@/lib/socket";

export function ChatComposer({ conversationId, recipientId }) {
  const [content, setContent] = useState("");
  const { mutate, isPending } = useSendMessage();
  const typingTimeout = useRef(null);

  const emitTyping = () => {
    if (!recipientId) return;
    const socket = getSocket();
    socket.emit("message:typing", { conversationId, recipientId });
  };

  const handleChange = (e) => {
    setContent(e.target.value);
    if (!typingTimeout.current) emitTyping();
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      typingTimeout.current = null;
    }, 2000);
  };

  const submit = () => {
    if (!content.trim()) return;
    mutate(
      { conversationId, content },
      { onSuccess: () => setContent("") }
    );
  };

  return (
    <div className="flex items-end gap-2 border-t border-border p-3">
      <Textarea
        value={content}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Write a message..."
        rows={1}
        maxLength={2000}
        className="min-h-[40px] resize-none"
      />
      <Button size="icon" disabled={isPending || !content.trim()} onClick={submit}>
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
