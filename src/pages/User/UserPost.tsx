import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  X,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  MapPin,
  Tag,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";
import { UserPostService, type SalePost } from "../../services/User/UserPostService";
import { locationService, type Province, type District, type Ward } from "../../services/locationService";
import { InspectionService } from "../../services/Inspection/InspectionService"; // ✅ Import inspection service

// ===== TYPES =====

type TabId = "all" | "active" | "expired" | "pending";
type InspectionType = "system" | "manual" | "";

interface OrderTab {
  id: TabId;
  label: string;
}

// ===== CONSTANTS =====

const ORDER_TABS: OrderTab[] = [
  { id: "all", label: "Tất cả tin" },
  { id: "active", label: "Đang hiển thị" },
  { id: "expired", label: "Hết hạn" },
  { id: "pending", label: "Chờ duyệt" },
];

const STATUS_BADGES = {
  ACTIVE: { text: "Đang hiển thị", color: "bg-green-500" },
  PENDING: { text: "Chờ duyệt", color: "bg-yellow-500" },
  EXPIRED: { text: "Hết hạn", color: "bg-red-500" },
  REJECTED: { text: "Bị từ chối", color: "bg-gray-500" },
} as const;

// ===== MAIN COMPONENT =====

export default function UserPosts() {
  // ===== STATE =====
  const [posts, setPosts] = useState<SalePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SalePost | null>(null);
  const [inspectionType, setInspectionType] = useState<InspectionType>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submittingInspection, setSubmittingInspection] = useState(false); // ✅ Add loading state

  // ✅ NEW: Location state for system inspection
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [selectedWard, setSelectedWard] = useState<number | null>(null);
  const [street, setStreet] = useState("");
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // ===== EFFECTS =====
  useEffect(() => {
    loadPosts();
    loadProvinces();
  }, []);

  // ✅ Load districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      loadDistricts(selectedProvince);
    } else {
      setDistricts([]);
      setSelectedDistrict(null);
      setWards([]);
      setSelectedWard(null);
    }
  }, [selectedProvince]);

  // ✅ Load wards when district changes
  useEffect(() => {
    if (selectedDistrict) {
      loadWards(selectedDistrict);
    } else {
      setWards([]);
      setSelectedWard(null);
    }
  }, [selectedDistrict]);

  // ===== DATA LOADING =====
  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await UserPostService.getMyPosts();
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Error loading posts:", error);
      toast.error("Không thể tải danh sách tin đăng!");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProvinces = async () => {
    setLoadingProvinces(true);
    try {
      const data = await locationService.getProvinces();
      setProvinces(data);
    } catch (error) {
      console.error("❌ Error loading provinces:", error);
      toast.error("Không thể tải danh sách tỉnh/thành phố");
    } finally {
      setLoadingProvinces(false);
    }
  };

  const loadDistricts = async (provinceCode: number) => {
    setLoadingDistricts(true);
    try {
      const data = await locationService.getDistricts(provinceCode);
      setDistricts(data);
    } catch (error) {
      console.error("❌ Error loading districts:", error);
      toast.error("Không thể tải danh sách quận/huyện");
    } finally {
      setLoadingDistricts(false);
    }
  };

  const loadWards = async (districtCode: number) => {
    setLoadingWards(true);
    try {
      const data = await locationService.getWards(districtCode);
      setWards(data);
    } catch (error) {
      console.error("❌ Error loading wards:", error);
      toast.error("Không thể tải danh sách phường/xã");
    } finally {
      setLoadingWards(false);
    }
  };

  // ===== MODAL HANDLERS =====
  const openModal = (post: SalePost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
    setInspectionType("");
    setUploadedFile(null);

    // ✅ Pre-fill location from post
    setSelectedProvince(post.provinceCode || null);
    setSelectedDistrict(post.districtCode || null);
    setSelectedWard(post.wardCode || null);
    setStreet(post.street || "");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
    setInspectionType("");
    setUploadedFile(null);

    // ✅ Reset location
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setStreet("");
    setDistricts([]);
    setWards([]);
  };

  // ===== FILE HANDLERS =====
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === "application/pdf") {
      setUploadedFile(file);
    } else {
      toast.warning("Vui lòng chọn file PDF");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.type === "application/pdf") {
      setUploadedFile(file);
    } else {
      toast.warning("Vui lòng chọn file PDF");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // ===== ACTION HANDLERS =====
  const handleSubmit = async () => {
    if (!inspectionType) {
      toast.warning("Vui lòng chọn phương thức kiểm duyệt");
      return;
    }

    // Validate location for system inspection
    if (inspectionType === "system") {
      if (!selectedProvince || !selectedDistrict || !selectedWard || !street.trim()) {
        toast.warning("Vui lòng điền đầy đủ thông tin địa chỉ");
        return;
      }
    }

    if (inspectionType === "manual" && !uploadedFile) {
      toast.warning("Vui lòng tải lên hồ sơ giấy tờ xe");
      return;
    }

    if (!selectedPost) return;

    setSubmittingInspection(true);

    try {
      // ✅ Prepare payload (same pattern as createSalePost)
      const payload: InspectionOrderRequest = {
        listingId: selectedPost.listingId,
        inspectionType: inspectionType === "system" ? "SYSTEM_AUTO" : "MANUAL_DOCUMENT",
      };

      // Add location fields for system inspection
      if (inspectionType === "system") {
        payload.provinceCode = selectedProvince!;
        payload.districtCode = selectedDistrict!;
        payload.wardCode = selectedWard!;
        payload.street = street.trim();
      }

      console.log("📤 Submitting inspection request:", payload);
      console.log("📎 File:", uploadedFile?.name);

      // ✅ Call API with payload and file separately
      const response = await InspectionService.submitInspectionOrder(
        payload,
        inspectionType === "manual" ? uploadedFile : undefined
      );

      console.log("✅ Inspection order created:", response);

      // Show success message
      if (inspectionType === "system") {
        toast.success(
          `Đã tạo lịch kiểm duyệt! Chúng tôi sẽ liên hệ với bạn sớm.${response.result?.scheduledDate
            ? ` Ngày dự kiến: ${new Date(response.result.scheduledDate).toLocaleDateString("vi-VN")}`
            : ""
          }`
        );
      } else {
        toast.success("Hồ sơ của bạn đã được gửi! Chúng tôi sẽ xem xét trong 1-2 ngày làm việc.");
      }

      // Close modal and reload posts
      closeModal();
      await loadPosts();
    } catch (error: any) {
      console.error("❌ Error submitting inspection:", error);

      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Không thể gửi yêu cầu kiểm duyệt. Vui lòng thử lại!");
      }
    } finally {
      setSubmittingInspection(false);
    }
  };

  const handleDeletePost = async (listingId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tin đăng này?")) return;

    try {
      await UserPostService.deletePost(listingId);
      toast.success("Xóa tin đăng thành công!");
      await loadPosts();
    } catch (error) {
      console.error("❌ Error deleting post:", error);
      toast.error("Không thể xóa tin đăng!");
    }
  };

  // ===== UTILITIES =====
  const getFilteredPosts = () => {
    switch (activeTab) {
      case "active":
        return posts.filter(p => p.status === "ACTIVE");
      case "expired":
        return posts.filter(p => p.status === "EXPIRED");
      case "pending":
        return posts.filter(p => p.status === "PENDING");
      default:
        return posts;
    }
  };

  const getStatusBadge = (status: string) => {
    const badge = STATUS_BADGES[status as keyof typeof STATUS_BADGES] || {
      text: status,
      color: "bg-gray-400",
    };

    return (
      <span className={`inline-block ${badge.color} text-white text-xs px-2 py-1 rounded-md font-medium`}>
        {badge.text}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN");
    } catch {
      return "—";
    }
  };

  const getLocationString = (post: SalePost) => {
    const parts = [post.street, post.wardCode, post.districtCode, post.provinceCode]
      .filter(Boolean)
      .join(", ");
    return parts || "Chưa cập nhật địa chỉ";
  };

  const filteredPosts = getFilteredPosts();

  // ===== RENDER =====
  return (
    <div className="bg-[#F7F9F9] rounded-2xl shadow-lg border border-[#A8E6CF]/50 mb-10">
      {/* Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-[#2ECC71] via-[#A8E6CF] to-[#F7F9F9] border-b border-[#A8E6CF]/50 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#2C3E50]">Quản lý tin đăng</h2>
        <Link to="/" className="text-sm text-[#2C3E50] hover:text-[#2ECC71] font-medium transition-colors">
          Trang chủ
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex justify-between bg-[#F7F9F9] border-b border-[#A8E6CF]/60 px-4 py-3 gap-2 flex-wrap">
        {ORDER_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 text-center py-2 text-sm font-medium rounded-lg transition-all duration-300 ${activeTab === tab.id
              ? "bg-[#2ECC71] text-white shadow-md"
              : "text-[#2C3E50] hover:bg-[#A8E6CF]/50 hover:text-[#2ECC71]"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-[#2ECC71] animate-spin mb-4" />
            <p className="text-[#2C3E50]/70 text-lg">Đang tải tin đăng...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 text-[#2C3E50]/70">
            <p className="text-lg font-medium mb-2">
              {activeTab === "all" ? "Bạn chưa có tin đăng nào." : "Chưa có tin ở trạng thái này."}
            </p>
            <Link
              to="/dang-tin"
              className="inline-block mt-3 bg-[#2ECC71] hover:bg-[#29b765] text-white px-6 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
            >
              Đăng tin ngay
            </Link>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.listingId}
              className="flex flex-col sm:flex-row gap-4 border border-[#A8E6CF]/60 rounded-xl bg-white p-4 hover:shadow-md transition-all"
            >
              {/* Image */}
              <div className="flex-shrink-0">
                <img
                  src={post.coverThumb || "https://via.placeholder.com/200?text=No+Image"}
                  alt={post.productName}
                  className="w-28 h-28 object-cover rounded-lg border border-[#A8E6CF]/40"
                />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h4 className="font-semibold text-[#2C3E50] text-base truncate max-w-[400px]">
                    {post.productName}
                  </h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                    {post.productType === "VEHICLE" ? "Xe" : "Pin"}
                  </span>
                </div>

                <p className="text-sm text-[#2C3E50]/70 flex items-center gap-1 mb-1">
                  <MapPin className="w-4 h-4" />
                  {post.address || getLocationString(post)}
                </p>

                <p className="text-sm text-[#2C3E50]/70 mb-2 flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    Mã tin: <span className="font-medium">#{post.listingId}</span>
                  </span>
                  {post.status && getStatusBadge(post.status)}
                  {post.priorityLevel && post.priorityLevel > 0 && (
                    <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-medium">
                      Ưu tiên: {post.priorityLevel}
                    </span>
                  )}
                </p>

                <div className="text-sm text-[#2C3E50]/70 space-y-1">
                  {post.createdAt && (
                    <p className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Đăng ngày: <span className="font-medium">{formatDate(post.createdAt)}</span>
                    </p>
                  )}
                  <p>
                    Giá:{" "}
                    <span className="font-medium text-[#2ECC71]">
                      {post.askPrice.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2 sm:mt-0">
                {(post.status === "ACTIVE" || post.status === "PENDING") && (
                  <Link
                    to={`/chinh-sua-tin/${post.listingId}`}
                    className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Sửa
                  </Link>
                )}

                {post.productType === "VEHICLE" && (
                  <button
                    onClick={() => openModal(post)}
                    className="flex items-center gap-2 bg-[#2ECC71] hover:bg-[#29b765] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Kiểm duyệt
                  </button>
                )}

                <button
                  onClick={() => handleDeletePost(post.listingId)}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedPost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto "
            style={{
              scrollbarWidth: 'none', /* Firefox */
              msOverflowStyle: 'none', /* IE and Edge */
            }}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#2ECC71] to-[#A8E6CF] px-6 py-5 flex items-center justify-between border-b border-[#A8E6CF]/30 z-10">
              <div>
                <h3 className="text-xl font-bold text-white">Kiểm duyệt xe</h3>
                <p className="text-white/80 text-sm mt-1">Mã tin: #{selectedPost.listingId}</p>
              </div>
              <button onClick={closeModal} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Vehicle Info */}
              <div className="bg-gradient-to-br from-[#F7F9F9] to-[#A8E6CF]/10 rounded-xl p-4 border border-[#A8E6CF]/30">
                <div className="flex gap-4">
                  <img
                    src={selectedPost.coverThumb || "https://via.placeholder.com/200"}
                    alt={selectedPost.productName}
                    className="w-24 h-24 object-cover rounded-lg border-2 border-[#2ECC71]/30"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#2C3E50] mb-2">{selectedPost.productName}</h4>
                    <p className="text-sm text-[#2C3E50]/70">
                      📍 {selectedPost.address || getLocationString(selectedPost)}
                    </p>
                    {selectedPost.vehicle && (
                      <p className="text-sm text-[#2C3E50]/70 mt-1">
                        {selectedPost.vehicle.brandName} {selectedPost.vehicle.modelName} -{" "}
                        {selectedPost.vehicle.year}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Inspection Type */}
              <div>
                <label className="block text-sm font-semibold text-[#2C3E50] mb-3">
                  Chọn phương thức kiểm duyệt <span className="text-red-500">*</span>
                </label>

                <div className="space-y-3">
                  {/* System Inspection */}
                  <label
                    className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${inspectionType === "system"
                      ? "border-[#2ECC71] bg-[#2ECC71]/5 shadow-md"
                      : "border-[#A8E6CF]/40 hover:border-[#2ECC71]/50 hover:bg-[#F7F9F9]"
                      }`}
                  >
                    <input
                      type="radio"
                      name="inspectionType"
                      value="system"
                      checked={inspectionType === "system"}
                      onChange={(e) => setInspectionType(e.target.value as "system")}
                      className="mt-1 w-5 h-5 text-[#2ECC71]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-5 h-5 text-[#2ECC71]" />
                        <span className="font-semibold text-[#2C3E50]">Kiểm duyệt tự động</span>
                        <span className="text-xs bg-[#2ECC71] text-white px-2 py-0.5 rounded-full">Nhanh</span>
                      </div>
                      <p className="text-sm text-[#2C3E50]/70">
                        Hệ thống sẽ tự động kiểm tra thông tin xe. Thời gian: <strong>5-10 phút</strong>
                      </p>
                    </div>
                  </label>

                  {/* Manual Inspection */}
                  <label
                    className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${inspectionType === "manual"
                      ? "border-[#2ECC71] bg-[#2ECC71]/5 shadow-md"
                      : "border-[#A8E6CF]/40 hover:border-[#2ECC71]/50 hover:bg-[#F7F9F9]"
                      }`}
                  >
                    <input
                      type="radio"
                      name="inspectionType"
                      value="manual"
                      checked={inspectionType === "manual"}
                      onChange={(e) => setInspectionType(e.target.value as "manual")}
                      className="mt-1 w-5 h-5 text-[#2ECC71]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-5 h-5 text-[#2ECC71]" />
                        <span className="font-semibold text-[#2C3E50]">Kiểm duyệt thủ công</span>
                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">Chính xác</span>
                      </div>
                      <p className="text-sm text-[#2C3E50]/70">
                        Gửi hồ sơ để thẩm định chi tiết. Thời gian: <strong>1-2 ngày</strong>
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* ✅ NEW: Location Selection for System Inspection */}
              {inspectionType === "system" && (
                <div className="animate-fade-in space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-1">📍 Địa điểm kiểm duyệt</p>
                    <p className="text-xs text-blue-800">
                      Vui lòng chọn địa điểm để chúng tôi sắp xếp lịch kiểm duyệt xe tại nhà
                    </p>
                  </div>

                  {/* Province */}
                  <div>
                    <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                      Tỉnh/Thành phố <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedProvince || ""}
                      onChange={(e) => setSelectedProvince(Number(e.target.value) || null)}
                      disabled={loadingProvinces}
                      className="w-full border-2 border-[#A8E6CF] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#2ECC71] focus:border-[#2ECC71] outline-none bg-white transition-all"
                    >
                      <option value="">
                        {loadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành phố"}
                      </option>
                      {provinces.map((province) => (
                        <option key={province.code} value={province.code}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                      Quận/Huyện <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedDistrict || ""}
                      onChange={(e) => setSelectedDistrict(Number(e.target.value) || null)}
                      disabled={!selectedProvince || loadingDistricts}
                      className="w-full border-2 border-[#A8E6CF] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#2ECC71] focus:border-[#2ECC71] outline-none bg-white transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!selectedProvince
                          ? "Chọn tỉnh/thành phố trước"
                          : loadingDistricts
                            ? "Đang tải..."
                            : "Chọn quận/huyện"}
                      </option>
                      {districts.map((district) => (
                        <option key={district.code} value={district.code}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ward */}
                  <div>
                    <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                      Phường/Xã <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedWard || ""}
                      onChange={(e) => setSelectedWard(Number(e.target.value) || null)}
                      disabled={!selectedDistrict || loadingWards}
                      className="w-full border-2 border-[#A8E6CF] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#2ECC71] focus:border-[#2ECC71] outline-none bg-white transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!selectedDistrict
                          ? "Chọn quận/huyện trước"
                          : loadingWards
                            ? "Đang tải..."
                            : "Chọn phường/xã"}
                      </option>
                      {wards.map((ward) => (
                        <option key={ward.code} value={ward.code}>
                          {ward.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Street */}
                  <div>
                    <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                      Địa chỉ cụ thể <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Ví dụ: Số 123, Đường ABC..."
                      className="w-full border-2 border-[#A8E6CF] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#2ECC71] focus:border-[#2ECC71] outline-none bg-white transition-all"
                    />
                    <p className="text-xs text-[#2C3E50]/60 mt-1">
                      💡 Nhập số nhà, tên đường để chúng tôi dễ dàng tìm đến
                    </p>
                  </div>
                </div>
              )}

              {/* File Upload for Manual Inspection */}
              {inspectionType === "manual" && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-semibold text-[#2C3E50] mb-3">
                    Tải lên hồ sơ <span className="text-red-500">*</span>
                  </label>

                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${isDragging
                      ? "border-[#2ECC71] bg-[#2ECC71]/5 scale-105"
                      : uploadedFile
                        ? "border-[#2ECC71] bg-[#2ECC71]/5"
                        : "border-[#A8E6CF]/60 hover:border-[#2ECC71]/50"
                      }`}
                  >
                    {uploadedFile ? (
                      <div className="space-y-3">
                        <FileText className="w-16 h-16 mx-auto text-[#2ECC71]" />
                        <p className="font-semibold text-[#2C3E50]">{uploadedFile.name}</p>
                        <p className="text-sm text-[#2C3E50]/60">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          onClick={() => setUploadedFile(null)}
                          className="text-sm text-red-500 hover:text-red-600 font-medium"
                        >
                          Xóa file
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-16 h-16 mx-auto text-[#2ECC71] mb-4" />
                        <p className="text-[#2C3E50] font-medium mb-2">Kéo thả file PDF vào đây hoặc</p>
                        <label className="inline-block bg-[#2ECC71] hover:bg-[#29b765] text-white px-6 py-2 rounded-lg cursor-pointer transition-colors font-medium">
                          Chọn file
                          <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                        </label>
                        <p className="text-xs text-[#2C3E50]/60 mt-3">Chỉ chấp nhận PDF, tối đa 10MB</p>
                      </>
                    )}
                  </div>

                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-2">📋 Giấy tờ cần thiết:</p>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>Giấy chứng nhận đăng ký xe (Bản sao có công chứng)</li>
                      <li>CMND/CCCD của chủ xe</li>
                      <li>Giấy chứng nhận bảo hiểm (nếu có)</li>
                      <li>Giấy kiểm định kỹ thuật (nếu có)</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-[#F7F9F9] px-6 py-4 border-t border-[#A8E6CF]/30 flex gap-3 z-10">
              <button
                onClick={closeModal}
                disabled={submittingInspection}
                className="flex-1 px-6 py-3 border-2 border-[#A8E6CF] text-[#2C3E50] rounded-lg font-semibold hover:bg-[#A8E6CF]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  submittingInspection ||
                  !inspectionType ||
                  (inspectionType === "system" && (!selectedProvince || !selectedDistrict || !selectedWard || !street.trim())) ||
                  (inspectionType === "manual" && !uploadedFile)
                }
                className="flex-1 px-6 py-3 bg-[#2ECC71] text-white rounded-lg font-semibold hover:bg-[#29b765] disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {submittingInspection ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  "Gửi yêu cầu"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
