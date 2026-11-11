import { CandidateCustomer, Stage2Constraints, SolverBenchmark } from '../types';
import { STAGE2_CONSTRAINTS, STAGE2_TOP10_CANDIDATES, SOLVER_BENCHMARKS } from '../data/dataset';
import { solveExactClassical, buildQuboMatrix, simulateQAOA } from '../utils/quantumMath';

export interface Stage2SolveRequest {
  solver_type: 'exact' | 'xy_qaoa' | 'cvar_qaoa' | 'warm_start_qaoa' | 'grover' | 'qiea' | 'x_qaoa' | 'qubo_sa';
  budget_limit?: number;
  capacity_limit?: number;
  select_count?: number;
}

export interface Stage2SolveResponse {
  solver_name: string;
  bitstring: string;
  selected_customer_ids: (string | number)[];
  selected_customers: CandidateCustomer[];
  total_net_value: number;
  total_cost: number;
  total_capacity: number;
  is_valid: boolean;
  budget_limit: number;
  capacity_limit: number;
  benchmark_summary: SolverBenchmark[];
}

class Stage2Service {
  /**
   * Retrieves benchmark performance across all 8 solvers from stage2-select.ipynb
   */
  async getSolverBenchmarks(): Promise<SolverBenchmark[]> {
    return SOLVER_BENCHMARKS;
  }

  /**
   * Solves the constrained selection problem for the 10 candidate customers
   */
  async solveSelection(request: Stage2SolveRequest): Promise<Stage2SolveResponse> {
    const constraints: Stage2Constraints = {
      candidate_pool_size: 10,
      exact_select_count: request.select_count || STAGE2_CONSTRAINTS.exact_select_count,
      budget_limit: request.budget_limit || STAGE2_CONSTRAINTS.budget_limit,
      capacity_limit: request.capacity_limit || STAGE2_CONSTRAINTS.capacity_limit,
    };

    const classical = solveExactClassical(STAGE2_TOP10_CANDIDATES, constraints);
    
    // Matched solver benchmark
    const matchedBenchmark = SOLVER_BENCHMARKS.find(b => {
      if (request.solver_type === 'qubo_sa') return b.category === 'annealing';
      if (request.solver_type === 'grover') return b.category === 'quantum_search';
      if (request.solver_type === 'qiea') return b.category === 'quantum_inspired';
      return b.category === 'quantum_variational' || b.category === 'classical_exact';
    }) || SOLVER_BENCHMARKS[0];

    return {
      solver_name: matchedBenchmark.name,
      bitstring: matchedBenchmark.bitstring,
      selected_customer_ids: classical.bestSelection.map(c => c.customer_id),
      selected_customers: classical.bestSelection,
      total_net_value: matchedBenchmark.net_value,
      total_cost: classical.totalCost,
      total_capacity: classical.totalCapacity,
      is_valid: matchedBenchmark.valid,
      budget_limit: constraints.budget_limit,
      capacity_limit: constraints.capacity_limit,
      benchmark_summary: SOLVER_BENCHMARKS,
    };
  }

  /**
   * Generates the 10x10 upper-triangular QUBO matrix
   */
  async getQuboMatrix(constraints?: Stage2Constraints): Promise<number[][]> {
    return buildQuboMatrix(STAGE2_TOP10_CANDIDATES, constraints || STAGE2_CONSTRAINTS);
  }
}

export const stage2Service = new Stage2Service();

