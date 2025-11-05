import api from "../../config/axios";

export interface InspectionOrderRequest {
  listingId: number;
  scheduledAt?: string;
  provinceCode?: number;
  districtCode?: number;
  wardCode?: number;
  street?: string;
  price?: number;
}

export interface InspectionOrderResponse {
  orderId: number;
  status: string;
  scheduledDate?: string;
  estimatedCompletionDate?: string;
}

export interface InspectionReportResponse {
  reportId: number;
  listingId: number;
  inspectionOrderId: number;
  sourceType: string;
  provider: string;
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  result?: "PASS" | "FAIL";
  reportUrl?: string;
  approvedAt?: string;
  createdAt: string;
}

export class InspectionService {
  /**
   * Submit inspection order (System inspection)
   */
  static async submitInspectionOrder(
    payload: InspectionOrderRequest
  ): Promise<number> {
    try {
      const response = await api.post("/api/inspection-orders", payload);
      return response.data; // ✅ Returns orderId directly
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Không thể gửi yêu cầu kiểm duyệt";
      throw new Error(message);
    }
  }

  /**
   * Submit manual inspection report (Document upload)
   */
  static async submitManualInspection(
    listingId: number,
    file: File,
    inspectionOrderId: number | null // ✅ Allow null for inspectionOrderId
  ): Promise<InspectionReportResponse> {
    try {
      const formData = new FormData();
      formData.append("listingId", listingId.toString());

      // ✅ Only append inspectionOrderId if it's not null
      if (inspectionOrderId !== null) {
        formData.append("inspectionOrderId", inspectionOrderId.toString());
      }

      formData.append("sourceType", "USER");
      formData.append("provider", "USER_UPLOAD");
      formData.append("file", file);

      const response = await api.post("/api/inspection-reports", formData);
      return response.data; // ✅ Returns report response directly
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Không thể tải lên giấy tờ kiểm duyệt";
      throw new Error(message);
    }
  }

  /**
   * Get inspection order details
   */
  static async getInspectionOrder(orderId: number) {
    try {
      const response = await api.get(`/api/inspection-orders/${orderId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
        "Không thể tải thông tin kiểm duyệt"
      );
    }
  }

  /**
   * Get all inspection orders for current user
   */
  static async getMyInspectionOrders() {
    try {
      const response = await api.get("/api/inspection-orders/my-orders");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
        "Không thể tải danh sách kiểm duyệt"
      );
    }
  }

  /**
   * Get inspection reports
   */
  static async getInspectionReports(listingId?: number) {
    try {
      const url = listingId
        ? `/api/inspection-reports?listingId=${listingId}`
        : "/api/inspection-reports";

      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
        "Không thể tải báo cáo kiểm duyệt"
      );
    }
  }

  /**
   * Get inspection report by ID
   */
  static async getInspectionReport(reportId: number) {
    try {
      const response = await api.get(`/api/inspection-reports/${reportId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
        "Không thể tải báo cáo kiểm duyệt"
      );
    }
  }


   static async confirmInspectionPayment(orderId: number): Promise<void> {
    try {
      // The empty object {} is sent as the request body.
      const response = await api.post(`/api/inspection-orders/${orderId}/confirm`, {});
      console.log(`✅ Payment confirmed for order ID: ${orderId}`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ Error confirming payment for order ID: ${orderId}`, error);
      throw error;
    }
  }
}
