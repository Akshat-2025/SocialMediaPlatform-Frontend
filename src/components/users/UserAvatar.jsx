import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { initials, cn } from "@/lib/utils";
import { useIsUserOnline } from "@/hooks/useOnlineStatus";

const SIZES = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-14 w-14", xl: "h-24 w-24" };

export function UserAvatar({ user, size = "md", href, showOnline = false, className }) {
  const isOnline = useIsUserOnline(user?._id || user?.id);
  const avatarUrl = user?.avatar?.url;
  const name = user?.fullName || user?.username || "";

  const content = (
    <span className="relative inline-block">
      <Avatar className={cn(SIZES[size], className)}>
        {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
        <AvatarFallback>{initials(name) || "?"}</AvatarFallback>
      </Avatar>
      {showOnline && isOnline && (
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
      )}
    </span>
  );

  const link = href ?? (user?.username ? `/profile/${user.username}` : undefined);

  if (!link) return content;

  return <Link href={link}>{content}</Link>;
}
