import { api } from "@/lib/axios";

export const messagesApi = {
  getConversations: ({ pageParam = 1, limit = 20 } = {}) =>
    api.get("/messages/conversations", { params: { page: pageParam, limit } }).then((r) => r.data),

  getOrCreateConversation: (userId) =>
    api.post(`/messages/conversations/${userId}`).then((r) => r.data),

  getMessages: (conversationId, { pageParam = 1, limit = 30 } = {}) =>
    api
      .get(`/messages/conversations/${conversationId}/messages`, {
        params: { page: pageParam, limit },
      })
      .then((r) => r.data),

  sendMessage: ({ conversationId, content }) =>
    api
      .post(`/messages/conversations/${conversationId}/messages`, { content })
      .then((r) => r.data),

  markRead: (conversationId) =>
    api.patch(`/messages/conversations/${conversationId}/read`).then((r) => r.data),
};
