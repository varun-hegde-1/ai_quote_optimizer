import { useState, useEffect } from 'react';
import { DollarSign, Clock, Package, TrendingDown, TrendingUp, Minus, Edit3 } from 'lucide-react';
import type { PartPricing, SupplierQuoteItem } from '../types';
import { useTheme } from '../../ThemeContext';

interface SupplierQuoteInputProps {
  marketParts: PartPricing[];
  onQuoteChange: (quotes: SupplierQuoteItem[]) => void;
  paymentTerms: number;
  onPaymentTermsChange: (days: number) => void;
}

export const SupplierQuoteInput: React.FC<SupplierQuoteInputProps> = ({
  marketParts,
  onQuoteChange,
  paymentTerms,
  onPaymentTermsChange
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [quotes, setQuotes] = useState<SupplierQuoteItem[]>([]);

  // Initialize quotes from market parts
  useEffect(() => {
    if (marketParts.length > 0 && quotes.length === 0) {
      const initialQuotes: SupplierQuoteItem[] = marketParts.map(part => ({
        partName: part.partName,
        marketPrice: part.currentPrice,
        supplierPrice: part.currentPrice, // Default to market price
        unit: part.unit,
        quantity: 100,
        deliveryDays: 14,
        qualityScore: 85
      }));
      setQuotes(initialQuotes);
      onQuoteChange(initialQuotes);
    }
  }, [marketParts, quotes.length, onQuoteChange]);

  const updateQuote = (index: number, field: keyof SupplierQuoteItem, value: number) => {
    const updated = [...quotes];
    updated[index] = { ...updated[index], [field]: value };
    setQuotes(updated);
    onQuoteChange(updated);
  };

  const getPriceDiff = (market: number, supplier: number) => {
    const diff = ((supplier - market) / market) * 100;
    return diff;
  };

  const getPriceDiffColor = (diff: number): string => {
    if (diff < -5) return isDark ? '#34d399' : '#059669'; // Much cheaper
    if (diff < 0) return isDark ? '#4ade80' : '#16a34a';   // Cheaper
    if (diff === 0) return isDark ? '#94a3b8' : '#64748b'; // Same
    if (diff < 5) return isDark ? '#fbbf24' : '#d97706';   // Slightly more
    return isDark ? '#f87171' : '#dc2626';                  // Much more expensive
  };

  const getPriceDiffIcon = (diff: number) => {
    if (diff < 0) return <TrendingDown size={14} />;
    if (diff > 0) return <TrendingUp size={14} />;
    return <Minus size={14} />;
  };

  if (marketParts.length === 0) {
    return null;
  }

  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const borderColor = isDark ? '#334155' : '#e2e8f0';
  const headerGradient = isDark 
    ? 'linear-gradient(to right, rgba(146, 64, 14, 0.3), rgba(154, 52, 18, 0.3))' 
    : 'linear-gradient(to right, #fffbeb, #fff7ed)';
  const textPrimary = isDark ? '#f1f5f9' : '#1e293b';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';
  const headerBg = isDark ? 'rgba(51, 65, 85, 0.5)' : '#f8fafc';
  const inputBg = isDark ? '#334155' : '#ffffff';
  const inputBorder = isDark ? '#475569' : '#cbd5e1';

  const inputStyle: React.CSSProperties = {
    backgroundColor: inputBg,
    color: textPrimary,
    borderColor: inputBorder
  };

  const amberInputStyle: React.CSSProperties = {
    backgroundColor: inputBg,
    color: textPrimary,
    borderColor: isDark ? '#b45309' : '#fcd34d'
  };

  return (
    <div 
      className="rounded-2xl border overflow-hidden shadow-lg"
      style={{ backgroundColor: cardBg, borderColor }}
    >
      {/* Header */}
      <div 
        className="px-6 py-4 border-b"
        style={{ background: headerGradient, borderColor }}
      >
        <h3 className="text-xl font-bold flex items-center" style={{ color: textPrimary }}>
          <Edit3 size={20} className="mr-2" style={{ color: isDark ? '#fbbf24' : '#d97706' }} />
          Your Supplier Quote
          <span 
            className="ml-2 text-xs font-normal px-2 py-1 rounded-full border"
            style={{
              color: isDark ? '#fcd34d' : '#92400e',
              backgroundColor: isDark ? 'rgba(251, 191, 36, 0.2)' : '#fef3c7',
              borderColor: isDark ? '#b45309' : '#fde68a'
            }}
          >
            Enter your prices
          </span>
        </h3>
        <p className="text-sm mt-1" style={{ color: textSecondary }}>
          Enter your proposed prices to see how competitive your quote is against market rates.
        </p>
      </div>

      {/* Quote Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid ${borderColor}`, backgroundColor: headerBg }}>
              <th className="text-left px-6 py-3 text-xs font-semibold uppercase" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>Part/Material</th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>Market Price</th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase" style={{ color: isDark ? '#fbbf24' : '#d97706' }}>Your Price</th>
              <th className="text-center px-4 py-3 text-xs font-semibold uppercase" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>Difference</th>
              <th className="text-center px-4 py-3 text-xs font-semibold uppercase" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>Qty</th>
              <th className="text-center px-4 py-3 text-xs font-semibold uppercase" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>Delivery</th>
              <th className="text-center px-4 py-3 text-xs font-semibold uppercase" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>Quality</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote, idx) => {
              const priceDiff = getPriceDiff(quote.marketPrice, quote.supplierPrice);
              
              return (
                <tr 
                  key={idx} 
                  className="transition-colors"
                  style={{ borderBottom: `1px solid ${isDark ? '#1e293b' : '#f1f5f9'}` }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Package size={16} className="mr-2" style={{ color: isDark ? '#64748b' : '#94a3b8' }} />
                      <span className="font-medium" style={{ color: textPrimary }}>{quote.partName}</span>
                    </div>
                    <span className="text-xs" style={{ color: textSecondary }}>{quote.unit}</span>
                  </td>
                  
                  <td className="px-4 py-4 text-right">
                    <span style={{ color: isDark ? '#cbd5e1' : '#475569' }}>
                      ${quote.marketPrice.toLocaleString()}
                    </span>
                  </td>
                  
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end">
                      <DollarSign size={14} style={{ color: isDark ? '#fbbf24' : '#d97706' }} />
                      <input
                        type="number"
                        value={quote.supplierPrice}
                        onChange={(e) => updateQuote(idx, 'supplierPrice', parseFloat(e.target.value) || 0)}
                        className="w-28 text-right px-2 py-1.5 rounded border focus:ring-1 focus:ring-amber-500 outline-none shadow-sm"
                        style={amberInputStyle}
                      />
                    </div>
                  </td>
                  
                  <td className="px-4 py-4 text-center">
                    <span 
                      className="flex items-center justify-center gap-1 text-sm font-medium"
                      style={{ color: getPriceDiffColor(priceDiff) }}
                    >
                      {getPriceDiffIcon(priceDiff)}
                      {priceDiff > 0 ? '+' : ''}{priceDiff.toFixed(1)}%
                    </span>
                  </td>
                  
                  <td className="px-4 py-4">
                    <input
                      type="number"
                      value={quote.quantity}
                      onChange={(e) => updateQuote(idx, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-20 text-center px-2 py-1.5 rounded border focus:border-cyan-500 outline-none shadow-sm"
                      style={inputStyle}
                    />
                  </td>
                  
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        value={quote.deliveryDays}
                        onChange={(e) => updateQuote(idx, 'deliveryDays', parseInt(e.target.value) || 0)}
                        className="w-16 text-center px-2 py-1.5 rounded border focus:border-cyan-500 outline-none shadow-sm"
                        style={inputStyle}
                      />
                      <span className="text-xs" style={{ color: textSecondary }}>days</span>
                    </div>
                  </td>
                  
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        value={quote.qualityScore}
                        min={0}
                        max={100}
                        onChange={(e) => updateQuote(idx, 'qualityScore', Math.min(100, parseInt(e.target.value) || 0))}
                        className="w-16 text-center px-2 py-1.5 rounded border focus:border-cyan-500 outline-none shadow-sm"
                        style={inputStyle}
                      />
                      <span className="text-xs" style={{ color: textSecondary }}>%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Payment Terms */}
      <div 
        className="px-6 py-4 border-t"
        style={{ backgroundColor: headerBg, borderColor }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock size={18} className="mr-2" style={{ color: textSecondary }} />
            <span className="text-sm" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>Payment Terms</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={paymentTerms}
              onChange={(e) => onPaymentTermsChange(parseInt(e.target.value) || 0)}
              className="w-20 text-center px-2 py-1.5 rounded border focus:border-cyan-500 outline-none shadow-sm"
              style={inputStyle}
            />
            <span className="text-sm" style={{ color: textSecondary }}>days</span>
          </div>
        </div>
        
        {/* Quick Summary */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div 
            className="rounded-lg p-3 text-center border shadow-sm"
            style={{ backgroundColor: cardBg, borderColor }}
          >
            <p className="text-xs" style={{ color: textSecondary }}>Avg Price Diff</p>
            <p 
              className="text-lg font-bold"
              style={{ color: getPriceDiffColor(
                quotes.reduce((sum, q) => sum + getPriceDiff(q.marketPrice, q.supplierPrice), 0) / (quotes.length || 1)
              )}}
            >
              {(() => {
                const avgDiff = quotes.reduce((sum, q) => sum + getPriceDiff(q.marketPrice, q.supplierPrice), 0) / (quotes.length || 1);
                return `${avgDiff > 0 ? '+' : ''}${avgDiff.toFixed(1)}%`;
              })()}
            </p>
          </div>
          <div 
            className="rounded-lg p-3 text-center border shadow-sm"
            style={{ backgroundColor: cardBg, borderColor }}
          >
            <p className="text-xs" style={{ color: textSecondary }}>Avg Quality</p>
            <p className="text-lg font-bold" style={{ color: isDark ? '#22d3ee' : '#0891b2' }}>
              {(quotes.reduce((sum, q) => sum + q.qualityScore, 0) / (quotes.length || 1)).toFixed(0)}%
            </p>
          </div>
          <div 
            className="rounded-lg p-3 text-center border shadow-sm"
            style={{ backgroundColor: cardBg, borderColor }}
          >
            <p className="text-xs" style={{ color: textSecondary }}>Avg Delivery</p>
            <p className="text-lg font-bold" style={{ color: isDark ? '#a78bfa' : '#7c3aed' }}>
              {(quotes.reduce((sum, q) => sum + q.deliveryDays, 0) / (quotes.length || 1)).toFixed(0)} days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
