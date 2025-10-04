import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./components/HomePage";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ElectricVehiclesPage from "./pages/ElectricVehiclesPage";
import ElectricVehicleDetailPage from "./pages/ElectricVehicleDetailPage";
// Import các pages khác khi tạo
// import BatteryAccessoriesPage from './pages/BatteryAccessoriesPage';
// import BrandsPage from './pages/BrandsPage';
// import ComparePage from './pages/ComparePage';
// import SupportPage from './pages/SupportPage';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/dang-nhap" element={<LoginPage />} />
                <Route path="/dang-ky" element={<RegisterPage />} />

                {/* Protected Routes - require login */}
                <Route
                  path="/ho-so"
                  element={
                    <ProtectedRoute>
                      <div className="text-center py-20">
                        <h1 className="text-2xl font-bold text-gray-800">
                          Thông tin cá nhân
                        </h1>
                        <p className="text-gray-600 mt-2">
                          Trang này đang được phát triển...
                        </p>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cai-dat"
                  element={
                    <ProtectedRoute>
                      <div className="text-center py-20">
                        <h1 className="text-2xl font-bold text-gray-800">
                          Cài đặt
                        </h1>
                        <p className="text-gray-600 mt-2">
                          Trang này đang được phát triển...
                        </p>
                      </div>
                    </ProtectedRoute>
                  }
                />

                {/* Admin Only Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <div className="text-center py-20">
                        <h1 className="text-2xl font-bold text-gray-800">
                          Quản trị hệ thống
                        </h1>
                        <p className="text-gray-600 mt-2">
                          Chào mừng quản trị viên!
                        </p>
                      </div>
                    </ProtectedRoute>
                  }
                />

                {/* Electric Vehicle Pages */}
                <Route path="/xe-dien" element={<ElectricVehiclesPage />} />
                <Route
                  path="/xe-dien/:id"
                  element={<ElectricVehicleDetailPage />}
                />

                {/* Other pages - uncomment khi tạo */}
                {/* <Route path="/pin-phu-kien" element={<BatteryAccessoriesPage />} /> */}
                {/* <Route path="/thuong-hieu" element={<BrandsPage />} /> */}
                {/* <Route path="/so-sanh" element={<ComparePage />} /> */}
                {/* <Route path="/ho-tro" element={<SupportPage />} /> */}

                {/* 404 Page */}
                <Route
                  path="*"
                  element={
                    <div className="text-center py-20">
                      <h1 className="text-4xl font-bold text-gray-600">
                        404 - Trang không tồn tại
                      </h1>
                      <p className="text-gray-500 mt-4">
                        Trang bạn đang tìm kiếm không tồn tại.
                      </p>
                    </div>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
