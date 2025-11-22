#  Second-hand EV & Battery Trading Platform

Nền tảng giao dịch xe điện và pin cũ hiện đại, được xây dựng với React và TypeScript.

### Cài đặt

```bash
# Clone repository
git clone https://github.com/fongcuten/SWP391_Second_hand_EV_and_battery_FE.git

# Di chuyển vào thư mục project
cd SWP391_Second_hand_EV_and_battery_FE-main

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

### Scripts có sẵn

```bash
npm run dev      # Chạy development server (http://localhost:5173)
npm run build    # Build production
npm run preview  # Preview production build
npm run lint     # Chạy ESLint
```

### Cấu hình môi trường

Đảm bảo backend API đang chạy tại `http://localhost:8080/evplatform`

## 📂 Cấu trúc Project

```
src/
├── components/              # React components
│   ├── Header.tsx           # Navigation header với user menu
│   ├── Hero.tsx             # Hero section với animations
│   ├── Features.tsx          # Tính năng nổi bật
│   ├── SearchSection.tsx    # Bộ lọc tìm kiếm
│   ├── FeaturedProducts.tsx # Sản phẩm nổi bật
│   ├── Footer.tsx           # Footer
│   ├── HomePage.tsx         # Trang chủ chính
│   ├── ElectricVehicleCard.tsx  # Card hiển thị xe điện
│   ├── BatteryCard.tsx      # Card hiển thị pin
│   └── ui/                  # UI components
│       ├── Button.tsx       # Button component
│       └── AnimatedSection.tsx
│
├── pages/                   # Page components
│   ├── auth/               # Authentication pages
│   │   ├── LoginPage.tsx   # Trang đăng nhập
│   │   ├── RegisterPage.tsx # Trang đăng ký
│   │   └── Authenticate.tsx # OAuth callback handler
│   ├── ElectricVehiclesPage.tsx  # Danh sách xe điện
│   ├── ElectricVehicleDetailPage.tsx  # Chi tiết xe điện
│   ├── BatteriesPage.tsx   # Danh sách pin
│   ├── BatteryDetailPage.tsx  # Chi tiết pin
│   ├── User/               # User pages
│   │   ├── UserPost.tsx     # Quản lý tin đăng
│   │   ├── UserFavorite.tsx # Danh sách yêu thích
│   │   ├── UserDeals.tsx    # Giao dịch
│   │   └── ...
│   ├── Admin/               # Admin pages
│   │   └── AdminPage.tsx    # Admin dashboard
│   └── Chat/                # Chat pages
│       └── ChatPage.tsx     # Real-time chat
│
├── services/                # API services
│   ├── authService.ts       # Authentication service
│   ├── FavoriteService.ts   # Favorite service
│   ├── Report/              # Report service
│   ├── Chat/                # Chat service
│   ├── Vehicle/             # Vehicle services
│   ├── Admin/                # Admin services
│   └── ...
│
├── contexts/                # React Contexts
│   ├── AuthContext.tsx      # Authentication context
│   └── ToastContext.tsx     # Toast notification context
│
├── config/                  # Configuration
│   ├── axios.ts            # Axios instance với interceptors
│   └── configuration.tsx   # OAuth config
│
├── types/                   # TypeScript types
│   ├── auth.ts             # Auth types
│   ├── battery.ts          # Battery types
│   └── electricVehicle.ts  # Vehicle types
│
├── hooks/                   # Custom hooks
│   └── useScrollAnimation.tsx
│
├── images/                  # Image assets
├── App.tsx                  # Root component với routing
├── main.tsx                 # Entry point
└── index.css                # Global styles
```
**Project Link**: [https://github.com/fongcuten/SWP391_Second_hand_EV_and_battery_FE](https://github.com/fongcuten/SWP391_Second_hand_EV_and_battery_FE)

---

**Made with ❤️ for sustainable transportation**
