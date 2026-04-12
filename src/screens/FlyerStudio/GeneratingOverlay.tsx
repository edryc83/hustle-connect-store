import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GENERATION_STEPS } from './flyerTypes';

interface GeneratingOverlayProps {
  isVisible: boolean;
  currentStep: number;
  productName?: string;
}

export default function GeneratingOverlay({ isVisible, currentStep, productName }: GeneratingOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900"
        >
          {/* Animated background circles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute w-96 h-96 rounded-full bg-purple-500/20 blur-3xl"
              animate={{
                x: ['-10%', '10%', '-10%'],
                y: ['-10%', '15%', '-10%'],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ top: '-20%', left: '-10%' }}
            />
            <motion.div
              className="absolute w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl"
              animate={{
                x: ['10%', '-10%', '10%'],
                y: ['10%', '-15%', '10%'],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              style={{ bottom: '-15%', right: '-10%' }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center px-8 max-w-sm">
            {/* Animated logo/spinner */}
            <div className="relative mb-8">
              <motion.div
                className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-2 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400"
                animate={{ scale: [0.9, 1.1, 0.9] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute inset-4 rounded-lg bg-white flex items-center justify-center"
                animate={{ scale: [1, 0.95, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                <span className="text-2xl">✨</span>
              </motion.div>
            </div>

            {/* Title */}
            <motion.h2
              className="text-2xl font-bold text-white mb-2 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {productName ? `Creating ${productName} Flyer` : 'Creating Your Flyer'}
            </motion.h2>

            <motion.p
              className="text-purple-200 text-sm mb-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {productName
                ? `AI is crafting compelling copy for ${productName}`
                : 'AI is crafting the perfect design'}
            </motion.p>

            {/* Steps */}
            <div className="w-full space-y-3">
              {GENERATION_STEPS.map((step, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <div className="relative w-6 h-6 flex-shrink-0">
                    {index < currentStep ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 text-green-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    ) : index === currentStep ? (
                      <motion.div
                        className="w-6 h-6 rounded-full border-2 border-white border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-purple-400/40" />
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      index <= currentStep ? 'text-white' : 'text-purple-400/60'
                    }`}
                  >
                    {step}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="w-full mt-8 h-1 bg-purple-900/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                initial={{ width: '0%' }}
                animate={{ width: `${((currentStep + 1) / GENERATION_STEPS.length) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
