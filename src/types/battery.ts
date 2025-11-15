export interface Battery {
  id: string;
  brand: string;
  model: string;
  type: "lithium-ion" | "lithium-polymer" | "LFP" | "NMC" | "other";
  capacity: number; // kWh
  voltage: number; // V
  currentHealth: number; // percentage
  cycleCount: number; // number of charge cycles
  price: number;
  originalPrice: number;
  manufactureYear: number;
  warranty: number; // months remaining
  compatibility: string[]; // compatible vehicle models
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
  priorityLevel?: number; // Priority level for premium posts (1=NORMAL, 2=STANDARD, 3=PREMIUM)
  // Additional specs
  weight: number; // kg
  dimensions: {
    length: number; // cm
    width: number; // cm
    height: number; // cm
  };
  chargingSpeed: number; // kW max charging speed
  dischargingSpeed: number; // kW max discharging speed
}

export interface BatteryFilter {
  brand?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
  maxCapacity?: number;
  minHealth?: number;
  maxHealth?: number;
  condition?: string;
  location?: string;
  search?: string;
}

export interface BatterySort {
  field: "price" | "capacity" | "currentHealth" | "cycleCount" | "createdAt";
  order: "asc" | "desc";
}

export interface BatteryResponse {
  batteries: Battery[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BatteryFormData {
  brand: string;
  model: string;
  type: "lithium-ion" | "lithium-polymer" | "LFP" | "NMC" | "other";
  capacity: number;
  voltage: number;
  currentHealth: number;
  cycleCount: number;
  price: number;
  originalPrice: number;
  manufactureYear: number;
  warranty: number;
  compatibility: string[];
  condition: "excellent" | "good" | "fair" | "poor";
  description: string;
  images: string[];
  features: string[];
  location: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  chargingSpeed: number;
  dischargingSpeed: number;
}
