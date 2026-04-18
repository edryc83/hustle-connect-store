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
    selectTemplate,
    updateToken,
    resetToDefaults,
  } = useFlyer({ product, store });

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-100 flex flex-col h-screen">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading template...</p>
          </div>
        </div>
      )}

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
          onClick={resetToDefaults}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200"
          title="Reset to defaults"
        >
          <RotateCcw className="w-5 h-5 text-gray-600" />
        </button>
      </header>

      {/* Canvas preview */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-2 overflow-hidden">
        {template && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
            className="max-w-[280px] w-full"
          >
            <FlyerCanvas
              ref={canvasRef}
              template={template}
              userState={userState}
              width={280}
              className="mx-auto shadow-xl"
            />
          </motion.div>
        )}
      </div>

      {/* Bottom section */}
      {template && !isLoading && (
        <div className="flex-none bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
          <BottomPanel
            template={template}
            templates={templates}
            userState={userState}
            onSelectTemplate={selectTemplate}
            onUpdateToken={updateToken}
          />

          {/* Action buttons */}
          <div
            className="px-4 pt-2 pb-4 bg-white border-t border-gray-200"
            style={{ paddingBottom: 'max(16px, calc(env(safe-area-inset-bottom) + 12px))' }}
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
