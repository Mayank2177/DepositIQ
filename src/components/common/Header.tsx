import React from 'react';
import { Cpu, Layers, GitBranch, Activity, CheckCircle2, Download, Sun, Moon, Database } from 'lucide-react';

interface HeaderProps {
  currentStage: number;
  setCurrentStage: (stage: number) => void;
  selectedCount: number;
  simulatedSuccessProb: number;
  isDark: boolean;
  toggleDark: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStage,
  setCurrentStage,
  selectedCount,
  simulatedSuccessProb,
  isDark,
  toggleDark,
}) => {
  const stages = [
    { id: 1, label: 'Stage 1: Predict', sub: 'QFK & VQC Hybrid Ensemble', icon: Activity },
    { id: 2, label: 'Stage 2: Select', sub: 'QUBO & QAOA 3D Arena', icon: Layers },
    { id: 3, label: 'Stage 3: Simulate', sub: '6-Qubit Quantum Studio', icon: Cpu },
    { id: 4, label: 'Submission & PRD', sub: 'CSVs & Technical Report', icon: Download },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl shadow-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Product Title (Clean, Hackathon Badge Removed) */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-black text-sm shadow-sm shadow-orange-500/20 font-mono">
              ψ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-zinc-100 font-mono">
                  DepositIQ
                </span>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-mono font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>v2.4 Active</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 hidden sm:block">
                Hybrid Quantum-Classical Term Deposit Campaign Pipeline
              </p>
            </div>
          </div>

          {/* Right Action Bar: Clean Minimal KPIs & Theme Toggle */}
          <div className="flex items-center gap-3">
            {/* Realtime KPI Badges */}
            <div className="hidden md:flex items-center gap-2.5 text-xs font-mono">
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                <span className="text-slate-500 dark:text-zinc-400">Selected:</span>
                <span className={`font-bold ${selectedCount === 6 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                  {selectedCount}/6
                </span>
                {selectedCount === 6 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                <span className="text-slate-500 dark:text-zinc-400">P(K ≥ 3):</span>
                <span className="font-bold text-orange-600 dark:text-orange-400">
                  {(simulatedSuccessProb * 100).toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-900 px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 text-slate-600 dark:text-zinc-400">
                <GitBranch className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-[11px] font-semibold text-slate-800 dark:text-zinc-200">ayush</span>
              </div>
            </div>

            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={toggleDark}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 hover:border-orange-400 dark:hover:border-orange-500 transition-all flex items-center gap-1.5 text-xs font-mono shadow-xs"
              title={isDark ? "Switch to Luminous Light Mode" : "Switch to Titanium Dark Mode"}
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                  <span className="hidden sm:inline font-medium">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span className="hidden sm:inline font-medium">Dark</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stage Navigation Stepper Tabs */}
        <div className="flex overflow-x-auto space-x-2 pb-2.5 pt-1 scrollbar-none">
          {stages.map((stg) => {
            const Icon = stg.icon;
            const isActive = currentStage === stg.id;
            return (
              <button
                key={stg.id}
                onClick={() => setCurrentStage(stg.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-left transition-all duration-200 whitespace-nowrap text-xs ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold shadow-md shadow-orange-500/20'
                    : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-800 shadow-xs'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className={`font-semibold ${isActive ? 'text-white' : 'text-slate-800 dark:text-zinc-100'}`}>
                    {stg.label}
                  </div>
                  <div className={`text-[10px] font-normal ${isActive ? 'text-orange-100' : 'text-slate-500 dark:text-zinc-400'}`}>
                    {stg.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
