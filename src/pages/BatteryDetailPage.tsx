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
  Zap,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  X,
  Flag,
  Eye,
  Bookmark,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-toastify";
import { FavoriteService } from "../services/FavoriteService";
import { authService } from "../services/authService";
import { ChatService } from "../services/Chat/ChatService";
import type { Battery } from "../types/battery";
import {
  BatteryDetailService,
  type BatteryDetail,
  type BatteryPost,
} from "../services/Vehicle/BatteryDetailsService";
import { locationService } from "../services/locationService";
import { ReportService } from "../services/Report/ReportService";
import { OfferService } from "../services/Offer/OfferService";

const formatNumberInput = (value: string): string => {
  const number = parseInt(value.replace(/[^0-9]/g, ""), 10);
  return isNaN(number) ? "" : number.toLocaleString("vi-VN");
};

const parseFormattedNumber = (formattedValue: string): number => {
  return parseInt(formattedValue.replace(/[^0-9]/g, ""), 10) || 0;
};

const BatteryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [battery, setBattery] = useState<Battery | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingFavorite, setIsAddingFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "specs">("overview");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const [fullAddress, setFullAddress] = useState<string>("");
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [proposedPrice, setProposedPrice] = useState("");
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);

  useEffect(() => {
    const loadBattery = async () => {
      setLoading(true);
      try {
        const listingId = Number(id);
        const data: BatteryDetail = await BatteryDetailService.getBatteryDetail(
          listingId
        );
        const media = Array.isArray(data.media) ? data.media : [];
        const batteryPost: BatteryPost | null = data.batteryPost;
        const images: string[] = media
          .map((m) => m.urlLarge || m.url || m.urlThumb)
          .filter(Boolean);
        const chemistry = batteryPost?.chemistryName || "BATTERY";
        console.log("🔋 Battery chemistry from API:", chemistry);
        const toType = (chem: string): Battery["type"] => {
          const c = String(chem).toUpperCase().trim();
          console.log("🔋 Processing chemistry:", chem, "-> normalized:", c);

          // Handle exact matches first
          if (c === "LFP" || c === "LITHIUM IRON PHOSPHATE") {
            console.log("✅ Matched LFP");
            return "LFP";
          }
          if (c === "NMC" || c === "NICKEL MANGANESE COBALT") {
            console.log("✅ Matched NMC");
            return "NMC";
          }
          if (c === "NCA" || c === "NICKEL COBALT ALUMINUM") {
            console.log("✅ Matched NCA -> mapping to NMC");
            return "NMC"; // NCA is similar to NMC, use NMC type
          }
          if (c === "LTO" || c === "LITHIUM TITANATE") {
            console.log("✅ Matched LTO -> mapping to LFP");
            return "LFP"; // LTO is similar to LFP, use LFP type
          }

          // Handle variations
          if (c.includes("LFP") || c.includes("IRON PHOSPHATE")) {
            console.log("✅ Matched LFP (variation)");
            return "LFP";
          }
          if (c.includes("NMC") || c.includes("NICKEL MANGANESE")) {
            console.log("✅ Matched NMC (variation)");
            return "NMC";
          }
          if (c.includes("NCA") || c.includes("NICKEL COBALT")) {
            console.log("✅ Matched NCA (variation) -> mapping to NMC");
            return "NMC";
          }
          if (c.includes("LTO") || c.includes("TITANATE")) {
            console.log("✅ Matched LTO (variation) -> mapping to LFP");
            return "LFP";
          }

          // Handle lithium-ion variations (including "Li-ion" with hyphen)
          if (
            c.includes("LI-ION") ||
            c.includes("LITHIUM-ION") ||
            c.includes("LITHIUM ION") ||
            (c.includes("ION") && !c.includes("POLY"))
          ) {
            console.log("✅ Matched Lithium-Ion");
            return "lithium-ion";
          }

          // Handle lithium-polymer
          if (
            c.includes("POLY") ||
            c.includes("POLYMER") ||
            c.includes("LITHIUM-POLYMER") ||
            c.includes("LITHIUM POLYMER")
          ) {
            console.log("✅ Matched Lithium-Polymer");
            return "lithium-polymer";
          }

          // Default fallback - try to use the original chemistry name if it's a valid type
          const normalized = c.replace(/[^A-Z]/g, "");
          if (normalized === "LFP") {
            console.log("✅ Matched LFP (normalized)");
            return "LFP";
          }
          if (normalized === "NMC") {
            console.log("✅ Matched NMC (normalized)");
            return "NMC";
          }

          // If still not matched, return "other" but log for debugging
          console.warn(
            "⚠️ Unknown chemistry type:",
            chem,
            "-> defaulting to 'other'. Will display original chemistry name:",
            chem
          );
          return "other" as any;
        };

        // Load full address from location codes
        let fullAddressText = "";
        if (data.provinceCode && data.districtCode && data.wardCode) {
          try {
            fullAddressText = await locationService.getFullAddress(
              data.provinceCode,
              data.districtCode,
              data.wardCode,
              data.street
            );
          } catch (locationError) {
            console.error("Error loading full address:", locationError);
            fullAddressText = "Chưa cung cấp địa chỉ";
          }
        } else {
          fullAddressText = "Chưa cung cấp địa chỉ";
        }
        setFullAddress(fullAddressText);

        const mapped: Battery = {
          id: String(data.listingId),
          brand: chemistry,
          model: data.title || "Pin xe điện",
          type: toType(chemistry),
          capacity: batteryPost?.capacityKwh ?? 0,
          voltage: 0,
          currentHealth: batteryPost?.sohPercent ?? 0,
          cycleCount: batteryPost?.cycleCount ?? 0,
          price: data.askPrice ?? 0,
          originalPrice: data.askPrice ?? 0,
          manufactureYear: new Date(data.createdAt || Date.now()).getFullYear(),
          warranty: 0,
          compatibility: [],
          condition: "good",
          description: data.description || "",
          images,
          features: [],
          location: fullAddressText,
          sellerId: String(data.sellerId),
          sellerName: data.sellerUsername || "",
          sellerPhone: data.sellerPhone || "",
          isAvailable: true,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.createdAt || new Date().toISOString(),
          weight: 0,
          dimensions: { length: 0, width: 0, height: 0 },
          chargingSpeed: 0,
          dischargingSpeed: 0,
          inspectionStatus: data.inspectionStatus,
        };
        setBattery(mapped);
      } catch (e) {
        console.error("Error loading battery:", e);
        setBattery(null);
      } finally {
        setLoading(false);
      }
    };

    loadBattery();
  }, [id]);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (id && authService.getCurrentUser()) {
        try {
          const isFav = await FavoriteService.isFavorite(Number(id));
          setIsFavorite(isFav);
        } catch (error) {
          console.error("Failed to check favorite status:", error);
        }
      }
    };
    if (!loading) {
      checkFavoriteStatus();
    }
  }, [id, loading]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // const getConditionColor = (condition: string) => {
  //   switch (condition) {
  //     case "excellent":
  //       return "bg-green-100 text-green-800";
  //     case "good":
  //       return "bg-blue-100 text-blue-800";
  //     case "fair":
  //       return "bg-yellow-100 text-yellow-800";
  //     case "poor":
  //       return "bg-red-100 text-red-800";
  //     default:
  //       return "bg-gray-100 text-gray-800";
  //   }
  // };

  // const getConditionText = (condition: string) => {
  //   switch (condition) {
  //     case "excellent":
  //       return "Xuất sắc";
  //     case "good":
  //       return "Tốt";
  //     case "fair":
  //       return "Khá";
  //     case "poor":
  //       return "Trung bình";
  //     default:
  //       return condition;
  //   }
  // };

  const maskPhoneNumber = (phone: string | undefined | null): string => {
    if (!phone || phone.length < 4) return "**********";
    return `${phone.substring(0, 2)}******${phone.substring(phone.length - 2)}`;
  };

  const getBatteryTypeText = (type: string, chemistryName?: string) => {
    switch (type) {
      case "lithium-ion":
        return "Lithium-Ion";
      case "lithium-polymer":
        return "Lithium-Polymer";
      case "LFP":
        return "LFP (Lithium Iron Phosphate)";
      case "NMC":
        return "NMC (Nickel Manganese Cobalt)";
      case "other":
        // If type is "other", show the original chemistry name from backend
        return chemistryName || battery?.brand || "Khác";
      default:
        // For unknown types, try to show the chemistry name if available
        return chemistryName || type;
    }
  };

  const handleContact = async (type: "phone" | "message") => {
    if (!battery) return;
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      toast.warning("Vui lòng đăng nhập để thực hiện hành động này");
      navigate("/dang-nhap");
      return;
    }

    if (type === "phone") {
      setShowPhoneNumber(true);
      return;
    }

    try {
      const sellerIdNum = Number(battery.sellerId);
      if (!sellerIdNum) {
        toast.error("Không tìm thấy thông tin người bán.");
        return;
      }
      await ChatService.createConversation(Number(currentUser.id), sellerIdNum);
      navigate("/chat", {
        state: {
          sellerId: sellerIdNum,
          sellerName: battery.sellerName,
          productTitle: `${battery.brand} ${battery.model}`,
        },
      });
    } catch (error: any) {
      if (error?.response?.status === 409) {
        navigate("/chat", {
          state: {
            sellerId: Number(battery.sellerId),
            sellerName: battery.sellerName,
          },
        });
      } else {
        toast.error("Không thể tạo cuộc trò chuyện. Vui lòng thử lại.");
      }
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
      navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép link vào clipboard");
    }
  };

  const handleOpenOfferModal = () => {
    if (!authService.getCurrentUser()) {
      toast.warning("Vui lòng đăng nhập để trả giá");
      navigate("/dang-nhap");
      return;
    }
    setShowOfferModal(true);
  };

  const handleCloseOfferModal = () => {
    if (isSubmittingOffer) return;
    setShowOfferModal(false);
    setProposedPrice("");
  };

  const handleSubmitOffer = async () => {
    const price = parseFormattedNumber(proposedPrice);
    if (price <= 0) {
      toast.error("Vui lòng nhập một mức giá hợp lệ");
      return;
    }

    const currentUser = authService.getCurrentUser();
    if (!currentUser || !id) {
      toast.error("Không thể gửi trả giá. Vui lòng đăng nhập lại.");
      return;
    }

    setIsSubmittingOffer(true);
    try {
      await OfferService.createOffer({
        buyerId: Number(currentUser.id),
        listingId: Number(id),
        proposedPrice: price,
      });

      toast.success("Đã gửi trả giá thành công!");
      handleCloseOfferModal();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Không thể gửi trả giá. Vui lòng thử lại sau."
      );
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!id) return;
    if (!authService.getCurrentUser()) {
      toast.warning("Vui lòng đăng nhập để lưu tin.");
      navigate("/dang-nhap");
      return;
    }

    setIsAddingFavorite(true);
    try {
      if (isFavorite) {
        await FavoriteService.removeFavorite(Number(id));
        setIsFavorite(false);
        toast.success("Đã xóa khỏi danh sách yêu thích");
      } else {
        setIsFavorite(true);
        const result = await FavoriteService.addFavorite(Number(id));
        try {
          const verified = await FavoriteService.isFavorite(Number(id));
          setIsFavorite(Boolean(verified));
        } catch (verifyErr) {
          console.warn("Verify favorite failed:", verifyErr);
        }

        if (
          result &&
          typeof result === "object" &&
          "code" in result &&
          result.code !== 0
        ) {
          toast.success("Đã thêm vào danh sách yêu thích");
        }
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại"
      );
    } finally {
      setIsAddingFavorite(false);
    }
  };

  const handlePrevImage = () => {
    if (!battery) return;
    setSelectedImageIndex((prev) =>
      prev === 0 ? (battery.images?.length || 1) - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (!battery) return;
    setSelectedImageIndex((prev) =>
      prev === (battery.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  // Report Modal Handlers
  const handleOpenReportModal = () => {
    if (!authService.getCurrentUser()) {
      toast.warning("Vui lòng đăng nhập để báo cáo tin đăng");
      navigate("/dang-nhap");
      return;
    }
    setShowReportModal(true);
  };

  const handleCloseReportModal = () => {
    if (isSubmittingReport) return;
    setShowReportModal(false);
    setReportDetails("");
  };

  const handleSubmitReport = async () => {
    if (!reportDetails.trim()) {
      toast.error("Vui lòng nhập chi tiết lý do báo cáo");
      return;
    }

    const currentUser = authService.getCurrentUser();
    if (!currentUser || !id) {
      toast.error("Không thể gửi báo cáo. Vui lòng đăng nhập lại.");
      return;
    }

    setIsSubmittingReport(true);
    try {
      await ReportService.createReport({
        listingId: Number(id),
        reporterId: Number(currentUser.id),
        reason: reportDetails,
      });

      toast.success("Đã gửi báo cáo thành công. Cảm ơn bạn!");
      handleCloseReportModal();
    } catch (error: any) {
      console.error("❌ Error submitting report:", error);
      toast.error(error.response?.data?.message || "Không thể gửi báo cáo. Vui lòng thử lại sau.");
    } finally {
      setIsSubmittingReport(false);
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
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate("/pin")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Quay lại danh sách</span>
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleFavorite}
                disabled={isAddingFavorite}
                className={`p-2 rounded-full hover:bg-gray-100 transition ${
                  isFavorite ? "text-red-500" : "text-gray-400"
                } ${isAddingFavorite ? "opacity-50 cursor-not-allowed" : ""}`}
                title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
              >
                {isAddingFavorite ? (
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                ) : (
                  <Heart
                    className={`w-6 h-6 ${isFavorite ? "fill-current" : ""}`}
                  />
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
                {battery.images.length > 0 ? (
                  <>
                    <img
                      src={battery.images[selectedImageIndex]}
                      alt={`${battery.brand} ${battery.model}`}
                      className="w-full h-full object-cover"
                    />
                    {battery.images.length > 1 && (
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
                      {selectedImageIndex + 1} / {battery.images.length}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    Không có hình ảnh
                  </div>
                )}
              </div>
              {battery.images.length > 1 && (
                <div className="p-4 bg-gray-50">
                  <div className="grid grid-cols-6 gap-2">
                    {battery.images.slice(0, 6).map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative w-full h-20 bg-gray-200 rounded-lg overflow-hidden transition ${
                          selectedImageIndex === index
                            ? "ring-2 ring-blue-500"
                            : "hover:ring-2 hover:ring-gray-300"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                    {battery.images.length > 6 && (
                      <div className="relative w-full h-20 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center text-white font-semibold">
                        <span className="text-sm">
                          +{battery.images.length - 6}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Battery Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {battery.model || battery.brand}
                  </h1>
                  <p className="text-gray-600">
                    {battery.capacity} kWh • {battery.voltage}V
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(battery.inspectionStatus === "PASS" ||
                    battery.inspectionStatus === "APPROVED") && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      Đã kiểm định
                    </span>
                  )}
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Còn hàng
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 py-4 border-y border-gray-200">
                <div>
                  <p className="text-3xl sm:text-4xl font-bold text-red-600">
                    {formatPrice(battery.price)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Có thể thương lượng
                  </p>
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

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600 mb-1" />
                  <span className="text-xs text-gray-600">Năm SX</span>
                  <span className="font-semibold text-gray-900">
                    {battery.manufactureYear}
                  </span>
                </div>
                <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
                  <Gauge className="w-5 h-5 text-green-600 mb-1" />
                  <span className="text-xs text-gray-600">Chu kỳ sạc</span>
                  <span className="font-semibold text-gray-900">
                    {battery.cycleCount}
                  </span>
                </div>
                <div className="flex flex-col items-center p-3 bg-purple-50 rounded-lg">
                  <Zap className="w-5 h-5 text-purple-600 mb-1" />
                  <span className="text-xs text-gray-600">Sức khỏe</span>
                  <span className="font-semibold text-gray-900">
                    {battery.currentHealth}%
                  </span>
                </div>
                <div className="flex flex-col items-center p-3 bg-orange-50 rounded-lg">
                  <BatteryIcon className="w-5 h-5 text-orange-600 mb-1" />
                  <span className="text-xs text-gray-600">Loại</span>
                  <span className="font-semibold text-gray-900">
                    {getBatteryTypeText(battery.type, battery.brand)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition ${
                      activeTab === "overview"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Tổng quan
                  </button>
                  <button
                    onClick={() => setActiveTab("specs")}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition ${
                      activeTab === "specs"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Thông số kỹ thuật
                  </button>
                </div>
              </div>
              <div className="p-6">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Mô tả chi tiết
                      </h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {battery.description || "Chưa có mô tả chi tiết."}
                      </p>
                    </div>
                  </div>
                )}
                {activeTab === "specs" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Công nghệ</span>
                      <span className="font-medium text-gray-900">
                        {getBatteryTypeText(battery.type)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Dung lượng</span>
                      <span className="font-medium text-gray-900">
                        {battery.capacity} kWh
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">SOH</span>
                      <span className="font-medium text-gray-900">
                        {battery.currentHealth}%
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Chu kỳ sạc</span>
                      <span className="font-medium text-gray-900">
                        {battery.cycleCount}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {/* Seller Info Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Người bán
                </h3>
                <div className="flex items-start gap-4 mb-4 p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                    {(battery.sellerName || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-1 truncate">
                      {battery.sellerName || "Người bán"}
                    </h4>
                    <p className="text-xs text-gray-600">Cá nhân</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#2ECC71]" />
                    <span className="line-clamp-2">
                      {fullAddress ||
                        battery.location ||
                        "Chưa cung cấp địa chỉ"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>
                      Đăng bán:{" "}
                      {new Date(battery.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
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
                    <span>
                      {showPhoneNumber
                        ? battery.sellerPhone || "Chưa có SĐT"
                        : maskPhoneNumber(battery.sellerPhone)}
                    </span>
                  </button>
                  <button
                    onClick={() => handleContact("message")}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium transition shadow-sm"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Nhắn tin</span>
                  </button>
                  <button
                    onClick={handleOpenOfferModal}
                    className="w-full flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-lg font-medium transition"
                  >
                    <Tag className="w-5 h-5" />
                    <span>Trả giá</span>
                  </button>
                </div>
              </div>

              {/* Report Button */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <button
                  onClick={handleOpenReportModal}
                  className="w-full text-sm text-red-600 hover:text-red-700 font-medium flex items-center justify-center gap-2 hover:bg-red-50 py-2 rounded-lg transition"
                >
                  <Flag className="w-4 h-4" />
                  Báo cáo tin đăng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      {showOfferModal && battery && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full transform transition-all">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Trả giá</h3>
              <button
                onClick={handleCloseOfferModal}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 line-clamp-1">
                  {battery.model}
                </p>
                <p className="text-sm text-gray-500">
                  Giá niêm yết:{" "}
                  <span className="font-semibold text-gray-800">
                    {formatPrice(battery.price)}
                  </span>
                </p>
              </div>

              <div className="text-center">
                <label
                  htmlFor="proposedPrice"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nhập giá bạn muốn trả
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="proposedPrice"
                    value={proposedPrice}
                    onChange={(e) =>
                      setProposedPrice(formatNumberInput(e.target.value))
                    }
                    placeholder="0"
                    className="w-full text-center text-3xl font-bold text-blue-600 bg-blue-50 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent py-3 px-12"
                    disabled={isSubmittingOffer}
                  />
                  <span className="absolute inset-y-0 right-4 flex items-center text-lg font-semibold text-blue-500">
                    VND
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Người bán sẽ nhận được đề nghị của bạn.
                </p>
              </div>

              <div>
                <p className="text-center text-xs text-gray-500 mb-2">
                  Hoặc chọn nhanh:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[0.95, 0.9, 0.85].map((rate) => (
                    <button
                      key={rate}
                      onClick={() =>
                        setProposedPrice(
                          formatNumberInput(
                            String(Math.round(battery.price * rate))
                          )
                        )
                      }
                      disabled={isSubmittingOffer}
                      className="text-sm py-2 px-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition disabled:opacity-50"
                    >
                      {rate * 100}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleCloseOfferModal}
                disabled={isSubmittingOffer}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitOffer}
                disabled={!proposedPrice || isSubmittingOffer}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                {isSubmittingOffer ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  "Gửi trả giá"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Flag className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Báo cáo tin đăng</h3>
                  <p className="text-sm text-gray-500">Chúng tôi sẽ xem xét báo cáo của bạn.</p>
                </div>
              </div>
              <button onClick={handleCloseReportModal} className="p-2 hover:bg-gray-100 rounded-full transition" aria-label="Close modal">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600 mb-1">Tin đăng:</p>
                <p className="font-medium text-gray-900 line-clamp-1">{battery.model || battery.brand}</p>
              </div>

              <div>
                <label htmlFor="reportDetails" className="block text-sm font-medium text-gray-700 mb-2">
                  Chi tiết báo cáo <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="reportDetails"
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Mô tả chi tiết về vấn đề bạn gặp phải..."
                  rows={3}
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
                  disabled={isSubmittingReport}
                />
                <p className="mt-1 text-xs text-right text-gray-500">{reportDetails.length}/100</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
              <button onClick={handleCloseReportModal} disabled={isSubmittingReport} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition disabled:opacity-50">Hủy</button>
              <button
                onClick={handleSubmitReport}
                disabled={!reportDetails.trim() || isSubmittingReport}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                {isSubmittingReport ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  "Gửi báo cáo"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatteryDetailPage;
