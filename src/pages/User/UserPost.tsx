import React, { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { MoreVertical, EyeOff, ShoppingCart, X, Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";

type ContextType = {
  user?: any;
  posts?: any[];
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
};

const orderTabs = [
  { id: "is_posted", label: "Tin đã đăng" },
  { id: "out_dated", label: "Tin hết hạn" },
];

const mockOrders = [
  {
    id: "ORD001",
    title: "Xe điện VinFast KlaraS bản cao cấp, màu trắng cực đẹp",
    location: "Quận 6, TP.HCM",
    status: "is_posted",
    code: "70219517",
    service: "Chưa có",
    expire: "Chưa có dịch vụ",
    visibility: "Chưa hiển thị",
    image: "https://picsum.photos/seed/evbike/200",
  },
  {
    id: "ORD014",
    title: "Điện thoại iPhone 14 Pro 128GB",
    location: "Quận 3, TP.HCM",
    status: "on_payment",
    code: "70589512",
    service: "Dịch vụ VIP",
    expire: "20/11/2025",
    visibility: "Đang hiển thị",
    image: "https://picsum.photos/seed/iphone/200",
  },
];

export default function UserPosts() {
  const ctx = useOutletContext<ContextType>();
  const [activeTab, setActiveTab] = useState(orderTabs[0].id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);
  const [inspectionType, setInspectionType] = useState<"system" | "manual" | "">("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const filteredOrders = mockOrders.filter((o) => o.status === activeTab);

  const openModal = (order: typeof mockOrders[0]) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
    setInspectionType("");
    setUploadedFile(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setInspectionType("");
    setUploadedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setUploadedFile(file);
      } else {
        alert("Vui lòng chọn file PDF");
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setUploadedFile(file);
      } else {
        alert("Vui lòng chọn file PDF");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = () => {
    if (!inspectionType) {
      alert("Vui lòng chọn phương thức kiểm duyệt");
      return;
    }

    if (inspectionType === "manual" && !uploadedFile) {
      alert("Vui lòng tải lên hồ sơ giấy tờ xe");
      return;
    }

    // TODO: Submit to API
    console.log("Inspection Type:", inspectionType);
    console.log("Uploaded File:", uploadedFile);

    alert("Gửi yêu cầu kiểm duyệt thành công!");
    closeModal();
  };

  return (
    <div className="bg-[#F7F9F9] rounded-2xl shadow-lg border border-[#A8E6CF]/50">
      {/* Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-[#2ECC71] via-[#A8E6CF] to-[#F7F9F9] border-b border-[#A8E6CF]/50 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#2C3E50]">
          Quản lý tin đăng
        </h2>
        <Link
          to="/"
          className="text-sm text-[#2C3E50] hover:text-[#2ECC71] font-medium transition-colors"
        >
          Trang chủ
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex justify-between bg-[#F7F9F9] border-b border-[#A8E6CF]/60 px-4 py-3 gap-2 flex-wrap">
        {orderTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 text-center py-2 text-sm font-medium rounded-lg transition-all duration-300
              ${activeTab === tab.id
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
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 text-[#2C3E50]/70">
            <p className="text-lg font-medium mb-2">Chưa có tin ở trạng thái này.</p>
            <Link
              to="/dang-tin"
              className="inline-block mt-3 bg-[#2ECC71] hover:bg-[#29b765] text-white px-6 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
            >
              Đăng tin ngay
            </Link>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col sm:flex-row gap-4 border border-[#A8E6CF]/60 rounded-xl bg-white p-4 hover:shadow-md transition-all"
            >
              <div className="flex-shrink-0">
                <img
                  src={order.image}
                  alt={order.title}
                  className="w-28 h-28 object-cover rounded-lg border border-[#A8E6CF]/40"
                />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-1 mb-1">
                  <h4 className="font-semibold text-[#2C3E50] text-base truncate max-w-[400px]">
                    {order.title}
                  </h4>
                </div>
                <p className="text-sm text-[#2C3E50]/70 flex items-center gap-1">
                  <span>🏙️</span> {order.location}
                </p>
                <p className="text-sm text-[#2C3E50]/70 mt-1">
                  Mã tin: <span className="font-medium">{order.code}</span> –{" "}
                  <span className="inline-block bg-red-500 text-white text-xs px-2 py-[2px] rounded-md">
                    {order.visibility}
                  </span>
                </p>
                <div className="mt-1 text-sm text-[#2C3E50]/70">
                  <p>Loại dịch vụ: <span className="font-medium">{order.service}</span></p>
                  <p>Ngày hết hạn: <span className="font-medium">{order.expire}</span></p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <button
                  onClick={() => openModal(order)}
                  className="flex items-center gap-1 bg-[#2ECC71] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#29b765] transition-colors"
                >
                  <ShoppingCart size={16} /> Kiểm duyệt xe
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Inspection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#2ECC71] to-[#A8E6CF] px-6 py-5 flex items-center justify-between border-b border-[#A8E6CF]/30">
              <div>
                <h3 className="text-xl font-bold text-white">Kiểm duyệt xe</h3>
                <p className="text-white/80 text-sm mt-1">Mã tin: {selectedOrder?.code}</p>
              </div>
              <button
                onClick={closeModal}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Vehicle Info */}
              <div className="bg-gradient-to-br from-[#F7F9F9] to-[#A8E6CF]/10 rounded-xl p-4 border border-[#A8E6CF]/30">
                <div className="flex gap-4">
                  <img
                    src={selectedOrder?.image}
                    alt={selectedOrder?.title}
                    className="w-24 h-24 object-cover rounded-lg border-2 border-[#2ECC71]/30"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#2C3E50] mb-2">{selectedOrder?.title}</h4>
                    <p className="text-sm text-[#2C3E50]/70">📍 {selectedOrder?.location}</p>
                  </div>
                </div>
              </div>

              {/* Inspection Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-[#2C3E50] mb-3">
                  Chọn phương thức kiểm duyệt <span className="text-red-500">*</span>
                </label>

                <div className="space-y-3">
                  {/* System Inspection Option */}
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
                      className="mt-1 w-5 h-5 text-[#2ECC71] focus:ring-[#2ECC71]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-5 h-5 text-[#2ECC71]" />
                        <span className="font-semibold text-[#2C3E50]">Kiểm duyệt tự động</span>
                        <span className="text-xs bg-[#2ECC71] text-white px-2 py-0.5 rounded-full">Nhanh</span>
                      </div>
                      <p className="text-sm text-[#2C3E50]/70">
                        Hệ thống sẽ tự động kiểm tra thông tin xe dựa trên dữ liệu đã đăng ký.
                        Thời gian xử lý: <strong>5-10 phút</strong>
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-[#2ECC71]">
                        <CheckCircle size={14} />
                        <span>Miễn phí</span>
                      </div>
                    </div>
                  </label>

                  {/* Manual Inspection Option */}
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
                      className="mt-1 w-5 h-5 text-[#2ECC71] focus:ring-[#2ECC71]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-5 h-5 text-[#2ECC71]" />
                        <span className="font-semibold text-[#2C3E50]">Kiểm duyệt thủ công</span>
                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">Chính xác</span>
                      </div>
                      <p className="text-sm text-[#2C3E50]/70">
                        Gửi hồ sơ giấy tờ xe để đội ngũ kiểm duyệt thẩm định chi tiết.
                        Thời gian xử lý: <strong>1-2 ngày làm việc</strong>
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-[#2C3E50]/60">
                        <AlertCircle size={14} />
                        <span>Yêu cầu tải lên giấy tờ xe (PDF)</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* File Upload Section - Only show when manual is selected */}
              {inspectionType === "manual" && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-semibold text-[#2C3E50] mb-3">
                    Tải lên hồ sơ giấy tờ xe <span className="text-red-500">*</span>
                  </label>

                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${isDragging
                        ? "border-[#2ECC71] bg-[#2ECC71]/5 scale-105"
                        : uploadedFile
                          ? "border-[#2ECC71] bg-[#2ECC71]/5"
                          : "border-[#A8E6CF]/60 hover:border-[#2ECC71]/50 hover:bg-[#F7F9F9]"
                      }`}
                  >
                    {uploadedFile ? (
                      <div className="space-y-3">
                        <div className="w-16 h-16 mx-auto bg-[#2ECC71]/10 rounded-full flex items-center justify-center">
                          <FileText className="w-8 h-8 text-[#2ECC71]" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#2C3E50]">{uploadedFile.name}</p>
                          <p className="text-sm text-[#2C3E50]/60">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          onClick={() => setUploadedFile(null)}
                          className="text-sm text-red-500 hover:text-red-600 font-medium"
                        >
                          Xóa file
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 mx-auto bg-[#A8E6CF]/20 rounded-full flex items-center justify-center mb-4">
                          <Upload className="w-8 h-8 text-[#2ECC71]" />
                        </div>
                        <p className="text-[#2C3E50] font-medium mb-2">
                          Kéo thả file PDF vào đây hoặc
                        </p>
                        <label className="inline-block bg-[#2ECC71] hover:bg-[#29b765] text-white px-6 py-2 rounded-lg cursor-pointer transition-colors font-medium">
                          Chọn file
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-[#2C3E50]/60 mt-3">
                          Chỉ chấp nhận file PDF, tối đa 10MB
                        </p>
                      </>
                    )}
                  </div>

                  {/* Required Documents Info */}
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
            <div className="sticky bottom-0 bg-[#F7F9F9] px-6 py-4 border-t border-[#A8E6CF]/30 flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-6 py-3 border-2 border-[#A8E6CF] text-[#2C3E50] rounded-lg font-semibold hover:bg-[#A8E6CF]/10 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={!inspectionType || (inspectionType === "manual" && !uploadedFile)}
                className="flex-1 px-6 py-3 bg-[#2ECC71] text-white rounded-lg font-semibold hover:bg-[#29b765] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                Gửi yêu cầu kiểm duyệt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
