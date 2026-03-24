import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { image_url } = await req.json();
    if (!image_url) {
      return new Response(JSON.stringify({ error: "Missing image_url" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the image and convert to base64
    console.log("Fetching image:", image_url.substring(0, 100));
    const imgRes = await fetch(image_url);
    if (!imgRes.ok) throw new Error(`Failed to fetch image: ${imgRes.status}`);
    const imgBuffer = await imgRes.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(imgBuffer)));
    const mimeType = imgRes.headers.get("content-type") || "image/png";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    console.log("Sending to AI gateway for background removal...");

    // Use Gemini image editing model to remove background
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Remove the background from this image completely. Keep only the main subject/product with a fully transparent background. Output just the image with no background.",
              },
              {
                type: "image_url",
                image_url: { url: dataUrl },
              },
            ],
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, errText);
      throw new Error(`AI gateway error: ${aiRes.status}`);
    }

    const aiData = await aiRes.json();
    console.log("AI response received, extracting image...");

    // Extract the generated image from the response
    const choice = aiData.choices?.[0]?.message;
    if (!choice) throw new Error("No response from AI model");

    // Look for image content in the response (could be base64 inline_data or parts)
    let resultBase64: string | null = null;

    // Check multipart content array
    if (Array.isArray(choice.content)) {
      for (const part of choice.content) {
        if (part.type === "image_url" && part.image_url?.url) {
          // Extract base64 from data URL
          const match = part.image_url.url.match(/^data:image\/\w+;base64,(.+)$/);
          resultBase64 = match ? match[1] : null;
          break;
        }
        if (part.type === "inline_data" || part.inline_data) {
          resultBase64 = part.inline_data?.data || part.data;
          break;
        }
      }
    }

    if (!resultBase64) {
      console.error("AI response structure:", JSON.stringify(aiData).substring(0, 500));
      throw new Error("No image returned from AI model");
    }

    // Upload the processed image to storage
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const binaryData = Uint8Array.from(atob(resultBase64), c => c.charCodeAt(0));
    const path = `bg-removed/${crypto.randomUUID()}.png`;
    const { error: uploadError } = await supabase.storage
      .from("ad-images")
      .upload(path, binaryData, { contentType: "image/png", upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error("Failed to save processed image");
    }

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
