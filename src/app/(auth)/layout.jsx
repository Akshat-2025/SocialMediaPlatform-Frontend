"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/shared/Logo";
import { PageSpinner } from "@/components/shared/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentUser } from "@/features/auth/hooks";

export default function AuthLayout({ children }) {
  const router = useRouter();
  const { isLoading } = useCurrentUser();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace("/");
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) return <PageSpinner />;
  if (isAuthenticated) return null;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />
      <div className="relative z-10 w-full max-w-sm space-y-6">
        <div className="flex justify-center">
          <Logo />
        </div>
        {children}
      </div>
    </div>
  );
}
