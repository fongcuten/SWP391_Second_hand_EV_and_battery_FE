import api from "../../config/axios";

export type DealStatus = "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELLED";

export interface AdminDealResponse {
  dealId: number;
  buyerId: number;
  sellerId: number;
  listingId: number;
  status: DealStatus;
  price?: number;
  platformSiteId?: number;
  scheduledDate?: string;
  createdAt?: string;
}

export const adminDealService = {
  list: async (status?: DealStatus): Promise<AdminDealResponse[]> => {
    const res = await api.get("/api/deals", { params: { status } });
    if (res.data?.code !== 1000)
      throw new Error(res.data?.message || "Failed to load deals");
    return res.data.result as AdminDealResponse[];
  },
  complete: async (dealId: number): Promise<AdminDealResponse> => {
    const res = await api.put(`/api/deals/${dealId}/complete`);
    if (res.data?.code !== 1000)
      throw new Error(res.data?.message || "Failed to complete deal");
    return res.data.result as AdminDealResponse;
  },
  remove: async (dealId: number): Promise<void> => {
    const res = await api.delete(`/api/deals/${dealId}`);
    if (res.data?.code !== 1000)
      throw new Error(res.data?.message || "Failed to delete deal");
  },
};
