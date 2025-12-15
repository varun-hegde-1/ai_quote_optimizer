import { Target, DollarSign, Award, Truck, Leaf, Lightbulb } from 'lucide-react';
import type { AttractivenessResult } from '../types';
import { useTheme } from '../../ThemeContext';

interface AttractivenessScoreProps {
  result: AttractivenessResult;
}

export const AttractivenessScore: React.FC<AttractivenessScoreProps> = ({ result }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getScoreColor = (score: number): string => {
    if (score >= 80) return isDark ? '#34d399' : '#059669';
    if (score >= 60) return isDark ? '#fbbf24' : '#d97706';
    return isDark ? '#f87171' : '#dc2626';
  };

  const getScoreGradient = (score: number): string => {
    if (score >= 80) return 'from-emerald-500 to-teal-500';
    if (score >= 60) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  const metrics = [
    { label: 'Price Competitiveness', value: result.priceCompetitiveness, icon: DollarSign },
    { label: 'Quality Alignment', value: result.qualityAlignment, icon: Award },
    { label: 'Delivery Reliability', value: result.deliveryReliability, icon: Truck },
    { label: 'Sustainability Fit', value: result.sustainabilityFit, icon: Leaf },
  ];

  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const borderColor = isDark ? '#334155' : '#e2e8f0';
  const headerGradient = isDark 
    ? 'linear-gradient(to right, rgba(91, 33, 182, 0.3), rgba(126, 34, 206, 0.3))' 
    : 'linear-gradient(to right, #f5f3ff, #faf5ff)';
  const textPrimary = isDark ? '#f1f5f9' : '#1e293b';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';
  const insightBg = isDark ? 'rgba(51, 65, 85, 0.5)' : '#f8fafc';
  const insightBorder = isDark ? '#475569' : '#e2e8f0';

  return (
    <div 
      className="rounded-2xl border overflow-hidden shadow-lg"
      style={{ backgroundColor: cardBg, borderColor }}
    >
      {/* Main Score Header */}
      <div 
        className="px-6 py-6 border-b"
        style={{ background: headerGradient, borderColor }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold flex items-center" style={{ color: textPrimary }}>
              <Target size={20} className="mr-2" style={{ color: isDark ? '#a78bfa' : '#7c3aed' }} />
              Attractiveness Analysis
            </h3>
            <p className="text-sm mt-1" style={{ color: textSecondary }}>AI-powered quote competitiveness score</p>
          </div>
          
          {/* Overall Score Circle */}
          <div className="relative">
            <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${getScoreGradient(result.overallScore)} p-1`}>
              <div className="w-full h-full rounded-full flex items-center justify-center" style={{ backgroundColor: cardBg }}>
                <div className="text-center">
                  <p className="text-3xl font-bold" style={{ color: getScoreColor(result.overallScore) }}>
                    {result.overallScore}
                  </p>
                  <p className="text-xs" style={{ color: textSecondary }}>/ 100</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="text-center">
            <div className="flex items-center justify-center mb-2">
              <metric.icon size={16} style={{ color: textSecondary }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: getScoreColor(metric.value) }}>
              {metric.value}
            </p>
            <p className="text-xs mt-1" style={{ color: textSecondary }}>{metric.label}</p>
            {/* Progress Bar */}
            <div 
              className="mt-2 h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: isDark ? '#334155' : '#e2e8f0' }}
            >
              <div
                className={`h-full bg-gradient-to-r ${getScoreGradient(metric.value)} transition-all duration-500`}
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div className="px-6 pb-6">
        <div 
          className="rounded-xl p-4 border"
          style={{ backgroundColor: insightBg, borderColor: insightBorder }}
        >
          <p className="text-sm leading-relaxed" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>{result.recommendation}</p>
        </div>
      </div>

      {/* Key Insights */}
      {result.keyInsights && result.keyInsights.length > 0 && (
        <div className="px-6 pb-6">
          <h4 className="text-sm font-semibold mb-3 flex items-center" style={{ color: isDark ? '#e2e8f0' : '#334155' }}>
            <Lightbulb size={14} className="mr-2" style={{ color: isDark ? '#fbbf24' : '#f59e0b' }} />
            Key Insights
          </h4>
          <div className="space-y-2">
            {result.keyInsights.map((insight, idx) => (
              <div
                key={idx}
                className="flex items-start rounded-lg p-3 border"
                style={{ backgroundColor: insightBg, borderColor: insightBorder }}
              >
                <span 
                  className="w-5 h-5 rounded-full text-xs flex items-center justify-center mr-3 mt-0.5 flex-shrink-0"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(139, 92, 246, 0.2)' : '#ede9fe',
                    color: isDark ? '#a78bfa' : '#7c3aed'
                  }}
                >
                  {idx + 1}
                </span>
                <p className="text-sm" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
