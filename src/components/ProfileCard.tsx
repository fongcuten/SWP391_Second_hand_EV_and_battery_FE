import React from "react";
import { Link, useLocation } from "react-router-dom";

export type UserType = any;

function elapsedSince(dateStr: string | number | Date) {
  try {
    const then = new Date(dateStr);
    const now = new Date();
    const years = now.getFullYear() - then.getFullYear();
    const months = (now.getMonth() - then.getMonth()) + years * 12;
    if (months <= 0) return "Vừa mới";
    const y = Math.floor(months / 12);
    const m = months % 12;
    return (y ? `${y} năm${m ? " " : ""}` : "") + (m ? `${m} tháng` : "");
  } catch {
    return "—";
  }
}

export default function ProfileCard({ user }: { user: UserType }) {
  const location = useLocation();

  const menu = [
    { label: "Quản lý tin", to: "/ho-so/posts", icon: "📄" },
    { label: "Tin đăng đã lưu", to: "/ho-so/saved-post", icon: "🧾" },
    { label: "Chat của tôi", to: "/ho-so/chat", icon: "🔒" },
    { label: "Nạp tiền", to: "/ho-so/topup", icon: "💳" },
    { label: "Đánh giá từ tôi", to: "/ho-so/invoices", icon: "💬" },
    { label: "Lịch sử giao dịch", to: "/ho-so/transactions", icon: "🕒" },
    { label: "Thông tin cá nhân", to: "/ho-so/info", icon: "👤" },
    { label: "Đổi mật khẩu", to: "/ho-so/change-password", icon: "🔒" },
  ];

  return (
    <div className="space-y-5">
      {/* Profile Header */}
      <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md ring-2 ring-green-200">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-4xl font-bold bg-gray-100">
                  {(user?.fullName || "U").charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">{user?.fullName || "Tên chưa cung cấp"}</h2>
            <p className="text-gray-500 text-sm">Thành viên từ {user?.joinedAt ? elapsedSince(user.joinedAt) : "—"}</p>
            <div className="mt-2 flex gap-4 text-sm text-gray-600">
              <span>👥 <strong>{user?.followers ?? 0}</strong> người theo dõi</span>
              <span>🫱 <strong>{user?.following ?? 0}</strong> đang theo dõi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      {/* <div className="bg-white rounded-2xl shadow p-5 border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 tracking-wide">Thông tin nhanh</h3>
        <ul className="divide-y divide-gray-100 text-sm text-gray-700">
          <li className="py-2 flex items-start gap-3">
            <span className="text-gray-400 mt-1">💬</span>
            <div>
              <div className="text-gray-500 text-xs">Phản hồi chat</div>
              <div>Chưa có thông tin</div>
            </div>
          </li>
          <li className="py-2 flex items-start gap-3">
            <span className="text-gray-400 mt-1">✅</span>
            <div>
              <div className="text-gray-500 text-xs">Xác thực</div>
              <div>
                {user?.verifiedEmail || user?.verifiedPhone || user?.verifiedId ? (
                  <>
                    {user?.verifiedEmail && <span className="mr-2">✉️ Email</span>}
                    {user?.verifiedPhone && <span className="mr-2">📱 SĐT</span>}
                    {user?.verifiedId && <span>🪪 CCCD</span>}
                  </>
                ) : (
                  <span>Chưa xác thực</span>
                )}
              </div>
            </div>
          </li>
          <li className="py-2 flex items-start gap-3">
            <span className="text-gray-400 mt-1">📍</span>
            <div>
              <div className="text-gray-500 text-xs">Địa chỉ</div>
              <div>{user?.address || "Chưa cung cấp"}</div>
            </div>
          </li>
        </ul>
      </div> */}

      {/* Navigation Menu */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 text-gray-500 text-xs uppercase font-semibold tracking-wider">
          Quản lý tài khoản
        </div>
        <ul className="text-sm">
          {menu.map((m) => {
            const active = location.pathname === m.to;
            return (
              <li key={m.to}>
                <Link
                  to={m.to}
                  className={`flex items-center gap-3 px-5 py-3 transition-all relative group ${active
                      ? "bg-gradient-to-r from-green-50 to-green-100 text-green-700 font-medium"
                      : "hover:bg-gray-50"
                    }`}
                >
                  <div
                    className={`flex items-center justify-center w-9 h-9 rounded-full shadow-inner backdrop-blur-sm ${active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                      } transition-all duration-200`}
                  >
                    {m.icon}
                  </div>
                  <span className="flex-1">{m.label}</span>
                  <span
                    className={`opacity-0 group-hover:opacity-100 translate-x-1 transition-all ${active ? "opacity-100 text-green-500" : "text-gray-400"
                      }`}
                  >
                    ➜
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
