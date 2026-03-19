import { MapPin } from "lucide-react";
import AfristallLogo from "@/components/AfristallLogo";
import whatsappIcon from "@/assets/whatsapp-icon.png";
import { LazyImage } from "@/components/ui/lazy-image";
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
  onBack?: () => void;
  firstProductImage?: string | null;
}

export function StorefrontHeader({ profile, visitorName, onBack, firstProductImage }: StorefrontHeaderProps) {
  const coverUrl = (profile as any).cover_photo_url || firstProductImage || "/default-cover.png";
  const avatarUrl = profile.profile_picture_url || firstProductImage || "/logo-glow.png";
  const ig = (profile as any).instagram_url;
  const tt = (profile as any).tiktok_url;
  const fb = (profile as any).facebook_url;
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
        <LazyImage src={coverUrl} alt="" wrapperClassName="h-full w-full" className="w-full h-full object-cover" />
      </div>

      <div className="mx-auto max-w-5xl px-4 -mt-10 pb-5 flex flex-col items-start gap-1.5">
        {/* Profile Picture */}
        <div className="ig-ring shadow-lg">
          <LazyImage
            src={avatarUrl}
            alt={profile.store_name ?? "Store"}
            wrapperClassName="h-20 w-20 rounded-full"
            className="w-full h-full rounded-full object-cover"
          />
        </div>

        {/* Store Name */}
        <h1 className="text-2xl font-semibold tracking-tight leading-tight mt-1">{profile.store_name}</h1>

        {/* Username */}
        {profile.store_slug && (
          <p className="text-sm text-muted-foreground -mt-0.5">@{profile.store_slug}</p>
        )}

        {/* Bio — two line max */}
        {profile.store_bio && (
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md line-clamp-2">
            {profile.store_bio}
          </p>
        )}

        {/* Category badge */}
        {mainCat && (
          <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary mt-1">
            {mainCat}
          </span>
        )}

        {/* Online / Physical location */}
        {(profile as any).is_online_only && (
          <p className="text-xs text-muted-foreground">🌐 Online Store</p>
        )}
        {hasPhysicalAddress && (
          <p className="text-xs text-muted-foreground">
            📍 {addressParts.join(", ")}{(profile.district || profile.city) ? `, ${profile.district || profile.city}` : ""}
          </p>
        )}
        {!hasPhysicalAddress && !((profile as any).is_online_only) && (profile.district || profile.city) && (
          <span className="flex items-center gap-1 text-muted-foreground text-xs">
            <MapPin className="h-3 w-3" /> {profile.district || profile.city}
          </span>
        )}

        {/* Delivery Areas */}
        {(profile as any).delivery_areas && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>Delivers to: {(profile as any).delivery_areas}</span>
          </div>
        )}

        {/* WhatsApp pill + Social Icons */}
        <div className="flex items-center gap-2 pt-1.5">
          {profile.whatsapp_number && (
            <a
              href={`https://wa.me/${profile.whatsapp_number.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-1.5 text-xs font-semibold transition-colors shadow-sm"
            >
              <img src={whatsappIcon} alt="" className="h-3.5 w-3.5" />
              WhatsApp
            </a>
          )}

          {ig && (
            <a href={ig} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-border/60 bg-background hover:bg-muted transition-colors shadow-sm" aria-label="Instagram">
              <svg viewBox="0 0 448 512" className="h-4 w-4 fill-current"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9S160.5 370.9 224.1 370.9 339 319.6 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg>
            </a>
          )}

          {tt && (
            <a href={tt} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-border/60 bg-background hover:bg-muted transition-colors shadow-sm" aria-label="TikTok">
              <svg viewBox="0 0 448 512" className="h-4 w-4 fill-current"><path d="M448 209.91a210.06 210.06 0 01-122.77-39.25v178.72A162.55 162.55 0 11185 188.31v89.89a74.62 74.62 0 1052.23 71.18V0h88a121 121 0 00.2 13.46 121.74 121.74 0 0068.18 89.41 120.42 120.42 0 0054.39 17.13z"/></svg>
            </a>
          )}

          {fb && (
            <a href={fb} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-border/60 bg-background hover:bg-muted transition-colors shadow-sm" aria-label="Facebook">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
