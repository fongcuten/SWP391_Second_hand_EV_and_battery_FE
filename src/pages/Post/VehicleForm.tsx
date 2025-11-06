import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  locationService,
  type Province,
  type District,
  type Ward,
} from "../../services/locationService";
import {
  brandService,
  type Brand,
  type Model,
} from "../../services/Post/BrandService";
import { PostService } from "../../services/Post/PostService"; // ✅ Changed import
import { PriceSuggestionService } from "../../services/AI/AIPriceService";
import { Loader2, CheckCircle, Sparkles } from "lucide-react";

interface VehicleFormData {
  // Basic Info
  brandId: number | null;
  modelId: number | null;
  year: number;
  condition: string;

  // Technical
  transmission: string[];
  fuelType: string[];
  mileage: number;
  color: string;
  seats: number;

  // Legal
  licensePlate: string;
  ownerCount: number;
  registration: string;
  inspection: string;

  // Sale
  ask_price: number;
  title: string;
  description: string;

  // Location
  province_code: number | null;
  district_code: number | null;
  ward_code: number | null;
  street: string;
}

// ✅ Add proper Payload interface matching your backend
export interface VehiclePayload {
  modelId: number;
  year: number;
  odoKm: number;
  vin: string;
  transmission: string;
  fuelType: string;
  origin: string;
  bodyStyle: string;
  seatCount: number;
  color: string;
  accessories: boolean;
  registration: boolean;
}

export interface CreatePostPayload {
  productType: "VEHICLE" | "BATTERY";
  askPrice: number;
  title: string;
  description: string;
  provinceCode: number;
  districtCode: number;
  wardCode: number;
  street: string;
  vehicle?: VehiclePayload;
}

const INITIAL_FORM_DATA: VehicleFormData = {
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
};

