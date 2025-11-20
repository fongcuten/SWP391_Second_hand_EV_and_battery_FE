import api from "../../config/axios";

export interface AdminPostCard {
  listingId: number;
  title: string;
  price: number;
  type: "VEHICLE" | "BATTERY";
  thumbnailUrl?: string;
  sellerUsername?: string;
  sellerId?: number;
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
    try {
      const res = await api.delete(`/api/sale-posts/${listingId}`);
      // Backend may return 200, 204, or no content
      if (res.status !== 200 && res.status !== 204) {
        throw new Error("Failed to delete post");
      }
    } catch (error: any) {
      // Handle axios errors
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error || `Lỗi ${status}: Không thể xóa bài viết`;
        throw new Error(message);
      } else if (error.request) {
        throw new Error("Không thể kết nối đến server");
      } else {
        throw new Error(error.message || "Lỗi xóa bài viết");
      }
    }
  },
  getById: async (listingId: number): Promise<AdminPostCard> => {
    const res = await api.get(`/api/sale-posts/${listingId}`);
    const data = res.data;
    // Map the response to AdminPostCard format
    return {
      listingId: data.listingId || listingId,
      title: data.title || "",
      price: data.askPrice || 0,
      type: data.productType === "BATTERY" ? "BATTERY" : "VEHICLE",
      thumbnailUrl: data.media?.[0]?.urlThumb || data.media?.[0]?.url,
      sellerUsername: data.seller || data.sellerUsername,
      sellerId: data.sellerId,
      createdAt: data.createdAt,
    };
  },
};
