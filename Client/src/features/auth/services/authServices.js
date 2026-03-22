import api from "../../../api/axios";

// REGISTER
export const register = (data) => api.post("/auth/register", data);

// LOGIN
export const login = (data) => api.post("/auth/login", data);

// GET CURRENT USER
export const getMe = () => api.get("/auth/me");

// UPGRADE LOGGED-IN USER TO HOST
export const becomeHost = () => api.patch("/auth/become-host");

// LOGOUT
export const logout = (data) => api.post("/auth/logout", data);

// FORGOT PASSWORD
export const forgotPassword = (data) =>
  api.post("/auth/forgot-password", data);

// RESET PASSWORD
export const resetPassword = (data) =>
  api.post("/auth/reset-password", data);

// GOOGLE LOGIN
export const loginWithGoogle = (data) =>
  api.post("/auth/google", data);

// FACEBOOK LOGIN
export const loginWithFacebook = (data) =>
  api.post("/auth/facebook", data);