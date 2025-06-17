import { create } from 'zustand';
import axiosInstance from '../axiosInstance';

interface Employee {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE';
  phone: string;
  email?: string;
  position: string;
  salary: number;
  status: string;
}

interface EmployeeState {
  employees: Employee[];
  totalItems: number;
  currentPage: number;
  limit: number;
  loading: boolean;
  error: string | null;
  fetchEmployees: (page: number, limit: number, filters?: any) => Promise<void>;
  getEmployeeById: (employeeId: string) => Promise<Employee | undefined>;
  createEmployee: (employee: Omit<Employee, 'id'>) => Promise<any>;
  updateEmployee: (
    employeeId: string,
    updatedEmployee: Partial<Employee>
  ) => Promise<any>;
  deleteEmployee: (employeeId: string) => Promise<any>;
  setCurrentPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

export const useEmployeeStore = create<EmployeeState>((set) => ({
  employees: [],
  totalItems: 0,
  currentPage: 0,
  limit: 5,
  loading: false,
  error: null,

  fetchEmployees: async (page, limit, filters = {}) => {
    set({ loading: true, error: null });
    try {
      // Construct query parameters from filters
      const queryParams = new URLSearchParams({
        skip: String(page * limit),
        limit: String(limit),
      });

      // Append filters to queryParams
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value as string);
        }
      });

      const response = await axiosInstance.get(`/employee/all?${queryParams}`);
      set({
        employees: response.data.data,
        totalItems: response.data.totalRecords,
        loading: false,
      });
    } catch (error) {
      set({ error: 'Failed to fetch employees', loading: false });
      throw error;
    }
  },

  getEmployeeById: async (employeeId) => {
    try {
      const response = await axiosInstance.get(`/employee/get/${employeeId}`);
      return response.data.employee;
    } catch (error) {
      throw error;
    }
  },

  createEmployee: async (employee) => {
    try {
      const response = await axiosInstance.post('/employee/create', employee);
      set((state) => ({
        employees: [...state.employees, response.data],
        totalItems: state.totalItems + 1,
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateEmployee: async (employeeId, updatedEmployee) => {
    try {
      const response = await axiosInstance.put(
        `/employee/update/${employeeId}`,
        updatedEmployee
      );
      set((state) => ({
        employees: state.employees.map((employee) =>
          employee.id === employeeId
            ? { ...employee, ...response.data }
            : employee
        ),
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteEmployee: async (employeeId) => {
    try {
      const response = await axiosInstance.delete(
        `/employee/delete/${employeeId}`
      );
      set((state) => ({
        employees: state.employees.filter(
          (employee) => employee.id !== employeeId
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
