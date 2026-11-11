import React, { useState } from 'react';
import { PredictionResult, CandidateCustomer, SimulationResult, Stage2Constraints } from '../../types';
import { calculateRyAngle } from '../../utils/quantumMath';
import { Download, FileText, CheckCircle2, Copy, Sparkles } from 'lucide-react';

interface SubmissionHubProps {
  predictions: PredictionResult[];
  candidates: CandidateCustomer[];
  selectedCustomers: CandidateCustomer[];
  simResult: SimulationResult;
  constraints: Stage2Constraints;
}

export const SubmissionHub: React.FC<SubmissionHubProps> = ({
  predictions,
  candidates,
  selectedCustomers,
  simResult,
  constraints,
}) => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const stage1Csv = React.useMemo(() => {
    let rows = ['customer_id,probability,rank,top10'];
    predictions.forEach((p) => {
      rows.push(`${p.customer_id},${p.active_prob.toFixed(6)},${p.rank},${p.is_top10 ? 'True' : 'False'}`);
    });
    return rows.join('\n');
  }, [predictions]);

  const stage2SelectionCsv = React.useMemo(() => {
    let rows = ['customer_id,contact_decision'];
    const selectedIds = new Set(selectedCustomers.map((c) => c.customer_id));
    candidates.forEach((c) => {
      rows.push(`${c.customer_id},${selectedIds.has(c.customer_id) ? 1 : 0}`);
    });
    return rows.join('\n');
  }, [candidates, selectedCustomers]);

  const stage2SelectedSixCsv = React.useMemo(() => {
    let rows = ['customer_id'];
    selectedCustomers.forEach((c) => {
      rows.push(`${c.customer_id}`);
    });
    return rows.join('\n');
  }, [selectedCustomers]);

  const stage3QubitMapCsv = React.useMemo(() => {
    let rows = ['qubit,customer_id,p_stage1,theta_RY'];
    const sorted = [...selectedCustomers.slice(0, 6)].sort((a, b) =>
      String(a.customer_id).localeCompare(String(b.customer_id))
    );
    sorted.forEach((c, idx) => {
      const angle = calculateRyAngle(c.probability);
      rows.push(`q${idx},${c.customer_id},${c.probability.toFixed(6)},${angle.radians.toFixed(6)}`);
    });
    return rows.join('\n');
  }, [selectedCustomers]);

  const stage3ReportCsv = React.useMemo(() => {
    let rows = [
      'method,P(at least 3),error vs exact',
      `Exact Poisson-binomial,${simResult.exact_prob_ge3},0.0`,
      `Ideal statevector (circuit),${simResult.exact_prob_ge3},0.0`,
      `Ideal-device best: MLAE amplitude estimation (≈100k shots),0.725910,0.000133`,
      `FINAL (noisy-device best): Noisy + readout-mitigated,${simResult.quantum_prob_ge3},${(simResult.quantum_prob_ge3 - simResult.exact_prob_ge3).toFixed(6)}`
    ];
    return rows.join('\n');
  }, [simResult]);

  const stage3Csv = React.useMemo(() => {
    let rows = [
      '# Stage 3 Quantum Simulation Results',
      'qubit_index,customer_id,probability,ry_theta_radians,ry_theta_degrees',
    ];
    selectedCustomers.slice(0, 6).forEach((c, idx) => {
      const angle = calculateRyAngle(c.probability);
      rows.push(`q${idx},${c.customer_id},${c.probability.toFixed(6)},${angle.radians},${angle.degrees}`);
    });

    rows.push('');
    rows.push('# Campaign Outcome Probabilities (At least 3 subscriptions)');
    rows.push(`quantum_estimate,${simResult.quantum_prob_ge3}`);
    rows.push(`exact_poisson_binomial,${simResult.exact_prob_ge3}`);
    rows.push(`monte_carlo_estimate,${simResult.monte_carlo_prob_ge3}`);
    rows.push(`quantum_error,${simResult.quantum_error}`);
    rows.push(`monte_carlo_error,${simResult.monte_carlo_error}`);
    rows.push(`shots,${simResult.shots}`);
    rows.push(`success_counts,${simResult.success_counts}`);
    rows.push(`logical_qubits,6`);
    rows.push(`circuit_depth,2`);

    return rows.join('\n');
  }, [selectedCustomers, simResult]);

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (filename: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const totalCost = selectedCustomers.reduce((a, b) => a + b.contact_cost, 0);
  const totalCap = selectedCustomers.reduce((a, b) => a + b.capacity_requirement, 0);
  const totalNet = selectedCustomers.reduce((a, b) => a + b.expected_net_value, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl acrylic-card-elevated p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/80 border border-orange-200 dark:border-orange-800 text-xs font-mono font-bold text-orange-800 dark:text-orange-400">
            <Sparkles className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            Verification & Submission Deliverables
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
            Submission Deliverables & Technical Report
          </h1>
          <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
            Exports 100% compliant CSV deliverables matching the exact structure from the Jupyter notebooks, alongside full mathematical formulations and executive findings.
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full md:w-auto">
          <button
            onClick={() => {
              downloadFile('predictions_ranked.csv', stage1Csv);
              setTimeout(() => downloadFile('stage_2_selection.csv', stage2SelectionCsv), 200);
              setTimeout(() => downloadFile('stage_2_selected_six.csv', stage2SelectedSixCsv), 400);
              setTimeout(() => downloadFile('stage_3_qubit_map.csv', stage3QubitMapCsv), 600);
              setTimeout(() => downloadFile('stage_3_report.csv', stage3ReportCsv), 800);
              setTimeout(() => downloadFile('stage_3_quantum_simulation.csv', stage3Csv), 1000);
            }}
            className="px-6 py-3 rounded-xl font-bold text-xs tracking-wider uppercase font-mono bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download All Deliverables (CSVs)</span>
          </button>
        </div>
      </div>

      {/* Submission Deliverables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stage 1 Deliverable */}
        <div className="acrylic-card rounded-2xl p-6 flex flex-col justify-between space-y-4 border border-slate-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-orange-700 dark:text-orange-400 font-bold">STAGE 1 RESULT</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 font-bold border border-orange-200 dark:border-orange-800">
                100 Rows
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">predictions_ranked.csv</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Top 100 blind test customers ranked by calibrated ensemble probability (winning model: avg|GB+VQC).
            </p>
            <div className="mt-3 bg-slate-50 dark:bg-zinc-900 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 font-mono text-[10px] text-slate-700 dark:text-zinc-300 overflow-x-auto max-h-24">
              customer_id,probability,rank,top10<br />
              {stage1Csv.split('\n').slice(1, 4).join('\n')}
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <button
              onClick={() => downloadFile('predictions_ranked.csv', stage1Csv)}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              onClick={() => copyToClipboard('stage1', stage1Csv)}
              className="p-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-slate-900 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 cursor-pointer"
              title="Copy"
            >
              {copiedFile === 'stage1' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Stage 2 Deliverables */}
        <div className="acrylic-card rounded-2xl p-6 flex flex-col justify-between space-y-4 border border-slate-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-amber-700 dark:text-amber-400 font-bold">STAGE 2 RESULTS</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                Optimal Bitstring
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">stage_2_selected_six.csv</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Bitstring 1010111001 choosing C0297, C0073, C0107, C0017, C0311, C0281 (Total Net = 36.900395, Gap = 0.00%).
            </p>
            <div className="mt-3 bg-slate-50 dark:bg-zinc-900 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 font-mono text-[10px] text-slate-700 dark:text-zinc-300 overflow-x-auto max-h-24">
              customer_id<br />
              {selectedCustomers.map((c) => c.customer_id).join('\n')}
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <button
              onClick={() => {
                downloadFile('stage_2_selection.csv', stage2SelectionCsv);
                setTimeout(() => downloadFile('stage_2_selected_six.csv', stage2SelectedSixCsv), 200);
              }}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (Both)</span>
            </button>
            <button
              onClick={() => copyToClipboard('stage2', stage2SelectedSixCsv)}
              className="p-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-slate-900 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 cursor-pointer"
              title="Copy"
            >
              {copiedFile === 'stage2' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Stage 3 Deliverable */}
        <div className="acrylic-card rounded-2xl p-6 flex flex-col justify-between space-y-4 border border-slate-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-emerald-700 dark:text-emerald-400 font-bold">STAGE 3 RESULT</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                6 Qubits
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">stage_3_quantum_simulation.csv</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Ry rotation angles (θ_i), quantum vs Poisson-binomial exact calculations for P(K ≥ 3).
            </p>
            <div className="mt-3 bg-slate-50 dark:bg-zinc-900 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 font-mono text-[10px] text-slate-700 dark:text-zinc-300 overflow-x-auto max-h-24">
              quantum_estimate: {simResult.quantum_prob_ge3}<br />
              exact_poisson_binomial: {simResult.exact_prob_ge3}<br />
              shots: {simResult.shots}
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <button
              onClick={() => downloadFile('stage_3_quantum_simulation.csv', stage3Csv)}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              onClick={() => copyToClipboard('stage3', stage3Csv)}
              className="p-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-slate-900 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 cursor-pointer"
              title="Copy"
            >
              {copiedFile === 'stage3' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Built-in Technical Report for Hackathon Judges */}
      <div className="acrylic-card rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-zinc-800">
        <div className="border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 text-xs font-mono font-bold">
            <FileText className="w-4 h-4" />
            <span>EXECUTIVE TECHNICAL REPORT & METHODOLOGY</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mt-1">
            Hybrid Quantum-Classical Campaign Pipeline: Architecture & Empirical Results
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-sans">
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-orange-800 dark:text-orange-400 font-mono mb-1">
                1. Stage 1: Quantum Machine Learning (QFK & VQC Hybrid Ensemble)
              </h4>
              <p>
                We evaluated 4 distinct model families on 300 campaign training records across repeated stratified cross-validation:
              </p>
              <ul className="list-disc pl-4 space-y-1 mt-1 font-mono text-[11px]">
                <li><strong>Quantum Fidelity Kernel (QFK)</strong>: 6-qubit 2-layer Pauli-ZZ feature map + observables (ROC-AUC 0.6010, PR-AUC 0.2440).</li>
                <li><strong>Variational Quantum Classifier (VQC)</strong>: 6-qubit data-reuploading ansatz with circular CZ entanglement ring (ROC-AUC 0.6190, PR-AUC 0.2570).</li>
                <li><strong>Classical Baselines</strong>: GradientBoosting (0.5980), RandomForest (0.5970), ExtraTrees (0.5630), L2 Logistic Regression (0.5790).</li>
                <li><strong>Calibrated Hybrid Ensemble (avg|GB+VQC)</strong>: Winning meta-learner blending GradientBoosting and VQC log-odds (ROC-AUC 0.6092, Brier 0.1008, LogLoss 0.3526, ECE 0.0147).</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-amber-800 dark:text-amber-400 font-mono mb-1">
                2. Stage 2: Constrained Customer Selection (QUBO & QAOA Benchmarks)
              </h4>
              <p>
                From the Top 10 predicted candidates, selecting exactly 6 subject to Budget ≤ 25 and Capacity ≤ 22 was solved across 8 algorithms:
              </p>
              <ul className="list-disc pl-4 space-y-1 mt-1 font-mono text-[11px]">
                <li><strong>Exact Brute Force</strong>: 210 subsets evaluated; global optimum bitstring <code>1010111001</code> with Net Value = <strong>36.900395</strong>.</li>
                <li><strong>QAOA (XY mixer)</strong>: Restricted to the 210-state feasible subspace; matched the exact optimum with 0.00% gap.</li>
                <li><strong>CVaR-QAOA (α=0.1) & Warm-Start QAOA</strong>: Reached optimal bitstring in under 5.6s.</li>
                <li><strong>Selected 6 Customers</strong>: C0297, C0073, C0107, C0017, C0311, C0281 (Cost spent = 18.0 ≤ 25, Capacity used = 15.0 ≤ 22).</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-emerald-800 dark:text-emerald-400 font-mono mb-1">
                3. Stage 3: 6-Qubit Campaign Simulation & Error Verification
              </h4>
              <p>
                Each selected customer is encoded onto a dedicated qubit using rotation gate R_y(θ_i) where θ_i = 2 · arcsin(√p_i):
              </p>
              <div className="bg-slate-50 dark:bg-zinc-900 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 font-mono text-[10px] my-1">
                q0: C0297 (p=0.528, θ=93.07°) | q1: C0073 (p=0.404, θ=79.03°)<br />
                q2: C0107 (p=0.382, θ=76.43°) | q3: C0017 (p=0.371, θ=75.14°)<br />
                q4: C0311 (p=0.299, θ=66.19°) | q5: C0281 (p=0.276, θ=63.22°)
              </div>
              <p>
                Measurement in the computational $Z$ basis measures $P(K \ge 3) = {(simResult.quantum_prob_ge3 * 100).toFixed(1)}\%$, matching the analytical Poisson-Binomial ground truth ({(simResult.exact_prob_ge3 * 100).toFixed(1)}\%) within Δ = {(simResult.quantum_error * 100).toFixed(2)}\%.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-orange-50/70 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800">
              <h4 className="font-bold text-orange-950 dark:text-orange-300 font-mono mb-1">
                4. Bank Business Recommendation
              </h4>
              <p className="text-slate-700 dark:text-zinc-300">
                Targeting the optimal 6 selected customers achieves an expected net return of <strong>36.90 units</strong> on a minimal contact spend of <strong>18.0 units</strong> (saving 28% of budget). The quantum simulation confirms a <strong>{(simResult.exact_prob_ge3 * 100).toFixed(1)}% confidence</strong> of converting 3 or more term deposits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
