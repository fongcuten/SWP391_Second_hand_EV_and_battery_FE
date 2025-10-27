import React, { useState, useRef, useEffect } from "react";
import {
  locationService,
  type Province,
  type District,
  type Ward,
} from "../../services/locationService";

interface SalePostFormData {
  // Thông tin cơ bản
  product_type: "vehicle";
  brand: string;
  model: string;
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
  description: string;

  // Địa chỉ
  province_code: number | null;
  district_code: number | null;
  ward_code: number | null;
  street: string;
}

const CreateVehiclePost: React.FC = () => {
  const [formData, setFormData] = useState<SalePostFormData>({
    product_type: "vehicle",
    brand: "",
    model: "",
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
    description: "",
    province_code: null,
    district_code: null,
    ward_code: null,
    street: "",
  });

  const [images, setImages] = useState<File[]>([]);
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
          setWards([]); // Reset wards when province changes
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
        name === "year" ||
        name === "mileage" ||
        name === "seats" ||
        name === "ownerCount" ||
        name === "ask_price" ||
        name === "province_code" ||
        name === "district_code" ||
        name === "ward_code"
          ? Number(value) || 0
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length < 4) {
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
      images: images.map((file) => file.name), // In real app, upload files first
    };

    console.log("Vehicle post submitted:", submitData);
    // TODO: Call API to create sale post
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-md border border-gray-200 space-y-10"
    >
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
              className={`px-5 py-1.5 text-sm font-medium rounded-full border transition ${
                formData.condition === item
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
            <input
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="Ví dụ: Toyota"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
            />
          </div>
          <div>
            <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
              Mẫu xe *
            </label>
            <input
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="Ví dụ: Vios"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
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
              placeholder="2020"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
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
                className={`px-4 py-1.5 rounded-full border text-sm transition ${
                  formData.transmission.includes(type)
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
                className={`px-4 py-1.5 rounded-full border text-sm transition ${
                  formData.fuelType.includes(fuel)
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
              placeholder="5"
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
                    className={`px-4 py-1.5 rounded-full border text-sm transition ${
                      formData[item.key as keyof SalePostFormData] === opt
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
              placeholder="50000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
            />
          </div>
          <div>
            <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
              Giá bán (VNĐ) *
            </label>
            <input
              type="number"
              name="ask_price"
              value={formData.ask_price}
              onChange={handleChange}
              placeholder="500000000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
            />
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
                className="absolute top-1 right-1 bg-[#2C3E50]/70 text-white rounded-full px-2 py-1 text-xs"
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
          className="bg-[#2ECC71] text-white font-medium px-8 py-2.5 rounded-lg hover:bg-[#27AE60] transition"
        >
          Đăng tin
        </button>
      </div>
    </form>
  );
};

export default CreateVehiclePost;
