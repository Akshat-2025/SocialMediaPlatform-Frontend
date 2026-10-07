import { api } from "@/lib/axios";

export const searchApi = {
  searchUsers: (q, { pageParam = 1, limit = 20 } = {}) =>
    api.get("/search/users", { params: { q, page: pageParam, limit } }).then((r) => r.data),
  searchPosts: (q, { pageParam = 1, limit = 20 } = {}) =>
    api.get("/search/posts", { params: { q, page: pageParam, limit } }).then((r) => r.data),
};
