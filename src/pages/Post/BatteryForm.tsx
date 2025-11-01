import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { locationService, type Province, type District, type Ward } from "../../services/locationService";
import { PostService } from "../../services/Post/PostService"; // ✅ Changed import
import { PriceSuggestionService } from "../../services/AI/AIPriceService";
import { Loader2, CheckCircle, Sparkles } from "lucide-react";

interface BatteryFormData {
  chemistryName: string;
  capacityKwh: number;
  sohPercent: number;
  cycleCount: number;
  ask_price: number;
  title: string;
  description: string;
  province_code: number | null;
  district_code: number | null;
  ward_code: number | null;
  street: string;
}

const INITIAL_FORM_DATA: BatteryFormData = {
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
};

const CHEMISTRY_OPTIONS = ["Li-ion", "LFP", "NMC", "NCA", "LTO"];

const CreateBatteryPost: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<BatteryFormData>(INITIAL_FORM_DATA);
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);

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
  }, []);

  useEffect(() => {
    if (formData.province_code) loadDistricts(formData.province_code);
    else resetDistricts();
  }, [formData.province_code]);

  useEffect(() => {
    if (formData.district_code) loadWards(formData.district_code);
    else resetWards();
  }, [formData.district_code]);

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
      setFormData(prev => ({ ...prev, district_code: null, ward_code: null }));
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
      setFormData(prev => ({ ...prev, ward_code: null }));
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

  // ===== HANDLERS =====

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = ["capacityKwh", "sohPercent", "cycleCount", "ask_price", "province_code", "district_code", "ward_code"];

    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? (Number(value) || 0) : value,
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
    if (!formData.chemistryName) return toast.warning("Vui lòng chọn công nghệ pin!");
    if (formData.capacityKwh <= 0) return toast.warning("Vui lòng nhập dung lượng pin hợp lệ!");
    if (formData.sohPercent < 0 || formData.sohPercent > 100) return toast.warning("SOH phải từ 0-100%!");
    if (formData.cycleCount < 0) return toast.warning("Vui lòng nhập số chu kỳ sạc hợp lệ!");

    setLoadingPrice(true);
    toast.info("🤖 AI đang phân tích giá thị trường...");

    try {
      const response = await PriceSuggestionService.getBatteryPriceSuggestion({
        productType: "BATTERY",
        chemistryName: formData.chemistryName,
        capacityKwh: formData.capacityKwh,
        sohPercent: formData.sohPercent,
        cycleCount: formData.cycleCount,
      });

      setPriceSuggestion({
        min: response.priceMinVND,
        max: response.priceMaxVND,
        suggested: response.suggestedPriceVND,
        note: response.note,
      });

      setFormData(prev => ({ ...prev, ask_price: response.suggestedPriceVND }));
      toast.success("✨ Đã tính toán giá đề xuất từ AI!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể lấy gợi ý giá!");
    } finally {
      setLoadingPrice(false);
    }
  };

  const validateForm = () => {
    if (images.length < 4) return toast.error("Vui lòng tải lên ít nhất 4 hình ảnh!");
    if (!formData.province_code || !formData.district_code || !formData.ward_code) {
      return toast.error("Vui lòng chọn đầy đủ địa chỉ!");
    }
    if (!formData.title.trim()) return toast.error("Vui lòng nhập tiêu đề!");
    if (formData.capacityKwh <= 0) return toast.error("Vui lòng nhập dung lượng pin hợp lệ!");
    if (formData.sohPercent < 0 || formData.sohPercent > 100) return toast.error("SOH phải từ 0-100%!");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    toast.info("Đang xử lý tin đăng...");

    try {
      // ✅ Build payload matching backend expectations
      const payload = {
        productType: "BATTERY" as const,
        askPrice: formData.ask_price,
        title: formData.title,
        description: formData.description,
        provinceCode: formData.province_code!,
        districtCode: formData.district_code!,
        wardCode: formData.ward_code!,
        street: formData.street,
        battery: {
          chemistryName: formData.chemistryName,
          capacityKwh: formData.capacityKwh,
          sohPercent: formData.sohPercent,
          cycleCount: formData.cycleCount,
        },
      };

      // ✅ Call the new createBatteryPost method
      const response = await PostService.createBatteryPost(payload, images);

      toast.success(`🎉 Đăng tin thành công! Mã tin: ${response.listingId}`);
      setTimeout(() => navigate(`/pin/${response.listingId}`), 1500);
    } catch (error: any) {
      console.error("❌ Error creating battery post:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi đăng tin!");
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

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none";
  const labelClass = "block text-sm text-[#2C3E50] mb-1 font-medium";

  // ===== RENDER =====

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-md border border-gray-200 space-y-10">

      {/* Title */}
      <section>
        <h2 className="text-xl font-semibold mb-5 text-[#2C3E50]">Tiêu đề tin đăng</h2>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Ví dụ: Pin xe điện 75kWh, tình trạng 95%, ít sử dụng"
          className={inputClass}
          required
        />
      </section>

      {/* Battery Info */}
      <section>
        <h2 className="text-xl font-semibold mb-5 text-[#2C3E50]">Thông tin pin xe điện</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className={labelClass}>Công nghệ pin *</label>
            <select name="chemistryName" value={formData.chemistryName} onChange={handleChange} className={inputClass} required>
              {CHEMISTRY_OPTIONS.map(chem => <option key={chem} value={chem}>{chem}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Dung lượng pin (kWh) *</label>
            <input type="number" name="capacityKwh" value={formData.capacityKwh} onChange={handleChange} placeholder="75.5" step="0.1" min="0.1" className={inputClass} required />
          </div>

          <div>
            <label className={labelClass}>Tình trạng pin - SOH (%) *</label>
            <input type="number" name="sohPercent" value={formData.sohPercent} onChange={handleChange} placeholder="95" min="0" max="100" className={inputClass} required />
            <p className="text-xs text-gray-500 mt-1">SOH (State of Health): 0-100%</p>
          </div>

          <div>
            <label className={labelClass}>Số chu kỳ sạc *</label>
            <input type="number" name="cycleCount" value={formData.cycleCount} onChange={handleChange} placeholder="500" min="0" className={inputClass} required />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Giá bán (VNĐ) *</label>
            <div className="flex gap-2">
              <input type="number" name="ask_price" value={formData.ask_price} onChange={handleChange} placeholder="50000000" min="0" className={`flex-1 ${inputClass}`} required />
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
                    <span className="font-medium">Khoảng giá:</span> {formatPrice(priceSuggestion.min)} - {formatPrice(priceSuggestion.max)}
                  </p>
                  <p className="bg-[#2ECC71] text-white px-3 py-2 rounded-lg">
                    <span className="font-medium">Giá đề xuất:</span>{" "}
                    <span className="text-lg font-bold">{formatPrice(priceSuggestion.suggested)}</span>
                  </p>
                  {priceSuggestion.note && <p className="text-gray-600 text-xs italic">💡 {priceSuggestion.note}</p>}
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
            <select name="province_code" value={formData.province_code || ""} onChange={handleChange} className={inputClass} disabled={loadingLocation} required>
              <option value="">Chọn tỉnh/thành phố</option>
              {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Quận/Huyện *</label>
            <select name="district_code" value={formData.district_code || ""} onChange={handleChange} className={inputClass} disabled={loadingLocation || !formData.province_code} required>
              <option value="">Chọn quận/huyện</option>
              {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Phường/Xã *</label>
            <select name="ward_code" value={formData.ward_code || ""} onChange={handleChange} className={inputClass} disabled={loadingLocation || !formData.district_code} required>
              <option value="">Chọn phường/xã</option>
              {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass}>Địa chỉ chi tiết</label>
          <input name="street" value={formData.street} onChange={handleChange} placeholder="Số nhà, tên đường..." className={inputClass} />
        </div>
      </section>

      {/* Images */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-[#2C3E50]">Hình ảnh *</h2>
        <p className="text-sm text-gray-500 mb-3">Tải tối thiểu 4 hình, tối đa 10 hình</p>
        <div className="flex flex-wrap gap-4">
          {images.map((file, i) => (
            <div key={i} className="relative w-28 h-28 rounded-lg overflow-hidden border border-gray-200">
              <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
              <button onClick={() => handleRemoveImage(i)} type="button" className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 hover:bg-red-700">
                ✕
              </button>
            </div>
          ))}
          <button type="button" onClick={() => fileInputRef.current?.click()} className="w-28 h-28 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-[#2ECC71] hover:text-[#2ECC71] transition rounded-lg text-3xl">
            +
          </button>
          <input type="file" multiple accept="image/*" onChange={handleFileUpload} ref={fileInputRef} className="hidden" />
        </div>
      </section>

      {/* Description */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-[#2C3E50]">Mô tả chi tiết</h2>
        <textarea
          name="description"
          placeholder="Mô tả chi tiết về pin..."
          value={formData.description}
          onChange={handleChange}
          rows={5}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none resize-none"
        />
      </section>

      {/* Submit */}
      <div className="flex justify-end">
        <button type="submit" disabled={submitting} className="bg-[#2ECC71] text-white font-medium px-8 py-2.5 rounded-lg hover:bg-[#27AE60] transition disabled:opacity-50 flex items-center gap-2">
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

export default CreateBatteryPost;
