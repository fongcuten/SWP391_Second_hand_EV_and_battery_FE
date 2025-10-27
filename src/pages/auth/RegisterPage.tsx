import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react";
import api from "../../config/axios";
import { useToast } from "../../contexts/ToastContext";

export const RegisterPage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error for this field when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.username.trim()) {
            newErrors.username = "Vui lòng nhập tên đăng nhập";
        } else if (formData.username.length < 3) {
            newErrors.username = "Tên đăng nhập phải có ít nhất 3 ký tự";
        }

        if (!formData.firstName.trim()) {
            newErrors.firstName = "Vui lòng nhập tên";
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = "Vui lòng nhập họ";
        }

        if (!formData.password) {
            newErrors.password = "Vui lòng nhập mật khẩu";
        } else if (formData.password.length < 6) {
            newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            showToast("Vui lòng kiểm tra lại thông tin", "error");
            return;
        }

        try {
            setLoading(true);

            // API request payload
            const payload = {
                username: formData.username.trim(),
                password: formData.password,
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
            };

            console.log("Sending registration request:", payload);

            // Call register API
            const response = await api.post("/users", payload, {
                skipAuth: true, // Skip auth for registration
            } as any);

            console.log("Registration response:", response.data);

            // Success
            showToast("Đăng ký thành công! Vui lòng đăng nhập", "success");
            
            // Redirect to login page after short delay
            setTimeout(() => {
                navigate("/dang-nhap", { 
                    state: { 
                        email: formData.username,
                        message: "Đăng ký thành công! Vui lòng đăng nhập để tiếp tục" 
                    } 
                });
            }, 1500);

        } catch (error: any) {
            console.error("Registration error:", error);
            console.error("Error response:", error.response?.data);

            // Handle specific error messages
            if (error.response?.data?.message) {
                showToast(error.response.data.message, "error");
            } else if (error.response?.status === 400) {
                showToast("Thông tin đăng ký không hợp lệ", "error");
            } else if (error.response?.status === 409) {
                showToast("Tên đăng nhập đã tồn tại", "error");
                setErrors(prev => ({
                    ...prev,
                    username: "Tên đăng nhập đã được sử dụng"
                }));
            } else {
                showToast("Đăng ký thất bại. Vui lòng thử lại", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <span className="text-3xl">🚗</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Tạo tài khoản mới
                    </h1>
                    <p className="text-gray-600">
                        Đăng ký để bắt đầu mua bán xe điện
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* First Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tên <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-xl border ${
                                    errors.firstName 
                                        ? "border-red-300 focus:ring-red-200" 
                                        : "border-gray-300 focus:ring-green-200"
                                } focus:ring-2 focus:outline-none transition-all`}
                                placeholder="Nhập tên của bạn"
                            />
                            {errors.firstName && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <XCircle className="w-4 h-4" />
                                    {errors.firstName}
                                </p>
                            )}
                        </div>

                        {/* Last Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Họ <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-xl border ${
                                    errors.lastName 
                                        ? "border-red-300 focus:ring-red-200" 
                                        : "border-gray-300 focus:ring-green-200"
                                } focus:ring-2 focus:outline-none transition-all`}
                                placeholder="Nhập họ của bạn"
                            />
                            {errors.lastName && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <XCircle className="w-4 h-4" />
                                    {errors.lastName}
                                </p>
                            )}
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tên đăng nhập <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-xl border ${
                                    errors.username 
                                        ? "border-red-300 focus:ring-red-200" 
                                        : "border-gray-300 focus:ring-green-200"
                                } focus:ring-2 focus:outline-none transition-all`}
                                placeholder="Nhập tên đăng nhập"
                                autoComplete="username"
                            />
                            {errors.username && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <XCircle className="w-4 h-4" />
                                    {errors.username}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mật khẩu <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                                        errors.password 
                                            ? "border-red-300 focus:ring-red-200" 
                                            : "border-gray-300 focus:ring-green-200"
                                    } focus:ring-2 focus:outline-none transition-all`}
                                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <XCircle className="w-4 h-4" />
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Xác nhận mật khẩu <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                                        errors.confirmPassword 
                                            ? "border-red-300 focus:ring-red-200" 
                                            : "border-gray-300 focus:ring-green-200"
                                    } focus:ring-2 focus:outline-none transition-all`}
                                    placeholder="Nhập lại mật khẩu"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <XCircle className="w-4 h-4" />
                                    {errors.confirmPassword}
                                </p>
                            )}
                            {!errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
                                <p className="mt-1.5 text-sm text-green-600 flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" />
                                    Mật khẩu khớp
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Đang xử lý...</span>
                                </>
                            ) : (
                                <span>Đăng ký</span>
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Đã có tài khoản?{" "}
                            <Link
                                to="/dang-nhap"
                                className="text-green-600 hover:text-green-700 font-semibold hover:underline"
                            >
                                Đăng nhập ngay
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Terms */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Bằng việc đăng ký, bạn đồng ý với{" "}
                    <a href="#" className="text-green-600 hover:underline">
                        Điều khoản dịch vụ
                    </a>{" "}
                    và{" "}
                    <a href="#" className="text-green-600 hover:underline">
                        Chính sách bảo mật
                    </a>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;