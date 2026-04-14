import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, Eraser, RotateCcw, Loader2, Plus, X, ZoomIn, Move, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import type { AdditionalImage, LayerOffset } from '../flyerTypes';

interface PhotoTabProps {
  currentImage: string | null;
  originalImage: string | null;
  additionalImages: AdditionalImage[];
  isRemovingBg: boolean;
  productImageScale: number;
  productImageOffset: LayerOffset;
  onImageChange: (url: string) => void;
  onRemoveBackground: () => void;
  onAddImage: (url: string) => void;
  onRemoveImage: (id: string) => void;
  onProductImageScaleChange: (scale: number) => void;
  onProductImageOffsetChange: (offset: LayerOffset) => void;
}

export default function PhotoTab({
  currentImage,
  originalImage,
  additionalImages,
  isRemovingBg,
  productImageScale,
  productImageOffset,
  onImageChange,
  onRemoveBackground,
  onAddImage,
  onRemoveImage,
  onProductImageScaleChange,
  onProductImageOffsetChange,
}: PhotoTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onImageChange(url);
  };

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64 immediately for reliable export
    const reader = new FileReader();
    reader.onload = () => {
      const base64Url = reader.result as string;
      onAddImage(base64Url);
    };
    reader.onerror = () => {
      // Fallback to blob URL if base64 conversion fails
      const url = URL.createObjectURL(file);
      onAddImage(url);
    };
    reader.readAsDataURL(file);
  };

  const handleRestoreOriginal = () => {
    if (originalImage) {
      onImageChange(originalImage);
    }
  };

  return (
    <div className="px-4 py-2 h-full overflow-y-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        onChange={handleLogoSelect}
        className="hidden"
      />

      {/* Current product image preview */}
      <div className="flex gap-3 mb-3">
        {/* Checkered pattern background to show transparency */}
        <div
          className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200 flex-shrink-0"
          style={{
            backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
            backgroundSize: '8px 8px',
            backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
            backgroundColor: '#f9fafb',
          }}
        >
          {currentImage ? (
            <img src={currentImage} alt="Current" className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera className="w-5 h-5 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-sm font-medium text-gray-900">Product Photo</p>
          <p className="text-[10px] text-gray-500">Tap below to edit</p>
        </div>
      </div>

      {/* Product Photo Action buttons */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <Upload className="w-4 h-4 text-gray-700" />
          <span className="text-[10px] font-medium text-gray-700">Upload</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onRemoveBackground}
          disabled={!currentImage || isRemovingBg}
          className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl bg-purple-100 hover:bg-purple-200 transition-colors disabled:opacity-50"
        >
          {isRemovingBg ? (
            <Loader2 className="w-4 h-4 text-purple-700 animate-spin" />
          ) : (
            <Eraser className="w-4 h-4 text-purple-700" />
          )}
          <span className="text-[10px] font-medium text-purple-700">
            {isRemovingBg ? 'Wait...' : 'Remove BG'}
          </span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleRestoreOriginal}
          disabled={!originalImage || currentImage === originalImage}
          className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <RotateCcw className="w-4 h-4 text-gray-700" />
          <span className="text-[10px] font-medium text-gray-700">Restore</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => logoInputRef.current?.click()}
          className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl bg-green-100 hover:bg-green-200 transition-colors"
        >
          <Plus className="w-4 h-4 text-green-700" />
          <span className="text-[10px] font-medium text-green-700">Add Logo</span>
        </motion.button>
      </div>

      {/* Photo Size & Position Controls */}
      {currentImage && (
        <div className="border-t border-gray-100 pt-3 mb-3">
          {/* Size Slider */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700 flex items-center gap-1">
                <ZoomIn className="w-3 h-3" /> Size
              </span>
              <span className="text-[10px] text-gray-500">{Math.round(productImageScale * 100)}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="200"
              value={productImageScale * 100}
              onChange={(e) => onProductImageScaleChange(Number(e.target.value) / 100)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>

          {/* Position Controls */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700 flex items-center gap-1">
                <Move className="w-3 h-3" /> Position
              </span>
              <button
                onClick={() => onProductImageOffsetChange({ x: 0, y: 0 })}
                className="text-[10px] text-purple-600 font-medium"
              >
                Reset
              </button>
            </div>
            <div className="flex items-center justify-center gap-1">
              <div className="grid grid-cols-3 gap-1">
                <div />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onProductImageOffsetChange({ ...productImageOffset, y: productImageOffset.y - 10 })}
                  className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  <ArrowUp className="w-4 h-4 text-gray-700" />
                </motion.button>
                <div />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onProductImageOffsetChange({ ...productImageOffset, x: productImageOffset.x - 10 })}
                  className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  <ArrowLeft className="w-4 h-4 text-gray-700" />
                </motion.button>
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                  <span className="text-[8px] text-gray-400">
                    {Math.round(productImageOffset.x)},{Math.round(productImageOffset.y)}
                  </span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onProductImageOffsetChange({ ...productImageOffset, x: productImageOffset.x + 10 })}
                  className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  <ArrowRight className="w-4 h-4 text-gray-700" />
                </motion.button>
                <div />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onProductImageOffsetChange({ ...productImageOffset, y: productImageOffset.y + 10 })}
                  className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  <ArrowDown className="w-4 h-4 text-gray-700" />
                </motion.button>
                <div />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Images (Logos) */}
      {additionalImages.length > 0 && (
        <div className="border-t border-gray-100 pt-2">
          <p className="text-xs font-medium text-gray-700 mb-2">Added Logos</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {additionalImages.map((img) => (
              <div
                key={img.id}
                className="relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200"
              >
                <img src={img.url} alt="Logo" className="w-full h-full object-cover" />
                <button
                  onClick={() => onRemoveImage(img.id)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-md"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-gray-400 mt-1">Drag logos on canvas to position</p>
        </div>
      )}
    </div>
  );
}
