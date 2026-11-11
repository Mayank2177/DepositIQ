# DepositIQ

## Executive summary

This project explores a three-stage decision workflow for a bank term-deposit campaign:

1. **Predict** customer subscription propensity.
2. **Select** exactly six customers from a ranked shortlist to maximise expected net value under contact-budget and staff-capacity limits.
3. **Estimate** the probability that at least three of those six customers subscribe.

The notebooks combine classical machine learning, simulated quantum classifiers, quantum-style/quantum-inspired optimisation, exact classical optimisation, and circuit-level probability simulation. They demonstrate a research prototype—not physical-quantum execution, quantum advantage, causal campaign uplift, or production-ready predictive performance.


---

## 1. Approach

### Stage 1 — Customer subscription propensity

**Objective:** rank customers by estimated probability of subscribing to a term deposit.

**Dataset in the notebook**
- 300 labelled training rows and 15 input fields: age, job, marital status, education, default, balance, housing, loan, contact, day, month, campaign, pdays, previous and poutcome.
- 35 positive labels (11.7%), so the target is imbalanced.
- No missing training cells were reported.

**Feature preparation:** the notebook engineers 42 model features, including signed/log transformations for balance and campaign-count variables, negative-balance and previous-contact indicators, education encoding, binary indicators, a loan-count feature, and one-hot encoded categorical variables. Preprocessing is refitted inside validation folds.

**Model candidates**
- Quantum-model candidates: Quantum Fidelity Kernel (QFK) and Variational Quantum Classifier (VQC), using simulated statevector calculations.
- Classical candidates: L2 logistic regression, Extra Trees, Random Forest and Gradient Boosting.
- Hybrid search: 45 member subsets × 2 meta-learning approaches = 90 hybrid ensembles.

The selected model is **`avg|GB+VQC`**, an averaging-based hybrid combining Gradient Boosting and VQC.

**Validation design:** repeated stratified 5-fold, stratified 100-row Monte Carlo holdouts, month-grouped 5-fold stress testing, and stratified 10-fold validation. Each fold refits preprocessing and model/ensemble components using that fold's training partition. The notebook warns about multiple-comparison risk when selecting among 90 ensembles.

### Stage 2 — Constrained contact selection

**Objective:** choose exactly six customers from the Stage 1 top-ten shortlist to maximise total expected net value.

For each candidate customer `i`, binary variable `x_i` indicates selection:

`Maximise Σ x_i × (predicted subscription probability_i × expected deposit value_i − contact cost_i)`

Subject to:
- `Σ x_i = 6` — select exactly six customers.
- `Σ contact_cost_i × x_i ≤ 25` — campaign budget.
- `Σ capacity_i × x_i ≤ 22` — staff/contact capacity.

**Solvers compared:** exact enumeration of all `C(10,6) = 210` portfolios; QUBO with slack bits and simulated annealing; XY-mixer QAOA, CVaR-QAOA and warm-start QAOA; Grover Adaptive Search; quantum-inspired evolutionary algorithm (QIEA); finite-shot/noisy/readout-mitigated XY-QAOA; and penalised transverse-field X-mixer QAOA.

The XY mixer preserves Hamming weight six in its feasible subspace. The QUBO formulation has 20 binary variables: 10 customer decisions plus 5 budget-slack and 5 capacity-slack variables. **These 20 QUBO variables are not 20 quantum circuit qubits.** The QAOA/Grover decision formulation uses 10 logical decision qubits.

Every candidate is checked for six unique IDs, membership in the top ten, budget and capacity feasibility.

### Stage 3 — Probability of at least three subscriptions

The notebook assigns one logical qubit to each selected customer. For customer probability `p_k`, it applies `RY(θ_k)|0⟩`, where `θ_k = 2 asin(sqrt(p_k))`; measuring 1 therefore has probability `p_k`. A measured 1 represents a subscription. Success means at least three 1s among six qubits (42 of 64 basis states).

The notebook compares exact Poisson-binomial dynamic programming, exact enumeration of all 64 basis states, ideal statevector simulation, finite-shot circuit simulation, classical Monte Carlo, simulated gate/readout noise, readout-calibration mitigation, Richardson zero-noise extrapolation (ZNE), and maximum-likelihood amplitude estimation (MLAE).

The six probabilities actually supplied to the saved Stage 3 notebook, in ascending customer-ID/qubit order, are:

| Qubit | Customer | Stage 3 input probability |
|---|---|---:|
| q0 | C0017 | 0.35 |
| q1 | C0073 | 0.62 |
| q2 | C0107 | 0.58 |
| q3 | C0281 | 0.51 |
| q4 | C0297 | 0.45 |
| q5 | C0311 | 0.70 |

