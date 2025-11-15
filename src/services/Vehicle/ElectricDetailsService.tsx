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

export interface VehiclePost {
  modelName: string;
  brandName: string;
  year: number;
  odoKm: number;
  vin: string;
  transmission: string;
  fuelType: string;
  origin: string;
  bodyStyle: string;
  seatCount: number;
  color: string;
  accessories: boolean;
  registration: boolean;
}

// ✅ FIX: Updated VehicleDetail interface to match the new API response
export interface VehicleDetail {
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
  batteryPost: null, // Can be null if it's a vehicle post
  vehiclePost: null, // Can be null if it's a battery post
  media: MediaItem[],
}

export const VehicleDetailService = {
  getVehicleDetail: async (listingId: number): Promise<VehicleDetail> => {
    try {
      // The endpoint is now /api/sale-posts/{listingId}
      const response = await api.get(`/api/sale-posts/${listingId}`);
      console.log("📦 Vehicle detail response:", response.data);
      // The new response is not nested under a 'result' key
      return response.data;
    } catch (error: any) {
      console.error("❌ Error loading vehicle detail:", error);
      throw error;
    }
  },
};