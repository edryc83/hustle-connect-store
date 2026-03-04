import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Image as ImageIcon, Type, Share2, Download, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface ShareCardEditorProps {
  templateId: number;
  storeName: string;
  storeSlug: string;
  profilePicUrl: string;
  category: string;
  onBack: () => void;
}

const CARD_W = 1080;
const CARD_H = 1920;

export function ShareCardEditor({
  templateId,
  storeName,
  storeSlug,
  profilePicUrl,
  category,
  onBack,
}: ShareCardEditorProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bgImage, setBgImage] = useState(profilePicUrl || "/templates/editorial-1.jpeg");
  const [headline, setHeadline] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [scale, setScale] = useState(0.3);
  const [captionCopied, setCaptionCopied] = useState(false);

  const displayName = storeName || "My Store";
  const storeUrl = `afristall.com/${storeSlug}`;
  const caption = `🛍️ ${displayName} — Shop now 👇 ${storeUrl}`;

  // Set defaults based on template
  useEffect(() => {
    if (templateId === 1) {
      setHeadline("SHOP\nNOW");
      setSubtitle("Quality products at great prices.");
      setBgImage(profilePicUrl || "/templates/editorial-1.jpeg");
    } else if (templateId === 2) {
      setHeadline(displayName);
      setSubtitle(`${category || "Amazing products"} you'll love.`);
      setBgImage("");
    } else {
      setHeadline("FEATURED\nPRODUCT");
      setSubtitle("The one everyone's talking about.");
      setBgImage(profilePicUrl || "/templates/spotlight-2.jpeg");
    }
  }, [templateId, displayName, category, profilePicUrl]);

  // Calculate scale to fit
  useEffect(() => {
    const updateScale = () => {
      if (!wrapperRef.current) return;
      const wW = wrapperRef.current.clientWidth - 16;
      const wH = wrapperRef.current.clientHeight - 16;
      const s = Math.min(wW / CARD_W, wH / CARD_H);
      setScale(s);
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setBgImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleExport = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 1,
        useCORS: true,
        width: CARD_W,
        height: CARD_H,
        backgroundColor: null,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
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
      }, "image/png");
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

  const handleTextClick = (field: string) => {
    setEditingField(field);
  };

  const handleBlur = () => {
    setEditingField(null);
  };

  /* ── Template renderers ── */

  const renderTemplate1 = () => (
    <div
      ref={cardRef}
      style={{ width: CARD_W, height: CARD_H, position: "relative", overflow: "hidden", background: "#ffffff" }}
    >
      {/* Background image top 70% */}
      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "70%",
          backgroundImage: bgImage ? `url(${bgImage})` : undefined,
          backgroundSize: "cover", backgroundPosition: "center",
          backgroundColor: bgImage ? undefined : "#e5e7eb",
          cursor: "pointer",
        }}
      />
      {/* Dark gradient overlay */}
      <div style={{
        position: "absolute", top: "40%", left: 0, right: 0, height: "30%",
        background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))",
      }} />
      {/* Bottom content area */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "30%",
        background: "#ffffff", padding: "60px 60px 0",
        display: "flex", flexDirection: "column", justifyContent: "flex-start",
      }}>
        {editingField === "headline" ? (
          <textarea
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            onBlur={handleBlur}
            autoFocus
            style={{
              fontSize: 80, fontWeight: 900, color: "#111827", background: "transparent",
              border: "2px solid #FF6B35", outline: "none", resize: "none",
              fontFamily: "system-ui, sans-serif", lineHeight: 1.1, width: "100%",
            }}
          />
        ) : (
          <div
            onClick={() => handleTextClick("headline")}
            style={{
              fontSize: 80, fontWeight: 900, color: "#111827",
              fontFamily: "system-ui, sans-serif", lineHeight: 1.1,
              cursor: "pointer", whiteSpace: "pre-line",
            }}
          >
            {headline}
          </div>
        )}

        {editingField === "subtitle" ? (
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            onBlur={handleBlur}
            autoFocus
            style={{
              fontSize: 34, color: "#6b7280", background: "transparent",
              border: "2px solid #FF6B35", outline: "none", marginTop: 20,
              fontFamily: "system-ui, sans-serif", width: "100%",
            }}
          />
        ) : (
          <div
            onClick={() => handleTextClick("subtitle")}
            style={{
              fontSize: 34, color: "#6b7280", marginTop: 20,
              fontFamily: "system-ui, sans-serif", cursor: "pointer",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
      {/* Store URL bar */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 100,
        background: "linear-gradient(135deg, #FF6B35, #FF8F5E)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ color: "#fff", fontSize: 36, fontWeight: 700, fontFamily: "system-ui, sans-serif" }}>
          {storeUrl}
        </span>
      </div>
    </div>
  );

  const renderTemplate2 = () => (
    <div
      ref={cardRef}
      onClick={() => bgImage ? undefined : fileInputRef.current?.click()}
      style={{
        width: CARD_W, height: CARD_H, position: "relative", overflow: "hidden",
        background: bgImage ? `url(${bgImage}) center/cover` : "#FF6B35",
        cursor: !bgImage ? "pointer" : undefined,
      }}
    >
      {/* Orange overlay if there's an image */}
      {bgImage && (
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(255, 107, 53, 0.75)",
        }} />
      )}
      {/* Center content */}
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: "80px",
        zIndex: 1,
      }}>
        {editingField === "headline" ? (
          <textarea
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            onBlur={handleBlur}
            autoFocus
            style={{
              fontSize: 96, fontWeight: 900, color: "#fff", background: "transparent",
              border: "2px solid #fff", outline: "none", resize: "none", textAlign: "center",
              fontFamily: "system-ui, sans-serif", lineHeight: 1.1, width: "100%",
            }}
          />
        ) : (
          <div
            onClick={() => handleTextClick("headline")}
            style={{
              fontSize: 96, fontWeight: 900, color: "#fff", textAlign: "center",
              fontFamily: "system-ui, sans-serif", lineHeight: 1.1,
              cursor: "pointer", whiteSpace: "pre-line",
            }}
          >
            {headline}
          </div>
        )}

        {editingField === "subtitle" ? (
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            onBlur={handleBlur}
            autoFocus
            style={{
              fontSize: 40, color: "rgba(255,255,255,0.9)", background: "transparent",
              border: "2px solid #fff", outline: "none", marginTop: 40, textAlign: "center",
              fontFamily: "system-ui, sans-serif", width: "100%",
            }}
          />
        ) : (
          <div
            onClick={() => handleTextClick("subtitle")}
            style={{
              fontSize: 40, color: "rgba(255,255,255,0.9)", textAlign: "center",
              marginTop: 40, fontFamily: "system-ui, sans-serif", cursor: "pointer",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
      {/* Store URL bottom */}
      <div style={{
        position: "absolute", bottom: 60, left: 0, right: 0, textAlign: "center", zIndex: 1,
      }}>
        <span style={{ color: "#fff", fontSize: 36, fontWeight: 700, fontFamily: "system-ui, sans-serif" }}>
          {storeUrl}
        </span>
      </div>
    </div>
  );

  const renderTemplate3 = () => (
    <div
      ref={cardRef}
      style={{
        width: CARD_W, height: CARD_H, position: "relative", overflow: "hidden",
        background: "#1a1a2e",
      }}
    >
      {/* Product image center */}
      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "60%",
          backgroundImage: bgImage ? `url(${bgImage})` : undefined,
          backgroundSize: "cover", backgroundPosition: "center",
          backgroundColor: bgImage ? undefined : "#2a2a3e",
          cursor: "pointer",
        }}
      />
      {/* Dark gradient overlay */}
      <div style={{
        position: "absolute", top: "30%", left: 0, right: 0, bottom: 0,
        background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.95) 100%)",
      }} />
      {/* Orange accent gradient */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "20%",
        background: "linear-gradient(to top, rgba(255,107,53,0.3), transparent)",
      }} />
      {/* Content */}
      <div style={{
        position: "absolute", bottom: 100, left: 60, right: 60, zIndex: 1,
      }}>
        {editingField === "headline" ? (
          <textarea
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            onBlur={handleBlur}
            autoFocus
            style={{
              fontSize: 80, fontWeight: 900, color: "#fff", background: "transparent",
              border: "2px solid #FF6B35", outline: "none", resize: "none",
              fontFamily: "system-ui, sans-serif", lineHeight: 1.1, width: "100%",
            }}
          />
        ) : (
          <div
            onClick={() => handleTextClick("headline")}
            style={{
              fontSize: 80, fontWeight: 900, color: "#fff",
              fontFamily: "system-ui, sans-serif", lineHeight: 1.1,
              cursor: "pointer", whiteSpace: "pre-line",
            }}
          >
            {headline}
          </div>
        )}

        {editingField === "subtitle" ? (
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            onBlur={handleBlur}
            autoFocus
            style={{
              fontSize: 34, color: "rgba(255,255,255,0.85)", background: "transparent",
              border: "2px solid #FF6B35", outline: "none", marginTop: 20,
              fontFamily: "system-ui, sans-serif", width: "100%",
            }}
          />
        ) : (
          <div
            onClick={() => handleTextClick("subtitle")}
            style={{
              fontSize: 34, color: "rgba(255,255,255,0.85)", marginTop: 20,
              fontFamily: "system-ui, sans-serif", cursor: "pointer",
            }}
          >
            {subtitle}
          </div>
        )}

        <div style={{
          color: "#FF6B35", fontSize: 36, fontWeight: 700, marginTop: 40,
          fontFamily: "system-ui, sans-serif",
        }}>
          {storeUrl}
        </div>
      </div>
      {/* Store name top left */}
      <div style={{
        position: "absolute", top: 50, left: 60, zIndex: 1,
        color: "#fff", fontSize: 40, fontWeight: 700,
        fontFamily: "system-ui, sans-serif",
        textShadow: "0 2px 8px rgba(0,0,0,0.5)",
      }}>
        {displayName}
      </div>
    </div>
  );

  const renderCard = () => {
    if (templateId === 1) return renderTemplate1();
    if (templateId === 2) return renderTemplate2();
    return renderTemplate3();
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-2 py-3 shrink-0">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="flex-1 text-center text-base font-bold truncate">
          {templateId === 1 ? "Editorial" : templateId === 2 ? "Bold Orange" : "Dark Gradient"}
        </h1>
        <div className="w-10" />
      </div>

      {/* Scaled card preview */}
      <div
        ref={wrapperRef}
        className="flex-1 overflow-hidden bg-muted/30 rounded-xl mx-2 flex items-start justify-center"
      >
        <div style={{
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          width: CARD_W,
          height: CARD_H,
          flexShrink: 0,
        }}>
          {renderCard()}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />

      {/* Toolbar */}
      <div className="flex gap-2 px-2 py-3 shrink-0">
        <Button
          variant="outline"
          className="flex-1 rounded-xl gap-1.5 text-xs h-10"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="h-4 w-4" /> Change Image
        </Button>
        <Button
          variant="outline"
          className="flex-1 rounded-xl gap-1.5 text-xs h-10"
          onClick={() => setEditingField(editingField ? null : "headline")}
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
      <div className="mx-2 mb-3 rounded-xl border border-border/50 bg-muted/30 p-3 space-y-2">
        <p className="text-xs text-muted-foreground">Caption</p>
        <p className="text-sm">{caption}</p>
        <Button
          variant="outline" size="sm"
          className="w-full rounded-xl gap-1.5"
          onClick={copyCaption}
        >
          {captionCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {captionCopied ? "Copied!" : "Copy Caption"}
        </Button>
      </div>
    </div>
  );
}
