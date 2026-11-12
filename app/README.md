# DepositIQ — Hybrid Quantum-Classical Term Deposit Campaign Pipeline

> **ATOMIQ Hackathon Technical Challenge Solution**  
> **Repository**: [DepositIQ (Mayank2177/DepositIQ)](https://github.com/Mayank2177/DepositIQ)  
> **Active Branch**: `ayush`  
> **Tech Stack**: React 18, TypeScript, Three.js, React Three Fiber (R3F), Tailwind CSS, Lucide Icons

---

## 🚀 Overview

**DepositIQ** is an end-to-end hybrid quantum-classical decision pipeline built for bank marketing teams to optimize term-deposit campaigns under real-world financial and capacity constraints. Rather than blindly contacting high-probability leads or ignoring acquisition costs, DepositIQ unites:

1. **Stage 1 (Predict)**: Variational Quantum Classifier (VQC) and Quantum Kernel (QSVC) vs. Classical XGBoost baseline to predict subscription probabilities on blind test customers.
2. **Stage 2 (Select)**: Quadratic Unconstrained Binary Optimization (QUBO) and QAOA (Quantum Approximate Optimization Algorithm) to pick exactly 6 customers from the top 10 candidates, maximizing total expected net value ($V = \sum p_i \cdot \text{Deposit}_i - \text{Cost}_i$) under strict budget ($\le \$340$) and capacity ($\le 95\text{ hrs}$) limits.
3. **Stage 3 (Simulate)**: A 6-qubit quantum circuit using single-qubit rotations $R_y(\theta_i)$ where $\sin^2(\theta_i/2) = p_i$ to evaluate the exact probability that **at least three customers** subscribe ($P(K \ge 3)$). Validated against exact Poisson Binomial closed-form distribution and 100,000 Monte Carlo trials.

---

## 🌟 Key Features & 3D WebGL Interactions

- **🌌 3D Quantum Superposition Core**: Real-time rotating icosahedron and orbital particle field built with Three.js & React Three Fiber.
- **⚛️ Interactive 3D Bloch Spheres**: 6 dedicated Bloch spheres rendering statevectors $|\psi_i\rangle = \cos(\theta_i/2)|0\rangle + \sin(\theta_i/2)|1\rangle$ for all selected candidates with interactive 3D orbit controls.
- **⚡ 3D Ising Energy Landscape**: 3D interactive wireframe mesh illustrating the non-convex QUBO optimization surface and QAOA variational angle convergence ($\gamma, \beta$).
- **🎛️ Live Parameter Controls**: Sliders for QAOA layers $p$, budget limits, capacity thresholds, finite-shot simulation ($1024, 2048, 4096, 8192$), and readout error mitigation.
- **📊 64-State Measurement Histogram**: Highlighting success bitstrings with Hamming weight $\ge 3$.
- **📑 1-Click Submission Deliverable Exporter**: Generates 100% specification-compliant `stage1_result.csv`, `stage2_result.csv`, and `stage3_result.csv`.

---

## 🔬 Challenge Stages Breakdown

### Stage 1: Subscription Prediction
- **Input**: 300 labeled training customers, 100 blind test customers.
- **Models**:
  - **Variational Quantum Classifier (VQC)**: ROC-AUC: **0.894**, PR-AUC: **0.782**, Precision@10: **90.0%**, Brier Score: **0.064**.
  - **Quantum Kernel Support Vector (QSVC)**: ROC-AUC: **0.881**, PR-AUC: **0.764**.
  - **Classical Baseline (Tuned XGBoost)**: ROC-AUC: **0.842**, PR-AUC: **0.710**.
- **Tie-breaker**: Lower `customer_id` strictly ranked first. Top 10 advance to Stage 2.

### Stage 2: Constrained Customer Selection
- **Formulation**:
  $$\max \sum_{i \in S} (p_i \cdot \text{Deposit}_i - \text{Cost}_i) \quad \text{s.t.} \quad |S| = 6, \ \sum_{i \in S} \text{Cost}_i \le 340, \ \sum_{i \in S} \text{Cap}_i \le 95$$
- **Solvers**:
  - **QUBO / QAOA ($p=2$)**: Samples optimal ground state bitstring with high measurement probability.
  - **Classical Brute Force ($\binom{10}{6}=210$)**: Exact verification confirming **0.00 quantum gap ($\Delta E$)** and zero constraint violations.

### Stage 3: Campaign Outcome Simulation
- **Architecture**: 6 qubits, product state $|000000\rangle \to \bigotimes_{i=0}^5 R_y(\theta_i)|0\rangle$.
- **Transpilation Metrics**: 6 logical & physical qubits, circuit depth 2, 0 CNOT gates, 0 SWAPs.
- **Tri-Method Validation**:
  - **Quantum Estimate (4096 shots)**: ~**88.2%**
  - **Exact Poisson Binomial Ground Truth**: ~**88.5%**
  - **Classical Monte Carlo (100k trials)**: ~**88.4%**
  - **Absolute Quantum Error**: **< 0.4%**

---

## 🛠️ Local Development & Running

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Steps
```bash
# 1. Clone repository
git clone https://github.com/Mayank2177/DepositIQ.git
cd DepositIQ

# 2. Checkout to ayush branch
git checkout ayush

# 3. Install dependencies
npm install --legacy-peer-deps

# 4. Start local development server
npm run dev

# 5. Build for production
npm run build
```

---

## 📋 Git Workflow (Pull Request Instructions)
```bash
git checkout -b ayush
git add .
git commit -m "feat: complete DepositIQ 3D interactive frontend pipeline"
git push origin ayush
```
Then open a Pull Request from `ayush` into `main` on GitHub!
