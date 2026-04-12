import React from 'react';
import { motion } from 'framer-motion';
import { BG_COLORS, ACCENT_COLORS } from '../flyerTypes';

interface ColorsTabProps {
  bgColor: string;
  accentColor: string;
  extractedColors: string[];
  onBgColorChange: (color: string) => void;
  onAccentColorChange: (color: string) => void;
}

function ColorSwatch({
  color,
  isSelected,
  onClick,
  size = 'md',
}: {
  color: string;
  isSelected: boolean;
  onClick: () => void;
  size?: 'sm' | 'md';
}) {
  const sizeClasses = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`${sizeClasses} rounded-full flex-shrink-0 transition-all ${
        isSelected ? 'ring-2 ring-offset-2 ring-purple-500' : ''
      }`}
      style={{ backgroundColor: color }}
    >
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-full h-full rounded-full flex items-center justify-center"
        >
          <svg
            className={`w-4 h-4 ${
              isLightColor(color) ? 'text-gray-800' : 'text-white'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

export default function ColorsTab({
  bgColor,
  accentColor,
  extractedColors,
  onBgColorChange,
  onAccentColorChange,
}: ColorsTabProps) {
  return (
    <div className="flex flex-col gap-4 px-4 py-3">
      {/* Extracted Colors */}
      {extractedColors.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium">From Your Image</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {extractedColors.map((color, idx) => (
              <ColorSwatch
                key={`extracted-${idx}`}
                color={color}
                isSelected={bgColor === color}
                onClick={() => onBgColorChange(color)}
                size="sm"
              />
            ))}
          </div>
        </div>
      )}

      {/* Background Colors */}
      <div>
        <p className="text-xs text-gray-500 mb-2 font-medium">Background</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {BG_COLORS.map((color) => (
            <ColorSwatch
              key={`bg-${color}`}
              color={color}
              isSelected={bgColor === color}
              onClick={() => onBgColorChange(color)}
            />
          ))}
        </div>
      </div>

      {/* Accent Colors */}
      <div>
        <p className="text-xs text-gray-500 mb-2 font-medium">Accent</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {ACCENT_COLORS.map((color) => (
            <ColorSwatch
              key={`accent-${color}`}
              color={color}
              isSelected={accentColor === color}
              onClick={() => onAccentColorChange(color)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
