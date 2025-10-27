export interface ElectricVehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  originalPrice: number;
  mileage: number; // km
  batteryCapacity: number; // kWh
  batteryHealth: number; // percentage
  range: number; // km
  chargingTime: number; // hours
  motorPower: number; // kW
  topSpeed: number; // km/h
  acceleration: number; // 0-100 km/h in seconds
  color: string;
  condition: "excellent" | "good" | "fair" | "poor";
  description: string;
  images: string[];
  features: string[];
  location: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ElectricVehicleFilter {
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  minRange?: number;
  maxRange?: number;
  minBatteryHealth?: number;
  maxBatteryHealth?: number;
  condition?: string;
  location?: string;
  search?: string;
}

export interface ElectricVehicleSort {
  field: "price" | "year" | "mileage" | "range" | "batteryHealth" | "createdAt";
  order: "asc" | "desc";
}

export interface ElectricVehicleResponse {
  vehicles: ElectricVehicle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ElectricVehicleFormData {
  brand: string;
  model: string;
  year: number;
  price: number;
  originalPrice: number;
  mileage: number;
  batteryCapacity: number;
  batteryHealth: number;
  range: number;
  chargingTime: number;
  motorPower: number;
  topSpeed: number;
  acceleration: number;
  color: string;
  condition: "excellent" | "good" | "fair" | "poor";
  description: string;
  images: string[];
  features: string[];
  location: string;
}
