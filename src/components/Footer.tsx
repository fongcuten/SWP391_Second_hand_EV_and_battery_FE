import React from 'react';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  Car,
  Battery,
  Shield,
  CreditCard
} from 'lucide-react';

const Footer: React.FC = () => {
  const footerSections = [
    {
      title: 'Về chúng tôi',
      links: [
        { label: 'Giới thiệu', href: '#' },
        { label: 'Tầm nhìn & Sứ mệnh', href: '#' },
        { label: 'Đội ngũ', href: '#' },
        { label: 'Tin tức', href: '#' },
        { label: 'Tuyển dụng', href: '#' }
      ]
    },
    {
      title: 'Dịch vụ',
      links: [
        { label: 'Mua xe điện', href: '#' },
        { label: 'Bán xe điện', href: '#' },
        { label: 'Pin & Phụ kiện', href: '#' },
        { label: 'Đánh giá xe', href: '#' },
        { label: 'Tư vấn chuyên gia', href: '#' }
      ]
    },
    {
      title: 'Hỗ trợ',
      links: [
        { label: 'Trung tâm trợ giúp', href: '#' },
        { label: 'Hướng dẫn sử dụng', href: '#' },
        { label: 'Chính sách bảo hành', href: '#' },
        { label: 'Quy trình giao dịch', href: '#' },
        { label: 'Liên hệ hỗ trợ', href: '#' }
      ]
    },
    {
      title: 'Pháp lý',
      links: [
        { label: 'Điều khoản sử dụng', href: '#' },
        { label: 'Chính sách bảo mật', href: '#' },
        { label: 'Chính sách hoàn tiền', href: '#' },
        { label: 'Quy định giao dịch', href: '#' },
        { label: 'Báo cáo vi phạm', href: '#' }
      ]
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'An toàn tuyệt đối',
      description: 'Giao dịch được bảo vệ 100%'
    },
    {
      icon: CreditCard,
      title: 'Thanh toán linh hoạt',
      description: 'Đa dạng phương thức thanh toán'
    },
    {
      icon: Car,
      title: 'Chất lượng đảm bảo',
      description: 'Xe và pin được kiểm định kỹ lưỡng'
    },
    {
      icon: Battery,
      title: 'Hỗ trợ 24/7',
      description: 'Tư vấn và hỗ trợ mọi lúc'
    }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Features Banner */}
      <div className="bg-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-300">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-6 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">EV</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">Second-hand EV</h2>
                  <p className="text-sm text-gray-400">User's name</p>
                </div>
              </div>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                Nền tảng giao dịch xe điện và pin cũ hàng đầu Việt Nam. 
                Chúng tôi kết nối người mua và người bán một cách an toàn, 
                minh bạch và hiệu quả.
              </p>

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">1900 2024</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">support@secondhandev.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">123 Đường ABC, Quận XYZ, TP. Hà Nội</span>
                </div>
              </div>

              {/* Social Media */}
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section, index) => (
              <div key={index} className="lg:col-span-1">
                <h3 className="text-lg font-semibold mb-6">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a 
                        href={link.href}
                        className="text-gray-300 hover:text-green-400 transition-colors text-sm"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Subscription */}
      <div className="bg-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">Đăng ký nhận tin</h3>
              <p className="text-gray-300">
                Nhận thông tin về các xe điện mới nhất, khuyến mãi đặc biệt và tin tức thị trường
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
              />
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors whitespace-nowrap">
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © 2024 Second-hand EV Platform. Tất cả quyền được bảo lưu.
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                Sitemap
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                RSS
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                Accessibility
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                Cookie Settings
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
