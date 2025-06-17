import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';

const axiosInstance = axios.create({
  baseURL: apiUrl, // Append `/v1` here
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }

    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const statusCode = error.response.status;
      const errorMessage =
        error.response.data.message ||
        error.response.data.error ||
        'An error occurred';

      if (statusCode === 401 && window.location.pathname !== '/auth/login') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }

      console.error(`API Error (${statusCode}): ${errorMessage}`);
      return Promise.reject(new Error(errorMessage));
    }

    console.error('Network Error:', error.message || 'Network Error');
    return Promise.reject(new Error(error.message || 'Network Error'));
  }
);

const axiosRetry = (error) => {
  const config = error.config;

  if (!config || config.retry === false) {
    return Promise.reject(error);
  }

  config.retryCount = config.retryCount || 0;

  if (config.retryCount >= 3) {
    return Promise.reject(error);
  }

  config.retryCount += 1;

  const delay = new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, config.retryCount * 5000);
  });

  return delay.then(() => {
    return axiosInstance(config);
  });
};

axiosInstance.interceptors.response.use(null, axiosRetry);

export default axiosInstance;
