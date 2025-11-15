import React, { useState } from "react";
import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Facebook,
  Twitter,
  Youtube,
  Zap,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: "Mua xe",
    question: "Làm thế nào để mua xe điện cũ an toàn?",
    answer:
      "Để mua xe điện cũ an toàn, bạn nên: 1) Kiểm tra kỹ lưỡng sức khỏe pin và hệ thống điện, 2) Yêu cầu xem đầy đủ giấy tờ xe và lịch sử bảo dưỡng, 3) Thử lái xe để kiểm tra tình trạng thực tế, 4) Đưa xe đến trung tâm bảo dưỡng chính hãng để kiểm tra toàn diện, 5) Ký hợp đồng mua bán rõ ràng và có xác nhận từ cơ quan có thẩm quyền.",
  },
  {
    category: "Mua xe",
    question: "Tôi có thể trả góp khi mua xe điện cũ không?",
    answer:
      "Có, chúng tôi hỗ trợ nhiều hình thức thanh toán linh hoạt bao gồm trả góp qua ngân hàng với lãi suất ưu đãi. Bạn có thể trả trước từ 20-30% giá trị xe và trả góp phần còn lại trong 12-60 tháng tùy theo gói vay. Vui lòng liên hệ với bộ phận tư vấn tài chính của chúng tôi để được tư vấn chi tiết.",
  },
  {
    category: "Pin",
    question: "Sức khỏe pin bao nhiêu phần trăm là tốt?",
    answer:
      "Đối với xe điện cũ, sức khỏe pin trên 90% được coi là xuất sắc, từ 80-90% là tốt, từ 70-80% là khá và dưới 70% có thể cần thay thế trong tương lai gần. Pin là chi phí lớn nhất khi sử dụng xe điện, vì vậy nên chọn xe có sức khỏe pin cao nhất có thể trong phạm vi ngân sách.",
  },
  {
    category: "Pin",
    question: "Chi phí thay pin xe điện khoảng bao nhiêu?",
    answer:
      "Chi phí thay pin phụ thuộc vào dung lượng và thương hiệu xe. Trung bình dao động từ 200-500 triệu VNĐ cho các dòng xe phổ thông và có thể lên đến 800 triệu - 1 tỷ VNĐ cho các dòng xe cao cấp. Tuy nhiên, hầu hết các hãng đều có chương trình bảo hành pin 8-10 năm, vì vậy nếu mua xe còn trong thời gian bảo hành, bạn sẽ được hỗ trợ.",
  },
  {
    category: "Bảo dưỡng",
    question: "Xe điện có tốn kém bảo dưỡng không?",
    answer:
      "Xe điện thường có chi phí bảo dưỡng thấp hơn xe xăng vì cấu tạo đơn giản hơn (không có động cơ đốt trong, hộp số, bộ lọc dầu...). Bảo dưỡng chủ yếu bao gồm: kiểm tra phanh, lốp, hệ thống làm mát pin, bộ lọc điều hòa và các chi tiết nhỏ khác. Chi phí trung bình khoảng 2-5 triệu/năm tùy dòng xe.",
  },
  {
    category: "Bảo dưỡng",
    question: "Tôi nên bảo dưỡng xe điện bao lâu một lần?",
    answer:
      "Khuyến nghị bảo dưỡng định kỳ mỗi 10,000-15,000 km hoặc 6 tháng một lần, tùy điều kiện nào đến trước. Ngoài ra nên kiểm tra sức khỏe pin mỗi năm một lần để đảm bảo hiệu suất tối ưu và phát hiện sớm các vấn đề tiềm ẩn.",
  },
  {
    category: "Sạc điện",
    question: "Tôi có thể sạc xe ở đâu?",
    answer:
      "Bạn có thể sạc xe tại: 1) Nhà riêng với sạc chậm qua đêm (tiết kiệm nhất), 2) Các trạm sạc công cộng của VinFast, Tesla Supercharger, hoặc các nhà cung cấp khác, 3) Trung tâm thương mại, bãi đỗ xe có cung cấp dịch vụ sạc, 4) Một số khu chung cư cao cấp đã lắp đặt trạm sạc chung.",
  },
  {
    category: "Sạc điện",
    question: "Sạc đầy xe điện mất bao lâu?",
    answer:
      "Thời gian sạc phụ thuộc vào: 1) Dung lượng pin của xe, 2) Công suất sạc. Với sạc chậm tại nhà (3-7kW): 6-12 tiếng. Với sạc nhanh tại trạm công cộng (50-150kW): 30 phút - 2 tiếng. Với sạc siêu nhanh (250kW+): 15-30 phút có thể sạc 80%.",
  },
  {
    category: "Pháp lý",
    question: "Thủ tục sang tên xe điện có khác xe xăng không?",
    answer:
      "Thủ tục sang tên xe điện tương tự như xe xăng, bao gồm: 1) Giấy đăng ký xe, 2) Biên lai mua bán, 3) CMND/CCCD của người mua và người bán, 4) Giấy ủy quyền (nếu có), 5) Nộp phí trước bạ (khoảng 10-12% giá trị xe). Hiện nay một số địa phương có chính sách ưu đãi miễn giảm lệ phí trước bạ cho xe điện.",
  },
  {
    category: "Pháp lý",
    question: "Xe điện có được miễn phí đường bộ không?",
    answer:
      "Hiện tại tùy từng địa phương mà có chính sách khác nhau. Một số tỉnh thành như Hà Nội, TP.HCM đã có ưu đãi miễn giảm phí đường bộ cho xe điện trong giai đoạn đầu phát triển. Bạn nên kiểm tra chính sách cụ thể tại nơi đăng ký xe.",
  },
];

const SupportPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("Tất cả");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const categories = [
    "Tất cả",
    ...Array.from(new Set(faqs.map((faq) => faq.category))),
  ];

  const filteredFAQs =
    activeCategory === "Tất cả"
      ? faqs
      : faqs.filter((faq) => faq.category === activeCategory);

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log("Contact form submitted:", contactForm);
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setContactForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    }, 3000);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Trung Tâm Hỗ Trợ</h1>
            <p className="text-xl text-green-100 mb-8">
              Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
            </p>
          </div>
        </div>
      </div>

      {/* Quick Contact Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Hotline</h3>
            <p className="text-green-600 font-semibold text-lg">1900-xxxx</p>
            <p className="text-sm text-gray-600 mt-1">Miễn phí cuộc gọi</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
            <p className="text-blue-600 font-semibold">support@ev.vn</p>
            <p className="text-sm text-gray-600 mt-1">Phản hồi trong 24h</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-purple-600 font-semibold">Trò chuyện ngay</p>
            <p className="text-sm text-gray-600 mt-1">Trực tuyến 24/7</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Văn phòng</h3>
            <p className="text-orange-600 font-semibold">5 chi nhánh</p>
            <p className="text-sm text-gray-600 mt-1">HN, HCM, ĐN, CT, HP</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center gap-2 mb-6">
                <HelpCircle className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Câu Hỏi Thường Gặp
                </h2>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === category
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* FAQ List */}
              <div className="space-y-3">
                {filteredFAQs.map((faq, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedFAQ(expandedFAQ === index ? null : index)
                      }
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <span className="text-xs font-semibold text-green-600 mb-1 block">
                          {faq.category}
                        </span>
                        <span className="font-medium text-gray-900">
                          {faq.question}
                        </span>
                      </div>
                      {expandedFAQ === index ? (
                        <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0 ml-4" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0 ml-4" />
                      )}
                    </button>
                    {expandedFAQ === index && (
                      <div className="px-4 pb-4 text-gray-600 bg-gray-50">
                        <p className="leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Gửi Câu Hỏi Của Bạn
              </h2>
              {formSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    Đã gửi thành công!
                  </h3>
                  <p className="text-green-700">
                    Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitContact} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={contactForm.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={contactForm.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={contactForm.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0901234567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chủ đề
                      </label>
                      <select
                        name="subject"
                        value={contactForm.subject}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Chọn chủ đề</option>
                        <option value="buy">Tư vấn mua xe</option>
                        <option value="sell">Bán xe</option>
                        <option value="technical">Hỗ trợ kỹ thuật</option>
                        <option value="warranty">Bảo hành</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nội dung *
                    </label>
                    <textarea
                      name="message"
                      value={contactForm.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Vui lòng mô tả chi tiết câu hỏi của bạn..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Gửi câu hỏi
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Office Hours */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Giờ Làm Việc
                </h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Thứ 2 - Thứ 6:</span>
                  <span className="font-semibold text-gray-900">
                    8:00 - 20:00
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thứ 7 - Chủ nhật:</span>
                  <span className="font-semibold text-gray-900">
                    9:00 - 18:00
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hotline 24/7:</span>
                  <span className="font-semibold text-green-600">
                    Luôn sẵn sàng
                  </span>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Kết Nối Với Chúng Tôi
              </h3>
              <div className="space-y-3">
                <a
                  href="#"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Facebook className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Facebook</div>
                    <div className="text-xs text-gray-600">@SecondHandEV</div>
                  </div>
                </a>

                <a
                  href="#"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Twitter className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Twitter</div>
                    <div className="text-xs text-gray-600">@SecondHandEV</div>
                  </div>
                </a>

                <a
                  href="#"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Youtube className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">YouTube</div>
                    <div className="text-xs text-gray-600">Second Hand EV</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Liên Kết Hữu Ích
              </h3>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block text-sm text-gray-600 hover:text-green-600 hover:underline"
                >
                  Hướng dẫn mua xe điện cũ
                </a>
                <a
                  href="#"
                  className="block text-sm text-gray-600 hover:text-green-600 hover:underline"
                >
                  Kiến thức về pin xe điện
                </a>
                <a
                  href="#"
                  className="block text-sm text-gray-600 hover:text-green-600 hover:underline"
                >
                  Chính sách bảo hành
                </a>
                <a
                  href="#"
                  className="block text-sm text-gray-600 hover:text-green-600 hover:underline"
                >
                  Điều khoản sử dụng
                </a>
                <a
                  href="#"
                  className="block text-sm text-gray-600 hover:text-green-600 hover:underline"
                >
                  Chính sách bảo mật
                </a>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-lg shadow-md p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Hỗ Trợ Khẩn Cấp</h3>
              <p className="text-sm text-red-100 mb-4">
                Gặp sự cố trên đường? Gọi ngay:
              </p>
              <a
                href="tel:1900xxxx"
                className="block text-center bg-white text-red-600 font-bold py-3 rounded-lg hover:bg-red-50 transition-colors"
              >
                1900-xxxx
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
