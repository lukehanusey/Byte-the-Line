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

const API_KEY = getApiKey();
const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";

async function callGemini(prompt: string, responseSchema: any): Promise<any> {
  const response = await fetch(`${API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `API Error: ${response.status}`);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from model.");
  return JSON.parse(text);
}

export async function getSummary(input: MatchupInput): Promise<SummaryData> {
  const currentDate = new Date().toISOString().split('T')[0];
  const prompt = `Analyze the upcoming ${input.sport} matchup between ${input.teamA} and ${input.teamB}. Today is ${currentDate}. Provide a structured JSON summary covering teamASummary, teamBSummary, recentForm, h2hRecord, and lastMeetings (array of score/winner/date).`;
  
  const schema = {
    type: "OBJECT",
    properties: {
      teamASummary: { type: "STRING" },
      teamBSummary: { type: "STRING" },
      recentForm: { type: "STRING" },
      h2hRecord: { type: "STRING" },
      lastMeetings: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            date: { type: "STRING" },
            score: { type: "STRING" },
            winner: { type: "STRING" }
          },
          required: ["date", "score", "winner"]
        }
      }
    },
    required: ["teamASummary", "teamBSummary", "recentForm", "h2hRecord", "lastMeetings"]
  };

  return callGemini(prompt, schema);
}

export async function getAnalysis(input: MatchupInput, summary: SummaryData): Promise<AnalysisData> {
  const prompt = `Based on this summary, identify 3-5 critical matchup factors and 4-6 side-by-side situational stats for ${input.teamA} vs ${input.teamB}: ${JSON.stringify(summary)}. 
  Return JSON with "factors" (array with name, description, impact: positive/negative/neutral) and "stats" (array with label, valueA, valueB, betterSide: A/B/neutral).`;
  
  const schema = {
    type: "OBJECT",
    properties: {
      factors: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING" },
            description: { type: "STRING" },
            impact: { type: "STRING" }
          },
          required: ["name", "description", "impact"]
        }
      },
      stats: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            label: { type: "STRING" },
            valueA: { type: "STRING" },
            valueB: { type: "STRING" },
            betterSide: { type: "STRING" }
          },
          required: ["label", "valueA", "valueB", "betterSide"]
        }
      }
    },
    required: ["factors", "stats"]
  };

  return callGemini(prompt, schema);
}

export async function getRecommendation(input: MatchupInput, summary: SummaryData, analysis: AnalysisData): Promise<RecommendationData> {
  const prompt = `Context: ${JSON.stringify(summary)}\nFactors: ${JSON.stringify(analysis)}\nProvide a definitive betting recommendation for ${input.teamA} vs ${input.teamB}. 
  Return JSON with decision, confidence (Low/Medium/High), confidenceScore (number), winProbabilityA (number), winProbabilityB (number), bettingLineA, bettingLineB, riskLevel (Safe/Risky/Avoid), isUpsetAlert (boolean), and a reasoning paragraph.`;
  
  const schema = {
    type: "OBJECT",
    properties: {
      decision: { type: "STRING" },
      confidence: { type: "STRING" },
      confidenceScore: { type: "NUMBER" },
      winProbabilityA: { type: "NUMBER" },
      winProbabilityB: { type: "NUMBER" },
      bettingLineA: { type: "STRING" },
      bettingLineB: { type: "STRING" },
      riskLevel: { type: "STRING" },
      isUpsetAlert: { type: "BOOLEAN" },
      reasoning: { type: "STRING" }
    },
    required: ["decision", "confidence", "confidenceScore", "winProbabilityA", "winProbabilityB", "bettingLineA", "bettingLineB", "riskLevel", "isUpsetAlert", "reasoning"]
  };

  return callGemini(prompt, schema);
}

