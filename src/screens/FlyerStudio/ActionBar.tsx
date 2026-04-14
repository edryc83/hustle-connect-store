import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Loader2, Check } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import html2canvas from 'html2canvas';

interface ActionBarProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  storeName: string;
  productName: string;
}

export default function ActionBar({ canvasRef, storeName, productName }: ActionBarProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Convert image URL to base64 using canvas
  const imageToBase64 = (url: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          } else {
            resolve(null);
          }
        } catch (err) {
          console.warn('Canvas conversion failed:', err);
          resolve(null);
        }
      };
      img.onerror = () => {
        console.warn('Image load failed:', url?.substring(0, 50));
        resolve(null);
      };
      img.src = url;
    });
  };

  const captureFlyer = async (): Promise<string | null> => {
    if (!canvasRef.current) return null;

    try {
      const element = canvasRef.current;

      // Pre-load ALL images (product image + logos) as base64 to avoid CORS issues
      const images = element.querySelectorAll('image');
      console.log('Found images to convert:', images.length);

      const imagePromises = Array.from(images).map(async (img) => {
        const href = img.getAttribute('href') || img.getAttribute('xlink:href');
        console.log('Processing image:', href?.substring(0, 80));

        if (!href) return null;

        // Skip if already base64
        if (href.startsWith('data:')) {
          console.log('Already base64, skipping');
          return null;
        }

        // Handle blob URLs - use Image API directly (more reliable)
        if (href.startsWith('blob:')) {
          console.log('Converting blob URL to base64...');
          const dataUrl = await imageToBase64(href);
          if (dataUrl) {
            return { element: img, dataUrl };
          }
          return null;
        }

        // Handle HTTP URLs
        if (href.startsWith('http')) {
          console.log('Converting HTTP URL to base64...');
          // Try fetch first
          try {
            const response = await fetch(href, { mode: 'cors', credentials: 'omit' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const blob = await response.blob();
            return new Promise<{element: Element, dataUrl: string} | null>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                console.log('Converted HTTP image to base64');
                resolve({ element: img, dataUrl: reader.result as string });
              };
              reader.onerror = () => resolve(null);
              reader.readAsDataURL(blob);
            });
          } catch (err) {
            console.warn('Fetch failed, trying Image API:', err);
            // Fallback to Image API
            const dataUrl = await imageToBase64(href);
            if (dataUrl) {
              return { element: img, dataUrl };
            }
            return null;
          }
        }

        return null;
      });

      // Wait for all images to be converted
      const imageResults = await Promise.all(imagePromises);
      console.log('Image conversion results:', imageResults.filter(Boolean).length, 'of', images.length, 'converted');

      // Temporarily replace image hrefs with base64
      const originalHrefs: {element: Element, href: string}[] = [];
      imageResults.forEach((result) => {
        if (result) {
          const originalHref = result.element.getAttribute('href') || result.element.getAttribute('xlink:href') || '';
          originalHrefs.push({ element: result.element, href: originalHref });
          result.element.setAttribute('href', result.dataUrl);
          // Also set xlink:href for SVG compatibility
          result.element.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', result.dataUrl);
          console.log('Replaced href with base64 for export');
        }
      });

      // Wait for DOM to update with new base64 images
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        scale: 3, // Higher quality
        useCORS: true,
        allowTaint: true, // Allow tainted canvas since we've converted to base64
        backgroundColor: null,
        logging: false,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          // Ensure SVG images have crossorigin
          const svgImages = clonedDoc.querySelectorAll('image');
          svgImages.forEach((svgImg) => {
            svgImg.setAttribute('crossorigin', 'anonymous');
          });
        },
      });

      // Restore original hrefs
      originalHrefs.forEach(({ element: el, href }) => {
        el.setAttribute('href', href);
        // Also restore xlink:href
        if (href) {
          el.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', href);
        }
      });

      return canvas.toDataURL('image/png');
    } catch (err) {
      console.error('Failed to capture flyer:', err);
      return null;
    }
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      const dataUrl = await captureFlyer();
      if (!dataUrl) throw new Error('Failed to capture');

      const base64Data = dataUrl.split(',')[1];
      const fileName = `flyer-${storeName.replace(/\s+/g, '-')}-${Date.now()}.png`;

      if (Capacitor.isNativePlatform()) {
        // On iOS, use Share to allow saving to Photos
        const result = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
        });

        // Open share sheet so user can save to Photos
        await Share.share({
          title: 'Save Flyer',
          text: 'Tap "Save Image" to save to your Photos',
          url: result.uri,
          dialogTitle: 'Save Flyer',
        });
      } else {
        // Web: download via link
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    setShareSuccess(false);

    try {
      const dataUrl = await captureFlyer();
      if (!dataUrl) throw new Error('Failed to capture');

      const base64Data = dataUrl.split(',')[1];
      const fileName = `flyer-${storeName.replace(/\s+/g, '-')}-${Date.now()}.png`;

      if (Capacitor.isNativePlatform()) {
        // Save temporarily and share
        const result = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
        });

        await Share.share({
          title: `${productName} - ${storeName}`,
          url: result.uri,
          dialogTitle: 'Share to WhatsApp Status',
        });
      } else {
        // Web fallback: try native share or copy to clipboard
        if (navigator.share) {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], fileName, { type: 'image/png' });

          await navigator.share({
            title: `${productName} - ${storeName}`,
            files: [file],
          });
        } else {
          // Fallback: open WhatsApp with text only
          const text = encodeURIComponent(`Check out ${productName} from ${storeName}!`);
          window.open(`https://wa.me/?text=${text}`, '_blank');
        }
      }

      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    } catch (err) {
      // User might have cancelled the share
      console.log('Share cancelled or error:', err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="flex gap-3">
      {/* Download Button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleDownload}
        disabled={isDownloading}
        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gray-900 text-white font-bold text-base shadow-lg shadow-gray-900/30 transition-all hover:bg-gray-800 active:bg-gray-700 disabled:opacity-50"
      >
        {isDownloading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : downloadSuccess ? (
          <Check className="w-5 h-5" />
        ) : (
          <Download className="w-5 h-5" />
        )}
        <span>{downloadSuccess ? 'Saved!' : 'Download'}</span>
      </motion.button>

      {/* WhatsApp Share Button - Primary CTA */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleShare}
        disabled={isSharing}
        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold text-base shadow-lg shadow-green-500/40 transition-all hover:shadow-green-500/50 active:shadow-green-500/20 disabled:opacity-50"
      >
        {isSharing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : shareSuccess ? (
          <Check className="w-5 h-5" />
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </>
        )}
        <span>{shareSuccess ? 'Shared!' : 'WhatsApp'}</span>
      </motion.button>
    </div>
  );
}
