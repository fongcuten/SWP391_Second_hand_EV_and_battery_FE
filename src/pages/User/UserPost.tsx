import React, { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { MoreVertical, EyeOff, ShoppingCart } from "lucide-react";

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

  const filteredOrders = mockOrders.filter((o) => o.status === activeTab);

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
              ${
                activeTab === tab.id
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
                <button className="flex items-center gap-1 bg-[#2ECC71] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#29b765] transition-colors">
                  <ShoppingCart size={16} /> Mua dịch vụ
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
