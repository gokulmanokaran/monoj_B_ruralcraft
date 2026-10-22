import React from 'react';
import { useCurrency } from '../context/CurrencyContext';

interface PriceDisplayProps {
  priceInr: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showInrBase?: boolean;
  className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  priceInr,
  size = 'md',
  showInrBase = true,
  className = ''
}) => {
  const { formatPrice, currency } = useCurrency();
  const { convertedString, inrString } = formatPrice(priceInr);

  const sizeClasses = {
    sm: 'text-sm font-semibold',
    md: 'text-base font-bold',
    lg: 'text-xl font-bold',
    xl: 'text-2xl lg:text-3xl font-extrabold'
  };

  const isBaseCurrency = currency === 'INR';

  return (
    <div className={`inline-flex flex-wrap items-baseline gap-1.5 ${className}`}>
      <span className={`text-[#143826] font-heading ${sizeClasses[size]}`}>
        {convertedString}
      </span>

      {!isBaseCurrency && showInrBase && (
        <span className="text-xs text-stone-500 font-medium">
          (Base {inrString})
        </span>
      )}
    </div>
  );
};
