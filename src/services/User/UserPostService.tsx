import api from "../../config/axios";

// ===== INTERFACES =====

export interface SalePost {
  listingId: number;
  productType: string;
  productName: string;
  askPrice: number;
  description?: string;
  provinceCode: number;
  districtCode: number;
  wardCode: number;
  street: string;
  address: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  coverThumb: string;
  priorityLevel?: number;
  vehicle?: {
    vehicleId: number;
    modelId: number;
    modelName: string;
    brandName: string;
    year: number;
    odoKm: number;
  };
  battery?: {
    batteryId: number;
    chemistryName: string;
    capacityKwh: number;
    sohPercent: number;
    cycleCount: number;
  };
}

interface PagedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ===== SERVICE =====

export const UserPostService = {
  /**
   * Get current user's posts
   */
  async getMyPosts(): Promise<SalePost[]> {
    try {
      const response = await api.get<PagedResponse<SalePost>>("/api/sale-posts/me");

      if (response.data?.content && Array.isArray(response.data.content)) {
        console.log("✅ Loaded", response.data.content.length, "posts");
        return response.data.content;
      }

      console.warn("⚠️ Unexpected response structure");
      return [];
    } catch (error: any) {
      console.error("❌ Error fetching posts:", error.response?.data || error.message);
      return [];
    }
  },

  /**
   * Delete a post by ID
   */
  async deletePost(listingId: number): Promise<void> {
    await api.delete(`/sale-posts/${listingId}`);
  },

  /**
   * Update post status
   */
  async updatePostStatus(listingId: number, status: string): Promise<void> {
    await api.patch(`/sale-posts/${listingId}/status`, { status });
  },
};