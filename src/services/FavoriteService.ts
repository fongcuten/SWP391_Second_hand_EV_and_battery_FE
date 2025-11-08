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
    pageable: any;
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
    street?: string;
    provinceCode?: number;
    districtCode?: number;
    wardCode?: number;
    address?: string;
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

export interface IsFavoriteResponse {
    code: number;
    message: string;
    result: boolean;
}

export interface FavoritesListResponse {
    code: number;
    message: string;
    result: PagedFavoritesResult;
}

export class FavoriteService {
    static async addFavorite(listingId: number): Promise<FavoriteResponse> {
        try {
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                throw new Error("User not authenticated");
            }

            const userId = parseInt(currentUser.id, 10);
            if (isNaN(userId)) {
                throw new Error("Invalid user ID");
            }

            const payload: AddFavoriteRequest = { userId, listingId };
            const response = await api.post<FavoriteResponse>("/api/favorites", payload);

            if (response.data.code !== 0 && response.data.code !== 1000) {
                throw new Error(response.data.message || "Failed to add to favorites");
            }
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred";
            if (String(errorMessage).toLowerCase().includes("owner")) {
                throw new Error("Không thể thêm tin đăng của chính bạn vào yêu thích");
            }
            throw new Error(errorMessage);
        }
    }

    static async removeFavorite(listingId: number): Promise<void> {
        try {
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                throw new Error("User not authenticated");
            }

            const userId = parseInt(currentUser.id, 10);
            if (isNaN(userId)) {
                throw new Error("Invalid user ID");
            }

            const payload = { userId, listingId };
            const response = await api.delete<FavoriteResponse>("/api/favorites", {
                data: payload,
            });

            if (response.data.code !== 0 && response.data.code !== 1000) {
                throw new Error(response.data.message || "Failed to remove from favorites");
            }
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message || "An unknown error occurred");
        }
    }

    static async getUserFavoritesByUserId(
        userId: number,
        page: number = 0,
        size: number = 100
    ): Promise<FavoriteItem[]> {
        try {
            const response = await api.get<FavoritesListResponse>(
                `/api/favorites/user/${userId}`,
                { params: { page, size } }
            );

            if (response.data.code !== 0 && response.data.code !== 1000) {
                throw new Error(response.data.message || "Failed to load favorites");
            }

            const pagedResult = response.data.result;
            if (!pagedResult?.content) {
                return [];
            }

            return pagedResult.content.map((item): FavoriteItem => ({
                listingId: item.listingId,
                productType: item.productType,
                askPrice: item.askPrice,
                title: item.productName,
                description: item.productName,
                image: item.coverThumb,
                location: item.address,
                address: item.address,
                street: item.street,
                provinceCode: item.provinceCode,
                districtCode: item.districtCode,
                wardCode: item.wardCode,
            }));
        } catch (error: any) {
            if (error.response?.status === 404) {
                return [];
            }
            return [];
        }
    }

    static async getCurrentUserFavorites(): Promise<FavoriteItem[]> {
        try {
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                return [];
            }

            const userId = parseInt(currentUser.id, 10);
            if (isNaN(userId)) {
                throw new Error("Invalid user ID");
            }

            return await this.getUserFavoritesByUserId(userId);
        } catch (error) {
            return [];
        }
    }

    static async isFavorite(listingId: number): Promise<boolean> {
        try {
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                return false;
            }

            const userId = parseInt(currentUser.id, 10);
            if (isNaN(userId)) {
                return false;
            }

            const response = await api.get<IsFavoriteResponse>("/api/favorites/check", {
                params: {
                    userId,
                    listingId,
                },
            });

            return response.data.result;
        } catch (error) {
            return false;
        }
    }
}