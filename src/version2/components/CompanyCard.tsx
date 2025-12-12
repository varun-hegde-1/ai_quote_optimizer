import { Building2, TrendingUp, Leaf, Clock, Award, MapPin, Factory } from 'lucide-react';
import type { CompanyData } from '../types';

interface CompanyCardProps {
  company: CompanyData;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-4 border-b border-slate-200">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 flex items-center">
              <Building2 size={24} className="mr-3 text-cyan-600" />
              {company.name}
            </h3>
            <div className="flex items-center mt-2 text-sm text-slate-500">
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
              <p className="text-xl font-bold text-emerald-600">{company.marketCap}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Supply Chain Focus */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">Primary Focus</p>
          <p className="text-lg font-semibold text-cyan-700">{company.supplyChainFocus}</p>
        </div>

        {/* Revenue Growth */}
        {company.revenueGrowth !== undefined && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs text-slate-500 mb-1 flex items-center">
              <TrendingUp size={12} className="mr-1" /> Revenue Growth
            </p>
            <p className={`text-lg font-semibold ${company.revenueGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {company.revenueGrowth >= 0 ? '+' : ''}{company.revenueGrowth}%
            </p>
          </div>
        )}

        {/* Sustainability */}
        {company.sustainabilityScore !== undefined && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs text-slate-500 mb-1 flex items-center">
              <Leaf size={12} className="mr-1" /> Sustainability
            </p>
            <div className="flex items-center">
              <p className="text-lg font-semibold text-emerald-600">{company.sustainabilityScore}</p>
              <span className="text-xs text-slate-500 ml-1">/100</span>
            </div>
          </div>
        )}

        {/* Payment Terms */}
        {company.paymentTermsTypical !== undefined && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs text-slate-500 mb-1 flex items-center">
              <Clock size={12} className="mr-1" /> Payment Terms
            </p>
            <p className="text-lg font-semibold text-amber-600">{company.paymentTermsTypical} days</p>
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
                className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full border border-blue-200"
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

