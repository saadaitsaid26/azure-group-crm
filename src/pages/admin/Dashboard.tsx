import {
  Users,
  Shield,
  TrendingUp,
  Activity,
  Loader2,
  Building2,
  Contact,
  Workflow,
  Database,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useDashboardStats } from "@/api/users";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          System administration and configuration
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <>
          <div>
            <h2 className="text-lg font-semibold mb-3">User Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.users.total}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.users.active} active
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Administrators
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.users.admins}</div>
                  <p className="text-xs text-muted-foreground">Admin role</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Regular Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.users.users}</div>
                  <p className="text-xs text-muted-foreground">User role</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active (30d)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.system_health.active_users_30d}
                  </div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">CRM Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Leads
                  </CardTitle>
                  <Workflow className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.crm.total_leads}
                  </div>
                  <p className="text-xs text-green-600">
                    +{stats.recent_activity.new_leads} this week
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Contacts
                  </CardTitle>
                  <Contact className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.crm.total_contacts}
                  </div>
                  <p className="text-xs text-green-600">
                    +{stats.recent_activity.new_contacts} this week
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Organizations
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.crm.total_organizations}
                  </div>
                  <p className="text-xs text-green-600">
                    +{stats.recent_activity.new_organizations} this week
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Activities
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.crm.total_activities}
                  </div>
                  <p className="text-xs text-green-600">
                    +{stats.recent_activity.new_activities} this week
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">System Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Roles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.roles.total}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.roles.with_users} with users
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pipeline Stages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.reference_data.pipeline_stages}
                  </div>
                  <p className="text-xs text-muted-foreground">Active stages</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Lead Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.reference_data.lead_sources}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active sources
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Activity Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.reference_data.activity_types}
                  </div>
                  <p className="text-xs text-muted-foreground">Active types</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/admin/users">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Users</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage system users
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/roles">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Roles</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Configure permissions
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/pipelines">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Pipelines</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Sales pipeline config
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/types">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Types</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Activity types & categories
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Activity Summary */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity (Last 7 Days)</CardTitle>
            <CardDescription>
              Summary of new records created this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                <Workflow className="h-8 w-8 text-blue-500 mb-2" />
                <div className="text-2xl font-bold">
                  {stats.recent_activity.new_leads}
                </div>
                <p className="text-xs text-muted-foreground">New Leads</p>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                <Contact className="h-8 w-8 text-green-500 mb-2" />
                <div className="text-2xl font-bold">
                  {stats.recent_activity.new_contacts}
                </div>
                <p className="text-xs text-muted-foreground">New Contacts</p>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                <Building2 className="h-8 w-8 text-purple-500 mb-2" />
                <div className="text-2xl font-bold">
                  {stats.recent_activity.new_organizations}
                </div>
                <p className="text-xs text-muted-foreground">
                  New Organizations
                </p>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                <Activity className="h-8 w-8 text-orange-500 mb-2" />
                <div className="text-2xl font-bold">
                  {stats.recent_activity.new_activities}
                </div>
                <p className="text-xs text-muted-foreground">New Activities</p>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                <Users className="h-8 w-8 text-indigo-500 mb-2" />
                <div className="text-2xl font-bold">
                  {stats.recent_activity.new_users}
                </div>
                <p className="text-xs text-muted-foreground">New Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
