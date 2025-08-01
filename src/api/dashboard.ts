import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface DashboardKPI {
  value: number;
  change: number;
  this_month: number;
}

export interface DashboardKPIs {
  total_revenue: DashboardKPI;
  active_leads: DashboardKPI;
  total_contacts: DashboardKPI;
  conversion_rate: DashboardKPI;
}

export interface RecentActivity {
  id: string;
  type: string;
  title: string;
  comment: string;
  schedule_from: string | null;
  is_done: boolean;
  created_at: string;
  lead_title?: string;
  contact_name?: string;
  user_email?: string;
}

export interface LeadByStage {
  stage: string;
  count: number;
  value: string;
}

export interface RevenueOverTime {
  month: string;
  revenue: number;
}

export interface DashboardStats {
  kpis: DashboardKPIs;
  pipeline_value: number;
  recent_activities: RecentActivity[];
  leads_by_stage: LeadByStage[];
  revenue_over_time: RevenueOverTime[];
}

export interface DashboardSummary {
  total_organizations: number;
  total_contacts: number;
  total_leads: number;
  active_leads: number;
  total_quotes: number;
  pending_activities: number;
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => apiClient.get<DashboardStats>('/dashboard/'),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

export function useDashboardSummary() {
  return useQuery<DashboardSummary>({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => apiClient.get<DashboardSummary>('/dashboard/summary/'),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
