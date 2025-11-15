// Service để gọi API địa chỉ từ provinces.open-api.vn
export interface Province {
  code: number;
  name: string;
}

export interface District {
  code: number;
  name: string;
  province_code: number;
}

export interface Ward {
  code: number;
  name: string;
  district_code: number;
}

export interface LocationData {
  province: Province | null;
  district: District | null;
  ward: Ward | null;
  street: string;
}

class LocationService {
  // ⚠️ Using HTTP instead of HTTPS (not secure)
  private baseUrl = "http://provinces.open-api.vn/api";

  // Lấy danh sách tỉnh/thành phố
  async getProvinces(): Promise<Province[]> {
    try {
      const response = await fetch(`${this.baseUrl}/p/`);
      if (!response.ok) {
        throw new Error("Failed to fetch provinces");
      }
      const data = await response.json();
      console.log("✅ Provinces loaded:", data.length);
      return data || [];
    } catch (error) {
      console.error("❌ Error fetching provinces:", error);
      throw error;
    }
  }

  // Lấy danh sách quận/huyện theo tỉnh
  async getDistricts(provinceCode: number): Promise<District[]> {
    try {
      const response = await fetch(`${this.baseUrl}/p/${provinceCode}?depth=2`);
      if (!response.ok) {
        throw new Error("Failed to fetch districts");
      }
      const data = await response.json();
      console.log("✅ Districts loaded:", data.districts?.length || 0);
      return data.districts || [];
    } catch (error) {
      console.error("❌ Error fetching districts:", error);
      throw error;
    }
  }

  // Lấy danh sách phường/xã theo quận/huyện
  async getWards(districtCode: number): Promise<Ward[]> {
    try {
      const response = await fetch(`${this.baseUrl}/d/${districtCode}?depth=2`);
      if (!response.ok) {
        throw new Error("Failed to fetch wards");
      }
      const data = await response.json();
      console.log("✅ Wards loaded:", data.wards?.length || 0);
      return data.wards || [];
    } catch (error) {
      console.error("❌ Error fetching wards:", error);
      throw error;
    }
  }

  // Lấy thông tin chi tiết địa chỉ
  async getLocationDetails(
    provinceCode: number,
    districtCode: number,
    wardCode: number
  ): Promise<{
    province: Province;
    district: District;
    ward: Ward;
  } | null> {
    try {
      const [provinceRes, districtRes, wardRes] = await Promise.all([
        fetch(`${this.baseUrl}/province/${provinceCode}`),
        fetch(`${this.baseUrl}/province/district/${districtCode}`),
        fetch(`${this.baseUrl}/province/ward/${wardCode}`),
      ]);

      if (!provinceRes.ok || !districtRes.ok || !wardRes.ok) {
        throw new Error("Failed to fetch location details");
      }

      const [provinceData, districtData, wardData] = await Promise.all([
        provinceRes.json(),
        districtRes.json(),
        wardRes.json(),
      ]);

      return {
        province: provinceData.data,
        district: districtData.data,
        ward: wardData.data,
      };
    } catch (error) {
      console.error("Error fetching location details:", error);
      return null;
    }
  }


  async getProvinceName(provinceCode: number): Promise<string> {
    try {
      const provinces = await this.getProvinces();
      const province = provinces.find((p) => p.code === provinceCode);
      return province ? province.name : "Không xác định";
    } catch (error) {
      console.error("❌ Error getting province name:", error);
      return "Không xác định";
    }
  }

  
  async getDistrictName(
    districtCode: number,
    provinceCode?: number
  ): Promise<string> {
    try {
      if (provinceCode) {
        const districts = await this.getDistricts(provinceCode);
        const district = districts.find((d) => d.code === districtCode);
        return district ? district.name : "Không xác định";
      }

      // Search through all provinces (slower)
      const provinces = await this.getProvinces();
      for (const province of provinces) {
        const districts = await this.getDistricts(province.code);
        const district = districts.find((d) => d.code === districtCode);
        if (district) {
          return district.name;
        }
      }

      return "Không xác định";
    } catch (error) {
      console.error("❌ Error getting district name:", error);
      return "Không xác định";
    }
  }

  async getWardName(wardCode: number, districtCode: number): Promise<string> {
    try {
      const wards = await this.getWards(districtCode);
      const ward = wards.find((w) => w.code === wardCode);
      return ward ? ward.name : "Không xác định";
    } catch (error) {
      console.error("❌ Error getting ward name:", error);
      return "Không xác định";
    }
  }

  async getFullAddress(
    provinceCode: number,
    districtCode: number,
    wardCode: number,
    street?: string
  ): Promise<string> {
    try {
      const [provinceName, districtName, wardName] = await Promise.all([
        this.getProvinceName(provinceCode),
        this.getDistrictName(districtCode, provinceCode),
        this.getWardName(wardCode, districtCode),
      ]);

      const parts = [street, wardName, districtName, provinceName].filter(
        (part) => part && part !== "Không xác định"
      );

      return parts.join(", ") || "Không xác định";
    } catch (error) {
      console.error("❌ Error getting full address:", error);
      return "Không xác định";
    }
  }
}

export const locationService = new LocationService();
