import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { Lead, LeadFormData } from '@/schemas/lead.schema';

// Query keys
export const leadKeys = {
  all: ['leads'] as const,
  lists: () => [...leadKeys.all, 'list'] as const,
  list: (filters?: LeadFilters) => [...leadKeys.lists(), filters] as const,
  details: () => [...leadKeys.all, 'detail'] as const,
  detail: (id: string) => [...leadKeys.details(), id] as const,
  stats: () => [...leadKeys.all, 'stats'] as const,
  pipeline: () => [...leadKeys.all, 'pipeline'] as const,
  activities: (id: string) => [...leadKeys.detail(id), 'activities'] as const,
};

export interface LeadFilters {
  stage?: string;
  priority?: string;
  source?: string;
  organization_id?: string;
  contact_id?: string;
  owner_id?: string;
  q?: string;
  page?: number;
  page_size?: number;
}

export interface LeadStats {
  total: number;
  by_stage: Record<string, number>;
  by_priority: Record<string, number>;
  total_value: string;
  average_value: string;
}

export interface PipelineStage {
  stage: string;
  count: number;
  total_value: string;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// List leads with filters
export function useLeads(filters?: LeadFilters) {
  return useQuery({
    queryKey: leadKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.stage) params.append('stage', filters.stage);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.source) params.append('source', filters.source);
      if (filters?.organization_id) params.append('organization_id', filters.organization_id);
      if (filters?.contact_id) params.append('contact_id', filters.contact_id);
      if (filters?.owner_id) params.append('owner_id', filters.owner_id);
      if (filters?.q) params.append('q', filters.q);
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.page_size) params.append('page_size', String(filters.page_size));

      const queryString = params.toString();
      const url = queryString ? `/leads/?${queryString}` : '/leads/';
      
      const data = await apiClient.get<PaginatedResponse<Lead>>(url);
      return data;
    },
  });
}

// Get single lead
export function useLead(id: string | undefined) {
  return useQuery({
    queryKey: leadKeys.detail(id!),
    queryFn: async () => {
      const data = await apiClient.get<Lead>(`/leads/${id}/`);
      return data;
    },
    enabled: !!id,
  });
}

// Get lead statistics
export function useLeadStats(filters?: LeadFilters) {
  return useQuery({
    queryKey: leadKeys.stats(),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.stage) params.append('stage', filters.stage);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.organization_id) params.append('organization_id', filters.organization_id);
      if (filters?.owner_id) params.append('owner_id', filters.owner_id);

      const queryString = params.toString();
      const url = queryString ? `/leads/stats/?${queryString}` : '/leads/stats/';
      
      const data = await apiClient.get<LeadStats>(url);
      return data;
    },
  });
}

// Get pipeline view
export function useLeadPipeline(filters?: LeadFilters) {
  return useQuery({
    queryKey: leadKeys.pipeline(),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.organization_id) params.append('organization_id', filters.organization_id);
      if (filters?.owner_id) params.append('owner_id', filters.owner_id);

      const queryString = params.toString();
      const url = queryString ? `/leads/pipeline/?${queryString}` : '/leads/pipeline/';
      
      const data = await apiClient.get<PipelineStage[]>(url);
      return data;
    },
  });
}

// Get activities for a lead
export function useLeadActivities(id: string | undefined) {
  return useQuery({
    queryKey: leadKeys.activities(id!),
    queryFn: async () => {
      const data = await apiClient.get<any[]>(`/leads/${id}/activities/`);
      return data;
    },
    enabled: !!id,
  });
}

// Create lead
export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LeadFormData) => {
      const response = await apiClient.post<Lead>('/leads/', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.stats() });
      queryClient.invalidateQueries({ queryKey: leadKeys.pipeline() });
    },
  });
}

// Update lead
export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<LeadFormData> }) => {
      const response = await apiClient.patch<Lead>(`/leads/${id}/`, data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: leadKeys.stats() });
      queryClient.invalidateQueries({ queryKey: leadKeys.pipeline() });
    },
  });
}

// Delete lead
export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/leads/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.stats() });
      queryClient.invalidateQueries({ queryKey: leadKeys.pipeline() });
    },
  });
}
