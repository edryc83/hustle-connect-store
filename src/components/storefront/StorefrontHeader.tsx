import { MapPin } from "lucide-react";
import { categoriesToDisplay } from "@/components/CategoryPicker";
import AfristallLogo from "@/components/AfristallLogo";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const defaultWelcome = "Take a look around — you might just find something you love. Happy shopping! 🧡";

interface StorefrontHeaderProps {
  profile: Profile;
  visitorName: string | null;
}

export function StorefrontHeader({ profile, visitorName }: StorefrontHeaderProps) {
  const greeting = getTimeGreeting();
  const welcomeMessage = (profile as any).welcome_message || profile.store_bio || defaultWelcome;
  const coverUrl = (profile as any).cover_photo_url;

  return (
    <header className="bg-background">
      {/* Cover Photo */}
      <div className="h-36 sm:h-48 bg-gradient-to-br from-primary/15 via-primary/5 to-accent/10 overflow-hidden">
        {coverUrl ? (
          <img src={coverUrl} alt="" className="w-full h-full object-cover" />
        ) : null}
      </div>

      <div className="mx-auto max-w-5xl px-4 -mt-12 pb-6 flex flex-col items-center text-center gap-4">
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

        {/* Store Name */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{profile.store_name}</h1>
          {profile.store_slug && (
            <p className="text-sm text-muted-foreground">@{profile.store_slug}</p>
          )}
        </div>

        {/* Category & Location Tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          {(() => {
            const parts = [profile.city, (profile as any).district, (profile as any).country].filter(Boolean);
            return parts.length > 0 ? (
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {parts.join(", ")}
              </span>
            ) : null;
          })()}
          {categoriesToDisplay(profile.category).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Delivery Areas */}
        {(profile as any).delivery_areas && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>Delivers to: {(profile as any).delivery_areas}</span>
          </div>
        )}
      </div>

      {/* Greeting & Welcome */}
      <div className="border-t border-b bg-secondary/40">
        <div className="mx-auto max-w-5xl px-4 py-5 text-center space-y-1.5">
          <p className="text-lg font-semibold">
            {greeting}
            {visitorName ? `, ${visitorName}` : ""}! 👋
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            {welcomeMessage}
          </p>
        </div>
      </div>
    </header>
  );
}