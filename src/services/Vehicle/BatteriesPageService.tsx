import api from "../../config/axios";

export interface ListPostSummary {
  listingId: number;
  productType: "VEHICLE" | "BATTERY";
  productName: string;
  askPrice: number;
  address?: string;
  coverThumb?: string;
  provinceCode?: number;
  districtCode?: number;
  wardCode?: number;
  status?: string;
  createdAt?: string;
  priorityLevel?: number;
  sellerUsername?: string;
  inspectionStatus?: string;
  street?: string;
  chemistryName?: string; // Battery chemistry type (Li-ion, LFP, NMC, NCA, LTO)
  capacityKwh?: number; // Battery capacity
  sohPercent?: number; // State of Health percentage
  cycleCount?: number; // Charge cycles
}

// Define the filters interface for battery posts
export interface BatteryPostFilters {
  searchTerm?: string;
  priceRange?: string;
  selectedBrandId?: number | null;
  selectedModelId?: number | null;
  selectedPriority?: number[];
  sortBy?: string;
  selectedProvinceCode?: number | null;
  selectedDistrictCode?: number | null;
  selectedWardCode?: number | null;
  minCapacity?: number;
  maxCapacity?: number;
  minHealth?: number;
  maxHealth?: number;
}

export interface PageableResponse<T> {
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  content: T[];
  number: number;
  numberOfElements: number;
  empty: boolean;
}

export const BatteriesPageService = {
  async getBatteryPosts(
    page: number = 0,
    size: number = 12,
    filters: BatteryPostFilters = {}
  ): Promise<PageableResponse<ListPostSummary>> {
    try {
      const params: any = {
        page,
        size,
      };

      // Handle sorting
      // Note: Backend might not accept sort parameter with comma format
      // Try using sortBy parameter or skip if backend doesn't support it
      if (filters.sortBy && filters.sortBy !== "newest") {
        // Try different parameter names that backend might accept
        switch (filters.sortBy) {
          case "price-asc":
            // Try sortBy instead of sort
            params.sortBy = "askPrice,asc";
            // Also try without comma if backend requires different format
            // params.sortBy = "askPrice";
            // params.direction = "asc";
            break;
          case "price-desc":
            params.sortBy = "askPrice,desc";
            break;
          case "oldest":
            params.sortBy = "createdAt,asc";
            break;
        }
      }
      // For "newest" or default, don't send sort parameter - let backend use default sorting

      // Handle text search
      if (filters.searchTerm) params.searchTerm = filters.searchTerm;

      // Handle IDs
      if (filters.selectedBrandId) params.brandId = filters.selectedBrandId;
      if (filters.selectedModelId) params.modelId = filters.selectedModelId;

      // Handle location
      if (filters.selectedProvinceCode)
        params.provinceCode = filters.selectedProvinceCode;
      if (filters.selectedDistrictCode)
        params.districtCode = filters.selectedDistrictCode;
      if (filters.selectedWardCode) params.wardCode = filters.selectedWardCode;

      // Handle priority (sending as a comma-separated string)
      if (filters.selectedPriority && filters.selectedPriority.length > 0) {
        params.priority = filters.selectedPriority.join(",");
      }

      // Handle price range
      if (filters.priceRange) {
        if (filters.priceRange.includes("+")) {
          params.minPrice =
            parseInt(filters.priceRange.replace("+", "")) * 1000000;
        } else {
          const [min, max] = filters.priceRange.split("-").map(Number);
          params.minPrice = min * 1000000;
          params.maxPrice = max * 1000000;
        }
      }

      // Handle battery-specific filters
      if (filters.minCapacity) params.minCapacity = filters.minCapacity;
      if (filters.maxCapacity) params.maxCapacity = filters.maxCapacity;
      if (filters.minHealth) params.minHealth = filters.minHealth;
      if (filters.maxHealth) params.maxHealth = filters.maxHealth;

      console.log("📤 Fetching battery posts with params:", params);
      console.log("📤 Full URL:", `${api.defaults.baseURL}/api/sale-posts/batteries`);

      const response = await api.get<PageableResponse<ListPostSummary>>(
        "/api/sale-posts/batteries",
        {
          params,
        }
      );

      console.log("✅ Battery posts fetched:", response.data);
      console.log("✅ Response status:", response.status);
      console.log("✅ Response headers:", response.headers);

      // Handle different response formats
      let data = response.data;
      
      // If response is wrapped in a result object
      if (data && 'result' in data && Array.isArray(data.result)) {
        data = {
          content: data.result,
          totalPages: data.totalPages || 1,
          totalElements: data.totalElements || data.result.length,
          first: data.first ?? true,
          last: data.last ?? true,
          size: data.size || params.size,
          number: data.number || params.page,
          numberOfElements: data.numberOfElements || data.result.length,
          empty: data.empty ?? (data.result.length === 0),
        } as PageableResponse<ListPostSummary>;
      }

      // If response has code field (some APIs return {code, result, message})
      if (data && 'code' in data && data.code === 1000 && 'result' in data) {
        const result = data.result;
        if (Array.isArray(result)) {
          data = {
            content: result,
            totalPages: 1,
            totalElements: result.length,
            first: true,
            last: true,
            size: params.size,
            number: params.page,
            numberOfElements: result.length,
            empty: result.length === 0,
          } as PageableResponse<ListPostSummary>;
        } else if (result && typeof result === "object" && 'content' in result) {
          data = result as PageableResponse<ListPostSummary>;
        }
      }

      if (data.content) {
        data.content = data.content.map((post: any) => ({
          ...post,
          priorityLevel: post.priorityLevel ?? 1,
        }));
      }

      return data;
    } catch (error: any) {
      console.error("❌ Error fetching battery posts:", error);
      console.error("❌ Error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: error?.config?.url,
        baseURL: error?.config?.baseURL,
      });
      throw error;
    }
  },

  getBatteryById: async (listingId: number) => {
    const response = await api.get(`/api/sale-posts/${listingId}`);

    if (response.data?.result) {
      return response.data.result;
    }

    return response.data;
  },
};

