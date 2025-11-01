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
    code: number;
    message: string;
    result?: {
        orderId: number;
        listingId: number;
        inspectionType: string;
        status: string;
        createdAt: string;
        scheduledDate?: string;
        location?: {
            provinceCode: number;
            districtCode: number;
            wardCode: number;
            street: string;
        };
    };
}

export class InspectionService {
    /**
     * Submit inspection order for a vehicle listing
     */
    static async submitInspectionOrder(
        payload: InspectionOrderRequest,
        file?: File
    ): Promise<InspectionOrderResponse> {
        try {
            console.log("📤 Submitting inspection order:", payload);

            const formData = new FormData();

            // ✅ Append JSON payload as string (same pattern as createSalePost)
            formData.append("payload", JSON.stringify(payload));

            // ✅ Append file if provided (for manual inspection)
            if (file) {
                formData.append("file", file);
                console.log("📎 File attached:", file.name, `(${(file.size / 1024).toFixed(2)} KB)`);
            }

            // ✅ Log FormData contents
            console.log("📦 FormData contents:");
            console.log("  - payload:", JSON.stringify(payload));
            console.log("  - file:", file ? `${file.name} (${(file.size / 1024).toFixed(2)} KB)` : "none");

            // ✅ Send FormData - DON'T set Content-Type header (let browser set it with boundary)
            const response = await api.post<InspectionOrderResponse>(
                "/api/inspection-orders",
                formData
            );

            console.log("✅ Inspection order submitted:", response.data);

            if (response.data.code !== 0) {
                throw new Error(
                    response.data.message || "Failed to submit inspection order"
                );
            }

            return response.data;
        } catch (error: any) {
            console.error("❌ Error submitting inspection order:", error);
            console.error("❌ Error response:", error.response?.data);
            console.error("❌ Error status:", error.response?.status);

            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }

            if (error.response?.status === 415) {
                throw new Error(
                    "Backend doesn't accept file upload format. Please contact support."
                );
            }

            throw error;
        }
    }

    /**
     * Get inspection orders for current user
     */
    static async getMyInspectionOrders(): Promise<InspectionOrderResponse[]> {
        try {
            const response = await api.get<{
                code: number;
                message: string;
                result: InspectionOrderResponse[];
            }>("/api/inspection-orders/my-orders");

            console.log("✅ Loaded inspection orders:", response.data);

            if (response.data.code !== 0) {
                throw new Error(
                    response.data.message || "Failed to load inspection orders"
                );
            }

            return response.data.result || [];
        } catch (error: any) {
            console.error("❌ Error loading inspection orders:", error);
            return [];
        }
    }

    /**
     * Get inspection order details by ID
     */
    static async getInspectionOrderById(
        orderId: number
    ): Promise<InspectionOrderResponse> {
        try {
            const response = await api.get<InspectionOrderResponse>(
                `/api/inspection-orders/${orderId}`
            );

            console.log("✅ Loaded inspection order:", response.data);

            if (response.data.code !== 0) {
                throw new Error(
                    response.data.message || "Failed to load inspection order"
                );
            }

            return response.data;
        } catch (error: any) {
            console.error("❌ Error loading inspection order:", error);
            throw error;
        }
    }

    /**
     * Cancel inspection order
     */
    static async cancelInspectionOrder(orderId: number): Promise<void> {
        try {
            const response = await api.delete<InspectionOrderResponse>(
                `/api/inspection-orders/${orderId}`
            );

            console.log("✅ Cancelled inspection order:", response.data);

            if (response.data.code !== 0) {
                throw new Error(
                    response.data.message || "Failed to cancel inspection order"
                );
            }
        } catch (error: any) {
            console.error("❌ Error cancelling inspection order:", error);

            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }

            throw error;
        }
    }
}