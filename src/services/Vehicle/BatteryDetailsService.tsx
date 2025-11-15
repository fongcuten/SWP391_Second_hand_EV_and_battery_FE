import api from "../../config/axios";

export interface MediaItem {
  mediaId: number;
  publicId: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  urlLarge: string;
  urlThumb: string;
  sortOrder: number;
}

export interface BatteryPost {
  chemistryName: string;
  capacityKwh: number;
  sohPercent: number;
  cycleCount: number;
}

// BatteryDetail interface to match the API response
export interface BatteryDetail {
  listingId: number;
  sellerId: number;
  sellerUsername: string;
  sellerAvatarUrl: string;
  sellerAvatarThumbUrl: string;
  sellerPhone: string;
  productType: "VEHICLE" | "BATTERY";
  askPrice: number;
  title: string;
  description: string;
  status: string;
  provinceCode: number;
  districtCode: number;
  wardCode: number;
  street: string;
  priorityLevel: number;
  createdAt: string;
  batteryPost: BatteryPost | null;
  vehiclePost: null; // Can be null if it's a battery post
  media: MediaItem[];
  inspectionStatus?: string; // "PASS", "APPROVED", "PENDING", "FAIL", etc.
}

export const BatteryDetailService = {
  getBatteryDetail: async (listingId: number): Promise<BatteryDetail> => {
    try {
      // The endpoint is /api/sale-posts/{listingId}
      const response = await api.get(`/api/sale-posts/${listingId}`);
      console.log("📦 Battery detail response:", response.data);
      // The response is not nested under a 'result' key
      return response.data;
    } catch (error: any) {
      console.error("❌ Error loading battery detail:", error);
      throw error;
    }
  },
};

