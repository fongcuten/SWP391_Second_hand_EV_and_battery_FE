import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  locationService,
  type Province,
  type District,
  type Ward,
} from "../../services/locationService";
import { brandService, type Brand, type Model } from "../../services/Post/BrandService";
import { createSalePost, type CreateSalePostPayload } from "../../services/Post/SalePostService";
import { PriceSuggestionService } from "../../services/AI/AIPriceService";
import { Loader2, CheckCircle, Sparkles, Info, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface SalePostFormData {
  // Thông tin cơ bản
  product_type: "vehicle";
  brandId: number | null;
  modelId: number | null;
  year: number;
  condition: string;

  // Thông tin kỹ thuật
  transmission: string[];
  fuelType: string[];
  mileage: number;
  color: string;
  seats: number;

  // Thông tin pháp lý
  licensePlate: string;
  ownerCount: number;
  registration: string;
  inspection: string;

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

const CreateVehiclePost: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SalePostFormData>({
    product_type: "vehicle",
    brandId: null,
    modelId: null,
    year: new Date().getFullYear(),
    condition: "Đã sử dụng",
    transmission: [],
    fuelType: [],
    mileage: 0,
    color: "",
    seats: 0,
    licensePlate: "",
    ownerCount: 1,
    registration: "",
    inspection: "",
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
  const [loadingPriceSuggestion, setLoadingPriceSuggestion] = useState(false);

  const [priceSuggestion, setPriceSuggestion] = useState<{
    min: number;
    max: number;
    suggested: number;
    note: string;
  } | null>(null);

  // Load provinces on component mount
  useEffect(() => {
    const loadProvinces = async () => {
      setLoading(true);
      try {
        const provincesData = await locationService.getProvinces();
        setProvinces(provincesData);
      } catch (error) {
        console.error("Error loading provinces:", error);
        toast.error("Không thể tải danh sách tỉnh/thành phố");
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
        toast.error("Không thể tải danh sách hãng xe");
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
          toast.error("Không thể tải danh sách quận/huyện");
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
          toast.error("Không thể tải danh sách phường/xã");
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
          toast.error("Không thể tải danh sách mẫu xe");
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
      toast.warning("Tối đa 10 hình ảnh!");
      return;
    }
    setImages(total);
    toast.success(`Đã thêm ${selected.length} hình ảnh`);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    toast.info("Đã xóa hình ảnh");
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
        name === "year" ||
          name === "mileage" ||
          name === "seats" ||
          name === "ownerCount" ||
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

  const handleToggle = (field: "transmission" | "fuelType", value: string) => {
    setFormData((prev) => {
      const current = prev[field];
      return {
        ...prev,
        [field]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

  const handleGetPriceSuggestion = async () => {
    // Validation
    if (!formData.province_code) {
      toast.warning("Vui lòng chọn tỉnh/thành phố trước!");
      return;
    }
    if (!formData.brandId || !formData.modelId) {
      toast.warning("Vui lòng chọn hãng xe và mẫu xe trước!");
      return;
    }
    if (!formData.year) {
      toast.warning("Vui lòng nhập năm sản xuất trước!");
      return;
    }
    if (!formData.mileage) {
      toast.warning("Vui lòng nhập số km đã đi trước!");
      return;
    }

    try {
      setLoadingPriceSuggestion(true);
      toast.info("🤖 AI đang phân tích giá thị trường...");

      // Get brand and model names
      const selectedBrand = brands.find((b) => b.brandId === formData.brandId);
      const selectedModel = models.find((m) => m.modelId === formData.modelId);

      if (!selectedBrand || !selectedModel) {
        toast.error("Không tìm thấy thông tin hãng xe hoặc mẫu xe!");
        return;
      }

      const response = await PriceSuggestionService.getVehiclePriceSuggestion({
        productType: "VEHICLE",
        provinceCode: formData.province_code,
        brand: selectedBrand.name,
        model: selectedModel.name,
        year: formData.year,
        odoKm: formData.mileage,
      });

      setPriceSuggestion({
        min: response.priceMinVND,
        max: response.priceMaxVND,
        suggested: response.suggestedPriceVND,
        note: response.note,
      });

      // Auto-fill suggested price
      setFormData((prev) => ({
        ...prev,
        ask_price: response.suggestedPriceVND,
      }));

      toast.success("✨ Đã tính toán giá đề xuất từ AI!");
      console.log("✅ Price suggestion applied:", response);
    } catch (error: any) {
      console.error("❌ Error getting price suggestion:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể lấy gợi ý giá. Vui lòng thử lại!";
      toast.error(errorMessage);
    } finally {
      setLoadingPriceSuggestion(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`;
    }
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} triệu`;
    }
    return `${price.toLocaleString("vi-VN")} đ`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (images.length < 4) {
      toast.error("Vui lòng tải lên ít nhất 4 hình ảnh!");
      return;
    }
    if (!formData.province_code || !formData.district_code || !formData.ward_code) {
      toast.error("Vui lòng chọn đầy đủ thông tin địa chỉ!");
      return;
    }
    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề tin đăng!");
      return;
    }
    if (!formData.brandId || !formData.modelId) {
      toast.error("Vui lòng chọn hãng xe và mẫu xe!");
      return;
    }
    if (formData.transmission.length === 0) {
      toast.error("Vui lòng chọn loại hộp số!");
      return;
    }
    if (formData.fuelType.length === 0) {
      toast.error("Vui lòng chọn loại nhiên liệu!");
      return;
    }

    try {
      setSubmitting(true);
      toast.info("Đang xử lý tin đăng...");

      const payload: CreateSalePostPayload = {
        productType: "VEHICLE",
        askPrice: formData.ask_price,
        title: formData.title,
        description: formData.description,
        provinceCode: formData.province_code,
        districtCode: formData.district_code,
        wardCode: formData.ward_code,
        street: formData.street,
        vehicle: {
          modelId: formData.modelId!,
          year: formData.year,
          odoKm: formData.mileage,
          vin: formData.licensePlate || `VF${formData.year}XYZ${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          transmission: formData.transmission[0] || "AT",
          fuelType: formData.fuelType[0] || "EV",
          origin: "VN",
          bodyStyle: "Scooter",
          seatCount: formData.seats || 2,
          color: formData.color,
          accessories: true,
          registration: formData.registration === "Có",
        },
      };

      console.log("📤 Submitting payload:", JSON.stringify(payload, null, 2));
      console.log("📸 Files to upload:", images.length);

      const response = await createSalePost(payload, images);

      console.log("✅ Post created successfully:", response);

      toast.success(`🎉 Đăng tin thành công! Mã tin: ${response.result.listingId}`);
      setTimeout(() => {
        navigate(`/ho-so/posts`);
      }, 1500);
    } catch (error: any) {
      console.error("❌ Error creating post:", error);
      console.error("❌ Error response:", error.response?.data);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Có lỗi xảy ra khi đăng tin. Vui lòng thử lại!";

      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-md border border-gray-200 space-y-10"
    >
      {/* ======= TIÊU ĐỀ ======= */}
      <section>
        <h2 className="text-xl font-semibold mb-5 text-[#2C3E50]">
          Tiêu đề tin đăng
        </h2>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Ví dụ: Xe điện VinFast Klara S màu trắng, đi 5000km"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
          required
        />
      </section>

      {/* ======= THÔNG TIN CHI TIẾT ======= */}
      <section>
        <h2 className="text-xl font-semibold mb-5 text-[#2C3E50]">
          Thông tin chi tiết
        </h2>

        {/* Tình trạng */}
        <div className="flex gap-3 mb-6">
          {["Đã sử dụng", "Mới"].map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setFormData({ ...formData, condition: item })}
              className={`px-5 py-1.5 text-sm font-medium rounded-full border transition ${formData.condition === item
                ? "bg-[#A8E6CF] border-[#2ECC71] text-[#2C3E50]"
                : "bg-[#F7F9F9] border-gray-300 text-gray-700 hover:bg-[#A8E6CF]/40"
                }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Brand / Model / Year */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
              Hãng xe *
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
                {loadingBrands ? "Đang tải..." : "Chọn hãng xe"}
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
              Mẫu xe *
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
                    ? "Chọn hãng xe trước"
                    : "Chọn mẫu xe"}
              </option>
              {models.map((model) => (
                <option key={model.modelId} value={model.modelId}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
              Năm sản xuất *
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              placeholder="2024"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
              required
            />
          </div>
        </div>

        {/* Hộp số */}
        <div className="mb-6">
          <label className="block text-sm text-[#2C3E50] mb-2 font-medium">
            Hộp số *
          </label>
          <div className="flex flex-wrap gap-3">
            {["Tự động", "Số sàn", "Bán tự động"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleToggle("transmission", type)}
                className={`px-4 py-1.5 rounded-full border text-sm transition ${formData.transmission.includes(type)
                  ? "bg-[#A8E6CF] border-[#2ECC71] text-[#2C3E50]"
                  : "bg-[#F7F9F9] border-gray-300 text-gray-700 hover:bg-[#A8E6CF]/40"
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Nhiên liệu */}
        <div className="mb-6">
          <label className="block text-sm text-[#2C3E50] mb-2 font-medium">
            Nhiên liệu *
          </label>
          <div className="flex flex-wrap gap-3">
            {["Xăng", "Dầu", "Động cơ Hybrid", "Điện"].map((fuel) => (
              <button
                key={fuel}
                type="button"
                onClick={() => handleToggle("fuelType", fuel)}
                className={`px-4 py-1.5 rounded-full border text-sm transition ${formData.fuelType.includes(fuel)
                  ? "bg-[#A8E6CF] border-[#2ECC71] text-[#2C3E50]"
                  : "bg-[#F7F9F9] border-gray-300 text-gray-700 hover:bg-[#A8E6CF]/40"
                  }`}
              >
                {fuel}
              </button>
            ))}
          </div>
        </div>

        {/* Extra info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
              Số chỗ ngồi
            </label>
            <input
              type="number"
              name="seats"
              value={formData.seats}
              onChange={handleChange}
              placeholder="2"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
            />
          </div>
          <div>
            <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
              Màu sắc
            </label>
            <input
              name="color"
              value={formData.color}
              onChange={handleChange}
              placeholder="Trắng, Đen, Đỏ..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
            />
          </div>
          <div>
            <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
              Biển số xe
            </label>
            <input
              name="licensePlate"
              value={formData.licensePlate}
              onChange={handleChange}
              placeholder="30A-12345"
              pattern="^[0-9]{2}.*"
              title="Biển số phải bắt đầu bằng 2 chữ số"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
            />
          </div>
          <div>
            <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
              Số đời chủ
            </label>
            <input
              type="number"
              name="ownerCount"
              value={formData.ownerCount}
              onChange={handleChange}
              placeholder="1"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
            />
          </div>
        </div>

        {/* Registration / Inspection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {[
            { label: "Còn đăng kiểm", key: "inspection" },
            { label: "Còn hạn đăng kiểm", key: "registration" },
          ].map((item) => (
            <div key={item.key}>
              <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
                {item.label}
              </label>
              <div className="flex gap-3">
                {["Có", "Không"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        [item.key]: opt,
                      } as SalePostFormData)
                    }
                    className={`px-4 py-1.5 rounded-full border text-sm transition ${formData[item.key as keyof SalePostFormData] === opt
                      ? "bg-[#A8E6CF] border-[#2ECC71] text-[#2C3E50]"
                      : "bg-[#F7F9F9] border-gray-300 text-gray-700 hover:bg-[#A8E6CF]/40"
                      }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Mileage + Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
              Số Km đã đi *
            </label>
            <input
              type="number"
              name="mileage"
              value={formData.mileage}
              onChange={handleChange}
              placeholder="5000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
              Giá bán (VNĐ) *
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                name="ask_price"
                value={formData.ask_price}
                onChange={handleChange}
                placeholder="19000000"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
                required
              />
              <button
                type="button"
                onClick={handleGetPriceSuggestion}
                disabled={loadingPriceSuggestion}
                className="px-4 py-2 bg-[#2ECC71] text-white rounded-lg hover:bg-[#27AE60] transition-all flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-md hover:shadow-lg"
                title="Gợi ý giá bán dựa trên AI"
              >
                {loadingPriceSuggestion ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Đang tính...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden sm:inline">AI Gợi ý</span>
                  </>
                )}
              </button>
            </div>

            {/* Price Suggestion Result - Redesigned */}
            {priceSuggestion && (
              <div className="mt-4 bg-gradient-to-br from-[#F7F9F9] to-[#E8F5E9] border-2 border-[#A8E6CF] rounded-xl p-5 shadow-md">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2ECC71] flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[#2C3E50] mb-3 flex items-center gap-2">
                      🤖 Gợi ý giá từ AI
                    </h4>

                    {/* Price Range */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-white rounded-lg p-3 border border-[#A8E6CF]">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingDown className="w-4 h-4 text-[#27AE60]" />
                          <span className="text-xs text-gray-600 font-medium">Giá thấp nhất</span>
                        </div>
                        <p className="text-lg font-bold text-[#2C3E50]">
                          {formatPrice(priceSuggestion.min)}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-[#A8E6CF]">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-[#27AE60]" />
                          <span className="text-xs text-gray-600 font-medium">Giá cao nhất</span>
                        </div>
                        <p className="text-lg font-bold text-[#2C3E50]">
                          {formatPrice(priceSuggestion.max)}
                        </p>
                      </div>
                    </div>

                    {/* Suggested Price - Highlighted */}
                    <div className="bg-[#2ECC71] rounded-lg p-4 mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-5 h-5 text-white" />
                        <span className="text-sm text-white font-medium">Giá đề xuất tốt nhất</span>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {formatPrice(priceSuggestion.suggested)}
                      </p>
                    </div>

                    {/* Note */}
                    {priceSuggestion.note && (
                      <div className="flex items-start gap-2 bg-white/70 rounded-lg p-3">
                        <Info className="w-4 h-4 text-[#27AE60] flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700">
                          {priceSuggestion.note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ======= ĐỊA CHỈ ======= */}
      <section>
        <h2 className="text-xl font-semibold mb-5 text-[#2C3E50]">Địa chỉ *</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Province */}
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

          {/* District */}
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

          {/* Ward */}
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

        {/* Street */}
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

      {/* ======= HÌNH ẢNH ======= */}
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

      {/* ======= MÔ TẢ ======= */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-[#2C3E50]">
          Mô tả chi tiết
        </h2>
        <textarea
          name="description"
          placeholder="Mô tả chi tiết về xe, tình trạng, lịch sử sử dụng..."
          value={formData.description}
          onChange={handleChange}
          rows={5}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none resize-none bg-white"
        />
      </section>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="bg-[#2ECC71] text-white font-medium px-8 py-2.5 rounded-lg hover:bg-[#27AE60] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang đăng tin...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Đăng tin
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default CreateVehiclePost;