

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  // Fetch current user on app load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Check if token exists in cookies before fetching
        const hasCookie = document.cookie.includes('token');
        
        if (!hasCookie) {
          setUser(null);
          setLoading(false);
          return;
        }

        const res = await axios.get("http://localhost:3000/api/users/profile", {
          withCredentials: true,
        });
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
      const response = await axios.post("http://localhost:3000/api/auth/register", userData, {
        withCredentials: true,
      });
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
      const response = await axios.post("http://localhost:3000/api/auth/login", credentials, {
        withCredentials: true,
      });
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
      await axios.post(
        "http://localhost:3000/api/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );
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
