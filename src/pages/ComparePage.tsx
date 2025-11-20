import React, { useEffect, useMemo, useState } from "react";
import { X, Plus, Check, ArrowRight, RefreshCcw } from "lucide-react";
import { toast } from "react-toastify";
import type { ElectricVehicle } from "../types/electricVehicle";
import {
  ListPostService,
  type ListPostSummary,
} from "../services/Vehicle/ElectricVehiclesPageService";
import { locationService } from "../services/locationService";
import { VehicleDetailService } from "../services/Vehicle/ElectricDetailsService";

interface SalePostDetail {
  listingId: number;
  productType?: "VEHICLE" | "BATTERY";
  askPrice?: number;
  title?: string;
  description?: string;
  sellerId?: number;
  sellerUsername?: string;
  sellerPhone?: string;
  provinceCode?: number;
  districtCode?: number;
  wardCode?: number;
  street?: string;
  status?: string;
  createdAt?: string;
  inspectionStatus?: string;
  media?: {
    mediaId?: number;
    url?: string;
    urlLarge?: string;
    urlThumb?: string;
  }[];
  vehiclePost?: {
    modelName?: string;
    brandName?: string;
    year?: number;
    odoKm?: number;
    vin?: string;
    transmission?: string;
    fuelType?: string;
    origin?: string;
    bodyStyle?: string;
    seatCount?: number;
    color?: string;
    accessories?: boolean;
    registration?: boolean;
  };
}

const PLACEHOLDER_IMG =
  "https://via.placeholder.com/300x200?text=EV+Listing+Unavailable";

const mapDetailToElectricVehicle = async (
  detail: SalePostDetail
): Promise<ElectricVehicle> => {
  const vehicleInfo = detail.vehiclePost || {};

  let fullAddress = detail.street || "Chưa cung cấp địa chỉ";
  if (detail.provinceCode && detail.districtCode && detail.wardCode) {
    try {
      fullAddress = await locationService.getFullAddress(
        detail.provinceCode,
        detail.districtCode,
        detail.wardCode,
        detail.street
      );
    } catch (addressError) {
      console.warn(
        "⚠️ Không thể chuyển đổi địa chỉ cho tin",
        detail.listingId,
        addressError
      );
    }
  }

  const mediaUrls =
    detail.media?.map(
      (media) => media.urlLarge || media.url || media.urlThumb
    ) || [];

  if (mediaUrls.length === 0) {
    mediaUrls.push(PLACEHOLDER_IMG);
  }

  const derivedFeatures = [
    vehicleInfo.transmission && `Hộp số: ${vehicleInfo.transmission}`,
    vehicleInfo.fuelType && `Nhiên liệu: ${vehicleInfo.fuelType}`,
    typeof vehicleInfo.seatCount === "number" &&
      `Số chỗ: ${vehicleInfo.seatCount}`,
    vehicleInfo.origin && `Xuất xứ: ${vehicleInfo.origin}`,
    vehicleInfo.bodyStyle && `Kiểu dáng: ${vehicleInfo.bodyStyle}`,
  ].filter(Boolean) as string[];

  return {
    id:
      detail.listingId !== undefined && detail.listingId !== null
        ? detail.listingId.toString()
        : Date.now().toString(),
    brand: vehicleInfo.brandName || detail.title || "Không xác định",
    model: vehicleInfo.modelName || detail.title || "Không xác định",
    year:
      vehicleInfo.year ||
      new Date(detail.createdAt || Date.now()).getFullYear(),
    price: Number(detail.askPrice) || 0,
    originalPrice: Number(detail.askPrice) || 0,
    mileage: vehicleInfo.odoKm ?? 0,
    batteryCapacity: 0,
    batteryHealth: 0,
    range: 0,
    chargingTime: 0,
    motorPower: 0,
    topSpeed: 0,
    acceleration: 0,
    color: vehicleInfo.color || "Chưa rõ",
    condition: detail.status === "ACTIVE" ? "good" : "fair",
    description: detail.description || "",
    images: mediaUrls,
    features: derivedFeatures,
    location: fullAddress,
    sellerId: detail.sellerId?.toString() || "",
    sellerName: detail.sellerUsername || "Người bán",
    sellerPhone: detail.sellerPhone || "",
    isAvailable: detail.status === "ACTIVE",
    createdAt: detail.createdAt || new Date().toISOString(),
    updatedAt: detail.createdAt || new Date().toISOString(),
    inspectionStatus: detail.inspectionStatus,
  };
};

