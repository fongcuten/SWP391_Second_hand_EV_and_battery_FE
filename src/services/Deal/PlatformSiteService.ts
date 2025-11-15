import api from "../../config/axios";

export interface PlatformSite {
  platformSiteId: number;
  name: string;
  provinceCode?: number;
  districtCode?: number;
  wardCode?: number;
  street?: string;
  active?: boolean;
  // add other fields returned by backend if needed
}

interface PlatformSiteListResponse {
  code: number;
  message?: string;
  result: PlatformSite[];
}

const PlatformSiteService = {
  /**
   * Get list of active platform sites
   * GET /api/platform-sites/active
   */
  async getActivePlatformSites(): Promise<PlatformSite[]> {
    try {
      const res = await api.get<PlatformSiteListResponse>("/api/platform-sites/active");
      if (res.data.code !== 0 && res.data.code !== 1000) {
        throw new Error(res.data.message || "Failed to fetch active platform sites");
      }
      return res.data.result || [];
    } catch (error: any) {
      console.error("❌ Error fetching active platform sites:", error);
      throw error;
    }
  },
};

export default PlatformSiteService;