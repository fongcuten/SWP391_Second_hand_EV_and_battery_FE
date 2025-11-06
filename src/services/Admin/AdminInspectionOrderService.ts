import api from "../../config/axios";

export type InspectionOrderStatus =
  | "CREATED"
  | "SCHEDULED"
  | "PAID"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatus = "UNPAID" | "PENDING" | "PAID" | "REFUNDED";

export interface AdminInspectionOrder {
  orderId: number;
  listingId: number;
  status: InspectionOrderStatus | string;
  paymentStatus?: PaymentStatus | string;
  scheduledAt?: string;
  provinceCode?: number;
  districtCode?: number;
  wardCode?: number;
  street?: string;
  amount?: number;
  createdAt?: string;
  paidAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page index
  size: number; // page size
}

export const adminInspectionOrderService = {
  async list(page = 0, size = 10): Promise<PageResponse<AdminInspectionOrder>> {
    const res = await api.get("/api/inspection-orders", { params: { page, size } });

    // Backend returns Spring Page, pass-through shape expected
    if (res?.data?.content) {
      return res.data as PageResponse<AdminInspectionOrder>;
    }

    // Fallback to array-only shape
    const items: AdminInspectionOrder[] = Array.isArray(res.data)
      ? (res.data as AdminInspectionOrder[])
      : Array.isArray(res.data?.result)
      ? (res.data.result as AdminInspectionOrder[])
      : [];

    return {
      content: items,
      totalElements: items.length,
      totalPages: 1,
      number: 0,
      size: items.length || size,
    };
  },

  async inspect(orderId: number, result: "PASS" | "FAIL"): Promise<void> {
    await api.post(`/api/inspection-orders/${orderId}/inspect`, { result });
  },
};


