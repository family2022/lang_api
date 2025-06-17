import { create } from 'zustand';
import axiosInstance from '../axiosInstance';

interface Office {
  id: string;
  name: string;
  type: 'SUB_CITY' | 'MAIN_OFFICE';
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  offices: Office[];
  loading: boolean;
  error: string | null;
  fetchOffices: (type?: string) => Promise<void>;
}

export const useOfficeStore = create<UserState>((set) => ({
  offices: [],
  loading: false,
  error: null,

  // Fetch all users with pagination and optional filters
  fetchOffices: async (type = '') => {
    set({ loading: true, error: null });

    // Construct query parameters
    const queryParams = new URLSearchParams({});
    if (type) queryParams.append('type', type);

    try {
      const response = await axiosInstance.get(
        `/office/all?${queryParams.toString()}`
      );
      set({
        offices: response.data.data,
        loading: false,
      });
    } catch (error) {
      set({ error: 'Failed to fetch users', loading: false });
      throw error;
    }
  },
}));
