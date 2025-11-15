import api from "../../config/axios";

export interface BrandRequest {
  name: string;
  description?: string;
}

export interface BrandResponse {
  brandId: number;
  name: string;
  description?: string;
}

export interface ModelRequest {
  brandId: number;
  name: string;
  description?: string;
}

export interface ModelResponse {
  modelId: number;
  brandId: number;
  name: string;
  description?: string;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

export const adminBrandService = {
  // Brand APIs
  async getAllBrands(): Promise<BrandResponse[]> {
    try {
      const response = await api.get<ApiResponse<BrandResponse[]>>("/brands");
      return response.data.result || [];
    } catch (error) {
      console.error("Error fetching brands:", error);
      throw error;
    }
  },

  async createBrand(data: BrandRequest): Promise<BrandResponse> {
    try {
      const response = await api.post<ApiResponse<BrandResponse>>(
        "/admin/brands",
        data
      );
      return response.data.result;
    } catch (error) {
      console.error("Error creating brand:", error);
      throw error;
    }
  },

  async updateBrand(
    brandId: number,
    data: BrandRequest
  ): Promise<BrandResponse> {
    try {
      const response = await api.put<ApiResponse<BrandResponse>>(
        `/admin/brands/${brandId}`,
        data
      );
      return response.data.result;
    } catch (error) {
      console.error("Error updating brand:", error);
      throw error;
    }
  },

  async deleteBrand(brandId: number): Promise<void> {
    try {
      await api.delete(`/admin/brands/${brandId}`);
    } catch (error) {
      console.error("Error deleting brand:", error);
      throw error;
    }
  },

  // Model APIs
  async getAllModels(): Promise<ModelResponse[]> {
    try {
      const response = await api.get<ApiResponse<ModelResponse[]>>("/models");
      return response.data.result || [];
    } catch (error) {
      console.error("Error fetching models:", error);
      throw error;
    }
  },

  async getModelsByBrand(brandId: number): Promise<ModelResponse[]> {
    try {
      const response = await api.get<ApiResponse<ModelResponse[]>>(
        `/models/brand/${brandId}`
      );
      return response.data.result || [];
    } catch (error) {
      console.error("Error fetching models by brand:", error);
      throw error;
    }
  },

  async createModel(data: ModelRequest): Promise<ModelResponse> {
    try {
      const response = await api.post<ApiResponse<ModelResponse>>(
        "/admin/models",
        data
      );
      return response.data.result;
    } catch (error) {
      console.error("Error creating model:", error);
      throw error;
    }
  },

  async updateModel(
    modelId: number,
    data: ModelRequest
  ): Promise<ModelResponse> {
    try {
      const response = await api.put<ApiResponse<ModelResponse>>(
        `/admin/models/${modelId}`,
        data
      );
      return response.data.result;
    } catch (error) {
      console.error("Error updating model:", error);
      throw error;
    }
  },

  async deleteModel(modelId: number): Promise<void> {
    try {
      await api.delete(`/admin/models/${modelId}`);
    } catch (error) {
      console.error("Error deleting model:", error);
      throw error;
    }
  },
};
