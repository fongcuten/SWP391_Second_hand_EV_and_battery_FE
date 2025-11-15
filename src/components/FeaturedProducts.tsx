import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart,  MapPin,Zap } from "lucide-react";
import { motion } from "framer-motion";
import { ListPostService, type ListPostSummary } from "../services/Vehicle/ElectricVehiclesPageService";
import { BatteriesPageService } from "../services/Vehicle/BatteriesPageService";
import { locationService } from "../services/locationService";

type FilterType = 'all' | 'vehicle' | 'battery';

const FeaturedProducts: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [products, setProducts] = useState<ListPostSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let response;
        if (activeFilter === 'vehicle') {
          response = await ListPostService.getSalePosts(0, 6);
        } else if (activeFilter === 'battery') {
          response = await BatteriesPageService.getBatteryPosts(0, 6, {
            // Don't send sortBy, let backend use default
          });
        } else { // 'all'
          const [vehicleResponse, batteryResponse] = await Promise.all([
            ListPostService.getSalePosts(0, 3),
            BatteriesPageService.getBatteryPosts(0, 3, {
              // Don't send sortBy, let backend use default
            })
          ]);
          response = {
            ...vehicleResponse,
            content: [...(vehicleResponse.content || []), ...(batteryResponse.content || [])]
          };
        }

        const productsWithAddress = await Promise.all(
          (response.content || []).map(async (post) => {
            if (post.provinceCode && post.districtCode && post.wardCode) {
              try {
                const fullAddress = await locationService.getFullAddress(post.provinceCode, post.districtCode, post.wardCode, post.address);
                return { ...post, address: fullAddress };
              } catch { /* Use default address on error */ }
            }
            return { ...post, address: post.address || "Không xác định" };
          })
        );

        setProducts(productsWithAddress);
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeFilter]);

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(2)} tỷ`;
    }
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} triệu`;
    }
    return price.toLocaleString('vi-VN') + ' đ';
  };

  const handleViewDetail = (product: ListPostSummary) => {
    if (product.productType === "VEHICLE") {
      navigate(`/xe-dien/${product.listingId}`);
    } else {
      navigate(`/pin/${product.listingId}`);
    }
  };

  const ProductCard: React.FC<{ product: ListPostSummary; index: number }> = ({
    product,
    index,
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group flex flex-col"
    >
      <div className="relative overflow-hidden cursor-pointer" onClick={() => handleViewDetail(product)}>
        <img src={product.coverThumb || '/api/placeholder/400/300'} alt={product.productName} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
        {product.priorityLevel && product.priorityLevel >= 2 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Zap className="w-3 h-3" /> Tin ưu tiên
          </span>
        )}
        <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors group">
          <Heart className="w-4 h-4 text-gray-600 group-hover:text-red-500 transition-colors" />
        </button>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3
          className="font-bold text-lg text-gray-900 group-hover:text-green-600 transition-colors mb-2 truncate cursor-pointer"
          title={product.productName}
          onClick={() => handleViewDetail(product)}
        >
          {product.productName}
        </h3>
        <div className="mb-4">
          <span className="text-2xl font-bold text-green-600">
            {formatPrice(product.askPrice)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm flex-grow">
          <div className="flex items-center space-x-1 text-gray-600 truncate">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{product.address}</span>
          </div>
        </div>
        <div className="flex gap-2 mt-auto">
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

  const renderContent = () => {
    if (loading) {
      return <div className="text-center col-span-full p-10">Đang tải sản phẩm...</div>;
    }
    if (products.length === 0) {
      return <div className="text-center col-span-full p-10">Không tìm thấy sản phẩm nào.</div>;
    }
    return products.map((product, index) => (
      <ProductCard key={product.listingId} product={product} index={index} />
    ));
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          <button onClick={() => setActiveFilter('all')} className={`px-6 py-3 rounded-lg font-semibold transition-colors ${activeFilter === 'all' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>
            Tất cả
          </button>
          <button onClick={() => setActiveFilter('vehicle')} className={`px-6 py-3 rounded-lg font-semibold transition-colors ${activeFilter === 'vehicle' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>
            Xe điện
          </button>
          <button onClick={() => setActiveFilter('battery')} className={`px-6 py-3 rounded-lg font-semibold transition-colors ${activeFilter === 'battery' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>
            Pin
          </button>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {renderContent()}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <button onClick={() => navigate('/xe-dien')} className="bg-white border-2 border-green-600 text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-600 hover:text-white transition-colors">
            Xem thêm sản phẩm
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
