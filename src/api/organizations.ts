import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { OrganizationFormData } from '@/schemas/organization.schema';

// Types
export interface Organization {
  id: string;
  name: string;
  industry: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  status: 'active' | 'prospect' | 'inactive';
  type: 'Enterprise' | 'Mid-Market' | 'SMB' | '';
  metadata: Record<string, any>;
  contacts_count: number;
  created_at: string;
  updated_at: string;
}

export interface OrganizationListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Organization[];
}

export interface OrganizationFilters {
  page?: number;
  page_size?: number;
  q?: string;
  status?: string;
  type?: string;
  industry?: string;
  ordering?: string;
}

// Query Keys
export const organizationKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationKeys.all, 'list'] as const,
  list: (filters: OrganizationFilters) => [...organizationKeys.lists(), filters] as const,
  details: () => [...organizationKeys.all, 'detail'] as const,
  detail: (id: string) => [...organizationKeys.details(), id] as const,
  stats: () => [...organizationKeys.all, 'stats'] as const,
};

// API Functions
const fetchOrganizations = async (filters: OrganizationFilters): Promise<OrganizationListResponse> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  
  return apiClient.get(`/organizations/?${params.toString()}`);
};

const fetchOrganization = async (id: string): Promise<Organization> => {
  return apiClient.get(`/organizations/${id}/`);
};

const createOrganization = async (data: OrganizationFormData): Promise<Organization> => {
  return apiClient.post('/organizations/', data);
};

const updateOrganization = async ({ id, data }: { id: string; data: Partial<OrganizationFormData> }): Promise<Organization> => {
  return apiClient.patch(`/organizations/${id}/`, data);
};

const deleteOrganization = async (id: string): Promise<void> => {
  return apiClient.delete(`/organizations/${id}/`);
};

const fetchOrganizationStats = async () => {
  return apiClient.get('/organizations/stats/');
};

// Hooks
export function useOrganizations(filters: OrganizationFilters = {}) {
  return useQuery({
    queryKey: organizationKeys.list(filters),
    queryFn: () => fetchOrganizations(filters),
    staleTime: 30000, // 30 seconds
  });
}

export function useOrganization(id: string) {
  return useQuery({
    queryKey: organizationKeys.detail(id),
    queryFn: () => fetchOrganization(id),
    enabled: !!id,
  });
}

export function useOrganizationStats() {
  return useQuery({
    queryKey: organizationKeys.stats(),
    queryFn: fetchOrganizationStats,
    staleTime: 60000, // 1 minute
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      // Invalidate and refetch organizations list
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: organizationKeys.stats() });
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateOrganization,
    onSuccess: (data) => {
      // Invalidate lists and the specific organization detail
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: organizationKeys.stats() });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteOrganization,
    onSuccess: () => {
      // Invalidate organizations list
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: organizationKeys.stats() });
    },
  });
}
