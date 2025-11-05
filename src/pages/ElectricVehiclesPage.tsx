import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Calendar,
  Battery,
  DollarSign,
  Car,
  Grid3x3,
  List,
  ChevronLeft,
  ChevronRight,
  X,
  Star,
  Crown,
  Award,
  Zap,
  Gauge,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  ListPostService,
  type ListPostSummary,
} from "../services/Vehicle/ElectricVehiclesPageService";
import {
  brandService,
  type Brand,
  type Model,
} from "../services/Post/BrandService";
// ✅ 1. Import the location service
import {
  locationService,
  type Province,
  type District,
  type Ward,
} from "../services/locationService";

// Constants
const PAGE_SIZE = 12;
const YEARS = Array.from({ length: 10 }, (_, i) => 2024 - i);
const PRICE_RANGES = [
  { value: "0-500", label: "Dưới 500 triệu" },
  { value: "500-1000", label: "500 triệu - 1 tỷ" },
  { value: "1000-1500", label: "1 - 1.5 tỷ" },
  { value: "1500-2000", label: "1.5 - 2 tỷ" },
  { value: "2000+", label: "Trên 2 tỷ" },
];

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

const POPULAR_SEARCHES = [
  "VinFast VF8",
  "Tesla Model 3",
  "BMW iX3",
  "Hyundai Kona Electric",
  "Mercedes EQC",
];

// Helper Functions
const formatPrice = (price: number): string => {
  if (price >= 1000000000) return `${(price / 1000000000).toFixed(1)} tỷ`;
  if (price >= 1000000) return `${(price / 1000000).toFixed(0)} triệu`;
  return `${price.toLocaleString("vi-VN")} đ`;
};

const getPriorityConfig = (priority: number) => {
  return PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG[1];
};

const matchesPrice = (price: number, range: string): boolean => {
  if (!range) return true;
  switch (range) {
    case "0-500":
      return price < 500000000;
    case "500-1000":
      return price >= 500000000 && price < 1000000000;
    case "1000-1500":
      return price >= 1000000000 && price < 1500000000;
    case "1500-2000":
      return price >= 1500000000 && price < 2000000000;
    case "2000+":
      return price >= 2000000000;
    default:
      return true;
  }
};

