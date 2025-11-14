import api from "../../config/axios";

export type CreateReviewPayload = {
  dealId: number;
  authorId: number;
  targetId: number;
  rating: number;
  comment?: string;
};

export type Review = {
  reviewId: number;
  dealId: number;
  authorId: number;
  authorName?: string;
  targetId: number;
  targetName?: string;
  rating: number;
  comment?: string;
  createdAt?: string;
};

export const reviewService = {
  createReview: async (payload: CreateReviewPayload): Promise<Review> => {
    const response = await api.post<Review>("/api/reviews", payload);
    return response.data;
  },

  getReviewsReceived: async (targetId: number): Promise<Review[]> => {
    const response = await api.get<Review[]>(`/api/reviews/target/${targetId}`);
    return response.data.result;
  },

  getReviewsWritten: async (authorId: number): Promise<Review[]> => {
    const response = await api.get<Review[]>(`/api/reviews/author/${authorId}`);
    return response.data.result;
  } 
}

