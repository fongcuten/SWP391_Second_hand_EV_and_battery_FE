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

export interface VehicleDetail {
  listingId: number;
  seller: string;
  sellerId: number; // ✅ ADDED
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
  batteryPost: null;
  vehiclePost: VehiclePost;
  media: MediaItem[];
}

export const VehicleDetailService = {
  getVehicleDetail: async (listingId: number): Promise<VehicleDetail> => {
    try {
      const response = await api.get(`/api/sale-posts/${listingId}`);
      console.log("📦 Vehicle detail response:", response.data);
      
      // ✅ Validate sellerId exists
      if (!response.data.sellerId) {
        console.warn("⚠️ sellerId is missing in API response");
      }
      
      return response.data;
    } catch (error: any) {
      console.error("❌ Error loading vehicle detail:", error);
      throw error;
    }
  },
};