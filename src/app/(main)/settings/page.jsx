"use client";

import { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Camera, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { UserAvatar } from "@/components/users/UserAvatar";
import { updateProfileSchema } from "@/schemas/auth.schema";
import { useAuth } from "@/hooks/useAuth";
import { useRemoveAvatar, useUpdateProfile, useUploadAvatar } from "@/features/auth/hooks";

export default function SettingsPage() {
  const { user } = useAuth();
  const form = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { username: "", fullName: "", bio: "" },
  });
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const { mutate: uploadAvatar, isPending: uploading } = useUploadAvatar();
  const { mutate: removeAvatar, isPending: removing } = useRemoveAvatar();
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      form.reset({ username: user.username, fullName: user.fullName, bio: user.bio || "" });
    }
  }, [user, form]);

  if (!user) return null;

  const onSubmit = (values) => updateProfile(values);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-xl font-semibold">Settings</h1>

      <Card className="spine">
        <CardHeader className="pl-5">
          <CardTitle>Profile photo</CardTitle>
          <CardDescription>Shown on your posts, comments, and profile.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4 pl-5">
          <UserAvatar user={user} size="xl" href={undefined} />
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-4 w-4" /> Change photo
            </Button>
            {user.avatar?.url && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                disabled={removing}
                onClick={() => removeAvatar()}
              >
                <Trash2 className="h-4 w-4" /> Remove
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadAvatar(file);
                e.target.value = "";
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="spine">
        <CardHeader className="pl-5">
          <CardTitle>Profile details</CardTitle>
          <CardDescription>This is how others will see you.</CardDescription>
        </CardHeader>
        <CardContent className="pl-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea rows={3} maxLength={160} {...field} />
                    </FormControl>
                    <FormDescription>{field.value?.length || 0}/160</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
