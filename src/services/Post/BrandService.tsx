import api from "../../config/axios";

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
  // Get all brands
  async getAllBrands(): Promise<Brand[]> {
    try {
      const response = await api.get<ApiResponse<Brand[]>>("/admin/brands");
      console.log("✅ Brands fetched:", response.data.result);
      return response.data.result;
    } catch (error: any) {
      console.error("❌ Error fetching brands:", error);
      throw error;
    }
  },

  // ✅ Get all models for a specific brand (using query param)
  async getModelsByBrand(brandId: number): Promise<Model[]> {
    try {
      const response = await api.get<ApiResponse<Model[]>>(`/admin/models`, {
        params: { brandId } // ← Query parameter: ?brandId=1
      });
      console.log(`✅ Models for brandId ${brandId}:`, response.data.result);

      // Validate that all models belong to the selected brand
      const models = response.data.result;
      const invalidModels = models.filter(m => m.brandId !== brandId);

      if (invalidModels.length > 0) {
        console.warn("⚠️ Found models with mismatched brandId:", invalidModels);
      }

      return models;
    } catch (error: any) {
      console.error(`❌ Error fetching models for brand ${brandId}:`, error);
      throw error;
    }
  },

  // Get single model details (for validation)
  async getModelById(modelId: number): Promise<ModelDetail> {
    try {
      const response = await api.get<ApiResponse<ModelDetail>>(`/admin/models/${modelId}`);
      console.log("✅ Model details fetched:", response.data.result);
      return response.data.result;
    } catch (error: any) {
      console.error("❌ Error fetching model details:", error);
      throw error;
    }
  },
};