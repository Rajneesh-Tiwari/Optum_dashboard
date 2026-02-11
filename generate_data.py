#!/usr/bin/env python3
"""
Generate synthetic data for Optum Cardio-Metabolic Population Health Demo.
6 clusters, 500 members, 90+ features. Outputs JSON for React app.
"""

import json
import random
import math

random.seed(42)

N_MEMBERS = 500

# Cluster definitions per PRD
CLUSTERS = {
    1: {
        "name": "At-Risk Baseline",
        "short": "Mild Hypertension",
        "color": "#EF4444",
        "count_pct": 0.20,
        "age_range": (30, 55),
        "gender_split": 0.5,
    },
    2: {
        "name": "Unmanaged Metabolic Syndrome",
        "short": "Diabetes + Hypertension",
        "color": "#F97316",
        "count_pct": 0.18,
        "age_range": (40, 65),
        "gender_split": 0.45,
    },
    3: {
        "name": "Advanced Heart Failure",
        "short": "Cardiac High-Acuity",
        "color": "#EAB308",
        "count_pct": 0.15,
        "age_range": (60, 85),
        "gender_split": 0.6,
    },
    4: {
        "name": "Diabetic Nephropathy / ESRD",
        "short": "Kidney Disease",
        "color": "#22C55E",
        "count_pct": 0.15,
        "age_range": (50, 75),
        "gender_split": 0.55,
    },
    5: {
        "name": "Rural SDOH Crisis",
        "short": "Arkansas Delta Profile",
        "color": "#3B82F6",
        "count_pct": 0.17,
        "age_range": (35, 70),
        "gender_split": 0.48,
    },
    6: {
        "name": "Frail Elderly Complex",
        "short": "Geriatric Cardio-Metabolic",
        "color": "#8B5CF6",
        "count_pct": 0.15,
        "age_range": (75, 95),
        "gender_split": 0.42,
    },
}

ARKANSAS_COUNTIES = [
    {"name": "Phillips", "region": "Delta", "risk_mult": 1.4},
    {"name": "Lee", "region": "Delta", "risk_mult": 1.5},
    {"name": "Chicot", "region": "Delta", "risk_mult": 1.45},
    {"name": "Desha", "region": "Delta", "risk_mult": 1.35},
    {"name": "Monroe", "region": "Delta", "risk_mult": 1.5},
    {"name": "St. Francis", "region": "Delta", "risk_mult": 1.4},
    {"name": "Crittenden", "region": "Delta", "risk_mult": 1.35},
    {"name": "Benton", "region": "Northwest", "risk_mult": 0.85},
    {"name": "Washington", "region": "Northwest", "risk_mult": 0.88},
    {"name": "Carroll", "region": "Northwest", "risk_mult": 0.95},
    {"name": "Pulaski", "region": "Little Rock", "risk_mult": 1.0},
    {"name": "Saline", "region": "Little Rock", "risk_mult": 0.92},
    {"name": "Faulkner", "region": "Little Rock", "risk_mult": 0.95},
    {"name": "Miller", "region": "Southwest", "risk_mult": 1.15},
    {"name": "Columbia", "region": "Southwest", "risk_mult": 1.2},
    {"name": "Union", "region": "Southwest", "risk_mult": 1.18},
    {"name": "Sebastian", "region": "River Valley", "risk_mult": 1.05},
    {"name": "Crawford", "region": "River Valley", "risk_mult": 1.0},
    {"name": "Garland", "region": "River Valley", "risk_mult": 1.02},
    {"name": "Craighead", "region": "River Valley", "risk_mult": 0.98},
]

DELTA_COUNTIES = [c for c in ARKANSAS_COUNTIES if c["region"] == "Delta"]


def clamp(val, lo, hi):
    return max(lo, min(hi, val))


def rand_gauss(mean, std, lo=None, hi=None):
    v = random.gauss(mean, std)
    if lo is not None:
        v = max(lo, v)
    if hi is not None:
        v = min(hi, v)
    return v


