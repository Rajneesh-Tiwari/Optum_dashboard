const CLUSTERS = {
  "1": {
    "name": "High-Risk ESRD Progression",
    "description": "Members with advanced CKD at high risk of dialysis initiation",
    "color": "#EF4444",
    "avg_age": 69.8,
    "hcc_range": [
      2.8,
      4.5
    ],
    "a1c_range": [
      8.5,
      12.0
    ],
    "egfr_range": [
      15,
      35
    ],
    "bp_systolic_range": [
      145,
      180
    ],
    "pmpy_range": [
      85000,
      130000
    ],
    "conditions": [
      "CKD Stage 4-5",
      "Diabetes",
      "Hypertension",
      "CHF"
    ],
    "utilization": {
      "er_visits": 4.2,
      "hospitalizations": 2.1,
      "specialist_visits": 12.5
    },
    "member_count": 391,
    "avg_pmpy": 135749,
    "avg_hcc": 3.88,
    "by_lob": {
      "DSNP": 129,
      "Medicare": 130,
      "Medicaid": 87,
      "Commercial": 45
    },
    "shortName": "Critical Renal"
  },
  "2": {
    "name": "Uncontrolled Diabetes with Cardiac Risk",
    "description": "Members with poorly controlled diabetes and elevated cardiovascular risk",
    "color": "#F97316",
    "avg_age": 56.8,
    "hcc_range": [
      1.8,
      2.8
    ],
    "a1c_range": [
      9.0,
      13.0
    ],
    "egfr_range": [
      45,
      75
    ],
    "bp_systolic_range": [
      140,
      165
    ],
    "pmpy_range": [
      35000,
      65000
    ],
    "conditions": [
      "Diabetes",
      "Hypertension",
      "Hyperlipidemia",
      "Pre-CHF"
    ],
    "utilization": {
      "er_visits": 2.8,
      "hospitalizations": 0.9,
      "specialist_visits": 8.2
    },
    "member_count": 855,
    "avg_pmpy": 51826,
    "avg_hcc": 2.31,
    "by_lob": {
      "DSNP": 226,
      "Medicare": 292,
      "Medicaid": 212,
      "Commercial": 125
    },
    "shortName": "Cardiac-DM Surge"
  },
  "3": {
    "name": "Metabolic Syndrome - Rising Risk",
    "description": "Members with metabolic syndrome showing trajectory toward complications",
    "color": "#EAB308",
    "avg_age": 49.2,
    "hcc_range": [
      1.2,
      1.8
    ],
    "a1c_range": [
      6.5,
      8.5
    ],
    "egfr_range": [
      60,
      90
    ],
    "bp_systolic_range": [
      130,
      150
    ],
    "pmpy_range": [
      15000,
      35000
    ],
    "conditions": [
      "Pre-diabetes",
      "Obesity",
      "Hypertension",
      "Dyslipidemia"
    ],
    "utilization": {
      "er_visits": 1.2,
      "hospitalizations": 0.3,
      "specialist_visits": 4.5
    },
    "member_count": 1070,
    "avg_pmpy": 25733,
    "avg_hcc": 1.5,
    "by_lob": {
      "DSNP": 296,
      "Medicare": 272,
      "Medicaid": 282,
      "Commercial": 220
    },
    "shortName": "Metabolic Emerging"
  },
  "4": {
    "name": "Stable Chronic Management",
    "description": "Well-controlled chronic conditions with stable trajectory",
    "color": "#22C55E",
    "avg_age": 58.5,
    "hcc_range": [
      0.8,
      1.4
    ],
    "a1c_range": [
      6.0,
      7.5
    ],
    "egfr_range": [
      70,
      100
    ],
    "bp_systolic_range": [
      120,
      138
    ],
    "pmpy_range": [
      8000,
      18000
    ],
    "conditions": [
      "Controlled Diabetes",
      "Managed Hypertension"
    ],
    "utilization": {
      "er_visits": 0.5,
      "hospitalizations": 0.1,
      "specialist_visits": 3.2
    },
    "member_count": 922,
    "avg_pmpy": 13230,
    "avg_hcc": 1.1,
    "by_lob": {
      "DSNP": 210,
      "Medicare": 271,
      "Medicaid": 222,
      "Commercial": 219
    },
    "shortName": "Controlled Stable"
  },
  "5": {
    "name": "Prevention Opportunity",
    "description": "At-risk members with opportunity for early intervention",
    "color": "#3B82F6",
    "avg_age": 41.7,
    "hcc_range": [
      0.5,
      1.0
    ],
    "a1c_range": [
      5.5,
      6.4
    ],
    "egfr_range": [
      85,
      110
    ],
    "bp_systolic_range": [
      115,
      135
    ],
    "pmpy_range": [
      3000,
      10000
    ],
    "conditions": [
      "Overweight",
      "Pre-hypertension",
      "Family History"
    ],
    "utilization": {
      "er_visits": 0.3,
      "hospitalizations": 0.05,
      "specialist_visits": 1.5
    },
    "member_count": 762,
    "avg_pmpy": 6576,
    "avg_hcc": 0.75,
    "by_lob": {
      "DSNP": 139,
      "Medicare": 235,
      "Medicaid": 197,
      "Commercial": 191
    },
    "shortName": "Prevention Window"
  }
};
