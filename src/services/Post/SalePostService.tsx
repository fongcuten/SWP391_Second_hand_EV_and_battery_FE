import api from "../../config/axios";

export interface VehiclePostData {
  modelId: number;
  year: number;
  odoKm: number;
  vin: string;
  transmission: string;
  fuelType: string;
  origin: string;
  bodyStyle: string;
  seatCount: number;
  color: string;
  accessories: boolean;
  registration: boolean;
}

export interface BatteryPostData {
  chemistryName: string;
  capacityKwh: number;
  sohPercent: number;
  cycleCount: number;
}

export interface CreateSalePostPayload {
  productType: "VEHICLE" | "BATTERY";
  askPrice: number;
  title: string;
  description: string;
  provinceCode: number;
  districtCode: number;
  wardCode: number;
  street: string;
  priorityLevel?: number;
  vehicle?: {
    modelId: number;
    year: number;
    odoKm: number;
    vin: string;
    transmission: string;
    fuelType: string;
    origin: string;
    bodyStyle: string;
    seatCount: number;
    color: string;
    accessories: boolean;
    registration: boolean;
  };
  battery?: {
    modelId: number;
    chemistryName: string;
    capacityKwh: number;
    sohPercent: number;
    cycleCount: number;
  };
}

export interface MediaResponse {
  mediaId: number;
  publicId: string;
  type: string;
  url: string;
  urlLarge: string;
  urlThumb: string;
  sortOrder: number;
}

export interface SalePostResponse {
  listingId: number;
  seller: string;
  productType: "VEHICLE" | "BATTERY";
  askPrice: number;
  title: string;
  description: string;
  status: string;
  provinceCode: number;
  districtCode: number;
  wardCode: number;
  street: string;
  priorityLevel: number;
  createdAt: string;
  batteryPost?: BatteryPostData;
  vehiclePost?: VehiclePostData & { modelName: string; brandName: string };
  media: MediaResponse[];
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

export const createSalePost = async (
  payload: CreateSalePostPayload,
  files: File[]
): Promise<ApiResponse<SalePostResponse>> => {
  const formData = new FormData();

  // Append JSON payload as string
  formData.append("payload", JSON.stringify(payload));

  // Append each file
  files.forEach((file) => {
    formData.append("files", file);
  });

  console.log("📤 FormData contents:");
  console.log("  - payload:", JSON.stringify(payload));
  console.log("  - files:", files.length, "files");

  // ✅ DON'T set Content-Type - let browser handle it
  const response = await api.post("/api/sale-posts", formData);

  return response.data;
};