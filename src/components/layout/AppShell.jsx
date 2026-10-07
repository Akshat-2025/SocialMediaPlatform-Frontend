"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { MobileTabBar } from "./MobileTabBar";
import { PageSpinner } from "@/components/shared/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentUser } from "@/features/auth/hooks";
import { useLiveMessages } from "@/features/messages/hooks";
import { useLiveNotifications } from "@/features/notifications/hooks";
import { useOnlineStatusSubscription } from "@/hooks/useOnlineStatus";

export function AppShell({ children }) {
  const router = useRouter();
  const { isLoading } = useCurrentUser();
  const { user, isAuthenticated } = useAuth();

  useOnlineStatusSubscription();
  useLiveMessages(user?.id);
  useLiveNotifications(user?.id);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login");
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) return <PageSpinner />;

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none fixed -left-32 top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none fixed -right-24 bottom-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      <Sidebar />
      <main className="relative z-10 min-w-0 flex-1 pb-16 sm:pb-0">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-8 lg:py-10">{children}</div>
      </main>
      <MobileTabBar />
    </div>
  );
}
