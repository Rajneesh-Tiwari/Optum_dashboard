#!/usr/bin/env python3
"""
Generate synthetic data for Optum Cardio-Metabolic Population Health Demo.
Outputs JavaScript files for offline browser use.
"""

import json
import random
from datetime import datetime, timedelta
from collections import defaultdict

random.seed(42)

# Arkansas counties with regions and characteristics
ARKANSAS_COUNTIES = [
    # Delta Region - high ESRD, high costs, rural
    {"name": "Phillips", "fips": "05107", "region": "Delta", "population": 18000, "risk_mult": 1.4},
    {"name": "Lee", "fips": "05077", "region": "Delta", "population": 9000, "risk_mult": 1.5},
    {"name": "Chicot", "fips": "05017", "region": "Delta", "population": 10500, "risk_mult": 1.45},
    {"name": "Desha", "fips": "05041", "region": "Delta", "population": 11500, "risk_mult": 1.35},
    {"name": "Arkansas", "fips": "05001", "region": "Delta", "population": 17800, "risk_mult": 1.3},
    {"name": "Monroe", "fips": "05095", "region": "Delta", "population": 6800, "risk_mult": 1.5},
    {"name": "St. Francis", "fips": "05123", "region": "Delta", "population": 25000, "risk_mult": 1.4},
    {"name": "Crittenden", "fips": "05035", "region": "Delta", "population": 48000, "risk_mult": 1.35},
    {"name": "Cross", "fips": "05037", "region": "Delta", "population": 16500, "risk_mult": 1.3},
    {"name": "Woodruff", "fips": "05147", "region": "Delta", "population": 6500, "risk_mult": 1.45},
    {"name": "Prairie", "fips": "05117", "region": "Delta", "population": 8100, "risk_mult": 1.25},
    {"name": "Lonoke", "fips": "05085", "region": "Delta", "population": 73000, "risk_mult": 1.15},

    # Northwest Arkansas - lower risk, better access
    {"name": "Benton", "fips": "05007", "region": "Northwest", "population": 284000, "risk_mult": 0.85},
    {"name": "Washington", "fips": "05143", "region": "Northwest", "population": 245000, "risk_mult": 0.88},
    {"name": "Carroll", "fips": "05015", "region": "Northwest", "population": 28500, "risk_mult": 0.95},
    {"name": "Madison", "fips": "05087", "region": "Northwest", "population": 16500, "risk_mult": 0.98},
    {"name": "Boone", "fips": "05009", "region": "Northwest", "population": 37500, "risk_mult": 0.92},
    {"name": "Newton", "fips": "05101", "region": "Northwest", "population": 7800, "risk_mult": 1.0},
    {"name": "Searcy", "fips": "05129", "region": "Northwest", "population": 7900, "risk_mult": 1.02},
    {"name": "Marion", "fips": "05089", "region": "Northwest", "population": 16800, "risk_mult": 0.95},
    {"name": "Baxter", "fips": "05005", "region": "Northwest", "population": 41500, "risk_mult": 0.9},

    # Little Rock Metro - moderate risk, good access
    {"name": "Pulaski", "fips": "05119", "region": "Little Rock", "population": 400000, "risk_mult": 1.0},
    {"name": "Saline", "fips": "05125", "region": "Little Rock", "population": 125000, "risk_mult": 0.92},
    {"name": "Faulkner", "fips": "05045", "region": "Little Rock", "population": 130000, "risk_mult": 0.95},
    {"name": "Perry", "fips": "05105", "region": "Little Rock", "population": 10400, "risk_mult": 1.05},
    {"name": "Grant", "fips": "05053", "region": "Little Rock", "population": 18200, "risk_mult": 1.02},
    {"name": "White", "fips": "05145", "region": "Little Rock", "population": 80000, "risk_mult": 1.0},

    # Southwest Arkansas
    {"name": "Miller", "fips": "05091", "region": "Southwest", "population": 43500, "risk_mult": 1.15},
    {"name": "Lafayette", "fips": "05073", "region": "Southwest", "population": 6600, "risk_mult": 1.25},
    {"name": "Columbia", "fips": "05027", "region": "Southwest", "population": 23500, "risk_mult": 1.2},
    {"name": "Union", "fips": "05139", "region": "Southwest", "population": 39000, "risk_mult": 1.18},
    {"name": "Ouachita", "fips": "05103", "region": "Southwest", "population": 23600, "risk_mult": 1.22},
    {"name": "Calhoun", "fips": "05013", "region": "Southwest", "population": 5000, "risk_mult": 1.28},
    {"name": "Bradley", "fips": "05011", "region": "Southwest", "population": 10600, "risk_mult": 1.2},
    {"name": "Drew", "fips": "05043", "region": "Southwest", "population": 18500, "risk_mult": 1.15},
    {"name": "Ashley", "fips": "05003", "region": "Southwest", "population": 19600, "risk_mult": 1.25},
    {"name": "Hempstead", "fips": "05057", "region": "Southwest", "population": 21800, "risk_mult": 1.18},
    {"name": "Nevada", "fips": "05099", "region": "Southwest", "population": 8400, "risk_mult": 1.22},
    {"name": "Clark", "fips": "05019", "region": "Southwest", "population": 22100, "risk_mult": 1.1},
    {"name": "Pike", "fips": "05109", "region": "Southwest", "population": 10700, "risk_mult": 1.15},
    {"name": "Howard", "fips": "05061", "region": "Southwest", "population": 13200, "risk_mult": 1.12},
    {"name": "Sevier", "fips": "05133", "region": "Southwest", "population": 17200, "risk_mult": 1.1},
    {"name": "Little River", "fips": "05081", "region": "Southwest", "population": 12300, "risk_mult": 1.18},
    {"name": "Hot Spring", "fips": "05059", "region": "Southwest", "population": 34200, "risk_mult": 1.08},
    {"name": "Dallas", "fips": "05039", "region": "Southwest", "population": 7200, "risk_mult": 1.25},
    {"name": "Cleveland", "fips": "05025", "region": "Southwest", "population": 8000, "risk_mult": 1.15},

    # River Valley
    {"name": "Sebastian", "fips": "05131", "region": "River Valley", "population": 128000, "risk_mult": 1.05},
    {"name": "Crawford", "fips": "05033", "region": "River Valley", "population": 64000, "risk_mult": 1.0},
    {"name": "Franklin", "fips": "05047", "region": "River Valley", "population": 17800, "risk_mult": 1.08},
    {"name": "Johnson", "fips": "05071", "region": "River Valley", "population": 26500, "risk_mult": 1.05},
    {"name": "Logan", "fips": "05083", "region": "River Valley", "population": 21500, "risk_mult": 1.1},
    {"name": "Scott", "fips": "05127", "region": "River Valley", "population": 10500, "risk_mult": 1.15},
    {"name": "Polk", "fips": "05113", "region": "River Valley", "population": 19800, "risk_mult": 1.12},
    {"name": "Montgomery", "fips": "05097", "region": "River Valley", "population": 8800, "risk_mult": 1.15},
    {"name": "Garland", "fips": "05051", "region": "River Valley", "population": 99500, "risk_mult": 1.02},
    {"name": "Yell", "fips": "05149", "region": "River Valley", "population": 21700, "risk_mult": 1.12},
    {"name": "Pope", "fips": "05115", "region": "River Valley", "population": 64000, "risk_mult": 1.0},
    {"name": "Conway", "fips": "05029", "region": "River Valley", "population": 20900, "risk_mult": 1.08},
    {"name": "Van Buren", "fips": "05141", "region": "River Valley", "population": 16600, "risk_mult": 1.1},
    {"name": "Cleburne", "fips": "05023", "region": "River Valley", "population": 25500, "risk_mult": 1.05},
    {"name": "Stone", "fips": "05135", "region": "River Valley", "population": 12600, "risk_mult": 1.08},
    {"name": "Izard", "fips": "05065", "region": "River Valley", "population": 13500, "risk_mult": 1.1},
    {"name": "Independence", "fips": "05063", "region": "River Valley", "population": 37800, "risk_mult": 1.05},
    {"name": "Sharp", "fips": "05135", "region": "River Valley", "population": 17100, "risk_mult": 1.12},
    {"name": "Fulton", "fips": "05049", "region": "River Valley", "population": 12200, "risk_mult": 1.15},
    {"name": "Randolph", "fips": "05121", "region": "River Valley", "population": 17500, "risk_mult": 1.1},
    {"name": "Lawrence", "fips": "05075", "region": "River Valley", "population": 16600, "risk_mult": 1.12},
    {"name": "Jackson", "fips": "05067", "region": "River Valley", "population": 16900, "risk_mult": 1.18},
    {"name": "Poinsett", "fips": "05111", "region": "River Valley", "population": 23800, "risk_mult": 1.2},
    {"name": "Craighead", "fips": "05031", "region": "River Valley", "population": 110000, "risk_mult": 0.98},
    {"name": "Greene", "fips": "05055", "region": "River Valley", "population": 45500, "risk_mult": 1.02},
    {"name": "Clay", "fips": "05021", "region": "River Valley", "population": 14500, "risk_mult": 1.15},
    {"name": "Mississippi", "fips": "05093", "region": "River Valley", "population": 41000, "risk_mult": 1.25},
    {"name": "Jefferson", "fips": "05069", "region": "River Valley", "population": 66000, "risk_mult": 1.2},
    {"name": "Lincoln", "fips": "05079", "region": "River Valley", "population": 13500, "risk_mult": 1.22},
]

