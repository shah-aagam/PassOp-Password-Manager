import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ,
});


instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(        // immediate logout on token expiry
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes("verify-password")) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);


export default instance;