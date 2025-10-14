import React, { createContext, useState, useEffect } from "react";
import API from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token) {
      API.get("/auth/me")
        .then((res) => {
          setUser(res.data.user);
          // Update stored role if needed
          if (res.data.user.role) {
            localStorage.setItem("role", res.data.user.role);
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", res.data.user.role); // ✅ store role
    setUser(res.data.user);
  };

  const register = async (form) => {
    const res = await API.post("/auth/register", form);
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", res.data.user.role); // ✅ store role
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role"); // ✅ remove role on logout
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );

  
};
