import React, { useState, useRef, useEffect } from "react";
import {
  locationService,
  type Province,
  type District,
  type Ward,
} from "../../services/locationService";

interface BatterySalePostFormData {
  // Thông tin cơ bản
  product_type: "battery";
  brand: string;
  model: string;
  year: number;
  condition: string;

  // Thông tin kỹ thuật
  batteryCapacity: number;
  batteryHealth: number;
  voltage: number;
  chemistry: string;

  // Thông tin bán hàng
  ask_price: number;
  description: string;

  // Địa chỉ
  province_code: number | null;
  district_code: number | null;
  ward_code: number | null;
  street: string;
}

const CreateBatteryPost: React.FC = () => {
  const [formData, setFormData] = useState<BatterySalePostFormData>({
    product_type: "battery",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    condition: "excellent",
    batteryCapacity: 0,
    batteryHealth: 100,
    voltage: 0,
    chemistry: "",
    ask_price: 0,
    description: "",
    province_code: null,
    district_code: null,
    ward_code: null,
    street: "",
  });

  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Location states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(false);

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

  // Handle input text/number changes
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
        name === "batteryCapacity" ||
        name === "batteryHealth" ||
        name === "voltage" ||
        name === "ask_price" ||
        name === "province_code" ||
        name === "district_code" ||
        name === "ward_code"
          ? Number(value) || 0
          : value,
    }));
  };

  // Toggle condition
  const handleConditionChange = (cond: string) => {
    setFormData((prev) => ({ ...prev, condition: cond }));
  };

  // Image Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files ? Array.from(e.target.files) : [];
    const total = [...files, ...newFiles];
    if (total.length > 10) {
      alert("Tối đa 10 hình ảnh!");
      return;
    }
    setFiles(total);
  };

  const handleRemoveImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length < 4) {
      alert("Vui lòng tải lên ít nhất 4 hình ảnh!");
      return;
    }
    if (
      !formData.province_code ||
      !formData.district_code ||
      !formData.ward_code
    ) {
      alert("Vui lòng chọn đầy đủ thông tin địa chỉ!");
      return;
    }

    // Prepare data for API submission
    const submitData = {
      ...formData,
      images: files.map((file) => file.name), // In real app, upload files first
    };

    console.log("Battery post submitted:", submitData);
    // TODO: Call API to create sale post
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-md space-y-10 m-5"
    >
      {/* ========== Thông tin cơ bản ========== */}
      <section>
        <h2 className="text-xl font-semibold mb-5 text-[#2C3E50]">
          Thông tin pin xe điện
        </h2>

        {/* Condition */}
        <div className="flex gap-3 mb-6">
          {["excellent", "good", "fair", "poor"].map((cond) => (
            <button
              key={cond}
              type="button"
              onClick={() => handleConditionChange(cond)}
              className={`px-5 py-1.5 text-sm font-medium rounded-full border transition ${
                formData.condition === cond
                  ? "bg-[#A8E6CF] border-[#2ECC71] text-[#2C3E50]"
                  : "bg-[#F7F9F9] border-[#E5E5E5] text-[#2C3E50] hover:bg-[#A8E6CF]/30"
              }`}
            >
              {cond === "excellent"
                ? "Xuất sắc"
                : cond === "good"
                ? "Tốt"
                : cond === "fair"
                ? "Trung bình"
                : "Kém"}
            </button>
          ))}
        </div>

        {/* Brand / Model / Year */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
              Hãng pin *
            </label>
            <input
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="Tesla, BYD, CATL..."
              className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
              Mẫu pin *
            </label>
            <input
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="Model S Battery..."
              className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none"
            />
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
              className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none"
            />
          </div>
        </div>

        {/* Battery Specifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
              Dung lượng pin (kWh) *
            </label>
            <input
              type="number"
              name="batteryCapacity"
              value={formData.batteryCapacity}
              onChange={handleChange}
              placeholder="75"
              className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
              Tình trạng pin (%) *
            </label>
            <input
              type="number"
              name="batteryHealth"
              value={formData.batteryHealth}
              onChange={handleChange}
              placeholder="95"
              min="0"
              max="100"
              className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
              Điện áp (V)
            </label>
            <input
              type="number"
              name="voltage"
              value={formData.voltage}
              onChange={handleChange}
              placeholder="400"
              className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
              Công nghệ pin
            </label>
            <input
              name="chemistry"
              value={formData.chemistry}
              onChange={handleChange}
              placeholder="Li-ion, LFP, NMC..."
              className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none"
            />
          </div>
        </div>

        {/* Price */}
        <div className="mb-6">
          <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
            Giá bán (VNĐ) *
          </label>
          <input
            type="number"
            name="ask_price"
            value={formData.ask_price}
            onChange={handleChange}
            placeholder="50000000"
            className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none"
          />
        </div>
      </section>

      {/* ========== ĐỊA CHỈ ========== */}
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
              className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none"
              disabled={loading}
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
              className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none"
              disabled={loading || !formData.province_code}
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
              className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none"
              disabled={loading || !formData.district_code}
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
            className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none"
          />
        </div>
      </section>

      {/* ========== Mô tả ========== */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-[#2C3E50]">
          Mô tả chi tiết
        </h2>
        <textarea
          name="description"
          placeholder="Mô tả chi tiết về xe, tính năng, tình trạng..."
          value={formData.description}
          onChange={handleChange}
          rows={5}
          className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none resize-none"
        />
      </section>

      {/* ========== Hình ảnh ========== */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-[#2C3E50]">
          Hình ảnh *
        </h2>
        <p className="text-sm text-[#2C3E50]/70 mb-2">
          Tải lên ít nhất 4 hình (tối đa 10 hình, mỗi hình ≤ 8MB)
        </p>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {files.map((file, index) => (
            <div
              key={index}
              className="relative group border rounded-lg overflow-hidden shadow-sm border-[#E5E5E5]"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={`upload-${index}`}
                className="h-28 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-[#2C3E50]/70 text-white rounded-full px-2 py-0.5 text-xs opacity-0 group-hover:opacity-100 transition"
              >
                ✕
              </button>
            </div>
          ))}

          {/* Upload button */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center border-2 border-dashed border-[#E5E5E5] rounded-lg h-28 cursor-pointer hover:bg-[#A8E6CF]/30 transition"
          >
            <span className="text-3xl text-[#2C3E50]/50">＋</span>
            <span className="text-xs text-[#2C3E50]/70 mt-1">Thêm ảnh</span>
          </div>
        </div>

        <input
          type="file"
          multiple
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
        />

        <p className="text-sm text-[#2C3E50]/70 mt-2">
          Tổng số: {files.length}/10 hình
        </p>
      </section>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-[#2ECC71] text-white font-medium px-8 py-2.5 rounded-lg hover:bg-[#27AE60] transition"
        >
          Đăng tin
        </button>
      </div>
    </form>
  );
};

export default CreateBatteryPost;
