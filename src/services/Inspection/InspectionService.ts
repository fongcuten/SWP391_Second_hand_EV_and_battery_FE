import api from "../../config/axios";

export interface InspectionOrderRequest {
  listingId: number;
  inspectionType: "SYSTEM_AUTO" | "MANUAL_DOCUMENT";
  provinceCode?: number;
  districtCode?: number;
  wardCode?: number;
  street?: string;
}

export interface InspectionOrderResponse {
  orderId: number;
  status: string;
  scheduledDate?: string;
  estimatedCompletionDate?: string;
}

export class InspectionService {
  /**
   * Submit inspection order
   * @param payload - Order details
   * @param file - Optional PDF file for manual inspection
   */
  static async submitInspectionOrder(
    payload: InspectionOrderRequest,
    file?: File
  ): Promise<{
    code: number;
    message: string;
    result: InspectionOrderResponse;
  }> {
    console.log("📤 Submitting inspection order:", payload);

    try {
      // Backend expects JSON at /api/inspection-orders (no file upload endpoint)
      const requestBody: any = {
        listingId: payload.listingId,
        scheduledAt: undefined,
        provinceCode: payload.provinceCode,
        districtCode: payload.districtCode,
        wardCode: payload.wardCode,
        street: payload.street,
        price: undefined,
      };

      const response = await api.post("/api/inspection-orders", requestBody, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("✅ Inspection order created:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error submitting inspection order:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);

      // Handle specific errors
      if (error.response?.status === 415) {
        throw new Error(
          "Định dạng file không được hỗ trợ. Vui lòng chỉ tải lên file PDF."
        );
      }

      if (error.response?.status === 413) {
        throw new Error("File quá lớn. Vui lòng chọn file nhỏ hơn 10MB.");
      }

      const message =
        error.response?.data?.message || "Không thể gửi yêu cầu kiểm duyệt";
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
      console.error("❌ Error fetching inspection order:", error);
      throw new Error(
        error.response?.data?.message || "Không thể tải thông tin kiểm duyệt"
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
      console.error("❌ Error fetching inspection orders:", error);
      throw new Error(
        error.response?.data?.message || "Không thể tải danh sách kiểm duyệt"
      );
    }
  }
}
