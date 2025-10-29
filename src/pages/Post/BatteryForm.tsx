import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  locationService,
  type Province,
  type District,
  type Ward,
} from "../../services/locationService";
import { brandService, type Brand, type Model } from "../../services/Post/BrandService";
import { createSalePost, type CreateSalePostPayload } from "../../services/Post/SalePostService";
import { UserSubscriptionService, type UserSubscription } from "../../services/User/UserSubscriptionService";
import { Loader2, CheckCircle, Crown, Award, Star, Info } from "lucide-react";

interface BatterySalePostFormData {
  // Thông tin cơ bản
  product_type: "battery";
  brandId: number | null;
  modelId: number | null;

  // Thông tin kỹ thuật pin
  chemistryName: string;
  capacityKwh: number;
  sohPercent: number;
  cycleCount: number;

  // Thông tin bán hàng
  ask_price: number;
  title: string;
  description: string;

  // Địa chỉ
  province_code: number | null;
  district_code: number | null;
  ward_code: number | null;
  street: string;
}

const CreateBatteryPost: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<BatterySalePostFormData>({
    product_type: "battery",
    brandId: null,
    modelId: null,
    chemistryName: "Li-ion",
    capacityKwh: 0,
    sohPercent: 100,
    cycleCount: 0,
    ask_price: 0,
    title: "",
    description: "",
    province_code: null,
    district_code: null,
    ward_code: null,
    street: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Location states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // Brand/Model states
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  // User subscription state
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  // Load user subscription on mount
  useEffect(() => {
    const loadUserSubscription = async () => {
      setLoadingSubscription(true);
      try {
        const subscription = await UserSubscriptionService.getCurrentSubscription();
        setUserSubscription(subscription);
        console.log("✅ User subscription loaded:", subscription);
      } catch (error) {
        console.error("❌ Error loading subscription:", error);
        setUserSubscription({
          planId: 1,
          planName: "Free",
          price: 0,
          status: "ACTIVE",
          startAt: new Date().toISOString(),
          endAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        });
      } finally {
        setLoadingSubscription(false);
      }
    };
    loadUserSubscription();
  }, []);

  // Load provinces on component mount
  useEffect(() => {
    const loadProvinces = async () => {
      setLoading(true);
      try {
        const provincesData = await locationService.getProvinces();
        setProvinces(provincesData);
      } catch (error) {
        console.error("Error loading provinces:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProvinces();
  }, []);

  // Load brands on component mount
  useEffect(() => {
    const loadBrands = async () => {
      setLoadingBrands(true);
      try {
        const brandsData = await brandService.getAllBrands();
        setBrands(brandsData);
        console.log("✅ Loaded brands:", brandsData);
      } catch (error) {
        console.error("❌ Error loading brands:", error);
      } finally {
        setLoadingBrands(false);
      }
    };
    loadBrands();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (formData.province_code) {
      const loadDistricts = async () => {
        setLoading(true);
        try {
          const districtsData = await locationService.getDistricts(
            formData.province_code!
          );
          setDistricts(districtsData);
          setWards([]);
          setFormData((prev) => ({
            ...prev,
            district_code: null,
            ward_code: null,
          }));
        } catch (error) {
          console.error("Error loading districts:", error);
        } finally {
          setLoading(false);
        }
      };
      loadDistricts();
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [formData.province_code]);

  // Load wards when district changes
  useEffect(() => {
    if (formData.district_code) {
      const loadWards = async () => {
        setLoading(true);
        try {
          const wardsData = await locationService.getWards(
            formData.district_code!
          );
          setWards(wardsData);
          setFormData((prev) => ({ ...prev, ward_code: null }));
        } catch (error) {
          console.error("Error loading wards:", error);
        } finally {
          setLoading(false);
        }
      };
      loadWards();
    } else {
      setWards([]);
    }
  }, [formData.district_code]);

  // Load models when brand changes
  useEffect(() => {
    if (formData.brandId) {
      const loadModels = async () => {
        setLoadingModels(true);
        try {
          const modelsData = await brandService.getModelsByBrand(formData.brandId!);
          setModels(modelsData);
          setFormData((prev) => ({ ...prev, modelId: null }));
          console.log("✅ Loaded models for brand:", formData.brandId, modelsData);
        } catch (error) {
          console.error("❌ Error loading models:", error);
        } finally {
          setLoadingModels(false);
        }
      };
      loadModels();
    } else {
      setModels([]);
    }
  }, [formData.brandId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const selected = Array.from(files);
    const total = [...images, ...selected];
    if (total.length > 10) {
      alert("Tối đa 10 hình ảnh!");
      return;
    }
    setImages(total);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "capacityKwh" ||
          name === "sohPercent" ||
          name === "cycleCount" ||
          name === "ask_price" ||
          name === "province_code" ||
          name === "district_code" ||
          name === "ward_code" ||
          name === "brandId" ||
          name === "modelId"
          ? Number(value) || null
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (images.length < 4) {
      alert("Vui lòng tải lên ít nhất 4 hình ảnh!");
      return;
    }
    if (!formData.province_code || !formData.district_code || !formData.ward_code) {
      alert("Vui lòng chọn đầy đủ thông tin địa chỉ!");
      return;
    }
    if (!formData.title.trim()) {
      alert("Vui lòng nhập tiêu đề tin đăng!");
      return;
    }
    if (!formData.brandId || !formData.modelId) {
      alert("Vui lòng chọn hãng pin và mẫu pin!");
      return;
    }
    if (formData.capacityKwh <= 0) {
      alert("Vui lòng nhập dung lượng pin hợp lệ!");
      return;
    }
    if (formData.sohPercent < 0 || formData.sohPercent > 100) {
      alert("Tình trạng pin (SOH) phải từ 0-100%!");
      return;
    }

    try {
      setSubmitting(true);

      // Get priority level from user subscription plan
      const priorityLevel = userSubscription
        ? UserSubscriptionService.getPriorityFromPlan(userSubscription.planName)
        : 1;

      const payload: CreateSalePostPayload = {
        productType: "BATTERY",
        askPrice: formData.ask_price,
        title: formData.title,
        description: formData.description,
        provinceCode: formData.province_code,
        districtCode: formData.district_code,
        wardCode: formData.ward_code,
        street: formData.street,
        priorityLevel: priorityLevel,
        battery: {
          modelId: formData.modelId!,
          chemistryName: formData.chemistryName,
          capacityKwh: formData.capacityKwh,
          sohPercent: formData.sohPercent,
          cycleCount: formData.cycleCount,
        },
      };

      console.log("📤 Submitting battery post with plan:", userSubscription?.planName);
      console.log("📤 Priority level:", priorityLevel);
      console.log("📤 Submitting payload:", JSON.stringify(payload, null, 2));
      console.log("📸 Files to upload:", images.length);

      const response = await createSalePost(payload, images);

      console.log("✅ Battery post created successfully:", response);

      alert(`Đăng tin thành công! 🎉\n\nMã tin: ${response.result.listingId}`);
      navigate(`/ho-so/posts`);
    } catch (error: any) {
      console.error("❌ Error creating battery post:", error);
      console.error("❌ Error response:", error.response?.data);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Có lỗi xảy ra khi đăng tin. Vui lòng thử lại!";

      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Get subscription badge component
  const getSubscriptionBadge = () => {
    if (!userSubscription) return null;

    const tier = UserSubscriptionService.getSubscriptionTier(userSubscription.planName);

    const badges = {
      PREMIUM: {
        icon: Crown,
        bg: "bg-gradient-to-r from-yellow-400 to-orange-500",
        text: "text-white",
        label: userSubscription.planName.toUpperCase(),
      },
      STANDARD: {
        icon: Award,
        bg: "bg-gradient-to-r from-blue-500 to-purple-500",
        text: "text-white",
        label: userSubscription.planName.toUpperCase(),
      },
      FREE: {
        icon: Star,
        bg: "bg-gray-600",
        text: "text-white",
        label: userSubscription.planName.toUpperCase(),
      },
    };

    const badge = badges[tier];
    const Icon = badge.icon;

    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${badge.bg} ${badge.text} font-semibold shadow-lg`}>
        <Icon className="w-5 h-5" />
        {badge.label}
      </div>
    );
  };

  if (loadingSubscription) {
    return (
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-md border border-gray-200">
        <div className="text-center py-10">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-[#2ECC71]" />
          <p className="mt-4 text-gray-600">Đang tải thông tin gói đăng ký...</p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-md border border-gray-200 space-y-10"
    >
      {/* Title Section */}
      <section>
        <h2 className="text-xl font-semibold mb-5 text-[#2C3E50]">
          Tiêu đề tin đăng
        </h2>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Ví dụ: Pin xe điện Tesla 75kWh, tình trạng 95%, ít sử dụng"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
          required
        />
      </section>

      {/* Battery Info Section */}
      <section>
        <h2 className="text-xl font-semibold mb-5 text-[#2C3E50]">
          Thông tin pin xe điện
        </h2>

        {/* Brand / Model */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
              Hãng pin *
            </label>
            <select
              name="brandId"
              value={formData.brandId || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
              disabled={loadingBrands}
              required
            >
              <option value="">
                {loadingBrands ? "Đang tải..." : "Chọn hãng pin"}
              </option>
              {brands.map((brand) => (
                <option key={brand.brandId} value={brand.brandId}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
              Mẫu pin *
            </label>
            <select
              name="modelId"
              value={formData.modelId || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
              disabled={loadingModels || !formData.brandId}
              required
            >
              <option value="">
                {loadingModels
                  ? "Đang tải..."
                  : !formData.brandId
                    ? "Chọn hãng pin trước"
                    : "Chọn mẫu pin"}
              </option>
              {models.map((model) => (
                <option key={model.modelId} value={model.modelId}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Battery Specifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
              Công nghệ pin *
            </label>
            <select
              name="chemistryName"
              value={formData.chemistryName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
              required
            >
              <option value="Li-ion">Li-ion</option>
              <option value="LFP">LFP (LiFePO4)</option>
              <option value="NMC">NMC</option>
              <option value="NCA">NCA</option>
              <option value="LTO">LTO</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
              Dung lượng pin (kWh) *
            </label>
            <input
              type="number"
              name="capacityKwh"
              value={formData.capacityKwh}
              onChange={handleChange}
              placeholder="75.5"
              step="0.1"
              min="0.1"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
              Tình trạng pin - SOH (%) *
            </label>
            <input
              type="number"
              name="sohPercent"
              value={formData.sohPercent}
              onChange={handleChange}
              placeholder="95"
              min="0"
              max="100"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              SOH (State of Health): 0-100%
            </p>
          </div>

          <div>
            <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
              Số chu kỳ sạc *
            </label>
            <input
              type="number"
              name="cycleCount"
              value={formData.cycleCount}
              onChange={handleChange}
              placeholder="500"
              min="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
              Giá bán (VNĐ) *
            </label>
            <input
              type="number"
              name="ask_price"
              value={formData.ask_price}
              onChange={handleChange}
              placeholder="50000000"
              min="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
              required
            />
          </div>
        </div>
      </section>

      {/* Address Section */}
      <section>
        <h2 className="text-xl font-semibold mb-5 text-[#2C3E50]">Địa chỉ *</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
              Tỉnh/Thành phố *
            </label>
            <select
              name="province_code"
              value={formData.province_code || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
              disabled={loading}
              required
            >
              <option value="">Chọn tỉnh/thành phố</option>
              {provinces.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
              Quận/Huyện *
            </label>
            <select
              name="district_code"
              value={formData.district_code || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
              disabled={loading || !formData.province_code}
              required
            >
              <option value="">Chọn quận/huyện</option>
              {districts.map((district) => (
                <option key={district.code} value={district.code}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
              Phường/Xã *
            </label>
            <select
              name="ward_code"
              value={formData.ward_code || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
              disabled={loading || !formData.district_code}
              required
            >
              <option value="">Chọn phường/xã</option>
              {wards.map((ward) => (
                <option key={ward.code} value={ward.code}>
                  {ward.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
            Địa chỉ chi tiết
          </label>
          <input
            name="street"
            value={formData.street}
            onChange={handleChange}
            placeholder="Số nhà, tên đường..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
          />
        </div>
      </section>

      {/* Images Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-[#2C3E50]">
          Hình ảnh *
        </h2>
        <p className="text-sm text-gray-500 mb-3">
          Tải tối thiểu 4 hình, tối đa 10 hình (mỗi hình ≤ 6MB)
        </p>
        <div className="flex flex-wrap gap-4">
          {images.map((file, i) => (
            <div
              key={i}
              className="relative w-28 h-28 rounded-lg overflow-hidden border border-gray-200 shadow-sm"
            >
              <img
                src={URL.createObjectURL(file)}
                alt="preview"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleRemoveImage(i)}
                type="button"
                className="absolute top-1 right-1 bg-[#2C3E50]/70 text-white rounded-full px-2 py-1 text-xs hover:bg-[#2C3E50]"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-28 h-28 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-[#2ECC71] hover:text-[#2ECC71] transition rounded-lg"
          >
            +
          </button>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            ref={fileInputRef}
            className="hidden"
          />
        </div>
      </section>

      {/* Description Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-[#2C3E50]">
          Mô tả chi tiết
        </h2>
        <textarea
          name="description"
          placeholder="Mô tả chi tiết về pin: tình trạng, lịch sử sử dụng, lý do bán..."
          value={formData.description}
          onChange={handleChange}
          rows={5}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none resize-none bg-white"
        />
      </section>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="bg-[#2ECC71] text-white font-medium px-8 py-2.5 rounded-lg hover:bg-[#27AE60] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang đăng tin...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Đăng tin ({userSubscription?.planName || "Free"})
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default CreateBatteryPost;
