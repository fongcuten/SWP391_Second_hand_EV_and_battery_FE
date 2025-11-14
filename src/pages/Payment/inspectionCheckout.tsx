import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InspectionService } from "../../services/Inspection/InspectionService";
import { toast } from "react-toastify";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const STATUS_LOADING = "LOADING";
const STATUS_SUCCESS = "SUCCESS";
const STATUS_ERROR = "ERROR";
type Status = typeof STATUS_LOADING | typeof STATUS_SUCCESS | typeof STATUS_ERROR;

const CheckoutSuccessPage = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<Status>(STATUS_LOADING);
    const [message, setMessage] = useState("Đang xác nhận thanh toán của bạn...");
    const [errorDetail, setErrorDetail] = useState<string | null>(null);

    const processPayment = async () => {
        // Reset state for retries
        setStatus(STATUS_LOADING);
        setErrorDetail(null);
        setMessage("Đang xác nhận thanh toán của bạn...");

        const currentUrl = window.location.href;
        const isSuccess = currentUrl.includes("success=true");

        if (!isSuccess) {
            setStatus(STATUS_ERROR);
            setMessage("Thanh toán đã bị hủy hoặc không thành công.");
            localStorage.removeItem("pendingInspectionOrderId");
            return;
        }

        const inspectionOrderIdStr = localStorage.getItem("pendingInspectionOrderId");
        if (!inspectionOrderIdStr) {
            setStatus(STATUS_ERROR);
            setMessage("Không tìm thấy mã đơn kiểm duyệt để xác nhận.");
            setErrorDetail("Vui lòng thử lại quy trình đặt lịch từ đầu.");
            return;
        }

        try {
            const orderId = parseInt(inspectionOrderIdStr, 10);
            await InspectionService.confirmInspectionPayment(orderId);

            setStatus(STATUS_SUCCESS);
            setMessage("Thanh toán thành công! Đơn kiểm duyệt của bạn đã được xác nhận.");
            toast.success("Thanh toán và xác nhận đơn kiểm duyệt thành công!");

            setTimeout(() => {
                navigate("/user/posts");
            }, 4000);

        } catch (error: any) {
            console.error("❌ Failed to confirm payment:", error);
            setStatus(STATUS_ERROR);
            setMessage("Không thể xác nhận thanh toán với máy chủ.");
            setErrorDetail(error.response?.data?.message || error.message || "Vui lòng liên hệ hỗ trợ.");
            toast.error("Lỗi xác nhận thanh toán!");
        } finally {
            localStorage.removeItem("pendingInspectionOrderId");
        }
    };

    useEffect(() => {
        processPayment();
    }, []);

    const renderStatus = () => {
        switch (status) {
            case STATUS_SUCCESS:
                return (
                    <>
                        <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-5" />
                        <h1 className="text-2xl font-bold text-gray-900">Thanh Toán Thành Công</h1>
                    </>
                );
            case STATUS_ERROR:
                return (
                    <>
                        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-5" />
                        <h1 className="text-2xl font-bold text-gray-900">Thanh Toán Thất Bại</h1>
                    </>
                );
            default: // STATUS_LOADING
                return (
                    <>
                        <Loader2 className="h-16 w-16 text-green-600 mx-auto mb-5 animate-spin" />
                        <h1 className="text-2xl font-bold text-gray-900">Đang Xử Lý...</h1>
                    </>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md text-center bg-white rounded-lg shadow-lg border border-gray-200 p-8">
                {renderStatus()}
                <p className="text-gray-600 mt-3 mb-6">{message}</p>
                {errorDetail && (
                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md mb-6">
                        Chi tiết lỗi: {errorDetail}
                    </p>
                )}
                {status !== STATUS_LOADING && (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        {status === STATUS_ERROR && (
                            <button
                                onClick={processPayment}
                                className="w-full sm:w-auto px-6 py-2.5 bg-white text-green-700 font-semibold rounded-lg border-2 border-green-600 hover:bg-green-50 transition-colors"
                            >
                                Thử lại
                            </button>
                        )}
                        <button
                            onClick={() => navigate("/user/posts")}
                            className="w-full sm:w-auto px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Về trang quản lý
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutSuccessPage;