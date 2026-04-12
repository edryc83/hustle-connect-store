import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, Palette, Type, LetterText, ImageIcon } from 'lucide-react';
import TemplatesTab from './TemplatesTab';
import ColorsTab from './ColorsTab';
import TextTab from './TextTab';
import FontsTab from './FontsTab';
import PhotoTab from './PhotoTab';
import type { FlyerState, TemplateEntry, AdditionalImage } from '../flyerTypes';

type TabId = 'templates' | 'photo' | 'colors' | 'text' | 'fonts';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { id: 'templates', label: 'Templates', icon: <Layout className="w-5 h-5" /> },
  { id: 'colors', label: 'Colors', icon: <Palette className="w-5 h-5" /> },
  { id: 'text', label: 'Text', icon: <Type className="w-5 h-5" /> },
  { id: 'fonts', label: 'Fonts', icon: <LetterText className="w-5 h-5" /> },
  { id: 'photo', label: 'Media', icon: <ImageIcon className="w-5 h-5" /> },
];

interface SelectedLayer {
  id: string;
  type: string;
  fontSize?: number;
}

interface BottomPanelProps {
  flyer: FlyerState;
  templates: TemplateEntry[];
  extractedColors: string[];
  originalImageUrl: string | null;
  isRemovingBg: boolean;
  templateJson: any;
  selectedLayer?: SelectedLayer | null;
  onSelectTemplate: (id: string) => void;
  onTitleChange: (v: string) => void;
  onTaglineChange: (v: string) => void;
  onBadgeChange: (v: string) => void;
  onCtaChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onAddressChange: (v: string) => void;
  onBgColorChange: (v: string) => void;
  onAccentColorChange: (v: string) => void;
  onFontChange: (v: string) => void;
  onFontSizeChange: (size: number) => void;
  onFontSizeOverride: (layerId: string, size: number) => void;
  onDeleteLayer: (layerId: string) => void;
  onImageChange: (url: string) => void;
  onRemoveBackground: () => void;
  onAddImage: (url: string) => void;
  onRemoveImage: (id: string) => void;
}

export default function BottomPanel({
  flyer,
  templates,
  extractedColors,
  originalImageUrl,
  isRemovingBg,
  templateJson,
  selectedLayer,
  onSelectTemplate,
  onTitleChange,
  onTaglineChange,
  onBadgeChange,
  onCtaChange,
  onPhoneChange,
  onAddressChange,
  onBgColorChange,
  onAccentColorChange,
  onFontChange,
  onFontSizeChange,
  onFontSizeOverride,
  onDeleteLayer,
  onImageChange,
  onRemoveBackground,
  onAddImage,
  onRemoveImage,
}: BottomPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('templates');

  return (
    <div className="bg-white">
      {/* Tab bar */}
      <div className="flex border-b border-gray-100">
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

      {/* Tab content - proper height for usability */}
      <div className="h-[160px] overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'templates' && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              <TemplatesTab
                templates={templates}
                selectedId={flyer.template}
                flyer={flyer}
                onSelect={onSelectTemplate}
              />
            </motion.div>
          )}

          {activeTab === 'photo' && (
            <motion.div
              key="photo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              <PhotoTab
                currentImage={flyer.productImage}
                originalImage={originalImageUrl}
                additionalImages={flyer.additionalImages}
                isRemovingBg={isRemovingBg}
                onImageChange={onImageChange}
                onRemoveBackground={onRemoveBackground}
                onAddImage={onAddImage}
                onRemoveImage={onRemoveImage}
              />
            </motion.div>
          )}

          {activeTab === 'colors' && (
            <motion.div
              key="colors"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="h-full overflow-y-auto"
            >
              <ColorsTab
                bgColor={flyer.bgColor}
                accentColor={flyer.accentColor}
                extractedColors={extractedColors}
                onBgColorChange={onBgColorChange}
                onAccentColorChange={onAccentColorChange}
              />
            </motion.div>
          )}

          {activeTab === 'text' && (
            <motion.div
              key="text"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="h-full overflow-y-auto"
            >
              <TextTab
                title={flyer.title}
                tagline={flyer.tagline}
                badge={flyer.badge}
                cta={flyer.cta}
                phone={flyer.phone}
                address={flyer.address}
                fontSize={flyer.fontSize}
                selectedLayer={selectedLayer}
                fontSizeOverrides={flyer.fontSizeOverrides}
                onTitleChange={onTitleChange}
                onTaglineChange={onTaglineChange}
                onBadgeChange={onBadgeChange}
                onCtaChange={onCtaChange}
                onPhoneChange={onPhoneChange}
                onAddressChange={onAddressChange}
                onFontSizeChange={onFontSizeChange}
                onFontSizeOverride={onFontSizeOverride}
                onDeleteLayer={onDeleteLayer}
              />
            </motion.div>
          )}

          {activeTab === 'fonts' && (
            <motion.div
              key="fonts"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              <FontsTab
                selectedFont={flyer.font}
                onFontChange={onFontChange}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
