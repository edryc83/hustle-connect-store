import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, Palette, Type, ImageIcon, Wand2, Plus, X, Loader2, ZoomIn, ZoomOut, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ALargeSmall } from 'lucide-react';
import TemplatesTab from './TemplatesTab';
import type { TemplateJSON, TemplateEntry, UserState } from '../flyerTypes';
import { FONT_OPTIONS } from '../flyerTypes';
import type { AdditionalImage } from '../FlyerCanvas';
import type { TextOverrides } from '../useFlyer';

type TabId = 'templates' | 'text' | 'style' | 'media';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { id: 'templates', label: 'Design', icon: <Layout className="w-4 h-4" /> },
  { id: 'text', label: 'Text', icon: <Type className="w-4 h-4" /> },
  { id: 'style', label: 'Style', icon: <Palette className="w-4 h-4" /> },
  { id: 'media', label: 'Media', icon: <ImageIcon className="w-4 h-4" /> },
];

interface BottomPanelProps {
  template: TemplateJSON;
  templates: TemplateEntry[];
  userState: UserState;
  isRemovingBg: boolean;
  isRemovingLogoBg: boolean;
  additionalImages: AdditionalImage[];
  productImageScale: number;
  productImageOffset: { x: number; y: number };
  textOverrides: TextOverrides;
  onSelectTemplate: (id: string) => void;
  onUpdateToken: (key: string, value: string) => void;
  onRemoveBackground: () => void;
  onAddLogo: (url: string) => void;
  onRemoveLogo: (id: string) => void;
  onSetProductImageScale: (scale: number) => void;
  onSetProductImageOffset: (offset: { x: number; y: number }) => void;
  onSetTextFontScale: (tokenKey: string, scale: number) => void;
}

