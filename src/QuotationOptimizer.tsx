import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  RefreshCcw,
  TrendingUp,
  DollarSign,
  Target,
  Clock,
  Zap,
  MessageCircle,
  Truck,
  Layers,
  Globe,
  BarChart3,
  ListOrdered,
  Send,
  Bot,
  User,
  Loader2,
  ArrowLeftRight,
  LayoutList,
  Factory,
  LineChart,
  PlusCircle,
  Trash2,
  Mic,
  MicOff
} from "lucide-react";
import { useThemeState } from "./App";

// --- Type Definitions ---

interface HistoricalData {
  price: number;
  quality: number;
  deliveryTime: number;
  paymentTerms?: number;
  carbonFootprint: number;
  incoterms: string;
}

interface BuyerProfile {
  name: string;
  focus: string;
  sentiment: string;
  historical: HistoricalData;
}

interface MaterialRejection {
  material: string;
  rejectionRate: number;
  reason: string;
}

interface GrowthDataPoint {
  year: number;
  growth: number;
}

interface PerformanceData {
  historical: GrowthDataPoint[];
  forecast: GrowthDataPoint[];
}

interface LineItem {
  id: number;
  itemId: string;
  itemDesc: string;
  quantity: number;
  unit: string;
  region: Region;
  price: number;
  quality: number;
  deliveryTime: number;
  paymentTerms: number;
  carbonFootprint: number;
  incoterms: string;
}

interface OptimizationResult {
  score: string;
  suggestion: string;
  emphasis: string;
  incotermDetail: string;
}

interface AttributeConfig {
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  unit: string;
}

interface RankedAttribute extends AttributeConfig {
  weight: number;
  isFocused: boolean;
}

interface ChatMessage {
  role: "user" | "ai";
  text: string;
}

interface AnalyticsDataPoint {
  year: number;
  awarded: number;
  rejected: number;
}

interface CompetitiveTargets {
  price: string;
  quality: number;
  deliveryTime: number;
  carbonFootprint: string;
  paymentTerms: number;
  [key: string]: string | number;
}

type Region = "GLOBAL" | "US" | "EU" | "APAC";

// --- API and Utility Constants ---
// API key is loaded from .env file (VITE_GEMINI_API_KEY)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent${
  API_KEY ? `?key=${API_KEY}` : ""
}`;

// --- Real-Time Data Fetching Functions using Gemini + Google Search ---

/**
 * Generic function to call Gemini API with Google Search grounding
 */
const callGeminiWithSearch = async (
  userQuery: string,
  systemPrompt: string
): Promise<string> => {
  const payload = {
    contents: [{ parts: [{ text: userQuery }] }],
    tools: [{ google_search: {} }],
    systemInstruction: { parts: [{ text: systemPrompt }] }
  };

  let retries = 0;
  const maxRetries = 3;

  while (retries < maxRetries) {
    try {
      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (error) {
      console.error(`Attempt ${retries + 1} failed:`, error);
      retries++;
      if (retries < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retries) * 1000));
      }
    }
  }
  return "";
};

/**
 * Fetches real company growth/performance data using Gemini + Google Search
 */
const fetchCompanyPerformanceData = async (
  companyName: string
): Promise<PerformanceData | null> => {
  const systemPrompt = `You are a financial analyst. Extract company revenue/growth data and return ONLY valid JSON, no markdown, no explanation. The JSON must match this exact structure:
{
  "historical": [{"year": 2020, "growth": 5.2}, ...],
  "forecast": [{"year": 2026, "growth": 4.0}, ...]
}
Include 5-10 years of historical data and 3-5 years of forecast. Use real publicly available data.`;

  const userQuery = `Find ${companyName}'s annual revenue growth rate (as percentage) for the last 5-10 years and analyst forecasts for the next 3-5 years. Return ONLY the JSON object.`;

  try {
    const response = await callGeminiWithSearch(userQuery, systemPrompt);
    
    // Extract JSON from response (handle potential markdown wrapping)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.historical && parsed.forecast) {
        return parsed as PerformanceData;
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching company performance:", error);
    return null;
  }
};

/**
 * Fetches real commodity/material pricing using Gemini + Google Search
 */
const fetchCommodityPrices = async (
  materials: string[]
): Promise<Record<string, { price: number; unit: string; trend: string }>> => {
  const systemPrompt = `You are a commodities market analyst. Return ONLY valid JSON with current market prices, no markdown, no explanation. Format:
{
  "Steel": {"price": 750, "unit": "USD/ton", "trend": "up"},
  "Aluminum": {"price": 2400, "unit": "USD/ton", "trend": "stable"}
}
Use real current market prices from recent data.`;

  const userQuery = `Find current market prices for these industrial materials: ${materials.join(", ")}. Include price in USD, unit of measurement, and recent trend (up/down/stable). Return ONLY the JSON object.`;

  try {
    const response = await callGeminiWithSearch(userQuery, systemPrompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return {};
  } catch (error) {
    console.error("Error fetching commodity prices:", error);
    return {};
  }
};

/**
 * Fetches real regional carbon emission targets using Gemini + Google Search
 */
const fetchRegionalCarbonTargets = async (): Promise<Record<Region, number>> => {
  const systemPrompt = `You are a sustainability analyst. Return ONLY valid JSON with carbon reduction multipliers by region (1.0 = no reduction, 0.7 = 30% reduction required). No markdown, no explanation. Format:
{
  "GLOBAL": 0.85,
  "US": 0.80,
  "EU": 0.70,
  "APAC": 0.90
}
Base these on actual 2024-2025 regulatory requirements and corporate sustainability targets.`;

  const userQuery = `What are the current carbon emission reduction targets for manufacturing and supply chain in different regions (Global average, US, EU, APAC)? Express as a multiplier where 1.0 means no reduction and 0.7 means 30% reduction required. Return ONLY the JSON object.`;

  try {
    const response = await callGeminiWithSearch(userQuery, systemPrompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        GLOBAL: parsed.GLOBAL ?? 0.85,
        US: parsed.US ?? 0.8,
        EU: parsed.EU ?? 0.7,
        APAC: parsed.APAC ?? 0.9
      };
    }
    return MOCK_CARBON_TARGETS;
  } catch (error) {
    console.error("Error fetching carbon targets:", error);
    return MOCK_CARBON_TARGETS;
  }
};

/**
 * Fetches real material rejection/quality data for a specific buyer
 */
const fetchMaterialRejectionData = async (
  buyerName: string
): Promise<MaterialRejection[]> => {
  const systemPrompt = `You are a quality control analyst. Return ONLY valid JSON array with material rejection data, no markdown, no explanation. Format:
[
  {"material": "Steel Alloy", "rejectionRate": 5, "reason": "Dimensional tolerance issues"},
  {"material": "Aluminum", "rejectionRate": 3, "reason": "Surface finish defects"}
]
Use realistic industry data based on public quality reports and industry standards for automotive/manufacturing.`;

  const userQuery = `What are typical material rejection rates and common quality issues for suppliers working with ${buyerName}? Include 3-5 common materials used in their supply chain with rejection percentages and primary reasons. Return ONLY the JSON array.`;

  try {
    const response = await callGeminiWithSearch(userQuery, systemPrompt);
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as MaterialRejection[];
      }
    }
    return MOCK_MATERIAL_REJECTION[buyerName] || [];
  } catch (error) {
    console.error("Error fetching rejection data:", error);
    return MOCK_MATERIAL_REJECTION[buyerName] || [];
  }
};

const ATTRIBUTES: AttributeConfig[] = [
  { key: "price", label: "Price Competitiveness", icon: DollarSign, unit: "$" },
  { key: "quality", label: "Quality Certifications", icon: Layers, unit: "%" },
  { key: "deliveryTime", label: "Delivery Time (Days)", icon: Truck, unit: "days" },
  { key: "paymentTerms", label: "Payment Terms (Days)", icon: Clock, unit: "days" },
  { key: "carbonFootprint", label: "Carbon Footprint", icon: Globe, unit: "tCO2e" },
  { key: "incoterms", label: "Incoterms", icon: Zap, unit: "" }
];

const BUYER_PROFILES: BuyerProfile[] = [
  {
    name: "Toyota",
    focus: "Quality",
    sentiment: "Stable, high demand for reliable parts.",
    historical: { price: 80, quality: 95, deliveryTime: 20, paymentTerms: 45, carbonFootprint: 10, incoterms: "FOB" }
  },
  {
    name: "Tesla",
    focus: "Innovation",
    sentiment: "Aggressive, prioritizes speed to market and new tech.",
    historical: { price: 90, quality: 85, deliveryTime: 10, paymentTerms: 30, carbonFootprint: 5, incoterms: "DDP" }
  },
  {
    name: "Generic Corp",
    focus: "Price",
    sentiment: "Cost-sensitive, looks for long-term contract discounts.",
    historical: { price: 95, quality: 70, deliveryTime: 30, paymentTerms: 30, carbonFootprint: 20, incoterms: "EXW" }
  }
];

