import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CitizenNavbar from "@/components/CitizenNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CATEGORY_LABELS } from "@/lib/constants";
import type { Enums } from "@/integrations/supabase/types";

const SubmitComplaint = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ subject: "", description: "", category: "" as Enums<"complaint_category"> | "" });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (f.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Max 5MB", variant: "destructive" });
        return;
      }
      setFile(f);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.category) return;
    setLoading(true);

    try {
      let attachmentUrl: string | null = null;
      let attachmentName: string | null = null;

      if (file) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("attachments").upload(path, file);
        if (uploadError) throw uploadError;
        // Store the path, not the public URL (bucket is private)
        attachmentUrl = path;
        attachmentName = file.name;
      }

      const { data, error } = await supabase
        .from("complaints")
        .insert({
          user_id: user.id,
          subject: form.subject.trim(),
          description: form.description.trim(),
          category: form.category,
          ticket_id: "placeholder", // Will be overwritten by trigger
          attachment_url: attachmentUrl,
          attachment_name: attachmentName,
        })
        .select("ticket_id")
        .single();

      if (error) throw error;
      setTicketId(data.ticket_id);
      toast({ title: "Complaint submitted!", description: `Ticket ID: ${data.ticket_id}` });
    } catch (error: any) {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (ticketId) {
    return (
      <div className="min-h-screen bg-background">
        <CitizenNavbar />
        <main className="container mx-auto px-4 py-16 text-center animate-fade-in">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">Complaint Submitted!</h1>
            <p className="text-muted-foreground mb-6">Your complaint has been received and will be reviewed shortly.</p>
            <div className="bg-muted rounded-lg p-4 mb-8">
              <p className="text-sm text-muted-foreground mb-1">Your Ticket ID</p>
              <p className="text-2xl font-mono font-bold text-primary">{ticketId}</p>
              <p className="text-xs text-muted-foreground mt-1">Save this ID to track your complaint</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate("/dashboard")}>View My Complaints</Button>
              <Button variant="outline" onClick={() => { setTicketId(null); setForm({ subject: "", description: "", category: "" }); setFile(null); }}>
                Submit Another
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CitizenNavbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto animate-fade-in">
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle className="font-display text-xl">Submit a Complaint</CardTitle>
              <CardDescription>Fill in the details below. All fields marked * are required.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={form.category} onValueChange={(val) => setForm((p) => ({ ...p, category: val as Enums<"complaint_category"> }))}>
                    <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="Brief title for your complaint"
                    value={form.subject}
                    onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                    maxLength={200}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your issue in detail..."
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    rows={5}
                    maxLength={2000}
                    required
                  />
                  <p className="text-xs text-muted-foreground text-right">{form.description.length}/2000</p>
                </div>

                <div className="space-y-2">
                  <Label>Attachment (optional)</Label>
                  <p className="text-xs text-muted-foreground">Upload an image or PDF (max 5MB)</p>
                  {file ? (
                    <div className="flex items-center gap-2 bg-muted rounded-lg p-3">
                      <span className="text-sm truncate flex-1">{file.name}</span>
                      <button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }}>
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="w-full border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors"
                    >
                      <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload</p>
                    </button>
                  )}
                  <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
                </div>

                <Button type="submit" className="w-full" disabled={loading || !form.category}>
                  {loading ? "Submitting..." : "Submit Complaint"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SubmitComplaint;