const ElectricVehiclesPage: React.FC = () => {
  // Posts State
  const [posts, setPosts] = useState<ListPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // UI State
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  // ❌ Remove old province search state
  // const [provinceSearch, setProvinceSearch] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [yearRange, setYearRange] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState("newest");

  // ✅ Add state for location filters
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<number | null>(null);
  const [selectedWardCode, setSelectedWardCode] = useState<number | null>(null);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Brand/Model State
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  // Computed
  const hasActiveFilters =
    searchTerm ||
    selectedProvinceCode || // ✅ Use new state
    priceRange ||
    yearRange ||
    selectedBrandId ||
    selectedModelId ||
    selectedPriority.length > 0;

  // Data Loading
  useEffect(() => {
    loadBrands();
    // ✅ Load provinces on initial render
    loadProvinces();
  }, []);

  // ✅ Add effects to handle location dropdown changes
  useEffect(() => {
    if (selectedProvinceCode) {
      loadDistricts(selectedProvinceCode);
    } else {
      setDistricts([]);
      setWards([]);
      setSelectedDistrictCode(null);
      setSelectedWardCode(null);
    }
  }, [selectedProvinceCode]);

  useEffect(() => {
    if (selectedDistrictCode) {
      loadWards(selectedDistrictCode);
    } else {
      setWards([]);
      setSelectedWardCode(null);
    }
  }, [selectedDistrictCode]);

  useEffect(() => {
    loadPosts();
  }, [currentPage]);

  const loadBrands = async () => {
    setLoadingBrands(true);
    try {
      const data = await brandService.getAllBrands();
      setBrands(data);
    } catch (error) {
      console.error("❌ Error loading brands:", error);
    } finally {
      setLoadingBrands(false);
    }
  };

  // ✅ Add functions to load location data
  const loadProvinces = async () => {
    setLoadingLocations(true);
    try {
      const data = await locationService.getProvinces();
      setProvinces(data);
    } catch (error) {
      console.error("❌ Error loading provinces:", error);
    } finally {
      setLoadingLocations(false);
    }
  };

  const loadDistricts = async (provinceCode: number) => {
    setLoadingLocations(true);
    try {
      const data = await locationService.getDistricts(provinceCode);
      setDistricts(data);
    } catch (error) {
      console.error("❌ Error loading districts:", error);
      setDistricts([]);
    } finally {
      setLoadingLocations(false);
    }
  };

  const loadWards = async (districtCode: number) => {
    setLoadingLocations(true);
    try {
      const data = await locationService.getWards(districtCode);
      setWards(data);
    } catch (error) {
      console.error("❌ Error loading wards:", error);
      setWards([]);
    } finally {
      setLoadingLocations(false);
    }
  };

  const loadPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await ListPostService.getSalePosts(
        currentPage,
        PAGE_SIZE,
        "",
        undefined
      );
      const vehiclePostsRaw =
        response.content?.filter((post) => post.productType === "VEHICLE") || [];

      // ✅ 2. Transform posts to include full address, like in FavoritesPage
      const transformedPosts = await Promise.all(
        vehiclePostsRaw.map(async (post) => {
          let fullAddress = post.address || "Không xác định"; // Fallback

          const hasValidCodes = post.provinceCode && post.districtCode && post.wardCode;

          if (hasValidCodes) {
            try {
              fullAddress = await locationService.getFullAddress(
                post.provinceCode,
                post.districtCode,
                post.wardCode,
                post.street
              );
            } catch (locationError) {
              console.error(`❌ Error converting location for post ${post.listingId}:`, locationError);
            }
          }
          // Return a new object with the updated address
          return { ...post, address: fullAddress };
        })
      );

      setPosts(transformedPosts);
      setTotalPages(response.totalPages || 0);
      setTotalElements(transformedPosts.length);
    } catch (error) {
      console.error("❌ Error loading posts:", error);
      setError("Không thể tải danh sách xe điện");
    } finally {
      setLoading(false);
    }
  };

  // Filter and Sort
  const filteredPosts = posts
    .filter((post) => {
      // Search
      const matchesSearch = searchTerm
        ? post.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.address?.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      // ✅ 3. Update filter logic to use location codes
      const matchesProvince = selectedProvinceCode
        ? post.provinceCode === selectedProvinceCode
        : true;
      const matchesDistrict = selectedDistrictCode
        ? post.districtCode === selectedDistrictCode
        : true;
      const matchesWard = selectedWardCode ? post.wardCode === selectedWardCode : true;

      // Brand
      let matchesBrand = true;
      if (selectedBrandId) {
        const selectedBrand = brands.find((b) => b.brandId === selectedBrandId);
        if (selectedBrand) {
          matchesBrand = post.productName
            .toLowerCase()
            .includes(selectedBrand.name.toLowerCase());
        }
      }

      // Model
      let matchesModel = true;
      if (selectedModelId) {
        const selectedModel = models.find((m) => m.modelId === selectedModelId);
        if (selectedModel) {
          matchesModel = post.productName
            .toLowerCase()
            .includes(selectedModel.name.toLowerCase());
        }
      }

      // Priority
      const matchesPriorityFilter =
        selectedPriority.length === 0 ||
        selectedPriority.includes(post.priorityLevel || 1);

      // Year
      const matchesYear = yearRange
        ? post.productName.includes(yearRange)
        : true;

      return (
        matchesSearch &&
        matchesProvince &&
        matchesDistrict &&
        matchesWard &&
        matchesBrand &&
        matchesModel &&
        matchesPriorityFilter &&
        matchesYear &&
        matchesPrice(post.askPrice, priceRange)
      );
    })
    .sort((a, b) => {
      // Priority first
      if (b.priorityLevel !== a.priorityLevel) {
        return (b.priorityLevel || 1) - (a.priorityLevel || 1);
      }

      // Then by selected sort
      switch (sortBy) {
        case "price-asc":
          return a.askPrice - b.askPrice;
        case "price-desc":
          return b.askPrice - a.askPrice;
        case "oldest":
          return (
            new Date(a.createdAt || "").getTime() -
            new Date(b.createdAt || "").getTime()
          );
        case "newest":
        default:
          return (
            new Date(b.createdAt || "").getTime() -
            new Date(a.createdAt || "").getTime()
          );
      }
    });

  // Actions
  const togglePriority = (priority: number) => {
    setSelectedPriority((prev) =>
      prev.includes(priority)
        ? prev.filter((p) => p !== priority)
        : [...prev, priority]
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    // setProvinceSearch(""); // ❌ Remove
    setPriceRange("");
    setYearRange("");
    setSelectedBrandId(null);
    setSelectedModelId(null);
    setSelectedPriority([]);
    // ✅ Reset location filters
    setSelectedProvinceCode(null);
    setSelectedDistrictCode(null);
    setSelectedWardCode(null);
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-20 h-20 border-4 border-green-200 border-t-[#2ECC71] rounded-full animate-spin mx-auto"></div>
            <Zap className="w-8 h-8 text-[#2ECC71] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-lg text-gray-700 font-medium">
            Đang tải xe điện...
          </p>
        </motion.div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#2ECC71] text-white rounded-lg hover:bg-[#27AE60] transition font-medium"
          >
            Thử lại
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#2ECC71] to-[#27AE60] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Car className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Xe Điện Đã Qua Sử Dụng
            </h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Khám phá {totalElements} xe điện chất lượng cao với giá tốt nhất
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="py-8 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
          >
            {/* Search Bar */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Tìm kiếm tên xe, thương hiệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent outline-none"
              />
              <Search className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
            </div>

            {/* Filters */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* ✅ 4. Replace location text input with dropdowns */}
              {/* Province */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Tỉnh/Thành phố
                </label>
                <select
                  value={selectedProvinceCode || ""}
                  onChange={(e) =>
                    setSelectedProvinceCode(e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent outline-none"
                  disabled={loadingLocations}
                >
                  <option value="">{loadingLocations ? "Đang tải..." : "Tất cả tỉnh"}</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Quận/Huyện
                </label>
                <select
                  value={selectedDistrictCode || ""}
                  onChange={(e) =>
                    setSelectedDistrictCode(e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent outline-none"
                  disabled={!selectedProvinceCode || loadingLocations}
                >
                  <option value="">
                    {!selectedProvinceCode
                      ? "Chọn tỉnh trước"
                      : loadingLocations
                        ? "Đang tải..."
                        : "Tất cả quận/huyện"}
                  </option>
                  {districts.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ward */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Phường/Xã
                </label>
                <select
                  value={selectedWardCode || ""}
                  onChange={(e) =>
                    setSelectedWardCode(e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent outline-none"
                  disabled={!selectedDistrictCode || loadingLocations}
                >
                  <option value="">
                    {!selectedDistrictCode
                      ? "Chọn quận/huyện trước"
                      : loadingLocations
                        ? "Đang tải..."
                        : "Tất cả phường/xã"}
                  </option>
                  {wards.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <Car className="inline h-4 w-4 mr-1" />
                  Hãng xe
                </label>
                <select
                  value={selectedBrandId || ""}
                  onChange={(e) =>
                    setSelectedBrandId(e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent outline-none"
                  disabled={loadingBrands}
                >
                  <option value="">{loadingBrands ? "Đang tải..." : "Tất cả hãng"}</option>
                  {brands.map((brand) => (
                    <option key={brand.brandId} value={brand.brandId}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Model */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <Car className="inline h-4 w-4 mr-1" />
                  Mẫu xe
                </label>
                <select
                  value={selectedModelId || ""}
                  onChange={(e) =>
                    setSelectedModelId(e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent outline-none"
                  disabled={loadingModels || !selectedBrandId}
                >
                  <option value="">
                    {loadingModels
                      ? "Đang tải..."
                      : !selectedBrandId
                        ? "Chọn hãng trước"
                        : "Tất cả mẫu xe"}
                  </option>
                  {models.map((model) => (
                    <option key={model.modelId} value={model.modelId}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  Khoảng giá
                </label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent outline-none"
                >
                  <option value="">Tất cả mức giá</option>
                  {PRICE_RANGES.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Năm sản xuất
                </label>
                <select
                  value={yearRange}
                  onChange={(e) => setYearRange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent outline-none"
                >
                  <option value="">Tất cả năm</option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-[#2ECC71] text-white py-4 px-8 rounded-lg font-semibold hover:bg-[#27AE60] transition-colors flex items-center justify-center space-x-2 shadow-lg"
              >
                <Search className="h-5 w-5" />
                <span>Tìm kiếm ({filteredPosts.length})</span>
              </motion.button>

              {hasActiveFilters && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetFilters}
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
            className="mt-6 bg-white rounded-xl shadow-md p-4"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">
                Lọc theo gói:
              </span>

              {Object.entries(PRIORITY_CONFIG).reverse().map(([priority, config]) => {
                const Icon = config.icon;
                const priorityNum = Number(priority);
                return (
                  <button
                    key={priority}
                    onClick={() => togglePriority(priorityNum)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${selectedPriority.includes(priorityNum)
                      ? config.badge + " shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {config.label.charAt(0) + config.label.slice(1).toLowerCase()}
                  </button>
                );
              })}

              <div className="flex-1"></div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ECC71] outline-none text-sm"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="price-asc">Giá thấp → cao</option>
                <option value="price-desc">Giá cao → thấp</option>
              </select>

              {/* View Mode */}
              <div className="flex border-2 border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition ${viewMode === "grid"
                    ? "bg-[#2ECC71] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition ${viewMode === "list"
                    ? "bg-[#2ECC71] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <p className="text-gray-600">
              Hiển thị{" "}
              <span className="font-semibold text-gray-900">
                {filteredPosts.length}
              </span>{" "}
              kết quả
              {selectedPriority.length > 0 && (
                <span className="ml-2 text-sm text-[#2ECC71]">
                  (Lọc:{" "}
                  {selectedPriority
                    .map((p) =>
                      p === 3 ? "Premium" : p === 2 ? "Standard" : "Normal"
                    )
                    .join(", ")}
                  )
                </span>
              )}
            </p>
          </div>

          {filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-12 text-center"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Không tìm thấy xe điện nào
              </h3>
              <p className="text-gray-600 mb-6">
                Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-[#2ECC71] text-white rounded-lg hover:bg-[#27AE60] transition font-medium"
              >
                Xóa bộ lọc
              </button>
            </motion.div>
          ) : (
            <>
              <VehicleGrid
                posts={filteredPosts}
                viewMode={viewMode}
                formatPrice={formatPrice}
                getPriorityConfig={getPriorityConfig}
              />

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

// Subcomponents
const VehicleGrid: React.FC<{
  posts: ListPostSummary[];
  viewMode: "grid" | "list";
  formatPrice: (price: number) => string;
  getPriorityConfig: (priority: number) => any;
}> = ({ posts, viewMode, formatPrice, getPriorityConfig }) => {
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {posts.map((post, index) => (
          <VehicleCard
            key={post.listingId}
            post={post}
            index={index}
            formatPrice={formatPrice}
            getPriorityConfig={getPriorityConfig}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
        <VehicleListItem
          key={post.listingId}
          post={post}
          index={index}
          formatPrice={formatPrice}
          getPriorityConfig={getPriorityConfig}
        />
      ))}
    </div>
  );
};

const VehicleCard: React.FC<{
  post: ListPostSummary;
  index: number;
  formatPrice: (price: number) => string;
  getPriorityConfig: (priority: number) => any;
}> = ({ post, index, formatPrice, getPriorityConfig }) => {
  const config = getPriorityConfig(post.priorityLevel || 1);
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        to={`/xe-dien/${post.listingId}`}
        className={`group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden block border-2 ${config.border}`}
      >
        <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
          <img
            src={post.coverThumb || "https://via.placeholder.com/400x300?text=No+Image"}
            alt={post.productName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://via.placeholder.com/400x300?text=Image+Error";
            }}
          />
          <div className="absolute top-3 right-3">
            <span
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 shadow-md ${config.badge}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {config.label}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-base text-[#2C3E50] group-hover:text-[#2ECC71] transition-colors line-clamp-2 mb-3 min-h-[48px]">
            {post.productName}
          </h3>

          <p className="text-2xl font-bold text-[#2ECC71] mb-4">
            {formatPrice(post.askPrice)}
          </p>

          <div className="flex items-center gap-2 text-sm text-gray-600 pb-3 border-b border-[#A8E6CF]/30">
            <MapPin className="w-4 h-4 flex-shrink-0 text-[#2ECC71]" />
            <span className="truncate">{post.address || "Chưa có địa chỉ"}</span>
          </div>

          <div className="flex items-center justify-between pt-3 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#2ECC71]" />
              <span>2023</span>
            </div>
            <div className="flex items-center gap-2">
              <Gauge className="w-3.5 h-3.5 text-[#2ECC71]" />
              <span>15K km</span>
            </div>
            <div className="flex items-center gap-2">
              <Battery className="w-3.5 h-3.5 text-[#2ECC71]" />
              <span>85%</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const VehicleListItem: React.FC<{
  post: ListPostSummary;
  index: number;
  formatPrice: (price: number) => string;
  getPriorityConfig: (priority: number) => any;
}> = ({ post, index, formatPrice, getPriorityConfig }) => {
  const config = getPriorityConfig(post.priorityLevel || 1);
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        to={`/xe-dien/${post.listingId}`}
        className={`group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex border-2 ${config.border}`}
      >
        <div className="w-72 flex-shrink-0 bg-gray-50 overflow-hidden relative">
          <img
            src={post.coverThumb || "https://via.placeholder.com/400x300?text=No+Image"}
            alt={post.productName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://via.placeholder.com/400x300?text=Image+Error";
            }}
          />
          <div className="absolute top-4 right-4">
            <span
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-md ${config.badge}`}
            >
              <Icon className="w-4 h-4" />
              {config.label}
            </span>
          </div>
        </div>

        <div className="flex-1 p-6 flex flex-col">
          <div className="flex-1">
            <h3 className="font-bold text-xl text-[#2C3E50] group-hover:text-[#2ECC71] transition-colors mb-2">
              {post.productName}
            </h3>

            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <MapPin className="w-4 h-4 text-[#2ECC71]" />
              <span className="text-sm">{post.address || "Chưa có địa chỉ"}</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600 mb-4 pb-4 border-b border-[#A8E6CF]/30">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2ECC71]" />
                <span>
                  Năm: <strong className="text-[#2C3E50]">2023</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-[#2ECC71]" />
                <span>
                  Km: <strong className="text-[#2C3E50]">15,000</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Battery className="w-4 h-4 text-[#2ECC71]" />
                <span>
                  Pin: <strong className="text-[#2C3E50]">85%</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#2ECC71]" />
                <span>
                  Dung lượng: <strong className="text-[#2C3E50]">90 kWh</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-[#2ECC71] mb-1">
                {formatPrice(post.askPrice)}
              </p>
              <p className="text-sm text-gray-600">Có thể thương lượng</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={(e) => e.preventDefault()}
                className="px-5 py-2.5 border-2 border-[#2ECC71] text-[#2ECC71] rounded-lg hover:bg-[#A8E6CF]/20 transition font-medium"
              >
                Liên hệ
              </button>
              <div className="px-6 py-2.5 bg-[#2ECC71] text-white rounded-lg hover:bg-[#27AE60] transition font-medium">
                Xem chi tiết
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="mt-12 flex items-center justify-center gap-2"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="p-3 border-2 border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`min-w-[44px] h-11 rounded-lg font-medium transition ${currentPage === i
            ? "bg-[#2ECC71] text-white shadow-lg"
            : "border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
        >
          {i + 1}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className="p-3 border-2 border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
};

export default ElectricVehiclesPage;
