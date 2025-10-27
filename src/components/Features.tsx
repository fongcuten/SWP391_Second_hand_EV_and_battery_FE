import React from 'react';
import { UserPlus, Search, CreditCard, MessageSquare, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const Features: React.FC = () => {
  const features = [
    {
      icon: UserPlus,
      title: 'Đăng ký & Quản lý tài khoản',
      description: 'Đăng ký/đăng nhập qua email, số điện thoại, mạng xã hội. Quản lý hồ sơ và lịch sử giao dịch.',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Search,
      title: 'Tìm kiếm & Mua',
      description: 'Tìm kiếm xe/pin theo hãng, đời, dung lượng pin, giá. Theo dõi yêu thích và so sánh nhiều xe.',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: CreditCard,
      title: 'Giao dịch & Thanh toán',
      description: 'Thanh toán online an toàn qua e-wallet, banking. Đấu giá hoặc "mua ngay" tiện lợi.',
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: MessageSquare,
      title: 'Hỗ trợ sau bán',
      description: 'Đánh giá & phản hồi người bán/mua. Xem lịch sử giao dịch chi tiết.',
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50'
    },
    {
      icon: Shield,
      title: 'Bảo mật tuyệt đối',
      description: 'Hệ thống bảo mật đa lớp, xác thực 2FA, mã hóa dữ liệu end-to-end.',
      color: 'from-teal-500 to-cyan-600',
      bgColor: 'bg-teal-50'
    },
    {
      icon: Zap,
      title: 'Xử lý nhanh chóng',
      description: 'Phê duyệt tin đăng nhanh, thanh toán tức thì, giao dịch hoàn tất trong 24h.',
      color: 'from-yellow-500 to-amber-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Tính năng nổi bật
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nền tảng giao dịch xe điện và pin cũ toàn diện với đầy đủ tính năng 
            hỗ trợ người mua và người bán
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className={`${feature.bgColor} rounded-2xl p-8 h-full border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-xl`}>
                {/* Icon */}
                <div className={`flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-800">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Learn More Link */}
                <div className="mt-6">
                  <button className="text-sm font-semibold text-gray-700 hover:text-gray-900 flex items-center space-x-1 group-hover:translate-x-1 transition-transform duration-300">
                    <span>Tìm hiểu thêm</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Sẵn sàng bắt đầu?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Tham gia cộng đồng hàng nghìn người dùng đang giao dịch xe điện và pin cũ một cách an toàn và hiệu quả
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-colors"
              >
                Đăng ký ngay
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:border-green-500 hover:text-green-600 transition-colors"
              >
                Xem demo
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
