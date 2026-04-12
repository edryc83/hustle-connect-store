import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, Eraser, RotateCcw, Loader2, Plus, X } from 'lucide-react';
import type { AdditionalImage } from '../flyerTypes';

interface PhotoTabProps {
  currentImage: string | null;
  originalImage: string | null;
  additionalImages: AdditionalImage[];
  isRemovingBg: boolean;
  onImageChange: (url: string) => void;
  onRemoveBackground: () => void;
  onAddImage: (url: string) => void;
  onRemoveImage: (id: string) => void;
}

export default function PhotoTab({
  currentImage,
  originalImage,
  additionalImages,
  isRemovingBg,
  onImageChange,
  onRemoveBackground,
  onAddImage,
  onRemoveImage,
}: PhotoTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onImageChange(url);
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onAddImage(url);
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
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200 flex-shrink-0">
          {currentImage ? (
            <img src={currentImage} alt="Current" className="w-full h-full object-cover" />
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
