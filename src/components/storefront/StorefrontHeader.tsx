import { MapPin, MessageCircle, Share2 } from "lucide-react";
import AfristallLogo from "@/components/AfristallLogo";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

/** Extract only the top-level / main category (before any ">" or sub-items) */
function mainCategory(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    // Handle JSON-encoded strings like '{"Phones & Electronics":[]}'
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      const keys = Object.keys(parsed);
      return keys[0] || null;
    }
  } catch {
    // Not JSON — treat as plain comma-separated
  }
  const first = raw.split(",")[0]?.trim();
  if (!first) return null;
  return first.split(">")[0]?.trim() || first;
}

interface StorefrontHeaderProps {
  profile: Profile;
  visitorName: string | null;
}

export function StorefrontHeader({ profile, visitorName }: StorefrontHeaderProps) {
  const coverUrl = (profile as any).cover_photo_url;
  const ig = (profile as any).instagram_url;
  const tt = (profile as any).tiktok_url;
  const mainCat = mainCategory(profile.category);

  // Physical address parts
  const addressParts = [
    (profile as any).shop_number,
    (profile as any).building,
    (profile as any).street,
  ].filter(Boolean);
  const hasPhysicalAddress = !(profile as any).is_online_only && addressParts.length > 0;

  return (
    <header className="bg-background relative">

      {/* Cover Photo */}
      <div className="h-36 sm:h-48 bg-gradient-to-br from-primary/15 via-primary/5 to-accent/10 overflow-hidden">
        {coverUrl ? (
          <img src={coverUrl} alt="" className="w-full h-full object-cover" />
        ) : null}
      </div>

      <div className="mx-auto max-w-5xl px-4 -mt-12 pb-5 flex flex-col items-center text-center gap-2.5">
        {/* Profile Picture */}
        {profile.profile_picture_url ? (
          <img
            src={profile.profile_picture_url}
            alt={profile.store_name ?? "Store"}
            className="h-24 w-24 rounded-full object-cover border-4 border-background shadow-lg"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 border-4 border-background shadow-lg">
            <AfristallLogo className="h-10 w-10" />
          </div>
        )}

        {/* Store Name + slug */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{profile.store_name}</h1>
          {profile.store_slug && (
            <p className="text-sm text-muted-foreground">@{profile.store_slug}</p>
          )}
        </div>

        {/* Main category + City — compact row */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          {mainCat && (
            <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
              {mainCat}
            </span>
          )}
          {profile.city && (
            <span className="flex items-center gap-1 text-muted-foreground text-xs">
              <MapPin className="h-3 w-3" /> {profile.city}
            </span>
          )}
        </div>

        {/* Physical shop location */}
        {hasPhysicalAddress && (
          <p className="text-xs text-muted-foreground">
            📍 {addressParts.join(", ")}
          </p>
        )}

        {(profile as any).is_online_only && (
          <p className="text-xs text-muted-foreground">🌐 Online Store</p>
        )}

        {/* Delivery Areas */}
        {(profile as any).delivery_areas && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>Delivers to: {(profile as any).delivery_areas}</span>
          </div>
        )}

        {/* Bio */}
        {profile.store_bio && (
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            {profile.store_bio}
          </p>
        )}

        {/* Message Button + Social Icons — inline row */}
        <div className="flex items-center justify-center gap-2.5 max-w-sm mx-auto pt-1">
          {profile.whatsapp_number && (
            <Button
              size="lg"
              className="flex-1 gap-2 text-base rounded-2xl h-12 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
              onClick={() => {
                const cleanNumber = (profile.whatsapp_number ?? "").replace(/[^0-9+]/g, "").replace(/^\+/, "");
                window.open(
                  `https://wa.me/${cleanNumber}?text=${encodeURIComponent(`Hi! I'm browsing your store on Afristall 🛍️`)}`,
                  "_blank"
                );
              }}
            >
              <MessageCircle className="h-5 w-5" />
              Message
            </Button>
          )}

          {ig && (
            <a
              href={ig}
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 w-12 shrink-0 rounded-2xl border border-border/60 bg-background flex items-center justify-center hover:bg-muted transition-colors shadow-sm"
              aria-label="Instagram"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
          )}

          {tt && (
            <a
              href={tt}
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 w-12 shrink-0 rounded-2xl border border-border/60 bg-background flex items-center justify-center hover:bg-muted transition-colors shadow-sm"
              aria-label="TikTok"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.16 15.2a6.34 6.34 0 0010.86 4.48v-7.13a8.16 8.16 0 004.77 1.53v-3.44a4.85 4.85 0 01-.8-.07v-.01a4.83 4.83 0 001.6-3.87z"/></svg>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
