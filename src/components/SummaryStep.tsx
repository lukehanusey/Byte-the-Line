import React from 'react';
import { motion } from 'motion/react';
import { SummaryData } from '../types';
import { Activity, History, Calendar } from 'lucide-react';

interface Props {
  data: SummaryData;
  teamA: string;
  teamB: string;
  homeTeam: 'A' | 'B' | 'Neutral';
  onNext: () => void;
  isLoading: boolean;
}

export default function SummaryStep({ data, teamA, teamB, homeTeam, onNext, isLoading }: Props) {
  const getVenueBadge = (target: 'A' | 'B') => {
    if (homeTeam === 'Neutral') return <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--surface-lighter)] text-[var(--text-dim)] border border-[var(--border)]">NEUTRAL</span>;
    if (homeTeam === target) return <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--primary)] bg-opacity-10 text-[var(--primary)] border border-[var(--primary)] border-opacity-30">HOME</span>;
    return <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--surface-lighter)] text-[var(--text-dim)] border border-[var(--border)]">AWAY</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto w-full space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-[10px] font-bold uppercase text-[var(--text-dim)] tracking-widest">{teamA} Report</h3>
              {getVenueBadge('A')}
            </div>
            <span className="text-[10px] bg-[var(--surface-lighter)] px-2 py-1 rounded text-[var(--text-dim)] font-mono tracking-tighter italic opacity-60">NEURAL_SCAN</span>
          </div>
          <p className="text-sm text-[var(--text)] opacity-90 leading-relaxed">{data.teamASummary}</p>
        </motion.div>

        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-[10px] font-bold uppercase text-[var(--text-dim)] tracking-widest">{teamB} Report</h3>
              {getVenueBadge('B')}
            </div>
            <span className="text-[10px] bg-[var(--surface-lighter)] px-2 py-1 rounded text-[var(--text-dim)] font-mono tracking-tighter italic opacity-60">NEURAL_SCAN</span>
          </div>
          <p className="text-sm text-[var(--text)] opacity-90 leading-relaxed">{data.teamBSummary}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6 space-y-4 border-t-2 border-[var(--primary)] border-opacity-30"
        >
          <div className="flex items-center gap-2 text-[var(--primary)]">
            <History className="w-3 h-3" />
            <h3 className="font-bold uppercase tracking-widest text-[10px]">Head-to-Head History</h3>
          </div>
          <div className="space-y-4">
            <div className="bg-[var(--surface-lighter)] rounded-xl p-3 border border-[var(--border)]">
              <span className="text-[9px] font-bold text-[var(--text-dim)] uppercase block mb-1">Lifetime Series</span>
              <span className="text-sm font-black text-[var(--text)] uppercase tracking-tight">{data.h2hRecord}</span>
            </div>
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-[var(--text-dim)] uppercase block">Last 3 Meetings</span>
              <div className="space-y-2">
                {data.lastMeetings.map((meeting, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-[var(--surface-lighter)]">
                        <Calendar className="w-3 h-3 text-[var(--text-dim)]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-[var(--text)]">{meeting.date}</span>
                        <span className="text-[9px] text-[var(--text-dim)] uppercase font-medium">{meeting.score}</span>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className="text-[9px] font-black text-[var(--primary)] uppercase tracking-widest">{meeting.winner}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6 space-y-4 border-l-2 border-[var(--primary)] border-opacity-50"
        >
          <div className="flex items-center gap-2 text-[var(--primary)]">
            <Activity className="w-3 h-3" />
            <h3 className="font-bold uppercase tracking-widest text-[10px]">Recent Form Combined</h3>
          </div>
          <p className="text-sm text-[var(--text-dim)] leading-relaxed italic">"{data.recentForm}"</p>
        </motion.div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          disabled={isLoading}
          className="bg-[var(--primary)] hover:opacity-90 text-white font-black py-3 px-8 rounded-xl transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 text-xs uppercase tracking-widest"
        >
          {isLoading ? 'Calibrating Data...' : 'Analyze Matchup Factors'}
          {!isLoading && <Activity className="w-4 h-4" />}
        </button>
      </div>
    </motion.div>
  );
}

