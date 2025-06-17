import { create } from 'zustand';
import axiosInstance from '../axiosInstance';

interface Announcement {
  id: string;
  title: string;
  description: string;
  number: number;
  stampFile: any;
  signatureFile: any;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface AnnouncementState {
  announcements: Announcement[];
  totalItems: number;
  currentPage: number;
  limit: number;
  loading: boolean;
  error: string | null;
  fetchAnnouncements: (
    page: number,
    limit: number,
    filters?: any
  ) => Promise<void>;
  getAnnouncementById: (
    announcementId: string
  ) => Promise<Announcement | undefined>;
  createAnnouncement: (
    announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<any>;
  updateAnnouncement: (
    announcementId: string,
    updatedAnnouncement: Partial<Announcement>
  ) => Promise<any>;
  deleteAnnouncement: (announcementId: string) => Promise<any>;
  setCurrentPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

export const useAnnouncementStore = create<AnnouncementState>((set) => ({
  announcements: [],
  totalItems: 0,
  currentPage: 0,
  limit: 5,
  loading: false,
  error: null,

  // Fetch announcements with optional filters
  fetchAnnouncements: async (page, limit, filters = {}) => {
    set({ loading: true, error: null });
    try {
      const filterParams = new URLSearchParams({
        skip: String(page * limit),
        limit: String(limit),
        ...filters,
      });
      const response = await axiosInstance.get(
        `/announcement/all?${filterParams.toString()}`
      );
      set({
        announcements: response.data.data,
        totalItems: response.data.totalRecords,
        loading: false,
      });
    } catch (error) {
      set({ error: 'Failed to fetch announcements', loading: false });
      throw error;
    }
  },

  getAnnouncementById: async (announcementId) => {
    try {
      const response = await axiosInstance.get(
        `/announcement/get/${announcementId}`
      );
      return response.data.announcement;
    } catch (error) {
      throw error;
    }
  },

  createAnnouncement: async (announcement) => {
    try {
      const response = await axiosInstance.post(
        '/announcement/create',
        announcement
      );
      set((state) => ({
        announcements: [...state.announcements, response.data],
        totalItems: state.totalItems + 1,
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateAnnouncement: async (announcementId, updatedAnnouncement) => {
    try {
      const response = await axiosInstance.put(
        `/announcement/update/${announcementId}`,
        updatedAnnouncement
      );
      set((state) => ({
        announcements: state.announcements.map((announcement) =>
          announcement.id === announcementId
            ? { ...announcement, ...response.data }
            : announcement
        ),
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteAnnouncement: async (announcementId) => {
    try {
      const response = await axiosInstance.delete(
        `/announcement/delete/${announcementId}`
      );
      set((state) => ({
        announcements: state.announcements.filter(
          (announcement) => announcement.id !== announcementId
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
