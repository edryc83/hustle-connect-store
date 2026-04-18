import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, Palette, Type, ImageIcon } from 'lucide-react';
import TemplatesTab from './TemplatesTab';
import type { TemplateJSON, TemplateEntry, UserState } from '../flyerTypes';

type TabId = 'templates' | 'content' | 'colors' | 'media';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { id: 'templates', label: 'Templates', icon: <Layout className="w-5 h-5" /> },
  { id: 'content', label: 'Text', icon: <Type className="w-5 h-5" /> },
  { id: 'colors', label: 'Colors', icon: <Palette className="w-5 h-5" /> },
  { id: 'media', label: 'Media', icon: <ImageIcon className="w-5 h-5" /> },
];

interface BottomPanelProps {
  template: TemplateJSON;
  templates: TemplateEntry[];
  userState: UserState;
  onSelectTemplate: (id: string) => void;
  onUpdateToken: (key: string, value: string) => void;
}

export default function BottomPanel({
  template,
  templates,
  userState,
  onSelectTemplate,
  onUpdateToken,
}: BottomPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('templates');

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

      {/* Tab content */}
      <div className="h-[120px] overflow-y-auto">
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
                selectedId={template.id}
                userState={userState}
                currentTemplate={template}
                onSelect={onSelectTemplate}
              />
            </motion.div>
          )}

          {activeTab === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="h-full p-3 space-y-2"
            >
              {groupedTokens.text.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No text fields</p>
              ) : (
                groupedTokens.text.map(([key, config]) => (
                  <div key={key} className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 w-20 truncate">{config.label}</label>
                    <input
                      type="text"
                      value={userState[key] || ''}
                      onChange={(e) => onUpdateToken(key, e.target.value)}
                      placeholder={config.default}
                      className="flex-1 text-sm px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'colors' && (
            <motion.div
              key="colors"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="h-full p-3"
            >
              {groupedTokens.color.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No color options</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {groupedTokens.color.map(([key, config]) => (
                    <div key={key} className="flex items-center gap-2">
                      <input
                        type="color"
                        value={userState[key] || config.default}
                        onChange={(e) => onUpdateToken(key, e.target.value)}
                        className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer"
                      />
                      <span className="text-xs text-gray-600 truncate">{config.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'media' && (
            <motion.div
              key="media"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="h-full p-3"
            >
              {groupedTokens.image.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No image fields</p>
              ) : (
                <div className="flex gap-3 overflow-x-auto">
                  {groupedTokens.image.map(([key, config]) => (
                    <div key={key} className="flex-shrink-0">
                      <label className="text-xs text-gray-500 mb-1 block">{config.label}</label>
                      <label className="relative w-20 h-20 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-purple-400 transition-colors overflow-hidden">
                        {userState[key] ? (
                          <img
                            src={userState[key]}
                            alt={config.label}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-gray-400" />
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
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
