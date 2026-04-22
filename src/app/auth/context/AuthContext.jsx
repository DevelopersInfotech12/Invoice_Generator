"use client";
// frontend/src/auth/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi } from "../api/authApi.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  /* Fetch current user using stored token */
  const fetchMe = useCallback(async () => {
    try {
      const data = await authApi.getMe();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const register = async (credentials) => {
    const data = await authApi.register(credentials);
    setUser(data.user);
    return data;
  };

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    setUser(data.user);
    return data;
  };

  const googleLogin = async (idToken) => {
    const data = await authApi.googleLogin(idToken);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await authApi.updateProfile(data);
    setUser(res.user);
    return res;
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, googleLogin, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside <AuthProvider>");
  return ctx;
}