def generate_member(member_id, cluster_id):
    c = CLUSTERS[cluster_id]
    age = int(rand_gauss(
        (c["age_range"][0] + c["age_range"][1]) / 2,
        (c["age_range"][1] - c["age_range"][0]) / 4,
        c["age_range"][0], c["age_range"][1]
    ))
    gender = "M" if random.random() < c["gender_split"] else "F"
    state = "AR"
    total_months = random.randint(6, 60)

    # Assign county - cluster 5 biased to Delta
    if cluster_id == 5 and random.random() < 0.7:
        county = random.choice(DELTA_COUNTIES)
    else:
        county = random.choice(ARKANSAS_COUNTIES)

    # LOB
    if cluster_id in (3, 6):
        lob = random.choice(["Medicare", "Medicare", "DSNP"])
    elif cluster_id == 5:
        lob = random.choice(["Medicaid", "DSNP", "Medicaid"])
    else:
        lob = random.choice(["Medicare", "Medicaid", "Commercial", "DSNP"])

    # -- SDOH Features --
    if cluster_id == 5:
        acs_pct_unemploy = round(rand_gauss(18, 5, 5, 35), 1)
        acs_pct_no_fd_stmp = round(rand_gauss(40, 10, 15, 70), 1)
        acs_pct_lt_hs = round(rand_gauss(25, 6, 8, 45), 1)
        hifld_dist_uc = round(rand_gauss(45, 15, 15, 90), 1)
        pos_dist_ed = round(rand_gauss(35, 10, 10, 70), 1)
        acs_pct_no_internet = round(rand_gauss(35, 10, 10, 60), 1)
        acs_pct_no_car = round(rand_gauss(15, 5, 3, 35), 1)
        hrsn_flag = 1
    else:
        acs_pct_unemploy = round(rand_gauss(8, 3, 2, 20), 1)
        acs_pct_no_fd_stmp = round(rand_gauss(20, 8, 5, 50), 1)
        acs_pct_lt_hs = round(rand_gauss(12, 4, 3, 30), 1)
        hifld_dist_uc = round(rand_gauss(12, 8, 1, 40), 1)
        pos_dist_ed = round(rand_gauss(10, 6, 1, 35), 1)
        acs_pct_no_internet = round(rand_gauss(12, 5, 2, 30), 1)
        acs_pct_no_car = round(rand_gauss(5, 3, 1, 15), 1)
        hrsn_flag = 1 if random.random() < 0.15 else 0

    # -- Clinical Utilization --
    if cluster_id == 1:
        cnt_er = int(rand_gauss(0.8, 0.8, 0, 5))
        cnt_pcp = int(rand_gauss(3, 1.5, 0, 10))
        cnt_readmit_30 = 0 if random.random() > 0.05 else 1
        cardiology_cnt = int(rand_gauss(0.5, 0.5, 0, 3))
        endocrinology_cnt = int(rand_gauss(0.3, 0.3, 0, 2))
        nephrology_cnt = 0
        neurology_cnt = int(rand_gauss(0.2, 0.3, 0, 2))
        preventive_cnt = int(rand_gauss(1.5, 1, 0, 5))
    elif cluster_id == 2:
        cnt_er = int(rand_gauss(1.5, 1, 0, 6))
        cnt_pcp = int(rand_gauss(4, 2, 1, 12))
        cnt_readmit_30 = 1 if random.random() < 0.12 else 0
        cardiology_cnt = int(rand_gauss(1.5, 1, 0, 5))
        endocrinology_cnt = int(rand_gauss(4, 1.5, 1, 8))
        nephrology_cnt = int(rand_gauss(0.5, 0.5, 0, 3))
        neurology_cnt = int(rand_gauss(0.3, 0.4, 0, 2))
        preventive_cnt = int(rand_gauss(1, 1, 0, 4))
    elif cluster_id == 3:
        cnt_er = int(rand_gauss(3, 1.5, 0, 10))
        cnt_pcp = int(rand_gauss(3, 1.5, 0, 8))
        cnt_readmit_30 = 1 if random.random() < 0.35 else 0
        cardiology_cnt = int(rand_gauss(6, 2, 2, 12))
        endocrinology_cnt = int(rand_gauss(1, 1, 0, 4))
        nephrology_cnt = int(rand_gauss(0.8, 0.8, 0, 4))
        neurology_cnt = int(rand_gauss(1, 0.8, 0, 4))
        preventive_cnt = int(rand_gauss(0.5, 0.5, 0, 3))
    elif cluster_id == 4:
        cnt_er = int(rand_gauss(2, 1.2, 0, 8))
        cnt_pcp = int(rand_gauss(4, 2, 1, 10))
        cnt_readmit_30 = 1 if random.random() < 0.25 else 0
        cardiology_cnt = int(rand_gauss(2, 1, 0, 6))
        endocrinology_cnt = int(rand_gauss(3, 1.5, 1, 7))
        nephrology_cnt = int(rand_gauss(5, 2, 2, 10))
        neurology_cnt = int(rand_gauss(0.5, 0.5, 0, 3))
        preventive_cnt = int(rand_gauss(1, 0.8, 0, 4))
    elif cluster_id == 5:
        cnt_er = max(0, int(random.expovariate(1/4)))
        cnt_pcp = 0
        cnt_readmit_30 = 1 if random.random() < 0.18 else 0
        cardiology_cnt = int(rand_gauss(0.3, 0.3, 0, 2))
        endocrinology_cnt = int(rand_gauss(0.2, 0.3, 0, 2))
        nephrology_cnt = int(rand_gauss(0.2, 0.3, 0, 2))
        neurology_cnt = 0
        preventive_cnt = 0
    else:  # cluster 6
        cnt_er = int(rand_gauss(2.5, 1.5, 0, 8))
        cnt_pcp = int(rand_gauss(5, 2, 1, 12))
        cnt_readmit_30 = 1 if random.random() < 0.30 else 0
        cardiology_cnt = int(rand_gauss(4, 1.5, 1, 8))
        endocrinology_cnt = int(rand_gauss(2, 1, 0, 5))
        nephrology_cnt = int(rand_gauss(1.5, 1, 0, 5))
        neurology_cnt = int(rand_gauss(2, 1, 0, 6))
        preventive_cnt = int(rand_gauss(1, 0.8, 0, 4))

    # -- Cardiometabolic Diagnostics --
    if cluster_id == 1:
        diabetes_flag = 1 if random.random() < 0.15 else 0
        hyper_flag = 1 if random.random() < 0.60 else 0
        heart_flag = 1 if random.random() < 0.05 else 0
        stroke_flag = 0
        kidney_flag = 0
        esrd_flag = 0
        cardio_circul_flag = 1 if random.random() < 0.10 else 0
        avg_severity = round(rand_gauss(1.2, 0.3, 1, 2), 1)
    elif cluster_id == 2:
        diabetes_flag = 1
        hyper_flag = 1
        heart_flag = 1 if random.random() < 0.20 else 0
        stroke_flag = 1 if random.random() < 0.05 else 0
        kidney_flag = 1 if random.random() < 0.15 else 0
        esrd_flag = 0
        cardio_circul_flag = 1 if random.random() < 0.25 else 0
        avg_severity = round(rand_gauss(2.5, 0.5, 1.5, 4), 1)
    elif cluster_id == 3:
        diabetes_flag = 1 if random.random() < 0.40 else 0
        hyper_flag = 1 if random.random() < 0.70 else 0
        heart_flag = 1
        stroke_flag = 1 if random.random() < 0.20 else 0
        kidney_flag = 1 if random.random() < 0.25 else 0
        esrd_flag = 1 if random.random() < 0.10 else 0
        cardio_circul_flag = 1
        avg_severity = round(rand_gauss(3.5, 0.5, 2.5, 5), 1)
    elif cluster_id == 4:
        diabetes_flag = 1
        hyper_flag = 1 if random.random() < 0.80 else 0
        heart_flag = 1 if random.random() < 0.30 else 0
        stroke_flag = 1 if random.random() < 0.10 else 0
        kidney_flag = 1
        esrd_flag = 1 if random.random() < 0.80 else 0
        cardio_circul_flag = 1 if random.random() < 0.35 else 0
        avg_severity = round(rand_gauss(3.8, 0.4, 3, 5), 1)
    elif cluster_id == 5:
        diabetes_flag = 1 if random.random() < 0.70 else 0
        hyper_flag = 1 if random.random() < 0.50 else 0
        heart_flag = 1 if random.random() < 0.10 else 0
        stroke_flag = 0
        kidney_flag = 1 if random.random() < 0.10 else 0
        esrd_flag = 0
        cardio_circul_flag = 1 if random.random() < 0.10 else 0
        avg_severity = round(rand_gauss(2.0, 0.5, 1, 3.5), 1)
    else:  # cluster 6
        diabetes_flag = 1 if random.random() < 0.55 else 0
        hyper_flag = 1 if random.random() < 0.75 else 0
        heart_flag = 1
        stroke_flag = 1 if random.random() < 0.30 else 0
        kidney_flag = 1 if random.random() < 0.35 else 0
        esrd_flag = 1 if random.random() < 0.15 else 0
        cardio_circul_flag = 1 if random.random() < 0.60 else 0
        avg_severity = round(rand_gauss(3.8, 0.5, 2.5, 5), 1)

    # -- Risk & Vulnerability --
    if cluster_id == 6:
        frailty_index = round(rand_gauss(0.28, 0.07, 0.15, 0.40), 3)
        charleston_cci = random.randint(4, 9)
    elif cluster_id == 3:
        frailty_index = round(rand_gauss(0.15, 0.05, 0.05, 0.30), 3)
        charleston_cci = random.randint(3, 7)
    elif cluster_id == 4:
        frailty_index = round(rand_gauss(0.12, 0.05, 0.03, 0.25), 3)
        charleston_cci = random.randint(3, 6)
    else:
        frailty_index = round(rand_gauss(0.05, 0.03, 0.01, 0.15), 3)
        charleston_cci = random.randint(0, 3)

    lab_cost_risk = round(rand_gauss(
        {1: 5, 2: 15, 3: 25, 4: 30, 5: 8, 6: 22}[cluster_id],
        5, 1, 50
    ), 1)
    rx_cost_risk = round(rand_gauss(
        {1: 5, 2: 25, 3: 18, 4: 28, 5: 10, 6: 20}[cluster_id],
        5, 1, 50
    ), 1)
    demo_medrx_risk = round(rand_gauss(
        {1: 10, 2: 25, 3: 35, 4: 60, 5: 15, 6: 45}[cluster_id],
        10, 1, 100
    ), 1)

    # -- Financial --
    cost_mult = {1: 1, 2: 1, 3: 8, 4: 8, 5: 1, 6: 3}[cluster_id]
    base_ip = rand_gauss(5000 * cost_mult, 2000 * cost_mult, 0, 200000)
    base_op = rand_gauss(3000 * cost_mult, 1500 * cost_mult, 500, 100000)
    base_phys = rand_gauss(2000 * cost_mult, 800 * cost_mult, 200, 50000)
    base_rx = rand_gauss(3000 * cost_mult, 1200 * cost_mult, 200, 80000)

    ip_allowed = round(base_ip * county["risk_mult"], 2)
    op_allowed = round(base_op * county["risk_mult"], 2)
    phys_allowed = round(base_phys * county["risk_mult"], 2)
    rx_allowed = round(base_rx * county["risk_mult"], 2)
    total_allowed = round(ip_allowed + op_allowed + phys_allowed + rx_allowed, 2)
    pmpy = round(total_allowed, 2)

    # final_target_measure: 1 if (ER>=1 and PCP==0) or ER>=3
    if (cnt_er >= 1 and cnt_pcp == 0) or cnt_er >= 3:
        final_target = 1
    else:
        final_target = 0

    # Cardiometabolic risk score (0-1): weighted composite of clinical signals
    # Weights reflect clinical importance for cardiometabolic outcomes
    age_norm = clamp((age - 18) / (95 - 18), 0, 1)
    severity_norm = clamp((avg_severity - 1) / 4, 0, 1)
    cci_norm = clamp(charleston_cci / 9, 0, 1)
    frailty_norm = clamp(frailty_index / 0.4, 0, 1)
    dx_burden = clamp((diabetes_flag + hyper_flag + heart_flag + stroke_flag
                        + kidney_flag + esrd_flag + cardio_circul_flag) / 7, 0, 1)
    util_norm = clamp((cnt_er + cnt_readmit_30 * 3) / 10, 0, 1)
    medrx_norm = clamp(demo_medrx_risk / 80, 0, 1)

    risk_score_raw = (
        0.10 * age_norm
        + 0.20 * severity_norm
        + 0.15 * cci_norm
        + 0.10 * frailty_norm
        + 0.20 * dx_burden
        + 0.10 * util_norm
        + 0.15 * medrx_norm
    )
    # Add small noise and clamp
    risk_score = round(clamp(risk_score_raw + random.gauss(0, 0.03), 0, 1), 3)

    return {
        "member_id": f"MBR{100000 + member_id}",
        "cluster_label": cluster_id,
        "gender": gender,
        "age_at_pred": age,
        "state": state,
        "total_months": total_months,
        "county": county["name"],
        "region": county["region"],
        "lob": lob,
        # SDOH
        "acs_pct_unemploy_zc": acs_pct_unemploy,
        "acs_pct_hh_no_fd_stmp_blw_pov_zc": acs_pct_no_fd_stmp,
        "acs_pct_lt_hs_zc": acs_pct_lt_hs,
        "hifld_dist_uc_zp": hifld_dist_uc,
        "pos_dist_ed_zp": pos_dist_ed,
        "acs_pct_hh_no_internet_zc": acs_pct_no_internet,
        "acs_pct_work_no_car_zc": acs_pct_no_car,
        "hrsn_flag": hrsn_flag,
        # Clinical Utilization
        "cnt_er_visits": cnt_er,
        "cnt_pcp_visits": cnt_pcp,
        "cnt_readmit_30": cnt_readmit_30,
        "cardiology_visit_cnt": cardiology_cnt,
        "endocrinology_visit_cnt": endocrinology_cnt,
        "nephrology_visit_cnt": nephrology_cnt,
        "neurology_visit_cnt": neurology_cnt,
        "preventive_administrative_visit_cnt": preventive_cnt,
        # Diagnostics
        "DIABETES_FLAG": diabetes_flag,
        "HYPER_FLAG": hyper_flag,
        "HEART_FLAG": heart_flag,
        "STROKE_FLAG": stroke_flag,
        "KIDNEY_FLAG": kidney_flag,
        "esrd_flag": esrd_flag,
        "CARDIO_CIRCUL_FLAG": cardio_circul_flag,
        "avg_severity_level": avg_severity,
        # Risk
        "frailty_index": frailty_index,
        "charleston_comorbidity_score_cci": charleston_cci,
        "lab_cost_risk": lab_cost_risk,
        "rx_cost_risk": rx_cost_risk,
        "demo_medrx_100k_risk": demo_medrx_risk,
        "cardio_metabolic_risk_score": risk_score,
        # Financial
        "ip_allowed_amt": ip_allowed,
        "op_allowed_amt": op_allowed,
        "phys_allowed_amt": phys_allowed,
        "rx_allowed_amt": rx_allowed,
        "total_allowed_amt": total_allowed,
        "pmpy": pmpy,
        # Outcomes
        "final_target_measure": final_target,
    }


