import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download, MoreHorizontal, Building, Users, MapPin, Globe } from "lucide-react";
import AddOrganizationDialog from "@/components/forms/AddOrganizationDialog";

// Empty organizations data - ready for backend integration
const organizationsData: any[] = [];

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "prospect":
      return "bg-blue-100 text-blue-800";
    case "inactive":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "Enterprise":
      return "bg-purple-100 text-purple-800";
    case "Mid-Market":
      return "bg-orange-100 text-orange-800";
    case "SMB":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function Organizations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [organizations] = useState(organizationsData);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = organizations.reduce((sum, org) => {
    const revenue = parseFloat(org.revenue.replace(/[$M]/g, ''));
    return sum + revenue;
  }, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Organizations</h1>
          <p className="text-muted-foreground">Manage your business relationships and accounts</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="bg-gradient-primary hover:opacity-90" onClick={() => setDialogOpen(true)}>
            Add Organization
          </Button>
        </div>
      </div>

      <AddOrganizationDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={() => {}} />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search organizations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{organizations.length}</p>
                <p className="text-sm text-muted-foreground">Total Organizations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{organizations.filter(o => o.status === 'active').length}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{organizations.reduce((sum, o) => sum + o.contacts, 0)}</p>
                <p className="text-sm text-muted-foreground">Total Contacts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Globe className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">${totalRevenue.toFixed(1)}M</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organizations Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrganizations.map((org) => (
              <div key={org.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-semibold text-lg">
                    {org.name.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">{org.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{org.industry}</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{org.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{org.employees.toLocaleString()} employees</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{org.revenue}</p>
                    <p className="text-sm text-muted-foreground">{org.contacts} contacts</p>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Badge className={getStatusColor(org.status)}>
                      {org.status}
                    </Badge>
                    <Badge className={getTypeColor(org.type)}>
                      {org.type}
                    </Badge>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredOrganizations.length === 0 && (
            <div className="text-center py-12">
              <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No organizations found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first organization'}
              </p>
              <Button className="bg-gradient-primary hover:opacity-90">
                Add Organization
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}