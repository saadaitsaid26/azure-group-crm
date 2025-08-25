import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

// Types
export interface GroupBasic {
  id: number;
  name: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'user';
  is_active: boolean;
  groups: GroupBasic[];
  created_at: string;
  updated_at: string;
}

export interface UserFormData {
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'user';
  group_ids?: number[];
}

export interface UserFilters {
  q?: string;
  role?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}

export interface UserStats {
  total: number;
  by_role: {
    admin: number;
    user: number;
  };
  by_status: {
    active: number;
    inactive: number;
  };
}

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    admins: number;
    users: number;
  };
  roles: {
    total: number;
    with_users: number;
  };
  reference_data: {
    pipeline_stages: number;
    lead_sources: number;
    activity_types: number;
    contact_types: number;
  };
  crm: {
    total_leads: number;
    total_contacts: number;
    total_organizations: number;
    total_activities: number;
  };
  recent_activity: {
    new_leads: number;
    new_contacts: number;
    new_organizations: number;
    new_activities: number;
    new_users: number;
  };
  system_health: {
    active_users_30d: number;
    total_users: number;
  };
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  stats: () => [...userKeys.all, 'stats'] as const,
};

// Hooks
export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.q) params.append('q', filters.q);
      if (filters?.role) params.append('role', filters.role);
      if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.page_size) params.append('page_size', String(filters.page_size));
      
      const response = await apiClient.get<PaginatedResponse<User>>(`/users/?${params.toString()}`);
      return response;
    },
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<User>(`/users/${id}/`);
      return response;
    },
    enabled: !!id,
  });
}

export function useUserStats(filters?: UserFilters) {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.q) params.append('q', filters.q);
      if (filters?.role) params.append('role', filters.role);
      if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
      
      const response = await apiClient.get<UserStats>(`/users/stats/?${params.toString()}`);
      return response;
    },
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: [...userKeys.all, 'dashboard-stats'] as const,
    queryFn: async () => {
      const response = await apiClient.get<DashboardStats>('/users/dashboard_stats/');
      return response;
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UserFormData) => {
      const response = await apiClient.post<User>('/users/', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<UserFormData> }) => {
      const response = await apiClient.patch<User>(`/users/${id}/`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/users/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });
}
