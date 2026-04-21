export type AnalysisStep = 'input' | 'summarize' | 'analyze' | 'recommend';

export interface MatchupInput {
  sport: string;
  teamA: string;
  teamB: string;
  homeTeam: 'A' | 'B' | 'Neutral';
}

export interface Meeting {
  date: string;
  score: string;
  winner: string;
}

export interface SummaryData {
  teamASummary: string;
  teamBSummary: string;
  recentForm: string;
  h2hRecord: string;
  lastMeetings: Meeting[];
}

export interface Factor {
  name: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface Stat {
  label: string;
  valueA: string;
  valueB: string;
  betterSide: 'A' | 'B' | 'neutral';
}

export interface AnalysisData {
  factors: Factor[];
  stats: Stat[];
}

export interface RecommendationData {
  decision: string;
  confidence: 'Low' | 'Medium' | 'High';
  confidenceScore: number;
  winProbabilityA: number;
  winProbabilityB: number;
  bettingLineA: string;
  bettingLineB: string;
  riskLevel: 'Safe' | 'Risky' | 'Avoid';
  isUpsetAlert: boolean;
  reasoning: string;
}

export interface AnalysisRecord {
  id: string;
  timestamp: string;
  input: MatchupInput;
  summary: SummaryData;
  analysis: AnalysisData;
  recommendation: RecommendationData;
}
