import api from "../config/axios";
import { authService } from "./authService";

export interface AddFavoriteRequest {
    userId: number;
    listingId: number;
}

export interface FavoriteItem {
    userId: number;
    username: string;
    listingId: number;
    productType: "EV" | "BATTERY";
    description: string;
    askPrice: number;
    createdAt: string;
    // Additional fields from listing details (may be undefined)
    title?: string;
    image?: string;
    location?: string;
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
    result: FavoriteItem[];
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

            // ✅ Check for success code (0 or 1000)
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

            // ✅ Check for success code (0 or 1000)
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
     * Get all favorites for a specific user
     */
    static async getUserFavoritesByUserId(userId: number): Promise<FavoriteItem[]> {
        try {
            console.log("📋 Fetching favorites for userId:", userId);

            const response = await api.get<FavoritesListResponse>(
                `/api/favorites/user/${userId}`
            );

            console.log("✅ API Response:", response.data);
            console.log("✅ Response code:", response.data.code);
            console.log("✅ Response result:", response.data.result);

            // ✅ Check for success code (0 or 1000)
            if (response.data.code !== 0 && response.data.code !== 1000) {
                console.error("❌ Non-success code:", response.data.code);
                throw new Error(response.data.message || "Failed to load favorites");
            }

            const favorites = response.data.result || [];
            console.log("✅ Parsed favorites count:", favorites.length);
            console.log("✅ Favorites data:", favorites);

            return favorites;
        } catch (error: any) {
            console.error("❌ Error loading favorites:", error);
            console.error("❌ Error response:", error.response?.data);
            console.error("❌ Error status:", error.response?.status);

            if (error.response?.status === 404) {
                console.log("ℹ️ No favorites found for user (404)");
                return [];
            }

            // Don't throw error, return empty array
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
            // Return empty array instead of throwing
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