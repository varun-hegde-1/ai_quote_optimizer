import { TrendingUp, TrendingDown, Minus, Package, Clock, Users } from 'lucide-react';
import type { PartPricing } from '../types';
import { useTheme } from '../../ThemeContext';

interface PartsTableProps {
  parts: PartPricing[];
}

export const PartsTable: React.FC<PartsTableProps> = ({ parts }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} style={{ color: isDark ? '#f87171' : '#dc2626' }} />;
      case 'down':
        return <TrendingDown size={16} style={{ color: isDark ? '#34d399' : '#059669' }} />;
      default:
        return <Minus size={16} style={{ color: isDark ? '#94a3b8' : '#64748b' }} />;
    }
  };

  const getTrendStyle = (trend: string): React.CSSProperties => {
    switch (trend) {
      case 'up':
        return { 
          color: isDark ? '#f87171' : '#dc2626', 
          backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2' 
        };
      case 'down':
        return { 
          color: isDark ? '#34d399' : '#059669', 
          backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ecfdf5' 
        };
      default:
        return { 
          color: isDark ? '#94a3b8' : '#475569', 
          backgroundColor: isDark ? '#334155' : '#f1f5f9' 
        };
    }
  };

  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const borderColor = isDark ? '#334155' : '#e2e8f0';
  const headerGradient = isDark 
    ? 'linear-gradient(to right, rgba(6, 78, 59, 0.3), rgba(17, 94, 89, 0.3))' 
    : 'linear-gradient(to right, #ecfdf5, #f0fdfa)';
  const textPrimary = isDark ? '#f1f5f9' : '#1e293b';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';
  const rowHover = isDark ? 'rgba(51, 65, 85, 0.3)' : '#f8fafc';
  const headerBg = isDark ? 'rgba(51, 65, 85, 0.5)' : '#f8fafc';

  return (
    <div 
      className="rounded-2xl border overflow-hidden shadow-lg"
      style={{ backgroundColor: cardBg, borderColor }}
    >
      <div 
        className="px-6 py-4 border-b"
        style={{ background: headerGradient, borderColor }}
      >
        <h3 className="text-xl font-bold flex items-center" style={{ color: textPrimary }}>
          <Package size={20} className="mr-2" style={{ color: isDark ? '#34d399' : '#059669' }} />
          Parts & Materials Pricing
          <span 
            className="ml-2 text-xs font-normal px-2 py-1 rounded-full border"
            style={{
              color: isDark ? '#6ee7b7' : '#047857',
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#d1fae5',
              borderColor: isDark ? '#047857' : '#a7f3d0'
            }}
          >
            Live Data
          </span>
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid ${borderColor}`, backgroundColor: headerBg }}>
              <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>Part/Material</th>
              <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>Category</th>
              <th className="text-right px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>Price</th>
              <th className="text-center px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>Trend</th>
              <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>Lead Time</th>
              <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>Suppliers</th>
            </tr>
          </thead>
          <tbody>
            {parts.map((part, idx) => (
              <tr 
                key={idx} 
                className="transition-colors"
                style={{ 
                  borderBottom: `1px solid ${isDark ? '#1e293b' : '#f1f5f9'}`,
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = rowHover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td className="px-6 py-4">
                  <p className="font-semibold" style={{ color: textPrimary }}>{part.partName}</p>
                </td>
                <td className="px-6 py-4">
                  <span 
                    className="px-2 py-1 text-xs rounded-md border"
                    style={{ 
                      backgroundColor: isDark ? '#334155' : '#f1f5f9',
                      color: isDark ? '#cbd5e1' : '#475569',
                      borderColor: isDark ? '#475569' : '#e2e8f0'
                    }}
                  >
                    {part.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <p className="text-lg font-bold" style={{ color: textPrimary }}>
                    ${typeof part.currentPrice === 'number' ? part.currentPrice.toLocaleString() : part.currentPrice}
                  </p>
                  <p className="text-xs" style={{ color: textSecondary }}>{part.unit}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center">
                    <span 
                      className="flex items-center px-3 py-1 rounded-full text-xs font-medium"
                      style={getTrendStyle(part.trend)}
                    >
                      {getTrendIcon(part.trend)}
                      <span className="ml-1">
                        {part.priceChange >= 0 ? '+' : ''}{part.priceChange}%
                      </span>
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {part.leadTime && (
                    <span className="flex items-center text-sm" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>
                      <Clock size={14} className="mr-1" />
                      {part.leadTime}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {part.suppliers && part.suppliers.length > 0 && (
                    <div className="flex items-center">
                      <Users size={14} className="mr-2" style={{ color: isDark ? '#64748b' : '#94a3b8' }} />
                      <div className="flex flex-wrap gap-1">
                        {part.suppliers.slice(0, 2).map((supplier, sIdx) => (
                          <span key={sIdx} className="text-xs" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>
                            {supplier}{sIdx < Math.min(part.suppliers!.length - 1, 1) ? ',' : ''}
                          </span>
                        ))}
                        {part.suppliers.length > 2 && (
                          <span className="text-xs" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>+{part.suppliers.length - 2}</span>
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
