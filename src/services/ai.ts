import { GoogleGenAI, Type } from "@google/genai";
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

const ai = new GoogleGenAI({ 
  apiKey: getApiKey()
});

const MODEL_NAME = "gemini-1.5-flash";

export async function getSummary(input: MatchupInput): Promise<SummaryData> {
  const currentDate = new Date().toISOString().split('T')[0];
  
  const sportSpecificInstructions = {
    'NFL': 'Focus on QB ratings, rushing yards per game, and season turnover differential.',
    'NBA': 'Prioritize team pace (possessions), 3-point shooting percentage, and rebounding margins.',
    'MLB': 'Analyze starting pitching ERA, bullpen strength, and team batting average.',
    'NHL': 'Look at power play percentage, save percentage, and high-danger scoring chances.',
    'Soccer': 'Focus on expected goals (xG), possession, and clean sheet history.'
  }[input.sport] || 'Analyze general performance metrics and recent team form.';

  const venueInfo = input.homeTeam === 'Neutral' 
    ? 'The game is at a Neutral Site.' 
    : `${input.homeTeam === 'A' ? input.teamA : input.teamB} is the Home Team.`;

  const prompt = `You are a professional sports analyst. Today is ${currentDate}.
  Analyze the upcoming ${input.sport} matchup between ${input.teamA} and ${input.teamB}. 
  Venue Context: ${venueInfo}
  
  Search requirements:
  - ${sportSpecificInstructions}
  - Last 5 games for both teams/players
  - Key injuries and roster changes
  - All-time head-to-head record (e.g., "Lakers lead 150-140")
  - Details of the last 3 head-to-head meetings (Date, Score, Winner)
  
  Provide a structured summary in the requested JSON format.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      toolConfig: { includeServerSideToolInvocations: true },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          teamASummary: { type: Type.STRING },
          teamBSummary: { type: Type.STRING },
          recentForm: { type: Type.STRING },
          h2hRecord: { type: Type.STRING },
          lastMeetings: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                score: { type: Type.STRING },
                winner: { type: Type.STRING }
              },
              required: ["date", "score", "winner"]
            }
          }
        },
        required: ["teamASummary", "teamBSummary", "recentForm", "h2hRecord", "lastMeetings"]
      }
    }
  });

  return JSON.parse(response.text || '{ "teamASummary": "", "teamBSummary": "", "recentForm": "", "h2hRecord": "", "lastMeetings": [] }');
}

export async function getAnalysis(input: MatchupInput, summary: SummaryData): Promise<AnalysisData> {
  const sportSpecificMetrics = {
    'NFL': 'QB Rating Matchup, Rushing Dominance, Turnover Differential',
    'NBA': 'Offensive Pace, 3PT Efficiency, Rebounding Power',
    'MLB': 'Pitching Advantage (ERA), Batting Consistency, Bullpen Depth'
  }[input.sport] || 'Key Statistical Variance';

  const venueInfo = input.homeTeam === 'Neutral' 
    ? 'Neutral Site' 
    : `${input.homeTeam === 'A' ? input.teamA : input.teamB} Home Advantage`;

  const prompt = `You are an expert sports strategist. 
  Based on this latest summary of ${input.teamA} vs ${input.teamB} (${venueInfo}):
  ${JSON.stringify(summary)}
  
  1. Identify the 3-5 most critical matchup factors that will decide this game.
  YOU MUST INCLUDE ANALYSIS ON: ${sportSpecificMetrics} if applicable to the available data.
  Consider also: home/away advantage, coaching matchups, fatigue, or environmental factors.
  
  2. Provide a side-by-side comparison of 4-6 key situational statistics (e.g., Points Per Game, Defensive Rating, Recent Win %, Power Play %, etc.) appropriate for ${input.sport}.
  
  Provide this in the requested JSON format.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      toolConfig: { includeServerSideToolInvocations: true },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          factors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                impact: { type: Type.STRING, enum: ["positive", "negative", "neutral"] }
              },
              required: ["name", "description", "impact"]
            }
          },
          stats: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                valueA: { type: Type.STRING },
                valueB: { type: Type.STRING },
                betterSide: { type: Type.STRING, enum: ["A", "B", "neutral"] }
              },
              required: ["label", "valueA", "valueB", "betterSide"]
            }
          }
        },
        required: ["factors", "stats"]
      }
    }
  });

  return JSON.parse(response.text || '{ "factors": [], "stats": [] }');
}

export async function getRecommendation(input: MatchupInput, summary: SummaryData, analysis: AnalysisData): Promise<RecommendationData> {
  const venueInfo = input.homeTeam === 'Neutral' 
    ? 'Neutral Site' 
    : `${input.homeTeam === 'A' ? input.teamA : input.teamB} is Home`;

  const prompt = `You are a high-stakes betting consultant.
  Matchup: ${input.teamA} vs ${input.teamB} (${input.sport})
  Venue: ${venueInfo}
  Context: ${JSON.stringify(summary)}
  Factors: ${JSON.stringify(analysis)}
  
  Provide a definitive recommendation. 
  If the data is conflicting, you must still choose the most likely outcome based on probability.
  
  Include:
  1. A clear decision (e.g., "Lakers cover -4.5", "Under 220.5 points").
  2. Confidence level (Low/Medium/High).
  3. A percentage confidence score (0-100).
  4. Calculated Win Probabilities for each side (0-100, must total 100).
  5. Hypothetical Betting Lines for both sides based on current market perception (e.g., "LAL -145", "GSW +125").
  6. Risk Assessment: "Safe" (strong indicators, low variance), "Risky" (solid logic but high variance), or "Avoid" (highly unpredictable or conflicting data).
  7. Upset Alert: A boolean indicating if this is a high-potential upset scenario (e.g., significant underdog has a strong chance to win outright).
  8. A punchy one-paragraph reasoning.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      toolConfig: { includeServerSideToolInvocations: true },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          decision: { type: Type.STRING },
          confidence: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
          confidenceScore: { type: Type.NUMBER },
          winProbabilityA: { type: Type.NUMBER },
          winProbabilityB: { type: Type.NUMBER },
          bettingLineA: { type: Type.STRING },
          bettingLineB: { type: Type.STRING },
          riskLevel: { type: Type.STRING, enum: ["Safe", "Risky", "Avoid"] },
          isUpsetAlert: { type: Type.BOOLEAN },
          reasoning: { type: Type.STRING }
        },
        required: ["decision", "confidence", "confidenceScore", "winProbabilityA", "winProbabilityB", "bettingLineA", "bettingLineB", "riskLevel", "isUpsetAlert", "reasoning"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
}

