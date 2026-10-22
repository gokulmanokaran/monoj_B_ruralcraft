import React, { useState, useRef, useEffect } from 'react';
import { useCurrency, SUPPORTED_CURRENCIES } from '../context/CurrencyContext';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface CurrencySelectorProps {
  compact?: boolean;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({ compact = false }) => {
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedMeta = SUPPORTED_CURRENCIES.find(c => c.code === currency) || SUPPORTED_CURRENCIES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100/80 hover:bg-stone-200/80 border border-stone-200 text-xs font-semibold text-stone-800 transition-all cursor-pointer"
        aria-label="Select preferred currency"
      >
        <span className="text-sm">{selectedMeta.flag}</span>
        <span>{selectedMeta.code}</span>
        <span className="text-stone-400 font-normal">({selectedMeta.symbol.trim()})</span>
        <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[11px] font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 flex items-center justify-between">
            <span>Select Currency</span>
            <span className="text-[10px] text-emerald-600 font-medium">Base: INR</span>
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {SUPPORTED_CURRENCIES.map(c => {
              const isSelected = c.code === currency;
              return (
                <button
                  key={c.code}
                  onClick={() => {
                    setCurrency(c.code);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-stone-50 transition-colors ${
                    isSelected ? 'bg-[#143826]/5 font-bold text-[#143826]' : 'text-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{c.flag}</span>
                    <span className="font-semibold">{c.code}</span>
                    <span className="text-stone-400 font-normal">{c.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#143826]" />}
                </button>
              );
            })}
          </div>
          <div className="px-3 py-1.5 bg-stone-50 border-t border-stone-100 text-[10px] text-stone-500">
            Auto-converts live prices from Indian Rupee (INR)
          </div>
        </div>
      )}
    </div>
  );
};
