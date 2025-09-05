import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Target,
  Activity,
  FileText,
  Package,
  Settings,
  ChevronRight,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Leads", href: "/leads", icon: Target },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Organizations", href: "/organizations", icon: Building2 },
  { name: "Activities", href: "/activities", icon: Activity },
  { name: "Quotes", href: "/quotes", icon: FileText },
  { name: "Products", href: "/products", icon: Package },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  return (
    <div
      className={cn(
        "bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col h-screen",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AG</span>
              </div>
              <div>
                <h1 className="font-semibold text-sidebar-foreground">
                  Azure Group
                </h1>
                <p className="text-xs text-sidebar-foreground/60">CRM System</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 hover:bg-sidebar-accent rounded-md transition-colors"
          >
            <ChevronRight
              className={cn(
                "w-4 h-4 text-sidebar-foreground transition-transform",
                collapsed ? "rotate-0" : "rotate-180"
              )}
            />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "sidebar-nav",
                isActive && "active",
                collapsed && "collapsed"
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          );
        })}

        {/* Admin Link */}
        {isAdmin && (
          <Link
            to="/admin"
            className={cn(
              "sidebar-nav",
              location.pathname.startsWith("/admin") && "active",
              collapsed && "collapsed"
            )}
            title={collapsed ? "Admin Panel" : undefined}
          >
            <Shield className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">Admin Panel</span>}
          </Link>
        )}
      </nav>
    </div>
  );
}
