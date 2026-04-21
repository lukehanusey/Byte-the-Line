import React from 'react';
import { motion } from 'motion/react';
import { AnalysisData } from '../types';
import { ShieldCheck, ChevronRight } from 'lucide-react';

interface Props {
  data: AnalysisData;
  onNext: () => void;
  isLoading: boolean;
}

export default function AnalysisStep({ data, onNext, isLoading }: Props) {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-[var(--emerald)]';
      case 'negative': return 'text-[var(--rose)]';
      default: return 'text-[var(--text-dim)]';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto w-full space-y-6"
    >
      <div className="grid grid-cols-1 gap-3">
        {data.factors.map((factor, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`glass p-5 rounded-2xl flex items-center gap-5 border border-[var(--border)]`}
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)] bg-opacity-10 flex items-center justify-center text-[var(--primary)] font-bold text-sm shrink-0">
              0{index + 1}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[var(--text)]">{factor.name}</h3>
                <span className={`text-[10px] font-black uppercase tracking-widest ${getImpactColor(factor.impact)}`}>
                  {factor.impact}
                </span>
              </div>
              <p className="text-xs text-[var(--text-dim)] leading-relaxed">{factor.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl overflow-hidden border border-[var(--border)]"
      >
        <div className="bg-[var(--surface-lighter)] px-6 py-3 border-b border-[var(--border)] flex justify-between items-center">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)]">Competitive Analytics Comparison</h3>
            <div className="flex gap-4">
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[var(--primary)]"></div>
                  <span className="text-[9px] font-bold text-[var(--text-dim)] uppercase">Node A Advantage</span>
               </div>
            </div>
        </div>
        <div className="p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-lighter)] bg-opacity-30">
                <th className="px-6 py-3 text-[9px] font-black uppercase tracking-tighter text-[var(--text-dim)]">Statistic</th>
                <th className="px-6 py-3 text-[9px] font-black uppercase tracking-tighter text-[var(--text-dim)] text-center">Node A</th>
                <th className="px-6 py-3 text-[9px] font-black uppercase tracking-tighter text-[var(--text-dim)] text-center">Node B</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {data.stats.map((stat, i) => (
                <tr key={i} className="hover:bg-[var(--surface)] transition-colors">
                  <td className="px-6 py-3 text-[10px] font-bold text-[var(--text)] uppercase tracking-tight">{stat.label}</td>
                  <td className={`px-6 py-3 text-[11px] font-black text-center ${stat.betterSide === 'A' ? 'text-[var(--primary)]' : 'text-[var(--text-dim)]'}`}>
                    {stat.valueA}
                  </td>
                  <td className={`px-6 py-3 text-[11px] font-black text-center ${stat.betterSide === 'B' ? 'text-[var(--primary)]' : 'text-[var(--text-dim)]'}`}>
                    {stat.valueB}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="flex justify-between items-center glass p-6 rounded-2xl border-t-2 border-[var(--primary)] border-opacity-20">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-[var(--primary)]" />
          <p className="text-[11px] text-[var(--text-dim)] uppercase tracking-widest font-bold">Neural verification layer: ACTIVE</p>
        </div>
        <button
          onClick={onNext}
          disabled={isLoading}
          className="bg-[var(--primary)] hover:opacity-90 text-white font-black py-3 px-8 rounded-xl transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 text-xs uppercase tracking-widest"
        >
          {isLoading ? 'Generating Verdict...' : 'Go to Recommendation'}
          {!isLoading && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </motion.div>
  );
}