const MOCK_MATERIAL_REJECTION: Record<string, MaterialRejection[]> = {
  Toyota: [
    { material: "Steel Alloy X", rejectionRate: 8, reason: "Dimensional Tolerance" },
    { material: "Composite Y", rejectionRate: 3, reason: "Surface Finish" },
    { material: "Rubber Seal Z", rejectionRate: 1, reason: "High Acceptance" }
  ],
  Tesla: [
    { material: "Composite Y", rejectionRate: 15, reason: "Delamination/High Heat Stress" },
    { material: "Aluminum Frame A", rejectionRate: 5, reason: "Weld Quality" },
    { material: "Polymer Housing B", rejectionRate: 0, reason: "New Material/No Data" }
  ],
  "Generic Corp": [
    { material: "Steel Alloy X", rejectionRate: 12, reason: "Cost-driven Material Failure" },
    { material: "Composite Y", rejectionRate: 10, reason: "General Defects" },
    { material: "Copper Wire", rejectionRate: 4, reason: "Minor Insulation Issues" }
  ]
};

const MOCK_BUYER_PERFORMANCE: Record<string, PerformanceData> = {
  Toyota: {
    historical: [
      { year: 2016, growth: 4.5 },
      { year: 2017, growth: 6.2 },
      { year: 2018, growth: 5.8 },
      { year: 2019, growth: 3.1 },
      { year: 2020, growth: -1.5 },
      { year: 2021, growth: 8.5 },
      { year: 2022, growth: 7.0 },
      { year: 2023, growth: 5.3 },
      { year: 2024, growth: 4.8 },
      { year: 2025, growth: 3.5 }
    ],
    forecast: [
      { year: 2026, growth: 4.2 },
      { year: 2027, growth: 5.0 },
      { year: 2028, growth: 6.5 },
      { year: 2029, growth: 5.8 },
      { year: 2030, growth: 5.1 }
    ]
  },
  Tesla: {
    historical: [
      { year: 2016, growth: 15.0 },
      { year: 2017, growth: 22.0 },
      { year: 2018, growth: 35.0 },
      { year: 2019, growth: 40.0 },
      { year: 2020, growth: 45.0 },
      { year: 2021, growth: 70.0 },
      { year: 2022, growth: 55.0 },
      { year: 2023, growth: 38.0 },
      { year: 2024, growth: 25.0 },
      { year: 2025, growth: 18.0 }
    ],
    forecast: [
      { year: 2026, growth: 15.0 },
      { year: 2027, growth: 16.5 },
      { year: 2028, growth: 17.0 },
      { year: 2029, growth: 18.5 },
      { year: 2030, growth: 20.0 }
    ]
  },
  "Generic Corp": {
    historical: [
      { year: 2016, growth: 1.0 },
      { year: 2017, growth: 0.5 },
      { year: 2018, growth: 1.2 },
      { year: 2019, growth: 0.8 },
      { year: 2020, growth: -2.0 },
      { year: 2021, growth: 1.5 },
      { year: 2022, growth: 2.1 },
      { year: 2023, growth: 1.9 },
      { year: 2024, growth: 1.5 },
      { year: 2025, growth: 0.9 }
    ],
    forecast: [
      { year: 2026, growth: 1.1 },
      { year: 2027, growth: 1.3 },
      { year: 2028, growth: 1.5 },
      { year: 2029, growth: 1.7 },
      { year: 2030, growth: 2.0 }
    ]
  }
};

const MOCK_CARBON_TARGETS: Record<Region, number> = {
  GLOBAL: 0.85, // 15% reduction required globally (default)
  US: 0.8, // 20% reduction required in the US
  EU: 0.7, // 30% reduction required in the EU
  APAC: 0.9 // 10% reduction required in APAC
};

const INITIAL_LINE_ITEMS = (historical: HistoricalData): LineItem[] => [
  {
    id: 1,
    itemId: "P472A",
    itemDesc: "Custom CNC Aluminum Housing",
    quantity: 1000,
    unit: "pcs",
    region: "GLOBAL",
    price: historical.price,
    quality: historical.quality,
    deliveryTime: historical.deliveryTime,
    paymentTerms: historical.paymentTerms ?? 30,
    carbonFootprint: historical.carbonFootprint,
    incoterms: historical.incoterms
  }
];

/**
 * Simulates calling the RoR backend to retrieve historical data.
 */
const fetchHistoricalData = (buyerName: string): Promise<HistoricalData | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const profile = BUYER_PROFILES.find((p) => p.name === buyerName);
      resolve(profile ? profile.historical : null);
    }, 500); // Simulate network delay
  });
};

/**
 * Calls the Gemini API to get live buyer sentiment and focus using Google Search.
 */
const fetchBuyerSentimentFromWeb = async (buyerName: string): Promise<{ text: string; focus: string }> => {
  const systemPrompt =
    "Act as a procurement analyst. Given a company name, find recent public sentiment and supply chain priorities (Price, Quality, Delivery Time, Payment Terms, Carbon Footprint, Incoterms). Output a concise paragraph summarizing the company's focus and sentiment, highlighting which attribute is prioritized. **Do not include citations in the output text.**";
  const userQuery = `Find the current supply chain sentiment, market perception, and primary procurement focus for ${buyerName}. Summarize the core priority (e.g., Quality, Price, or Delivery).`;

  const payload = {
    contents: [{ parts: [{ text: userQuery }] }],
    tools: [{ "google_search": {} }],
    systemInstruction: { parts: [{ text: systemPrompt }] }
  };

  let retries = 0;
  const maxRetries = 3;

  while (retries < maxRetries) {
    try {
      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "Failed to retrieve real-time sentiment data.";

      // Extract the simple priority from the text for UI use
      const focusMatch = text.match(/(prioritized is |core priority is )(\w+)/i);
      const focus = focusMatch ? focusMatch[2] : BUYER_PROFILES.find((p) => p.name === buyerName)?.focus || "Generic";

      return { text, focus };
    } catch (error) {
      console.error(`Attempt ${retries + 1} failed:`, error);
      retries++;
      if (retries < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retries) * 1000)); // Exponential backoff
      }
    }
  }
  return { text: "Error: Could not retrieve live data after multiple retries.", focus: "Generic" };
};

// --- Core Optimization Logic ---

/**
 * Calculates the relative ranking of attributes based on the buyer's focus.
 */
const calculateAttributeRanking = (buyerFocus: string): RankedAttribute[] => {
  const lowerCaseFocus = buyerFocus.toLowerCase();

  // Assign weights: 2.5x for focus, 1.0x for others
  const rankedAttributes: RankedAttribute[] = ATTRIBUTES.filter((a) => a.key !== "incoterms").map((attr) => ({
    ...attr,
    weight: attr.key === lowerCaseFocus ? 2.5 : 1.0,
    isFocused: attr.key === lowerCaseFocus
  }));

  // Sort by weight descending
  rankedAttributes.sort((a, b) => b.weight - a.weight);

  return rankedAttributes;
};

/**
 * Generates specific, actionable targets for the supplier based on buyer priority AND region.
 */
const generateCompetitiveTargets = (
  historicalData: {
    price: number;
    quality: number;
    deliveryTime: number;
    paymentTerms: number;
    carbonFootprint: number;
  },
  buyerFocus: string,
  region: Region
): CompetitiveTargets => {
  const lowerCaseFocus = buyerFocus.toLowerCase();
  const carbonTargetFactor = MOCK_CARBON_TARGETS[region] ?? MOCK_CARBON_TARGETS.GLOBAL;

  // PRICE: Target a 5% improvement over historical average, or 8% if Price is the primary focus.
  const priceFactor = lowerCaseFocus === "price" ? 0.92 : 0.95;
  const price = (historicalData.price * priceFactor).toFixed(2);

  // QUALITY: Target a 3% improvement over historical average, or 5% if Quality is the primary focus.
  const qualityFactor = lowerCaseFocus === "quality" ? 5 : 3;
  const quality = Math.min(100, historicalData.quality + qualityFactor);

  // DELIVERY TIME: Target a 10% reduction over historical average, or 20% reduction if Delivery is the primary focus.
  const deliveryFactor = lowerCaseFocus === "deliverytime" ? 0.8 : 0.9;
  const deliveryTime = Math.max(1, Math.round(historicalData.deliveryTime * deliveryFactor));

  // CARBON FOOTPRINT: Target based on regional requirement
  const carbonFootprint = (historicalData.carbonFootprint * carbonTargetFactor).toFixed(1);

  // PAYMENT TERMS: Target 15 days longer than historical average, or 30 days longer if Price is the focus.
  const paymentDays = lowerCaseFocus === "price" ? 30 : 15;
  const paymentTerms = historicalData.paymentTerms + paymentDays;

  return { price, quality, deliveryTime, carbonFootprint, paymentTerms };
};

interface SupplierQuote {
  price: number;
  quality: number;
  deliveryTime: number;
  paymentTerms: number;
  carbonFootprint: number;
  incoterms: string;
}

/**
 * Simulates the backend optimization logic based on buyer focus and supplier inputs.
 */
