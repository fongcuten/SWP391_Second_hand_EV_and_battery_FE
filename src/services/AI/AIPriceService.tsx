import api from "../../config/axios";

export interface VehiclePriceRequest {
  productType: "VEHICLE";
  provinceCode: number;
  brand: string;
  model: string;
  year: number;
  odoKm: number;
}

export interface BatteryPriceRequest {
  productType: "BATTERY";
  chemistryName: string;
  capacityKwh: number;
  sohPercent: number;
  cycleCount: number;
}

export interface PriceSuggestionResponse {
  priceMinVND: number;
  priceMaxVND: number;
  suggestedPriceVND: number;
  note: string;
}

export const PriceSuggestionService = {
  async getVehiclePriceSuggestion(
    request: VehiclePriceRequest
  ): Promise<PriceSuggestionResponse> {
    try {
      console.log("📤 Requesting vehicle price suggestion:", request);
      const response = await api.post<PriceSuggestionResponse>(
        "/ai/price",
        request
      );
      console.log("✅ Vehicle price suggestion received:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error getting vehicle price suggestion:", error);
      console.error("❌ Error details:", error.response?.data);
      throw error;
    }
  },

  async getBatteryPriceSuggestion(
    request: BatteryPriceRequest
  ): Promise<PriceSuggestionResponse> {
    try {
      console.log("📤 Requesting battery price suggestion:", request);
      const response = await api.post<PriceSuggestionResponse>(
        "/ai/price",
        request
      );
      console.log("✅ Battery price suggestion received:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error getting battery price suggestion:", error);
      console.error("❌ Error details:", error.response?.data);
      throw error;
    }
  },
};