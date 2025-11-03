import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    CheckCircle,
    XCircle,
    Loader2,
    ArrowRight,
    Home,
    Sparkles,
    Gift,
    Calendar,
    CreditCard,
    AlertCircle
} from "lucide-react";
import api from "../../config/axios";
import { useAuth } from "../../contexts/AuthContext";

type PaymentStatus = "success" | "failed" | "processing" | "cancelled";

interface PaymentResultData {
    status: PaymentStatus;
    transactionId?: string;
    amount?: number;
    planName?: string;
    expiryDate?: string;
    message?: string;
}

export const PaymentResult = () => {
    const navigate = useNavigate();
    const { refreshUser } = useAuth();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [paymentData, setPaymentData] = useState<PaymentResultData | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        verifyAndActivatePayment();
    }, []);

    useEffect(() => {
        if (paymentData?.status === "success") {
            setShowConfetti(true);
            const timer = setTimeout(() => setShowConfetti(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [paymentData?.status]);

    const verifyAndActivatePayment = async () => {
        try {
            setLoading(true);

            const sessionId = searchParams.get("session_id");

            console.log("=== Payment Result Debug ===");
            console.log("Full URL:", window.location.href);
            console.log("Session ID:", sessionId);
            console.log("All params:", Object.fromEntries(searchParams.entries()));

            // Check if this is a Stripe success redirect with session_id
            if (sessionId) {
                console.log("📝 Activating plan with session ID...");

                try {
                    // Call the activation API
                    const response = await api.post("/users/me/plan/checkout/activate-from-session", {
                        sessionId: sessionId
                    });

                    console.log("✅ Plan activation response:", response.data);

                    const result = response.data?.result || response.data;

                    // If activation successful
                    if (result || response.status === 200) {
                        // Refresh user data to get updated plan info
                        if (refreshUser) {
                            await refreshUser();
                        }

                        setPaymentData({
                            status: "success",
                            transactionId: result.transactionId || result.sessionId || sessionId,
                            amount: result.amount || result.price,
                            planName: result.planName || result.plan?.name,
                            expiryDate: result.expiryDate || result.expireAt,
                            message: result.message || "Thanh toán thành công! Gói đăng ký đã được kích hoạt."
                        });
                    } else {
                        setPaymentData({
                            status: "failed",
                            message: result.message || "Kích hoạt gói đăng ký thất bại"
                        });
                    }
                } catch (apiError: any) {
                    console.error("❌ Plan activation error:", apiError);

                    // Handle specific error cases
                    if (apiError.response?.status === 400) {
                        setPaymentData({
                            status: "failed",
                            message: apiError.response?.data?.message || "Session không hợp lệ hoặc đã hết hạn"
                        });
                    } else if (apiError.response?.status === 404) {
                        setPaymentData({
                            status: "failed",
                            message: "Không tìm thấy thông tin thanh toán"
                        });
                    } else if (apiError.response?.status === 409) {
                        setPaymentData({
                            status: "failed",
                            message: "Gói đăng ký đã được kích hoạt trước đó"
                        });
                    } else {
                        setPaymentData({
                            status: "failed",
                            message: apiError.response?.data?.message || "Lỗi kích hoạt gói đăng ký"
                        });
                    }
                }
            }
            // Handle cancelled or other status
            else {
                const cancelled = searchParams.get("cancelled");
                const status = searchParams.get("status");

                if (cancelled === "true") {
                    setPaymentData({
                        status: "cancelled",
                        message: "Bạn đã hủy thanh toán"
                    });
                } else if (status === "success") {
                    setPaymentData({
                        status: "success",
                        message: "Thanh toán thành công"
                    });
                } else {
                    setPaymentData({
                        status: "failed",
                        message: "Không tìm thấy thông tin thanh toán. Vui lòng kiểm tra lại."
                    });
                }
            }
        } catch (error: any) {
            console.error("❌ Payment verification error:", error);
            setPaymentData({
                status: "failed",
                message: error.response?.data?.message || "Lỗi xử lý thanh toán"
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = () => {
        switch (paymentData?.status) {
            case "success":
                return {
                    icon: CheckCircle,
                    iconColor: "text-green-500",
                    iconBg: "bg-green-100",
                    gradient: "from-green-400 to-emerald-500",
                    ringColor: "ring-green-200",
                    glowColor: "shadow-green-200",
                    title: "Thanh toán thành công!",
                    subtitle: "Chúc mừng! Gói đăng ký của bạn đã được kích hoạt",
                    emoji: "🎉"
                };
            case "failed":
                return {
                    icon: XCircle,
                    iconColor: "text-red-500",
                    iconBg: "bg-red-100",
                    gradient: "from-red-400 to-rose-500",
                    ringColor: "ring-red-200",
                    glowColor: "shadow-red-200",
                    title: "Thanh toán thất bại",
                    subtitle: "Đã có lỗi xảy ra trong quá trình thanh toán",
                    emoji: "😔"
                };
            case "cancelled":
                return {
                    icon: AlertCircle,
                    iconColor: "text-amber-500",
                    iconBg: "bg-amber-100",
                    gradient: "from-amber-400 to-orange-500",
                    ringColor: "ring-amber-200",
                    glowColor: "shadow-amber-200",
                    title: "Đã hủy thanh toán",
                    subtitle: "Bạn có thể thử lại bất cứ lúc nào",
                    emoji: "💭"
                };
            default:
                return {
                    icon: Loader2,
                    iconColor: "text-blue-500",
                    iconBg: "bg-blue-100",
                    gradient: "from-blue-400 to-cyan-500",
                    ringColor: "ring-blue-200",
                    glowColor: "shadow-blue-200",
                    title: "Đang xử lý...",
                    subtitle: "Vui lòng chờ trong giây lát",
                    emoji: "⏳"
                };
        }
    };

    const formatCurrency = (amount?: number): string => {
        if (!amount) return "0 VNĐ";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const formatDate = (dateString?: string): string => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-12 max-w-md w-full text-center border border-white/20">
                    <div className="relative">
                        <Loader2 className="w-20 h-20 text-green-600 mx-auto animate-spin mb-6" />
                        <div className="absolute inset-0 bg-green-400 blur-2xl opacity-20 animate-pulse"></div>
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                        Đang kích hoạt gói đăng ký...
                    </h2>
                    <p className="text-gray-600 text-lg">Vui lòng chờ trong giây lát</p>

                    <div className="mt-6 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse" style={{ width: "70%" }}></div>
                    </div>
                </div>
            </div>
        );
    }

    const config = getStatusConfig();
    const StatusIcon = config.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            {showConfetti && paymentData?.status === "success" && (
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `-${Math.random() * 20}%`,
                                animationDelay: `${Math.random() * 3}s`,
                                fontSize: `${Math.random() * 20 + 10}px`,
                            }}
                        >
                            {["🎉", "✨", "🎊", "⭐", "💚"][Math.floor(Math.random() * 5)]}
                        </div>
                    ))}
                </div>
            )}

            <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full border border-white/20">
                <div className="text-center mb-10">
                    <div className="relative inline-block mb-6">
                        <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} rounded-full blur-2xl opacity-40 animate-pulse`}></div>

                        <div className={`relative inline-flex items-center justify-center w-28 h-28 ${config.iconBg} rounded-full ring-8 ${config.ringColor} shadow-xl ${config.glowColor}`}>
                            <StatusIcon
                                className={`w-14 h-14 ${config.iconColor} ${paymentData?.status === "processing" ? "animate-spin" : "animate-bounce"}`}
                                strokeWidth={2.5}
                            />
                        </div>

                        <div className="absolute -top-4 -right-4 text-5xl animate-bounce">{config.emoji}</div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3 animate-fade-in">
                        {config.title}
                    </h1>
                    <p className="text-gray-600 text-lg md:text-xl animate-fade-in animation-delay-200">
                        {paymentData?.message || config.subtitle}
                    </p>
                </div>

                {paymentData?.status === "success" && (
                    <div className="mb-8 animate-fade-in animation-delay-400">
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <Sparkles className="w-5 h-5 text-amber-500" />
                            <span className="text-sm font-semibold text-transparent bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text">
                                PREMIUM MEMBER
                            </span>
                            <Sparkles className="w-5 h-5 text-amber-500" />
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-lg">
                            <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2 text-lg">
                                <Gift className="w-5 h-5 text-green-600" />
                                Chi tiết thanh toán
                            </h3>

                            <div className="space-y-4">
                                {paymentData.transactionId && (
                                    <div className="flex justify-between items-center py-3 border-b border-green-200/50">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <CreditCard className="w-4 h-4" />
                                            <span>Mã giao dịch</span>
                                        </div>
                                        <span className="font-mono font-medium text-gray-800 bg-white px-3 py-1 rounded-lg text-sm break-all max-w-xs text-right">
                                            {paymentData.transactionId}
                                        </span>
                                    </div>
                                )}

                                {paymentData.planName && (
                                    <div className="flex justify-between items-center py-3 border-b border-green-200/50">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Sparkles className="w-4 h-4" />
                                            <span>Gói đăng ký</span>
                                        </div>
                                        <span className="font-semibold text-green-700 bg-white px-4 py-1.5 rounded-lg">
                                            {paymentData.planName}
                                        </span>
                                    </div>
                                )}

                                {paymentData.amount && (
                                    <div className="flex justify-between items-center py-3 border-b border-green-200/50">
                                        <span className="text-gray-600">Số tiền thanh toán</span>
                                        <span className="font-bold text-green-600 text-2xl">
                                            {formatCurrency(paymentData.amount)}
                                        </span>
                                    </div>
                                )}

                                {paymentData.expiryDate && (
                                    <div className="flex justify-between items-center py-3">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Calendar className="w-4 h-4" />
                                            <span>Hạn sử dụng</span>
                                        </div>
                                        <span className="font-medium text-gray-800 bg-white px-4 py-1.5 rounded-lg">
                                            {formatDate(paymentData.expiryDate)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 bg-white rounded-xl p-4 border-2 border-green-300 shadow-sm">
                                <p className="text-sm text-green-800 text-center font-medium flex items-center justify-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    Bạn đã có thể đăng tin không giới hạn!
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {(paymentData?.status === "failed" || paymentData?.status === "cancelled") && paymentData.message && (
                    <div className={`mb-8 rounded-2xl p-6 border-2 animate-fade-in animation-delay-400 ${paymentData.status === "failed" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
                        }`}>
                        <div className="flex items-start gap-3">
                            <AlertCircle className={`w-6 h-6 flex-shrink-0 ${paymentData.status === "failed" ? "text-red-500" : "text-amber-500"
                                }`} />
                            <div>
                                <p className={`font-medium mb-1 ${paymentData.status === "failed" ? "text-red-900" : "text-amber-900"
                                    }`}>
                                    {paymentData.status === "failed" ? "Lỗi thanh toán" : "Đã hủy giao dịch"}
                                </p>
                                <p className={`text-sm ${paymentData.status === "failed" ? "text-red-700" : "text-amber-700"
                                    }`}>
                                    {paymentData.message}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-in animation-delay-600">
                    {paymentData?.status === "success" ? (
                        <>
                            <button
                                onClick={() => navigate("/ho-so/posts")}
                                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3 group"
                            >
                                <span className="text-lg">Đăng tin ngay</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => navigate("/")}
                                className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg flex items-center justify-center gap-3"
                            >
                                <Home className="w-5 h-5" />
                                <span>Về trang chủ</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate("/ke-hoach")}
                                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-105 hover:shadow-xl"
                            >
                                Thử lại
                            </button>
                            <button
                                onClick={() => navigate("/")}
                                className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg flex items-center justify-center gap-3"
                            >
                                <Home className="w-5 h-5" />
                                <span>Về trang chủ</span>
                            </button>
                        </>
                    )}
                </div>

                <div className="text-center pt-6 border-t border-gray-200 animate-fade-in animation-delay-800">
                    <p className="text-sm text-gray-600">
                        Cần hỗ trợ?{" "}
                        <button
                            onClick={() => navigate("/ho-tro")}
                            className="text-green-600 hover:text-green-700 font-semibold underline underline-offset-2 hover:underline-offset-4 transition-all"
                        >
                            Liên hệ với chúng tôi
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentResult;