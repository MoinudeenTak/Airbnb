import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // Your backend API
});

// Optional: Add interceptor to attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;