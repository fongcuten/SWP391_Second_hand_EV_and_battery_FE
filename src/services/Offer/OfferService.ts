import api from "../../config/axios";

export interface CreateOfferPayload {
    buyerId: number;
    listingId: number;
    proposedPrice: number;
}

export interface Offer {
    offerId: number;
    buyerId: number;
    buyerName: string;
    listingId: number;
    sellerId: number;
    sellerName: string;
    proposedPrice: number;
    status: string;
    createdAt: string;
    expiresAt: string;
}

export interface OfferListResponse {
    code: number;
    message: string;
    result: Offer[];
}

export type OfferStatus = 'ACCEPTED' | 'REJECTED';

export interface UpdateOfferStatusPayload {
    offerId: number;
    status: OfferStatus;
}

export const OfferService = {
    /**
     * Submits a new price offer for a listing.
     * @param payload The offer data.
     */
    async createOffer(payload: CreateOfferPayload): Promise<any> {
        try {
            const response = await api.post("/api/offers", payload);
            return response.data;
        } catch (error: any) {
            console.error("❌ Error creating offer:", error);
            throw error;
        }
    },

    /**
     * Gets the list of offers made by a specific buyer.
     * @param buyerId The ID of the buyer.
     */
    async getOffersByBuyer(buyerId: number): Promise<Offer[]> {
        try {
            const response = await api.get<OfferListResponse>(`/api/offers/buyer/${buyerId}`);
            return response.data.result || [];
        } catch (error: any) {
            console.error("❌ Error fetching offers by buyer:", error);
            throw error;
        }
    },

    /**
     * Gets the list of offers received by a specific seller.
     * @param sellerId The ID of the seller.
     */
    async getOffersBySeller(sellerId: number): Promise<Offer[]> {
        try {
            const response = await api.get<OfferListResponse>(`/api/offers/seller/${sellerId}`);
            return response.data.result || [];
        } catch (error: any) {
            console.error("❌ Error fetching offers by seller:", error);
            throw error;
        }
    },

    /**
     * Updates the status of an offer (e.g., accepts or rejects it).
     * @param payload The offer ID and the new status.
     */
    async updateOfferStatus({ offerId, status }: UpdateOfferStatusPayload): Promise<any> {
        try {
            const response = await api.put(`/api/offers/${offerId}/status`, null, {
                params: { status }
            });
            if (response.data.code !== 0 && response.data.code !== 1000) {
                throw new Error(response.data.message || "Failed to update offer status");
            }
            return response.data;
        } catch (error: any) {
            console.error("❌ Error updating offer status:", error);
            throw error;
        }
    },

    /**
     * Deletes an offer by its ID.
     * @param offerId The ID of the offer to delete.
     */
    async deleteOffer(offerId: number): Promise<any> {
        try {
            const response = await api.delete(`/api/offers/${offerId}`);
            if (response.data.code !== 0 && response.data.code !== 1000) {
                throw new Error(response.data.message || "Failed to delete offer");
            }
            return response.data;
        } catch (error: any) {
            console.error("❌ Error deleting offer:", error);
            throw error;
        }
    }
};