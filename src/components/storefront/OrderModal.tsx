import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

interface OrderModalProps {
  product: Product | null;
  whatsappNumber: string;
  storeName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderModal({ product, whatsappNumber, storeName, open, onOpenChange }: OrderModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [variant, setVariant] = useState("");

  if (!product) return null;

  const variants = product.variants_text?.split(",").map((v) => v.trim()).filter(Boolean) ?? [];

  const handleOrder = () => {
    if (!name.trim()) { toast.error("Please enter your name"); return; }
    if (!phone.trim()) { toast.error("Please enter your phone number"); return; }

    const qty = parseInt(quantity) || 1;
    const total = qty * Number(product.price);

    const message = [
      `🛒 *New Order from AfroDuka*`,
      ``,
      `*Product:* ${product.name}`,
      variant ? `*Variant:* ${variant}` : null,
      `*Quantity:* ${qty}`,
      `*Total:* UGX ${total.toLocaleString()}`,
      ``,
      `*Customer:* ${name.trim()}`,
      `*Phone:* ${phone.trim()}`,
      notes.trim() ? `*Notes:* ${notes.trim()}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const cleanNumber = whatsappNumber.replace(/[^0-9+]/g, "");
    const waUrl = `https://wa.me/${cleanNumber.replace("+", "")}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Order — {product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full aspect-video rounded-lg object-cover"
            />
          )}

          <div className="flex items-baseline justify-between">
            <p className="text-xl font-bold text-primary">UGX {Number(product.price).toLocaleString()}</p>
            {product.description && (
              <p className="text-sm text-muted-foreground max-w-[60%] text-right">{product.description}</p>
            )}
          </div>

          {variants.length > 0 && (
            <div className="space-y-1.5">
              <Label>Select option</Label>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVariant(v)}
                    className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                      variant === v
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="orderName">Your name *</Label>
            <Input id="orderName" placeholder="e.g. John" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="orderPhone">Your phone *</Label>
            <Input id="orderPhone" type="tel" placeholder="07XX XXX XXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="orderQty">Quantity</Label>
            <Input id="orderQty" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="orderNotes">Notes (optional)</Label>
            <Textarea id="orderNotes" placeholder="Any special requests?" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <Button className="w-full gap-2 text-base" size="lg" onClick={handleOrder}>
            <MessageCircle className="h-5 w-5" />
            Order via WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
