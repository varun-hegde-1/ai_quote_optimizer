// Gemini API Service for Real-Time Data Fetching
import type { CompanyData, PartPricing, AttractivenessResult } from '../types';

// Get API key from environment variable or hardcoded (for development)
const GEMINI_API_KEY = 'AIzaSyCRVj7_qQmjvYtK4Gi9uwRux9i0-58-Byw'

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent${
  GEMINI_API_KEY ? `?key=${GEMINI_API_KEY}` : ""
}`;

// Using gemini-1.5-flash - stable and widely available model
// const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Check if API key is configured
 */
export const isApiKeyConfigured = (): boolean => {
  return !!GEMINI_API_KEY && GEMINI_API_KEY.length > 0;
};

/**
 * Generic function to call Gemini API with Google Search grounding
 */
const callGemini = async (
  userQuery: string,
  systemPrompt: string,
  useSearch: boolean = true
): Promise<string> => {
  // Check for API key
  if (!isApiKeyConfigured()) {
    throw new Error("GEMINI_API_KEY is not configured. Please add VITE_GEMINI_API_KEY to your .env file.");
  }


  const payload: Record<string, unknown> = {
    contents: [{ parts: [{ text: userQuery }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
      responseMimeType: "application/json" // <--- ADD THIS LINE
    }
};

  // Note: Google Search grounding requires special API setup
  // Disabled for now to ensure basic functionality works
  // To enable: payload.tools = [{ googleSearch: {} }];
  void useSearch; // Acknowledge the parameter

  let retries = 0;
  const maxRetries = 3;

  while (retries < maxRetries) {
    try {
      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      // Handle rate limiting specifically
      if (response.status === 429) {
        const waitTime = Math.pow(2, retries + 2) * 1000; // Start with 4s, then 8s, then 16s
        console.warn(`Rate limited. Waiting ${waitTime/1000}s before retry...`);
        retries++;
        if (retries < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }
        throw new Error("Rate limit exceeded. Please wait a minute and try again.");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error Response:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        // Provide helpful error messages
        if (response.status === 400) {
          throw new Error("Bad request - check API parameters");
        } else if (response.status === 403) {
          throw new Error("API key invalid or doesn't have permission");
        } else if (response.status === 404) {
          throw new Error("Model not found - trying alternative...");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Don't retry on rate limit errors - just throw immediately
      if (errorMessage.includes('Rate limit')) {
        throw error;
      }
      
      console.error(`Attempt ${retries + 1} failed:`, errorMessage);
      retries++;
      if (retries < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retries) * 2000));
      }
    }
  }
  throw new Error("Failed to fetch data after multiple retries. Please wait a moment and try again.");
};

/**
 * Extract JSON from a response that might contain markdown
 */
const extractJSON = <T>(response: string): T | null => {
  if (!response || response.trim() === '') {
    console.error("Empty response received");
    return null;
  }

  console.log("Attempting to parse response:", response.substring(0, 200) + "...");

  try {
    // First, try to parse the entire response as JSON directly
    const directParse = JSON.parse(response);
    console.log("✅ Direct JSON parse successful");
    return directParse as T;
  } catch {
    // If direct parse fails, try to extract JSON from the string
    console.log("Direct parse failed, trying regex extraction...");
  }

  try {
    // Try to find JSON array first (more common for lists)
    const arrayMatch = response.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      const parsed = JSON.parse(arrayMatch[0]);
      console.log("✅ Array extraction successful, items:", Array.isArray(parsed) ? parsed.length : 'N/A');
      return parsed as T;
    }
    
    // Try to find JSON object
    const objectMatch = response.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      const parsed = JSON.parse(objectMatch[0]);
      console.log("✅ Object extraction successful");
      return parsed as T;
    }
    
    console.error("No JSON found in response");
    return null;
  } catch (err) {
    console.error("Failed to parse JSON from response:", err);
    console.error("Response was:", response);
    return null;
  }
};

/**
 * Search for company information
 */
export const searchCompany = async (companyName: string): Promise<CompanyData | null> => {
  const systemPrompt = `You are a business intelligence analyst. Search for real company information and return ONLY valid JSON, no markdown, no explanation. Format:
{
  "name": "Company Name",
  "industry": "Industry sector",
  "headquarters": "City, Country",
  "marketCap": "$XXB",
  "revenueGrowth": 5.2,
  "supplyChainFocus": "Quality/Price/Speed/Sustainability",
  "sustainabilityScore": 75,
  "paymentTermsTypical": 45,
  "qualityStandards": ["ISO 9001", "IATF 16949"]
}
Use real current data from your search.`;

  const userQuery = `Find detailed business information about "${companyName}" including their industry, headquarters, market cap, recent revenue growth rate, primary supply chain priorities, sustainability initiatives, typical payment terms for suppliers, and quality certifications they require. Return ONLY the JSON object.`;

  try {
    const response = await callGemini(userQuery, systemPrompt);
    console.log("🏢 Company API Response received, length:", response?.length || 0);
    
    const data = extractJSON<CompanyData>(response);
    console.log("🏢 Parsed company data:", data);
    
    if (data && data.name) {
      console.log("✅ Successfully parsed company:", data.name);
      return data;
    }
    
    console.warn("⚠️ No company data extracted");
    return null;
  } catch (error) {
    console.error("Error searching company:", error);
    return null;
  }
};

/**
 * Search for parts/materials pricing
 */
export const searchPartsPricing = async (partsQuery: string): Promise<PartPricing[]> => {
  const systemPrompt = `You are a procurement and commodities analyst. Search for real market prices and return ONLY valid JSON array, no markdown, no explanation. Format:
