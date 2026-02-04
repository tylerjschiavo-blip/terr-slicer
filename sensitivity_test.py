"""
Sensitivity chart volatility test.
Tests how stable optimal fairness scores are across thresholds and preference settings.
"""

import random
import numpy as np
from itertools import product

random.seed(42)
np.random.seed(42)

# --- Simulated Data (based on user's description) ---

ENTERPRISE_REPS = ["Mickey", "Goofy", "Pluto", "Daisy"]
MM_REPS = ["Minnie", "Donald", "Ariel", "Simba", "Elsa", "Moana"]
LOCATIONS = ["GA", "NC", "CA", "OH", "TX", "NY"]

# Assign locations to reps
REP_LOCATIONS = {
    "Mickey": "GA", "Goofy": "NC", "Pluto": "CA", "Daisy": "OH",
    "Minnie": "TX", "Donald": "NY", "Ariel": "GA", "Simba": "CA", 
    "Elsa": "NC", "Moana": "OH"
}

# Generate 500 accounts
accounts = []
for i in range(500):
    arr = random.uniform(10_000, 500_000)
    employees = int(random.uniform(1_500, 200_000))
    risk_score = random.randint(0, 100)
    location = random.choice(LOCATIONS)
    current_rep = random.choice(ENTERPRISE_REPS + MM_REPS)
    accounts.append({
        "id": i,
        "arr": arr,
        "employees": employees,
        "risk_score": risk_score,
        "location": location,
        "current_rep": current_rep
    })


def segment_accounts(threshold):
    """Split accounts into E (employees >= threshold) and MM."""
    enterprise = [a for a in accounts if a["employees"] >= threshold]
    mid_market = [a for a in accounts if a["employees"] < threshold]
    return enterprise, mid_market


def allocate(segment_accounts, reps, weights, geo_bonus, preserve_bonus, risk_threshold=70):
    """
    Weighted greedy allocation.
    weights = (arr_w, acct_w, risk_w) summing to 100
    Returns dict of rep -> list of assigned accounts
    """
    if not segment_accounts or not reps:
        return {r: [] for r in reps}
    
    # Initialize rep loads
    rep_data = {r: {"arr": 0, "accounts": 0, "high_risk_arr": 0, "assignments": []} for r in reps}
    
    # Sort accounts by ARR descending (greedy: big accounts first)
    sorted_accts = sorted(segment_accounts, key=lambda x: -x["arr"])
    
    for acct in sorted_accts:
        # Calculate priority score for each rep
        scores = {}
        
        # Get current totals for normalization
        arr_values = [rep_data[r]["arr"] for r in reps]
        acct_values = [rep_data[r]["accounts"] for r in reps]
        risk_values = [rep_data[r]["high_risk_arr"] for r in reps]
        
        arr_range = max(arr_values) - min(arr_values) if max(arr_values) != min(arr_values) else 1
        acct_range = max(acct_values) - min(acct_values) if max(acct_values) != min(acct_values) else 1
        risk_range = max(risk_values) - min(risk_values) if max(risk_values) != min(risk_values) else 1
        
        for r in reps:
            # Normalized "need" scores (higher = needs more to balance)
            arr_need = 1 - (rep_data[r]["arr"] - min(arr_values)) / arr_range if arr_range > 0 else 0.5
            acct_need = 1 - (rep_data[r]["accounts"] - min(acct_values)) / acct_range if acct_range > 0 else 0.5
            risk_need = 1 - (rep_data[r]["high_risk_arr"] - min(risk_values)) / risk_range if risk_range > 0 else 0.5
            
            # Blended priority
            arr_w, acct_w, risk_w = weights
            priority = (arr_w * arr_need + acct_w * acct_need + risk_w * risk_need) / 100
            
            # Apply preference multipliers
            geo_match = 1 if REP_LOCATIONS.get(r) == acct["location"] else 0
            preserve_match = 1 if acct["current_rep"] == r else 0
            multiplier = 1 + geo_bonus * geo_match + preserve_bonus * preserve_match
            
            scores[r] = priority * multiplier
        
        # Assign to highest scorer
        winner = max(scores, key=scores.get)
        rep_data[winner]["assignments"].append(acct)
        rep_data[winner]["arr"] += acct["arr"]
        rep_data[winner]["accounts"] += 1
        if acct["risk_score"] >= risk_threshold:
            rep_data[winner]["high_risk_arr"] += acct["arr"]
    
    return rep_data