# Cluster definitions
CLUSTERS = {
    1: {
        "name": "High-Risk ESRD Progression",
        "description": "Members with advanced CKD at high risk of dialysis initiation",
        "color": "#EF4444",
        "avg_age": 68,
        "hcc_range": (2.8, 4.5),
        "a1c_range": (8.5, 12.0),
        "egfr_range": (15, 35),
        "bp_systolic_range": (145, 180),
        "pmpy_range": (85000, 130000),
        "conditions": ["CKD Stage 4-5", "Diabetes", "Hypertension", "CHF"],
        "utilization": {"er_visits": 4.2, "hospitalizations": 2.1, "specialist_visits": 12.5}
    },
    2: {
        "name": "Uncontrolled Diabetes with Cardiac Risk",
        "description": "Members with poorly controlled diabetes and elevated cardiovascular risk",
        "color": "#F97316",
        "avg_age": 58,
        "hcc_range": (1.8, 2.8),
        "a1c_range": (9.0, 13.0),
        "egfr_range": (45, 75),
        "bp_systolic_range": (140, 165),
        "pmpy_range": (35000, 65000),
        "conditions": ["Diabetes", "Hypertension", "Hyperlipidemia", "Pre-CHF"],
        "utilization": {"er_visits": 2.8, "hospitalizations": 0.9, "specialist_visits": 8.2}
    },
    3: {
        "name": "Metabolic Syndrome - Rising Risk",
        "description": "Members with metabolic syndrome showing trajectory toward complications",
        "color": "#EAB308",
        "avg_age": 52,
        "hcc_range": (1.2, 1.8),
        "a1c_range": (6.5, 8.5),
        "egfr_range": (60, 90),
        "bp_systolic_range": (130, 150),
        "pmpy_range": (15000, 35000),
        "conditions": ["Pre-diabetes", "Obesity", "Hypertension", "Dyslipidemia"],
        "utilization": {"er_visits": 1.2, "hospitalizations": 0.3, "specialist_visits": 4.5}
    },
    4: {
        "name": "Stable Chronic Management",
        "description": "Well-controlled chronic conditions with stable trajectory",
        "color": "#22C55E",
        "avg_age": 62,
        "hcc_range": (0.8, 1.4),
        "a1c_range": (6.0, 7.5),
        "egfr_range": (70, 100),
        "bp_systolic_range": (120, 138),
        "pmpy_range": (8000, 18000),
        "conditions": ["Controlled Diabetes", "Managed Hypertension"],
        "utilization": {"er_visits": 0.5, "hospitalizations": 0.1, "specialist_visits": 3.2}
    },
    5: {
        "name": "Prevention Opportunity",
        "description": "At-risk members with opportunity for early intervention",
        "color": "#3B82F6",
        "avg_age": 45,
        "hcc_range": (0.5, 1.0),
        "a1c_range": (5.5, 6.4),
        "egfr_range": (85, 110),
        "bp_systolic_range": (115, 135),
        "pmpy_range": (3000, 10000),
        "conditions": ["Overweight", "Pre-hypertension", "Family History"],
        "utilization": {"er_visits": 0.3, "hospitalizations": 0.05, "specialist_visits": 1.5}
    }
}

