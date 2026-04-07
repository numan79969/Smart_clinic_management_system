import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { apiRequest } from "../api/client";

const AuthContext = createContext(null);

const STORAGE_KEY = "scms-auth";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      setToken(parsed.token ?? null);
      setAccount(parsed.account ?? null);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setLoading(false);
  }, []);

  const persist = (nextToken, nextAccount) => {
    setToken(nextToken);
    setAccount(nextAccount);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        token: nextToken,
        account: nextAccount,
      }),
    );
  };

  const login = async (email, password) => {
    const response = await apiRequest("/auth/login", {
      method: "POST",
      body: { email, password },
    });

    persist(response.access_token, response.account);
    return response.account;
  };

  const refreshMe = async () => {
    if (!token) {
      return null;
    }
    const me = await apiRequest("/auth/me", {
      token,
    });
    persist(token, me);
    return me;
  };

  const logout = () => {
    setToken(null);
    setAccount(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      token,
      account,
      loading,
      login,
      logout,
      refreshMe,
      isAuthenticated: Boolean(token && account),
    }),
    [token, account, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
