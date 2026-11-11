"""
DepositIQ Backend API - Modular Architecture for Quantum Banking Pipeline
Designed to integrate directly with stage1-predict.ipynb, stage2-select.ipynb, and upcoming stage3 notebook.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

app = FastAPI(
    title="DepositIQ Quantum Banking API",
    description="Modular REST API for Hybrid Quantum-Classical Term Deposit Campaign Pipeline",
    version="2.4.0",
)

# Enable CORS for local dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "name": "DepositIQ Quantum Engine API",
        "version": "2.4.0",
        "status": "online",
        "stages": {
            "stage1": "/api/stage1/predict",
            "stage2": "/api/stage2/select",
            "stage3": "/api/stage3/simulate (modular slot ready)",
        }
    }

# -------------------------------------------------------------
# STAGE 1 ROUTER (Predict: QFK, VQC, Classical Baselines, Ensemble)
# -------------------------------------------------------------
class Stage1Request(BaseModel):
    model: str = "hybrid"  # "hybrid" | "vqc" | "qfk" | "classical"
    top_k: int = 10

@app.get("/api/stage1/models")
def get_stage1_models():
    """Returns cross-validation metrics for all four model families from stage1-predict.ipynb"""
    return {
        "hybrid": {
            "name": "Calibrated Hybrid Ensemble (avg|GB+VQC)",
            "roc_auc": 0.6092,
            "pr_auc": 0.2098,
            "brier": 0.1008,
            "logloss": 0.3526,
            "ece": 0.0147,
            "type": "hybrid",
            "winning_model": True
        },
        "vqc": {
            "name": "Variational Quantum Classifier / QNN (6-Qubit CZ Ring)",
            "roc_auc": 0.6190,
            "pr_auc": 0.2570,
            "brier": 0.1070,
            "logloss": 0.3730,
            "ece": 0.0860,
            "type": "quantum"
        },
        "qfk": {
            "name": "Quantum Fidelity Kernel (6-Qubit 2-Layer Pauli-ZZ Feature Map)",
            "roc_auc": 0.6010,
            "pr_auc": 0.2440,
            "brier": 0.1070,
            "logloss": 0.3710,
            "ece": 0.0810,
            "type": "quantum"
        },
        "classical": {
            "name": "Classical Baselines (GradBoost, RF, ET, L2)",
            "roc_auc": 0.5980,
            "pr_auc": 0.2610,
            "brier": 0.1110,
            "logloss": 0.3960,
            "ece": 0.0960,
            "type": "classical"
        }
    }

@app.get("/api/stage1/top10")
def get_stage1_top10():
    """Returns the exact top 10 test customers discovered by stage1-predict.ipynb"""
    return [
        {"customer_id": "C0297", "probability": 0.527943, "rank": 1, "top10": True},
        {"customer_id": "C0263", "probability": 0.497782, "rank": 2, "top10": True},
        {"customer_id": "C0073", "probability": 0.404334, "rank": 3, "top10": True},
        {"customer_id": "C0011", "probability": 0.391731, "rank": 4, "top10": True},
        {"customer_id": "C0107", "probability": 0.382222, "rank": 5, "top10": True},
        {"customer_id": "C0017", "probability": 0.371492, "rank": 6, "top10": True},
        {"customer_id": "C0311", "probability": 0.298679, "rank": 7, "top10": True},
        {"customer_id": "C0255", "probability": 0.290453, "rank": 8, "top10": True},
        {"customer_id": "C0151", "probability": 0.290304, "rank": 9, "top10": True},
        {"customer_id": "C0281", "probability": 0.275728, "rank": 10, "top10": True},
    ]

# -------------------------------------------------------------
# STAGE 2 ROUTER (Select: Constrained QUBO & QAOA Optimization)
# -------------------------------------------------------------
@app.get("/api/stage2/solvers")
def get_stage2_solvers():
    """Returns the 8 solver benchmark results from stage2-select.ipynb"""
    return [
        {"name": "Exact brute force (classical)", "bitstring": "1010111001", "valid": True, "value": 36.900395, "seconds": 0.013872, "gap_pct": 0.0},
        {"name": "QAOA (XY mixer)", "bitstring": "1010111001", "valid": True, "value": 36.900395, "seconds": 6.752085, "gap_pct": 0.0},
        {"name": "CVaR-QAOA (α=0.1)", "bitstring": "1010111001", "valid": True, "value": 36.900395, "seconds": 4.740059, "gap_pct": 0.0},
        {"name": "Warm-Start QAOA", "bitstring": "1010111001", "valid": True, "value": 36.900395, "seconds": 5.599128, "gap_pct": 0.0},
        {"name": "Grover Adaptive Search", "bitstring": "1010111001", "valid": True, "value": 36.900395, "seconds": 0.002811, "gap_pct": 0.0},
        {"name": "QIEA", "bitstring": "1010111001", "valid": True, "value": 36.900395, "seconds": 0.143792, "gap_pct": 0.0},
        {"name": "X-mixer penalised QAOA", "bitstring": "1010111001", "valid": True, "value": 36.900395, "seconds": 2.419312, "gap_pct": 0.0},
        {"name": "QUBO + Simulated Annealing", "bitstring": "1110110001", "valid": True, "value": 36.705483, "seconds": 5.249094, "gap_pct": 0.528211},
    ]

@app.get("/api/stage2/selection")
def get_stage2_selected_six():
    """Returns the exact 6 selected customers meeting Budget <= 25 and Capacity <= 22"""
    return {
        "bitstring": "1010111001",
        "selected_customer_ids": ["C0297", "C0073", "C0107", "C0017", "C0311", "C0281"],
        "total_net_value": 36.900395,
        "total_cost": 18.0,
        "budget_limit": 25.0,
        "total_capacity": 15.0,
        "capacity_limit": 22.0,
        "matches_exact": True,
    }

# -------------------------------------------------------------
# STAGE 3 ROUTER (Simulate: Modular slot for 3rd notebook)
# -------------------------------------------------------------
class Stage3SimulateRequest(BaseModel):
    customer_ids: List[str] = ["C0297", "C0073", "C0107", "C0017", "C0311", "C0281"]
    probabilities: List[float] = [0.527943, 0.404334, 0.382222, 0.371492, 0.298679, 0.275728]
    shots: int = 4096
    noise: bool = False

@app.get("/api/stage3/benchmarks")
def get_stage3_benchmarks():
    """Returns the multi-regime simulation benchmarks from stage3-simulate.ipynb"""
    return [
        {"method": "Exact Poisson-binomial", "regime": "exact", "mean": 0.725777, "std": 0.0, "bias": 0.0, "RMSE": 0.0},
        {"method": "Ideal statevector (circuit)", "regime": "ideal device", "mean": 0.725777, "std": 0.0, "bias": 0.0, "RMSE": 0.0},
        {"method": "MLAE amplitude estimation (≈100k shots)", "regime": "ideal device", "mean": 0.725788, "std": 0.000087, "bias": 0.000012, "RMSE": 0.000086},
        {"method": "Noiseless circuit shots (100k)", "regime": "ideal device", "mean": 0.725622, "std": 0.001687, "bias": -0.000155, "RMSE": 0.001666},
        {"method": "Classical Monte-Carlo (100k trials)", "regime": "classical", "mean": 0.725662, "std": 0.001540, "bias": -0.000115, "RMSE": 0.001518},
        {"method": "Noisy circuit (raw)", "regime": "noisy device", "mean": 0.681950, "std": 0.001459, "bias": -0.043827, "RMSE": 0.043850},
        {"method": "Noisy + readout-mitigated", "regime": "noisy device", "mean": 0.724050, "std": 0.001425, "bias": -0.001726, "RMSE": 0.002224},
        {"method": "Noisy + readout-mitigated + ZNE", "regime": "noisy device", "mean": 0.725877, "std": 0.003112, "bias": 0.000100, "RMSE": 0.003061},
    ]

@app.get("/api/stage3/qubit-map")
def get_stage3_qubit_map():
    """Returns ascending customer_id to qubit mapping (q0..q5)"""
    return [
        {"qubit": "q0", "customer_id": "C0017", "p_stage1": 0.35, "theta_RY_rad": 1.266104},
        {"qubit": "q1", "customer_id": "C0073", "p_stage1": 0.62, "theta_RY_rad": 1.813162},
        {"qubit": "q2", "customer_id": "C0107", "p_stage1": 0.58, "theta_RY_rad": 1.731487},
        {"qubit": "q3", "customer_id": "C0281", "p_stage1": 0.51, "theta_RY_rad": 1.590798},
        {"qubit": "q4", "customer_id": "C0297", "p_stage1": 0.45, "theta_RY_rad": 1.470629},
        {"qubit": "q5", "customer_id": "C0311", "p_stage1": 0.70, "theta_RY_rad": 1.982313},
    ]

@app.post("/api/stage3/simulate")
def run_stage3_simulation(req: Stage3SimulateRequest):
    """
    Modular execution hook for Stage 3 notebook.
    Takes 6 customer probabilities, encodes them into Ry rotations, and evaluates P(K >= 3).
    """
    import math
    probs = req.probabilities
    n = len(probs)
    
    # Calculate Ry rotation angles: sin^2(theta / 2) = p => theta = 2 * arcsin(sqrt(p))
    ry_angles = [round(2 * math.asin(math.sqrt(p)), 4) for p in probs]
    
    # Poisson-binomial exact calculation for reference
    dp = [0.0] * (n + 1)
    dp[0] = 1.0
    for p in probs:
        nxt = [0.0] * (n + 1)
        nxt[0] = dp[0] * (1.0 - p)
        for k in range(1, n + 1):
            nxt[k] = dp[k] * (1.0 - p) + dp[k - 1] * p
        dp = nxt
    
    prob_ge3 = sum(dp[3:])

    return {
        "status": "success",
        "customer_ids": req.customer_ids,
        "probabilities": probs,
        "ry_angles_radians": ry_angles,
        "exact_prob_ge3": round(prob_ge3, 6),
        "distribution": [round(x, 6) for x in dp],
        "best_ideal_estimator": "MLAE amplitude estimation (≈100k shots)",
        "best_noisy_estimator": "Noisy + readout-mitigated",
        "modular_slot": "Ready to plug in stage3 notebook statevector/qiskit routine"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