# Line of business distribution and cluster weights
LOB_CONFIG = {
    "DSNP": {
        "count": 1000,
        "cluster_weights": {1: 0.12, 2: 0.25, 3: 0.28, 4: 0.20, 5: 0.15},
        "avg_age_adj": 5,
        "cost_mult": 1.15
    },
    "Medicare": {
        "count": 1200,
        "cluster_weights": {1: 0.10, 2: 0.22, 3: 0.25, 4: 0.25, 5: 0.18},
        "avg_age_adj": 8,
        "cost_mult": 1.0
    },
    "Medicaid": {
        "count": 1000,
        "cluster_weights": {1: 0.08, 2: 0.20, 3: 0.30, 4: 0.22, 5: 0.20},
        "avg_age_adj": -10,
        "cost_mult": 0.85
    },
    "Commercial": {
        "count": 800,
        "cluster_weights": {1: 0.05, 2: 0.15, 3: 0.25, 4: 0.28, 5: 0.27},
        "avg_age_adj": -15,
        "cost_mult": 0.95
    }
}

INTERVENTIONS = [
    {"id": "ckd_care", "name": "CKD Care Management", "target_clusters": [1, 2], "cost_reduction": 0.18, "monthly_cost": 450},
    {"id": "diabetes_mgmt", "name": "Diabetes Intensive Management", "target_clusters": [2, 3], "cost_reduction": 0.15, "monthly_cost": 280},
    {"id": "care_coord", "name": "Care Coordination Program", "target_clusters": [1, 2, 3], "cost_reduction": 0.12, "monthly_cost": 200},
    {"id": "remote_monitor", "name": "Remote Patient Monitoring", "target_clusters": [1, 2], "cost_reduction": 0.14, "monthly_cost": 180},
    {"id": "nutrition", "name": "Medical Nutrition Therapy", "target_clusters": [2, 3, 4], "cost_reduction": 0.08, "monthly_cost": 120},
    {"id": "pharma_opt", "name": "Pharmacy Optimization", "target_clusters": [1, 2, 3], "cost_reduction": 0.10, "monthly_cost": 90},
    {"id": "sdoh_support", "name": "SDOH Support Services", "target_clusters": [1, 2], "cost_reduction": 0.11, "monthly_cost": 250},
    {"id": "behavioral", "name": "Behavioral Health Integration", "target_clusters": [2, 3], "cost_reduction": 0.09, "monthly_cost": 200},
    {"id": "prevention", "name": "Prevention & Wellness", "target_clusters": [3, 4, 5], "cost_reduction": 0.06, "monthly_cost": 80},
]


