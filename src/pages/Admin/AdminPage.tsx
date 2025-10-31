import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

type AdminTab =
  | "dashboard"
  | "users"
  | "posts"
  | "reports"
  | "analytics"
  | "moderation"
  | "transactions";

//

const SectionCard: React.FC<{
  title: string;
  children?: React.ReactNode;
  right?: React.ReactNode;
}> = ({ title, children, right }) => (
  <div className="bg-white shadow rounded-lg p-6">
    <div className="flex items-center justify-between gap-3 mb-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {right}
    </div>
    {children}
  </div>
);

const StatCard: React.FC<{
  label: string;
  value: string;
  delta?: string;
  accent?: string;
  children?: React.ReactNode;
}> = ({ label, value, delta, accent = "green", children }) => (
  <div className="bg-white rounded-lg shadow p-5">
    <div className="flex items-start justify-between">
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
        {delta && (
          <div
            className={`mt-1 text-xs font-medium ${
              accent === "red" ? "text-red-600" : "text-green-600"
            }`}
          >
            {delta}
          </div>
        )}
      </div>
      {children}
    </div>
  </div>
);

const MiniTrend: React.FC<{ points: number[]; stroke?: string }> = ({
  points,
  stroke = "#16a34a",
}) => {
  const width = 120;
  const height = 40;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const toX = (i: number) => (i / (points.length - 1)) * width;
  const toY = (v: number) =>
    height - ((v - min) / Math.max(1, max - min)) * height;
  const d = points
    .map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(v)}`)
    .join(" ");
  return (
    <svg width={width} height={height} className="ml-3">
      <path d={d} fill="none" stroke={stroke} strokeWidth={2} />
      {points.map((v, i) => (
        <circle key={i} cx={toX(i)} cy={toY(v)} r={1.5} fill={stroke} />
      ))}
    </svg>
  );
};

const BarChart: React.FC<{ values: number[]; color?: string }> = ({
  values,
  color = "#16a34a",
}) => {
  const width = 260;
  const height = 100;
  const max = Math.max(...values, 1);
  const barWidth = width / values.length - 6;
  return (
    <svg width={width} height={height} className="w-full h-[100px]">
      {values.map((v, i) => {
        const barHeight = (v / max) * (height - 10);
        const x = i * (barWidth + 6) + 3;
        const y = height - barHeight;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            rx={3}
            fill={color}
          />
        );
      })}
    </svg>
  );
};

const AdminPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  const greeting = useMemo(() => {
    const name = user?.fullName || user?.email || "Quản trị viên";
    return `Xin chào, ${name}`;
  }, [user]);

  const tabs: { key: AdminTab; label: string }[] = [
    { key: "dashboard", label: "Tổng quan" },
    { key: "analytics", label: "Phân tích" },
    { key: "users", label: "Người dùng" },
    { key: "posts", label: "Bài đăng" },
    { key: "moderation", label: "Kiểm duyệt" },
    { key: "transactions", label: "Giao dịch" },
    { key: "reports", label: "Báo cáo" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 bg-white border border-gray-200 rounded-lg h-fit sticky top-6 self-start">
          <div className="px-4 py-4 border-b">
            <div className="text-xs text-gray-500">Xin chào</div>
            <div className="text-sm font-semibold text-gray-900 truncate">
              {user?.fullName || user?.email || "Quản trị viên"}
            </div>
            <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-800">
              Admin
            </div>
          </div>
          <nav className="py-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === t.key
                    ? "bg-green-50 text-green-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div className="border-t border-gray-200 pt-2 pb-2">
            <button
              onClick={async () => {
                await logout();
                navigate("/");
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Bảng điều khiển quản trị
              </h1>
              <p className="text-gray-600 mt-1">{greeting}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="px-3 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
                onClick={() => setActiveTab("dashboard")}
              >
                Làm mới
              </button>
            </div>
          </div>

          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                  label="Người dùng"
                  value="1,245"
                  delta="+12% so với tuần trước"
                >
                  <MiniTrend points={[3, 5, 4, 6, 8, 7, 9]} />
                </StatCard>
                <StatCard
                  label="Bài đăng hoạt động"
                  value="327"
                  delta="+5 hôm nay"
                >
                  <MiniTrend points={[8, 7, 6, 7, 8, 9, 10]} />
                </StatCard>
                <StatCard
                  label="Báo cáo"
                  value="8"
                  delta="-1 tuần này"
                  accent="green"
                >
                  <MiniTrend points={[6, 6, 5, 4, 5, 4, 3]} stroke="#ef4444" />
                </StatCard>
                <StatCard
                  label="Doanh thu"
                  value="₫12,5M"
                  delta="+7% tháng này"
                >
                  <MiniTrend points={[2, 3, 5, 6, 7, 8, 11]} />
                </StatCard>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <SectionCard
                  title="Lượt truy cập theo tuần (demo)"
                  right={
                    <span className="text-xs text-gray-500">
                      7 ngày gần đây
                    </span>
                  }
                >
                  <div className="pt-2">
                    <BarChart values={[120, 140, 180, 160, 200, 220, 260]} />
                  </div>
                </SectionCard>

                <SectionCard
                  title="Top danh mục (demo)"
                  right={
                    <button className="text-sm text-gray-700 hover:underline">
                      Xem tất cả
                    </button>
                  }
                >
                  <ul className="space-y-3">
                    {[
                      { name: "Xe điện đã qua sử dụng", count: 154 },
                      { name: "Pin/Ắc quy", count: 121 },
                      { name: "Phụ kiện", count: 78 },
                    ].map((c) => (
                      <li
                        key={c.name}
                        className="flex items-center justify-between"
                      >
                        <span className="text-gray-800">{c.name}</span>
                        <span className="text-sm text-gray-500">
                          {c.count} bài
                        </span>
                      </li>
                    ))}
                  </ul>
                </SectionCard>

                <SectionCard title="Hoạt động gần đây (demo)">
                  <ul className="space-y-3 text-sm">
                    {[
                      "User A tạo bài đăng #3024",
                      "User B nâng cấp gói Pro",
                      "Bài đăng #3011 bị báo cáo",
                      "Admin duyệt bài #3009",
                    ].map((a, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-gray-700">{a}</span>
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <SectionCard
                title="Hiệu suất hệ thống (demo)"
                right={<span className="text-xs text-gray-500">30 ngày</span>}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-2">
                      Đăng ký mới
                    </div>
                    <BarChart
                      values={[20, 25, 30, 22, 40, 35, 50, 45, 60, 58]}
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-2">
                      Tỷ lệ duyệt bài
                    </div>
                    <MiniTrend
                      points={[60, 62, 64, 63, 65, 67, 70, 72, 73, 75]}
                    />
                  </div>
                </div>
              </SectionCard>
              <SectionCard title="Kênh truy cập (demo)">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {["Organic", "Referral", "Social"].map((k, i) => (
                    <div key={k} className="bg-gray-50 rounded-md p-4">
                      <div className="text-sm text-gray-500">{k}</div>
                      <div className="text-xl font-semibold text-gray-800 mt-1">
                        {[54, 28, 18][i]}%
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          )}

          {activeTab === "users" && (
            <SectionCard
              title="Quản lý người dùng"
              right={
                <input
                  className="border rounded-md px-3 py-1 text-sm"
                  placeholder="Tìm theo email/tên"
                />
              }
            >
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vai trò
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-4 py-2" />
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[
                      {
                        email: "admin@example.com",
                        name: "Admin User",
                        role: "admin",
                        status: "active",
                      },
                      {
                        email: "user@example.com",
                        name: "Test User",
                        role: "user",
                        status: "active",
                      },
                      {
                        email: "mod@example.com",
                        name: "Moderator",
                        role: "moderator",
                        status: "locked",
                      },
                    ].map((u) => (
                      <tr key={u.email}>
                        <td className="px-4 py-2">{u.email}</td>
                        <td className="px-4 py-2">{u.name}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              u.role === "admin"
                                ? "bg-green-100 text-green-800"
                                : u.role === "moderator"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              u.status === "active"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right space-x-3">
                          <button className="text-sm text-blue-600 hover:underline">
                            Nâng quyền
                          </button>
                          <button className="text-sm text-red-600 hover:underline">
                            Khóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}

          {activeTab === "posts" && (
            <SectionCard
              title="Duyệt bài đăng"
              right={
                <div className="text-sm text-gray-500">3 bài chờ duyệt</div>
              }
            >
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="font-medium">Bài đăng #{i}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Xe điện / Pin
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button className="px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700">
                        Duyệt
                      </button>
                      <button className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700">
                        Từ chối
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {activeTab === "moderation" && (
            <SectionCard title="Hàng chờ kiểm duyệt (demo)">
              <ul className="divide-y divide-gray-200">
                {[
                  "Bài #4011 - nội dung nhạy cảm",
                  "Bài #4012 - hình ảnh mờ",
                  "Bài #4013 - trùng lặp",
                ].map((t, i) => (
                  <li
                    key={i}
                    className="py-3 flex items-center justify-between"
                  >
                    <span className="text-gray-800">{t}</span>
                    <div className="space-x-2">
                      <button className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200">
                        Xem
                      </button>
                      <button className="px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700">
                        Phê duyệt
                      </button>
                      <button className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700">
                        Từ chối
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {activeTab === "transactions" && (
            <SectionCard title="Giao dịch gần đây (demo)">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mã
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Người dùng
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số tiền
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-sm">
                    {[
                      {
                        id: "TX1001",
                        user: "User A",
                        amount: "₫150,000",
                        status: "success",
                      },
                      {
                        id: "TX1002",
                        user: "User B",
                        amount: "₫90,000",
                        status: "pending",
                      },
                      {
                        id: "TX1003",
                        user: "User C",
                        amount: "₫240,000",
                        status: "failed",
                      },
                    ].map((t) => (
                      <tr key={t.id}>
                        <td className="px-4 py-2">{t.id}</td>
                        <td className="px-4 py-2">{t.user}</td>
                        <td className="px-4 py-2">{t.amount}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              t.status === "success"
                                ? "bg-emerald-100 text-emerald-700"
                                : t.status === "pending"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}

          {activeTab === "reports" && (
            <SectionCard title="Báo cáo & vi phạm">
              <ul className="mt-1 space-y-2">
                {["Spam", "Giá ảo", "Thông tin sai"].map((r, idx) => (
                  <li key={idx} className="flex items-center justify-between">
                    <span className="text-gray-800">{r}</span>
                    <button className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200">
                      Đánh dấu đã xử lý
                    </button>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
