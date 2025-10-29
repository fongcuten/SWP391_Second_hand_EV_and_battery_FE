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
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { VehicleDetailService, type VehicleDetail } from "../services/Vehicle/ElectricDetailsService";

const ElectricVehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const loadVehicle = async () => {
      if (!id) {
        setError("ID không hợp lệ");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log("🔄 Loading vehicle with ID:", id);
        const data = await VehicleDetailService.getVehicleDetail(Number(id));
        setVehicle(data);
        console.log("✅ Vehicle loaded:", data);
      } catch (err: any) {
        console.error("❌ Error loading vehicle:", err);
        setError("Không thể tải thông tin xe điện");
      } finally {
        setLoading(false);
      }
    };

    loadVehicle();
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleContact = (type: "phone" | "message") => {
    if (type === "phone") {
      // Implement phone contact
      alert("Chức năng gọi điện sẽ được bổ sung");
    } else {
      // Implement message functionality
      alert("Chức năng nhắn tin sẽ được bổ sung");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: vehicle?.title || "Xe điện",
        text: `Xem xe điện ${vehicle?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Đã sao chép link vào clipboard");
    }
  };

  const handlePrevImage = () => {
    if (!vehicle) return;
    setSelectedImageIndex((prev) =>
      prev === 0 ? vehicle.media.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (!vehicle) return;
    setSelectedImageIndex((prev) =>
      prev === vehicle.media.length - 1 ? 0 : prev + 1
    );
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

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Không tìm thấy xe điện
            </h1>
            <p className="text-gray-600 mb-6">
              {error || "Xe điện bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."}
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

  const { vehiclePost } = vehicle;

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
            <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4">
              {vehicle.media.length > 0 ? (
                <>
                  <img
                    src={vehicle.media[selectedImageIndex].urlLarge}
                    alt={vehicle.title}
                    className="w-full h-full object-contain"
                  />
                  {/* Navigation Arrows */}
                  {vehicle.media.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {selectedImageIndex + 1} / {vehicle.media.length}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Không có hình ảnh
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {vehicle.media.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {vehicle.media.map((image, index) => (
                  <button
                    key={image.mediaId}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-video bg-gray-200 rounded-lg overflow-hidden transition ${selectedImageIndex === index
                      ? "ring-2 ring-blue-500"
                      : "hover:ring-2 hover:ring-gray-300"
                      }`}
                  >
                    <img
                      src={image.urlThumb}
                      alt={`${vehicle.title} ${index + 1}`}
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
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {vehicle.title}
                </h1>
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Heart
                    className={`w-6 h-6 ${isFavorite ? "fill-red-500 text-red-500" : ""
                      }`}
                  />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  {vehiclePost.brandName} {vehiclePost.modelName} • {vehiclePost.year}
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {formatPrice(vehicle.askPrice)}
                </p>
              </div>

              {/* Status Badge */}
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {vehicle.status}
                </span>
              </div>
            </div>

            {/* Key Specifications */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thông số kỹ thuật
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-5 h-5" />
                    <span>Năm sản xuất</span>
                  </div>
                  <span className="font-medium">{vehiclePost.year}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Gauge className="w-5 h-5" />
                    <span>Số km đã đi</span>
                  </div>
                  <span className="font-medium">
                    {vehiclePost.odoKm.toLocaleString()} km
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Zap className="w-5 h-5" />
                    <span>Hộp số</span>
                  </div>
                  <span className="font-medium">{vehiclePost.transmission}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Battery className="w-5 h-5" />
                    <span>Nhiên liệu</span>
                  </div>
                  <span className="font-medium">{vehiclePost.fuelType}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Car className="w-5 h-5" />
                    <span>Màu sắc</span>
                  </div>
                  <span className="font-medium">{vehiclePost.color}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5" />
                    <span>Số chỗ ngồi</span>
                  </div>
                  <span className="font-medium">{vehiclePost.seatCount} chỗ</span>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin người bán
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Người bán:</span>
                  <span className="font-medium">{vehicle.seller}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {vehicle.street && `${vehicle.street}, `}
                    Mã vùng: {vehicle.wardCode}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    Đăng bán: {new Date(vehicle.createdAt).toLocaleDateString("vi-VN")}
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
                Liên hệ người bán
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

        {/* Description and Details */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Description */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Mô tả chi tiết
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {vehicle.description || "Chưa có mô tả"}
            </p>
          </div>

          {/* Additional Details */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Chi tiết khác
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Xuất xứ:</span>
                <span className="font-medium">{vehiclePost.origin}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Kiểu dáng:</span>
                <span className="font-medium">{vehiclePost.bodyStyle}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">VIN:</span>
                <span className="font-medium font-mono text-sm">{vehiclePost.vin}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Đăng kiểm:</span>
                <span className={`font-medium ${vehiclePost.registration ? 'text-green-600' : 'text-red-600'}`}>
                  {vehiclePost.registration ? "Còn hạn" : "Hết hạn"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Phụ kiện:</span>
                <span className={`font-medium ${vehiclePost.accessories ? 'text-green-600' : 'text-gray-600'}`}>
                  {vehiclePost.accessories ? "Có" : "Không"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectricVehicleDetailPage;
