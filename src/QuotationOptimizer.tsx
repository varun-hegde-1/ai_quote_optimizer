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
  Trash2
} from "lucide-react";

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
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent";

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
}

const RecommendedTargets: React.FC<RecommendedTargetsProps> = ({ lineItems, buyerFocus }) => {
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
    <div className="mt-6 p-4 bg-gray-900 rounded-xl border border-green-700">
      <h4 className="text-lg font-bold text-green-400 mb-3 flex items-center">
        <Target size={18} className="mr-2" /> Recommended Competitive Targets (Per Item)
      </h4>
      <p className="text-xs text-gray-400 mb-4">
        Targets are based on the current line item's inputs and **{buyerFocus}** priority.
      </p>

      <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
        {lineItems.map((item, index) => {
          // Use item's current attributes as historical baseline for target calculation
          const historicalData = extractStrategicAttributes(item);
          // Pass the item's region to the target generator
          const targets = generateCompetitiveTargets(historicalData, buyerFocus, item.region);

          return (
            <div key={item.id} className="border border-gray-600 rounded-lg p-3 bg-gray-700/50">
              <h5 className="font-bold text-sm text-indigo-300 mb-2">
                Item {index + 1}: {item.itemDesc} ({item.itemId})
                <span className="ml-2 text-xs font-normal text-red-400">({item.region} Target)</span>
              </h5>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {targetAttributes.map((attr) => (
                  <div key={attr.key} className="flex flex-col">
                    <span className="text-gray-400">{attr.label} Target:</span>
                    <span className="font-semibold text-green-300">
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
  const [draft, setDraft] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

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
    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700 flex-1 flex flex-col">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <Bot size={20} className="mr-2 text-pink-400" /> Proposal Draft Generator ✨
      </h3>

      <button
        onClick={generateProposal}
        disabled={isGenerating || !optimizationResult}
        className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg shadow-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mb-4">
        {isGenerating ? <Loader2 size={20} className="animate-spin mr-2" /> : <Layers size={20} className="mr-2" />}
        {isGenerating ? "Drafting..." : "Generate Tailored Proposal Draft"}
      </button>

      <div className="bg-gray-700 p-4 rounded-lg flex-1 overflow-y-auto whitespace-pre-wrap text-gray-200 text-sm border-l-4 border-pink-500">
        {draft || (
          <p className="text-gray-500 italic">
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

const AIPricingAssistant: React.FC<AIPricingAssistantProps> = ({ buyerName }) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [chatHistory]);

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
    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700 flex flex-col flex-1">
      <h3 className="text-xl font-bold text-indigo-400 mb-4 flex items-center border-b border-gray-700 pb-3">
        <Bot size={20} className="mr-2" /> AI Pricing Assistant ({buyerName})
      </h3>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
        {chatHistory.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            Ask me about competitor pricing, market rates, or price difference for {buyerName}.
          </div>
        ) : (
          chatHistory.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs md:max-w-md p-3 rounded-lg shadow-md ${
                  msg.role === "user" ? "bg-indigo-600 text-white" : "bg-gray-700 text-gray-200 border border-gray-600"
                }`}>
                <div className="flex items-center text-sm font-semibold mb-1">
                  {msg.role === "ai" ? (
                    <Bot size={14} className="mr-1 text-yellow-300" />
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
      <div className="flex space-x-3 pt-4 border-t border-gray-700">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleAIChat(input);
          }}
          placeholder={`Ask about ${buyerName}'s pricing...`}
          className="flex-1 bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
          disabled={isThinking}
        />
        <button
          onClick={() => handleAIChat(input)}
          disabled={isThinking || input.trim() === ""}
          className="p-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
          {isThinking ? <Loader2 size={24} className="animate-spin" /> : <Send size={20} />}
        </button>
      </div>
    </div>
  );
};

// --- Material Rejection Chart Component ---

interface MaterialRejectionChartProps {
  rejectionData: MaterialRejection[];
}

const MaterialRejectionChart: React.FC<MaterialRejectionChartProps> = ({ rejectionData }) => {
  const getColor = (rate: number) => {
    if (rate >= 10) return "bg-red-600";
    if (rate >= 5) return "bg-yellow-600";
    return "bg-green-600";
  };

  return (
    <div className="p-4 bg-gray-700 rounded-xl shadow-inner border border-gray-600">
      <h4 className="text-xl font-bold text-indigo-300 mb-4 flex items-center">
        <Factory size={20} className="mr-2" /> Quality Rejection Rates
      </h4>
      <p className="text-sm text-gray-400 mb-4">Historical rejection percentage per material.</p>

      <div className="space-y-4">
        {rejectionData.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-semibold text-white">{item.material}</span>
              <span className="text-xs text-red-300 italic">Reason: {item.reason}</span>
            </div>
            <div className="h-6 bg-gray-600 rounded-full overflow-hidden">
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
  performanceData: PerformanceData;
}

const BuyerPerformanceChart: React.FC<BuyerPerformanceChartProps> = ({ performanceData }) => {
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
    <div className="p-4 bg-gray-700 rounded-xl shadow-inner border border-gray-600 h-96 flex flex-col">
      <h4 className="text-xl font-bold text-green-400 mb-4 flex items-center">
        <LineChart size={20} className="mr-2" /> Market Performance (Annual Growth %)
      </h4>

      <div className="flex-1 relative border-l border-b border-gray-600 mb-4 pt-4">
        {/* Y-Axis Label */}
        <div className="absolute top-0 -left-10 text-xs text-gray-400">+{maxGrowth.toFixed(0)}%</div>
        <div className="absolute bottom-0 -left-10 text-xs text-gray-400">{minGrowth.toFixed(0)}%</div>

        <div className="flex justify-around h-full items-end">
          {dataPoints.map((d) => (
            <div key={d.year} className="flex flex-col items-center w-8 h-full relative group">
              {/* Bar Visualization */}
              <div
                style={{
                  height: `${(Math.abs(d.growth) / maxGrowth) * 80}%`, // Scale based on max positive value
                  marginTop: d.isNegative ? "auto" : "none"
                }}
                className={`w-3 rounded-t-sm transition-all duration-500 ${
                  d.isNegative ? "bg-red-500 self-start" : "bg-green-500 self-start"
                }
                                            ${d.isForecast ? "opacity-50 border border-dashed border-white" : ""}
                                            relative`}>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 p-1 px-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  {d.growth.toFixed(1)}%
                </div>
              </div>

              {/* X-Axis Label */}
              <span
                className={`absolute bottom-[-20px] text-[10px] ${d.isForecast ? "text-indigo-400" : "text-gray-400"}`}>
                '{String(d.year).slice(-2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center space-x-6 text-sm mt-4">
        <span className="flex items-center text-green-400 font-semibold">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div> Historical Growth
        </span>
        <span className="flex items-center text-indigo-400 font-semibold">
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

const AnalyticsDashboard: React.FC = () => {
  const [selectedBuyer, setSelectedBuyer] = useState(BUYER_PROFILES[0].name);
  const [chartStyle, setChartStyle] = useState<"horizontal" | "vertical">("horizontal");

  const buyerData = MOCK_ANALYTICS[selectedBuyer];
  const rejectionData = MOCK_MATERIAL_REJECTION[selectedBuyer];
  const marketPerformanceData = MOCK_BUYER_PERFORMANCE[selectedBuyer];

  const renderHorizontalChart = () => (
    <div className="space-y-3">
      {buyerData.map((dataPoint) => (
        <div key={dataPoint.year} className="flex items-center">
          <span className="text-gray-400 w-16 text-right mr-4 text-sm font-bold">{dataPoint.year}</span>
          <div className="flex flex-1 h-8 rounded-lg overflow-hidden shadow-lg border border-gray-700">
            {/* Awarded Bar */}
            <div
              style={{ width: `${dataPoint.awarded}%` }}
              className="bg-green-600 flex items-center justify-end px-2 text-xs font-bold text-white transition-all duration-500">
              {dataPoint.awarded > 10 ? `${dataPoint.awarded}%` : ""}
            </div>
            {/* Rejected Bar */}
            <div
              style={{ width: `${dataPoint.rejected}%` }}
              className="bg-red-600 flex items-center px-2 text-xs font-bold text-white transition-all duration-500">
              {dataPoint.rejected > 10 ? `${dataPoint.rejected}%` : ""}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderVerticalChart = () => (
    <div className="flex justify-between items-end h-64 border-b border-l border-gray-600 p-2">
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
                className="w-full bg-red-600 flex items-start justify-center text-[10px] font-bold text-white pt-1 transition-all duration-500">
                {dataPoint.rejected > 5 ? `${dataPoint.rejected}%` : ""}
              </div>
              {/* Awarded Bar (bottom of stack) */}
              <div
                style={{ height: `${awardedHeight}px` }}
                className="w-full bg-green-600 flex items-start justify-center text-[10px] font-bold text-white pt-1 transition-all duration-500">
                {dataPoint.awarded > 5 ? `${dataPoint.awarded}%` : ""}
              </div>
            </div>
            <span className="text-gray-400 mt-2 text-xs font-bold">{dataPoint.year}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="mt-12 p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
      <h2 className="3xl font-bold text-yellow-400 mb-6 flex items-center">
        <BarChart3 size={28} className="mr-3" /> Quotation Performance Analysis
      </h2>

      <div className="flex space-x-6">
        {/* 1. Historical Bid Chart (Left Side) */}
        <div className="w-1/2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="xl font-bold text-white">Bid Success Rate ({selectedBuyer})</h3>
            {/* Buyer Selector */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-semibold text-gray-300">Buyer:</label>
              <select
                value={selectedBuyer}
                onChange={(e) => setSelectedBuyer(e.target.value)}
                className="bg-gray-700 text-white p-2 rounded-md focus:ring-yellow-500 focus:border-yellow-500 border border-gray-600">
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
            <span className="text-sm text-gray-400">View Style:</span>
            <button
              onClick={() => setChartStyle("horizontal")}
              className={`p-2 rounded-md transition-colors duration-200 ${
                chartStyle === "horizontal" ? "bg-indigo-600 text-white" : "bg-gray-700 text-gray-400 hover:bg-gray-600"
              }`}
              title="Horizontal Bar Chart">
              <LayoutList size={20} />
            </button>
            <button
              onClick={() => setChartStyle("vertical")}
              className={`p-2 rounded-md transition-colors duration-200 ${
                chartStyle === "vertical" ? "bg-indigo-600 text-white" : "bg-gray-700 text-gray-400 hover:bg-gray-600"
              }`}
              title="Vertical Bar Chart">
              <ArrowLeftRight size={20} className="rotate-90" />
            </button>
          </div>

          {/* Chart Rendering Area */}
          {chartStyle === "horizontal" ? renderHorizontalChart() : renderVerticalChart()}

          <div className="flex justify-center space-x-6 text-sm">
            <span className="flex items-center text-green-400 font-semibold">
              <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div> Awarded Quotations
            </span>
            <span className="flex items-center text-red-400 font-semibold">
              <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div> Rejected Quotations
            </span>
          </div>
        </div>

        {/* 2. Market Performance and Rejection (Right Side) */}
        <div className="w-1/2 flex flex-col space-y-6">
          <BuyerPerformanceChart performanceData={marketPerformanceData} />
          <MaterialRejectionChart rejectionData={rejectionData} />
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
}

const QuotationTableInput: React.FC<QuotationTableInputProps> = ({
  lineItems,
  setLineItems,
  onLineItemChange,
  isLoading
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

  const inputClasses =
    "bg-gray-700 text-white p-1 text-xs rounded border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 w-full";
  const strategicClasses =
    "bg-gray-900/50 text-yellow-300 font-bold p-1 text-xs rounded border border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500 w-full";
  const headerClasses =
    "p-2 text-left text-xs font-bold text-gray-400 bg-gray-900 sticky top-0 border-b border-gray-700";

  return (
    <div className="flex flex-col h-full">
      <div className="overflow-x-auto overflow-y-auto max-h-[300px] rounded-lg border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className={headerClasses}>ID</th>
              <th className={headerClasses}>Description</th>
              <th className={headerClasses}>Qty</th>
              <th className={headerClasses}>Unit</th>
              <th className={`${headerClasses} text-green-400`}>Price ($)</th>
              <th className={`${headerClasses} text-green-400`}>Quality (%)</th>
              <th className={`${headerClasses} text-green-400`}>Delivery (Days)</th>
              <th className={`${headerClasses} text-green-400`}>Payment (Days)</th>
              <th className={`${headerClasses} text-green-400`}>Carbon (tCO2e)</th>
              <th className={`${headerClasses} text-green-400`}>Incoterms</th>
              <th className={headerClasses}>Region</th>
              <th className={headerClasses}>Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {lineItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-700">
                <td className="p-2">
                  <input
                    type="text"
                    value={item.itemId}
                    onChange={(e) => handleInputChange(e, item.id, "itemId")}
                    className={inputClasses}
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
                    disabled={isLoading}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => handleInputChange(e, item.id, "unit")}
                    className={inputClasses}
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
                    min="0"
                    disabled={isLoading}
                  />
                </td>
                <td className="p-2">
                  <select
                    value={item.incoterms}
                    onChange={(e) => handleInputChange(e, item.id, "incoterms")}
                    className={strategicClasses}
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
                      className="text-red-500 hover:text-red-400 disabled:opacity-50">
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
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-indigo-400 font-medium rounded-lg transition duration-200 disabled:opacity-50 flex items-center">
          <PlusCircle size={16} className="mr-2" /> Add Line Item
        </button>
      </div>
    </div>
  );
};

interface AttributeRankingDisplayProps {
  ranking: RankedAttribute[];
}

const AttributeRankingDisplay: React.FC<AttributeRankingDisplayProps> = ({ ranking }) => (
  <div className="mt-6 p-4 bg-gray-900/50 rounded-lg shadow-inner border border-gray-700">
    <h4 className="text-lg font-semibold text-yellow-300 mb-3 flex items-center">
      <ListOrdered size={18} className="mr-2" /> Strategic Attribute Ranking
    </h4>
    <ul className="space-y-2 text-sm">
      {ranking.map((attr, index) => (
        <li
          key={attr.key}
          className={`flex justify-between items-center p-1 rounded-md ${
            attr.isFocused ? "bg-red-900/50 border border-red-700" : "bg-gray-800"
          }`}>
          <span className={`w-6 text-center font-bold ${attr.isFocused ? "text-red-300" : "text-gray-500"}`}>
            {index + 1}.
          </span>
          <span className={`flex-1 font-medium ${attr.isFocused ? "text-white" : "text-gray-300"}`}>{attr.label}</span>
          {attr.isFocused && <span className="text-xs text-red-400 font-bold ml-2">PRIORITY</span>}
        </li>
      ))}
    </ul>
  </div>
);

const App: React.FC = () => {
  const [buyerName, setBuyerName] = useState("Toyota");
  const [isLoading, setIsLoading] = useState(false);
  const [buyerSentiment, setBuyerSentiment] = useState("Select a buyer and click 'Analyze' to fetch real-time data.");
  const [buyerFocus, setBuyerFocus] = useState("Quality");
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(BUYER_PROFILES[0].historical);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [attributeRanking, setAttributeRanking] = useState<RankedAttribute[]>(calculateAttributeRanking("Quality"));

  // Line Items for the table input
  const [lineItems, setLineItems] = useState<LineItem[]>(INITIAL_LINE_ITEMS(BUYER_PROFILES[0].historical));

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
      } catch (error) {
        console.error("Analysis Error:", error);
        setBuyerSentiment("Error fetching data. Check console for details.");
        setBuyerFocus("Generic");
        setAttributeRanking(calculateAttributeRanking("Generic"));
      } finally {
        setIsLoading(false);
      }
    },
    [handleLineItemChange]
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
        <div className="p-4 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          <label className="block text-sm font-semibold text-gray-300 mb-2">Select Target Buyer</label>
          <select
            value={buyerName}
            onChange={(e) => handleAnalyze(e.target.value)}
            className="w-full bg-gray-700 text-white p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500 border border-gray-600"
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
        <div className="w-full max-h-[600px] overflow-y-auto p-4 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          <h3 className="text-xl font-bold text-indigo-400 mb-4 flex items-center">
            <MessageCircle size={20} className="mr-2" /> Live Buyer Sentiment
          </h3>
          <p className="text-sm text-gray-400 border-l-4 border-indigo-500 pl-3">{buyerSentiment}</p>
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-white flex items-center">
              <Target size={18} className="mr-2 text-red-400" /> Inferred Priority
            </h4>
            <p className="2xl font-extrabold text-red-300 mt-1">{buyerFocus}</p>
          </div>

          {/* Ranking Display */}
          <AttributeRankingDisplay ranking={attributeRanking} />

          <div className="mt-8 pt-4 border-t border-gray-700">
            <h4 className="text-lg font-semibold text-white mb-2">Historical Baseline (RoR Data)</h4>
            {historicalData ? (
              <ul className="text-sm text-gray-400 space-y-1">
                {Object.entries(historicalData).map(([key, value]) => (
                  <li key={key} className="flex justify-between">
                    <span className="capitalize">{ATTRIBUTES.find((a) => a.key === key)?.label || key}:</span>
                    <span className="font-mono text-indigo-300">
                      {value} {ATTRIBUTES.find((a) => a.key === key)?.unit}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-red-400">No historical data found.</p>
            )}
          </div>
        </div>
      </div>
    ),
    [buyerName, isLoading, handleAnalyze, buyerSentiment, buyerFocus, historicalData, attributeRanking]
  );

  const OptimizationPanel = useMemo(
    () => (
      <div className="flex-1 space-y-6">
        {/* Input Table Panel */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700 flex flex-col max-h-[480px]">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
            <TrendingUp size={24} className="mr-2 text-green-400" /> Supplier Quotation Inputs
          </h3>
          <QuotationTableInput
            lineItems={lineItems}
            setLineItems={setLineItems}
            onLineItemChange={handleLineItemChange}
            isLoading={isLoading}
          />
        </div>

        {/* Output Panel */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
          <h3 className="2xl font-bold text-white mb-4 flex items-center">
            <Layers size={24} className="mr-2 text-yellow-400" /> Optimized Quotation Strategy
          </h3>
          {optimizationResult ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <span className="text-lg font-semibold text-gray-300">Attractiveness Score:</span>
                <span
                  className={`text-4xl font-extrabold ${
                    parseFloat(optimizationResult.score) >= 85
                      ? "text-green-400"
                      : parseFloat(optimizationResult.score) >= 70
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}>
                  {optimizationResult.score} / 100
                </span>
              </div>

              {/* Recommendations Section - PER ITEM */}
              <RecommendedTargets lineItems={lineItems} buyerFocus={buyerFocus} />

              <div className="p-4 bg-gray-900 rounded-lg border-l-4 border-yellow-500">
                <h4 className="text-lg font-semibold text-yellow-300">Suggested Proposal Emphasis:</h4>
                <p className="text-white font-bold">{optimizationResult.emphasis}</p>
                <p className="text-sm text-gray-400 mt-2">
                  <span dangerouslySetInnerHTML={{ __html: optimizationResult.suggestion }} />
                </p>
              </div>

              <div className="p-4 bg-gray-900 rounded-lg border-l-4 border-indigo-500">
                <h4 className="text-lg font-semibold text-indigo-300">Incoterms Implication:</h4>
                <p className="text-white font-bold">{lineItems.length > 0 ? lineItems[0].incoterms : "N/A"}</p>
                <p className="text-sm text-gray-400 mt-2">{optimizationResult.incotermDetail}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">
              Adjust the inputs and click 'Optimize & Generate Quote' to view the strategy.
            </p>
          )}
        </div>
      </div>
    ),
    [lineItems, isLoading, optimizationResult, handleLineItemChange, buyerFocus]
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="mb-8 border-b pb-4 border-gray-700 flex justify-between items-center">
        <div className="flex items-center">
          {/* Logo/Branding Element */}
          <Layers size={30} className="mr-3 text-indigo-400" />
          <h1 className="text-3xl font-extrabold text-indigo-400">
            AI-driven <span className="text-white">Quote Optimizer</span>
          </h1>
        </div>
        <div className="text-sm text-gray-400 p-2 border border-indigo-600 rounded-full bg-indigo-900/30 font-semibold">
          Strategic Supplier Platform
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
      <AnalyticsDashboard />
    </div>
  );
};

export default App;
