import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, MessageCircle } from "lucide-react";

interface Props {
  resultUrl: string;
  productName: string;
  onEdit: () => void;
  onStartOver: () => void;
}

export default function ResultScreen({ resultUrl, productName, onEdit, onStartOver }: Props) {
  const handleDownload = async () => {
    try {
      const res = await fetch(resultUrl);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `ad-${productName.replace(/\s+/g, "-").toLowerCase() || "design"}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(resultUrl, "_blank");
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Check out ${productName}! ${resultUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-6">
      <img
        src={resultUrl}
        alt="Generated Ad"
        className="max-w-full max-h-[70vh] rounded-2xl shadow-2xl border border-border"
      />
      <div className="flex gap-3 flex-wrap justify-center">
        <Button onClick={handleDownload} size="lg" className="gap-2 shadow-lg">
          <Download className="h-5 w-5" /> Download
        </Button>
        <Button
          onClick={handleShareWhatsApp}
          size="lg"
          variant="outline"
          className="gap-2 border-green-500/30 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20"
        >
          <MessageCircle className="h-5 w-5" /> Share to WhatsApp
        </Button>
      </div>
      <div className="flex gap-3">
        <Button variant="ghost" size="sm" onClick={onEdit} className="gap-1.5 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Edit Text
        </Button>
        <Button variant="ghost" size="sm" onClick={onStartOver} className="text-muted-foreground">
          Start Over
        </Button>
      </div>
    </div>
  );
}
