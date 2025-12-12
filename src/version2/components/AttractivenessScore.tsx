import { Target, DollarSign, Award, Truck, Leaf, Lightbulb } from 'lucide-react';
import type { AttractivenessResult } from '../types';

interface AttractivenessScoreProps {
  result: AttractivenessResult;
}

export const AttractivenessScore: React.FC<AttractivenessScoreProps> = ({ result }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreGradient = (score: number) => {
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

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
      {/* Main Score Header */}
      <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 px-6 py-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center">
              <Target size={20} className="mr-2 text-violet-400" />
              Attractiveness Analysis
            </h3>
            <p className="text-sm text-slate-400 mt-1">AI-powered quote competitiveness score</p>
          </div>
          
          {/* Overall Score Circle */}
          <div className="relative">
            <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${getScoreGradient(result.overallScore)} p-1`}>
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                  <p className={`text-3xl font-bold ${getScoreColor(result.overallScore)}`}>
                    {result.overallScore}
                  </p>
                  <p className="text-xs text-slate-500">/ 100</p>
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
              <metric.icon size={16} className="text-slate-400" />
            </div>
            <p className={`text-2xl font-bold ${getScoreColor(metric.value)}`}>
              {metric.value}
            </p>
            <p className="text-xs text-slate-500 mt-1">{metric.label}</p>
            {/* Progress Bar */}
            <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
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
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <p className="text-sm text-slate-300 leading-relaxed">{result.recommendation}</p>
        </div>
      </div>

      {/* Key Insights */}
      {result.keyInsights && result.keyInsights.length > 0 && (
        <div className="px-6 pb-6">
          <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center">
            <Lightbulb size={14} className="mr-2 text-amber-400" />
            Key Insights
          </h4>
          <div className="space-y-2">
            {result.keyInsights.map((insight, idx) => (
              <div
                key={idx}
                className="flex items-start bg-slate-800/30 rounded-lg p-3 border border-slate-700/50"
              >
                <span className="w-5 h-5 rounded-full bg-violet-600/20 text-violet-400 text-xs flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  {idx + 1}
                </span>
                <p className="text-sm text-slate-400">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