[
  {
    "partName": "Part/Material Name",
    "category": "Raw Material/Component/Assembly",
    "currentPrice": 1250.50,
    "unit": "USD/ton or USD/unit",
    "priceChange": 2.5,
    "trend": "up",
    "suppliers": ["Supplier 1", "Supplier 2"],
    "leadTime": "2-4 weeks"
  }
]
Use real current market prices from your search. Include 3-6 relevant items.`;

  const userQuery = `Find current market prices for "${partsQuery}" in industrial/manufacturing context. Include current price in USD, price change percentage from last month, trend direction, major suppliers, and typical lead times. Return ONLY the JSON array.`;

  try {
    const response = await callGemini(userQuery, systemPrompt);
    console.log("📦 Parts API Response received, length:", response?.length || 0);
    
    const data = extractJSON<PartPricing[]>(response);
    console.log("📦 Parsed parts data:", data);
    
    if (Array.isArray(data) && data.length > 0) {
      console.log("✅ Successfully parsed", data.length, "parts");
      return data;
    }
    
    console.warn("⚠️ No parts data extracted");
    return [];
  } catch (error) {
    console.error("Error searching parts:", error);
    return [];
  }
};

/**
 * Calculate attractiveness score based on company, market prices, and supplier quotes
 */
export const calculateAttractiveness = async (
  company: CompanyData,
  parts: PartPricing[],
  supplierQuotes?: { partName: string; marketPrice: number; supplierPrice: number; unit: string; quantity: number; deliveryDays: number; qualityScore: number }[],
  paymentTerms?: number
): Promise<AttractivenessResult | null> => {
  const systemPrompt = `You are a strategic procurement advisor. Analyze the supplier's quote attractiveness compared to market prices and buyer expectations. Return ONLY valid JSON, no markdown. Format:
{
  "overallScore": 78,
  "priceCompetitiveness": 82,
  "qualityAlignment": 75,
  "deliveryReliability": 80,
  "sustainabilityFit": 70,
  "recommendation": "One paragraph strategic recommendation on how to improve the quote",
  "keyInsights": ["Insight 1", "Insight 2", "Insight 3"]
}
All scores should be 0-100. Higher scores mean more attractive to the buyer.
- Price: Lower than market = higher score
- Quality: Higher quality = higher score
- Delivery: Faster delivery = higher score
Provide specific, actionable recommendations.`;

  // Build context based on whether we have supplier quotes or just market data
  let quoteContext = '';
  
  if (supplierQuotes && supplierQuotes.length > 0) {
    quoteContext = supplierQuotes.map(q => {
      const priceDiff = ((q.supplierPrice - q.marketPrice) / q.marketPrice * 100).toFixed(1);
      const comparison = q.supplierPrice < q.marketPrice ? 'BELOW market' : q.supplierPrice > q.marketPrice ? 'ABOVE market' : 'AT market';
      return `${q.partName}: Market $${q.marketPrice}, Supplier Quote $${q.supplierPrice} (${priceDiff}% ${comparison}), Qty: ${q.quantity}, Delivery: ${q.deliveryDays} days, Quality: ${q.qualityScore}%`;
    }).join('\n');
  } else {
    quoteContext = parts.map(p => 
      `${p.partName}: Market Price $${p.currentPrice}/${p.unit} (${p.trend}, ${p.priceChange}% change)`
    ).join('\n');
  }

  const userQuery = `Analyze supplier quote attractiveness for buyer "${company.name}" (${company.industry}).

## BUYER PROFILE
- Primary Focus: ${company.supplyChainFocus}
- Quality Standards Required: ${company.qualityStandards?.join(', ') || 'Standard'}
- Sustainability Score Preference: ${company.sustainabilityScore || 'Unknown'}/100
- Typical Payment Terms: ${company.paymentTermsTypical || 30} days

## SUPPLIER QUOTE vs MARKET
${quoteContext}

## PAYMENT TERMS OFFERED
${paymentTerms ? `${paymentTerms} days` : 'Not specified'}

Calculate how attractive this quote is to the buyer. Consider:
1. Price competitiveness vs market rates
2. Quality alignment with buyer standards
3. Delivery times vs industry norms
4. Payment terms comparison

Return ONLY the JSON object with scores and actionable recommendations.`;

  try {
    console.log("🎯 Calculating attractiveness...");
    const response = await callGemini(userQuery, systemPrompt, false);
    const result = extractJSON<AttractivenessResult>(response);
    console.log("🎯 Attractiveness result:", result);
    return result;
  } catch (error) {
    console.error("Error calculating attractiveness:", error);
    return null;
  }
};

/**
 * Get market insights for a specific industry
 */
export const getMarketInsights = async (industry: string): Promise<string> => {
  const systemPrompt = `You are a market analyst. Provide a brief, current market insight for the specified industry. Keep it to 2-3 sentences with actionable information for suppliers.`;

  const userQuery = `What are the current market conditions and supplier opportunities in the ${industry} industry? Include any recent trends affecting pricing or demand.`;

  try {
    return await callGemini(userQuery, systemPrompt);
  } catch (error) {
    console.error("Error fetching market insights:", error);
    return "Unable to fetch market insights at this time.";
  }
};

