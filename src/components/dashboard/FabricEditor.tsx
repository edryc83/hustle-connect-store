import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas, FabricImage, FabricText, Rect } from "fabric";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Image as ImageIcon, Type, Share2, Download, Copy, Check, X, Upload, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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

interface FabricEditorProps {
  template: DesignTemplate;
  storeName: string;
  storeSlug: string;
  profilePicUrl: string;
  category: string;
  products: Product[];
  onBack: () => void;
}

const CANVAS_W = 1080;
const CANVAS_H = 1920;

export function FabricEditor({
  template,
  storeName,
  storeSlug,
  profilePicUrl,
  products,
  onBack,
}: FabricEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [captionCopied, setCaptionCopied] = useState(false);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [editingText, setEditingText] = useState<FabricText | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [pexelsQuery, setPexelsQuery] = useState("");
  const [pexelsResults, setPexelsResults] = useState<string[]>([]);
  const [pexelsLoading, setPexelsLoading] = useState(false);
  const [textHighlight, setTextHighlight] = useState(false);

  const storeUrl = `afristall.com/${storeSlug}`;
  const displayName = storeName || "My Store";
  const caption = `🛍️ ${displayName} — Shop now 👇 ${storeUrl}`;

  // Scale canvas to fit container
  const fitCanvas = useCallback(() => {
    const canvas = fabricRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const wW = wrapper.clientWidth;
    const wH = wrapper.clientHeight;
    const scale = Math.min(wW / CANVAS_W, wH / CANVAS_H);

    const el = canvas.getElement();
    const container = el.parentElement;
    if (container) {
      container.style.transform = `scale(${scale})`;
      container.style.transformOrigin = "top center";
      container.style.width = `${CANVAS_W}px`;
      container.style.height = `${CANVAS_H}px`;
      container.style.margin = "0 auto";
    }
  }, []);

  // Build the template on canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: CANVAS_W,
      height: CANVAS_H,
      backgroundColor: template.previewBg,
      selection: false,
    });
    fabricRef.current = canvas;

    const isLight = ["#ffffff", "#f5f3ef", "#faf9f7"].includes(template.previewBg);
    const textColor = isLight ? "#111827" : "#ffffff";
    const subtitleColor = isLight ? "#6b7280" : "rgba(255,255,255,0.7)";
    const productImage = products.find((p) => p.image_url)?.image_url;
    const heroSrc = productImage || profilePicUrl || template.previewImage;

    const headline = template.defaultHeadline.replace("store_name", displayName);
    const subtitle = template.defaultSubtitle;

    // Helper to load image
    const loadImg = (src: string): Promise<FabricImage> =>
      new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const fi = new FabricImage(img);
          resolve(fi);
        };
        img.onerror = () => {
          const fi = new FabricImage(new Image());
          resolve(fi);
        };
        img.src = src;
      });

    const buildLayout = async () => {
      // Background image
      if (heroSrc) {
        try {
          const bgImg = await loadImg(heroSrc);
          const scaleX = CANVAS_W / (bgImg.width || 1);
          const scaleY = CANVAS_H / (bgImg.height || 1);
          const bgScale = Math.max(scaleX, scaleY);
          bgImg.set({
            scaleX: bgScale,
            scaleY: bgScale,
            left: 0,
            top: 0,
            selectable: true,
            evented: true,
            hasControls: false,
            hasBorders: false,
            lockMovementX: true,
            lockMovementY: true,
            data: { type: "background" },
          } as any);
          canvas.add(bgImg);
          canvas.sendObjectToBack(bgImg);
        } catch { /* skip bg image */ }
      }

      // Dark overlay for text readability
      if (template.previewLayout === "full-bleed") {
        const overlay = new Rect({
          left: 0,
          top: CANVAS_H * 0.5,
          width: CANVAS_W,
          height: CANVAS_H * 0.5,
          fill: "rgba(0,0,0,0.55)",
          selectable: false,
          evented: false,
        });
        canvas.add(overlay);
      } else if (template.previewLayout === "split") {
        const overlay = new Rect({
          left: 0,
          top: CANVAS_H * 0.55,
          width: CANVAS_W,
          height: CANVAS_H * 0.45,
          fill: template.previewBg,
          selectable: false,
          evented: false,
        });
        canvas.add(overlay);
      }

      // Accent bar
      const barY = template.previewLayout === "grid" ? 1780 : 1820;
      const accentBar = new Rect({
        left: 0,
        top: barY,
        width: CANVAS_W,
        height: CANVAS_H - barY,
        fill: template.previewAccent,
        selectable: false,
        evented: false,
      });
      canvas.add(accentBar);

      // Headline text
      const headlineY = template.previewLayout === "full-bleed" ? 1100
        : template.previewLayout === "split" ? 1100
        : template.previewLayout === "centered" ? 1200
        : 1350;

      const headlineText = new FabricText(headline.replace(/\\n/g, "\n"), {
        left: 60,
        top: headlineY,
        width: 960,
        fontSize: template.previewLayout === "full-bleed" ? 96 : 72,
        fontFamily: "Arial",
        fontWeight: "bold",
        fill: template.previewLayout === "full-bleed" ? "#ffffff" : textColor,
        selectable: true,
        evented: true,
        hasControls: false,
        hasBorders: false,
        lockMovementX: true,
        lockMovementY: true,
        data: { type: "text", role: "headline" },
      } as any);
      canvas.add(headlineText);

      // Subtitle text
      const subY = headlineY + (template.previewLayout === "full-bleed" ? 300 : 200);
      const subtitleText = new FabricText(subtitle, {
        left: 60,
        top: subY,
        width: 960,
        fontSize: 34,
        fontFamily: "Arial",
        fill: template.previewLayout === "full-bleed" ? "rgba(255,255,255,0.85)" : subtitleColor,
        selectable: true,
        evented: true,
        hasControls: false,
        hasBorders: false,
        lockMovementX: true,
        lockMovementY: true,
        data: { type: "text", role: "subtitle" },
      } as any);
      canvas.add(subtitleText);

      // Store URL text
      const urlText = new FabricText(storeUrl, {
        left: 0,
        top: barY + 25,
        width: CANVAS_W,
        fontSize: 34,
        fontFamily: "Arial",
        fontWeight: "bold",
        fill: "#ffffff",
        textAlign: "center",
        selectable: true,
        evented: true,
        hasControls: false,
        hasBorders: false,
        lockMovementX: true,
        lockMovementY: true,
        data: { type: "text", role: "store_url" },
      } as any);
      canvas.add(urlText);

      // Store name label
      const nameText = new FabricText(displayName, {
        left: 60,
        top: 60,
        fontSize: 40,
        fontFamily: "Arial",
        fontWeight: "bold",
        fill: "#ffffff",
        selectable: true,
        evented: true,
        hasControls: false,
        hasBorders: false,
        lockMovementX: true,
        lockMovementY: true,
        data: { type: "text", role: "store_name" },
      } as any);
      canvas.add(nameText);

      canvas.renderAll();
      fitCanvas();
    };

    buildLayout();

    // Handle object selection
    canvas.on("mouse:down", (e) => {
      const target = e.target;
      if (!target) {
        setEditingText(null);
        canvas.discardActiveObject();
        canvas.renderAll();
        return;
      }

      const data = (target as any).data;
      if (data?.type === "background") {
        setImagePickerOpen(true);
      } else if (data?.type === "text" && target instanceof FabricText) {
        setEditingText(target);
        setEditingValue(target.text || "");
      }
    });

    // Resize handler
    const handleResize = () => fitCanvas();
    window.addEventListener("resize", handleResize);
    setTimeout(fitCanvas, 100);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.dispose();
      fabricRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template.id]);

  // Update text when editing
  const applyTextEdit = () => {
    if (editingText && fabricRef.current) {
      editingText.set("text", editingValue);
      fabricRef.current.renderAll();
      setEditingText(null);
    }
  };

  // Replace background image
  const replaceBackground = async (src: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects();
    const bgObj = objects.find((o: any) => o.data?.type === "background");
    if (bgObj) canvas.remove(bgObj);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const fi = new FabricImage(img);
      const scaleX = CANVAS_W / (fi.width || 1);
      const scaleY = CANVAS_H / (fi.height || 1);
      const bgScale = Math.max(scaleX, scaleY);
      fi.set({
        scaleX: bgScale,
        scaleY: bgScale,
        left: 0,
        top: 0,
        selectable: true,
        evented: true,
        hasControls: false,
        hasBorders: false,
        lockMovementX: true,
        lockMovementY: true,
        data: { type: "background" },
      } as any);
      canvas.add(fi);
      canvas.sendObjectToBack(fi);
      canvas.renderAll();
      setImagePickerOpen(false);
      toast.success("Image updated!");
    };
    img.src = src;
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      replaceBackground(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Pexels search (using proxy via edge function or direct)
  const searchPexels = async () => {
    if (!pexelsQuery.trim()) return;
    setPexelsLoading(true);
    try {
      // Use curated free images from picsum as fallback since we don't have a Pexels API key
      const results: string[] = [];
      for (let i = 0; i < 12; i++) {
        results.push(`https://picsum.photos/seed/${pexelsQuery.replace(/\s/g, "")}${i}/1080/1920`);
      }
      setPexelsResults(results);
    } catch {
      toast.error("Failed to search images");
    } finally {
      setPexelsLoading(false);
    }
  };

  // Export
  const handleExport = async () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    try {
      canvas.discardActiveObject();
      canvas.renderAll();
      const dataURL = canvas.toDataURL({ format: "png", multiplier: 1, quality: 1 });
      const blob = await (await fetch(dataURL)).blob();
      const file = new File([blob], `${storeSlug}-card.png`, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: displayName, text: caption });
        } catch { /* cancelled */ }
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

  const highlightTexts = () => {
    setTextHighlight(!textHighlight);
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.getObjects().forEach((obj: any) => {
      if (obj.data?.type === "text") {
        obj.set("backgroundColor", textHighlight ? "" : "rgba(255,107,53,0.3)");
      }
    });
    canvas.renderAll();
  };

  const copyCaption = async () => {
    await navigator.clipboard.writeText(caption);
    setCaptionCopied(true);
    toast.success("Caption copied!");
    setTimeout(() => setCaptionCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-2 py-3 shrink-0">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="flex-1 text-center text-base font-bold truncate">{template.name}</h1>
        <div className="w-10" /> {/* spacer */}
      </div>

      {/* Canvas */}
      <div
        ref={wrapperRef}
        className="flex-1 overflow-hidden bg-muted/30 rounded-xl mx-2 relative"
      >
        <canvas ref={canvasRef} />
      </div>

      {/* Inline text editor */}
      {editingText && (
        <div className="mx-2 mt-2 flex gap-2">
          <Input
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyTextEdit()}
            autoFocus
            className="rounded-xl text-sm"
            placeholder="Edit text..."
          />
          <Button size="sm" className="rounded-xl shrink-0" onClick={applyTextEdit}>
            Done
          </Button>
          <Button size="sm" variant="ghost" className="rounded-xl shrink-0" onClick={() => setEditingText(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex gap-2 px-2 py-3 shrink-0">
        <Button
          variant="outline"
          className="flex-1 rounded-xl gap-1.5 text-xs h-10"
          onClick={() => setImagePickerOpen(true)}
        >
          <ImageIcon className="h-4 w-4" /> Change Image
        </Button>
        <Button
          variant="outline"
          className="flex-1 rounded-xl gap-1.5 text-xs h-10"
          onClick={highlightTexts}
        >
          <Type className="h-4 w-4" /> Edit Text
        </Button>
        <Button
          className="flex-1 rounded-xl gap-1.5 text-xs h-10"
          onClick={handleExport}
        >
          {typeof navigator !== "undefined" && navigator.canShare ? (
            <><Share2 className="h-4 w-4" /> Share</>
          ) : (
            <><Download className="h-4 w-4" /> Download</>
          )}
        </Button>
      </div>

      {/* Caption */}
      <div className="mx-2 mb-4 rounded-xl border border-border/50 bg-muted/50 p-3 space-y-2 shrink-0">
        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Caption</Label>
        <p className="text-xs leading-relaxed">{caption}</p>
        <Button variant="outline" size="sm" className="w-full rounded-xl gap-1.5 text-xs" onClick={copyCaption}>
          {captionCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {captionCopied ? "Copied!" : "Copy Caption"}
        </Button>
      </div>

      {/* Image Picker Modal */}
      <Dialog open={imagePickerOpen} onOpenChange={setImagePickerOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <h2 className="text-base font-bold">Change Background Image</h2>
          <Tabs defaultValue="upload">
            <TabsList className="w-full rounded-xl">
              <TabsTrigger value="upload" className="flex-1 rounded-lg gap-1 text-xs">
                <Upload className="h-3.5 w-3.5" /> Upload
              </TabsTrigger>
              <TabsTrigger value="search" className="flex-1 rounded-lg gap-1 text-xs">
                <Search className="h-3.5 w-3.5" /> Search
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-3 mt-3">
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-8 cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Tap to upload an image</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
            </TabsContent>

            <TabsContent value="search" className="space-y-3 mt-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Search free images..."
                  value={pexelsQuery}
                  onChange={(e) => setPexelsQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchPexels()}
                  className="rounded-xl text-sm"
                />
                <Button size="sm" className="rounded-xl shrink-0" onClick={searchPexels} disabled={pexelsLoading}>
                  {pexelsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
              {pexelsResults.length > 0 && (
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {pexelsResults.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => replaceBackground(url)}
                      className="aspect-[9/16] rounded-lg overflow-hidden border border-border/50 hover:ring-2 hover:ring-primary transition-all"
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
