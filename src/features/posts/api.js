import { api } from "@/lib/axios";

const toFormData = ({ content, images, removeImageIds }) => {
  const form = new FormData();
  if (content !== undefined) form.append("content", content);
  (images || []).forEach((file) => form.append("images", file));
  if (removeImageIds?.length) {
    removeImageIds.forEach((id) => form.append("removeImageIds", id));
  }
  return form;
};

export const postsApi = {
  getFeed: ({ pageParam = 1, limit = 10 } = {}) =>
    api.get("/posts", { params: { page: pageParam, limit } }).then((r) => r.data),

  getUserPosts: (userId, { pageParam = 1, limit = 10 } = {}) =>
    api
      .get(`/posts/user/${userId}`, { params: { page: pageParam, limit } })
      .then((r) => r.data),

  getPost: (id) => api.get(`/posts/${id}`).then((r) => r.data),

  createPost: (payload) =>
    api
      .post("/posts", toFormData(payload), {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),

  updatePost: ({ id, ...payload }) =>
    api
      .patch(`/posts/${id}`, toFormData(payload), {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),

  deletePost: (id) => api.delete(`/posts/${id}`).then((r) => r.data),

  toggleLike: (id) => api.post(`/posts/${id}/like`).then((r) => r.data),

  getComments: (postId, { pageParam = 1, limit = 20 } = {}) =>
    api
      .get(`/posts/${postId}/comments`, { params: { page: pageParam, limit } })
      .then((r) => r.data),

  addComment: ({ postId, content }) =>
    api.post(`/posts/${postId}/comments`, { content }).then((r) => r.data),

  updateComment: ({ postId, commentId, content }) =>
    api.patch(`/posts/${postId}/comments/${commentId}`, { content }).then((r) => r.data),

  deleteComment: ({ postId, commentId }) =>
    api.delete(`/posts/${postId}/comments/${commentId}`).then((r) => r.data),
};
