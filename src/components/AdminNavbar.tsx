import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Shield, Menu, X } from "lucide-react";
import { useState } from "react";

const AdminNavbar = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="bg-gradient-primary text-primary-foreground sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
            <Shield className="h-4 w-4 text-secondary-foreground" />
          </div>
          <span className="font-display font-bold text-lg">MLA e-Connect Admin</span>
        </Link>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/admin" className="text-sm font-medium opacity-80 hover:opacity-100 transition-opacity">
            All Complaints
          </Link>
          <div className="h-6 w-px bg-primary-foreground/20" />
          <span className="text-sm opacity-80">{profile?.full_name}</span>
          <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-1" /> Logout
          </Button>
        </div>

        <button className="md:hidden text-primary-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-primary-foreground/10 px-4 py-3 space-y-2 animate-fade-in">
          <Link to="/admin" className="block py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>All Complaints</Link>
          <div className="pt-2 border-t border-primary-foreground/10">
            <Button variant="ghost" size="sm" className="w-full justify-start text-primary-foreground hover:bg-primary-foreground/10" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default AdminNavbar;
