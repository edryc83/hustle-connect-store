import React, { useRef, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, RefreshCw } from 'lucide-react';
import { useFlyer, type ProductData, type StoreData } from './useFlyer';
import FlyerCanvas from './FlyerCanvas';
import GeneratingOverlay from './GeneratingOverlay';
import BottomPanel from './BottomPanel';
import ActionBar from './ActionBar';
import { useFlyerStudio } from '@/contexts/FlyerStudioContext';

interface FlyerStudioProps {
  product: ProductData;
  store: StoreData;
  onClose: () => void;
}

export default function FlyerStudio({ product, store, onClose }: FlyerStudioProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { setIsOpen } = useFlyerStudio();

  // Hide bottom navigation when FlyerStudio is open
  useEffect(() => {
    setIsOpen(true);
    return () => {
      setIsOpen(false);
    };
  }, [setIsOpen]);

  const {
    flyer,
    templateJson,
    templates,
    extractedColors,
    selectTemplate,
    setTitle,
    setTagline,
    setBadge,
    setCta,
    setPhone,
    setAddress,
    setBgColor,
    setAccentColor,
    setFont,
    setFontSize,
    setProductImage,
    setLayerOffset,
    setFontSizeOverride,
    setTextColor,
    setTextColorOverride,
    deleteLayer,
    restoreDeletedLayers,
    selectLayer,
    addImage,
    updateImage,
    removeImage,
    removeBackground,
    isRemovingBg,
    regenerate,
  } = useFlyer({ product, store });

  // Compute selected layer info for the bottom panel
  const selectedLayer = useMemo(() => {
    if (!flyer.selectedLayerId || !templateJson) return null;
    const layer = templateJson.layers.find((l: any) => l.id === flyer.selectedLayerId);
    if (!layer) return null;
    return {
      id: layer.id,
      type: layer.type,
      fontSize: layer.fontSize,
      color: layer.color,
    };
  }, [flyer.selectedLayerId, templateJson]);

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-100 flex flex-col h-screen">
      {/* Loading overlay */}
      <GeneratingOverlay
        isVisible={flyer.isGenerating}
        currentStep={flyer.generationStep}
        productName={product.name}
      />

      {/* Header */}
      <header
        className="flex-none flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200"
        style={{ paddingTop: 'max(8px, env(safe-area-inset-top))' }}
      >
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <h1 className="text-sm font-semibold text-gray-900">Flyer Studio</h1>

        <button
          onClick={regenerate}
          disabled={flyer.isGenerating}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 text-gray-600 ${flyer.isGenerating ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {/* Canvas preview - takes available space */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-2 overflow-hidden">
        {templateJson && !flyer.isGenerating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
            className="max-w-[280px] w-full"
          >
            <FlyerCanvas
              ref={canvasRef}
              templateJson={templateJson}
              flyer={flyer}
              width={280}
              onImageUpdate={updateImage}
              onLayerMove={setLayerOffset}
              onLayerSelect={selectLayer}
              className="mx-auto shadow-xl"
            />
          </motion.div>
        )}
      </div>

      {/* Bottom section - fixed at bottom */}
      {!flyer.isGenerating && (
        <div className="flex-none bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
          <BottomPanel
            flyer={flyer}
            templates={templates}
            extractedColors={extractedColors}
            originalImageUrl={product.imageUrl}
            isRemovingBg={isRemovingBg}
            templateJson={templateJson}
            selectedLayer={selectedLayer}
            onSelectTemplate={selectTemplate}
            onTitleChange={setTitle}
            onTaglineChange={setTagline}
            onBadgeChange={setBadge}
            onCtaChange={setCta}
            onPhoneChange={setPhone}
            onAddressChange={setAddress}
            onBgColorChange={setBgColor}
            onAccentColorChange={setAccentColor}
            onTextColorChange={setTextColor}
            onFontChange={setFont}
            onFontSizeChange={setFontSize}
            onFontSizeOverride={setFontSizeOverride}
            onTextColorOverride={setTextColorOverride}
            onDeleteLayer={deleteLayer}
            onImageChange={setProductImage}
            onRemoveBackground={removeBackground}
            onAddImage={addImage}
            onRemoveImage={removeImage}
          />

          {/* Action buttons - ALWAYS visible above safe area */}
          <div className="px-4 pt-2 pb-4 bg-white border-t border-gray-200" style={{ paddingBottom: 'max(16px, calc(env(safe-area-inset-bottom) + 12px))' }}>
            <ActionBar
              canvasRef={canvasRef}
              storeName={store.name}
              productName={product.name}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Re-export types for consumers
export type { ProductData, StoreData } from './useFlyer';
