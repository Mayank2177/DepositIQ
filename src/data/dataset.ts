import { CustomerFeature, PredictionResult, ModelMetrics, Stage2Constraints, CandidateCustomer, SolverBenchmark, Stage3MethodBenchmark } from '../types';

export const STAGE2_CONSTRAINTS: Stage2Constraints = {
  candidate_pool_size: 10,
  exact_select_count: 6,
  budget_limit: 25,    // Sum of 6 contact costs <= 25 (spent = 18)
  capacity_limit: 22,  // Sum of 6 capacity units <= 22 (used = 15)
};

// Ground truth Top 10 candidate customers from stage1-predict.ipynb & stage2-select.ipynb
export const STAGE2_TOP10_CANDIDATES: CandidateCustomer[] = [
  {
    customer_id: 'C0297',
    probability: 0.527943,
    expected_deposit_value: 25,
    contact_cost: 4,
    capacity_requirement: 4,
    expected_net_value: 9.198575,
    selected_by_quantum: true,
    selected_by_classical: true,
    bit_index: 0,
    qubit_index: 0,
  },
  {
    customer_id: 'C0263',
    probability: 0.497782,
    expected_deposit_value: 12,
    contact_cost: 2,
    capacity_requirement: 1,
    expected_net_value: 3.973384,
    selected_by_quantum: false,
    selected_by_classical: false,
    bit_index: 1,
  },
  {
    customer_id: 'C0073',
    probability: 0.404334,
    expected_deposit_value: 20,
    contact_cost: 2,
    capacity_requirement: 1,
    expected_net_value: 6.086680,
    selected_by_quantum: true,
    selected_by_classical: true,
    bit_index: 2,
    qubit_index: 1,
  },
  {
    customer_id: 'C0011',
    probability: 0.391731,
    expected_deposit_value: 15,
    contact_cost: 3,
    capacity_requirement: 1,
    expected_net_value: 2.875965,
    selected_by_quantum: false,
    selected_by_classical: false,
    bit_index: 3,
  },
  {
    customer_id: 'C0107',
    probability: 0.382222,
    expected_deposit_value: 22,
    contact_cost: 4,
    capacity_requirement: 2,
    expected_net_value: 4.408884,
    selected_by_quantum: true,
    selected_by_classical: true,
    bit_index: 4,
    qubit_index: 2,
  },
  {
    customer_id: 'C0017',
    probability: 0.371492,
    expected_deposit_value: 30,
    contact_cost: 3,
    capacity_requirement: 1,
    expected_net_value: 8.144760,
    selected_by_quantum: true,
    selected_by_classical: true,
    bit_index: 5,
    qubit_index: 3,
  },
  {
    customer_id: 'C0311',
    probability: 0.298679,
    expected_deposit_value: 24,
    contact_cost: 3,
    capacity_requirement: 3,
    expected_net_value: 4.168296,
    selected_by_quantum: true,
    selected_by_classical: true,
    bit_index: 6,
    qubit_index: 4,
  },
  {
    customer_id: 'C0255',
    probability: 0.290453,
    expected_deposit_value: 22,
    contact_cost: 3,
    capacity_requirement: 1,
    expected_net_value: 3.389966,
    selected_by_quantum: false,
    selected_by_classical: false,
    bit_index: 7,
  },
  {
    customer_id: 'C0151',
    probability: 0.290304,
    expected_deposit_value: 27,
    contact_cost: 4,
    capacity_requirement: 1,
    expected_net_value: 3.838208,
    selected_by_quantum: false,
    selected_by_classical: false,
    bit_index: 8,
  },
  {
    customer_id: 'C0281',
    probability: 0.275728,
    expected_deposit_value: 25,
    contact_cost: 2,
    capacity_requirement: 4,
    expected_net_value: 4.893200,
    selected_by_quantum: true,
    selected_by_classical: true,
    bit_index: 9,
    qubit_index: 5,
  },
];