def assign_clusters(n):
    """Assign cluster IDs to n members based on target percentages."""
    assignments = []
    for cid, cdef in CLUSTERS.items():
        count = round(n * cdef["count_pct"])
        assignments.extend([cid] * count)
    # Fill remainder
    while len(assignments) < n:
        assignments.append(random.choice(list(CLUSTERS.keys())))
    random.shuffle(assignments)
    return assignments[:n]


def compute_tsne(members):
    """Simple deterministic 2D projection for visualization.
    Uses a lightweight approach: PCA-like projection on key numeric features
    with cluster-based offsets to ensure separation, plus jitter.
    No sklearn dependency needed.
    """
    # Features to use for projection
    feature_keys = [
        "age_at_pred", "cnt_er_visits", "cnt_pcp_visits",
        "cardiology_visit_cnt", "endocrinology_visit_cnt", "nephrology_visit_cnt",
        "frailty_index", "charleston_comorbidity_score_cci",
        "avg_severity_level", "hifld_dist_uc_zp", "total_allowed_amt",
        "DIABETES_FLAG", "HEART_FLAG", "KIDNEY_FLAG", "esrd_flag",
    ]

    # Normalize features
    mins = {}
    maxs = {}
    for k in feature_keys:
        vals = [m[k] for m in members]
        mins[k] = min(vals)
        maxs[k] = max(vals) if max(vals) != min(vals) else min(vals) + 1

    normalized = []
    for m in members:
        row = [(m[k] - mins[k]) / (maxs[k] - mins[k]) for k in feature_keys]
        normalized.append(row)

    # Two projection vectors (hand-picked to separate clusters well)
    w1 = [0.1, 0.2, -0.15, 0.25, 0.15, 0.2, 0.3, 0.25, 0.2, 0.3, 0.1, 0.15, 0.2, 0.25, 0.2]
    w2 = [0.3, -0.1, 0.2, 0.1, -0.2, 0.15, 0.25, 0.2, -0.15, -0.2, 0.2, -0.1, 0.15, 0.1, -0.15]

    # Cluster center offsets for clear separation
    cluster_offsets = {
        1: (-3, 2),
        2: (1, 3),
        3: (4, 1),
        4: (3, -3),
        5: (-4, -2),
        6: (0, -4),
    }

    random.seed(123)  # Reproducible jitter
    for i, m in enumerate(members):
        proj_x = sum(normalized[i][j] * w1[j] for j in range(len(feature_keys)))
        proj_y = sum(normalized[i][j] * w2[j] for j in range(len(feature_keys)))
        cx, cy = cluster_offsets[m["cluster_label"]]
        jitter_x = random.gauss(0, 0.6)
        jitter_y = random.gauss(0, 0.6)
        m["tsne_x"] = round(proj_x + cx + jitter_x, 3)
        m["tsne_y"] = round(proj_y + cy + jitter_y, 3)

    random.seed(42)  # Reset seed


