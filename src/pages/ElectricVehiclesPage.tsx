import React, { useState, useEffect, useMemo } from "react";
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
import {
  locationService,
  type Province,
  type District,
  type Ward,
} from "../services/locationService";

// =================================================================
// 1. CONSTANTS & HELPERS (Moved outside the component)
// =================================================================

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

const formatPrice = (price: number): string => {
  if (price >= 1000000000) return `${(price / 1000000000).toFixed(1)} tỷ`;
  if (price >= 1000000) return `${(price / 1000000).toFixed(0)} triệu`;
  return `${price.toLocaleString("vi-VN")} đ`;
};

const getPriorityConfig = (priority: number) => {
  return PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG[1];
};

interface FilterState {
  searchTerm: string;
  priceRange: string;
  yearRange: string;
  selectedBrandId: number | null;
  selectedModelId: number | null;
  selectedPriority: number[];
  sortBy: string;
  selectedProvinceCode: number | null;
  selectedDistrictCode: number | null;
  selectedWardCode: number | null;
}

const initialFilterState: FilterState = {
  searchTerm: "",
  priceRange: "",
  yearRange: "",
  selectedBrandId: null,
  selectedModelId: null,
  selectedPriority: [],
  sortBy: "newest",
  selectedProvinceCode: null,
  selectedDistrictCode: null,
  selectedWardCode: null,
};

// =================================================================
// 2. MAIN COMPONENT
// =================================================================

