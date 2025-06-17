import { create } from 'zustand';
import axiosInstance from '../axiosInstance';

interface Land {
  id: string;
  name: string;
  location: string;
  owner: string;
  area: string;
  type: string;
  landOwnerId: string;
  landFiles?: any[];
  transferHistory?: any[];
}

interface LandState {
  lands: Land[];
  totalItems: number;
  currentPage: number;
  limit: number;
  loading: boolean;
  error: string | null;
  fetchLands: (
    page: number,
    limit: number,
    filters?: Record<string, any>,
    searchTerms?: Record<string, any>
  ) => Promise<void>;
  getLandById: (landId: string) => Promise<Land | undefined>;
  createLand: (landData: any) => Promise<void>;
  transferLand: (landData: {
    landId: string;
    newLandOwnerId: string;
  }) => Promise<void>;
  attachFiles: (landId: string, files: File[]) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  updateLand: (landId: string, landData: Partial<Land>) => Promise<void>;
  deleteLand: (landId: string) => Promise<void>;
  setCurrentPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

export const useLandStore = create<LandState>((set) => ({
  lands: [],
  totalItems: 0,
  currentPage: 0,
  limit: 5,
  loading: false,
  error: null,

  // Updated fetchLands function to handle filters and searchTerms
  fetchLands: async (page, limit, filters = {}, searchTerms = {}) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams({
        skip: (page * limit).toString(),
        limit: limit.toString(),
      });

      // Adding filters to the query parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value as string);
      });

      // Adding search terms to the query parameters
      Object.entries(searchTerms).forEach(([key, value]) => {
        if (value) queryParams.append(key, value as string);
      });

      const response = await axiosInstance.get(
        `/land/all?${queryParams.toString()}`
      );
      set({
        lands: response.data.data,
        totalItems: response.data.totalRecords,
        loading: false,
      });
    } catch (error) {
      throw error;
    }
  },

  getLandById: async (landId) => {
    try {
      const landResponse = await axiosInstance.get(`/land/get/${landId}`);
      return landResponse.data.land;
    } catch (error) {
      throw error;
    }
  },

  createLand: async (landData) => {
    try {
      await axiosInstance.post('/land/create', landData);
    } catch (error) {
      throw error;
    }
  },

  transferLand: async (landData) => {
    try {
      await axiosInstance.post('/land/transfer', landData);
    } catch (error) {
      throw error;
    }
  },

  attachFiles: async (landId, files) => {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      formData.append('landId', landId);
      await axiosInstance.post(`/land/file/create/${landId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      set((state) => ({
        lands: state.lands.map((land) =>
          land.id === landId
            ? { ...land, landFiles: [...(land.landFiles || []), ...files] }
            : land
        ),
      }));
    } catch (error) {
      throw error;
    }
  },

  deleteFile: async (landFileId) => {
    try {
      await axiosInstance.delete(`/land/file/remove/${landFileId}`);
    } catch (error) {
      throw error;
    }
  },

  updateLand: async (landId, landData) => {
    try {
      await axiosInstance.put(`/land/update/${landId}`, landData);
    } catch (error) {
      throw error;
    }
  },

  deleteLand: async (landId) => {
    try {
      await axiosInstance.delete(`/land/remove/${landId}`);
      set((state) => ({
        lands: state.lands.filter((land) => land.id !== landId),
        totalItems: state.totalItems - 1,
      }));
    } catch (error) {
      throw error;
    }
  },

  setCurrentPage: (page) => set({ currentPage: page }),
  setLimit: (limit) => set({ limit }),
}));