const ComparePage: React.FC = () => {
  const [selectedVehicles, setSelectedVehicles] = useState<ElectricVehicle[]>(
    []
  );
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [availableVehicles, setAvailableVehicles] = useState<ListPostSummary[]>(
    []
  );
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [addingVehicleId, setAddingVehicleId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const maxCompare = 4;

  const loadVehicles = async () => {
    setLoadingVehicles(true);
    setLoadError(null);
    try {
      const response = await ListPostService.getSalePosts(0, 50, {});
      const vehiclePosts =
        response.content?.filter(
          (post) => post.productType === "VEHICLE" && post.status === "ACTIVE"
        ) || [];
      setAvailableVehicles(vehiclePosts);
    } catch (error) {
      console.error("❌ Không thể tải danh sách xe:", error);
      setLoadError("Không thể tải danh sách xe. Vui lòng thử lại.");
    } finally {
      setLoadingVehicles(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleAddVehicle = async (post: ListPostSummary) => {
    if (selectedVehicles.length < maxCompare) {
      setAddingVehicleId(post.listingId);
      try {
        const detail = (await VehicleDetailService.getVehicleDetail(
          post.listingId
        )) as SalePostDetail;
        if (detail.productType && detail.productType !== "VEHICLE") {
          toast.warning("Tin này không phải xe, không thể so sánh.");
          return;
        }
        const mappedVehicle = await mapDetailToElectricVehicle(detail);
        setSelectedVehicles((prev) => [...prev, mappedVehicle]);
        setShowVehicleSelector(false);
        setSearchTerm("");
      } catch (error) {
        console.error("❌ Không thể thêm xe vào so sánh:", error);
        toast.error("Không thể tải thông tin xe. Vui lòng thử lại.");
      } finally {
        setAddingVehicleId(null);
      }
    }
  };

  const handleRemoveVehicle = (vehicleId: string) => {
    setSelectedVehicles(selectedVehicles.filter((v) => v.id !== vehicleId));
  };

  const filteredVehicles = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    const selectedIds = new Set(selectedVehicles.map((v) => v.id));
    return availableVehicles.filter((vehicle) => {
      if (selectedIds.has(vehicle.listingId.toString())) return false;
      if (!keyword) return true;
      return vehicle.productName.toLowerCase().includes(keyword);
    });
  }, [availableVehicles, searchTerm, selectedVehicles]);

  const formatPrice = (price: number) => {
    if (!price) return "Đang cập nhật";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getConditionLabel = (condition: string) => {
    const labels = {
      excellent: "Xuất sắc",
      good: "Tốt",
      fair: "Khá",
      poor: "Trung bình",
    };
    return labels[condition as keyof typeof labels] || condition;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            So Sánh Xe Điện
          </h1>
          <p className="text-gray-600">
            So sánh các mẫu xe điện để tìm lựa chọn phù hợp nhất
          </p>
        </div>

        {/* Add Vehicle Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Chọn xe để so sánh ({selectedVehicles.length}/{maxCompare})
            </h2>
            {selectedVehicles.length < maxCompare && (
              <button
                onClick={() => setShowVehicleSelector(!showVehicleSelector)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Thêm xe
              </button>
            )}
          </div>

          {/* Vehicle Selector */}
          {showVehicleSelector && (
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <input
                type="text"
                placeholder="Tìm kiếm xe để thêm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-3"
              />
              <div className="max-h-60 overflow-y-auto space-y-2">
                {loadingVehicles && (
                  <p className="text-center text-gray-500 py-4">
                    Đang tải danh sách xe...
                  </p>
                )}
                {!loadingVehicles &&
                  filteredVehicles.map((vehicle) => (
                    <button
                      key={vehicle.listingId}
                      disabled={addingVehicleId === vehicle.listingId}
                      onClick={() => handleAddVehicle(vehicle)}
                      className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <img
                        src={vehicle.coverThumb || PLACEHOLDER_IMG}
                        alt={vehicle.productName}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {vehicle.productName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatPrice(vehicle.askPrice)}
                        </p>
                      </div>
                      {addingVehicleId === vehicle.listingId ? (
                        <span className="text-sm text-gray-500">
                          Đang thêm...
                        </span>
                      ) : (
                        <Plus className="w-5 h-5 text-green-600" />
                      )}
                    </button>
                  ))}
                {!loadingVehicles && filteredVehicles.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    Không tìm thấy xe nào
                  </p>
                )}
              </div>
              {loadError && (
                <div className="flex items-center justify-between mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <span>{loadError}</span>
                  <button
                    onClick={loadVehicles}
                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-semibold"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    Thử lại
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {selectedVehicles.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-gray-400 mb-3">
                <ArrowRight className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Bắt đầu so sánh
              </h3>
              <p className="text-gray-600">
                Chọn ít nhất 2 xe để bắt đầu so sánh
              </p>
            </div>
          )}
        </div>

        {/* Comparison Table */}
        {selectedVehicles.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10">
                      Thông số
                    </th>
                    {selectedVehicles.map((vehicle) => (
                      <th
                        key={vehicle.id}
                        className="px-6 py-4 text-center min-w-[250px]"
                      >
                        <div className="relative">
                          <button
                            onClick={() => handleRemoveVehicle(vehicle.id)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <img
                            src={vehicle.images[0]}
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            className="w-full h-40 object-cover rounded-lg mb-3"
                          />
                          <h3 className="font-semibold text-gray-900">
                            {vehicle.brand} {vehicle.model}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {vehicle.year}
                          </p>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* Giá */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                      Giá bán
                    </td>
                    {selectedVehicles.map((vehicle) => (
                      <td
                        key={vehicle.id}
                        className="px-6 py-4 text-center text-sm"
                      >
                        <div className="font-semibold text-green-600">
                          {formatPrice(vehicle.price)}
                        </div>
                        {vehicle.originalPrice !== vehicle.price && (
                          <div className="text-xs text-gray-500 line-through">
                            {formatPrice(vehicle.originalPrice)}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Số km đã đi */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                      Số km đã đi
                    </td>
                    {selectedVehicles.map((vehicle) => (
                      <td
                        key={vehicle.id}
                        className="px-6 py-4 text-center text-sm text-gray-900"
                      >
                        {vehicle.mileage.toLocaleString()} km
                      </td>
                    ))}
                  </tr>

                  {/* Dung lượng pin */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                      Dung lượng pin
                    </td>
                    {selectedVehicles.map((vehicle) => (
                      <td
                        key={vehicle.id}
                        className="px-6 py-4 text-center text-sm text-gray-900"
                      >
                        {vehicle.batteryCapacity} kWh
                      </td>
                    ))}
                  </tr>

                  {/* Sức khỏe pin */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                      Sức khỏe pin
                    </td>
                    {selectedVehicles.map((vehicle) => (
                      <td
                        key={vehicle.id}
                        className="px-6 py-4 text-center text-sm"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span
                            className={`font-semibold ${
                              vehicle.batteryHealth >= 90
                                ? "text-green-600"
                                : vehicle.batteryHealth >= 80
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {vehicle.batteryHealth}%
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Quãng đường */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                      Quãng đường (đầy pin)
                    </td>
                    {selectedVehicles.map((vehicle) => (
                      <td
                        key={vehicle.id}
                        className="px-6 py-4 text-center text-sm text-gray-900"
                      >
                        {vehicle.range} km
                      </td>
                    ))}
                  </tr>

                  {/* Thời gian sạc */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                      Thời gian sạc đầy
                    </td>
                    {selectedVehicles.map((vehicle) => (
                      <td
                        key={vehicle.id}
                        className="px-6 py-4 text-center text-sm text-gray-900"
                      >
                        {vehicle.chargingTime} giờ
                      </td>
                    ))}
                  </tr>

                  {/* Công suất */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                      Công suất động cơ
                    </td>
                    {selectedVehicles.map((vehicle) => (
                      <td
                        key={vehicle.id}
                        className="px-6 py-4 text-center text-sm text-gray-900"
                      >
                        {vehicle.motorPower} kW
                      </td>
                    ))}
                  </tr>

                  {/* Tốc độ tối đa */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                      Tốc độ tối đa
                    </td>
                    {selectedVehicles.map((vehicle) => (
                      <td
                        key={vehicle.id}
                        className="px-6 py-4 text-center text-sm text-gray-900"
                      >
                        {vehicle.topSpeed} km/h
                      </td>
                    ))}
                  </tr>

                  {/* Tăng tốc */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                      Tăng tốc 0-100 km/h
                    </td>
                    {selectedVehicles.map((vehicle) => (
                      <td
                        key={vehicle.id}
                        className="px-6 py-4 text-center text-sm text-gray-900"
                      >
                        {vehicle.acceleration} giây
                      </td>
                    ))}
                  </tr>

                  {/* Màu sắc */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                      Màu sắc
                    </td>
                    {selectedVehicles.map((vehicle) => (
                      <td
                        key={vehicle.id}
                        className="px-6 py-4 text-center text-sm text-gray-900"
                      >
                        {vehicle.color}
                      </td>
                    ))}
                  </tr>

                  {/* Tình trạng */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                      Tình trạng
                    </td>
                    {selectedVehicles.map((vehicle) => (
                      <td
                        key={vehicle.id}
                        className="px-6 py-4 text-center text-sm"
                      >
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            vehicle.condition === "excellent"
                              ? "bg-green-100 text-green-800"
                              : vehicle.condition === "good"
                              ? "bg-blue-100 text-blue-800"
                              : vehicle.condition === "fair"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {getConditionLabel(vehicle.condition)}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Vị trí */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                      Vị trí
                    </td>
                    {selectedVehicles.map((vehicle) => (
                      <td
                        key={vehicle.id}
                        className="px-6 py-4 text-center text-sm text-gray-900"
                      >
                        {vehicle.location}
                      </td>
                    ))}
                  </tr>

                  {/* Tính năng */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                      Tính năng
                    </td>
                    {selectedVehicles.map((vehicle) => (
                      <td
                        key={vehicle.id}
                        className="px-6 py-4 text-sm text-gray-900"
                      >
                        <ul className="space-y-1">
                          {vehicle.features.map((feature, index) => (
                            <li
                              key={index}
                              className="flex items-center gap-2 text-left"
                            >
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Gợi ý khi so sánh xe điện
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  1
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">
                  So sánh giá và tình trạng
                </h4>
                <p className="text-sm text-gray-600">
                  Cân nhắc giữa giá cả và tình trạng xe để có lựa chọn phù hợp
                  với ngân sách
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  2
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">
                  Kiểm tra sức khỏe pin
                </h4>
                <p className="text-sm text-gray-600">
                  Pin là chi phí lớn, chọn xe có sức khỏe pin cao để tiết kiệm
                  chi phí sau này
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  3
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">
                  Quãng đường di chuyển
                </h4>
                <p className="text-sm text-gray-600">
                  Chọn xe có quãng đường phù hợp với nhu cầu di chuyển hàng ngày
                  của bạn
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  4
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">
                  Tính năng và tiện nghi
                </h4>
                <p className="text-sm text-gray-600">
                  Xem xét các tính năng an toàn và tiện nghi quan trọng với bạn
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparePage;
