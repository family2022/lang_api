import { create } from 'zustand';
import axiosInstance from '../axiosInstance';

interface User {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
}

interface UserState {
  users: User[];
  totalItems: number;
  currentPage: number;
  limit: number;
  loading: boolean;
  error: string | null;
  fetchUsers: (page: number, limit: number, filters?: any) => Promise<void>;
  getUserById: (userId: string) => Promise<User | undefined>;
  createUser: (user: Omit<User, 'id'>) => Promise<any>;
  updateUser: (userId: string, updatedUser: Partial<User>) => Promise<any>;
  deleteUser: (userId: string) => Promise<any>;
  setCurrentPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  totalItems: 0,
  currentPage: 0,
  limit: 5,
  loading: false,
  error: null,

  // Fetch all users with pagination and optional filters
  fetchUsers: async (page, limit, filters = {}) => {
    set({ loading: true, error: null });
    const {
      firstName,
      middleName,
      lastName,
      phone,
      email,
      role,
      status,
      userId,
      officeId,
    } = filters;

    // Construct query parameters
    const queryParams = new URLSearchParams({
      skip: (page * limit).toString(),
      limit: limit.toString(),
    });
    if (firstName) queryParams.append('firstName', firstName);
    if (middleName) queryParams.append('middleName', middleName);
    if (lastName) queryParams.append('lastName', lastName);
    if (phone) queryParams.append('phone', phone);
    if (email) queryParams.append('email', email);
    if (role) queryParams.append('role', role);
    if (status) queryParams.append('status', status);
    if (userId) queryParams.append('userId', userId);
    if (officeId) queryParams.append('officeId', officeId);

    try {
      const response = await axiosInstance.get(
        `/user/all?${queryParams.toString()}`
      );
      set({
        users: response.data.data,
        totalItems: response.data.totalRecords,
        loading: false,
      });
    } catch (error) {
      set({ error: 'Failed to fetch users', loading: false });
      throw error;
    }
  },

  // Get a single user by ID
  getUserById: async (userId) => {
    try {
      const response = await axiosInstance.get(`/user/${userId}`);
      return response.data.user;
    } catch (error) {
      throw error;
    }
  },

  // Create a new user
  createUser: async (user) => {
    try {
      const response = await axiosInstance.post('/auth/register', user);
      set((state) => ({
        users: [...state.users, response.data],
        totalItems: state.totalItems + 1,
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update an existing user
  updateUser: async (userId, updatedUser) => {
    try {
      const response = await axiosInstance.put(
        `/auth/update/${userId}`,
        updatedUser
      );
      set((state) => ({
        users: state.users.map((user) =>
          user.id === userId ? { ...user, ...response.data } : user
        ),
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a user by ID
  deleteUser: async (userId) => {
    try {
      const response = await axiosInstance.delete(`/auth/remove/${userId}`);
      set((state) => ({
        users: state.users.filter((user) => user.id !== userId),
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
