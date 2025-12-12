import { useState, useEffect } from 'react';
import { DollarSign, Clock, Award, Package, TrendingDown, TrendingUp, Minus, Edit3 } from 'lucide-react';
import type { PartPricing, SupplierQuoteItem } from '../types';

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

  const getPriceDiffColor = (diff: number) => {
    if (diff < -5) return 'text-emerald-400'; // Much cheaper
    if (diff < 0) return 'text-green-400';    // Cheaper
    if (diff === 0) return 'text-slate-400';  // Same
    if (diff < 5) return 'text-amber-400';    // Slightly more
    return 'text-red-400';                     // Much more expensive
  };

  const getPriceDiffIcon = (diff: number) => {
    if (diff < 0) return <TrendingDown size={14} />;
    if (diff > 0) return <TrendingUp size={14} />;
    return <Minus size={14} />;
  };

  if (marketParts.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 px-6 py-4 border-b border-slate-700">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Edit3 size={20} className="mr-2 text-amber-400" />
          Your Supplier Quote
          <span className="ml-2 text-xs font-normal text-amber-300 bg-amber-900/30 px-2 py-1 rounded-full">
            Enter your prices
          </span>
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          Enter your proposed prices to see how competitive your quote is against market rates.
        </p>
      </div>

      {/* Quote Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Part/Material</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Market Price</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-amber-400 uppercase">Your Price</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Difference</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Qty</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Delivery</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Quality</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote, idx) => {
              const priceDiff = getPriceDiff(quote.marketPrice, quote.supplierPrice);
              
              return (
                <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Package size={16} className="mr-2 text-slate-500" />
                      <span className="font-medium text-white">{quote.partName}</span>
                    </div>
                    <span className="text-xs text-slate-500">{quote.unit}</span>
                  </td>
                  
                  <td className="px-4 py-4 text-right">
                    <span className="text-slate-400">
                      ${quote.marketPrice.toLocaleString()}
                    </span>
                  </td>
                  
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end">
                      <DollarSign size={14} className="text-amber-400" />
                      <input
                        type="number"
                        value={quote.supplierPrice}
                        onChange={(e) => updateQuote(idx, 'supplierPrice', parseFloat(e.target.value) || 0)}
                        className="w-28 bg-slate-700 text-white text-right px-2 py-1.5 rounded border border-amber-500/50 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none"
                      />
                    </div>
                  </td>
                  
                  <td className="px-4 py-4 text-center">
                    <span className={`flex items-center justify-center gap-1 text-sm font-medium ${getPriceDiffColor(priceDiff)}`}>
                      {getPriceDiffIcon(priceDiff)}
                      {priceDiff > 0 ? '+' : ''}{priceDiff.toFixed(1)}%
                    </span>
                  </td>
                  
                  <td className="px-4 py-4">
                    <input
                      type="number"
                      value={quote.quantity}
                      onChange={(e) => updateQuote(idx, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-20 bg-slate-700 text-white text-center px-2 py-1.5 rounded border border-slate-600 focus:border-cyan-400 outline-none"
                    />
                  </td>
                  
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        value={quote.deliveryDays}
                        onChange={(e) => updateQuote(idx, 'deliveryDays', parseInt(e.target.value) || 0)}
                        className="w-16 bg-slate-700 text-white text-center px-2 py-1.5 rounded border border-slate-600 focus:border-cyan-400 outline-none"
                      />
                      <span className="text-xs text-slate-500">days</span>
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
                        className="w-16 bg-slate-700 text-white text-center px-2 py-1.5 rounded border border-slate-600 focus:border-cyan-400 outline-none"
                      />
                      <span className="text-xs text-slate-500">%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Payment Terms */}
      <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock size={18} className="mr-2 text-slate-400" />
            <span className="text-sm text-slate-300">Payment Terms</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={paymentTerms}
              onChange={(e) => onPaymentTermsChange(parseInt(e.target.value) || 0)}
              className="w-20 bg-slate-700 text-white text-center px-2 py-1.5 rounded border border-slate-600 focus:border-cyan-400 outline-none"
            />
            <span className="text-sm text-slate-400">days</span>
          </div>
        </div>
        
        {/* Quick Summary */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500">Avg Price Diff</p>
            <p className={`text-lg font-bold ${getPriceDiffColor(
              quotes.reduce((sum, q) => sum + getPriceDiff(q.marketPrice, q.supplierPrice), 0) / (quotes.length || 1)
            )}`}>
              {(() => {
                const avgDiff = quotes.reduce((sum, q) => sum + getPriceDiff(q.marketPrice, q.supplierPrice), 0) / (quotes.length || 1);
                return `${avgDiff > 0 ? '+' : ''}${avgDiff.toFixed(1)}%`;
              })()}
            </p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500">Avg Quality</p>
            <p className="text-lg font-bold text-cyan-400">
              {(quotes.reduce((sum, q) => sum + q.qualityScore, 0) / (quotes.length || 1)).toFixed(0)}%
            </p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500">Avg Delivery</p>
            <p className="text-lg font-bold text-violet-400">
              {(quotes.reduce((sum, q) => sum + q.deliveryDays, 0) / (quotes.length || 1)).toFixed(0)} days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

