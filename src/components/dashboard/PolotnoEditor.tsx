import { useEffect, useRef, useState } from "react";
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from "polotno";
import { Toolbar } from "polotno/toolbar/toolbar";
import { SidePanel, DEFAULT_SECTIONS } from "polotno/side-panel/side-panel";
import { Workspace } from "polotno/canvas/workspace";
import { createStore } from "polotno/model/store";
import "polotno/polotno.blueprint.css";
import { Button } from "@/components/ui/button";
import { Download, Share2, ArrowLeft, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface DesignTemplate {
  id: string;
  name: string;
  category: string;
  defaultHeadline: string;
  defaultSubtitle: string;
  previewImage: string;
  previewBg: string;
  previewTextColor: string;
  previewAccent: string;
  previewLayout: "full-bleed" | "split" | "centered" | "grid";
}

interface Product {
  id: string;
  name: string;
  image_url: string | null;
}

interface PolotnoEditorProps {
  template: DesignTemplate;
  storeName: string;
  storeSlug: string;
  profilePicUrl: string;
  category: string;
  products: Product[];
  onBack: () => void;
}

// Filter out sections that are too complex for the user
const SECTIONS = DEFAULT_SECTIONS.filter(
  (section) => !["size"].includes(section.name)
);

export function PolotnoEditor({
  template,
  storeName,
  storeSlug,
  profilePicUrl,
  category,
  products,
  onBack,
}: PolotnoEditorProps) {
  const storeRef = useRef<ReturnType<typeof createStore> | null>(null);
  const [captionCopied, setCaptionCopied] = useState(false);

  const storeUrl = `afristall.com/${storeSlug}`;
  const caption = `🛍️ Visit my store → ${storeUrl}`;

  // Initialize Polotno store once
  if (!storeRef.current) {
    storeRef.current = createStore({
      key: "nFA5H9elEytDyPyvKL7T",
      showCredit: true,
    });
    storeRef.current.setSize(1080, 1920);
  }

  const store = storeRef.current;

  // Load template into the Polotno store
  useEffect(() => {
    if (!store) return;

    store.clear();
    const page = store.addPage();

    const displayName = storeName || "My Store";
    const isLight = ["#ffffff", "#f5f3ef", "#faf9f7"].includes(template.previewBg);

    page.set({ background: template.previewBg });

    const productImage = products.find((p) => p.image_url)?.image_url;
    const heroImage = productImage || profilePicUrl || template.previewImage;

    if (template.previewLayout === "full-bleed") {
      if (heroImage) {
        page.addElement({ type: "image", src: heroImage, x: 0, y: 0, width: 1080, height: 1920 });
        page.addElement({ type: "figure", x: 0, y: 960, width: 1080, height: 960, fill: "rgba(0,0,0,0.6)" });
      }
      page.addElement({ type: "text", text: template.defaultHeadline, x: 60, y: 1100, width: 960, fontSize: 96, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff", align: "left" });
      page.addElement({ type: "text", text: template.defaultSubtitle, x: 60, y: 1400, width: 960, fontSize: 36, fontFamily: "Arial", fill: "rgba(255,255,255,0.85)", align: "left" });
      page.addElement({ type: "figure", x: 0, y: 1780, width: 1080, height: 140, fill: template.previewAccent });
      page.addElement({ type: "text", text: storeUrl, x: 0, y: 1810, width: 1080, fontSize: 34, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff", align: "center" });

    } else if (template.previewLayout === "split") {
      if (heroImage) {
        page.addElement({ type: "image", src: heroImage, x: 0, y: 0, width: 1080, height: 1060 });
      }
      page.addElement({ type: "figure", x: 0, y: 1060, width: 1080, height: 860, fill: isLight ? "#ffffff" : template.previewBg });
      page.addElement({ type: "text", text: template.defaultHeadline, x: 70, y: 1100, width: 940, fontSize: 80, fontFamily: "Arial", fontWeight: "bold", fill: isLight ? "#1a1a1a" : "#ffffff", align: "left" });
      page.addElement({ type: "text", text: template.defaultSubtitle, x: 70, y: 1380, width: 940, fontSize: 32, fontFamily: "Arial", fill: isLight ? "#6b7280" : "rgba(255,255,255,0.7)", align: "left" });
      page.addElement({ type: "figure", x: 0, y: 1820, width: 1080, height: 100, fill: template.previewAccent });
      page.addElement({ type: "text", text: storeUrl, x: 0, y: 1835, width: 1080, fontSize: 32, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff", align: "center" });

    } else if (template.previewLayout === "centered") {
      if (heroImage) {
        page.addElement({ type: "image", src: heroImage, x: 80, y: 160, width: 920, height: 920, cornerRadius: 32 });
      }
      page.addElement({ type: "text", text: displayName, x: 80, y: 1140, width: 920, fontSize: 48, fontFamily: "Arial", fontWeight: "bold", fill: isLight ? "#111827" : "#ffffff", align: "left" });
      page.addElement({ type: "text", text: template.defaultHeadline, x: 80, y: 1220, width: 920, fontSize: 64, fontFamily: "Arial", fontWeight: "bold", fill: isLight ? "#111827" : "#ffffff", align: "left" });
      page.addElement({ type: "text", text: template.defaultSubtitle, x: 80, y: 1440, width: 920, fontSize: 32, fontFamily: "Arial", fill: isLight ? "#6b7280" : "rgba(255,255,255,0.7)", align: "left" });
      page.addElement({ type: "figure", x: 0, y: 1810, width: 1080, height: 110, fill: template.previewAccent });
      page.addElement({ type: "text", text: storeUrl, x: 0, y: 1835, width: 1080, fontSize: 34, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff", align: "center" });

    } else if (template.previewLayout === "grid") {
      const imgs = products.filter((p) => p.image_url).slice(0, 4);
      const gap = 12, pad = 16;
      const gridW = 1080 - pad * 2, gridTop = 200, gridH = 1100;

      page.addElement({ type: "text", text: displayName, x: 80, y: 60, width: 920, fontSize: 36, fontFamily: "Arial", fontWeight: "bold", fill: isLight ? "#111827" : "#ffffff", align: "left" });

      if (imgs.length >= 4) {
        const cW = (gridW - gap) / 2, cH = (gridH - gap) / 2;
        imgs.slice(0, 4).forEach((p, i) => {
          const col = i % 2, row = Math.floor(i / 2);
          page.addElement({ type: "image", src: p.image_url!, x: pad + col * (cW + gap), y: gridTop + row * (cH + gap), width: cW, height: cH, cornerRadius: 20 });
        });
      } else if (imgs.length >= 1) {
        page.addElement({ type: "image", src: imgs[0].image_url!, x: pad, y: gridTop, width: gridW, height: gridH, cornerRadius: 20 });
      }

      page.addElement({ type: "text", text: template.defaultHeadline.replace(/\n/g, " "), x: 0, y: 1350, width: 1080, fontSize: 52, fontFamily: "Arial", fontWeight: "bold", fill: isLight ? "#111827" : "#ffffff", align: "center" });
      page.addElement({ type: "text", text: template.defaultSubtitle, x: 60, y: 1430, width: 960, fontSize: 30, fontFamily: "Arial", fill: isLight ? "#6b7280" : "rgba(255,255,255,0.7)", align: "center" });
      page.addElement({ type: "figure", x: 290, y: 1780, width: 500, height: 80, fill: template.previewAccent, cornerRadius: 40 });
      page.addElement({ type: "text", text: storeUrl, x: 290, y: 1795, width: 500, fontSize: 30, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff", align: "center" });
    }

    // Profile pic badge
    if (profilePicUrl) {
      page.addElement({ type: "image", src: profilePicUrl, x: 900, y: 40, width: 60, height: 60, cornerRadius: 30 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template.id]);

  const handleDownloadOrShare = async () => {
    try {
      const dataURL = await store.toDataURL({ pixelRatio: 2 });
      const blob = await (await fetch(dataURL)).blob();
      const file = new File([blob], `${storeSlug}-card.png`, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: storeName, text: caption }); } catch { /* cancelled */ }
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${storeSlug}-card.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Card downloaded!");
      }
    } catch {
      toast.error("Failed to export card");
    }
  };

  const copyCaption = async () => {
    await navigator.clipboard.writeText(caption);
    setCaptionCopied(true);
    toast.success("Caption copied!");
    setTimeout(() => setCaptionCopied(false), 2000);
  };

  return (
    <div className="space-y-4 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">{template.name} Design</h1>
          <p className="text-xs text-muted-foreground">Tap any element to edit • Drag to move</p>
        </div>
      </div>

      {/* Polotno Editor */}
      <div className="rounded-2xl border border-border/50 overflow-hidden bg-muted/30" style={{ height: "70vh", minHeight: 500 }}>
        <PolotnoContainer style={{ width: "100%", height: "100%" }}>
          <SidePanelWrap>
            <SidePanel store={store} sections={SECTIONS} />
          </SidePanelWrap>
          <WorkspaceWrap>
            <Toolbar store={store} />
            <Workspace store={store} />
          </WorkspaceWrap>
        </PolotnoContainer>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button onClick={handleDownloadOrShare} className="w-full rounded-2xl gap-2 h-12 text-base">
          {typeof navigator !== "undefined" && navigator.canShare ? (
            <><Share2 className="h-5 w-5" /> Share Card</>
          ) : (
            <><Download className="h-5 w-5" /> Download Card</>
          )}
        </Button>

        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-4 space-y-3">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Caption</Label>
          <p className="text-sm leading-relaxed">{caption}</p>
          <Button variant="outline" size="sm" className="w-full rounded-xl gap-1.5" onClick={copyCaption}>
            {captionCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {captionCopied ? "Copied!" : "Copy Caption"}
          </Button>
        </div>
      </div>
    </div>
  );
}
