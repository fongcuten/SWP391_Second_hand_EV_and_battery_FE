import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Loader2, Crown, Calendar, Upload, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { UserService, type User } from "../services/User/UserService";

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
  { label: "Quản lý trả giá", to: "/ho-so/offers", icon: "💸" },
  { label: "Quản lý deal", to: "/ho-so/deals", icon: "💳" },
  { label: "Tin đăng đã lưu", to: "/ho-so/saved-post", icon: "🧾" },
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
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ===== DATA LOADING =====

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const userData = await UserService.getMyInfo();
      setUser(userData);
    } catch (error: any) {
      console.error("❌ Error loading user:", error);
      toast.error("Không thể tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  // ===== AVATAR ACTIONS =====

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAvatarUploading(true);
    try {
      // The API call is made to update the avatar on the server.
      await UserService.uploadAvatar(file);

      // The setUser call is removed. The component's state is not updated.
      // The UI will not re-render with the new image.

      toast.success("Cập nhật ảnh đại diện thành công! Tải lại trang để xem thay đổi.");
    } catch (error) {
      console.error("❌ [AVATAR_UPLOAD] Error uploading avatar:", error);
      toast.error("Không thể tải lên ảnh đại diện.");
    } finally {
      setIsAvatarUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user?.avatarUrl) return;

    setIsAvatarUploading(true);
    try {
      // The API call is made to delete the avatar on the server.
      await UserService.deleteAvatar();

      // The setUser call is removed. The component's state is not updated.
      // The UI will not re-render.

      toast.success("Đã xóa ảnh đại diện. Tải lại trang để xem thay đổi.");
    } catch (error) {
      console.error("❌ [AVATAR_DELETE] Error deleting avatar:", error);
      toast.error("Không thể xóa ảnh đại diện.");
    } finally {
      setIsAvatarUploading(false);
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
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 flex flex-row gap-6 items-center">
        {/* Avatar + Upload (buttons inside image holder, bottom center) */}
        <div className="relative flex-shrink-0 group">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md ring-2 ring-green-200">
            {user?.avatarThumbUrl ? (
              <img
                src={user.avatarThumbUrl}
                alt={getFullName(user)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-4xl font-bold bg-gradient-to-br from-green-100 to-green-200">
                {getInitial(user)}
              </div>
            )}
          </div>
          <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />

          {/* Avatar Actions Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
            {isAvatarUploading ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : (
              <>
                <button
                  onClick={handleUploadClick}
                  className="w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-gray-700 transition"
                  title="Tải ảnh mới"
                >
                  <Upload className="w-5 h-5" />
                </button>
                {user?.avatarUrl && (
                  <button
                    onClick={handleDeleteAvatar}
                    className="w-10 h-10 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition"
                    title="Xóa ảnh"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg, image/gif"
          />
        </div>
        {/* User Info */}
        <div className="flex-1 min-w-0 pl-6">
          <h2 className="text-2xl font-semibold text-gray-900">{getFullName(user)}</h2>
          <div className="text-sm text-gray-500 mt-1">@{user?.username || "—"}</div>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>
              Ngày đăng ký:{" "}
              <span className="text-gray-800 font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
              </span>
            </span>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500">Email</div>
              <div className="text-sm text-gray-800">{user?.email || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Số điện thoại</div>
              <div className="text-sm text-gray-800">{user?.phone || "—"}</div>
            </div>
          </div>
        </div>
      </div>
      {/* Plan Info Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Thông tin gói</h3>
            <p className="text-sm text-gray-500 mt-1">Thời hạn và quota của gói hiện tại</p>
          </div>
          <div>{getPlanBadge() || <span className="text-xs text-gray-500">Free</span>}</div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-md flex flex-col items-center">
            <div className="text-xs text-gray-500">Quota còn lại</div>
            <div className="text-xl font-semibold text-gray-900">{user?.quotaRemaining ?? 0}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-md flex flex-col items-center">
            <div className="text-xs text-gray-500">Thời gian bắt đầu</div>
            <div className="text-sm text-gray-800">{user?.startAt ? new Date(user.startAt).toLocaleDateString() : "—"}</div>
            <div className="mt-2 text-xs text-gray-500">Thời gian kết thúc</div>
            <div className="text-sm text-gray-800">{user?.endAt ? new Date(user.endAt).toLocaleDateString() : "—"}</div>
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
