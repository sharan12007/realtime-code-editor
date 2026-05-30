import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 10000
});

apiClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('access_token');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config?._retry) {
      error.config._retry = true;
      const csrfToken = document.cookie
        .split('; ')
        .find((cookie) => cookie.startsWith('csrf_token='))
        ?.split('=')[1];

      const refreshResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/refresh`,
        {},
        {
          withCredentials: true,
          headers: { 'x-csrf-token': csrfToken ?? '' }
        }
      );

      localStorage.setItem('access_token', refreshResponse.data.accessToken);
      error.config.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;

      return apiClient.request(error.config);
    }

    return Promise.reject(error);
  }
);
