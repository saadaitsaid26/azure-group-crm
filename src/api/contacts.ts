import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { ContactFormData } from '@/schemas/contact.schema';

// Types
export interface Contact {
  id: string;
  organization: string | null;
  organization_name: string | null;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  status: 'active' | 'lead' | 'inactive';
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ContactListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Contact[];
}

export interface ContactFilters {
  page?: number;
  page_size?: number;
  q?: string;
  status?: string;
  organization?: string;
  organization_id?: string;
  role?: string;
  ordering?: string;
}

export interface ContactStats {
  total: number;
  by_status: {
    active: number;
    lead: number;
    inactive: number;
  };
}

// Query Keys
export const contactKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactKeys.all, 'list'] as const,
  list: (filters: ContactFilters) => [...contactKeys.lists(), filters] as const,
  details: () => [...contactKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
  stats: () => [...contactKeys.all, 'stats'] as const,
};

// API Functions
const fetchContacts = async (filters: ContactFilters): Promise<ContactListResponse> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  
  return apiClient.get(`/contacts/?${params.toString()}`);
};

const fetchContact = async (id: string): Promise<Contact> => {
  return apiClient.get(`/contacts/${id}/`);
};

const createContact = async (data: ContactFormData & { organization?: string }): Promise<Contact> => {
  // Map 'company' field from form to 'organization' for API
  const apiData = {
    ...data,
    organization: data.organization,
  };
  // Remove 'company' if it exists in data
  const { company, ...restData } = apiData as any;
  return apiClient.post('/contacts/', restData);
};

const updateContact = async ({ id, data }: { id: string; data: Partial<ContactFormData> & { organization?: string } }): Promise<Contact> => {
  const { company, ...restData } = data as any;
  return apiClient.patch(`/contacts/${id}/`, restData);
};

const deleteContact = async (id: string): Promise<void> => {
  return apiClient.delete(`/contacts/${id}/`);
};

const fetchContactStats = async (): Promise<ContactStats> => {
  return apiClient.get('/contacts/stats/');
};

// Hooks
export function useContacts(filters: ContactFilters = {}) {
  return useQuery({
    queryKey: contactKeys.list(filters),
    queryFn: () => fetchContacts(filters),
    staleTime: 30000, // 30 seconds
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: contactKeys.detail(id),
    queryFn: () => fetchContact(id),
    enabled: !!id,
  });
}

export function useContactStats() {
  return useQuery({
    queryKey: contactKeys.stats(),
    queryFn: fetchContactStats,
    staleTime: 60000, // 1 minute
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createContact,
    onSuccess: () => {
      // Invalidate and refetch contacts list
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactKeys.stats() });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateContact,
    onSuccess: (data) => {
      // Invalidate lists and the specific contact detail
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: contactKeys.stats() });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      // Invalidate contacts list
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactKeys.stats() });
    },
  });
}
