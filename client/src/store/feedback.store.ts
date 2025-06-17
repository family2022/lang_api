import { create } from 'zustand';
import axiosInstance from '../axiosInstance';

interface Feedback {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  comment: string;
  status: string;
  feedbackDate: string;
  officeId: string;
}

interface FeedbackState {
  feedbacks: Feedback[];
  totalItems: number;
  currentPage: number;
  limit: number;
  loading: boolean;
  error: string | null;
  fetchFeedbacks: (
    page: number,
    limit: number,
    filters?: Record<string, string>
  ) => Promise<void>;
  getFeedbackById: (feedbackId: string) => Promise<Feedback | undefined>;
  createFeedback: (
    feedback: Omit<Feedback, 'id' | 'createdAt'>
  ) => Promise<any>;
  updateFeedback: (
    feedbackId: string,
    updatedFeedback: Partial<Feedback>
  ) => Promise<any>;
  deleteFeedback: (feedbackId: string) => Promise<any>;
  setCurrentPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

export const useFeedbackStore = create<FeedbackState>((set) => ({
  feedbacks: [],
  totalItems: 0,
  currentPage: 0,
  limit: 5,
  loading: false,
  error: null,

  fetchFeedbacks: async (page, limit, filters = {}) => {
    set({ loading: true, error: null });
    try {
      // Build query string based on page, limit, and filters
      const queryParams = new URLSearchParams({
        skip: String(page * limit),
        limit: String(limit),
        ...filters,
      }).toString();

      const response = await axiosInstance.get(`/feedback/all?${queryParams}`);
      set({
        feedbacks: response.data.data,
        totalItems: response.data.totalRecords,
        loading: false,
      });
    } catch (error) {
      set({ error: 'Failed to fetch feedbacks', loading: false });
      throw error;
    }
  },

  getFeedbackById: async (feedbackId) => {
    try {
      const response = await axiosInstance.get(`/feedback/get/${feedbackId}`);
      return response.data.feedback;
    } catch (error) {
      throw error;
    }
  },

  createFeedback: async (feedback) => {
    try {
      const response = await axiosInstance.post('/feedback/create', feedback);
      set((state) => ({
        feedbacks: [...state.feedbacks, response.data],
        totalItems: state.totalItems + 1,
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateFeedback: async (feedbackId, updatedFeedback) => {
    try {
      const response = await axiosInstance.put(
        `/feedback/update/${feedbackId}`,
        updatedFeedback
      );
      set((state) => ({
        feedbacks: state.feedbacks.map((feedback) =>
          feedback.id === feedbackId
            ? { ...feedback, ...response.data }
            : feedback
        ),
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteFeedback: async (feedbackId) => {
    try {
      const response = await axiosInstance.delete(
        `/feedback/remove/${feedbackId}`
      );
      set((state) => ({
        feedbacks: state.feedbacks.filter(
          (feedback) => feedback.id !== feedbackId
        ),
        totalItems: state.totalItems - 1,
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  setCurrentPage: (page) => set({ currentPage: page }),
  setLimit: (limit) => set({ limit }),
}));
