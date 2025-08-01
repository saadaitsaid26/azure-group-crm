import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

// Base interfaces
interface ReferenceDataBase {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ReferenceDataStats {
  total: number;
  active: number;
  inactive: number;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Pipeline Stage
export interface PipelineStage extends ReferenceDataBase {
  sort_order: number;
  color: string;
}

export interface PipelineStageFormData {
  name: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
  color?: string;
}

// Lead Source
export interface LeadSource extends ReferenceDataBase {}

export interface LeadSourceFormData {
  name: string;
  description?: string;
  is_active?: boolean;
}

// Activity Type
export interface ActivityType extends ReferenceDataBase {
  icon: string;
}

export interface ActivityTypeFormData {
  name: string;
  description?: string;
  is_active?: boolean;
  icon?: string;
}

// Contact Type
export interface ContactType extends ReferenceDataBase {}

export interface ContactTypeFormData {
  name: string;
  description?: string;
  is_active?: boolean;
}

// Filters
export interface ReferenceDataFilters {
  q?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}

// ===== PIPELINE STAGES =====
export const pipelineStageKeys = {
  all: ['pipeline-stages'] as const,
  lists: () => [...pipelineStageKeys.all, 'list'] as const,
  list: (filters?: ReferenceDataFilters) => [...pipelineStageKeys.lists(), filters] as const,
  details: () => [...pipelineStageKeys.all, 'detail'] as const,
  detail: (id: string) => [...pipelineStageKeys.details(), id] as const,
  stats: () => [...pipelineStageKeys.all, 'stats'] as const,
};

export function usePipelineStages(filters?: ReferenceDataFilters) {
  return useQuery({
    queryKey: pipelineStageKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.q) params.append('q', filters.q);
      if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.page_size) params.append('page_size', String(filters.page_size));
      
      return await apiClient.get<PaginatedResponse<PipelineStage>>(`/reference/pipeline-stages/?${params.toString()}`);
    },
  });
}

export function usePipelineStageStats(filters?: ReferenceDataFilters) {
  return useQuery({
    queryKey: pipelineStageKeys.stats(),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.q) params.append('q', filters.q);
      if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
      
      return await apiClient.get<ReferenceDataStats>(`/reference/pipeline-stages/stats/?${params.toString()}`);
    },
  });
}

export function useCreatePipelineStage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: PipelineStageFormData) => {
      return await apiClient.post<PipelineStage>('/reference/pipeline-stages/', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pipelineStageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: pipelineStageKeys.stats() });
    },
  });
}

export function useUpdatePipelineStage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PipelineStageFormData> }) => {
      return await apiClient.patch<PipelineStage>(`/reference/pipeline-stages/${id}/`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: pipelineStageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: pipelineStageKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: pipelineStageKeys.stats() });
    },
  });
}

export function useDeletePipelineStage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/reference/pipeline-stages/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pipelineStageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: pipelineStageKeys.stats() });
    },
  });
}

// ===== LEAD SOURCES =====
export const leadSourceKeys = {
  all: ['lead-sources'] as const,
  lists: () => [...leadSourceKeys.all, 'list'] as const,
  list: (filters?: ReferenceDataFilters) => [...leadSourceKeys.lists(), filters] as const,
  details: () => [...leadSourceKeys.all, 'detail'] as const,
  detail: (id: string) => [...leadSourceKeys.details(), id] as const,
  stats: () => [...leadSourceKeys.all, 'stats'] as const,
};

export function useLeadSources(filters?: ReferenceDataFilters) {
  return useQuery({
    queryKey: leadSourceKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.q) params.append('q', filters.q);
      if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.page_size) params.append('page_size', String(filters.page_size));
      
      return await apiClient.get<PaginatedResponse<LeadSource>>(`/reference/lead-sources/?${params.toString()}`);
    },
  });
}

export function useLeadSourceStats(filters?: ReferenceDataFilters) {
  return useQuery({
    queryKey: leadSourceKeys.stats(),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.q) params.append('q', filters.q);
      if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
      
      return await apiClient.get<ReferenceDataStats>(`/reference/lead-sources/stats/?${params.toString()}`);
    },
  });
}