def generate_member_id():
    return f"MBR{random.randint(100000, 999999)}"


def weighted_choice(weights):
    """Select from weighted dict."""
    items = list(weights.keys())
    probs = list(weights.values())
    return random.choices(items, weights=probs, k=1)[0]


def generate_member(lob, cluster_id, county, is_davita=False, is_complex_frail=False, is_non_outreach=False):
    """Generate a single member record."""
    cluster = CLUSTERS[cluster_id]
    lob_config = LOB_CONFIG[lob]

    # Base demographics
    base_age = cluster["avg_age"] + lob_config["avg_age_adj"]
    age = max(18, min(95, int(random.gauss(base_age, 8))))
    gender = random.choice(["M", "F"])

    # Clinical markers with variation
    hcc_score = round(random.uniform(*cluster["hcc_range"]), 2)
    a1c = round(random.uniform(*cluster["a1c_range"]), 1)
    egfr = round(random.uniform(*cluster["egfr_range"]), 0)
    bp_systolic = int(random.uniform(*cluster["bp_systolic_range"]))
    bp_diastolic = int(bp_systolic * random.uniform(0.55, 0.65))
    bmi = round(random.uniform(24, 42), 1)
    ldl = int(random.uniform(90, 180))

    # Cost with variation and multipliers
    base_pmpy = random.uniform(*cluster["pmpy_range"])
    cost_mult = lob_config["cost_mult"] * county["risk_mult"]

    # DaVita planted insight - higher costs
    if is_davita and cluster_id == 1:
        cost_mult *= 1.43  # ~$107K vs $75K

    # Complex frail sub-cluster
    if is_complex_frail:
        cost_mult *= 1.25
        hcc_score *= 1.3
        age = max(75, age + 10)

    pmpy = int(base_pmpy * cost_mult)

    # Utilization
    util = cluster["utilization"]
    er_visits = max(0, int(random.gauss(util["er_visits"], util["er_visits"] * 0.3)))
    hospitalizations = max(0, int(random.gauss(util["hospitalizations"], util["hospitalizations"] * 0.4)))
    specialist_visits = max(0, int(random.gauss(util["specialist_visits"], util["specialist_visits"] * 0.25)))

    # Risk trajectory
    if cluster_id <= 2:
        trajectory = random.choices(["deteriorating", "stable", "improving"], weights=[0.5, 0.35, 0.15])[0]
    elif cluster_id == 3:
        trajectory = random.choices(["deteriorating", "stable", "improving"], weights=[0.3, 0.45, 0.25])[0]
    else:
        trajectory = random.choices(["deteriorating", "stable", "improving"], weights=[0.1, 0.6, 0.3])[0]

    # SDOH factors
    sdoh_score = round(random.uniform(0.3, 0.9) * (1 / county["risk_mult"]), 2)
    food_insecurity = random.random() < (0.4 * county["risk_mult"])
    transportation_barrier = random.random() < (0.35 * county["risk_mult"])

    # Engagement status
    if is_non_outreach:
        engagement = "non_outreach"
        last_pcp_months = random.randint(18, 36)
    else:
        engagement = random.choices(["active", "passive", "disengaged"], weights=[0.4, 0.35, 0.25])[0]
        last_pcp_months = random.randint(1, 18)

    # Provider
    if is_davita:
        dialysis_provider = "DaVita"
    elif cluster_id == 1 and random.random() < 0.3:
        dialysis_provider = random.choice(["Fresenius", "Independent", None])
    else:
        dialysis_provider = None

    return {
        "id": generate_member_id(),
        "lob": lob,
        "cluster": cluster_id,
        "county_fips": county["fips"],
        "county_name": county["name"],
        "region": county["region"],
        "age": age,
        "gender": gender,
        "hcc_score": hcc_score,
        "a1c": a1c,
        "egfr": egfr,
        "bp_systolic": bp_systolic,
        "bp_diastolic": bp_diastolic,
        "bmi": bmi,
        "ldl": ldl,
        "pmpy": pmpy,
        "pmpm": int(pmpy / 12),
        "er_visits_ytd": er_visits,
        "hospitalizations_ytd": hospitalizations,
        "specialist_visits_ytd": specialist_visits,
        "trajectory": trajectory,
        "conditions": cluster["conditions"],
        "sdoh_score": sdoh_score,
        "food_insecurity": food_insecurity,
        "transportation_barrier": transportation_barrier,
        "engagement": engagement,
        "last_pcp_visit_months": last_pcp_months,
        "dialysis_provider": dialysis_provider,
        "is_complex_frail": is_complex_frail,
        "is_non_outreach": is_non_outreach
    }


