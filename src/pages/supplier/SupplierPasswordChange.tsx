import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SupplierPasswordChange() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (password.length < 8) {
      toast.error("Use at least 8 characters");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      password,
      data: { force_password_change: false },
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Password updated");
      navigate("/supplier", { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6">
        <h1 className="text-lg font-bold">Set a new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your temporary supplier password must be changed before continuing.</p>
        <div className="mt-5 space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && save()} />
        </div>
        <Button className="mt-4 w-full" disabled={saving} onClick={save}>{saving ? "Saving..." : "Continue"}</Button>
      </div>
    </div>
  );
}
