import api from "../../config/axios";

export interface PartyInfo {
    userId: number;
    username?: string;
    fullName?: string;
    phone?: string;
}

export interface Deal {
    dealId: number;
    offerId: number;
    platformSiteId?: number;
    platformSiteName?: string;
    balanceDue?: number;
    status?: string;
    scheduledAt?: string;
    createdAt?: string;
    updatedAt?: string;
    buyer?: PartyInfo;
    seller?: PartyInfo;
    listingId?: number;
}

interface DealListResponse {
    code: number;
    message?: string;
    result: Deal[];
}

interface DealResponse {
    code: number;
    message?: string;
    result: Deal;
}

export interface AssignSitePayload {
    offerId: number;
    platformSiteId: number;
    balanceDue?: number;
    scheduledAt?: string; // ISO string
}

const DealService = {
    async getDealsByBuyer(buyerId: number): Promise<Deal[]> {
        try {
            const res = await api.get<DealListResponse>(`/api/deals/buyer/${buyerId}`);
            if (res.data.code !== 0 && res.data.code !== 1000) {
                throw new Error(res.data.message || "Failed to fetch buyer deals");
            }
            return res.data.result || [];
        } catch (error: any) {
            console.error("❌ Error fetching deals by buyer:", error);
            throw error;
        }
    },

    async getDealsBySeller(sellerId: number): Promise<Deal[]> {
        try {
            const res = await api.get<DealListResponse>(`/api/deals/seller/${sellerId}`);
            if (res.data.code !== 0 && res.data.code !== 1000) {
                throw new Error(res.data.message || "Failed to fetch seller deals");
            }
            return res.data.result || [];
        } catch (error: any) {
            console.error("❌ Error fetching deals by seller:", error);
            throw error;
        }
    },

    async assignPlatformSite(dealId: number, payload: AssignSitePayload): Promise<Deal> {
        try {
            const res = await api.put<DealResponse>(`/api/deals/${dealId}/assign-site`, payload);
            if (res.data.code !== 0 && res.data.code !== 1000) {
                throw new Error(res.data.message || "Failed to assign platform site for deal");
            }
            return res.data.result;
        } catch (error: any) {
            console.error("❌ Error assigning platform site for deal:", error);
            throw error;
        }
    },

    async rejectDeal(dealId: number): Promise<void> {
        try {
            const res = await api.post(`/api/deals/${dealId}/reject`);

            if (res.data && typeof res.data === "object" && "code" in res.data) {
                const code = (res.data as any).code;
                if (code !== 0 && code !== 1000) {
                    throw new Error((res.data as any).message || "Failed to reject deal");
                }
            } else if (res.status !== 200 && res.status !== 204) {
                throw new Error("Failed to reject deal");
            }

            return;
        } catch (error: any) {
            console.error("❌ Error rejecting deal:", error);
            throw error;
        }
    },

    async confirmDeal(dealId: number): Promise<void> {
        try {
            const res = await api.post(`/api/deals/${dealId}/confirm`);

            if (res.data && typeof res.data === "object" && "code" in res.data) {
                const code = (res.data as any).code;
                if (code !== 0 && code !== 1000) {
                    throw new Error((res.data as any).message || "Failed to confirm deal");
                }
            } else if (res.status !== 200 && res.status !== 204) {
                throw new Error("Failed to confirm deal");
            }

            return;
        } catch (error: any) {
            console.error("❌ Error confirming deal:", error);
            throw error;
        }
    },

    async checkoutDeal(dealId: number): Promise<{ sessionId: string; url: string }> {
        try {
            const res = await api.post(`/api/deals/${dealId}/checkout`, {});

            console.log(`📦 checkout res status=${res.status}`, res.data);

            if (res.data && typeof res.data === "object" && "code" in res.data) {
                const code = (res.data as any).code;
                if (code !== 0 && code !== 1000) {
                    throw new Error((res.data as any).message || `Failed to create checkout session (code ${code})`);
                }
                const result = (res.data as any).result || {};
                return { sessionId: result.sessionId, url: result.url };
            }

            if (res.data && typeof res.data === "object") {
                const sd = res.data as any;
                if (sd.sessionId || sd.url) return { sessionId: sd.sessionId, url: sd.url };
            }

            throw new Error("Unexpected checkout response");
        } catch (error: any) {
            console.error("❌ Error creating checkout session:", error);
            console.error("▶ server response data:", error.response?.data);
            const serverMsg = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(String(serverMsg));
        }
    },
};

export default DealService;