import api  from "../../config/axios";

export interface CreateReportPayload {
    listingId: number;
    reporterId: number;
    reason: string;
}

export const ReportService = {
    async createReport(payload: CreateReportPayload): Promise<any> {
        try {
            const response = await api.post("/api/reports", payload);
            return response.data;
        } catch (error: any) {
            console.error("❌ Error creating report:", error);
            throw error;
        }
    }
};