def generate_members():
    """Generate all 4,000 members with planted data points."""
    members = []

    # Weight counties by population for distribution
    total_pop = sum(c["population"] for c in ARKANSAS_COUNTIES)
    county_weights = {c["fips"]: c["population"] / total_pop for c in ARKANSAS_COUNTIES}
    county_by_fips = {c["fips"]: c for c in ARKANSAS_COUNTIES}

    # Delta counties for ESRD planting
    delta_counties = [c for c in ARKANSAS_COUNTIES if c["region"] == "Delta"]

    for lob, config in LOB_CONFIG.items():
        count = config["count"]
        cluster_weights = config["cluster_weights"]

        for i in range(count):
            cluster_id = weighted_choice(cluster_weights)
            county_fips = weighted_choice(county_weights)
            county = county_by_fips[county_fips]

            # Planted DaVita insight: 8 DSNP Cluster 1 members
            is_davita = False
            if lob == "DSNP" and cluster_id == 1 and len([m for m in members if m.get("dialysis_provider") == "DaVita" and m["lob"] == "DSNP"]) < 8:
                is_davita = random.random() < 0.15

            # Planted Medicare Cluster 1 sub-clusters
            is_complex_frail = False
            is_non_outreach = False
            if lob == "Medicare" and cluster_id == 1:
                medicare_c1 = [m for m in members if m["lob"] == "Medicare" and m["cluster"] == 1]
                complex_frail_count = len([m for m in medicare_c1 if m.get("is_complex_frail")])
                non_outreach_count = len([m for m in medicare_c1 if m.get("is_non_outreach")])

                if complex_frail_count < 85 and random.random() < 0.7:
                    is_complex_frail = True
                elif non_outreach_count < 30 and random.random() < 0.25:
                    is_non_outreach = True

            # Bias Delta region for ESRD/high-risk
            if cluster_id == 1 and random.random() < 0.4:
                county = random.choice(delta_counties)

            member = generate_member(lob, cluster_id, county, is_davita, is_complex_frail, is_non_outreach)
            members.append(member)

    return members


