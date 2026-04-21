import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Layout, ShieldCheck, ChevronRight, Sun, Moon } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import InputForm from './components/InputForm';
import SummaryStep from './components/SummaryStep';
import AnalysisStep from './components/AnalysisStep';
import RecommendationStep from './components/RecommendationStep';
import { MatchupInput, AnalysisStep as StepType, SummaryData, AnalysisData, RecommendationData, AnalysisRecord } from './types';
import { getSummary, getAnalysis, getRecommendation } from './services/ai';

export default function App() {
  const [step, setStep] = useState<StepType>('input');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [input, setInput] = useState<MatchupInput | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendationData | null>(null);
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const currentThemeClass = theme === 'light' ? 'light' : '';

  const handleInputSubmit = async (data: MatchupInput) => {
    setInput(data);
    setIsLoading(true);
    setError(null);
    try {
      const result = await getSummary(data);
      setSummary(result);
      setStep('summarize');
    } catch (err) {
      console.error('Failed to get summary:', err);
      setError(err instanceof Error ? err.message : 'An analytical failure occurred. Check API configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  const goToAnalysis = async () => {
    if (!input || !summary) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAnalysis(input, summary);
      setAnalysis(result);
      setStep('analyze');
    } catch (err) {
      console.error('Failed to get analysis:', err);
      setError(err instanceof Error ? err.message : 'Analysis processing error.');
    } finally {
      setIsLoading(false);
    }
  };

  const goToRecommendation = async () => {
    if (!input || !summary || !analysis) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await getRecommendation(input, summary, analysis);
      setRecommendation(result);
      
      // Save to history
      const newRecord: AnalysisRecord = {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        input,
        summary,
        analysis,
        recommendation: result
      };
      setHistory(prev => [newRecord, ...prev].slice(0, 10));
      
      setStep('recommend');
    } catch (err) {
      console.error('Failed to get recommendation:', err);
      setError(err instanceof Error ? err.message : 'Final model verdict failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromHistory = (record: AnalysisRecord) => {
    setError(null);
    setInput(record.input);
    setSummary(record.summary);
    setAnalysis(record.analysis);
    setRecommendation(record.recommendation);
    setStep('recommend');
  };

  const reset = () => {
    setError(null);
    setStep('input');
    setInput(null);
    setSummary(null);
    setAnalysis(null);
    setRecommendation(null);
  };

  const exportPDF = async () => {
    if (!contentRef.current || step === 'input') return;
    
    setIsExporting(true);
    try {
      const element = contentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: theme === 'dark' ? '#0f172a' : '#f8fafc',
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      
      const filename = input 
        ? `ByteTheLine_${input.teamA}_vs_${input.teamB}_${new Date().toISOString().split('T')[0]}.pdf` 
        : 'ByteTheLine_Analysis.pdf';
        
      pdf.save(filename);
    } catch (error) {
      console.error('PDF Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const steps = [
    { id: 'input', label: 'Matchup', icon: Layout },
    { id: 'summarize', label: 'Summarize', icon: Activity },
    { id: 'analyze', label: 'Analyze', icon: ShieldCheck },
    { id: 'recommend', label: 'Recommend', icon: ChevronRight },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === (step === 'input' && isLoading ? 'summarize' : step));

  return (
    <div className={`flex h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-sky-500/30 overflow-hidden ${currentThemeClass}`}>
      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--border)] bg-[var(--sidebar)] p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          <div className="group cursor-pointer" onClick={reset}>
            <h1 className="text-xl font-bold tracking-tight text-[var(--primary)]">Byte the Line</h1>
            <p className="text-[10px] text-[var(--text-dim)] uppercase tracking-widest mt-1">Neural Analyst v4.2.1</p>
          </div>

          <nav className="space-y-4">
            <div className="text-[10px] font-semibold text-[var(--text-dim)] uppercase tracking-widest">Recent Analyses</div>
            <div className="space-y-2 overflow-y-auto max-h-[40vh] pr-2 custom-scrollbar">
              {history.length > 0 ? (
                history.map((record) => (
                  <button
                    key={record.id}
                    onClick={() => loadFromHistory(record)}
                    className="w-full text-left p-3 hover:bg-[var(--surface-lighter)] rounded-xl text-xs transition-colors border border-transparent hover:border-[var(--border)] group"
                  >
                    <span className="font-bold text-[var(--text-dim)] group-hover:text-[var(--primary)] transition-colors">
                      {record.input.homeTeam === 'A' 
                        ? `${record.input.teamB} @ ${record.input.teamA}` 
                        : record.input.homeTeam === 'B' 
                        ? `${record.input.teamA} @ ${record.input.teamB}`
                        : `${record.input.teamA} vs ${record.input.teamB}`
                      }
                    </span>
                    <span className="block text-[10px] text-[var(--text-dim)] opacity-70 mt-0.5">{record.timestamp}</span>
                  </button>
                ))
              ) : (
                <div className="p-3 bg-[var(--surface)] bg-opacity-20 rounded-xl text-[10px] text-[var(--text-dim)] border border-dashed border-[var(--border)]">
                  No active scans in buffer.
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="space-y-4">
          <div className="bg-[var(--primary)] bg-opacity-10 border border-[var(--primary)] border-opacity-20 rounded-xl p-4">
            <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest mb-1">PRO ACCESS</p>
            <p className="text-[11px] text-[var(--text-dim)] leading-snug">Real-time betting volume tracking enabled.</p>
          </div>
          <div className="text-[10px] text-[var(--text-dim)] font-mono tracking-tighter opacity-50">MODEL_VERSION: STABLE_A15</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Header */}
        <header className="px-8 py-6 border-b border-[var(--border)] flex justify-between items-center bg-[var(--header)] backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-6">
            <div className="flex gap-2">
              {steps.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`step-dot ${idx <= currentStepIndex ? 'active' : ''}`} 
                />
              ))}
            </div>
            {input ? (
              <h2 className="text-xl font-semibold text-[var(--text)]">
                Matchup Analysis:{' '}
                <span className="text-[var(--primary)]">
                  {input.homeTeam === 'A' 
                    ? `${input.teamB} @ ${input.teamA}` 
                    : input.homeTeam === 'B' 
                    ? `${input.teamA} @ ${input.teamB}`
                    : `${input.teamA} vs ${input.teamB}`}
                </span>
              </h2>
            ) : (
              <h2 className="text-xl font-semibold text-[var(--text)]">New Intelligence Scan</h2>
            )}
          </div>

          <div className="flex gap-3">
            <button 
              onClick={toggleTheme}
              className="p-2 bg-[var(--surface-lighter)] hover:bg-[var(--surface)] rounded-lg text-[var(--text)] border border-[var(--border)] transition-colors"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button 
              onClick={exportPDF}
              disabled={isExporting || step === 'input'}
              className="px-4 py-2 bg-[var(--surface-lighter)] hover:bg-[var(--surface)] disabled:opacity-50 rounded-lg text-xs font-bold border border-[var(--border)] transition-colors flex items-center gap-2"
            >
              {isExporting ? 'EXPORTING...' : 'EXPORT PDF'}
            </button>
            <button 
              onClick={reset}
              className="px-4 py-2 bg-[var(--primary)] hover:opacity-90 rounded-lg text-xs font-bold text-white shadow-lg shadow-sky-900/40 transition-all"
            >
              NEW SCAN
            </button>
          </div>
        </header>

        <div ref={contentRef} className="flex-1 p-8">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 max-w-2xl mx-auto"
              >
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center gap-3 text-rose-500">
                  <Activity className="w-5 h-5 flex-shrink-0" />
                  <div className="text-sm font-medium">
                    <p className="font-bold uppercase tracking-widest text-[10px] mb-1">Model Error Detected</p>
                    {error}
                  </div>
                  <button 
                    onClick={() => setError(null)}
                    className="ml-auto p-1 hover:bg-rose-500/20 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="h-full flex flex-col justify-center max-w-2xl mx-auto"
              >
                <div className="mb-10 text-center space-y-3">
                  <div className="inline-block px-3 py-1 bg-[var(--primary)] bg-opacity-10 text-[var(--primary)] rounded-full text-[10px] font-bold uppercase tracking-widest border border-[var(--primary)] border-opacity-20">
                    Neural Network Ready
                  </div>
                  <h1 className="text-4xl font-bold text-[var(--text)] tracking-tight leading-tight">
                    Build your Analysis
                  </h1>
                </div>
                <InputForm onSubmit={handleInputSubmit} isLoading={isLoading} />
              </motion.div>
            )}

            {step === 'summarize' && summary && input && (
              <motion.div
                key="summarize"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <SummaryStep 
                  data={summary} 
                  teamA={input.teamA} 
                  teamB={input.teamB} 
                  homeTeam={input.homeTeam}
                  onNext={goToAnalysis} 
                  isLoading={isLoading} 
                />
              </motion.div>
            )}

            {step === 'analyze' && analysis && (
              <motion.div
                key="analyze"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <AnalysisStep data={analysis} onNext={goToRecommendation} isLoading={isLoading} />
              </motion.div>
            )}

            {step === 'recommend' && recommendation && input && (
              <motion.div
                key="recommend"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex items-center justify-center py-10"
              >
                <RecommendationStep 
                  data={recommendation} 
                  onReset={reset} 
                  teamA={input.teamA} 
                  teamB={input.teamB} 
                  homeTeam={input.homeTeam}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <footer className="px-8 py-6 border-t border-[var(--border)] text-center">
          <p className="text-[10px] text-[var(--text-dim)] uppercase tracking-[0.2em] opacity-60 font-bold">
            For entertainment purposes only. Not financial advice.
          </p>
        </footer>
      </main>
    </div>
  );
}