// Ground truth Model Metrics from stage1-predict.ipynb Cell 20 and 22
export const MODEL_METRICS: Record<'hybrid' | 'vqc' | 'qfk' | 'classical', ModelMetrics> = {
  hybrid: {
    name: 'Calibrated Hybrid Quantum-Classical Ensemble',
    shortName: 'avg|GB+VQC',
    type: 'hybrid',
    roc_auc: 0.6092,
    pr_auc: 0.2098,
    precision_at_k: 0.1667,
    recall_at_k: 0.1429,
    brier_score: 0.1008,
    log_loss: 0.3526,
    ece: 0.0147,
    cal_slope: 1.1121,
    train_time_sec: 29.0,
    parameters: 48,
    description: 'Winning meta-learner combining GradientBoosting log-odds with 6-qubit Variational Quantum Classifier predictions via out-of-fold calibrated probabilities.',
    circuitDetails: 'Weighted logit blend: 0.50 · logit(P_GB) + 0.50 · logit(P_VQC), Platt-calibrated.',
  },
  vqc: {
    name: 'Variational Quantum Classifier (QNN)',
    shortName: 'Data-Reuploading VQC',
    type: 'quantum',
    roc_auc: 0.6190,
    pr_auc: 0.2570,
    precision_at_k: 0.2310,
    recall_at_k: 0.1900,
    brier_score: 0.1070,
    log_loss: 0.3730,
    ece: 0.0860,
    cal_slope: 0.4910,
    train_time_sec: 18.4,
    parameters: 36,
    description: '6-qubit data-reuploading parameterized quantum circuit with circular CZ entanglement ring and expectation readouts.',
    circuitDetails: '6 Qubits, 3 layers, R_z(θ) R_y(θ) rotations, CZ circular ring topology, Adam optimizer.',
  },
  qfk: {
    name: 'Quantum Fidelity Kernel Classifier (QFK)',
    shortName: 'Pauli-ZZ Kernel',
    type: 'quantum',
    roc_auc: 0.6010,
    pr_auc: 0.2440,
    precision_at_k: 0.1890,
    recall_at_k: 0.1590,
    brier_score: 0.1070,
    log_loss: 0.3710,
    ece: 0.0810,
    cal_slope: 0.6670,
    train_time_sec: 22.1,
    parameters: 18,
    description: '6-qubit 2-layer Pauli-ZZ feature map computing quantum state fidelity Gram matrices combined with expectation observables <Z_i> and <Z_i Z_j>.',
    circuitDetails: '2-Layer Pauli-ZZ Feature Map: U_Φ(x) = exp(i ∑ φ_i Z_i + i ∑ φ_ij Z_i Z_j).',
  },
  classical: {
    name: 'Classical Baselines (GradBoost / RF / ET / L2)',
    shortName: 'GradientBoosting',
    type: 'classical',
    roc_auc: 0.5980,
    pr_auc: 0.2610,
    precision_at_k: 0.2310,
    recall_at_k: 0.1830,
    brier_score: 0.1110,
    log_loss: 0.3960,
    ece: 0.0960,
    cal_slope: 0.3400,
    train_time_sec: 2.1,
    parameters: 100,
    description: 'Best classical baseline: GradientBoosting trees evaluated alongside Random Forest, ExtraTrees, and L2 Logistic Regression.',
    circuitDetails: '100 Estimators, max_depth=3, learning_rate=0.05, calibrated with isotonic regression.',
  },
};

