import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Stage1Predict } from './components/stage1/Stage1Predict';
import { Stage2Select } from './components/stage2/Stage2Select';
import { Stage3Simulate } from './components/stage3/Stage3Simulate';
import { SubmissionHub } from './components/submission/SubmissionHub';
import { computePredictions, STAGE2_CONSTRAINTS, STAGE2_TOP10_CANDIDATES } from './data/dataset';
import { CandidateCustomer, SimulationResult } from './types';
import { solveExactClassical, simulateQuantumCircuit } from './utils/quantumMath';

export function App() {
  const [currentStage, setCurrentStage] = useState<number>(() => {
    const params = new URLSearchParams(window.location.search);
    const s = parseInt(params.get('stage') || '1', 10);
    return isNaN(s) ? 1 : Math.min(4, Math.max(1, s));
  });
  const [activeModel, setActiveModel] = useState<'hybrid' | 'vqc' | 'qfk' | 'classical'>('hybrid');

  // Dark mode state with persistence & query parameter support
  const [isDark, setIsDark] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('theme') === 'dark') return true;
    if (params.get('theme') === 'light') return false;
    const saved = localStorage.getItem('depositiq-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('depositiq-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('depositiq-theme', 'light');
    }
  }, [isDark]);

  const toggleDark = () => {
    setIsDark(prev => !prev);
  };

  // Compute Stage 1 predictions based on chosen model
  const predictions = useMemo(() => {
    return computePredictions(activeModel);
  }, [activeModel]);

  // Stage 2 Candidate Pool: Top 10 from Stage 1 (Ground truth aligned with stage2-select.ipynb)
  const stage2Candidates: CandidateCustomer[] = useMemo(() => {
    return STAGE2_TOP10_CANDIDATES;
  }, []);

  // Solve exact classical baseline initially for default 6 selected customers
  const defaultSelection = useMemo(() => {
    const res = solveExactClassical(stage2Candidates, STAGE2_CONSTRAINTS);
    return res.bestSelection;
  }, [stage2Candidates]);

  // Selected 6 customers state
  const [selectedCustomers, setSelectedCustomers] = useState<CandidateCustomer[]>(defaultSelection);

  useEffect(() => {
    if (defaultSelection.length === 6) {
      setSelectedCustomers(defaultSelection);
    }
  }, [defaultSelection]);

  // Stage 3 Simulation result state
  const [simResult, setSimResult] = useState<SimulationResult>(() => {
    const probs = defaultSelection.slice(0, 6).map((c) => c.probability);
    return simulateQuantumCircuit(probs, 4096, false);
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f1013] text-slate-900 dark:text-zinc-100 studio-grid-bg flex flex-col justify-between selection:bg-orange-500/20 selection:text-orange-900 transition-colors duration-300">
      <div>
        <Header
          currentStage={currentStage}
          setCurrentStage={setCurrentStage}
          selectedCount={selectedCustomers.length}
          simulatedSuccessProb={simResult.quantum_prob_ge3}
          isDark={isDark}
          toggleDark={toggleDark}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentStage === 1 && (
            <Stage1Predict
              predictions={predictions}
              activeModel={activeModel}
              setActiveModel={setActiveModel}
              onProceedToStage2={() => setCurrentStage(2)}
            />
          )}

          {currentStage === 2 && (
            <Stage2Select
              candidates={stage2Candidates}
              onSelectedCustomersChange={setSelectedCustomers}
              onProceedToStage3={() => setCurrentStage(3)}
            />
          )}

          {currentStage === 3 && (
            <Stage3Simulate
              selectedCustomers={selectedCustomers}
              onSimulationComplete={setSimResult}
            />
          )}

          {currentStage === 4 && (
            <SubmissionHub
              predictions={predictions}
              candidates={stage2Candidates}
              selectedCustomers={selectedCustomers}
              simResult={simResult}
              constraints={STAGE2_CONSTRAINTS}
            />
          )}
        </main>
      </div>

      {/* Architectural Studio Footer */}
      <footer className="border-t border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 py-5 mt-12 text-xs font-mono text-slate-500 dark:text-zinc-400 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-slate-800 dark:text-zinc-100 font-bold">DepositIQ</span>
            <span>— Hybrid Quantum-Classical Term Deposit Campaign Pipeline</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600 dark:text-zinc-400">
            <span>Branch: <strong className="text-orange-600 dark:text-orange-400">ayush</strong></span>
            <span>Modular Backend: <strong className="text-emerald-600 dark:text-emerald-400">FastAPI Ready</strong></span>
            <span>Three.js / WebGL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