def main():
    print(f"Generating {N_MEMBERS} synthetic members across 6 clusters...")

    cluster_ids = assign_clusters(N_MEMBERS)
    members = []
    for i, cid in enumerate(cluster_ids):
        m = generate_member(i, cid)
        members.append(m)

    # Compute t-SNE-like 2D projection
    compute_tsne(members)

    # Cluster counts
    for cid in sorted(CLUSTERS.keys()):
        count = sum(1 for m in members if m["cluster_label"] == cid)
        print(f"  Cluster {cid} ({CLUSTERS[cid]['name']}): {count} members")

    # Feature metadata
    feature_metadata = {
        "Demographics": {
            "features": ["gender", "age_at_pred", "total_months"],
            "descriptions": {
                "gender": "Member gender (M/F)",
                "age_at_pred": "Age Group",
                "total_months": "Total months of enrollment"
            }
        },
        "Social Determinants of Health (SDOH)": {
            "features": [
                "acs_pct_unemploy_zc", "acs_pct_hh_no_fd_stmp_blw_pov_zc", "acs_pct_lt_hs_zc",
                "hifld_dist_uc_zp", "pos_dist_ed_zp", "acs_pct_hh_no_internet_zc",
                "acs_pct_work_no_car_zc", "hrsn_flag"
            ],
            "descriptions": {
                "acs_pct_unemploy_zc": "% Unemployed in ZIP",
                "acs_pct_hh_no_fd_stmp_blw_pov_zc": "% Households Below Poverty (No Food Stamps)",
                "acs_pct_lt_hs_zc": "% Less Than High School Education",
                "hifld_dist_uc_zp": "Distance to Nearest Urgent Care (miles)",
                "pos_dist_ed_zp": "Distance to Nearest ED (miles)",
                "acs_pct_hh_no_internet_zc": "% Households Without Internet",
                "acs_pct_work_no_car_zc": "% Workers Without Vehicle",
                "hrsn_flag": "Health-Related Social Needs Flag"
            }
        },
        "Clinical Utilization": {
            "features": [
                "cnt_er_visits", "cnt_pcp_visits", "cnt_readmit_30",
                "cardiology_visit_cnt", "endocrinology_visit_cnt",
                "nephrology_visit_cnt", "neurology_visit_cnt",
                "preventive_administrative_visit_cnt"
            ],
            "descriptions": {
                "cnt_er_visits": "ER Visits (YTD)",
                "cnt_pcp_visits": "PCP Visits (YTD)",
                "cnt_readmit_30": "30-Day Readmissions",
                "cardiology_visit_cnt": "Cardiology Visits",
                "endocrinology_visit_cnt": "Endocrinology Visits",
                "nephrology_visit_cnt": "Nephrology Visits",
                "neurology_visit_cnt": "Neurology Visits",
                "preventive_administrative_visit_cnt": "Preventive/Admin Visits"
            }
        },
        "Cardiometabolic Diagnostics": {
            "features": [
                "DIABETES_FLAG", "HYPER_FLAG", "HEART_FLAG", "STROKE_FLAG",
                "KIDNEY_FLAG", "esrd_flag", "CARDIO_CIRCUL_FLAG", "avg_severity_level"
            ],
            "descriptions": {
                "DIABETES_FLAG": "Diabetes Diagnosis",
                "HYPER_FLAG": "Hypertension Diagnosis",
                "HEART_FLAG": "Heart Disease Diagnosis",
                "STROKE_FLAG": "Stroke History",
                "KIDNEY_FLAG": "Kidney Disease Diagnosis",
                "esrd_flag": "End-Stage Renal Disease",
                "CARDIO_CIRCUL_FLAG": "Cardiovascular/Circulatory Disease",
                "avg_severity_level": "Average Severity Level"
            }
        },
        "Risk & Vulnerability": {
            "features": [
                "frailty_index", "charleston_comorbidity_score_cci",
                "lab_cost_risk", "rx_cost_risk", "demo_medrx_100k_risk",
                "cardio_metabolic_risk_score"
            ],
            "descriptions": {
                "frailty_index": "Frailty Index",
                "charleston_comorbidity_score_cci": "Charlson Comorbidity Index",
                "lab_cost_risk": "Lab Cost Risk Score",
                "rx_cost_risk": "Pharmacy Cost Risk Score",
                "demo_medrx_100k_risk": "Demographic Medical/Rx Risk (per 100K)",
                "cardio_metabolic_risk_score": "Cardiometabolic Risk Score (0-1)"
            }
        },
        "Financial": {
            "features": [
                "ip_allowed_amt", "op_allowed_amt", "phys_allowed_amt",
                "rx_allowed_amt", "total_allowed_amt", "pmpy"
            ],
            "descriptions": {
                "ip_allowed_amt": "Inpatient Allowed Amount ($)",
                "op_allowed_amt": "Outpatient Allowed Amount ($)",
                "phys_allowed_amt": "Physician Allowed Amount ($)",
                "rx_allowed_amt": "Pharmacy Allowed Amount ($)",
                "total_allowed_amt": "Total Allowed Amount ($)",
                "pmpy": "Per Member Per Year Cost ($)"
            }
        },
        "Outcomes": {
            "features": ["final_target_measure", "cluster_label"],
            "descriptions": {
                "final_target_measure": "High-Risk Utilization Flag (ER-only or 3+ ER visits)",
                "cluster_label": "AI-Assigned Cluster"
            }
        }
    }

    # Write outputs
    with open("src/data/ar_cardiometabolic_demo_data.json", "w") as f:
        json.dump(members, f, indent=2)
    print(f"Wrote src/data/ar_cardiometabolic_demo_data.json ({len(members)} rows)")

    with open("src/data/ui_feature_metadata.json", "w") as f:
        json.dump(feature_metadata, f, indent=2)
    print("Wrote src/data/ui_feature_metadata.json (7 groups)")

    # Summary stats
    total_cost = sum(m["pmpy"] for m in members)
    avg_cost = total_cost / len(members)
    avg_age = sum(m["age_at_pred"] for m in members) / len(members)
    esrd_count = sum(1 for m in members if m["esrd_flag"] == 1)
    print(f"\nPopulation summary:")
    print(f"  Avg age: {avg_age:.1f}")
    print(f"  Avg PMPY: ${avg_cost:,.0f}")
    print(f"  ESRD members: {esrd_count}")
    print(f"  Target measure flagged: {sum(1 for m in members if m['final_target_measure'] == 1)}")


if __name__ == "__main__":
    main()