def generate_county_data():
    """Generate county-level aggregations."""
    counties = []

    for county in ARKANSAS_COUNTIES:
        # Health indicators
        esrd_rate = round(random.uniform(0.8, 2.5) * county["risk_mult"], 2)
        diabetes_rate = round(random.uniform(10, 18) * county["risk_mult"], 1)
        obesity_rate = round(random.uniform(28, 42) * county["risk_mult"], 1)

        # SDOH
        poverty_rate = round(random.uniform(12, 28) * county["risk_mult"], 1)
        uninsured_rate = round(random.uniform(8, 18) * county["risk_mult"], 1)
        food_desert_pct = round(random.uniform(5, 35) * county["risk_mult"], 1)

        # Access
        pcp_per_10k = round(random.uniform(3, 12) / county["risk_mult"], 1)
        specialist_per_10k = round(random.uniform(1, 8) / county["risk_mult"], 1)
        hospital_distance = round(random.uniform(5, 45) * county["risk_mult"], 1)

        # Cost
        avg_pmpy = int(random.uniform(18000, 45000) * county["risk_mult"])

        counties.append({
            "fips": county["fips"],
            "name": county["name"],
            "region": county["region"],
            "population": county["population"],
            "risk_multiplier": county["risk_mult"],
            "esrd_rate_per_1000": esrd_rate,
            "diabetes_prevalence": diabetes_rate,
            "obesity_rate": obesity_rate,
            "poverty_rate": poverty_rate,
            "uninsured_rate": uninsured_rate,
            "food_desert_pct": food_desert_pct,
            "pcp_per_10k": pcp_per_10k,
            "specialist_per_10k": specialist_per_10k,
            "hospital_distance_miles": hospital_distance,
            "avg_pmpy": avg_pmpy
        })

    return counties


