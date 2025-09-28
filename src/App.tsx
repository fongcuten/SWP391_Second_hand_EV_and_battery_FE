import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./components/HomePage";
// Import các pages khác khi tạo
// import ElectricVehiclesPage from './pages/ElectricVehiclesPage';
// import BatteryAccessoriesPage from './pages/BatteryAccessoriesPage';
// import BrandsPage from './pages/BrandsPage';
// import ComparePage from './pages/ComparePage';
// import SupportPage from './pages/SupportPage';
// import LoginPage from './pages/auth/LoginPage';
// import RegisterPage from './pages/auth/RegisterPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* Uncomment khi tạo các pages */}
            {/* <Route path="/xe-dien" element={<ElectricVehiclesPage />} /> */}
            {/* <Route path="/pin-phu-kien" element={<BatteryAccessoriesPage />} /> */}
            {/* <Route path="/thuong-hieu" element={<BrandsPage />} /> */}
            {/* <Route path="/so-sanh" element={<ComparePage />} /> */}
            {/* <Route path="/ho-tro" element={<SupportPage />} /> */}
            {/* <Route path="/dang-nhap" element={<LoginPage />} /> */}
            {/* <Route path="/dang-ky" element={<RegisterPage />} /> */}
            {/* 404 Page */}
            <Route
              path="*"
              element={
                <div className="text-center py-20">
                  <h1 className="text-4xl font-bold text-gray-600">
                    404 - Trang không tồn tại
                  </h1>
                </div>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
