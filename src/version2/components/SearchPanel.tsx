import { Search, Building2, Package, Loader2 } from 'lucide-react';

interface SearchPanelProps {
  companyQuery: string;
  partsQuery: string;
  onCompanyChange: (value: string) => void;
  onPartsChange: (value: string) => void;
  onCompanySearch: () => void;
  onPartsSearch: () => void;
  isSearchingCompany: boolean;
  isSearchingParts: boolean;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  companyQuery,
  partsQuery,
  onCompanyChange,
  onPartsChange,
  onCompanySearch,
  onPartsSearch,
  isSearchingCompany,
  isSearchingParts
}) => {
  const handleCompanyKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && companyQuery.trim()) {
      onCompanySearch();
    }
  };

  const handlePartsKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && partsQuery.trim()) {
      onPartsSearch();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Company Search */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-slate-300">
          <Building2 size={16} className="mr-2 text-cyan-400" />
          Search Company
        </label>
        <div className="relative">
          <input
            type="text"
            value={companyQuery}
            onChange={(e) => onCompanyChange(e.target.value)}
            onKeyPress={handleCompanyKeyPress}
            placeholder="e.g., Toyota, Tesla, Apple..."
            className="w-full bg-slate-800/50 text-white px-4 py-3 pr-12 rounded-xl border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-500"
            disabled={isSearchingCompany}
          />
          <button
            onClick={onCompanySearch}
            disabled={isSearchingCompany || !companyQuery.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {isSearchingCompany ? (
              <Loader2 size={18} className="animate-spin text-white" />
            ) : (
              <Search size={18} className="text-white" />
            )}
          </button>
        </div>
        <p className="text-xs text-slate-500">Search for buyer company to analyze their procurement profile</p>
      </div>

      {/* Parts/Materials Search */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-slate-300">
          <Package size={16} className="mr-2 text-emerald-400" />
          Search Parts / Materials
        </label>
        <div className="relative">
          <input
            type="text"
            value={partsQuery}
            onChange={(e) => onPartsChange(e.target.value)}
            onKeyPress={handlePartsKeyPress}
            placeholder="e.g., Aluminum sheets, Steel coils, Semiconductors..."
            className="w-full bg-slate-800/50 text-white px-4 py-3 pr-12 rounded-xl border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-500"
            disabled={isSearchingParts}
          />
          <button
            onClick={onPartsSearch}
            disabled={isSearchingParts || !partsQuery.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {isSearchingParts ? (
              <Loader2 size={18} className="animate-spin text-white" />
            ) : (
              <Search size={18} className="text-white" />
            )}
          </button>
        </div>
        <p className="text-xs text-slate-500">Search for parts or materials to get real-time pricing</p>
      </div>
    </div>
  );
};

