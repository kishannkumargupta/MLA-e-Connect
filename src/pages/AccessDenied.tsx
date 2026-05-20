import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const AccessDenied = () => {
  const { user, role } = useAuth();
  const dashboardPath = role === "admin" ? "/admin" : "/dashboard";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-3">Access Denied</h1>
        <p className="text-muted-foreground mb-8">
          You don't have permission to access this page. This area is restricted to authorized personnel only.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {user ? (
            <Link to={dashboardPath}>
              <Button>Go to Dashboard</Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button>Sign In</Button>
            </Link>
          )}
          <Link to="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
