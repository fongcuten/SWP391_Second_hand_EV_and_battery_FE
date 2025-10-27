import React, { useState, useRef } from "react";
import type { ElectricVehicle } from "../../types/electricVehicle";


const ElectricVehicleForm: React.FC = () => {
  const [formData, setFormData] = useState<ElectricVehicle>({
    id: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    price: 0,
    originalPrice: 0,
    mileage: 0,
    batteryCapacity: 0,
    batteryHealth: 100,
    range: 0,
    chargingTime: 0,
    motorPower: 0,
    topSpeed: 0,
    acceleration: 0,
    color: "",
    condition: "excellent",
    description: "",
    images: [],
    features: [],
    location: "",
    sellerId: "",
    sellerName: "",
    sellerPhone: "",
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle input text/number changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "year" ||
          name === "price" ||
          name === "originalPrice" ||
          name === "mileage" ||
          name === "batteryCapacity" ||
          name === "batteryHealth" ||
          name === "range" ||
          name === "chargingTime" ||
          name === "motorPower" ||
          name === "topSpeed" ||
          name === "acceleration"
          ? Number(value)
          : value,
    }));
  };

  // Toggle condition
  const handleConditionChange = (cond: ElectricVehicle["condition"]) => {
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
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    const dataToSubmit = { ...formData, images: imageUrls };
    console.log("EV Submitted:", dataToSubmit);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-md space-y-10 m-5"
    >
      {/* ========== Thông tin cơ bản ========== */}
      <section>
        <h2 className="text-xl font-semibold mb-5 text-[#2C3E50]">
          Thông tin xe điện
        </h2>

        {/* Condition */}
        <div className="flex gap-3 mb-6">
          {["excellent", "good", "fair", "poor"].map((cond) => (
            <button
              key={cond}
              type="button"
              onClick={() => handleConditionChange(cond as any)}
              className={`px-5 py-1.5 text-sm font-medium rounded-full border transition ${formData.condition === cond
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
          {[
            { name: "brand", label: "Hãng xe", placeholder: "Tesla" },
            { name: "model", label: "Mẫu xe", placeholder: "Model 3" },
            { name: "year", label: "Năm sản xuất", placeholder: "2024" },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
                {f.label} *
              </label>
              <input
                name={f.name}
                value={(formData as any)[f.name]}
                onChange={handleChange}
                placeholder={f.placeholder}
                type={f.name === "year" ? "number" : "text"}
                className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none"
              />
            </div>
          ))}
        </div>

        {/* Battery + Performance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { name: "batteryCapacity", label: "Dung lượng pin (kWh)" },
            { name: "batteryHealth", label: "Tình trạng pin (%)" },
            { name: "range", label: "Quãng đường (km)" },
            { name: "chargingTime", label: "Thời gian sạc (giờ)" },
            { name: "motorPower", label: "Công suất động cơ (kW)" },
            { name: "topSpeed", label: "Tốc độ tối đa (km/h)" },
            { name: "acceleration", label: "0–100 km/h (giây)" },
            { name: "mileage", label: "Số km đã đi" },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
                {f.label}
              </label>
              <input
                type="number"
                name={f.name}
                value={(formData as any)[f.name]}
                onChange={handleChange}
                placeholder="Nhập thông tin"
                className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none"
              />
            </div>
          ))}
        </div>

        {/* Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
              Giá bán (₫) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
              Giá gốc (₫)
            </label>
            <input
              type="number"
              name="originalPrice"
              value={formData.originalPrice}
              onChange={handleChange}
              className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none"
            />
          </div>
        </div>

        {/* Color / Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
              Màu sắc
            </label>
            <input
              name="color"
              value={formData.color}
              onChange={handleChange}
              placeholder="Trắng, Đen, Đỏ..."
              className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
              Khu vực
            </label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="TP.HCM, Hà Nội..."
              className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none"
            />
          </div>
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
        <h2 className="text-xl font-semibold mb-4 text-[#2C3E50]">Hình ảnh *</h2>
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

export default ElectricVehicleForm;
