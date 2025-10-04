import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Heart,
  Share2,
  MapPin,
  Calendar,
  Battery,
  Gauge,
  Clock,
  Zap,
  Car,
  Star,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { ElectricVehicle } from "../types/electricVehicle";

const ElectricVehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<ElectricVehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock data - thay thế bằng API call thực tế
  const mockVehicle: ElectricVehicle = {
    id: "1",
    brand: "Tesla",
    model: "Model 3",
    year: 2022,
    price: 1200000000,
    originalPrice: 1500000000,
    mileage: 15000,
    batteryCapacity: 75,
    batteryHealth: 95,
    range: 500,
    chargingTime: 8,
    motorPower: 283,
    topSpeed: 225,
    acceleration: 4.4,
    color: "Trắng",
    condition: "excellent",
    description:
      "Xe điện Tesla Model 3 tình trạng xuất sắc, ít sử dụng. Xe được bảo dưỡng định kỳ tại đại lý chính thức Tesla. Đầy đủ giấy tờ, sổ bảo hành còn lại. Nội thất như mới, không có vết xước hay hư hỏng. Pin còn 95% dung lượng, phạm vi hoạt động 500km. Xe có đầy đủ tính năng Autopilot, Supercharger, nội thất cao cấp và cửa sổ trời kính.",
    images: [
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800",
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
      "https://images.unsplash.com/photo-1549317336-206569e8475c?w=800",
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
    ],
    features: [
      "Autopilot",
      "Supercharger",
      "Premium Interior",
      "Glass Roof",
      "Wireless Charging",
      "Premium Audio",
      "Climate Control",
      "OTA Updates",
    ],
    location: "Hồ Chí Minh",
    sellerId: "seller1",
    sellerName: "Nguyễn Văn A",
    sellerPhone: "0901234567",
    isAvailable: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  };

  useEffect(() => {
    const loadVehicle = async () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setVehicle(mockVehicle);
        setLoading(false);
      }, 1000);
    };

    loadVehicle();
  }, [id]);

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

  const handleContact = (type: "phone" | "message") => {
    if (type === "phone") {
      window.open(`tel:${vehicle?.sellerPhone}`);
    } else {
      // Implement message functionality
      console.log("Open message dialog");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${vehicle?.brand} ${vehicle?.model}`,
        text: `Xem xe điện ${vehicle?.brand} ${vehicle?.model} ${vehicle?.year}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Đã sao chép link vào clipboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải thông tin xe...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Không tìm thấy xe điện
            </h1>
            <p className="text-gray-600 mb-6">
              Xe điện bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
            </p>
            <button
              onClick={() => navigate("/xe-dien")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/xe-dien")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại danh sách
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            {/* Main Image */}
            <div className="aspect-w-16 aspect-h-12 bg-gray-200 rounded-lg overflow-hidden mb-4">
              <img
                src={vehicle.images[selectedImageIndex]}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {vehicle.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {vehicle.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-w-16 aspect-h-12 bg-gray-200 rounded-lg overflow-hidden ${
                      selectedImageIndex === index ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${vehicle.brand} ${vehicle.model} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {vehicle.brand} {vehicle.model}
                </h1>
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Heart
                    className={`w-6 h-6 ${
                      isFavorite ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </button>
              </div>
              <p className="text-gray-600 mb-4">{vehicle.year}</p>

              <div className="mb-4">
                <p className="text-3xl font-bold text-blue-600">
                  {formatPrice(vehicle.price)}
                </p>
                {vehicle.originalPrice > vehicle.price && (
                  <p className="text-lg text-gray-500 line-through">
                    {formatPrice(vehicle.originalPrice)}
                  </p>
                )}
              </div>

              {/* Condition Badge */}
              <div className="mb-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(
                    vehicle.condition
                  )}`}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Tình trạng: {getConditionText(vehicle.condition)}
                </span>
              </div>
            </div>

            {/* Key Specifications */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thông số kỹ thuật
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Battery className="w-5 h-5" />
                    <span>Dung lượng pin</span>
                  </div>
                  <span className="font-medium">
                    {vehicle.batteryCapacity} kWh
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Gauge className="w-5 h-5" />
                    <span>Phạm vi hoạt động</span>
                  </div>
                  <span className="font-medium">{vehicle.range} km</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Zap className="w-5 h-5" />
                    <span>Công suất động cơ</span>
                  </div>
                  <span className="font-medium">{vehicle.motorPower} kW</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-5 h-5" />
                    <span>Thời gian sạc</span>
                  </div>
                  <span className="font-medium">
                    {vehicle.chargingTime} giờ
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Gauge className="w-5 h-5" />
                    <span>Số km đã đi</span>
                  </div>
                  <span className="font-medium">
                    {vehicle.mileage.toLocaleString()} km
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Car className="w-5 h-5" />
                    <span>Màu sắc</span>
                  </div>
                  <span className="font-medium">{vehicle.color}</span>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin người bán
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Tên:</span>
                  <span className="font-medium">{vehicle.sellerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{vehicle.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    Đăng bán:{" "}
                    {new Date(vehicle.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => handleContact("phone")}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium"
              >
                <Phone className="w-5 h-5" />
                Gọi điện: {vehicle.sellerPhone}
              </button>

              <button
                onClick={() => handleContact("message")}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium"
              >
                <MessageCircle className="w-5 h-5" />
                Nhắn tin
              </button>

              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 font-medium"
              >
                <Share2 className="w-5 h-5" />
                Chia sẻ
              </button>
            </div>
          </div>
        </div>

        {/* Description and Features */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Description */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Mô tả chi tiết
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {vehicle.description}
            </p>
          </div>

          {/* Features */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tính năng nổi bật
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {vehicle.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectricVehicleDetailPage;
