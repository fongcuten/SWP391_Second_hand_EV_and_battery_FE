import React from "react";
import { ArrowRight, Car, Battery, Star, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import carImage from "../images/image_2025-09-17_105545579-removebg-preview (1) 1.png";
import { Link, useLocation } from "react-router-dom";

const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-green-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-green-400/20 to-blue-500/20"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-green-400 rounded-full blur-xl opacity-30"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500 rounded-full blur-xl opacity-30"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Second hand EV &
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                  Battery Trading
                </span>
                <span className="block text-gray-700 text-3xl lg:text-4xl">
                  Platform
                </span>
              </h1>

              <p className="text-lg text-gray-600 max-w-xl">
                Thị trường hàng đầu dành cho xe điện cũ và thiết bị liên quan.
                Tuyên bố của gia đình rằng, theo gia đình và tổ hợp cộng đồng là
                khu thuộc sở hữu - dẫn ra trong công việc tới.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-slate-700 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-slate-800 transition-colors"
              >
                <Link to="/dang-tin" >
                  <span>Đăng tin ngay</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:border-green-500 hover:text-green-600 transition-colors"
              >
                Tìm kiếm
              </motion.button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4 pt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg p-4 text-center shadow-sm"
              >
                <Car className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Tin của tôi</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg p-4 text-center shadow-sm"
              >
                <Star className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Yêu thích</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-lg p-4 text-center shadow-sm"
              >
                <TrendingUp className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Giá dịch</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-lg p-4 text-center shadow-sm"
              >
                <Battery className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Đánh giá</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Content - Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10">
              {/* Main EV Image Container */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl">
                <div className="relative">
                  {/* EV Car Illustration */}
                  <div className="w-full h-64 bg-gradient-to-r from-gray-700 to-gray-600 rounded-2xl overflow-hidden relative flex items-center justify-center">
                    <img
                      src={carImage}
                      alt="VinFast VF-9"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  {/* Floating Info Cards */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -top-4 -right-4 bg-white rounded-lg p-3 shadow-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <Battery className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-xs text-gray-500">Dung lượng pin</p>
                        <p className="font-semibold text-sm">85 kWh</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                    className="absolute -bottom-4 -left-4 bg-white rounded-lg p-3 shadow-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-500">Quãng đường</p>
                        <p className="font-semibold text-sm">450 km</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Background decoration */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-20 blur-xl"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
