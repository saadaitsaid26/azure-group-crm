import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import Layout from "@/components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Contacts from "./pages/Contacts";
import Organizations from "./pages/Organizations";
import Activities from "./pages/Activities";
import Quotes from "./pages/Quotes";
import Products from "./pages/Products";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminRoles from "./pages/admin/Roles";
import AdminPipelines from "./pages/admin/Pipelines";
import AdminSources from "./pages/admin/Sources";
import AdminTypes from "./pages/admin/Types";
import NotFound from "./pages/NotFound";

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            <Routes>
              {/* Login Route - No Layout */}
              <Route path="/login" element={<Login />} />

              {/* Main App Routes with Layout - Protected */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="leads" element={<Leads />} />
                <Route path="contacts" element={<Contacts />} />
                <Route path="organizations" element={<Organizations />} />
                <Route path="activities" element={<Activities />} />
                <Route path="quotes" element={<Quotes />} />
                <Route path="products" element={<Products />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />

                {/* Admin Routes - Admin Only */}
                <Route
                  path="admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="admin/users"
                  element={
                    <AdminRoute>
                      <AdminUsers />
                    </AdminRoute>
                  }
                />
                <Route
                  path="admin/roles"
                  element={
                    <AdminRoute>
                      <AdminRoles />
                    </AdminRoute>
                  }
                />
                <Route
                  path="admin/pipelines"
                  element={
                    <AdminRoute>
                      <AdminPipelines />
                    </AdminRoute>
                  }
                />
                <Route
                  path="admin/sources"
                  element={
                    <AdminRoute>
                      <AdminSources />
                    </AdminRoute>
                  }
                />
                <Route
                  path="admin/types"
                  element={
                    <AdminRoute>
                      <AdminTypes />
                    </AdminRoute>
                  }
                />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
