import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
// ✅ FIX: Removed unused UpdateUserRequest import
import {
  UserService,
  type User,
} from "../../services/User/UserService";
import { locationService, type Province, type District, type Ward } from "../../services/locationService";
import { Loader2 } from "lucide-react";

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
    // street: "", // Street is not a direct field in the new User model, handled by address components
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
      setDistricts([]);
      setWards([]);
    }
  }, [formData.provinceCode]);

  // Load wards when district changes
  useEffect(() => {
    if (formData.districtCode) {
      loadWards(formData.districtCode);
    } else {
      setWards([]);
    }
  }, [formData.districtCode]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      // ✅ FIX: Use the new getMyInfo service function
      const userData = await UserService.getMyInfo();
      setUser(userData);

      // Populate form with existing data
      const initialData = {
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        provinceCode: userData.provinceCode || 0,
        districtCode: userData.districtCode || 0,
        wardCode: userData.wardCode || 0,
        bio: userData.bio || "",
      };

      setFormData(initialData);

      // Load location data based on existing codes
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
    } catch {
      toast.error("Không thể tải danh sách phường/xã");
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("Không tìm thấy thông tin người dùng");
      return;
    }

    // Validation (remains the same)
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast.error("Vui lòng điền đầy đủ họ, tên và email.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Email không hợp lệ");
      return;
    }

    setSaving(true);

    try {
      // ✅ FIX: Create a Partial<User> object for the update
      const updateData: Partial<User> = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        provinceCode: formData.provinceCode,
        districtCode: formData.districtCode,
        wardCode: formData.wardCode,
        bio: formData.bio.trim(),
      };

      // ✅ FIX: Use the new updateMyInfo service function
      const updatedUser = await UserService.updateMyInfo(updateData);
      setUser(updatedUser);

      toast.success("Cập nhật thông tin thành công!");

      if (onSave) {
        onSave();
      }
    } catch (error: any) {
      console.error("❌ Error updating user:", error);
      toast.error(error.response?.data?.message || "Không thể cập nhật thông tin.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    loadUserData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="animate-spin h-12 w-12 text-[#2ECC71]" />
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-10">
        {/* Header */}
        <div className="border-b border-gray-100 px-8 py-6 bg-gradient-to-r from-green-50 to-white">
          <h2 className="text-2xl font-semibold text-gray-800">
            Hồ sơ cá nhân
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Quản lý thông tin cá nhân và địa chỉ của bạn.
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-10">
          {/* Basic Info */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Thông tin cơ bản
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ
                </label>
                <input
                  type="text"
                  placeholder="Nhập họ"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full rounded-lg px-3 py-2.5 text-sm border border-gray-300 focus:ring-2 focus:ring-[#2ECC71] focus:border-[#2ECC71]"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full rounded-lg px-3 py-2.5 text-sm border border-gray-300 focus:ring-2 focus:ring-[#2ECC71] focus:border-[#2ECC71]"
                />
              </div>
            </div>

            {/* Phone (Read-only) */}
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="text"
                value={user?.phone || ""}
                readOnly
                disabled
                className="w-full rounded-lg px-3 py-2.5 text-sm bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
              />
            </div>

            {/* Username (Read-only) */}
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={user?.username || ""}
                readOnly
                disabled
                className="w-full rounded-lg px-3 py-2.5 text-sm bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
              />
            </div>
          </section>

          {/* Address */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Địa chỉ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
              {/* Province */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tỉnh/Thành phố
                </label>
                <select
                  value={formData.provinceCode || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      provinceCode: parseInt(e.target.value) || 0,
                      districtCode: 0, // Reset district on province change
                      wardCode: 0,     // Reset ward on province change
                    })
                  }
                  disabled={loadingLocation}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#2ECC71] focus:border-[#2ECC71] disabled:bg-gray-100"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quận/Huyện
                </label>
                <select
                  value={formData.districtCode || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      districtCode: parseInt(e.target.value) || 0,
                      wardCode: 0, // Reset ward on district change
                    })
                  }
                  disabled={loadingLocation || !formData.provinceCode}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#2ECC71] focus:border-[#2ECC71] disabled:bg-gray-100"
                >
                  <option value="">
                    {!formData.provinceCode
                      ? "Chọn tỉnh trước"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#2ECC71] focus:border-[#2ECC71] disabled:bg-gray-100"
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
          </section>

          {/* Bio */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Giới thiệu
            </h3>
            <div>
              <textarea
                rows={3}
                placeholder="Viết đôi dòng giới thiệu về bạn..."
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                maxLength={500}
                className="w-full rounded-lg px-3 py-2.5 text-sm border border-gray-300 resize-none focus:ring-2 focus:ring-[#2ECC71]"
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {formData.bio.length}/500
              </p>
            </div>
          </section>

          {/* Security */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Thông tin bảo mật
            </h3>
            <div className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full rounded-lg px-3 py-2.5 text-sm border border-gray-300 focus:ring-2 focus:ring-[#2ECC71] focus:border-[#2ECC71]"
                />
              </div>
            </div>
          </section>

          {/* Save Buttons */}
          <div className="pt-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="bg-gray-200 text-gray-800 text-sm font-medium px-8 py-2.5 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#2ECC71] text-white text-sm font-medium px-8 py-2.5 rounded-lg shadow hover:bg-[#27AE60] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
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
