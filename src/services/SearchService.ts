import api from "../config/axios";

export interface SearchResultItem {
  listingId: number;
  productName: string;
  productType: "VEHICLE" | "BATTERY";
  coverThumb?: string;
  askPrice?: number;
  address?: string;
}

export const searchService = {
  async searchListings(keyword: string): Promise<SearchResultItem[]> {
    const trimmed = keyword.trim();
    if (!trimmed) return [];

    try {
      const response = await api.get("/api/sale-posts", {
        params: {
          page: 0,
          size: 20,
          searchTerm: trimmed,
        },
      });

      const content = response.data?.content || response.data?.result || [];

      return content
        .filter(
          (item: any) =>
            typeof item?.productName === "string" &&
            item.productName.toLowerCase().includes(trimmed.toLowerCase())
        )
        .slice(0, 10)
        .map((item: any) => ({
          listingId: item.listingId,
          productName: item.productName,
          productType: item.productType || "VEHICLE",
          coverThumb: item.coverThumb,
          askPrice: item.askPrice,
          address: item.address,
        }));
    } catch (error) {
      console.error("Search listings failed:", error);
      return [];
    }
  },
};
