import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/importUtils";
import { useAuth } from "@/hooks/useAuth";

export default function SupplierPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: supplier } = await supabase.from("suppliers" as any).select("id").eq("user_id", user.id).single();
      if (!supplier) return;
      const { data } = await supabase.from("supplier_payments" as any).select("*, profiles:buyer_id(first_name, store_name)").eq("supplier_id", supplier.id).order("created_at", { ascending: false });
      setPayments((data as any[]) || []);
    })();
  }, [user]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Payments received</h1>
        <p className="text-sm text-muted-foreground">Funds held by Afristall and settlement status.</p>
      </div>
      <div className="space-y-3">
        {payments.map((payment) => (
          <Card key={payment.id}>
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold">{formatMoney(Number(payment.amount_foreign), payment.currency)}</p>
                <p className="text-sm text-muted-foreground">{payment.profiles?.store_name || payment.profiles?.first_name || "Buyer"} - {new Date(payment.created_at).toLocaleDateString()}</p>
              </div>
              <Badge variant="outline">{payment.status}</Badge>
            </CardContent>
          </Card>
        ))}
        {payments.length === 0 && <p className="rounded-xl border p-6 text-center text-sm text-muted-foreground">No supplier payments yet.</p>}
      </div>
    </div>
  );
}
