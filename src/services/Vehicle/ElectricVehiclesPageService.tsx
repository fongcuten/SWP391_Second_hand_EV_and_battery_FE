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
    priorityLevel?: number; // ✅ Make sure this exists and is NOT optional, or default to 1
    seller?: string;
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
        size: number = 20,
        sortBy: string = "",
        filters?: ListPostFilters
    ): Promise<PageResponse<ListPostSummary>> {
        try {
            const params: any = {
                page,
                size,
            };

            if (sortBy) params.sortBy = sortBy;
            if (filters?.minPrice !== undefined) params.minPrice = filters.minPrice;
            if (filters?.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
            if (filters?.provinceCode !== undefined) params.provinceCode = filters.provinceCode;
            if (filters?.productType) params.productType = filters.productType;

            console.log("📤 Fetching posts with params:", params);

            const response = await api.get<PageResponse<ListPostSummary>>("/api/sale-posts/vehicles", {
                params,
            });

            console.log("✅ Posts fetched:", response.data);

            // ✅ Check if API returns priority_level instead of priorityLevel
            if (response.data.content) {
                response.data.content = response.data.content.map((post: any) => ({
                    ...post,
                    priorityLevel: post.priorityLevel ?? post.priority_level ?? post.priority ?? 1,
                }));
            }

            return response.data;
        } catch (error: any) {
            console.error("❌ Error fetching sale posts:", error);
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