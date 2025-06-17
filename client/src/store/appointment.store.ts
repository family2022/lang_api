import { create } from 'zustand';
import axiosInstance from '../axiosInstance';

interface Appointment {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  date: string;
  time: string;
  phone: string;
  email: string;
  status: string;
  reason: string;
  rejectionReason: string;
  address: string;
  officeId: string;
}

interface AppointmentState {
  appointments: Appointment[];
  totalItems: number;
  currentPage: number;
  limit: number;
  loading: boolean;
  error: string | null;
  fetchAppointments: (
    page: number,
    limit: number,
    filters?: {
      status?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
    }
  ) => Promise<void>;
  getAppointmentById: (
    appointmentId: string
  ) => Promise<Appointment | undefined>;
  createAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<any>;
  updateAppointment: (
    appointmentId: string,
    updatedAppointment: Partial<Appointment>
  ) => Promise<any>;
  deleteAppointment: (appointmentId: string) => Promise<any>;
  approveAppointment: (appointmentId: string) => Promise<any>;
  rejectAppointment: (
    appointmentId: string,
    rejectionReason: string
  ) => Promise<any>;
  completeAppointment: (appointmentId: string) => Promise<any>;
  // cancelAppointment: (appointmentId: string) => Promise<any>;
  setCurrentPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

export const useAppointmentStore = create<AppointmentState>((set) => ({
  appointments: [],
  totalItems: 0,
  currentPage: 0,
  limit: 5,
  loading: false,
  error: null,

  fetchAppointments: async (page, limit, filters = {}) => {
    set({ loading: true, error: null });
    try {
      const filterParams = new URLSearchParams({
        skip: String(page * limit),
        limit: String(limit),
        ...filters,
      });
      const response = await axiosInstance.get(
        `/appointment/all?${filterParams.toString()}`
      );
      set({
        appointments: response.data.data,
        totalItems: response.data.totalRecords,
        loading: false,
      });
    } catch (error) {
      set({ error: 'Failed to fetch appointments', loading: false });
      throw error;
    }
  },

  getAppointmentById: async (appointmentId) => {
    try {
      const response = await axiosInstance.get(
        `/appointment/get/${appointmentId}`
      );
      return response.data.appointment;
    } catch (error) {
      throw error;
    }
  },

  createAppointment: async (appointment) => {
    try {
      const response = await axiosInstance.post(
        '/appointment/create',
        appointment
      );
      set((state) => ({
        appointments: [...state.appointments, response.data],
        totalItems: state.totalItems + 1,
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateAppointment: async (appointmentId, updatedAppointment) => {
    try {
      const response = await axiosInstance.put(
        `/appointment/update/${appointmentId}`,
        updatedAppointment
      );
      set((state) => ({
        appointments: state.appointments.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, ...response.data }
            : appointment
        ),
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteAppointment: async (appointmentId) => {
    try {
      const response = await axiosInstance.delete(
        `/appointment/remove/${appointmentId}`
      );
      set((state) => ({
        appointments: state.appointments.filter(
          (appointment) => appointment.id !== appointmentId
        ),
        totalItems: state.totalItems - 1,
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  approveAppointment: async (appointmentId) => {
    try {
      const response = await axiosInstance.patch(
        `/appointment/approve/${appointmentId}`
      );
      set((state) => ({
        appointments: state.appointments.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, status: 'APPROVED' }
            : appointment
        ),
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  rejectAppointment: async (appointmentId, rejectionReason) => {
    try {
      const response = await axiosInstance.patch(
        `/appointment/reject/${appointmentId}`,
        { rejectionReason }
      );
      set((state) => ({
        appointments: state.appointments.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, status: 'REJECTED', rejectionReason }
            : appointment
        ),
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  completeAppointment: async (appointmentId) => {
    try {
      const response = await axiosInstance.patch(
        `/appointment/complete/${appointmentId}`
      );
      set((state) => ({
        appointments: state.appointments.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, status: 'COMPLETED' }
            : appointment
        ),
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // cancelAppointment: async (appointmentId) => {
  //   try {
  //     const response = await axiosInstance.patch(
  //       `/appointment/cancel/${appointmentId}`
  //     );
  //     set((state) => ({
  //       appointments: state.appointments.map((appointment) =>
  //         appointment.id === appointmentId
  //           ? { ...appointment, status: 'CANCELLED' }
  //           : appointment
  //       ),
  //     }));
  //     return response.data;
  //   } catch (error) {
  //     throw error;
  //   }
  // },

  setCurrentPage: (page) => set({ currentPage: page }),
  setLimit: (limit) => set({ limit }),
}));
