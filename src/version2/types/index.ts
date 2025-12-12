// Type definitions for Version 2 Quote Analyzer

export interface CompanyData {
  name: string;
  industry: string;
  headquarters: string;
  marketCap?: string;
  revenueGrowth?: number;
  supplyChainFocus: string;
  sustainabilityScore?: number;
  paymentTermsTypical?: number;
  qualityStandards?: string[];
}

export interface PartPricing {
  partName: string;
  category: string;
  currentPrice: number;
  unit: string;
  priceChange: number;
  trend: 'up' | 'down' | 'stable';
  suppliers?: string[];
  leadTime?: string;
}

export interface AttractivenessResult {
  overallScore: number;
  priceCompetitiveness: number;
  qualityAlignment: number;
  deliveryReliability: number;
  sustainabilityFit: number;
  recommendation: string;
  keyInsights: string[];
}

export interface QuoteAnalysis {
  company: CompanyData | null;
  parts: PartPricing[];
  attractiveness: AttractivenessResult | null;
  isLoading: boolean;
  error: string | null;
}

export interface SearchState {
  companyQuery: string;
  partsQuery: string;
  isSearchingCompany: boolean;
  isSearchingParts: boolean;
}

