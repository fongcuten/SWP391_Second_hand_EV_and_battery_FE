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
  Zap,
  Car,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  FileText,
  Eye,
  Bookmark,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { VehicleDetailService, type VehicleDetail } from "../services/Vehicle/ElectricDetailsService";
import { FavoriteService } from "../services/FavoriteService";

const ElectricVehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State management
  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingFavorite, setIsAddingFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "specs">("overview");

  // Load vehicle data
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
        const data = await VehicleDetailService.getVehicleDetail(Number(id));
        setVehicle(data);
      } catch (err) {
        console.error("❌ Error loading vehicle:", err);
        setError("Không thể tải thông tin xe điện");
      } finally {
        setLoading(false);
      }
    };

    loadVehicle();
  }, [id]);

  // Utility functions
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Event handlers
  const handleContact = (type: "phone" | "message") => {
    if (type === "phone") {
      toast.info("Chức năng gọi điện sẽ được bổ sung");
    } else {
      toast.info("Chức năng nhắn tin sẽ được bổ sung");
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
      toast.success("Đã sao chép link vào clipboard");
    }
  };

  const handleToggleFavorite = async () => {
    console.log("🔘 Toggle favorite clicked", { vehicle, id, isFavorite });

    if (!vehicle || !id) {
      console.log("❌ No vehicle or id");
      return;
    }

    const token = localStorage.getItem("auth_token");
    console.log("🔑 Token:", token ? "exists" : "missing");

    if (!token) {
      toast.warning("Vui lòng đăng nhập để lưu tin yêu thích");
      navigate("/login");
      return;
    }

    setIsAddingFavorite(true);

    try {
      if (isFavorite) {
        console.log("➖ Removing favorite...");
        await FavoriteService.removeFavorite(Number(id));
        setIsFavorite(false);
        toast.success("Đã xóa khỏi danh sách yêu thích");
      } else {
        console.log("➕ Adding favorite...");
        const result = await FavoriteService.addFavorite(Number(id));
        console.log("✅ Result:", result);

        if (result.code === 0) {
          setIsFavorite(true);
          toast.success("Đã thêm vào danh sách yêu thích");
        } else if (result.message?.includes("owner")) {
          toast.error("Bạn không thể lưu tin đăng của chính mình");
        } else {
          toast.error(result.message || "Không thể thêm vào yêu thích");
        }
      }
    } catch (err: any) {
      console.error("❌ Error toggling favorite:", err);
      console.error("Response:", err.response?.data);

      if (err.response?.data?.message?.includes("owner")) {
        toast.error("Bạn không thể lưu tin đăng của chính mình");
      } else if (err.response?.status === 401) {
        toast.warning("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
        navigate("/login");
      } else {
        toast.error("Có lỗi xảy ra, vui lòng thử lại");
      }
    } finally {
      setIsAddingFavorite(false);
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

  // Loading state
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

  // Error state
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
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate("/xe-dien")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Quay lại danh sách</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleFavorite}
                disabled={isAddingFavorite}
                className={`p-2 rounded-full hover:bg-gray-100 transition ${isFavorite ? "text-red-500" : "text-gray-400"
                  } ${isAddingFavorite ? "opacity-50 cursor-not-allowed" : ""}`}
                title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
              >
                {isAddingFavorite ? (
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                ) : (
                  <Heart className={`w-6 h-6 ${isFavorite ? "fill-current" : ""}`} />
                )}
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition"
                title="Chia sẻ"
              >
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="relative w-full h-[500px] bg-gray-900">
                {vehicle.media.length > 0 ? (
                  <>
                    <img
                      src={vehicle.media[selectedImageIndex].urlLarge}
                      alt={vehicle.title}
                      className="w-full h-full object-cover"
                    />
                    {vehicle.media.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full transition shadow-lg"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full transition shadow-lg"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
                      {selectedImageIndex + 1} / {vehicle.media.length}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    Không có hình ảnh
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {vehicle.media.length > 1 && (
                <div className="p-4 bg-gray-50">
                  <div className="grid grid-cols-6 gap-2">
                    {vehicle.media.slice(0, 6).map((image, index) => (
                      <button
                        key={image.mediaId}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative w-full h-20 bg-gray-200 rounded-lg overflow-hidden transition ${selectedImageIndex === index
                            ? "ring-2 ring-blue-500"
                            : "hover:ring-2 hover:ring-gray-300"
                          }`}
                      >
                        <img
                          src={image.urlThumb}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                    {vehicle.media.length > 6 && (
                      <div className="relative w-full h-20 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center text-white font-semibold">
                        <span className="text-sm">+{vehicle.media.length - 6}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Vehicle Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {vehicle.title}
                  </h1>
                  <p className="text-gray-600 flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    {vehiclePost.brandName} {vehiclePost.modelName}{" "}
                    {vehiclePost.year}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {vehicle.status}
                  </span>
                </div>
              </div>

              {/* Price & Stats */}
              <div className="flex flex-wrap items-center gap-4 py-4 border-y border-gray-200">
                <div>
                  <p className="text-3xl sm:text-4xl font-bold text-red-600">
                    {formatPrice(vehicle.askPrice)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Có thể thương lượng</p>
                </div>
                <div className="flex-1"></div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>1.2K lượt xem</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bookmark className="w-4 h-4" />
                    <span>45 đã lưu</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600 mb-1" />
                  <span className="text-xs text-gray-600">Năm SX</span>
                  <span className="font-semibold text-gray-900">
                    {vehiclePost.year}
                  </span>
                </div>
                <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
                  <Gauge className="w-5 h-5 text-green-600 mb-1" />
                  <span className="text-xs text-gray-600">Km đã đi</span>
                  <span className="font-semibold text-gray-900">
                    {(vehiclePost.odoKm / 1000).toFixed(0)}K
                  </span>
                </div>
                <div className="flex flex-col items-center p-3 bg-purple-50 rounded-lg">
                  <Zap className="w-5 h-5 text-purple-600 mb-1" />
                  <span className="text-xs text-gray-600">Hộp số</span>
                  <span className="font-semibold text-gray-900">
                    {vehiclePost.transmission}
                  </span>
                </div>
                <div className="flex flex-col items-center p-3 bg-orange-50 rounded-lg">
                  <Battery className="w-5 h-5 text-orange-600 mb-1" />
                  <span className="text-xs text-gray-600">Nhiên liệu</span>
                  <span className="font-semibold text-gray-900">
                    {vehiclePost.fuelType}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs - Only 2 tabs now */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition ${activeTab === "overview"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    Tổng quan
                  </button>
                  <button
                    onClick={() => setActiveTab("specs")}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition ${activeTab === "specs"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    Thông số kỹ thuật
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Description */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Mô tả chi tiết
                      </h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {vehicle.description || "Chưa có mô tả chi tiết."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Specs Tab */}
                {activeTab === "specs" && (
                  <div className="space-y-6">
                    {/* General Specs */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Car className="w-5 h-5 text-blue-600" />
                        Thông số chung
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Hãng xe</span>
                          <span className="font-medium text-gray-900">
                            {vehiclePost.brandName}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Dòng xe</span>
                          <span className="font-medium text-gray-900">
                            {vehiclePost.modelName}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Năm sản xuất</span>
                          <span className="font-medium text-gray-900">
                            {vehiclePost.year}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Xuất xứ</span>
                          <span className="font-medium text-gray-900">
                            {vehiclePost.origin}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Kiểu dáng</span>
                          <span className="font-medium text-gray-900">
                            {vehiclePost.bodyStyle}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Số chỗ ngồi</span>
                          <span className="font-medium text-gray-900">
                            {vehiclePost.seatCount} chỗ
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Màu sắc</span>
                          <span className="font-medium text-gray-900">
                            {vehiclePost.color}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">VIN</span>
                          <span className="font-medium text-gray-900 font-mono text-sm">
                            {vehiclePost.vin}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Engine & Performance */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-blue-600" />
                        Động cơ & Hiệu suất
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Hộp số</span>
                          <span className="font-medium text-gray-900">
                            {vehiclePost.transmission}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Nhiên liệu</span>
                          <span className="font-medium text-gray-900">
                            {vehiclePost.fuelType}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Số km đã đi</span>
                          <span className="font-medium text-gray-900">
                            {vehiclePost.odoKm.toLocaleString()} km
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Legal & Registration */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        Giấy tờ & Đăng kiểm
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Đăng kiểm</span>
                          <span
                            className={`font-medium ${vehiclePost.registration
                                ? "text-green-600"
                                : "text-red-600"
                              }`}
                          >
                            {vehiclePost.registration ? "✓ Còn hạn" : "✗ Hết hạn"}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Phụ kiện</span>
                          <span
                            className={`font-medium ${vehiclePost.accessories
                                ? "text-green-600"
                                : "text-gray-600"
                              }`}
                          >
                            {vehiclePost.accessories ? "✓ Có" : "✗ Không"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Sticky Contact & Seller Info */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {/* ✅ Seller Info Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Người bán
                </h3>

                <div className="flex items-start gap-4 mb-4 p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                    {vehicle.seller.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-1 truncate">
                      {vehicle.seller}
                    </h4>
                    <p className="text-xs text-gray-600">Cá nhân</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">
                      {vehicle.street && `${vehicle.street}, `}
                      Mã vùng: {vehicle.wardCode}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>
                      Tham gia:{" "}
                      {new Date(vehicle.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>

                {/* Seller Stats */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">12</div>
                    <div className="text-xs text-gray-600">Tin đăng</div>
                  </div>
                </div>
              </div>

              {/* Contact Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Liên hệ người bán
                </h3>

                <div className="space-y-3">
                  <button
                    onClick={() => handleContact("phone")}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium transition shadow-sm"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Gọi điện</span>
                  </button>

                  <button
                    onClick={() => handleContact("message")}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium transition shadow-sm"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Nhắn tin</span>
                  </button>

                  <button
                    onClick={handleToggleFavorite}
                    disabled={isAddingFavorite}
                    className={`w-full flex items-center justify-center gap-2 border-2 py-3 px-4 rounded-lg font-medium transition ${isFavorite
                        ? "border-red-500 text-red-600 bg-red-50 hover:bg-red-100"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      } ${isAddingFavorite ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isAddingFavorite ? (
                      <>
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                        <span>{isFavorite ? "Đã lưu tin" : "Lưu tin"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Safety Tips */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl shadow-sm p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-yellow-900 text-sm mb-2">
                      Lưu ý khi giao dịch
                    </h5>
                    <ul className="text-xs text-yellow-800 space-y-1">
                      <li>• Kiểm tra kỹ giấy tờ xe</li>
                      <li>• Gặp tại nơi công cộng</li>
                      <li>• Không chuyển tiền trước</li>
                      <li>• Yêu cầu thử xe</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Report */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <button className="w-full text-sm text-red-600 hover:text-red-700 font-medium flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Báo cáo tin đăng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectricVehicleDetailPage;
