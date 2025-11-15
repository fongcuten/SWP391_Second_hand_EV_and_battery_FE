import api from "../../config/axios";

// ============================================
// TYPES & INTERFACES
// ============================================

export interface VehiclePayload {
  modelId: number;
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

export interface BatteryPayload {
  chemistryName: string;
  capacityKwh: number;
  sohPercent: number;
  cycleCount: number;
}

export interface CreateVehiclePostPayload {
  productType: "VEHICLE";
  askPrice: number;
  title: string;
  description: string;
  provinceCode: number;
  districtCode: number;
  wardCode: number;
  street: string;
  vehicle: VehiclePayload;
}

export interface CreateBatteryPostPayload {
  productType: "BATTERY";
  askPrice: number;
  title: string;
  description: string;
  provinceCode: number;
  districtCode: number;
  wardCode: number;
  street: string;
  battery: BatteryPayload;
}

export interface MediaResponse {
  mediaId: number;
  publicId: string;
  type: string;
  url: string;
  urlLarge: string;
  urlThumb: string;
  sortOrder: number;
}

export interface PostResponse {
  listingId: number;
  seller: string;
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
  batteryPost?: BatteryPayload;
  vehiclePost?: VehiclePayload & { modelName: string; brandName: string };
  media: MediaResponse[];
}

export interface CreatePostResponse {
  code: number;
  message: string;
  result: PostResponse;
}

// ============================================
// POST SERVICE (CREATE ONLY)
// ============================================

export const PostService = {
  /**
   * Create a new vehicle post with images (requires authentication)
   */
  async createVehiclePost(
    payload: CreateVehiclePostPayload,
    files: File[]
  ): Promise<PostResponse> {
    try {
      const formData = new FormData();

      formData.append(
        "payload",
        new Blob([JSON.stringify(payload)], { type: "application/json" })
      );

      files.forEach((file, index) => {
        console.log(`📎 Adding file ${index + 1}:`, file.name, file.size, 'bytes');
        formData.append("files", file);
      });

      console.log("📤 Creating vehicle post:");
      console.log("  - Payload:", payload);
      console.log("  - Files count:", files.length);

      const response = await api.post<CreatePostResponse>(
        "/api/sale-posts",
        formData
      );

      console.log("✅ Vehicle post created:", response.data);
      return response.data.result;
    } catch (error: any) {
      console.error("❌ Error creating vehicle post:", error);
      console.error("Response:", error.response?.data);
      console.error("Status:", error.response?.status);
      throw error;
    }
  },

  /**
   * Create a new battery post with images (requires authentication)
   */
  async createBatteryPost(
    payload: CreateBatteryPostPayload,
    files: File[]
  ): Promise<PostResponse> {
    try {
      const formData = new FormData();

      formData.append(
        "payload",
        new Blob([JSON.stringify(payload)], { type: "application/json" })
      );

      files.forEach((file, index) => {
        console.log(`📎 Adding file ${index + 1}:`, file.name, file.size, 'bytes');
        formData.append("files", file);
      });

      console.log("📤 Creating battery post:");
      console.log("  - Payload:", payload);
      console.log("  - Files count:", files.length);

      const response = await api.post<CreatePostResponse>(
        "/api/sale-posts",
        formData
      );

      console.log("✅ Battery post created:", response.data);
      return response.data.result;
    } catch (error: any) {
      console.error("❌ Error creating battery post:", error);
      console.error("Response:", error.response?.data);
      console.error("Status:", error.response?.status);
      throw error;
    }
  },
};
