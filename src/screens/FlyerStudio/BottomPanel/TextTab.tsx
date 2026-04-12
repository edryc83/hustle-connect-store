import React from 'react';
import { Type, Minus, Plus, X, Trash2, Palette } from 'lucide-react';
import { TEXT_COLORS } from '../flyerTypes';

interface SelectedLayer {
  id: string;
  type: string;
  fontSize?: number;
  color?: string;
}

interface TextTabProps {
  title: string;
  tagline: string;
  badge: string;
  cta: string;
  phone: string;
  address: string;
  fontSize: number;
  textColor: string;
  selectedLayer?: SelectedLayer | null;
  fontSizeOverrides?: Record<string, number>;
  textColorOverrides?: Record<string, string>;
  onTitleChange: (v: string) => void;
  onTaglineChange: (v: string) => void;
  onBadgeChange: (v: string) => void;
  onCtaChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onAddressChange: (v: string) => void;
  onFontSizeChange: (size: number) => void;
  onTextColorChange: (color: string) => void;
  onFontSizeOverride?: (layerId: string, size: number) => void;
  onTextColorOverride?: (layerId: string, color: string) => void;
  onDeleteLayer?: (layerId: string) => void;
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[10px] text-gray-500 font-medium">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full px-2 py-1.5 pr-7 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function TextTab({
  title,
  tagline,
  badge,
  cta,
  fontSize,
  textColor,
  selectedLayer,
  fontSizeOverrides,
  textColorOverrides,
  onTitleChange,
  onTaglineChange,
  onBadgeChange,
  onCtaChange,
  onFontSizeChange,
  onTextColorChange,
  onFontSizeOverride,
  onTextColorOverride,
  onDeleteLayer,
}: TextTabProps) {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFontSizeChange(parseFloat(e.target.value));
  };

  const decrease = () => onFontSizeChange(Math.max(0.5, fontSize - 0.1));
  const increase = () => onFontSizeChange(Math.min(1.5, fontSize + 0.1));
  const percentage = Math.round(fontSize * 100);

  // Handle selected layer font size
  const selectedLayerFontSize = selectedLayer?.fontSize
    ? (fontSizeOverrides?.[selectedLayer.id] ?? selectedLayer.fontSize)
    : null;

  const selectedLayerColor = selectedLayer?.id
    ? (textColorOverrides?.[selectedLayer.id] ?? selectedLayer.color ?? '#ffffff')
    : '#ffffff';

  const handleLayerSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedLayer && onFontSizeOverride) {
      onFontSizeOverride(selectedLayer.id, parseFloat(e.target.value));
    }
  };

  const handleLayerColorChange = (color: string) => {
    if (selectedLayer && onTextColorOverride) {
      onTextColorOverride(selectedLayer.id, color);
    }
  };

  return (
    <div className="px-4 py-2 h-full overflow-y-auto">
      {/* Selected Layer Controls */}
      {selectedLayer?.type === 'text' && (
        <div className="pb-2 mb-2 border-b border-purple-200 bg-purple-50 -mx-4 px-4 py-2 space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[10px] text-purple-600 font-medium">
              <Type className="w-3 h-3" />
              <span>Selected Text</span>
            </div>
            {selectedLayerFontSize && (
              <>
                <input
                  type="range"
                  min={selectedLayerFontSize * 0.5}
                  max={selectedLayerFontSize * 2}
                  step="1"
                  value={fontSizeOverrides?.[selectedLayer.id] ?? selectedLayerFontSize}
                  onChange={handleLayerSizeChange}
                  className="flex-1 h-1.5 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <span className="text-[10px] font-medium text-purple-600 w-10">
                  {Math.round(fontSizeOverrides?.[selectedLayer.id] ?? selectedLayerFontSize)}px
                </span>
              </>
            )}
            <button
              onClick={() => onDeleteLayer?.(selectedLayer.id)}
              className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-red-500 hover:bg-red-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          {/* Color picker for selected text */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[10px] text-purple-600 font-medium">
              <Palette className="w-3 h-3" />
              <span>Color</span>
            </div>
            <div className="flex gap-1 flex-1">
              {TEXT_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => handleLayerColorChange(color)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    selectedLayerColor === color
                      ? 'border-purple-500 scale-110'
                      : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Global Font Size Slider */}
      <div className="flex items-center gap-2 pb-2 mb-2 border-b border-gray-100">
        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
          <Type className="w-3 h-3" />
          <span>All Text</span>
        </div>
        <button
          onClick={decrease}
          className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center"
        >
          <Minus className="w-3 h-3" />
        </button>
        <input
          type="range"
          min="0.5"
          max="1.5"
          step="0.05"
          value={fontSize}
          onChange={handleSliderChange}
          className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
        <button
          onClick={increase}
          className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center"
        >
          <Plus className="w-3 h-3" />
        </button>
        <span className="text-[10px] font-medium text-gray-600 w-8 text-right">{percentage}%</span>
      </div>

      {/* Text Fields */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <TextInput
          label="Headline"
          value={title}
          onChange={onTitleChange}
          placeholder="NEW"
          maxLength={20}
        />
        <TextInput
          label="Badge"
          value={badge}
          onChange={onBadgeChange}
          placeholder="-20%"
          maxLength={10}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <TextInput
          label="Tagline"
          value={tagline}
          onChange={onTaglineChange}
          placeholder="Style"
          maxLength={30}
        />
        <TextInput
          label="CTA Button"
          value={cta}
          onChange={onCtaChange}
          placeholder="SHOP NOW"
          maxLength={15}
        />
      </div>
    </div>
  );
}
