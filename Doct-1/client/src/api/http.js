import axios from "axios";

const http = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api"
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const apiErrorMessage = (error, fallback) => {
  if (!error.response) {
    return "Cannot reach the API. Check that the backend is running on http://localhost:5000.";
  }

  return error.response.data?.message
    || error.response.data?.errors?.[0]?.msg
    || fallback;
};

export default http;
