import { toast } from "@/hooks/use-toast";

// Use environment variable for API URL, fallback to default
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include", // Include cookies in requests
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized - redirect to login
          // Don't redirect if already on login page to avoid infinite loop
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
          throw new Error("Unauthorized");
        }
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || error.detail || "API request failed");
      }

      return await response.json();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
