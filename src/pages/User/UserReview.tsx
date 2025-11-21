import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, Loader2, MessageCircle, User, Calendar, MessageSquare } from "lucide-react";
import { toast } from "react-toastify";
import { reviewService, type Review } from "../../services/Review/ReviewService";

type TabId = "received" | "written";
const REVIEW_TABS = [
    { id: "received", label: "Đánh giá nhận được" },
    { id: "written", label: "Đánh giá đã viết" },
];

export default function UserReview() {
    const [activeTab, setActiveTab] = useState<TabId>("received");
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const currentUserId = Number(localStorage.getItem("user_id"));

    useEffect(() => {
        loadReviews();
        // eslint-disable-next-line
    }, [activeTab, currentUserId]);

    const loadReviews = async () => {
        setLoading(true);
        try {
            let data: Review[] = [];
            if (activeTab === "received") {
                data = await reviewService.getReviewsReceived(currentUserId);
            } else {
                data = await reviewService.getReviewsWritten(currentUserId);
            }
            setReviews(Array.isArray(data) ? data : []);
            //eslint-disable-next-line
        } catch (error) {
            toast.error("Không thể tải đánh giá!");
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "—";
        try {
            return new Date(dateStr).toLocaleDateString("vi-VN");
        } catch {
            return "—";
        }
    };

    return (
        <div className="bg-[#F7F9F9] rounded-2xl shadow-lg border border-[#A8E6CF]/50 mb-10">
            {/* Header */}
            <div className="px-6 py-5 bg-white border-b border-gray-200 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-yellow-500" />
                    Quản lý đánh giá
                </h2>
                <Link to="/" className="text-sm text-gray-600 hover:text-green-600 font-medium transition-colors">
                    Trang chủ
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 bg-[#F7F9F9] border-b border-[#A8E6CF]/60 px-4 py-3">
                {REVIEW_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabId)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${activeTab === tab.id
                                ? "bg-yellow-500 text-white shadow-md"
                                : "text-[#2C3E50] hover:bg-yellow-100"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mb-4" />
                        <p className="text-gray-600 text-lg">Đang tải đánh giá...</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        <Star className="h-16 w-16 text-yellow-200 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                            {activeTab === "received"
                                ? "Bạn chưa nhận được đánh giá nào."
                                : "Bạn chưa viết đánh giá nào."}
                        </h3>
                        <p className="mb-6">
                            {activeTab === "received"
                                ? "Hãy hoàn thành giao dịch để nhận đánh giá từ người khác."
                                : "Hãy đánh giá người bán/người mua sau mỗi giao dịch."}
                        </p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div
                            key={review.reviewId}
                            className="border border-[#A8E6CF]/60 rounded-xl bg-white p-4 hover:shadow-md transition-all"
                        >
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Reviewer/Target Info */}
                                <div className="flex-shrink-0 flex flex-col items-center justify-center w-24">
                                    <User className="w-10 h-10 text-[#2ECC71] mb-2" />
                                    <span className="text-sm font-semibold text-[#2C3E50]">
                                        {activeTab === "received"
                                            ? review.authorName || `Người dùng #${review.authorId}`
                                            : review.targetName || `Người dùng #${review.targetId}`}
                                    </span>
                                </div>
                                {/* Review Content */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Star className="w-5 h-5 text-yellow-500" />
                                        <span className="font-semibold text-[#2C3E50] text-base">
                                            {review.rating}/5
                                        </span>
                                    </div>
                                    <p className="text-sm text-[#2C3E50]/70 flex items-center gap-1 mb-2">
                                        <MessageCircle className="w-4 h-4" />
                                        {review.comment || <span className="italic text-gray-400">Không có bình luận</span>}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Calendar className="w-4 h-4" />
                                        {formatDate(review.createdAt)}
                                        <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 font-medium">
                                            Giao dịch #{review.dealId}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}