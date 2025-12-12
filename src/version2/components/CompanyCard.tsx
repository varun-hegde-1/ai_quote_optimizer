import { Building2, TrendingUp, Leaf, Clock, Award, MapPin, Factory } from 'lucide-react';
import type { CompanyData } from '../types';

interface CompanyCardProps {
  company: CompanyData;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 px-6 py-4 border-b border-slate-700">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center">
              <Building2 size={24} className="mr-3 text-cyan-400" />
              {company.name}
            </h3>
            <div className="flex items-center mt-2 text-sm text-slate-400">
              <Factory size={14} className="mr-1" />
              {company.industry}
              <span className="mx-2">•</span>
              <MapPin size={14} className="mr-1" />
              {company.headquarters}
            </div>
          </div>
          {company.marketCap && (
            <div className="text-right">
              <p className="text-xs text-slate-500">Market Cap</p>
              <p className="text-xl font-bold text-emerald-400">{company.marketCap}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Supply Chain Focus */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <p className="text-xs text-slate-500 mb-1">Primary Focus</p>
          <p className="text-lg font-semibold text-cyan-300">{company.supplyChainFocus}</p>
        </div>

        {/* Revenue Growth */}
        {company.revenueGrowth !== undefined && (
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-xs text-slate-500 mb-1 flex items-center">
              <TrendingUp size={12} className="mr-1" /> Revenue Growth
            </p>
            <p className={`text-lg font-semibold ${company.revenueGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {company.revenueGrowth >= 0 ? '+' : ''}{company.revenueGrowth}%
            </p>
          </div>
        )}

        {/* Sustainability */}
        {company.sustainabilityScore !== undefined && (
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-xs text-slate-500 mb-1 flex items-center">
              <Leaf size={12} className="mr-1" /> Sustainability
            </p>
            <div className="flex items-center">
              <p className="text-lg font-semibold text-emerald-400">{company.sustainabilityScore}</p>
              <span className="text-xs text-slate-500 ml-1">/100</span>
            </div>
          </div>
        )}

        {/* Payment Terms */}
        {company.paymentTermsTypical !== undefined && (
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-xs text-slate-500 mb-1 flex items-center">
              <Clock size={12} className="mr-1" /> Payment Terms
            </p>
            <p className="text-lg font-semibold text-amber-400">{company.paymentTermsTypical} days</p>
          </div>
        )}
      </div>

      {/* Quality Standards */}
      {company.qualityStandards && company.qualityStandards.length > 0 && (
        <div className="px-6 pb-6">
          <p className="text-xs text-slate-500 mb-2 flex items-center">
            <Award size={12} className="mr-1" /> Required Quality Standards
          </p>
          <div className="flex flex-wrap gap-2">
            {company.qualityStandards.map((standard, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-900/30 text-blue-300 text-xs font-medium rounded-full border border-blue-700/50"
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