def calc_cv(values):
    """Coefficient of variation (std/mean), lower = more balanced."""
    if not values or np.mean(values) == 0:
        return 0
    return np.std(values) / np.mean(values)


def calc_fairness(rep_data, weights):
    """
    Calculate fairness scores.
    Returns (arr_fairness, acct_fairness, risk_fairness, equal_weight_composite)
    """
    if not rep_data:
        return 100, 100, 100, 100
    
    arr_values = [d["arr"] for d in rep_data.values()]
    acct_values = [d["accounts"] for d in rep_data.values()]
    risk_values = [d["high_risk_arr"] for d in rep_data.values()]
    
    # CV to fairness score (0-100, higher = better)
    arr_cv = calc_cv(arr_values)
    acct_cv = calc_cv(acct_values)
    risk_cv = calc_cv(risk_values)
    
    arr_fairness = max(0, 100 * (1 - arr_cv))
    acct_fairness = max(0, 100 * (1 - acct_cv))
    risk_fairness = max(0, 100 * (1 - risk_cv))
    
    # Equal weight composite (33/33/33)
    equal_weight = (arr_fairness + acct_fairness + risk_fairness) / 3
    
    return arr_fairness, acct_fairness, risk_fairness, equal_weight


def optimize_weights(segment_accounts, reps, geo_bonus, preserve_bonus, increment=5):
    """
    Find best weights (at given increment) for Equal Weight fairness.
    Returns (best_weights, best_score)
    """
    if not segment_accounts or not reps:
        return (34, 33, 33), 100
    
    best_weights = None
    best_score = -1
    
    # Generate all valid weight combinations
    for arr_w in range(0, 101, increment):
        for acct_w in range(0, 101 - arr_w, increment):
            risk_w = 100 - arr_w - acct_w
            weights = (arr_w, acct_w, risk_w)
            
            rep_data = allocate(segment_accounts, reps, weights, geo_bonus, preserve_bonus)
            _, _, _, equal_weight = calc_fairness(rep_data, weights)
            
            if equal_weight > best_score:
                best_score = equal_weight
                best_weights = weights
    
    return best_weights, best_score


# --- Run Sensitivity Analysis ---

print("=" * 70)
print("SENSITIVITY CHART VOLATILITY TEST")
print("=" * 70)
print()

# Test thresholds (sampled for speed)
thresholds = list(range(5000, 150001, 10000))  # 5K to 150K in 10K steps

# Test with different preference settings
preference_configs = [
    ("No prefs", 0.00, 0.00),
    ("Default (0.05/0.05)", 0.05, 0.05),
    ("Max prefs (0.10/0.10)", 0.10, 0.10),
]

print("Testing how optimal fairness changes across thresholds...")
print("Weight increment: 5% (for speed)")
print()

for name, geo, preserve in preference_configs:
    print(f"\n### {name} (geo={geo}, preserve={preserve})")
    print("-" * 60)
    print(f"{'Threshold':>10} | {'E Accts':>8} | {'MM Accts':>8} | {'Best Fairness':>13} | {'Optimal Weights':>18}")
    print("-" * 60)
    
    results = []
    for thresh in thresholds:
        e_accts, mm_accts = segment_accounts(thresh)
        
        # Optimize for Enterprise segment (4 reps)
        e_weights, e_score = optimize_weights(e_accts, ENTERPRISE_REPS, geo, preserve)
        
        # Optimize for MM segment (6 reps)
        mm_weights, mm_score = optimize_weights(mm_accts, MM_REPS, geo, preserve)
        
        # Combined score (simple average)
        combined = (e_score + mm_score) / 2
        
        results.append((thresh, len(e_accts), len(mm_accts), combined, e_weights, mm_weights))
        print(f"{thresh:>10,} | {len(e_accts):>8} | {len(mm_accts):>8} | {combined:>13.1f} | E:{e_weights} MM:{mm_weights}")
    
    # Calculate volatility
    scores = [r[3] for r in results]
    score_range = max(scores) - min(scores)
    score_std = np.std(scores)
    
    print("-" * 60)
    print(f"Score range: {min(scores):.1f} – {max(scores):.1f} (spread: {score_range:.1f})")
    print(f"Score std dev: {score_std:.2f}")
    print()

print("\n" + "=" * 70)
print("CONCLUSION")
print("=" * 70)
print("""
If the score spread is small (e.g., <5 points) and the optimal weights 
are relatively stable across thresholds, the sensitivity chart will show 
a smooth, interpretable curve.

If scores jump around wildly or optimal weights flip dramatically, 
the chart may be noisy and harder to interpret.
""")
