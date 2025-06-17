import { create } from 'zustand';
import axiosInstance from '../axiosInstance';

interface LandOwner {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE';
  phone: string;
  email?: string;
}

interface LandOwnerState {
  landOwners: LandOwner[];
  totalItems: number;
  currentPage: number;
  limit: number;
  loading: boolean;
  error: string | null;
  fetchLandOwners: (
    page: number,
    limit: number,
    searchParams?: any
  ) => Promise<void>;
  getLandOwnerById: (landOwnerId: string) => Promise<LandOwner | undefined>;
  createLandOwner: (landOwner: any) => Promise<any>;
  updateLandOwner: (landOwnerId: string, updatedLandOwner: any) => Promise<any>;
  deleteLandOwner: (landOwnerId: string) => Promise<any>;
  setCurrentPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

export const useLandOwnerStore = create<LandOwnerState>((set) => ({
  landOwners: [],
  totalItems: 0,
  currentPage: 0,
  limit: 5,
  loading: false,
  error: null,

  // Fetch all land owners with pagination
  fetchLandOwners: async (page, limit, searchParams = {}) => {
    set({ loading: true, error: null });
    try {
      // Build the query string with search parameters and pagination
      const query = new URLSearchParams({
        skip: (page * limit).toString(),
        limit: limit.toString(),
        ...searchParams,
      });

      const response = await axiosInstance.get(
        `/land/owner/all?${query.toString()}`
      );

      set({
        landOwners: response.data.data,
        totalItems: response.data.totalRecords,
        loading: false,
      });
    } catch (error) {
      set({ error: 'Failed to fetch land owners', loading: false });
      throw error;
    }
  },
  // Get a single land owner by ID
  getLandOwnerById: async (landOwnerId) => {
    try {
      const response = await axiosInstance.get(
        `/land/owner/get/${landOwnerId}`
      );
      return response.data.landOwner;
    } catch (error) {
      throw error;
    }
  },

  // Create a new land owner
  createLandOwner: async (landOwner) => {
    try {
      const response = await axiosInstance.post(
        '/land/owner/create',
        landOwner,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      set((state) => ({
        landOwners: [...state.landOwners, response.data],
        totalItems: state.totalItems + 1,
      }));

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update an existing land owner
  updateLandOwner: async (landOwnerId, updatedLandOwner) => {
    try {
      updatedLandOwner.delete('id');
      updatedLandOwner.delete('nationalIdUrl');
      updatedLandOwner.delete('createdAt');
      updatedLandOwner.delete('updatedAt');
      updatedLandOwner.delete('lands');



      const response = await axiosInstance.put(
        `/land/owner/update/${landOwnerId}`,
        updatedLandOwner
      );
      set((state) => ({
        landOwners: state.landOwners.map((landOwner) =>
          landOwner.id === landOwnerId
            ? { ...landOwner, ...response.data }
            : landOwner
        ),
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a land owner by ID
  deleteLandOwner: async (landOwnerId) => {
    try {
      const response = await axiosInstance.delete(
        `/land/owner/remove/${landOwnerId}`
      );
      set((state) => ({
        landOwners: state.landOwners.filter(
          (landOwner) => landOwner.id !== landOwnerId
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
