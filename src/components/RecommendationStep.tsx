import React from 'react';
import { motion } from 'motion/react';
import { RecommendationData } from '../types';
import { Target, AlertCircle, RefreshCcw, ShieldAlert, Flame } from 'lucide-react';

interface Props {
  data: RecommendationData;
  onReset: () => void;
  teamA: string;
  teamB: string;
  homeTeam: 'A' | 'B' | 'Neutral';
}

export default function RecommendationStep({ data, onReset, teamA, teamB, homeTeam }: Props) {
  const getVenueBadge = (target: 'A' | 'B') => {
    if (homeTeam === 'Neutral') return <span className="text-[8px] px-1 rounded bg-[var(--surface-lighter)] text-[var(--text-dim)] border border-[var(--border)]">N</span>;
    if (homeTeam === target) return <span className="text-[8px] px-1 rounded bg-[var(--primary)] bg-opacity-10 text-[var(--primary)] border border-[var(--primary)] border-opacity-30">H</span>;
    return <span className="text-[8px] px-1 rounded bg-[var(--surface-lighter)] text-[var(--text-dim)] border border-[var(--border)]">A</span>;
  };

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'safe': return 'text-[var(--emerald)]';
      case 'risky': return 'text-[var(--amber)]';
      case 'avoid': return 'text-[var(--rose)]';
      default: return 'text-[var(--text-dim)]';
    }
  };

  const getRiskBg = (level: string) => {
    switch (level.toLowerCase()) {
      case 'safe': return 'bg-[var(--emerald)] bg-opacity-10 border-[var(--emerald)] border-opacity-20';
      case 'risky': return 'bg-[var(--amber)] bg-opacity-10 border-[var(--amber)] border-opacity-20';
      case 'avoid': return 'bg-[var(--rose)] bg-opacity-10 border-[var(--rose)] border-opacity-20';
      default: return 'bg-slate-500/10 border-slate-500/20';
    }
  };

  const getConfidenceColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'text-[var(--emerald)]';
      case 'medium': return 'text-[var(--amber)]';
      case 'low': return 'text-[var(--rose)]';
      default: return 'text-[var(--text-dim)]';
    }
  };

  const getConfidenceBg = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'bg-[var(--emerald)]';
      case 'medium': return 'bg-[var(--amber)]';
      case 'low': return 'bg-[var(--rose)]';
      default: return 'bg-[var(--text-dim)]';
    }
  };

  const getConfidencePercent = () => {
    return `${data.confidenceScore}%`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`max-w-3xl mx-auto w-full p-8 rounded-3xl glass border-t-2 space-y-8 ${
        data.riskLevel === 'Safe' ? 'border-emerald-500/30' : 
        data.riskLevel === 'Risky' ? 'border-amber-500/30' : 
        'border-rose-500/30'
      }`}
    >
      <div className="flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center flex-wrap gap-2 mb-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)]">Step 3: Intelligence Recommendation</div>
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-tighter ${getRiskBg(data.riskLevel)} ${getRiskColor(data.riskLevel)}`}>
              <ShieldAlert className="w-2.5 h-2.5" />
              {data.riskLevel}
            </div>
            {data.isUpsetAlert && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--orange)] bg-opacity-10 border border-[var(--orange)] border-opacity-30 text-[var(--orange)] text-[9px] font-black uppercase tracking-tighter"
              >
                <Flame className="w-2.5 h-2.5 animate-pulse" />
                UPSET ALERT
              </motion.div>
            )}
          </div>
          <h2 className="text-4xl font-black text-[var(--text)] leading-tight">{data.decision}</h2>
        </div>
        <div className="text-left md:text-right shrink-0">
          <div className="text-[10px] text-[var(--text-dim)] uppercase font-bold tracking-widest mb-1">Confidence Rating</div>
          <div className={`text-xl font-black ${getConfidenceColor(data.confidence)}`}>
            {data.confidence.toUpperCase()} ({getConfidencePercent()})
          </div>
          <div className="w-40 h-1.5 bg-[var(--surface-lighter)] rounded-full mt-2 overflow-hidden border border-[var(--border)]">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: getConfidencePercent() }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full ${getConfidenceBg(data.confidence)} opacity-80`} 
            />
          </div>
        </div>
      </div>

      {/* Win Probability Bar */}
      <div className="space-y-4 py-4 px-6 bg-[var(--surface-lighter)] bg-opacity-40 rounded-2xl border border-[var(--border)]">
        <div className="flex justify-between items-end mb-2">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest block">{teamA}</span>
              {getVenueBadge('A')}
            </div>
            <span className="text-2xl font-black text-[var(--text)]">{data.winProbabilityA}%</span>
          </div>
          <div className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.2em] mb-1">Win Probability</div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 mb-1">
              {getVenueBadge('B')}
              <span className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest block">{teamB}</span>
            </div>
            <span className="text-2xl font-black text-[var(--text)]">{data.winProbabilityB}%</span>
          </div>
        </div>
        <div className="h-3 w-full bg-[var(--surface-lighter)] rounded-full overflow-hidden flex border border-[var(--border)]">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${data.winProbabilityA}%` }}
            transition={{ duration: 1, ease: 'circOut' }}
            className="h-full bg-sky-500 relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
          </motion.div>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${data.winProbabilityB}%` }}
            transition={{ duration: 1, ease: 'circOut' }}
            className="h-full bg-slate-700 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-l from-white/5 to-transparent" />
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-[var(--border)]">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-[var(--text-dim)]">
            <Target className="w-3 h-3 text-[var(--primary)]" />
            <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Logical Foundation</span>
          </div>
          <p className="text-[var(--text)] opacity-80 leading-relaxed text-sm italic">"{data.reasoning}"</p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="bg-[var(--surface-lighter)] border border-[var(--border)] rounded-xl p-4 text-center">
            <span className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest block mb-2">Market Estimate</span>
            <div className="flex flex-col gap-1 items-center justify-center">
              <span className="text-xs font-black text-[var(--text)] uppercase tracking-tight">{data.bettingLineA}</span>
              <span className="text-[8px] font-bold text-[var(--text-dim)] uppercase">VS</span>
              <span className="text-xs font-black text-[var(--text)] uppercase tracking-tight">{data.bettingLineB}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-[var(--text-dim)] opacity-50" />
          <p className="text-[10px] text-[var(--text-dim)] opacity-70 uppercase tracking-widest leading-tight">
            Simulated outcomes based on historical variances. Use responsibly.
          </p>
        </div>
        <button
          onClick={onReset}
          className="bg-[var(--surface-lighter)] hover:bg-[var(--surface)] text-[var(--text)] font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all border border-[var(--border)] text-xs uppercase tracking-widest"
        >
          <RefreshCcw className="w-3 h-3" />
          Initialize New Scan
        </button>
      </div>
    </motion.div>
  );
}

