import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Heart,
    Calendar,
    MapPin,
    Tag,
    Trash2,
    Share2,
    Loader2,
    Grid,
    List,
    Search,
} from "lucide-react";
import { toast } from "react-toastify";
import { FavoriteService } from "../../services/FavoriteService";
import { locationService } from "../../services/locationService";

type TabId = "all" | "vehicle" | "battery";
const FAVORITE_TABS = [
    { id: "all", label: "Tất cả" },
    { id: "vehicle", label: "Xe điện" },
    { id: "battery", label: "Pin" },
];

interface FavoriteItem {
    id: string;
    listingId: number;
    username: string;
    description: string;
    title: string;
    price: number;
    originalPrice?: number;
    image: string;
    location: string;
    datePosted: string;
    isFavorite: boolean;
    type: "vehicle" | "battery";
    brand: string;
    model: string;
    year?: number;
    mileage?: number;
    batteryCapacity?: number;
    condition: "excellent" | "good" | "fair" | "poor";
}

export default function UserFavorites() {
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabId>("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        setLoading(true);
        try {
            const apiFavorites = await FavoriteService.getCurrentUserFavorites();
            if (!apiFavorites || apiFavorites.length === 0) {
                setFavorites([]);
                setLoading(false);
                return;
            }
            const transformedFavorites: FavoriteItem[] = await Promise.all(
                apiFavorites.map(async (item) => {
                    let location = "Không xác định";
                    const hasValidLocationCodes =
                        item.provinceCode !== undefined && item.provinceCode !== 0 &&
                        item.districtCode !== undefined && item.districtCode !== 0 &&
                        item.wardCode !== undefined && item.wardCode !== 0;
                    if (hasValidLocationCodes) {
                        try {
                            location = await locationService.getFullAddress(
                                item.provinceCode!,
                                item.districtCode!,
                                item.wardCode!,
                                item.street
                            );
                        } catch {
                            location = item.location || item.address || "Không xác định";
                        }
                    } else {
                        location = item.location || item.address || "Không xác định";
                    }
                    const normalizedType = item.productType?.toUpperCase() || "";
                    const isVehicle = normalizedType === "EV" || normalizedType === "VEHICLE";
                    return {
                        id: String(item.listingId),
                        listingId: item.listingId,
                        username: item.username || "Unknown",
                        description: item.description || item.title || "No description",
                        title: item.title || item.description || `${item.productType} #${item.listingId}`,
                        price: item.askPrice || 0,
                        originalPrice: undefined,
                        image: item.image || "https://via.placeholder.com/300x200?text=No+Image",
                        location,
                        datePosted: item.createdAt || new Date().toISOString(),
                        isFavorite: true,
                        type: isVehicle ? "vehicle" : "battery",
                        brand: item.brand || "Unknown",
                        model: item.model || "Unknown",
                        year: item.year,
                        mileage: item.mileage,
                        batteryCapacity: item.batteryCapacity,
                        condition: (item.condition || "good") as "excellent" | "good" | "fair" | "poor",
                    };
                })
            );
            setFavorites(transformedFavorites);
        } catch (err: any) {
            toast.error("Không thể tải danh sách yêu thích");
            setFavorites([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (listingId: number) => {
        try {
            await FavoriteService.removeFavorite(listingId);
            setFavorites(prev => prev.filter((item) => item.listingId !== listingId));
            toast.success("Đã xóa khỏi danh sách yêu thích");
        } catch (err: any) {
            toast.error("Không thể xóa khỏi yêu thích");
        }
    };

    const handleShare = (item: FavoriteItem) => {
        const url = `${window.location.origin}/${item.type === "vehicle" ? "xe-dien" : "pin"}/${item.id}`;
        if (navigator.share) {
            navigator
                .share({
                    title: item.title,
                    text: `Xem ${item.title} - ${formatPrice(item.price)}`,
                    url: url,
                })
                .then(() => toast.success("Đã chia sẻ thành công"))
                .catch(() => { });
        } else {
            navigator.clipboard
                .writeText(url)
                .then(() => toast.success("Đã sao chép liên kết"))
                .catch(() => toast.error("Không thể sao chép liên kết"));
        }
    };

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        });
    };

    const getConditionText = (condition: string) => {
        const conditions = {
            excellent: "Xuất sắc",
            good: "Tốt",
            fair: "Khá",
            poor: "Trung bình",
        };
        return conditions[condition as keyof typeof conditions] || "Không xác định";
    };

    const getConditionColor = (condition: string) => {
        const colors = {
            excellent: "text-green-600 bg-green-100",
            good: "text-blue-600 bg-blue-100",
            fair: "text-yellow-600 bg-yellow-100",
            poor: "text-red-600 bg-red-100",
        };
        return colors[condition as keyof typeof colors] || "text-gray-600 bg-gray-100";
    };

    // Filter and sort
    const filteredFavorites = favorites
        .filter((item) => {
            const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
                || item.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = activeTab === "all" || item.type === activeTab;
            return matchesSearch && matchesType;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime();
                case "oldest":
                    return new Date(a.datePosted).getTime() - new Date(b.datePosted).getTime();
                case "price-low":
                    return a.price - b.price;
                case "price-high":
                    return b.price - a.price;
                default:
                    return 0;
            }
        });

    return (
        <div className="bg-[#F7F9F9] rounded-2xl shadow-lg border border-[#A8E6CF]/50 mb-10">
            {/* Header */}
            <div className="px-6 py-5 bg-white border-b border-gray-200 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                    <Heart className="w-6 h-6 text-red-500" />
                    Quản lý yêu thích
                </h2>
                <Link to="/" className="text-sm text-gray-600 hover:text-green-600 font-medium transition-colors">
                    Trang chủ
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex justify-between items-center bg-[#F7F9F9] border-b border-[#A8E6CF]/60 px-4 py-3 gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    {FAVORITE_TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabId)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${activeTab === tab.id
                                ? "bg-[#2ECC71] text-white shadow-md"
                                : "text-[#2C3E50] hover:bg-[#A8E6CF]/50"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>               
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
                        <p className="text-gray-600 text-lg">Đang tải danh sách yêu thích...</p>
                    </div>
                ) : filteredFavorites.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                            {searchQuery || activeTab !== "all"
                                ? "Không tìm thấy sản phẩm"
                                : "Chưa có sản phẩm yêu thích"}
                        </h3>
                        <p className="mb-6">
                            {searchQuery || activeTab !== "all"
                                ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                                : "Hãy khám phá và thêm sản phẩm vào danh sách yêu thích của bạn"}
                        </p>
                        {!searchQuery && activeTab === "all" && (
                            <Link
                                to="/xe-dien"
                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Khám phá xe điện
                            </Link>
                        )}
                    </div>
                ) : (
                    filteredFavorites.map((item) => (
                        <div
                            key={item.id}
                            className="border border-[#A8E6CF]/60 rounded-xl bg-white p-4 hover:shadow-md transition-all"
                        >
                            {/* Top section: Info */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Image */}
                                <div className="flex-shrink-0">
                                    <img
                                        src={item.image || "https://via.placeholder.com/200?text=No+Image"}
                                        alt={item.title}
                                        className="w-28 h-28 object-cover rounded-lg border border-[#A8E6CF]/40"
                                    />
                                </div>
                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-[#2C3E50] text-base truncate max-w-[400px]">
                                            {item.title}
                                        </h4>
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                                            {item.type === "vehicle" ? "Xe" : "Pin"}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[#2C3E50]/70 flex items-center gap-1 mb-1">
                                        <MapPin className="w-4 h-4" />
                                        {item.location}
                                    </p>
                                    <p className="text-sm text-[#2C3E50]/70 mb-2 flex items-center gap-2">
                                        <span className="flex items-center gap-1">
                                            <Tag className="w-4 h-4" />
                                            Mã tin: <span className="font-medium">#{item.listingId}</span>
                                        </span>
                                    </p>
                                    <div className="text-sm text-[#2C3E50]/70 space-y-1">
                                        <p className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            Đăng ngày: <span className="font-medium">{formatDate(item.datePosted)}</span>
                                        </p>
                                        <p>
                                            Giá:{" "}
                                            <span className="font-medium text-[#2ECC71]">
                                                {formatPrice(item.price)}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* Divider and Actions */}
                            <hr className="my-3 border-t border-[#A8E6CF]/40" />
                            <div className="flex flex-wrap items-center justify-end gap-3">
                                <button
                                    onClick={() => handleRemoveFavorite(item.listingId)}
                                    className="flex items-center justify-center gap-2 border-2 border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-red-50 hover:border-red-400"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Xóa</span>
                                </button>
                                <button
                                    onClick={() => handleShare(item)}
                                    className="flex items-center justify-center gap-2 border-2 border-green-200 text-green-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-green-50 hover:border-green-400"
                                >
                                    <Share2 className="w-4 h-4" />
                                    <span>Chia sẻ</span>
                                </button>
                                <Link
                                    to={`/${item.type === "vehicle" ? "xe-dien" : "pin"}/${item.id}`}
                                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                                >
                                    Xem chi tiết
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}