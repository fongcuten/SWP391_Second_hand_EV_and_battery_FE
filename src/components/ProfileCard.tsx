import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Loader2, Crown, Calendar } from "lucide-react";
import { toast } from "react-toastify";
import { userService, type User } from "../services/User/UserService";

// ===== UTILITIES =====

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

function getFullName(user: User | null): string {
  if (!user) return "Người dùng";
  const firstName = user.firstName?.trim() || "";
  const lastName = user.lastName?.trim() || "";
  return `${firstName} ${lastName}`.trim() || user.username || "Người dùng";
}

function getInitial(user: User | null): string {
  const fullName = getFullName(user);
  return fullName.charAt(0).toUpperCase();
}

// ===== MENU ITEMS =====

const MENU_ITEMS = [
  { label: "Quản lý tin", to: "/ho-so/posts", icon: "📄" },
  { label: "Tin đăng đã lưu", to: "/ho-so/saved-post", icon: "🧾" },
  { label: "Nạp tiền", to: "/ho-so/topup", icon: "💳" },
  { label: "Đánh giá từ tôi", to: "/ho-so/invoices", icon: "💬" },
  { label: "Lịch sử giao dịch", to: "/ho-so/transactions", icon: "🕒" },
  { label: "Thông tin cá nhân", to: "/ho-so/info", icon: "👤" },
  { label: "Đổi mật khẩu", to: "/ho-so/change-password", icon: "🔒" },
];

// ===== MAIN COMPONENT =====

export default function ProfileCard() {
  const location = useLocation();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ===== DATA LOADING =====

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const userData = await userService.getCurrentUser();
      setUser(userData);
    } catch (error: any) {
      console.error("❌ Error loading user:", error);
      toast.error("Không thể tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  // ===== UTILITIES =====

  const getPlanBadge = () => {
    if (!user?.plan) return null;

    const isPremium = user.plan.name.toLowerCase().includes("premium");

    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isPremium
          ? "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300"
          : "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300"
        }`}>
        {isPremium && <Crown className="w-3 h-3" />}
        {user.plan.name}
      </div>
    );
  };

  // ===== RENDER =====

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Profile Header */}
      <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md ring-2 ring-green-200">
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-4xl font-bold bg-gradient-to-br from-green-100 to-green-200">
                {getInitial(user)}
              </div>
            </div>
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            {/* Name */}
            <h2 className="text-xl font-semibold text-gray-900 truncate">
              {getFullName(user)}
            </h2>

            {/* Member Since */}
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Thành viên từ {user?.createdAt ? elapsedSince(user.createdAt) : "—"}</span>
            </div>

            {/* Current Plan */}
            <div className="mt-3">
              {user?.plan ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Gói hiện tại:</span>
                  {getPlanBadge()}
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  <span>Gói miễn phí</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 text-gray-500 text-xs uppercase font-semibold tracking-wider">
          Quản lý tài khoản
        </div>
        <ul className="text-sm">
          {MENU_ITEMS.map((item) => {
            const active = location.pathname === item.to;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`flex items-center gap-3 px-5 py-3 transition-all relative group ${active
                      ? "bg-gradient-to-r from-green-50 to-green-100 text-green-700 font-medium"
                      : "hover:bg-gray-50"
                    }`}
                >
                  <div
                    className={`flex items-center justify-center w-9 h-9 rounded-full shadow-inner backdrop-blur-sm ${active
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                      } transition-all duration-200`}
                  >
                    {item.icon}
                  </div>
                  <span className="flex-1">{item.label}</span>
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
