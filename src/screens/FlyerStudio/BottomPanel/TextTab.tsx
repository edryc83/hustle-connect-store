import React from 'react';
import { Type, Minus, Plus, X } from 'lucide-react';

interface TextTabProps {
  title: string;
  tagline: string;
  badge: string;
  cta: string;
  phone: string;
  address: string;
  fontSize: number;
  onTitleChange: (v: string) => void;
  onTaglineChange: (v: string) => void;
  onBadgeChange: (v: string) => void;
  onCtaChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onAddressChange: (v: string) => void;
  onFontSizeChange: (size: number) => void;
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
  onTitleChange,
  onTaglineChange,
  onBadgeChange,
  onCtaChange,
  onFontSizeChange,
}: TextTabProps) {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFontSizeChange(parseFloat(e.target.value));
  };

  const decrease = () => onFontSizeChange(Math.max(0.5, fontSize - 0.1));
  const increase = () => onFontSizeChange(Math.min(1.5, fontSize + 0.1));
  const percentage = Math.round(fontSize * 100);

  return (
    <div className="px-4 py-2 h-full overflow-y-auto">
      {/* Font Size Slider */}
      <div className="flex items-center gap-2 pb-2 mb-2 border-b border-gray-100">
        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
          <Type className="w-3 h-3" />
          <span>Size</span>
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
