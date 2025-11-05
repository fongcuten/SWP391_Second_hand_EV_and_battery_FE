import api from "../../config/axios";

export type ReportStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface AdminReportResponse {
  reportId: number;
  reporterId: number;
  listingId: number;
  reason: string;
  description?: string;
  status: ReportStatus;
  createdAt?: string;
}

export const adminReportService = {
  list: async (status?: ReportStatus): Promise<AdminReportResponse[]> => {
    const res = await api.get("/api/reports", { params: { status } });
    if (res.data?.code !== 1000)
      throw new Error(res.data?.message || "Failed to load reports");
    return res.data.result as AdminReportResponse[];
  },
  updateStatus: async (
    reporterId: number,
    listingId: number,
    status: ReportStatus
  ): Promise<void> => {
    const res = await api.put("/api/reports/status", undefined, {
      params: { reporterId, listingId, status },
    });
    if (res.data?.code !== 1000)
      throw new Error(res.data?.message || "Failed to update status");
  },
};
