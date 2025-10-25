import React, { useState, useRef } from "react";

interface CarFormData {
  condition: string;
  brand: string;
  year: string;
  edition: string;
  transmission: string[];
  fuelType: string[];
  origin: string;
  style: string;
  seats: string;
  color: string;
  licensePlate: string;
  ownerCount: string;
  registration: string;
  inspection: string;
  mileage: string;
  price: string;
  title: string;
  description: string;
}

const CreateCarPost: React.FC = () => {
  const [formData, setFormData] = useState<CarFormData>({
    condition: "Đã sử dụng",
    brand: "",
    year: "",
    edition: "",
    transmission: [],
    fuelType: [],
    origin: "",
    style: "",
    seats: "",
    color: "",
    licensePlate: "",
    ownerCount: "",
    registration: "",
    inspection: "",
    mileage: "",
    price: "",
    title: "",
    description: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    console.log("Form submitted:", formData, images);
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

        {/* Brand / Year / Edition */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
          <div className="md:col-span-2">
            <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
              Phiên bản
            </label>
            <input
              name="edition"
              value={formData.edition}
              onChange={handleChange}
              placeholder="Ví dụ: Vios 1.5G"
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
          {[
            { name: "origin", placeholder: "Xuất xứ" },
            { name: "style", placeholder: "Kiểu dáng" },
            { name: "seats", placeholder: "Số chỗ" },
            { name: "color", placeholder: "Màu sắc" },
            { name: "licensePlate", placeholder: "Biển số xe" },
            { name: "ownerCount", placeholder: "Số đời chủ" },
          ].map((f) => (
            <input
              key={f.name}
              name={f.name}
              placeholder={f.placeholder}
              value={(formData as any)[f.name]}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
            />
          ))}
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
                      setFormData({ ...formData, [item.key]: opt })
                    }
                    className={`px-4 py-1.5 rounded-full border text-sm transition ${
                      (formData as any)[item.key] === opt
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
          <input
            name="mileage"
            placeholder="Số Km đã đi *"
            value={formData.mileage}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
          />
          <input
            name="price"
            placeholder="Giá bán *"
            value={formData.price}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
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

      {/* ======= TIÊU ĐỀ & MÔ TẢ ======= */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-[#2C3E50]">
          Tiêu đề tin đăng & Mô tả chi tiết
        </h2>
        <input
          name="title"
          placeholder="Tiêu đề tin đăng *"
          value={formData.title}
          onChange={handleChange}
          maxLength={70}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white mb-3"
        />
        <textarea
          name="description"
          placeholder="Mô tả chi tiết..."
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

export default CreateCarPost;
