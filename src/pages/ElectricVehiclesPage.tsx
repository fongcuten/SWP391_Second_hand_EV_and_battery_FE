import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, SortAsc, SortDesc, Grid, List } from "lucide-react";
import ElectricVehicleCard from "../components/ElectricVehicleCard";
import type {
  ElectricVehicle,
  ElectricVehicleFilter,
  ElectricVehicleSort,
} from "../types/electricVehicle";

// Mock data - thay thế bằng API call thực tế
const mockVehicles: ElectricVehicle[] = [
  {
    id: "1",
    brand: "Tesla",
    model: "Model 3",
    year: 2022,
    price: 1200000000,
    originalPrice: 1500000000,
    mileage: 15000,
    batteryCapacity: 75,
    batteryHealth: 95,
    range: 500,
    chargingTime: 8,
    motorPower: 283,
    topSpeed: 225,
    acceleration: 4.4,
    color: "Trắng",
    condition: "excellent",
    description: "Xe điện Tesla Model 3 tình trạng xuất sắc, ít sử dụng",
    images: ["https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=500"],
    features: ["Autopilot", "Supercharger", "Premium Interior", "Glass Roof"],
    location: "Hồ Chí Minh",
    sellerId: "seller1",
    sellerName: "Nguyễn Văn A",
    sellerPhone: "0901234567",
    isAvailable: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    brand: "BYD",
    model: "Atto 3",
    year: 2023,
    price: 800000000,
    originalPrice: 900000000,
    mileage: 8000,
    batteryCapacity: 60,
    batteryHealth: 98,
    range: 400,
    chargingTime: 6,
    motorPower: 150,
    topSpeed: 180,
    acceleration: 7.3,
    color: "Xanh",
    condition: "excellent",
    description: "BYD Atto 3 mới 99%, đầy đủ phụ kiện",
    images: [
      "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=500",
    ],
    features: ["360 Camera", "Wireless Charging", "Sunroof", "Leather Seats"],
    location: "Hà Nội",
    sellerId: "seller2",
    sellerName: "Trần Thị B",
    sellerPhone: "0907654321",
    isAvailable: true,
    createdAt: "2024-01-10T14:30:00Z",
    updatedAt: "2024-01-10T14:30:00Z",
  },
  {
    id: "3",
    brand: "VinFast",
    model: "VF e34",
    year: 2021,
    price: 600000000,
    originalPrice: 700000000,
    mileage: 25000,
    batteryCapacity: 42,
    batteryHealth: 88,
    range: 300,
    chargingTime: 5,
    motorPower: 110,
    topSpeed: 150,
    acceleration: 8.9,
    color: "Đỏ",
    condition: "good",
    description: "VinFast VF e34 tình trạng tốt, bảo hành còn lại",
    images: [
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=500",
    ],
    features: [
      "VinFast App",
      "OTA Updates",
      "Voice Control",
      "Climate Control",
    ],
    location: "Đà Nẵng",
    sellerId: "seller3",
    sellerName: "Lê Văn C",
    sellerPhone: "0909876543",
    isAvailable: true,
    createdAt: "2024-01-05T09:15:00Z",
    updatedAt: "2024-01-05T09:15:00Z",
  },
];

