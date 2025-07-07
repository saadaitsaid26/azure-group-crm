import { Settings as SettingsIcon, Users, Shield, GitBranch, Database, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function Settings() {
  const settingsCategories = [
    {
      title: "User Management",
      description: "Manage users and permissions",
      icon: Users,
      href: "/admin/users",
      adminOnly: true,
    },
    {
      title: "Roles & Permissions",
      description: "Configure user roles",
      icon: Shield,
      href: "/admin/roles",
      adminOnly: true,
    },
    {
      title: "Pipelines",
      description: "Customize sales pipelines",
      icon: GitBranch,
      href: "/admin/pipelines",
      adminOnly: true,
    },
    {
      title: "Sources",
      description: "Manage lead sources",
      icon: Database,
      href: "/admin/sources",
      adminOnly: true,
    },
    {
      title: "Types & Categories",
      description: "Configure activity types",
      icon: Tag,
      href: "/admin/types",
      adminOnly: true,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage system configuration and preferences</p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsCategories.map((category) => (
          <Link key={category.title} to={category.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <category.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
