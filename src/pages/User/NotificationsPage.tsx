import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  BellOff,
  Check,
  X,
  Eye,
  EyeOff,
  Filter,
  Search,
  Settings,
  AlertCircle,
  Info,
  Star,
  Calendar,
  Clock,
  Trash2,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "promotion";
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  actionText?: string;
  icon?: string;
  priority: "high" | "medium" | "low";
}

const NotificationsPage: React.FC = () => {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  // Mock data - trong thực tế sẽ lấy từ API
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Đăng tin thành công",
      message:
        "Tin đăng 'Tesla Model 3 2020' của bạn đã được duyệt và hiển thị trên website.",
      type: "success",
      isRead: false,
      createdAt: "2024-01-15T10:30:00Z",
      actionUrl: "/xe-dien/1",
      actionText: "Xem tin đăng",
      priority: "high",
    },
    {
      id: "2",
      title: "Có người quan tâm đến sản phẩm",
      message: "Nguyễn Văn A đã yêu thích sản phẩm 'BMW i3 2019' của bạn.",
      type: "info",
      isRead: false,
      createdAt: "2024-01-15T09:15:00Z",
      actionUrl: "/ho-so/posts",
      actionText: "Xem bài đăng",
      priority: "medium",
    },
    {
      id: "3",
      title: "Khuyến mãi đặc biệt",
      message:
        "Giảm giá 20% cho tất cả xe điện Tesla trong tuần này. Đừng bỏ lỡ cơ hội!",
      type: "promotion",
      isRead: true,
      createdAt: "2024-01-14T14:20:00Z",
      actionUrl: "/xe-dien?brand=tesla",
      actionText: "Xem khuyến mãi",
      priority: "medium",
    },
    {
      id: "4",
      title: "Tin nhắn mới",
      message:
        "Bạn có tin nhắn mới từ người dùng về sản phẩm 'Pin Lithium 60kWh'.",
      type: "info",
      isRead: false,
      createdAt: "2024-01-14T11:45:00Z",
      actionUrl: "/tin-nhan",
      actionText: "Xem tin nhắn",
      priority: "high",
    },
    {
      id: "5",
      title: "Cảnh báo bảo mật",
      message:
        "Phát hiện đăng nhập từ thiết bị mới. Nếu không phải bạn, vui lòng thay đổi mật khẩu.",
      type: "warning",
      isRead: true,
      createdAt: "2024-01-13T16:30:00Z",
      actionUrl: "/ho-so/change-password",
      actionText: "Đổi mật khẩu",
      priority: "high",
    },
    {
      id: "6",
      title: "Đánh giá sản phẩm",
      message:
        "Khách hàng đã đánh giá 5 sao cho sản phẩm 'Tesla Model 3 2020' của bạn.",
      type: "success",
      isRead: true,
      createdAt: "2024-01-13T08:20:00Z",
      actionUrl: "/xe-dien/1",
      actionText: "Xem đánh giá",
      priority: "low",
    },
  ]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleMarkAsUnread = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: false }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <Check className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <X className="h-5 w-5 text-red-500" />;
      case "promotion":
        return <Star className="h-5 w-5 text-purple-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-l-green-500 bg-green-50";
      case "warning":
        return "border-l-yellow-500 bg-yellow-50";
      case "error":
        return "border-l-red-500 bg-red-50";
      case "promotion":
        return "border-l-purple-500 bg-purple-50";
      default:
        return "border-l-blue-500 bg-blue-50";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-green-600 bg-green-100";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "Cao";
      case "medium":
        return "Trung bình";
      default:
        return "Thấp";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  const filteredNotifications = notifications.filter((notification) => {
    const matchesFilter =
      filter === "all" ||
      notification.type === filter ||
      (filter === "unread" && !notification.isRead);
    const matchesSearch =
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUnreadFilter = !showOnlyUnread || !notification.isRead;

    return matchesFilter && matchesSearch && matchesUnreadFilter;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Bell className="h-8 w-8 text-blue-500 mr-3" />
                Thông báo
              </h1>
              <p className="text-gray-600 mt-2">
                Quản lý tất cả thông báo và cập nhật từ hệ thống
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {unreadCount} chưa đọc
                </span>
              )}
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Đánh dấu tất cả đã đọc
              </button>
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
                  placeholder="Tìm kiếm thông báo..."
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
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">Tất cả</option>
                  <option value="unread">Chưa đọc</option>
                  <option value="info">Thông tin</option>
                  <option value="success">Thành công</option>
                  <option value="warning">Cảnh báo</option>
                  <option value="error">Lỗi</option>
                  <option value="promotion">Khuyến mãi</option>
                </select>
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showOnlyUnread}
                  onChange={(e) => setShowOnlyUnread(e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Chỉ hiện chưa đọc</span>
              </label>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <BellOff className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không có thông báo
            </h3>
            <p className="text-gray-500">
              {searchQuery || filter !== "all" || showOnlyUnread
                ? "Không tìm thấy thông báo phù hợp với bộ lọc"
                : "Bạn chưa có thông báo nào"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 ${getNotificationColor(
                  notification.type
                )} ${!notification.isRead ? "ring-2 ring-blue-100" : ""}`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                              Mới
                            </span>
                          )}
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(
                              notification.priority
                            )}`}
                          >
                            {getPriorityText(notification.priority)}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatTimeAgo(notification.createdAt)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(
                                notification.createdAt
                              ).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {notification.actionUrl && (
                        <Link
                          to={notification.actionUrl}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          {notification.actionText}
                        </Link>
                      )}
                      <div className="flex items-center space-x-1">
                        {notification.isRead ? (
                          <button
                            onClick={() => handleMarkAsUnread(notification.id)}
                            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                            title="Đánh dấu chưa đọc"
                          >
                            <EyeOff className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                            title="Đánh dấu đã đọc"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleDeleteNotification(notification.id)
                          }
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Xóa thông báo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notification Settings */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Cài đặt thông báo
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Thông báo email
                </h4>
                <p className="text-sm text-gray-500">
                  Nhận thông báo qua email
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Thông báo khuyến mãi
                </h4>
                <p className="text-sm text-gray-500">
                  Nhận thông báo về khuyến mãi và ưu đãi
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Thông báo bảo mật
                </h4>
                <p className="text-sm text-gray-500">
                  Nhận thông báo về hoạt động bảo mật
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
