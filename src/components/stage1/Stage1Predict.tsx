import React, { useState, useMemo } from 'react';
import { PredictionResult } from '../../types';
import { MODEL_METRICS } from '../../data/dataset';
import { Search, Filter, Sparkles, CheckCircle2, ChevronRight, Activity, Cpu, Layers, GitBranch, ArrowUpRight } from 'lucide-react';

interface Stage1PredictProps {
  predictions: PredictionResult[];
  activeModel: 'hybrid' | 'vqc' | 'qfk' | 'classical';
  setActiveModel: (m: 'hybrid' | 'vqc' | 'qfk' | 'classical') => void;
  onProceedToStage2: () => void;
}

export const Stage1Predict: React.FC<Stage1PredictProps> = ({
  predictions,
  activeModel,
  setActiveModel,
  onProceedToStage2,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyTop10, setOnlyTop10] = useState(false);
  const [activeArchTab, setActiveArchTab] = useState<'overview' | 'qfk' | 'vqc' | 'ensemble'>('overview');

  const currentMetrics = MODEL_METRICS[activeModel];

  const filteredCustomers = useMemo(() => {
    return predictions.filter((item) => {
      const matchSearch = String(item.customer_id).toLowerCase().includes(searchTerm.toLowerCase());
      const matchTop = onlyTop10 ? item.is_top10 : true;
      return matchSearch && matchTop;
    });
  }, [predictions, searchTerm, onlyTop10]);

  const top10Customers = useMemo(() => {
    return predictions.filter((p) => p.is_top10);
  }, [predictions]);

  return (
    <div className="space-y-6">
      {/* Hero Banner with Porcelain Light & Titanium Dark Styling */}
      <div className="rounded-2xl acrylic-card-elevated p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/80 border border-orange-200 dark:border-orange-800 text-xs font-mono font-bold text-orange-800 dark:text-orange-400">
            <Sparkles className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            Stage 1: Term Deposit Prediction
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
            Hybrid Quantum-Classical Classification
          </h1>
          <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
            Evaluates 6-qubit quantum feature maps, variational circuits, and classical baselines across 10-fold cross validation. Continuous probability predictions on 100 blind test customers are ranked to extract the Top 10 candidate pool.
          </p>
          <div className="pt-2 flex flex-wrap gap-2">
            {(['hybrid', 'vqc', 'qfk', 'classical'] as const).map((mKey) => {
              const m = MODEL_METRICS[mKey];
              const isSelected = activeModel === mKey;
              return (
                <button
                  key={mKey}
                  onClick={() => setActiveModel(mKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border flex items-center gap-2 ${
                    isSelected
                      ? 'bg-orange-600 text-white border-orange-700 font-bold shadow-md shadow-orange-500/20'
                      : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  {m.type === 'quantum' ? (
                    <Cpu className="w-3.5 h-3.5" />
                  ) : m.type === 'hybrid' ? (
                    <Sparkles className="w-3.5 h-3.5" />
                  ) : (
                    <Activity className="w-3.5 h-3.5" />
                  )}
                  <span>{m.shortName}</span>
                  {mKey === 'hybrid' && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400/30 text-amber-900 dark:text-amber-200 font-bold uppercase">
                      Best
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Studio KPI Visualizer Card */}
        <div className="w-full md:w-80 acrylic-card rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-xs font-mono text-slate-500 dark:text-zinc-400">
            <span>Active Model</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 text-[10px]">
              OOF Calibrated
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-zinc-100 font-mono">
            {currentMetrics.roc_auc.toFixed(4)}
          </div>
          <div className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
            ROC-AUC ({currentMetrics.shortName})
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs font-mono">
            <div>
              <div className="text-slate-400 dark:text-zinc-500 text-[10px]">PR-AUC Score</div>
              <div className="text-slate-800 dark:text-zinc-200 font-bold text-sm">{currentMetrics.pr_auc.toFixed(4)}</div>
            </div>
            <div>
              <div className="text-slate-400 dark:text-zinc-500 text-[10px]">Brier Score</div>
              <div className="text-orange-600 dark:text-orange-400 font-bold text-sm">{currentMetrics.brier_score.toFixed(4)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Benchmark Comparison Table from stage1-predict.ipynb Cell 20 */}
      <div className="acrylic-card rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              10-Fold Cross-Validation Model Benchmark Comparison
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Evaluated across repeated stratified splits on 300 campaign training records. Winning model: <strong className="text-orange-600 dark:text-orange-400">avg|GB+VQC</strong>.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveArchTab(activeArchTab === 'overview' ? 'vqc' : 'overview')}
              className="text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-100"
            >
              {activeArchTab === 'overview' ? 'Inspect Circuits' : 'View Benchmark'}
            </button>
          </div>
        </div>

        {activeArchTab === 'overview' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3">Model</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">ROC-AUC</th>
                  <th className="py-2.5 px-3">PR-AUC</th>
                  <th className="py-2.5 px-3">Precision@10</th>
                  <th className="py-2.5 px-3">Recall@10</th>
                  <th className="py-2.5 px-3">Brier Score</th>
                  <th className="py-2.5 px-3">Log-Loss</th>
                  <th className="py-2.5 px-3">ECE</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {(['hybrid', 'vqc', 'qfk', 'classical'] as const).map((key) => {
                  const m = MODEL_METRICS[key];
                  const isCurrent = activeModel === key;
                  return (
                    <tr
                      key={key}
                      onClick={() => setActiveModel(key)}
                      className={`cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-orange-50/70 dark:bg-orange-950/30 font-bold'
                          : 'hover:bg-slate-50 dark:hover:bg-zinc-900/50'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                        {key === 'hybrid' && <span className="w-2 h-2 rounded-full bg-orange-500" />}
                        <span>{m.name}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.type === 'quantum'
                            ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
                            : m.type === 'hybrid'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                        }`}>
                          {m.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-orange-600 dark:text-orange-400 font-bold">
                        {m.roc_auc.toFixed(4)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 dark:text-zinc-200">
                        {m.pr_auc.toFixed(4)}
                      </td>
                      <td className="py-2.5 px-3 text-emerald-700 dark:text-emerald-400">
                        {(m.precision_at_k * 100).toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">
                        {(m.recall_at_k * 100).toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 dark:text-zinc-200">
                        {m.brier_score.toFixed(4)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 dark:text-zinc-200">
                        {m.log_loss.toFixed(4)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-400">
                        {m.ece.toFixed(4)}
                      </td>
                      <td className="py-2.5 px-3">
                        {key === 'hybrid' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-700">
                            Selected
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Validated</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-orange-600 dark:text-orange-400">
                <Cpu className="w-4 h-4" />
                <span>Quantum Fidelity Kernel Classifier (QFK)</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                Encodes the top 6 standardized features into continuous rotation angles $\phi_i \in [0, \pi]$. Uses a 2-layer Pauli-ZZ feature map:
              </p>
              <div className="bg-white dark:bg-zinc-950 p-3 rounded-lg border border-slate-200 dark:border-zinc-800 font-mono text-[11px] text-slate-800 dark:text-zinc-200">
                U_Φ(x) = exp(i ∑ φ_i Z_i + i ∑ (π - φ_i)(π - φ_j) Z_i Z_j)
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                Extracts single-qubit expectation values $\langle Z_i \rangle$ and two-qubit correlation observables $\langle Z_i Z_j \rangle$ into an RBF Gram kernel.
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                <Layers className="w-4 h-4" />
                <span>Variational Quantum Classifier / QNN (VQC)</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                6-qubit data-reuploading ansatz with 3 interleaved parameterized rotation layers and circular CZ entanglement ring topology:
              </p>
              <div className="bg-white dark:bg-zinc-950 p-3 rounded-lg border border-slate-200 dark:border-zinc-800 font-mono text-[11px] text-slate-800 dark:text-zinc-200">
                CZ_ring: CZ(q0, q1) · CZ(q1, q2) · ... · CZ(q5, q0)
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                Optimized via SPSA/Adam with cross-entropy loss and Platt log-odds calibration for reliable probability outputs.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top 10 Candidate Pool Spotlight Banner */}
      <div className="rounded-2xl border-2 border-orange-500/40 dark:border-orange-500/30 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50/50 dark:from-orange-950/20 dark:via-zinc-900/40 dark:to-orange-950/20 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-600 text-white font-mono font-bold text-xs shadow-xs">
                Stage 1 Output
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                Top 10 Candidate Pool for Stage 2 Constrained Selection
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
              Top 10 predicted customers by probability (ties broken by customer_id ascending). Exactly 6 will be chosen in Stage 2 subject to budget $\le 25$ and capacity $\le 22$.
            </p>
          </div>

          <button
            onClick={onProceedToStage2}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-mono text-xs font-bold hover:shadow-lg hover:shadow-orange-500/25 transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <span>Proceed to Stage 2 Selection</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 10 Candidate Chips Preview */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-4 pt-3 border-t border-orange-200/60 dark:border-zinc-800">
          {top10Customers.map((cust, idx) => (
            <div
              key={cust.customer_id}
              className="bg-white/90 dark:bg-zinc-900/90 rounded-xl p-3 border border-orange-200/80 dark:border-zinc-800 font-mono shadow-xs hover:border-orange-400 transition-all"
            >
              <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-zinc-400">
                <span className="font-bold text-orange-600 dark:text-orange-400">#{idx + 1}</span>
                <span>{cust.customer_id}</span>
              </div>
              <div className="text-base font-black text-slate-900 dark:text-zinc-100 mt-1">
                {(cust.active_prob * 100).toFixed(1)}%
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
                <span>Cost: ${cust.contact_cost}</span>
                <span>Cap: {cust.capacity_req}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test Customers Explorer Table */}
      <div className="acrylic-card rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
              Complete Test Dataset Predictions (100 Customers)
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Showing continuous probabilities calibrated from the ensemble model.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search ID (e.g. C0297)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-zinc-950 font-mono"
              />
            </div>

            <button
              onClick={() => setOnlyTop10(!onlyTop10)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors flex items-center gap-1.5 border whitespace-nowrap ${
                onlyTop10
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-bold'
                  : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Top 10 Only</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs font-mono">
            <thead className="sticky top-0 bg-white/95 dark:bg-zinc-950/95 text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 backdrop-blur-md">
              <tr>
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Customer ID</th>
                <th className="py-2.5 px-3">Predicted Probability</th>
                <th className="py-2.5 px-3">Expected Deposit</th>
                <th className="py-2.5 px-3">Contact Cost</th>
                <th className="py-2.5 px-3">Capacity Req</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {filteredCustomers.map((cust) => (
                <tr
                  key={cust.customer_id}
                  className={`transition-colors ${
                    cust.is_top10
                      ? 'bg-orange-50/50 dark:bg-orange-950/30 font-medium'
                      : 'hover:bg-slate-50 dark:hover:bg-zinc-900/50'
                  }`}
                >
                  <td className="py-2.5 px-3 font-bold text-slate-700 dark:text-zinc-300">
                    #{cust.rank}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-zinc-100">
                    {cust.customer_id}
                  </td>
                  <td className="py-2.5 px-3 text-orange-600 dark:text-orange-400 font-bold">
                    {cust.active_prob.toFixed(6)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-800 dark:text-zinc-200">
                    ${cust.deposit_value}
                  </td>
                  <td className="py-2.5 px-3 text-amber-700 dark:text-amber-400">
                    ${cust.contact_cost}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">
                    {cust.capacity_req} units
                  </td>
                  <td className="py-2.5 px-3">
                    {cust.is_top10 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 text-[10px] font-bold border border-orange-200 dark:border-orange-800">
                        <CheckCircle2 className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                        Stage 2 Candidate
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-zinc-600 text-[10px]">Excluded</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
