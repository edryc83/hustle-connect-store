import { useRef } from 'react';
import { X, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useFlyerGenerator } from '@/hooks/useFlyerGenerator';
import FlyerHTMLRenderer, { type FlyerHTMLRendererRef } from './FlyerHTMLRenderer';
import FlyerTemplatePicker from './FlyerTemplatePicker';
import FlyerCustomizer from './FlyerCustomizer';
import FlyerExport from './FlyerExport';
import { formatPrice } from '@/lib/currency';
import type { FlyerData } from './templates/html-templates';

interface Product {
  id: string;
  name: string;
  price: number;
  discount_price?: number | null;
  description?: string | null;
  category?: string | null;
  image_url?: string | null;
}

interface FlyerGeneratorModalProps {
  product: Product;
  storeName: string;
  storeSlug: string;
  currency: string;
  whatsappNumber?: string;
  open: boolean;
  onClose: () => void;
}

export default function FlyerGeneratorModal({
  product,
  storeName,
  storeSlug,
  currency,
  whatsappNumber,
  open,
  onClose,
}: FlyerGeneratorModalProps) {
  const rendererRef = useRef<FlyerHTMLRendererRef>(null);

  const displayPrice = formatPrice(
    product.discount_price ?? product.price,
    currency
  );

  const {
    step,
    loading,
    variations,
    selectedTemplate,
    format,
    headline,
    tagline,
    colors,
    selectedColor,
    processedImage,
    imageProcessing,
    selectTemplate,
    setFormat,
    setHeadline,
    setTagline,
    setSelectedColor,
    goBack,
  } = useFlyerGenerator({
    productName: product.name,
    price: displayPrice,
    description: product.description || undefined,
    category: product.category || undefined,
    storeName,
    storeSlug,
    productImageUrl: product.image_url || null,
    whatsappNumber,
  });

  const handleExport = async () => {
    if (!rendererRef.current) return null;
    return rendererRef.current.exportImage('png');
  };

  // Build flyer data for the renderer
  const flyerData: FlyerData = {
    productImage: processedImage,
    productName: product.name,
    headline,
    tagline,
    price: displayPrice,
    storeName,
    storeSlug,
    whatsappNumber,
    accentColor: selectedColor || undefined,
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sticky top-0 z-10 bg-background border-b px-4 py-3">
          <div className="flex items-center gap-3">
            {step === 'customizing' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={goBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle className="flex-1 flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              {step === 'loading' && 'Creating Your Flyer...'}
              {step === 'picking' && 'Pick Your Design'}
              {step === 'customizing' && 'Customize & Share'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Loading State */}
          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                <div className="relative p-4 rounded-full bg-primary/10">
                  <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="font-medium">AI is designing your flyer</p>
                <p className="text-sm text-muted-foreground">
                  {imageProcessing
                    ? 'Removing background...'
                    : 'Generating professional designs...'}
                </p>
              </div>
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Template Picker */}
          {step === 'picking' && (
            <FlyerTemplatePicker
              variations={variations}
              selectedTemplate={selectedTemplate}
              onSelect={selectTemplate}
              flyerData={{
                ...flyerData,
                headline: '', // Use variation headline in picker
                tagline: '',
              }}
            />
          )}

          {/* Customization */}
          {step === 'customizing' && selectedTemplate && (
            <div className="space-y-4">
              {/* Live Preview */}
              <FlyerHTMLRenderer
                ref={rendererRef}
                template={selectedTemplate}
                data={flyerData}
                format={format}
                isPreview
              />

              {/* Customizer */}
              <FlyerCustomizer
                format={format}
                onFormatChange={setFormat}
                colors={colors}
                selectedColor={selectedColor}
                onColorSelect={setSelectedColor}
                headline={headline}
                tagline={tagline}
                onHeadlineChange={setHeadline}
                onTaglineChange={setTagline}
              />

              {/* Export */}
              <FlyerExport
                onExport={handleExport}
                productName={product.name}
                disabled={loading}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
