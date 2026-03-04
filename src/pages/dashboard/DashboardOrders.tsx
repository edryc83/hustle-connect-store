import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClipboardList, Phone, MessageCircle, Plus } from "lucide-react";
import { formatPrice } from "@/lib/currency";
import { toast } from "sonner";

type Order = {
  id: string;
  product_name: string;
  quantity: number;
  total: number;
  customer_name: string;
  customer_phone: string;
  variant: string | null;
  notes: string | null;
  status: string;
  created_at: string;
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-yellow-500/10 text-yellow-700 border-yellow-300" },
  { value: "confirmed", label: "Confirmed", color: "bg-blue-500/10 text-blue-700 border-blue-300" },
  { value: "delivered", label: "Delivered", color: "bg-green-500/10 text-green-700 border-green-300" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-500/10 text-red-700 border-red-300" },
];

const DashboardOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("UGX");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formProduct, setFormProduct] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formStatus, setFormStatus] = useState("pending");

  const fetchOrders = async () => {
    if (!user) return;
    const [{ data }, { data: profile }] = await Promise.all([
      supabase
        .from("orders")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("currency").eq("id", user.id).single(),
    ]);
    setOrders((data as any) ?? []);
    setCurrency((profile as any)?.currency ?? "UGX");
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus } as any)
      .eq("id", orderId);
    if (error) {
      toast.error("Failed to update status");
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success("Status updated");
    }
  };

  const getStatusStyle = (status: string) =>
    STATUS_OPTIONS.find((s) => s.value === status)?.color ?? "";

  const openWhatsApp = (phone: string) => {
    const clean = phone.replace(/[^0-9+]/g, "").replace("+", "");
    window.open(`https://wa.me/${clean}`, "_blank");
  };

  const resetForm = () => {
    setFormName(""); setFormPhone(""); setFormProduct(""); setFormAmount(""); setFormNotes(""); setFormStatus("pending");
  };

  const handleAddOrder = async () => {
    if (!formName.trim()) { toast.error("Customer name is required"); return; }
    if (!formPhone.trim()) { toast.error("Customer phone is required"); return; }
    if (!user) return;

    setSaving(true);
    const { error, data } = await supabase.from("orders").insert({
      seller_id: user.id,
      customer_name: formName.trim(),
      customer_phone: formPhone.trim(),
      product_name: formProduct.trim() || "Manual order",
      total: parseFloat(formAmount) || 0,
      quantity: 1,
      notes: formNotes.trim() || null,
      status: formStatus,
    } as any).select().single();

    setSaving(false);
    if (error) {
      toast.error("Failed to add order");
    } else {
      setOrders((prev) => [data as any, ...prev]);
      toast.success("Order added");
      setModalOpen(false);
      resetForm();
    }
  };

  if (loading) {
    return <div className="animate-pulse text-muted-foreground py-12 text-center">Loading orders…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">
          {orders.length} order{orders.length !== 1 ? "s" : ""} — auto-logged when buyers click "Order via WhatsApp"
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl py-16">
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium">No orders yet</p>
            <p className="text-sm text-muted-foreground">Orders will appear here when buyers place them from your storefront.</p>
          </CardContent>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{order.product_name}</p>
                      {order.variant && (
                        <Badge variant="outline" className="text-xs">{order.variant}</Badge>
                      )}
                      <Badge className={`text-xs border ${getStatusStyle(order.status)}`}>
                        {STATUS_OPTIONS.find((s) => s.value === order.status)?.label ?? order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Qty: {order.quantity} · {formatPrice(Number(order.total), currency)}
                    </p>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-medium">{order.customer_name}</span>
                      <button
                        onClick={() => openWhatsApp(order.customer_phone)}
                        className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                      >
                        <Phone className="h-3 w-3" />
                        {order.customer_phone}
                      </button>
                    </div>
                    {order.notes && (
                      <p className="text-xs text-muted-foreground italic">"{order.notes}"</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Select value={order.status} onValueChange={(val) => updateStatus(order.id, val)}>
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => openWhatsApp(order.customer_phone)}>
                      <MessageCircle className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </div>
          ))}
        </div>
      )}

      {/* Floating Add Button */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors md:bottom-8"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Add Order Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log an Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Customer name *</Label>
              <Input placeholder="e.g. John" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Customer phone *</Label>
              <Input type="tel" placeholder="07XX XXX XXX" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Product name</Label>
              <Input placeholder="e.g. Nike Air Max" value={formProduct} onChange={(e) => setFormProduct(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Amount</Label>
              <Input type="number" placeholder="0" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea rows={2} placeholder="Any notes…" value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={formStatus} onValueChange={setFormStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full rounded-xl" onClick={handleAddOrder} disabled={saving}>
              {saving ? "Saving…" : "Add Order"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardOrders;
