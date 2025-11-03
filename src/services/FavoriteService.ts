import api from "../config/axios";
import { authService } from "./authService";

export interface AddFavoriteRequest {
    userId: number;
    listingId: number;
}

export interface FavoriteListingItem {
    listingId: number;
    productName: string;
    askPrice: number;
    productType: string;
    priorityLevel: number;
    provinceCode: number;
    districtCode: number;
    wardCode: number;
    street: string;
    address: string;
    coverThumb: string;
}

export interface PagedFavoritesResult {
    totalElements: number;
    totalPages: number;
    size: number;
    content: FavoriteListingItem[];
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    numberOfElements: number;
    pageable: {
        offset: number;
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        pageNumber: number;
        paged: boolean;
        pageSize: number;
        unpaged: boolean;
    };
    first: boolean;
    last: boolean;
    empty: boolean;
}

export interface FavoriteItem {
    userId?: number;
    username?: string;
    listingId: number;
    productType: "EV" | "BATTERY" | string;
    description?: string;
    askPrice: number;
    createdAt?: string;
    title?: string;
    image?: string;
    location?: string;
    street?: string; // ✅ Added
    provinceCode?: number; // ✅ Added
    districtCode?: number; // ✅ Added
    wardCode?: number; // ✅ Added
    address?: string; // ✅ Added
    views?: number;
    rating?: number;
    brand?: string;
    model?: string;
    year?: number;
    mileage?: number;
    batteryCapacity?: number;
    condition?: "excellent" | "good" | "fair" | "poor";
}

export interface FavoriteResponse {
    code: number;
    message: string;
    result?: FavoriteItem;
}

export interface FavoritesListResponse {
    code: number;
    message: string;
    result: PagedFavoritesResult;
}

export class FavoriteService {
    /**
     * Add a listing to favorites
     */
    static async addFavorite(listingId: number): Promise<FavoriteResponse> {
        try {
            const currentUser = authService.getCurrentUser();

            if (!currentUser) {
                throw new Error("User not authenticated");
            }

            const userId = parseInt(currentUser.id);

            if (isNaN(userId) || userId === 0) {
                console.error("❌ Invalid userId:", { currentUser, userId });
                throw new Error("Invalid user ID");
            }

            console.log("📤 Adding to favorites:", { userId, listingId });

            const payload: AddFavoriteRequest = {
                userId,
                listingId
            };

            const response = await api.post<FavoriteResponse>(
                "/api/favorites",
                payload
            );

            console.log("✅ Add favorite response:", response.data);

            if (response.data.code !== 0 && response.data.code !== 1000) {
                throw new Error(response.data.message || "Failed to add to favorites");
            }

            return response.data;
        } catch (error: any) {
            console.error("❌ Error adding to favorites:", error);
            console.error("❌ Response data:", error.response?.data);

            const errorMessage = error.response?.data?.message?.toLowerCase() || "";
            if (errorMessage.includes("owner") ||
                errorMessage.includes("own listing") ||
                errorMessage.includes("cannot add your own")) {
                throw new Error("Không thể thêm tin đăng của chính bạn vào yêu thích");
            }

            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }

            throw error;
        }
    }

    /**
     * Remove a listing from favorites
     */
    static async removeFavorite(listingId: number): Promise<void> {
        try {
            const currentUser = authService.getCurrentUser();
            console.log("🗑️ Removing favorite for user:", currentUser?.id, "listingId:", listingId);

            const response = await api.delete<FavoriteResponse>(`/api/favorites/${listingId}`);
            console.log("✅ Remove favorite response:", response.data);

            if (response.data.code !== 0 && response.data.code !== 1000) {
                throw new Error(response.data.message || "Failed to remove from favorites");
            }
        } catch (error: any) {
            console.error("❌ Error removing from favorites:", error);
            console.error("❌ Error response:", error.response?.data);

            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }

            throw error;
        }
    }

    /**
     * Get all favorites for a specific user (with pagination)
     */
    static async getUserFavoritesByUserId(
        userId: number,
        page: number = 0,
        size: number = 100
    ): Promise<FavoriteItem[]> {
        try {
            console.log("📋 Fetching favorites for userId:", userId);

            const response = await api.get<FavoritesListResponse>(
                `/api/favorites/user/${userId}`,
                {
                    params: { page, size }
                }
            );

            console.log("✅ API Response:", response.data);
            console.log("✅ Response code:", response.data.code);
            console.log("✅ Response result:", response.data.result);

            if (response.data.code !== 0 && response.data.code !== 1000) {
                console.error("❌ Non-success code:", response.data.code);
                throw new Error(response.data.message || "Failed to load favorites");
            }

            const pagedResult = response.data.result;

            if (!pagedResult || !pagedResult.content) {
                console.log("ℹ️ No favorites found (empty result)");
                return [];
            }

            // ✅ Transform with ALL location fields included
            const favorites: FavoriteItem[] = pagedResult.content.map(item => {
                console.log("📍 Raw item location data:", {
                    provinceCode: item.provinceCode,
                    districtCode: item.districtCode,
                    wardCode: item.wardCode,
                    street: item.street,
                    address: item.address
                });

                return {
                    listingId: item.listingId,
                    productType: item.productType,
                    askPrice: item.askPrice,
                    title: item.productName,
                    description: item.productName,
                    image: item.coverThumb,
                    location: item.address,
                    address: item.address,
                    street: item.street, // ✅ Pass through
                    provinceCode: item.provinceCode, // ✅ Pass through
                    districtCode: item.districtCode, // ✅ Pass through
                    wardCode: item.wardCode, // ✅ Pass through
                    views: 0,
                    rating: 0,
                };
            });

            console.log("✅ Parsed favorites count:", favorites.length);
            console.log("✅ Transformed favorites with location codes:", favorites);

            return favorites;
        } catch (error: any) {
            console.error("❌ Error loading favorites:", error);
            console.error("❌ Error response:", error.response?.data);
            console.error("❌ Error status:", error.response?.status);

            if (error.response?.status === 404) {
                console.log("ℹ️ No favorites found for user (404)");
                return [];
            }

            console.warn("⚠️ Returning empty array due to error");
            return [];
        }
    }

    /**
     * Get current user's favorites
     */
    static async getCurrentUserFavorites(): Promise<FavoriteItem[]> {
        try {
            const currentUser = authService.getCurrentUser();

            if (!currentUser) {
                console.error("❌ No current user found");
                throw new Error("User not authenticated");
            }

            const userId = parseInt(currentUser.id);

            if (isNaN(userId) || userId === 0) {
                console.error("❌ Invalid user ID:", currentUser.id);
                throw new Error("Invalid user ID");
            }

            console.log("📋 Getting favorites for current user ID:", userId);

            return await this.getUserFavoritesByUserId(userId);
        } catch (error: any) {
            console.error("❌ Error loading current user favorites:", error);
            return [];
        }
    }

    /**
     * Check if a listing is in favorites
     */
    static async isFavorite(listingId: number): Promise<boolean> {
        try {
            const favorites = await this.getCurrentUserFavorites();
            const isFav = favorites.some(fav => fav.listingId === listingId);
            console.log(`🔍 Is listing ${listingId} favorite?`, isFav);
            return isFav;
        } catch (error) {
            console.error("❌ Error checking favorite status:", error);
            return false;
        }
    }
}