"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, MessageCircle, Bell, User, Settings, LogOut } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/users/UserAvatar";
import { useAuth } from "@/hooks/useAuth";
import { useLogout } from "@/features/auth/hooks";
import { useNotifications, useUnreadCount } from "@/features/notifications/hooks";
import { cn } from "@/lib/utils";

function NavLink({ href, icon: Icon, label, badge, active }) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
        active ? "bg-primary/15 text-primary shadow-inner shadow-primary/10" : "text-foreground/70 hover:bg-white/[0.06] hover:text-foreground"
      )}
    >
      {active && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary" />}
      <Icon className="h-5 w-5" />
      <span className="hidden lg:inline">{label}</span>
      {badge > 0 && (
        <span className="ml-auto hidden h-5 min-w-5 items-center justify-center rounded-full bg-ember px-1.5 text-[11px] font-semibold text-ember-foreground lg:flex">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { mutate: logout } = useLogout();
  useNotifications(); // keeps the unread-count cache warm
  const unreadCount = useUnreadCount();

  if (!user) return null;

  const links = [
    { href: "/", icon: Home, label: "Feed" },
    { href: "/search", icon: Search, label: "Search" },
    { href: "/messages", icon: MessageCircle, label: "Messages" },
    { href: "/notifications", icon: Bell, label: "Notifications", badge: unreadCount },
    { href: `/profile/${user.username}`, icon: User, label: "Profile" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="spine hidden h-screen w-[76px] shrink-0 flex-col border-r border-white/10 bg-black/10 px-2 py-5 backdrop-blur-2xl sm:flex lg:w-64 lg:px-4">
      <div className="mb-6 hidden px-1 lg:block">
        <Logo />
      </div>
      <div className="mb-6 flex justify-center lg:hidden">
        <Link href="/">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground font-display font-semibold shadow-lg shadow-primary/25">
            M
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map((link) => (
          <NavLink key={link.href} {...link} active={pathname === link.href} />
        ))}
      </nav>

      <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
        <div className="hidden items-center gap-2 px-1 lg:flex">
          <UserAvatar user={user} size="sm" />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium">{user.fullName}</p>
            <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-center gap-2 text-muted-foreground lg:justify-start"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden lg:inline">Log out</span>
        </Button>
      </div>
    </aside>
  );
}
