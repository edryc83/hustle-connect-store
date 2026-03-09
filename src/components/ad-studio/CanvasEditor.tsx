import { useEffect, useRef, useCallback, useState } from "react";
import * as fabric from "fabric";
import { Loader2 } from "lucide-react";

interface CanvasEditorProps {
  templateThumbnail: string;
  productImage: string | null;
  productName: string;
  subtitle: string;
  tagline: string;
  price: string;
  storeName: string;
  profilePicture?: string;
  onPositionChange?: (data: {
    imagePos: { left: number; top: number; scaleX: number; scaleY: number };
    textPositions: Record<string, { left: number; top: number; fontSize: number }>;
  }) => void;
}

const CANVAS_W = 400;
const CANVAS_H = 500;

export default function CanvasEditor({
  templateThumbnail,
  productImage,
  productName,
  subtitle,
  tagline,
  price,
  storeName,
  profilePicture,
  onPositionChange,
}: CanvasEditorProps) {
  // Use a container div ref — fabric.js will manage all DOM inside it
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const objectsRef = useRef<Record<string, fabric.Object>>({});
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  const reportPositions = useCallback(() => {
    if (!onPositionChange) return;
    const objs = objectsRef.current;
    const imgObj = objs["productImage"] as fabric.Image | undefined;
    const imagePos = imgObj
      ? { left: imgObj.left ?? 0, top: imgObj.top ?? 0, scaleX: imgObj.scaleX ?? 1, scaleY: imgObj.scaleY ?? 1 }
      : { left: 0, top: 0, scaleX: 1, scaleY: 1 };

    const textPositions: Record<string, { left: number; top: number; fontSize: number }> = {};
    ["productName", "subtitle", "tagline", "price", "storeName"].forEach((key) => {
      const obj = objs[key] as fabric.Textbox | undefined;
      if (obj) {
        textPositions[key] = { left: obj.left ?? 0, top: obj.top ?? 0, fontSize: obj.fontSize ?? 16 };
      }
    });
    onPositionChange({ imagePos, textPositions });
  }, [onPositionChange]);

  // Initialize canvas once via imperative DOM
  useEffect(() => {
    if (!containerRef.current || initializedRef.current) return;
    initializedRef.current = true;

    const canvasEl = document.createElement("canvas");
    canvasEl.width = CANVAS_W;
    canvasEl.height = CANVAS_H;
    containerRef.current.appendChild(canvasEl);

    const canvas = new fabric.Canvas(canvasEl, {
      width: CANVAS_W,
      height: CANVAS_H,
      backgroundColor: "#1a1a1a",
      selection: true,
    });
    fabricRef.current = canvas;

    canvas.on("object:modified", reportPositions);
    canvas.on("object:moving", reportPositions);
    canvas.on("object:scaling", reportPositions);

    return () => {
      canvas.dispose();
      fabricRef.current = null;
      initializedRef.current = false;
    };
  }, [reportPositions]);

  // Build canvas objects when inputs change
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const buildCanvas = async () => {
      setLoading(true);
      canvas.clear();
      objectsRef.current = {};

      // 1. Background template
      try {
        const bgImg = await fabric.FabricImage.fromURL(templateThumbnail, { crossOrigin: "anonymous" });
        bgImg.scaleToWidth(CANVAS_W);
        bgImg.scaleToHeight(CANVAS_H);
        bgImg.set({ selectable: false, evented: false, lockMovementX: true, lockMovementY: true });
        canvas.add(bgImg);
        canvas.sendObjectToBack(bgImg);
      } catch {
        canvas.backgroundColor = "#1a1a1a";
      }

      // 2. Gradient overlay
      const overlay = new fabric.Rect({
        width: CANVAS_W,
        height: CANVAS_H,
        left: 0,
        top: 0,
        selectable: false,
        evented: false,
      });
      overlay.set(
        "fill",
        new fabric.Gradient({
          type: "linear",
          coords: { x1: 0, y1: 0, x2: 0, y2: CANVAS_H },
          colorStops: [
            { offset: 0, color: "rgba(0,0,0,0)" },
            { offset: 0.5, color: "rgba(0,0,0,0.15)" },
            { offset: 1, color: "rgba(0,0,0,0.75)" },
          ],
        })
      );
      canvas.add(overlay);

      // 3. Product image
      if (productImage) {
        try {
          const img = await fabric.FabricImage.fromURL(productImage, { crossOrigin: "anonymous" });
          const maxW = CANVAS_W * 0.6;
          const maxH = CANVAS_H * 0.5;
          const imgScale = Math.min(maxW / (img.width || 1), maxH / (img.height || 1));
          img.set({
            scaleX: imgScale,
            scaleY: imgScale,
            left: CANVAS_W / 2,
            top: CANVAS_H * 0.35,
            originX: "center",
            originY: "center",
            cornerColor: "#a855f7",
            cornerStyle: "circle",
            cornerSize: 10,
            transparentCorners: false,
            borderColor: "#a855f7",
          });
          canvas.add(img);
          objectsRef.current["productImage"] = img;
        } catch (e) {
          console.error("Failed to load product image:", e);
        }
      }

      // 4. Profile picture + store name
      if (profilePicture) {
        try {
          const pfp = await fabric.FabricImage.fromURL(profilePicture, { crossOrigin: "anonymous" });
          pfp.scaleToWidth(28);
          pfp.scaleToHeight(28);
          pfp.set({ left: 14, top: 14, selectable: false, evented: false });
          pfp.set("clipPath", new fabric.Circle({
            radius: (pfp.width || 28) / 2,
            originX: "center",
            originY: "center",
          }));
          canvas.add(pfp);
        } catch {
          // skip
        }
      }

      if (storeName) {
        const storeText = new fabric.Textbox(storeName, {
          left: profilePicture ? 50 : 14,
          top: 18,
          fontSize: 12,
          fill: "rgba(255,255,255,0.7)",
          fontFamily: "sans-serif",
          fontWeight: "600",
          width: CANVAS_W - 80,
          selectable: true,
          editable: false,
          cornerColor: "#a855f7",
          borderColor: "#a855f7",
          cornerSize: 8,
          cornerStyle: "circle",
          transparentCorners: false,
        });
        canvas.add(storeText);
        objectsRef.current["storeName"] = storeText;
      }

      // 5. Text elements
      const textConfig = {
        cornerColor: "#a855f7",
        cornerStyle: "circle" as const,
        cornerSize: 8,
        transparentCorners: false,
        borderColor: "#a855f7",
        editable: false,
        fontFamily: "sans-serif",
      };

      let bottomY = CANVAS_H - 20;

      if (price) {
        const priceText = new fabric.Textbox(price, {
          ...textConfig,
          left: 16,
          top: bottomY - 30,
          fontSize: 20,
          fill: "#ffffff",
          fontWeight: "800",
          width: CANVAS_W - 32,
        });
        canvas.add(priceText);
        objectsRef.current["price"] = priceText;
        bottomY -= 40;
      }

      if (tagline && tagline.trim() !== " ") {
        const taglineText = new fabric.Textbox(tagline, {
          ...textConfig,
          left: 16,
          top: bottomY - 18,
          fontSize: 10,
          fill: "rgba(255,255,255,0.6)",
          fontStyle: "italic",
          width: CANVAS_W - 32,
        });
        canvas.add(taglineText);
        objectsRef.current["tagline"] = taglineText;
        bottomY -= 24;
      }

      if (subtitle && subtitle.trim() !== " ") {
        const subtitleText = new fabric.Textbox(subtitle, {
          ...textConfig,
          left: 16,
          top: bottomY - 16,
          fontSize: 12,
          fill: "rgba(255,255,255,0.85)",
          width: CANVAS_W - 32,
        });
        canvas.add(subtitleText);
        objectsRef.current["subtitle"] = subtitleText;
        bottomY -= 24;
      }

      const nameText = new fabric.Textbox(productName || "Product Name", {
        ...textConfig,
        left: 16,
        top: bottomY - 26,
        fontSize: 22,
        fill: "#ffffff",
        fontWeight: "700",
        width: CANVAS_W - 32,
        lineHeight: 1.15,
      });
      canvas.add(nameText);
      objectsRef.current["productName"] = nameText;

      canvas.renderAll();
      setLoading(false);
      reportPositions();
    };

    buildCanvas();
  }, [templateThumbnail, productImage, productName, subtitle, tagline, price, storeName, profilePicture, reportPositions]);

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="relative rounded-2xl overflow-hidden border border-border shadow-lg bg-muted">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/80 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {/* Container div — fabric.js manages all DOM inside */}
        <div
          ref={containerRef}
          className="w-full"
          style={{ aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-2">
        Drag &amp; resize image and text directly on the canvas
      </p>
    </div>
  );
}
