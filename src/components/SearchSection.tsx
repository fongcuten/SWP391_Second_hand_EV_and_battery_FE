import React, { useState } from "react";
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Battery,
  DollarSign,
  Car,
} from "lucide-react";
import { motion } from "framer-motion";

const SearchSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState("vehicle");

  const vehicleBrands = [
    "VinFast",
    "Tesla",
    "BMW",
    "Mercedes",
    "Audi",
    "Hyundai",
    "Kia",
    "Nissan",
  ];

  const batteryTypes = ["Lithium-ion", "LiFePO4", "NiMH", "Solid State"];

  const years = Array.from({ length: 10 }, (_, i) => 2024 - i);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Tìm kiếm xe điện & pin phù hợp
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Sử dụng bộ lọc chi tiết để tìm đúng xe điện và pin bạn cần
          </p>
        </motion.div>

        {/* Search Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* Tabs */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={() => setActiveTab("vehicle")}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === "vehicle"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Car className="h-5 w-5" />
              <span>Xe điện</span>
            </button>
            <button
              onClick={() => setActiveTab("battery")}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === "battery"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Battery className="h-5 w-5" />
              <span>Pin & Phụ kiện</span>
            </button>
          </div>

          {/* Search Form */}
          <div className="space-y-6">
            {/* Main Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder={
                  activeTab === "vehicle"
                    ? "Tìm kiếm xe điện..."
                    : "Tìm kiếm pin, phụ kiện..."
                }
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <Search className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
            </div>

            {/* Filter Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Location */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Khu vực
                </label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="">Chọn khu vực</option>
                  <option value="hanoi">Hà Nội</option>
                  <option value="hcm">TP. Hồ Chí Minh</option>
                  <option value="danang">Đà Nẵng</option>
                  <option value="haiphong">Hải Phòng</option>
                </select>
              </div>

              {/* Brand/Type */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {activeTab === "vehicle" ? "Thương hiệu" : "Loại pin"}
                </label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="">
                    {activeTab === "vehicle"
                      ? "Chọn thương hiệu"
                      : "Chọn loại pin"}
                  </option>
                  {(activeTab === "vehicle" ? vehicleBrands : batteryTypes).map(
                    (item) => (
                      <option key={item} value={item.toLowerCase()}>
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Year */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  {activeTab === "vehicle" ? "Năm sản xuất" : "Năm sản xuất"}
                </label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="">Chọn năm</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  Khoảng giá
                </label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="">Chọn khoảng giá</option>
                  <option value="0-500">Dưới 500 triệu</option>
                  <option value="500-1000">500 triệu - 1 tỷ</option>
                  <option value="1000-1500">1 - 1.5 tỷ</option>
                  <option value="1500-2000">1.5 - 2 tỷ</option>
                  <option value="2000+">Trên 2 tỷ</option>
                </select>
              </div>
            </div>

            {/* Additional Filters for Vehicle */}
            {activeTab === "vehicle" && (
              <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-gray-200">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Dung lượng pin
                  </label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option value="">Chọn dung lượng</option>
                    <option value="30-50">30-50 kWh</option>
                    <option value="50-75">50-75 kWh</option>
                    <option value="75-100">75-100 kWh</option>
                    <option value="100+">Trên 100 kWh</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Quãng đường đã đi
                  </label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option value="">Chọn quãng đường</option>
                    <option value="0-10000">Dưới 10,000 km</option>
                    <option value="10000-30000">10,000 - 30,000 km</option>
                    <option value="30000-50000">30,000 - 50,000 km</option>
                    <option value="50000+">Trên 50,000 km</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Tình trạng
                  </label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option value="">Chọn tình trạng</option>
                    <option value="new">Mới 95-99%</option>
                    <option value="good">Tốt 85-94%</option>
                    <option value="fair">Khá 70-84%</option>
                    <option value="poor">Trung bình dưới 70%</option>
                  </select>
                </div>
              </div>
            )}

            {/* Search Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-green-600 text-white py-4 px-8 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Search className="h-5 w-5" />
                <span>Tìm kiếm ngay</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="sm:w-auto border-2 border-gray-300 text-gray-700 py-4 px-8 rounded-lg font-semibold hover:border-green-500 hover:text-green-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Filter className="h-5 w-5" />
                <span>Bộ lọc nâng cao</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Quick Search Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8"
        >
          <p className="text-sm font-semibold text-gray-700 mb-4">
            Tìm kiếm phổ biến:
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              "VinFast VF8",
              "Tesla Model 3",
              "Pin Lithium 100kWh",
              "BMW iX3",
              "Hyundai Kona Electric",
            ].map((tag) => (
              <button
                key={tag}
                className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:border-green-500 hover:text-green-600 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SearchSection;
