import api from "../../config/axios";

export type InspectionAdminStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED";

export interface AdminInspectionReportResponse {
  reportId: number;
  listingId: number;
  inspectionOrderId: number | null;
  sourceType: string; // USER, SYSTEM
  provider: string; // USER_UPLOAD, THIRD_PARTY
  status: InspectionAdminStatus;
  result?: "PASS" | "FAIL";
  reportUrl?: string;
  approvedAt?: string;
  createdAt: string;
}

export const adminInspectionService = {
  listReports: async (
    status?: InspectionAdminStatus
  ): Promise<AdminInspectionReportResponse[]> => {
    const res = await api.get("/api/inspection-reports", {
      params: status ? { status } : undefined,
    });
    const data = res.data as any;
    if (Array.isArray(data)) return data as AdminInspectionReportResponse[];
    if (data?.code === 1000) {
      return (data.result || []) as AdminInspectionReportResponse[];
    }
    if (Array.isArray(data?.items))
      return data.items as AdminInspectionReportResponse[];
    if (Array.isArray(data?.content))
      return data.content as AdminInspectionReportResponse[];
    return [];
  },

  updateStatus: async (
    reportId: number,
    status: InspectionAdminStatus
  ): Promise<void> => {
    // Try conventional status update endpoint first
    try {
      await api.put(`/api/inspection-reports/${reportId}/status`, { status });
      return;
    } catch {
      // Fallback to generic update if backend expects different route
      await api.put(`/api/inspection-reports/${reportId}`, { status });
    }
  },

  approve: async (reportId: number): Promise<void> => {
    try {
      await api.post(`/api/inspection-reports/${reportId}/approve`);
    } catch {
      await adminInspectionService.updateStatus(reportId, "APPROVED");
    }
  },

  reject: async (reportId: number): Promise<void> => {
    try {
      await api.post(`/api/inspection-reports/${reportId}/reject`);
    } catch {
      await adminInspectionService.updateStatus(reportId, "REJECTED");
    }
  },
};
