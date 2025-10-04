import React from "react";
import type { ElectricVehicle } from "../types/electricVehicle";
import {
  Battery,
  Gauge,
  Clock,
  MapPin,
  Calendar,
  Zap,
  Car,
  Star,
} from "lucide-react";

interface ElectricVehicleCardProps {
  vehicle: ElectricVehicle;
  onClick?: (vehicle: ElectricVehicle) => void;
}

const ElectricVehicleCard: React.FC<ElectricVehicleCardProps> = ({
  vehicle,
  onClick,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "excellent":
        return "bg-green-100 text-green-800";
      case "good":
        return "bg-blue-100 text-blue-800";
      case "fair":
        return "bg-yellow-100 text-yellow-800";
      case "poor":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case "excellent":
        return "Xuất sắc";
      case "good":
        return "Tốt";
      case "fair":
        return "Khá";
      case "poor":
        return "Trung bình";
      default:
        return condition;
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden"
      onClick={() => onClick?.(vehicle)}
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {vehicle.images && vehicle.images.length > 0 ? (
          <img
            src={vehicle.images[0]}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Car className="w-16 h-16" />
          </div>
        )}

        {/* Condition Badge */}
        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(
              vehicle.condition
            )}`}
          >
            {getConditionText(vehicle.condition)}
          </span>
        </div>

        {/* Battery Health Badge */}
        <div className="absolute top-2 left-2">
          <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Battery className="w-3 h-3" />
            {vehicle.batteryHealth}%
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {vehicle.brand} {vehicle.model}
          </h3>
          <p className="text-sm text-gray-600">{vehicle.year}</p>
        </div>

        {/* Price */}
        <div className="mb-3">
          <p className="text-xl font-bold text-blue-600">
            {formatPrice(vehicle.price)}
          </p>
          {vehicle.originalPrice > vehicle.price && (
            <p className="text-sm text-gray-500 line-through">
              {formatPrice(vehicle.originalPrice)}
            </p>
          )}
        </div>

        {/* Specifications */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <Gauge className="w-4 h-4" />
              <span>Phạm vi</span>
            </div>
            <span className="font-medium">{vehicle.range} km</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <Zap className="w-4 h-4" />
              <span>Công suất</span>
            </div>
            <span className="font-medium">{vehicle.motorPower} kW</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Sạc</span>
            </div>
            <span className="font-medium">{vehicle.chargingTime}h</span>
          </div>
        </div>

        {/* Mileage and Location */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Gauge className="w-4 h-4" />
            <span>{vehicle.mileage.toLocaleString()} km</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{vehicle.location}</span>
          </div>
        </div>

        {/* Features */}
        {vehicle.features && vehicle.features.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {vehicle.features.slice(0, 3).map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                >
                  {feature}
                </span>
              ))}
              {vehicle.features.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  +{vehicle.features.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Seller Info */}
        <div className="border-t pt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Người bán:</span>
            <span className="font-medium">{vehicle.sellerName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectricVehicleCard;