These are the values used for the Stage 3 results below; see the integration caveat in Section 4.

---

## 2. Validation and results

### Stage 1 — Prediction

The selected `avg|GB+VQC` model's reported mean metrics across the notebook's validation schemes are:

| Metric | Reported result |
|---|---:|
| ROC-AUC | 0.618 |
| PR-AUC | 0.272 |
| Precision@10 | 0.228 |
| Recall@10 | 0.188 |
| Brier score | 0.105 |
| Log loss | 0.365 |
| ECE | 0.074 |
| Calibration slope | 2.839 |

For comparison, VQC was the strongest individual member by mean ROC-AUC (0.619), and Gradient Boosting was the strongest classical member (0.598). The selected hybrid's paired fold comparison against the all-six average ensemble was reported as ROC-AUC +0.0129, PR-AUC +0.0207, Brier score −0.0007 and log loss −0.0035. The notebook notes that folds share training rows, so paired standard errors are optimistic. The 90-way ensemble search also creates selection risk.

**Top-ten ranking printed by Stage 1**

| Rank | Customer | Predicted probability |
|---:|---|---:|
| 1 | C0297 | 0.527943 |
| 2 | C0263 | 0.497782 |
| 3 | C0073 | 0.404334 |
| 4 | C0011 | 0.391731 |
| 5 | C0107 | 0.382222 |
| 6 | C0017 | 0.371492 |
| 7 | C0311 | 0.298679 |
| 8 | C0255 | 0.290453 |
| 9 | C0151 | 0.290304 |
| 10 | C0281 | 0.275728 |

The final-model pooled out-of-fold diagnostic printed separately gives ROC-AUC 0.6092, PR-AUC 0.2098, Precision@30 0.1667 and Recall@30 0.1429. These pooled OOF figures are not the same aggregation as the mean-over-validation-schemes table; do not combine the two metric sets.

### Stage 2 — Optimisation and constraints

Exact enumeration checks all 210 possible six-customer portfolios. All 210 were feasible under the supplied budget and capacity limits, so those limits are verified but **not binding** in this particular candidate instance.

**Exact optimum**
- Decision bitstring: `1010111001` (positions correspond to top-ten ranks 1 through 10).
- Selected customers: **C0297, C0073, C0107, C0017, C0311, C0281**.
- Total net value: **36.900395** (the notebook does not specify the unit).
- Total contact cost: **18 / 25**.
- Total capacity: **15 / 22**.
- Selected count: **6 / 6**.

**Solver comparison**

| Solver | Feasible? | Net value | Gap to exact |
|---|---:|---:|---:|
| Exact brute force | Yes | 36.900395 | 0.000000% |
| QUBO + simulated annealing | Yes | 36.705483 | 0.528211% |
| QAOA (XY mixer) | Yes | 36.900395 | 0.000000% |
| CVaR-QAOA | Yes | 36.900395 | 0.000000% |
| Warm-start QAOA | Yes | 36.900395 | 0.000000% |
| Grover Adaptive Search | Yes | 36.900395 | 0.000000% |
| QIEA | Yes | 36.900395 | 0.000000% |
| XY-QAOA finite-shot | Yes | 36.900395 | 0.000000% |
| XY-QAOA noisy (raw top-3) | Yes | 36.900395 | 0.000000% |
| XY-QAOA noisy + readout-mitigated | Yes | 36.900395 | 0.000000% |
| X-mixer penalised QAOA | Yes | 36.900395 | 0.000000% |

The notebook's automatic final solver label is **X-mixer penalised QAOA**, and its selected bitstring matches the exact classical optimum. Several other solvers also recover the optimum in this run. This is an observed result for a small instance, not evidence that quantum-style solvers outperform exact enumeration.

The mixer diagnostic reports probability mass on valid weight-six strings of 1.000 for the XY mixer versus 0.573 for the penalised X-mixer, consistent with the XY mixer preserving cardinality by construction.

### Stage 3 — Probability estimation

For the six Stage 3 input probabilities listed above:
- Exact Poisson-binomial probability of at least three subscriptions: **0.7257765900**.
- Exact 64-state enumeration agrees with dynamic programming to within `1e-12`.
- Ideal statevector result agrees with the exact result to numerical precision.
- Best ideal-device estimator selected by the notebook: MLAE.
- Best noisy-device estimator selected by RMSE: noisy circuit with readout mitigation.

