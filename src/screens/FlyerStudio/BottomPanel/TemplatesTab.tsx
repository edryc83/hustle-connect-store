import React, { memo, useState } from 'react';
import { motion } from 'framer-motion';
import type { TemplateEntry, TemplateJSON, UserState } from '../flyerTypes';
import { CATEGORY_FILTERS } from '../flyerTypes';
import FlyerCanvas from '../FlyerCanvas';

interface TemplatesTabProps {
  templates: TemplateEntry[];
  selectedId: string;
  userState: UserState;
  currentTemplate: TemplateJSON;
  onSelect: (id: string) => void;
}

const TemplateThumbnail = memo(function TemplateThumbnail({
  template,
  isSelected,
  userState,
  onSelect,
}: {
  template: TemplateEntry;
  isSelected: boolean;
  userState: UserState;
  onSelect: () => void;
}) {
  // Use template defaults for preview
  const previewState: UserState = {};
  for (const [key, config] of Object.entries(template.data.tokens)) {
    previewState[key] = config.default;
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onSelect}
      className={`relative flex-shrink-0 w-24 rounded-xl overflow-hidden border-2 transition-colors ${
        isSelected ? 'border-purple-500' : 'border-transparent'
      }`}
    >
      <FlyerCanvas
        template={template.data}
        userState={previewState}
        width={96}
        className="pointer-events-none"
      />
      {isSelected && (
        <motion.div
          layoutId="template-selected"
          className="absolute inset-0 bg-purple-500/20 flex items-center justify-center"
        >
          <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </motion.div>
      )}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
        <p className="text-[10px] text-white font-medium truncate">{template.name}</p>
      </div>
    </motion.button>
  );
});

export default function TemplatesTab({ templates, selectedId, userState, currentTemplate, onSelect }: TemplatesTabProps) {
  const [category, setCategory] = useState('all');

  const filtered = category === 'all'
    ? templates
    : templates.filter((t) => t.category === category);

  return (
    <div className="flex flex-col h-full">
      {/* Category filters */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
        {CATEGORY_FILTERS.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              category === cat.id
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="flex gap-3 px-4 py-2 overflow-x-auto scrollbar-hide">
        {filtered.map((template) => (
          <TemplateThumbnail
            key={template.id}
            template={template}
            isSelected={template.id === selectedId}
            userState={userState}
            onSelect={() => onSelect(template.id)}
          />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 py-4">No templates in this category</p>
        )}
      </div>
    </div>
  );
}
