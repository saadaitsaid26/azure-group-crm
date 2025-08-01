import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { Product, ProductFormData, ProductStats } from "@/schemas/product.schema";

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface ProductFilters {
  q?: string;
  status?: "active" | "inactive";
  category?: string;
  min_price?: number;
  max_price?: number;
  ordering?: string;
  page?: number;
  page_size?: number;
}

/**
 * Hook to fetch paginated products list with filters
 */
export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ["products", "list", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.q) params.append("q", filters.q);
      if (filters.status) params.append("status", filters.status);
      if (filters.category) params.append("category", filters.category);
      if (filters.min_price !== undefined) params.append("min_price", filters.min_price.toString());
      if (filters.max_price !== undefined) params.append("max_price", filters.max_price.toString());
      if (filters.ordering) params.append("ordering", filters.ordering);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.page_size) params.append("page_size", filters.page_size.toString());
      
      const response = await apiClient.get<PaginatedResponse<Product>>(
        `/products/?${params.toString()}`
      );
      return response;
    },
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch a single product by ID
 */
export function useProduct(id: string) {
  return useQuery({
    queryKey: ["products", "detail", id],
    queryFn: async () => {
      const response = await apiClient.get<Product>(`/products/${id}/`);
      return response;
    },
    enabled: !!id,
  });
}

/**
 * Hook to fetch product statistics
 */
export function useProductStats(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ["products", "stats", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.q) params.append("q", filters.q);
      if (filters.status) params.append("status", filters.status);
      if (filters.category) params.append("category", filters.category);
      
      const response = await apiClient.get<ProductStats>(
        `/products/stats/?${params.toString()}`
      );
      return response;
    },
    staleTime: 60000, // 60 seconds
  });
}

/**
 * Hook to create a new product
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ProductFormData) => {
      const response = await apiClient.post<Product>("/products/", data);
      return response;
    },
    onSuccess: () => {
      // Invalidate products queries
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

/**
 * Hook to update an existing product
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProductFormData> }) => {
      const response = await apiClient.patch<Product>(`/products/${id}/`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      // Invalidate specific product and list
      queryClient.invalidateQueries({ queryKey: ["products", "detail", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
      queryClient.invalidateQueries({ queryKey: ["products", "stats"] });
    },
  });
}

/**
 * Hook to delete a product
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/products/${id}/`);
    },
    onSuccess: () => {
      // Invalidate all products queries
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