const ElectricVehiclesPage: React.FC = () => {
  // Data State
  const [posts, setPosts] = useState<ListPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // UI State
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter & Location Data State
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // --- DATA LOADING ---
  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all data concurrently
        const [postsResponse, brandsData, provincesData] = await Promise.all([
          ListPostService.getSalePosts(currentPage, PAGE_SIZE, "", undefined),
          brandService.getAllBrands(),
          locationService.getProvinces(),
        ]);

        // Transform posts to include full address
        const transformedPosts = await Promise.all(
          (postsResponse.content || []).map(async (post) => {
            if (post.provinceCode && post.districtCode && post.wardCode) {
              try {
                const fullAddress = await locationService.getFullAddress(post.provinceCode, post.districtCode, post.wardCode, post.street);
                return { ...post, address: fullAddress };
              } catch (locationError) {
                console.error(`Error converting location for post ${post.listingId}:`, locationError);
              }
            }
            return { ...post, address: post.address || "Không xác định" };
          })
        );

        setPosts(transformedPosts);
        setTotalPages(postsResponse.totalPages || 0);
        setBrands(brandsData);
        setProvinces(provincesData);
      } catch (err) {
        console.error("❌ Error loading initial data:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    initialLoad();
  }, [currentPage]);

  // --- LOCATION DROPDOWN LOGIC ---
  useEffect(() => {
    if (filters.selectedProvinceCode) {
      setLoadingLocations(true);
      locationService.getDistricts(filters.selectedProvinceCode)
        .then(setDistricts)
        .catch(() => setDistricts([]))
        .finally(() => setLoadingLocations(false));
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [filters.selectedProvinceCode]);

  useEffect(() => {
    if (filters.selectedDistrictCode) {
      setLoadingLocations(true);
      locationService.getWards(filters.selectedDistrictCode)
        .then(setWards)
        .catch(() => setWards([]))
        .finally(() => setLoadingLocations(false));
    } else {
      setWards([]);
    }
  }, [filters.selectedDistrictCode]);

  // --- FILTERING & SORTING (Memoized for performance) ---
  const filteredPosts = useMemo(() => {
    const matchesPrice = (price: number, range: string): boolean => {
      if (!range) return true;
      const priceRanges: Record<string, () => boolean> = {
        "0-500": () => price < 500000000,
        "500-1000": () => price >= 500000000 && price < 1000000000,
        "1000-1500": () => price >= 1000000000 && price < 1500000000,
        "1500-2000": () => price >= 1500000000 && price < 2000000000,
        "2000+": () => price >= 2000000000,
      };
      return priceRanges[range] ? priceRanges[range]() : true;
    };

    return posts
      .filter(post => {
        const { searchTerm, selectedProvinceCode, selectedDistrictCode, selectedWardCode, selectedBrandId, selectedModelId, selectedPriority, yearRange, priceRange } = filters;
        const brand = brands.find(b => b.brandId === selectedBrandId);
        const model = models.find(m => m.modelId === selectedModelId);

        return (
          (!searchTerm || post.productName.toLowerCase().includes(searchTerm.toLowerCase()) || post.address?.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (!selectedProvinceCode || post.provinceCode === selectedProvinceCode) &&
          (!selectedDistrictCode || post.districtCode === selectedDistrictCode) &&
          (!selectedWardCode || post.wardCode === selectedWardCode) &&
          (!brand || post.productName.toLowerCase().includes(brand.name.toLowerCase())) &&
          (!model || post.productName.toLowerCase().includes(model.name.toLowerCase())) &&
          (selectedPriority.length === 0 || selectedPriority.includes(post.priorityLevel || 1)) &&
          (!yearRange || post.productName.includes(yearRange)) &&
          matchesPrice(post.askPrice, priceRange)
        );
      })
      .sort((a, b) => {
        if (b.priorityLevel !== a.priorityLevel) return (b.priorityLevel || 1) - (a.priorityLevel || 1);
        switch (filters.sortBy) {
          case "price-asc": return a.askPrice - b.askPrice;
          case "price-desc": return b.askPrice - a.askPrice;
          case "oldest": return new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime();
          default: return new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime();
        }
      });
  }, [posts, filters, brands, models]);

  // --- ACTIONS ---
  const handleFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters(initialFilterState);

  const togglePriority = (priority: number) => {
    const currentPriorities = filters.selectedPriority;
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter(p => p !== priority)
      : [...currentPriorities, priority];
    handleFilterChange("selectedPriority", newPriorities);
  };

  // --- RENDER LOGIC ---
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#2ECC71] to-[#27AE60] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
              <Car className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Xe Điện Đã Qua Sử Dụng</h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Khám phá {filteredPosts.length} xe điện chất lượng cao với giá tốt nhất
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="py-8 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Tìm kiếm tên xe, thương hiệu..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent outline-none"
              />
              <Search className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <FilterSelect icon={MapPin} label="Tỉnh/Thành phố" value={filters.selectedProvinceCode || ""} onChange={e => handleFilterChange("selectedProvinceCode", e.target.value ? Number(e.target.value) : null)} disabled={loadingLocations} options={provinces.map(p => ({ value: p.code, label: p.name }))} defaultLabel="Tất cả tỉnh" />
              <FilterSelect icon={MapPin} label="Quận/Huyện" value={filters.selectedDistrictCode || ""} onChange={e => handleFilterChange("selectedDistrictCode", e.target.value ? Number(e.target.value) : null)} disabled={!filters.selectedProvinceCode || loadingLocations} options={districts.map(d => ({ value: d.code, label: d.name }))} defaultLabel={!filters.selectedProvinceCode ? "Chọn tỉnh trước" : "Tất cả quận/huyện"} />
              <FilterSelect icon={MapPin} label="Phường/Xã" value={filters.selectedWardCode || ""} onChange={e => handleFilterChange("selectedWardCode", e.target.value ? Number(e.target.value) : null)} disabled={!filters.selectedDistrictCode || loadingLocations} options={wards.map(w => ({ value: w.code, label: w.name }))} defaultLabel={!filters.selectedDistrictCode ? "Chọn quận/huyện trước" : "Tất cả phường/xã"} />
              <FilterSelect icon={Car} label="Hãng xe" value={filters.selectedBrandId || ""} onChange={e => handleFilterChange("selectedBrandId", e.target.value ? Number(e.target.value) : null)} options={brands.map(b => ({ value: b.brandId, label: b.name }))} defaultLabel="Tất cả hãng" />
              <FilterSelect icon={Car} label="Mẫu xe" value={filters.selectedModelId || ""} onChange={e => handleFilterChange("selectedModelId", e.target.value ? Number(e.target.value) : null)} disabled={!filters.selectedBrandId} options={models.map(m => ({ value: m.modelId, label: m.name }))} defaultLabel={!filters.selectedBrandId ? "Chọn hãng trước" : "Tất cả mẫu xe"} />
              <FilterSelect icon={DollarSign} label="Khoảng giá" value={filters.priceRange} onChange={e => handleFilterChange("priceRange", e.target.value)} options={PRICE_RANGES} defaultLabel="Tất cả mức giá" />
              <FilterSelect icon={Calendar} label="Năm sản xuất" value={filters.yearRange} onChange={e => handleFilterChange("yearRange", e.target.value)} options={YEARS.map(y => ({ value: y, label: String(y) }))} defaultLabel="Tất cả năm" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 bg-[#2ECC71] text-white py-4 px-8 rounded-lg font-semibold hover:bg-[#27AE60] transition-colors flex items-center justify-center space-x-2 shadow-lg">
                <Search className="h-5 w-5" />
                <span>Tìm kiếm ({filteredPosts.length})</span>
              </motion.button>
              {Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : v) && (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={resetFilters} className="sm:w-auto border-2 border-red-300 text-red-600 py-4 px-8 rounded-lg font-semibold hover:bg-red-50 transition-colors flex items-center justify-center space-x-2">
                  <X className="h-5 w-5" />
                  <span>Xóa bộ lọc</span>
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Priority & Controls */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mt-6 bg-white rounded-xl shadow-md p-4 flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">Lọc theo gói:</span>
            {Object.entries(PRIORITY_CONFIG).reverse().map(([priority, config]) => (
              <button key={priority} onClick={() => togglePriority(Number(priority))} className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${filters.selectedPriority.includes(Number(priority)) ? `${config.badge} shadow-lg` : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                <config.icon className="w-4 h-4" />
                {config.label.charAt(0) + config.label.slice(1).toLowerCase()}
              </button>
            ))}
            <div className="flex-1"></div>
            <select value={filters.sortBy} onChange={e => handleFilterChange("sortBy", e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ECC71] outline-none text-sm">
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="price-asc">Giá thấp → cao</option>
              <option value="price-desc">Giá cao → thấp</option>
            </select>
            <div className="flex border-2 border-gray-200 rounded-lg overflow-hidden">
              <button onClick={() => setViewMode("grid")} className={`p-2 transition ${viewMode === "grid" ? "bg-[#2ECC71] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}><Grid3x3 className="w-5 h-5" /></button>
              <button onClick={() => setViewMode("list")} className={`p-2 transition ${viewMode === "list" ? "bg-[#2ECC71] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}><List className="w-5 h-5" /></button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredPosts.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><Search className="w-10 h-10 text-gray-400" /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy xe điện nào</h3>
              <p className="text-gray-600 mb-6">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
              <button onClick={resetFilters} className="px-6 py-3 bg-[#2ECC71] text-white rounded-lg hover:bg-[#27AE60] transition font-medium">Xóa bộ lọc</button>
            </motion.div>
          ) : (
            <>
              <VehicleGrid posts={filteredPosts} viewMode={viewMode} />
              {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

// =================================================================
// 3. SUBCOMPONENTS (Extracted for clarity)
// =================================================================

const LoadingState: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
      <div className="relative w-20 h-20 mx-auto">
        <div className="w-full h-full border-4 border-green-200 border-t-[#2ECC71] rounded-full animate-spin"></div>
        <Zap className="w-8 h-8 text-[#2ECC71] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>
      <p className="mt-6 text-lg text-gray-700 font-medium">Đang tải xe điện...</p>
    </motion.div>
  </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><X className="w-8 h-8 text-red-600" /></div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      <button onClick={() => window.location.reload()} className="px-6 py-3 bg-[#2ECC71] text-white rounded-lg hover:bg-[#27AE60] transition font-medium">Thử lại</button>
    </motion.div>
  </div>
);

const FilterSelect: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string | number; label: string }[];
  defaultLabel: string;
  disabled?: boolean;
}> = ({ icon: Icon, label, value, onChange, options, defaultLabel, disabled }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-700"><Icon className="inline h-4 w-4 mr-1" />{label}</label>
    <select value={value} onChange={onChange} disabled={disabled} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed">
      <option value="">{disabled && value === "" ? "Đang tải..." : defaultLabel}</option>
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

const VehicleGrid: React.FC<{ posts: ListPostSummary[]; viewMode: "grid" | "list" }> = ({ posts, viewMode }) => {
  const Component = viewMode === "grid" ? VehicleCard : VehicleListItem;
  const containerClasses = viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4";
  return (
    <div className={containerClasses}>
      {posts.map((post, index) => <Component key={post.listingId} post={post} index={index} />)}
    </div>
  );
};

const VehicleCard: React.FC<{ post: ListPostSummary; index: number }> = ({ post, index }) => {
  const config = getPriorityConfig(post.priorityLevel || 1);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }}>
      <Link to={`/xe-dien/${post.listingId}`} className={`group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden block border-2 ${config.border}`}>
        <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
          <img src={post.coverThumb || "https://via.placeholder.com/400x300?text=No+Image"} alt={post.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Image+Error"; }} />
          <div className="absolute top-3 right-3"><span className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 shadow-md ${config.badge}`}><config.icon className="w-3.5 h-3.5" />{config.label}</span></div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-base text-[#2C3E50] group-hover:text-[#2ECC71] transition-colors line-clamp-2 mb-3 min-h-[48px]">{post.productName}</h3>
          <p className="text-2xl font-bold text-[#2ECC71] mb-4">{formatPrice(post.askPrice)}</p>
          <div className="flex items-center gap-2 text-sm text-gray-600 pb-3 border-b border-[#A8E6CF]/30"><MapPin className="w-4 h-4 flex-shrink-0 text-[#2ECC71]" /><span className="truncate">{post.address || "Chưa có địa chỉ"}</span></div>
          <div className="flex items-center justify-between pt-3 text-xs text-gray-600">
            <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-[#2ECC71]" /><span>2023</span></div>
            <div className="flex items-center gap-2"><Gauge className="w-3.5 h-3.5 text-[#2ECC71]" /><span>15K km</span></div>
            <div className="flex items-center gap-2"><Battery className="w-3.5 h-3.5 text-[#2ECC71]" /><span>85%</span></div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const VehicleListItem: React.FC<{ post: ListPostSummary; index: number }> = ({ post, index }) => {
  const config = getPriorityConfig(post.priorityLevel || 1);
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }}>
      <Link to={`/xe-dien/${post.listingId}`} className={`group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex border-2 ${config.border}`}>
        <div className="w-72 flex-shrink-0 bg-gray-50 overflow-hidden relative">
          <img src={post.coverThumb || "https://via.placeholder.com/400x300?text=No+Image"} alt={post.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Image+Error"; }} />
          <div className="absolute top-4 right-4"><span className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-md ${config.badge}`}><config.icon className="w-4 h-4" />{config.label}</span></div>
        </div>
        <div className="flex-1 p-6 flex flex-col">
          <div className="flex-1">
            <h3 className="font-bold text-xl text-[#2C3E50] group-hover:text-[#2ECC71] transition-colors mb-2">{post.productName}</h3>
            <div className="flex items-center gap-2 text-gray-600 mb-4"><MapPin className="w-4 h-4 text-[#2ECC71]" /><span className="text-sm">{post.address || "Chưa có địa chỉ"}</span></div>
            <div className="flex items-center gap-6 text-sm text-gray-600 mb-4 pb-4 border-b border-[#A8E6CF]/30">
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[#2ECC71]" /><span>Năm: <strong className="text-[#2C3E50]">2023</strong></span></div>
              <div className="flex items-center gap-2"><Gauge className="w-4 h-4 text-[#2ECC71]" /><span>Km: <strong className="text-[#2C3E50]">15,000</strong></span></div>
              <div className="flex items-center gap-2"><Battery className="w-4 h-4 text-[#2ECC71]" /><span>Pin: <strong className="text-[#2C3E50]">85%</strong></span></div>
              <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-[#2ECC71]" /><span>Dung lượng: <strong className="text-[#2C3E50]">90 kWh</strong></span></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-[#2ECC71] mb-1">{formatPrice(post.askPrice)}</p>
              <p className="text-sm text-gray-600">Có thể thương lượng</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={(e) => e.preventDefault()} className="px-5 py-2.5 border-2 border-[#2ECC71] text-[#2ECC71] rounded-lg hover:bg-[#A8E6CF]/20 transition font-medium">Liên hệ</button>
              <div className="px-6 py-2.5 bg-[#2ECC71] text-white rounded-lg hover:bg-[#27AE60] transition font-medium">Xem chi tiết</div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const Pagination: React.FC<{ currentPage: number; totalPages: number; onPageChange: (page: number) => void }> = ({ currentPage, totalPages, onPageChange }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-12 flex items-center justify-center gap-2">
    <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0} className="p-3 border-2 border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"><ChevronLeft className="w-5 h-5" /></button>
    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
      <button key={i} onClick={() => onPageChange(i)} className={`min-w-[44px] h-11 rounded-lg font-medium transition ${currentPage === i ? "bg-[#2ECC71] text-white shadow-lg" : "border-2 border-gray-200 text-gray-700 hover:bg-gray-50"}`}>{i + 1}</button>
    ))}
    <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages - 1} className="p-3 border-2 border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"><ChevronRight className="w-5 h-5" /></button>
  </motion.div>
);

export default ElectricVehiclesPage;
