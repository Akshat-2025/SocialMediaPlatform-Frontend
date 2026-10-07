import { api } from "@/lib/axios";

export const authApi = {
  register: (payload) => api.post("/auth/register", payload).then((r) => r.data),
  login: (payload) => api.post("/auth/login", payload).then((r) => r.data),
  logout: () => api.post("/auth/logout").then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
  updateProfile: (payload) => api.patch("/auth/profile", payload).then((r) => r.data),
  uploadAvatar: (file) => {
    const form = new FormData();
    form.append("avatar", file);
    return api
      .post("/auth/avatar", form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },
  removeAvatar: () => api.delete("/auth/avatar").then((r) => r.data),
};
