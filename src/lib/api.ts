import { toast } from "@/hooks/use-toast";

// Use environment variable for API URL, fallback to default
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

class ApiClient {
  private baseURL: string;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Process queued requests after token refresh
   */
  private processQueue(error: any = null) {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve();
      }
    });
    this.failedQueue = [];
  }

  /**
   * Attempt to refresh the access token using the refresh token
   */
  private async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
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
          // Unauthorized - attempt token refresh
          // Don't redirect if already on login page or if checking auth status
          const isAuthCheck = endpoint === "/auth/me";
          const isLoginPage = window.location.pathname === "/login";
          
          // If this is not an auth check and not on login page, try to refresh token
          if (!isAuthCheck && !isLoginPage) {
            // If already refreshing, queue this request
            if (this.isRefreshing) {
              return new Promise((resolve, reject) => {
                this.failedQueue.push({ resolve, reject });
              }).then(() => {
                // Retry the original request after token refresh
                return this.request<T>(endpoint, options);
              });
            }

            // Try to refresh the token
            this.isRefreshing = true;
            const refreshed = await this.refreshToken();
            this.isRefreshing = false;

            if (refreshed) {
              // Token refreshed successfully, retry original request
              this.processQueue();
              return this.request<T>(endpoint, options);
            } else {
              // Refresh failed, clear queue and redirect to login
              this.processQueue(new Error("Session expired"));
              window.location.href = "/login";
              throw new Error("Session expired. Please login again.");
            }
          }

          // For auth check or already on login page, just throw unauthorized
          if (!isAuthCheck) {
            window.location.href = "/login";
          }
          const error = new Error("Unauthorized");
          // Mark the error as an auth check so we can suppress console logging
          (error as any).isAuthCheck = isAuthCheck;
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