const performOptimization = (supplierQuote: SupplierQuote, buyerFocus: string): OptimizationResult => {
  const lowerCaseFocus = buyerFocus.toLowerCase();

  // 1. Calculate a general "Attractiveness Score"
  let score = 0;
  let weight = 0;

  // Simplified scoring logic: higher values are generally better, except for Cost/Time/Carbon (lower is better)
  const normalizedQuote: Record<string, number> = {
    price: 100 - (supplierQuote.price / 100) * 50, // Lower price is higher score
    quality: (supplierQuote.quality / 100) * 100, // Quality is direct
    deliveryTime: 100 - (supplierQuote.deliveryTime / 60) * 50, // Shorter time is higher score (Max 60 days used as base)
    paymentTerms: (supplierQuote.paymentTerms / 90) * 50, // Longer terms is slightly better (Max 90 days used as base)
    carbonFootprint: 100 - (supplierQuote.carbonFootprint / 20) * 50 // Lower carbon is higher score (Max 20 used as base)
  };

  let emphasisKey = "price";
  let maxWeight = -1;

  // 2. Apply Dynamic Weighting based on Buyer Focus
  ATTRIBUTES.filter((a) => a.key !== "incoterms").forEach((attr) => {
    const attrWeight = attr.key === lowerCaseFocus ? 2.5 : 1.0; // Focus gets 2.5x weight
    const attrScore = normalizedQuote[attr.key] || 0;

    score += attrScore * attrWeight;
    weight += attrWeight;

    if (attrWeight > maxWeight) {
      maxWeight = attrWeight;
      emphasisKey = attr.key;
    }
  });

  const finalScore = score / weight;

  // 3. Generate Suggestions
  let suggestion = `Current score is **${finalScore.toFixed(1)}/100**. `;

  if (finalScore >= 85) {
    suggestion +=
      "Excellent alignment! Emphasize the **low Carbon Footprint** and your **short Delivery Time** in the final bid.";
  } else if (finalScore >= 70) {
    suggestion += `Good potential. The buyer prioritizes **${buyerFocus}**, but your **${emphasisKey}** value could be more competitive to maximize the chance of winning.`;
  } else {
    suggestion += `Poor alignment. Your quote needs major adjustments. Review the historical data and specifically improve your **${buyerFocus}** offering.`;
  }

  const emphasisAttr = ATTRIBUTES.find((a) => a.key === emphasisKey);
  const incotermText =
    supplierQuote.incoterms === "FOB"
      ? "Free On Board (FOB) - Low Risk for Supplier"
      : "Delivered Duty Paid (DDP) - High Risk for Supplier";

  return {
    score: finalScore.toFixed(1),
    suggestion,
    emphasis: emphasisAttr ? emphasisAttr.label : "Pricing",
    incotermDetail: incotermText
  };
};

// --- Individual Components used in App ---

interface RecommendedTargetsProps {
  lineItems: LineItem[];
  buyerFocus: string;
  isDark?: boolean;
}

