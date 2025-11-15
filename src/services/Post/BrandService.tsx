import { guestApi } from "../../config/axios"; 

export interface Brand {
  brandId: number;
  name: string;
  logoUrl?: string;
}

export interface Model {
  modelId: number;
  name: string;
  brandId: number;
  brandName: string;
}

export interface ModelDetail {
  modelId: number;
  name: string;
  brandId: number;
  brandName: string;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

export const brandService = {
  // ✅ Now uses guestApi (no auth required)
  async getAllBrands(): Promise<Brand[]> {
    try {
      const response = await guestApi.get<ApiResponse<Brand[]>>("/brands");
      console.log("✅ Brands fetched:", response.data.result);
      return response.data.result;
    } catch (error) {
      console.error("❌ Error fetching brands:", error);
      throw error;
    }
  },

  async getModelsByBrand(brandId: number): Promise<Model[]> {
    try {
      // Use backend public endpoint that filters by brandId via path param
      const response = await guestApi.get<ApiResponse<Model[]>>(
        `/models/brand/${brandId}`
      );
      console.log(`✅ Models for brandId ${brandId}:`, response.data.result);
      return response.data.result;
    } catch (error) {
      console.error(`❌ Error fetching models for brand ${brandId}:`, error);
      throw error;
    }
  },

  async getModelById(modelId: number): Promise<ModelDetail> {
    try {
      const response = await guestApi.get<ApiResponse<ModelDetail>>(
        `/models/${modelId}`
      );
      console.log("✅ Model details fetched:", response.data.result);
      return response.data.result;
    } catch (error) {
      console.error("❌ Error fetching model details:", error);
      throw error;
    }
  },
};
