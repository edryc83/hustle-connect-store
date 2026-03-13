import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type BusinessTerms = {
  singular: string;   // "Product" or "Package"
  plural: string;     // "Products" or "Packages"
  emoji: string;      // "📦" or "🔧"
  businessType: string;
};

/**
 * Returns the correct terminology based on the seller's business_type.
 * - "service" → Package / Packages
 * - "product" or "both" → Product / Products
 */
export function useBusinessTerms(): BusinessTerms {
  const { user } = useAuth();
  const [businessType, setBusinessType] = useState("product");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("business_type")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if ((data as any)?.business_type) {
          setBusinessType((data as any).business_type);
        }
      });
  }, [user]);

  const types = businessType.split(",");
  if (types.length > 1) {
    return { singular: "Item", plural: "Items", emoji: "📦", businessType };
  }
  if (businessType === "service") {
    return { singular: "Package", plural: "Packages", emoji: "🔧", businessType };
  }
  if (businessType === "experience") {
    return { singular: "Experience", plural: "Experiences", emoji: "✨", businessType };
  }
  return { singular: "Product", plural: "Products", emoji: "📦", businessType };
}
