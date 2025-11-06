import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Grid3x3,
  List,
  Battery as BatteryIcon,
  X,
  MapPin,
  Star,
  Crown,
  Award,
  Calendar,
  Zap,
  Gauge,
} from "lucide-react";
import { motion } from "framer-motion";
import BatteryCard from "../components/BatteryCard";
import type { Battery, BatteryFilter, BatterySort } from "../types/battery";
import api from "../config/axios";
import {
  locationService,
  type Province,
  type District,
  type Ward,
} from "../services/locationService";

// Priority Configuration
const PRIORITY_CONFIG = {
  3: {
    badge: "bg-gradient-to-r from-[#2ECC71] to-[#27AE60] text-white",
    border: "border-[#2ECC71] hover:border-[#27AE60]",
    icon: Crown,
    label: "PREMIUM",
  },
  2: {
    badge: "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
    border: "border-blue-400 hover:border-blue-500",
    icon: Award,
    label: "STANDARD",
  },
  1: {
    badge: "bg-gray-100 text-gray-700",
    border: "border-gray-100 hover:border-[#A8E6CF]",
    icon: Star,
    label: "NORMAL",
  },
} as const;

const getPriorityConfig = (priority: number) => {
  return (
    PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] ||
    PRIORITY_CONFIG[1]
  );
};

const formatPrice = (price: number): string => {
  if (price >= 1000000000) return `${(price / 1000000000).toFixed(1)} tỷ`;
  if (price >= 1000000) return `${(price / 1000000).toFixed(0)} triệu`;
  return `${price.toLocaleString("vi-VN")} đ`;
};

const BatteriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<BatteryFilter>({});
  const [selectedPriority, setSelectedPriority] = useState<number[]>([]);
  const [sort, setSort] = useState<BatterySort>({
    field: "createdAt",
    order: "desc",
  });
  // Location states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<
    number | null
  >(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<
    number | null
  >(null);
  const [selectedWardCode, setSelectedWardCode] = useState<number | null>(null);
  const [loadingLocations, setLoadingLocations] = useState(false);

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
        const mapped: Battery[] = await Promise.all(
          (resp.data?.content || []).map(async (p: any) => {
            let fullAddress = p.address || "";
            // If we have location codes, get full address
            if (p.provinceCode && p.districtCode && p.wardCode) {
              try {
                fullAddress = await locationService.getFullAddress(
                  p.provinceCode,
                  p.districtCode,
                  p.wardCode,
                  p.street
                );
              } catch (locationError) {
                console.error(
                  `Error converting location for battery ${p.listingId}:`,
                  locationError
                );
              }
            }
            return {
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
              manufactureYear: new Date(
                p.createdAt || Date.now()
              ).getFullYear(),
              warranty: 0,
              compatibility: [],
              condition: "good",
              description: "",
              images: p.coverThumb ? [p.coverThumb] : [],
              features: [],
              location: fullAddress,
              sellerId: p.seller || "",
              sellerName: p.seller || "",
              sellerPhone: "",
              isAvailable: true,
              createdAt: p.createdAt || new Date().toISOString(),
              updatedAt: p.createdAt || new Date().toISOString(),
              priorityLevel:
                p.priorityLevel ?? p.priority_level ?? p.priority ?? 1,
              weight: 0,
              dimensions: { length: 0, width: 0, height: 0 },
              chargingSpeed: 0,
              dischargingSpeed: 0,
              // Add location codes for filtering
              provinceCode: p.provinceCode,
              districtCode: p.districtCode,
              wardCode: p.wardCode,
            } as Battery & {
              provinceCode?: number;
              districtCode?: number;
              wardCode?: number;
            };
          })
        );
        setBatteries(mapped);
      } catch {
        setBatteries([]);
      } finally {
        setLoading(false);
      }
    };

    loadBatteries();
  }, []);

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const provincesData = await locationService.getProvinces();
        setProvinces(provincesData);
      } catch (error) {
        console.error("Error loading provinces:", error);
      }
    };
    loadProvinces();
  }, []);

  // Load districts when province is selected
  useEffect(() => {
    if (selectedProvinceCode) {
      setLoadingLocations(true);
      locationService
        .getDistricts(selectedProvinceCode)
        .then(setDistricts)
        .catch(() => setDistricts([]))
        .finally(() => setLoadingLocations(false));
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [selectedProvinceCode]);

  // Load wards when district is selected
  useEffect(() => {
    if (selectedDistrictCode) {
      setLoadingLocations(true);
      locationService
        .getWards(selectedDistrictCode)
        .then(setWards)
        .catch(() => setWards([]))
        .finally(() => setLoadingLocations(false));
    } else {
      setWards([]);
    }
  }, [selectedDistrictCode]);

  // Apply filters and search (memoized for performance)
  const filteredBatteries = useMemo(() => {
    let filtered = [...batteries];

    // Search filter - search theo công nghệ pin hoặc địa chỉ
    if (searchTerm) {
      filtered = filtered.filter(
        (battery) =>
          battery.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          battery.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Other filters
    if (filters.type) {
      filtered = filtered.filter((battery) => {
        // Map filter values to battery types
        const typeMap: Record<string, string[]> = {
          "Li-ion": ["lithium-ion", "ion"],
          LFP: ["LFP", "lfp"],
          NMC: ["NMC", "nmc"],
          NCA: ["NCA", "nca"],
          LTO: ["LTO", "lto"],
        };
        const filterType = filters.type!;
        if (typeMap[filterType]) {
          return typeMap[filterType].some((t) =>
            battery.type.toLowerCase().includes(t.toLowerCase())
          );
        }
        return battery.type.toLowerCase().includes(filterType.toLowerCase());
      });
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
    // Location filter by province/district/ward codes
    if (selectedProvinceCode) {
      filtered = filtered.filter(
        (battery) => (battery as any).provinceCode === selectedProvinceCode
      );
    }
    if (selectedDistrictCode) {
      filtered = filtered.filter(
        (battery) => (battery as any).districtCode === selectedDistrictCode
      );
    }
    if (selectedWardCode) {
      filtered = filtered.filter(
        (battery) => (battery as any).wardCode === selectedWardCode
      );
    }

    // Priority filter
    if (selectedPriority.length > 0) {
      filtered = filtered.filter((battery) =>
        selectedPriority.includes(battery.priorityLevel || 1)
      );
    }

    // Sort - priority first, then by sort field
    filtered.sort((a, b) => {
      // Sort by priority first
      if ((b.priorityLevel || 1) !== (a.priorityLevel || 1)) {
        return (b.priorityLevel || 1) - (a.priorityLevel || 1);
      }

      // Then by sort field
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

    return filtered;
  }, [
    batteries,
    searchTerm,
    filters,
    sort,
    selectedPriority,
    selectedProvinceCode,
    selectedDistrictCode,
    selectedWardCode,
  ]);

  const handleBatteryClick = (battery: Battery) => {
    navigate(`/pin/${battery.id}`);
  };

  const handleFilterChange = (newFilters: Partial<BatteryFilter>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
    setSelectedPriority([]);
    setSelectedProvinceCode(null);
    setSelectedDistrictCode(null);
    setSelectedWardCode(null);
  };

  const togglePriority = (priority: number) => {
    const newPriorities = selectedPriority.includes(priority)
      ? selectedPriority.filter((p) => p !== priority)
      : [...selectedPriority, priority];
    setSelectedPriority(newPriorities);
  };

  // Công nghệ pin cố định
  const batteryTechnologies = ["Li-ion", "LFP", "NMC", "NCA", "LTO"];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative w-20 h-20 mx-auto">
            <div className="w-full h-full border-4 border-green-200 border-t-[#2ECC71] rounded-full animate-spin"></div>
            <BatteryIcon className="w-8 h-8 text-[#2ECC71] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-lg text-gray-700 font-medium">
            Đang tải danh sách pin...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#2ECC71] to-[#27AE60] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
              <BatteryIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Pin Xe Điện Cũ
            </h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Khám phá {filteredBatteries.length} pin xe điện chất lượng cao với
              giá tốt nhất
            </p>
          </motion.div>
        </div>
      </section>

      {/* t */}
      <section className="py-8 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
          >
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Tìm kiếm công nghệ pin, địa chỉ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent outline-none"
              />
              <Search className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <BatteryIcon className="inline h-4 w-4 mr-1" />
                  Công nghệ pin
                </label>
                <select
                  value={filters.type || ""}
                  onChange={(e) =>
                    handleFilterChange({ type: e.target.value || undefined })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent outline-none"
                >
                  <option value="">Tất cả công nghệ</option>
                  {batteryTechnologies.map((tech) => (
                    <option key={tech} value={tech}>
                      {tech}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Tỉnh/Thành phố
                </label>
                <select
                  value={selectedProvinceCode || ""}
                  onChange={(e) => {
                    const code = e.target.value ? Number(e.target.value) : null;
                    setSelectedProvinceCode(code);
                    setSelectedDistrictCode(null);
                    setSelectedWardCode(null);
                  }}
                  disabled={loadingLocations}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Tất cả tỉnh</option>
                  {provinces.map((province) => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Quận/Huyện
                </label>
                <select
                  value={selectedDistrictCode || ""}
                  onChange={(e) => {
                    const code = e.target.value ? Number(e.target.value) : null;
                    setSelectedDistrictCode(code);
                    setSelectedWardCode(null);
                  }}
                  disabled={!selectedProvinceCode || loadingLocations}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!selectedProvinceCode
                      ? "Chọn tỉnh trước"
                      : "Tất cả quận/huyện"}
                  </option>
                  {districts.map((district) => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Phường/Xã
                </label>
                <select
                  value={selectedWardCode || ""}
                  onChange={(e) => {
                    const code = e.target.value ? Number(e.target.value) : null;
                    setSelectedWardCode(code);
                  }}
                  disabled={!selectedDistrictCode || loadingLocations}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!selectedDistrictCode
                      ? "Chọn quận/huyện trước"
                      : "Tất cả phường/xã"}
                  </option>
                  {wards.map((ward) => (
                    <option key={ward.code} value={ward.code}>
                      {ward.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-[#2ECC71] text-white py-4 px-8 rounded-lg font-semibold hover:bg-[#27AE60] transition-colors flex items-center justify-center space-x-2 shadow-lg"
              >
                <Search className="h-5 w-5" />
                <span>Tìm kiếm ({filteredBatteries.length})</span>
              </motion.button>
              {(searchTerm ||
                Object.keys(filters).length > 0 ||
                selectedPriority.length > 0 ||
                selectedProvinceCode ||
                selectedDistrictCode ||
                selectedWardCode) && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearFilters}
                  className="sm:w-auto border-2 border-red-300 text-red-600 py-4 px-8 rounded-lg font-semibold hover:bg-red-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <X className="h-5 w-5" />
                  <span>Xóa bộ lọc</span>
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Priority & Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 bg-white rounded-xl shadow-md p-4 flex flex-wrap items-center gap-3"
          >
            <span className="text-sm font-semibold text-gray-700">
              Lọc theo gói:
            </span>
            {Object.entries(PRIORITY_CONFIG)
              .reverse()
              .map(([priority, config]) => (
                <button
                  key={priority}
                  onClick={() => togglePriority(Number(priority))}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${
                    selectedPriority.includes(Number(priority))
                      ? `${config.badge} shadow-lg`
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <config.icon className="w-4 h-4" />
                  {config.label.charAt(0) + config.label.slice(1).toLowerCase()}
                </button>
              ))}
            <div className="flex-1"></div>
            <select
              value={`${sort.field}-${sort.order}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-") as [
                  BatterySort["field"],
                  "asc" | "desc"
                ];
                setSort({ field, order });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ECC71] outline-none text-sm"
            >
              <option value="createdAt-desc">Mới nhất</option>
              <option value="createdAt-asc">Cũ nhất</option>
              <option value="price-asc">Giá thấp → cao</option>
              <option value="price-desc">Giá cao → thấp</option>
              <option value="capacity-desc">Dung lượng cao nhất</option>
              <option value="capacity-asc">Dung lượng thấp nhất</option>
              <option value="currentHealth-desc">Sức khỏe tốt nhất</option>
              <option value="cycleCount-asc">Ít chu kỳ sạc nhất</option>
            </select>
            <div className="flex border-2 border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 transition ${
                  viewMode === "grid"
                    ? "bg-[#2ECC71] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition ${
                  viewMode === "list"
                    ? "bg-[#2ECC71] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredBatteries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-12 text-center"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Không tìm thấy pin nào
              </h3>
              <p className="text-gray-600 mb-6">
                Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-[#2ECC71] text-white rounded-lg hover:bg-[#27AE60] transition font-medium"
              >
                Xóa bộ lọc
              </button>
            </motion.div>
          ) : (
            <BatteryGrid
              batteries={filteredBatteries}
              viewMode={viewMode}
              onBatteryClick={handleBatteryClick}
            />
          )}
        </div>
      </section>
    </div>
  );
};

// =================================================================
// SUBCOMPONENTS
// =================================================================

const BatteryGrid: React.FC<{
  batteries: Battery[];
  viewMode: "grid" | "list";
  onBatteryClick: (battery: Battery) => void;
}> = ({ batteries, viewMode, onBatteryClick }) => {
  const Component = viewMode === "grid" ? BatteryCardView : BatteryListItem;
  const containerClasses =
    viewMode === "grid"
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      : "space-y-4";
  return (
    <div className={containerClasses}>
      {batteries.map((battery, index) => (
        <Component
          key={battery.id}
          battery={battery}
          index={index}
          onClick={onBatteryClick}
        />
      ))}
    </div>
  );
};

const BatteryCardView: React.FC<{
  battery: Battery;
  index: number;
  onClick: (battery: Battery) => void;
}> = ({ battery, index, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <BatteryCard battery={battery} onClick={onClick} />
    </motion.div>
  );
};

const BatteryListItem: React.FC<{
  battery: Battery;
  index: number;
  onClick: (battery: Battery) => void;
}> = ({ battery, index, onClick }) => {
  const config = getPriorityConfig(battery.priorityLevel || 1);
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <div
        className={`group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex border-2 ${config.border} cursor-pointer`}
        onClick={() => onClick(battery)}
      >
        <div className="w-72 flex-shrink-0 bg-gray-50 overflow-hidden relative">
          {battery.images && battery.images.length > 0 ? (
            <img
              src={battery.images[0]}
              alt={`${battery.brand} ${battery.model}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/400x300?text=Image+Error";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
              <BatteryIcon className="w-16 h-16" />
            </div>
          )}
          <div className="absolute top-4 right-4">
            <span
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-md ${config.badge}`}
            >
              <config.icon className="w-4 h-4" />
              {config.label}
            </span>
          </div>
        </div>
        <div className="flex-1 p-6 flex flex-col">
          <div className="flex-1">
            <h3 className="font-bold text-xl text-[#2C3E50] group-hover:text-[#2ECC71] transition-colors mb-2">
              {battery.brand} {battery.model}
            </h3>
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <MapPin className="w-4 h-4 text-[#2ECC71]" />
              <span className="text-sm">
                {battery.location || "Chưa có địa chỉ"}
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600 mb-4 pb-4 border-b border-[#A8E6CF]/30">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2ECC71]" />
                <span>
                  Năm:{" "}
                  <strong className="text-[#2C3E50]">
                    {battery.manufactureYear}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BatteryIcon className="w-4 h-4 text-[#2ECC71]" />
                <span>
                  Sức khỏe:{" "}
                  <strong className="text-[#2C3E50]">
                    {battery.currentHealth}%
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-[#2ECC71]" />
                <span>
                  Chu kỳ:{" "}
                  <strong className="text-[#2C3E50]">
                    {battery.cycleCount}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#2ECC71]" />
                <span>
                  Dung lượng:{" "}
                  <strong className="text-[#2C3E50]">
                    {battery.capacity} kWh
                  </strong>
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-[#2ECC71] mb-1">
                {formatPrice(battery.price)}
              </p>
              <p className="text-sm text-gray-600">Có thể thương lượng</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(battery);
                }}
                className="px-5 py-2.5 border-2 border-[#2ECC71] text-[#2ECC71] rounded-lg hover:bg-[#A8E6CF]/20 transition font-medium"
              >
                Liên hệ
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(battery);
                }}
                className="px-6 py-2.5 bg-[#2ECC71] text-white rounded-lg hover:bg-[#27AE60] transition font-medium"
              >
                Xem chi tiết
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BatteriesPage;
