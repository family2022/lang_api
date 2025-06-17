import axiosInstance from '../axiosInstance';

const userService = {
  login: async (loginData) => {
    const response = await axiosInstance.post('/auth/login', loginData);
    return response.data;
  },
};
