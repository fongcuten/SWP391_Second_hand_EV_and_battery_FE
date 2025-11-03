import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  userService,
  type User,
  type UpdateUserRequest,
} from "../../services/User/UserService";
import { locationService, type Province, type District, type Ward } from "../../services/locationService";

interface UserInfoFormProps {
  onSave?: () => void;
}

const UserInfoForm: React.FC<UserInfoFormProps> = ({ onSave }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    provinceCode: 0,
    districtCode: 0,
    wardCode: 0,
    street: "", // ✅ Added street field
    bio: "",
  });

  // Location State
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Load user data and provinces on mount
  useEffect(() => {
    loadUserData();
    loadProvinces();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (formData.provinceCode) {
      loadDistricts(formData.provinceCode);
    } else {
      resetDistricts();
    }
  }, [formData.provinceCode]);

  // Load wards when district changes
  useEffect(() => {
    if (formData.districtCode) {
      loadWards(formData.districtCode);
    } else {
      resetWards();
    }
  }, [formData.districtCode]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = await userService.getCurrentUser();
      setUser(userData);

      // Populate form with existing data
      const initialData = {
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        provinceCode: userData.provinceCode || 0,
        districtCode: userData.districtCode || 0,
        wardCode: userData.wardCode || 0,
        street: userData.street || "", // ✅ Load street from user data
        bio: userData.bio || "",
      };

      setFormData(initialData);

      // ✅ Load location data based on existing codes
      if (userData.provinceCode) {
        await loadDistricts(userData.provinceCode);
      }
      if (userData.districtCode) {
        await loadWards(userData.districtCode);
      }
    } catch (error) {
      console.error("❌ Error loading user data:", error);
      toast.error("Không thể tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  const loadProvinces = async () => {
    setLoadingLocation(true);
    try {
      const data = await locationService.getProvinces();
      setProvinces(data);
    } catch {
      toast.error("Không thể tải danh sách tỉnh/thành phố");
    } finally {
      setLoadingLocation(false);
    }
  };

  const loadDistricts = async (provinceCode: number) => {
    setLoadingLocation(true);
    try {
      const data = await locationService.getDistricts(provinceCode);
      setDistricts(data);
      // ✅ Only reset if user is changing province (not on initial load)
      if (formData.provinceCode !== provinceCode) {
        setFormData(prev => ({ ...prev, districtCode: 0, wardCode: 0 }));
      }
    } catch {
      toast.error("Không thể tải danh sách quận/huyện");
    } finally {
      setLoadingLocation(false);
    }
  };

  const loadWards = async (districtCode: number) => {
    setLoadingLocation(true);
    try {
      const data = await locationService.getWards(districtCode);
      setWards(data);
      // ✅ Only reset if user is changing district (not on initial load)
      if (formData.districtCode !== districtCode) {
        setFormData(prev => ({ ...prev, wardCode: 0 }));
      }
    } catch {
      toast.error("Không thể tải danh sách phường/xã");
    } finally {
      setLoadingLocation(false);
    }
  };

  const resetDistricts = () => {
    setDistricts([]);
    setWards([]);
  };

  const resetWards = () => {
    setWards([]);
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("Không tìm thấy thông tin người dùng");
      return;
    }

    // Validation
    if (!formData.firstName.trim()) {
      toast.error("Vui lòng nhập họ");
      return;
    }

    if (!formData.lastName.trim()) {
      toast.error("Vui lòng nhập tên");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Vui lòng nhập email");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Email không hợp lệ");
      return;
    }

    setSaving(true);

    try {
      const updateData: UpdateUserRequest = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        provinceCode: formData.provinceCode,
        districtCode: formData.districtCode,
        wardCode: formData.wardCode,
        street: formData.street.trim(),
        bio: formData.bio.trim(),
      };

      const updatedUser = await userService.updateUser(user.userId, updateData);
      setUser(updatedUser);

      // ✅ Update localStorage current_user
      const currentUserStr = localStorage.getItem("current_user");
      if (currentUserStr) {
        try {
          const currentUser = JSON.parse(currentUserStr);
          
          // ✅ Merge updated data
          const updatedLocalUser = {
            ...currentUser,
            email: updatedUser.email,
            fullName: `${updatedUser.firstName} ${updatedUser.lastName}`.trim(),
            phoneNumber: updatedUser.phone,
            // Keep other fields like id, role, createdAt
          };

          console.log("✅ Updating localStorage user:", updatedLocalUser);
          localStorage.setItem("current_user", JSON.stringify(updatedLocalUser));
        } catch (err) {
          console.error("❌ Error updating localStorage user:", err);
        }
      }

      toast.success("Cập nhật thông tin thành công!");

      if (onSave) {
        onSave();
      }
    } catch (error: any) {
      console.error("❌ Error updating user:", error);

      if (error.response?.status === 400) {
        toast.error(error.response.data?.message || "Thông tin không hợp lệ");
      } else if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      } else if (error.response?.status === 403) {
        toast.error("Bạn không có quyền cập nhật thông tin này");
      } else {
        toast.error("Không thể cập nhật thông tin. Vui lòng thử lại.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    loadUserData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2ECC71]"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-10">
        {/* Header */}
        <div className="border-b border-gray-100 px-8 py-6 bg-gradient-to-r from-[#A8E6CF] to-white">
          <h2 className="text-2xl font-semibold text-[#2C3E50]">
            Hồ sơ cá nhân
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Quản lý thông tin cá nhân, địa chỉ và bảo mật tài khoản của bạn
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-10">
          {/* Thông tin cơ bản */}
          <section>
            <h3 className="text-lg font-semibold text-[#2C3E50] mb-4">
              Thông tin cơ bản
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-[#2C3E50] mb-1">
                  Họ
                </label>
                <div className="border border-gray-300 rounded-lg">
                  <input
                    type="text"
                    placeholder="Nhập họ"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none border border-gray-300 focus:ring-2 focus:ring-[#2ECC71] focus:border-[#2ECC71] bg-white text-[#2C3E50]"
                  />
                </div>
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-[#2C3E50] mb-1">
                  Tên
                </label>
                <div className="border border-gray-300 rounded-lg">
                  <input
                    type="text"
                    placeholder="Nhập tên"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none border border-gray-300 focus:ring-2 focus:ring-[#2ECC71] focus:border-[#2ECC71] bg-white text-[#2C3E50]"
                  />
                </div>
              </div>
            </div>

            {/* Phone (Read-only) */}
            <div className="mt-5">
              <label className="block text-sm font-medium text-[#2C3E50] mb-1">
                Số điện thoại
              </label>
              <div className="border border-gray-300 rounded-lg">
                <input
                  type="text"
                  value={user?.phone || ""}
                  readOnly
                  disabled
                  className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-300 opacity-75"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Số điện thoại không thể thay đổi
              </p>
            </div>

            {/* Username (Read-only) */}
            <div className="mt-5">
              <label className="block text-sm font-medium text-[#2C3E50] mb-1">
                Tên đăng nhập
              </label>
              <div className="border border-gray-300 rounded-lg">
                <input
                  type="text"
                  value={user?.username || ""}
                  readOnly
                  disabled
                  className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-300 opacity-75"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Tên đăng nhập không thể thay đổi
              </p>
            </div>
          </section>

          {/* Địa chỉ */}
          <section>
            <h3 className="text-lg font-semibold text-[#2C3E50] mb-4">
              Địa chỉ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
              {/* Province */}
              <div>
                <label className="block text-sm font-medium text-[#2C3E50] mb-1">
                  Tỉnh/Thành phố
                </label>
                <select
                  value={formData.provinceCode || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      provinceCode: parseInt(e.target.value) || 0,
                    })
                  }
                  disabled={loadingLocation}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-[#2ECC71] bg-white text-[#2C3E50] disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Chọn tỉnh/thành phố</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-sm font-medium text-[#2C3E50] mb-1">
                  Quận/Huyện
                </label>
                <select
                  value={formData.districtCode || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      districtCode: parseInt(e.target.value) || 0,
                    })
                  }
                  disabled={loadingLocation || !formData.provinceCode}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-[#2ECC71] bg-white text-[#2C3E50] disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!formData.provinceCode
                      ? "Chọn tỉnh/thành phố trước"
                      : "Chọn quận/huyện"}
                  </option>
                  {districts.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ward */}
              <div>
                <label className="block text-sm font-medium text-[#2C3E50] mb-1">
                  Phường/Xã
                </label>
                <select
                  value={formData.wardCode || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      wardCode: parseInt(e.target.value) || 0,
                    })
                  }
                  disabled={loadingLocation || !formData.districtCode}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-[#2ECC71] bg-white text-[#2C3E50] disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!formData.districtCode
                      ? "Chọn quận/huyện trước"
                      : "Chọn phường/xã"}
                  </option>
                  {wards.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ✅ Street Address Input */}
            <div>
              <label className="block text-sm font-medium text-[#2C3E50] mb-1">
                Địa chỉ chi tiết
              </label>
              <input
                type="text"
                placeholder="Số nhà, tên đường..."
                value={formData.street}
                onChange={(e) =>
                  setFormData({ ...formData, street: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-[#2ECC71] bg-white text-[#2C3E50]"
              />
            </div>
          </section>

          {/* Giới thiệu */}
          <section>
            <h3 className="text-lg font-semibold text-[#2C3E50] mb-4">
              Giới thiệu
            </h3>
            <div>
              <label className="block text-sm font-medium text-[#2C3E50] mb-1">
                Giới thiệu
              </label>
              <div className="border border-gray-300 rounded-lg">
                <textarea
                  rows={3}
                  placeholder="Viết đôi dòng giới thiệu về bạn hoặc cửa hàng của bạn..."
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  maxLength={500}
                  className="w-full rounded-lg px-3 py-2.5 text-sm text-[#2C3E50] placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#2ECC71]"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formData.bio.length}/500 ký tự
              </p>
            </div>
          </section>

          {/* Thông tin bảo mật */}
          <section>
            <h3 className="text-lg font-semibold text-[#2C3E50] mb-2">
              Thông tin bảo mật
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Chỉ bạn có thể xem và chỉnh sửa các thông tin này.
            </p>

            <div className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#2C3E50] mb-1">
                  Email
                </label>
                <div className="border border-gray-300 rounded-lg">
                  <input
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none border border-gray-300 focus:ring-2 focus:ring-[#2ECC71] focus:border-[#2ECC71] bg-white text-[#2C3E50]"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Save Buttons */}
          <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="bg-gray-200 text-gray-700 text-sm font-medium px-8 py-2.5 rounded-lg hover:bg-gray-300 transition-all disabled:opacity-50"
            >
              Hủy thay đổi
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#2ECC71] text-white text-sm font-medium px-8 py-2.5 rounded-lg shadow hover:bg-[#27AE60] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang lưu...</span>
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoForm;
