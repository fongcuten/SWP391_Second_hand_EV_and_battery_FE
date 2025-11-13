import React, { useEffect, useState } from "react";
import { Tag, Loader2, Inbox, Calendar, Link as LinkIcon, X } from "lucide-react";
import { toast } from "react-toastify";
import DealService, { type Deal, type AssignSitePayload } from "../../services/Deal/DealService";
import { authService } from "../../services/authService";
import PlatformSiteService, { type PlatformSite } from "../../services/Deal/PlatformSiteService";
import { useLocation, useNavigate } from "react-router-dom";

type TabId = "seller" | "buyer";

const formatPrice = (price?: number) =>
    price === undefined ? "N/A" : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleString("vi-VN") : "—");

const STATUS_STYLES: { [k: string]: { text: string; className: string } } = {
    DEFAULT: { text: "Không xác định", className: "bg-gray-100 text-gray-800 border-gray-200" },
    INITIALIZED: { text: "Khởi tạo", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    AWAITING_CONFIRMATION: { text: "Chờ thanh toán", className: "bg-yellow-50 text-yellow-800 border-yellow-200" },
    SCHEDULED: { text: "Đã đặt lịch", className: "bg-blue-100 text-blue-800 border-blue-200" },
    COMPLETED: { text: "Hoàn tất", className: "bg-green-100 text-green-800 border-green-200" },
    CANCELLED: { text: "Đã hủy", className: "bg-red-100 text-red-800 border-red-200" },
};

const DealStatusBadge: React.FC<{ status?: string }> = ({ status }) => {
    const st = (status && STATUS_STYLES[status]) || STATUS_STYLES.DEFAULT;
    return <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${st.className}`}>{st.text}</span>;
};

const DealCard: React.FC<{
    deal: Deal;
    isSellerView: boolean;
    onAssigned?: (dealId: number, updated: Deal) => void;
    onOpenAssignModal?: (deal: Deal) => void;
}> = ({ deal, isSellerView, onAssigned, onOpenAssignModal }) => {
    const [loadingAssign, setLoadingAssign] = useState(false);
    const [loadingReject, setLoadingReject] = useState(false);
    const [loadingCheckout, setLoadingCheckout] = useState(false);

    // keep old quick-assign logic as fallback, but prefer modal via onOpenAssignModal
    const handleQuickAssign = async () => {
        const platformSiteId = Number(prompt("Nhập platformSiteId (số):"));
        if (!platformSiteId || Number.isNaN(platformSiteId)) {
            toast.error("platformSiteId không hợp lệ.");
            return;
        }
        const balanceDueInput = prompt("Nhập số tiền phải trả (VNĐ) (ví dụ: 1000000):", deal.balanceDue ? String(deal.balanceDue) : "");
        const balanceDue = balanceDueInput ? Number(balanceDueInput) : undefined;
        const scheduledAt = prompt("Nhập thời gian lịch (ISO hoặc yyyy-mm-dd HH:MM):", deal.scheduledAt || new Date().toISOString());

        const payload: AssignSitePayload = {
            offerId: deal.offerId,
            platformSiteId,
            balanceDue,
            scheduledAt,
        };

        setLoadingAssign(true);
        try {
            const updated = await DealService.assignPlatformSite(deal.dealId, payload);
            toast.success("Đã phân công địa điểm và lên lịch cho giao dịch.");
            onAssigned?.(deal.dealId, updated);
        } catch (error) {
            console.error("Assign site failed", error);
            toast.error("Phân công thất bại. Vui lòng thử lại.");
        } finally {
            setLoadingAssign(false);
        }
    };

    const handleReject = async () => {
        const confirmed = window.confirm("Bạn có chắc muốn từ chối giao dịch này?");
        if (!confirmed) return;
        setLoadingReject(true);
        try {
            await DealService.rejectDeal(deal.dealId);
            toast.success("Đã từ chối giao dịch.");
            // update local UI: mark as CANCELLED and notify parent
            const updated: Deal = { ...deal, status: "CANCELLED" };
            onAssigned?.(deal.dealId, updated);
        } catch (err) {
            console.error("Reject failed", err);
            toast.error("Từ chối thất bại. Vui lòng thử lại.");
        } finally {
            setLoadingReject(false);
        }
    };

    const handleCheckout = async () => {
        setLoadingCheckout(true);
        try {
            const session = await DealService.checkoutDeal(deal.dealId);
            localStorage.setItem("lastCheckoutDealId", String(deal.dealId));
            if (session?.url) {
                toast.info("Chuyển tới cổng thanh toán...");
                window.open(session.url, "_blank");
            } else {
                toast.error("Không nhận được đường dẫn thanh toán.");
            }
        } catch (err: any) {
            console.error("Checkout failed", err);
            toast.error(err?.response?.data?.message || "Tạo phiên thanh toán thất bại.");
        } finally {
            setLoadingCheckout(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h4 className="font-semibold text-gray-800">Giao dịch #{deal.dealId}</h4>
                            <p className="text-sm text-gray-500">Offer #{deal.offerId} · <span className="text-gray-600">{deal.platformSiteName ?? "Chưa phân công"}</span></p>
                        </div>
                        <DealStatusBadge status={deal.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                        <div>
                            <p className="text-xs text-gray-500">Số tiền phải trả</p>
                            <p className="font-medium text-gray-800">{formatPrice(deal.balanceDue)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Ngày lên lịch</p>
                            <p className="font-medium text-gray-800 flex items-center gap-2"><Calendar size={14} /> {formatDate(deal.scheduledAt)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Tạo lúc</p>
                            <p className="text-gray-700">{formatDate(deal.createdAt)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Cập nhật</p>
                            <p className="text-gray-700">{formatDate(deal.updatedAt)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-3">
                {/* Show actions only when seller view AND deal is still pending */}
                {isSellerView && (deal.status === "INITIALIZED" || deal.status === "AWAITING_CONFIRMATION") && (
                    <>
                        <button
                            onClick={() => onOpenAssignModal ? onOpenAssignModal(deal) : handleQuickAssign()}
                            disabled={loadingAssign}
                            className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            {loadingAssign ? <Loader2 className="animate-spin" size={14} /> : "Lên lịch"}
                        </button>
                        <button
                            onClick={handleReject}
                            disabled={loadingReject}
                            className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                            {loadingReject ? <Loader2 className="animate-spin" size={14} /> : "Từ chối"}
                        </button>
                    </>
                )}

                {/* Buyer can checkout when awaiting confirmation */}
                {!isSellerView && deal.status === "AWAITING_CONFIRMATION" && (
                    
                    <button
                        onClick={handleCheckout}
                        disabled={loadingCheckout}
                        className="px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loadingCheckout ? <Loader2 className="animate-spin" size={14} /> : "Thanh toán"}
                    </button>
                )}

                {!isSellerView && deal.status === "AWAITING_CONFIRMATION" && (
                    
                    <button
                            onClick={handleReject}
                            disabled={loadingReject}
                            className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                            {loadingReject ? <Loader2 className="animate-spin" size={14} /> : "Từ chối"}
                        </button>
                )}

            </div>
        </div>
    );
};

export default function UserDeals() {
    const [activeTab, setActiveTab] = useState<TabId>("seller");
    const [sellerDeals, setSellerDeals] = useState<Deal[]>([]);
    const [buyerDeals, setBuyerDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    // modal & platform site state
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
    const [platformSites, setPlatformSites] = useState<PlatformSite[]>([]);
    const [loadingSites, setLoadingSites] = useState(false);
    const [selectedPlatformSiteId, setSelectedPlatformSiteId] = useState<number | "">("");
    const [balanceDueInput, setBalanceDueInput] = useState<string>("");
    const [scheduledAtInput, setScheduledAtInput] = useState<string>("");

    // reusable loader so we can refresh after confirm/cancel
    const loadDeals = async () => {
        setLoading(true);
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            toast.error("Vui lòng đăng nhập để xem giao dịch.");
            setLoading(false);
            return;
        }
        try {
            const userId = Number(currentUser.id);
            const [sDeals, bDeals] = await Promise.all([
                DealService.getDealsBySeller(userId),
                DealService.getDealsByBuyer(userId),
            ]);
            setSellerDeals(sDeals);
            setBuyerDeals(bDeals);
        } catch (err) {
            console.error("Load deals failed", err);
            toast.error("Không thể tải giao dịch.");
        } finally {
            setLoading(false);
        }
    };

    // initial load
    useEffect(() => {
        loadDeals();
    }, []);

    // handle checkout redirect: /deals/success?success=true|false
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (!params.has("success")) return;

        const success = params.get("success") === "true";
        const lastIdStr = localStorage.getItem("lastCheckoutDealId");
        const dealId = lastIdStr ? Number(lastIdStr) : NaN;
        // remove stored id to avoid reuse
        localStorage.removeItem("lastCheckoutDealId");

        (async () => {
            if (!dealId || Number.isNaN(dealId)) {
                toast.warning("Không tìm thấy giao dịch thanh toán gần đây.");
                navigate(location.pathname, { replace: true });
                return;
            }

            try {
                if (success) {
                    await DealService.confirmDeal(dealId);
                    toast.success("Thanh toán thành công — trạng thái giao dịch đã được cập nhật.");
                } else {
                    toast.info("Thanh toán bị hủy.");
                }
                await loadDeals();
            } catch (err) {
                console.error("Confirm deal failed", err);
                toast.error("Cập nhật trạng thái giao dịch thất bại.");
            } finally {
                // remove query so it won't re-run on refresh
                navigate(location.pathname, { replace: true });
            }
        })();
    }, [location.search, navigate, location.pathname]);

    const handleAssigned = (dealId: number, updated: Deal) => {
        setSellerDeals(prev => prev.map(d => (d.dealId === dealId ? updated : d)));
        setBuyerDeals(prev => prev.map(d => (d.dealId === dealId ? updated : d)));
    };

    const currentDeals = activeTab === "seller" ? sellerDeals : buyerDeals;

    // open modal and load platform sites
    const openAssignModal = async (deal: Deal) => {
        setSelectedDeal(deal);
        setSelectedPlatformSiteId(deal.platformSiteId ?? "");
        setBalanceDueInput(deal.balanceDue ? String(deal.balanceDue) : "");
        setScheduledAtInput(deal.scheduledAt ? toInputDatetimeLocal(deal.scheduledAt) : "");
        setIsAssignModalOpen(true);

        if (platformSites.length === 0) {
            setLoadingSites(true);
            try {
                const sites = await PlatformSiteService.getActivePlatformSites();
                setPlatformSites(sites);
            } catch (error) {
                console.error("Load platform sites failed", error);
                toast.error("Không thể tải danh sách địa điểm.");
            } finally {
                setLoadingSites(false);
            }
        }
    };

    const closeAssignModal = () => {
        setIsAssignModalOpen(false);
        setSelectedDeal(null);
        setSelectedPlatformSiteId("");
        setBalanceDueInput("");
        setScheduledAtInput("");
    };

    const submitAssign = async () => {
        if (!selectedDeal) return;
        if (!selectedPlatformSiteId) {
            toast.warning("Vui lòng chọn địa điểm.");
            return;
        }
        if (!scheduledAtInput) {
            toast.warning("Vui lòng chọn thời gian lịch.");
            return;
        }

        const payload: AssignSitePayload = {
            offerId: selectedDeal.offerId,
            platformSiteId: Number(selectedPlatformSiteId),
            balanceDue: balanceDueInput ? Number(balanceDueInput) : undefined,
            scheduledAt: new Date(scheduledAtInput).toISOString(),
        };

        try {
            const updated = await DealService.assignPlatformSite(selectedDeal.dealId, payload);
            toast.success("Phân công và đặt lịch thành công.");
            handleAssigned(selectedDeal.dealId, updated);
            closeAssignModal();
        } catch (error) {
            console.error("Assign failed", error);
            toast.error("Phân công thất bại. Vui lòng thử lại.");
        }
    };

    return (
        <div className="bg-gray-50 rounded-2xl shadow-lg border border-gray-200/80 mb-10">
            <div className="px-6 py-5 bg-white border-b border-gray-200 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                    <Tag className="w-6 h-6 text-blue-600" />
                    Quản lý Giao dịch
                </h2>
            </div>

            <div className="flex border-b border-gray-200 bg-white/50 px-4 pt-3">
                <button
                    onClick={() => setActiveTab("seller")}
                    className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === "seller"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-800"
                        }`}
                >
                    Giao dịch bán ({sellerDeals.length})
                </button>
                <button
                    onClick={() => setActiveTab("buyer")}
                    className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === "buyer"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-800"
                        }`}
                >
                    Giao dịch mua ({buyerDeals.length})
                </button>
            </div>

            <div className="p-6 space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                        <p className="text-gray-500 text-lg">Đang tải danh sách giao dịch...</p>
                    </div>
                ) : currentDeals.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        <Inbox className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-medium mb-2">
                            {activeTab === "seller" ? "Bạn chưa có giao dịch bán nào." : "Bạn chưa có giao dịch mua nào."}
                        </p>
                        <p className="text-sm">Các giao dịch liên quan tới tài khoản của bạn sẽ xuất hiện ở đây.</p>
                    </div>
                ) : (
                    currentDeals.map(d => (
                        <DealCard key={d.dealId} deal={d} isSellerView={activeTab === "seller"} onAssigned={handleAssigned} onOpenAssignModal={openAssignModal} />
                    ))
                )}
            </div>

            {/* Assign Modal */}
            {isAssignModalOpen && selectedDeal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 flex items-center justify-between border-b">
                            <div>
                                <h3 className="text-lg font-semibold">Phân công địa điểm & đặt lịch</h3>
                                <p className="text-sm text-gray-500">Giao dịch #{selectedDeal.dealId} · Offer #{selectedDeal.offerId}</p>
                            </div>
                            <button onClick={closeAssignModal} className="p-2 rounded hover:bg-gray-100">
                                <X />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Chọn địa điểm <span className="text-red-500">*</span></label>
                                <select
                                    value={selectedPlatformSiteId}
                                    onChange={(e) => setSelectedPlatformSiteId(e.target.value ? Number(e.target.value) : "")}
                                    disabled={loadingSites}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="">-- Chọn địa điểm --</option>
                                    {platformSites.map(site => (
                                        <option key={site.platformSiteId} value={site.platformSiteId}>
                                            {site.name} {site.street ? `- ${site.street}` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Số tiền phải trả (VNĐ)</label>
                                <input
                                    type="number"
                                    value={balanceDueInput}
                                    onChange={(e) => setBalanceDueInput(e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    placeholder="Ví dụ 1000000"
                                    readOnly
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Thời gian lịch <span className="text-red-500">*</span></label>
                                <input
                                    type="datetime-local"
                                    value={scheduledAtInput}
                                    onChange={(e) => setScheduledAtInput(e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                />
                                <p className="text-xs text-gray-500 mt-1">Chọn thời gian để đặt lịch cho giao dịch</p>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t flex gap-3 justify-end">
                            <button onClick={closeAssignModal} className="px-4 py-2 border rounded">Hủy</button>
                            <button
                                onClick={submitAssign}
                                className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                            >
                                Xác nhận & Lên lịch
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// helper: convert ISO => datetime-local value
function toInputDatetimeLocal(iso?: string) {
    if (!iso) return "";
    const d = new Date(iso);
    const tzOffset = d.getTimezoneOffset() * 60000;
    const local = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    return local;
}