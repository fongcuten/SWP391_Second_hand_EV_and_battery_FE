import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  Grid3x3,
  List,
  MapPin,
  Calendar,
  Gauge,
  Zap,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Star,
  Crown,
  Award,
} from "lucide-react";
import { ListPostService, type ListPostSummary, type ListPostFilters } from "../service/Vehicle/ElectricVehiclesPageService";

const ElectricVehiclesPage: React.FC = () => {
  // State
  const [posts, setPosts] = useState<ListPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [provinceSearch, setProvinceSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000000]);
  const [yearRange, setYearRange] = useState<[number, number]>([2015, 2025]);
  const [selectedPriority, setSelectedPriority] = useState<number[]>([]);

  // Sort
  const [sortBy, setSortBy] = useState("newest");

  // Load posts
  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await ListPostService.getSalePosts(
          currentPage,
          pageSize,
          "",
          undefined
        );

        const vehiclePosts = response.content?.filter(
          (post) => post.productType === "VEHICLE"
        ) || [];

        // Sort by priority first, then by selected sort
        let sorted = [...vehiclePosts].sort((a, b) => {
          // Higher priority comes first
          if (b.priorityLevel !== a.priorityLevel) {
            return b.priorityLevel - a.priorityLevel;
          }

          // Then apply user-selected sort
          if (sortBy === "price-asc") {
            return a.askPrice - b.askPrice;
          } else if (sortBy === "price-desc") {
            return b.askPrice - a.askPrice;
          }
          return 0;
        });

        setPosts(sorted);
        setTotalPages(response.totalPages || 0);
        setTotalElements(sorted.length);
      } catch (error: any) {
        console.error("❌ Error loading posts:", error);
        setError("Không thể tải danh sách xe điện");
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [currentPage, pageSize, sortBy]);

  // Search and filter
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = searchTerm
      ? post.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.address?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesProvince = provinceSearch
      ? post.address?.toLowerCase().includes(provinceSearch.toLowerCase()) ||
      post.provinceCode?.toString().includes(provinceSearch)
      : true;

    const matchesPrice =
      post.askPrice >= priceRange[0] && post.askPrice <= priceRange[1];

    const matchesPriority =
      selectedPriority.length === 0 ||
      selectedPriority.includes(post.priorityLevel || 1);

    return matchesSearch && matchesProvince && matchesPrice && matchesPriority;
  });

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`;
    }
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} triệu`;
    }
    return `${price.toLocaleString("vi-VN")} đ`;
  };

  // Get card styling based on priority
  const getPriorityStyle = (priority: number) => {
    switch (priority) {
      case 3: // Premium
        return {
          badge: {
            bg: "bg-gradient-to-r from-yellow-400 to-orange-500",
            text: "text-white",
            icon: Crown,
            label: "PREMIUM",
          },
          card: "border-4 border-yellow-400 shadow-2xl shadow-yellow-200/50",
          overlay: "bg-gradient-to-t from-yellow-500/20 to-transparent",
          ring: "ring-4 ring-yellow-400/50",
        };
      case 2: // Standard
        return {
          badge: {
            bg: "bg-gradient-to-r from-blue-500 to-purple-500",
            text: "text-white",
            icon: Award,
            label: "STANDARD",
          },
          card: "border-3 border-blue-400 shadow-xl shadow-blue-200/50",
          overlay: "bg-gradient-to-t from-blue-500/10 to-transparent",
          ring: "ring-2 ring-blue-400/50",
        };
      default: // Normal
        return {
          badge: {
            bg: "bg-gray-600",
            text: "text-white",
            icon: Star,
            label: "HOT",
          },
          card: "border-2 border-transparent",
          overlay: "",
          ring: "",
        };
    }
  };

  const togglePriority = (priority: number) => {
    setSelectedPriority((prev) =>
      prev.includes(priority)
        ? prev.filter((p) => p !== priority)
        : [...prev, priority]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <Zap className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="mt-6 text-lg text-gray-600 font-medium">
              Đang tải danh sách xe điện...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Xe Điện Đã Qua Sử Dụng
              </h1>
              <p className="text-gray-600 mt-1">
                Khám phá {totalElements} xe điện chất lượng cao với giá tốt nhất
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col gap-4">
            {/* Search Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Main Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tên xe, thương hiệu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Province Search */}
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm theo tỉnh/thành phố..."
                  value={provinceSearch}
                  onChange={(e) => setProvinceSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Sort Dropdown */}
              <div className="lg:w-64">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white cursor-pointer"
                >
                  <option value="newest">📅 Mới nhất</option>
                  <option value="oldest">📅 Cũ nhất</option>
                  <option value="price-asc">💰 Giá thấp → cao</option>
                  <option value="price-desc">💰 Giá cao → thấp</option>
                </select>
              </div>

              {/* Priority Filter Chips */}
              <div className="flex-1 flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-600">Ưu tiên:</span>
                <button
                  onClick={() => togglePriority(3)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedPriority.includes(3)
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  <Crown className="w-4 h-4 inline mr-1" />
                  Premium
                </button>
                <button
                  onClick={() => togglePriority(2)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedPriority.includes(2)
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  <Award className="w-4 h-4 inline mr-1" />
                  Standard
                </button>
                <button
                  onClick={() => togglePriority(1)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedPriority.includes(1)
                    ? "bg-gray-700 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  <Star className="w-4 h-4 inline mr-1" />
                  Normal
                </button>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span className="hidden sm:inline">Bộ lọc</span>
              </button>

              {/* View Mode Toggle */}
              <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 transition-colors ${viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 transition-colors ${viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t-2 border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Khoảng giá (VNĐ)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Giá từ (VD: 100000000)"
                      value={priceRange[0] === 0 ? "" : priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([
                          e.target.value === "" ? 0 : Number(e.target.value),
                          priceRange[1],
                        ])
                      }
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Giá đến (VD: 2000000000)"
                      value={priceRange[1] === 10000000000 ? "" : priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([
                          priceRange[0],
                          e.target.value === "" ? 10000000000 : Number(e.target.value),
                        ])
                      }
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                {/* Year Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Năm sản xuất
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Năm từ (VD: 2015)"
                      value={yearRange[0]}
                      onChange={(e) => setYearRange([Number(e.target.value), yearRange[1]])}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      min="2000"
                      max="2025"
                    />
                    <input
                      type="number"
                      placeholder="Năm đến (VD: 2025)"
                      value={yearRange[1]}
                      onChange={(e) => setYearRange([yearRange[0], Number(e.target.value)])}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      min="2000"
                      max="2025"
                    />
                  </div>
                </div>

                {/* Reset Button */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Thao tác
                  </label>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setProvinceSearch("");
                      setPriceRange([0, 10000000000]);
                      setYearRange([2015, 2025]);
                      setSelectedPriority([]);
                    }}
                    className="w-full px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors font-medium border-2 border-red-200"
                  >
                    🔄 Đặt lại tất cả bộ lọc
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Hiển thị <span className="font-semibold text-gray-900">{filteredPosts.length}</span> kết quả
          </p>
        </div>

        {/* Vehicle Grid/List */}
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Không tìm thấy xe điện nào
            </h3>
            <p className="text-gray-600 mb-6">
              Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setProvinceSearch("");
                setPriceRange([0, 10000000000]);
                setYearRange([2015, 2025]);
                setSelectedPriority([]);
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPosts.map((post) => {
                  const priorityStyle = getPriorityStyle(post.priorityLevel || 1);
                  const BadgeIcon = priorityStyle.badge.icon;

                  return (
                    <Link
                      key={post.listingId}
                      to={`/xe-dien/${post.listingId}`}
                      className={`group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden hover:border-blue-500 ${priorityStyle.card} ${priorityStyle.ring}`}
                    >
                      {/* Image */}
                      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                        <img
                          src={post.coverThumb || "https://via.placeholder.com/400x300?text=No+Image"}
                          alt={post.productName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/400x300?text=Image+Error";
                          }}
                        />
                        {/* Priority Overlay */}
                        {priorityStyle.overlay && (
                          <div className={`absolute inset-0 ${priorityStyle.overlay}`}></div>
                        )}
                        {/* Priority Badge */}
                        <div className="absolute top-3 left-3">
                          <span
                            className={`px-3 py-1.5 ${priorityStyle.badge.bg} ${priorityStyle.badge.text} text-xs font-bold rounded-full flex items-center gap-1 shadow-lg`}
                          >
                            <BadgeIcon className="w-3.5 h-3.5" />
                            {priorityStyle.badge.label}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="font-bold text-lg mb-3 line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                          {post.productName}
                        </h3>

                        {/* Price */}
                        <div className="mb-4">
                          <p className="text-2xl font-bold text-blue-600">
                            {formatPrice(post.askPrice)}
                          </p>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            {post.address || "Chưa có địa chỉ"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {filteredPosts.map((post) => {
                  const priorityStyle = getPriorityStyle(post.priorityLevel || 1);
                  const BadgeIcon = priorityStyle.badge.icon;

                  return (
                    <Link
                      key={post.listingId}
                      to={`/xe-dien/${post.listingId}`}
                      className={`group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:border-blue-500 flex ${priorityStyle.card} ${priorityStyle.ring}`}
                    >
                      {/* Image */}
                      <div className="w-64 flex-shrink-0 bg-gray-100 overflow-hidden relative">
                        <img
                          src={post.coverThumb || "https://via.placeholder.com/400x300?text=No+Image"}
                          alt={post.productName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/400x300?text=Image+Error";
                          }}
                        />
                        {/* Priority Overlay */}
                        {priorityStyle.overlay && (
                          <div className={`absolute inset-0 ${priorityStyle.overlay}`}></div>
                        )}
                        {/* Priority Badge */}
                        <div className="absolute top-3 left-3">
                          <span
                            className={`px-3 py-1.5 ${priorityStyle.badge.bg} ${priorityStyle.badge.text} text-xs font-bold rounded-full flex items-center gap-1 shadow-lg`}
                          >
                            <BadgeIcon className="w-3.5 h-3.5" />
                            {priorityStyle.badge.label}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-xl mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
                            {post.productName}
                          </h3>
                          <div className="flex items-center gap-2 text-gray-600 mb-4">
                            <MapPin className="w-4 h-4" />
                            <span>{post.address || "Chưa có địa chỉ"}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-3xl font-bold text-blue-600">
                            {formatPrice(post.askPrice)}
                          </p>
                          <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
                            Xem chi tiết →
                          </button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="p-3 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const pageNum = i;
                  return (
                    <button
                      key={i}
                      onClick={() => handlePageChange(pageNum)}
                      className={`min-w-[44px] h-11 rounded-xl font-medium transition-all ${currentPage === pageNum
                        ? "bg-blue-600 text-white shadow-lg"
                        : "border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="p-3 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ElectricVehiclesPage;
