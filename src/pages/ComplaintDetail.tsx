import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CitizenNavbar from "@/components/CitizenNavbar";
import AdminNavbar from "@/components/AdminNavbar";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Paperclip, Calendar, MessageSquare, Send } from "lucide-react";
import { CATEGORY_LABELS, STATUS_LABELS, DEPARTMENTS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import type { Tables, Enums } from "@/integrations/supabase/types";

const ComplaintDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, role } = useAuth();
  const { toast } = useToast();
  const isAdmin = role === "admin";

  const [complaint, setComplaint] = useState<Tables<"complaints"> | null>(null);
  const [comments, setComments] = useState<(Tables<"complaint_comments"> & { profiles?: { full_name: string } | null })[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Admin update fields
  const [status, setStatus] = useState<Enums<"complaint_status">>("pending");
  const [department, setDepartment] = useState("");
  const [officer, setOfficer] = useState("");

  const fetchData = async () => {
    if (!id) return;
    const { data: comp } = await supabase.from("complaints").select("*").eq("id", id).single();
    if (comp) {
      setComplaint(comp);
      setStatus(comp.status);
      setDepartment(comp.assigned_department || "");
      setOfficer(comp.assigned_officer || "");
    }

    const { data: comms } = await supabase
      .from("complaint_comments")
      .select("*, profiles:user_id(full_name)")
      .eq("complaint_id", id)
      .order("created_at", { ascending: true });
    setComments((comms as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !user || !id) return;
    const { error } = await supabase.from("complaint_comments").insert({
      complaint_id: id,
      user_id: user.id,
      comment: newComment.trim(),
      is_internal: false,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setNewComment("");
      fetchData();
    }
  };

  const handleUpdateComplaint = async () => {
    if (!id) return;
    setUpdating(true);
    const { error } = await supabase.from("complaints").update({
      status,
      assigned_department: department || null,
      assigned_officer: officer || null,
    }).eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Complaint updated" });
      fetchData();
    }
    setUpdating(false);
  };

  const Navbar = isAdmin ? AdminNavbar : CitizenNavbar;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center py-20 text-muted-foreground">Complaint not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to={isAdmin ? "/admin" : "/dashboard"} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6 animate-fade-in">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <code className="text-sm font-mono text-secondary bg-secondary/10 px-2 py-0.5 rounded">{complaint.ticket_id}</code>
                  <StatusBadge status={complaint.status} />
                </div>
                <CardTitle className="font-display text-xl">{complaint.subject}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Category</span>
                    <p className="font-medium">{CATEGORY_LABELS[complaint.category]}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Filed On</span>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {complaint.assigned_department && (
                    <div>
                      <span className="text-muted-foreground">Department</span>
                      <p className="font-medium">{complaint.assigned_department}</p>
                    </div>
                  )}
                  {complaint.assigned_officer && (
                    <div>
                      <span className="text-muted-foreground">Assigned Officer</span>
                      <p className="font-medium">{complaint.assigned_officer}</p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{complaint.description}</p>
                </div>

                {complaint.attachment_url && (
                  <div className="border-t pt-4">
                    <button
                      onClick={async () => {
                        const { data, error } = await supabase.storage
                          .from("attachments")
                          .createSignedUrl(complaint.attachment_url!, 3600);
                        if (data?.signedUrl) {
                          window.open(data.signedUrl, "_blank");
                        } else {
                          toast({ title: "Error", description: "Could not load attachment", variant: "destructive" });
                        }
                      }}
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Paperclip className="h-4 w-4" />
                      {complaint.attachment_name || "View Attachment"}
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Citizen resolve action */}
            {!isAdmin && complaint.user_id === user?.id && complaint.status !== "resolved" && (
              <Card className="shadow-card">
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-4">
                  <div>
                    <p className="font-medium text-sm">Issue resolved?</p>
                    <p className="text-xs text-muted-foreground">Mark this complaint as resolved if your issue has been addressed.</p>
                  </div>
                  <Button
                    onClick={async () => {
                      const { error } = await supabase.from("complaints").update({ status: "resolved" }).eq("id", complaint.id);
                      if (error) {
                        toast({ title: "Could not mark resolved", description: error.message, variant: "destructive" });
                      } else {
                        toast({ title: "Marked as resolved", description: "Thank you for confirming." });
                        fetchData();
                      }
                    }}
                  >
                    Mark as Resolved
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Comments */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" /> Comments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
                ) : (
                  <div className="space-y-3">
                    {comments.map((c) => (
                      <div key={c.id} className="bg-muted rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{(c as any).profiles?.full_name || "User"}</span>
                          <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-sm">{c.comment}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                    className="flex-1"
                  />
                  <Button size="icon" onClick={handleAddComment} disabled={!newComment.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Admin controls */}
          {isAdmin && (
            <div className="space-y-6 animate-slide-in-right">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Update Complaint</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as Enums<"complaint_status">)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Forward to Department</Label>
                    <Select value={department} onValueChange={setDepartment}>
                      <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Assigned Officer</Label>
                    <Input
                      placeholder="Officer name"
                      value={officer}
                      onChange={(e) => setOfficer(e.target.value)}
                    />
                  </div>

                  <Button className="w-full" onClick={handleUpdateComplaint} disabled={updating}>
                    {updating ? "Updating..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ComplaintDetail;
