import { createContext, useState, useEffect, ReactNode } from "react";
import { apiClient } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "user";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  isAdmin: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On mount, try to fetch user data (cookies will be sent automatically)
    // Note: A 401 response is expected and normal when user is not logged in
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      // Backend will validate the httpOnly cookie and return user data
      const userData = await apiClient.get<User>("/auth/me");
      setUser(userData);
    } catch (error: any) {
      // User is not authenticated or session expired
      // This is expected behavior when not logged in, so silently handle it
      // Don't log anything for 401 errors on auth check
      if (error?.message !== "Unauthorized") {
        console.error("Error fetching user:", error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    // Backend will set httpOnly cookie on successful login
    const response = await apiClient.post<{ user: User }>(
      "/auth/login",
      { email, password }
    );
    setUser(response.user);
  };

  const logout = async () => {
    try {
      // Call backend logout to clear the httpOnly cookie
      await apiClient.post("/auth/logout");
    } catch (error) {
      // Even if logout fails, clear local user state
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      // Redirect to login page
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
