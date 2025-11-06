import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import {
  adminUserService,
  type AdminUserResponse,
} from "../../services/Admin/AdminUserService";
import {
  adminReportService,
  type AdminReportResponse,
  type ReportStatus,
} from "../../services/Admin/AdminReportService";
import {
  adminDealService,
  type AdminDealResponse,
} from "../../services/Admin/AdminDealService";
import {
  adminPostService,
  type AdminPostCard,
} from "../../services/Admin/AdminPostService";
import {
  adminInspectionService,
  type AdminInspectionReportResponse,
} from "../../services/Admin/AdminInspectionService";
import {
  adminInspectionOrderService,
  type AdminInspectionOrder,
} from "../../services/Admin/AdminInspectionOrderService";
import {
  adminBrandService,
  type BrandResponse,
  type ModelResponse,
  type BrandRequest,
  type ModelRequest,
} from "../../services/Admin/AdminBrandService";

type AdminTab =
  | "dashboard"
  | "users"
  | "posts"
  | "reports"
  | "analytics"
  | "moderation"
  | "transactions"
  | "inspections"
  | "brands";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states per tab
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [reports, setReports] = useState<AdminReportResponse[]>([]);
  const [deals, setDeals] = useState<AdminDealResponse[]>([]);
  const [posts, setPosts] = useState<AdminPostCard[]>([]);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [selectedUser, setSelectedUser] = useState<AdminUserResponse | null>(
    null
  );
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  const [vehicleCount, setVehicleCount] = useState<number>(0);
  const [batteryCount, setBatteryCount] = useState<number>(0);
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [models, setModels] = useState<ModelResponse[]>([]);
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [showModelForm, setShowModelForm] = useState(false);
  const [brandForm, setBrandForm] = useState<BrandRequest>({ name: "" });
  const [modelForm, setModelForm] = useState<ModelRequest>({
    brandId: 0,
    name: "",
  });
  const [inspectionReports, setInspectionReports] = useState<
    AdminInspectionReportResponse[]
  >([]);
  const [inspectionReportFilter, setInspectionReportFilter] = useState<
    "PENDING_REVIEW" | "APPROVED" | "REJECTED" | undefined
  >("PENDING_REVIEW");
  const [inspectionOrdersPage, setInspectionOrdersPage] = useState<{
    content: AdminInspectionOrder[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }>({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 });

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await adminUserService.getAll());
    } catch (e: any) {
      setError(e.message || "Lỗi tải người dùng");
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async (status?: ReportStatus) => {
    setLoading(true);
    setError(null);
    try {
      setReports(await adminReportService.list(status));
    } catch (e: any) {
      setError(e.message || "Lỗi tải báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const loadDeals = async () => {
    setLoading(true);
    setError(null);
    try {
      setDeals(await adminDealService.list());
    } catch (e: any) {
      setError(e.message || "Lỗi tải giao dịch");
    } finally {
      setLoading(false);
    }
  };

  const loadInspections = async (
    status?: "PENDING_REVIEW" | "APPROVED" | "REJECTED"
  ) => {
    setLoading(true);
    setError(null);
    try {
      const items = await adminInspectionService.listReports(status);
      setInspectionReports(items);
      setInspectionReportFilter(status);
    } catch (e: any) {
      setError(e.message || "Lỗi tải báo cáo kiểm định");
    } finally {
      setLoading(false);
    }
  };

  const loadInspectionOrders = async (page = 0, size = 10) => {
    setLoading(true);
    setError(null);
    try {
      const pageData = await adminInspectionOrderService.list(page, size);
      setInspectionOrdersPage(pageData);
    } catch (e: any) {
      setError(e.message || "Lỗi tải đơn kiểm định");
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminPostService.listAll(0, 30);
      setPosts(res.content as AdminPostCard[]);
      setTotalPosts(res.totalElements || res.content.length || 0);

      // Fetch exact counts using endpoints that return totalElements
      const [veh, bat] = await Promise.all([
        adminPostService.getVehicles(0, 1),
        adminPostService.getBatteries(0, 1),
      ]);
      setVehicleCount(veh.totalElements || veh.content.length || 0);
      setBatteryCount(bat.totalElements || bat.content.length || 0);
    } catch (e: any) {
      setError(e.message || "Lỗi tải bài đăng");
    } finally {
      setLoading(false);
    }
  };

  const loadBrands = async () => {
    setLoading(true);
    setError(null);
    try {
      const brandsList = await adminBrandService.getAllBrands();
      setBrands(brandsList);
      // Load all models
      const modelsList = await adminBrandService.getAllModels();
      setModels(modelsList);
    } catch (e: any) {
      setError(e.message || "Lỗi tải thương hiệu và model");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBrand = async () => {
    if (!brandForm.name.trim()) {
      setError("Vui lòng nhập tên thương hiệu");
      return;
    }
    try {
      await adminBrandService.createBrand(brandForm);
      setBrandForm({ name: "" });
      setShowBrandForm(false);
      await loadBrands();
    } catch (e: any) {
      setError(e.message || "Lỗi tạo thương hiệu");
    }
  };

  const handleCreateModel = async () => {
    if (!modelForm.name.trim() || !modelForm.brandId) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    try {
      await adminBrandService.createModel(modelForm);
      setModelForm({ brandId: 0, name: "" });
      setShowModelForm(false);
      await loadBrands();
    } catch (e: any) {
      setError(e.message || "Lỗi tạo model");
    }
  };

  useEffect(() => {
    if (activeTab === "users") loadUsers();
    if (activeTab === "reports") loadReports();
    if (activeTab === "transactions") loadDeals();
    if (activeTab === "inspections") {
      loadInspections("PENDING_REVIEW");
      loadInspectionOrders(0, 10);
    }
    if (activeTab === "brands") loadBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Prefetch data for dashboard on first load and whenever landing on dashboard
  useEffect(() => {
    if (activeTab === "dashboard") {
      // Run in parallel; we don't await sequentially to keep UI snappy
      loadUsers();
      loadPosts();
      loadReports();
      loadDeals();
    }
    // Also run once on mount so first render has data even before interaction
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const greeting = useMemo(() => {
    const name = user?.fullName || user?.email || "Quản trị viên";
    return `Xin chào, ${name}`;
  }, [user]);

  const tabs: { key: AdminTab; label: string }[] = [
    { key: "dashboard", label: "Tổng quan" },
    { key: "analytics", label: "Phân tích" },
    { key: "users", label: "Người dùng" },
    { key: "inspections", label: "Kiểm định" },
    { key: "brands", label: "Thương hiệu & Model" },
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
                <StatCard label="Người dùng" value={`${users.length || 0}`}>
                  <MiniTrend points={[3, 5, 4, 6, 8, 7, 9]} />
                </StatCard>
                <StatCard
                  label="Bài đăng hoạt động"
                  value={`${totalPosts || posts.length || 0}`}
                >
                  <MiniTrend points={[8, 7, 6, 7, 8, 9, 10]} />
                </StatCard>
                <StatCard
                  label="Báo cáo"
                  value={`${reports.length || 0}`}
                  accent="green"
                >
                  <MiniTrend points={[6, 6, 5, 4, 5, 4, 3]} stroke="#ef4444" />
                </StatCard>
                <StatCard
                  label="Doanh thu"
                  value={`${
                    deals.filter((d) => d.status === "COMPLETED").length
                  } hoàn tất`}
                >
                  <MiniTrend points={[2, 3, 5, 6, 7, 8, 11]} />
                </StatCard>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <SectionCard title="Phân bố danh mục bài đăng">
                  <ul className="space-y-3">
                    <li className="flex items-center justify-between">
                      <span className="text-gray-800">Xe điện</span>
                      <span className="text-sm text-gray-500">
                        {vehicleCount} bài
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-gray-800">Pin/Ắc quy</span>
                      <span className="text-sm text-gray-500">
                        {batteryCount} bài
                      </span>
                    </li>
                  </ul>
                </SectionCard>

                <SectionCard title="Hoạt động gần đây">
                  <ul className="space-y-3 text-sm">
                    {posts.slice(0, 6).map((p) => (
                      <li key={p.listingId} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-gray-700 line-clamp-1">
                          {p.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <SectionCard title="Tỷ lệ trạng thái giao dịch">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-2">
                      Đang chờ / Đã lên lịch / Hoàn tất / Hủy
                    </div>
                    <BarChart
                      values={[
                        deals.filter((d) => d.status === "PENDING").length,
                        deals.filter((d) => d.status === "SCHEDULED").length,
                        deals.filter((d) => d.status === "COMPLETED").length,
                        deals.filter((d) => d.status === "CANCELLED").length,
                      ]}
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-2">
                      Bài đăng (Xe/Pin)
                    </div>
                    <BarChart values={[vehicleCount, batteryCount]} />
                  </div>
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
                {loading && (
                  <div className="text-sm text-gray-500">Đang tải...</div>
                )}
                {error && <div className="text-sm text-red-600">{error}</div>}
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Username
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vai trò
                      </th>
                      <th className="px-4 py-2" />
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((u) => {
                      const fullName = `${u.firstName ?? ""} ${
                        u.lastName ?? ""
                      }`.trim();
                      const role = (u.role || "USER").toLowerCase();
                      return (
                        <tr key={u.userId}>
                          <td className="px-4 py-2">{u.username}</td>
                          <td className="px-4 py-2">
                            {fullName || u.username}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                role === "admin"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {role}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right space-x-3">
                            <button
                              className="text-sm text-blue-600 hover:underline"
                              onClick={async () => {
                                try {
                                  setUserDetailLoading(true);
                                  const detail = await adminUserService.getById(
                                    u.userId
                                  );
                                  setSelectedUser(detail);
                                } catch (e) {
                                  setError(
                                    (e as Error).message ||
                                      "Lỗi tải chi tiết người dùng"
                                  );
                                } finally {
                                  setUserDetailLoading(false);
                                }
                              }}
                            >
                              Xem chi tiết
                            </button>
                            <button
                              className="text-sm text-red-600 hover:underline"
                              onClick={async () => {
                                if (
                                  window.confirm(
                                    `Bạn có chắc muốn xóa người dùng "${
                                      fullName || u.username || u.email
                                    }"?`
                                  )
                                ) {
                                  try {
                                    setLoading(true);
                                    await adminUserService.remove(u.userId);
                                    await loadUsers();
                                  } catch (e) {
                                    setError(
                                      (e as Error).message ||
                                        "Lỗi xóa người dùng"
                                    );
                                  } finally {
                                    setLoading(false);
                                  }
                                }
                              }}
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}

          {/* User Detail Modal */}
          {selectedUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Chi tiết người dùng
                  </h3>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setSelectedUser(null)}
                  >
                    ✕
                  </button>
                </div>
                {userDetailLoading ? (
                  <div className="text-sm text-gray-500">Đang tải...</div>
                ) : (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">ID</span>
                      <span className="text-gray-900">
                        {selectedUser.userId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Username</span>
                      <span className="text-gray-900">{selectedUser.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Họ và tên</span>
                      <span className="text-gray-900">
                        {`${selectedUser.firstName ?? ""} ${
                          selectedUser.lastName ?? ""
                        }`.trim() || selectedUser.username}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Số điện thoại</span>
                      <span className="text-gray-900">
                        {selectedUser.phone || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Vai trò</span>
                      <span className="text-gray-900">{selectedUser.role}</span>
                    </div>
                    {selectedUser.createdAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tạo lúc</span>
                        <span className="text-gray-900">
                          {selectedUser.createdAt}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm"
                    onClick={() => setSelectedUser(null)}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Posts tab removed as requested */}

          {activeTab === "moderation" && (
            <SectionCard title="Hàng chờ kiểm duyệt">
              <div className="mb-3">
                <button
                  className="text-sm px-3 py-1 rounded bg-amber-100 hover:bg-amber-200"
                  onClick={() => loadReports("PENDING")}
                >
                  Tải danh sách PENDING
                </button>
              </div>
              {loading && (
                <div className="text-sm text-gray-500">Đang tải...</div>
              )}
              {error && <div className="text-sm text-red-600">{error}</div>}
              <ul className="divide-y divide-gray-200">
                {reports.map((r) => (
                  <li
                    key={r.reportId}
                    className="py-3 flex items-center justify-between"
                  >
                    <span className="text-gray-800">
                      Report #{r.reportId} - Listing {r.listingId} - {r.reason}
                    </span>
                    <div className="space-x-2">
                      <button
                        className="px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700"
                        onClick={async () => {
                          await adminReportService.updateStatus(
                            r.reporterId,
                            r.listingId,
                            "APPROVED"
                          );
                          loadReports("PENDING");
                        }}
                      >
                        Phê duyệt
                      </button>
                      <button
                        className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                        onClick={async () => {
                          await adminReportService.updateStatus(
                            r.reporterId,
                            r.listingId,
                            "REJECTED"
                          );
                          loadReports("PENDING");
                        }}
                      >
                        Từ chối
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {activeTab === "transactions" && (
            <SectionCard title="Giao dịch gần đây">
              <div className="overflow-x-auto">
                {loading && (
                  <div className="text-sm text-gray-500">Đang tải...</div>
                )}
                {error && <div className="text-sm text-red-600">{error}</div>}
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
                      <th className="px-4 py-2" />
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-sm">
                    {deals.map((d) => (
                      <tr key={d.dealId}>
                        <td className="px-4 py-2">#{d.dealId}</td>
                        <td className="px-4 py-2">
                          Buyer {d.buyerId} / Seller {d.sellerId}
                        </td>
                        <td className="px-4 py-2">
                          {d.price
                            ? d.price.toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              })
                            : "-"}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              d.status === "COMPLETED"
                                ? "bg-emerald-100 text-emerald-700"
                                : d.status === "PENDING"
                                ? "bg-amber-100 text-amber-700"
                                : d.status === "SCHEDULED"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right space-x-3">
                          {d.status !== "COMPLETED" && (
                            <button
                              className="text-sm text-green-600 hover:underline"
                              onClick={async () => {
                                await adminDealService.complete(d.dealId);
                                loadDeals();
                              }}
                            >
                              Hoàn tất
                            </button>
                          )}
                          <button
                            className="text-sm text-red-600 hover:underline"
                            onClick={async () => {
                              await adminDealService.remove(d.dealId);
                              loadDeals();
                            }}
                          >
                            Xóa
                          </button>
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
              <div className="flex items-center gap-2 mb-3">
                <button
                  className="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                  onClick={() => loadReports()}
                >
                  Tất cả
                </button>
                <button
                  className="text-sm px-3 py-1 rounded bg-amber-100 hover:bg-amber-200"
                  onClick={() => loadReports("PENDING")}
                >
                  Đang chờ
                </button>
                <button
                  className="text-sm px-3 py-1 rounded bg-emerald-100 hover:bg-emerald-200"
                  onClick={() => loadReports("APPROVED")}
                >
                  Đã duyệt
                </button>
                <button
                  className="text-sm px-3 py-1 rounded bg-red-100 hover:bg-red-200"
                  onClick={() => loadReports("REJECTED")}
                >
                  Đã từ chối
                </button>
              </div>
              {loading && (
                <div className="text-sm text-gray-500">Đang tải...</div>
              )}
              {error && <div className="text-sm text-red-600">{error}</div>}
              <ul className="mt-1 space-y-2">
                {reports.map((r) => (
                  <li
                    key={`${r.reportId}`}
                    className="flex items-center justify-between"
                  >
                    <div className="text-gray-800 text-sm">
                      <div className="font-medium">
                        #{r.reportId} - Listing {r.listingId}
                      </div>
                      <div className="text-xs text-gray-500">
                        Lý do: {r.reason}
                      </div>
                    </div>
                    <div className="space-x-2">
                      <button
                        className="px-3 py-1 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700"
                        onClick={async () => {
                          await adminReportService.updateStatus(
                            r.reporterId,
                            r.listingId,
                            "APPROVED"
                          );
                          loadReports();
                        }}
                      >
                        Duyệt
                      </button>
                      <button
                        className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                        onClick={async () => {
                          await adminReportService.updateStatus(
                            r.reporterId,
                            r.listingId,
                            "REJECTED"
                          );
                          loadReports();
                        }}
                      >
                        Từ chối
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {activeTab === "inspections" && (
            <SectionCard
              title="Đơn kiểm định & Báo cáo"
              right={
                <div className="flex items-center gap-2">
                  <button
                    className="text-sm px-3 py-1 rounded bg-amber-100 hover:bg-amber-200"
                    onClick={() => loadInspections("PENDING_REVIEW")}
                  >
                    Đang chờ duyệt
                  </button>
                  <button
                    className="text-sm px-3 py-1 rounded bg-emerald-100 hover:bg-emerald-200"
                    onClick={() => loadInspections("APPROVED")}
                  >
                    Đã duyệt
                  </button>
                  <button
                    className="text-sm px-3 py-1 rounded bg-red-100 hover:bg-red-200"
                    onClick={() => loadInspections("REJECTED")}
                  >
                    Đã từ chối
                  </button>
                </div>
              }
            >
              {loading && (
                <div className="text-sm text-gray-500">Đang tải...</div>
              )}
              {error && <div className="text-sm text-red-600">{error}</div>}
              {/* Inspection Orders Table */}
              <div className="overflow-x-auto mb-6">
                <h4 className="text-md font-semibold mb-3">Đơn kiểm định</h4>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listing</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thanh toán</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lịch hẹn</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tạo lúc</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-sm">
                    {inspectionOrdersPage.content.map((o) => {
                      const canInspect = 
                        o.status !== "COMPLETED" && 
                        o.status !== "CANCELLED" && 
                        o.paymentStatus === "PAID";
                      
                      return (
                        <tr key={o.orderId}>
                          <td className="px-4 py-2">#{o.orderId}</td>
                          <td className="px-4 py-2">{o.listingId}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              o.status === "COMPLETED" 
                                ? "bg-emerald-100 text-emerald-700"
                                : o.status === "SCHEDULED" || o.status === "PAID"
                                ? "bg-blue-100 text-blue-700"
                                : o.status === "CANCELLED"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${o.paymentStatus === "PAID" ? "bg-emerald-100 text-emerald-700" : o.paymentStatus === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"}`}>
                              {o.paymentStatus || "-"}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {typeof o.amount === "number"
                              ? o.amount.toLocaleString("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                })
                              : "-"}
                          </td>
                          <td className="px-4 py-2">{o.scheduledAt || "-"}</td>
                          <td className="px-4 py-2">{o.createdAt || "-"}</td>
                          <td className="px-4 py-2">
                            <div className="flex items-center justify-end gap-2">
                              {canInspect ? (
                                <>
                                  <button
                                    className="px-4 py-1.5 text-sm font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm hover:shadow-md min-w-[70px]"
                                    onClick={async () => {
                                      if (
                                        window.confirm(
                                          `Bạn có chắc muốn đánh dấu đơn #${o.orderId} là PASS (Đạt)?`
                                        )
                                      ) {
                                        try {
                                          setLoading(true);
                                          setError(null);
                                          await adminInspectionOrderService.inspect(
                                            o.orderId,
                                            "PASS"
                                          );
                                          // Reload cả orders và reports (reload tất cả để đảm bảo báo cáo mới xuất hiện)
                                          await Promise.all([
                                            loadInspectionOrders(
                                              inspectionOrdersPage.number,
                                              inspectionOrdersPage.size
                                            ),
                                            loadInspections(undefined), // Reload tất cả để báo cáo mới xuất hiện
                                          ]);
                                        } catch (e: any) {
                                          setError(
                                            e.message || "Lỗi khi hoàn tất kiểm định"
                                          );
                                        } finally {
                                          setLoading(false);
                                        }
                                      }
                                    }}
                                  >
                                    PASS
                                  </button>
                                  <button
                                    className="px-4 py-1.5 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm hover:shadow-md min-w-[70px]"
                                    onClick={async () => {
                                      if (
                                        window.confirm(
                                          `Bạn có chắc muốn đánh dấu đơn #${o.orderId} là FAIL (Không đạt)?`
                                        )
                                      ) {
                                        try {
                                          setLoading(true);
                                          setError(null);
                                          await adminInspectionOrderService.inspect(
                                            o.orderId,
                                            "FAIL"
                                          );
                                          // Reload cả orders và reports (reload tất cả để đảm bảo báo cáo mới xuất hiện)
                                          await Promise.all([
                                            loadInspectionOrders(
                                              inspectionOrdersPage.number,
                                              inspectionOrdersPage.size
                                            ),
                                            loadInspections(undefined), // Reload tất cả để báo cáo mới xuất hiện
                                          ]);
                                        } catch (e: any) {
                                          setError(
                                            e.message || "Lỗi khi hoàn tất kiểm định"
                                          );
                                        } finally {
                                          setLoading(false);
                                        }
                                      }
                                    }}
                                  >
                                    FAIL
                                  </button>
                                </>
                              ) : o.status === "COMPLETED" ? (
                                <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                  Hoàn tất
                                </span>
                              ) : (
                                <span className="px-3 py-1.5 text-xs text-gray-500">
                                  Chờ thanh toán
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {/* Pagination */}
                <div className="flex items-center justify-between mt-3 text-sm">
                  <div className="text-gray-600">
                    Tổng: {inspectionOrdersPage.totalElements} — Trang {inspectionOrdersPage.number + 1}/{inspectionOrdersPage.totalPages || 1}
                  </div>
                  <div className="space-x-2">
                    <button
                      className="px-3 py-1 rounded border text-gray-700 disabled:opacity-50"
                      disabled={inspectionOrdersPage.number <= 0}
                      onClick={() => loadInspectionOrders(Math.max(0, inspectionOrdersPage.number - 1), inspectionOrdersPage.size)}
                    >
                      Trước
                    </button>
                    <button
                      className="px-3 py-1 rounded border text-gray-700 disabled:opacity-50"
                      disabled={
                        inspectionOrdersPage.totalPages > 0
                          ? inspectionOrdersPage.number >= inspectionOrdersPage.totalPages - 1
                          : inspectionOrdersPage.content.length < inspectionOrdersPage.size
                      }
                      onClick={() => loadInspectionOrders(inspectionOrdersPage.number + 1, inspectionOrdersPage.size)}
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>

              {/* Inspection Reports Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Listing
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nguồn
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kết quả
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Báo cáo
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-sm">
                    {(Array.isArray(inspectionReports)
                      ? inspectionReports
                      : []
                    ).map((r) => (
                      <tr key={r.reportId}>
                        <td className="px-4 py-2">#{r.reportId}</td>
                        <td className="px-4 py-2">{r.listingId}</td>
                        <td className="px-4 py-2 text-gray-600">
                          {r.sourceType} / {r.provider}
                        </td>
                        <td className="px-4 py-2">
                          {r.result ? (
                            <span
                              className={`${
                                r.result === "PASS"
                                  ? "text-emerald-700 bg-emerald-100"
                                  : "text-red-700 bg-red-100"
                              } px-2 py-1 rounded-full text-xs`}
                            >
                              {r.result}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {r.reportUrl ? (
                            <a
                              href={r.reportUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Tải/Xem
                            </a>
                          ) : (
                            <span className="text-gray-500">Không có</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-right space-x-2">
                          {r.status === "PENDING_REVIEW" ? (
                            <>
                              <button
                                className="px-3 py-1 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700"
                                onClick={async () => {
                                  await adminInspectionService.approve(
                                    r.reportId
                                  );
                                  loadInspections("PENDING_REVIEW");
                                }}
                              >
                                Duyệt
                              </button>
                              <button
                                className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                                onClick={async () => {
                                  await adminInspectionService.reject(
                                    r.reportId
                                  );
                                  loadInspections("PENDING_REVIEW");
                                }}
                              >
                                Từ chối
                              </button>
                            </>
                          ) : (
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                r.status === "APPROVED"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : r.status === "REJECTED"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {r.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}

          {activeTab === "brands" && (
            <div className="space-y-6">
              <SectionCard
                title="Quản lý Thương hiệu & Model"
                right={
                  <div className="flex gap-2">
                    <button
                      className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => setShowBrandForm(!showBrandForm)}
                    >
                      {showBrandForm ? "Hủy" : "+ Thêm Thương hiệu"}
                    </button>
                    <button
                      className="px-4 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700"
                      onClick={() => setShowModelForm(!showModelForm)}
                    >
                      {showModelForm ? "Hủy" : "+ Thêm Model"}
                    </button>
                  </div>
                }
              >
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* Brand Form */}
                {showBrandForm && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="text-md font-semibold mb-3">
                      Tạo thương hiệu mới
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tên thương hiệu *
                        </label>
                        <input
                          type="text"
                          value={brandForm.name}
                          onChange={(e) =>
                            setBrandForm({ ...brandForm, name: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="VD: Tesla, VinFast, BYD..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mô tả (tùy chọn)
                        </label>
                        <textarea
                          value={brandForm.description || ""}
                          onChange={(e) =>
                            setBrandForm({
                              ...brandForm,
                              description: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Mô tả về thương hiệu..."
                        />
                      </div>
                      <button
                        onClick={handleCreateBrand}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                      >
                        Tạo thương hiệu
                      </button>
                    </div>
                  </div>
                )}

                {/* Model Form */}
                {showModelForm && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="text-md font-semibold mb-3">
                      Tạo model mới
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Thương hiệu *
                        </label>
                        <select
                          value={modelForm.brandId}
                          onChange={(e) =>
                            setModelForm({
                              ...modelForm,
                              brandId: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="0">Chọn thương hiệu</option>
                          {brands.map((brand) => (
                            <option key={brand.brandId} value={brand.brandId}>
                              {brand.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tên model *
                        </label>
                        <input
                          type="text"
                          value={modelForm.name}
                          onChange={(e) =>
                            setModelForm({ ...modelForm, name: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="VD: Model 3, VF e34, Atto 3..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mô tả (tùy chọn)
                        </label>
                        <textarea
                          value={modelForm.description || ""}
                          onChange={(e) =>
                            setModelForm({
                              ...modelForm,
                              description: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Mô tả về model..."
                        />
                      </div>
                      <button
                        onClick={handleCreateModel}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                      >
                        Tạo model
                      </button>
                    </div>
                  </div>
                )}

                {/* Brands List */}
                <div className="mt-6">
                  <h4 className="text-md font-semibold mb-4">
                    Danh sách thương hiệu
                  </h4>
                  {loading && (
                    <div className="text-sm text-gray-500 py-4">
                      Đang tải...
                    </div>
                  )}
                  {!loading && brands.length === 0 && (
                    <div className="text-sm text-gray-500 py-4">
                      Chưa có thương hiệu nào
                    </div>
                  )}
                  {!loading && brands.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {brands.map((brand) => (
                        <div
                          key={brand.brandId}
                          className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900">
                                {brand.name}
                              </h5>
                              {brand.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {brand.description}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-2">
                                ID: {brand.brandId}
                              </p>
                              <p className="text-xs text-gray-500">
                                Models:{" "}
                                {
                                  models.filter(
                                    (m) => m.brandId === brand.brandId
                                  ).length
                                }
                              </p>
                            </div>
                            <button
                              className="text-red-600 hover:text-red-800 text-sm"
                              onClick={async () => {
                                if (
                                  window.confirm(
                                    `Bạn có chắc muốn xóa thương hiệu "${brand.name}"?`
                                  )
                                ) {
                                  try {
                                    await adminBrandService.deleteBrand(
                                      brand.brandId
                                    );
                                    await loadBrands();
                                  } catch (e: any) {
                                    setError(
                                      e.message || "Lỗi xóa thương hiệu"
                                    );
                                  }
                                }
                              }}
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Models List */}
                <div className="mt-6">
                  <h4 className="text-md font-semibold mb-4">
                    Danh sách model
                  </h4>
                  {loading && (
                    <div className="text-sm text-gray-500 py-4">
                      Đang tải...
                    </div>
                  )}
                  {!loading && models.length === 0 && (
                    <div className="text-sm text-gray-500 py-4">
                      Chưa có model nào
                    </div>
                  )}
                  {!loading && models.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              ID
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Tên Model
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Thương hiệu
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Mô tả
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                              Hành động
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {models.map((model) => {
                            const brand = brands.find(
                              (b) => b.brandId === model.brandId
                            );
                            return (
                              <tr key={model.modelId}>
                                <td className="px-4 py-2 text-sm">
                                  {model.modelId}
                                </td>
                                <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                  {model.name}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-600">
                                  {brand?.name || `Brand ID: ${model.brandId}`}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-600">
                                  {model.description || "-"}
                                </td>
                                <td className="px-4 py-2 text-right">
                                  <button
                                    className="text-red-600 hover:text-red-800 text-sm"
                                    onClick={async () => {
                                      if (
                                        window.confirm(
                                          `Bạn có chắc muốn xóa model "${model.name}"?`
                                        )
                                      ) {
                                        try {
                                          await adminBrandService.deleteModel(
                                            model.modelId
                                          );
                                          await loadBrands();
                                        } catch (e: any) {
                                          setError(
                                            e.message || "Lỗi xóa model"
                                          );
                                        }
                                      }
                                    }}
                                  >
                                    Xóa
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </SectionCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
