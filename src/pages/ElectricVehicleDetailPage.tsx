import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Phone, MessageCircle, Heart, Share2, MapPin, Calendar,
  Battery, Gauge, Zap, Car, CheckCircle, ChevronLeft, ChevronRight,
  Shield, FileText, Eye, Bookmark, AlertCircle, X, Flag, Tag,
} from "lucide-react";
import { toast } from "react-toastify";
import { VehicleDetailService, type VehicleDetail, type MediaItem, type VehiclePost } from "../services/Vehicle/ElectricDetailsService";
import { FavoriteService } from "../services/FavoriteService";
import { authService } from "../services/authService";
import { ChatService } from "../services/Chat/ChatService";
import { locationService } from "../services/locationService";
import { ReportService } from "../services/Report/ReportService";
import { OfferService } from "../services/Offer/OfferService";

// ===================================================================================
// 1. CUSTOM HOOKS
// ===================================================================================

/**
 * Custom hook to fetch vehicle details and related data.
 */
const useVehicleDetail = (id: string | undefined) => {
  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullAddress, setFullAddress] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("ID không hợp lệ");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await VehicleDetailService.getVehicleDetail(Number(id));
        setVehicle(data);

        if (data.provinceCode && data.districtCode && data.wardCode) {
          const address = await locationService.getFullAddress(
            data.provinceCode,
            data.districtCode,
            data.wardCode,
            data.street
          );
          setFullAddress(address);
        } else {
          setFullAddress("Chưa cung cấp địa chỉ");
        }
      } catch (err) {
        console.error("❌ Error loading vehicle:", err);
        setError("Không thể tải thông tin xe.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  return { vehicle, loading, error, fullAddress };
};

// ===================================================================================
// 2. UTILITY & HELPER COMPONENTS
// ===================================================================================

const formatPrice = (price: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const formatNumberInput = (value: string): string => {
  const number = parseInt(value.replace(/[^0-9]/g, ""), 10);
  return isNaN(number) ? "" : number.toLocaleString("vi-VN");
};

const parseFormattedNumber = (formattedValue: string): number => {
  return parseInt(formattedValue.replace(/[^0-9]/g, ""), 10) || 0;
};

const maskPhoneNumber = (phone: string | undefined | null): string => {
  if (!phone || phone.length < 4) {
    return "**********";
  }
  return `${phone.substring(0, 2)}******${phone.substring(phone.length - 2)}`;
};

const InfoItem: React.FC<{ label: string; value: React.ReactNode; className?: string }> = ({ label, value, className }) => (
  <div className={`flex justify-between py-2 border-b border-gray-100 ${className}`}>
    <span className="text-gray-600">{label}</span>
    <span className="font-medium text-gray-900 text-right">{value}</span>
  </div>
);

const QuickStat: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode; color: string }> = ({ icon, label, value, color }) => (
  <div className={`flex flex-col items-center p-3 bg-${color}-50 rounded-lg`}>
    {icon}
    <span className="text-xs text-gray-600">{label}</span>
    <span className="font-semibold text-gray-900">{value}</span>
  </div>
);

// ===================================================================================
// 3. SUB-COMPONENTS
// ===================================================================================

const ImageGallery: React.FC<{ media: MediaItem[]; title: string }> = ({ media, title }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (media.length === 0) {
    return <div className="flex items-center justify-center h-[500px] bg-gray-900 text-gray-400 rounded-xl shadow-sm">Không có hình ảnh</div>;
  }

  const handlePrev = () => setSelectedIndex(prev => (prev === 0 ? media.length - 1 : prev - 1));
  const handleNext = () => setSelectedIndex(prev => (prev === media.length - 1 ? 0 : prev + 1));

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="relative w-full h-[500px] bg-gray-900">
        <img src={media[selectedIndex].urlLarge} alt={title} className="w-full h-full object-cover" />
        {media.length > 1 && (
          <>
            <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full transition shadow-lg" aria-label="Previous image"><ChevronLeft className="w-6 h-6" /></button>
            <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full transition shadow-lg" aria-label="Next image"><ChevronRight className="w-6 h-6" /></button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">{selectedIndex + 1} / {media.length}</div>
          </>
        )}
      </div>
      {media.length > 1 && (
        <div className="p-4 bg-gray-50">
          <div className="grid grid-cols-6 gap-2">
            {media.slice(0, 6).map((image, index) => (
              <button key={image.mediaId} onClick={() => setSelectedIndex(index)} className={`relative w-full h-20 bg-gray-200 rounded-lg overflow-hidden transition ${selectedIndex === index ? "ring-2 ring-blue-500" : "hover:ring-2 hover:ring-gray-300"}`}>
                <img src={image.urlThumb} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
            {media.length > 6 && <div className="relative w-full h-20 bg-gray-800 rounded-lg flex items-center justify-center text-white font-semibold"><span className="text-sm">+{media.length - 6}</span></div>}
          </div>
        </div>
      )}
    </div>
  );
};

const VehicleHeader: React.FC<{ vehicle: VehicleDetail; vehiclePost: VehiclePost }> = ({ vehicle, vehiclePost }) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{vehicle.title}</h1>
        <p className="text-gray-600 flex items-center gap-2"><Car className="w-4 h-4" />{vehiclePost.brandName} {vehiclePost.modelName} {vehiclePost.year}</p>
      </div>
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />{vehicle.status}</span>
    </div>
    <div className="flex flex-wrap items-center gap-4 py-4 border-y border-gray-200">
      <div>
        <p className="text-3xl sm:text-4xl font-bold text-red-600">{formatPrice(vehicle.askPrice)}</p>
      </div>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
      <QuickStat icon={<Calendar className="w-5 h-5 text-blue-600 mb-1" />} label="Năm SX" value={vehiclePost.year} color="blue" />
      <QuickStat icon={<Gauge className="w-5 h-5 text-green-600 mb-1" />} label="Km đã đi" value={`${(vehiclePost.odoKm / 1000).toFixed(0)}K`} color="green" />
      <QuickStat icon={<Zap className="w-5 h-5 text-purple-600 mb-1" />} label="Hộp số" value={vehiclePost.transmission} color="purple" />
      <QuickStat icon={<Battery className="w-5 h-5 text-orange-600 mb-1" />} label="Nhiên liệu" value={vehiclePost.fuelType} color="orange" />
    </div>
  </div>
);

const VehicleInfoTabs: React.FC<{ vehicle: VehicleDetail; vehiclePost: VehiclePost }> = ({ vehicle, vehiclePost }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'specs'>('overview');

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="border-b border-gray-200 flex">
        <button onClick={() => setActiveTab("overview")} className={`flex-1 px-6 py-4 text-sm font-medium transition ${activeTab === "overview" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-900"}`}>Tổng quan</button>
        <button onClick={() => setActiveTab("specs")} className={`flex-1 px-6 py-4 text-sm font-medium transition ${activeTab === "specs" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-900"}`}>Thông số kỹ thuật</button>
      </div>
      <div className="p-6">
        {activeTab === 'overview' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-600" />Mô tả chi tiết</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{vehicle.description || "Chưa có mô tả chi tiết."}</p>
          </div>
        )}
        {activeTab === 'specs' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Car className="w-5 h-5 text-blue-600" />Thông số chung</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                <InfoItem label="Hãng xe" value={vehiclePost.brandName} />
                <InfoItem label="Dòng xe" value={vehiclePost.modelName} />
                <InfoItem label="Năm sản xuất" value={vehiclePost.year} />
                <InfoItem label="Xuất xứ" value={vehiclePost.origin} />
                <InfoItem label="Kiểu dáng" value={vehiclePost.bodyStyle} />
                <InfoItem label="Số chỗ ngồi" value={`${vehiclePost.seatCount} chỗ`} />
                <InfoItem label="Màu sắc" value={vehiclePost.color} />
                <InfoItem label="VIN" value={<span className="font-mono text-sm">{vehiclePost.vin}</span>} />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-blue-600" />Động cơ & Hiệu suất</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                <InfoItem label="Hộp số" value={vehiclePost.transmission} />
                <InfoItem label="Nhiên liệu" value={vehiclePost.fuelType} />
                <InfoItem label="Số km đã đi" value={`${vehiclePost.odoKm.toLocaleString()} km`} />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-blue-600" />Giấy tờ & Đăng kiểm</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                <InfoItem label="Đăng kiểm" value={vehiclePost.registration ? "✓ Còn hạn" : "✗ Hết hạn"} />
                <InfoItem label="Phụ kiện" value={vehiclePost.accessories ? "✓ Có" : "✗ Không"} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SellerInfo: React.FC<{ vehicle: VehicleDetail; fullAddress: string | null }> = ({ vehicle, fullAddress }) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Người bán</h3>
    <div className="flex items-start gap-4 mb-4 p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
      <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 overflow-hidden">
        {vehicle.sellerAvatarThumbUrl ? <img src={vehicle.sellerAvatarThumbUrl} alt={vehicle.sellerUsername} className="w-full h-full object-cover" /> : <span className="text-blue-600">{vehicle.sellerUsername.charAt(0).toUpperCase()}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 mb-1 truncate">{vehicle.sellerUsername}</h4>
        <p className="text-xs text-gray-600">Cá nhân</p>
      </div>
    </div>
    <div className="space-y-3 text-sm text-gray-600">
      <div className="flex items-start gap-2"><MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" /><span className="line-clamp-2">{fullAddress || "Đang tải địa chỉ..."}</span></div>
      <div className="flex items-center gap-2"><Calendar className="w-4 h-4 flex-shrink-0" /><span>Tham gia: {new Date(vehicle.createdAt).toLocaleDateString("vi-VN")}</span></div>
    </div>
    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
      <div className="text-center p-2 bg-gray-50 rounded-lg"><div className="text-lg font-bold text-blue-600">12</div><div className="text-xs text-gray-600">Tin đăng</div></div>
    </div>
  </div>
);

const ContactActions: React.FC<{
  onContact: (type: 'phone' | 'message') => void;
  onMakeOffer: () => void;
  sellerPhone: string | undefined | null;
  showPhoneNumber: boolean;
}> = ({ onContact, onMakeOffer, sellerPhone, showPhoneNumber }) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Liên hệ người bán</h3>
    <div className="space-y-3">
      <button
        onClick={() => onContact("phone")}
        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium transition shadow-sm"
      >
        <Phone className="w-5 h-5" />
        <span>
          {showPhoneNumber ? sellerPhone || "Chưa có SĐT" : maskPhoneNumber(sellerPhone)}
        </span>
      </button>
      <button onClick={() => onContact("message")} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium transition shadow-sm"><MessageCircle className="w-5 h-5" /><span>Nhắn tin</span></button>
      <button onClick={onMakeOffer} className="w-full flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-lg font-medium transition">
        <Tag className="w-5 h-5" />
        <span>Trả giá</span>
      </button>
    </div>
  </div>
);

const SafetyTips = () => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-xl shadow-sm p-4">
    <div className="flex items-start gap-2">
      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
      <div>
        <h5 className="font-semibold text-yellow-900 text-sm mb-2">Lưu ý khi giao dịch</h5>
        <ul className="text-xs text-yellow-800 space-y-1">
          <li>• Kiểm tra kỹ giấy tờ xe</li>
          <li>• Gặp tại nơi công cộng</li>
          <li>• Không chuyển tiền trước</li>
          <li>• Yêu cầu thử xe</li>
        </ul>
      </div>
    </div>
  </div>
);

// ===================================================================================
// 4. MAIN COMPONENT
// ===================================================================================

const ElectricVehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vehicle, loading, error, fullAddress } = useVehicleDetail(id);

  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingFavorite, setIsAddingFavorite] = useState(false);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);

  // Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Offer Modal State
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [proposedPrice, setProposedPrice] = useState("");
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);

  // Minimum allowed offer as a fraction of ask price (10%)
  const MIN_OFFER_RATE = 0.1;
  const minOfferMessage = "Giá phải ít nhất 10% giá niêm yết.";

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (id && authService.getCurrentUser()) {
        try {
          const isFav = await FavoriteService.isFavorite(Number(id));
          setIsFavorite(isFav);
        } catch (error) {
          console.error("Failed to check favorite status:", error);
          setIsFavorite(false);
        }
      }
    };

    if (!loading) {
      checkFavoriteStatus();
    }
  }, [id, loading]);

  // Handlers
  const handleContact = async (type: "phone" | "message") => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      toast.warning("Vui lòng đăng nhập để thực hiện hành động này");
      navigate("/dang-nhap");
      return;
    }

    if (!vehicle || !vehicle.sellerId || !vehicle.sellerUsername) {
      toast.error("Không tìm thấy thông tin người bán.");
      return;
    }

    if (vehicle.sellerId === Number(currentUser.id)) {
      toast.warning("Bạn không thể liên hệ với chính mình.");
      return;
    }

    if (type === 'phone') {
      setShowPhoneNumber(true);
    } else if (type === 'message') {
      try {
        await ChatService.createConversation(Number(currentUser.id), vehicle.sellerId);
        navigate("/chat", { state: { sellerId: vehicle.sellerId, sellerName: vehicle.sellerUsername, productTitle: vehicle.title } });
      } catch (error: any) {
        if (error.response?.status === 409) { // Conversation already exists
          navigate("/chat", { state: { sellerId: vehicle.sellerId, sellerName: vehicle.sellerUsername } });
        } else {
          toast.error("Không thể tạo cuộc trò chuyện. Vui lòng thử lại.");
        }
      }
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

        if (result && typeof result === "object" && "code" in result && result.code !== 0) {
          toast.success("Đã thêm vào danh sách yêu thích");
        } 
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsAddingFavorite(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Đã sao chép link vào clipboard");
  };

  // Offer Modal Handlers
  const handleOpenOfferModal = () => {
    if (!authService.getCurrentUser()) {
      toast.warning("Vui lòng đăng nhập để trả giá");
      navigate("/dang-nhap");
      return;
    }
    // prevent offering on your own listing
    const currentUser = authService.getCurrentUser();
    if (currentUser && vehicle && vehicle.sellerId === Number(currentUser.id)) {
      toast.warning("Bạn không thể trả giá cho chính mình");
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

    // double-check: do not allow buyer === seller
    if (vehicle && vehicle.sellerId === Number(currentUser.id)) {
      toast.warning("Bạn không thể trả giá cho chính mình");
      return;
    }

    // Enforce minimum offer = 10% of askPrice
    const minAllowed = Math.round(vehicle!.askPrice * MIN_OFFER_RATE);
    if (price < minAllowed) {
      toast.error(minOfferMessage);
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
      toast.error(error.response?.data?.message || "Không thể gửi trả giá. Vui lòng thử lại sau.");
    } finally {
      setIsSubmittingOffer(false);
    }
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

  // Render states
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (error || !vehicle) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy xe</h1>
        <p className="text-gray-600 mb-6">{error || "Xe bạn đang tìm kiếm không tồn tại."}</p>
        <button onClick={() => navigate("/xe-dien")} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Quay lại danh sách</button>
      </div>
    );
  }

  if (!vehicle.vehiclePost) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Lỗi dữ liệu sản phẩm</h1>
        <p className="text-gray-600 mb-6">Tin đăng này không phải là một chiếc xe.</p>
        <button onClick={() => navigate("/xe-dien")} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Quay lại danh sách</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"><ArrowLeft className="w-5 h-5" /><span className="hidden sm:inline">Quay lại</span></button>
            <div className="flex items-center gap-3">
              <button onClick={handleToggleFavorite} disabled={isAddingFavorite} className={`p-2 rounded-full hover:bg-gray-100 transition ${isFavorite ? "text-red-500" : "text-gray-400"}`} title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}>{isAddingFavorite ? <div className="w-6 h-6 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div> : <Heart className={`w-6 h-6 ${isFavorite ? "fill-current" : ""}`} />}</button>
              <button onClick={handleShare} className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition" title="Chia sẻ"><Share2 className="w-6 h-6" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ImageGallery media={vehicle.media} title={vehicle.title} />
            <VehicleHeader vehicle={vehicle} vehiclePost={vehicle.vehiclePost} />
            <VehicleInfoTabs vehicle={vehicle} vehiclePost={vehicle.vehiclePost} />
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              <SellerInfo vehicle={vehicle} fullAddress={fullAddress} />
              <ContactActions
                onContact={handleContact}
                onMakeOffer={handleOpenOfferModal}
                sellerPhone={vehicle.sellerPhone}
                showPhoneNumber={showPhoneNumber}
              />
              <SafetyTips />
              <div className="bg-white rounded-xl shadow-sm p-4">
                <button onClick={handleOpenReportModal} className="w-full text-sm text-red-600 hover:text-red-700 font-medium flex items-center justify-center gap-2 hover:bg-red-50 py-2 rounded-lg transition"><Flag className="w-4 h-4" />Báo cáo tin đăng</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full transform transition-all">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Trả giá</h3>
              <button onClick={handleCloseOfferModal} className="p-2 hover:bg-gray-100 rounded-full transition" aria-label="Close modal">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 line-clamp-1">{vehicle.title}</p>
                <p className="text-sm text-gray-500">Giá niêm yết: <span className="font-semibold text-gray-800">{formatPrice(vehicle.askPrice)}</span></p>
              </div>

              <div className="text-center">
                <label htmlFor="proposedPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Nhập giá bạn muốn trả
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="proposedPrice"
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(formatNumberInput(e.target.value))}
                    placeholder="0"
                    className="w-full text-center text-3xl font-bold text-blue-600 bg-blue-50 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent py-3 px-12"
                    disabled={isSubmittingOffer}
                  />
                  <span className="absolute inset-y-0 right-4 flex items-center text-lg font-semibold text-blue-500">VND</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Người bán sẽ nhận được đề nghị của bạn.</p>
              </div>

              <div>
                <p className="text-center text-xs text-gray-500 mb-2">Hoặc chọn nhanh:</p>
                <div className="grid grid-cols-3 gap-2">
                  {[0.95, 0.9, 0.85].map((rate) => {
                    const suggested = Math.round(vehicle.askPrice * rate);
                    const minAllowed = Math.round(vehicle.askPrice * MIN_OFFER_RATE);
                    const finalPrice = Math.max(suggested, minAllowed);
                    return (
                      <button
                        key={rate}
                        onClick={() => setProposedPrice(formatNumberInput(String(finalPrice)))}
                        disabled={isSubmittingOffer}
                        className="text-sm py-2 px-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition disabled:opacity-50"
                      >
                        {rate * 100}%
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
              <button onClick={handleCloseOfferModal} disabled={isSubmittingOffer} className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition disabled:opacity-50">Hủy</button>
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
                <p className="font-medium text-gray-900 line-clamp-1">{vehicle.title}</p>
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

export default ElectricVehicleDetailPage;
