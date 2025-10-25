import React from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Battery, Calendar, MapPin, Star, Eye } from "lucide-react";
import { motion } from "framer-motion";

interface Product {
  id: string;
  type: "vehicle" | "battery";
  title: string;
  brand: string;
  price: string;
  originalPrice?: string;
  image: string;
  location: string;
  year: number;
  batteryCapacity?: string;
  mileage?: string;
  condition: string;
  rating: number;
  views: number;
  isPopular?: boolean;
  isNew?: boolean;
}

const FeaturedProducts: React.FC = () => {
  const navigate = useNavigate();

  const featuredProducts: Product[] = [
    {
      id: "1",
      type: "vehicle",
      title: "VinFast VF8 Plus",
      brand: "VinFast",
      price: "1.2 tỷ",
      originalPrice: "1.4 tỷ",
      image: "/api/placeholder/400/300",
      location: "Hà Nội",
      year: 2023,
      batteryCapacity: "87.7 kWh",
      mileage: "12,000 km",
      condition: "Tốt 95%",
      rating: 4.8,
      views: 1250,
      isPopular: true,
    },
    {
      id: "2",
      type: "vehicle",
      title: "Tesla Model 3",
      brand: "Tesla",
      price: "1.8 tỷ",
      image: "/api/placeholder/400/300",
      location: "TP.HCM",
      year: 2022,
      batteryCapacity: "75 kWh",
      mileage: "25,000 km",
      condition: "Tốt 92%",
      rating: 4.9,
      views: 2100,
      isNew: true,
    },
    {
      id: "3",
      type: "battery",
      title: "Pin Lithium-ion 100kWh",
      brand: "CATL",
      price: "450 triệu",
      originalPrice: "500 triệu",
      image: "/api/placeholder/400/300",
      location: "Đà Nẵng",
      year: 2023,
      condition: "Mới 98%",
      rating: 4.7,
      views: 890,
    },
    {
      id: "4",
      type: "vehicle",
      title: "BMW iX3",
      brand: "BMW",
      price: "2.3 tỷ",
      image: "/api/placeholder/400/300",
      location: "Hà Nội",
      year: 2023,
      batteryCapacity: "80 kWh",
      mileage: "8,500 km",
      condition: "Tốt 96%",
      rating: 4.6,
      views: 1650,
      isPopular: true,
    },
    {
      id: "5",
      type: "vehicle",
      title: "Hyundai Kona Electric",
      brand: "Hyundai",
      price: "850 triệu",
      image: "/api/placeholder/400/300",
      location: "Hải Phòng",
      year: 2022,
      batteryCapacity: "64 kWh",
      mileage: "35,000 km",
      condition: "Tốt 88%",
      rating: 4.5,
      views: 760,
    },
    {
      id: "6",
      type: "battery",
      title: "Bộ pin LiFePO4 60kWh",
      brand: "BYD",
      price: "320 triệu",
      image: "/api/placeholder/400/300",
      location: "TP.HCM",
      year: 2023,
      condition: "Mới 99%",
      rating: 4.8,
      views: 540,
      isNew: true,
    },
  ];

  const formatPrice = (price: string) => {
    return price;
  };

  const handleViewDetail = (product: Product) => {
    if (product.type === "vehicle") {
      navigate(`/xe-dien/${product.id}`);
    } else {
      navigate(`/pin/${product.id}`);
    }
  };

  const ProductCard: React.FC<{ product: Product; index: number }> = ({
    product,
    index,
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden">
        {/* Product Image Placeholder */}
        <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="text-center">
            {product.type === "vehicle" ? (
              <div className="w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg
                  className="w-10 h-10 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 11l1.5-4.5h11L19 11m-1.5 5a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0m-11 0a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0M17 8V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2" />
                </svg>
              </div>
            ) : (
              <div className="w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Battery className="w-10 h-10 text-gray-500" />
              </div>
            )}
            <p className="text-sm text-gray-500 font-medium">{product.brand}</p>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isPopular && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Phổ biến
            </span>
          )}
          {product.isNew && (
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Mới
            </span>
          )}
        </div>

        {/* Heart Icon */}
        <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors group">
          <Heart className="w-4 h-4 text-gray-600 group-hover:text-red-500 transition-colors" />
        </button>

        {/* Views */}
        <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
          <Eye className="w-3 h-3" />
          <span>{product.views}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title & Brand */}
        <div className="mb-3">
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-green-600 transition-colors mb-1">
            {product.title}
          </h3>
          <p className="text-sm text-gray-500">{product.brand}</p>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-green-600">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="flex items-center space-x-1 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{product.location}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{product.year}</span>
          </div>
          {product.batteryCapacity && (
            <div className="flex items-center space-x-1 text-gray-600">
              <Battery className="w-4 h-4" />
              <span>{product.batteryCapacity}</span>
            </div>
          )}
          {product.mileage && (
            <div className="flex items-center space-x-1 text-gray-600">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>{product.mileage}</span>
            </div>
          )}
        </div>

        {/* Condition & Rating */}
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            {product.condition}
          </span>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-semibold text-gray-700">
              {product.rating}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleViewDetail(product)}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Xem chi tiết
          </button>
          <button className="border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:border-green-500 hover:text-green-600 transition-colors">
            Liên hệ
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Sản phẩm nổi bật
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Khám phá những chiếc xe điện và bộ pin chất lượng cao được đánh giá
            tốt nhất
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold">
            Tất cả
          </button>
          <button className="bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 border border-gray-200">
            Xe điện
          </button>
          <button className="bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 border border-gray-200">
            Pin & Phụ kiện
          </button>
          <button className="bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 border border-gray-200">
            Mới nhất
          </button>
          <button className="bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 border border-gray-200">
            Giá tốt
          </button>
        </motion.div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {/* Load More Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <button className="bg-white border-2 border-green-600 text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-600 hover:text-white transition-colors">
            Xem thêm sản phẩm
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