export default function BottomPanel({
  template,
  templates,
  userState,
  isRemovingBg,
  isRemovingLogoBg,
  additionalImages,
  productImageScale,
  productImageOffset,
  textOverrides,
  onSelectTemplate,
  onUpdateToken,
  onRemoveBackground,
  onAddLogo,
  onRemoveLogo,
  onSetProductImageScale,
  onSetProductImageOffset,
  onSetTextFontScale,
}: BottomPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('text');
  const [selectedTextKey, setSelectedTextKey] = useState<string | null>(null);

  // Group tokens by type
  const groupedTokens = useMemo(() => {
    const text: [string, { type: string; label: string; default: string }][] = [];
    const color: [string, { type: string; label: string; default: string }][] = [];
    const image: [string, { type: string; label: string; default: string }][] = [];
    const font: [string, { type: string; label: string; default: string }][] = [];

    for (const [key, config] of Object.entries(template.tokens)) {
      if (config.type === 'text') text.push([key, config]);
      else if (config.type === 'color') color.push([key, config]);
      else if (config.type === 'image') image.push([key, config]);
      else if (config.type === 'font') font.push([key, config]);
    }

    return { text, color, image, font };
  }, [template.tokens]);

  // Handle image upload
  const handleImageUpload = (key: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      onUpdateToken(key, e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle logo upload
  const handleLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      onAddLogo(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white">
      {/* Tab bar */}
      <div className="flex border-b border-gray-100 px-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 relative transition-colors ${
                isActive ? 'text-purple-600' : 'text-gray-400'
              }`}
            >
              {tab.icon}
              <span className="text-[9px] font-medium">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-purple-500 rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="h-[140px] overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* TEMPLATES TAB */}
          {activeTab === 'templates' && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.1 }}
              className="h-full"
            >
              <TemplatesTab
                templates={templates}
                selectedId={template.id}
                userState={userState}
                currentTemplate={template}
                onSelect={onSelectTemplate}
              />
            </motion.div>
          )}

          {/* TEXT TAB */}
          {activeTab === 'text' && (
            <motion.div
              key="text"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.1 }}
              className="h-full p-3 space-y-2 overflow-y-auto"
            >
              {/* Selected text font size control */}
              {selectedTextKey && (
                <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg mb-2">
                  <ALargeSmall className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span className="text-[10px] text-purple-700 font-medium w-14">Size</span>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={textOverrides.fontScale[selectedTextKey] ?? 1}
                    onChange={(e) => onSetTextFontScale(selectedTextKey, parseFloat(e.target.value))}
                    className="flex-1 h-1.5 bg-purple-200 rounded-full appearance-none cursor-pointer accent-purple-600"
                  />
                  <span className="text-[10px] text-purple-600 font-medium w-8">
                    {Math.round((textOverrides.fontScale[selectedTextKey] ?? 1) * 100)}%
                  </span>
                  <button
                    onClick={() => setSelectedTextKey(null)}
                    className="p-1 text-purple-400 hover:text-purple-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <p className="text-[9px] text-gray-400 italic">Tip: Tap a field to adjust its font size. Drag text on canvas to move.</p>

              {groupedTokens.text.map(([key, config]) => (
                <div
                  key={key}
                  className={`flex items-center gap-2 p-1 rounded-lg transition-colors ${
                    selectedTextKey === key ? 'bg-purple-50 ring-1 ring-purple-300' : ''
                  }`}
                  onClick={() => setSelectedTextKey(key)}
                >
                  <label className="text-xs text-gray-700 font-medium w-16 truncate flex-shrink-0 cursor-pointer">{config.label}</label>
                  <input
                    type="text"
                    value={userState[key] || ''}
                    onChange={(e) => onUpdateToken(key, e.target.value)}
                    placeholder={config.default}
                    className="flex-1 text-sm text-black font-medium px-2 py-1.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder:text-gray-400"
                  />
                  {(textOverrides.fontScale[key] && textOverrides.fontScale[key] !== 1) && (
                    <span className="text-[9px] text-purple-500 font-medium">
                      {Math.round(textOverrides.fontScale[key] * 100)}%
                    </span>
                  )}
                  {userState[key] && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onUpdateToken(key, ''); }}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {/* STYLE TAB (Colors + Fonts) */}
          {activeTab === 'style' && (
            <motion.div
              key="style"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.1 }}
              className="h-full p-3 space-y-3 overflow-y-auto"
            >
              {/* Font selection */}
              {groupedTokens.font.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-medium text-gray-600 uppercase tracking-wide">Fonts</p>
                  <div className="flex gap-2 flex-wrap">
                    {groupedTokens.font.map(([key, config]) => (
                      <select
                        key={key}
                        value={userState[key] || config.default}
                        onChange={(e) => onUpdateToken(key, e.target.value)}
                        className="text-xs px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        {FONT_OPTIONS.map((font) => (
                          <option key={font.id} value={font.family}>{font.name}</option>
                        ))}
                      </select>
                    ))}
                  </div>
                </div>
              )}

              {/* Color pickers */}
              <div className="space-y-2">
                <p className="text-[10px] font-medium text-gray-600 uppercase tracking-wide">Colors</p>
                <div className="grid grid-cols-3 gap-2">
                  {groupedTokens.color.slice(0, 6).map(([key, config]) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={userState[key] || config.default}
                        onChange={(e) => onUpdateToken(key, e.target.value)}
                        className="w-7 h-7 rounded-lg border border-gray-200 cursor-pointer flex-shrink-0"
                      />
                      <span className="text-[9px] text-gray-500 truncate">{config.label}</span>
                    </div>
                  ))}
                </div>
                {groupedTokens.color.length > 6 && (
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {groupedTokens.color.slice(6).map(([key, config]) => (
                      <div key={key} className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={userState[key] || config.default}
                          onChange={(e) => onUpdateToken(key, e.target.value)}
                          className="w-7 h-7 rounded-lg border border-gray-200 cursor-pointer flex-shrink-0"
                        />
                        <span className="text-[9px] text-gray-500 truncate">{config.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* MEDIA TAB */}
          {activeTab === 'media' && (
            <motion.div
              key="media"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.1 }}
              className="h-full p-3 space-y-3 overflow-y-auto"
            >
              {/* Product Image Row */}
              <div className="flex items-start gap-2">
                {groupedTokens.image.map(([key, config]) => (
                  <div key={key} className="flex-shrink-0">
                    <p className="text-[10px] text-gray-500 mb-1">{config.label}</p>
                    <label className="relative w-14 h-14 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center cursor-pointer hover:border-purple-400 transition-colors overflow-hidden">
                      {userState[key] ? (
                        <img
                          src={userState[key]}
                          alt={config.label}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(key, file);
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </label>
                  </div>
                ))}

                {/* Remove BG button */}
                {groupedTokens.image.length > 0 && (
                  <button
                    onClick={onRemoveBackground}
                    disabled={isRemovingBg}
                    className="flex flex-col items-center gap-1 px-2 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 disabled:opacity-50 transition-colors"
                  >
                    {isRemovingBg ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4" />
                    )}
                    <span className="text-[8px] font-medium">Remove BG</span>
                  </button>
                )}

                {/* Add Logo */}
                <div className="flex-shrink-0">
                  <p className="text-[10px] text-gray-500 mb-1">Logo</p>
                  <label className="relative w-14 h-14 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-purple-400 transition-colors">
                    {isRemovingLogoBg ? (
                      <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                    ) : (
                      <Plus className="w-5 h-5 text-gray-400" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleLogoUpload(file);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Added logos */}
                {additionalImages.map((img) => (
                  <div key={img.id} className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                    <img src={img.url} alt="Logo" className="w-full h-full object-contain bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHJlY3QgZmlsbD0iI2ZmZiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2Ii8+PHJlY3QgZmlsbD0iI2UwZTBlMCIgd2lkdGg9IjgiIGhlaWdodD0iOCIvPjxyZWN0IGZpbGw9IiNlMGUwZTAiIHg9IjgiIHk9IjgiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiLz48L3N2Zz4=')]" />
                    <button
                      onClick={() => onRemoveLogo(img.id)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Image Size & Position Controls */}
              {groupedTokens.image.length > 0 && (
                <div className="flex items-center gap-4">
                  {/* Size Control */}
                  <div className="flex items-center gap-2">
                    <ZoomOut className="w-4 h-4 text-gray-400" />
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={productImageScale}
                      onChange={(e) => onSetProductImageScale(parseFloat(e.target.value))}
                      className="w-20 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-purple-500"
                    />
                    <ZoomIn className="w-4 h-4 text-gray-400" />
                    <span className="text-[10px] text-gray-500 w-8">{Math.round(productImageScale * 100)}%</span>
                  </div>

                  {/* Position Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onSetProductImageOffset({ ...productImageOffset, x: productImageOffset.x - 20 })}
                      className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => onSetProductImageOffset({ ...productImageOffset, y: productImageOffset.y - 20 })}
                        className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <ArrowUp className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                      <button
                        onClick={() => onSetProductImageOffset({ ...productImageOffset, y: productImageOffset.y + 20 })}
                        className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <ArrowDown className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                    </div>
                    <button
                      onClick={() => onSetProductImageOffset({ ...productImageOffset, x: productImageOffset.x + 20 })}
                      className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
