import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { MatchupInput, SummaryData, AnalysisData, RecommendationData } from "../types";

const getApiKey = () => {
  const viteKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (viteKey) return viteKey;
  const standardKey = import.meta.env.GEMINI_API_KEY;
  if (standardKey) return standardKey;
  try {
    return process.env.GEMINI_API_KEY || '';
  } catch {
    return '';
  }
};

const genAI = new GoogleGenerativeAI(getApiKey());

// Using the most stable model identifier
const MODEL_NAME = "gemini-1.5-flash"; 

export async function getSummary(input: MatchupInput): Promise<SummaryData> {
  const model = genAI.getGenerativeModel({ 
    model: MODEL_NAME,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          teamASummary: { type: SchemaType.STRING },
          teamBSummary: { type: SchemaType.STRING },
          recentForm: { type: SchemaType.STRING },
          h2hRecord: { type: SchemaType.STRING },
          lastMeetings: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                date: { type: SchemaType.STRING },
                score: { type: SchemaType.STRING },
                winner: { type: SchemaType.STRING }
              },
              required: ["date", "score", "winner"]
            }
          }
        },
        required: ["teamASummary", "teamBSummary", "recentForm", "h2hRecord", "lastMeetings"]
      }
    }
  });

  const currentDate = new Date().toISOString().split('T')[0];
  const prompt = `Analyze the upcoming ${input.sport} matchup between ${input.teamA} and ${input.teamB}. Today is ${currentDate}. Provide a structured JSON summary covering team stats, recent form, and last 3 H2H meetings.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
}

export async function getAnalysis(input: MatchupInput, summary: SummaryData): Promise<AnalysisData> {
  const model = genAI.getGenerativeModel({ 
    model: MODEL_NAME,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          factors: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING },
                description: { type: SchemaType.STRING },
                impact: { type: SchemaType.STRING }
              },
              required: ["name", "description", "impact"]
            }
          },
          stats: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                label: { type: SchemaType.STRING },
                valueA: { type: SchemaType.STRING },
                valueB: { type: SchemaType.STRING },
                betterSide: { type: SchemaType.STRING }
              },
              required: ["label", "valueA", "valueB", "betterSide"]
            }
          }
        },
        required: ["factors", "stats"]
      }
    }
  });

  const prompt = `Based on this summary, identify 3-5 critical matchup factors and 4-6 side-by-side situational stats for ${input.teamA} vs ${input.teamB}: ${JSON.stringify(summary)}. Impact must be "positive", "negative", or "neutral". betterSide must be "A", "B", or "neutral".`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
}

export async function getRecommendation(input: MatchupInput, summary: SummaryData, analysis: AnalysisData): Promise<RecommendationData> {
  const model = genAI.getGenerativeModel({ 
    model: MODEL_NAME,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          decision: { type: SchemaType.STRING },
          confidence: { type: SchemaType.STRING },
          confidenceScore: { type: SchemaType.NUMBER },
          winProbabilityA: { type: SchemaType.NUMBER },
          winProbabilityB: { type: SchemaType.NUMBER },
          bettingLineA: { type: SchemaType.STRING },
          bettingLineB: { type: SchemaType.STRING },
          riskLevel: { type: SchemaType.STRING },
          isUpsetAlert: { type: SchemaType.BOOLEAN },
          reasoning: { type: SchemaType.STRING }
        },
        required: ["decision", "confidence", "confidenceScore", "winProbabilityA", "winProbabilityB", "bettingLineA", "bettingLineB", "riskLevel", "isUpsetAlert", "reasoning"]
      }
    }
  });

  const prompt = `Context: ${JSON.stringify(summary)}\nFactors: ${JSON.stringify(analysis)}\nProvide a definitive betting recommendation for ${input.teamA} vs ${input.teamB}. confidence must be "Low", "Medium", or "High". riskLevel must be "Safe", "Risky", or "Avoid".`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
}

