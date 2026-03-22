import { useCallback, useEffect, useMemo, useState } from "react";
import AuthContext from "./AuthContext";
import {
  getMe,
  becomeHost as becomeHostService,
  logout as logoutService,
} from "../services/authServices";

const STORAGE_KEYS = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  rememberMe: "rememberMe",
};

const getStoredItem = (key) => {
  return localStorage.getItem(key) || sessionStorage.getItem(key);
};

const getRememberMeValue = () => {
  return (
    localStorage.getItem(STORAGE_KEYS.rememberMe) === "true" ||
    sessionStorage.getItem(STORAGE_KEYS.rememberMe) === "true"
  );
};

const clearAuthStorage = () => {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem(STORAGE_KEYS.rememberMe);

  sessionStorage.removeItem(STORAGE_KEYS.accessToken);
  sessionStorage.removeItem(STORAGE_KEYS.refreshToken);
  sessionStorage.removeItem(STORAGE_KEYS.rememberMe);
};

const persistAuth = ({
  accessToken,
  refreshToken,
  rememberMe = false,
}) => {
  clearAuthStorage();

  const storage = rememberMe ? localStorage : sessionStorage;

  if (accessToken) {
    storage.setItem(STORAGE_KEYS.accessToken, accessToken);
  }

  if (refreshToken) {
    storage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
  }

  storage.setItem(STORAGE_KEYS.rememberMe, String(rememberMe));
};

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loginUser = useCallback(
    (accessToken, refreshToken, userData, rememberMe = false) => {
      persistAuth({
        accessToken,
        refreshToken,
        rememberMe,
      });

      setUser(userData || null);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      const refreshToken = getStoredItem(STORAGE_KEYS.refreshToken);

      if (refreshToken) {
        await logoutService({ token: refreshToken });
      }
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      clearAuthStorage();
      setUser(null);
    }
  }, []);

  const upgradeToHost = useCallback(async () => {
    const response = await becomeHostService();
    const data = response?.data || response;

    const updatedUser = data?.user || null;
    const newAccessToken = data?.accessToken || null;
    const newRefreshToken = data?.refreshToken || null;
    const rememberMe = getRememberMeValue();

    persistAuth({
      accessToken: newAccessToken || getStoredItem(STORAGE_KEYS.accessToken),
      refreshToken: newRefreshToken || getStoredItem(STORAGE_KEYS.refreshToken),
      rememberMe,
    });

    setUser(updatedUser);
    return updatedUser;
  }, []);

  useEffect(() => {
    const rehydrateUser = async () => {
      const accessToken = getStoredItem(STORAGE_KEYS.accessToken);

      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await getMe();
        const data = response?.data || response;
        setUser(data?.user || null);
      } catch (error) {
        console.error("Rehydrate user failed:", error);
        clearAuthStorage();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    rehydrateUser();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      loginUser,
      logout,
      upgradeToHost,
      setUser,
    }),
    [user, loading, loginUser, logout, upgradeToHost]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}