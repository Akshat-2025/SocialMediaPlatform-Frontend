import Link from "next/link";
import { UserAvatar } from "./UserAvatar";

export function UserListItem({ user, trailing }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <Link href={`/profile/${user.username}`} className="flex items-center gap-3 min-w-0">
        <UserAvatar user={user} size="md" />
        <div className="min-w-0">
          <p className="truncate font-medium text-sm">{user.fullName}</p>
          <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
        </div>
      </Link>
      {trailing}
    </div>
  );
}