const ElectricVehiclesPage: React.FC = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<ElectricVehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<ElectricVehicle[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<ElectricVehicleFilter>({});
  const [sort, setSort] = useState<ElectricVehicleSort>({
    field: "createdAt",
    order: "desc",
  });

  // Load vehicles
  useEffect(() => {
    const loadVehicles = async () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setVehicles(mockVehicles);
        setFilteredVehicles(mockVehicles);
        setLoading(false);
      }, 1000);
    };

    loadVehicles();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...vehicles];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (vehicle) =>
          vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Other filters
    if (filters.brand) {
      filtered = filtered.filter((vehicle) => vehicle.brand === filters.brand);
    }
    if (filters.minPrice) {
      filtered = filtered.filter(
        (vehicle) => vehicle.price >= filters.minPrice!
      );
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(
        (vehicle) => vehicle.price <= filters.maxPrice!
      );
    }
    if (filters.minYear) {
      filtered = filtered.filter((vehicle) => vehicle.year >= filters.minYear!);
    }
    if (filters.maxYear) {
      filtered = filtered.filter((vehicle) => vehicle.year <= filters.maxYear!);
    }
    if (filters.condition) {
      filtered = filtered.filter(
        (vehicle) => vehicle.condition === filters.condition
      );
    }
    if (filters.location) {
      filtered = filtered.filter((vehicle) =>
        vehicle.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sort.field];
      const bValue = b[sort.field];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sort.order === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sort.order === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    setFilteredVehicles(filtered);
  }, [vehicles, searchTerm, filters, sort]);

  const handleVehicleClick = (vehicle: ElectricVehicle) => {
    navigate(`/xe-dien/${vehicle.id}`);
  };

  const handleFilterChange = (newFilters: Partial<ElectricVehicleFilter>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
  };

  const brands = [...new Set(vehicles.map((v) => v.brand))];
  const conditions = ["excellent", "good", "fair", "poor"];
  const locations = [...new Set(vehicles.map((v) => v.location))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải danh sách xe điện...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Xe Điện Cũ</h1>
          <p className="text-gray-600">
            Tìm kiếm xe điện cũ chất lượng cao với giá tốt nhất
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên xe, thương hiệu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-5 h-5" />
              Bộ lọc
            </button>

            {/* Sort */}
            <select
              value={`${sort.field}-${sort.order}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-") as [
                  keyof ElectricVehicle,
                  "asc" | "desc"
                ];
                setSort({ field, order });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="createdAt-desc">Mới nhất</option>
              <option value="createdAt-asc">Cũ nhất</option>
              <option value="price-asc">Giá thấp đến cao</option>
              <option value="price-desc">Giá cao đến thấp</option>
              <option value="year-desc">Năm sản xuất mới nhất</option>
              <option value="year-asc">Năm sản xuất cũ nhất</option>
              <option value="mileage-asc">Số km ít nhất</option>
              <option value="mileage-desc">Số km nhiều nhất</option>
            </select>

            {/* View Mode */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${
                  viewMode === "grid"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-600"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${
                  viewMode === "list"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-600"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thương hiệu
                  </label>
                  <select
                    value={filters.brand || ""}
                    onChange={(e) =>
                      handleFilterChange({ brand: e.target.value || undefined })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Tất cả thương hiệu</option>
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá (triệu VNĐ)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Từ"
                      value={filters.minPrice ? filters.minPrice / 1000000 : ""}
                      onChange={(e) =>
                        handleFilterChange({
                          minPrice: e.target.value
                            ? Number(e.target.value) * 1000000
                            : undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Đến"
                      value={filters.maxPrice ? filters.maxPrice / 1000000 : ""}
                      onChange={(e) =>
                        handleFilterChange({
                          maxPrice: e.target.value
                            ? Number(e.target.value) * 1000000
                            : undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Year Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Năm sản xuất
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Từ"
                      value={filters.minYear || ""}
                      onChange={(e) =>
                        handleFilterChange({
                          minYear: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Đến"
                      value={filters.maxYear || ""}
                      onChange={(e) =>
                        handleFilterChange({
                          maxYear: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tình trạng
                  </label>
                  <select
                    value={filters.condition || ""}
                    onChange={(e) =>
                      handleFilterChange({
                        condition: e.target.value || undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Tất cả tình trạng</option>
                    <option value="excellent">Xuất sắc</option>
                    <option value="good">Tốt</option>
                    <option value="fair">Khá</option>
                    <option value="poor">Trung bình</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            Tìm thấy {filteredVehicles.length} xe điện
          </p>
        </div>

        {/* Vehicle Grid/List */}
        {filteredVehicles.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy xe điện nào
            </h3>
            <p className="text-gray-600">
              Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {filteredVehicles.map((vehicle) => (
              <ElectricVehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onClick={handleVehicleClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ElectricVehiclesPage;