def generate_scenarios():
    """Generate pre-computed scenario results."""
    scenarios = []

    enrollment_levels = [0.3, 0.5, 0.7, 0.85, 1.0]
    engagement_levels = [0.3, 0.5, 0.6, 0.75, 0.9]

    for cluster_id in [1, 2, 3]:
        cluster = CLUSTERS[cluster_id]
        base_pmpy = (cluster["pmpy_range"][0] + cluster["pmpy_range"][1]) / 2

        for intervention in INTERVENTIONS:
            if cluster_id not in intervention["target_clusters"]:
                continue

            for enrollment in enrollment_levels:
                for engagement in engagement_levels:
                    # Calculate outcomes
                    effective_rate = enrollment * engagement
                    cost_reduction = intervention["cost_reduction"] * effective_rate

                    # Diminishing returns at high engagement
                    if effective_rate > 0.6:
                        cost_reduction *= (1 - (effective_rate - 0.6) * 0.3)

                    savings_pmpy = int(base_pmpy * cost_reduction)
                    intervention_cost = intervention["monthly_cost"] * 12 * enrollment
                    net_savings = savings_pmpy - intervention_cost
                    roi = round((net_savings / intervention_cost) * 100 if intervention_cost > 0 else 0, 1)

                    # Break-even calculation
                    monthly_savings = savings_pmpy / 12
                    if monthly_savings > intervention["monthly_cost"]:
                        break_even = round(intervention["monthly_cost"] / (monthly_savings - intervention["monthly_cost"] * enrollment), 1)
                    else:
                        break_even = 24  # Cap at 24 months

                    scenarios.append({
                        "cluster": cluster_id,
                        "intervention_id": intervention["id"],
                        "intervention_name": intervention["name"],
                        "enrollment": enrollment,
                        "engagement": engagement,
                        "cost_reduction_pct": round(cost_reduction * 100, 1),
                        "savings_pmpy": savings_pmpy,
                        "intervention_cost_annual": int(intervention_cost),
                        "net_savings_pmpy": int(net_savings),
                        "roi_pct": roi,
                        "break_even_months": break_even
                    })

    return scenarios


def generate_timeline_projections():
    """Generate 24-month projection data."""
    projections = []

    for cluster_id in [1, 2, 3]:
        cluster = CLUSTERS[cluster_id]
        base_cost = (cluster["pmpy_range"][0] + cluster["pmpy_range"][1]) / 2 / 12

        baseline = []
        intervention = []

        for month in range(1, 25):
            # Baseline grows with medical trend
            trend = 1 + (0.005 * month)  # 0.5% monthly trend
            baseline_cost = int(base_cost * trend)
            baseline.append({"month": month, "cost": baseline_cost})

            # Intervention shows gradual improvement
            ramp_up = min(1, month / 6)  # 6-month ramp up
            reduction = 0.15 * ramp_up
            intervention_cost = int(base_cost * trend * (1 - reduction))
            intervention.append({"month": month, "cost": intervention_cost})

        projections.append({
            "cluster": cluster_id,
            "baseline": baseline,
            "intervention": intervention,
            "cumulative_savings": sum(b["cost"] - i["cost"] for b, i in zip(baseline, intervention))
        })

    return projections


def to_js_file(data, var_name, filename):
    """Write data as JavaScript const."""
    js_content = f"const {var_name} = {json.dumps(data, indent=2)};\n"
    with open(filename, 'w') as f:
        f.write(js_content)
    print(f"Generated {filename}")


