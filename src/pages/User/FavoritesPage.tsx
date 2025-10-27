import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  HeartOff,
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
} from "lucide-react";

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
}

const FavoritesPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - trong thực tế sẽ lấy từ API
  const [favorites, setFavorites] = useState<FavoriteItem[]>([
    {
      id: "1",
      title: "Tesla Model 3 2020 - Xe điện cao cấp",
      price: 850000000,
      originalPrice: 1200000000,
      image: "/api/placeholder/300/200",
      location: "Hồ Chí Minh",
      datePosted: "2024-01-15",
      views: 1250,
      isFavorite: true,
      rating: 4.8,
      type: "vehicle",
      brand: "Tesla",
      model: "Model 3",
      year: 2020,
      mileage: 25000,
      condition: "excellent",
    },
    {
      id: "2",
      title: "Pin Lithium 60kWh - Tương thích Tesla Model S",
      price: 45000000,
      image: "/api/placeholder/300/200",
      location: "Hà Nội",
      datePosted: "2024-01-14",
      views: 890,
      isFavorite: true,
      rating: 4.6,
      type: "battery",
      brand: "Tesla",
      model: "Model S",
      batteryCapacity: 60,
      condition: "good",
    },
    {
      id: "3",
      title: "BMW i3 2019 - Xe điện đô thị",
      price: 650000000,
      originalPrice: 950000000,
      image: "/api/placeholder/300/200",
      location: "Đà Nẵng",
      datePosted: "2024-01-13",
      views: 2100,
      isFavorite: true,
      rating: 4.7,
      type: "vehicle",
      brand: "BMW",
      model: "i3",
      year: 2019,
      mileage: 18000,
      condition: "excellent",
    },
  ]);

  const handleRemoveFavorite = (id: string) => {
    setFavorites(favorites.filter((item) => item.id !== id));
  };

  const handleToggleFavorite = (id: string) => {
    setFavorites(
      favorites.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  const filteredFavorites = favorites.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getConditionText = (condition: string) => {
    const conditions = {
      excellent: "Xuất sắc",
      good: "Tốt",
      fair: "Khá",
      poor: "Trung bình",
    };
    return conditions[condition as keyof typeof conditions];
  };

  const getConditionColor = (condition: string) => {
    const colors = {
      excellent: "text-green-600 bg-green-100",
      good: "text-blue-600 bg-blue-100",
      fair: "text-yellow-600 bg-yellow-100",
      poor: "text-red-600 bg-red-100",
    };
    return colors[condition as keyof typeof colors];
  };

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
                  className={`p-2 ${
                    viewMode === "grid"
                      ? "bg-green-600 text-white"
                      : "text-gray-600 hover:text-green-600"
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${
                    viewMode === "list"
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
              Chưa có sản phẩm yêu thích
            </h3>
            <p className="text-gray-500 mb-6">
              Hãy khám phá và thêm sản phẩm vào danh sách yêu thích của bạn
            </p>
            <Link
              to="/xe-dien"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Khám phá xe điện
            </Link>
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
                className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${
                  viewMode === "list" ? "flex" : ""
                }`}
              >
                {/* Image */}
                <div
                  className={`${
                    viewMode === "list" ? "w-48 flex-shrink-0" : ""
                  }`}
                >
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className={`w-full object-cover ${
                        viewMode === "list" ? "h-32" : "h-48"
                      }`}
                    />
                    <div className="absolute top-2 left-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(
                          item.condition
                        )}`}
                      >
                        {getConditionText(item.condition)}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => handleToggleFavorite(item.id)}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                      >
                        {item.isFavorite ? (
                          <Heart className="h-5 w-5 text-red-500 fill-current" />
                        ) : (
                          <HeartOff className="h-5 w-5 text-gray-400" />
                        )}
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
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <MapPin className="h-4 w-4" />
                        <span>{item.location}</span>
                        <Calendar className="h-4 w-4 ml-2" />
                        <span>{formatDate(item.datePosted)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-900 ml-1">
                          {item.rating}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Eye className="h-4 w-4 mr-1" />
                        <span>{item.views.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
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
                        onClick={() => handleRemoveFavorite(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Xóa khỏi yêu thích"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                        title="Chia sẻ"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <Link
                      to={`/${item.type === "vehicle" ? "xe-dien" : "pin"}/${
                        item.id
                      }`}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-center block"
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
