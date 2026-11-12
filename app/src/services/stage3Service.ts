import { SimulationResult, Stage3MethodBenchmark } from '../types';
import { simulateQuantumCircuit, calculateExactPoissonBinomial, calculateRyAngle } from '../utils/quantumMath';
import { STAGE3_BENCHMARKS } from '../data/dataset';

export interface Stage3SimulationRequest {
  customer_ids: (string | number)[];
  probabilities: number[];
  shots?: number;
  noise_enabled?: boolean;
  mitigation_enabled?: boolean;
  depolarizing_rate?: number;
  readout_error?: number;
}

export interface BlochCoordinate {
  qubit_index: number;
  customer_id: string | number;
  probability: number;
  theta_radians: number;
  theta_degrees: number;
  bloch_x: number;
  bloch_y: number;
  bloch_z: number;
}

export interface Stage3SimulationResponse {
  result: SimulationResult;
  bloch_vectors: BlochCoordinate[];
  exact_poisson_binomial: {
    prob_ge3: number;
    distribution: number[];
  };
  circuit_metadata: {
    qubit_count: number;
    depth: number;
    gate_types: string[];
    basis_gates: string[];
  };
  method_benchmarks: Stage3MethodBenchmark[];
}

class Stage3Service {
  /**
   * Retrieves benchmarks comparing all 6 simulation regimes from stage3-simulate.ipynb
   */
  getBenchmarks(): Stage3MethodBenchmark[] {
    return STAGE3_BENCHMARKS;
  }

  /**
   * Computes Bloch sphere rotation angles and (x, y, z) coordinates for candidate qubits
   */
  computeBlochVectors(customers: { customer_id: string | number; probability: number }[]): BlochCoordinate[] {
    return customers.map((c, idx) => {
      const angle = calculateRyAngle(c.probability);
      // State: cos(theta/2)|0> + sin(theta/2)|1>
      // Bloch vector: x = sin(theta), y = 0, z = cos(theta)
      const bloch_x = Math.sin(angle.radians);
      const bloch_y = 0;
      const bloch_z = Math.cos(angle.radians);

      return {
        qubit_index: idx,
        customer_id: c.customer_id,
        probability: c.probability,
        theta_radians: angle.radians,
        theta_degrees: angle.degrees,
        bloch_x: Number(bloch_x.toFixed(4)),
        bloch_y: bloch_y,
        bloch_z: Number(bloch_z.toFixed(4)),
      };
    });
  }

  /**
   * Executes quantum circuit simulation on 6 qubits with measurement sampling
   * (Modular slot: Backed by exact Poisson-binomial, MLAE, and Aer-equivalent simulator)
   */
  async simulate(request: Stage3SimulationRequest): Promise<Stage3SimulationResponse> {
    const shots = request.shots || 4096;
    const addNoise = request.noise_enabled || false;

    const result = simulateQuantumCircuit(request.probabilities, shots, addNoise);
    const exact = calculateExactPoissonBinomial(request.probabilities);

    const bloch_vectors = this.computeBlochVectors(
      request.customer_ids.map((id, idx) => ({
        customer_id: id,
        probability: request.probabilities[idx],
      }))
    );

    return {
      result,
      bloch_vectors,
      exact_poisson_binomial: {
        prob_ge3: exact.prob_ge3,
        distribution: exact.probDistribution,
      },
      circuit_metadata: {
        qubit_count: 6,
        depth: 2,
        gate_types: ['Ry', 'Measure'],
        basis_gates: ['rz', 'sx', 'x', 'cx'],
      },
      method_benchmarks: STAGE3_BENCHMARKS,
    };
  }
}

export const stage3Service = new Stage3Service();