The comparison across 30 simulated repetitions reports:

| Estimator | Mean estimate | RMSE vs exact |
|---|---:|---:|
| Noiseless circuit shots (100k) | 0.725622 | 0.001666 |
| MLAE amplitude estimation (approx. 100k shots) | 0.725788 | 0.000086 |
| Classical Monte Carlo (100k trials) | 0.725662 | 0.001518 |
| Noisy circuit (raw) | 0.681950 | 0.043850 |
| Noisy + readout-mitigated | 0.724050 | 0.002224 |
| Noisy + readout-mitigated + ZNE | 0.725877 | 0.003061 |

The final reporting run prints an ideal MLAE estimate of **0.725910** (absolute error `1.330398e-4`) and a selected noisy-device estimate (readout-mitigated) of **0.724817** (absolute error `9.593015e-4`). Thus the final Stage 3 result is approximately **72.48%**, against an exact reference of **72.58%**, for the Stage 3 input probabilities. This is a simulation result, not a guaranteed campaign conversion rate.

---

## 3. Error analysis

### Stage 1: small sample, imbalance and model selection

Only 35 of 300 training examples are positive. This limits the stability of model comparisons, especially when 90 hybrid configurations are evaluated. ROC-AUC around 0.62 indicates modest ranking discrimination. PR-AUC and precision at the actual contact capacity are important because the positive class is only 11.7% of the sample.

The reported aggregate calibration slope is 2.839, so the probabilities should not yet be treated as reliable financial forecasts. Calibration must be reassessed on a larger, independent, later-period sample.

### Stage 1: test-set identity overlap

The notebook explicitly reports:
- 300 of 300 test customer IDs also occur in training.
- All 300 test rows are exact feature-copies of training rows.
- The test file contains a `y` column, which is dropped and not used for fitting or tuning.
- 100 IDs absent from training within the 1–400 ID range are identified as likely genuine test customers.
- The final prediction cell is designed to refuse to run until a clean test file is supplied.

The saved test file is therefore not a valid independent holdout. Do not claim test-set generalisation from it. The printed Stage 1 ranking does not resolve this data-integrity issue.

### Stage 2: constraints are not stressed

All 210 six-customer combinations satisfy budget and capacity. The current example verifies feasibility logic but does not test optimiser behaviour under resource scarcity. Tighten the limits or expand the candidate pool to create binding constraints. With only 210 combinations, exact enumeration is cheap and definitive; matching it is a correctness cross-check, not a demonstrated quantum speed or quality advantage.

### Stage 3: noise and mitigation

The raw simulated noisy estimator is negatively biased: mean 0.681950 versus exact 0.725777, with RMSE 0.043850. Readout mitigation reduces RMSE to 0.002224. Adding ZNE gives a mean close to exact, but its RMSE (0.003061) is higher than readout mitigation alone in this run. The notebook therefore selects **readout mitigation without ZNE** as the best noisy-device estimator.

Mitigation requires additional calibration/measurement samples and can increase variance. The noise parameters are simulated assumptions, not measurements from a physical quantum processor.

### Stage-to-stage probability mismatch

This is the key end-to-end consistency issue. Stage 1 prints these probabilities for the six selected IDs, while Stage 3 receives different values:

| Customer | Stage 1 probability | Stage 3 input probability |
|---|---:|---:|
| C0017 | 0.371492 | 0.35 |
| C0073 | 0.404334 | 0.62 |
| C0107 | 0.382222 | 0.58 |
| C0281 | 0.275728 | 0.51 |
| C0297 | 0.527943 | 0.45 |
| C0311 | 0.298679 | 0.70 |

Stage 3 calculates its probability correctly for the inputs it receives, but the saved notebooks do not show these values being dynamically passed from Stage 1. Until this is reconciled, **72.58% is not the end-to-end forecast implied by Stage 1**. Re-run Stage 3 with the actual Stage 1 probabilities for the selected customers, or label the current Stage 3 result as a separate illustrative scenario.

---

## 4. Limitations and quantum-resource caveats

