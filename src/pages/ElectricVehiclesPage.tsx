import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  Grid3x3,
  List,
  MapPin,
  Zap,
  ChevronLeft,
  ChevronRight,
  X,
  Star,
  Crown,
  Award,
} from "lucide-react";
import { ListPostService, type ListPostSummary } from "../services/Vehicle/ElectricVehiclesPageService";

const ElectricVehiclesPage: React.FC = () => {
  const [posts, setPosts] = useState<ListPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [provinceSearch, setProvinceSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000000]);
  const [yearRange, setYearRange] = useState<[number, number]>([2015, 2025]);
  const [selectedPriority, setSelectedPriority] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await ListPostService.getSalePosts(currentPage, pageSize, "", undefined);
        const vehiclePosts = response.content?.filter((post) => post.productType === "VEHICLE") || [];

        console.log("📊 Loaded posts:", vehiclePosts.length);
        console.log("🎯 Priority distribution:", vehiclePosts.map(post => ({
          id: post.listingId,
          name: post.productName,
          priority: post.priorityLevel || 1
        })));

        setPosts(vehiclePosts);
        setTotalPages(response.totalPages || 0);
        setTotalElements(vehiclePosts.length);
      } catch (error: any) {
        console.error("❌ Error loading posts:", error);
        setError("Không thể tải danh sách xe điện");
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [currentPage, pageSize]);

  const filteredPosts = posts
    .filter((post) => {
      const matchesSearch = searchTerm
        ? post.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.address?.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      const matchesProvince = provinceSearch
        ? post.address?.toLowerCase().includes(provinceSearch.toLowerCase()) ||
        post.provinceCode?.toString().includes(provinceSearch)
        : true;

      const matchesPrice = post.askPrice >= priceRange[0] && post.askPrice <= priceRange[1];
      const matchesPriority = selectedPriority.length === 0 || selectedPriority.includes(post.priorityLevel || 1);

      return matchesSearch && matchesProvince && matchesPrice && matchesPriority;
    })
    .sort((a, b) => {
      // Priority first (3 > 2 > 1)
      if (b.priorityLevel !== a.priorityLevel) {
        return (b.priorityLevel || 1) - (a.priorityLevel || 1);
      }

      // Then apply user sort
      switch (sortBy) {
        case "price-asc":
          return a.askPrice - b.askPrice;
        case "price-desc":
          return b.askPrice - a.askPrice;
        case "oldest":
          return new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime();
        case "newest":
        default:
          return new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime();
      }
    });

  const formatPrice = (price: number) => {
    if (price >= 1000000000) return `${(price / 1000000000).toFixed(1)} tỷ`;
    if (price >= 1000000) return `${(price / 1000000).toFixed(0)} triệu`;
    return `${price.toLocaleString("vi-VN")} đ`;
  };

  const getPriorityStyle = (priority: number) => {
    switch (priority) {
      case 3:
        return {
          badge: { bg: "bg-yellow-500", text: "text-white", icon: Crown, label: "PREMIUM" },
          card: "border-2 border-yellow-400 shadow-lg",
          ring: "ring-2 ring-yellow-300",
        };
      case 2:
        return {
          badge: { bg: "bg-blue-500", text: "text-white", icon: Award, label: "STANDARD" },
          card: "border-2 border-blue-400 shadow-md",
          ring: "ring-2 ring-blue-300",
        };
      default:
        return {
          badge: { bg: "bg-gray-500", text: "text-white", icon: Star, label: "NORMAL" },
          card: "border border-gray-200",
          ring: "",
        };
    }
  };

  const togglePriority = (priority: number) => {
    setSelectedPriority((prev) =>
      prev.includes(priority) ? prev.filter((p) => p !== priority) : [...prev, priority]
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setProvinceSearch("");
    setPriceRange([0, 10000000000]);
    setYearRange([2015, 2025]);
    setSelectedPriority([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-[#A8E6CF] border-t-[#2ECC71] rounded-full animate-spin"></div>
              <Zap className="w-8 h-8 text-[#2ECC71] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="mt-6 text-lg text-[#2C3E50] font-medium">Đang tải danh sách xe điện...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F9F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-[#2C3E50] mb-2">Có lỗi xảy ra</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#2ECC71] text-white rounded-xl hover:bg-[#27AE60] transition font-medium"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9F9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#2ECC71] rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#2C3E50]">Xe Điện Đã Qua Sử Dụng</h1>
              <p className="text-gray-600 mt-1">
                Khám phá {totalElements} xe điện chất lượng cao với giá tốt nhất
              </p>
            </div>
          </div>

          {/* Priority Info */}
          <div className="bg-[#F0FDF4] border-2 border-[#A8E6CF] rounded-xl p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-semibold text-[#2C3E50]">🏆 Tin đăng được ưu tiên theo gói:</span>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-600">Premium (Cao nhất)</span>
              </div>
              <span className="text-gray-400">→</span>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-600">Standard</span>
              </div>
              <span className="text-gray-400">→</span>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Normal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 mb-8">
          <div className="flex flex-col gap-4">
            {/* Search Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tên xe, thương hiệu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2ECC71] focus:border-[#2ECC71] outline-none"
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm theo tỉnh/thành phố..."
                  value={provinceSearch}
                  onChange={(e) => setProvinceSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2ECC71] focus:border-[#2ECC71] outline-none"
                />
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Sort */}
              <div className="lg:w-64">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
                >
                  <option value="newest">📅 Mới nhất</option>
                  <option value="oldest">📅 Cũ nhất</option>
                  <option value="price-asc">💰 Giá thấp → cao</option>
                  <option value="price-desc">💰 Giá cao → thấp</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div className="flex-1 flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-[#2C3E50]">Lọc theo ưu tiên:</span>
                <button
                  onClick={() => togglePriority(3)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedPriority.includes(3)
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  <Crown className="w-4 h-4 inline mr-1" />
                  Premium
                </button>
                <button
                  onClick={() => togglePriority(2)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedPriority.includes(2)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  <Award className="w-4 h-4 inline mr-1" />
                  Standard
                </button>
                <button
                  onClick={() => togglePriority(1)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedPriority.includes(1)
                      ? "bg-gray-600 text-white"
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
                className="lg:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-[#2C3E50] rounded-xl transition flex items-center justify-center gap-2 font-medium"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span className="hidden sm:inline">Bộ lọc</span>
              </button>

              {/* View Mode */}
              <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 transition ${viewMode === "grid" ? "bg-[#2ECC71] text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 transition ${viewMode === "list" ? "bg-[#2ECC71] text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t-2 border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-semibold text-[#2C3E50] mb-3">Khoảng giá (VNĐ)</label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Giá từ"
                      value={priceRange[0] === 0 ? "" : priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([e.target.value === "" ? 0 : Number(e.target.value), priceRange[1]])
                      }
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2ECC71] outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Giá đến"
                      value={priceRange[1] === 10000000000 ? "" : priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], e.target.value === "" ? 10000000000 : Number(e.target.value)])
                      }
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2ECC71] outline-none"
                    />
                  </div>
                </div>

                {/* Year Range */}
                <div>
                  <label className="block text-sm font-semibold text-[#2C3E50] mb-3">Năm sản xuất</label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Năm từ"
                      value={yearRange[0]}
                      onChange={(e) => setYearRange([Number(e.target.value), yearRange[1]])}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2ECC71] outline-none"
                      min="2000"
                      max="2025"
                    />
                    <input
                      type="number"
                      placeholder="Năm đến"
                      value={yearRange[1]}
                      onChange={(e) => setYearRange([yearRange[0], Number(e.target.value)])}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2ECC71] outline-none"
                      min="2000"
                      max="2025"
                    />
                  </div>
                </div>

                {/* Reset */}
                <div>
                  <label className="block text-sm font-semibold text-[#2C3E50] mb-3">Thao tác</label>
                  <button
                    onClick={resetFilters}
                    className="w-full px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition font-medium border-2 border-red-200"
                  >
                    🔄 Đặt lại bộ lọc
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Hiển thị <span className="font-semibold text-[#2C3E50]">{filteredPosts.length}</span> kết quả
            {selectedPriority.length > 0 && (
              <span className="ml-2 text-sm text-[#2ECC71]">
                (Lọc: {selectedPriority.map((p) => (p === 3 ? "Premium" : p === 2 ? "Standard" : "Normal")).join(", ")})
              </span>
            )}
          </p>
        </div>

        {/* Results */}
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-[#2C3E50] mb-2">Không tìm thấy xe điện nào</h3>
            <p className="text-gray-600 mb-6">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
            <button
              onClick={resetFilters}
              className="px-6 py-3 bg-[#2ECC71] text-white rounded-xl hover:bg-[#27AE60] transition font-medium"
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
                      className={`group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden ${priorityStyle.card} ${priorityStyle.ring}`}
                    >
                      {/* Image */}
                      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                        <img
                          src={post.coverThumb || "https://via.placeholder.com/400x300?text=No+Image"}
                          alt={post.productName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Image+Error";
                          }}
                        />
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
                        <h3 className="font-bold text-lg mb-3 line-clamp-2 text-[#2C3E50] group-hover:text-[#2ECC71] transition">
                          {post.productName}
                        </h3>

                        <p className="text-2xl font-bold text-[#2ECC71] mb-4">{formatPrice(post.askPrice)}</p>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{post.address || "Chưa có địa chỉ"}</span>
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
                      className={`group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden flex ${priorityStyle.card} ${priorityStyle.ring}`}
                    >
                      {/* Image */}
                      <div className="w-64 flex-shrink-0 bg-gray-100 overflow-hidden relative">
                        <img
                          src={post.coverThumb || "https://via.placeholder.com/400x300?text=No+Image"}
                          alt={post.productName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Image+Error";
                          }}
                        />
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
                          <h3 className="font-bold text-xl mb-3 text-[#2C3E50] group-hover:text-[#2ECC71] transition">
                            {post.productName}
                          </h3>
                          <div className="flex items-center gap-2 text-gray-600 mb-4">
                            <MapPin className="w-4 h-4" />
                            <span>{post.address || "Chưa có địa chỉ"}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-3xl font-bold text-[#2ECC71]">{formatPrice(post.askPrice)}</p>
                          <button className="px-6 py-3 bg-[#2ECC71] text-white rounded-xl hover:bg-[#27AE60] transition font-medium">
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
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="p-3 border-2 border-gray-200 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`min-w-[44px] h-11 rounded-xl font-medium transition ${currentPage === i
                        ? "bg-[#2ECC71] text-white shadow-lg"
                        : "border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="p-3 border-2 border-gray-200 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition"
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
