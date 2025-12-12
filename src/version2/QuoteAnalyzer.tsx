import { useState, useCallback, useEffect } from 'react';
import { Sparkles, Building2, Package, Zap, AlertTriangle, Key, ExternalLink } from 'lucide-react';

import { 
  SearchPanel, 
  CompanyCard, 
  PartsTable, 
  AttractivenessScore,
  LoadingState,
  SupplierQuoteInput
} from './components';

import { 
  searchCompany, 
  searchPartsPricing, 
  calculateAttractiveness,
  isApiKeyConfigured 
} from './services/geminiService';

import type { CompanyData, PartPricing, AttractivenessResult, SupplierQuoteItem } from './types';

const QuoteAnalyzer: React.FC = () => {
  // API key check
  const [hasApiKey, setHasApiKey] = useState(true);

  useEffect(() => {
    setHasApiKey(isApiKeyConfigured());
  }, []);

  // Search state
  const [companyQuery, setCompanyQuery] = useState('');
  const [partsQuery, setPartsQuery] = useState('');
  const [isSearchingCompany, setIsSearchingCompany] = useState(false);
  const [isSearchingParts, setIsSearchingParts] = useState(false);
  const [isCalculatingScore, setIsCalculatingScore] = useState(false);

  // Results state
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [parts, setParts] = useState<PartPricing[]>([]);
  const [attractiveness, setAttractiveness] = useState<AttractivenessResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Supplier quote state
  const [supplierQuotes, setSupplierQuotes] = useState<SupplierQuoteItem[]>([]);
  const [paymentTerms, setPaymentTerms] = useState(30);

  // Handle company search
  const handleCompanySearch = useCallback(async () => {
    if (!companyQuery.trim()) return;
    
    setIsSearchingCompany(true);
    setError(null);
    setAttractiveness(null);

    try {
      const result = await searchCompany(companyQuery);
      if (result) {
        setCompany(result);
      } else {
        setError(`Could not find information for "${companyQuery}". Try a different company name.`);
      }
    } catch (err) {
      setError('Failed to search company. Please try again.');
      console.error(err);
    } finally {
      setIsSearchingCompany(false);
    }
  }, [companyQuery]);

  // Handle parts search
  const handlePartsSearch = useCallback(async () => {
    if (!partsQuery.trim()) return;
    
    setIsSearchingParts(true);
    setError(null);
    setAttractiveness(null);
    setSupplierQuotes([]); // Reset quotes when new parts are searched

    try {
      const result = await searchPartsPricing(partsQuery);
      if (result.length > 0) {
        setParts(result);
      } else {
        setError(`Could not find pricing for "${partsQuery}". Try different keywords.`);
      }
    } catch (err) {
      setError('Failed to search parts. Please try again.');
      console.error(err);
    } finally {
      setIsSearchingParts(false);
    }
  }, [partsQuery]);

  // Handle supplier quote changes
  const handleQuoteChange = useCallback((quotes: SupplierQuoteItem[]) => {
    setSupplierQuotes(quotes);
    // Reset attractiveness when quotes change
    setAttractiveness(null);
  }, []);

  // Calculate attractiveness with supplier quotes
  const handleCalculateAttractiveness = useCallback(async () => {
    if (!company || parts.length === 0) return;
    
    setIsCalculatingScore(true);
    setError(null);

    try {
      // Pass supplier quotes if available
      const result = await calculateAttractiveness(
        company, 
        parts, 
        supplierQuotes.length > 0 ? supplierQuotes : undefined,
        paymentTerms
      );
      setAttractiveness(result);
    } catch (err) {
      setError('Failed to calculate attractiveness. Please try again.');
      console.error(err);
    } finally {
      setIsCalculatingScore(false);
    }
  }, [company, parts, supplierQuotes, paymentTerms]);

  const hasResults = company || parts.length > 0;
  const canCalculate = company && parts.length > 0 && supplierQuotes.length > 0;
  const showQuoteInput = parts.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiMxZTI5M2IiIGZpbGwtb3BhY2l0eT0iMC40Ii8+PC9nPjwvc3ZnPg==')] opacity-20" />
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-r from-cyan-900/30 to-violet-900/30 border border-cyan-700/30 mb-4">
            <Sparkles size={16} className="text-cyan-400 mr-2" />
            <span className="text-sm text-cyan-300">Powered by Gemini AI + Real-Time Market Data</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-cyan-200 to-violet-200 bg-clip-text text-transparent mb-3">
            Quote Analyzer v2
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Search for buyers and materials, enter your quote prices, and get AI-powered analysis of how competitive your quote is.
          </p>
        </header>

        {/* API Key Warning */}
        {!hasApiKey && (
          <div className="bg-amber-900/20 border border-amber-600/50 rounded-2xl p-6 mb-8">
            <div className="flex items-start">
              <AlertTriangle size={24} className="text-amber-400 mr-4 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-300 mb-2 flex items-center">
                  <Key size={18} className="mr-2" />
                  API Key Required
                </h3>
                <p className="text-amber-200/80 text-sm mb-4">
                  To use this real-time quote analyzer, you need to add your Gemini API key.
                </p>
                <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
                  <p className="text-slate-300 text-sm mb-2">1. Get a free API key from Google AI Studio:</p>
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-cyan-400 hover:text-cyan-300 text-sm"
                  >
                    https://aistudio.google.com/app/apikey
                    <ExternalLink size={14} className="ml-1" />
                  </a>
                  <p className="text-slate-300 text-sm mt-4 mb-2">2. Add to geminiService.ts or create a .env file</p>
                  <p className="text-slate-300 text-sm mt-2">3. Restart your development server</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Panel */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-6 mb-8">
          <SearchPanel
            companyQuery={companyQuery}
            partsQuery={partsQuery}
            onCompanyChange={setCompanyQuery}
            onPartsChange={setPartsQuery}
            onCompanySearch={handleCompanySearch}
            onPartsSearch={handlePartsSearch}
            isSearchingCompany={isSearchingCompany}
            isSearchingParts={isSearchingParts}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className={`rounded-xl p-4 mb-6 ${
            error.includes('Rate limit') || error.includes('wait') 
              ? 'bg-amber-900/20 border border-amber-600/50' 
              : 'bg-red-900/20 border border-red-700/50'
          }`}>
            <p className={`text-sm text-center ${
              error.includes('Rate limit') || error.includes('wait') 
                ? 'text-amber-400' 
                : 'text-red-400'
            }`}>
              {error.includes('Rate limit') || error.includes('wait') 
                ? '⏳ ' + error + ' (Free tier: 15 requests/minute)' 
                : error}
            </p>
          </div>
        )}

        {/* Loading States */}
        {(isSearchingCompany || isSearchingParts) && (
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 mb-8">
            <LoadingState 
              message={isSearchingCompany ? "Searching company data..." : "Fetching market prices..."} 
            />
          </div>
        )}

        {/* Results */}
        {hasResults && !isSearchingCompany && !isSearchingParts && (
          <div className="space-y-6">
            {/* Company Card */}
            {company && <CompanyCard company={company} />}

            {/* Parts Table - Market Prices */}
            {parts.length > 0 && <PartsTable parts={parts} />}

            {/* Supplier Quote Input */}
            {showQuoteInput && (
              <SupplierQuoteInput
                marketParts={parts}
                onQuoteChange={handleQuoteChange}
                paymentTerms={paymentTerms}
                onPaymentTermsChange={setPaymentTerms}
              />
            )}

            {/* Calculate Button */}
            {canCalculate && !attractiveness && (
              <div className="flex justify-center">
                <button
                  onClick={handleCalculateAttractiveness}
                  disabled={isCalculatingScore}
                  className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-900/30 transition-all flex items-center disabled:opacity-50"
                >
                  <Zap size={20} className="mr-2" />
                  Analyze Quote Attractiveness
                </button>
              </div>
            )}

            {/* Prompt to enter quotes */}
            {parts.length > 0 && supplierQuotes.length === 0 && !company && (
              <div className="text-center py-4">
                <p className="text-slate-400 text-sm">
                  ↑ Enter your quote prices above, then search for a company to analyze attractiveness
                </p>
              </div>
            )}

            {/* Prompt to search company */}
            {parts.length > 0 && supplierQuotes.length > 0 && !company && (
              <div className="text-center py-4 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
                <p className="text-amber-400 text-sm">
                  ⚡ Now search for a buyer company to see how attractive your quote is to them!
                </p>
              </div>
            )}

            {/* Calculating Score */}
            {isCalculatingScore && (
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800">
                <LoadingState message="Analyzing your quote vs market prices..." />
              </div>
            )}

            {/* Attractiveness Score */}
            {attractiveness && !isCalculatingScore && (
              <>
                <AttractivenessScore result={attractiveness} />
                
                {/* Recalculate button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleCalculateAttractiveness}
                    disabled={isCalculatingScore}
                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-lg transition-all flex items-center"
                  >
                    <Zap size={16} className="mr-2" />
                    Recalculate with Updated Prices
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Empty State */}
        {!hasResults && !isSearchingCompany && !isSearchingParts && !error && (
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-8">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-white mb-2">How It Works</h2>
              <p className="text-slate-400 text-sm">Three simple steps to analyze your quote competitiveness</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
                  <Package size={24} className="text-emerald-400" />
                </div>
                <p className="text-xs text-emerald-400 font-semibold mb-1">STEP 1</p>
                <h3 className="text-white font-medium mb-1">Search Materials</h3>
                <p className="text-xs text-slate-500">Get real-time market prices</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-amber-900/30 flex items-center justify-center mx-auto mb-3">
                  <span className="text-amber-400 text-xl font-bold">$</span>
                </div>
                <p className="text-xs text-amber-400 font-semibold mb-1">STEP 2</p>
                <h3 className="text-white font-medium mb-1">Enter Your Prices</h3>
                <p className="text-xs text-slate-500">Input your quote prices</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-cyan-900/30 flex items-center justify-center mx-auto mb-3">
                  <Building2 size={24} className="text-cyan-400" />
                </div>
                <p className="text-xs text-cyan-400 font-semibold mb-1">STEP 3</p>
                <h3 className="text-white font-medium mb-1">Search Buyer</h3>
                <p className="text-xs text-slate-500">Get attractiveness score</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-xs text-slate-600">
            Real-time market data via Gemini AI. Your quote prices are compared against market rates for accurate analysis.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default QuoteAnalyzer;
