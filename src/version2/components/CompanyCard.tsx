import { Building2, TrendingUp, Leaf, Clock, Award, MapPin, Factory } from 'lucide-react';
import type { CompanyData } from '../types';
import { useTheme } from '../../ThemeContext';

interface CompanyCardProps {
  company: CompanyData;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const borderColor = isDark ? '#334155' : '#e2e8f0';
  const headerGradient = isDark 
    ? 'linear-gradient(to right, rgba(8, 51, 68, 0.5), rgba(30, 58, 138, 0.3))' 
    : 'linear-gradient(to right, #ecfeff, #eff6ff)';
  const textPrimary = isDark ? '#f1f5f9' : '#1e293b';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';
  const statBg = isDark ? 'rgba(51, 65, 85, 0.5)' : '#f8fafc';
  const statBorder = isDark ? '#475569' : '#e2e8f0';

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
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold flex items-center" style={{ color: textPrimary }}>
              <Building2 size={24} className="mr-3" style={{ color: isDark ? '#22d3ee' : '#0891b2' }} />
              {company.name}
            </h3>
            <div className="flex items-center mt-2 text-sm" style={{ color: textSecondary }}>
              <Factory size={14} className="mr-1" />
              {company.industry}
              <span className="mx-2">•</span>
              <MapPin size={14} className="mr-1" />
              {company.headquarters}
            </div>
          </div>
          {company.marketCap && (
            <div className="text-right">
              <p className="text-xs" style={{ color: textSecondary }}>Market Cap</p>
              <p className="text-xl font-bold" style={{ color: isDark ? '#34d399' : '#059669' }}>{company.marketCap}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Supply Chain Focus */}
        <div 
          className="rounded-xl p-4 border"
          style={{ backgroundColor: statBg, borderColor: statBorder }}
        >
          <p className="text-xs mb-1" style={{ color: textSecondary }}>Primary Focus</p>
          <p className="text-lg font-semibold" style={{ color: isDark ? '#22d3ee' : '#0e7490' }}>{company.supplyChainFocus}</p>
        </div>

        {/* Revenue Growth */}
        {company.revenueGrowth !== undefined && (
          <div 
            className="rounded-xl p-4 border"
            style={{ backgroundColor: statBg, borderColor: statBorder }}
          >
            <p className="text-xs mb-1 flex items-center" style={{ color: textSecondary }}>
              <TrendingUp size={12} className="mr-1" /> Revenue Growth
            </p>
            <p 
              className="text-lg font-semibold"
              style={{ color: company.revenueGrowth >= 0 ? (isDark ? '#34d399' : '#059669') : (isDark ? '#f87171' : '#dc2626') }}
            >
              {company.revenueGrowth >= 0 ? '+' : ''}{company.revenueGrowth}%
            </p>
          </div>
        )}

        {/* Sustainability */}
        {company.sustainabilityScore !== undefined && (
          <div 
            className="rounded-xl p-4 border"
            style={{ backgroundColor: statBg, borderColor: statBorder }}
          >
            <p className="text-xs mb-1 flex items-center" style={{ color: textSecondary }}>
              <Leaf size={12} className="mr-1" /> Sustainability
            </p>
            <div className="flex items-center">
              <p className="text-lg font-semibold" style={{ color: isDark ? '#34d399' : '#059669' }}>{company.sustainabilityScore}</p>
              <span className="text-xs ml-1" style={{ color: textSecondary }}>/100</span>
            </div>
          </div>
        )}

        {/* Payment Terms */}
        {company.paymentTermsTypical !== undefined && (
          <div 
            className="rounded-xl p-4 border"
            style={{ backgroundColor: statBg, borderColor: statBorder }}
          >
            <p className="text-xs mb-1 flex items-center" style={{ color: textSecondary }}>
              <Clock size={12} className="mr-1" /> Payment Terms
            </p>
            <p className="text-lg font-semibold" style={{ color: isDark ? '#fbbf24' : '#d97706' }}>{company.paymentTermsTypical} days</p>
          </div>
        )}
      </div>

      {/* Quality Standards */}
      {company.qualityStandards && company.qualityStandards.length > 0 && (
        <div className="px-6 pb-6">
          <p className="text-xs mb-2 flex items-center" style={{ color: textSecondary }}>
            <Award size={12} className="mr-1" /> Required Quality Standards
          </p>
          <div className="flex flex-wrap gap-2">
            {company.qualityStandards.map((standard, idx) => (
              <span
                key={idx}
                className="px-3 py-1 text-xs font-medium rounded-full border"
                style={{
                  backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe',
                  color: isDark ? '#93c5fd' : '#1d4ed8',
                  borderColor: isDark ? '#1d4ed8' : '#bfdbfe'
                }}
              >
                {standard}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
