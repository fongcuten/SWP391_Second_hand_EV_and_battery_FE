import api from "../../config/axios";

export interface AdminUserResponse {
  userId: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  createdAt?: string;
}

export interface AdminUserUpdateRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export const adminUserService = {
  getAll: async (): Promise<AdminUserResponse[]> => {
    const res = await api.get("/users");
    if (res.data?.code !== 1000)
      throw new Error(res.data?.message || "Failed to load users");
    return res.data.result as AdminUserResponse[];
  },
  getById: async (userId: number): Promise<AdminUserResponse> => {
    try {
      const res = await api.get(`/users/${userId}`);
      if (res.data?.code !== 1000)
        throw new Error(res.data?.message || "Failed to load user");
      return res.data.result as AdminUserResponse;
    } catch (err: any) {
      // Backend restricts GET /users/{id} via @PostAuthorize; fallback to listing
      if (err?.response?.status === 403) {
        const all = await api.get("/users");
        if (all.data?.code !== 1000)
          throw new Error(all.data?.message || "Failed to load users");
        const list = (all.data.result || []) as AdminUserResponse[];
        const found = list.find((u) => u.userId === userId);
        if (!found) throw new Error("User not found");
        return found;
      }
      throw err;
    }
  },
  update: async (
    userId: number,
    data: AdminUserUpdateRequest
  ): Promise<AdminUserResponse> => {
    const res = await api.put(`/users/${userId}`, data);
    if (res.data?.code !== 1000)
      throw new Error(res.data?.message || "Failed to update user");
    return res.data.result as AdminUserResponse;
  },
  remove: async (userId: number): Promise<void> => {
    const res = await api.delete(`/users/${userId}`);
    if (res.data?.code !== 1000)
      throw new Error(res.data?.message || "Failed to delete user");
  },
};
