import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Menu,
  X,
  User,
  Bell,
  ShoppingCart,
  Filter,
  LogOut,
  Settings,
  ChevronDown,
  MessageSquare
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const navigationItems = [
    { label: "Trang chủ", href: "/", primary: true },
    { label: "Xe điện", href: "/xe-dien", primary: true },
    { label: "Pin", href: "/pin", primary: true },
    { label: "Gói đăng ký", href: "/goi-dang-ky", primary: true },
    { label: "Thương hiệu", href: "/thuong-hieu", primary: false },
    { label: "So sánh", href: "/so-sanh", primary: false },
    { label: "Hỗ trợ", href: "/ho-tro", primary: false },
  ];

  const primaryNav = navigationItems.filter((item) => item.primary);
  const secondaryNav = navigationItems.filter((item) => !item.primary);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center flex-shrink-0 hover:opacity-90 transition-opacity"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">EV</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">
                  Second-hand EV
                </h1>
                <p className="text-xs text-green-600 font-medium">
                  Thị trường xe điện cũ
                </p>
              </div>
            </div>
          </Link>

          {/* Search Bar - Enhanced */}
          <div className="flex-1 max-w-2xl mx-4 lg:mx-8">
            <div
              className={`relative transition-all duration-200 ${isSearchFocused ? "scale-105" : ""
                }`}
            >
              <div className="flex">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Tìm kiếm xe điện, pin, phụ kiện..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                  />
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                </div>
                <button className="bg-green-600 text-white px-6 py-3 rounded-r-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">Tìm kiếm</span>
                </button>
              </div>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-1">
              {/* <Link
                to="/yeu-thich"
                className="flex items-center space-x-2 text-gray-700 hover:text-green-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all"
              >
                <Heart className="h-5 w-5" />
                <span className="text-sm font-medium">Yêu thích</span>
              </Link> */}

              {/* <Link
                to="/thong-bao"
                className="flex items-center space-x-2 text-gray-700 hover:text-green-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all relative"
              >
                <Bell className="h-5 w-5" />
                <span className="text-sm font-medium">Thông báo</span>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </Link> */}

              {/* <button className="flex items-center space-x-2 text-gray-700 hover:text-green-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all">
                <ShoppingCart className="h-5 w-5" />
                <span className="text-sm font-medium">Giỏ hàng</span>
              </button> */}
            </div>

            {/* Login/User */}
            <div className="flex items-center space-x-2">
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-green-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    {user.avatarThumbUrl ? (
                      <img
                        src={user.avatarThumbUrl}
                        alt={user.fullName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium">{user.fullName}</div>
                      <div className="text-xs text-gray-500">
                        {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {/* User dropdown menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="text-sm font-medium text-gray-900">
                          {user.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {user.role === "admin"
                            ? "Quản trị viên"
                            : "Người dùng"}
                        </div>
                      </div>

                      <Link
                        to="/ho-so"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-3" />
                        Thông tin cá nhân
                      </Link>

                      {/* <Link
                        to="/cai-dat"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Cài đặt
                      </Link> */}

                      <Link
                        to="/chat"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <MessageSquare className="h-4 w-4 mr-3" />
                        Chat của tôi
                      </Link>

                      {user.role === "admin" && (
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4 mr-3" />
                          Quản trị hệ thống
                        </Link>
                      )}

                      <div className="border-t border-gray-100">
                        <button
                          onClick={async () => {
                            setIsUserMenuOpen(false);
                            await logout();
                            navigate("/");
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/dang-nhap")}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => navigate("/dang-ky")}
                    className="hidden sm:flex items-center space-x-1 text-gray-700 hover:text-green-600 px-2 py-2 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <User className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:text-green-600 hover:bg-gray-50"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Bar - Desktop */}
        <div className="hidden md:block border-t border-gray-100">
          <nav className="flex items-center justify-between py-3">
            <div className="flex space-x-8">
              {primaryNav.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 relative group ${location.pathname === item.href
                    ? "text-green-600"
                    : "text-gray-700 hover:text-green-600"
                    }`}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-green-600 transition-all duration-200 ${location.pathname === item.href
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                      }`}
                  ></span>
                </Link>
              ))}
            </div>
            <div className="flex items-center space-x-6">
              {secondaryNav.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`text-sm font-medium transition-colors duration-200 ${location.pathname === item.href
                    ? "text-green-600"
                    : "text-gray-600 hover:text-green-600"
                    }`}
                >
                  {item.label}
                </Link>
              ))}
              <button className="flex items-center space-x-1 text-gray-600 hover:text-green-600">
                <Filter className="h-4 w-4" />
                <span className="text-sm">Lọc nâng cao</span>
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-4 space-y-3">
            {/* Mobile User Actions */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              {isAuthenticated && user ? (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    {user.avatarThumbUrl ? (
                      <img
                        src={user.avatarThumbUrl}
                        alt={user.fullName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        {user.fullName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      setIsMobileMenuOpen(false);
                      await logout();
                      navigate("/");
                    }}
                    className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Chưa đăng nhập
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      navigate("/dang-nhap");
                      setIsMobileMenuOpen(false);
                    }}
                    className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium"
                  >
                    Đăng nhập
                  </button>
                </>
              )}
            </div>

            {/* Mobile Search */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Tìm kiếm xe điện, pin, phụ kiện..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>

            {/* Primary Navigation */}
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Danh mục chính
              </h3>
              {primaryNav.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors ${location.pathname === item.href
                    ? "text-green-600 bg-green-50"
                    : "text-gray-700 hover:text-green-600 hover:bg-green-50"
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Secondary Navigation */}
            <div className="space-y-1 pt-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Tiện ích
              </h3>
              {secondaryNav.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${location.pathname === item.href
                    ? "text-green-600 bg-green-50"
                    : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile Quick Actions */}
            <div className="pt-3 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-2">
                {/* <Link
                  to="/yeu-thich"
                  className="flex flex-col items-center space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Heart className="h-5 w-5 text-gray-600" />
                  <span className="text-xs text-gray-600">Yêu thích</span>
                </Link> */}
                <Link
                  to="/thong-bao"
                  className="flex flex-col items-center space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors relative"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  <span className="text-xs text-gray-600">Thông báo</span>
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    3
                  </span>
                </Link>
                <button className="flex flex-col items-center space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <ShoppingCart className="h-5 w-5 text-gray-600" />
                  <span className="text-xs text-gray-600">Giỏ hàng</span>
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="pt-3 border-t border-gray-100 text-center space-y-2">
              <p className="text-sm text-gray-600">Hotline: 1900-xxxx</p>
              <div className="flex justify-center space-x-4">
                <a
                  href="#"
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  Bán xe của bạn
                </a>
                <a
                  href="#"
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  Trở thành đối tác
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
