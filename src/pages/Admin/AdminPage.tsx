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
import {
  adminRevenueService,
  type RefundTransaction,
  type RevenueResponse,
} from "../../services/Admin/AdminRevenueService";

type AdminTab =
  | "dashboard"
  | "users"
  | "posts"
  | "reports"
  | "analytics"
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
  const [inspectionOrdersPage, setInspectionOrdersPage] = useState<{
    content: AdminInspectionOrder[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }>({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 });
  const [postTypeCache, setPostTypeCache] = useState<
    Record<number, "VEHICLE" | "BATTERY">
  >({});
  const [reportPostInfo, setReportPostInfo] = useState<
    Record<
      number,
      { type: "VEHICLE" | "BATTERY"; sellerId?: number; title?: string }
    >
  >({});
  // Track deleted posts and banned users for reports
  const [deletedPosts, setDeletedPosts] = useState<Set<number>>(new Set());
  const [bannedUsers, setBannedUsers] = useState<Set<number>>(new Set());
  // Track deals that have been refunded
  const [refundedDeals, setRefundedDeals] = useState<Set<number>>(new Set());
  const [revenueStats, setRevenueStats] = useState<RevenueResponse | null>(
    null
  );
  const [pendingRefunds, setPendingRefunds] = useState<RefundTransaction[]>([]);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);
  const [financeError, setFinanceError] = useState<string | null>(null);

  const formatCurrency = (value?: number | null) => {
    if (value === undefined || value === null) return "0 ₫";
    return value.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

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
      const reportsData = await adminReportService.list(status);
      setReports(reportsData);

      // Load post info for each report
      const postInfoMap: Record<
        number,
        { type: "VEHICLE" | "BATTERY"; sellerId?: number; title?: string }
      > = {};
      await Promise.all(
        reportsData.map(async (report) => {
          try {
            const post = await adminPostService.getById(report.listingId);
            postInfoMap[report.listingId] = {
              type: post.type,
              sellerId: post.sellerId,
              title: post.title,
            };
          } catch (e) {
            console.error(
              `Error loading post info for listing ${report.listingId}:`,
              e
            );
            // Default to VEHICLE if error
            postInfoMap[report.listingId] = { type: "VEHICLE" };
          }
        })
      );
      setReportPostInfo(postInfoMap);
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
      const dealsData = await adminDealService.list();
      setDeals(dealsData);
    } catch (e: any) {
      setError(e.message || "Lỗi tải giao dịch");
    } finally {
      setLoading(false);
    }
  };

  const loadRevenue = async () => {
    setRevenueLoading(true);
    setFinanceError(null);
    try {
      const stats = await adminRevenueService.getRevenue();
      setRevenueStats(stats);
    } catch (e: any) {
      setFinanceError(e.message || "Lỗi tải dữ liệu doanh thu");
    } finally {
      setRevenueLoading(false);
    }
  };

  const loadRefunds = async () => {
    setRefundLoading(true);
    setFinanceError(null);
    try {
      const refunds = await adminRevenueService.getPendingRefunds();
      // Chỉ lấy refund cho deal (SELLER_NO_SHOW)
      const dealRefunds = refunds.filter((tx) => tx.referenceType === "DEAL");
      setPendingRefunds(dealRefunds);
    } catch (e: any) {
      setFinanceError(e.message || "Lỗi tải danh sách hoàn tiền");
    } finally {
      setRefundLoading(false);
    }
  };

  const handleConfirmRefund = async (transactionId: number) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn xác nhận hoàn tiền cho giao dịch #${transactionId}?`
      )
    ) {
      return;
    }
    try {
      setFinanceError(null);
      await adminRevenueService.confirmRefund(transactionId);
      await Promise.all([loadRevenue(), loadRefunds()]);
    } catch (e: any) {
      setFinanceError(e.message || "Không thể xác nhận hoàn tiền");
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

  // Helper function to get post type and cache it
  const getPostType = async (
    listingId: number
  ): Promise<"VEHICLE" | "BATTERY"> => {
    // Check cache first
    if (postTypeCache[listingId]) {
      return postTypeCache[listingId];
    }

    try {
      const post = await adminPostService.getById(listingId);
      const type = post.type;
      // Cache the result
      setPostTypeCache((prev) => ({ ...prev, [listingId]: type }));
      return type;
    } catch (e: any) {
      console.error(`Error fetching post type for ${listingId}:`, e);
      // Default to VEHICLE if error
      return "VEHICLE";
    }
  };

  // Helper function to get post link path
  const getPostLink = (
    listingId: number,
    type?: "VEHICLE" | "BATTERY"
  ): string => {
    if (type === "BATTERY") {
      return `/pin/${listingId}`;
    }
    return `/xe-dien/${listingId}`;
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
    if (activeTab === "transactions") {
      loadDeals();
      loadRefunds();
    }
    if (activeTab === "inspections") {
      loadInspections("PENDING_REVIEW");
      loadInspectionOrders(0, 10);
    }
    if (activeTab === "brands") loadBrands();
    if (activeTab === "dashboard" || activeTab === "analytics") {
      loadRevenue();
    }
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
      loadRevenue();
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
                  value={
                    revenueLoading
                      ? "Đang tải..."
                      : formatCurrency(revenueStats?.netRevenue)
                  }
                >
                  <MiniTrend points={[2, 3, 5, 6, 7, 8, 11]} />
                </StatCard>
              </div>

              <SectionCard title="Tổng quan doanh thu">
                {financeError && (
                  <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                    {financeError}
                  </div>
                )}
                {revenueLoading && !revenueStats ? (
                  <div className="text-sm text-gray-500">Đang tải...</div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-gray-200 p-4">
                      <div className="text-sm text-gray-500">Tổng thu</div>
                      <div className="text-2xl font-semibold text-gray-900 mt-1">
                        {formatCurrency(revenueStats?.totalPayment)}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Bao gồm mọi giao dịch PAYMENTS thành công
                      </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <div className="text-sm text-gray-500">Đã hoàn</div>
                      <div className="text-2xl font-semibold text-gray-900 mt-1">
                        {formatCurrency(revenueStats?.totalRefund)}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Tổng tiền REFUND đã xác nhận
                      </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4 bg-green-50">
                      <div className="text-sm text-gray-600">
                        Doanh thu ròng
                      </div>
                      <div className="text-2xl font-semibold text-green-700 mt-1">
                        {formatCurrency(revenueStats?.netRevenue)}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Sau khi trừ hoàn tiền
                      </div>
                    </div>
                  </div>
                )}
              </SectionCard>

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
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-4 py-2" />
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((u) => {
                      const fullName = `${u.firstName ?? ""} ${
                        u.lastName ?? ""
                      }`.trim();
                      // Normalize role: convert to uppercase first, then format for display
                      const roleUpper = (u.role || "USER").toUpperCase();
                      const roleDisplay =
                        roleUpper === "ADMIN" ? "Admin" : "User";
                      const isAdmin = roleUpper === "ADMIN";
                      const status = (u.status || "UNKNOWN").toUpperCase();
                      const isBanned = status === "BANNED";
                      return (
                        <tr key={u.userId}>
                          <td className="px-4 py-2">{u.username}</td>
                          <td className="px-4 py-2">
                            {fullName || u.username}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                isAdmin
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {roleDisplay}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                isBanned
                                  ? "bg-red-100 text-red-700"
                                  : status === "ACTIVE"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {status}
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
                              className={`text-sm hover:underline ${
                                isBanned
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-red-600"
                              }`}
                              disabled={isBanned}
                              onClick={async () => {
                                if (isBanned) return;
                                if (
                                  window.confirm(
                                    `Bạn có chắc muốn cấm người dùng "${
                                      fullName || u.username || u.email
                                    }"? Người dùng sẽ không thể truy cập nữa.`
                                  )
                                ) {
                                  try {
                                    setLoading(true);
                                    await adminUserService.ban(u.userId);
                                    await loadUsers();
                                  } catch (e) {
                                    setError(
                                      (e as Error).message ||
                                        "Lỗi cấm người dùng"
                                    );
                                  } finally {
                                    setLoading(false);
                                  }
                                }
                              }}
                            >
                              {isBanned ? "Đã cấm" : "Cấm"}
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
                      <span className="text-gray-900">
                        {selectedUser.username}
                      </span>
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
                      <span className="text-gray-900">
                        {(selectedUser.role || "USER").toUpperCase() === "ADMIN"
                          ? "Admin"
                          : "User"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Trạng thái</span>
                      <span className="text-gray-900">
                        {(selectedUser.status || "UNKNOWN").toUpperCase()}
                      </span>
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

          {activeTab === "transactions" && (
            <>
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
                          Người mua
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Người bán
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
                      {deals.map((d) => {
                        const buyer = d.buyer;
                        const seller = d.seller;
                        const buyerName =
                          buyer?.fullName ||
                          buyer?.username ||
                          `User #${d.buyerId || "N/A"}`;
                        const sellerName =
                          seller?.fullName ||
                          seller?.username ||
                          `User #${d.sellerId || "N/A"}`;
                        const isRefunded =
                          d.status === "SELLER_NO_SHOW" &&
                          (refundedDeals.has(d.dealId) ||
                            !pendingRefunds.some(
                              (r) =>
                                r.referenceType === "DEAL" &&
                                r.referenceId === d.dealId
                            ));

                        return (
                          <tr key={d.dealId}>
                            <td className="px-4 py-2">#{d.dealId}</td>
                            <td className="px-4 py-2">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">
                                  {buyerName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  @
                                  {buyer?.username ||
                                    `user${d.buyerId || "N/A"}`}
                                </span>
                                {buyer?.phone && (
                                  <span className="text-xs text-gray-400">
                                    {buyer.phone}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">
                                  {sellerName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  @
                                  {seller?.username ||
                                    `user${d.sellerId || "N/A"}`}
                                </span>
                                {seller?.phone && (
                                  <span className="text-xs text-gray-400">
                                    {seller.phone}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              {d.balanceDue
                                ? d.balanceDue.toLocaleString("vi-VN", {
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
                                    : d.status === "SELLER_NO_SHOW"
                                    ? "bg-orange-100 text-orange-700"
                                    : d.status === "BUYER_NO_SHOW"
                                    ? "bg-purple-100 text-purple-700"
                                    : d.status === "CANCELLED"
                                    ? "bg-gray-100 text-gray-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {d.status === "SELLER_NO_SHOW"
                                  ? "SELLER_NO_SHOW"
                                  : d.status === "BUYER_NO_SHOW"
                                  ? "Buyer không tới"
                                  : d.status}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-right space-x-3">
                              {/* Dropdown để update status */}
                              {d.status !== "COMPLETED" && !isRefunded && (
                                <select
                                  className="text-xs border rounded px-2 py-1 mr-2"
                                  value={d.status}
                                  onChange={async (e) => {
                                    const newStatus = e.target
                                      .value as AdminDealResponse["status"];
                                    if (newStatus === d.status) return;

                                    const statusLabels: Record<string, string> =
                                      {
                                        SELLER_NO_SHOW: "Seller không tới",
                                        BUYER_NO_SHOW: "Buyer không tới",
                                        CANCELLED: "Hủy",
                                        COMPLETED: "Hoàn tất",
                                        PENDING: "Đang chờ",
                                        SCHEDULED: "Đã lên lịch",
                                      };

                                    if (
                                      window.confirm(
                                        `Bạn có chắc muốn đổi trạng thái deal #${
                                          d.dealId
                                        } thành "${
                                          statusLabels[newStatus] || newStatus
                                        }"?`
                                      )
                                    ) {
                                      try {
                                        setLoading(true);
                                        setError(null);
                                        await adminDealService.updateStatus(
                                          d.dealId,
                                          newStatus
                                        );
                                        await loadDeals();
                                        // Nếu chuyển thành SELLER_NO_SHOW, reload refunds
                                        if (newStatus === "SELLER_NO_SHOW") {
                                          await loadRefunds();
                                        }
                                      } catch (e: any) {
                                        setError(
                                          e.message || "Lỗi cập nhật trạng thái"
                                        );
                                        alert(
                                          `Lỗi: ${
                                            e.message ||
                                            "Không thể cập nhật trạng thái"
                                          }`
                                        );
                                      } finally {
                                        setLoading(false);
                                      }
                                    } else {
                                      // Reset về giá trị cũ nếu cancel
                                      e.target.value = d.status;
                                    }
                                  }}
                                  disabled={loading}
                                >
                                  <option value="PENDING">Đang chờ</option>
                                  <option value="SCHEDULED">Đã lên lịch</option>
                                  <option value="SELLER_NO_SHOW">
                                    Seller không tới
                                  </option>
                                  <option value="BUYER_NO_SHOW">
                                    Buyer không tới
                                  </option>
                                  <option value="CANCELLED">Hủy</option>
                                  <option value="COMPLETED">Hoàn tất</option>
                                </select>
                              )}
                              {d.status === "SELLER_NO_SHOW" &&
                                (isRefunded ? (
                                  <span className="text-xs text-gray-500 italic">
                                    Đã hoàn tiền
                                  </span>
                                ) : (
                                  <button
                                    className="text-sm text-orange-600 hover:underline font-medium"
                                    onClick={async () => {
                                      if (
                                        window.confirm(
                                          `Bạn có chắc muốn hoàn tiền cho buyer (${buyerName})? Số tiền sẽ được hoàn lại vào tài khoản của buyer.`
                                        )
                                      ) {
                                        try {
                                          setLoading(true);
                                          setError(null);
                                          // Tìm pending refund cho deal này
                                          const refunds =
                                            await adminRevenueService.getPendingRefunds();
                                          const dealRefund = refunds.find(
                                            (r) =>
                                              r.referenceType === "DEAL" &&
                                              r.referenceId === d.dealId
                                          );

                                          if (dealRefund) {
                                            // Confirm refund đã có
                                            await adminRevenueService.confirmRefund(
                                              dealRefund.id
                                            );
                                            // Đánh dấu deal đã được refund
                                            setRefundedDeals((prev) =>
                                              new Set(prev).add(d.dealId)
                                            );
                                            // Reload để cập nhật UI
                                            await Promise.all([
                                              loadDeals(),
                                              loadRefunds(),
                                              loadRevenue(),
                                            ]);
                                            alert(
                                              "Đã hoàn tiền thành công cho buyer"
                                            );
                                          } else {
                                            alert(
                                              "Không tìm thấy yêu cầu hoàn tiền cho deal này. Vui lòng kiểm tra lại."
                                            );
                                          }
                                        } catch (e: any) {
                                          setError(
                                            e.message || "Lỗi khi hoàn tiền"
                                          );
                                          alert(
                                            `Lỗi: ${
                                              e.message || "Không thể hoàn tiền"
                                            }`
                                          );
                                        } finally {
                                          setLoading(false);
                                        }
                                      }
                                    }}
                                    disabled={loading}
                                  >
                                    Hoàn tiền
                                  </button>
                                ))}
                              {d.status === "COMPLETED" && (
                                <span className="text-xs text-gray-500 italic">
                                  Đã hoàn tất
                                </span>
                              )}
                              <button
                                className="text-sm text-red-600 hover:underline"
                                onClick={async () => {
                                  if (
                                    window.confirm(
                                      `Bạn có chắc muốn xóa deal #${d.dealId}?`
                                    )
                                  ) {
                                    try {
                                      await adminDealService.remove(d.dealId);
                                      await loadDeals();
                                    } catch (e: any) {
                                      setError(e.message || "Lỗi xóa deal");
                                    }
                                  }
                                }}
                                disabled={loading}
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

              {(refundLoading || financeError || pendingRefunds.length > 0) && (
                <SectionCard title="Hoàn tiền chờ xử lý (Deal - Seller không tới)">
                  <div className="mb-3 text-xs text-gray-600">
                    Danh sách hoàn tiền cọc cho buyer khi seller không tới trong
                    deal
                  </div>
                  {financeError && (
                    <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                      {financeError}
                    </div>
                  )}
                  {refundLoading ? (
                    <div className="text-sm text-gray-500">Đang tải...</div>
                  ) : pendingRefunds.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      Không có yêu cầu hoàn tiền nào đang chờ.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              #
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Người dùng
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Liên quan
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Số tiền
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ngày tạo
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Hành động
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-sm">
                          {pendingRefunds.map((tx) => {
                            // Tìm deal tương ứng
                            const relatedDeal = deals.find(
                              (d) => d.dealId === tx.referenceId
                            );
                            const buyer = relatedDeal?.buyer;
                            const seller = relatedDeal?.seller;
                            const buyerName =
                              buyer?.fullName ||
                              buyer?.username ||
                              `User #${tx.userId}`;
                            const sellerName =
                              seller?.fullName ||
                              seller?.username ||
                              `User #${relatedDeal?.sellerId || "N/A"}`;

                            return (
                              <tr key={tx.id}>
                                <td className="px-4 py-2 font-medium text-gray-900">
                                  #{tx.id}
                                </td>
                                <td className="px-4 py-2">
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {buyerName}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      Người mua (cần hoàn tiền)
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-2">
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      Deal #{tx.referenceId}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {relatedDeal?.status === "SELLER_NO_SHOW"
                                        ? "Seller không tới"
                                        : `Status: ${
                                            relatedDeal?.status || "N/A"
                                          }`}
                                    </span>
                                    {seller && (
                                      <span className="text-xs text-gray-400 mt-1">
                                        Seller: {sellerName}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-2 font-semibold text-gray-900">
                                  {formatCurrency(tx.amount)}
                                </td>
                                <td className="px-4 py-2 text-gray-500">
                                  {tx.createdAt
                                    ? new Date(tx.createdAt).toLocaleString(
                                        "vi-VN"
                                      )
                                    : "-"}
                                </td>
                                <td className="px-4 py-2 text-right">
                                  <button
                                    className="rounded-md bg-emerald-600 px-3 py-1 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => handleConfirmRefund(tx.id)}
                                    disabled={loading}
                                  >
                                    Xác nhận hoàn tiền
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </SectionCard>
              )}
            </>
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
              </div>
              {loading && (
                <div className="text-sm text-gray-500">Đang tải...</div>
              )}
              {error && <div className="text-sm text-red-600">{error}</div>}
              <ul className="mt-1 space-y-3">
                {reports.map((r) => {
                  const postInfo = reportPostInfo[r.listingId];
                  const postLink = postInfo
                    ? getPostLink(r.listingId, postInfo.type)
                    : `/xe-dien/${r.listingId}`;
                  const postTitle = postInfo?.title || `Listing ${r.listingId}`;
                  const isPostDeleted = deletedPosts.has(r.listingId);
                  const isUserBanned =
                    postInfo?.sellerId && bannedUsers.has(postInfo.sellerId);
                  // Unique key combining reportId and listingId
                  const uniqueKey = `report-${r.reportId}-${r.listingId}-${r.reporterId}`;

                  return (
                    <li
                      key={uniqueKey}
                      className={`border rounded-lg p-4 ${
                        isPostDeleted || isUserBanned
                          ? "border-gray-300 bg-gray-100 opacity-75"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 text-gray-800 text-sm">
                          <div className="font-medium mb-1 flex items-center gap-2">
                            <span>
                              #{r.reportId} - {postTitle}
                            </span>
                            {isPostDeleted && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-700 font-semibold">
                                Đã xóa
                              </span>
                            )}
                            {isUserBanned && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700 font-semibold">
                                Đã cấm
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 mb-2">
                            <span className="font-medium">Lý do báo cáo:</span>{" "}
                            {r.reason}
                          </div>
                          {!isPostDeleted && (
                            <div className="text-xs">
                              <a
                                href={postLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                              >
                                Xem bài viết →
                              </a>
                            </div>
                          )}
                          {isPostDeleted && (
                            <div className="text-xs text-gray-500 italic">
                              Bài viết đã bị xóa
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {/* Nút Xóa bài viết */}
                          {!isPostDeleted ? (
                            <button
                              className="px-3 py-1 text-xs rounded bg-orange-600 text-white hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={async () => {
                                if (
                                  window.confirm(
                                    "Bạn có chắc muốn xóa bài viết này? Hành động này không thể hoàn tác."
                                  )
                                ) {
                                  try {
                                    setLoading(true);
                                    setError(null);
                                    // Try to delete the post
                                    await adminPostService.remove(r.listingId);
                                    // If successful, update report status
                                    try {
                                      await adminReportService.updateStatus(
                                        r.reporterId,
                                        r.listingId,
                                        "APPROVED"
                                      );
                                    } catch (statusError: any) {
                                      console.warn(
                                        "Failed to update report status:",
                                        statusError
                                      );
                                      // Continue even if status update fails
                                    }
                                    // Mark as deleted in UI
                                    setDeletedPosts((prev) =>
                                      new Set(prev).add(r.listingId)
                                    );
                                  } catch (e: any) {
                                    const errorMessage =
                                      e.message || "Lỗi xóa bài viết";
                                    setError(errorMessage);
                                    alert(
                                      `Lỗi: ${errorMessage}\n\nCó thể bạn không có quyền xóa bài viết này hoặc bài viết đã bị xóa.`
                                    );
                                  } finally {
                                    setLoading(false);
                                  }
                                }
                              }}
                              disabled={loading}
                            >
                              Xóa bài viết
                            </button>
                          ) : (
                            <span className="px-3 py-1 text-xs rounded bg-gray-300 text-gray-600 cursor-not-allowed">
                              Đã xóa
                            </span>
                          )}

                          {/* Nút Cấm người dùng - luôn hiển thị nếu có sellerId, không bị ẩn sau khi xóa bài viết */}
                          {postInfo?.sellerId ? (
                            !isUserBanned ? (
                              <button
                                className="px-3 py-1 text-xs rounded bg-purple-600 text-white hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={async () => {
                                  if (
                                    window.confirm(
                                      "Bạn có chắc muốn cấm người dùng này? Hành động này có thể ảnh hưởng nghiêm trọng."
                                    )
                                  ) {
                                    try {
                                      setLoading(true);
                                      setError(null);
                                      await adminUserService.ban(
                                        postInfo.sellerId!
                                      );
                                      // Mark as banned in UI
                                      setBannedUsers((prev) =>
                                        new Set(prev).add(postInfo.sellerId!)
                                      );
                                    } catch (e: any) {
                                      const errorMessage =
                                        e.message || "Lỗi cấm người dùng";
                                      setError(errorMessage);
                                      alert(`Lỗi: ${errorMessage}`);
                                    } finally {
                                      setLoading(false);
                                    }
                                  }
                                }}
                                disabled={loading}
                              >
                                Cấm người dùng
                              </button>
                            ) : (
                              <span className="px-3 py-1 text-xs rounded bg-gray-300 text-gray-600 cursor-not-allowed">
                                Đã cấm
                              </span>
                            )
                          ) : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
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
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Link bài
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thanh toán
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số tiền
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lịch hẹn
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tạo lúc
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hành động
                      </th>
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
                          <td className="px-4 py-2">
                            <button
                              onClick={async () => {
                                try {
                                  const type = await getPostType(o.listingId);
                                  const link = getPostLink(o.listingId, type);
                                  window.open(link, "_blank");
                                } catch (e: any) {
                                  console.error("Error navigating to post:", e);
                                  // Fallback: try vehicle route
                                  window.open(
                                    `/xe-dien/${o.listingId}`,
                                    "_blank"
                                  );
                                }
                              }}
                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                            >
                              LINK
                            </button>
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                o.status === "COMPLETED"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : o.status === "SCHEDULED" ||
                                    o.status === "PAID"
                                  ? "bg-blue-100 text-blue-700"
                                  : o.status === "CANCELLED"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                o.paymentStatus === "PAID"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : o.paymentStatus === "PENDING"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
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
                                            e.message ||
                                              "Lỗi khi hoàn tất kiểm định"
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
                                            e.message ||
                                              "Lỗi khi hoàn tất kiểm định"
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
                    Tổng: {inspectionOrdersPage.totalElements} — Trang{" "}
                    {inspectionOrdersPage.number + 1}/
                    {inspectionOrdersPage.totalPages || 1}
                  </div>
                  <div className="space-x-2">
                    <button
                      className="px-3 py-1 rounded border text-gray-700 disabled:opacity-50"
                      disabled={inspectionOrdersPage.number <= 0}
                      onClick={() =>
                        loadInspectionOrders(
                          Math.max(0, inspectionOrdersPage.number - 1),
                          inspectionOrdersPage.size
                        )
                      }
                    >
                      Trước
                    </button>
                    <button
                      className="px-3 py-1 rounded border text-gray-700 disabled:opacity-50"
                      disabled={
                        inspectionOrdersPage.totalPages > 0
                          ? inspectionOrdersPage.number >=
                            inspectionOrdersPage.totalPages - 1
                          : inspectionOrdersPage.content.length <
                            inspectionOrdersPage.size
                      }
                      onClick={() =>
                        loadInspectionOrders(
                          inspectionOrdersPage.number + 1,
                          inspectionOrdersPage.size
                        )
                      }
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
                        <td className="px-4 py-2">
                          <button
                            onClick={async () => {
                              try {
                                const type = await getPostType(r.listingId);
                                const link = getPostLink(r.listingId, type);
                                window.open(link, "_blank");
                              } catch (e: any) {
                                console.error("Error navigating to post:", e);
                                // Fallback: try vehicle route
                                window.open(
                                  `/xe-dien/${r.listingId}`,
                                  "_blank"
                                );
                              }
                            }}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          >
                            LINK
                          </button>
                        </td>
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
                                  await adminInspectionService.review(
                                    r.reportId,
                                    true,
                                    "PASS"
                                  );
                                  loadInspections("PENDING_REVIEW");
                                }}
                              >
                                Duyệt
                              </button>
                              <button
                                className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                                onClick={async () => {
                                  await adminInspectionService.review(
                                    r.reportId,
                                    false,
                                    "FAIL"
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
