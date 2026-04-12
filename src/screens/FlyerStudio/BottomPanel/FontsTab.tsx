import React from 'react';
import { motion } from 'framer-motion';
import { FONT_OPTIONS } from '../flyerTypes';

interface FontsTabProps {
  selectedFont: string;
  onFontChange: (font: string) => void;
}

export default function FontsTab({ selectedFont, onFontChange }: FontsTabProps) {
  return (
    <div className="flex gap-3 px-4 py-3 overflow-x-auto scrollbar-hide">
      {FONT_OPTIONS.map((font) => {
        const isSelected = selectedFont === font.family;

        return (
          <motion.button
            key={font.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onFontChange(font.family)}
            className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all flex-shrink-0 ${
              isSelected
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <span
              className="text-2xl"
              style={{ fontFamily: font.family }}
            >
              Aa
            </span>
            <span className={`text-xs font-medium ${isSelected ? 'text-purple-600' : 'text-gray-600'}`}>
              {font.name}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