1. **Data volume and imbalance:** Stage 1 has 300 training rows and 35 positives.
2. **Invalid independent test split:** all 300 test IDs overlap training and all test features are exact copies, according to the notebook warning.
3. **Model-selection optimism:** 90 hybrid candidates are evaluated on a small dataset.
4. **Calibration uncertainty:** propensity scores need independent calibration checks.
5. **Stage integration mismatch:** Stage 3 probabilities do not match Stage 1 predictions for the same six IDs.
6. **Non-binding optimisation limits:** all 210 portfolios satisfy the supplied budget and capacity limits.
7. **Small optimisation search:** exact enumeration over 210 portfolios is straightforward and remains the reliable reference.
8. **Independent-outcome assumption:** Stage 3 models independent Bernoulli subscription outcomes; seasonality, channel, household, branch or sales-agent effects could correlate outcomes.
9. **Simulated quantum noise:** noise and mitigation are model assumptions, not device measurements.
10. **No causal uplift measurement:** propensity predicts likelihood, not the incremental effect of contacting a customer.
11. **No production evidence:** live integration, operational reliability, fairness, regulatory compliance, consent handling and campaign profitability are not established.
12. **No physical QPU run:** the notebooks demonstrate simulation, not hardware execution or quantum advantage.

### Resource reporting

| Item | Stage 2 | Stage 3 |
|---|---|---|
| Logical qubits | 10 decision qubits in QAOA/Grover formulation | 6, one per selected customer |
| Other variable count | 20 QUBO binary variables (10 decision + 10 slack), not qubits | — |
| Physical qubits | Not applicable; no physical processor used | Not applicable; no physical processor used |
| Circuit depth | Not reported by custom simulation | Six independent RY rotations; one parallel logical layer by construction; transpiled depth not produced |
| Gate counts | Not reported | 6 single-qubit RY; 0 two-qubit; 0 SWAP |
| Sampling | 24,576 explicit circuit-style simulated samples across six 4,096-sample draws | 23,639,876 aggregate simulated quantum-style measurement samples across comparison branches, calibration and final reporting runs |

Stage 2's 24,576 figure excludes stochastic internal steps in Grover Adaptive Search, QIEA and simulated annealing; these are classical algorithmic search operations, not hardware shots. Stage 3's 23,639,876 is an aggregate across different methods and repeated experiments—not one circuit execution, not one method's shot count, and not physical QPU shots. It excludes the separate 3,000,000 classical Monte Carlo trials.

Qiskit 2.6.2 is present in the saved Stage 3 run; Qiskit Aer is not (`Qiskit: True | Aer: False`). The notebook therefore uses its built-in NumPy simulation path. Stage 1 QFK/VQC calculations use simulated statevectors; Stage 2's QAOA/Grover-style implementations are custom simulations; QIEA is quantum-inspired and classical-driven.

Do not claim quantum advantage, hardware speedup, lower production cost, or quantum-grade security from these results.

---

## 5. Business recommendation

**Recommendation: proceed to a controlled, human-supervised pilot only after fixing the data and probability handoff. Do not deploy the current notebook outputs as an autonomous targeting system.**

### Before the pilot
1. **Repair the evaluation dataset.** Obtain the intended 100 unseen customers (or another properly defined out-of-time holdout), verify no customer-ID or feature-row overlap, and keep holdout labels isolated until final evaluation.
2. **Re-evaluate the predictor.** Compare `avg|GB+VQC` with strong classical-only baselines on the clean holdout. Report PR-AUC, precision/lift at the actual contact capacity, calibration, subgroup performance and confidence intervals.
3. **Fix the Stage 1 → Stage 3 handoff.** Pass the selected customers' probabilities directly from the prediction output into Stage 3. Add assertions that IDs and probabilities match across stages.
4. **Stress-test optimisation.** Tighten budget/capacity and expand the shortlist to test binding constraints. Keep exact enumeration as the decision oracle while the search space remains small.
5. **Validate the economics.** Confirm expected deposit value, contact cost, capacity units and the unit represented by the reported net value with campaign owners.

### During the pilot
1. Randomly assign eligible customers to contact and control groups to measure incremental subscription uplift rather than relying only on propensity.
2. Track conversion, deposit value, contact cost, complaints, opt-outs and staff time.
3. Keep human approval, customer-consent/suppression checks, audit logs and a manual override.
4. Monitor data drift and probability calibration; retrain or recalibrate only through a documented review process.

### Role of the quantum components

For the current ten-customer shortlist, exact classical enumeration is fast, transparent and definitive; it should remain the production decision baseline. The quantum-style solvers are useful experimental comparisons and a future scalability research track, but the current evidence does not justify replacing the classical solver or claiming business advantage from quantum computation.

**Business conclusion:** the near-term opportunity is the structured workflow—propensity ranking, explicit resource-constrained selection and outcome-risk estimation—not the quantum label itself. First establish trustworthy out-of-time prediction and causal uplift. Then assess whether larger, genuinely difficult optimisation instances justify further quantum-hardware experimentation.
