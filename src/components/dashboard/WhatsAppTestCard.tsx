import { ExternalLink } from "lucide-react";
import whatsappIcon from "@/assets/whatsapp-icon.png";
import { Button } from "@/components/ui/button";

interface WhatsAppTestCardProps {
  whatsappNumber: string;
  storeName: string;
  storeSlug?: string;
}

export default function WhatsAppTestCard({ whatsappNumber, storeName, storeSlug }: WhatsAppTestCardProps) {
  if (!whatsappNumber) return null;

  const cleanNumber = whatsappNumber.replace(/[^0-9+]/g, "").replace(/^\+/, "");
  const storeUrl = storeSlug
    ? `${window.location.origin}/${storeSlug}`
    : window.location.origin;
  const testMessage = encodeURIComponent(
    `🛍️ Check out ${storeName || "my store"} on Afristall — order directly on WhatsApp!\n${storeUrl}`
  );
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${testMessage}`;

  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-500/10">
          <MessageCircle className="h-4 w-4 text-green-600" />
        </div>
        <span className="text-sm font-semibold text-foreground">Test Your WhatsApp</span>
      </div>
      <p className="text-xs text-muted-foreground">
        See what buyers experience when they tap "Order on WhatsApp" in your store.
      </p>
      <Button
        variant="outline"
        className="w-full rounded-xl border-green-500/30 hover:bg-green-500/10 text-green-700 dark:text-green-400 gap-2"
        onClick={() => window.open(whatsappUrl, "_blank")}
      >
        <ExternalLink className="h-4 w-4" />
        Open WhatsApp Preview
      </Button>
    </div>
  );
}
