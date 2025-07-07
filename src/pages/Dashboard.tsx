import { DollarSign, Target, Users, TrendingUp, Award, Package } from "lucide-react";
import KPICard from "@/components/dashboard/KPICard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Empty data - ready for backend integration
const kpiData = [
  {
    title: "Total Revenue",
    value: "$0",
    change: "0%",
    changeType: "positive" as const,
    icon: <DollarSign className="w-5 h-5 text-primary" />,
    description: "vs last month"
  },
  {
    title: "Active Leads",
    value: "0",
    change: "0%",
    changeType: "positive" as const,
    icon: <Target className="w-5 h-5 text-primary" />,
    description: "this month"
  },
  {
    title: "New Contacts",
    value: "0",
    change: "0%",
    changeType: "positive" as const,
    icon: <Users className="w-5 h-5 text-primary" />,
    description: "vs last month"
  },
  {
    title: "Conversion Rate",
    value: "0%",
    change: "0%",
    changeType: "positive" as const,
    icon: <TrendingUp className="w-5 h-5 text-primary" />,
    description: "overall"
  }
];

const recentLeads: any[] = [];

const topPerformers: any[] = [];

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your CRM overview.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            Export Report
          </Button>
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
        {/* Recent Leads */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Recent Leads
            </CardTitle>
            <CardDescription>Latest leads in your pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">
                        {lead.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">{lead.contact}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{lead.value}</p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        lead.stage === 'New' ? 'bg-blue-100 text-blue-800' :
                        lead.stage === 'Prospect' ? 'bg-yellow-100 text-yellow-800' :
                        lead.stage === 'Negotiation' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {lead.stage}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${
                        lead.priority === 'high' ? 'bg-red-500' :
                        lead.priority === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Top Performers
            </CardTitle>
            <CardDescription>This month's best performers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((performer, index) => (
                <div key={performer.name} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{performer.name}</p>
                    <p className="text-sm text-muted-foreground">{performer.deals} deals</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{performer.revenue}</p>
                  </div>
                </div>
              ))}
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
            {[
              { stage: "New", count: 0, value: "$0", color: "bg-blue-500" },
              { stage: "Prospect", count: 0, value: "$0", color: "bg-yellow-500" },
              { stage: "Negotiation", count: 0, value: "$0", color: "bg-orange-500" },
              { stage: "Won", count: 0, value: "$0", color: "bg-green-500" },
              { stage: "Lost", count: 0, value: "$0", color: "bg-red-500" },
            ].map((stage) => (
              <div key={stage.stage} className="text-center p-4 rounded-lg border border-border">
                <div className={`w-12 h-12 ${stage.color} rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold`}>
                  {stage.count}
                </div>
                <h3 className="font-medium text-foreground">{stage.stage}</h3>
                <p className="text-sm text-muted-foreground">{stage.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}