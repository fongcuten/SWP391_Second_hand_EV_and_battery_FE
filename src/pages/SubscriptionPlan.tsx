import React, { useEffect, useState } from "react";
import { Zap, AlertCircle, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AnimatedSection } from "../components/ui/AnimatedSection";
import api from "../config/axios";
import { useAuth } from "../contexts/AuthContext";

type Plan = {
    name: string;
    description: string;
    price: number;
    durationDays: number;
    currency: string;
    maxPosts: number;
    priorityLevel: number;
};

export const SubscriptionsPlan = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await api.get("/plans", { skipAuth: true });
                const data = response.data?.result;
                console.log("Fetched plans:", data);
                if (Array.isArray(data)) {
                    setPlans(data);
                } else {
                    console.error("Unexpected API structure:", response.data);
                    setPlans([]);
                }
            } catch (err) {
                console.error("Error fetching plans:", err);
                setError("Không thể tải gói đăng ký. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    // ✅ Handle button click
    const handleSubscribe = async (planName: string) => {
        if (!user) {
            navigate("/dang-nhap", { state: { from: "/ke-hoach" } });
            return;
        }

        try {
            setLoadingPlan(planName);

            // Call checkout endpoint (axios interceptor will handle auth token)
            const response = await api.post("/users/me/plan/checkout", {
                planName
            });

            const checkoutUrl = response.data?.result?.checkoutUrl;
            if (!checkoutUrl) {
                alert("Không nhận được URL thanh toán. Vui lòng thử lại.");
                return;
            }

            // Redirect to Stripe Checkout
            window.location.replace(checkoutUrl);

        } catch (error: any) {
            console.error("Checkout error:", error);
            console.error("Error response:", error.response?.data);

            if (error.response?.status === 401) {
                alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
                localStorage.removeItem("auth_token");
                navigate("/dang-nhap");
            } else {
                const errorMsg = error.response?.data?.message || "Lỗi hệ thống, vui lòng thử lại sau.";
                alert(errorMsg);
            }
        } finally {
            setLoadingPlan(null);
        }
    };



    return (
        <section className="bg-gradient-to-br from-[#A8E6CF]/40 to-[#F7F9F9] py-20 relative overflow-hidden">
            {/* Decorative floating glows */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-[#2ECC71]/20 blur-3xl rounded-full animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#2C3E50]/10 blur-3xl rounded-full animate-pulse delay-1000"></div>

            <AnimatedSection animation="fadeUp" delay={200}>
                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-[#2C3E50] mb-4">
                            Chọn Gói Phù Hợp Cho Bạn
                        </h1>
                        <p className="text-lg text-[#2C3E50]/70 max-w-2xl mx-auto">
                            Dù bạn mới bắt đầu hay đã sẵn sàng cam kết, chúng tôi có gói phù hợp để hỗ trợ bạn.
                        </p>
                    </div>

                    {/* Loading / Error States */}
                    {loading ? (
                        <div className="text-center text-[#2C3E50]/70 text-lg">Đang tải gói...</div>
                    ) : error ? (
                        <div className="text-center text-red-600 flex items-center justify-center gap-2">
                            <AlertCircle className="w-5 h-5" /> {error}
                        </div>
                    ) : (
                        <div className={`grid md:grid-cols-${plans.length} gap-10`}>
                            {plans.map((plan, index) => {
                                const isPremium = plan.name.toLowerCase().includes("premium");

                                return (
                                    <AnimatedSection key={index} animation="fadeUp" delay={index * 200}>
                                        <div
                                            className={`relative rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-2 
                        ${isPremium
                                                    ? "bg-gradient-to-br from-[#2ECC71]/20 to-[#A8E6CF]/40 border-[#2ECC71] shadow-[0_0_30px_rgba(46,204,113,0.3)] scale-105"
                                                    : "bg-white border-gray-100 hover:border-[#2ECC71]/40 shadow-lg"
                                                }`}
                                        >
                                            {isPremium ? (
                                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1 bg-[#2ECC71] text-white font-semibold text-sm rounded-full shadow-md">
                                                    <Crown className="w-4 h-4 text-yellow-300" />
                                                    Cao Cấp Nhất
                                                </div>
                                            ) : plan.priorityLevel >= 2 ? (
                                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#2ECC71] text-white font-semibold text-sm rounded-full shadow-md">
                                                    Phổ Biến
                                                </div>
                                            ) : null}

                                            {/* Plan Header */}
                                            <div className="text-center mb-6">
                                                <h3 className="text-2xl font-bold text-[#2C3E50] mb-3">
                                                    {plan.name}
                                                </h3>
                                                <div className="flex items-baseline justify-center gap-2">
                                                    <span className={`text-4xl font-extrabold ${isPremium ? "text-[#2ECC71]" : "text-[#2C3E50]"}`}>
                                                        {plan.price.toLocaleString("vi-VN")}
                                                    </span>
                                                    <span className="text-gray-500 font-medium">
                                                        {plan.currency} / {plan.durationDays} ngày
                                                    </span>
                                                </div>
                                                <p className="mt-3 text-[#2C3E50]/70">{plan.description}</p>
                                            </div>

                                            {/* Plan Info */}
                                            <div className="text-sm text-[#2C3E50]/70 mb-6 space-y-1">
                                                <p>
                                                    <strong>Bài đăng tối đa:</strong>{" "}
                                                    {plan.maxPosts === 9999 ? "Không giới hạn" : plan.maxPosts}
                                                </p>
                                                <p>
                                                    <strong>Cấp độ ưu tiên:</strong> {plan.priorityLevel}
                                                </p>
                                            </div>

                                            {/* CTA Button (logic added here) */}
                                            <button
                                                onClick={() => handleSubscribe(plan.name)}
                                                disabled={loadingPlan === plan.name}
                                                className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors 
                          ${isPremium
                                                        ? "bg-[#2ECC71] text-white hover:bg-[#29b765]"
                                                        : "bg-[#F7F9F9] text-[#2C3E50] border border-[#A8E6CF] hover:bg-[#A8E6CF]/60"
                                                    }`}
                                            >
                                                {loadingPlan === plan.name
                                                    ? "Đang xử lý..."
                                                    : plan.price > 0
                                                        ? "Nâng cấp ngay"
                                                        : "Bắt đầu miễn phí"}
                                            </button>
                                        </div>
                                    </AnimatedSection>
                                );
                            })}
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