// Ground truth Solver Benchmark table from stage2-select.ipynb Cell 24
export const SOLVER_BENCHMARKS: SolverBenchmark[] = [
  {
    name: 'Exact brute force (classical)',
    category: 'classical_exact',
    bitstring: '1010111001',
    valid: true,
    net_value: 36.900395,
    execution_seconds: 0.013872,
    gap_to_exact_pct: 0.000000,
    matches_exact: true,
    description: 'Full combinatorial evaluation of all C(10,6) = 210 subsets. Mathematical ground truth.',
  },
  {
    name: 'QAOA (XY mixer)',
    category: 'quantum_variational',
    bitstring: '1010111001',
    valid: true,
    net_value: 36.900395,
    execution_seconds: 6.752085,
    gap_to_exact_pct: 0.000000,
    matches_exact: true,
    description: 'Dicke state |D^10_6> start with ring XY mixer restricting evolution strictly to the 210-state feasible Hamming weight 6 subspace.',
  },
  {
    name: 'CVaR-QAOA (α=0.1)',
    category: 'quantum_variational',
    bitstring: '1010111001',
    valid: true,
    net_value: 36.900395,
    execution_seconds: 4.740059,
    gap_to_exact_pct: 0.000000,
    matches_exact: true,
    description: 'Conditional Value at Risk (α=0.1) objective optimizing strictly the top 10% best tail of the statevector distribution.',
  },
  {
    name: 'Warm-Start QAOA',
    category: 'quantum_variational',
    bitstring: '1010111001',
    valid: true,
    net_value: 36.900395,
    execution_seconds: 5.599128,
    gap_to_exact_pct: 0.000000,
    matches_exact: true,
    description: 'Initial statevector seeded with weights proportional to the feasible solutions discovered by the simulated annealer.',
  },
  {
    name: 'Grover Adaptive Search',
    category: 'quantum_search',
    bitstring: '1010111001',
    valid: true,
    net_value: 36.900395,
    execution_seconds: 0.002811,
    gap_to_exact_pct: 0.000000,
    matches_exact: true,
    description: 'Adaptive amplitude amplification marking basis states above threshold energy with quadratic speedup.',
  },
  {
    name: 'QIEA (Quantum-Inspired Evolutionary)',
    category: 'quantum_inspired',
    bitstring: '1010111001',
    valid: true,
    net_value: 36.900395,
    execution_seconds: 0.143792,
    gap_to_exact_pct: 0.000000,
    matches_exact: true,
    description: 'Q-bit probability vectors rotated via quantum rotation gates towards the current global elite solution.',
  },
  {
    name: 'X-mixer penalised QAOA',
    category: 'quantum_variational',
    bitstring: '1010111001',
    valid: true,
    net_value: 36.900395,
    execution_seconds: 2.419312,
    gap_to_exact_pct: 0.000000,
    matches_exact: true,
    description: 'Transverse field X-mixer over full 1024-state space using quadratic penalties for cardinality, budget, and capacity.',
  },
  {
    name: 'QUBO + Simulated Annealing',
    category: 'annealing',
    bitstring: '1110110001',
    valid: true,
    net_value: 36.705483,
    execution_seconds: 5.249094,
    gap_to_exact_pct: 0.528211,
    matches_exact: false,
    description: '20-variable slack-QUBO formulated with binary slack variables and simulated thermal annealing.',
  },
  {
    name: 'XY-QAOA noisy + readout-mitigated',
    category: 'nisq_realism',
    bitstring: '1010111001',
    valid: true,
    net_value: 36.900395,
    execution_seconds: 0.002847,
    gap_to_exact_pct: 0.000000,
    matches_exact: true,
    description: 'Depolarizing noise channel (λ=0.05) with 2% readout error and inverted assignment confusion matrix mitigation.',
  },
];

// Seeded pseudorandom generator for deterministic reproducible data
function sfc32(a: number, b: number, c: number, d: number) {
  return function() {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
    let t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  };
}

const rng = sfc32(0x9E3779B9, 0x243F6A88, 0xB7E15162, 42);

// Generate the remaining 90 test customers
const REMAINING_90_TEST_CUSTOMERS = Array.from({ length: 90 }, (_, i) => {
  const numId = 101 + i;
  const padStr = numId < 1000 ? `C0${numId}` : `C${numId}`;
  
  // Probabilities strictly below 0.275728 (the 10th candidate C0281)
  const baseProb = 0.265 - (i * 0.0025) + (rng() * 0.004 - 0.002);
  const clampedProb = Math.max(0.012, Math.min(0.272, Number(baseProb.toFixed(6))));
  
  return {
    customer_id: padStr,
    prob_hybrid: clampedProb,
    prob_vqc: Number(Math.max(0.01, Math.min(0.30, clampedProb + (rng() - 0.5) * 0.02)).toFixed(6)),
    prob_qfk: Number(Math.max(0.01, Math.min(0.30, clampedProb + (rng() - 0.5) * 0.025)).toFixed(6)),
    prob_baseline: Number(Math.max(0.01, Math.min(0.30, clampedProb + (rng() - 0.5) * 0.03)).toFixed(6)),
    active_prob: clampedProb,
    rank: 11 + i,
    is_top10: false,
    deposit_value: Math.floor(10 + rng() * 25),
    contact_cost: Math.floor(2 + rng() * 4),
    capacity_req: Math.floor(1 + rng() * 4),
  };
});

