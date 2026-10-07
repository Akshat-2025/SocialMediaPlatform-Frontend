"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, MessageCircle, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadCount } from "@/features/notifications/hooks";

export function MobileTabBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const unreadCount = useUnreadCount();

  if (!user) return null;

  const links = [
    { href: "/", icon: Home },
    { href: "/search", icon: Search },
    { href: "/messages", icon: MessageCircle },
    { href: "/notifications", icon: Bell, badge: unreadCount },
    { href: `/profile/${user.username}`, icon: User },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-card py-2 sm:hidden">
      {links.map(({ href, icon: Icon, badge }) => (
        <Link key={href} href={href} className="relative flex h-10 w-10 items-center justify-center">
          <Icon className={cn("h-5 w-5", pathname === href ? "text-primary" : "text-muted-foreground")} />
          {badge > 0 && <span className="absolute right-1.5 top-1 h-2 w-2 rounded-full bg-ember" />}
        </Link>
      ))}
    </nav>
  );
}
