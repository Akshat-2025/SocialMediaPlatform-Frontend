"use client";

import { useState } from "react";
import { Search as SearchIcon, Users as UsersIcon, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserListItem } from "@/components/users/UserListItem";
import { PostCard } from "@/components/posts/PostCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageSpinner } from "@/components/shared/Spinner";
import { InfiniteScrollTrigger } from "@/components/shared/InfiniteScrollTrigger";
import { FollowButton } from "@/components/users/FollowButton";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchPosts, useSearchUsers } from "@/features/search/hooks";

function UsersResults({ query }) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useSearchUsers(query);
  const users = data?.pages.flatMap((p) => p.users) || [];

  if (!query.trim()) return <EmptyState icon={UsersIcon} title="Search for people" description="Find users by name or username." />;
  if (isLoading) return <PageSpinner />;
  if (users.length === 0) return <EmptyState icon={UsersIcon} title="No users found" />;

  return (
    <div className="divide-y divide-border">
      {users.map((u) => (
        <UserListItem key={u._id} user={u} trailing={<FollowButton profile={{ ...u, id: u._id }} size="sm" />} />
      ))}
      <InfiniteScrollTrigger onLoadMore={fetchNextPage} hasMore={!!hasNextPage} isFetching={isFetchingNextPage} />
    </div>
  );
}

function PostsResults({ query }) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useSearchPosts(query);
  const posts = data?.pages.flatMap((p) => p.posts) || [];

  if (!query.trim()) return <EmptyState icon={FileText} title="Search for posts" description="Find posts by their content." />;
  if (isLoading) return <PageSpinner />;
  if (posts.length === 0) return <EmptyState icon={FileText} title="No posts found" />;

  return (
    <div className="space-y-4">
      {posts.map((p) => (
        <PostCard key={p._id} post={p} />
      ))}
      <InfiniteScrollTrigger onLoadMore={fetchNextPage} hasMore={!!hasNextPage} isFetching={isFetchingNextPage} />
    </div>
  );
}

export default function SearchPage() {
  const [input, setInput] = useState("");
  const query = useDebounce(input, 350);

  return (
    <div className="space-y-4">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search users or posts..."
          className="pl-9"
          autoFocus
        />
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">People</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UsersResults query={query} />
        </TabsContent>
        <TabsContent value="posts">
          <PostsResults query={query} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
