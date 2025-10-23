import React, { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { PenSquare } from "lucide-react";

type ContextType = {
  user?: any;
  posts?: any[];
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
};

const orderTabs = [
  { id: "is_posted", label: "Tin đã đăng" },
  { id: "out_dated", label: "Tin hết hạn" },
  { id: "on_payment", label: "Tin cần thanh toán" },
];

const mockOrders = [
  {
    id: "ORD001",
    title: "Tai nghe Bluetooth Sony WH-1000XM5",
    date: "2025-10-10",
    status: "is_posted",
    price: 6990000,
    image: "https://picsum.photos/seed/headphones/200",
  },
  {
    id: "ORD014",
    title: "Điện thoại iPhone 14 Pro 128GB",
    date: "2025-10-20",
    status: "on_payment",
    price: 25900000,
    image: "https://picsum.photos/seed/iphone/200",
  },
  {
    id: "ORD015",
    title: "Túi xách da cao cấp",
    date: "2025-10-21",
    status: "out_dated",
    price: 1850000,
    image: "https://picsum.photos/seed/bag/200",
  },
];

export default function UserPosts() {
  const ctx = useOutletContext<ContextType>();
  const [activeTab, setActiveTab] = useState(orderTabs[0].id);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const filteredOrders = mockOrders.filter((o) => o.status === activeTab);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  return (
    <div className="bg-[#F7F9F9] rounded-2xl shadow-lg overflow-hidden border border-[#A8E6CF]/50">
      {/* Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-[#2ECC71] via-[#A8E6CF] to-[#F7F9F9] border-b border-[#A8E6CF]/50">
        <div className="flex items-center justify-between">
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
      </div>

      {/* Tabs */}
      <div className="bg-[#F7F9F9] border-b border-[#A8E6CF]/60">
        <div className="flex flex-wrap justify-between p-2 sm:p-3 gap-2">
          {orderTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 text-center py-3 text-sm font-medium rounded-lg transition-all duration-300
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
      </div>

      {/* Content */}
      <div className="p-6">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-[#A8E6CF]/60 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <PenSquare className="w-10 h-10 text-[#2ECC71]" />
            </div>
            <h3 className="text-xl font-semibold text-[#2C3E50] mb-2">
              Chưa có tin nào
            </h3>
            <p className="text-[#2C3E50]/60 text-sm mb-6">
              Bạn chưa có tin ở trạng thái này.
            </p>
            <Link
              to="/dang-tin"
              className="bg-[#2ECC71] hover:bg-[#29b765] text-white px-6 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
            >
              Đăng tin ngay
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {paginatedOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row gap-4 items-start sm:items-center border border-[#A8E6CF]/40 rounded-xl p-4 hover:shadow-md bg-white transition-all"
                >
                  <img
                    src={order.image}
                    alt={order.title}
                    className="w-28 h-28 object-cover rounded-lg border border-[#A8E6CF]/40"
                  />
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-[#2C3E50] mb-1">
                      {order.title}
                    </h4>
                    <p className="text-sm text-[#2C3E50]/70">
                      Mã tin:{" "}
                      <span className="font-medium text-[#2C3E50]">
                        {order.id}
                      </span>
                    </p>
                    <p className="text-sm text-[#2C3E50]/70">
                      Ngày đăng:{" "}
                      {new Date(order.date).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#2ECC71] font-semibold text-lg">
                      {order.price.toLocaleString("vi-VN")} ₫
                    </p>
                    <p className="text-[#2C3E50]/60 text-sm mt-1">
                      {orderTabs.find((t) => t.id === order.status)?.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="px-3 py-1 text-sm rounded-md border border-[#A8E6CF]/70 text-[#2C3E50] hover:bg-[#A8E6CF]/40 disabled:opacity-50"
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm rounded-md border ${
                        currentPage === page
                          ? "bg-[#2ECC71] text-white border-[#2ECC71]"
                          : "border-[#A8E6CF]/70 text-[#2C3E50] hover:bg-[#A8E6CF]/40"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="px-3 py-1 text-sm rounded-md border border-[#A8E6CF]/70 text-[#2C3E50] hover:bg-[#A8E6CF]/40 disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