def main():
    print("Generating synthetic data for Optum Cardio-Metabolic Demo...")

    # Generate all data
    members = generate_members()
    counties = generate_county_data()
    scenarios = generate_scenarios()
    projections = generate_timeline_projections()

    # Compute aggregations
    cluster_summary = {}
    for cluster_id, cluster in CLUSTERS.items():
        cluster_members = [m for m in members if m["cluster"] == cluster_id]
        cluster_summary[cluster_id] = {
            **cluster,
            "member_count": len(cluster_members),
            "avg_pmpy": int(sum(m["pmpy"] for m in cluster_members) / len(cluster_members)) if cluster_members else 0,
            "avg_hcc": round(sum(m["hcc_score"] for m in cluster_members) / len(cluster_members), 2) if cluster_members else 0,
            "avg_age": round(sum(m["age"] for m in cluster_members) / len(cluster_members), 1) if cluster_members else 0,
            "by_lob": {
                lob: len([m for m in cluster_members if m["lob"] == lob])
                for lob in LOB_CONFIG.keys()
            }
        }

    # DaVita insight data
    davita_members = [m for m in members if m["dialysis_provider"] == "DaVita" and m["cluster"] == 1 and m["lob"] == "DSNP"]
    non_davita_members = [m for m in members if m["dialysis_provider"] != "DaVita" and m["cluster"] == 1 and m["lob"] == "DSNP"]

    davita_insight = {
        "davita_count": len(davita_members),
        "davita_avg_pmpy": int(sum(m["pmpy"] for m in davita_members) / len(davita_members)) if davita_members else 0,
        "non_davita_count": len(non_davita_members),
        "non_davita_avg_pmpy": int(sum(m["pmpy"] for m in non_davita_members) / len(non_davita_members)) if non_davita_members else 0,
        "gap_pct": round(((sum(m["pmpy"] for m in davita_members) / len(davita_members)) /
                         (sum(m["pmpy"] for m in non_davita_members) / len(non_davita_members)) - 1) * 100, 1) if davita_members and non_davita_members else 0
    }

    # Regional summary
    regional_summary = {}
    for region in ["Delta", "Northwest", "Little Rock", "Southwest", "River Valley"]:
        region_members = [m for m in members if m["region"] == region]
        regional_summary[region] = {
            "member_count": len(region_members),
            "avg_pmpy": int(sum(m["pmpy"] for m in region_members) / len(region_members)) if region_members else 0,
            "cluster_distribution": {
                cluster_id: len([m for m in region_members if m["cluster"] == cluster_id])
                for cluster_id in CLUSTERS.keys()
            },
            "esrd_rate": round(len([m for m in region_members if m["cluster"] == 1]) / len(region_members) * 100, 1) if region_members else 0
        }

    # Write JS files
    output_dir = "js/data/"
    to_js_file(members, "MEMBERS", f"{output_dir}members.js")
    to_js_file(dict(cluster_summary), "CLUSTERS", f"{output_dir}clusters.js")
    to_js_file(counties, "COUNTIES", f"{output_dir}counties.js")
    to_js_file(scenarios, "SCENARIOS", f"{output_dir}scenarios.js")
    to_js_file(projections, "PROJECTIONS", f"{output_dir}projections.js")
    to_js_file(INTERVENTIONS, "INTERVENTIONS", f"{output_dir}interventions.js")
    to_js_file(davita_insight, "DAVITA_INSIGHT", f"{output_dir}davita.js")
    to_js_file(regional_summary, "REGIONAL_SUMMARY", f"{output_dir}regions.js")

    # Print summary
    print(f"\nGenerated {len(members)} members:")
    for lob, config in LOB_CONFIG.items():
        lob_members = [m for m in members if m["lob"] == lob]
        print(f"  {lob}: {len(lob_members)}")

    print(f"\nCluster distribution:")
    for cluster_id, summary in cluster_summary.items():
        print(f"  Cluster {cluster_id} ({summary['name']}): {summary['member_count']} members, ${summary['avg_pmpy']:,} avg PMPY")

    print(f"\nDaVita insight:")
    print(f"  DaVita DSNP Cluster 1: {davita_insight['davita_count']} members @ ${davita_insight['davita_avg_pmpy']:,} avg")
    print(f"  Non-DaVita DSNP Cluster 1: {davita_insight['non_davita_count']} members @ ${davita_insight['non_davita_avg_pmpy']:,} avg")
    print(f"  Gap: {davita_insight['gap_pct']}%")

    print(f"\nGenerated {len(scenarios)} scenario combinations")
    print(f"Generated {len(counties)} county records")


if __name__ == "__main__":
    main()
