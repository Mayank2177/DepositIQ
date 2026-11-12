export interface CustomerFeature {
  customer_id: string | number;
  age: number;
  job: string;
  marital: string;
  education: string;
  default: boolean;
  balance: number;
  housing: boolean;
  loan: boolean;
  contact: string;
  day: number;
  month: string;
  duration: number;
  campaign: number;
  pdays: number;
  previous: number;
  poutcome: string;
  y?: number; // Ground truth if training set
}

export interface PredictionResult {
  customer_id: string | number;
  prob_hybrid: number;
  prob_vqc: number;
  prob_qfk: number;
  prob_baseline: number;
  active_prob: number;
  rank: number;
  is_top10: boolean;
  deposit_value: number;
  contact_cost: number;
  capacity_req: number;
}

export interface ModelMetrics {
  name: string;
  shortName: string;
  type: 'hybrid' | 'quantum' | 'classical';
  roc_auc: number;
  pr_auc: number;
  precision_at_k: number;
  recall_at_k: number;
  brier_score: number;
  log_loss: number;
  ece: number;
  cal_slope: number;
  train_time_sec: number;
  parameters: number;
  description: string;
  circuitDetails?: string;
}

export interface CandidateCustomer {
  customer_id: string | number;
  probability: number;
  expected_deposit_value: number;
  contact_cost: number;
  capacity_requirement: number;
  expected_net_value: number;
  selected_by_quantum: boolean;
  selected_by_classical: boolean;
  bit_index?: number;
  qubit_index?: number;
}

export interface Stage2Constraints {
  candidate_pool_size: number; // 10
  exact_select_count: number;  // 6
  budget_limit: number;        // 25
  capacity_limit: number;      // 22
}

export interface SolverBenchmark {
  name: string;
  category: 'classical_exact' | 'quantum_variational' | 'quantum_search' | 'quantum_inspired' | 'annealing' | 'nisq_realism';
  bitstring: string;
  valid: boolean;
  net_value: number;
  execution_seconds: number;
  gap_to_exact_pct: number;
  matches_exact: boolean;
  description: string;
}

export interface QaoaParameters {
  layers: number;
  gamma: number[];
  beta: number[];
  shots: number;
  penalty_cardinality: number;
  penalty_budget: number;
  penalty_capacity: number;
}

export interface Stage3MethodBenchmark {
  method: string;
  regime: 'exact' | 'ideal device' | 'classical' | 'noisy device';
  is_quantum: boolean;
  mean: number;
  std: number;
  bias: number;
  rmse: number;
  description: string;
}

export interface SimulationResult {
  shots: number;
  quantum_prob_ge3: number;
  exact_prob_ge3: number;
  monte_carlo_prob_ge3: number;
  quantum_error: number;
  monte_carlo_error: number;
  counts: Record<string, number>;
  success_counts: number;
  total_counts: number;
  logical_qubits: number;
  physical_qubits: number;
  circuit_depth: number;
  cnot_count: number;
  single_qubit_count: number;
}
