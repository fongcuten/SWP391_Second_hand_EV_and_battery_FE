import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  X,
  Upload,
  FileText,
  CheckCircle,
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
import { InspectionService, type InspectionOrderRequest } from "../../services/Inspection/InspectionService"; // ✅ Update import
import api from "../../config/axios";

// ===== TYPES =====

type TabId = "all" | "active" | "sold";
type InspectionType = "system" | "manual" | "";

interface OrderTab {
  id: TabId;
  label: string;
}

// ===== CONSTANTS =====

const ORDER_TABS: OrderTab[] = [
  { id: "all", label: "Tất cả tin" },
  { id: "active", label: "Đang hiển thị" },
  { id: "sold", label: "Đã bán" },
];

const STATUS_BADGES = {
  ACTIVE: { text: "Đang hiển thị", color: "bg-green-500" },
  PENDING: { text: "Chờ duyệt", color: "bg-yellow-500" },
  EXPIRED: { text: "Hết hạn", color: "bg-red-500" },
  SOLD: { text: "Đã bán", color: "bg-gray-500" },
} as const;

// ===== MAIN COMPONENT =====

export default function UserPosts() {
  // ===== STATE =====
  const [posts, setPosts] = useState<SalePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [productTypeFilter, setProductTypeFilter] = useState<"VEHICLE" | "BATTERY" | "">("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SalePost | null>(null);
  const [inspectionType, setInspectionType] = useState<InspectionType>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
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
  const [scheduledDate, setScheduledDate] = useState<string>(""); // ✅ Scheduled date state

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

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  // ===== ACTION HANDLERS =====
  const handleSubmit = async () => {
    if (!inspectionType) {
      toast.warning("Vui lòng chọn phương thức kiểm duyệt");
      return;
    }

    // Validate SYSTEM inspection
    if (inspectionType === "system") {
      if (!selectedProvince || !selectedDistrict || !selectedWard || !street.trim()) {
        toast.warning("Vui lòng điền đầy đủ thông tin địa chỉ");
        return;
      }

      if (!scheduledDate) {
        toast.warning("Vui lòng chọn ngày hẹn kiểm duyệt");
        return;
      }

      const selectedDateTime = new Date(scheduledDate);
      const now = new Date();

      if (selectedDateTime <= now) {
        toast.warning("Vui lòng chọn ngày trong tương lai");
        return;
      }

      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 30);

      if (selectedDateTime > maxDate) {
        toast.warning("Vui lòng chọn ngày trong vòng 30 ngày tới");
        return;
      }
    }

    // Validate MANUAL inspection
    if (inspectionType === "manual") {
      if (!uploadedFile) {
        toast.warning("Vui lòng tải lên giấy tờ xe");
        return;
      }

      const maxSize = 10 * 1024 * 1024;
      if (uploadedFile.size > maxSize) {
        toast.warning("Kích thước file không được vượt quá 10MB");
        return;
      }

      if (uploadedFile.type !== "application/pdf") {
        toast.warning("Chỉ chấp nhận file PDF");
        return;
      }
    }

    if (!selectedPost) return;

    setSubmittingInspection(true);

    try {
      // Handle SYSTEM inspection
      if (inspectionType === "system") {
        const payload: InspectionOrderRequest = {
          listingId: selectedPost.listingId,
          scheduledAt: new Date(scheduledDate).toISOString(),
          provinceCode: selectedProvince || undefined,
          districtCode: selectedDistrict || undefined,
          wardCode: selectedWard || undefined,
          street: street.trim() || undefined,
        };

        const inspectionOrderId = await InspectionService.submitInspectionOrder(payload);
        console.log("✅ Created inspection order with ID:", inspectionOrderId);
        if (!inspectionOrderId) {
          toast.error("Không thể tạo đơn kiểm duyệt");
          return;
        }

        localStorage.setItem("pendingInspectionOrderId", inspectionOrderId.toString());

        const response = await api.post(`/api/inspection-orders/${inspectionOrderId}/checkout`, {});
        const checkoutUrl = response.data?.url;
        if (!checkoutUrl) {
          toast.error("Không thể trả check out URL");
          return;
        }

        window.location.replace(checkoutUrl);

        toast.success(
          `Đã đặt lịch kiểm duyệt tự động ngày ${new Date(
            scheduledDate
          ).toLocaleDateString("vi-VN")}! Chúng tôi sẽ liên hệ xác nhận.`
        );
      }

      // Handle MANUAL inspection
      if (inspectionType === "manual" && uploadedFile) {
        // ✅ Directly submit the manual inspection with a null order ID
        const reportResponse = await InspectionService.submitManualInspection(
          selectedPost.listingId,
          uploadedFile,
          null // Pass null for inspectionOrderId
        );

        if (reportResponse?.reportId) {
          toast.success(
            `Đã tải lên giấy tờ kiểm duyệt! Mã báo cáo: #${reportResponse.reportId}. Chúng tôi sẽ phản hồi trong 24-48h.`
          );
        } else {
          toast.success(
            `Đã tải lên giấy tờ kiểm duyệt! Chúng tôi sẽ xem xét trong 24-48h.`
          );
        }
      }


      closeModal();
      await loadPosts();
    } catch (error: any) {
      console.error("❌ Error submitting inspection:", error);
      toast.error(error.message || "Không thể gửi yêu cầu kiểm duyệt. Vui lòng thử lại!");
    } finally {
      setSubmittingInspection(false);
    }
  };

  const handleMarkAsSold = async (listingId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn đánh dấu tin này là đã bán? Thao tác này không thể hoàn tác.")) return;

    try {
      await UserPostService.markPostAsSold(listingId);
      toast.success("Đã đánh dấu tin là đã bán!");
      await loadPosts();
    } catch (error) {
      console.error("❌ Error marking post as sold:", error);
      toast.error("Không thể đánh dấu tin là đã bán!");
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
    // First, filter by status based on the active tab
    let statusFilteredPosts: SalePost[];
    switch (activeTab) {
      case "active":
        statusFilteredPosts = posts.filter(p => p.status === "ACTIVE");
        break;
      case "sold":
        statusFilteredPosts = posts.filter(p => p.status === "SOLD");
        break;
      default:
        statusFilteredPosts = posts;
        break;
    }

    // Then, filter by product type if a filter is selected
    if (productTypeFilter) {
      return statusFilteredPosts.filter(p => p.productType === productTypeFilter);
    }

    return statusFilteredPosts;
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
      <div className="px-6 py-5 bg-white border-b border-gray-200 flex items-center justify-between rounded-t-2xl">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          Quản lý tin đăng
        </h2>
        <Link to="/" className="text-sm text-gray-600 hover:text-green-600 font-medium transition-colors">
          Trang chủ
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex justify-between items-center bg-[#F7F9F9] border-b border-[#A8E6CF]/60 px-4 py-3 gap-4 flex-wrap">
        {/* Status Tabs */}
        <div className="flex items-center gap-2">
          {ORDER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${activeTab === tab.id
                ? "bg-[#2ECC71] text-white shadow-md"
                : "text-[#2C3E50] hover:bg-[#A8E6CF]/50"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product Type Dropdown */}
        <div>
          <select
            value={productTypeFilter}
            onChange={(e) => setProductTypeFilter(e.target.value as "VEHICLE" | "BATTERY" | "")}
            className="px-4 py-2 text-sm font-medium text-[#2C3E50] bg-white border border-[#A8E6CF]/80 rounded-lg focus:ring-2 focus:ring-[#2ECC71] focus:border-[#2ECC71] transition-all"
          >
            <option value="">Tất cả sản phẩm</option>
            <option value="VEHICLE">Chỉ hiển thị xe</option>
            <option value="BATTERY">Chỉ hiển thị pin</option>
          </select>
        </div>
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
              className="border border-[#A8E6CF]/60 rounded-xl bg-white p-4 hover:shadow-md transition-all"
            >
              {/* Top section: Info */}
              <div className="flex flex-col sm:flex-row gap-4">
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
              </div>

              {/* Divider and Actions */}
              <hr className="my-3 border-t border-[#A8E6CF]/40" />
              <div className="flex flex-wrap items-center justify-end gap-3">
                {post.status === "ACTIVE" && (
                  <button
                    onClick={() => handleMarkAsSold(post.listingId)}
                    className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Đã bán</span>
                  </button>
                )}
                {(post.status === "ACTIVE" || post.status === "PENDING") && (
                  <Link
                    to={`/cap-nhat/${post.listingId}`}
                    className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Sửa</span>
                  </Link>
                )}
                {post.productType === "VEHICLE" && (
                  <button
                    onClick={() => openModal(post)}
                    className="flex items-center justify-center gap-2 bg-[#2ECC71] hover:bg-[#29b765] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Kiểm duyệt</span>
                  </button>
                )}
                <button
                  onClick={() => handleDeletePost(post.listingId)}
                  className="flex items-center justify-center gap-2 border-2 border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-red-50 hover:border-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedPost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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

              {/* Inspection Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-[#2C3E50] mb-3">
                  Chọn phương thức kiểm duyệt <span className="text-red-500">*</span>
                </label>

                <div className="space-y-3">
                  {/* ✅ SYSTEM INSPECTION - Date + Location */}
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
                        <span className="font-semibold text-[#2C3E50]">
                          Kiểm duyệt tự động tại nhà
                        </span>
                        <span className="text-xs bg-[#2ECC71] text-white px-2 py-0.5 rounded-full">
                          Nhanh
                        </span>
                      </div>
                      <p className="text-sm text-[#2C3E50]/70">
                        Đặt lịch để chúng tôi đến tận nơi kiểm tra xe. Chọn ngày giờ phù hợp với bạn.
                      </p>
                    </div>
                  </label>

                  {/* ✅ MANUAL INSPECTION - Document Upload */}
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
                        <span className="font-semibold text-[#2C3E50]">
                          Kiểm duyệt qua giấy tờ
                        </span>
                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                          Tiện lợi
                        </span>
                      </div>
                      <p className="text-sm text-[#2C3E50]/70">
                        Tải lên giấy tờ đăng kiểm/bảo hiểm xe để kiểm duyệt. Kết quả trong 24-48h.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* ✅ SYSTEM INSPECTION - Location + Date */}
              {inspectionType === "system" && (
                <div className="animate-fade-in space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      📍 Thông tin kiểm duyệt tại nhà
                    </p>
                    <p className="text-xs text-blue-800">
                      Vui lòng chọn địa điểm và ngày giờ để chúng tôi đến kiểm tra xe
                    </p>
                  </div>

                  {/* Date Picker */}
                  <div>
                    <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                      Ngày hẹn <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={getMinDate()}
                      max={getMaxDate()}
                      className="w-full border-2 border-[#A8E6CF] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#2ECC71] focus:border-[#2ECC71] outline-none bg-white transition-all"
                    />
                    <p className="text-xs text-[#2C3E50]/60 mt-1">
                      💡 Chọn ngày trong vòng 30 ngày tới
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
                      className="w-full border-2 border-[#A8E6CF] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#2ECC71] focus:border-[#2ECC71] outline-none bg-white transition-all disabled:bg-gray-100"
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
                      className="w-full border-2 border-[#A8E6CF] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#2ECC71] focus:border-[#2ECC71] outline-none bg-white transition-all disabled:bg-gray-100"
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

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-green-900 mb-2">
                      ✅ Quy trình kiểm duyệt tại nhà:
                    </p>
                    <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                      <li>Chúng tôi sẽ liên hệ xác nhận trước 24h</li>
                      <li>Kiểm tra xe tận nơi, thời gian 30-45 phút</li>
                      <li>Kết quả kiểm duyệt trong vòng 1-2 ngày</li>
                      <li>Miễn phí di chuyển trong khu vực nội thành</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* ✅ MANUAL INSPECTION - File Upload Only */}
              {inspectionType === "manual" && (
                <div className="animate-fade-in space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      📄 Tải lên giấy tờ xe
                    </p>
                    <p className="text-xs text-blue-800">
                      Vui lòng tải lên giấy tờ đăng kiểm hoặc bảo hiểm xe (định dạng PDF)
                    </p>
                  </div>

                  {/* File Upload Area */}
                  <div className="border-2 border-dashed rounded-xl p-8 text-center transition-all border-[#A8E6CF]/60 hover:border-[#2ECC71]/80 hover:bg-[#F7F9F9]">
                    <input
                      type="file"
                      id="file-upload"
                      onChange={handleFileChange}
                      accept=".pdf"
                      className="hidden"
                    />

                    {uploadedFile ? (
                      <div className="space-y-3">
                        <FileText className="w-12 h-12 text-[#2ECC71] mx-auto" />
                        <p className="text-sm font-semibold text-[#2C3E50]">
                          {uploadedFile.name}
                        </p>
                        <p className="text-xs text-[#2C3E50]/60">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          onClick={handleRemoveFile}
                          className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                          Xóa tệp
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-12 h-12 text-[#A8E6CF] mx-auto" />
                        <div>
                          <p className="text-sm font-semibold text-[#2C3E50] mb-1">
                            Kéo thả tệp vào đây hoặc{" "}
                            <label
                              htmlFor="file-upload"
                              className="text-[#2ECC71] hover:text-[#29b765] cursor-pointer"
                            >
                              chọn tệp
                            </label>
                          </p>
                          <p className="text-xs text-[#2C3E50]/60">
                            Chỉ hỗ trợ file PDF, tối đa 10MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-yellow-900 mb-2">
                      ⚠️ Yêu cầu về giấy tờ:
                    </p>
                    <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                      <li>Giấy đăng kiểm còn hiệu lực hoặc bảo hiểm xe</li>
                      <li>Hình ảnh rõ ràng, không bị mờ hoặc che khuất</li>
                      <li>File PDF dung lượng không quá 10MB</li>
                      <li>Thời gian xử lý: 24-48 giờ làm việc</li>
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
                className="flex-1 px-6 py-3 border-2 border-[#A8E6CF] text-[#2C3E50] rounded-lg font-semibold hover:bg-[#A8E6CF]/10 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  submittingInspection ||
                  !inspectionType ||
                  (inspectionType === "system" &&
                    (!selectedProvince ||
                      !selectedDistrict ||
                      !selectedWard ||
                      !street.trim() ||
                      !scheduledDate)) ||
                  (inspectionType === "manual" && !uploadedFile)
                }
                className="flex-1 px-6 py-3 bg-[#2ECC71] text-white rounded-lg font-semibold hover:bg-[#29b765] disabled:opacity-50 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
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

// ✅ Helper to get minimum date (tomorrow)
const getMinDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
};

// ✅ Helper to get maximum date (30 days from now)
const getMaxDate = () => {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  return maxDate.toISOString().split("T")[0];
};