const RecommendedTargets: React.FC<RecommendedTargetsProps> = ({ lineItems, buyerFocus, isDark = false }) => {
  if (!lineItems || lineItems.length === 0) return null;

  const targetAttributes = [
    { key: "price", label: "Price", unit: "$" },
    { key: "quality", label: "Quality", unit: "% Score" },
    { key: "deliveryTime", label: "Delivery Time", unit: "Days" },
    { key: "carbonFootprint", label: "Carbon Footprint", unit: "tCO2e" },
    { key: "paymentTerms", label: "Payment Terms", unit: "Days" }
  ];

  // Helper function to extract only the strategic attributes from the line item for target generation
  const extractStrategicAttributes = (item: LineItem) => ({
    price: item.price,
    quality: item.quality,
    deliveryTime: item.deliveryTime,
    paymentTerms: item.paymentTerms,
    carbonFootprint: item.carbonFootprint
  });

  return (
    <div 
      className="mt-6 p-4 rounded-xl border"
      style={{
        backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : '#f0fdf4',
        borderColor: isDark ? '#15803d' : '#bbf7d0'
      }}
    >
      <h4 className="text-lg font-bold mb-3 flex items-center" style={{ color: isDark ? '#4ade80' : '#15803d' }}>
        <Target size={18} className="mr-2" /> Recommended Competitive Targets (Per Item)
      </h4>
      <p className="text-xs mb-4" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>
        Targets are based on the current line item's inputs and **{buyerFocus}** priority.
      </p>

      <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
        {lineItems.map((item, index) => {
          // Use item's current attributes as historical baseline for target calculation
          const historicalData = extractStrategicAttributes(item);
          // Pass the item's region to the target generator
          const targets = generateCompetitiveTargets(historicalData, buyerFocus, item.region);

          return (
            <div 
              key={item.id} 
              className="rounded-lg p-3 shadow-sm border"
              style={{
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                borderColor: isDark ? '#475569' : '#e2e8f0'
              }}
            >
              <h5 className="font-bold text-sm mb-2" style={{ color: isDark ? '#818cf8' : '#4f46e5' }}>
                Item {index + 1}: {item.itemDesc} ({item.itemId})
                <span className="ml-2 text-xs font-normal" style={{ color: isDark ? '#f87171' : '#ef4444' }}>({item.region} Target)</span>
              </h5>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {targetAttributes.map((attr) => (
                  <div key={attr.key} className="flex flex-col">
                    <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{attr.label} Target:</span>
                    <span className="font-semibold" style={{ color: isDark ? '#4ade80' : '#16a34a' }}>
                      {targets[attr.key]} {attr.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface ProposalDraftGeneratorProps {
  buyerName: string;
  buyerFocus: string;
  optimizationResult: OptimizationResult | null;
}

const ProposalDraftGenerator: React.FC<ProposalDraftGeneratorProps> = ({
  buyerName,
  buyerFocus,
  optimizationResult
}) => {
  const theme = useThemeState();
  const isDark = theme === 'dark';
  const [draft, setDraft] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Reset draft when buyer changes
  useEffect(() => {
    setDraft("");
  }, [buyerName]);

  const generateProposal = async () => {
    if (!optimizationResult || isGenerating) return;

    setIsGenerating(true);
    setDraft("Drafting proposal... This may take a moment as the AI crafts a highly persuasive, tailored narrative.");

    const systemPrompt = `You are a Senior Bid Manager for a B2B supplier. Your task is to generate a persuasive, 3-paragraph proposal section tailored to the specific buyer focus and optimized quote parameters provided. The generated text must be professional, formal, and directly address the buyer's primary concern.`;

    const userQuery = `Draft a proposal section for buyer '${buyerName}'. 
            Primary focus: ${buyerFocus}. 
            Attractiveness Score: ${optimizationResult.score}/100.
            Key Emphasis: ${optimizationResult.emphasis}.
            Strategy Suggestion: ${optimizationResult.suggestion.replace(/<[^>]*>?/gm, "")}.
            Incoterms offered: ${optimizationResult.incotermDetail}.

            Structure:
            1. Opening: Confirm understanding of buyer's priority (${buyerFocus}).
            2. Core Value: Detail how our quote parameters support that priority (e.g., if Quality, highlight certifications).
            3. Closing: Summarize the high attractiveness score and next steps.
        `;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      tools: [{ "google_search": {} }],
      systemInstruction: { parts: [{ text: systemPrompt }] }
    };

    try {
      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "Failed to generate proposal draft.";
      setDraft(text);
    } catch (error) {
      console.error("Proposal Generation Error:", error);
      setDraft("Error generating proposal: Could not connect to the AI model.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div 
      className="p-6 rounded-xl shadow-lg border flex-1 flex flex-col"
      style={{
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        borderColor: isDark ? '#334155' : '#e2e8f0'
      }}
    >
      <h3 className="text-xl font-bold mb-4 flex items-center" style={{ color: isDark ? '#f1f5f9' : '#1e293b' }}>
        <Bot size={20} className="mr-2" style={{ color: isDark ? '#f472b6' : '#db2777' }} /> Proposal Draft Generator ✨
      </h3>

      <button
        onClick={generateProposal}
        disabled={isGenerating || !optimizationResult}
        className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg shadow-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mb-4">
        {isGenerating ? <Loader2 size={20} className="animate-spin mr-2" /> : <Layers size={20} className="mr-2" />}
        {isGenerating ? "Drafting..." : "Generate Tailored Proposal Draft"}
      </button>

      <div 
        className="p-4 rounded-lg flex-1 overflow-y-auto whitespace-pre-wrap text-sm border-l-4 border-pink-500"
        style={{
          backgroundColor: isDark ? '#334155' : '#f8fafc',
          color: isDark ? '#e2e8f0' : '#334155'
        }}
      >
        {draft || (
          <p className="italic" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
            Click the button above to generate a preliminary draft for your final quotation document, dynamically
            emphasizing {buyerFocus}.
          </p>
        )}
      </div>
    </div>
  );
};

interface AIPricingAssistantProps {
  buyerName: string;
}

// Speech Recognition types for TypeScript
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const AIPricingAssistant: React.FC<AIPricingAssistantProps> = ({ buyerName }) => {
  const theme = useThemeState();
  const isDark = theme === 'dark';
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [chatHistory]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const results = event.results;
        let transcript = "";

        for (let i = event.resultIndex; i < results.length; i++) {
          transcript += results[i][0].transcript;
        }

        setInput(transcript);

        // If this is a final result, we can optionally auto-submit
        if (results[results.length - 1].isFinal) {
          setIsListening(false);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Reset chat history when buyer changes
  useEffect(() => {
    setChatHistory([]);
    setInput("");
    // Stop listening if buyer changes
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [buyerName]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput(""); // Clear input before starting
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleAIChat = async (query: string) => {
    if (!query.trim() || isThinking) return;

    const userMessage: ChatMessage = { role: "user", text: query };
    setChatHistory((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    const AI_SYSTEM_PROMPT = `You are a specialized Procurement and Pricing Analyst AI. Your role is to answer user questions regarding competitor pricing, price differences, and buyer price sensitivity for the current selected buyer, ${buyerName}. You MUST use Google Search to provide up-to-date and grounded information on the competitive landscape and market rates. Keep your answers concise and focused on commercial strategy.`;

    const payload = {
      contents: [{ parts: [{ text: `Regarding the buyer ${buyerName}, the user asks: ${query}` }] }],
      tools: [{ "google_search": {} }],
      systemInstruction: { parts: [{ text: AI_SYSTEM_PROMPT }] }
    };

    try {
      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      const text =
        result.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I encountered an issue retrieving real-time pricing data.";

      const aiMessage: ChatMessage = { role: "ai", text: text };
      setChatHistory((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      const errorMessage: ChatMessage = {
        role: "ai",
        text: "Error: Failed to connect to the AI pricing engine. Please check your network."
      };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div 
      className="p-6 rounded-xl shadow-lg border flex flex-col flex-1"
      style={{
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        borderColor: isDark ? '#334155' : '#e2e8f0'
      }}
    >
      <h3 
        className="text-xl font-bold mb-4 flex items-center border-b pb-3"
        style={{ 
          color: isDark ? '#818cf8' : '#4f46e5',
          borderColor: isDark ? '#475569' : '#e2e8f0'
        }}
      >
        <Bot size={20} className="mr-2" /> AI Pricing Assistant ({buyerName})
      </h3>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
        {chatHistory.length === 0 ? (
          <div className="text-center mt-10" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
            Ask me about competitor pricing, market rates, or price difference for {buyerName}.
          </div>
        ) : (
          chatHistory.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-xs md:max-w-md p-3 rounded-lg shadow-md"
                style={msg.role === "user" 
                  ? { backgroundColor: '#4f46e5', color: '#ffffff' } 
                  : { 
                      backgroundColor: isDark ? '#334155' : '#f1f5f9', 
                      color: isDark ? '#e2e8f0' : '#334155',
                      border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`
                    }
                }
              >
                <div className="flex items-center text-sm font-semibold mb-1">
                  {msg.role === "ai" ? (
                    <Bot size={14} className="mr-1" style={{ color: isDark ? '#fbbf24' : '#ca8a04' }} />
                  ) : (
                    <User size={14} className="mr-1" />
                  )}
                  {msg.role === "ai" ? "Analyst AI" : "You"}
                </div>
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex space-x-3 pt-4 border-t" style={{ borderColor: isDark ? '#475569' : '#e2e8f0' }}>
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleAIChat(input);
            }}
            placeholder={isListening ? "Listening... speak now" : `Ask about ${buyerName}'s pricing...`}
            className="w-full p-3 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            style={{
              backgroundColor: isDark ? '#334155' : '#ffffff',
              color: isDark ? '#f1f5f9' : '#1e293b',
              borderColor: isListening ? '#ef4444' : (isDark ? '#475569' : '#cbd5e1')
            }}
            disabled={isThinking || isListening}
          />
          {isListening && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-red-500 font-medium">Recording</span>
            </span>
          )}
        </div>

        {/* Speech-to-Text Button */}
        {speechSupported && (
          <button
            onClick={toggleListening}
            disabled={isThinking}
            title={isListening ? "Stop listening" : "Start voice input"}
            className="p-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={isListening 
              ? { backgroundColor: '#ef4444', color: '#ffffff' }
              : { backgroundColor: isDark ? '#334155' : '#e2e8f0', color: isDark ? '#cbd5e1' : '#475569' }
            }
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        )}

        <button
          onClick={() => handleAIChat(input)}
          disabled={isThinking || input.trim() === "" || isListening}
          className="p-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
          {isThinking ? <Loader2 size={24} className="animate-spin" /> : <Send size={20} />}
        </button>
      </div>
    </div>
  );
};

// --- Material Rejection Chart Component ---

interface MaterialRejectionChartProps {
  buyerName: string;
  rejectionData: MaterialRejection[];
  isDark?: boolean;
}

const MaterialRejectionChart: React.FC<MaterialRejectionChartProps> = ({ buyerName, rejectionData, isDark = false }) => {
  const getColor = (rate: number) => {
    if (rate >= 10) return "bg-red-500";
    if (rate >= 5) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div 
      className="p-4 rounded-xl shadow-inner border"
      style={{
        backgroundColor: isDark ? 'rgba(51, 65, 85, 0.5)' : '#f1f5f9',
        borderColor: isDark ? '#475569' : '#e2e8f0'
      }}
    >
      <h4 className="text-xl font-bold mb-4 flex items-center" style={{ color: isDark ? '#818cf8' : '#4f46e5' }}>
        <Factory size={20} className="mr-2" /> Quality Rejection Rates
      </h4>
      <p className="text-sm mb-4" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>Historical rejection percentage per material for {buyerName}.</p>

      <div className="space-y-4">
        {rejectionData.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-semibold" style={{ color: isDark ? '#f1f5f9' : '#1e293b' }}>{item.material}</span>
              <span className="text-xs italic" style={{ color: isDark ? '#f87171' : '#ef4444' }}>Reason: {item.reason}</span>
            </div>
            <div 
              className="h-6 rounded-full overflow-hidden"
              style={{ backgroundColor: isDark ? '#475569' : '#cbd5e1' }}
            >
              <div
                style={{ width: `${item.rejectionRate}%` }}
                className={`h-full ${getColor(
                  item.rejectionRate
                )} flex items-center justify-end px-2 text-xs font-bold text-white transition-all duration-500`}>
                {item.rejectionRate > 2 ? `${item.rejectionRate}%` : ""}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Buyer Market Performance Chart Component ---

interface BuyerPerformanceChartProps {
  buyerName: string;
  performanceData: PerformanceData;
  isDark?: boolean;
}

const BuyerPerformanceChart: React.FC<BuyerPerformanceChartProps> = ({ buyerName: _buyerName, performanceData, isDark = false }) => {
  // Note: buyerName is available for future use if needed
  void _buyerName; // Suppress unused variable warning
  const allData = [...performanceData.historical, ...performanceData.forecast];
  const growthValues = allData.map((d) => d.growth);
  const maxGrowth = Math.max(...growthValues) + 5; // Buffer for max Y-axis
  const minGrowth = Math.min(0, Math.min(...growthValues));

  const dataPoints = allData.map((d) => ({
    ...d,
    // Normalize height relative to the max positive value
    normalizedHeight: (d.growth / maxGrowth) * 100,
    isForecast: d.year > new Date().getFullYear(),
    isNegative: d.growth < 0
  }));

  return (
    <div 
      className="p-4 rounded-xl shadow-inner border h-96 flex flex-col"
      style={{
        backgroundColor: isDark ? 'rgba(51, 65, 85, 0.5)' : '#f1f5f9',
        borderColor: isDark ? '#475569' : '#e2e8f0'
      }}
    >
      <h4 className="text-xl font-bold mb-4 flex items-center" style={{ color: isDark ? '#4ade80' : '#16a34a' }}>
        <LineChart size={20} className="mr-2" /> Market Performance (Annual Growth %)
      </h4>

      <div 
        className="flex-1 relative border-l border-b mb-4 pt-4"
        style={{ borderColor: isDark ? '#64748b' : '#cbd5e1' }}
      >
        {/* Y-Axis Label */}
        <div className="absolute top-0 -left-10 text-xs" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>+{maxGrowth.toFixed(0)}%</div>
        <div className="absolute bottom-0 -left-10 text-xs" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{minGrowth.toFixed(0)}%</div>

        <div className="flex justify-around h-full items-end">
          {dataPoints.map((d) => (
            <div key={d.year} className="flex flex-col items-center w-8 h-full relative group">
              {/* Bar Visualization */}
              <div
                style={{
                  height: `${(Math.abs(d.growth) / maxGrowth) * 80}%`,
                  marginTop: d.isNegative ? "auto" : "none"
                }}
                className={`w-3 rounded-t-sm transition-all duration-500 ${
                  d.isNegative ? "bg-red-500 self-start" : "bg-green-500 self-start"
                }
                                            ${d.isForecast ? "opacity-50 border border-dashed" : ""}
                                            relative`}>
                {/* Tooltip */}
                <div 
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 p-1 px-2 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap"
                  style={{ backgroundColor: isDark ? '#0f172a' : '#1e293b' }}
                >
                  {d.growth.toFixed(1)}%
                </div>
              </div>

              {/* X-Axis Label */}
              <span
                className="absolute bottom-[-20px] text-[10px]"
                style={{ color: d.isForecast ? (isDark ? '#818cf8' : '#4f46e5') : (isDark ? '#94a3b8' : '#64748b') }}
              >
                '{String(d.year).slice(-2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center space-x-6 text-sm mt-4">
        <span className="flex items-center font-semibold" style={{ color: isDark ? '#4ade80' : '#16a34a' }}>
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div> Historical Growth
        </span>
        <span className="flex items-center font-semibold" style={{ color: isDark ? '#818cf8' : '#4f46e5' }}>
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2 opacity-50 border border-dashed"></div> 5 Year Forecast
        </span>
      </div>
    </div>
  );
};

// --- Analytics Dashboard Component ---

// Generate mock analytics data outside of component to avoid Math.random in render
const generateMockAnalytics = (): Record<string, AnalyticsDataPoint[]> => {
  const data: Record<string, AnalyticsDataPoint[]> = {};
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 9;

  // Use seeded random-like values based on buyer name and year for consistency
  const getSeededValue = (buyerName: string, year: number, base: number, range: number): number => {
    const seed = buyerName.charCodeAt(0) + year;
    return base + (seed % range);
  };

  BUYER_PROFILES.forEach((profile) => {
    data[profile.name] = [];
    for (let year = startYear; year <= currentYear; year++) {
      let awarded: number;
      if (profile.name === "Toyota") {
        awarded = getSeededValue(profile.name, year, 75, 20);
      } else if (profile.name === "Tesla") {
        awarded = getSeededValue(profile.name, year, 40, 40);
      } else {
        awarded = getSeededValue(profile.name, year, 30, 30);
      }

      const rejected = 100 - awarded;

      data[profile.name].push({ year, awarded, rejected });
    }
  });
  return data;
};

const MOCK_ANALYTICS = generateMockAnalytics();

interface AnalyticsDashboardProps {
  realPerformanceData?: Record<string, PerformanceData>;
  realRejectionData?: Record<string, MaterialRejection[]>;
  isLoadingRealData?: boolean;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  realPerformanceData,
  realRejectionData,
  isLoadingRealData = false
}) => {
  const theme = useThemeState();
  const isDark = theme === 'dark';
  const [selectedBuyer, setSelectedBuyer] = useState(BUYER_PROFILES[0].name);
  const [chartStyle, setChartStyle] = useState<"horizontal" | "vertical">("horizontal");

  const buyerData = MOCK_ANALYTICS[selectedBuyer];
  
  // Use real data if available, fallback to mock
  const rejectionData = realRejectionData?.[selectedBuyer] || MOCK_MATERIAL_REJECTION[selectedBuyer];
  const marketPerformanceData = realPerformanceData?.[selectedBuyer] || MOCK_BUYER_PERFORMANCE[selectedBuyer];

  const renderHorizontalChart = () => (
    <div className="space-y-3">
      {buyerData.map((dataPoint) => (
        <div key={dataPoint.year} className="flex items-center">
          <span className="w-16 text-right mr-4 text-sm font-bold" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>{dataPoint.year}</span>
          <div 
            className="flex flex-1 h-8 rounded-lg overflow-hidden shadow-md border"
            style={{ borderColor: isDark ? '#475569' : '#e2e8f0' }}
          >
            {/* Awarded Bar */}
            <div
              style={{ width: `${dataPoint.awarded}%` }}
              className="bg-green-500 flex items-center justify-end px-2 text-xs font-bold text-white transition-all duration-500">
              {dataPoint.awarded > 10 ? `${dataPoint.awarded}%` : ""}
            </div>
            {/* Rejected Bar */}
            <div
              style={{ width: `${dataPoint.rejected}%` }}
              className="bg-red-500 flex items-center px-2 text-xs font-bold text-white transition-all duration-500">
              {dataPoint.rejected > 10 ? `${dataPoint.rejected}%` : ""}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderVerticalChart = () => (
    <div className="flex justify-between items-end h-64 border-b border-l p-2" style={{ borderColor: isDark ? '#64748b' : '#cbd5e1' }}>
      {buyerData.map((dataPoint) => {
        const totalHeight = 240; // Max height in px
        const awardedHeight = (dataPoint.awarded / 100) * totalHeight;
        const rejectedHeight = (dataPoint.rejected / 100) * totalHeight;

        return (
          <div key={dataPoint.year} className="flex flex-col items-center w-10">
            <div className="flex flex-col-reverse w-full h-full overflow-hidden" style={{ height: totalHeight + "px" }}>
              {/* Rejected Bar (top of stack) */}
              <div
                style={{ height: `${rejectedHeight}px` }}
                className="w-full bg-red-500 flex items-start justify-center text-[10px] font-bold text-white pt-1 transition-all duration-500">
                {dataPoint.rejected > 5 ? `${dataPoint.rejected}%` : ""}
              </div>
              {/* Awarded Bar (bottom of stack) */}
              <div
                style={{ height: `${awardedHeight}px` }}
                className="w-full bg-green-500 flex items-start justify-center text-[10px] font-bold text-white pt-1 transition-all duration-500">
                {dataPoint.awarded > 5 ? `${dataPoint.awarded}%` : ""}
              </div>
            </div>
            <span className="text-slate-600 dark:text-slate-300 mt-2 text-xs font-bold">{dataPoint.year}</span>
          </div>
        );
      })}
    </div>
  );

  const isUsingRealPerformance = !!realPerformanceData?.[selectedBuyer];
  const isUsingRealRejection = !!realRejectionData?.[selectedBuyer];

  return (
    <div 
      className="mt-12 p-8 rounded-xl shadow-lg border"
      style={{
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        borderColor: isDark ? '#334155' : '#e2e8f0'
      }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center" style={{ color: isDark ? '#fbbf24' : '#ca8a04' }}>
          <BarChart3 size={28} className="mr-3" /> Quotation Performance Analysis
        </h2>
        {/* Real-time data indicator */}
        <div className="flex items-center space-x-2">
          {isLoadingRealData ? (
            <span 
              className="flex items-center text-xs px-3 py-1 rounded-full"
              style={{ 
                color: isDark ? '#60a5fa' : '#2563eb',
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe'
              }}
            >
              <Loader2 size={12} className="animate-spin mr-1" /> Fetching live data...
            </span>
          ) : (
            <span 
              className="flex items-center text-xs px-3 py-1 rounded-full"
              style={isUsingRealPerformance || isUsingRealRejection 
                ? { color: isDark ? '#4ade80' : '#16a34a', backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7' }
                : { color: isDark ? '#94a3b8' : '#64748b', backgroundColor: isDark ? '#334155' : '#e2e8f0' }
              }
            >
              <Globe size={12} className="mr-1" />
              {isUsingRealPerformance || isUsingRealRejection ? "Live Data" : "Mock Data"}
            </span>
          )}
        </div>
      </div>

      <div className="flex space-x-6">
        {/* 1. Historical Bid Chart (Left Side) */}
        <div className="w-1/2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold" style={{ color: isDark ? '#f1f5f9' : '#1e293b' }}>Bid Success Rate ({selectedBuyer})</h3>
            {/* Buyer Selector */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-semibold" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>Buyer:</label>
              <select
                value={selectedBuyer}
                onChange={(e) => setSelectedBuyer(e.target.value)}
                className="p-2 rounded-md focus:ring-yellow-500 focus:border-yellow-500 border"
                style={{
                  backgroundColor: isDark ? '#334155' : '#ffffff',
                  color: isDark ? '#f1f5f9' : '#1e293b',
                  borderColor: isDark ? '#475569' : '#cbd5e1'
                }}
              >
                {BUYER_PROFILES.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chart Style Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>View Style:</span>
            <button
              onClick={() => setChartStyle("horizontal")}
              className="p-2 rounded-md transition-colors duration-200"
              style={chartStyle === "horizontal" 
                ? { backgroundColor: '#4f46e5', color: '#ffffff' }
                : { backgroundColor: isDark ? '#334155' : '#e2e8f0', color: isDark ? '#cbd5e1' : '#475569' }
              }
              title="Horizontal Bar Chart">
              <LayoutList size={20} />
            </button>
            <button
              onClick={() => setChartStyle("vertical")}
              className="p-2 rounded-md transition-colors duration-200"
              style={chartStyle === "vertical" 
                ? { backgroundColor: '#4f46e5', color: '#ffffff' }
                : { backgroundColor: isDark ? '#334155' : '#e2e8f0', color: isDark ? '#cbd5e1' : '#475569' }
              }
              title="Vertical Bar Chart">
              <ArrowLeftRight size={20} className="rotate-90" />
            </button>
          </div>

          {/* Chart Rendering Area */}
          {chartStyle === "horizontal" ? renderHorizontalChart() : renderVerticalChart()}

          <div className="flex justify-center space-x-6 text-sm">
            <span className="flex items-center font-semibold" style={{ color: isDark ? '#4ade80' : '#16a34a' }}>
              <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div> Awarded Quotations
            </span>
            <span className="flex items-center font-semibold" style={{ color: isDark ? '#f87171' : '#dc2626' }}>
              <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div> Rejected Quotations
            </span>
          </div>
        </div>

        {/* 2. Market Performance and Rejection (Right Side) */}
        <div className="w-1/2 flex flex-col space-y-6">
          <BuyerPerformanceChart buyerName={selectedBuyer} performanceData={marketPerformanceData} isDark={isDark} />
          <MaterialRejectionChart buyerName={selectedBuyer} rejectionData={rejectionData} isDark={isDark} />
        </div>
      </div>
    </div>
  );
};

// --- Quotation Input Table Component ---

interface QuotationTableInputProps {
  lineItems: LineItem[];
  setLineItems: React.Dispatch<React.SetStateAction<LineItem[]>>;
  onLineItemChange: (firstItem: LineItem) => void;
  isLoading: boolean;
  isDark?: boolean;
}

const QuotationTableInput: React.FC<QuotationTableInputProps> = ({
  lineItems,
  setLineItems,
  onLineItemChange,
  isLoading,
  isDark = false
}) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    id: number,
    field: keyof LineItem
  ) => {
    const value =
      field === "itemDesc" || field === "unit" || field === "incoterms" || field === "itemId" || field === "region"
        ? e.target.value
        : parseFloat(e.target.value);

    const updatedItems = lineItems.map((item) => (item.id === id ? { ...item, [field]: value } : item));

    setLineItems(updatedItems);

    // Pass the attributes of the first item to the main app state for optimization engine
    if (id === updatedItems[0].id) {
      onLineItemChange(updatedItems[0]);
    }
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now(),
      itemId: "",
      itemDesc: "New Product",
      quantity: 1,
      unit: "pcs",
      price: 0,
      quality: 70,
      deliveryTime: 30,
      paymentTerms: 30,
      carbonFootprint: 10,
      incoterms: "FOB",
      region: "GLOBAL"
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id: number) => {
    const updatedItems = lineItems.filter((item) => item.id !== id);
    setLineItems(updatedItems.length > 0 ? updatedItems : INITIAL_LINE_ITEMS(lineItems[0]));
    // Re-update optimization state if the first item was deleted
    if (id === lineItems[0].id && updatedItems.length > 0) {
      onLineItemChange(updatedItems[0]);
    }
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: isDark ? '#334155' : '#ffffff',
    color: isDark ? '#f1f5f9' : '#1e293b',
    borderColor: isDark ? '#475569' : '#cbd5e1'
  };
  
  const strategicStyle: React.CSSProperties = {
    backgroundColor: isDark ? 'rgba(234, 179, 8, 0.2)' : '#fefce8',
    color: isDark ? '#fde047' : '#a16207',
    borderColor: isDark ? '#ca8a04' : '#facc15'
  };
  
  const headerStyle: React.CSSProperties = {
    backgroundColor: isDark ? '#334155' : '#f1f5f9',
    color: isDark ? '#cbd5e1' : '#475569',
    borderColor: isDark ? '#475569' : '#e2e8f0'
  };
  
  const inputClasses = "p-1 text-xs rounded border focus:ring-indigo-500 focus:border-indigo-500 w-full";
  const strategicClasses = "font-bold p-1 text-xs rounded border focus:ring-yellow-500 focus:border-yellow-500 w-full";
  const headerClasses = "p-2 text-left text-xs font-bold sticky top-0 border-b";

  return (
    <div className="flex flex-col h-full">
      <div 
        className="overflow-x-auto overflow-y-auto max-h-[300px] rounded-lg border"
        style={{ borderColor: isDark ? '#475569' : '#e2e8f0' }}
      >
        <table className="min-w-full" style={{ borderColor: isDark ? '#475569' : '#e2e8f0' }}>
          <thead>
            <tr>
              <th className={headerClasses} style={headerStyle}>ID</th>
              <th className={headerClasses} style={headerStyle}>Description</th>
              <th className={headerClasses} style={headerStyle}>Qty</th>
              <th className={headerClasses} style={headerStyle}>Unit</th>
              <th className={headerClasses} style={{...headerStyle, color: '#4ade80'}}>Price ($)</th>
              <th className={headerClasses} style={{...headerStyle, color: '#4ade80'}}>Quality (%)</th>
              <th className={headerClasses} style={{...headerStyle, color: '#4ade80'}}>Delivery (Days)</th>
              <th className={headerClasses} style={{...headerStyle, color: '#4ade80'}}>Payment (Days)</th>
              <th className={headerClasses} style={{...headerStyle, color: '#4ade80'}}>Carbon (tCO2e)</th>
              <th className={headerClasses} style={{...headerStyle, color: '#4ade80'}}>Incoterms</th>
              <th className={headerClasses} style={headerStyle}>Region</th>
              <th className={headerClasses} style={headerStyle}>Action</th>
            </tr>
          </thead>
          <tbody style={{ borderColor: isDark ? '#334155' : '#f1f5f9' }}>
            {lineItems.map((item) => (
              <tr key={item.id} style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}` }}>
                <td className="p-2">
                  <input
                    type="text"
                    value={item.itemId}
                    onChange={(e) => handleInputChange(e, item.id, "itemId")}
                    className={inputClasses}
                    style={inputStyle}
                    placeholder="P001"
                    disabled={isLoading}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={item.itemDesc}
                    onChange={(e) => handleInputChange(e, item.id, "itemDesc")}
                    className={inputClasses}
                    style={inputStyle}
                    placeholder="Component X"
                    disabled={isLoading}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleInputChange(e, item.id, "quantity")}
                    className={inputClasses}
                    style={inputStyle}
                    disabled={isLoading}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => handleInputChange(e, item.id, "unit")}
                    className={inputClasses}
                    style={inputStyle}
                    placeholder="pcs"
                    disabled={isLoading}
                  />
                </td>

                {/* Strategic Attributes */}
                <td className="p-2">
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => handleInputChange(e, item.id, "price")}
                    className={strategicClasses}
                    style={strategicStyle}
                    min="0"
                    disabled={isLoading}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={item.quality}
                    onChange={(e) => handleInputChange(e, item.id, "quality")}
                    className={strategicClasses}
                    style={strategicStyle}
                    min="0"
                    max="100"
                    disabled={isLoading}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={item.deliveryTime}
                    onChange={(e) => handleInputChange(e, item.id, "deliveryTime")}
                    className={strategicClasses}
                    style={strategicStyle}
                    min="1"
                    disabled={isLoading}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={item.paymentTerms}
                    onChange={(e) => handleInputChange(e, item.id, "paymentTerms")}
                    className={strategicClasses}
                    style={strategicStyle}
                    min="15"
                    disabled={isLoading}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={item.carbonFootprint}
                    onChange={(e) => handleInputChange(e, item.id, "carbonFootprint")}
                    className={strategicClasses}
                    style={strategicStyle}
                    min="0"
                    disabled={isLoading}
                  />
                </td>
                <td className="p-2">
                  <select
                    value={item.incoterms}
                    onChange={(e) => handleInputChange(e, item.id, "incoterms")}
                    className={strategicClasses}
                    style={strategicStyle}
                    disabled={isLoading}>
                    <option value="FOB">FOB</option>
                    <option value="DDP">DDP</option>
                    <option value="EXW">EXW</option>
                  </select>
                </td>
                <td className="p-2">
                  <select
                    value={item.region}
                    onChange={(e) => handleInputChange(e, item.id, "region")}
                    className={inputClasses}
                    style={inputStyle}
                    disabled={isLoading}>
                    {(Object.keys(MOCK_CARBON_TARGETS) as Region[]).map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2 text-center">
                  {lineItems.length > 1 && (
                    <button
                      onClick={() => removeLineItem(item.id)}
                      disabled={isLoading}
                      className="text-red-500 dark:text-red-400 hover:text-red-400 dark:hover:text-red-300 disabled:opacity-50">
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-between">
        <button
          onClick={addLineItem}
          disabled={isLoading}
          className="px-4 py-2 font-medium rounded-lg transition duration-200 disabled:opacity-50 flex items-center"
          style={{
            backgroundColor: isDark ? '#334155' : '#e2e8f0',
            color: isDark ? '#818cf8' : '#4f46e5'
          }}
        >
          <PlusCircle size={16} className="mr-2" /> Add Line Item
        </button>
      </div>
    </div>
  );
};

interface AttributeRankingDisplayProps {
  ranking: RankedAttribute[];
  isDark?: boolean;
}

const AttributeRankingDisplay: React.FC<AttributeRankingDisplayProps> = ({ ranking, isDark = false }) => (
  <div 
    className="mt-6 p-4 rounded-lg shadow-inner border"
    style={{
      backgroundColor: isDark ? 'rgba(51, 65, 85, 0.5)' : '#f8fafc',
      borderColor: isDark ? '#475569' : '#e2e8f0'
    }}
  >
    <h4 className="text-lg font-semibold mb-3 flex items-center" style={{ color: isDark ? '#fbbf24' : '#a16207' }}>
      <ListOrdered size={18} className="mr-2" /> Strategic Attribute Ranking
    </h4>
    <ul className="space-y-2 text-sm">
      {ranking.map((attr, index) => (
        <li
          key={attr.key}
          className="flex justify-between items-center p-1 rounded-md border"
          style={attr.isFocused 
            ? { 
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
                borderColor: isDark ? '#b91c1c' : '#fca5a5'
              }
            : {
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                borderColor: isDark ? '#475569' : '#e2e8f0'
              }
          }
        >
          <span 
            className="w-6 text-center font-bold"
            style={{ color: attr.isFocused ? (isDark ? '#f87171' : '#ef4444') : (isDark ? '#94a3b8' : '#64748b') }}
          >
            {index + 1}.
          </span>
          <span 
            className="flex-1 font-medium"
            style={{ color: attr.isFocused ? (isDark ? '#f1f5f9' : '#1e293b') : (isDark ? '#cbd5e1' : '#475569') }}
          >
            {attr.label}
          </span>
          {attr.isFocused && (
            <span className="text-xs font-bold ml-2" style={{ color: isDark ? '#f87171' : '#ef4444' }}>PRIORITY</span>
          )}
        </li>
      ))}
    </ul>
  </div>
);

const App: React.FC = () => {
  // Theme state
  const theme = useThemeState();
  const isDark = theme === 'dark';
  
  const [buyerName, setBuyerName] = useState("Toyota");
  const [isLoading, setIsLoading] = useState(false);
  const [buyerSentiment, setBuyerSentiment] = useState("Select a buyer and click 'Analyze' to fetch real-time data.");
  const [buyerFocus, setBuyerFocus] = useState("Quality");
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(BUYER_PROFILES[0].historical);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [attributeRanking, setAttributeRanking] = useState<RankedAttribute[]>(calculateAttributeRanking("Quality"));

  // Line Items for the table input
  const [lineItems, setLineItems] = useState<LineItem[]>(INITIAL_LINE_ITEMS(BUYER_PROFILES[0].historical));

  // Real-time market data state
  const [realPerformanceData, setRealPerformanceData] = useState<Record<string, PerformanceData>>({});
  const [realRejectionData, setRealRejectionData] = useState<Record<string, MaterialRejection[]>>({});
  const [realCarbonTargets, setRealCarbonTargets] = useState<Record<Region, number> | null>(null);
  const [commodityPrices, setCommodityPrices] = useState<Record<string, { price: number; unit: string; trend: string }>>({});
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(false);

  const handleLineItemChange = useCallback(
    (firstItem: LineItem) => {
      // This function updates the single supplierQuote state based on the first item's strategic attributes
      const newQuote: SupplierQuote = {
        price: firstItem.price,
        quality: firstItem.quality,
        deliveryTime: firstItem.deliveryTime,
        paymentTerms: firstItem.paymentTerms,
        carbonFootprint: firstItem.carbonFootprint,
        incoterms: firstItem.incoterms
      };

      // Re-run optimization immediately when strategic inputs change
      const result = performOptimization(newQuote, buyerFocus);
      setOptimizationResult(result);
    },
    [buyerFocus]
  );

  // Fetch real market data in the background
  const fetchMarketData = useCallback(async (name: string) => {
    setIsLoadingMarketData(true);
    
    try {
      // Fetch all market data in parallel
      const [performanceData, rejectionData, carbonTargets, prices] = await Promise.all([
        fetchCompanyPerformanceData(name),
        fetchMaterialRejectionData(name),
        fetchRegionalCarbonTargets(),
        fetchCommodityPrices(["Steel", "Aluminum", "Copper", "Rubber", "Plastics"])
      ]);

      // Update state with real data
      if (performanceData) {
        setRealPerformanceData(prev => ({ ...prev, [name]: performanceData }));
      }
      
      if (rejectionData && rejectionData.length > 0) {
        setRealRejectionData(prev => ({ ...prev, [name]: rejectionData }));
      }
      
      if (carbonTargets) {
        setRealCarbonTargets(carbonTargets);
      }
      
      if (Object.keys(prices).length > 0) {
        setCommodityPrices(prices);
      }

      console.log("✅ Real market data fetched successfully:", {
        performance: !!performanceData,
        rejection: rejectionData?.length || 0,
        carbon: !!carbonTargets,
        commodities: Object.keys(prices).length
      });
    } catch (error) {
      console.error("Error fetching market data:", error);
    } finally {
      setIsLoadingMarketData(false);
    }
  }, []);

  const handleAnalyze = useCallback(
    async (name: string) => {
      setIsLoading(true);
      setBuyerName(name);
      setBuyerSentiment("Analyzing market and public sentiment...");
      setOptimizationResult(null);

      try {
        // 1. Fetch live sentiment and focus from the internet via Gemini
        const { text: sentimentText, focus: inferredFocus } = await fetchBuyerSentimentFromWeb(name);
        setBuyerSentiment(sentimentText);
        setBuyerFocus(inferredFocus);

        // 2. Fetch static historical data (simulated RoR call)
        const history = await fetchHistoricalData(name);
        setHistoricalData(history);

        // 3. Calculate and set attribute ranking based on inferred focus
        setAttributeRanking(calculateAttributeRanking(inferredFocus));

        // Initialize line items and supplier quote based on the new historical data
        if (history) {
          const initialItems = INITIAL_LINE_ITEMS(history);
          setLineItems(initialItems);

          // Use the first item's strategic attributes for optimization state
          handleLineItemChange(initialItems[0]);
        }

        // 4. Fetch real market data in the background (non-blocking)
        fetchMarketData(name);
        
      } catch (error) {
        console.error("Analysis Error:", error);
        setBuyerSentiment("Error fetching data. Check console for details.");
        setBuyerFocus("Generic");
        setAttributeRanking(calculateAttributeRanking("Generic"));
      } finally {
        setIsLoading(false);
      }
    },
    [handleLineItemChange, fetchMarketData]
  );

  // Initial load effect
  useEffect(() => {
    handleAnalyze(buyerName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Sidebar = useMemo(
    () => (
      <div className="w-80 space-y-6">
        {/* Buyer Selector */}
        <div 
          className="p-4 rounded-lg shadow-lg border"
          style={{
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            borderColor: isDark ? '#334155' : '#e2e8f0'
          }}
        >
          <label className="block text-sm font-semibold mb-2" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>Select Target Buyer</label>
          <select
            value={buyerName}
            onChange={(e) => handleAnalyze(e.target.value)}
            className="w-full p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500 border"
            style={{
              backgroundColor: isDark ? '#334155' : '#ffffff',
              color: isDark ? '#f1f5f9' : '#1e293b',
              borderColor: isDark ? '#475569' : '#cbd5e1'
            }}
            disabled={isLoading}>
            {BUYER_PROFILES.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => handleAnalyze(buyerName)}
            disabled={isLoading}
            className="mt-3 w-full px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition duration-200 disabled:opacity-50 flex items-center justify-center">
            <RefreshCcw size={16} className={isLoading ? "animate-spin mr-2" : "mr-2"} />
            {isLoading ? "Analyzing..." : "Re-Analyze Buyer"}
          </button>
        </div>

        {/* Live Data & Historical Baseline Panel */}
        <div 
          className="w-full max-h-[600px] overflow-y-auto p-4 rounded-lg shadow-lg border"
          style={{
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            borderColor: isDark ? '#334155' : '#e2e8f0'
          }}
        >
          <h3 className="text-xl font-bold mb-4 flex items-center" style={{ color: isDark ? '#818cf8' : '#4f46e5' }}>
            <MessageCircle size={20} className="mr-2" /> Live Buyer Sentiment
          </h3>
          <p className="text-sm border-l-4 border-indigo-500 pl-3" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>{buyerSentiment}</p>
          <div className="mt-6">
            <h4 className="text-lg font-semibold flex items-center" style={{ color: isDark ? '#f1f5f9' : '#1e293b' }}>
              <Target size={18} className="mr-2" style={{ color: isDark ? '#f87171' : '#ef4444' }} /> Inferred Priority
            </h4>
            <p className="2xl font-extrabold mt-1" style={{ color: isDark ? '#f87171' : '#ef4444' }}>{buyerFocus}</p>
          </div>

          {/* Ranking Display */}
          <AttributeRankingDisplay ranking={attributeRanking} isDark={isDark} />

          <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-600">
            <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Historical Baseline (RoR Data)</h4>
            {historicalData ? (
              <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                {Object.entries(historicalData).map(([key, value]) => (
                  <li key={key} className="flex justify-between">
                    <span className="capitalize">{ATTRIBUTES.find((a) => a.key === key)?.label || key}:</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">
                      {value} {ATTRIBUTES.find((a) => a.key === key)?.unit}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-red-500 dark:text-red-400">No historical data found.</p>
            )}
          </div>

          {/* Real-time Market Data Status */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
            <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center">
              <Globe size={16} className="mr-2 text-green-600 dark:text-green-400" /> Live Market Data
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">Company Performance</span>
                {isLoadingMarketData ? (
                  <Loader2 size={14} className="animate-spin text-blue-500" />
                ) : realPerformanceData[buyerName] ? (
                  <span className="text-green-600 dark:text-green-400 text-xs bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded">✓ Live</span>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400 text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">Mock</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">Material Rejection</span>
                {isLoadingMarketData ? (
                  <Loader2 size={14} className="animate-spin text-blue-500" />
                ) : realRejectionData[buyerName] ? (
                  <span className="text-green-600 dark:text-green-400 text-xs bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded">✓ Live</span>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400 text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">Mock</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">Carbon Targets</span>
                {isLoadingMarketData ? (
                  <Loader2 size={14} className="animate-spin text-blue-500" />
                ) : realCarbonTargets ? (
                  <span className="text-green-600 dark:text-green-400 text-xs bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded">✓ Live</span>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400 text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">Mock</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">Commodity Prices</span>
                {isLoadingMarketData ? (
                  <Loader2 size={14} className="animate-spin text-blue-500" />
                ) : Object.keys(commodityPrices).length > 0 ? (
                  <span className="text-green-600 dark:text-green-400 text-xs bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded">✓ Live</span>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400 text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">Mock</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    [buyerName, isLoading, handleAnalyze, buyerSentiment, buyerFocus, historicalData, attributeRanking, isLoadingMarketData, realPerformanceData, realRejectionData, realCarbonTargets, commodityPrices, isDark]
  );

  const OptimizationPanel = useMemo(
    () => (
      <div className="flex-1 space-y-6">
        {/* Input Table Panel */}
        <div 
          className="p-6 rounded-xl shadow-lg border flex flex-col max-h-[480px]"
          style={{
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            borderColor: isDark ? '#334155' : '#e2e8f0'
          }}
        >
          <h3 className="text-2xl font-bold mb-4 flex items-center" style={{ color: isDark ? '#f1f5f9' : '#1e293b' }}>
            <TrendingUp size={24} className="mr-2" style={{ color: isDark ? '#4ade80' : '#16a34a' }} /> Supplier Quotation Inputs
          </h3>
          <QuotationTableInput
            lineItems={lineItems}
            setLineItems={setLineItems}
            onLineItemChange={handleLineItemChange}
            isLoading={isLoading}
            isDark={isDark}
          />
        </div>

        {/* Output Panel */}
        <div 
          className="p-6 rounded-xl shadow-lg border"
          style={{
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            borderColor: isDark ? '#334155' : '#e2e8f0'
          }}
        >
          <h3 className="2xl font-bold mb-4 flex items-center" style={{ color: isDark ? '#f1f5f9' : '#1e293b' }}>
            <Layers size={24} className="mr-2" style={{ color: isDark ? '#fbbf24' : '#ca8a04' }} /> Optimized Quotation Strategy
          </h3>
          {optimizationResult ? (
            <div className="space-y-4">
              <div 
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9' }}
              >
                <span className="text-lg font-semibold" style={{ color: isDark ? '#e2e8f0' : '#334155' }}>Attractiveness Score:</span>
                <span
                  className={`text-4xl font-extrabold ${
                    parseFloat(optimizationResult.score) >= 85
                      ? "text-green-600"
                      : parseFloat(optimizationResult.score) >= 70
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}>
                  {optimizationResult.score} / 100
                </span>
              </div>

              {/* Recommendations Section - PER ITEM */}
              <RecommendedTargets lineItems={lineItems} buyerFocus={buyerFocus} isDark={isDark} />

              <div 
                className="p-4 rounded-lg border-l-4 border-yellow-500"
                style={{ backgroundColor: isDark ? 'rgba(234, 179, 8, 0.15)' : '#fefce8' }}
              >
                <h4 className="text-lg font-semibold" style={{ color: isDark ? '#fbbf24' : '#a16207' }}>Suggested Proposal Emphasis:</h4>
                <p className="font-bold" style={{ color: isDark ? '#f1f5f9' : '#1e293b' }}>{optimizationResult.emphasis}</p>
                <p className="text-sm mt-2" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>
                  <span dangerouslySetInnerHTML={{ __html: optimizationResult.suggestion }} />
                </p>
              </div>

              <div 
                className="p-4 rounded-lg border-l-4 border-indigo-500"
                style={{ backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#eef2ff' }}
              >
                <h4 className="text-lg font-semibold" style={{ color: isDark ? '#818cf8' : '#4338ca' }}>Incoterms Implication:</h4>
                <p className="font-bold" style={{ color: isDark ? '#f1f5f9' : '#1e293b' }}>{lineItems.length > 0 ? lineItems[0].incoterms : "N/A"}</p>
                <p className="text-sm mt-2" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>{optimizationResult.incotermDetail}</p>
              </div>
            </div>
          ) : (
            <p style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
              Adjust the inputs and click 'Optimize & Generate Quote' to view the strategy.
            </p>
          )}
        </div>
      </div>
    ),
    [lineItems, isLoading, optimizationResult, handleLineItemChange, buyerFocus, isDark]
  );

  return (
    <div 
      className="min-h-screen p-8 transition-colors duration-300"
      style={{
        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
        color: isDark ? '#f1f5f9' : '#1e293b'
      }}
    >
      <header 
        className="mb-8 border-b pb-4 flex justify-between items-center"
        style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}
      >
        <div className="flex items-center">
          {/* Logo/Branding Element */}
          <Layers size={30} className="mr-3" style={{ color: isDark ? '#818cf8' : '#4f46e5' }} />
          <h1 className="text-3xl font-extrabold" style={{ color: isDark ? '#818cf8' : '#4f46e5' }}>
            AI-driven <span style={{ color: isDark ? '#f1f5f9' : '#1e293b' }}>Quote Optimizer</span>
          </h1>
        </div>
      </header>

      <div className="flex space-x-6 h-full">
        {/* 1. Left Column: Selector, Live Data, Ranking */}
        {Sidebar}

        {/* 2. Right Column: Optimization Inputs/Output + AI Tools (Fixed Layout) */}
        <div className="flex-1 flex flex-col space-y-6">
          {/* Top Section: Inputs and Optimization Output */}
          {OptimizationPanel}

          {/* Bottom Section: Side-by-Side AI Tools */}
          <div className="flex space-x-6 h-[400px]">
            <ProposalDraftGenerator
              buyerName={buyerName}
              buyerFocus={buyerFocus}
              optimizationResult={optimizationResult}
            />
            <AIPricingAssistant buyerName={buyerName} />
          </div>
        </div>
      </div>

      {/* Historical Analytics Dashboard (Full Width) */}
      <AnalyticsDashboard 
        realPerformanceData={realPerformanceData}
        realRejectionData={realRejectionData}
        isLoadingRealData={isLoadingMarketData}
      />

      {/* Commodity Prices Panel */}
      {Object.keys(commodityPrices).length > 0 && (
        <div 
          className="mt-6 p-6 rounded-xl shadow-lg border"
          style={{
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            borderColor: isDark ? '#334155' : '#e2e8f0'
          }}
        >
          <h3 className="text-xl font-bold mb-4 flex items-center" style={{ color: isDark ? '#34d399' : '#059669' }}>
            <TrendingUp size={20} className="mr-2" /> Live Commodity Prices
            <span 
              className="ml-2 text-xs px-2 py-1 rounded-full flex items-center"
              style={{
                color: isDark ? '#4ade80' : '#16a34a',
                backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7'
              }}
            >
              <Globe size={10} className="mr-1" /> Real-time
            </span>
          </h3>
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(commodityPrices).map(([material, data]) => (
              <div 
                key={material} 
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: isDark ? '#334155' : '#f8fafc',
                  borderColor: isDark ? '#475569' : '#e2e8f0'
                }}
              >
                <h4 className="text-sm font-semibold" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>{material}</h4>
                <p className="text-2xl font-bold mt-1" style={{ color: isDark ? '#f1f5f9' : '#1e293b' }}>
                  ${typeof data.price === 'number' ? data.price.toLocaleString() : data.price}
                </p>
                <p className="text-xs" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{data.unit}</p>
                <span 
                  className="text-xs font-semibold mt-2 inline-block px-2 py-0.5 rounded"
                  style={
                    data.trend === 'up' 
                      ? { color: isDark ? '#4ade80' : '#16a34a', backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7' }
                      : data.trend === 'down' 
                        ? { color: isDark ? '#f87171' : '#dc2626', backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2' }
                        : { color: isDark ? '#fbbf24' : '#ca8a04', backgroundColor: isDark ? 'rgba(251, 191, 36, 0.2)' : '#fefce8' }
                  }
                >
                  {data.trend === 'up' ? '↑ Rising' : data.trend === 'down' ? '↓ Falling' : '→ Stable'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real Carbon Targets Panel */}
      {realCarbonTargets && (
        <div 
          className="mt-6 p-6 rounded-xl shadow-lg border"
          style={{
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            borderColor: isDark ? '#334155' : '#e2e8f0'
          }}
        >
          <h3 className="text-xl font-bold mb-4 flex items-center" style={{ color: isDark ? '#60a5fa' : '#2563eb' }}>
            <Globe size={20} className="mr-2" /> Regional Carbon Reduction Targets
            <span 
              className="ml-2 text-xs px-2 py-1 rounded-full flex items-center"
              style={{
                color: isDark ? '#4ade80' : '#16a34a',
                backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7'
              }}
            >
              <Globe size={10} className="mr-1" /> Live Data
            </span>
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {(Object.entries(realCarbonTargets) as [Region, number][]).map(([region, factor]) => (
              <div 
                key={region} 
                className="p-4 rounded-lg border text-center"
                style={{
                  backgroundColor: isDark ? '#334155' : '#f8fafc',
                  borderColor: isDark ? '#475569' : '#e2e8f0'
                }}
              >
                <h4 className="text-lg font-bold" style={{ color: isDark ? '#f1f5f9' : '#1e293b' }}>{region}</h4>
                <p className="text-3xl font-extrabold mt-2" style={{ color: isDark ? '#f87171' : '#ef4444' }}>
                  {((1 - factor) * 100).toFixed(0)}%
                </p>
                <p className="text-xs mt-1" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Reduction Required</p>
                <div 
                  className="mt-2 h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: isDark ? '#475569' : '#cbd5e1' }}
                >
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-red-500" 
                    style={{ width: `${(1 - factor) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
