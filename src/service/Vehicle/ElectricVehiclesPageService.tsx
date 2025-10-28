import api from "../../config/axios";

export interface ListPostSummary {
    listingId: number;
    productName: string;
    askPrice: number;
    productType: "VEHICLE" | "BATTERY";
    provinceCode: number;
    districtCode: number;
    wardCode: number;
    street: string;
    address: string;
    coverThumb: string;
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

export interface ListPostFilters {
    productType?: "VEHICLE" | "BATTERY";
    minPrice?: number;
    maxPrice?: number;
    provinceCode?: number;
    districtCode?: number;
    wardCode?: number;
}

export const ListPostService = {
    getSalePosts: async (
        page: number = 0,
        size: number = 20,
        sort?: string,          // keep param for caller but DO NOT send it
        filters?: ListPostFilters
    ): Promise<PageableResponse<ListPostSummary>> => {
        const params: Record<string, any> = { page, size };

        // Do NOT send sort to backend because it causes 400
        // if (sort) params.sort = sort; // <-- removed

        // Add filters (safe to send)
        if (filters) {
            if (filters.productType) params.productType = filters.productType;
            if (filters.minPrice) params.minPrice = filters.minPrice;
            if (filters.maxPrice) params.maxPrice = filters.maxPrice;
            if (filters.provinceCode) params.provinceCode = filters.provinceCode;
            if (filters.districtCode) params.districtCode = filters.districtCode;
            if (filters.wardCode) params.wardCode = filters.wardCode;
        }

        console.log("🔍 Request params (no sort):", params);

        try {
            const response = await api.get("/api/sale-posts", { params });
            console.log("📦 API Response:", response.data);

            if (response.data && typeof response.data === "object") {
                if ("result" in response.data) return response.data.result;
                if ("content" in response.data) return response.data;
            }
            throw new Error("Invalid response format");
        } catch (error: any) {
            console.error("❌ API Error:", error);
            console.error("❌ Error Response:", error.response?.data);
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