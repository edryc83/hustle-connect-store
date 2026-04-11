import { useState } from 'react';
import { Download, Share2, MessageCircle, Loader2, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FlyerExportProps {
  onExport: () => Promise<Blob | null>;
  productName: string;
  disabled?: boolean;
}

export default function FlyerExport({
  onExport,
  productName,
  disabled = false,
}: FlyerExportProps) {
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const sanitizeFileName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await onExport();
      if (!blob) {
        toast.error('Failed to generate image');
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flyer-${sanitizeFileName(productName)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Flyer downloaded!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const handleShareWhatsApp = async () => {
    setSharing(true);
    try {
      const blob = await onExport();
      if (!blob) {
        toast.error('Failed to generate image');
        return;
      }

      // Try native share first (works better on mobile)
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], `flyer-${sanitizeFileName(productName)}.png`, {
          type: 'image/png',
        });

        const shareData = {
          files: [file],
          title: productName,
          text: `Check out ${productName}!`,
        };

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          toast.success('Shared successfully!');
          return;
        }
      }

      // Fallback: Download and prompt to share manually
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flyer-${sanitizeFileName(productName)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Flyer saved! Share it on WhatsApp Status');
    } catch (error) {
      // User cancelled share or error
      if ((error as Error).name !== 'AbortError') {
        console.error('Share error:', error);
        toast.error('Share failed');
      }
    } finally {
      setSharing(false);
    }
  };

  const handleCopyImage = async () => {
    try {
      const blob = await onExport();
      if (!blob) {
        toast.error('Failed to generate image');
        return;
      }

      // Try clipboard API
      if (navigator.clipboard && 'write' in navigator.clipboard) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ]);
        setCopied(true);
        toast.success('Image copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
        return;
      }

      // Fallback: Download
      toast.info('Copy not supported. Downloading instead...');
      await handleDownload();
    } catch (error) {
      console.error('Copy error:', error);
      toast.error('Copy failed. Try downloading instead.');
    }
  };

  return (
    <div className="space-y-3">
      {/* Primary action - WhatsApp */}
      <Button
        onClick={handleShareWhatsApp}
        disabled={disabled || sharing}
        className="w-full gap-2 bg-[#25D366] hover:bg-[#1da851] text-white"
        size="lg"
      >
        {sharing ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
        Share to WhatsApp
      </Button>

      {/* Secondary actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleDownload}
          disabled={disabled || downloading}
          className="flex-1 gap-2"
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Download
        </Button>

        <Button
          variant="outline"
          onClick={handleCopyImage}
          disabled={disabled}
          className="flex-1 gap-2"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Images are high resolution (1080px) for best quality
      </p>
    </div>
  );
}
