export interface VideoTemplate {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  cameraPrompt: string;
  tint: string;
}

export const VIDEO_TEMPLATES: VideoTemplate[] = [
  {
    id: "orbit",
    label: "Orbit",
    emoji: "🛰️",
    desc: "Slow cinematic camera arc around the product",
    cameraPrompt:
      "The camera slowly orbits around the product in a smooth 180-degree arc, cinematic depth of field, soft studio lighting, product stays sharp and perfectly centered, no changes to the product itself.",
    tint: "from-violet-500/20 to-fuchsia-500/10 border-violet-500/30 text-violet-300",
  },
  {
    id: "push-in",
    label: "Push-in",
    emoji: "🎥",
    desc: "Dolly toward the product, subtle rack focus",
    cameraPrompt:
      "The camera slowly dollies in toward the product with a subtle rack-focus reveal, cinematic macro feel, soft golden studio light, product stays perfectly still and unchanged.",
    tint: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300",
  },
  {
    id: "reveal",
    label: "Reveal",
    emoji: "✨",
    desc: "Top-down descend with rim lighting",
    cameraPrompt:
      "The camera descends from above onto the product, rim light glinting, gentle atmospheric particles drifting in the background, product stays sharp and unchanged.",
    tint: "from-sky-500/20 to-blue-500/10 border-sky-500/30 text-sky-300",
  },
  {
    id: "float",
    label: "Float",
    emoji: "🪷",
    desc: "Product levitates, camera drifts",
    cameraPrompt:
      "The product gently floats and rotates in mid-air while the camera drifts around it, dreamy studio background, soft volumetric light, product stays perfectly rendered and unchanged.",
    tint: "from-pink-500/20 to-rose-500/10 border-pink-500/30 text-pink-300",
  },
  {
    id: "turntable",
    label: "Turntable",
    emoji: "💿",
    desc: "Product rotates on a plinth",
    cameraPrompt:
      "The product rotates slowly on a polished studio plinth, seamless colored backdrop, premium e-commerce lighting, product stays sharp and unchanged.",
    tint: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300",
  },
  {
    id: "splash",
    label: "Splash",
    emoji: "💦",
    desc: "Liquid or particle burst around the product",
    cameraPrompt:
      "Slow-motion water splash and light particles swirl around the product, dramatic backlight, cinematic beverage-commercial vibe, product stays sharp and unchanged.",
    tint: "from-cyan-500/20 to-sky-500/10 border-cyan-500/30 text-cyan-300",
  },
];