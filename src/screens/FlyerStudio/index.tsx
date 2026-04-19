import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, RotateCcw } from 'lucide-react';
import { useFlyer, type ProductData, type StoreData } from './useFlyer';
import FlyerCanvas from './FlyerCanvas';
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
    return () => setIsOpen(false);
  }, [setIsOpen]);

  const {
    template,
    templates,
    userState,
    isLoading,
    isRemovingBg,
    isRemovingLogoBg,
    additionalImages,
    productImageScale,
    productImageOffset,
    textOverrides,
    selectTemplate,
    updateToken,
    resetToDefaults,
    removeBackground,
    addLogo,
    removeLogo,
    setProductImageScale,
    setProductImageOffset,
    setTextFontScale,
    setTextPosition,
  } = useFlyer({ product, store });

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-900 flex flex-col h-screen">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Loading template...</p>
          </div>
        </div>
      )}

      {/* Header - minimal */}
      <header
        className="flex-none flex items-center justify-between px-3 py-1.5 bg-gray-900/80 backdrop-blur-sm"
        style={{ paddingTop: 'max(4px, env(safe-area-inset-top))' }}
      >
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 active:bg-gray-700"
        >
          <X className="w-5 h-5 text-gray-300" />
        </button>

        <h1 className="text-xs font-medium text-gray-400">Flyer Studio</h1>

        <button
          onClick={resetToDefaults}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 active:bg-gray-700"
          title="Reset to defaults"
        >
          <RotateCcw className="w-4 h-4 text-gray-300" />
        </button>
      </header>

      {/* Canvas preview - takes maximum space */}
      <div className="flex-1 min-h-0 flex items-center justify-center px-2 py-1 overflow-hidden">
        {template && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
            className="w-full h-full flex items-center justify-center"
          >
            <FlyerCanvas
              ref={canvasRef}
              template={template}
              userState={userState}
              additionalImages={additionalImages}
              productImageScale={productImageScale}
              productImageOffset={productImageOffset}
              textOverrides={textOverrides}
              onTextDrag={setTextPosition}
              className="max-h-full w-auto shadow-2xl"
              style={{ maxWidth: '95%' }}
            />
          </motion.div>
        )}
      </div>

      {/* Bottom section - compact */}
      {template && !isLoading && (
        <div className="flex-none bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
          <BottomPanel
            template={template}
            templates={templates}
            userState={userState}
            isRemovingBg={isRemovingBg}
            isRemovingLogoBg={isRemovingLogoBg}
            additionalImages={additionalImages}
            productImageScale={productImageScale}
            productImageOffset={productImageOffset}
            textOverrides={textOverrides}
            onSelectTemplate={selectTemplate}
            onUpdateToken={updateToken}
            onRemoveBackground={removeBackground}
            onAddLogo={addLogo}
            onRemoveLogo={removeLogo}
            onSetProductImageScale={setProductImageScale}
            onSetProductImageOffset={setProductImageOffset}
            onSetTextFontScale={setTextFontScale}
          />

          {/* Action buttons */}
          <div
            className="px-4 pt-2 pb-3 bg-white"
            style={{ paddingBottom: 'max(12px, calc(env(safe-area-inset-bottom) + 8px))' }}
          >
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
