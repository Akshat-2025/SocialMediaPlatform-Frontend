import { api } from "@/lib/axios";

export const storiesApi = {
  /** GET /api/stories/feed → { success, storyGroups } */
  getFeed: () => api.get("/stories/feed").then((r) => r.data),

  /**
   * POST /api/stories (multipart/form-data)
   * Field: "media" (File), optional "caption" (string).
   * Must pass Content-Type: multipart/form-data so Axios strips the default
   * application/json and lets the browser set the correct multipart boundary.
   * This matches the pattern used by postsApi.createPost.
   */
  createStory: ({ media, caption }) => {
    const form = new FormData();
    form.append("media", media);
    if (caption?.trim()) form.append("caption", caption.trim());
    return api
      .post("/stories", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  /** POST /api/stories/:storyId/view → { success, viewed, viewsCount } */
  recordView: (storyId) => api.post(`/stories/${storyId}/view`).then((r) => r.data),

  /**
   * GET /api/stories/:storyId/viewers?page=&limit=
   * Owner-only → { success, viewers, pagination }
   */
  getViewers: (storyId, { page = 1, limit = 20 } = {}) =>
    api.get(`/stories/${storyId}/viewers`, { params: { page, limit } }).then((r) => r.data),

  /** DELETE /api/stories/:storyId → { success, message } */
  deleteStory: (storyId) => api.delete(`/stories/${storyId}`).then((r) => r.data),
};
