"use client";

import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrCreateConversation } from "@/features/messages/hooks";

export function MessageButton({ userId }) {
  const router = useRouter();
  const { mutate, isPending } = useOrCreateConversation();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() =>
        mutate(userId, {
          onSuccess: (data) => router.push(`/messages/${data.conversation._id}`),
        })
      }
    >
      <MessageCircle className="h-4 w-4" />
      Message
    </Button>
  );
}
