

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  // Fetch current user on app load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // The auth cookie is httpOnly, so JS cannot read it.
        // Instead, just call the profile endpoint; it will 401 if unauthenticated.
        const res = await api.get("/api/users/profile");
        if (res.data) {
          setUser(res.data);
        }
      } catch(e) {
        // Silently fail - user is not authenticated
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Register function
  const register = async (userData) => {
    try {
      const response = await api.post("/api/auth/register", userData);
      if (response.data) {
        return true;
      }
      throw new Error(response.message);
    } catch (err) {
      console.error(err);
      throw new Error(err.response?.data?.message || "Registration failed");
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      const response = await api.post("/api/auth/login", credentials);
      if (response.data) {
        setUser(response.data.user);
        return true;
      }
      throw new Error(response.message);
    } catch (err) {
      console.error(err);
      throw new Error(err.response?.data?.message || "Login failed");
    }
  };

    // Logout function in case we have logout endpoint
  const logout = async () => {
    try {
      await api.post("/api/auth/logout", {});
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error.response?.data || error.message);
    }
  };

  if (loading) return <div>Loading...</div>;

return (
  <AuthContext.Provider value={{ user, setUser, register, login, logout, loading }}>
    {children}
  </AuthContext.Provider>
);

};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
