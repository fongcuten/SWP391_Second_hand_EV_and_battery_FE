import React from "react";
import type { ElectricVehicle } from "../types/electricVehicle";
import { Battery, Gauge, Clock, MapPin, Zap, Car, CheckCircle2 } from "lucide-react";

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
      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-blue-200 group"
      onClick={() => onClick?.(vehicle)}
    >
      {/* Image Container */}
      <div className="relative h-48 sm:h-56 md:h-52 lg:h-48 xl:h-52 bg-gray-100 overflow-hidden">
        {vehicle.images && vehicle.images.length > 0 ? (
          <img
            src={vehicle.images[0]}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
            <Car className="w-12 h-12 sm:w-16 sm:h-16" />
          </div>
        )}

        {/* Condition Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${getConditionColor(
              vehicle.condition
            )}`}
          >
            {getConditionText(vehicle.condition)}
          </span>
        </div>

        {/* Battery Health Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-black bg-opacity-80 text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
            <Battery className="w-3 h-3" />
            {vehicle.batteryHealth}%
          </span>
        </div>

        {/* Inspection Badge - Đã kiểm định */}
        {(vehicle.inspectionStatus === "PASS" || vehicle.inspectionStatus === "APPROVED") && (
          <div className="absolute bottom-3 right-3">
            <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đã kiểm định
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        {/* Title */}
        <div className="mb-3">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-1 mb-1">
            {vehicle.brand} {vehicle.model}
          </h3>
          <p className="text-sm text-gray-600 font-medium">{vehicle.year}</p>
        </div>

        {/* Price */}
        <div className="mb-4">
          <p className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">
            {formatPrice(vehicle.price)}
          </p>
          {vehicle.originalPrice > vehicle.price && (
            <p className="text-sm text-gray-500 line-through">
              {formatPrice(vehicle.originalPrice)}
            </p>
          )}
        </div>

        {/* Specifications */}
        <div className="space-y-2.5 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Gauge className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">Phạm vi</span>
            </div>
            <span className="font-semibold text-gray-900">
              {vehicle.range} km
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Zap className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">Công suất</span>
            </div>
            <span className="font-semibold text-gray-900">
              {vehicle.motorPower} kW
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">Sạc</span>
            </div>
            <span className="font-semibold text-gray-900">
              {vehicle.chargingTime}h
            </span>
          </div>
        </div>

        {/* Mileage and Location */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">
              {vehicle.mileage.toLocaleString()} km
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium truncate max-w-20">
              {vehicle.location}
            </span>
          </div>
        </div>

        {/* Features */}
        {vehicle.features && vehicle.features.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5">
              {vehicle.features.slice(0, 3).map((feature, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium border border-blue-100"
                >
                  {feature}
                </span>
              ))}
              {vehicle.features.length > 3 && (
                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                  +{vehicle.features.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Seller Info */}
        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">Người bán:</span>
            <span className="font-semibold text-gray-900 truncate max-w-32">
              {vehicle.sellerName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectricVehicleCard;
