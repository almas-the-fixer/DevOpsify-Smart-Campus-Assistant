import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api", // apne backend ka base URL
  withCredentials: true,
});

// 🔐 Token automatically attach hoga
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
