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
import UserPosts from "./pages/User/UserPost";
import UserHome from "./components/UserHome";
import SavedPostsPage from "./pages/User/SavedPost";
import UserInfoForm from "./pages/User/UserInfo";
import ChangePasswordPage from "./pages/User/ChangePassword";
import CreateEVPost from "./pages/Post/CreatePost";
import PaymentPage from "./pages/User/TopUp";
import FavoritesPage from "./pages/User/FavoritesPage";
import NotificationsPage from "./pages/User/NotificationsPage";
import BatteriesPage from "./pages/BatteriesPage";
import BatteryDetailPage from "./pages/BatteryDetailPage";
import ComparePage from "./pages/ComparePage";
import SupportPage from "./pages/SupportPage";
import ChatPage from "./pages/ChatPage";
import SubscriptionsPlan from "./pages/SubscriptionPlan";

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                {/* ✅ Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/dang-nhap" element={<LoginPage />} />
                <Route path="/dang-ky" element={<RegisterPage />} />

                {/* ✅ Protected User Routes */}
                <Route
                  path="/ho-so"
                  element={
                    <ProtectedRoute>
                      <UserHome />
                    </ProtectedRoute>
                  }
                >
                  <Route path="posts" element={<UserPosts />} />
                  <Route path="saved-post" element={<SavedPostsPage />} />
                  <Route path="info" element={<UserInfoForm />} />
                  <Route
                    path="change-password"
                    element={<ChangePasswordPage />}
                  />
                  <Route path="topup" element={<PaymentPage />} />
                </Route>

                {/* Favorites and Notifications */}
                <Route
                  path="/yeu-thich"
                  element={
                    <ProtectedRoute>
                      <FavoritesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/thong-bao"
                  element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="dang-tin"
                  element={
                    <ProtectedRoute>
                      <CreateEVPost />
                    </ProtectedRoute>
                  }
                />

                {/* ✅ Admin Route */}
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

                {/* ✅ Electric Vehicles */}
                <Route path="/xe-dien" element={<ElectricVehiclesPage />} />
                <Route
                  path="/xe-dien/:id"
                  element={<ElectricVehicleDetailPage />}
                />


                <Route path="/chat" element={<ChatPage />} />
                {/* Battery Pages */}
                <Route path="/pin" element={<BatteriesPage />} />
                <Route path="/pin/:id" element={<BatteryDetailPage />} />

                {/* Other pages */}
                <Route path="/so-sanh" element={<ComparePage />} />
                <Route path="/ho-tro" element={<SupportPage />} />
                <Route path="/ke-hoach" element={<SubscriptionsPlan />} />


                {/* ✅ 404 Fallback */}
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
