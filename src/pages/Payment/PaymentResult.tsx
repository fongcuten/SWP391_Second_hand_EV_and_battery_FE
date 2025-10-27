import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, ArrowRight, Home } from "lucide-react";
import api from "../../config/axios";

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
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [paymentData, setPaymentData] = useState<PaymentResultData | null>(null);

    useEffect(() => {
        verifyPayment();
    }, []);

    const verifyPayment = async () => {
        try {
            setLoading(true);

            // Get parameters from URL
            const sessionId = searchParams.get("session_id");
            const status = searchParams.get("status");
            const cancelled = searchParams.get("cancelled");

            // Handle cancelled payment
            if (cancelled === "true") {
                setPaymentData({
                    status: "cancelled",
                    message: "Bạn đã hủy thanh toán"
                });
                setLoading(false);
                return;
            }

            // Verify payment with backend
            if (sessionId) {
                const response = await api.post("/users/me/plan/verify-payment", {
                    sessionId
                });

                const result = response.data?.result;
                setPaymentData({
                    status: result?.success ? "success" : "failed",
                    transactionId: result?.transactionId,
                    amount: result?.amount,
                    planName: result?.planName,
                    expiryDate: result?.expiryDate,
                    message: result?.message
                });
            } else if (status === "success") {
                // Fallback if no session_id but status is success
                setPaymentData({
                    status: "success",
                    message: "Thanh toán thành công"
                });
            } else {
                setPaymentData({
                    status: "failed",
                    message: "Không tìm thấy thông tin thanh toán"
                });
            }
        } catch (error: any) {
            console.error("Payment verification error:", error);
            setPaymentData({
                status: "failed",
                message: error.response?.data?.message || "Lỗi xác thực thanh toán"
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
                    bgColor: "bg-green-50",
                    title: "Thanh toán thành công!",
                    description: "Gói đăng ký của bạn đã được kích hoạt",
                };
            case "failed":
                return {
                    icon: XCircle,
                    iconColor: "text-red-500",
                    bgColor: "bg-red-50",
                    title: "Thanh toán thất bại",
                    description: "Đã có lỗi xảy ra trong quá trình thanh toán",
                };
            case "cancelled":
                return {
                    icon: XCircle,
                    iconColor: "text-gray-500",
                    bgColor: "bg-gray-50",
                    title: "Đã hủy thanh toán",
                    description: "Bạn có thể thử lại bất cứ lúc nào",
                };
            default:
                return {
                    icon: Loader2,
                    iconColor: "text-blue-500",
                    bgColor: "bg-blue-50",
                    title: "Đang xử lý...",
                    description: "Vui lòng chờ trong giây lát",
                };
        }
    };

    const formatCurrency = (amount?: number) => {
        if (!amount) return "0 VNĐ";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <Loader2 className="w-16 h-16 text-green-600 mx-auto animate-spin mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Đang xác thực thanh toán...
                    </h2>
                    <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
                </div>
            </div>
        );
    }

    const config = getStatusConfig();
    const StatusIcon = config.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
                {/* Status Icon & Title */}
                <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-20 h-20 ${config.bgColor} rounded-full mb-4`}>
                        <StatusIcon className={`w-10 h-10 ${config.iconColor} ${paymentData?.status === "processing" ? "animate-spin" : ""}`} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {config.title}
                    </h1>
                    <p className="text-gray-600">
                        {paymentData?.message || config.description}
                    </p>
                </div>

                {/* Payment Details */}
                {paymentData?.status === "success" && (
                    <div className="bg-gray-50 rounded-xl p-6 mb-6 space-y-4">
                        <h3 className="font-semibold text-gray-800 mb-4">
                            Chi tiết thanh toán
                        </h3>

                        {paymentData.transactionId && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                <span className="text-gray-600">Mã giao dịch:</span>
                                <span className="font-medium text-gray-800">
                                    {paymentData.transactionId}
                                </span>
                            </div>
                        )}

                        {paymentData.planName && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                <span className="text-gray-600">Gói đăng ký:</span>
                                <span className="font-medium text-gray-800">
                                    {paymentData.planName}
                                </span>
                            </div>
                        )}

                        {paymentData.amount && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                <span className="text-gray-600">Số tiền:</span>
                                <span className="font-semibold text-green-600 text-lg">
                                    {formatCurrency(paymentData.amount)}
                                </span>
                            </div>
                        )}

                        {paymentData.expiryDate && (
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600">Hạn sử dụng:</span>
                                <span className="font-medium text-gray-800">
                                    {formatDate(paymentData.expiryDate)}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Error Message */}
                {(paymentData?.status === "failed" || paymentData?.status === "cancelled") && paymentData.message && (
                    <div className={`${paymentData.status === "failed" ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"} border rounded-xl p-4 mb-6`}>
                        <p className={`text-sm ${paymentData.status === "failed" ? "text-red-700" : "text-gray-700"}`}>
                            {paymentData.message}
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {paymentData?.status === "success" ? (
                        <>
                            <button
                                onClick={() => navigate("/ho-so/posts")}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <span>Đăng tin ngay</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => navigate("/")}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Home className="w-5 h-5" />
                                <span>Về trang chủ</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate("/ke-hoach")}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                            >
                                Thử lại
                            </button>
                            <button
                                onClick={() => navigate("/")}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Home className="w-5 h-5" />
                                <span>Về trang chủ</span>
                            </button>
                        </>
                    )}
                </div>

                {/* Support Link */}
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        Cần hỗ trợ?{" "}
                        <button
                            onClick={() => navigate("/ho-tro")}
                            className="text-green-600 hover:text-green-700 font-medium underline"
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