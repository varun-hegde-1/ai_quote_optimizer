import { TrendingUp, TrendingDown, Minus, Package, Clock, Users } from 'lucide-react';
import type { PartPricing } from '../types';

interface PartsTableProps {
  parts: PartPricing[];
}

export const PartsTable: React.FC<PartsTableProps> = ({ parts }) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} className="text-red-400" />;
      case 'down':
        return <TrendingDown size={16} className="text-emerald-400" />;
      default:
        return <Minus size={16} className="text-slate-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-red-400 bg-red-900/20';
      case 'down':
        return 'text-emerald-400 bg-emerald-900/20';
      default:
        return 'text-slate-400 bg-slate-700/50';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 px-6 py-4 border-b border-slate-700">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Package size={20} className="mr-2 text-emerald-400" />
          Parts & Materials Pricing
          <span className="ml-2 text-xs font-normal text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded-full">
            Live Data
          </span>
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Part/Material</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Price</th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Trend</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Lead Time</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Suppliers</th>
            </tr>
          </thead>
          <tbody>
            {parts.map((part, idx) => (
              <tr 
                key={idx} 
                className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <p className="font-semibold text-white">{part.partName}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-md">
                    {part.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <p className="text-lg font-bold text-white">
                    ${typeof part.currentPrice === 'number' ? part.currentPrice.toLocaleString() : part.currentPrice}
                  </p>
                  <p className="text-xs text-slate-500">{part.unit}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center">
                    <span className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTrendColor(part.trend)}`}>
                      {getTrendIcon(part.trend)}
                      <span className="ml-1">
                        {part.priceChange >= 0 ? '+' : ''}{part.priceChange}%
                      </span>
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {part.leadTime && (
                    <span className="flex items-center text-sm text-slate-400">
                      <Clock size={14} className="mr-1" />
                      {part.leadTime}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {part.suppliers && part.suppliers.length > 0 && (
                    <div className="flex items-center">
                      <Users size={14} className="mr-2 text-slate-500" />
                      <div className="flex flex-wrap gap-1">
                        {part.suppliers.slice(0, 2).map((supplier, sIdx) => (
                          <span key={sIdx} className="text-xs text-slate-400">
                            {supplier}{sIdx < Math.min(part.suppliers!.length - 1, 1) ? ',' : ''}
                          </span>
                        ))}
                        {part.suppliers.length > 2 && (
                          <span className="text-xs text-slate-500">+{part.suppliers.length - 2}</span>
                        )}
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