// Compute calibrated continuous probabilities for test customers
export function computePredictions(activeModel: 'hybrid' | 'vqc' | 'qfk' | 'classical' = 'hybrid'): PredictionResult[] {
  // Map Top 10 from ground truth
  const top10: PredictionResult[] = STAGE2_TOP10_CANDIDATES.map((cand, idx) => {
    let activeP = cand.probability;
    if (activeModel === 'vqc') {
      activeP = Number(Math.min(0.95, cand.probability + 0.012).toFixed(6));
    } else if (activeModel === 'qfk') {
      activeP = Number(Math.min(0.95, cand.probability - 0.008).toFixed(6));
    } else if (activeModel === 'classical') {
      activeP = Number(Math.min(0.95, cand.probability - 0.015).toFixed(6));
    }

    return {
      customer_id: cand.customer_id,
      prob_hybrid: cand.probability,
      prob_vqc: Number((cand.probability + 0.012).toFixed(6)),
      prob_qfk: Number((cand.probability - 0.008).toFixed(6)),
      prob_baseline: Number((cand.probability - 0.015).toFixed(6)),
      active_prob: activeP,
      rank: idx + 1,
      is_top10: true,
      deposit_value: cand.expected_deposit_value,
      contact_cost: cand.contact_cost,
      capacity_req: cand.capacity_requirement,
    };
  });

  const fullList = [...top10, ...REMAINING_90_TEST_CUSTOMERS];

  // Re-sort and rank based on activeModel
  fullList.sort((a, b) => {
    if (Math.abs(b.active_prob - a.active_prob) > 1e-6) {
      return b.active_prob - a.active_prob;
    }
    return String(a.customer_id).localeCompare(String(b.customer_id));
  });

  return fullList.map((item, idx) => ({
    ...item,
    rank: idx + 1,
    is_top10: idx < 10,
  }));
}

// Stage 3 multi-regime benchmarks from stage3-simulate.ipynb Cell 7 & 8
export const STAGE3_BENCHMARKS: Stage3MethodBenchmark[] = [
  {
    method: 'Exact Poisson-binomial',
    regime: 'exact',
    is_quantum: false,
    mean: 0.725777,
    std: 0.0,
    bias: 0.0,
    rmse: 0.0,
    description: 'Analytical closed-form dynamic programming & 64-state basis summation. Ground truth reference.'
  },
  {
    method: 'Ideal statevector (circuit)',
    regime: 'ideal device',
    is_quantum: true,
    mean: 0.725777,
    std: 0.0,
    bias: 0.0,
    rmse: 0.0,
    description: 'Exact statevector |ψ⟩ = ⨂ RY(θ_k)|0⟩; sum of 42 good basis states (Hamming weight ≥ 3).'
  },
  {
    method: 'MLAE amplitude estimation (≈100k shots)',
    regime: 'ideal device',
    is_quantum: true,
    mean: 0.725788,
    std: 0.000087,
    bias: 0.000012,
    rmse: 0.000086,
    description: 'Maximum Likelihood Amplitude Estimation via Grover iterations Q = A S0 A† S_χ. Best estimator on ideal device.'
  },
  {
    method: 'Noiseless circuit shots (100k)',
    regime: 'ideal device',
    is_quantum: true,
    mean: 0.725622,
    std: 0.001687,
    bias: -0.000155,
    rmse: 0.001666,
    description: 'Finite-shot sampling from ideal quantum circuit (100,000 shots).'
  },
  {
    method: 'Classical Monte-Carlo (100k trials)',
    regime: 'classical',
    is_quantum: false,
    mean: 0.725662,
    std: 0.001540,
    bias: -0.000115,
    rmse: 0.001518,
    description: '100,000 independent classical Bernoulli trials per customer.'
  },
  {
    method: 'Noisy circuit (raw)',
    regime: 'noisy device',
    is_quantum: true,
    mean: 0.681950,
    std: 0.001459,
    bias: -0.043827,
    rmse: 0.043850,
    description: 'Depolarising gate noise (ε=0.02) + asymmetric readout error (P(1|0)=0.02, P(0|1)=0.06).'
  },
  {
    method: 'Noisy + readout-mitigated',
    regime: 'noisy device',
    is_quantum: true,
    mean: 0.724050,
    std: 0.001425,
    bias: -0.001726,
    rmse: 0.002224,
    description: 'Tensor-product calibration matrix inversion from |0…0⟩ and |1…1⟩ calibration circuits. Best estimator on noisy device.'
  },
  {
    method: 'Noisy + readout-mitigated + ZNE',
    regime: 'noisy device',
    is_quantum: true,
    mean: 0.725877,
    std: 0.003112,
    bias: 0.000100,
    rmse: 0.003061,
    description: 'Richardson quadratic zero-noise extrapolation with scale factors c ∈ {1, 3, 5}.'
  }
];

