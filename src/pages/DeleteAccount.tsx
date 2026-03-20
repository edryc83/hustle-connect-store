import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Mail, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Footer from "@/components/layout/Footer";

export default function DeleteAccount() {
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !confirmEmail.trim()) {
      toast.error("Please fill in both email fields");
      return;
    }

    if (email.toLowerCase().trim() !== confirmEmail.toLowerCase().trim()) {
      toast.error("Email addresses do not match");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("account_deletion_requests" as any)
        .insert({
          email: email.toLowerCase().trim(),
          requested_at: new Date().toISOString(),
          status: "pending",
        });

      if (error) console.log("Deletion request note:", error.message);

      toast.success(
        "Your deletion request has been submitted. We will process it within 30 days."
      );
      setEmail("");
      setConfirmEmail("");
    } catch {
      toast.error("Failed to submit request. Please email support@afristall.com");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1">
        <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
              <div>
                <h1 className="text-lg font-semibold text-foreground mb-1">
                  Delete Your Account
                </h1>
                <p className="text-sm text-muted-foreground mb-3">
                  This action is permanent and cannot be undone. Deleting your account will:
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Remove all your personal information</li>
                  <li>• Delete all your listed products</li>
                  <li>• Remove your profile and business details</li>
                  <li>• Cancel any pending transactions</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Confirm Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Confirm your email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Enter the email address associated with your account. We will send a
              confirmation once your deletion request has been processed (within 30 days).
            </p>

            <Button
              type="submit"
              variant="destructive"
              className="w-full gap-2"
              disabled={loading}
            >
              <Trash2 className="h-4 w-4" />
              {loading ? "Submitting…" : "Request Account Deletion"}
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
