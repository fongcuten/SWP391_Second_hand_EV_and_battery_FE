import api from "../../config/axios";

export type DealStatus =
  | "PENDING"
  | "SCHEDULED"
  | "COMPLETED"
  | "CANCELLED"
  | "SELLER_NO_SHOW"
  | "BUYER_NO_SHOW";

export interface DealUserInfo {
  userId: number;
  username: string;
  fullName?: string;
  phone?: string;
}

export interface AdminDealResponse {
  dealId: number;
  buyerId: number;
  sellerId: number;
  listingId: number;
  status: DealStatus;
  balanceDue: number;
  platformSiteId?: number;
  platformSiteName?: string;
  scheduledDate?: string;
  scheduledAt?: string;
  createdAt?: string;
  updatedAt?: string;
  buyer?: DealUserInfo;
  seller?: DealUserInfo;
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
  updateStatus: async (
    dealId: number,
    status: DealStatus
  ): Promise<AdminDealResponse> => {
    const res = await api.put(`/api/deals/${dealId}/status`, null, {
      params: { status },
    });
    if (res.data?.code !== 1000)
      throw new Error(res.data?.message || "Failed to update deal status");
    return res.data.result as AdminDealResponse;
  },
};
