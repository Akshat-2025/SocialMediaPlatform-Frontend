import { z } from "zod";

export const createPostSchema = z.object({
  content: z.string().max(2000, "Post is too long").optional().default(""),
});

export const updatePostSchema = z.object({
  content: z.string().max(2000, "Post is too long").optional(),
});

export const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(500, "Comment is too long"),
});
