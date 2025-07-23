import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { Activity, ActivityFormData } from '@/schemas/activity.schema';

// Query keys
export const activityKeys = {
  all: ['activities'] as const,
  lists: () => [...activityKeys.all, 'list'] as const,
  list: (filters?: ActivityFilters) => [...activityKeys.lists(), filters] as const,
  details: () => [...activityKeys.all, 'detail'] as const,
  detail: (id: string) => [...activityKeys.details(), id] as const,
  stats: () => [...activityKeys.all, 'stats'] as const,
  upcoming: () => [...activityKeys.all, 'upcoming'] as const,
  overdue: () => [...activityKeys.all, 'overdue'] as const,
};

export interface ActivityFilters {
  type?: string;
  is_done?: boolean;
  lead_id?: string;
  contact_id?: string;
  organization_id?: string;
  created_by_id?: string;
  schedule_from_after?: string;
  schedule_from_before?: string;
  schedule_to_after?: string;
  schedule_to_before?: string;
  q?: string;
  page?: number;
  page_size?: number;
}

export interface ActivityStats {
  total: number;
  by_type: Record<string, number>;
  completed: number;
  pending: number;
  overdue: number;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// List activities with filters
export function useActivities(filters?: ActivityFilters) {
  return useQuery({
    queryKey: activityKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.is_done !== undefined) params.append('is_done', String(filters.is_done));
      if (filters?.lead_id) params.append('lead_id', filters.lead_id);
      if (filters?.contact_id) params.append('contact_id', filters.contact_id);
      if (filters?.organization_id) params.append('organization_id', filters.organization_id);
      if (filters?.created_by_id) params.append('created_by_id', filters.created_by_id);
      if (filters?.schedule_from_after) params.append('schedule_from_after', filters.schedule_from_after);
      if (filters?.schedule_from_before) params.append('schedule_from_before', filters.schedule_from_before);
      if (filters?.schedule_to_after) params.append('schedule_to_after', filters.schedule_to_after);
      if (filters?.schedule_to_before) params.append('schedule_to_before', filters.schedule_to_before);
      if (filters?.q) params.append('q', filters.q);
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.page_size) params.append('page_size', String(filters.page_size));

      const queryString = params.toString();
      const url = queryString ? `/activities/?${queryString}` : '/activities/';
      
      const data = await apiClient.get<PaginatedResponse<Activity>>(url);
      return data;
    },
  });
}

// Get single activity
export function useActivity(id: string | undefined) {
  return useQuery({
    queryKey: activityKeys.detail(id!),
    queryFn: async () => {
      const data = await apiClient.get<Activity>(`/activities/${id}/`);
      return data;
    },
    enabled: !!id,
  });
}

// Get activity statistics
export function useActivityStats(filters?: ActivityFilters) {
  return useQuery({
    queryKey: activityKeys.stats(),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.is_done !== undefined) params.append('is_done', String(filters.is_done));
      if (filters?.lead_id) params.append('lead_id', filters.lead_id);
      if (filters?.organization_id) params.append('organization_id', filters.organization_id);

      const queryString = params.toString();
      const url = queryString ? `/activities/stats/?${queryString}` : '/activities/stats/';
      
      const data = await apiClient.get<ActivityStats>(url);
      return data;
    },
  });
}

// Get upcoming activities
export function useUpcomingActivities() {
  return useQuery({
    queryKey: activityKeys.upcoming(),
    queryFn: async () => {
      const data = await apiClient.get<Activity[] | { results: Activity[] }>('/activities/upcoming/');
      // Support both array and paginated response shapes
      return Array.isArray(data) ? data : data.results;
    },
  });
}

// Get overdue activities
export function useOverdueActivities() {
  return useQuery({
    queryKey: activityKeys.overdue(),
    queryFn: async () => {
      const data = await apiClient.get<Activity[] | { results: Activity[] }>('/activities/overdue/');
      return Array.isArray(data) ? data : data.results;
    },
  });
}

// Create activity
export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ActivityFormData) => {
      const response = await apiClient.post<Activity>('/activities/', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activityKeys.stats() });
      queryClient.invalidateQueries({ queryKey: activityKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: activityKeys.overdue() });
      // Also invalidate lead activities if it's related to a lead
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

// Update activity
export function useUpdateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ActivityFormData> }) => {
      const response = await apiClient.patch<Activity>(`/activities/${id}/`, data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activityKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: activityKeys.stats() });
      queryClient.invalidateQueries({ queryKey: activityKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: activityKeys.overdue() });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

// Toggle activity done status
export function useToggleActivityDone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch<Activity>(`/activities/${id}/toggle_done/`, {});
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activityKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: activityKeys.stats() });
      queryClient.invalidateQueries({ queryKey: activityKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: activityKeys.overdue() });
    },
  });
}

// Delete activity
export function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/activities/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activityKeys.stats() });
      queryClient.invalidateQueries({ queryKey: activityKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: activityKeys.overdue() });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}
