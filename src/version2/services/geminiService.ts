// Gemini API Service for Real-Time Data Fetching
import type { CompanyData, PartPricing, AttractivenessResult } from '../types';

// Get API key from environment variable or hardcoded (for development)
const GEMINI_API_KEY = 'AIzaSyBhAWratgfPSuotj3tpuJs8mliesWziXE0'

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
  try {
    // Try to find JSON object
    const objectMatch = response.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]) as T;
    }
    
    // Try to find JSON array
    const arrayMatch = response.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      return JSON.parse(arrayMatch[0]) as T;
    }
    
    return null;
  } catch {
    console.error("Failed to parse JSON from response");
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
    return extractJSON<CompanyData>(response);
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
    const data = extractJSON<PartPricing[]>(response);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error searching parts:", error);
    return [];
  }
};

/**
 * Calculate attractiveness score based on company and parts data
 */
export const calculateAttractiveness = async (
  company: CompanyData,
  parts: PartPricing[]
): Promise<AttractivenessResult | null> => {
  const systemPrompt = `You are a strategic procurement advisor. Analyze the supplier attractiveness and return ONLY valid JSON, no markdown. Format:
{
  "overallScore": 78,
  "priceCompetitiveness": 82,
  "qualityAlignment": 75,
  "deliveryReliability": 80,
  "sustainabilityFit": 70,
  "recommendation": "One paragraph strategic recommendation",
  "keyInsights": ["Insight 1", "Insight 2", "Insight 3"]
}
All scores should be 0-100. Provide realistic analysis based on the data.`;

  const partsContext = parts.map(p => 
    `${p.partName}: $${p.currentPrice}/${p.unit} (${p.trend}, ${p.priceChange}% change)`
  ).join('; ');

  const userQuery = `Analyze supplier attractiveness for a company quoting to "${company.name}" (${company.industry}).
  
Company Focus: ${company.supplyChainFocus}
Quality Standards Required: ${company.qualityStandards?.join(', ') || 'Standard'}
Sustainability Score: ${company.sustainabilityScore || 'Unknown'}/100
Typical Payment Terms: ${company.paymentTermsTypical || 30} days

Parts/Materials being quoted: ${partsContext}

Calculate attractiveness scores and provide strategic insights. Return ONLY the JSON object.`;

  try {
    const response = await callGemini(userQuery, systemPrompt, false);
    return extractJSON<AttractivenessResult>(response);
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

