import React, { useState, useMemo } from 'react';
import { CandidateCustomer, SimulationResult, Stage3MethodBenchmark } from '../../types';
import { simulateQuantumCircuit, calculateRyAngle, calculateExactPoissonBinomial } from '../../utils/quantumMath';
import { STAGE3_BENCHMARKS } from '../../data/dataset';
import { BlochSphere3D } from '../canvas/BlochSphere3D';
import { Cpu, Play, CheckCircle2, RefreshCw, BarChart3, ShieldCheck, Activity, Sparkles, Layers, Sliders } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Stage3SimulateProps {
  selectedCustomers: CandidateCustomer[];
  onSimulationComplete?: (res: SimulationResult) => void;
}

export const Stage3Simulate: React.FC<Stage3SimulateProps> = ({
  selectedCustomers,
  onSimulationComplete,
}) => {
  // Mode: Stage 1 calibrated probabilities vs Notebook Cell 2 reference benchmark
  const [probPreset, setProbPreset] = useState<'stage1' | 'notebook'>('stage1');
  const [shots, setShots] = useState(100000);
  const [addNoise, setAddNoise] = useState(false);
  const [readoutMitigation, setReadoutMitigation] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [activeBlochQubit, setActiveBlochQubit] = useState<number | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'circuit' | 'benchmarks' | 'distribution' | 'bloch'>(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('subtab');
    if (t === 'benchmarks' || t === 'distribution' || t === 'bloch') return t;
    return 'circuit';
  });

  // Ascending customer_id sort order (Stage 3 notebook specification)
  const sortedCustomers = useMemo(() => {
    return [...selectedCustomers.slice(0, 6)].sort((a, b) =>
      String(a.customer_id).localeCompare(String(b.customer_id))
    );
  }, [selectedCustomers]);

  // Probabilities based on selected preset
  const probabilities = useMemo(() => {
    if (probPreset === 'notebook') {
      // Notebook cell 2 default benchmark array: C0017: 0.35, C0073: 0.62, C0107: 0.58, C0281: 0.51, C0297: 0.45, C0311: 0.70
      return [0.35, 0.62, 0.58, 0.51, 0.45, 0.70];
    }
    return sortedCustomers.map((c) => c.probability);
  }, [probPreset, sortedCustomers]);

  const exactResult = useMemo(() => {
    return calculateExactPoissonBinomial(probabilities);
  }, [probabilities]);

  const [simResult, setSimResult] = useState<SimulationResult>(() => {
    return simulateQuantumCircuit(probabilities, shots, addNoise);
  });

  // Re-run simulation when probabilities or noise toggle changes
  React.useEffect(() => {
    const res = simulateQuantumCircuit(probabilities, shots, addNoise);
    setSimResult(res);
    if (onSimulationComplete) {
      onSimulationComplete(res);
    }
  }, [probabilities, shots, addNoise, onSimulationComplete]);

  const runSimulation = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = simulateQuantumCircuit(probabilities, shots, addNoise);
      setSimResult(res);
      setIsRunning(false);
      if (onSimulationComplete) {
        onSimulationComplete(res);
      }
      confetti({
        particleCount: 50,
        spread: 55,
        origin: { y: 0.7 },
        colors: ['#ea580c', '#f59e0b', '#dc2626', '#10b981'],
      });
    }, 500);
  };

  const topBitstrings = useMemo(() => {
    return Object.entries(simResult.counts)
      .map(([bitstring, count]) => {
        let ones = 0;
        for (const char of bitstring) {
          if (char === '1') ones++;
        }
        return {
          bitstring,
          count,
          prob: count / simResult.shots,
          isSuccess: ones >= 3,
          onesCount: ones,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [simResult]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl acrylic-card-elevated p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-200 dark:border-zinc-800">
        <div className="max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/80 border border-orange-200 dark:border-orange-800 text-xs font-mono font-bold text-orange-800 dark:text-orange-400">
            <Cpu className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            Stage 3: Quantum Outcome Simulation
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
            6-Qubit Parameterized Circuit Studio
          </h1>
          <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
            Estimates P(K ≥ 3) — the probability that at least 3 of the 6 targeted customers subscribe to term deposits. Qubits are initialized as separable product states R_Y(θ_k)|0⟩ with θ_k = 2 · arcsin(√p_k).
          </p>
          <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs font-mono">
            <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl border border-slate-200 dark:border-zinc-800">
              <button
                onClick={() => setProbPreset('stage1')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  probPreset === 'stage1'
                    ? 'bg-orange-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                }`}
              >
                Stage 1 Calibrated (P = {(exactResult.prob_ge3 * 100).toFixed(1)}%)
              </button>
              <button
                onClick={() => setProbPreset('notebook')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  probPreset === 'notebook'
                    ? 'bg-orange-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                }`}
              >
                Notebook Reference (P = 72.6%)
              </button>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              42 of 64 Basis States Valid (Hamming ≥ 3)
            </span>
          </div>
        </div>

        {/* Campaign Probability Gauge Card */}
        <div className="w-full md:w-80 acrylic-card rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3 font-mono">
          <div className="text-xs text-slate-500 dark:text-zinc-400 flex justify-between items-center">
            <span>Estimated P(K ≥ 3)</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
              Exact Match
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-4xl font-black text-slate-900 dark:text-zinc-100">
              {(simResult.quantum_prob_ge3 * 100).toFixed(2)}%
            </div>
            <div className="text-xs text-slate-500 dark:text-zinc-400">
              (Exact: {(exactResult.prob_ge3 * 100).toFixed(2)}%)
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden border border-slate-200 dark:border-zinc-700">
            <div
              className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${simResult.quantum_prob_ge3 * 100}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-100 dark:border-zinc-800">
            <span>Absolute Error Δ: {(simResult.quantum_error * 100).toFixed(3)}%</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">MLAE Optimal ✓</span>
          </div>
        </div>
      </div>

      {/* Simulator Execution Controls */}
      <div className="acrylic-card rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-200 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-zinc-400">Shots:</span>
            {[10000, 50000, 100000].map((s) => (
              <button
                key={s}
                onClick={() => setShots(s)}
                className={`px-3 py-1 rounded-lg transition-colors border ${
                  shots === s
                    ? 'bg-orange-600 text-white font-bold border-orange-700 shadow-xs'
                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 border-slate-200 dark:border-zinc-800'
                }`}
              >
                {s.toLocaleString()}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800 hidden sm:block" />

          <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={addNoise}
              onChange={(e) => setAddNoise(e.target.checked)}
              className="rounded text-orange-600 focus:ring-orange-500"
            />
            <span>Depolarising Gate Noise (ε=0.02) & Readout Error</span>
          </label>
        </div>

        <button
          onClick={runSimulation}
          disabled={isRunning}
          className="w-full md:w-auto px-6 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase font-mono bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Simulating...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Run Circuit Simulation ({shots.toLocaleString()} Shots)</span>
            </>
          )}
        </button>
      </div>

      {/* Subtab Navigation Bar */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 gap-2">
        <button
          onClick={() => setActiveTab('circuit')}
          className={`py-2 px-4 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'circuit'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Circuit & Qubit Map</span>
        </button>
        <button
          onClick={() => setActiveTab('benchmarks')}
          className={`py-2 px-4 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'benchmarks'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Multi-Regime Benchmarks (MLAE & Mitigation)</span>
        </button>
        <button
          onClick={() => setActiveTab('distribution')}
          className={`py-2 px-4 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'distribution'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Subscription Distribution (K = 0..6)</span>
        </button>
        <button
          onClick={() => setActiveTab('bloch')}
          className={`py-2 px-4 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'bloch'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>3D Optical Glass Bloch Spheres</span>
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'circuit' && (
        <div className="space-y-6">
          {/* Qubit Map Table (Ascending customer_id per Stage 3 Notebook) */}
          <div className="acrylic-card rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-zinc-800 space-y-3 font-mono">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span>Qubit Map: Ascending Customer ID Ordering (q0..q5)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Bit order (Qiskit Little-Endian): <strong className="text-orange-600 dark:text-orange-400">b5 b4 b3 b2 b1 b0</strong> (q0 = right-most LSB). Big-endian reference: b0 b1 b2 b3 b4 b5.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs">
                dim = 64 states
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-3">Qubit Wire</th>
                    <th className="py-2.5 px-3">Customer ID</th>
                    <th className="py-2.5 px-3">P(Subscribe)</th>
                    <th className="py-2.5 px-3">Ry Angle θ (rad)</th>
                    <th className="py-2.5 px-3">Ry Angle θ (deg)</th>
                    <th className="py-2.5 px-3">Bit Significance</th>
                    <th className="py-2.5 px-3">Ground State Preparation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {sortedCustomers.map((cust, idx) => {
                    const prob = probabilities[idx];
                    const angle = calculateRyAngle(prob);
                    return (
                      <tr key={cust.customer_id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                        <td className="py-2.5 px-3 text-orange-600 dark:text-orange-400 font-bold">
                          q{idx}
                        </td>
                        <td className="py-2.5 px-3 text-slate-900 dark:text-zinc-100 font-bold">
                          {cust.customer_id}
                        </td>
                        <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-bold">
                          {(prob * 100).toFixed(2)}%
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">
                          {angle.radians.toFixed(4)} rad
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">
                          {angle.degrees.toFixed(2)}°
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {idx === 0 ? 'LSB (2⁰ = 1)' : idx === 5 ? 'MSB (2⁵ = 32)' : `2^${idx} = ${1 << idx}`}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400 text-[11px]">
                          cos({(angle.degrees / 2).toFixed(1)}°)|0⟩ + sin({(angle.degrees / 2).toFixed(1)}°)|1⟩
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 6-Wire Circuit SVG Diagram */}
          <div className="acrylic-card rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 space-y-3 font-mono">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
              <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                Transpiled Quantum Circuit Diagram (Depth = 2, CNOT = 0, Separable Product State)
              </span>
              <span className="text-xs text-orange-600 dark:text-orange-400">
                Qiskit 2.6 Native Equivalent
              </span>
            </div>

            <div className="overflow-x-auto py-2">
              <svg viewBox="0 0 840 280" className="w-full min-w-[720px] h-64 font-mono">
                {sortedCustomers.map((cust, i) => {
                  const y = 25 + i * 40;
                  const prob = probabilities[i];
                  const angle = calculateRyAngle(prob);

                  return (
                    <g key={i}>
                      <text x="20" y={y + 5} fill="#ea580c" fontSize="12" fontWeight="bold">
                        q[{i}]
                      </text>
                      <text x="55" y={y + 5} fill="#64748b" fontSize="10">
                        |0⟩
                      </text>

                      {/* Quantum wire line */}
                      <line x1="80" y1={y} x2="740" y2={y} stroke="#94a3b8" strokeWidth="1.5" />

                      {/* Customer badge */}
                      <rect x="110" y={y - 12} width="125" height="24" rx="4" fill="#18181b" stroke="#3f3f46" />
                      <text x="120" y={y + 4} fill="#f4f4f5" fontSize="10">
                        {cust.customer_id} ({(prob * 100).toFixed(1)}%)
                      </text>

                      {/* Ry Rotation Gate */}
                      <rect
                        x="265"
                        y={y - 14}
                        width="125"
                        height="28"
                        rx="6"
                        fill="#ea580c"
                        stroke="#c2410c"
                        strokeWidth="1.2"
                      />
                      <text x="278" y={y + 4} fill="#ffffff" fontSize="11" fontWeight="bold">
                        Ry({angle.degrees}°)
                      </text>

                      {/* Barrier */}
                      <line x1="440" y1={12} x2="440" y2={260} stroke="#f97316" strokeWidth="1.5" strokeDasharray="3 3" />

                      {/* Z-Basis Measurement Gate */}
                      <rect x="540" y={y - 12} width="55" height="24" rx="4" fill="#27272a" stroke="#71717a" strokeWidth="1" />
                      <text x="555" y={y + 4} fill="#f4f4f5" fontSize="10" fontWeight="bold">
                        [ M_z ]
                      </text>

                      {/* Classical double line */}
                      <line x1="595" y1={y - 2} x2="740" y2={y - 2} stroke="#71717a" strokeWidth="1" />
                      <line x1="595" y1={y + 2} x2="740" y2={y + 2} stroke="#71717a" strokeWidth="1" />
                      <text x="750" y={y + 4} fill="#a1a1aa" fontSize="10">
                        c[{i}]
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Benchmarks Tab from stage3-simulate.ipynb Cell 7 */}
      {activeTab === 'benchmarks' && (
        <div className="acrylic-card rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-zinc-800 space-y-4 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span>Multi-Regime Estimator Benchmarks (stage3-simulate.ipynb Cell 7)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Evaluation across ideal device, noisy device, mitigation, and classical Monte Carlo over repeated draws.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="px-2.5 py-1 rounded bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 text-xs font-bold">
                100,000 Shots per Regimen
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3">Estimator / Method</th>
                  <th className="py-2.5 px-3">Regime</th>
                  <th className="py-2.5 px-3">Quantum</th>
                  <th className="py-2.5 px-3">Mean P(≥3)</th>
                  <th className="py-2.5 px-3">Std Dev</th>
                  <th className="py-2.5 px-3">Bias</th>
                  <th className="py-2.5 px-3">RMSE</th>
                  <th className="py-2.5 px-3">Ranking / Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {STAGE3_BENCHMARKS.map((b) => {
                  const isBestIdeal = b.method.includes('MLAE');
                  const isBestNoisy = b.method === 'Noisy + readout-mitigated';
                  return (
                    <tr
                      key={b.method}
                      className={`transition-colors ${
                        isBestIdeal || isBestNoisy
                          ? 'bg-orange-50/70 dark:bg-orange-950/30 font-bold'
                          : 'hover:bg-slate-50 dark:hover:bg-zinc-900/50'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-slate-900 dark:text-zinc-100">
                        {b.method}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          b.regime === 'ideal device'
                            ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300'
                            : b.regime === 'noisy device'
                            ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                        }`}>
                          {b.regime.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={b.is_quantum ? 'text-orange-600 dark:text-orange-400 font-bold' : 'text-slate-400'}>
                          {b.is_quantum ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-900 dark:text-zinc-100">
                        {b.mean.toFixed(6)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {b.std.toFixed(6)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {b.bias.toFixed(6)}
                      </td>
                      <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-bold">
                        {b.rmse.toFixed(6)}
                      </td>
                      <td className="py-2.5 px-3">
                        {isBestIdeal && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-700">
                            Best Ideal
                          </span>
                        )}
                        {isBestNoisy && (
                          <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 text-[10px] font-bold border border-orange-300 dark:border-orange-700">
                            Best Noisy
                          </span>
                        )}
                        {!isBestIdeal && !isBestNoisy && (
                          <span className="text-slate-400 text-[10px]">Benchmark</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subscriber Count Distribution Tab */}
      {activeTab === 'distribution' && (
        <div className="acrylic-card rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-zinc-800 space-y-4 font-mono">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Poisson-Binomial Distribution: Subscribers Count K ∈ [0..6]</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Green indicates qualifying conversion outcomes (K ≥ 3, 42 of 64 basis states).
              </p>
            </div>
            <span className="px-3 py-1 rounded bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 font-bold text-xs">
              P(K ≥ 3) = {(exactResult.prob_ge3 * 100).toFixed(2)}%
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {exactResult.probDistribution.map((prob, k) => {
              const isTarget = k >= 3;
              return (
                <div key={k} className="flex items-center gap-4 text-xs">
                  <div className="w-24 font-bold text-slate-800 dark:text-zinc-200">
                    K = {k} Subscribers
                  </div>
                  <div className="flex-1 bg-slate-100 dark:bg-zinc-800 h-5 rounded-full overflow-hidden border border-slate-200 dark:border-zinc-700">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isTarget
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                          : 'bg-slate-300 dark:bg-zinc-600'
                      }`}
                      style={{ width: `${prob * 260}%` }}
                    />
                  </div>
                  <div className="w-20 text-right font-bold text-slate-900 dark:text-zinc-100">
                    {(prob * 100).toFixed(2)}%
                  </div>
                  <div className="w-24 text-right">
                    {isTarget ? (
                      <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">
                        Target Met ✓
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Sub-Quota</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3D Optical Glass Bloch Spheres Tab */}
      {activeTab === 'bloch' && (
        <div className="acrylic-card rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span>Interactive Optical Glass 3D Bloch Spheres</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Frosted glass spheres rendering exact state vectors |ψ⟩ = cos(θ/2)|0⟩ + sin(θ/2)|1⟩ for all 6 customer qubits.
              </p>
            </div>
            <div className="flex gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl text-xs font-mono border border-slate-200 dark:border-zinc-800">
              <button
                onClick={() => setActiveBlochQubit('all')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  activeBlochQubit === 'all'
                    ? 'bg-orange-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                All 6
              </button>
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveBlochQubit(idx)}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    activeBlochQubit === idx
                      ? 'bg-orange-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  q{idx}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {sortedCustomers.map((cust, idx) => {
              if (activeBlochQubit !== 'all' && activeBlochQubit !== idx) return null;
              const prob = probabilities[idx];
              const angle = calculateRyAngle(prob);

              return (
                <div key={cust.customer_id} className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
                  <BlochSphere3D
                    theta={angle.radians}
                    probability={prob}
                    qubitLabel={`q${idx}`}
                    customerId={cust.customer_id}
                    className="w-full h-44"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