export function useCreateLeadSource() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: LeadSourceFormData) => {
      return await apiClient.post<LeadSource>('/reference/lead-sources/', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadSourceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadSourceKeys.stats() });
    },
  });
}

export function useUpdateLeadSource() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<LeadSourceFormData> }) => {
      return await apiClient.patch<LeadSource>(`/reference/lead-sources/${id}/`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leadSourceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadSourceKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: leadSourceKeys.stats() });
    },
  });
}

export function useDeleteLeadSource() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/reference/lead-sources/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadSourceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadSourceKeys.stats() });
    },
  });
}

// ===== ACTIVITY TYPES =====
export const activityTypeKeys = {
  all: ['activity-types'] as const,
  lists: () => [...activityTypeKeys.all, 'list'] as const,
  list: (filters?: ReferenceDataFilters) => [...activityTypeKeys.lists(), filters] as const,
  details: () => [...activityTypeKeys.all, 'detail'] as const,
  detail: (id: string) => [...activityTypeKeys.details(), id] as const,
  stats: () => [...activityTypeKeys.all, 'stats'] as const,
};

export function useActivityTypes(filters?: ReferenceDataFilters) {
  return useQuery({
    queryKey: activityTypeKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.q) params.append('q', filters.q);
      if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.page_size) params.append('page_size', String(filters.page_size));
      
      return await apiClient.get<PaginatedResponse<ActivityType>>(`/reference/activity-types/?${params.toString()}`);
    },
  });
}

export function useActivityTypeStats(filters?: ReferenceDataFilters) {
  return useQuery({
    queryKey: activityTypeKeys.stats(),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.q) params.append('q', filters.q);
      if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
      
      return await apiClient.get<ReferenceDataStats>(`/reference/activity-types/stats/?${params.toString()}`);
    },
  });
}

export function useCreateActivityType() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ActivityTypeFormData) => {
      return await apiClient.post<ActivityType>('/reference/activity-types/', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityTypeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activityTypeKeys.stats() });
    },
  });
}

export function useUpdateActivityType() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ActivityTypeFormData> }) => {
      return await apiClient.patch<ActivityType>(`/reference/activity-types/${id}/`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: activityTypeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activityTypeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: activityTypeKeys.stats() });
    },
  });
}

export function useDeleteActivityType() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/reference/activity-types/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityTypeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activityTypeKeys.stats() });
    },
  });
}

// ===== CONTACT TYPES =====
export const contactTypeKeys = {
  all: ['contact-types'] as const,
  lists: () => [...contactTypeKeys.all, 'list'] as const,
  list: (filters?: ReferenceDataFilters) => [...contactTypeKeys.lists(), filters] as const,
  details: () => [...contactTypeKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactTypeKeys.details(), id] as const,
  stats: () => [...contactTypeKeys.all, 'stats'] as const,
};

export function useContactTypes(filters?: ReferenceDataFilters) {
  return useQuery({
    queryKey: contactTypeKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.q) params.append('q', filters.q);
      if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.page_size) params.append('page_size', String(filters.page_size));
      
      return await apiClient.get<PaginatedResponse<ContactType>>(`/reference/contact-types/?${params.toString()}`);
    },
  });
}

export function useContactTypeStats(filters?: ReferenceDataFilters) {
  return useQuery({
    queryKey: contactTypeKeys.stats(),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.q) params.append('q', filters.q);
      if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
      
      return await apiClient.get<ReferenceDataStats>(`/reference/contact-types/stats/?${params.toString()}`);
    },
  });
}

export function useCreateContactType() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ContactTypeFormData) => {
      return await apiClient.post<ContactType>('/reference/contact-types/', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactTypeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactTypeKeys.stats() });
    },
  });
}

export function useUpdateContactType() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ContactTypeFormData> }) => {
      return await apiClient.patch<ContactType>(`/reference/contact-types/${id}/`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: contactTypeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactTypeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: contactTypeKeys.stats() });
    },
  });
}

export function useDeleteContactType() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/reference/contact-types/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactTypeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactTypeKeys.stats() });
    },
  });
}
