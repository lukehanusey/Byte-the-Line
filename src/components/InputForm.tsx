import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Users, Search, RefreshCcw } from 'lucide-react';
import { MatchupInput } from '../types';

interface Props {
  onSubmit: (input: MatchupInput) => void;
  isLoading: boolean;
}

export default function InputForm({ onSubmit, isLoading }: Props) {
  const [sport, setSport] = useState('NBA');
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [homeTeam, setHomeTeam] = useState<'A' | 'B' | 'Neutral'>('A');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamA && teamB) {
      onSubmit({ sport, teamA, teamB, homeTeam });
    }
  };

  const sports = [
    { name: 'NBA', emoji: '🏀' },
    { name: 'NFL', emoji: '🏈' },
    { name: 'MLB', emoji: '⚾' },
    { name: 'NHL', emoji: '🏒' },
    { name: 'Soccer', emoji: '⚽' },
    { name: 'Tennis', emoji: '🎾' },
    { name: 'UFC', emoji: '🥊' },
  ];
  const isIndividualSport = ['Tennis', 'UFC'].includes(sport);
  const nodeLabel = isIndividualSport ? 'Fighter/Player' : 'Team';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto w-full p-8 rounded-2xl glass"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-[var(--primary)] bg-opacity-10 rounded-xl">
          <Trophy className="w-6 h-6 text-[var(--primary)]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--text)] uppercase tracking-tight">Matchup Parameters</h2>
          <p className="text-[var(--text-dim)] text-[10px] uppercase tracking-widest">Enter Your Matchup Details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)] mb-3">Select Sport</label>
          <div className="flex flex-wrap gap-2">
            {sports.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => setSport(s.name)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border flex items-center gap-2 ${
                  sport === s.name 
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-lg' 
                    : 'bg-[var(--surface-lighter)] text-[var(--text-dim)] border-[var(--border)] hover:bg-[var(--surface)]'
                }`}
              >
                <span>{s.emoji}</span>
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)]">{nodeLabel} A</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)] opacity-50" />
                <input
                  type="text"
                  value={teamA}
                  onChange={(e) => setTeamA(e.target.value)}
                  placeholder={`${nodeLabel} A`}
                  className="w-full bg-[var(--surface-lighter)] border border-[var(--border)] rounded-xl py-3 pl-10 pr-4 text-sm text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] transition-all font-medium placeholder:text-[var(--text-dim)] placeholder:opacity-40"
                  required
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setHomeTeam('A')}
              className={`w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${
                homeTeam === 'A' 
                  ? 'bg-[var(--primary)] bg-opacity-20 text-[var(--primary)] border-[var(--primary)] border-opacity-30' 
                  : 'bg-[var(--surface-lighter)] text-[var(--text-dim)] border-[var(--border)] hover:border-[var(--text-dim)]'
              }`}
            >
              Set as Home
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)]">{nodeLabel} B</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)] opacity-50" />
                <input
                  type="text"
                  value={teamB}
                  onChange={(e) => setTeamB(e.target.value)}
                  placeholder={`${nodeLabel} B`}
                  className="w-full bg-[var(--surface-lighter)] border border-[var(--border)] rounded-xl py-3 pl-10 pr-4 text-sm text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] transition-all font-medium placeholder:text-[var(--text-dim)] placeholder:opacity-40"
                  required
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setHomeTeam('B')}
              className={`w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${
                homeTeam === 'B' 
                  ? 'bg-[var(--primary)] bg-opacity-20 text-[var(--primary)] border-[var(--primary)] border-opacity-30' 
                  : 'bg-[var(--surface-lighter)] text-[var(--text-dim)] border-[var(--border)] hover:border-[var(--text-dim)]'
              }`}
            >
              Set as Home
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setHomeTeam('Neutral')}
          className={`w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${
            homeTeam === 'Neutral' 
              ? 'bg-[var(--primary)] bg-opacity-20 text-[var(--primary)] border-[var(--primary)] border-opacity-30' 
              : 'bg-[var(--surface-lighter)] text-[var(--text-dim)] border-[var(--border)] hover:border-[var(--text-dim)]'
          }`}
        >
          Neutral Site
        </button>

        <button
          type="submit"
          disabled={isLoading || !teamA || !teamB}
          className="w-full bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg uppercase tracking-widest text-xs"
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            >
              <RefreshCcw className="w-4 h-4" />
            </motion.div>
          ) : (
            <Search className="w-4 h-4" />
          )}
          {isLoading ? 'Processing Network...' : 'Execute Analysis'}
        </button>
      </form>
    </motion.div>
  );
}

