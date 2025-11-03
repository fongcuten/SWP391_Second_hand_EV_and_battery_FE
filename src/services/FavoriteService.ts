import api from "../config/axios";
import { authService } from "./authService";

export interface AddFavoriteRequest {
    userId: number;
    listingId: number;
}

export interface FavoriteResponse {
    code: number;
    message: string;
    result?: {
        userId: number;
        username: string;
        listingId: number;
        productType: string;
        description: string;
        askPrice: number;
        createdAt: string;
    };
}

export class FavoriteService {
    /**
     * Add a listing to favorites
     */
    static async addFavorite(listingId: number): Promise<FavoriteResponse> {
        try {
            // ✅ Get userId from current logged-in user
            const currentUser = authService.getCurrentUser();

            console.log("🔍 Current User Debug:");
            console.log("   currentUser object:", currentUser);
            console.log("   currentUser.id:", currentUser?.id);
            console.log("   localStorage token:", localStorage.getItem("token"));
            console.log("   localStorage auth_token:", localStorage.getItem("auth_token"));

            if (!currentUser) {
                throw new Error("User not authenticated");
            }

            const userId = parseInt(currentUser.id);

            if (isNaN(userId) || userId === 0) {
                console.error("❌ Invalid userId:", { currentUser, userId });
                throw new Error("Invalid user ID");
            }

            console.log("📤 Adding to favorites:");
            console.log("   🔑 Current logged-in userId:", userId);
            console.log("   📋 listingId:", listingId);
            console.log("   userId type:", typeof userId);
            console.log("   listingId type:", typeof listingId);

            const payload: AddFavoriteRequest = {
                userId,
                listingId
            };

            console.log("   📦 payload:", payload);
            console.log("   📄 JSON payload:", JSON.stringify(payload));

            const response = await api.post<FavoriteResponse>(
                "/api/favorites",
                payload
            );

            console.log("✅ API Response:", response.data);
            console.log("📊 Response userId:", response.data.result?.userId);
            console.log("🆚 Comparison:");
            console.log("   Sent userId:", userId);
            console.log("   Received userId:", response.data.result?.userId);
            console.log("   Are they same?", userId === response.data.result?.userId);

            if (response.data.code !== 0) {
                throw new Error(response.data.message || "Failed to add to favorites");
            }

            // ⚠️ Verify the response userId matches the current user
            if (response.data.result && response.data.result.userId !== userId) {
                console.warn("⚠️ WARNING: Backend returned different userId!");
                console.warn("   Expected (current user):", userId);
                console.warn("   Received (from API):", response.data.result.userId);
                console.warn("   This might be a backend issue!");
            }

            return response.data;
        } catch (error: any) {
            console.error("❌ Error adding to favorites:", error);
            console.error("❌ Request config:", error.config);
            console.error("❌ Request data:", error.config?.data);
            console.error("❌ Response data:", error.response?.data);

            const errorMessage = error.response?.data?.message?.toLowerCase() || "";
            if (errorMessage.includes("owner") ||
                errorMessage.includes("own listing") ||
                errorMessage.includes("cannot add your own")) {
                throw new Error("Cannot add your own listing to favorites");
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
            console.log("🗑️ Removing favorite for user:", currentUser?.id);

            const response = await api.delete<FavoriteResponse>(`/api/favorites/${listingId}`);
            console.log("✅ Removed from favorites:", response.data);

            if (response.data.code !== 0) {
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
     * Get all user's favorites
     */
    static async getUserFavorites(): Promise<FavoriteResponse[]> {
        try {
            const currentUser = authService.getCurrentUser();
            console.log("📋 Getting favorites for user:", currentUser?.id);

            const response = await api.get<{
                code: number;
                message: string;
                result: FavoriteResponse[]
            }>("/api/favorites");

            console.log("✅ Loaded favorites:", response.data);

            if (response.data.code !== 0) {
                throw new Error(response.data.message || "Failed to load favorites");
            }

            return response.data.result || [];
        } catch (error: any) {
            console.error("❌ Error loading favorites:", error);
            console.error("❌ Error response:", error.response?.data);
            return [];
        }
    }

    /**
     * Check if a listing is in favorites
     */
    static async isFavorite(listingId: number): Promise<boolean> {
        try {
            const favorites = await this.getUserFavorites();
            return favorites.some(fav => fav.result?.listingId === listingId);
        } catch (error) {
            console.error("❌ Error checking favorite status:", error);
            return false;
        }
    }
}