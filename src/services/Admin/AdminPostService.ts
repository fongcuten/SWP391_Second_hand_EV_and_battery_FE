import api from "../../config/axios";

export interface AdminPostCard {
  listingId: number;
  title: string;
  price: number;
  type: "VEHICLE" | "BATTERY";
  thumbnailUrl?: string;
  sellerUsername?: string;
  createdAt?: string;
}

export const adminPostService = {
  listAll: async (
    page = 0,
    size = 20
  ): Promise<{ content: AdminPostCard[]; totalElements: number }> => {
    const res = await api.get("/api/sale-posts", { params: { page, size } });
    // Public endpoint returns Page<PostCard>
    return {
      content: res.data?.content ?? [],
      totalElements: res.data?.totalElements ?? 0,
    };
  },
  getVehicles: async (page = 0, size = 20) => {
    const res = await api.get("/api/sale-posts/vehicles", {
      params: { page, size },
    });
    return {
      content: res.data?.content ?? [],
      totalElements: res.data?.totalElements ?? 0,
    };
  },
  getBatteries: async (page = 0, size = 20) => {
    const res = await api.get("/api/sale-posts/batteries", {
      params: { page, size },
    });
    return {
      content: res.data?.content ?? [],
      totalElements: res.data?.totalElements ?? 0,
    };
  },
  remove: async (listingId: number): Promise<void> => {
    const res = await api.delete(`/api/sale-posts/${listingId}`);
    if (res.status !== 200 && res.status !== 204)
      throw new Error("Failed to delete post");
  },
};
