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
          // Don't redirect if already on login page or if checking auth status
          if (window.location.pathname !== "/login" && endpoint !== "/auth/me") {
            window.location.href = "/login";
          }
          const error = new Error("Unauthorized");
          // Mark the error as an auth check so we can suppress console logging
          (error as any).isAuthCheck = endpoint === "/auth/me";
          throw error;
        }
        const errorData = await response.json().catch(() => ({}));
        
        // Handle different error response formats from Django REST Framework
        let errorMessage = "API request failed";
        
        if (errorData.detail) {
          // Single detail message
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          // Custom message field
          errorMessage = errorData.message;
        } else if (typeof errorData === 'object' && Object.keys(errorData).length > 0) {
          // Field-specific errors (e.g., {"stage": ["Cannot reopen a won or lost lead."]})
          const fieldErrors = Object.entries(errorData)
            .map(([field, errors]) => {
              if (Array.isArray(errors)) {
                return `${field}: ${errors.join(', ')}`;
              }
              return `${field}: ${errors}`;
            })
            .join('; ');
          errorMessage = fieldErrors || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      // Don't show toast for 401 on /auth/me (initial auth check)
      const isAuthCheckError = error instanceof Error && 
                               error.message === "Unauthorized" && 
                               (error as any).isAuthCheck;
      
      if (!isAuthCheckError) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        });
      }
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

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
