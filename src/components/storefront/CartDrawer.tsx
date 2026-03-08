import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/currency";
import { Minus, Plus, Trash2, MessageCircle, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CartDrawerProps {
  currency: string;
  whatsappNumber: string;
  storeName: string;
  storeSlug: string;
  sellerId: string;
  visitorName: string | null;
}

export function CartDrawer({ currency, whatsappNumber, storeName, storeSlug, sellerId, visitorName }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isOpen, setIsOpen } = useCart();
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const handleCheckout = async () => {
    if (items.length === 0) return;

    const cleanNumber = (whatsappNumber ?? "").replace(/[^0-9+]/g, "").replace("+", "");

    // Build consolidated message
    const lines = [
      `Hello, I would like to order:`,
      ``,
    ];

    items.forEach((item, i) => {
      const price = item.product.discount_price ?? item.product.price;
      const subtotal = Number(price) * item.quantity;
      lines.push(`${i + 1}. *${item.product.name}*${item.variant ? ` (${item.variant})` : ""}`);
      lines.push(`   Qty: ${item.quantity} × ${formatPrice(Number(price), currency)} = ${formatPrice(subtotal, currency)}`);
      lines.push(`   ${buildShareUrl(storeSlug, item.product.id)}`);
    });

    lines.push(``);
    lines.push(`💰 *Total: ${formatPrice(totalPrice, currency)}*`);
    if (deliveryAddress.trim()) {
      lines.push(``, `📍 *Delivery address:* ${deliveryAddress.trim()}`);
    }

    // Log orders to database
    for (const item of items) {
      const price = item.product.discount_price ?? item.product.price;
      try {
        await supabase.from("orders").insert({
          seller_id: sellerId,
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          total: Number(price) * item.quantity,
          customer_name: visitorName || "Store visitor",
          customer_phone: visitorName || "WhatsApp order",
          variant: item.variant || null,
          delivery_address: deliveryAddress.trim() || null,
        } as any);
        supabase.rpc("increment_whatsapp_taps", { p_id: item.product.id }).then(() => {});
      } catch {
        // Don't block checkout
      }
    }

    const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(waUrl, "_blank");
    clearCart();
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating cart button */}
      {totalItems > 0 && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="font-semibold">{totalItems}</span>
          <span className="text-sm">· {formatPrice(totalPrice, currency)}</span>
        </button>
      )}

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="flex flex-col w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Your Cart ({totalItems})
            </SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/40" />
              <p className="text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-3 py-4">
                {items.map((item) => {
                  const price = item.product.discount_price ?? item.product.price;
                  return (
                    <div key={item.product.id} className="flex gap-3 rounded-xl border border-border/50 bg-card/60 p-3">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.product.name}
                          className="h-16 w-16 rounded-lg object-cover shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="font-semibold text-sm truncate">{item.product.name}</p>
                        {item.variant && (
                          <p className="text-xs text-muted-foreground">{item.variant}</p>
                        )}
                        <p className="text-sm font-bold text-primary">
                          {formatPrice(Number(price) * item.quantity, currency)}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cartDeliveryAddr" className="text-sm font-medium">Delivery address (optional)</Label>
                  <Textarea
                    id="cartDeliveryAddr"
                    placeholder="Where should we deliver?"
                    rows={2}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(totalPrice, currency)}</span>
                </div>
                <Button className="w-full gap-2 text-base" size="lg" onClick={handleCheckout}>
                  <MessageCircle className="h-5 w-5" />
                  Order All via WhatsApp
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
