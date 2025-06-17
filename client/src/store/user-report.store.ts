import { create } from 'zustand';
import axiosInstance from '../axiosInstance';

interface UserReport {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  description: string;
  reportedAt: string;
  officeId?: string;
}

interface UserReportState {
  userReports: UserReport[];
  totalItems: number;
  currentPage: number;
  limit: number;
  loading: boolean;
  error: string | null;
  fetchUserReports: (
    page: number,
    limit: number,
    filters?: any
  ) => Promise<void>;
  getUserReportById: (reportId: string) => Promise<UserReport | undefined>;
  createUserReport: (
    report: Omit<UserReport, 'id' | 'reportedAt'>
  ) => Promise<any>;
  updateUserReport: (
    reportId: string,
    updatedReport: Partial<UserReport>
  ) => Promise<any>;
  deleteUserReport: (reportId: string) => Promise<any>;
  setCurrentPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

export const useUserReportStore = create<UserReportState>((set) => ({
  userReports: [],
  totalItems: 0,
  currentPage: 0,
  limit: 5,
  loading: false,
  error: null,

  // Fetch user reports with optional filters
  fetchUserReports: async (page, limit, filters = {}) => {
    set({ loading: true, error: null });
    try {
      const filterParams = new URLSearchParams({
        skip: String(page * limit),
        limit: String(limit),
        ...filters,
      });
      const response = await axiosInstance.get(
        `/user-report/all?${filterParams.toString()}`
      );
      set({
        userReports: response.data.data,
        totalItems: response.data.totalRecords,
        loading: false,
      });
    } catch (error) {
      set({ error: 'Failed to fetch user reports', loading: false });
      throw error;
    }
  },

  getUserReportById: async (reportId) => {
    try {
      const response = await axiosInstance.get(`/user-report/get/${reportId}`);
      return response.data.report;
    } catch (error) {
      throw error;
    }
  },

  createUserReport: async (report) => {
    try {
      const response = await axiosInstance.post('/user-report/create', report);
      set((state) => ({
        userReports: [...state.userReports, response.data],
        totalItems: state.totalItems + 1,
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateUserReport: async (reportId, updatedReport) => {
    try {
      const response = await axiosInstance.put(
        `/user-report/update/${reportId}`,
        updatedReport
      );
      set((state) => ({
        userReports: state.userReports.map((report) =>
          report.id === reportId ? { ...report, ...response.data } : report
        ),
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteUserReport: async (reportId) => {
    try {
      const response = await axiosInstance.delete(
        `/user-report/delete/${reportId}`
      );
      set((state) => ({
        userReports: state.userReports.filter(
          (report) => report.id !== reportId
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
