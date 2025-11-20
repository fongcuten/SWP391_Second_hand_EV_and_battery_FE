import api from "../../config/axios";

export interface RevenueResponse {
  totalPayment: number;
  totalRefund: number;
  netRevenue: number;
}

export interface RefundTransaction {
  id: number;
  userId: number;
  referenceId: number;
  referenceType: string;
  amount: number;
  type: "PAYMENT" | "REFUND";
  status: "SUCCEEDED" | "FAILED" | "PENDING" | "REFUNDED";
  createdAt?: string;
}

export const adminRevenueService = {
  getRevenue: async (): Promise<RevenueResponse> => {
    const res = await api.get<RevenueResponse>("/api/admin/revenue");
    return res.data;
  },
  getPendingRefunds: async (): Promise<RefundTransaction[]> => {
    const res = await api.get<RefundTransaction[]>(
      "/api/admin/refunds/pending"
    );
    return res.data;
  },
  confirmRefund: async (id: number): Promise<void> => {
    await api.post(`/api/admin/refunds/confirm/${id}`);
  },
};

