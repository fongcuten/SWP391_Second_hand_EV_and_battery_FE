import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Grid, List } from "lucide-react";
import BatteryCard from "../components/BatteryCard";
import type { Battery, BatteryFilter, BatterySort } from "../types/battery";
import api from "../config/axios";

// Mock data - thay thế bằng API call thực tế
const mockBatteries: Battery[] = [
  {
    id: "1",
    brand: "CATL",
    model: "LFP-100",
    type: "LFP",
    capacity: 100,
    voltage: 400,
    currentHealth: 95,
    cycleCount: 500,
    price: 250000000,
    originalPrice: 350000000,
    manufactureYear: 2022,
    warranty: 24,
    compatibility: ["Tesla Model 3", "BYD Atto 3", "VinFast VF e34"],
    condition: "excellent",
    description:
      "Pin CATL LFP 100kWh tình trạng xuất sắc, ít sử dụng. Dung lượng pin còn 95%, chu kỳ sạc 500 lần. Bảo hành còn 24 tháng.",
    images: [
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500",
    ],
    features: [
      "Sạc nhanh",
      "An toàn cao",
      "Tuổi thọ cao",
      "Thân thiện môi trường",
    ],
    location: "Hồ Chí Minh",
    sellerId: "seller1",
    sellerName: "Nguyễn Văn A",
    sellerPhone: "0901234567",
    isAvailable: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    weight: 500,
    dimensions: {
      length: 120,
      width: 80,
      height: 20,
    },
    chargingSpeed: 150,
    dischargingSpeed: 200,
  },
  {
    id: "2",
    brand: "LG Energy",
    model: "NMC-75",
    type: "NMC",
    capacity: 75,
    voltage: 350,
    currentHealth: 92,
    cycleCount: 800,
    price: 180000000,
    originalPrice: 280000000,
    manufactureYear: 2021,
    warranty: 18,
    compatibility: ["Hyundai Kona", "Kia EV6", "Tesla Model Y"],
    condition: "good",
    description:
      "Pin LG Energy NMC 75kWh tình trạng tốt. Dung lượng pin 92%, đã sử dụng 800 chu kỳ sạc. Pin chính hãng, có bảo hành.",
    images: [
      "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=500",
    ],
    features: ["Mật độ năng lượng cao", "Hiệu suất tốt", "Độ bền cao"],
    location: "Hà Nội",
    sellerId: "seller2",
    sellerName: "Trần Thị B",
    sellerPhone: "0907654321",
    isAvailable: true,
    createdAt: "2024-01-10T14:30:00Z",
    updatedAt: "2024-01-10T14:30:00Z",
    weight: 400,
    dimensions: {
      length: 110,
      width: 75,
      height: 18,
    },
    chargingSpeed: 120,
    dischargingSpeed: 150,
  },
  {
    id: "3",
    brand: "BYD",
    model: "Blade Battery",
    type: "LFP",
    capacity: 60,
    voltage: 320,
    currentHealth: 88,
    cycleCount: 1200,
    price: 120000000,
    originalPrice: 200000000,
    manufactureYear: 2020,
    warranty: 12,
    compatibility: ["BYD e6", "BYD Tang", "BYD Han"],
    condition: "good",
    description:
      "Pin BYD Blade 60kWh công nghệ LFP an toàn. Dung lượng còn 88%, đã qua sử dụng nhưng vẫn hoạt động tốt.",
    images: [
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500",
    ],
    features: [
      "An toàn vượt trội",
      "Không cháy nổ",
      "Tuổi thọ cao",
      "Giá thành hợp lý",
    ],
    location: "Đà Nẵng",
    sellerId: "seller3",
    sellerName: "Lê Văn C",
    sellerPhone: "0909876543",
    isAvailable: true,
    createdAt: "2024-01-05T09:15:00Z",
    updatedAt: "2024-01-05T09:15:00Z",
    weight: 350,
    dimensions: {
      length: 100,
      width: 70,
      height: 15,
    },
    chargingSpeed: 80,
    dischargingSpeed: 100,
  },
  {
    id: "4",
    brand: "Panasonic",
    model: "NCR18650B",
    type: "lithium-ion",
    capacity: 85,
    voltage: 380,
    currentHealth: 90,
    cycleCount: 600,
    price: 200000000,
    originalPrice: 300000000,
    manufactureYear: 2022,
    warranty: 20,
    compatibility: ["Tesla Model S", "Tesla Model X"],
    condition: "excellent",
    description:
      "Pin Panasonic 85kWh sử dụng cho Tesla. Tình trạng rất tốt, dung lượng còn 90%.",
    images: [
      "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=500",
    ],
    features: ["Công nghệ Nhật Bản", "Hiệu suất cao", "Độ tin cậy cao"],
    location: "Hồ Chí Minh",
    sellerId: "seller4",
    sellerName: "Phạm Văn D",
    sellerPhone: "0905555555",
    isAvailable: true,
    createdAt: "2024-01-12T11:20:00Z",
    updatedAt: "2024-01-12T11:20:00Z",
    weight: 450,
    dimensions: {
      length: 115,
      width: 78,
      height: 19,
    },
    chargingSpeed: 130,
    dischargingSpeed: 170,
  },
];

const BatteriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [filteredBatteries, setFilteredBatteries] = useState<Battery[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<BatteryFilter>({});
  const [sort, setSort] = useState<BatterySort>({
    field: "createdAt",
    order: "desc",
  });

  // Load batteries from backend
  useEffect(() => {
    const loadBatteries = async () => {
      setLoading(true);
      try {
        const resp = await api.get("/api/sale-posts/batteries", {
          params: {
            page: 0,
            size: 20,
            sortBy: "createdAt,desc",
          },
        });
        const mapped: Battery[] = (resp.data?.content || []).map((p: any) => ({
          id: String(p.listingId),
          brand: p.productName || "Pin xe điện",
          model: "",
          type: "LFP",
          capacity: 0,
          voltage: 0,
          currentHealth: 100,
          cycleCount: 0,
          price: p.askPrice || 0,
          originalPrice: p.askPrice || 0,
          manufactureYear: new Date(p.createdAt || Date.now()).getFullYear(),
          warranty: 0,
          compatibility: [],
          condition: "good",
          description: "",
          images: p.coverThumb ? [p.coverThumb] : [],
          features: [],
          location: p.address || "",
          sellerId: p.seller || "",
          sellerName: p.seller || "",
          sellerPhone: "",
          isAvailable: true,
          createdAt: p.createdAt || new Date().toISOString(),
          updatedAt: p.createdAt || new Date().toISOString(),
          weight: 0,
          dimensions: { length: 0, width: 0, height: 0 },
          chargingSpeed: 0,
          dischargingSpeed: 0,
        }));
        setBatteries(mapped);
        setFilteredBatteries(mapped);
      } catch (e) {
        setBatteries([]);
        setFilteredBatteries([]);
      } finally {
        setLoading(false);
      }
    };

    loadBatteries();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...batteries];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (battery) =>
          battery.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          battery.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          battery.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          battery.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Other filters
    if (filters.brand) {
      filtered = filtered.filter((battery) => battery.brand === filters.brand);
    }
    if (filters.type) {
      filtered = filtered.filter((battery) => battery.type === filters.type);
    }
    if (filters.minPrice) {
      filtered = filtered.filter(
        (battery) => battery.price >= filters.minPrice!
      );
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(
        (battery) => battery.price <= filters.maxPrice!
      );
    }
    if (filters.minCapacity) {
      filtered = filtered.filter(
        (battery) => battery.capacity >= filters.minCapacity!
      );
    }
    if (filters.maxCapacity) {
      filtered = filtered.filter(
        (battery) => battery.capacity <= filters.maxCapacity!
      );
    }
    if (filters.minHealth) {
      filtered = filtered.filter(
        (battery) => battery.currentHealth >= filters.minHealth!
      );
    }
    if (filters.maxHealth) {
      filtered = filtered.filter(
        (battery) => battery.currentHealth <= filters.maxHealth!
      );
    }
    if (filters.condition) {
      filtered = filtered.filter(
        (battery) => battery.condition === filters.condition
      );
    }
    if (filters.location) {
      filtered = filtered.filter((battery) =>
        battery.location.toLowerCase().includes(filters.location!.toLowerCase())
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

    setFilteredBatteries(filtered);
  }, [batteries, searchTerm, filters, sort]);

  const handleBatteryClick = (battery: Battery) => {
    navigate(`/pin/${battery.id}`);
  };

  const handleFilterChange = (newFilters: Partial<BatteryFilter>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
  };

  const brands = [...new Set(batteries.map((b) => b.brand))];
  const types = [...new Set(batteries.map((b) => b.type))];
  const conditions = ["excellent", "good", "fair", "poor"];
  const locations = [...new Set(batteries.map((b) => b.location))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải danh sách pin...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pin Xe Điện Cũ
          </h1>
          <p className="text-gray-600">
            Tìm kiếm pin xe điện cũ chất lượng cao với giá tốt nhất
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
                  placeholder="Tìm kiếm theo thương hiệu, loại pin..."
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
                  keyof Battery,
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
              <option value="capacity-desc">Dung lượng cao nhất</option>
              <option value="capacity-asc">Dung lượng thấp nhất</option>
              <option value="currentHealth-desc">Sức khỏe tốt nhất</option>
              <option value="cycleCount-asc">Ít chu kỳ sạc nhất</option>
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

                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại pin
                  </label>
                  <select
                    value={filters.type || ""}
                    onChange={(e) =>
                      handleFilterChange({ type: e.target.value || undefined })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Tất cả loại</option>
                    {types.map((type) => (
                      <option key={type} value={type}>
                        {type}
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

                {/* Capacity Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dung lượng (kWh)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Từ"
                      value={filters.minCapacity || ""}
                      onChange={(e) =>
                        handleFilterChange({
                          minCapacity: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Đến"
                      value={filters.maxCapacity || ""}
                      onChange={(e) =>
                        handleFilterChange({
                          maxCapacity: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Health Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sức khỏe pin (%)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Từ"
                      value={filters.minHealth || ""}
                      onChange={(e) =>
                        handleFilterChange({
                          minHealth: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Đến"
                      value={filters.maxHealth || ""}
                      onChange={(e) =>
                        handleFilterChange({
                          maxHealth: e.target.value
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

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa điểm
                  </label>
                  <select
                    value={filters.location || ""}
                    onChange={(e) =>
                      handleFilterChange({
                        location: e.target.value || undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Tất cả địa điểm</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
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
            Tìm thấy {filteredBatteries.length} pin
          </p>
        </div>

        {/* Battery Grid/List */}
        {filteredBatteries.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy pin nào
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
            {filteredBatteries.map((battery) => (
              <BatteryCard
                key={battery.id}
                battery={battery}
                onClick={handleBatteryClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BatteriesPage;
