import api from "../../config/axios";

export interface Brand {
  brandId: number;
  name: string;
}

export interface Model {
  modelId: number;
  name: string;
  brandId: number;
  brandName: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

export const brandService = {
  // Get all brands
  getAllBrands: async (): Promise<Brand[]> => {
    const response = await api.get<ApiResponse<Brand[]>>("/admin/brands");
    return response.data.result;
  },

  // Get models by brand ID
  getModelsByBrand: async (brandId: number): Promise<Model[]> => {
    const response = await api.get<ApiResponse<Model[]>>(
      `/admin/models?brandId=${brandId}`
    );
    return response.data.result;
  },

  // Get all models
  getAllModels: async (): Promise<Model[]> => {
    const response = await api.get<ApiResponse<Model[]>>("/admin/models");
    return response.data.result;
  },
};