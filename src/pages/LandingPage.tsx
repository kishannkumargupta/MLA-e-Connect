import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Shield, ArrowRight, CheckCircle, Clock, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const LandingPage = () => {
  const { user, role } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center">
              <FileText className="h-5 w-5 text-secondary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">MLA e-Connect</span>
          </div>
          <div className="flex gap-2">
            {user ? (
              <Link to={role === "admin" ? "/admin" : "/dashboard"}>
                <Button variant="secondary" size="sm">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="secondary" size="sm">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-28 text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Your Voice Matters.<br />
            <span className="opacity-90">Connect with Your MLA.</span>
          </h1>
          <p className="text-lg md:text-xl opacity-80 max-w-2xl mx-auto mb-10">
            Submit complaints and service requests directly to your MLA office. Track progress in real-time until your issue is resolved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="text-base px-8">
                Submit a Complaint <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="ghost" className="text-base px-8 text-primary-foreground border border-primary-foreground/30 hover:bg-primary-foreground/10">
                Track Your Complaint
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            A simple three-step process to get your grievance addressed
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: FileText, title: "Submit", desc: "Fill out a simple form describing your issue. Attach documents if needed.", step: "1" },
              { icon: Clock, title: "Track", desc: "Get a unique ticket ID and track your complaint status in real-time.", step: "2" },
              { icon: CheckCircle, title: "Resolve", desc: "MLA office reviews, forwards to the right department, and resolves your issue.", step: "3" },
            ].map((item) => (
              <div key={item.step} className="text-center p-6 rounded-xl bg-card shadow-card border animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Step {item.step}</div>
                <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Shield className="h-4 w-4" /> MLA Office Staff
          </div>
          <h2 className="font-display text-2xl font-bold mb-3">Office Admin Portal</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Authorized staff can manage citizen complaints, update statuses, and coordinate with departments.
          </p>
          <Link to="/admin-login">
            <Button variant="outline" size="lg">
              <Shield className="mr-2 h-4 w-4" /> Staff Login
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MLA e-Connect. Empowering citizens through digital governance.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
