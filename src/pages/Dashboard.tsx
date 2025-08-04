import {
  DollarSign,
  Target,
  Users,
  TrendingUp,
  Award,
  Package,
  Loader2,
} from "lucide-react";
import KPICard from "@/components/dashboard/KPICard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDashboardStats } from "@/api/dashboard";

export default function Dashboard() {
  const { data: dashboardData, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
          <p className="text-destructive">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  const kpiData = dashboardData
    ? [
        {
          title: "Total Revenue",
          value: `$${dashboardData.kpis.total_revenue.value.toLocaleString()}`,
          change: `${dashboardData.kpis.total_revenue.change >= 0 ? "+" : ""}${
            dashboardData.kpis.total_revenue.change
          }%`,
          changeType:
            dashboardData.kpis.total_revenue.change >= 0
              ? ("positive" as const)
              : ("negative" as const),
          icon: <DollarSign className="w-5 h-5 text-primary" />,
          description: "vs last month",
        },
        {
          title: "Active Leads",
          value: dashboardData.kpis.active_leads.value.toString(),
          change: `${dashboardData.kpis.active_leads.change >= 0 ? "+" : ""}${
            dashboardData.kpis.active_leads.change
          }%`,
          changeType:
            dashboardData.kpis.active_leads.change >= 0
              ? ("positive" as const)
              : ("negative" as const),
          icon: <Target className="w-5 h-5 text-primary" />,
          description: "this month",
        },
        {
          title: "Total Contacts",
          value: dashboardData.kpis.total_contacts.value.toString(),
          change: `${dashboardData.kpis.total_contacts.change >= 0 ? "+" : ""}${
            dashboardData.kpis.total_contacts.change
          }%`,
          changeType:
            dashboardData.kpis.total_contacts.change >= 0
              ? ("positive" as const)
              : ("negative" as const),
          icon: <Users className="w-5 h-5 text-primary" />,
          description: "vs last month",
        },
        {
          title: "Conversion Rate",
          value: `${dashboardData.kpis.conversion_rate.value}%`,
          change: `${
            dashboardData.kpis.conversion_rate.change >= 0 ? "+" : ""
          }${dashboardData.kpis.conversion_rate.change}%`,
          changeType:
            dashboardData.kpis.conversion_rate.change >= 0
              ? ("positive" as const)
              : ("negative" as const),
          icon: <TrendingUp className="w-5 h-5 text-primary" />,
          description: "overall",
        },
      ]
    : [];

  const recentActivities = dashboardData?.recent_activities || [];
  const leadsByStage = dashboardData?.leads_by_stage || [];

  // Map stage names from backend to display format
  const stageColorMap: Record<string, string> = {
    new: "bg-blue-500",
    followUp: "bg-purple-500",
    prospect: "bg-yellow-500",
    negotiation: "bg-orange-500",
    won: "bg-green-500",
    lost: "bg-red-500",
  };

  const stageDisplayMap: Record<string, string> = {
    new: "New",
    followUp: "Follow Up",
    prospect: "Prospect",
    negotiation: "Negotiation",
    won: "Won",
    lost: "Lost",
  };
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your CRM overview.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Export Report</Button>
          <Button className="bg-gradient-primary hover:opacity-90">
            View Analytics
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Recent Activities
            </CardTitle>
            <CardDescription>Latest activities in your CRM</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No recent activities
                </p>
              ) : (
                recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold text-sm">
                          {activity.type.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {activity.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.lead_title ||
                            activity.contact_name ||
                            "No contact"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          activity.is_done
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {activity.is_done ? "Done" : "Pending"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Value */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Pipeline Value
            </CardTitle>
            <CardDescription>Total value of active leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-4xl font-bold text-primary">
                ${dashboardData?.pipeline_value.toLocaleString() || "0"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Across all active leads
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Status */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Overview</CardTitle>
          <CardDescription>Current sales pipeline status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {leadsByStage.map((stage) => (
              <div
                key={stage.stage}
                className="text-center p-4 rounded-lg border border-border"
              >
                <div
                  className={`w-12 h-12 ${
                    stageColorMap[stage.stage] || "bg-gray-500"
                  } rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold`}
                >
                  {stage.count}
                </div>
                <h3 className="font-medium text-foreground">
                  {stageDisplayMap[stage.stage] || stage.stage}
                </h3>
                <p className="text-sm text-muted-foreground">
                  ${parseFloat(stage.value).toLocaleString()}
                </p>
              </div>
            ))}
            {leadsByStage.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No pipeline data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
