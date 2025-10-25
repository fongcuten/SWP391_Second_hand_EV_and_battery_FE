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
  Battery as BatteryIcon,
  Gauge,
  Clock,
  Zap,
  CheckCircle,
  Package,
  Shield,
  TrendingUp,
} from "lucide-react";
import type { Battery } from "../types/battery";

const BatteryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [battery, setBattery] = useState<Battery | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock data - thay thế bằng API call thực tế
  const mockBattery: Battery = {
    id: "1",
    brand: "CATL",
    model: "LFP-100",
    type: "LFP",
    capacity: 100,
    voltage: 400,
    currentHealth: 95,
    cycleCount: 500,
    price: 250000000,
    originalPrice: 350000000,
    manufactureYear: 2022,
    warranty: 24,
    compatibility: [
      "Tesla Model 3",
      "BYD Atto 3",
      "VinFast VF e34",
      "Tesla Model Y",
    ],
    condition: "excellent",
    description:
      "Pin CATL LFP 100kWh tình trạng xuất sắc, ít sử dụng. Dung lượng pin còn 95%, chu kỳ sạc chỉ 500 lần - rất thấp cho một chiếc pin đã qua sử dụng. Pin được bảo dưỡng định kỳ, kiểm tra chuyên nghiệp. Bảo hành còn 24 tháng từ nhà sản xuất. Pin sử dụng công nghệ LFP (Lithium Iron Phosphate) an toàn, tuổi thọ cao, không lo cháy nổ. Phù hợp cho nhiều dòng xe điện phổ biến.",
    images: [
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800",
      "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800",
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800",
      "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800",
    ],
    features: [
      "Sạc nhanh DC 150kW",
      "An toàn cao - Công nghệ LFP",
      "Tuổi thọ cao - Trên 3000 chu kỳ",
      "Thân thiện môi trường",
      "Hỗ trợ OTA Updates",
      "BMS thông minh",
      "Tản nhiệt hiệu quả",
      "Chống nước IP67",
    ],
    location: "Hồ Chí Minh",
    sellerId: "seller1",
    sellerName: "Nguyễn Văn A",
    sellerPhone: "0901234567",
    isAvailable: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    weight: 500,
    dimensions: {
      length: 120,
      width: 80,
      height: 20,
    },
    chargingSpeed: 150,
    dischargingSpeed: 200,
  };

  useEffect(() => {
    const loadBattery = async () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setBattery(mockBattery);
        setLoading(false);
      }, 1000);
    };

    loadBattery();
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

  const getBatteryTypeText = (type: string) => {
    switch (type) {
      case "lithium-ion":
        return "Lithium-Ion";
      case "lithium-polymer":
        return "Lithium-Polymer";
      case "LFP":
        return "LFP (Lithium Iron Phosphate)";
      case "NMC":
        return "NMC (Nickel Manganese Cobalt)";
      default:
        return type;
    }
  };

  const handleContact = (type: "phone" | "message") => {
    if (type === "phone") {
      window.open(`tel:${battery?.sellerPhone}`);
    } else {
      // Implement message functionality
      console.log("Open message dialog");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${battery?.brand} ${battery?.model}`,
        text: `Xem pin ${battery?.brand} ${battery?.model} ${battery?.capacity}kWh`,
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
            <p className="mt-4 text-gray-600">Đang tải thông tin pin...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!battery) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Không tìm thấy pin
            </h1>
            <p className="text-gray-600 mb-6">
              Pin bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
            </p>
            <button
              onClick={() => navigate("/pin")}
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
          onClick={() => navigate("/pin")}
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
                src={battery.images[selectedImageIndex]}
                alt={`${battery.brand} ${battery.model}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {battery.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {battery.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-w-16 aspect-h-12 bg-gray-200 rounded-lg overflow-hidden ${
                      selectedImageIndex === index ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${battery.brand} ${battery.model} ${index + 1}`}
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
                  {battery.brand} {battery.model}
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
              <p className="text-gray-600 mb-2">
                {battery.capacity} kWh • {battery.voltage}V
              </p>
              <p className="text-sm text-blue-600 font-medium mb-4">
                {getBatteryTypeText(battery.type)}
              </p>

              <div className="mb-4">
                <p className="text-3xl font-bold text-blue-600">
                  {formatPrice(battery.price)}
                </p>
                {battery.originalPrice > battery.price && (
                  <p className="text-lg text-gray-500 line-through">
                    {formatPrice(battery.originalPrice)}
                  </p>
                )}
              </div>

              {/* Condition Badge */}
              <div className="mb-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(
                    battery.condition
                  )}`}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Tình trạng: {getConditionText(battery.condition)}
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
                    <BatteryIcon className="w-5 h-5" />
                    <span>Sức khỏe pin</span>
                  </div>
                  <span className="font-medium text-green-600">
                    {battery.currentHealth}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Gauge className="w-5 h-5" />
                    <span>Chu kỳ sạc</span>
                  </div>
                  <span className="font-medium">{battery.cycleCount} lần</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Zap className="w-5 h-5" />
                    <span>Sạc tối đa</span>
                  </div>
                  <span className="font-medium">
                    {battery.chargingSpeed} kW
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <TrendingUp className="w-5 h-5" />
                    <span>Xả tối đa</span>
                  </div>
                  <span className="font-medium">
                    {battery.dischargingSpeed} kW
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Shield className="w-5 h-5" />
                    <span>Bảo hành còn</span>
                  </div>
                  <span className="font-medium">{battery.warranty} tháng</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Package className="w-5 h-5" />
                    <span>Trọng lượng</span>
                  </div>
                  <span className="font-medium">{battery.weight} kg</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-5 h-5" />
                    <span>Năm sản xuất</span>
                  </div>
                  <span className="font-medium">{battery.manufactureYear}</span>
                </div>
              </div>
            </div>

            {/* Dimensions */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Kích thước
              </h3>
              <div className="text-sm text-gray-600">
                <p>
                  Dài:{" "}
                  <span className="font-medium text-gray-900">
                    {battery.dimensions.length} cm
                  </span>
                </p>
                <p>
                  Rộng:{" "}
                  <span className="font-medium text-gray-900">
                    {battery.dimensions.width} cm
                  </span>
                </p>
                <p>
                  Cao:{" "}
                  <span className="font-medium text-gray-900">
                    {battery.dimensions.height} cm
                  </span>
                </p>
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
                  <span className="font-medium">{battery.sellerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{battery.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    Đăng bán:{" "}
                    {new Date(battery.createdAt).toLocaleDateString("vi-VN")}
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
                Gọi điện: {battery.sellerPhone}
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
              {battery.description}
            </p>
          </div>

          {/* Features */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tính năng nổi bật
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {battery.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Compatibility */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tương thích với các xe
          </h3>
          <div className="flex flex-wrap gap-3">
            {battery.compatibility.map((model, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-100"
              >
                {model}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatteryDetailPage;
