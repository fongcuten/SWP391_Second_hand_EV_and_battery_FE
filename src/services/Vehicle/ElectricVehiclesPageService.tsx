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
}

// ✅ Define the filters interface based on the state in your page
export interface ListPostFilters {
  searchTerm?: string;
  priceRange?: string;
  yearRange?: string;
  selectedBrandId?: number | null;
  selectedModelId?: number | null;
  selectedPriority?: number[];
  sortBy?: string;
  selectedProvinceCode?: number | null;
  selectedDistrictCode?: number | null;
  selectedWardCode?: number | null;
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

export const ListPostService = {
  async getSalePosts(
    page: number = 0,
    size: number = 12,
    filters: ListPostFilters = {}
  ): Promise<PageableResponse<ListPostSummary>> {
    try {
      const params: any = {
        page,
        size,
      };

      // --- Translate and add all filter parameters ---

      // Handle sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case "price-asc":
            params.sort = "askPrice,asc";
            break;
          case "price-desc":
            params.sort = "askPrice,desc";
            break;
          case "oldest":
            params.sort = "createdAt,asc";
            break;
          case "newest":
          default:
            params.sort = "createdAt,desc";
            break;
        }
      }

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

      // Handle year range
      if (filters.yearRange) params.year = filters.yearRange;

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

      console.log("📤 Fetching posts with params:", params);

      // The endpoint in your previous code was "/api/sale-posts/vehicles"
      // The swagger doc shows "/api/sale-posts". Ensure this matches your backend.
      const response = await api.get<PageableResponse<ListPostSummary>>(
        "/api/sale-posts/vehicles",
        {
          params,
        }
      );

      console.log("✅ Posts fetched:", response.data);

      if (response.data.content) {
        response.data.content = response.data.content.map((post: any) => ({
          ...post,
          priorityLevel: post.priorityLevel ?? 1,
        }));
      }

      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching sale posts:", error);
      throw error;
    }
  },

  async getBatteryPosts(
    page: number = 0,
    size: number = 12,
    filters: ListPostFilters = {}
  ): Promise<PageableResponse<ListPostSummary>> {
    try {
      const params: any = {
        page,
        size,
      };

      // --- Translate and add all filter parameters ---

      // Handle sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case "price-asc":
            params.sort = "askPrice,asc";
            break;
          case "price-desc":
            params.sort = "askPrice,desc";
            break;
          case "oldest":
            params.sort = "createdAt,asc";
            break;
          case "newest":
          default:
            params.sort = "createdAt,desc";
            break;
        }
      }

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

      // Handle priority
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

      console.log("📤 Fetching battery posts with params:", params);

      const response = await api.get<PageableResponse<ListPostSummary>>(
        "/api/sale-posts/batteries",
        {
          params,
        }
      );

      console.log("✅ Battery posts fetched:", response.data);

      if (response.data.content) {
        response.data.content = response.data.content.map((post: any) => ({
          ...post,
          priorityLevel: post.priorityLevel ?? 1,
        }));
      }

      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching battery posts:", error);
      throw error;
    }
  },

  getPostById: async (listingId: number) => {
    const response = await api.get(`/api/sale-posts/${listingId}`);

    if (response.data?.result) {
      return response.data.result;
    }

    return response.data;
  },
};
