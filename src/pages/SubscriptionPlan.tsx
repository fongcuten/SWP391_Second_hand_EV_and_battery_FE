import React, { useEffect, useState } from "react";
import { Zap, AlertCircle, Crown, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AnimatedSection } from "../components/ui/AnimatedSection";
import api from "../config/axios";
import { useAuth } from "../contexts/AuthContext";

// ===== TYPES =====

interface Plan {
    name: string;
    description: string;
    price: number;
    durationDays: number;
    currency: string;
    maxPosts: number;
    priorityLevel: number;
}

// ===== MAIN COMPONENT =====

export const SubscriptionsPlan: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // State
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processingPlan, setProcessingPlan] = useState<string | null>(null);

    // ===== DATA LOADING =====

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/plans");
            const data = response.data?.result;

            if (!Array.isArray(data)) {
                throw new Error("Invalid API response format");
            }

            setPlans(data);
        } catch (err) {
            console.error("❌ Error fetching plans:", err);
            setError("Không thể tải gói đăng ký. Vui lòng thử lại sau.");
            toast.error("Không thể tải danh sách gói đăng ký!");
        } finally {
            setLoading(false);
        }
    };

    // ===== HANDLERS =====

    const handleSubscribe = async (planName: string) => {
        // Check authentication
        if (!user) {
            toast.warning("Vui lòng đăng nhập để nâng cấp gói");
            navigate("/dang-nhap", { state: { from: "/ke-hoach" } });
            return;
        }

        const currentPlanName = user.plan?.name?.toLowerCase();
        if (currentPlanName && currentPlanName === planName.toLowerCase()) {
            toast.info("Bạn đang sử dụng gói này.");
            return;
        }

        setProcessingPlan(planName);

        try {
            const response = await api.post("/users/me/plan/checkout", { planName });
            const checkoutUrl = response.data?.result?.checkoutUrl;

            if (!checkoutUrl) {
                toast.error("Không nhận được URL thanh toán. Vui lòng thử lại.");
                return;
            }
            // Redirect to payment
            window.location.replace(checkoutUrl);

        } catch (error: any) {
            console.error("❌ Checkout error:", error);

            const backendMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Không thể xử lý yêu cầu.";

            if (backendMessage.includes("Phiên đăng nhập hết hạn")) {
                localStorage.removeItem("auth_token");
                localStorage.removeItem("user");
                toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
                navigate("/dang-nhap");
            } else if (backendMessage.includes("API endpoint không tồn tại")) {
                toast.error("Tính năng thanh toán chưa được cấu hình.");
            } else {
                toast.error(backendMessage);
            }
        } finally {
            setProcessingPlan(null);
        }
    };

    // ===== UTILITIES =====

    const isPremiumPlan = (planName: string) => planName.toLowerCase().includes("premium");

    const getGridCols = () => {
        switch (plans.length) {
            case 1: return "grid-cols-1";
            case 2: return "md:grid-cols-2";
            case 3: return "md:grid-cols-3";
            default: return "md:grid-cols-4";
        }
    };

    const getPlanBadge = (plan: Plan) => {
        if (isPremiumPlan(plan.name)) {
            return (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1 bg-[#2ECC71] text-white font-semibold text-sm rounded-full shadow-md">
                    <Crown className="w-4 h-4 text-yellow-300" />
                    Cao Cấp Nhất
                </div>
            );
        }

        if (plan.priorityLevel >= 2) {
            return (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#2ECC71] text-white font-semibold text-sm rounded-full shadow-md">
                    Phổ Biến
                </div>
            );
        }

        return null;
    };

    const getPlanCardClass = (plan: Plan) => {
        const isPremium = isPremiumPlan(plan.name);
        const baseClass = "relative rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-2";

        return isPremium
            ? `${baseClass} bg-gradient-to-br from-[#2ECC71]/20 to-[#A8E6CF]/40 border-[#2ECC71] shadow-[0_0_30px_rgba(46,204,113,0.3)] scale-105`
            : `${baseClass} bg-white border-gray-100 hover:border-[#2ECC71]/40 shadow-lg`;
    };

    const getButtonClass = (plan: Plan) => {
        const isPremium = isPremiumPlan(plan.name);
        const baseClass = "block w-full text-center py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed";

        return isPremium
            ? `${baseClass} bg-[#2ECC71] text-white hover:bg-[#27AE60] active:scale-95`
            : `${baseClass} bg-[#F7F9F9] text-[#2C3E50] border border-[#A8E6CF] hover:bg-[#A8E6CF]/60 active:scale-95`;
    };

    const formatMaxPosts = (maxPosts: number) =>
        maxPosts === 9999 ? "Không giới hạn" : maxPosts.toLocaleString("vi-VN");

    const getButtonText = (plan: Plan, isProcessing: boolean) => {
        if (isProcessing) return "Đang xử lý...";
        if (plan.price > 0) return "Nâng cấp ngay";
        return "Bắt đầu miễn phí";
    };

    // ===== RENDER =====

    return (
        <section className="bg-gradient-to-br from-[#A8E6CF]/40 to-[#F7F9F9] py-20 relative overflow-hidden min-h-screen">
            {/* Decorative Background */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-[#2ECC71]/20 blur-3xl rounded-full animate-pulse" />
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#2C3E50]/10 blur-3xl rounded-full animate-pulse" style={{ animationDelay: "1s" }} />

            <AnimatedSection animation="fadeUp" delay={200}>
                <div className="max-w-6xl mx-auto px-6 relative z-10">

                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-[#2C3E50] mb-4">
                            Chọn Gói Phù Hợp Cho Bạn
                        </h1>
                        <p className="text-lg text-[#2C3E50]/70 max-w-2xl mx-auto">
                            Dù bạn mới bắt đầu hay đã sẵn sàng cam kết, chúng tôi có gói phù hợp để hỗ trợ bạn.
                        </p>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 text-[#2ECC71] animate-spin mb-4" />
                            <p className="text-[#2C3E50]/70 text-lg">Đang tải gói...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-[#2C3E50] mb-2">Có lỗi xảy ra</h3>
                            <p className="text-gray-600 mb-6">{error}</p>
                            <button
                                onClick={fetchPlans}
                                className="px-6 py-3 bg-[#2ECC71] text-white rounded-xl hover:bg-[#27AE60] transition font-medium"
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : plans.length === 0 ? (
                        <div className="text-center text-[#2C3E50]/70 text-lg py-20">
                            Hiện không có gói đăng ký nào.
                        </div>
                    ) : (
                        <div className={`grid ${getGridCols()} gap-10`}>
                            {plans.map((plan, index) => (
                                <AnimatedSection key={plan.name} animation="fadeUp" delay={index * 200}>
                                    <div className={getPlanCardClass(plan)}>
                                        {/* Badge */}
                                        {getPlanBadge(plan)}

                                        {/* Header */}
                                        <div className="text-center mb-6">
                                            <h3 className="text-2xl font-bold text-[#2C3E50] mb-3">
                                                {plan.name}
                                            </h3>
                                            <div className="flex items-baseline justify-center gap-2">
                                                <span className={`text-4xl font-extrabold ${isPremiumPlan(plan.name) ? "text-[#2ECC71]" : "text-[#2C3E50]"}`}>
                                                    {plan.price.toLocaleString("vi-VN")}
                                                </span>
                                                <span className="text-gray-500 font-medium">
                                                    {plan.currency} / {plan.durationDays} ngày
                                                </span>
                                            </div>
                                            <p className="mt-3 text-[#2C3E50]/70">{plan.description}</p>
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-3 mb-6 text-sm text-[#2C3E50]/80">
                                            <div className="flex items-center justify-between p-3 bg-[#F7F9F9] rounded-lg">
                                                <span className="font-medium">Bài đăng tối đa:</span>
                                                <span className="font-bold text-[#2ECC71]">{formatMaxPosts(plan.maxPosts)}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-[#F7F9F9] rounded-lg">
                                                <span className="font-medium">Cấp độ ưu tiên:</span>
                                                <span className="font-bold text-[#2ECC71]">{plan.priorityLevel}</span>
                                            </div>
                                        </div>

                                        {/* CTA Button */}
                                        <button
                                            onClick={() => handleSubscribe(plan.name)}
                                            disabled={processingPlan === plan.name}
                                            className={getButtonClass(plan)}
                                        >
                                            {processingPlan === plan.name ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Đang xử lý...
                                                </span>
                                            ) : (
                                                getButtonText(plan, false)
                                            )}
                                        </button>
                                    </div>
                                </AnimatedSection>
                            ))}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-20 text-center text-[#2C3E50]/70">
                        <div className="flex justify-center items-center gap-3 mb-3">
                            <Zap className="w-6 h-6 text-[#2ECC71]" />
                            <p className="font-medium text-lg">
                                Mỗi gói đều được thiết kế để đồng hành cùng bạn trên hành trình tốt đẹp hơn 🌱
                            </p>
                        </div>
                        <p className="text-sm text-gray-500">Bạn có thể nâng cấp hoặc hủy bất kỳ lúc nào.</p>
                    </div>
                </div>
            </AnimatedSection>
        </section>
    );
};

export default SubscriptionsPlan;
