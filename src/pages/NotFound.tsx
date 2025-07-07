import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Building } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="max-w-md w-full">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">404 - Page Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The page you're looking for doesn't exist. Navigate using the sidebar to explore the CRM features.
          </p>
          <a 
            href="/" 
            className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;