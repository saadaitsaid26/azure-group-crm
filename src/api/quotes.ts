import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { Quote, QuoteListItem, QuoteFormData, QuoteStats, QuoteItem } from "@/schemas/quote.schema";

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface QuoteFilters {
  q?: string;
  status?: "draft" | "sent" | "accepted" | "rejected" | "expired";
  organization?: string;
  contact?: string;
  lead?: string;
  created_by?: string;
  expiry_date_from?: string;
  expiry_date_to?: string;
  min_total?: number;
  max_total?: number;
  ordering?: string;
  page?: number;
  page_size?: number;
}

/**
 * Hook to fetch paginated quotes list with filters
 */
export function useQuotes(filters: QuoteFilters = {}) {
  return useQuery({
    queryKey: ["quotes", "list", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.q) params.append("q", filters.q);
      if (filters.status) params.append("status", filters.status);
      if (filters.organization) params.append("organization", filters.organization);
      if (filters.contact) params.append("contact", filters.contact);
      if (filters.lead) params.append("lead", filters.lead);
      if (filters.created_by) params.append("created_by", filters.created_by);
      if (filters.expiry_date_from) params.append("expiry_date_from", filters.expiry_date_from);
      if (filters.expiry_date_to) params.append("expiry_date_to", filters.expiry_date_to);
      if (filters.min_total !== undefined) params.append("min_total", filters.min_total.toString());
      if (filters.max_total !== undefined) params.append("max_total", filters.max_total.toString());
      if (filters.ordering) params.append("ordering", filters.ordering);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.page_size) params.append("page_size", filters.page_size.toString());
      
      const response = await apiClient.get<PaginatedResponse<QuoteListItem>>(
        `/quotes/?${params.toString()}`
      );
      return response;
    },
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch a single quote by ID (with items)
 */
export function useQuote(id: string) {
  return useQuery({
    queryKey: ["quotes", "detail", id],
    queryFn: async () => {
      const response = await apiClient.get<Quote>(`/quotes/${id}/`);
      return response;
    },
    enabled: !!id,
  });
}

/**
 * Hook to fetch quote statistics
 */
export function useQuoteStats(filters: QuoteFilters = {}) {
  return useQuery({
    queryKey: ["quotes", "stats", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.q) params.append("q", filters.q);
      if (filters.status) params.append("status", filters.status);
      if (filters.organization) params.append("organization", filters.organization);
      
      const response = await apiClient.get<QuoteStats>(
        `/quotes/stats/?${params.toString()}`
      );
      return response;
    },
    staleTime: 60000, // 60 seconds
  });
}

/**
 * Hook to fetch items for a specific quote
 */
export function useQuoteItems(quoteId: string) {
  return useQuery({
    queryKey: ["quotes", quoteId, "items"],
    queryFn: async () => {
      const response = await apiClient.get<QuoteItem[]>(`/quotes/${quoteId}/items_list/`);
      return response;
    },
    enabled: !!quoteId,
  });
}

/**
 * Hook to create a new quote
 */
export function useCreateQuote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: QuoteFormData) => {
      const response = await apiClient.post<Quote>("/quotes/", data);
      return response;
    },
    onSuccess: () => {
      // Invalidate quotes queries
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
}

/**
 * Hook to update an existing quote
 */
export function useUpdateQuote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<QuoteFormData> }) => {
      const response = await apiClient.patch<Quote>(`/quotes/${id}/`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      // Invalidate specific quote and list
      queryClient.invalidateQueries({ queryKey: ["quotes", "detail", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["quotes", "list"] });
      queryClient.invalidateQueries({ queryKey: ["quotes", "stats"] });
    },
  });
}

/**
 * Hook to delete a quote
 */
export function useDeleteQuote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/quotes/${id}/`);
    },
    onSuccess: () => {
      // Invalidate all quotes queries
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
}
