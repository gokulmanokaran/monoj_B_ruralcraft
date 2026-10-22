import React, { useState } from 'react';
import { ShieldCheck, Info, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HSCodeBadgeProps {
  hsCode: string;
  confidence?: 'High' | 'Medium' | 'Low';
  verified?: boolean;
  interactive?: boolean;
  size?: 'sm' | 'md';
}

export const HSCodeBadge: React.FC<HSCodeBadgeProps> = ({
  hsCode,
  confidence = 'Medium',
  verified = false,
  interactive = true,
  size = 'md'
}) => {
  const [showModal, setShowModal] = useState(false);

  const confidenceColors = {
    High: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    Medium: 'bg-amber-50 text-amber-800 border-amber-200',
    Low: 'bg-stone-100 text-stone-700 border-stone-200'
  };

  return (
    <>
      <button
        type="button"
        onClick={() => interactive && setShowModal(true)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold tracking-wide transition-all ${
          verified
            ? 'bg-[#143826]/10 text-[#143826] border-[#143826]/30 hover:bg-[#143826]/20'
            : confidenceColors[confidence]
        } ${interactive ? 'cursor-pointer hover:shadow-sm' : 'cursor-default'}`}
        title="Click to view customs classification intelligence"
      >
        <Sparkles className="w-3 h-3 text-[#BC6C25]" />
        <span>HS {hsCode}</span>
        {verified ? (
          <ShieldCheck className="w-3 h-3 text-[#2D6A4F]" />
        ) : (
          <span className="text-[10px] px-1 py-0.2 rounded bg-black/5 font-medium">
            {confidence}
          </span>
        )}
      </button>

      {/* Interactive explanation modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-left"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#143826]/10 flex items-center justify-center text-[#143826]">
                    <Sparkles className="w-5 h-5 text-[#BC6C25]" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-stone-900">
                      Suggested HS Code
                    </h3>
                    <p className="text-xs text-stone-500">
                      Automated Customs Tariff Classification
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs uppercase font-bold tracking-wider text-stone-500">
                      Harmonized System Code
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Confidence: {confidence}
                    </span>
                  </div>
                  <div className="text-2xl font-black font-mono text-[#143826]">
                    {hsCode}
                  </div>
                  <div className="text-xs text-stone-600 mt-1">
                    Classification basis: Natural materials, handcraft category, and export tariff schedule.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex gap-2.5">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Student Demo / Prototype Notice:</span>
                    <p className="mt-0.5 text-amber-800/90 leading-relaxed">
                      This HS code is automatically suggested based on keyword heuristics and category rules. It is not legally certified. Final customs declarations must be reviewed and verified by an authorized customs broker prior to international shipping.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-[#143826] text-white rounded-xl text-xs font-semibold hover:bg-[#0D2818] transition-colors"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
