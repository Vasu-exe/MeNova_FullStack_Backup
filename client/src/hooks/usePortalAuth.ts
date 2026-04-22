import { useState, useEffect, useCallback } from "react";

interface PortalUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "patient" | "np";
}

export function usePortalAuth() {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("portalToken");
    const storedUser = localStorage.getItem("portalUser");
    if (storedToken && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setToken(storedToken);
      } catch {
        localStorage.removeItem("portalToken");
        localStorage.removeItem("portalUser");
      }
    }
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("portalToken");
    localStorage.removeItem("portalUser");
    setUser(null);
    setToken(null);
    window.location.href = "/portal";
  }, []);

  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const t = localStorage.getItem("portalToken");
      if (!t) throw new Error("Not authenticated");
      const res = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${t}`,
          ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        },
      });
      if (res.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      return res;
    },
    [logout]
  );

  return { user, loading, token, logout, authFetch };
}
