import { api } from "@/lib/axios";

export const notificationsApi = {
  getNotifications: ({ pageParam = 1, limit = 20 } = {}) =>
    api.get("/notifications", { params: { page: pageParam, limit } }).then((r) => r.data),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllAsRead: () => api.patch("/notifications/read-all").then((r) => r.data),
};
