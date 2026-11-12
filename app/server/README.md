# DepositIQ Modular Backend Architecture

This backend serves the DepositIQ frontend and provides direct REST endpoints corresponding to the three pipeline stages:

- **Stage 1 (`/api/stage1/*`)**: Quantum Fidelity Kernel Classifier (QFK), Variational Quantum Classifier (VQC), Classical Baselines, and Calibrated Hybrid Out-of-Fold Log-Odds Ensemble.
- **Stage 2 (`/api/stage2/*`)**: Constrained Optimization Engine comparing Exact Brute Force, XY-mixer QAOA, CVaR-QAOA, Warm-Start QAOA, Grover Adaptive Search, QIEA, X-mixer QAOA, and QUBO with Simulated Annealing.
- **Stage 3 (`/api/stage3/*`)**: Modular execution slot ready for `stage3-simulate.ipynb` to evaluate 6-qubit campaign outcome simulation ($P(K \ge 3)$).

## Quickstart

```bash
cd server
pip install -r requirements.txt
python main.py
```

The Swagger interactive documentation is served at `http://localhost:8000/docs`.

