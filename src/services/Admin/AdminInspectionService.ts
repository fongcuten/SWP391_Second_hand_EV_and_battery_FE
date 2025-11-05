import api from "../../config/axios";

export interface InspectionOrder {
  orderId: number;
  listingId: number;
  userId: number;
  status: string;
  scheduledAt?: string;
  provinceCode?: number;
  districtCode?: number;
  wardCode?: number;
  street?: string;
  price?: number;
  createdAt: string;
}

export interface InspectionOrderDetail extends InspectionOrder {
  // Additional details if needed
}

export interface InspectionReport {
  reportId: number;
  listingId: number;
  inspectionOrderId?: number;
  sourceType: string;
  provider: string;
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  result?: "PASS" | "FAIL" | "NEED_FIX";
  reportUrl?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface InspectionReportDetail extends InspectionReport {
  // Additional details if needed
}

interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const adminInspectionService = {
  // Inspection Orders
  async getAllOrders(): Promise<InspectionOrder[]> {
    try {
      // Note: This endpoint might need to be created in backend
      // For now, we'll use a placeholder or check if it exists
      const response = await api.get<InspectionOrder[]>(
        "/api/inspection-orders/all"
      );
      // If backend returns PageResponse, adjust accordingly
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching inspection orders:", error);
      // Fallback: try alternative endpoint
      try {
        const response = await api.get("/api/inspection-orders");
        return Array.isArray(response.data) ? response.data : [];
      } catch (e) {
        console.error("Fallback endpoint also failed:", e);
        return [];
      }
    }
  },

  async getOrderById(orderId: number): Promise<InspectionOrderDetail> {
    try {
      const response = await api.get<InspectionOrderDetail>(
        `/api/inspection-orders/${orderId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching inspection order:", error);
      throw error;
    }
  },

  // Inspection Reports
  async getAllReports(
    status?: "PENDING_REVIEW" | "APPROVED" | "REJECTED"
  ): Promise<InspectionReport[]> {
    try {
      const params: any = { page: 0, size: 100 };
      if (status) {
        // Filter by status if backend supports it
        params.status = status;
      }
      const response = await api.get<PageResponse<InspectionReport>>(
        "/api/inspection-reports",
        { params }
      );
      // If response is PageResponse, extract content
      if (response.data && "content" in response.data) {
        let reports = response.data.content;
        // Filter by status on frontend if backend doesn't support it
        if (status && !params.status) {
          reports = reports.filter((r) => r.status === status);
        }
        return reports;
      }
      // If response is array directly
      if (Array.isArray(response.data)) {
        let reports = response.data;
        if (status) {
          reports = reports.filter((r) => r.status === status);
        }
        return reports;
      }
      return [];
    } catch (error) {
      console.error("Error fetching inspection reports:", error);
      return [];
    }
  },

  async getReportById(reportId: number): Promise<InspectionReportDetail> {
    try {
      const response = await api.get<InspectionReportDetail>(
        `/api/inspection-reports/${reportId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching inspection report:", error);
      throw error;
    }
  },

  async approveReport(
    reportId: number,
    result: "PASS" | "FAIL" = "PASS"
  ): Promise<void> {
    try {
      await api.post(`/api/inspection-reports/${reportId}/review`, {
        approve: true,
        result: result,
      });
    } catch (error) {
      console.error("Error approving inspection report:", error);
      throw error;
    }
  },

  async rejectReport(
    reportId: number,
    result: "PASS" | "FAIL" | "NEED_FIX" = "FAIL"
  ): Promise<void> {
    try {
      await api.post(`/api/inspection-reports/${reportId}/review`, {
        approve: false,
        result: result,
      });
    } catch (error) {
      console.error("Error rejecting inspection report:", error);
      throw error;
    }
  },
};

