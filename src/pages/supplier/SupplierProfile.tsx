import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function SupplierProfile() {
  const { user } = useAuth();
  const [supplier, setSupplier] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("suppliers" as any).select("*").eq("user_id", user.id).single().then(({ data }) => setSupplier(data));
  }, [user]);

  const save = async () => {
    const { error } = await supabase.from("suppliers" as any).update({
      business_name: supplier.business_name,
      logo_url: supplier.logo_url || null,
      bio: supplier.bio || null,
      whatsapp: supplier.whatsapp || null,
      lead_time_days: supplier.lead_time_days ? Number(supplier.lead_time_days) : null,
      updated_at: new Date().toISOString(),
    }).eq("id", supplier.id);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  };

  if (!supplier) return <div className="text-muted-foreground">Loading profile...</div>;

  return (
    <div className="max-w-xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">{supplier.supplier_code} - {supplier.country}</p>
      </div>
      <div className="space-y-3 rounded-xl border bg-card p-4">
        <div className="space-y-1.5"><Label>Business name</Label><Input value={supplier.business_name || ""} onChange={(e) => setSupplier({ ...supplier, business_name: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Logo URL</Label><Input value={supplier.logo_url || ""} onChange={(e) => setSupplier({ ...supplier, logo_url: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>WhatsApp</Label><Input value={supplier.whatsapp || ""} onChange={(e) => setSupplier({ ...supplier, whatsapp: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Default lead time days</Label><Input inputMode="numeric" value={supplier.lead_time_days || ""} onChange={(e) => setSupplier({ ...supplier, lead_time_days: e.target.value.replace(/\D/g, "") })} /></div>
        <div className="space-y-1.5"><Label>Bio</Label><Textarea rows={4} value={supplier.bio || ""} onChange={(e) => setSupplier({ ...supplier, bio: e.target.value })} /></div>
        <Button onClick={save}>Save profile</Button>
      </div>
    </div>
  );
}