const CreateVehiclePost: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<VehicleFormData>(INITIAL_FORM_DATA);
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Location State
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Brand/Model State
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  // AI Price State
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [priceSuggestion, setPriceSuggestion] = useState<{
    min: number;
    max: number;
    suggested: number;
    note: string;
  } | null>(null);

  // ===== DATA LOADING =====

  useEffect(() => {
    loadProvinces();
    loadBrands();
  }, []);

  useEffect(() => {
    if (formData.province_code) loadDistricts(formData.province_code);
    else resetDistricts();
  }, [formData.province_code]);

  useEffect(() => {
    if (formData.district_code) loadWards(formData.district_code);
    else resetWards();
  }, [formData.district_code]);

  useEffect(() => {
    if (formData.brandId) loadModels(formData.brandId);
    else resetModels();
  }, [formData.brandId]);

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
      setFormData((prev) => ({
        ...prev,
        district_code: null,
        ward_code: null,
      }));
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
      setFormData((prev) => ({ ...prev, ward_code: null }));
    } catch {
      toast.error("Không thể tải danh sách phường/xã");
    } finally {
      setLoadingLocation(false);
    }
  };

  const loadBrands = async () => {
    setLoadingBrands(true);
    try {
      const data = await brandService.getAllBrands();
      setBrands(data);
    } catch {
      toast.error("Không thể tải danh sách hãng xe");
    } finally {
      setLoadingBrands(false);
    }
  };

  const loadModels = async (brandId: number) => {
    setLoadingModels(true);
    try {
      // ✅ Now fetches models filtered by brandId from backend
      const data = await brandService.getModelsByBrand(brandId);

      console.log(`📦 Loaded ${data.length} models for brandId ${brandId}`);

      // Additional validation: ensure all models belong to selected brand
      const invalidModels = data.filter((m) => m.brandId !== brandId);
      if (invalidModels.length > 0) {
        console.error(
          "❌ Backend returned models from wrong brand:",
          invalidModels
        );
        toast.error("Lỗi: Dữ liệu mẫu xe không khớp với hãng!");
        setModels([]);
        return;
      }

      setModels(data);
      setFormData((prev) => ({ ...prev, modelId: null })); // Reset selected model
    } catch (error: any) {
      console.error("❌ Error loading models:", error);
      toast.error("Không thể tải danh sách mẫu xe");
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  const resetDistricts = () => {
    setDistricts([]);
    setWards([]);
  };

  const resetWards = () => {
    setWards([]);
  };

  const resetModels = () => {
    setModels([]);
    setFormData((prev) => ({ ...prev, modelId: null }));
  };

  // ===== HANDLERS =====

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const numericFields = [
      "year",
      "mileage",
      "seats",
      "ownerCount",
      "ask_price",
      "province_code",
      "district_code",
      "ward_code",
      "brandId",
      "modelId",
    ];

    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) || null : value,
    }));
  };

  const handleToggle = (field: "transmission" | "fuelType", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = Array.from(files);
    const total = [...images, ...newImages];

    if (total.length > 10) {
      toast.warning("Tối đa 10 hình ảnh!");
      return;
    }

    setImages(total);
    toast.success(`Đã thêm ${newImages.length} hình ảnh`);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    toast.info("Đã xóa hình ảnh");
  };

  const handleGetPriceSuggestion = async () => {
    // Validation
    if (!formData.province_code)
      return toast.warning("Vui lòng chọn tỉnh/thành phố!");
    if (!formData.brandId || !formData.modelId)
      return toast.warning("Vui lòng chọn hãng xe và mẫu xe!");
    if (!formData.year) return toast.warning("Vui lòng nhập năm sản xuất!");
    if (!formData.mileage) return toast.warning("Vui lòng nhập số km đã đi!");

    const selectedBrand = brands.find((b) => b.brandId === formData.brandId);
    const selectedModel = models.find((m) => m.modelId === formData.modelId);

    if (!selectedBrand || !selectedModel) {
      return toast.error("Không tìm thấy thông tin xe!");
    }

    setLoadingPrice(true);
    toast.info("🤖 AI đang phân tích giá thị trường...");

    try {
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

      setFormData((prev) => ({
        ...prev,
        ask_price: response.suggestedPriceVND,
      }));
      toast.success("✨ Đã tính toán giá đề xuất từ AI!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể lấy gợi ý giá!");
    } finally {
      setLoadingPrice(false);
    }
  };

  const validateModelBrand = async () => {
    if (!formData.modelId || !formData.brandId) return false;

    try {
      const modelDetails = await brandService.getModelById(formData.modelId);

      if (modelDetails.brandId !== formData.brandId) {
        toast.error(`Mẫu xe "${modelDetails.name}" không thuộc hãng đã chọn!`);
        return false;
      }

      return true;
    } catch {
      toast.error("Không thể xác minh mẫu xe!");
      return false;
    }
  };

  const validateForm = () => {
    if (images.length < 4)
      return toast.error("Vui lòng tải lên ít nhất 4 hình ảnh!");
    if (
      !formData.province_code ||
      !formData.district_code ||
      !formData.ward_code
    ) {
      return toast.error("Vui lòng chọn đầy đủ địa chỉ!");
    }
    if (!formData.title.trim()) return toast.error("Vui lòng nhập tiêu đề!");
    if (!formData.brandId || !formData.modelId)
      return toast.error("Vui lòng chọn hãng xe và mẫu xe!");
    if (formData.transmission.length === 0)
      return toast.error("Vui lòng chọn loại hộp số!");
    if (formData.fuelType.length === 0)
      return toast.error("Vui lòng chọn loại nhiên liệu!");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const isValidModel = await validateModelBrand();
    if (!isValidModel) return;

    setSubmitting(true);
    toast.info("Đang xử lý tin đăng...");

    try {
      // ✅ Build the proper payload
      const payload: CreatePostPayload = {
        productType: "VEHICLE",
        askPrice: formData.ask_price,
        title: formData.title,
        description: formData.description,
        provinceCode: formData.province_code!,
        districtCode: formData.district_code!,
        wardCode: formData.ward_code!,
        street: formData.street,
        vehicle: {
          modelId: formData.modelId!,
          year: formData.year,
          odoKm: formData.mileage,
          vin:
            formData.licensePlate ||
            `VF${formData.year}XYZ${Math.random()
              .toString(36)
              .substr(2, 6)
              .toUpperCase()}`,
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

      // ✅ Call the new createPost method with proper FormData
      const formDataToSend = new FormData();
      formDataToSend.append("payload", JSON.stringify(payload));

      // Add images
      images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      const response = await PostService.createVehiclePost(payload, images);

      toast.success(`🎉 Đăng tin thành công! Mã tin: ${response.listingId}`);
      setTimeout(() => navigate(`/xe-dien/${response.listingId}`), 1500);
    } catch (error: any) {
      console.error("❌ Error creating post:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi đăng tin!"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ===== UTILITIES =====

  const formatPrice = (price: number) => {
    if (price >= 1000000000) return `${(price / 1000000000).toFixed(1)} tỷ`;
    if (price >= 1000000) return `${(price / 1000000).toFixed(0)} triệu`;
    return `${price.toLocaleString("vi-VN")} đ`;
  };

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white";
  const labelClass = "block text-sm text-[#2C3E50] mb-1 font-medium";
  const buttonClass = (active: boolean) =>
    `px-4 py-1.5 rounded-full border text-sm transition ${active
      ? "bg-[#A8E6CF] border-[#2ECC71] text-[#2C3E50]"
      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
    }`;

  // ===== RENDER =====

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-md border border-gray-200 space-y-10"
    >
      {/* Title */}
      <section>
        <h2 className="text-xl font-semibold mb-5 text-[#2C3E50]">
          Tiêu đề tin đăng
        </h2>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Ví dụ: Xe điện VinFast Klara S màu trắng, đi 5000km"
          className={inputClass}
          required
        />
      </section>

      {/* Vehicle Info */}
      <section>
        <h2 className="text-xl font-semibold mb-5 text-[#2C3E50]">
          Thông tin chi tiết
        </h2>

        {/* Condition */}
        <div className="flex gap-3 mb-6">
          {["Đã sử dụng", "Mới"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFormData({ ...formData, condition: item })}
              className={buttonClass(formData.condition === item)}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Brand/Model/Year */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className={labelClass}>Hãng xe *</label>
            <select
              name="brandId"
              value={formData.brandId || ""}
              onChange={handleChange}
              className={inputClass}
              disabled={loadingBrands}
              required
            >
              <option value="">
                {loadingBrands ? "Đang tải..." : "Chọn hãng xe"}
              </option>
              {brands.map((b) => (
                <option key={b.brandId} value={b.brandId}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Mẫu xe *</label>
            <select
              name="modelId"
              value={formData.modelId || ""}
              onChange={handleChange}
              className={inputClass}
              disabled={loadingModels || !formData.brandId}
              required
            >
              <option value="">
                {loadingModels
                  ? "Đang tải..."
                  : !formData.brandId
                    ? "Chọn hãng trước"
                    : "Chọn mẫu xe"}
              </option>
              {models.map((m) => (
                <option key={m.modelId} value={m.modelId}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Năm sản xuất *</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              placeholder="2024"
              className={inputClass}
              required
            />
          </div>
        </div>

        {/* Transmission */}
        <div className="mb-6">
          <label className={labelClass}>Hộp số *</label>
          <div className="flex flex-wrap gap-3">
            {["Tự động", "Số sàn", "Bán tự động"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleToggle("transmission", type)}
                className={buttonClass(formData.transmission.includes(type))}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Fuel Type */}
        <div className="mb-6">
          <label className={labelClass}>Nhiên liệu *</label>
          <div className="flex flex-wrap gap-3">
            {["Động cơ Hybrid", "Điện"].map((fuel) => (
              <button
                key={fuel}
                type="button"
                onClick={() => handleToggle("fuelType", fuel)}
                className={buttonClass(formData.fuelType.includes(fuel))}
              >
                {fuel}
              </button>
            ))}
          </div>
        </div>

        {/* Extra Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className={labelClass}>Số chỗ ngồi</label>
            <input
              type="number"
              name="seats"
              value={formData.seats}
              onChange={handleChange}
              placeholder="2"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Màu sắc</label>
            <input
              name="color"
              value={formData.color}
              onChange={handleChange}
              placeholder="Trắng, Đen..."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Biển số xe</label>
            <input
              name="licensePlate"
              value={formData.licensePlate}
              onChange={handleChange}
              placeholder="30A-12345"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Số đời chủ</label>
            <input
              type="number"
              name="ownerCount"
              value={formData.ownerCount}
              onChange={handleChange}
              placeholder="1"
              className={inputClass}
            />
          </div>
        </div>

        {/* Registration & Accessories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {[
            {
              label: "Còn đăng kiểm",
              key: "inspection",
            },
            {
              label: "Có phụ kiện",
              key: "accessories",
            },
          ].map((item) => (
            <div key={item.key}>
              <label className={labelClass}>{item.label}</label>
              <div className="flex gap-3">
                {["Có", "Không"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        [item.key]: opt,
                      } as VehicleFormData)
                    }
                    className={buttonClass(
                      formData[item.key as keyof VehicleFormData] === opt
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Mileage & Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Số Km đã đi *</label>
            <input
              type="number"
              name="mileage"
              value={formData.mileage}
              onChange={handleChange}
              placeholder="5000"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Giá bán (VNĐ) *</label>
            <div className="flex gap-2">
              <input
                type="number"
                name="ask_price"
                value={formData.ask_price}
                onChange={handleChange}
                placeholder="19000000"
                className={`flex-1 ${inputClass}`}
                required
              />
              <button
                type="button"
                onClick={handleGetPriceSuggestion}
                disabled={loadingPrice}
                className="px-4 py-2 bg-[#2ECC71] text-white rounded-lg hover:bg-[#27AE60] transition flex items-center gap-2 font-medium disabled:opacity-50 whitespace-nowrap"
              >
                {loadingPrice ? (
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

            {/* Price Suggestion */}
            {priceSuggestion && (
              <div className="mt-4 bg-[#F0FDF4] border-2 border-[#2ECC71] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-[#2ECC71]" />
                  <h4 className="font-bold text-[#2C3E50]">Gợi ý giá từ AI</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700">
                    <span className="font-medium">Khoảng giá:</span>{" "}
                    {formatPrice(priceSuggestion.min)} -{" "}
                    {formatPrice(priceSuggestion.max)}
                  </p>
                  <p className="bg-[#2ECC71] text-white px-3 py-2 rounded-lg">
                    <span className="font-medium">Giá đề xuất:</span>{" "}
                    <span className="text-lg font-bold">
                      {formatPrice(priceSuggestion.suggested)}
                    </span>
                  </p>
                  {priceSuggestion.note && (
                    <p className="text-gray-600 text-xs italic">
                      💡 {priceSuggestion.note}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Address */}
      <section>
        <h2 className="text-xl font-semibold mb-5 text-[#2C3E50]">Địa chỉ *</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className={labelClass}>Tỉnh/Thành phố *</label>
            <select
              name="province_code"
              value={formData.province_code || ""}
              onChange={handleChange}
              className={inputClass}
              disabled={loadingLocation}
              required
            >
              <option value="">Chọn tỉnh/thành phố</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Quận/Huyện *</label>
            <select
              name="district_code"
              value={formData.district_code || ""}
              onChange={handleChange}
              className={inputClass}
              disabled={loadingLocation || !formData.province_code}
              required
            >
              <option value="">Chọn quận/huyện</option>
              {districts.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Phường/Xã *</label>
            <select
              name="ward_code"
              value={formData.ward_code || ""}
              onChange={handleChange}
              className={inputClass}
              disabled={loadingLocation || !formData.district_code}
              required
            >
              <option value="">Chọn phường/xã</option>
              {wards.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass}>Địa chỉ chi tiết</label>
          <input
            name="street"
            value={formData.street}
            onChange={handleChange}
            placeholder="Số nhà, tên đường..."
            className={inputClass}
          />
        </div>
      </section>

      {/* Images */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-[#2C3E50]">
          Hình ảnh *
        </h2>
        <p className="text-sm text-gray-500 mb-3">
          Tải tối thiểu 4 hình, tối đa 10 hình
        </p>
        <div className="flex flex-wrap gap-4">
          {images.map((file, i) => (
            <div
              key={i}
              className="relative w-28 h-28 rounded-lg overflow-hidden border border-gray-200"
            >
              <img
                src={URL.createObjectURL(file)}
                alt="preview"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleRemoveImage(i)}
                type="button"
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 hover:bg-red-700"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-28 h-28 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-[#2ECC71] hover:text-[#2ECC71] transition rounded-lg text-3xl"
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

      {/* Description */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-[#2C3E50]">
          Mô tả chi tiết
        </h2>
        <textarea
          name="description"
          placeholder="Mô tả chi tiết về xe..."
          value={formData.description}
          onChange={handleChange}
          rows={5}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none resize-none"
        />
      </section>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="bg-[#2ECC71] text-white font-medium px-8 py-2.5 rounded-lg hover:bg-[#27AE60] transition disabled:opacity-50 flex items-center gap-2"
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
