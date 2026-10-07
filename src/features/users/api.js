import { api } from "@/lib/axios";

export const usersApi = {
  getProfile: (username) => api.get(`/users/${username}`).then((r) => r.data),
  toggleFollow: (id) => api.post(`/users/${id}/follow`).then((r) => r.data),
  getFollowers: (id, { pageParam = 1, limit = 20 } = {}) =>
    api.get(`/users/${id}/followers`, { params: { page: pageParam, limit } }).then((r) => r.data),
  getFollowing: (id, { pageParam = 1, limit = 20 } = {}) =>
    api.get(`/users/${id}/following`, { params: { page: pageParam, limit } }).then((r) => r.data),
};
