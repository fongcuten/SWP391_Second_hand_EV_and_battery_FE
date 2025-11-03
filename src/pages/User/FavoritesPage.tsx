import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Eye,
  Calendar,
  MapPin,
  Star,
  Filter,
  Search,
  Grid,
  List,
  Trash2,
  Share2,
  Loader2,
} from "lucide-react";
import { FavoriteService, type FavoriteItem as ApiFavoriteItem } from "../../services/FavoriteService";
import { toast } from "react-toastify";

interface FavoriteItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  location: string;
  datePosted: string;
  views: number;
  isFavorite: boolean;
  rating: number;
  type: "vehicle" | "battery";
  brand: string;
  model: string;
  year?: number;
  mileage?: number;
  batteryCapacity?: number;
  condition: "excellent" | "good" | "fair" | "poor";
  listingId: number;
  username: string;
  description: string;
}

const FavoritesPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Load favorites from API
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("📥 Loading favorites from API...");

      const apiFavorites = await FavoriteService.getCurrentUserFavorites();

      console.log("✅ API Favorites received:", apiFavorites);
      console.log("✅ Favorites count:", apiFavorites.length);

      if (!apiFavorites || apiFavorites.length === 0) {
        console.log("ℹ️ No favorites found");
        setFavorites([]);
        setLoading(false);
        return;
      }

      // ✅ Transform API data to component format
      const transformedFavorites: FavoriteItem[] = apiFavorites.map((item, index) => {
        console.log(`🔄 Transforming item ${index + 1}:`, item);

        const transformed = {
          id: String(item.listingId),
          listingId: item.listingId,
          username: item.username || "Unknown",
          description: item.description || "No description",
          title: item.title || item.description || `${item.productType} #${item.listingId}`,
          price: item.askPrice || 0,
          originalPrice: undefined,
          image: item.image || "https://via.placeholder.com/300x200?text=No+Image",
          location: item.location || "Không xác định",
          datePosted: item.createdAt || new Date().toISOString(),
          views: item.views || 0,
          isFavorite: true,
          rating: item.rating || 0,
          type: item.productType === "EV" ? "vehicle" as const : "battery" as const,
          brand: item.brand || "Unknown",
          model: item.model || "Unknown",
          year: item.year,
          mileage: item.mileage,
          batteryCapacity: item.batteryCapacity,
          condition: (item.condition || "good") as "excellent" | "good" | "fair" | "poor",
        };

        console.log(`✅ Transformed item ${index + 1}:`, transformed);
        return transformed;
      });

      console.log("✅ All transformed favorites:", transformedFavorites);

      setFavorites(transformedFavorites);
    } catch (err: any) {
      console.error("❌ Error loading favorites:", err);
      setError(err.message || "Không thể tải danh sách yêu thích");
      toast.error("Không thể tải danh sách yêu thích");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (listingId: number) => {
    try {
      console.log("🗑️ Removing favorite:", listingId);

      await FavoriteService.removeFavorite(listingId);

      // ✅ Update local state
      setFavorites(prev => prev.filter((item) => item.listingId !== listingId));

      toast.success("Đã xóa khỏi danh sách yêu thích");
      console.log("✅ Favorite removed successfully");
    } catch (err: any) {
      console.error("❌ Error removing favorite:", err);
      toast.error(err.message || "Không thể xóa khỏi yêu thích");
    }
  };

  const handleShare = (item: FavoriteItem) => {
    const url = `${window.location.origin}/${item.type === "vehicle" ? "xe-dien" : "pin"}/${item.id}`;

    if (navigator.share) {
      navigator
        .share({
          title: item.title,
          text: `Xem ${item.title} - ${formatPrice(item.price)}`,
          url: url,
        })
        .then(() => toast.success("Đã chia sẻ thành công"))
        .catch((err) => console.error("Share failed:", err));
    } else {
      navigator.clipboard
        .writeText(url)
        .then(() => toast.success("Đã sao chép liên kết"))
        .catch(() => toast.error("Không thể sao chép liên kết"));
    }
  };

  // ✅ Apply filters and sorting
  const filteredFavorites = favorites
    .filter((item) => {
      const matchesSearch = item.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        item.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || item.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime();
        case "oldest":
          return new Date(a.datePosted).getTime() - new Date(b.datePosted).getTime();
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
  };

  const getConditionText = (condition: string) => {
    const conditions = {
      excellent: "Xuất sắc",
      good: "Tốt",
      fair: "Khá",
      poor: "Trung bình",
    };
    return conditions[condition as keyof typeof conditions] || "Không xác định";
  };

  const getConditionColor = (condition: string) => {
    const colors = {
      excellent: "text-green-600 bg-green-100",
      good: "text-blue-600 bg-blue-100",
      fair: "text-yellow-600 bg-yellow-100",
      poor: "text-red-600 bg-red-100",
    };
    return colors[condition as keyof typeof colors] || "text-gray-600 bg-gray-100";
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải danh sách yêu thích...</p>
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không thể tải danh sách yêu thích
          </h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={loadFavorites}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Heart className="h-8 w-8 text-red-500 mr-3" />
                Danh sách yêu thích
              </h1>
              <p className="text-gray-600 mt-2">
                Quản lý các sản phẩm bạn đã yêu thích
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                {filteredFavorites.length} sản phẩm
              </span>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm trong yêu thích..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">Tất cả</option>
                  <option value="vehicle">Xe điện</option>
                  <option value="battery">Pin</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="price-low">Giá thấp</option>
                  <option value="price-high">Giá cao</option>
                  <option value="rating">Đánh giá cao</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid"
                    ? "bg-green-600 text-white"
                    : "text-gray-600 hover:text-green-600"
                    }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list"
                    ? "bg-green-600 text-white"
                    : "text-gray-600 hover:text-green-600"
                    }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Favorites List */}
        {filteredFavorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || filterType !== "all"
                ? "Không tìm thấy sản phẩm"
                : "Chưa có sản phẩm yêu thích"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || filterType !== "all"
                ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                : "Hãy khám phá và thêm sản phẩm vào danh sách yêu thích của bạn"}
            </p>
            {!searchQuery && filterType === "all" && (
              <Link
                to="/xe-dien"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Khám phá xe điện
              </Link>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredFavorites.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${viewMode === "list" ? "flex" : ""
                  }`}
              >
                {/* Image */}
                <div className={`${viewMode === "list" ? "w-48 flex-shrink-0" : ""}`}>
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className={`w-full object-cover ${viewMode === "list" ? "h-full" : "h-48"}`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://via.placeholder.com/300x200?text=No+Image";
                      }}
                    />
                    <div className="absolute top-2 left-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}
                      >
                        {getConditionText(item.condition)}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => handleRemoveFavorite(item.listingId)}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                        title="Xóa khỏi yêu thích"
                      >
                        <Heart className="h-5 w-5 text-red-500 fill-current" />
                      </button>
                    </div>
                    {item.originalPrice && (
                      <div className="absolute bottom-2 left-2">
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                          -
                          {Math.round(
                            ((item.originalPrice - item.price) /
                              item.originalPrice) *
                            100
                          )}
                          %
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">
                        Người đăng: {item.username}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <MapPin className="h-4 w-4" />
                        <span>{item.location}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(item.datePosted)}</span>
                      </div>
                    </div>
                  </div>

                  {(item.rating > 0 || item.views > 0) && (
                    <div className="flex items-center space-x-3 mb-3">
                      {item.rating > 0 && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-gray-900 ml-1">
                            {item.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                      {item.views > 0 && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Eye className="h-4 w-4 mr-1" />
                          <span>{item.views.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        {formatPrice(item.price)}
                      </div>
                      {item.originalPrice && (
                        <div className="text-sm text-gray-500 line-through">
                          {formatPrice(item.originalPrice)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRemoveFavorite(item.listingId)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Xóa khỏi yêu thích"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleShare(item)}
                        className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                        title="Chia sẻ"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <Link
                      to={`/${item.type === "vehicle" ? "xe-dien" : "pin"}/${item.id}`}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-center block text-sm font-medium"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
