import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { image_url } = await req.json();
    if (!image_url) {
      return new Response(JSON.stringify({ error: "Missing image_url" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Processing image for bg removal:", image_url.substring(0, 80));

    // Try remove.bg API first (best for transparent backgrounds)
    const REMOVE_BG_API_KEY = Deno.env.get("REMOVE_BG_API_KEY");

    if (REMOVE_BG_API_KEY) {
      const formData = new FormData();
      formData.append("image_url", image_url);
      formData.append("size", "auto");
      formData.append("format", "png");
      formData.append("channels", "rgba"); // Explicitly request RGBA for transparency

      const removeBgRes = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": REMOVE_BG_API_KEY,
        },
        body: formData,
      });

      if (removeBgRes.ok) {
        const imageBlob = await removeBgRes.blob();
        const arrayBuffer = await imageBlob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const path = `bg-removed/${crypto.randomUUID()}.png`;
        const { error: uploadError } = await supabase.storage
          .from("ad-images")
          .upload(path, uint8Array, { contentType: "image/png", upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("ad-images").getPublicUrl(path);
        console.log("Background removed successfully via remove.bg");

        return new Response(JSON.stringify({ url: urlData.publicUrl, hasTransparency: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else {
        console.warn("remove.bg API failed, trying fallback:", removeBgRes.status);
      }
    }

    // Fallback: Use Lovable AI gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("No background removal API configured");

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        modalities: ["image", "text"],
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Remove the background from this product image completely. The background MUST be fully transparent (alpha=0). Keep only the main product with its exact shape. Output as PNG with transparent background. No white background, no shadows, no additions.",
              },
              {
                type: "image_url",
                image_url: { url: image_url },
              },
            ],
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, errText);
      throw new Error(`Background removal failed (${aiRes.status})`);
    }

    const aiData = await aiRes.json();
    const message = aiData.choices?.[0]?.message;
    if (!message) throw new Error("No response from AI model");

    const resultImageUrl = message.images?.[0]?.image_url?.url
      || (Array.isArray(message.content)
        ? message.content.find((part: { type?: string; image_url?: { url?: string } }) => part.type === "image_url" && part.image_url?.url)?.image_url?.url
        : null);

    if (!resultImageUrl) {
      throw new Error("No image returned from AI model");
    }

    const dataUrlMatch = resultImageUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!dataUrlMatch) {
      throw new Error("AI returned an unsupported image format");
    }

    const [, contentType, base64Data] = dataUrlMatch;
    const binaryString = atob(base64Data);
    const binaryData = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      binaryData[i] = binaryString.charCodeAt(i);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const path = `bg-removed/${crypto.randomUUID()}.png`;
    const { error: uploadError } = await supabase.storage
      .from("ad-images")
      .upload(path, binaryData, { contentType: "image/png", upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from("ad-images").getPublicUrl(path);

    return new Response(JSON.stringify({ url: urlData.publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("remove-background error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
