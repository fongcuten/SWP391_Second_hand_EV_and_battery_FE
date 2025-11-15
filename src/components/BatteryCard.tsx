import React from "react";
import type { Battery } from "../types/battery";
import {
  Battery as BatteryIcon,
  Zap,
  Clock,
  MapPin,
  Gauge,
  Award,
  Star,
  Crown,
  CheckCircle2,
} from "lucide-react";

const PRIORITY_CONFIG = {
  3: {
    badge: "bg-gradient-to-r from-[#2ECC71] to-[#27AE60] text-white",
    border: "border-[#2ECC71] hover:border-[#27AE60]",
    icon: Crown,
    label: "PREMIUM",
  },
  2: {
    badge: "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
    border: "border-blue-400 hover:border-blue-500",
    icon: Award,
    label: "STANDARD",
  },
  1: {
    badge: "bg-gray-100 text-gray-700",
    border: "border-gray-100 hover:border-[#A8E6CF]",
    icon: Star,
    label: "NORMAL",
  },
} as const;

const getPriorityConfig = (priority: number) => {
  return PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG[1];
};

interface BatteryCardProps {
  battery: Battery;
  onClick?: (battery: Battery) => void;
}

const BatteryCard: React.FC<BatteryCardProps> = ({ battery, onClick }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const priorityConfig = getPriorityConfig(battery.priorityLevel || 1);

  const getBatteryTypeText = (type: string) => {
    switch (type) {
      case "lithium-ion":
        return "Li-ion";
      case "lithium-polymer":
        return "Li-Po";
      case "LFP":
        return "LFP";
      case "NMC":
        return "NMC";
      default:
        return type;
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-2 ${priorityConfig.border} group`}
      onClick={() => onClick?.(battery)}
    >
      {/* Image Container */}
      <div className="relative h-48 sm:h-56 md:h-52 lg:h-48 xl:h-52 bg-gray-100 overflow-hidden">
        {battery.images && battery.images.length > 0 ? (
          <img
            src={battery.images[0]}
            alt={`${battery.brand} ${battery.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
            <BatteryIcon className="w-12 h-12 sm:w-16 sm:h-16" />
          </div>
        )}

        {/* Priority Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-md ${priorityConfig.badge}`}
          >
            <priorityConfig.icon className="w-3.5 h-3.5" />
            {priorityConfig.label}
          </span>
        </div>

        {/* Battery Health Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-black bg-opacity-80 text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
            <BatteryIcon className="w-3 h-3" />
            {battery.currentHealth}%
          </span>
        </div>

        {/* Battery Type Badge */}
        <div className="absolute bottom-3 left-3">
          <span className="bg-[#2ECC71] bg-opacity-90 text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm">
            {getBatteryTypeText(battery.type)}
          </span>
        </div>

        {/* Inspection Badge - Đã kiểm định */}
        {(battery.inspectionStatus === "PASS" || battery.inspectionStatus === "APPROVED") && (
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
            {battery.brand} {battery.model}
          </h3>
          <p className="text-sm text-gray-600 font-medium">
            {battery.capacity} kWh • {battery.voltage}V
          </p>
        </div>

        {/* Price */}
        <div className="mb-4">
          <p className="text-xl sm:text-2xl font-bold text-[#2ECC71] mb-1">
            {formatPrice(battery.price)}
          </p>
            {battery.originalPrice > battery.price && (
            <p className="text-sm text-gray-500 line-through">
              {formatPrice(battery.originalPrice)}
            </p>
          )}
          <p className="text-sm text-gray-600">Có thể thương lượng</p>
        </div>

        {/* Specifications */}
        <div className="space-y-2.5 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Gauge className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">Chu kỳ sạc</span>
            </div>
            <span className="font-semibold text-gray-900">
              {battery.cycleCount}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Zap className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">Sạc tối đa</span>
            </div>
            <span className="font-semibold text-gray-900">
              {battery.chargingSpeed} kW
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Award className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">Bảo hành</span>
            </div>
            <span className="font-semibold text-gray-900">
              {battery.warranty} tháng
            </span>
          </div>
        </div>

        {/* Compatibility */}
        {battery.compatibility && battery.compatibility.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1.5">Tương thích:</p>
            <div className="flex flex-wrap gap-1.5">
              {battery.compatibility.slice(0, 2).map((model, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-md font-medium border border-green-100"
                >
                  {model}
                </span>
              ))}
              {battery.compatibility.length > 2 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                  +{battery.compatibility.length - 2}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Location and Year */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">{battery.manufactureYear}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium truncate max-w-20">
              {battery.location}
            </span>
          </div>
        </div>

        {/* Seller Info */}
        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">Người bán:</span>
            <span className="font-semibold text-gray-900 truncate max-w-32">
              {battery.sellerName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatteryCard;
