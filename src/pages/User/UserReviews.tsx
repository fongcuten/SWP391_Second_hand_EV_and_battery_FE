import React, { useEffect, useState } from "react";
import { Loader2, Star, User, Inbox, Tag } from "lucide-react";
import { reviewService, type Review } from "../../services/Review/ReviewService";
import { authService } from "../../services/authService";

const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleString("vi-VN") : "—";

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200">
        <div className="flex items-center gap-3 mb-2">
            <User className="w-8 h-8 text-blue-500" />
            <div>
                <div className="font-semibold text-gray-800">
                    {review.authorName || `Người dùng #${review.authorId}`}
                </div>
                <div className="text-xs text-gray-500">
                    Đánh giá cho: {review.targetName || `Người dùng #${review.targetId}`}
                </div>
            </div>
            <div className="ml-auto flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="font-bold text-yellow-700">{review.rating}</span>
            </div>
        </div>
        <div className="text-sm text-gray-700 mb-2">{review.comment || "Không có nhận xét."}</div>
        <div className="text-xs text-gray-400 text-right">{formatDate(review.createdAt)}</div>
    </div>
);

type TabId = "received" | "written";

export default function UserReviews() {
    const [activeTab, setActiveTab] = useState<TabId>("received");
    const [receivedReviews, setReceivedReviews] = useState<Review[]>([]);
    const [writtenReviews, setWrittenReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadReviews = async () => {
            setLoading(true);
            const user = authService.getCurrentUser();
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const [received, written] = await Promise.all([
                    reviewService.getReviewsReceived(Number(user.id)),
                    reviewService.getReviewsWritten(Number(user.id)),
                ]);
                setReceivedReviews(Array.isArray(received) ? received : []);
                setWrittenReviews(Array.isArray(written) ? written : []);
            } catch (err) {
                setReceivedReviews([]);
                setWrittenReviews([]);
            } finally {
                setLoading(false);
            }
        };
        loadReviews();
    }, []);

    const currentReviews = activeTab === "received" ? receivedReviews : writtenReviews;

    return (
        <div className="bg-gray-50 rounded-2xl shadow-lg border border-gray-200/80 mb-10">
            <div className="px-6 py-5 bg-white border-b border-gray-200 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                    <Tag className="w-6 h-6 text-blue-600" />
                    Quản lý Đánh giá
                </h2>
            </div>

            <div className="flex border-b border-gray-200 bg-white/50 px-4 pt-3">
                <button
                    onClick={() => setActiveTab("received")}
                    className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === "received"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-800"
                        }`}
                >
                    Đánh giá nhận được ({receivedReviews.length})
                </button>
                <button
                    onClick={() => setActiveTab("written")}
                    className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === "written"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-800"
                        }`}
                >
                    Đánh giá đã viết ({writtenReviews.length})
                </button>
            </div>

            <div className="p-6 space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                        <p className="text-gray-500 text-lg">Đang tải đánh giá...</p>
                    </div>
                ) : currentReviews.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        <Inbox className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-medium mb-2">
                            {activeTab === "received" ? "Bạn chưa nhận được đánh giá nào." : "Bạn chưa viết đánh giá nào."}
                        </p>
                        <p className="text-sm">Các đánh giá liên quan tới tài khoản của bạn sẽ xuất hiện ở đây.</p>
                    </div>
                ) : (
                    currentReviews.map((review) => (
                        <ReviewCard key={review.reviewId} review={review} />
                    ))
                )}
            </div>
        </div>
    );
}