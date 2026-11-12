import React, { useState, useMemo } from 'react';
import { CandidateCustomer, Stage2Constraints, SolverBenchmark } from '../../types';
import { STAGE2_CONSTRAINTS, SOLVER_BENCHMARKS } from '../../data/dataset';
import { solveExactClassical, buildQuboMatrix, simulateQAOA } from '../../utils/quantumMath';
import { QuantumWorkbench3D } from '../canvas/QuantumWorkbench3D';
import { IsingLandscape3D } from '../canvas/IsingLandscape3D';
import { Layers, ShieldCheck, CheckCircle2, ChevronRight, Cpu, Sparkles, Wand2, Terminal, Activity } from 'lucide-react';

interface Stage2SelectProps {
  candidates: CandidateCustomer[];
  onSelectedCustomersChange: (selected: CandidateCustomer[]) => void;
  onProceedToStage3: () => void;
}

export const Stage2Select: React.FC<Stage2SelectProps> = ({
  candidates,
  onSelectedCustomersChange,
  onProceedToStage3,
}) => {
  const [budgetLimit, setBudgetLimit] = useState(STAGE2_CONSTRAINTS.budget_limit);
  const [capacityLimit, setCapacityLimit] = useState(STAGE2_CONSTRAINTS.capacity_limit);
  const [qaoaLayers, setQaoaLayers] = useState(2);
  const [activeTab, setActiveTab] = useState<'workbench' | 'landscape' | 'solvers' | 'qubo'>(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('tab');
    if (t === 'solvers' || t === 'landscape' || t === 'qubo') return t;
    return 'workbench';
  });
  const [activeSolverName, setActiveSolverName] = useState<string>('Exact brute force (classical)');

  const currentConstraints: Stage2Constraints = useMemo(() => ({
    candidate_pool_size: 10,
    exact_select_count: 6,
    budget_limit: budgetLimit,
    capacity_limit: capacityLimit,
  }), [budgetLimit, capacityLimit]);

  // Exact Classical Solution
  const classicalResult = useMemo(() => {
    return solveExactClassical(candidates, currentConstraints);
  }, [candidates, currentConstraints]);

  // Selected customer IDs (set)
  const [userSelectedIds, setUserSelectedIds] = useState<Set<string | number>>(() => {
    return new Set(classicalResult.bestSelection.map((c) => c.customer_id));
  });

  // Keep synced if classicalResult updates
  React.useEffect(() => {
    if (classicalResult.bestSelection.length === 6) {
      setUserSelectedIds(new Set(classicalResult.bestSelection.map((c) => c.customer_id)));
    }
  }, [classicalResult]);

  // Toggle single customer in 3D workbench
  const handleToggleCustomer = (id: string | number) => {
    setUserSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size < 6) {
          next.add(id);
        }
      }
      return next;
    });
  };

  // Auto-solve QAOA optimal 6
  const handleAutoSolve = () => {
    const optimalIds = new Set(classicalResult.bestSelection.map((c) => c.customer_id));
    setUserSelectedIds(optimalIds);
  };

  // Apply a solver from the benchmark list
  const handleApplySolver = (benchmark: SolverBenchmark) => {
    setActiveSolverName(benchmark.name);
    const newSelected = new Set<string | number>();
    for (let i = 0; i < benchmark.bitstring.length && i < candidates.length; i++) {
      if (benchmark.bitstring[i] === '1') {
        newSelected.add(candidates[i].customer_id);
      }
    }
    setUserSelectedIds(newSelected);
  };

  // Sync selected customers upstream
  React.useEffect(() => {
    const list = candidates.filter((c) => userSelectedIds.has(c.customer_id));
    if (list.length === 6) {
      onSelectedCustomersChange(list);
    }
  }, [userSelectedIds, candidates, onSelectedCustomersChange]);

  // QAOA Solver Simulation
  const qaoaResult = useMemo(() => {
    return simulateQAOA(candidates, currentConstraints, qaoaLayers, 4096);
  }, [candidates, currentConstraints, qaoaLayers]);

  // 10x10 QUBO Matrix
  const quboMatrix = useMemo(() => {
    return buildQuboMatrix(candidates, currentConstraints);
  }, [candidates, currentConstraints]);

  const currentCost = useMemo(() => {
    return candidates.filter(c => userSelectedIds.has(c.customer_id)).reduce((acc, c) => acc + c.contact_cost, 0);
  }, [candidates, userSelectedIds]);

  const currentCapacity = useMemo(() => {
    return candidates.filter(c => userSelectedIds.has(c.customer_id)).reduce((acc, c) => acc + c.capacity_requirement, 0);
  }, [candidates, userSelectedIds]);

  const currentNetValue = useMemo(() => {
    return candidates.filter(c => userSelectedIds.has(c.customer_id)).reduce((acc, c) => acc + c.expected_net_value, 0);
  }, [candidates, userSelectedIds]);

  const currentBitstring = useMemo(() => {
    return candidates.map(c => userSelectedIds.has(c.customer_id) ? '1' : '0').join('');
  }, [candidates, userSelectedIds]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl acrylic-card-elevated p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/80 border border-orange-200 dark:border-orange-800 text-xs font-mono font-bold text-orange-800 dark:text-orange-400">
            <Layers className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            Stage 2: Constrained Customer Selection
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
            QUBO / QAOA 3D Spatial Arena
          </h1>
          <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
            Selecting exactly 6 high-value customers out of the top 10 candidates to maximize total expected net value under budget limit (Cost ≤ 25) and capacity limit (Capacity ≤ 22).
          </p>
          <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs font-mono">
            <button
              onClick={handleAutoSolve}
              className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Load Optimal Ground State (1010111001)</span>
            </button>
            <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">
              Evaluated 210 Combinations
            </span>
          </div>
        </div>

        {/* Financial KPI Summary Card */}
        <div className="w-full md:w-80 acrylic-card rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-xs font-mono text-slate-500 dark:text-zinc-400">
            <span>Total Expected Net Value</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800 text-[10px]">
              {userSelectedIds.size === 6 && currentCost <= budgetLimit && currentCapacity <= capacityLimit ? 'Valid Feasible' : 'Constraint Violated'}
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-zinc-100 font-mono">
            {currentNetValue.toFixed(4)}
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs font-mono">
            <div>
              <div className="text-slate-500 dark:text-zinc-400">Budget Spent</div>
              <div className="text-slate-800 dark:text-zinc-200 font-bold">
                {currentCost.toFixed(0)} / {budgetLimit.toFixed(0)}
              </div>
              <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full mt-1.5 overflow-hidden border border-slate-200 dark:border-zinc-700">
                <div
                  className={`h-full rounded-full transition-all ${
                    currentCost <= budgetLimit ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, (currentCost / budgetLimit) * 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="text-slate-500 dark:text-zinc-400">Capacity Used</div>
              <div className="text-slate-800 dark:text-zinc-200 font-bold">
                {currentCapacity.toFixed(0)} / {capacityLimit.toFixed(0)}
              </div>
              <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full mt-1.5 overflow-hidden border border-slate-200 dark:border-zinc-700">
                <div
                  className={`h-full rounded-full transition-all ${
                    currentCapacity <= capacityLimit ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, (currentCapacity / capacityLimit) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 gap-2">
        <button
          onClick={() => setActiveTab('workbench')}
          className={`py-2 px-4 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'workbench'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>3D Quantum Workbench</span>
        </button>
        <button
          onClick={() => setActiveTab('solvers')}
          className={`py-2 px-4 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'solvers'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Solvers Comparison (8 Solvers)</span>
        </button>
        <button
          onClick={() => setActiveTab('landscape')}
          className={`py-2 px-4 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'landscape'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>3D Ising Landscape</span>
        </button>
        <button
          onClick={() => setActiveTab('qubo')}
          className={`py-2 px-4 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'qubo'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>10x10 QUBO Matrix</span>
        </button>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Visualizer or Solvers */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'workbench' && (
            <div className="acrylic-card rounded-2xl p-4 border border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="flex justify-between items-center px-2">
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-zinc-300">
                  Interactive Spatial Quantum Docking Bay (Click pucks to select/dock)
                </span>
                <span className="text-xs font-mono text-orange-600 dark:text-orange-400">
                  Bitstring: <strong className="tracking-widest">{currentBitstring}</strong>
                </span>
              </div>
              <QuantumWorkbench3D
                candidates={candidates}
                selectedIds={userSelectedIds}
                onToggleCustomer={handleToggleCustomer}
                className="w-full h-[480px] rounded-xl overflow-hidden bg-slate-900/10 dark:bg-black/40 border border-slate-200 dark:border-zinc-800"
              />
            </div>
          )}

          {activeTab === 'solvers' && (
            <div className="acrylic-card rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span>Jupyter Benchmark Solvers (stage2-select.ipynb)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Click "Apply Bitstring" on any solver to immediately load its configuration into the workspace.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
                    <tr>
                      <th className="py-2.5 px-3">Solver</th>
                      <th className="py-2.5 px-3">Bitstring</th>
                      <th className="py-2.5 px-3">Valid</th>
                      <th className="py-2.5 px-3">Net Value</th>
                      <th className="py-2.5 px-3">Time</th>
                      <th className="py-2.5 px-3">Gap to Exact</th>
                      <th className="py-2.5 px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {SOLVER_BENCHMARKS.map((solv) => {
                      const isCurrent = activeSolverName === solv.name;
                      return (
                        <tr
                          key={solv.name}
                          className={`transition-colors ${
                            isCurrent
                              ? 'bg-orange-50/70 dark:bg-orange-950/30 font-bold'
                              : 'hover:bg-slate-50 dark:hover:bg-zinc-900/50'
                          }`}
                        >
                          <td className="py-2.5 px-3 text-slate-900 dark:text-zinc-100">
                            {solv.name}
                          </td>
                          <td className="py-2.5 px-3 text-orange-600 dark:text-orange-400 tracking-wider">
                            {solv.bitstring}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                              {solv.valid ? 'True' : 'False'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-900 dark:text-zinc-100 font-bold">
                            {solv.net_value.toFixed(6)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {solv.execution_seconds.toFixed(4)}s
                          </td>
                          <td className="py-2.5 px-3">
                            {solv.gap_to_exact_pct === 0 ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">0.00% (Exact)</span>
                            ) : (
                              <span className="text-amber-600 font-bold">{solv.gap_to_exact_pct.toFixed(3)}%</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <button
                              onClick={() => handleApplySolver(solv)}
                              className="px-2.5 py-1 rounded-md text-[10px] bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 hover:border-orange-500 text-slate-700 dark:text-zinc-300 font-bold"
                            >
                              Apply
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'landscape' && (
            <div className="acrylic-card rounded-2xl p-4 border border-slate-200 dark:border-zinc-800 space-y-3">
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-zinc-300 px-2">
                3D Ising Combinatorial Energy Surface
              </span>
              <IsingLandscape3D
                qaoaEnergyHistory={qaoaResult.energyConvergence}
                optimalBitstring={qaoaResult.optimalBitstring}
                className="w-full h-[480px] rounded-xl overflow-hidden bg-slate-900/10 dark:bg-black/40 border border-slate-200 dark:border-zinc-800"
              />
            </div>
          )}

          {activeTab === 'qubo' && (
            <div className="acrylic-card rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-zinc-300">
                  10x10 Symmetric QUBO Upper Triangular Matrix Q
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Includes Cardinality (K=6) + Budget + Capacity Penalties
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-center text-[10px] font-mono border-collapse">
                  <tbody>
                    {quboMatrix.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {row.map((val, cIdx) => (
                          <td
                            key={cIdx}
                            className={`p-1.5 border border-slate-200/50 dark:border-zinc-800 ${
                              rIdx === cIdx
                                ? 'bg-orange-100/70 dark:bg-orange-950/50 text-orange-900 dark:text-orange-300 font-bold'
                                : cIdx > rIdx
                                ? 'bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400'
                                : 'text-slate-300 dark:text-zinc-700'
                            }`}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Selection Status & Advance Action */}
        <div className="space-y-4">
          <div className="acrylic-card rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 space-y-3 font-mono">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                Ground Truth Optimum
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                Gap 0.00%
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1">
                <div className="text-slate-400 text-[10px]">Optimal Decision Bitstring</div>
                <div className="text-orange-600 dark:text-orange-400 font-bold tracking-widest text-sm">
                  {classicalResult.bestBitstring}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1">
                <div className="text-slate-400 text-[10px]">Selected Customers ({userSelectedIds.size}/6)</div>
                <div className="text-slate-900 dark:text-zinc-100 font-bold text-xs">
                  {Array.from(userSelectedIds).map(id => `${id}`).join(', ')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                  <div className="text-slate-400 text-[10px]">Total Cost</div>
                  <div className="text-slate-900 dark:text-zinc-100 font-bold">{currentCost.toFixed(0)} ≤ {budgetLimit}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                  <div className="text-slate-400 text-[10px]">Total Capacity</div>
                  <div className="text-slate-900 dark:text-zinc-100 font-bold">{currentCapacity.toFixed(0)} ≤ {capacityLimit}</div>
                </div>
              </div>
            </div>

            <button
              onClick={onProceedToStage3}
              disabled={userSelectedIds.size !== 6 || currentCost > budgetLimit || currentCapacity > capacityLimit}
              className="mt-4 w-full py-3 px-4 rounded-xl font-bold text-xs tracking-wider uppercase font-mono bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>Advance 6 Customers to Stage 3 Circuit</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Candidate Customers Roster */}
      <div className="acrylic-card rounded-2xl p-6 border border-slate-200 dark:border-zinc-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <span>Stage 2 Candidate Pool (Top 10 from Stage 1)</span>
              <span className="text-xs font-mono text-orange-600 dark:text-orange-400 font-semibold">
                — Exactly 6 Selected
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Selected 6 customers are mapped directly to qubits $q_0 \dots q_5$ in the campaign simulation circuit.
            </p>
          </div>
          <span className="px-3 py-1 text-xs font-mono font-bold rounded-lg bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
            {userSelectedIds.size} of 6 Selected
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
          {candidates.map((cand) => {
            const isSelected = userSelectedIds.has(cand.customer_id);
            return (
              <div
                key={cand.customer_id}
                onClick={() => handleToggleCustomer(cand.customer_id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-orange-50/70 dark:bg-orange-950/30 border-orange-500 shadow-sm scale-102'
                    : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-zinc-100">
                    {cand.customer_id}
                  </span>
                  {isSelected ? (
                    <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-orange-600 text-white">
                      SELECTED
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-slate-400">UNSELECTED</span>
                  )}
                </div>

                <div className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Probability:</span>
                    <span className="text-orange-600 dark:text-orange-400 font-bold">{(cand.probability * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Deposit:</span>
                    <span className="text-slate-800 dark:text-zinc-200">${cand.expected_deposit_value}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Cost:</span>
                    <span className="text-amber-700 dark:text-amber-400">${cand.contact_cost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Capacity:</span>
                    <span className="text-slate-700 dark:text-zinc-300">{cand.capacity_requirement} units</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Net Value:</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">${cand.expected_net_value.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
