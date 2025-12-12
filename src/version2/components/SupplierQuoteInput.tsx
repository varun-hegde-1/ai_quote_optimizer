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
    if (diff < -5) return 'text-emerald-600'; // Much cheaper
    if (diff < 0) return 'text-green-600';    // Cheaper
    if (diff === 0) return 'text-slate-500';  // Same
    if (diff < 5) return 'text-amber-600';    // Slightly more
    return 'text-red-600';                     // Much more expensive
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
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 flex items-center">
          <Edit3 size={20} className="mr-2 text-amber-600" />
          Your Supplier Quote
          <span className="ml-2 text-xs font-normal text-amber-700 bg-amber-100 px-2 py-1 rounded-full border border-amber-200">
            Enter your prices
          </span>
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Enter your proposed prices to see how competitive your quote is against market rates.
        </p>
      </div>

      {/* Quote Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Part/Material</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Market Price</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-amber-600 uppercase">Your Price</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Difference</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Qty</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Delivery</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Quality</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote, idx) => {
              const priceDiff = getPriceDiff(quote.marketPrice, quote.supplierPrice);
              
              return (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Package size={16} className="mr-2 text-slate-400" />
                      <span className="font-medium text-slate-800">{quote.partName}</span>
                    </div>
                    <span className="text-xs text-slate-500">{quote.unit}</span>
                  </td>
                  
                  <td className="px-4 py-4 text-right">
                    <span className="text-slate-600">
                      ${quote.marketPrice.toLocaleString()}
                    </span>
                  </td>
                  
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end">
                      <DollarSign size={14} className="text-amber-600" />
                      <input
                        type="number"
                        value={quote.supplierPrice}
                        onChange={(e) => updateQuote(idx, 'supplierPrice', parseFloat(e.target.value) || 0)}
                        className="w-28 bg-white text-slate-800 text-right px-2 py-1.5 rounded border border-amber-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none shadow-sm"
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
                      className="w-20 bg-white text-slate-800 text-center px-2 py-1.5 rounded border border-slate-300 focus:border-cyan-500 outline-none shadow-sm"
                    />
                  </td>
                  
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        value={quote.deliveryDays}
                        onChange={(e) => updateQuote(idx, 'deliveryDays', parseInt(e.target.value) || 0)}
                        className="w-16 bg-white text-slate-800 text-center px-2 py-1.5 rounded border border-slate-300 focus:border-cyan-500 outline-none shadow-sm"
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
                        className="w-16 bg-white text-slate-800 text-center px-2 py-1.5 rounded border border-slate-300 focus:border-cyan-500 outline-none shadow-sm"
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
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock size={18} className="mr-2 text-slate-500" />
            <span className="text-sm text-slate-700">Payment Terms</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={paymentTerms}
              onChange={(e) => onPaymentTermsChange(parseInt(e.target.value) || 0)}
              className="w-20 bg-white text-slate-800 text-center px-2 py-1.5 rounded border border-slate-300 focus:border-cyan-500 outline-none shadow-sm"
            />
            <span className="text-sm text-slate-500">days</span>
          </div>
        </div>
        
        {/* Quick Summary */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-3 text-center border border-slate-200 shadow-sm">
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
          <div className="bg-white rounded-lg p-3 text-center border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500">Avg Quality</p>
            <p className="text-lg font-bold text-cyan-600">
              {(quotes.reduce((sum, q) => sum + q.qualityScore, 0) / (quotes.length || 1)).toFixed(0)}%
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500">Avg Delivery</p>
            <p className="text-lg font-bold text-violet-600">
              {(quotes.reduce((sum, q) => sum + q.deliveryDays, 0) / (quotes.length || 1)).toFixed(0)} days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

