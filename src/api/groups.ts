import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

// Types
export interface Permission {
  id: number;
  name: string;
  codename: string;
  content_type: number;
  content_type_name: string;
}

export interface Group {
  id: number;
  name: string;
  permissions: Permission[];
  user_count: number;
}

export interface GroupList {
  id: number;
  name: string;
  user_count: number;
  permission_count: number;
}

export interface GroupFormData {
  name: string;
  permission_ids?: number[];
}

export interface GroupFilters {
  q?: string;
  page?: number;
  page_size?: number;
}

export interface GroupStats {
  total: number;
  with_users: number;
  empty: number;
  total_users: number;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Query keys
export const groupKeys = {
  all: ['groups'] as const,
  lists: () => [...groupKeys.all, 'list'] as const,
  list: (filters?: GroupFilters) => [...groupKeys.lists(), filters] as const,
  details: () => [...groupKeys.all, 'detail'] as const,
  detail: (id: number) => [...groupKeys.details(), id] as const,
  stats: () => [...groupKeys.all, 'stats'] as const,
  users: (id: number) => [...groupKeys.all, 'users', id] as const,
};

export const permissionKeys = {
  all: ['permissions'] as const,
  lists: () => [...permissionKeys.all, 'list'] as const,
  byContentType: () => [...permissionKeys.all, 'by_content_type'] as const,
};

// Hooks - Groups
export function useGroups(filters?: GroupFilters) {
  return useQuery({
    queryKey: groupKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.q) params.append('q', filters.q);
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.page_size) params.append('page_size', String(filters.page_size));
      
      const response = await apiClient.get<PaginatedResponse<GroupList>>(`/groups/?${params.toString()}`);
      return response;
    },
  });
}

export function useGroup(id: number) {
  return useQuery({
    queryKey: groupKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<Group>(`/groups/${id}/`);
      return response;
    },
    enabled: !!id,
  });
}

export function useGroupStats() {
  return useQuery({
    queryKey: groupKeys.stats(),
    queryFn: async () => {
      const response = await apiClient.get<GroupStats>('/groups/stats/');
      return response;
    },
  });
}

export function useGroupUsers(id: number) {
  return useQuery({
    queryKey: groupKeys.users(id),
    queryFn: async () => {
      const response = await apiClient.get(`/groups/${id}/users/`);
      return response;
    },
    enabled: !!id,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: GroupFormData) => {
      const response = await apiClient.post<Group>('/groups/', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: groupKeys.stats() });
    },
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<GroupFormData> }) => {
      const response = await apiClient.patch<Group>(`/groups/${id}/`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: groupKeys.stats() });
    },
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/groups/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: groupKeys.stats() });
    },
  });
}

export function useAddUserToGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ groupId, userId }: { groupId: number; userId: string }) => {
      const response = await apiClient.post(`/groups/${groupId}/add_user/`, { user_id: userId });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.users(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.stats() });
    },
  });
}

export function useRemoveUserFromGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ groupId, userId }: { groupId: number; userId: string }) => {
      const response = await apiClient.post(`/groups/${groupId}/remove_user/`, { user_id: userId });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.users(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.stats() });
    },
  });
}

// Hooks - Permissions
export function usePermissions() {
  return useQuery({
    queryKey: permissionKeys.lists(),
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Permission>>('/permissions/');
      return response;
    },
  });
}

export function usePermissionsByContentType() {
  return useQuery({
    queryKey: permissionKeys.byContentType(),
    queryFn: async () => {
      const response = await apiClient.get<Array<{
        content_type: { id: number; app_label: string; model: string };
        permissions: Permission[];
      }>>('/permissions/by_content_type/');
      return response;
    },
  });
}
