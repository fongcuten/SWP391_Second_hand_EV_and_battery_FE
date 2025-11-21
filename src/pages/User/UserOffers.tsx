import React, { useState, useEffect, use } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Tag, ArrowRight, Loader2, Inbox, Car, Battery, Check, X } from "lucide-react";
import { toast } from "react-toastify";
import { OfferService, type Offer, type OfferStatus } from "../../services/Offer/OfferService";
import { authService } from "../../services/authService";
import { VehicleDetailService, type VehicleDetail } from "../../services/Vehicle/ElectricDetailsService";


type TabId = "received" | "sent";

const STATUS_STYLES: { [key: string]: { text: string; color: string } } = {
    PENDING: { text: "Chờ phản hồi", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    ACCEPTED: { text: "Đã chấp nhận", color: "bg-green-100 text-green-800 border-green-200" },
    REJECTED: { text: "Đã từ chối", color: "bg-red-100 text-red-800 border-red-200" },
    EXPIRED: { text: "Đã hết hạn", color: "bg-gray-100 text-gray-800 border-gray-200" },
    DEFAULT: { text: "Không xác định", color: "bg-gray-100 text-gray-800 border-gray-200" },
};

const formatPrice = (price?: number) => {
    if (price === undefined) return "N/A";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
};

const OfferStatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const style = STATUS_STYLES[status] || STATUS_STYLES.DEFAULT;
    return (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${style.color}`}>
            {style.text}
        </span>
    );
};

const OfferCard: React.FC<{
    offer: Offer;
    type: TabId;
    onStatusUpdate: (offerId: number, newStatus: string) => void;
    onDeleteOffer: (offerId: number) => void;
}> = ({ offer, type, onStatusUpdate, onDeleteOffer }) => {
    const [listingInfo, setListingInfo] = useState<VehicleDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchListingInfo = async () => {
            if (!offer.listingId) {
                setIsLoading(false);
                return;
            }
            try {
                const data = await VehicleDetailService.getVehicleDetail(offer.listingId);
                setListingInfo(data);
            } catch (error) {
                console.error(`Failed to fetch details for listing ${offer.listingId}`, error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchListingInfo();
    }, [offer.listingId]);

    const handleUpdateStatus = async (newStatus: OfferStatus) => {
        setIsUpdatingStatus(true);
        try {
            await OfferService.updateOfferStatus({
                offerId: offer.offerId,
                status: newStatus,
            });
            toast.success(`Đã ${newStatus === 'ACCEPTED' ? 'chấp nhận' : 'từ chối'} trả giá.`);
            onStatusUpdate(offer.offerId, newStatus);

            if (newStatus === 'ACCEPTED') {
                navigate("/ho-so/deals");
            }

        } catch (error) {
            toast.error("Cập nhật trạng thái thất bại. Vui lòng thử lại.");
            console.error("Failed to update offer status", error);
        } finally {
            setIsUpdatingStatus(false);

        }
    };

    const handleDeleteOffer = async () => {
        setIsDeleting(true);
        try {
            await OfferService.deleteOffer(offer.offerId);
            toast.success("Đã xóa trả giá thành công.");
            onDeleteOffer(offer.offerId);
        } catch (error) {
            toast.error("Không thể xóa trả giá. Vui lòng thử lại.");
            console.error("Failed to delete offer", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const isReceived = type === "received";
    const linkTo = listingInfo
        ? listingInfo.productType === 'VEHICLE'
            ? `/xe-dien/${listingInfo.listingId}`
            : `/pin/${listingInfo.listingId}`
        : '#';

    const renderImage = () => {
        if (isLoading) {
            return <div className="w-28 h-28 bg-gray-200 rounded-lg animate-pulse"></div>;
        }
        if (listingInfo?.media?.[0]?.urlThumb) {
            return <img src={listingInfo.media[0].urlThumb} alt={listingInfo.title} className="w-28 h-28 object-cover rounded-lg" />;
        }
        const Icon = listingInfo?.productType === 'BATTERY' ? Battery : Car;
        return (
            <div className="w-28 h-28 bg-gray-100 rounded-lg flex items-center justify-center">
                <Icon className="w-10 h-10 text-gray-300" />
            </div>
        );
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-300">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-shrink-0">
                    {renderImage()}
                </div>

                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        {isLoading ? (
                            <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse mb-1"></div>
                        ) : (
                            <h4 className="font-bold text-gray-800 text-base mb-1 line-clamp-1" title={listingInfo?.title}>
                                {listingInfo?.title || `Tin đăng #${offer.listingId}`}
                            </h4>
                        )}
                        <OfferStatusBadge status={offer.status} />
                    </div>

                    <p className="text-sm text-gray-500 mb-2">
                        {isReceived ? `Từ người mua: ` : `Gửi đến người bán: `}
                        <span className="font-medium text-gray-700">{isReceived ? offer.buyerName : offer.sellerName}</span>
                    </p>

                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200/80">
                        <div className="flex justify-between items-center">
                            <div className="text-center">
                                <p className="text-xs text-gray-500">Giá đề xuất</p>
                                <p className="font-bold text-blue-600 text-lg">
                                    {formatPrice(offer.proposedPrice)}
                                </p>
                            </div>
                            <div className="text-center text-gray-400">
                                <ArrowRight size={20} />
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-gray-500">Giá niêm yết</p>
                                {isLoading ? (
                                    <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mt-1"></div>
                                ) : (
                                    <p className="font-semibold text-gray-700 text-base">
                                        {formatPrice(listingInfo?.askPrice)}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                        <p>Ngày gửi: {new Date(offer.createdAt).toLocaleDateString("vi-VN")}</p>
                        <Link to={linkTo} className="text-blue-600 hover:underline font-medium flex items-center gap-1">
                            Xem tin đăng <ArrowRight size={14} />
                        </Link>
                    </div>

                    {isReceived && offer.status === 'PENDING' && (
                        <div className="border-t border-gray-200 mt-4 pt-4 flex items-center justify-end gap-3">
                            <button
                                onClick={() => handleUpdateStatus('REJECTED')}
                                disabled={isUpdatingStatus}
                                className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <X size={16} />
                                Từ chối
                            </button>
                            <button
                                onClick={() => handleUpdateStatus('ACCEPTED')}
                                disabled={isUpdatingStatus}
                                className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isUpdatingStatus ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                Chấp nhận
                            </button>
                        </div>
                    )}
                    {!isReceived && (
                        <div className="border-t border-gray-200 mt-4 pt-4 flex items-center justify-end gap-3">
                            <button
                                onClick={handleDeleteOffer}
                                disabled={isDeleting}
                                className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                                Xóa trả giá
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function UserOffers() {
    const [activeTab, setActiveTab] = useState<TabId>("received");
    const [receivedOffers, setReceivedOffers] = useState<Offer[]>([]);
    const [sentOffers, setSentOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);

    const handleOfferStatusUpdate = (offerId: number, newStatus: string) => {
        const updateOffers = (offers: Offer[]) =>
            offers.map(offer =>
                offer.offerId === offerId ? { ...offer, status: newStatus } : offer
            );

        if (activeTab === 'received') {
            setReceivedOffers(updateOffers);
        } else {
            setSentOffers(updateOffers);
        }
    };

    const handleOfferDelete = (offerId: number) => {
        const removeOffer = (offers: Offer[]) => offers.filter(offer => offer.offerId !== offerId);

        if (activeTab === 'received') {
            setReceivedOffers(removeOffer);
        } else {
            setSentOffers(removeOffer);
        }
    };

    useEffect(() => {
        const loadOffers = async () => {
            setLoading(true);
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                toast.error("Vui lòng đăng nhập để xem ưu đãi.");
                setLoading(false);
                return;
            }

            try {
                const userId = Number(currentUser.id);
                const [received, sent] = await Promise.all([
                    OfferService.getOffersBySeller(userId),
                    OfferService.getOffersByBuyer(userId),
                ]);
                setReceivedOffers(received);
                setSentOffers(sent);
            } catch (error) {
                console.error("❌ Error loading offers:", error);
                toast.error("Không thể tải danh sách trả giá.");
            } finally {
                setLoading(false);
            }
        };

        loadOffers();
    }, []);

    const currentOffers = activeTab === "received" ? receivedOffers : sentOffers;

    return (
        <div className="bg-gray-50 rounded-2xl shadow-lg border border-gray-200/80 mb-10">
            <div className="px-6 py-5 bg-white border-b border-gray-200 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                    <Tag className="w-6 h-6 text-blue-600" />
                    Quản lý Trả giá
                </h2>
                <Link to="/" className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">
                    Trang chủ
                </Link>
            </div>

            <div className="flex border-b border-gray-200 bg-white/50 px-4 pt-3">
                <button
                    onClick={() => setActiveTab("received")}
                    className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === "received"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-800"
                        }`}
                >
                    Trả giá nhận được ({receivedOffers.length})
                </button>
                <button
                    onClick={() => setActiveTab("sent")}
                    className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === "sent"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-800"
                        }`}
                >
                    Trả giá đã gửi ({sentOffers.length})
                </button>
            </div>

            <div className="p-6 space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                        <p className="text-gray-500 text-lg">Đang tải danh sách trả giá...</p>
                    </div>
                ) : currentOffers.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        <Inbox className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-medium mb-2">
                            {activeTab === "received" ? "Bạn chưa nhận được trả giá nào." : "Bạn chưa gửi trả giá nào."}
                        </p>
                        <p className="text-sm">
                            {activeTab === "received" ? "Các đề nghị trả giá cho tin đăng của bạn sẽ xuất hiện ở đây." : "Hãy bắt đầu thương lượng cho các sản phẩm bạn yêu thích!"}
                        </p>
                    </div>
                ) : (
                    currentOffers.map((offer) => (
                        <OfferCard key={offer.offerId} offer={offer} type={activeTab} onStatusUpdate={handleOfferStatusUpdate} onDeleteOffer={handleOfferDelete} />
                    ))
                )}
            </div>
        </div>
    );
}